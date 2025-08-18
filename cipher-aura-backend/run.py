from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
import certifi
import os
import datetime

# Blueprints
from routes.auth_routes import auth_routes
from routes.cipher_routes import cipher_routes
from routes.message_routes import message_routes

load_dotenv()

def create_app():
    app = Flask(__name__)

    # --- Security & Config ---
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "dev-secret")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config['JWT_TOKEN_LOCATION'] = ["headers"]
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    # --- CORS ---
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # --- MongoDB (with CA bundle for Windows/Atlas TLS) ---
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name   = os.getenv("DB_NAME", "cipher_aura")

    print("🔧 [BOOT] Loading config...")
    print(f"🔐 [BOOT] DB Name: {db_name}")
    print(f"🌐 [BOOT] Using SRV URI: {'mongodb+srv://' in mongo_uri}")

    try:
        client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
        # quick ping to verify TLS/cred works
        client.admin.command("ping")
        print("✅ [DB] Connected to MongoDB Atlas successfully.")
    except Exception as e:
        print(f"❌ [DB] MongoDB connection failed: {e}")
        # Don't exit—app will still boot so you can see logs, but DB ops will fail.
        # You can raise here if you prefer: raise

    app.db = client[db_name]

    # --- Indexes (idempotent) ---
    try:
        print("🧭 [DB] Ensuring indexes...")
        app.db.users.create_index("email", unique=True)
        app.db.keyrings.create_index("user_id", unique=True)
        app.db.messages.create_index([("thread_id", 1), ("created_at", -1)])
        app.db.messages.create_index([("recipient_ids", 1), ("status", 1)])
        app.db.threads.create_index([("participant_ids", 1), ("last_message_at", -1)])
        app.db.audits.create_index([("user_id", 1), ("ts", -1)])
        print("✅ [DB] Indexes ready.")
    except Exception as e:
        print(f"⚠️ [DB] Index creation warning: {e}")

    # --- JWT ---
    JWTManager(app)
    print("🔑 [BOOT] JWT ready.")

    # --- Root route ---
    @app.route('/', methods=['GET'])
    def index():
        return {
            "message": "CipherAura API is live 🚀",
            "db": db_name,
            "now_utc": datetime.datetime.utcnow().isoformat() + "Z"
        }, 200

    # --- Register blueprints ---
    app.register_blueprint(auth_routes)
    app.register_blueprint(cipher_routes)
    app.register_blueprint(message_routes)
    print("🧩 [BOOT] Blueprints registered: auth, cipher, message")

    return app

app = create_app()

if __name__ == '__main__':
    # change port if you prefer 8080
    print("🚀 [RUN] Starting Flask dev server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
