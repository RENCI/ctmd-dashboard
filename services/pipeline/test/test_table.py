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

from test_utils import WAIT_PERIOD, bag_contains, bag_equal, wait_for_task_to_finish, countrows

@pytest.fixture(scope='function', autouse=True)
def test_log(request):
    print("Test '{}' STARTED".format(request.node.nodeid)) # Here logging is used, you can use whatever you want to use for logs
    sys.stdout.flush()
    try:
        yield
    finally:
        print("Test '{}' COMPLETED".format(request.node.nodeid))
        sys.stdout.flush()

def test_post_table():
    do_test_post_table(requests.post, requests.post, "/etlout/Proposal", "text/csv", "Proposal", {}, {}, [
            {
                "ProposalID": "0",
            }
        ], [
            {
                "ProposalID": "0",
            }
        ] * 2)

def test_post_table_has_comments():
    fn = "/tmp/ssd.csv"
    csv1 = [["0"]]
    n = len(csv1)
    write_csv(fn, ["ProposalID"], csv1, additional_rows=["a"])
    do_test_post_table(requests.post, requests.post, fn, "text/csv", "Proposal", {}, {}, [
            {
                "ProposalID": "0",
            }
        ], [
            {
                "ProposalID": "0",
            }
        ] * 2, has_comments=True)

def test_put_table():
    do_test_post_table(requests.put, requests.put, "/etlout/Proposal", "text/csv", "Proposal", {}, {}, [
            {
                "ProposalID": "0",
            }
        ], [
            {
                "ProposalID": "0",
            }
        ])

def test_put_table_has_comments():
    fn = "/tmp/ssd.csv"
    csv1 = [["0"]]
    n = len(csv1)
    write_csv(fn, ["ProposalID"], csv1, additional_rows=["a"])
    do_test_post_table(requests.put, requests.put, fn, "text/csv", "Proposal", {}, {}, [
            {
                "ProposalID": "0",
            }
        ], [
            {
                "ProposalID": "0",
            }
        ], has_comments=True)

def test_post_table_kvp():
    do_test_post_table_kvp_content_SiteInformation("/add/ssd.csv", "text/csv")

def test_post_table_kvp2():
    do_test_post_table_kvp_content_SiteInformation("/add/ssd2.csv", "text/csv")
    
def test_put_table_kvp():
    do_test_put_table_kvp_content_SiteInformation("/add/ssd.csv", "text/csv")
                             
def test_put_table_kvp2():
    do_test_put_table_kvp_content_SiteInformation("/add/ssd2.csv", "text/csv")

def test_post_table_kvp_json():
    do_test_post_table_kvp_content_SiteInformation("/add/ssd.json", "application/json")

def test_post_table_kvp2_json():
    do_test_post_table_kvp_content_SiteInformation("/add/ssd2.json", "application/json")
    
def test_put_table_kvp_json():
    do_test_put_table_kvp_content_SiteInformation("/add/ssd.json", "application/json")
                             
def test_put_table_kvp2_json():
    do_test_put_table_kvp_content_SiteInformation("/add/ssd2.json", "application/json")

def do_test_post_table_kvp_content_SiteInformation(src, mime):
    n = countrows(src, mime)
    do_test_post_table_kvp_SiteInformation(requests.post, src, mime, [
            {
                "ProposalID": "0",
                "siteNumber": str(i)
            } for i in range(1, n+1)
        ], [
            {
                "ProposalID": str(i),
                "siteNumber": str(j)
            } for i in [0, 1] for j in range(1, n+1)
        ])

def do_test_put_table_kvp_content_SiteInformation(src, mime):
    n = countrows(src, mime)
    do_test_post_table_kvp_SiteInformation(requests.put, src, mime, [
            {
                "ProposalID": "0",
                "siteNumber": str(i)
            } for i in range(1, n+1)
        ], [
            {
                "ProposalID": "1",
                "siteNumber": str(i)
            } for i in range(1, n+1)
        ])
    

def do_test_post_table_kvp_SiteInformation(verb, src, mime, content1, content2):
    do_test_post_table(verb, verb, src, mime, "SiteInformation", {"ProposalID": "0"}, {"ProposalID": "1"}, content1, content2)


def format_prep_req(req):
    """
    At this point it is completely built and ready
    to be fired; it is "prepared".

    However pay attention at the formatting used in 
    this function because it is programmed to be pretty 
    printed and may differ from the actual request.
    """
    return '{0}\n{1}\n{2}\n\n{3}'.format(
        '-----------START-----------',
        req.method + ' ' + req.url,
        '\n'.join('{0}: {1}'.format(k, v) for k, v in req.headers.items()),
        req.body.decode("utf-8"),
    )


def do_request_table(verb1, tablename, kvp1, src, cnttype, has_comments=False):
    files = {
        "json": (None, json.dumps(kvp1), "application/json"),
        "data": (src, open(src, "rb"), "application/octet-stream"),
        "content-type": (None, cnttype, "text/plain")
    }
    if has_comments is not None:
        files["has_comments"] = (None, "true" if has_comments else "false", "application/json")
    print(f"files = {files}")
    if os.environ.get("PRINT_REQUEST") == "1":
        if verb1 == requests.post:
            verb = "POST"
        elif verb1 == requests.put:
            verb = "PUT"
        else:
            raise RuntimeException("unsupported method")
        r = requests.Request(verb, "http://localhost:5000/table/" + tablename, files=files)

        prer = r.prepare()
        print(format_prep_req(prer))
        s = requests.Session()
        return s.send(prer)
    else:
        return verb1("http://localhost:5000/table/" + tablename, files=files)


def do_request_table_column(verb1, tablename, column, kvp1, src, cnttype):
    if os.environ.get("PRINT_REQUEST") == 1:
        if verb1 == requests.post:
            verb = "POST"
        elif verb1 == requests.put:
            verb = "PUT"
        else:
            raise RuntimeException("unsupported method")
        r = requests.Request(verb, "http://localhost:5000/table/" + tablename + "/column/" + column, files={
            "json": (None, json.dumps(kvp1), "application/json"),
            "data": (src, open(src, "rb"), "application/octet-stream"),
            "content-type": (None, cnttype, "text/plain")
        })

        prer = r.prepare()
        print(format_prep_req(prer))
        s = requests.Session()
        return s.send(prer)
    else:
        return verb1("http://localhost:5000/table/" + tablename + "/column/" + column, files={
            "json": (None, json.dumps(kvp1), "application/json"),
            "data": (src, open(src, "rb"), "application/octet-stream"),
            "content-type": (None, cnttype, "text/plain")
        })


def do_test_post_table(verb1, verb2, src, cnttype, tablename, kvp1, kvp2, content1, content2, has_comments=False):
    print("cwd =", os.getcwd())
    ctx = reload.context()
    pServer = Process(target = server.server, args=[ctx], kwargs={})
    pServer.start()
    time.sleep(WAIT_PERIOD)
    pWorker = Process(target = reload.startWorker)
    pWorker.start()
    time.sleep(WAIT_PERIOD)
    try:
        print("get " + tablename)
        resp = requests.get("http://localhost:5000/table/" + tablename)
        assert(resp.json() == [])
        print("post " + tablename)
        resp = do_request_table(verb1, tablename, kvp1, src, cnttype, has_comments=has_comments)
        print(resp.text)
        assert resp.status_code == 200
        taskid = resp.json()
        assert isinstance(taskid, str)
        wait_for_task_to_finish(taskid)
        print("get " + tablename)
        resp = requests.get("http://localhost:5000/table/" + tablename)
        respjson = resp.json()
        assert(bag_contains(respjson, content1))
        print("post " + tablename)
        resp = do_request_table(verb2, tablename, kvp2, src, cnttype, has_comments=has_comments)
        assert resp.status_code == 200
        taskid = resp.json()
        assert isinstance(taskid, str)
        wait_for_task_to_finish(taskid)
        print("get " + tablename)
        resp = requests.get("http://localhost:5000/table/" + tablename)
        respjson = resp.json()
        assert(bag_contains(respjson, content2))
    finally:
        pWorker.terminate() 
        pServer.terminate()
        reload.clearTasks()
        reload.clearDatabase(ctx)
        reload.createTables(ctx)


def test_put_error_duplicate_column_upload():
    do_test_post_error(requests.put, "/add/ssd_error_duplicate_column_upload.csv", "text/csv", "SiteInformation", {}, 400, "[\"Duplicate header\\(s\\) in upload \\['siteNumber'\\]\"]")


def test_put_error_duplicate_column_input():
    do_test_post_error(requests.put, "/add/ssd.csv", "text/csv", "SiteInformation", {"siteNumber": None}, 400, "[\"Duplicate header\\(s\\) in input \\['siteNumber'\\]\"]")
    

def test_put_error_undefined_column_upload():
    do_test_post_error(requests.put, "/add/ssd_error_undefined_column_upload.csv", "text/csv", "SiteInformation", {}, 400, "[\"Undefined header\\[.*\\]\"]")


def test_put_error_undefined_column_input():
    do_test_post_error(requests.put, "/add/ssd.csv", "text/csv", "SiteInformation", {"header": None}, 400, "[\"Undefined header\\[.*\\]\"]")
    

def test_post_error_duplicate_column_upload():
    do_test_post_error(requests.post, "/add/ssd_error_duplicate_column_upload.csv", "text/csv", "SiteInformation", {}, 400, "[\"Duplicate header\\(s\\) in upload \\['siteNumber'\\]\"]")


def test_post_error_duplicate_column_input():
    do_test_post_error(requests.post, "/add/ssd.csv", "text/csv", "SiteInformation", {"siteNumber": None}, 400, "[\"Duplicate header\\(s\\) in upload \\['siteNumber'\\]\"]")
    

def test_post_error_undefined_column_upload():
    do_test_post_error(requests.post, "/add/ssd_error_undefined_column_upload.csv", "text/csv", "SiteInformation", {}, 400, "[\"Undefined header\\[.*\\]\"]")


def test_post_error_undefined_column_input():
    do_test_post_error(requests.post, "/add/ssd.csv", "text/csv", "SiteInformation", {"header": None}, 400, "[\"Undefined header\\[.*\\]\"]")
    

def do_test_post_error(verb1, src, cnttype, tablename, kvp1, status_code, resp_text):
    
    ctx = reload.context()
    pServer = Process(target = server.server, args=[ctx], kwargs={})
    pServer.start()
    time.sleep(WAIT_PERIOD)
    pWorker = Process(target = reload.startWorker)
    pWorker.start()
    time.sleep(WAIT_PERIOD)
    try:
        resp = do_request_table(verb1, tablename, kvp1, src, cnttype)
        assert resp.status_code == status_code
        taskid = resp.text
        assert re.match(resp_text, taskid)
    finally:
        pWorker.terminate() 
        pServer.terminate()
        reload.clearTasks()
        reload.clearDatabase(ctx)
        reload.createTables(ctx)


def test_post_table_column():
    ctx = reload.context()
    fn = "/tmp/ssd1.csv"
    fn2 = "/tmp/ssd2.csv"
    csv1 = [
        [i, i] for i in range(10)
    ]
    csv2 = [
        [i, i+1] for i in range(1, 11)
    ]
    n = len(csv1)
    n2 = len(csv2)
    write_csv(fn, ["ProposalID", "siteNumber"], csv1)
    write_csv(fn2, ["ProposalID", "siteNumber"], csv2)
    tablename = "SiteInformation"
    column = "ProposalID"
    kvp1 = kvp2 = {}
    cnttype = "text/csv"
    verb1 = verb2 = requests.post
    content1 = [
        {
            "siteNumber": str(row[1]),
            "ProposalID": str(row[0])
        } for row in csv1
    ]
    content2 = [
        {
            "siteNumber": str(row[1]),
            "ProposalID": str(row[0])
        } for row in csv1 if row[0] not in list(map(lambda x: x[0], csv2))
    ] + [
        {
            "siteNumber": str(row[1]),
            "ProposalID": str(row[0])
        } for row in csv2
    ]

    pServer = Process(target = server.server, args=[ctx], kwargs={})
    pServer.start()
    time.sleep(WAIT_PERIOD)
    pWorker = Process(target = reload.startWorker)
    pWorker.start()
    time.sleep(WAIT_PERIOD)

    try:
        resp = do_request_table_column(verb1, tablename, column, kvp1, fn, cnttype)
        assert resp.status_code == 200
        taskid = resp.json()
        assert isinstance(taskid, str)
        wait_for_task_to_finish(taskid)
        print("get " + tablename)
        resp = requests.get("http://localhost:5000/table/" + tablename)
        respjson = resp.json()
        assert(bag_contains(respjson, content1))
        print("post " + tablename)
        resp = do_request_table_column(verb2, tablename, column, kvp2, fn2, cnttype)
        assert resp.status_code == 200
        taskid = resp.json()
        assert isinstance(taskid, str)
        wait_for_task_to_finish(taskid)
        print("get " + tablename)
        resp = requests.get("http://localhost:5000/table/" + tablename)
        respjson = resp.json()
        assert(bag_contains(respjson, content2))
    finally:
        pWorker.terminate() 
        pServer.terminate()
        reload.clearTasks()
        reload.clearDatabase(ctx)
        reload.createTables(ctx)


def test_insert_table():
    do_test_insert_table("/add/ssd.csv", {})

    
def test_insert_table2():
    do_test_insert_table("/add/ssd2.csv", {})

    
def test_insert_table_kvp():
    do_test_insert_table("/add/ssd.csv", {"ProposalID":"0"})

    
def test_insert_table_kvp2():
    do_test_insert_table("/add/ssd2.csv", {"ProposalID":"0"})

    
def test_insert_table_non_ascii():
    do_test_insert_table("/add/ssd_non_ascii.csv", {})

    
def do_test_insert_table(src, kvp, has_comments=False):
    
    ctx = reload.context()
    n = countrows(src, "text/csv") - (1 if has_comments else 0)
    try:
        reload.insertDataIntoTable(ctx, "SiteInformation", src, kvp)
        rows = reload.readDataFromTable(ctx, "SiteInformation")
        assert(bag_contains(rows, [
            {
                "siteNumber": str(i),
                **kvp
            } for i in range (1, n+1)
        ]))
        reload.insertDataIntoTable(ctx, "SiteInformation", src, kvp)
        rows = reload.readDataFromTable(ctx, "SiteInformation")
        assert(bag_contains(rows, [
            {
                "siteNumber": str(i),
                **kvp
            } for i in range (1, n+1)
        ] * 2))
    finally:
        reload.clearDatabase(ctx)
        reload.createTables(ctx)


def do_test_table(table_name, columns):
    ctx = reload.context()
    conn = connect(user=ctx["dbuser"], password=ctx["dbpass"], host=ctx["dbhost"], port=ctx["dbport"], dbname=ctx["dbname"])
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('''SELECT * FROM "{0}"'''.format(table_name))
    rs = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    for column in columns:
        assert column in colnames


def write_csv(fn, headers, rows, additional_rows=[]):
    with open(fn, "w+") as outf:
        writer = csv.writer(outf)
        for row in additional_rows:
            writer.writerow(row)
        writer.writerow(headers)
        for row in rows:
            writer.writerow(row)

    
def test_update_table_column():
    ctx = reload.context()
    fn = "/tmp/ssd1.csv"
    fn2 = "/tmp/ssd2.csv"
    csv1 = [
        [i, i] for i in range(10)
    ]
    csv2 = [
        [i, i+1] for i in range(1, 11)
    ]
    n = len(csv1)
    n2 = len(csv2)
    write_csv(fn, ["ProposalID", "siteNumber"], csv1)
    write_csv(fn2, ["ProposalID", "siteNumber"], csv2)

    try:
        reload._updateDataIntoTableColumn(ctx, "SiteInformation", "ProposalID", fn, {})
        rows = reload.readDataFromTable(ctx, "SiteInformation")
        assert(bag_contains(rows, [
            {
                "siteNumber": str(row[1]),
                "ProposalID": str(row[0])
            } for row in csv1
        ]))
        reload._updateDataIntoTableColumn(ctx, "SiteInformation", "ProposalID", fn2, {})
        rows = reload.readDataFromTable(ctx, "SiteInformation")
        assert(bag_contains(rows, [
            {
                "siteNumber": str(row[1]),
                "ProposalID": str(row[0])
            } for row in csv1 if row[0] not in list(map(lambda x: x[0], csv2))
        ] + [
            {
                "siteNumber": str(row[1]),
                "ProposalID": str(row[0])
            } for row in csv2
        ]))
    finally:
        reload.clearDatabase(ctx)
        reload.createTables(ctx)
        os.unlink(fn)
        os.unlink(fn2)


def test_get_column_data_type_twice():
    ctx = reload.context()

    dt = reload.getColumnDataType(ctx, "SiteInformation", "ProposalID")
    assert dt == "bigint"

    dt = reload.getColumnDataType(ctx, "SiteInformation", "ProposalID")
    assert dt == "bigint"


def test_get_column_data_type_twice2():
    ctx = reload.context()
    fn = "/tmp/ssd1.csv"
    csv1 = [
        [i, i] for i in range(10)
    ]
    n = len(csv1)
    write_csv(fn, ["ProposalID", "siteNumber"], csv1)

    try:
        dt = reload.getColumnDataType(ctx, "SiteInformation", "ProposalID")
        assert dt == "bigint"

        reload._updateDataIntoTable(ctx, "SiteInformation", fn, {})
        
        dt = reload.getColumnDataType(ctx, "SiteInformation", "ProposalID")
        assert dt == "bigint"
    finally:
        reload.clearDatabase(ctx)
        reload.createTables(ctx)
        os.unlink(fn)

tables_yaml='''
- table: Sites
  columns:
  - siteId
  - siteName

- table: CTSAs
  columns:
  - ctsaId
  - ctsaName
  
- table: StudyProfile
  columns: 
  - ProposalID
  - network
  - tic
  - ric
  - type
  - linkedStudies
  - design
  - isRandomized
  - randomizationUnit
  - randomizationFeature
  - ascertainment
  - observations
  - isPilot
  - phase
  - isRegistry
  - ehrDataTransfer
  - isConsentRequired
  - isEfic
  - irbType
  - regulatoryClassification
  - clinicalTrialsGovId
  - isDsmbDmcRequired
  - initialParticipatingSiteCount
  - enrollmentGoal
  - initialProjectedEnrollmentDuration
  - leadPIs
  - awardeeSiteAcronym
  - primaryFundingType
  - isFundedPrimarilyByInfrastructure
  - fundingAwardDate
  - isPreviouslyFunded
  
- table: StudySites
  columns:
  - ProposalID
  - principalInvestigator
  - siteNumber
  - siteId
  - ctsaId
  - siteName
  - dateRegPacketSent
  - dateContractSent
  - dateIrbSubmission
  - dateIrbApproval
  - dateContractExecution
  - lpfv
  - dateSiteActivated
  - fpfv
  - patientsConsentedCount
  - patientsEnrolledCount
  - patientsWithdrawnCount
  - patientsExpectedCount
  - queriesCount
  - protocolDeviationsCount
'''

def test_tables():
    tabs = yaml.load(tables_yaml, Loader=yaml.FullLoader)
    for tab in tabs:
        do_test_table(tab["table"], tab["columns"])

