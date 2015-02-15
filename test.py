from flask import Flask
import json

dataStr = 'test'

app = Flask(__name__)

@app.route("/test", methods = ['GET'])
def show_data():
		
	return json.dumps(dataStr)

@app.route("/test",methods = ['POST'])
def get_data():

	#dataStr = receive
	return 'post'

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=None)