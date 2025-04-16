# Bonjour Brice !

This is a **NestJS backend application** that connects to a **MariaDB** database and **phpMyAdmin** running in Docker. The backend runs on the **host machine**, while the services required for data storage and admin UI are containerized using Docker.

## 🛠️ Tech Stack

- **NestJS** (Node.js Framework)
- **MariaDB** (Docker)
- **phpMyAdmin** (Docker)
- **TypeORM** (Database ORM)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-project.git
cd exo-back
docker compose up -d --build
npm install
```
COPY 
```
CENTRAL_DB_HOST=localhost
CENTRAL_DB_PORT=3310
CENTRAL_DB_USER=root
CENTRAL_DB_PASSWORD=strongpassword
CENTRAL_DB_NAME=template_db
CENTRAL_DB_URL=mariadb://admin:strongpassword@localhost:3310/template_db
JWT_SECRET=mysecretkey
ENCRYPTION_KEY=my_super_secret_key_123456789
```
In a .env file at the project root
Then run
```
npm run start:dev
```
To start the nest app



