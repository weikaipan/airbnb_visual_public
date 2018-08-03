"""Connect to DBs."""
from pymongo import MongoClient
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
