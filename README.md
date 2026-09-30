# FlowPilot AI — Intelligent Workflow & Approval Automation Platform

> **Theme:** SMART AUTOMATION  
> **Tagline:** Automate Work. Accelerate Decisions.  
> Transform repetitive operational requests into intelligent automated processes with AI classification, structured data extraction, policy rule evaluation, and human-in-the-loop governance.

---

## 1. Project Overview

Organizations lose hundreds of work-hours every month to repetitive administrative processes: manual expense filings, purchase approvals, IT access tickets, and routine follow-ups. Traditional ticketing systems are merely passive forms: they require manual review, manual classification, manual task assignment, and manual data transcription.

**FlowPilot AI** is an intelligent, full-stack workflow automation platform that converts unstructured business requests into autonomous, policy-governed workflows. It combines LLM-powered cognitive processing (Google Gemini API with strict Zod validation) with a deterministic enterprise rule engine, an automated SLA watcher, and an audit-ready ROI analytics dashboard.

---

## 2. Core Problem & Pain Points Addressed

| Manual Process Pain Point | FlowPilot AI Autonomous Solution |
| :--- | :--- |
| **Inbox Delays & Bottlenecks** | Immediate AI classification (<1s) and straight-through processing |
| **Manual Data Entry Errors** | Structured token extraction (amounts, currency, purpose, dates) |
| **Duplicate & Fraudulent Spend** | Semantic duplicate detection flagging similar past submissions |
| **Broken Approval Escalations** | Background SLA watcher with automated escalation alerts |
| **Disconnected Decision History** | Immutable audit logs tracking all AI, user, and system events |
| **Unclear Operational ROI** | Mathematical ROI formulas calculating hours saved & efficiency gains |

---

## 3. Key Features

- **Autonomous 10-Step Automation Pipeline**:
  1. Request Received & Schema Validation
  2. Input Normalization
  3. AI Intent & Category Classification
  4. Structured Information Extraction (Currency, Amounts, Purpose, Vendor)
  5. Priority & Urgency Scoring
  6. Enterprise Rule & Threshold Evaluation
  7. Semantic Duplicate & Fraud Detection
  8. Autonomous Workflow Routing & Department Assignment
  9. Action Item / Task Generation
  10. Stakeholder Notification Dispatch
- **Human-in-the-Loop Governance**:
  - Micro-expenses (< ₹5,000) straight-through auto-approved without human delay.
  - Mid-tier expenses (₹5,000 – ₹25,000) routed to Department Manager.
  - High-value expenses (> ₹25,000) enforce dual Manager + Admin authorization.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: User management, department cost-center budgets, rule engine configuration, audit inspection.
  - `MANAGER`: Department approval queue, task delegation, team analytics, manual escalation.
  - `EMPLOYEE`: Request submission, live AI timeline tracking, personal task completion.
- **Formula-Backed Analytics & Telemetry**:
  - Tracks total requests, automation rates, hours saved, and cycle time reduction with transparent, audit-ready formulas.
- **In-App Notification Center**:
  - Live alerts with unread counter, badge indicators, and 1-click navigation to requests.

---

## 4. Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS + Custom Glassmorphism Design System
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Pie charts, Bar charts, Area charts)
- **HTTP Client**: Axios with JWT Bearer interceptor & auto-logout on token expiration

### Backend
- **Runtime**: Node.js v20+ & Express.js
- **Database & ODM**: MongoDB with Mongoose (with embedded In-Memory Mongo fallback for zero-config local runs)
- **AI Engine**: Google Gemini API (`@google/generative-ai` with structured JSON schema) + deterministic rule fallback
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Validation**: Zod (Strict backend payload & AI response schema validation)
- **Security**: Helmet, CORS, Express Rate Limiter, MongoDB injection protection
- **Logging**: Morgan HTTP logger

---

## 5. System Architecture

```
                                  ┌────────────────────────┐
                                  │      FlowPilot UI      │
                                  │  (React / Vite / Tailwind)
                                  └───────────┬────────────┘
                                              │ REST API + JWT
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express.js API Gateway                                   │
│  ├── Helmet (Security Headers)                ├── CORS (Origin Control)                │
│  ├── Rate Limiter (DDoS Mitigation)           ├── Centralized Error Handler (Zod/BSON) │
└──────────────────────┬──────────────────────────────────────────┬──────────────────────┘
                       │                                          │
                       ▼                                          ▼
┌──────────────────────────────────────────────┐ ┌──────────────────────────────────────┐
│           Automation Pipeline Engine         │ │        Core Business Services        │
│  ├── 1. Ingestion & Validation               │ │  ├── Auth & RBAC Middleware          │
│  ├── 2. AI Classifier (Zod-enforced JSON)    │ │  ├── Rule Engine (DB & Baseline)     │
│  ├── 3. Info Extractor (Regex + Gemini)      │ │  ├── Task Management Service         │
│  ├── 4. Duplicate Check (Semantic + Exact)   │ │  ├── SLA Watcher & Escalation Engine │
│  ├── 5. Priority Detector (SLA Calculator)   │ │  ├── In-App Notification Dispatcher  │
│  └── 6. Recommendation & Routing Engine      │ │  └── Immutable Audit Logger          │
└──────────────────────┬───────────────────────┘ └───────────────────┬──────────────────┘
                       │                                             │
                       ▼                                             ▼
┌──────────────────────────────────────────────┐ ┌──────────────────────────────────────┐
│            Google Gemini 1.5 Flash           │ │             MongoDB Layer            │
│  (Structured JSON Generation & Fallback)     │ │  (Requests, Workflows, Users, Tasks, │
└──────────────────────────────────────────────┘ │   Approvals, Rules, Audit Logs)      │
                                                 └──────────────────────────────────────┘
```

---

## 6. Project Structure

```
flowpilot-ai/
│
├── client/
│   ├── src/
│   │   ├── api/             # Axios instances and API services
│   │   ├── components/
│   │   │   ├── common/      # StatCard, Badge, Modal, EmptyState, Skeleton
│   │   │   ├── layout/      # Navbar, Sidebar, MainLayout, ProtectedRoute
│   │   │   └── workflow/    # AiProcessingTimeline, ProgressBar, ApprovalModal, RecommendationCard
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Requests, Detail, Tasks, Approvals, Analytics, Audit
│   │   │   └── admin/       # UsersPage, DepartmentsPage, RulesPage
│   │   ├── App.jsx          # Route configurations
│   │   ├── main.jsx         # Application entry
│   │   └── index.css        # Tailwind design system & animations
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── ai/              # geminiClient, classifier, extractor, priorityAnalyzer, recommendationEngine, etc.
│   │   ├── config/          # db.js (with In-Memory fallback), env.js
│   │   ├── controllers/     # auth, request, workflow, task, ai, analytics, audit, rule, department
│   │   ├── middleware/      # auth, validate, errorHandler, rateLimiter
│   │   ├── models/          # User, Department, Request, Workflow, Task, Approval, Notification, AuditLog, WorkflowRule
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # automationService, ruleEngine, auditService, notificationService
│   │   ├── utils/           # seed.js, apiResponse.js
│   │   ├── workflows/       # workflowEngine.js, stateMachine.js, slaManager.js
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server bootstrap & background SLA checker
│   ├── tests/               # Automated unit & integration tests
│   ├── .env.example
│   └── package.json
│
├── README.md
├── DEPLOYMENT_GUIDE.md
├── DEMO_SCRIPT.md
├── .gitignore
└── package.json             # Monorepo runner (concurrent dev, seed, test)
```

---

## 7. Prerequisites & Installation

### Prerequisites
- Node.js v20.x or higher
- npm v10.x or higher
- Git

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/flowpilot-ai.git
   cd flowpilot-ai
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   In `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flowpilot
   JWT_SECRET=flowpilot_super_secure_jwt_secret_key_2026_production
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

   > **Note on Zero-Config Execution:** If you do not have a local MongoDB daemon running, FlowPilot automatically starts an embedded In-Memory MongoDB instance (`mongodb-memory-server`) so the app runs immediately out-of-the-box! If `GEMINI_API_KEY` is not provided, the intelligent deterministic cognitive fallback executes with 100% reliability.

4. **Seed the Database with Demo Data**:
   ```bash
   npm run seed
   ```

5. **Start Both Frontend & Backend Simultaneously**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`
   - Health Check: `http://localhost:5000/api/health`

---

## 8. Demo Credentials & One-Click Login

The login page includes **1-Click Demo Buttons** to instantly log in as any role:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Employee** | `employee@flowpilot.ai` | `Employee@123` | Create requests, view timeline, complete assigned tasks |
| **Manager** | `manager@flowpilot.ai` | `Manager@123` | Approval queue, authorize/reject, team metrics, manual escalation |
| **Admin** | `admin@flowpilot.ai` | `Admin@123` | User management, rule engine editor, department budgets, audit log |

---

## 9. Hackathon Demo Walkthrough (3-5 Minutes)

1. **Sign In as Employee**:
   - Go to `http://localhost:5173/login` and click **"Employee (Alex Rivera)"**.
2. **Submit Expense Request**:
   - Click **"New Request"**.
   - Click the preset button: **"Main Demo: ₹8,500 Expense"** (or type `"Need reimbursement of ₹8,500 for client travel"`).
   - Click **"Launch AI Workflow"**.
3. **Inspect Autonomous Pipeline**:
   - Observe the 10-step AI timeline animation.
   - View extracted amount (`₹8,500`), category (`Expense`), and AI recommendation (`Manager Approval required`).
   - Notice the state is set to `PENDING_APPROVAL`.
4. **Sign In as Manager & Authorize**:
   - Sign out and click **"Manager (Sarah Jenkins)"**.
   - Open **"Approval Queue"** (`/approvals`).
   - Click **"Authorize / Reject"**, add comment `"Approved travel expense"`, and click **"Authorize & Approve"**.
5. **Observe Auto-Completion & AI Summary**:
   - The workflow moves through `APPROVED` -> `IN_PROGRESS` -> `COMPLETED`.
   - The AI Executive Completion Summary appears on the request.
6. **Inspect ROI Analytics**:
   - Click **"Automation Analytics"** (`/analytics`) to see updated hours saved and formula breakdown.
7. **View Audit Trail**:
   - Open **"Audit Trail"** (`/audit-logs`) to see the permanent record with timestamps, actors, and IP addresses.

---

## 10. Automated Tests

Run the test suite:
```bash
npm test
```
The test suite validates:
- Zod schema validation on AI classification, extraction, and priority output
- State machine transition safety rules (e.g., rejecting invalid jumps)
- Rule engine threshold evaluations
- Heuristic cognitive fallbacks

---

## 11. Security & Production Best Practices

- **Zero Secrets on Frontend**: `GEMINI_API_KEY` is strictly confined to the backend process.
- **Helmet Security Headers**: XSS, frameguard, and MIME sniffing protection enabled.
- **CORS Whitelist**: Explicitly restricted to authorized client domains.
- **Centralized Rate Limiting**: Dedicated limits on authentication and operational endpoints.
- **Input Sanitization**: Every endpoint validates URL params, queries, and request bodies with Zod.
- **Audit Immutability**: All approvals, rejections, escalations, and state transitions generate non-deletable audit records.

---

## 12. License

MIT License. Built for the Smart Automation Hackathon.
#   S m a r t - A u t o m a t i o n  
 