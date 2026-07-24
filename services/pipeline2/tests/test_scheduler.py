"""Regression test for the scheduled-sync argument bug.

`_run_sync` was changed from (database_url, mapping_path) to (mapping_path,),
but main._enqueue_sync kept passing both args, so every scheduled sync crashed
with "takes 1 positional argument but 2 were given" and REDCap data went stale.
This test binds the arguments _enqueue_sync enqueues against the real
_run_sync signature, so the mismatch can never silently return.
"""
import inspect
import os
import sys
import types

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def _import_main():
    """Import main.py, stubbing optional runtime deps absent in local envs."""
    if "schedule" not in sys.modules:
        try:
            import schedule  # noqa: F401
        except ImportError:
            sys.modules["schedule"] = types.ModuleType("schedule")
    if "redis" not in sys.modules:
        try:
            import redis  # noqa: F401
        except ImportError:
            sys.modules["redis"] = types.ModuleType("redis")
    if "rq" not in sys.modules:
        try:
            import rq  # noqa: F401
        except ImportError:
            rq_stub = types.ModuleType("rq")
            rq_stub.Queue = type("Queue", (), {})
            sys.modules["rq"] = rq_stub
    import main
    return main


def test_enqueue_sync_args_match_run_sync_signature():
    main = _import_main()
    from server import _run_sync

    captured = {}

    class FakeQueue:
        def enqueue(self, func, *args, **kwargs):
            captured["func"] = func
            captured["args"] = args

    main._enqueue_sync(FakeQueue())

    assert captured["func"] is _run_sync
    # The bug was an extra positional arg; binding must succeed against the
    # real signature (and would raise TypeError if the mismatch returned).
    inspect.signature(_run_sync).bind(*captured["args"])
    assert len(captured["args"]) == 1
