# DevBoard – Developer Standup & Sprint Tracker

A modern, premium SaaS application for engineering teams to manage projects, sprints, tasks via Kanban board, daily standups, and team collaboration with real-time updates.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Bootstrap 5, @dnd-kit, Framer Motion, Recharts |
| Backend | Spring Boot 3.2, Spring Security, JWT, Spring Data JPA |
| Database | MySQL 8 |
| Real-time | WebSockets (STOMP + SockJS) |
| DevOps | Docker, Docker Compose, GitHub Actions |
| API Docs | Swagger / SpringDoc OpenAPI |

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8
- Maven

### 1. Database Setup
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS devboard;"
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs at http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

### Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MySQL: localhost:3307

## Features
- 🔐 JWT Authentication with role-based access
- 📊 Interactive Dashboard with charts
- 📁 Project Management
- 🏃 Sprint Planning & Tracking
- 📋 Drag-and-Drop Kanban Board
- ✅ Task Management with priorities & labels
- 📝 Daily Standups
- 👥 Team Management
- 🔔 Real-time Notifications via WebSocket
- 📈 Analytics & Velocity Charts
- 🌙 Dark/Light Mode
- 📱 Fully Responsive
