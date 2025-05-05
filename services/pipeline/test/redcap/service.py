from flask import Flask, send_from_directory, request
import os

app = Flask(__name__)

@app.route("/api/", methods=["POST"])
def api():
    assert request.headers["Content-Type"] == "application/x-www-form-urlencoded"
    assert request.headers["Accept"] == "application/json"
    assert request.form["token"] == os.environ["REDCAP_APPLICATION_TOKEN"]
    assert request.form["format"] == "json"
    assert request.form["returnFormat"] == "json"

    content = request.form["content"]
    assert content in ["record", "metadata"]
    if content == "record":
        assert request.form["type"] == "flat"
        assert request.form["rawOrLabel"] == "raw"
        assert request.form["rawOrLabelHeaders"] == "raw"
        assert request.form["exportCheckboxLabel"] == "false"
        assert request.form["exportSurveyFields"] == "false"
        assert request.form["exportDataAccessGroups"] == "false"
        return send_from_directory(".", "record.json", mimetype="application/json")
    else:
        return send_from_directory(".", "metadata.json", mimetype="application/json")

if __name__ == "__main__":
    app.run(
        # ssl_context="adhoc",
        host="0.0.0.0")
