# ☁️ Cloud DMS — Cloud Document Management System

A secure, full-stack document management system for storing, sharing, and collaborating on documents in real-time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-4-black?style=flat-square&logo=socket.io)

---

## ✨ Features

- 📤 **File Upload** — Drag & drop upload with progress bar
- 🔒 **File Encryption** — AES-256 encryption for all documents
- 📋 **Version Control** — Full version history with restore
- 👥 **Access Permissions** — Role-based document sharing
- ⚡ **Real-time Collaboration** — Live active users & comments via Socket.io
- 🔍 **Advanced Search** — Full-text search with tag filters
- 📊 **Audit Logs** — Complete activity trail for every document
- 🏷️ **Tags** — Organize documents with custom tags

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14, Tailwind CSS, Socket.io Client |
| Backend    | Node.js, Express.js, Socket.io    |
| Database   | PostgreSQL                        |
| Storage    | Local / AWS S3                    |
| Auth       | JWT (JSON Web Tokens)             |

---

## 👥 User Roles

| Role      | Permissions                              |
|-----------|------------------------------------------|
| Owner     | Full control — edit, delete, share       |
| Admin     | Manage users, view all documents         |
| Editor    | Upload, edit, add versions               |
| Commenter | View + comment only                      |
| Viewer    | Read only access                         |

---

## 📁 Project Structure

cloud-dms/

├── server/          # Node.js + Express backend

│   ├── config/      # DB, AWS, constants

│   ├── controllers/ # Business logic

│   ├── middleware/  # Auth, upload, permissions

│   ├── models/      # PostgreSQL queries

│   ├── routes/      # API endpoints

│   ├── socket/      # Real-time Socket.io

│   └── utils/       # Encryption, S3, JWT

│

└── client/          # Next.js 14 frontend

└── src/

├── app/         # Pages (App Router)

├── components/  # UI components

├── context/     # Global state

├── hooks/       # Custom hooks

└── lib/         # API, Socket client

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 15+
- AWS Account (optional — local storage also works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cloud-dms.git
cd cloud-dms
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_dms
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket

ENCRYPTION_KEY=myEncryptionKey32CharactersLong!!
```

### 3. Database Setup

```bash
# Create database in pgAdmin or psql
CREATE DATABASE cloud_dms;

# Run migrations
psql -U postgres -d cloud_dms -f server/migrations/init.sql
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Running the Project

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open browser: **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint                          | Description        |
|--------|-----------------------------------|--------------------|
| POST   | /api/auth/register                | Register user      |
| POST   | /api/auth/login                   | Login              |
| GET    | /api/documents                    | Get all documents  |
| POST   | /api/documents/upload             | Upload document    |
| GET    | /api/documents/:id                | Get document       |
| DELETE | /api/documents/:id                | Delete document    |
| GET    | /api/documents/:id/versions       | Version history    |
| POST   | /api/documents/:id/share          | Share document     |
| GET    | /api/search?q=&tags=              | Search documents   |
| GET    | /api/audit/:docId                 | Audit logs         |

---

## 🔐 Security Features

- JWT Authentication with token expiry
- AES-256 file encryption
- Role-based access control (RBAC)
- Helmet.js security headers
- CORS protection
- Rate limiting on API routes
- Complete audit trail

---

## 📸 Screenshots

> Dashboard, Documents, Search, and Settings pages

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js + Node.js + PostgreSQL**
