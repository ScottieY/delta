from flask import Flask
import pymongo
from pymongo import MongoClient
import json


client = MongoClient()

db = client['mydb']

coll = db['testData']

app = Flask(__name__)

@app.route("/test", methods = ['GET'])
def show_data():
	ls = []
	for info in coll.find():
		temp = info
		print temp.pop('_id',None)
		ls.append(temp)
	
	return json.dumps(ls)

@app.route("/test",methods = ['POST'])
def get_data():

	return 'post'

if __name__ == "__main__":
	app.run()