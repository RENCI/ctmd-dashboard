from dateutil.parser import *
from datetime import datetime, timezone


def strtots(st):
    return parse(st).timestamp()
    

def strtodate(st):
    return parse(st)


def tstostr(ts):
    dt = datetime.utcfromtimestamp(ts)
    dt2 = dt.replace(tzinfo=timezone.utc)
    return dt2.isoformat()
