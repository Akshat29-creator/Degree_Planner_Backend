<p align="center">
  <img src="frontend/public/logo.png" alt="Degree Planner Logo" width="100" height="100" />
</p>

<h1 align="center">Degree Planner Agent</h1>

<p align="center">
  <strong>The Intelligent Academic Trajectory Optimizer</strong><br/>
  Powered by Local LLM Inference
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/AI-Self%20Tuned%20Model-blueviolet?style=for-the-badge" alt="AI" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-brightgreen?style=for-the-badge" alt="Privacy" />
  <img src="https://img.shields.io/badge/Voice_AI-VAPI-orange?style=for-the-badge" alt="VAPI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql" alt="Database" />
  <img src="https://img.shields.io/badge/Runtime-Ollama-white?style=flat-square" alt="Runtime" />
  <img src="https://img.shields.io/badge/Model-llama3.1%3A8b-purple?style=flat-square" alt="Model" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <a href="#3-key-features">Features</a> •
  <a href="#7-tech-stack">Tech Stack</a> •
  <a href="#9-installation-and-setup">Getting Started</a> •
  <a href="#4-application-architecture">Architecture</a> •
  <a href="#5-ai-system-overview">AI System</a> •
  <a href="#13-api-overview">API</a>
</p>

---

An AI-powered academic planning platform that runs entirely locally. Built for students who want intelligent degree planning without sending their academic data to external services.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why This Project Exists](#2-why-this-project-exists)
3. [Key Features](#3-key-features)
4. [Application Architecture](#4-application-architecture)
5. [AI System Overview](#5-ai-system-overview)
6. [Feature Walkthrough](#6-feature-walkthrough)
7. [Tech Stack](#7-tech-stack)
8. [Project Structure](#8-project-structure)
9. [Installation and Setup](#9-installation-and-setup)
10. [Running the Application](#10-running-the-application)
11. [Environment Configuration](#11-environment-configuration)
12. [Database and Docker Setup](#12-database-and-docker-setup)
13. [API Overview](#13-api-overview)
14. [AI Models Used](#14-ai-models-used)
15. [Security and Privacy](#15-security-and-privacy)
16. [Testing and Verification](#16-testing-and-verification)
17. [Limitations](#17-limitations)
18. [Future Improvements](#18-future-improvements)
19. [Contribution Guidelines](#19-contribution-guidelines)
20. [License and Disclaimer](#20-license-and-disclaimer)

---

## 1. Project Overview

Degree Planner Agent is a full-stack web application that helps university students plan their academic trajectory. It combines deterministic scheduling algorithms with local AI inference to provide course recommendations, career alignment analysis, and self-assessment tools.

**Core Capabilities:**
- Generate valid semester-by-semester degree plans
- Analyze plans for career alignment and workload balance
- Practice and self-test on study materials with AI-generated questions
- Receive AI-powered explanations of academic topics
- Track test performance over time

**Key Constraint:** All AI processing happens locally via Ollama. No student data is transmitted to external AI providers.

---

## 2. Why This Project Exists

University degree planning presents several challenges:

1. **Prerequisite Complexity** - Course dependencies form directed graphs that are difficult to navigate manually
2. **Workload Distribution** - Poor semester balance leads to burnout or delayed graduation
3. **Career Alignment** - Students often realize too late that their course selection does not match career objectives
4. **Privacy Concerns** - Cloud-based AI tools require sharing sensitive academic information
5. **Passive Learning** - Traditional study methods lack active recall and self-assessment

This project addresses these problems with:
- Graph algorithms for prerequisite validation
- AI analysis for career and workload insights
- Local LLM inference for complete data privacy
- A built-in practice and self-test engine

---

## 3. Key Features

### Study Planner
- Time-based academic schedule generation
- Prerequisite validation using topological sorting
- Workload balancing across semesters
- Exam-aware planning with difficulty estimates

### Revision Practice and Self-Test Engine
- AI-generated questions from user-provided study materials
- Three question types: Multiple Choice, Short Answer, Long Answer
- Two modes: Practice (answers shown) and Self-Test (answers hidden)
- AI-powered semantic evaluation of submitted answers
- Per-question feedback with scores and improvement suggestions
- Persistent test history for progress tracking

### Academic Tutor
- Topic explanations generated from user notes
- Document analysis for PDFs and presentations
- Revision strategy generation

### AI Study Buddy
- Conversational interface for study motivation
- Behavioral support and stress management suggestions
- Context-aware responses based on user progress

### AI Interview Coach (NEW)
- AI-powered mock interview practice with voice interaction
- Technical, behavioral, and mixed interview types
- Customizable questions by role, level, and tech stack
- Real-time AI interviewer using VAPI voice agents
- Instant feedback and performance scoring
- Interview history tracking and session management
- Question editing and customization before sessions

### Authentication and Profile System
- Email/password registration and login
- OAuth support (Google, GitHub)
- Onboarding wizard for profile setup
- Persistent user preferences and goals

---

## 4. Application Architecture

```
+------------------+
|   Web Browser    |
+--------+---------+
         |
         | HTTPS / REST
         v
+------------------+     +------------------+
|   Next.js        |     |   PostgreSQL     |
|   Frontend       |     |   Database       |
+--------+---------+     +--------+---------+
         |                        ^
         | REST API               | SQL
         v                        |
+------------------+              |
|   FastAPI        +--------------+
|   Backend        |
+--------+---------+
         |
         | HTTP (localhost)
         v
+------------------+
|   Ollama         |
|   (llama3.1:8b)  |
+------------------+
```

**Layer Responsibilities:**

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 | User interface, client routing, state management |
| Backend | FastAPI | REST API, business logic, request validation |
| Database | PostgreSQL | User data, plans, test results |
| AI Inference | Ollama | Local LLM execution |

**Communication:**
- Frontend to Backend: REST/JSON over HTTPS
- Backend to Database: SQLAlchemy async sessions
- Backend to Ollama: HTTP POST to localhost:11434

---

## 5. AI System Overview

### Why AI is Split by Feature

Each feature has dedicated prompt templates and output schemas. This design:
- Optimizes prompts for specific tasks
- Enables tailored output parsing per feature
- Isolates failures (question generation failure does not affect plan analysis)
- Allows independent tuning and testing

### Why llama3.1:8b is Sufficient

| Requirement | llama3.1:8b Capability |
|-------------|------------------------|
| JSON Output | Native instruction following |
| Context Window | 8192 tokens |
| Reasoning | Adequate for educational Q&A |
| Latency | Sub-30s on RTX 4060 8GB |
| Memory | Fits in 8GB VRAM (quantized) |

Larger models provide marginal accuracy improvements but require hardware most students do not have.

### Why AI Runs Locally

1. **Privacy** - Academic transcripts and study materials never leave the user's machine
2. **Offline Support** - Functions without internet connectivity
3. **Cost** - No per-token API charges
4. **Predictability** - Consistent latency without network variables

### How Hallucinations are Minimized

- All prompts include explicit instructions to use only provided context
- Large inputs are truncated to prevent context confusion
- Low temperature (0.3-0.4) reduces randomness
- Strict JSON output schemas constrain responses
- Fallback defaults are returned when AI output fails parsing

### How Evaluation Works

The evaluation system uses AI for semantic grading:
1. User answers and correct answers are sent to the LLM
2. The model compares meaning, not exact strings
3. Scores are assigned based on question type (MCQ: binary, Short: 0-2, Long: 0-5)
4. Constructive feedback is generated for each question

### Why Antigravity is NOT Part of Runtime

Antigravity (external AI service) was used only for generating project documentation (this README and System Design). It is explicitly excluded from runtime to maintain the privacy guarantee.

---

## 6. Feature Walkthrough

### Study Planner

**What it does:** Generates a semester-by-semester course schedule that respects prerequisites and balances workload.

**User interaction:**
1. Enter degree type, specialization, and current academic year
2. Upload or generate course catalog
3. Mark completed courses
4. Click "Generate Plan"
5. Review and adjust the output

**AI involvement:** Optional AI analysis provides career alignment scores, salary projections, and skill gap identification.

**What it does NOT do:** Does not connect to university systems or automatically enroll in courses.

---

### Revision Practice Engine

**What it does:** Generates practice questions from study materials and evaluates user answers.

**User interaction:**
1. Upload study document (PDF/PPT) or paste notes
2. Select a topic from extracted content
3. Click "Practice" on the topic
4. Choose mode (Practice or Self-Test), question type, and count
5. Answer questions
6. (Self-Test only) Submit for AI evaluation

**AI involvement:**
- Question generation uses topic notes as context
- Evaluation compares user answers semantically against correct answers

**Security enforcement:**
- In Self-Test mode, correct answers are NEVER sent to the client
- Answers are stored server-side and deleted after evaluation
- Session IDs are UUIDs (non-guessable)

**What it does NOT do:**
- Does not create proctored exams
- Does not integrate with learning management systems
- Questions are based only on provided materials (no external knowledge)

---

### Academic Tutor

**What it does:** Explains topics based on user-provided study materials.

**User interaction:**
1. Upload a document or paste notes
2. Click on a topic to request explanation
3. Review AI-generated explanation

**AI involvement:** Generates explanations constrained to the content of the provided materials.

**What it does NOT do:** Does not provide information beyond what is in the uploaded content.

---

### AI Study Buddy

**What it does:** Provides motivational support and study habit suggestions through conversation.

**User interaction:**
1. Navigate to the Buddy tab
2. Type a message (e.g., "I'm stressed about exams")
3. Receive a supportive response with practical suggestions

**AI involvement:** Conversational responses with behavioral and motivational framing.

**What it does NOT do:**
- Not a mental health professional
- Does not provide medical or psychological advice
- Does not access external resources

---

### AI Interview Coach

**What it does:** Provides AI-powered mock interview practice with real-time voice interaction and instant feedback.

**User interaction:**
1. Navigate to the Interview tab
2. Click "Start New Session"
3. Configure interview settings (role, level, type, tech stack)
4. Set number of questions (3-10)
5. Review and customize AI-generated questions
6. Start voice interview session with AI interviewer
7. Answer questions verbally in real-time
8. Receive instant AI-powered feedback and scoring

**AI involvement:**
- Question generation based on role, level, and tech stack
- Real-time voice conversation via VAPI agents
- Performance evaluation and constructive feedback
- Scoring based on technical accuracy and communication

**What it does NOT do:**
- Does not replace real interview practice with humans
- Does not guarantee job placement
- Questions are AI-generated, not from actual companies

---

### Profile and Authentication

**What it does:** Manages user identity, preferences, and academic profile.

**User interaction:**
1. Register with email/password or OAuth
2. Complete onboarding (degree, goals, preferences)
3. Update profile settings as needed

**AI involvement:** None directly. Profile data is used as context for other AI features.

---

## 7. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 10.x | Animation library |
| Lucide React | - | Icon components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.100+ | Async REST API framework |
| Python | 3.11 | Runtime |
| SQLAlchemy | 2.x | Async ORM |
| Pydantic | 2.x | Data validation |
| httpx | 0.24+ | Async HTTP client for Ollama |
| bcrypt | - | Password hashing |
| PyJWT | - | Token handling |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Relational database |
| Docker | Container runtime |
| Docker Compose | Multi-container orchestration |
| Ollama | Local LLM inference server |

---

## 8. Project Structure

```
degree_planner_agent/
├── backend/
│   ├── app/
│   │   ├── models/           # SQLAlchemy models
│   │   │   ├── user.py       # User and Profile
│   │   │   ├── plan.py       # Degree plans
│   │   │   └── test_result.py # Test history
│   │   ├── routers/          # API endpoints
│   │   │   ├── auth.py       # Registration, login
│   │   │   ├── planner.py    # Plan CRUD
│   │   │   ├── practice.py   # Question generation, evaluation
│   │   │   ├── revision.py   # Document analysis
│   │   │   └── ai.py         # Plan analysis, advisor
│   │   ├── schemas/          # Pydantic models
│   │   ├── services/
│   │   │   └── ollama_service.py  # All AI interactions
│   │   ├── utils/
│   │   │   └── security.py   # JWT, password hashing
│   │   ├── database.py       # DB connection
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   │   ├── dashboard/
│   │   │   ├── planner/
│   │   │   ├── revision/
│   │   │   ├── advisor/
│   │   │   ├── buddy/
│   │   │   ├── interview/      # AI Interview Coach
│   │   │   │   ├── page.tsx    # Interview dashboard
│   │   │   │   ├── [id]/       # Dynamic interview session
│   │   │   │   └── generate/   # Question generation
│   │   │   ├── api/            # API routes
│   │   │   │   └── vapi/       # VAPI integration
│   │   │   └── profile/
│   │   ├── components/       # Reusable UI
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   ├── revision/     # PracticePanel
│   │   │   ├── interview/    # Interview components
│   │   │   │   ├── Agent.tsx         # Voice agent
│   │   │   │   ├── InterviewCard.tsx # Session cards
│   │   │   │   └── DisplayTechIcons.tsx
│   │   │   └── ui/           # Design system
│   │   ├── context/          # Auth context
│   │   └── lib/              # API client, utilities
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 9. Installation and Setup

### Prerequisites

| Requirement | Version | Installation |
|-------------|---------|--------------|
| Node.js | 18+ | https://nodejs.org/ |
| Python | 3.11+ | https://python.org/ |
| Docker | Latest | https://docker.com/ |
| Ollama | Latest | https://ollama.com/ |

### Step 1: Install Ollama

**Windows:**
Download and run the installer from https://ollama.com/download

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Download the AI Model

```bash
ollama pull llama3.1:8b
```

This downloads approximately 4.7GB. The model requires 8GB VRAM for optimal performance.

### Step 3: Start Ollama Server

```bash
ollama serve
```

Leave this running in a terminal. The server listens on `localhost:11434`.

### Step 4: Clone the Repository

```bash
git clone https://github.com/Akshat29-creator/Degree_Planner_Backend.git
cd degree_planner_agent
```

### Step 5: Start PostgreSQL

```bash
docker-compose up -d db
```

This starts a PostgreSQL container on port 5432.

### Step 6: Setup Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

### Step 7: Setup Frontend

```bash
cd frontend
npm install
```

---

## 10. Running the Application

### Terminal 1: Ollama (if not already running)

```bash
ollama serve
```

### Terminal 2: Backend

```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

API documentation: http://localhost:8000/docs

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 11. Environment Configuration

### Backend (.env in backend/)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/degree_planner
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

### Frontend (.env.local in frontend/)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 12. Database and Docker Setup

### Docker Compose Configuration

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: degree_planner
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts (email, password hash, provider) |
| profiles | Academic profile (university, major, goals) |
| test_results | Practice and self-test history |

### Running Migrations

Tables are auto-created on backend startup via SQLAlchemy's `create_all()`.

---

## 13. API Overview

### Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/register | POST | Create account |
| /api/auth/login | POST | Obtain JWT token |
| /api/auth/me | GET | Get current user |

### Practice and Self-Test

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/practice/generate | POST | Generate questions |
| /api/practice/evaluate | POST | Evaluate answers |

### AI Features

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/ai/analyze | POST | Analyze degree plan |
| /api/ai/advisor | POST | Career advice |
| /api/ai/explain-topic | POST | Topic explanation |
| /api/ai/buddy | POST | Study buddy chat |

### Revision

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/revision/analyze-document | POST | Extract topics from PDF |
| /api/revision/strategy | POST | Generate revision plan |

### Interview (NEW)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/vapi/generate | POST | Generate interview questions |
| /api/interview/create | POST | Create interview session |
| /api/interview/feedback | POST | Generate AI feedback |
| /api/interview/user/:id | GET | Get user's interviews |
| /api/interview/:id | GET | Get interview details |

Full API documentation available at `/docs` when backend is running.

---

## 14. AI Models Used

### Runtime Model

| Model | llama3.1:8b |
|-------|-------------|
| Parameters | 8 billion |
| Quantization | Q4_0 |
| VRAM Required | ~6-8 GB |
| Context Window | 8192 tokens |
| Use Cases | All runtime AI features |

### Model Configuration

```python
{
    "temperature": 0.4,
    "top_k": 40,
    "top_p": 0.95,
    "num_ctx": 8192,
    "num_predict": 4096,
    "keep_alive": 0  # Unload after response
}
```

The `keep_alive: 0` setting ensures the model is unloaded from GPU memory after each response, freeing resources when idle.

### Documentation Generation

This README and the System Design document were generated using Antigravity (external AI). Antigravity is not used in runtime.

---

## 15. Security and Privacy

### Authentication

- Passwords hashed with bcrypt
- JWTs signed with HS256
- Tokens expire after 24 hours by default
- OAuth support for Google and GitHub

### Data Privacy

- All AI inference happens locally via Ollama
- No academic data transmitted to external services
- Database runs in local Docker container
- User data is isolated by user_id in all queries

### Self-Test Answer Protection

1. In Self-Test mode, correct answers are stored server-side only
2. The client never receives correct answers before evaluation
3. Session IDs are UUIDs (cryptographically random)
4. Answers are deleted from memory after single evaluation

---

## 16. Testing and Verification

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Manual Verification

1. Register a new account at `/register`
2. Complete onboarding flow
3. Navigate to Revision tab
4. Upload a study document
5. Click "Practice" on a topic
6. Select "Self-Test" mode
7. Verify answers are not visible before submission
8. Submit answers and verify evaluation feedback

---

## 17. Limitations

### AI Limitations

- Questions are based only on provided materials; no external knowledge
- Long documents are truncated to fit context window
- Evaluation is semantic but not authoritative
- Response quality depends on input clarity

### Technical Limitations

- Self-test sessions are lost on server restart (in-memory store)
- Single Ollama instance limits concurrent AI requests
- No real-time collaboration
- No mobile native apps

### Scope Limitations

- Does not integrate with university systems
- Does not provide proctored examinations
- Not a replacement for professional academic advising
- Not a mental health service

---

## 18. Future Improvements

### Short-Term

- Redis for self-test session persistence
- Test result analytics dashboard
- Question export to PDF
- Improved mobile responsiveness

### Medium-Term

- Real-time collaborative planning
- University SIS integrations
- Spaced repetition for revision
- Study group features

### Long-Term

- Mobile applications (React Native)
- Multi-language support
- LMS integrations (Canvas, Moodle)
- Learning pattern analytics

---

## 19. Contribution Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pytest` (backend) and `npm test` (frontend)
5. Commit with descriptive messages
6. Push and open a Pull Request

### Code Standards

- Python: Follow PEP 8, use type hints
- TypeScript: Enable strict mode, use explicit types
- Commits: Use conventional commit format

### Pull Request Process

1. Ensure tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address feedback

---

## 20. License and Disclaimer

### License

This project is licensed under the MIT License. See LICENSE file for details.

### Disclaimer

This software is provided for educational purposes. It is not a substitute for professional academic advising. The AI-generated content should be verified independently. The developers are not responsible for academic decisions made based on this software.

### AI Usage Disclosure

- Runtime AI features use llama3.1:8b via Ollama (local inference)
- Documentation was generated with Antigravity (external AI, not used in runtime)
- No academic data is sent to external AI services during normal operation

---

**Developed by Akshat Awasthi**

For questions or issues, please open a GitHub issue.