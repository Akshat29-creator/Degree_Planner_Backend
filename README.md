<p align="center">
  <img src="frontend/src/app/favicon.ico" alt="Degree Planner Logo" width="80" height="80" />
</p>

<h1 align="center">🎓 Degree Planner Agent</h1>

<p align="center">
  <strong>The Intelligent Academic Trajectory Optimizer</strong><br/>
  Powered by Your Own Fine-Tuned Local LLM
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/AI-Self%20Made%20Model-blueviolet?style=for-the-badge" alt="AI" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-green?style=for-the-badge" alt="Privacy" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-usage-guide">Usage</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## 🌟 Why Degree Planner Agent?

Planning a 4-year degree is a **complex optimization problem**. Students must navigate hundreds of courses, intricate prerequisite chains, varying difficulty levels, and career goals—all while avoiding burnout. Degree Planner Agent solves this with a powerful combination of:

1.  **Deterministic Graph Algorithms**: Guarantees mathematically valid course sequences.
2.  **Local AI Intelligence**: Provides career-aligned insights, salary projections, and personalized recommendations—with **100% data privacy**.
3.  **Premium User Experience**: A stunning, futuristic UI that makes planning intuitive and insightful.

---

## ✨ Key Features

### 🧠 Intelligent Plan Generation
| Feature | Description |
|---|---|
| **Topological Scheduling** | Uses Kahn's Algorithm to mathematically guarantee valid course sequences that respect all prerequisites. |
| **Workload Balancing** | Automatically distributes courses to prevent "heavy" semesters, creating a consistent difficulty curve. |
| **Bottleneck Detection** | Identifies critical-path courses that could delay graduation if failed. |
| **Failure "What-If" Simulation** | Calculates the exact impact of failing a specific course on your graduation timeline. |

### 🤖 AI-Powered Insights (Local LLM)
All AI features run on **your own local machine** using Ollama, ensuring your academic data is **never sent to external servers**.

| Feature | Description |
|---|---|
| **Elevator Pitch** | Generates a compelling one-liner summary of your degree plan's strengths. |
| **Career Alignment Score** | A 0-100% gauge showing how well your plan aligns with your stated career goal. |
| **Projected Salary Range** | Estimates starting salary based on the skills acquired in your plan (e.g., `$70k - $95k`). |
| **Target Job Roles** | Identifies specific roles you'd be qualified for (e.g., "Software Engineer", "Data Analyst"). |
| **Workload Heatmap** | An 8-semester visual bar chart showing projected difficulty, helping you spot and rebalance heavy periods. |
| **Skill Gap Analysis** | Detects missing critical skills (e.g., "Cloud Architecture") and recommends specific electives. |
| **Course Deep Dive** | For each course, provides descriptions, learning outcomes, career connections, and study tips. |
| **Industry Relevance** | Explains how the curriculum connects to real-world industry needs. |

### 🧑‍� Comprehensive Career Advisor
A dedicated section providing **A-Z career guidance** based on your goals:
-   **Personalized Study Schedule**: Weekly breakdown with hours/day recommendations.
-   **Certification Roadmap**: Which certifications to pursue and when.
-   **Project Ideas**: Real-world projects to build your portfolio, with tech stacks and GitHub topics.
-   **Interview Prep**: Common questions and answer frameworks.
-   **Salary Progression**: From "New Grad" to "Senior" (5+ years).
-   **Industry Trends**: What's hot in your field.
-   **Companies to Target**: Entry-level hiring leaders.
-   **Resources**: Book recommendations, YouTube channels, online communities.

### 🗂️ Plan History & Management
-   **Auto-Save**: Every generated plan is automatically saved to your history.
-   **Load & Compare**: Revisit past plans, load them back into the planner, and compare trajectories.
-   **Delete Management**: Clean up old or unwanted plans.
-   **Data Persistence**: Powered by PostgreSQL for reliable storage.

### 🎨 Premium User Experience
-   **Futuristic Glassmorphism UI**: Dark mode with vibrant gradients, subtle neon glows, and animated elements.
-   **Visual Academic Roadmap**: A beautiful year-grouped view of your entire degree journey with semester cards.
-   **Interactive Dependency Graph**: ReactFlow-powered visualization of your course prerequisites.
-   **Smooth Animations**: Framer Motion transitions throughout for a polished feel.
-   **Responsive Design**: Works seamlessly on desktop and tablet.

---

## 📸 Screenshots

> *Showcase your app with real screenshots here.*

| Onboarding Wizard | AI Plan Analysis | Career Advisor |
|---|---|---|
| *Guided degree & year selection* | *Deep insights on your plan* | *A-Z career guidance* |

| Visual Roadmap | Plan History |
|---|---|
| *Year-grouped semester view* | *Manage & compare past plans* |

---

## �️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework for production |
| **React 19** + **TypeScript** | Type-safe UI development |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **Framer Motion** | Smooth animations |
| **ReactFlow** | Interactive graph visualization |
| **Recharts** | Charts & data viz |
| **Radix UI** + **Lucide** | Accessible UI primitives |
| **TanStack Query** | Async data fetching |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** (Python 3.11) | High-performance async API |
| **SQLAlchemy** (Async) | ORM for PostgreSQL |
| **Pydantic v2** | Data validation & serialization |
| **Alembic** | Database migrations |
| **Httpx** | Async HTTP client for Ollama |

### Infrastructure
| Technology | Purpose |
|---|---|
| **PostgreSQL 16** | Relational database |
| **Docker & Docker Compose** | Containerization |
| **Ollama** | Local LLM runtime |

---

## 🚀 Getting Started

### Prerequisites

1.  **Docker Desktop**: [Install Docker](https://www.docker.com/products/docker-desktop/)
2.  **Ollama**: [Install Ollama](https://ollama.com/) and pull your model (e.g., `ollama pull llama3`).
3.  **Node.js** (v18+) and **Python** (3.11+) for local development.

### Quick Start (Recommended)

**Option A: Docker Compose (Full Stack)**
```bash
git clone https://github.com/yourusername/degree_planner_agent.git
cd degree_planner_agent

# Start all services
docker-compose up --build
```
*Frontend: `http://localhost:3000` | Backend: `http://localhost:8000`*

---

**Option B: Manual Development Setup (3 Terminals)**

**Terminal 1: Database**
```powershell
docker-compose up -d db
```

**Terminal 2: Backend**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*API available at `http://localhost:8000`*

**Terminal 3: Frontend**
```powershell
cd frontend
npm install
npm run dev
```
*UI available at `http://localhost:3000`*

---

## 📖 Usage Guide

### 1. Onboarding
When you first open the app, a guided wizard helps you set up:
-   **Degree Type**: B.Tech, M.Tech, MBA, B.Sc, etc.
-   **Specialization**: Computer Science, Mechanical Engineering, Finance, etc.
-   **Current Year**: Freshman, Sophomore, Junior, or Senior.

### 2. Course Input
Choose how to get your courses:
-   **Generate with AI**: The LLM creates a comprehensive curriculum for your degree.
-   **Upload File**: Import a CSV or JSON from your university.
-   **Manual Entry**: Type courses one by one for AI analysis.

### 3. Plan Generation
-   Go to the **Planner** tab.
-   Mark courses you've already completed.
-   Select any "Priority" courses you want to take immediately.
-   Click **"Generate Optimized Plan"**.

### 4. AI Analysis
-   Once a plan is generated, click **"Analyze with AI"**.
-   Review the Career Alignment Score, Salary Projections, Skill Gaps, and Course Deep Dives.

### 5. Career Advisor
-   Navigate to the **Advisor** tab.
-   Enter your career goal (e.g., "Machine Learning Engineer").
-   Receive a comprehensive A-Z career guidance report.

### 6. History
-   All generated plans are auto-saved.
-   Go to the **History** tab to view, load, or delete past plans.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Next.js 16 (React 19 + TypeScript)               │  │
│  │   • Zustand State • Framer Motion • ReactFlow • TanStack      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                                   │ REST API
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   FastAPI (Python 3.11)                       │  │
│  │   • Pydantic Validation • Async Endpoints • SQLAlchemy ORM    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
           │                                          │
           ▼                                          ▼
┌────────────────────────┐              ┌────────────────────────────┐
│    SERVICE LAYER       │              │      LOCAL AI ENGINE       │
│  ┌──────────────────┐  │              │  ┌──────────────────────┐  │
│  │  PlannerService  │  │              │  │   Ollama (Llama 3)   │  │
│  │  (Graph Algos)   │  │   HTTP       │  │   100% Local LLM     │  │
│  ├──────────────────┤  │◄────────────►│  └──────────────────────┘  │
│  │  OllamaService   │  │              │                            │
│  │  (Prompt Eng.)   │  │              └────────────────────────────┘
│  └──────────────────┘  │
└────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                 PostgreSQL 16 (Alpine)                        │  │
│  │   • Courses • Plans • History • User Profiles                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
degree_planner_agent/
├── backend/                    # FastAPI Application
│   ├── app/
│   │   ├── models/             # SQLAlchemy Database Models
│   │   ├── routers/            # API Endpoints (ai, plans, history, etc.)
│   │   ├── schemas/            # Pydantic Request/Response Schemas
│   │   ├── services/           # Business Logic
│   │   │   ├── planner_service.py   # Core scheduling algorithms
│   │   │   └── ollama_service.py    # LLM integration & prompt engineering
│   │   └── main.py             # FastAPI Entry Point
│   ├── alembic/                # Database Migrations
│   └── requirements.txt
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router Pages
│   │   │   ├── planner/        # Main planning interface
│   │   │   ├── advisor/        # Career advisor
│   │   │   └── history/        # Plan history
│   │   ├── components/         # Reusable UI Components
│   │   └── lib/                # API clients, utilities, stores
│   └── package.json
├── docker-compose.yml          # Container Orchestration
├── .env                        # Environment Variables
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1.  **Fork** the repository.
2.  **Create** a feature branch: `git checkout -b feature/your-feature`
3.  **Commit** your changes: `git commit -m 'Add amazing feature'`
4.  **Push** to the branch: `git push origin feature/your-feature`
5.  **Open** a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<p align="center">
  <strong>Developed with ❤️ by Akshat Awasthi</strong><br/>
  <em>Empowering students to take control of their academic journey.</em>
</p>