# Cloud Sync Server Deployment Guide

The `server.js` service is a standalone, zero-dependency Node.js HTTP synchronization daemon designed to persist and aggregate study analytics across multiple devices.

---

## Configuration Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
PORT=8787
HOST=0.0.0.0
ADMIN_TOKEN=your_super_secret_admin_token
SITE_KEY=optional_shared_secret_key
ALLOW_ORIGIN=*
DATA_FILE=data.json
```

---

## Deployment Options

### 1. Direct Node.js Process

```bash
# Run in development
node server.js

# Run in production with PM2
npm install -g pm2
pm2 start server.js --name "rr-sync-server"
pm2 save
```

### 2. Docker Container

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY server.js package.json .env ./
EXPOSE 8787
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t rr-sync-server .
docker run -d -p 8787:8787 --env-file .env -v $(pwd)/data.json:/app/data.json --name rr-sync rr-sync-server
```

### 3. systemd Service (Linux VPS)

Create `/etc/systemd/system/rr-sync.service`:
```ini
[Unit]
Description=Rectilinear Redundancies Sync Server
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/rectilinear-redundancies
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
EnvironmentFile=/opt/rectilinear-redundancies/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rr-sync
```

---

## API Endpoints Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | System health, user count, and uptime stats |
| `POST` | `/api/sync` | `X-Site-Key` (Optional) | Uploads and persists client study telemetry |
| `GET` | `/api/users` | `X-Admin-Token` | Retrieves all registered user study records |
| `DELETE` | `/api/users/:uid` | `X-Admin-Token` | Deletes a user profile and resets their storage |
