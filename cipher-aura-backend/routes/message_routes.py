from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import datetime

# encryption steps
from encryption.caeser import caesar_encrypt
from encryption.vigenere import vigenere_encrypt
from encryption.aes import aes_encrypt

message_routes = Blueprint('message_routes', __name__)

def _messages():
    return current_app.db.messages

def _threads():
    return current_app.db.threads

def _audits():
    return current_app.db.audits

def _audit(user_id, action, detail=None):
    try:
        _audits().insert_one({
            "user_id": ObjectId(user_id) if user_id else None,
            "action": action,
            "detail": detail,
            "ts": datetime.datetime.utcnow()
        })
    except Exception:
        pass

# --- helper: triple encrypt ---
def _triple_encrypt(message: str, caesar_shift: int, vigenere_key: str, aes_key: str):
    step1 = caesar_encrypt(message, caesar_shift)
    step2 = vigenere_encrypt(step1, vigenere_key)
    step3_b64 = aes_encrypt(step2, aes_key)  # base64 string
    return {
        "pipeline": ["caesar", "vigenere", "aes"],
        "ciphertext_b64": step3_b64,
        "caesar_output": step1,
        "vigenere_output": step2,
    }

# --- Send a message (now encrypts if keys provided) ---
@message_routes.route('/api/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    recipients = data.get("recipients") or []
    text = (data.get("message") or "").strip()

    if not recipients or not text:
        return jsonify({"error": "recipients[] and message are required"}), 400

    caesar_shift = data.get("caesar_shift")
    vigenere_key = data.get("vigenere_key")
    aes_key = data.get("aes_key")

    # Create/find a thread with exact participants (string user ids)
    participants = sorted([user_id] + recipients)
    thread = _threads().find_one({"participant_ids": participants})

    now = datetime.datetime.utcnow()
    if not thread:
        thread_doc = {
            "participant_ids": participants,
            "last_message_at": now,
            "last_message_preview": "[Encrypted]" if (caesar_shift is not None and vigenere_key and aes_key) else text[:50],
            "created_at": now
        }
        thread_id = _threads().insert_one(thread_doc).inserted_id
    else:
        thread_id = thread["_id"]

    msg_doc = {
        "thread_id": thread_id,
        "sender_id": ObjectId(user_id),
        "recipient_ids": [ObjectId(r) for r in recipients],
        "status": "sent",
        "created_at": now,
        "read_at": []
    }

    # Encrypt if keys are present; otherwise store as plaintext (legacy/testing)
    if caesar_shift is not None and vigenere_key and aes_key:
        cipher = _triple_encrypt(text, int(caesar_shift), str(vigenere_key), str(aes_key))
        msg_doc["cipher"] = {
            "ciphertext_b64": cipher["ciphertext_b64"],
            "pipeline": cipher["pipeline"]
        }
        # optional (debug): include intermediates
        msg_doc["cipher_meta"] = {
            "caesar_output": cipher["caesar_output"],
            "vigenere_output": cipher["vigenere_output"]
        }
        preview = "[Encrypted]"
    else:
        msg_doc["ciphertext"] = text  # plaintext fallback
        preview = text[:50]

    res = _messages().insert_one(msg_doc)

    # update thread metadata
    _threads().update_one(
        {"_id": thread_id},
        {"$set": {
            "last_message_at": now,
            "last_message_preview": preview
        }}
    )

    _audit(user_id, "send_message", {
        "thread_id": str(thread_id),
        "message_id": str(res.inserted_id),
        "encrypted": bool("cipher" in msg_doc)
    })

    return jsonify({
        "message": "Message sent",
        "message_id": str(res.inserted_id),
        "thread_id": str(thread_id)
    }), 201

# --- List user’s threads ---
@message_routes.route('/api/threads', methods=['GET'])
@jwt_required()
def list_threads():
    user_id = get_jwt_identity()
    cursor = _threads().find({"participant_ids": user_id}).sort("last_message_at", -1)
    threads = []
    for t in cursor:
        t["id"] = str(t.pop("_id"))
        threads.append(t)
    _audit(user_id, "list_threads", {"count": len(threads)})
    return jsonify(threads)

# --- Fetch messages in a thread ---
@message_routes.route('/api/threads/<thread_id>/messages', methods=['GET'])
@jwt_required()
def fetch_thread_messages(thread_id):
    user_id = get_jwt_identity()
    try:
        oid = ObjectId(thread_id)
    except Exception:
        return jsonify({"error": "Invalid thread id"}), 400

    msgs = []
    cursor = _messages().find({"thread_id": oid}).sort("created_at", 1)
    for m in cursor:
        m["id"] = str(m.pop("_id"))
        m["thread_id"] = str(m["thread_id"])
        m["sender_id"] = str(m["sender_id"])
        m["recipient_ids"] = [str(r) for r in m["recipient_ids"]]
        # keep cipher (base64) as-is for frontend to decrypt on demand
        msgs.append(m)

    _audit(user_id, "fetch_messages", {"thread_id": thread_id, "count": len(msgs)})
    return jsonify(msgs)
