"""Back-end code and database."""
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util

app = Flask(__name__)

# Put database configuration.
# MONGODB_HOST =
# MONGODB_PORT =
# DBS_NAME =
# COLLECTION_NAME =

# AWS_MONGO =


@app.route("/newyork/predict")
def predictnewyrok():
    """Predction dashboard NY."""
    return render_template("predictnewyork.html")


@app.route("/newyork")
def newyork():
    """New York Dashboard."""
    return render_template("newyork.html")


@app.route("/")
def index():
    """Index."""
    return render_template("index.html")


@app.route("/insideairbnb/listingsdropna")
def insideairbnb_listingsdropna():
    """Database."""
    # If you get into this route, not necessary render, just interact with db.
    # connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    connection = MongoClient(AWS_MONGO)
    collection = connection['insideairbnb']['listingsdropna']

    projects = collection.find().limit(30000)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects


@app.route("/insideairbnb/neighborhoodmean")
def insideairbnb_neighborhoodmean():
    """Database."""
    # If you get into this route, not necessary render, just interact with db.
    # connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    connection = MongoClient(AWS_MONGO)
    collection = connection['insideairbnb']['neighborhoodmean']

    projects = collection.find()
    json_projects = []
    for project in projects:
        print(project)
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects


@app.route("/insideairbnb/predction")
def insideairbnb_prediction():
    """Database."""
    # If you get into this route, not necessary render, just interact with db.
    # connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    connection = MongoClient(AWS_MONGO)
    collection = connection['insideairbnb']['predictions']

    projects = collection.find().limit(30000)
    json_projects = []
    for project in projects:
        print(project)
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects


# TESTING CODE
# @app.route("/donorschoose/projects")
# def donorschoose_projects():
#     """Database."""
#     # If you get into this route, not necessary render, just interact with db.
#     connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
#     collection = connection['insideairbnb']['listingsdropna']

#     projects = collection.find()
#     json_projects = []
#     for project in projects:
#         json_projects.append(project)
#     json_projects = json.dumps(json_projects, default=json_util.default)
#     connection.close()
#     return json_projects

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
