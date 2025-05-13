from tx.functional.either import Left, Right    

def isBundle(bundle):
    return isinstance(bundle, dict) and "resourceType" in bundle and bundle["resourceType"] == "Bundle"


def type_name(type):
    if type == "batch":
        return "request"
    else:
        return "resource"


def bundle(records, type = "searchset"):
    return {
        "resourceType": "Bundle",
        "type": type,
        "entry": list(map(lambda record: {
            type_name(type): record
        }, records))
    }


def unbundle(bundle):
    if isBundle(bundle):
        type = bundle.get("type")
        if type is None:
            return Left(str(bundle) + " doesn't have type")
        else:
            return Right(list(map(lambda a : a[type_name(type)], bundle.get("entry", []))))
    else:
        return Left(str(bundle) + " is not a bundle")


