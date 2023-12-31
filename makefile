# Build the backend image
build-backend:
	podman build -t backend -f backend/Dockerfile

# Build the frontend image
build-frontend:
	podman build -t frontend -f frontend/Dockerfile

# Run the backend and frontend images
run:
	podman run -dt -p 8001:8001/tcp -v ./backend/data:/app/data -v ./backend/media:/app/media --privileged localhost/backend
	podman run -dt -p 3000:3000/tcp --privileged localhost/frontend

restart:
	podman machine stop
	podman machine start
