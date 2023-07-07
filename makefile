# Build the backend image
build-backend:
	podman build -t localhost/backend -f backend/Dockerfile

# Build the frontend image
build-frontend:
	podman build -t localhost/frontend -f frontend/Dockerfile

# Run the backend and frontend images
run:
	podman run -dt -p 8001:8001/tcp --privileged localhost/backend
	podman run -dt -p 3000:3000/tcp --privileged localhost/frontend
