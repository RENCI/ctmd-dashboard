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




