from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
import bcrypt
import datetime

auth_routes = Blueprint('auth_routes', __name__)

def _users():
    return current_app.db.users

def _keyrings():
    return current_app.db.keyrings

def _audits():
    return current_app.db.audits

def _audit(user_id, action, success=True, err=None):
    try:
        _audits().insert_one({
            "user_id": ObjectId(user_id) if user_id else None,
            "action": action,
            "success": success,
            "error": str(err) if err else None,
            "ts": datetime.datetime.utcnow()
        })
    except Exception:
        # audits should never break the flow
        pass

@auth_routes.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(force=True) or {}
    username = (data.get('username') or "").strip()
    email = (data.get('email') or username).strip().lower()
    password = data.get('password') or ""

    if not email or not password:
        return jsonify({"error": "email/username and password are required"}), 400

    # Ensure unique user
    if _users().find_one({"email": email}):
        return jsonify({"error": "Account already exists"}), 409

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user_doc = {
        "email": email,
        "username": username or email.split("@")[0],
        "password_hash": pw_hash,
        "created_at": datetime.datetime.utcnow()
    }
    res = _users().insert_one(user_doc)
    user_id = str(res.inserted_id)

    # Initialize empty keyring (future-proof for rotations)
    _keyrings().insert_one({
        "user_id": ObjectId(user_id),
        "algo_versions": {"aes": 1, "vigenere": 1, "caesar": 1},
        "enc_keys": {},  # will be filled when user sets/rotates keys
        "created_at": datetime.datetime.utcnow(),
        "rotated_at": None
    })

    access_token = create_access_token(
        identity=user_id,
        expires_delta=datetime.timedelta(days=7)
    )

    _audit(user_id, "signup", True)

    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": {"id": user_id, "email": email, "username": user_doc["username"]}
    }), 201

@auth_routes.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(force=True) or {}
    username = (data.get('username') or "").strip()
    email = (data.get('email') or username).strip().lower()
    password = data.get('password') or ""

    user = _users().find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"]):
        _audit(None, "login", False, "invalid credentials")
        return jsonify({"error": "Invalid credentials"}), 401

    user_id = str(user["_id"])
    access_token = create_access_token(
        identity=user_id,
        expires_delta=datetime.timedelta(days=7)
    )

    _audit(user_id, "login", True)

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {"id": user_id, "email": user["email"], "username": user.get("username")}
    })

@auth_routes.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = _users().find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["id"] = str(user.pop("_id"))
    return jsonify({"user": user})
