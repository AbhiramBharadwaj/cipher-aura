from flask import Blueprint, request, jsonify
from db import messages
import datetime

message_routes = Blueprint('message_routes', __name__)

@message_routes.route('/api/send', methods=['POST'])
def send():
    data = request.json
    payload = {
        "sender": data['sender'],
        "recipient": data['recipient'],
        "message": data['message'],
        "timestamp": datetime.datetime.utcnow()
    }
    messages.insert_one(payload)
    return jsonify({"message": "Message sent."})

@message_routes.route('/api/messages/<username>', methods=['GET'])
def get_messages(username):
    result = list(messages.find({"recipient": username}))
    for r in result:
        r['_id'] = str(r['_id'])
    return jsonify(result)
