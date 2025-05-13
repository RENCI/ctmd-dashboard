import os
import subprocess
import sys
import schedule
import time
import requests
import stat
import datetime
from pathlib import Path
import filecmp
import shutil
import json
from multiprocessing import Process
from pathlib import Path
from stat import S_ISREG, ST_MTIME, ST_MODE
from flask import Flask, request
from flask_cors import CORS
import redis
from rq import Queue
from rq.registry import StartedJobRegistry, FinishedJobRegistry, FailedJobRegistry, DeferredJobRegistry
import tempfile
import logging
import csv
import reload
import utils

#connection to redis container
redis_conn = redis.StrictRedis(host=os.environ["REDIS_QUEUE_HOST"], port=int(os.environ["REDIS_QUEUE_PORT"]), db=int(os.environ["REDIS_QUEUE_DB"]))

#initialize a queue with the redis connection
q = Queue(connection=redis_conn)

#maximum task time
TASK_TIME=int(os.environ["TASK_TIME"])

logger = utils.getLogger(__name__)

#wrapper
def handleTableFunc(handler, args, tfname):
    try:
        handler(*args)
    finally:
        os.unlink(tfname)

#pipeline api serving
def server(ctx):
    app = Flask(__name__)
    if os.environ.get("LOCAL_ENV", 'false').lower() == 'true':
        CORS(app)
    #create a backup object
    @app.route("/backup", methods=['GET', 'POST'])
    def backup():
        if request.method == 'GET':
            return getBackup(ctx)
        else:
            return postBackup(ctx)
        
    #retrieve existing backup
    def getBackup(ctx):
        dirpath = ctx["backupDir"]
        entries = ((os.path.join(dirpath, fn), fn) for fn in os.listdir(dirpath))
        entries = ((os.stat(path), fn) for path, fn in entries)
        entries = ((stat[ST_MTIME], fn) for stat, fn in entries if S_ISREG(stat[ST_MODE]))
        entries = (fn for _, fn in sorted(entries, reverse=True))
        entries = list(entries)
                          
        return json.dumps(entries)
    
    def postBackup(ctx):
        ts = str(datetime.datetime.now())
        pBackup = q.enqueue(reload.backUpDatabase, args=[ctx, ts], job_timeout=TASK_TIME)
        return json.dumps(pBackup.id)

    @app.route("/backup/<string:ts>", methods=["DELETE"])
    def deleteBackup(ts):
        pDeleteBackup = q.enqueue(reload.deleteBackup, args=[ctx, ts], job_timeout=TASK_TIME)        
        return json.dumps(pDeleteBackup.id)
    
    #restore from existing backup
    @app.route("/restore/<string:ts>", methods=['POST'])
    def restore(ts):
        pRestore = q.enqueue(reload.restoreDatabase, args=[ctx, ts], job_timeout=TASK_TIME)
        return json.dumps(pRestore.id)
    
    #sync with redcap data, this is a particularily expensive task
    @app.route("/sync", methods=['POST'])
    def sync():
        pSync = q.enqueue(reload.entrypoint, args=[ctx], kwargs={
            "one_off": True
        }, job_timeout=TASK_TIME)
        return json.dumps(pSync.id)

    #handle uploaded files
    def uploadFile():
        tf = tempfile.NamedTemporaryFile(delete=False)
        tf2 = tempfile.NamedTemporaryFile(delete=False)
        try:
            tf.close()
            tfname = tf.name
            tfname2 = tf2.name
            f = request.files["data"]
            if request.form["content-type"] == "application/json":
                j = json.load(f)
                with open(tfname, "w", newline="", encoding="utf-8") as tfi:
                    writer = csv.writer(tfi)
                    if len(j) == 0:
                        writer.writerow([])
                    else:
                        keys = list(j[0].keys())
                        writer.writerow(keys)
                    for rowdict in j:
                        writer.writerow([rowdict[key] for key in keys])
            elif request.form["content-type"] == "text/csv":
                f.save(tfname2)
                with open(tfname2, "r", newline="", encoding="latin-1") as tfi2:
                    with open(tfname, "w", newline="", encoding="latin-1") as tfi:
                        reader = csv.reader(tfi2)
                        writer = csv.writer(tfi)
                        if request.form.get("has_comments", "false") == "true":
                            next(reader)
                        for row in reader:
                            writer.writerow(row)
            else:
                logger.error("unsupported type")
                raise RuntimeError("unsupported type")
            kvp = json.loads(request.form["json"])
            return tfname, kvp
        except Exception as e:
            os.unlink(tfname)
            logger.error("exception " + str(e))
            raise
        
    @app.route("/table/<string:tablename>", methods=["GET", "POST", "PUT"])
    def table(tablename):
        if request.method == "GET":
            logger.info("get table")
            return json.dumps(reload.readDataFromTable(ctx, tablename))
        elif request.method == "PUT":
            logger.info("put table")
            return handleTable(reload.updateDataIntoTable, ctx, tablename)
        else:
            logger.info("post table")
            return handleTable(reload.insertDataIntoTable, ctx, tablename)
            
    #validate uploaded tables and write them
    def handleTable(handler, ctx, tablename, *args):
        tfname, kvp = uploadFile()
        #validation, this is the bulk of the error handling
        error = reload.validateTable(ctx, tablename, tfname, kvp)
        if error != None:
            return json.dumps(error), 400
        else:
            #TODO: propagate db write errors up to this scope
            pTable = q.enqueue(handleTableFunc, args=[handler, [ctx, tablename, *args, tfname, kvp], tfname], job_timeout=TASK_TIME)
            return json.dumps(pTable.id)

    #global and study-wise csv uploads
    @app.route("/table/<string:tablename>/column/<string:columnname>", methods=["POST"])
    def tableColumn(tablename, columnname):
        if request.method == "POST":
            logger.info("post incremental update table")
            return handleTable(reload.updateDataIntoTableColumn, ctx, tablename, columnname)

    #handle tasks in redis  
    @app.route("/task", methods=["GET"])
    def task():
        startedjr = StartedJobRegistry("default", connection=redis_conn)
        finishedjr = FinishedJobRegistry("default", connection=redis_conn)
        failedjr = FailedJobRegistry("default", connection=redis_conn)
        deferredjr = DeferredJobRegistry("defaut", connection=redis_conn)

        def job_registry_to_json(jr):
            return {
                "job_ids": jr.get_job_ids(),
                "expired_job_ids": jr.get_expired_job_ids(),
            }
        return json.dumps({
            "queued": q.job_ids,
            "started": job_registry_to_json(startedjr),
            "finished": job_registry_to_json(finishedjr),
            "failed": job_registry_to_json(failedjr),
            "deferred": job_registry_to_json(deferredjr)
        })
            
    @app.route("/task/<string:taskid>", methods=["GET", "DELETE"])
    def taskId(taskid):
        if request.method == "GET":
            return getTaskId(taskid)
        else:
            return deleteTaskId(taskid)

    def getTaskId(taskid):
        job = q.fetch_job(taskid)
        return json.dumps({
            "status": job.get_status(),
            "name": job.func_name,
            "created_at": str(job.created_at),
            "enqueued_at": str(job.enqueued_at),
            "started_at": str(job.started_at),
            "ended_at": str(job.ended_at),
            "description": job.description,
            "result": str(job.result)
        })
    
    def deleteTaskId(taskid):
        job = q.fetch_job(taskid)
        job.cancel()
        return json.dumps(taskid)

    app.run(host="0.0.0.0")
