import os
import sys

# Ensure the parent directory is in sys.path so backend imports work properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from backend.config import PORT, HOST
from backend import storage

app = Flask(__name__)

# Manual CORS header injection to support running locally without extra packages
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/api/scores', methods=['GET', 'POST', 'OPTIONS'])
def scores_route():
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.method == 'GET':
        scores = storage.get_scores()
        return jsonify(scores), 200
        
    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        score = data.get('score')
        
        if name is None or score is None:
            return jsonify({"error": "Missing name or score in request body"}), 400
            
        success, result = storage.add_score(name, score)
        if success:
            return jsonify({"status": "success", "score": result}), 201
        else:
            return jsonify({"error": result}), 500

if __name__ == '__main__':
    # Initialize directory and JSON file if not exists
    storage.init_storage()
    print(f"Starting Neon Breaker Server on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=True)
