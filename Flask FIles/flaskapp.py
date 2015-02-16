from flask import Flask
import os

app = Flask(__name__)
state = '{"building":"MUSC","room":"216","availability:"free"}'

@app.route('/', methods=["GET"])
def hello_world():
	global state
	return state

if __name__ == '__main__':
    app.run()

@app.route('/update/<data>', methods=["POST"])
def update(data):
	global state
	state = data
	return str(state)
