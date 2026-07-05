# Production Deployment (Docker on AWS EC2)

Target: Ubuntu 24.04, t3.micro, Docker Compose, MongoDB Atlas, Nginx reverse proxy on the host.

## Prerequisites on EC2

1. Install Docker Engine and Docker Compose plugin.
2. Clone this repository to `/opt/iyc` (or your chosen path).
3. Copy `.env.example` to `.env` and fill in production values (Atlas URI, admin credentials, SMTP).
4. Create the uploads directory with correct permissions (Node Alpine runs as UID 1000):

```bash
mkdir -p data/uploads
sudo chown -R 1000:1000 data/uploads
```

5. In MongoDB Atlas: whitelist the EC2 public IP under **Network Access**.

## Build and run

```bash
# Build the image
docker compose build

# Start in the background
docker compose up -d

# Rebuild and restart after code changes
docker compose up -d --build

# Follow logs
docker compose logs -f
```

## Health check

```bash
curl http://127.0.0.1:3001/api/health
```

## Nginx (host)

Proxy all traffic to the container. Set `client_max_body_size 12m` for payment screenshot uploads (10 MB limit in the app).

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Backup uploads

```bash
tar -czf iyc-uploads-$(date +%F).tar.gz -C data uploads
```

## Local development (unchanged)

```bash
npm run dev          # Vite + Express with hot reload
npm run start:prod   # Production mode locally with .env file
```

## t3.micro note

If `docker compose build` runs out of memory on a 1 GB instance, add swap or build the image on a larger machine and push to a registry.
