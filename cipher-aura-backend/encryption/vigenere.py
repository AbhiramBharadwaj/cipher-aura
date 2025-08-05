def vigenere_encrypt(text, key):
    encrypted = ""
    key = key.upper()
    key_index = 0
    for char in text:
        if char.isalpha():
            offset = 65 if char.isupper() else 97
            k = ord(key[key_index % len(key)]) - 65
            encrypted += chr((ord(char) - offset + k) % 26 + offset)
            key_index += 1
        else:
            encrypted += char
    return encrypted

def vigenere_decrypt(ciphertext, key):
    result = []
    key = key.upper()
    key_index = 0
    for char in ciphertext:
        if char.isalpha():
            shift = ord(key[key_index % len(key)]) - ord('A')
            if char.islower():
                result.append(chr((ord(char) - shift - 97) % 26 + 97))
            else:
                result.append(chr((ord(char) - shift - 65) % 26 + 65))
            key_index += 1
        else:
            result.append(char)
    return ''.join(result)

