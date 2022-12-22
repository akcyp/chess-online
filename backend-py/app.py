from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api')
def hello():
  return {
    "status": "ok"
  }
