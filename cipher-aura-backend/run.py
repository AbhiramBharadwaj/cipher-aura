from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.auth_routes import auth_routes
from routes.cipher_routes import cipher_routes
from routes.message_routes import message_routes

load_dotenv()

app = Flask(__name__)

# Allow frontend access
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# ✅ Root route
@app.route('/', methods=['GET'])
def index():
    return {"message": "CipherAura API is live 🚀"}, 200

# 🔗 Register blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(cipher_routes)
app.register_blueprint(message_routes)

if __name__ == '__main__':
    app.run(debug=True)
