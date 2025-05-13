import os
from multiprocessing import Process
import reload
import server

if __name__ == "__main__":
    ctx = reload.context()
    s = os.environ["RELOAD_SCHEDULE"] == "1"
    o = os.environ["RELOAD_ONE_OFF"] == "1"
    cdb = os.environ["CREATE_TABLES"] == "1"
    idb = os.environ["INSERT_DATA"] == "1"
    scheduleRunTime = os.environ["SCHEDULE_RUN_TIME"]
    runServer = os.environ["SERVER"] == "1"

    p2 = Process(target = reload.startWorker)
    p2.start()
    
    p = Process(target = reload.entrypoint, args=[ctx], kwargs={
        "create_tables": cdb,
        "insert_data": idb,
        "reload": s,
        "one_off": o,
        "schedule_run_time": scheduleRunTime
    })
    p.start()
    if runServer:
        server.server(ctx)
    p.join()
    p2.join()
        
    
       

