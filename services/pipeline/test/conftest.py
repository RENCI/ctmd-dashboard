import reload
import os
import pytest

@pytest.fixture(scope="session", autouse=True)
def init_db():
    os.chdir("/")
    ctx = reload.context()
    reload.createTables(ctx)
    yield

@pytest.fixture(scope="session", autouse=True)
def pause():
    try:
        yield
    finally:
        if os.environ.get("PAUSE") == "1":
            input("Press Enter to continue...")


       
