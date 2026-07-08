# 🏢 Smart Residency Management System

A full-stack, production-ready web application for residential society management. Built with Spring Boot, vanilla JS, and Claude AI — designed as a professional portfolio/resume project.

---

##  Features 

### 👑 Admin Portal
- **Dashboard** — live stats (residents, flats, visitors inside now, open complaints, amenity bookings)
- **User Management** — add residents/staff/providers, activate/deactivate accounts
- **Flat Management** — assign residents, change status (Occupied/Vacant/Maintenance/Reserved)
- **Visitor Registry** — all visitor records with photos, clickable full-screen photo viewer
- **Complaint Assignment** — assign complaints to providers with AI sentiment analysis
- **Notice Board** — post/pin/delete society announcements (General, Maintenance, Emergency, Event, Rule)
- **Amenity Management** — configure facilities with capacity, operating hours, slot duration
- **All Bookings** — view every resident's amenity reservation
- **SOS Broadcast** — emergency alert posted instantly to notice board
- **AI Analytics** — Claude-powered analysis: complaints, occupancy, visitor patterns, amenity usage + free-form Q&A

### 🏠 Resident Portal
- **Home Dashboard** — greeting, quick stats, notice preview, active visitor cards
- **Notice Board** — read all society announcements, pinned notices at top
- **Amenity Booking** — browse facilities, pick date, select available slot (clash-checked), cancel bookings
- **My Visitors** — register expected visitors → QR gate pass generated automatically
- **QR Gate Pass** — show QR to security guard, or guard can log manually
- **Complaints** — raise with category + priority, track status and assignment
- **AI Chatbot** — ask anything about society rules, maintenance, amenities
- **Profile Management** — update name, phone, profile photo, change password

### 🛡 Security Portal (Gate Guard)
- **Three Entry Modes:**
  - 📷 **Photo Entry** — fill visitor form + take/upload photo → instantly logged
  - 📱 **QR Camera Scan** — live 15fps optimised camera scan (jsQR)
  - ⌨️ **Manual QR** — paste/type QR code string from resident's pass
- **Log Exit** — dropdown of current visitors + ID manual entry
- **Currently Inside** — live table with photos, quick exit button
- **Full Entry Log** — search by name/flat/phone, filter by status, photo thumbnails
- **Profile Management** — update details, change password

### 🔧 Service Provider Portal
- **My Tasks** — unified view: complaints + service requests, sorted by priority
- **Priority sorting** — CRITICAL → HIGH → MEDIUM → LOW
- **Start/Resolve workflow** — start task → resolve with notes
- **Task History** — all completed/resolved work
- **Notice Board** — read society announcements
- **Profile Management** — update details, change password

---

## 🛠 Tech stack used

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, WebSocket (STOMP) |
| **Database** | MySQL 8.0, Hibernate ORM (auto DDL), Connection Pooling (HikariCP) |
| **AI** | Anthropic Claude API (direct), FastAPI Python (optional microservice) |
| **Frontend** | Vanilla JS ES6, HTML5, CSS3, Chart.js, jsQR, QRCode.js, Font Awesome |
| **Security** | JWT Bearer Tokens, BCrypt password hashing, @PreAuthorize RBAC, CORS |

---

## ⚡ Quick Start the project

### Prerequisites
- Java 21+
- MySQL 8.0+
- Maven 3.8+

### 1. Database Setup
```sql
CREATE DATABASE smart_residency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Database
Edit `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_residency?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: YOUR_MYSQL_PASSWORD
```

### 3. Configure AI (Optional but Recommended)
Set environment variable before starting:
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
```
Or add to `application.yml`:
```yaml
anthropic:
  api-key: sk-ant-api03-...
```
> **Without this key**: AI analytics and chatbot return a helpful message explaining what's needed. All other features work normally.

### 4. Build & Run
```bash
cd backend
mvn package -DskipTests
java -jar target/smart-residency-0.0.1-SNAPSHOT.jar
```

### 5. Open the App
Navigate to: **http://localhost:8081**

Tables are created automatically on first run. Sample data (users, flats, notices, amenities) is seeded automatically.

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartresidency.com | admin123 |
| Resident | rajesh@example.com | resident123 |
| Resident 2 | priya@example.com | resident123 |
| Security Guard | guard@smartresidency.com | resident123 |
| Service Provider | plumber@smartresidency.com | resident123 |
| Provider 2 | electrician@smartresidency.com | resident123 |

---

## 📁 Project Structure

```
SmartResidency/
├── backend/                          # Spring Boot application
│   └── src/main/java/com/smartresidency/
│       ├── controller/               # REST API endpoints (8 controllers)
│       ├── service/                  # Business logic
│       ├── model/                    # JPA entities
│       ├── repository/               # Spring Data repositories
│       ├── config/                   # Security, JWT, WebSocket, CORS
│       └── dto/                      # Data Transfer Objects
├── frontend/
│   ├── index.html                    # Login page
│   ├── css/dashboard.css             # Shared dark-theme stylesheet
│   ├── js/app.js                     # Shared utilities (auth, API, toasts, tables)
│   ├── admin/dashboard.html          # Admin portal (~900 lines)
│   ├── resident/dashboard.html       # Resident portal (~700 lines)
│   ├── security/dashboard.html       # Security portal (~580 lines)
│   └── service-provider/dashboard.html # Provider portal (~300 lines)
└── ai-engine/                        # Optional FastAPI microservice
    └── app/                          # Python AI routes (anomaly, chatbot, insights)
```

---

## 🔌 API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Admin | `GET /admin/dashboard`, users CRUD, flats, complaints, visitors, billing |
| Resident | `GET /resident/me`, complaints, visitors, bills, payments |
| Security | `POST /security/log-entry`, `POST /security/scan-qr`, exit, all-visitors |
| Service Provider | tasks CRUD, complaints CRUD |
| Notices | `GET /notices`, `POST /notices`, pin, delete |
| Amenities | `GET /amenities`, `POST /amenities/book`, bookings/my, cancel |
| Profile | `GET /profile`, `PATCH /profile`, `PATCH /profile/change-password` |
| AI | `POST /ai/chat`, `POST /ai/query`, `POST /ai/analyse` |

Full API docs available at: **http://localhost:8081/swagger-ui.html**

---

## 🏗 Architecture

```
Browser (4 role SPAs)
       │  JWT in Authorization header
       ▼
Spring Boot REST API (port 8081)
  ├── Spring Security (JWT filter + RBAC)
  ├── Business Services (Visitor, Complaint, Amenity, Notice, AI)
  ├── Spring Data JPA → MySQL 8.0
  └── WebSocket (STOMP) → real-time notifications
              │
              ▼ (optional)
Python FastAPI AI Engine (port 8000)
  → Anthropic Claude API (direct fallback if FastAPI offline)
```

---

## 🔒 Security Implementation

- **JWT** — stateless auth, 24hr expiry, BCrypt password hashing (strength 10)
- **RBAC** — `@PreAuthorize` on every endpoint, 4 roles: ADMIN, RESIDENT, SECURITY, SERVICE_PROVIDER
- **CORS** — configured for same-host frontend
- **Input validation** — `@Valid` on DTOs, custom exception handler returns clean JSON errors

---

## 📸 Visitor Photo System

Photos captured at the gate are stored as base64 data URLs in MySQL (`MEDIUMTEXT` column). They appear in:
- Security gate dashboard (entry log + currently inside table)
- Admin visitor registry (clickable for full-screen view)
- Resident visitor cards (shows actual photo taken at gate)

