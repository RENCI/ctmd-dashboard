import reload
import server
import filecmp
from sqlalchemy import create_engine, text
import os
import os.path
import shutil
from multiprocessing import Process
import datetime
import requests
import time
from rq import Worker
from psycopg2 import connect
import pytest
import json
import csv
import yaml
from contextlib import contextmanager
import re
import sys
from deepdiff import DeepDiff

from test_utils import WAIT_PERIOD, bag_contains, bag_equal, wait_for_task_to_start, wait_for_task_to_finish

@pytest.fixture(scope='function', autouse=True)
def test_log(request):
    print("Test '{}' STARTED".format(request.node.nodeid)) # Here logging is used, you can use whatever you want to use for logs
    sys.stdout.flush()
    try:
        yield
    finally:
        print("Test '{}' COMPLETED".format(request.node.nodeid))
        sys.stdout.flush()

def test_downloadData():
    ctx = reload.context()
    reload.downloadData(ctx)
    try:
        with open(ctx["dataInputFilePath"]) as f:
            obj = json.load(f)
        with open("redcap/record.json") as f2:
            obj2 = json.load(f2)
        diff = DeepDiff(obj, obj2)
        assert len(diff) == 0
    except:
        os.stderr.write(str(diff) + "\n")
        raise
    os.remove(ctx["dataInputFilePath"])

    
def test_downloadDataDictionary():
    
    ctx = reload.context()
    reload.downloadDataDictionary(ctx)
    try:
        with open(ctx["dataDictionaryInputFilePath"]) as f:
            obj = json.load(f)
        with open("redcap/metadata.json") as f2:
            obj2 = json.load(f2)
        diff = DeepDiff(obj, obj2)
        assert len(diff) == 0
    except:
        os.stderr.write(str(diff) + "\n")
        raise
    os.remove(ctx["dataDictionaryInputFilePath"])


def test_clear_database():
    
    ctx = reload.context()
    reload.clearDatabase(ctx)
    engine = create_engine("postgresql+psycopg2://" + ctx["dbuser"] + ":" + ctx["dbpass"] + "@" + ctx["dbhost"] + ":" + ctx["dbport"] + "/" + ctx["dbname"])
    conn = engine.connect()
            
    rs = conn.execute("SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_schema,table_name").fetchall()
    assert len(rs) == 0
    conn.close()
    reload.createTables(ctx)



@contextmanager
def copy_file(fromp, top):
    shutil.copy(fromp, top)
    try:
        yield
    finally:
        os.remove(top)


@contextmanager
def copytree(fromp, top):
    shutil.copytree(fromp, top)
    try:
        yield
    finally:
        shutil.rmtree(top)


@contextmanager
def datatables(nextvalue):
    try:
        ret = nextvalue()
        yield ret
    finally:
        shutil.rmtree("/data/tables")

    
@contextmanager
def connection(ctx, autocommit=False):
    conn = connect(user=ctx["dbuser"], password=ctx["dbpass"], host=ctx["dbhost"], port=ctx["dbport"], dbname=ctx["dbname"])
    conn.autocommit = autocommit
    try:
        yield conn
    finally:
        conn.close()        


@contextmanager
def database(ctx, cleanup=True):
    try:
        yield
    finally:
        reload.clearDatabase(ctx)
        reload.createTables(ctx)

        
def test_etl():
    
    ctx = reload.context()
    with copy_file("redcap/record.json", ctx["dataInputFilePath"]):
        with copy_file("redcap/metadata.json", ctx["dataDictionaryInputFilePath"]):
            with datatables(lambda: reload.etl(ctx)) as ret:
                assert ret
                assert os.path.isfile("/data/tables/Proposal")
                with open("/data/tables/Proposal") as f:
                    content = f.readlines()
                    assert sum(1 for _ in content) == 2


def test_sync(cleanup = True):
    
    ctx = reload.context()
    with database(ctx, cleanup=cleanup):
        with connection(ctx, autocommit=True) as conn:
            cur = conn.cursor()
            cur.execute('''SELECT COUNT(*) FROM "Proposal"''')
            rs = cur.fetchall()
            assert len(rs) == 1
            for row in rs:
                assert row[0] == 0
            
            with copytree("/etlout", "/data/tables"):
                print("sync database")
                assert reload.syncDatabase(ctx)
                cur.execute('''SELECT COUNT(*) FROM "Proposal"''')
                rs = cur.fetchall()
                assert len(rs) == 1
                for row in rs:
                    assert row[0] == 1
                    print("database synced")


def test_entrypoint():
    
    ctx = reload.context()
    with database(ctx):
        with connection(ctx, autocommit=True) as conn:
            cur = conn.cursor()
            cur.execute('''SELECT COUNT(*) FROM "Proposal"''')
            rs = cur.fetchall()
            assert len(rs) == 1
            for row in rs:
                assert row[0] == 0

            ctx["reloaddb"]=False
            with copy_file("redcap/record.json", ctx["dataInputFilePath"]):
                with copy_file("redcap/metadata.json", ctx["dataDictionaryInputFilePath"]):
                    with datatables(lambda: reload.entrypoint(ctx, one_off=True)):
                        cur.execute('''SELECT COUNT(*) FROM "Proposal"''')
                        rs = cur.fetchall()
                        assert len(rs) == 1
                        for row in rs:
                            assert row[0] == 1


def test_back_up_data_dictionary():
    
    ctx = reload.context()
    with copy_file("redcap/metadata.json", ctx["dataDictionaryInputFilePath"]):
        assert reload.backUpDataDictionary(ctx)
        directory = reload.dataDictionaryBackUpDirectory(ctx)
        shutil.rmtree(directory)


def test_back_up_data_dictionary_not_exists():
    
    ctx = reload.context()
    assert reload.backUpDataDictionary(ctx)
    directory = reload.dataDictionaryBackUpDirectory(ctx)
    assert not os.path.exists(ctx["dataDictionaryInputFilePath"])
    assert not os.path.exists(directory)


def test_back_up_data_dictionary_makedirs_exists():
    
    ctx = reload.context()
    directory = reload.dataDictionaryBackUpDirectory(ctx)
    os.makedirs(directory)
    with copy_file("redcap/metadata.json", ctx["dataDictionaryInputFilePath"]):
        assert reload.backUpDataDictionary(ctx)
        shutil.rmtree(directory)


def test_back_up_database(cleanup=True):
    print("test_back_up_database")
    ctx = reload.context()
    with database(ctx, cleanup=cleanup):
        test_sync(False)
    
        ts = str(datetime.datetime.now())
        assert reload._backUpDatabase(ctx, ts)
        assert(ts in os.listdir(ctx["backupDir"]))
        if cleanup:
            os.remove(ctx["backupDir"] + "/" + ts)
        else:
            return ts


def test_delete_back_up_database():
    print("test_back_up_database")
    test_sync(False)
    
    ctx = reload.context()
    with database(ctx, cleanup=True):
        ts = str(datetime.datetime.now())
        assert reload._backUpDatabase(ctx, ts)
        assert reload._deleteBackup(ctx, ts)
        assert ts not in os.listdir(ctx["backupDir"])


def test_restore_database():
    print("test_restore_database")

    ctx = reload.context()
    with database(ctx, cleanup=True):
        ts = test_back_up_database(False)
    
    with database(ctx, cleanup=True):
        assert reload._restoreDatabase(ctx, ts)
        os.remove(ctx["backupDir"] + "/" + ts)


def test_back_up_database_with_lock(cleanup=True):
    print("test_back_up_database")
    test_sync(False)
    
    ctx = reload.context()
    with database(ctx, cleanup=cleanup):
        ts = str(datetime.datetime.now())
        assert reload.backUpDatabase(ctx, ts)
        assert(ts in os.listdir(ctx["backupDir"]))
        if cleanup:
            os.remove(ctx["backupDir"] + "/" + ts)
        else:
            return ts


def test_restore_database_with_lock():
    print("test_restore_database")

    ctx = reload.context()
    with database(ctx, cleanup=True):
        ts = test_back_up_database(False)
    
    with database(ctx, cleanup=True):
        assert reload.restoreDatabase(ctx, ts)
        os.remove(ctx["backupDir"] + "/" + ts)


def test_sync_endpoint():
    
    ctx = reload.context()
    p = Process(target = server.server, args=[ctx], kwargs={})
    p.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp = requests.post("http://localhost:5000/sync")
        assert resp.status_code == 200
        print(resp.json())
        assert isinstance(resp.json(), str)
    finally:
        p.terminate()
        reload.clearTasks()

    
def test_back_up_endpoint():
    
    ctx = reload.context()
    p = Process(target = server.server, args=[ctx], kwargs={})
    p.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp = requests.get("http://localhost:5000/backup")
        assert resp.status_code == 200
        print(resp.json())
        assert isinstance(resp.json(), list)
    finally:
        p.terminate()
        reload.clearTasks()


def test_task():
    
    ctx = reload.context()
    p = Process(target = server.server, args=[ctx], kwargs={})
    p.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp0 = requests.get("http://localhost:5000/task")
        assert len(resp0.json()["queued"]) == 0
        resp = requests.post("http://localhost:5000/backup")
        resp2 = requests.get("http://localhost:5000/task")
        assert "queued" in resp2.json()
        assert len(resp2.json()["queued"]) == 1
        for status in ["started", "finished", "failed", "deferred"]:
            assert status in resp2.json()
            for category in ["job_ids", "expired_job_ids"]:
                assert category in resp2.json()[status]
                assert len(resp2.json()[status][category]) == 0
    finally:
        p.terminate()
        reload.clearTasks()


def test_get_task():
    
    ctx = reload.context()
    p = Process(target = server.server, args=[ctx], kwargs={})
    p.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp = requests.post("http://localhost:5000/backup")
        resp2 = requests.get("http://localhost:5000/task/" + resp.json())
        assert "name" in resp2.json()
        assert "created_at" in resp2.json()
        assert "ended_at" in resp2.json()
        assert "started_at" in resp2.json()
        assert "enqueued_at" in resp2.json()
        assert "description" in resp2.json()
        assert "status" in resp2.json()
        assert "result" in resp2.json()

    finally:
        p.terminate()
        reload.clearTasks()


def test_get_all_tasks():
    
    ctx = reload.context()
    pServer = Process(target = server.server, args=[ctx], kwargs={})
    print("starting server ctx = " + str(ctx))
    pServer.start()
    print("server started, waiting for " + str(WAIT_PERIOD))
    time.sleep(WAIT_PERIOD)
    print("clearing tasks")
    reload.clearTasks()
    print("clearing database")
    reload.clearDatabase(ctx)
    print("creating tables")
    reload.createTables(ctx)
    print("starting worker")
    pWorker = Process(target = reload.startWorker)
    pWorker.start()
    print("worker started, waiting for " + str(WAIT_PERIOD))
    time.sleep(WAIT_PERIOD)
    print("set up")
    try:
        resp0 = requests.get("http://localhost:5000/task")
        assert len(resp0.json()["queued"]) == 0
        resp1 = requests.post("http://localhost:5000/sync")
        task_id = resp1.json()
        wait_for_task_to_start(task_id)
        resp2 = requests.get("http://localhost:5000/task")
        assert resp2.json() == {
            "queued": [],
            "started": {
                "job_ids": [task_id],
                "expired_job_ids": []
            },
            "finished": {
                "job_ids": [],
                "expired_job_ids": []
            },
            "failed": {
                "job_ids": [],
                "expired_job_ids": []
            },
            "deferred": {
                "job_ids": [],
                "expired_job_ids": []
            }
        }
    finally:
        pWorker.terminate() 
        pServer.terminate()
        reload.clearTasks()
        reload.clearDatabase(ctx)
        reload.createTables(ctx)


def test_delete_task():
    
    ctx = reload.context()
    p = Process(target = server.server, args=[ctx], kwargs={})
    p.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp0 = requests.get("http://localhost:5000/task")
        assert len(resp0.json()["queued"]) == 0
        resp = requests.post("http://localhost:5000/sync")
        resp1 = requests.post("http://localhost:5000/sync")
        resp2 = requests.get("http://localhost:5000/task")
        assert len(resp2.json()["queued"]) == 2
        assert resp.json() in resp2.json()["queued"]
        assert resp1.json() in resp2.json()["queued"]
        requests.delete("http://localhost:5000/task/" + resp1.json())
        resp3 = requests.get("http://localhost:5000/task")
        assert len(resp3.json()["queued"]) == 1
        assert resp.json() in resp3.json()["queued"]
        assert resp1.json() not in resp3.json()["queued"]
    finally:
        p.terminate()
        reload.clearTasks()


def test_start_worker():
    
    ctx = reload.context()
    p = Process(target = reload.startWorker)
    workers = Worker.all(connection=reload.redisQueue())
    assert len(list(workers)) == 0
    p.start()
    time.sleep(WAIT_PERIOD)
    workers = Worker.all(connection=reload.redisQueue())
    assert len(list(workers)) == 1
    p.terminate()


def do_test_auxiliary(aux1, exp):
    
    aux0 = os.environ.get("AUXILIARY_PATH")
    os.environ["AUXILIARY_PATH"] = aux1
    ctx = reload.context()
    shutil.copy("redcap/record.json", ctx["dataInputFilePath"])
    shutil.copy("redcap/metadata.json", ctx["dataDictionaryInputFilePath"])
    assert reload.etl(ctx)
    with open("/data/tables/ProposalFunding") as f:
        i = f.readline().split(",").index("totalBudgetInt")
        assert f.readline().split(",")[i] == exp
    os.remove(ctx["dataInputFilePath"])
    os.remove(ctx["dataDictionaryInputFilePath"])
    shutil.rmtree("/data/tables")
    if aux0 is None:
        del os.environ["AUXILIARY_PATH"]
    else:
        os.environ["AUXILIARY_PATH"] = aux0


def test_auxiliary1():
    do_test_auxiliary("auxiliary1", "123")


def test_auxiliary2():
    do_test_auxiliary("auxiliary2", '""')


def test_auxiliary3():
    do_test_auxiliary("auxiliary3", '""')


def do_test_filter(aux1, exp):
    
    aux0 = os.environ.get("FILTER_PATH")
    os.environ["FILTER_PATH"] = aux1
    ctx = reload.context()
    shutil.copy("redcap/record.json", ctx["dataInputFilePath"])
    shutil.copy("redcap/metadata.json", ctx["dataDictionaryInputFilePath"])
    assert reload.etl(ctx)
    with open("/data/tables/Proposal", newline="") as f:
        reader = csv.reader(f)
        headers = next(reader)
        i = sum(1 for row in reader)
        assert i == exp
    os.remove(ctx["dataInputFilePath"])
    os.remove(ctx["dataDictionaryInputFilePath"])
    shutil.rmtree("/data/tables")
    if aux0 is None:
        del os.environ["FILTER_PATH"]
    else:
        os.environ["FILTER_PATH"] = aux0


def test_filter1():
    do_test_filter("filter1", 1)


def test_filter2():
    do_test_filter("filter2", 0)


def test_filter3():
    do_test_filter("filter3", 1)

    
def do_test_blocklist(blocklist1, exp):
    
    blocklist0 = os.environ.get("BLOCK_PATH")
    os.environ["BLOCK_PATH"] = blocklist1
    ctx = reload.context()
    shutil.copy("redcap/record.json", ctx["dataInputFilePath"])
    shutil.copy("redcap/metadata.json", ctx["dataDictionaryInputFilePath"])
    assert reload.etl(ctx)
    with open("/data/tables/Proposal", newline="") as f:
        reader = csv.reader(f)
        headers = next(reader)
        i = sum(1 for row in reader)
        assert i == exp
    os.remove(ctx["dataInputFilePath"])
    os.remove(ctx["dataDictionaryInputFilePath"])
    shutil.rmtree("/data/tables")
    if blocklist0 is None:
        del os.environ["BLOCK_PATH"]
    else:
        os.environ["BLOCK_PATH"] = blocklist0


def do_test_blocklist2(blocklist1, exp):
    
    blocklist0 = os.environ.get("BLOCK_PATH")
    os.environ["BLOCK_PATH"] = blocklist1
    ctx = reload.context()
    shutil.copy("redcap/record2.json", ctx["dataInputFilePath"])
    shutil.copy("redcap/metadata.json", ctx["dataDictionaryInputFilePath"])
    assert reload.etl(ctx)
    with open("/data/tables/Proposal", newline="") as f:
        reader = csv.reader(f)
        headers = next(reader)
        i = sum(1 for row in reader)
        assert i == exp
    os.remove(ctx["dataInputFilePath"])
    os.remove(ctx["dataDictionaryInputFilePath"])
    shutil.rmtree("/data/tables")
    if blocklist0 is None:
        del os.environ["BLOCK_PATH"]
    else:
        os.environ["BLOCK_PATH"] = blocklist0


def test_blocklist1():
    do_test_blocklist("block1", 0)
    

def test_blocklist2():
    do_test_blocklist("block2", 1)
    

def test_blocklist3():
    do_test_blocklist("block3", 0)

    
def test_blocklist4():
    do_test_blocklist2("block1", 0)
    

def test_blocklist5():
    do_test_blocklist2("block2", 1)
    

def test_blocklist6():
    do_test_blocklist2("block3", 0)

