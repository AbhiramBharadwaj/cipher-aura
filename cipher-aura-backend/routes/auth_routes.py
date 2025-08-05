from flask import Blueprint, request, jsonify
import bcrypt
from db import users

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/api/register', methods=['POST'])
def register():
    data = request.json
    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
    users.insert_one({'username': data['username'], 'password': hashed})
    return jsonify({"message": "User registered successfully"})

@auth_routes.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users.find_one({'username': data['username']})
    if user and bcrypt.checkpw(data['password'].encode(), user['password']):
        return jsonify({"message": "Login successful", "username": user['username']})
    return jsonify({"error": "Invalid credentials"}), 401
