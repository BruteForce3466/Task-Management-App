# 📋 Full-Stack Task Management Application (Dockerized)

A complete, multi-container **Task Management Application** built with React, Node.js/Express, PostgreSQL, Nginx, and Docker Compose.

---

## 📌 Overview & Architecture

This application consists of three decoupled components running as isolated Docker containers on a custom bridge network (`app-network`):

```text
               +----------------------------------+
               |           User Browser           |
               +----------------+-----------------+
                                |
                                | HTTP (Port 3000)
                                v
               +----------------------------------+
               |        frontend container        |
               |         (React + Nginx)          |
               +----------------+-----------------+
                                |
                                | Reverse Proxy (/api, /health)
                                v
               +----------------------------------+
               |        backend container         |
               |         (Node.js / Express)      |
               +----------------+-----------------+
                                |
                                | DB Connection (DB_HOST=database:5432)
                                v
               +----------------------------------+
               |        database container        |
               |          (PostgreSQL 16)         |
               +----------------+-----------------+
                                |
                                v
                       postgres-data volume
                       (Persistent Data)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Nginx | Single-Page Application served via lightweight Nginx web server |
| **Backend** | Node.js 20, Express, `pg` driver | RESTful API exposing `/api/tasks` CRUD endpoints and `/health` |
| **Database** | PostgreSQL 16 Alpine | Relational database with automatic schema initialization |
| **Orchestration** | Docker & Docker Compose | Multi-container networking, healthchecks, and volume management |

---

## 🚀 Quick Start (Using Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/) (v20.10+)
- Docker Compose (v2.0+)
- Git

### 1. Clone & Setup Environment
```bash
git clone https://github.com/BruteForce3466/Task-Management-App.git
cd Task-Management-App

# Copy environment variables template
cp .env.example .env
```

### 2. Build & Launch Containers
```bash
docker compose up -d --build
```

### 3. Verify Running Services
```bash
docker compose ps
```

Expected output:
```text
NAME            IMAGE                              COMMAND                  SERVICE    CREATED          STATUS                    PORTS
task-database   postgres:16-alpine                 "docker-entrypoint.s…"   database   Up 20 seconds    Up (healthy)              5432/tcp
task-backend    thoughtclan/task-backend:v1.0.0    "docker-entrypoint.s…"   backend    Up 15 seconds    Up (healthy)              0.0.0.0:8080->8080/tcp
task-frontend   thoughtclan/task-frontend:v1.0.0   "/docker-entrypoint.…"   frontend   Up 10 seconds    Up (healthy)              0.0.0.0:3000->80/tcp
```

### 4. Access Application
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health**: [http://localhost:8080/health](http://localhost:8080/health)
- **Backend REST Tasks API**: [http://localhost:8080/api/tasks](http://localhost:8080/api/tasks)

---

## 💻 Alternative Quick Start (Using Individual Docker Commands)

If you prefer to run the application using manual Docker CLI commands instead of Docker Compose:

### Step 1: Create Bridge Network & Persistent Volume
```bash
docker network create app-network
docker volume create postgres-data
```

### Step 2: Start Database Container
```bash
docker run -d \
  --name task-database \
  --network app-network \
  -e POSTGRES_DB=taskdb \
  -e POSTGRES_USER=taskuser \
  -e POSTGRES_PASSWORD=taskpassword \
  -v $(pwd)/database/init:/docker-entrypoint-initdb.d:ro \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Step 3: Build & Start Backend Container
```bash
docker build -t task-backend:v1 ./backend

docker run -d \
  --name task-backend \
  --network app-network \
  -p 8080:8080 \
  -e APP_ENV=development \
  -e DB_HOST=task-database \
  -e DB_PORT=5432 \
  -e DB_NAME=taskdb \
  -e DB_USER=taskuser \
  -e DB_PASSWORD=taskpassword \
  task-backend:v1
```

### Step 4: Build & Start Frontend Container
```bash
docker build -t task-frontend:v1 ./frontend

docker run -d \
  --name task-frontend \
  --network app-network \
  -p 3000:80 \
  task-frontend:v1
```

---

## 💾 Section 13: Data Persistence Demonstration

This procedure proves that task data survives complete container destruction via Docker Volumes:

1. **Start Stack & Create Tasks**:
   Open [http://localhost:3000](http://localhost:3000) and create 3 tasks (e.g. *"Task A"*, *"Task B"*, *"Task C"*).
2. **Verify Database Records**:
   ```bash
   docker exec -it task-database psql -U taskuser -d taskdb -c "SELECT id, title, status FROM tasks;"
   ```
3. **Tear Down Application Containers**:
   ```bash
   docker compose down
   ```
   *(Note: This stops and removes all containers and networks, but preserves named volume `postgres-data`)*
4. **Re-create & Start Containers**:
   ```bash
   docker compose up -d
   ```
5. **Verify Data Persistence**:
   Refresh [http://localhost:3000](http://localhost:3000). All previously created tasks remain intact.

---

## 🌐 Section 14: Container Networking & DB_HOST Explanation

### Why `DB_HOST=database` instead of `localhost`?

- **Container Isolation**: In Docker, each container operates in its own isolated network namespace with its own `loopback` interface (`127.0.0.1` / `localhost`).
- **`localhost` Scope**: If `DB_HOST=localhost` is configured inside the `backend` container, the backend attempts to connect to a PostgreSQL process listening inside the **backend container itself**, which fails.
- **Docker Embedded DNS**: When containers share a bridge network (`app-network`), Docker runs an embedded DNS server. Setting `DB_HOST=database` allows Docker DNS to resolve the hostname `database` to the container IP assigned to the database service.

---

## ⚡ Section 4 & 5: Dockerfile Optimizations

### 1. Docker Layer Caching Order
In both `backend/Dockerfile` and `frontend/Dockerfile`, dependencies are copied and installed **before** copying application code:

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

- **Reasoning**: Docker caches image layers based on file hashes. Since `package.json` changes rarely compared to source code, subsequent builds skip the expensive `npm ci` step, drastically accelerating build times.

### 2. Non-Root Security Best Practice
In `backend/Dockerfile`, execution is dropped from root to a restricted user:

```dockerfile
USER node
```

- **Reasoning**: Running applications as `root` inside containers poses security risks. Restricting process privileges limits potential container escape vulnerability impact.

---

## 📦 Section 16 & 17: Docker Hub Registry Workflow

### 1. Tag & Push Images to Docker Hub
```bash
# Log in to Docker Hub
docker login

# Tag Backend Image
docker tag task-backend:v1 <your-dockerhub-user>/task-backend:v1.0.0
docker push <your-dockerhub-user>/task-backend:v1.0.0

# Tag Frontend Image
docker tag task-frontend:v1 <your-dockerhub-user>/task-frontend:v1.0.0
docker push <your-dockerhub-user>/task-frontend:v1.0.0
```

### 2. Deploy directly from Docker Hub Images
To run the production stack on another machine without building locally:

```bash
DOCKERHUB_USER=<your-dockerhub-user> docker compose up -d
```

---

## 🔍 Section 18: Troubleshooting & Diagnostic Scenarios

### Scenario 1: Database Connection Refused (`DB_HOST` or Credentials Mismatch)
- **Symptom**: Backend logs show `error: connect ECONNREFUSED` or `password authentication failed`.
- **Diagnostic Command**:
  ```bash
  docker compose logs backend
  docker exec -it task-backend env | grep DB_
  ```
- **Solution**: Ensure `DB_HOST` matches the compose service name (`database`) and credentials in `.env` match `POSTGRES_USER` / `POSTGRES_PASSWORD`.

### Scenario 2: Backend Service Unreachable / Healthcheck Failed
- **Symptom**: Frontend header shows `Backend API: DISCONNECTED` and `docker compose ps` shows backend container status `unhealthy`.
- **Diagnostic Command**:
  ```bash
  docker inspect --format='{{json .State.Health}}' task-backend
  docker logs task-backend --tail 50
  ```
- **Solution**: Restart backend service via `docker compose restart backend`.

### Scenario 3: Nginx 502 Bad Gateway on API Proxy
- **Symptom**: Nginx frontend loads, but API requests return `502 Bad Gateway`.
- **Diagnostic Command**:
  ```bash
  docker compose logs frontend
  docker exec -it task-frontend nginx -t
  ```
- **Solution**: Verify backend container is running on `app-network` and port 8080 is listening.

---

## 🔑 Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `APP_ENV` | `development` | Application runtime environment |
| `DB_HOST` | `database` | PostgreSQL service hostname |
| `DB_PORT` | `5432` | PostgreSQL internal port |
| `DB_NAME` | `taskdb` | PostgreSQL database name |
| `DB_USER` | `taskuser` | PostgreSQL user account |
| `DB_PASSWORD` | `taskpassword` | PostgreSQL password |
| `DOCKERHUB_USER` | `thoughtclan` | Docker Hub registry organization/user |

---

## 🛑 Stopping & Cleaning Up

```bash
# Stop and remove containers + networks
docker compose down

# Stop and remove containers AND persistent volume (WARNING: deletes DB data)
docker compose down -v
```

---

## ✅ Evaluation Verification Checklist

- [x] **Frontend UI**: Responsive React interface supporting CRUD operations & status filtering.
- [x] **Backend API**: Node.js/Express REST API exposing `/api/tasks` & `/health`.
- [x] **Database**: PostgreSQL 16 running in isolated container.
- [x] **Persistence**: Named volume `postgres-data` preserves data across restarts.
- [x] **Networking**: Isolated bridge network `app-network` with `DB_HOST=database`.
- [x] **Dockerfiles**: Multi-stage builds, layer caching, non-root `USER node`, healthchecks.
- [x] **Docker Compose**: Clean orchestration in `compose.yaml`.
- [x] **Documentation**: Complete setup, commands, network explanation, and troubleshooting scenarios in `README.md`.


---

## ☸️ Kubernetes (k8s) Deployment Guide

This project includes production-ready Kubernetes manifests in the k8s/ directory to orchestrate the application using your existing Docker Hub images (prajwal3466/task-backend:v1.0.0 and prajwal3466/task-frontend:v1.0.0).

### 📂 Manifests Architecture

| File | K8s Objects | Description |
|---|---|---|
| k8s/01-configmap-secret.yaml | ConfigMap, Secret | Stores DB_HOST, DB_PORT, APP_ENV, DB credentials, and schema.sql seed script. |
| k8s/02-database.yaml | PVC, Deployment, Service | Provisions 1Gi persistent volume, launches PostgreSQL 16 Pod, and exposes ClusterIP database:5432. |
| k8s/03-backend.yaml | Deployment, Service | Launches Node.js REST API Pod with liveness/readiness probes and exposes ClusterIP ackend:8080. |
| k8s/04-frontend.yaml | Deployment, Service | Launches React + Nginx UI Pod and exposes NodePort service on port 30080. |

---

### 🚀 Deploying to Kubernetes (Minikube / Docker Desktop / Kind)

#### Step 1: Apply all manifests
`ash
kubectl apply -f k8s/
``n
#### Step 2: Verify Pods and Services
`ash
kubectl get pods,svc,pvc
``n
**Expected Output**:
`	ext
NAME                                READY   STATUS    RESTARTS   AGE
pod/task-database-xxxxxxxxx-xxxxx   1/1     Running   0          25s
pod/task-backend-xxxxxxxxx-xxxxx    1/1     Running   0          20s
pod/task-frontend-xxxxxxxxx-xxxxx   1/1     Running   0          15s

NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/database           ClusterIP   10.96.120.10    <none>        5432/TCP         25s
service/backend            ClusterIP   10.96.140.20    <none>        8080/TCP         20s
service/frontend-service   NodePort    10.96.160.30    <none>        3000:30080/TCP   15s
``n
#### Step 3: Access Application
- **Browser URL**: **[http://localhost:30080](http://localhost:30080)** (or minikube service frontend-service)

#### Step 4: Tear down Kubernetes Deployment
`ash
kubectl delete -f k8s/
``n