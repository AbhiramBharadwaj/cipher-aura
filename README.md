# 🔐 CipherAura – Secure Messaging with Hybrid Encryption

CipherAura is a **secure communication platform** that combines **classical and modern cryptography** (Caesar, Vigenère, AES) into a **triple-layer hybrid encryption system**, with full-stack support for **authentication, messaging, and key management**.  
It features a **Flask backend**, **MongoDB Atlas**, and a **React + Tailwind frontend** for a clean, secure, and modern experience.

---

## 🚀 Features

### 🔑 Authentication
- User registration and login with **JWT tokens**
- **bcrypt** password hashing for secure credential storage
- Persistent sessions with **7-day token expiry**

### 🧩 Encryption Pipeline
- **Step 1 – Caesar Cipher**: Simple substitution for base obfuscation  
- **Step 2 – Vigenère Cipher**: Poly-alphabetic substitution for stronger security  
- **Step 3 – AES (CBC, 128-bit key)**: Industry-standard block cipher with IV + base64 output  
- Messages are encrypted in sequence:  

Message → Caesar → Vigenère → AES → Encrypted Output

- Decryption follows the reverse pipeline.

### 📬 Secure Messaging
- Send encrypted messages to multiple recipients
- Auto-create threads with participant IDs
- Encrypted messages stored in MongoDB with metadata
- Fetch messages in a thread with encryption intact (frontend handles decryption)

### 📂 Database (MongoDB Atlas)
- **users** – account info (email, username, password hash)  
- **keyrings** – key management and algorithm versions  
- **threads** – conversations between participants  
- **messages** – encrypted messages and metadata  
- **audits** – action logs for accountability

### 🎨 Frontend (React + Tailwind)
- User-friendly UI with neon cyberpunk styling
- Pages: Landing, Register, Login, Dashboard
- React Query for API state management
- ShadCN UI + custom glassmorphism & neon effects

---

## 🛠️ Tech Stack

- **Backend**: Flask, Flask-JWT-Extended, Flask-CORS  
- **Database**: MongoDB Atlas (TLS enabled)  
- **Crypto**: PyCryptodome (AES), custom Caesar + Vigenère implementations  
- **Auth**: JWT, bcrypt  
- **Frontend**: React (Vite + TypeScript), Tailwind CSS, React Router, ShadCN UI  
- **Deployment Ready**: Works locally and on cloud (Render, Vercel, etc.)

---

## 📂 Project Structure
CipherAura/
│── backend/
│ ├── run.py # Flask entrypoint
│ ├── routes/
│ │ ├── auth_routes.py # Register/Login/JWT endpoints
│ │ ├── cipher_routes.py # Encrypt/Decrypt endpoints
│ │ ├── message_routes.py # Messaging + threads
│ ├── encryption/
│ │ ├── caeser.py # Caesar cipher
│ │ ├── vigenere.py # Vigenère cipher
│ │ ├── aes.py # AES (CBC + Base64)
│ ├── requirements.txt
│ ├── .env # Environment variables
│
│── frontend/
│ ├── main.tsx # React entrypoint
│ ├── App.tsx # App routes
│ ├── index.css # Tailwind theme
│ ├── App.css # Basic layout styles
│ ├── components/ # Landing, Auth, Dashboard
│ ├── pages/ # Index, NotFound


---

## ⚙️ Setup Instructions

### 1. Clone Repo
```bash
git clone https://github.com/AbhiramBharadwaj/cipher-aura.git
cd cipheraura

Backend Setup:
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Create a .env file
SECRET_KEY=thisisaverysecretkey
JWT_SECRET_KEY=thisisaverysecretkeyjwt
MONGODB_URI=your-mongodb-uri
DB_NAME=cipher_aura

Run Server
python run.py

Frontend setup
cd frontend
npm install
npm run dev

