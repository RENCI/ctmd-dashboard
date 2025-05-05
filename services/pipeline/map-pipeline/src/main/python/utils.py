import subprocess
import glob
import os.path
import re

from timeit import default_timer as timer
import os

def submit(host_name, cache_dir, cls, *args, **kwargs):
    start = timer()

    cmd = ["spark-submit",
           "--executor-memory=3g",
           "--master",
           host_name,
           "--class",
           cls,
           "target/scala-2.11/TIC preprocessing-assembly-1.0.jar"] + list(args)
    print(cmd)
    if "log" in kwargs and "log2" in kwargs:
        log = kwargs["log"]
        log2 = kwargs["log2"]
        with open(log, "w") as file:
            with open(log2, "w") as file2:
                proc = subprocess.Popen(cmd, stdout=file, stderr=file2)
                err = proc.wait()
    else:
        proc = subprocess.Popen(cmd)
        err = proc.wait()
    if err:
        print("error:", err)
    end = timer()
    print(end - start)


