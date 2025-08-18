from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

# Your existing helpers
from encryption.caeser import caesar_encrypt, caesar_decrypt
from encryption.vigenere import vigenere_encrypt, vigenere_decrypt
from encryption.aes import aes_encrypt, decrypt_aes

from datetime import datetime

cipher_routes = Blueprint('cipher_routes', __name__)

# -----------------------------
# Utility: safe audit (optional)
# -----------------------------
def _audit_safe(actor_id: str, action: str, meta: dict):
    """
    Tries to write an audit record if a DB handle exists on the app.
    Silently ignores failures so crypto endpoints never break on audit errors.
    """
    try:
        db = getattr(current_app, "db", None) or current_app.config.get("DB")
        if db:
            db["audits"].insert_one({
                "actor": actor_id,
                "action": action,
                "meta": meta,
                "created_at": datetime.utcnow()
            })
    except Exception:
        pass


# -----------------------------
# Core: Triple-layer encrypt
# -----------------------------
def triple_layer_encrypt(message: str, caesar_shift: int, vigenere_key: str, aes_key: str) -> str:
    print(f"[Step 0] Original message: {message}")

    print("[Step 1] Caesar Cipher Encrypting...")
    caesar_encrypted = caesar_encrypt(message, caesar_shift)
    print(f"[Step 1] Caesar Output: {caesar_encrypted}")

    print("[Step 2] Vigenère Cipher Encrypting...")
    vigenere_encrypted = vigenere_encrypt(caesar_encrypted, vigenere_key)
    print(f"[Step 2] Vigenère Output: {vigenere_encrypted}")

    print("[Step 3] AES Cipher Encrypting...")
    aes_encrypted = aes_encrypt(vigenere_encrypted, aes_key)  # expected to return base64 text
    print(f"[Step 3] AES Output (base64): {aes_encrypted}")

    return aes_encrypted, caesar_encrypted, vigenere_encrypted


# -----------------------------
# Validators
# -----------------------------
def _validate_encrypt_payload(data: dict):
    if not isinstance(data, dict):
        return "Invalid JSON body."
    if not data.get("message"):
        return "'message' is required."
    if "caesar_shift" not in data:
        return "'caesar_shift' is required."
    try:
        int(data["caesar_shift"])
    except Exception:
        return "'caesar_shift' must be an integer."
    if not isinstance(data.get("vigenere_key", ""), str) or len(data.get("vigenere_key", "")) == 0:
        return "'vigenere_key' is required."
    if not isinstance(data.get("aes_key", ""), str) or len(data.get("aes_key", "")) < 4:
        return "'aes_key' is required (min 4 chars)."
    return None


def _validate_decrypt_payload(data: dict):
    if not isinstance(data, dict):
        return "Invalid JSON body."
    if not data.get("encrypted_message"):
        return "'encrypted_message' is required."
    if "caesar_shift" not in data:
        return "'caesar_shift' is required."
    try:
        int(data["caesar_shift"])
    except Exception:
        return "'caesar_shift' must be an integer."
    if not isinstance(data.get("vigenere_key", ""), str) or len(data.get("vigenere_key", "")) == 0:
        return "'vigenere_key' is required."
    if not isinstance(data.get("aes_key", ""), str) or len(data.get("aes_key", "")) < 4:
        return "'aes_key' is required (min 4 chars)."
    return None


# -----------------------------
# Encrypt Route (supports /encrypt and /api/encrypt)
# -----------------------------
@cipher_routes.route('/encrypt', methods=['POST'])
@cipher_routes.route('/api/encrypt', methods=['POST'])
@jwt_required()
def encrypt():
    print("[Backend] /encrypt route hit")

    data = request.get_json(silent=True) or {}
    print("[Backend] Request data received:", data)

    err = _validate_encrypt_payload(data)
    if err:
        print("[Backend] Validation error:", err)
        return jsonify({"error": err}), 400

    message = data["message"]
    caesar_shift = int(data["caesar_shift"])
    vigenere_key = data["vigenere_key"]
    aes_key = data["aes_key"]

    try:
        print("[Backend] Starting encryption...")
        encrypted_b64, caesar_out, vigenere_out = triple_layer_encrypt(
            message, caesar_shift, vigenere_key, aes_key
        )
        print("[Backend] Encryption complete")

        # optional audit
        _audit_safe(actor_id=get_jwt_identity(), action="encrypt", meta={"len": len(message)})

        return jsonify({
            "pipeline": ["caesar", "vigenere", "aes"],
            "caesar_output": caesar_out,
            "vigenere_output": vigenere_out,
            "encrypted_message": encrypted_b64
        }), 200

    except Exception as e:
        print("[Backend] Encryption error:", str(e))
        return jsonify({"error": "Encryption failed.", "detail": str(e)}), 500


# -----------------------------
# Decrypt Route (supports /decrypt and /api/decrypt)
# -----------------------------
@cipher_routes.route('/decrypt', methods=['POST'])
@cipher_routes.route('/api/decrypt', methods=['POST'])
@jwt_required()
def decrypt():
    print("[Backend] /decrypt route hit")

    data = request.get_json(silent=True) or {}
    print("[Backend] Request data received:", data)

    err = _validate_decrypt_payload(data)
    if err:
        print("[Backend] Validation error:", err)
        return jsonify({"error": err}), 400

    cipher_text_b64 = data["encrypted_message"]
    caesar_shift = int(data["caesar_shift"])
    vigenere_key = data["vigenere_key"]
    aes_key = data["aes_key"]

    try:
        print("[Backend] Step 1: AES decryption")
        aes_decrypted = decrypt_aes(cipher_text_b64, aes_key)  # expected to return UTF-8 string
        print(f"[Step 1] AES Output: {aes_decrypted}")

        print("[Backend] Step 2: Vigenère decryption")
        vigenere_decrypted = vigenere_decrypt(aes_decrypted, vigenere_key)
        print(f"[Step 2] Vigenère Output: {vigenere_decrypted}")

        print("[Backend] Step 3: Caesar decryption")
        final_decrypted = caesar_decrypt(vigenere_decrypted, caesar_shift)
        print(f"[Step 3] Caesar Output: {final_decrypted}")

        print("[Backend] Decryption successful")

        # optional audit
        _audit_safe(actor_id=get_jwt_identity(), action="decrypt", meta={"len": len(final_decrypted)})

        return jsonify({
            "pipeline": ["aes^-1", "vigenere^-1", "caesar^-1"],
            "decrypted_message": final_decrypted
        }), 200

    except Exception as e:
        print("[Backend] Decryption error:", str(e))
        return jsonify({'error': 'Decryption failed. Please check your keys and try again.', 'detail': str(e)}), 400
