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

WAIT_PERIOD = 3

def countrows(src, mime):
    if mime == "text/csv":
        with open(src, newline="", encoding="utf-8") as inf:
            reader = csv.reader(inf)
            headers = next(reader)
            return sum(1 for row in reader)
    if mime == "text/csv-comments":
        with open(src, newline="", encoding="utf-8") as inf:
            reader = csv.reader(inf)
            headers = next(reader)
            return sum(1 for row in reader) - 1
    elif mime == "application/json":
        with open(src, encoding="utf-8") as inf:
            return len(json.load(inf))
    
def bag_equal(a, b):
    t = list(b)
    for elem in a:
        if elem in t:
            t.remove(elem)
        else:
            return False
    return True


def contains(a,b):
    return all(item in a.items() for item in b.items())


def bag_contains(a, b):
    t = list(b)
    for e in a:
        found = None
        for f in t:
            if contains(e, f):
                found = f
                break
        if found:
            t.remove(found)
        else:
            return False
    return True


def wait_for_task_to_finish(taskid):
    
    ctx = reload.context()
    resp = requests.get("http://localhost:5000/task/" + taskid)
    print(resp.json())
    while resp.json()["status"] in ["queued", "started"]:
        time.sleep(1)
        resp = requests.get("http://localhost:5000/task/" + taskid)
        print(resp.json())


def wait_for_task_to_start(taskid):
    
    ctx = reload.context()
    resp = requests.get("http://localhost:5000/task/" + taskid)
    print(resp.json())
    while resp.json()["status"] in ["queued"]:
        time.sleep(1)
        resp = requests.get("http://localhost:5000/task/" + taskid)
        print(resp.json())



