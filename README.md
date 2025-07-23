# MyHosting
Here is the image hosting

1. Quick Start

## Quick Start
# Build and run
docker compose up --build

# Access at
http://localhost


2. Project Structure
.
├── BackEnd/          # FastAPI application
├── FrontEnd/         # Nginx configuration
│   └── static/       # Static files (JS, icons)
├── docker-compose.yml
└── uploads/          # Uploaded files (auto-created)

3. Key Features

- JPEG image uploads
- File management (view/delete)
- Unique filename generation
- Responsive web interface

4. Technical Details
- Max file size: 1MB (adjust in nginx.conf)
- API endpoints:
  - POST /api/upload
  - GET /api/files
  - DELETE /api/files/{filename}
- Proxying:
  - /api/* → backend:8000
  - /uploads/* → /api/uploads/

5. Management Commands
# Stop containers
docker compose down

# Stop and delete all data
docker compose down -v

# View logs
docker compose logs -f

6. Troubleshooting
- If images don't load:
  1. Check nginx.conf proxy_pass settings
  2. Verify backend routes in server.py
- For 413 errors: increase client_max_body_size

7. Requirements
- Docker 20.10+
- Docker Compose 2.0+