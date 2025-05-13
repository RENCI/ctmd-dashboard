import time
import requests
from tx.dateutils.utils import tstostr
import os
import logging

def getLogger(name, level):
    logger = logging.getLogger(name)
    if len(logger.handlers) == 0:
        ll = os.environ.get("LOG_LEVEL", level)
        logger.setLevel(ll)
        ch = logging.StreamHandler()
        ch.setLevel(ll)
        formatter = logging.Formatter('%(asctime)s:%(name)s:%(levelname)s:%(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)
    return logger


post_headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}


def to_json(data):
    if data is None:
        return None
    if isinstance(data, dict):
        return {k: to_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [to_json(v) for v in data]
    elif isinstance(data, int) or isinstance(data, float) or isinstance(data, bool) or isinstance(data, str):
        return data
    else:
        return str(data)


def tx_log(url, level, event, source, *args, **kwargs):
    requests.post(url, headers=post_headers, json={
        "event": event,
        "level": str(level),
        "timestamp": timestamp(),
        "source": source,
        "args": to_json(args),
        "kwargs": to_json(kwargs)
    })
    

def timestamp():
    return tstostr(time.time())


