# SCM Security API

## Project Overview

SCM Security API is a full-stack application for scanning source code repositories for security issues. It features a NestJS backend and a React frontend, both containerized for easy deployment. The backend exposes a REST API for scanning repositories, while the frontend provides a user-friendly interface for interacting with the API.

## Setup Instructions

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd scm-security-api
   ```
2. Build and start the application:
   ```bash
   docker-compose up --build
   ```
3. Access the frontend at [http://localhost:3000](http://localhost:3000)

### Development (without Docker)
- Backend:
  ```bash
  npm install
  npm run start:dev
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  npm start
  ```

## API Documentation

### Scan a Repository
- **POST** `/scan`
  - **Body:** `{ "repoUrl": "<repository-url>" }`
  - **Response:** Scan results (JSON)

### Example Request
```bash
curl -X POST http://localhost:3000/scan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/example/repo.git"}'
```

## Design Decisions & Trade-offs
- **Monorepo:** Both backend and frontend are managed in a single repository for simplicity.
- **Single Container Service:** The backend serves the built frontend, reducing deployment complexity.
- **Volume for Repos:** The `repos` directory is mounted as a Docker volume for persistent storage of scanned repositories.
- **Multi-stage Docker Build:** Reduces final image size and separates build dependencies from runtime.
- **No Separate Frontend Service:** The React app is built and served as static files by the backend, simplifying networking and deployment.

---
For further details, see the source code and comments in the respective directories.
