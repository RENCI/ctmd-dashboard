from jsonschema import validate
from tx.functional.either import Left, Right
import requests


def request(func, method, url, *args, schema=None, **kwargs):
    resp1 = func(url, *args, **kwargs)
    status_code = resp1.status_code
    if status_code != 200:
        try:
            resp = resp1.json()
        except:
            resp = resp1.text
        return Left(({
            "url": url,
            "method": method,
            "status_code": status_code,
            "response": resp
        }, 500))

    try:
        resp = resp1.json()    
    except Exception as e:
        resp = resp1.text
        return Left(({
            "url": url,
            "method": method,
            "status_code": status_code,
            "response": resp,
            "error": str(e)
        }, 500))
    if schema is not None:
        try:
            validate(resp, schema)
        except Exception as e:
            return Left(({
                "url": url,
                "method": method,
                "status_code": status_code,
                "response": resp,
                "error": str(e)
            }, 500))
    return Right(resp)


def get(url, *args, schema=None, **kwargs):
    return request(requests.get, "GET", url, *args, schema=schema, **kwargs)


def post(url, *args, schema=None, **kwargs):
    return request(requests.post, "POST", url, *args, schema=schema, **kwargs)
