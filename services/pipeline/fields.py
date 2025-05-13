import csv
import json
import sys

fields = set()
[mapping, data, data2] = sys.argv[1:]
with open(mapping) as f:
    mreader = csv.reader(f)
    for row in mreader:
        expr = row[1]
        ty = row[2]
        r = row[3]
        fields2 = []
        while True:
            if expr == "n/a":
                break
            elif "(" in expr:
                expr = expr[expr.index("(") + 1:expr.rindex(")")]
            elif "/" in expr:
                fields2.extend(map(lambda x : (x, ty, r), expr.split("/")))
                break
            else:
                fields2.append((expr, ty, r))
                break
            
        fields |= set(fields2)
        
def match(k, fields):
    for f, ty, r in fields:
        if f == k or (f.startswith(k) and f[len(k):].startswith("___")):
            return (ty, r)
    return None
        
rows = []
with open(data) as f:
    jsondata = json.load(f)
    for record in jsondata:
        row = {}
        for k, v in record.items():
            if k in ["redcap_repeat_instrument", "redcap_repeat_instance"]:
                row[k] = ""
            elif k.startswith("reviewer_name_"):
                row[k] = "Alice Bob"
            else:
                tyr = match(k, fields)
                if tyr is not None:
                    ty, r = tyr
                    if ty == "date":
                        row[k] = "2001-01-01"
                    elif ty == "int":
                        row[k] = "0"
                    elif ty == "boolean":
                        row[k] = "0"
                    else:
                        if r == "email":
                            row[k] = "user@email.edu"
                        elif r == "phonenumber":
                            row[k] = "111-222-3334"
                        elif r == "index":
                            row[k] = "1"
                        elif r == "firstname":
                            row[k] = "Alice"
                        elif r == "lastname":
                            row[k] = "Bob"
                        else:
                            row[k] = "ipsum lorem"
        rows.append(row)

with open(data2, "w") as f:
    json.dump(rows, f, indent=4)
