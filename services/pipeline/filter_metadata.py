import csv
import json
import sys
import re

fields = set()
[mapping, data, data2] = sys.argv[1:]
with open(mapping) as f:
    mreader = csv.reader(f)
    for row in mreader:
        expr = row[1]
        fields2 = []
        while True:
            if expr == "n/a":
                break
            elif "(" in expr:
                expr = expr[expr.index("(") + 1:expr.rindex(")")]
            elif "/" in expr:
                fields2.extend(expr.split("/"))
                break
            else:
                fields2.append(expr)
                break
            
        fields |= set(fields2)

def match(k, fields):
    for f in fields:
        if f == k or (f.startswith(k) and f[len(k):].startswith("___")):
            return True
    return False
        
rows = []
with open(data) as f:
    jsondata = json.load(f)
    for record in jsondata:
        if re.match(r"^ctsa_[0-9]*$", record["field_name"]):
            row = {
                "field_name": record["field_name"],
                "field_label": "label" + record["field_name"][4:]
            }
            rows.append(row)

        if match(record["field_name"], fields) and (record["select_choices_or_calculations"] == "" or re.match(r"^[0-9]+, [^|]*( [|] [0-9]+, [^|]*)*$", record["select_choices_or_calculations"]) is not None):
            if record["select_choices_or_calculations"] == "":
                select_choices_or_calculations = ""
            else:
                select_choices_or_calculations = " | ".join(map(lambda i : i + ", choice " + i, map(lambda i: i.split(",")[0].strip(), record["select_choices_or_calculations"].split("|"))))
            
            row = {
                "field_name": record["field_name"],
                "select_choices_or_calculations": select_choices_or_calculations
            }
            rows.append(row)

with open(data2, "w") as f:
    json.dump(rows, f, indent=4)
