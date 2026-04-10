"""
RQ worker entry point.

Can be run standalone (python worker.py) for debugging, or is launched
as a subprocess by main.py during normal pipeline operation.
Reads Redis configuration from the same env vars as main.py.
"""

import logging
import os

import redis
from rq import Queue, Worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

if __name__ == "__main__":
    r = redis.StrictRedis(
        host=os.environ.get("REDIS_QUEUE_HOST", "localhost"),
        port=int(os.environ.get("REDIS_QUEUE_PORT", 6379)),
        db=int(os.environ.get("REDIS_QUEUE_DB", 0)),
    )
    q = Queue(connection=r)
    worker = Worker([q], connection=r)
    worker.work()
