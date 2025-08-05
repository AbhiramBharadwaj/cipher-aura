from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64
import hashlib


def pad(text):
    pad_len = 16 - (len(text) % 16)
    padded = text + chr(pad_len) * pad_len
    print(f"[AES Pad] Pad length: {pad_len}")
    print(f"[AES Pad] Padded text: {repr(padded)}")
    return padded


def unpad(text_bytes):
    pad_len = text_bytes[-1]
    print(f"[AES Unpad] Padding length to remove: {pad_len}")
    return text_bytes[:-pad_len]


def get_fixed_length_key(key):
    hashed = hashlib.sha256(key.encode()).digest()
    print(f"[AES Key] SHA-256 Digest: {hashed.hex()}")
    short_key = hashed[:16]
    print(f"[AES Key] Final 16-byte key: {short_key.hex()}")
    return short_key


def aes_encrypt(text, key):
    print("[AES Encrypt] Starting encryption...")
    key_bytes = get_fixed_length_key(key)
    iv = get_random_bytes(16)
    print(f"[AES Encrypt] Generated IV: {iv.hex()}")

    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    padded_text = pad(text).encode('utf-8')
    encrypted = cipher.encrypt(padded_text)
    
    result = base64.b64encode(iv + encrypted).decode('utf-8')
    print(f"[AES Encrypt] Encrypted + IV (base64): {result}")
    return result


def decrypt_aes(cipher_text, key):
    print("[AES Decrypt] Starting decryption...")
    key_bytes = get_fixed_length_key(key)
    
    raw = base64.b64decode(cipher_text)
    print(f"[AES Decrypt] Raw input (base64 decoded): {raw.hex()}")

    iv = raw[:16]
    encrypted = raw[16:]
    print(f"[AES Decrypt] IV: {iv.hex()}")
    print(f"[AES Decrypt] Encrypted part: {encrypted.hex()}")

    cipher = AES.new(key_bytes, AES.MODE_CBC, iv)
    decrypted_bytes = cipher.decrypt(encrypted)
    print(f"[AES Decrypt] Decrypted bytes (before unpadding): {decrypted_bytes}")

    try:
        result = unpad(decrypted_bytes).decode('utf-8')
        print(f"[AES Decrypt] Final decrypted message: {result}")
        return result
    except Exception as e:
        print(f"[AES Decrypt] Error during unpadding/decoding: {e}")
        raise
