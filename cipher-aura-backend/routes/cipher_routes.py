from flask import Blueprint, request, jsonify
from encryption.caeser import caesar_encrypt, caesar_decrypt
from encryption.vigenere import vigenere_encrypt, vigenere_decrypt
from encryption.aes import aes_encrypt, decrypt_aes

cipher_routes = Blueprint('cipher_routes', __name__)

# -----------------------------
# Encryption Function
# -----------------------------
def triple_layer_encrypt(message, caesar_shift, vigenere_key, aes_key):
    print(f"[Step 0] Original message: {message}")

    print("[Step 1] Caesar Cipher Encrypting...")
    caesar_encrypted = caesar_encrypt(message, caesar_shift)
    print(f"[Step 1] Caesar Output: {caesar_encrypted}")

    print("[Step 2] Vigenère Cipher Encrypting...")
    vigenere_encrypted = vigenere_encrypt(caesar_encrypted, vigenere_key)
    print(f"[Step 2] Vigenère Output: {vigenere_encrypted}")

    print("[Step 3] AES Cipher Encrypting...")
    aes_encrypted = aes_encrypt(vigenere_encrypted, aes_key)
    print(f"[Step 3] AES Output (base64): {aes_encrypted}")

    return aes_encrypted

# -----------------------------
# Encrypt Route
# -----------------------------
@cipher_routes.route('/encrypt', methods=['POST'])
def encrypt():
    print("[Backend] /encrypt route hit")

    data = request.json
    print("[Backend] Request data received:", data)

    message = data['message']
    caesar_shift = data['caesar_shift']
    vigenere_key = data['vigenere_key']
    aes_key = data['aes_key']

    print("[Backend] Starting encryption...")
    encrypted = triple_layer_encrypt(message, caesar_shift, vigenere_key, aes_key)
    print("[Backend] Encryption complete")

    return jsonify({'encrypted_message': encrypted})

# -----------------------------
# Decrypt Route
# -----------------------------
@cipher_routes.route('/decrypt', methods=['POST'])
def decrypt():
    print("[Backend] /decrypt route hit")

    data = request.json
    print("[Backend] Request data received:", data)

    cipher_text = data['encrypted_message']
    caesar_shift = data['caesar_shift']
    vigenere_key = data['vigenere_key']
    aes_key = data['aes_key']

    try:
        print("[Backend] Step 1: AES decryption")
        aes_decrypted = decrypt_aes(cipher_text, aes_key)
        print(f"[Step 1] AES Output: {aes_decrypted}")

        print("[Backend] Step 2: Vigenère decryption")
        vigenere_decrypted = vigenere_decrypt(aes_decrypted, vigenere_key)
        print(f"[Step 2] Vigenère Output: {vigenere_decrypted}")

        print("[Backend] Step 3: Caesar decryption")
        final_decrypted = caesar_decrypt(vigenere_decrypted, caesar_shift)
        print(f"[Step 3] Caesar Output: {final_decrypted}")

        print("[Backend] Decryption successful")
        return jsonify({'decrypted_message': final_decrypted})

    except Exception as e:
        print("[Backend] Decryption error:", str(e))
        return jsonify({'error': 'Decryption failed. Please check your keys and try again.'}), 400
