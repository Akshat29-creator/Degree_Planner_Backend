# DegreePlanner Agent - System Design Document

---

**Version**: 2.0  
**Last Updated**: January 2026  
**Authors**: Engineering Team  
**Status**: Production  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Non-Goals](#3-goals-and-non-goals)
4. [High-Level Architecture (HLD)](#4-high-level-architecture-hld)
5. [Component Overview](#5-component-overview)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Low-Level Design (LLD)](#7-low-level-design-lld)
8. [API Design](#8-api-design)
9. [Database Design](#9-database-design)
10. [AI System Design](#10-ai-system-design)
11. [Security and Privacy Considerations](#11-security-and-privacy-considerations)
12. [Scalability and Extensibility](#12-scalability-and-extensibility)
13. [Failure Scenarios and Edge Cases](#13-failure-scenarios-and-edge-cases)
14. [Trade-offs and Design Decisions](#14-trade-offs-and-design-decisions)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Introduction

DegreePlanner Agent is a privacy-first, AI-powered academic planning platform designed to assist university students in optimizing their degree trajectory. The system combines deterministic validation algorithms with generative AI capabilities to provide intelligent course scheduling, career alignment analysis, and personalized study support.

The platform distinguishes itself through its commitment to local AI inference. All AI processing occurs on the user's infrastructure via Ollama, ensuring complete data sovereignty. No student data is transmitted to external AI providers during runtime.

### 1.1 System Scope

The platform encompasses five core functional domains:

- **Study Planner**: Time-based academic schedule generation with conflict detection
- **Revision Practice Engine**: AI-generated question banks with self-assessment capabilities
- **Academic Tutor**: Topic-specific explanations derived from user-provided materials
- **AI Study Buddy**: Behavioral support system for motivation and study habit optimization
- **Authentication System**: Secure user identity management with persistent profiles

### 1.2 Technology Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 | Server-rendered React application |
| Backend | FastAPI | Async Python REST API |
| Database | PostgreSQL | Relational data persistence |
| AI Runtime | Ollama | Local LLM inference |
| Model | llama3.1:8b | Primary reasoning model |

---

## 2. Problem Statement

University students face significant cognitive overhead when planning their academic journey. The challenges include:

1. **Prerequisite Complexity**: Course dependency graphs create non-obvious scheduling constraints
2. **Workload Imbalance**: Poorly distributed semester loads lead to burnout
3. **Career Misalignment**: Course selections often fail to map to career objectives
4. **Revision Inefficiency**: Students lack structured self-assessment mechanisms
5. **Privacy Concerns**: Cloud-based AI platforms require sharing sensitive academic data

Traditional academic advising is resource-constrained and episodic. Students require persistent, on-demand guidance that respects data privacy while providing intelligent recommendations.

### 2.1 Target Users

- Undergraduate and graduate students at 4-year institutions
- Self-directed learners managing complex degree requirements
- Students in technical disciplines with dense prerequisite chains

### 2.2 Key Constraints

- No external API dependencies for AI inference during runtime
- Sub-second response time for non-AI operations
- Complete data isolation between users
- Support for intermittent connectivity (local-first architecture)

---

## 3. Goals and Non-Goals

### 3.1 Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G1 | Provide valid degree plans that satisfy all prerequisites | 100% of generated plans pass topological validation |
| G2 | Reduce student planning time | Below 10 minutes to generate first complete plan |
| G3 | Enable self-paced revision testing | Below 30s question generation latency |
| G4 | Maintain complete data privacy | Zero external AI API calls during runtime |
| G5 | Support multiple authentication methods | Email/password plus OAuth providers |
| G6 | Persist user progress and test history | All sessions recoverable across devices |

### 3.2 Non-Goals

| ID | Non-Goal | Rationale |
|----|----------|-----------|
| NG1 | Integration with university SIS systems | Out of scope for initial release |
| NG2 | Real-time collaborative editing | Adds significant complexity |
| NG3 | Mobile native applications | Web-first approach for MVP |
| NG4 | Proctored examination capabilities | Security requirements exceed scope |
| NG5 | Multi-language support | English-only for initial release |

---

## 4. High-Level Architecture (HLD)

### 4.1 System Architecture Diagram

```
                                    +-----------------------+
                                    |     User Browser      |
                                    +-----------+-----------+
                                                |
                                         HTTPS (TLS 1.3)
                                                |
                                                v
+-------------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                      |
|  +---------------------------------------------------------------------------------+      |
|  |                           Next.js Frontend (React 18)                           |      |
|  |  +-------------+  +---------------+  +----------------+  +------------------+   |      |
|  |  | Auth Pages  |  | Dashboard     |  | Study Planner  |  | Revision Engine  |   |      |
|  |  +-------------+  +---------------+  +----------------+  +------------------+   |      |
|  +---------------------------------------------------------------------------------+      |
+-------------------------------------------------------------------------------------------+
                                                |
                                          REST API (JSON)
                                                |
                                                v
+-------------------------------------------------------------------------------------------+
|                                     APPLICATION LAYER                                      |
|  +---------------------------------------------------------------------------------+      |
|  |                           FastAPI Backend (Python 3.11)                         |      |
|  |  +----------+  +----------+  +----------+  +----------+  +----------+           |      |
|  |  |  Auth    |  | Planner  |  | Revision |  | Practice |  |   AI     |           |      |
|  |  |  Router  |  | Router   |  |  Router  |  |  Router  |  |  Router  |           |      |
|  |  +----------+  +----------+  +----------+  +----------+  +----------+           |      |
|  |                              |                                                   |      |
|  |                              v                                                   |      |
|  |  +-----------------------------------------------------------------------+      |      |
|  |  |                         Service Layer                                  |      |      |
|  |  |  +------------------+  +------------------+  +------------------+      |      |      |
|  |  |  | OllamaService    |  | SecurityService  |  | ValidationService|      |      |      |
|  |  |  +------------------+  +------------------+  +------------------+      |      |      |
|  |  +-----------------------------------------------------------------------+      |      |
|  +---------------------------------------------------------------------------------+      |
+-------------------------------------------------------------------------------------------+
                            |                                   |
                            v                                   v
+---------------------------+                   +---------------------------+
|     AI INFERENCE LAYER    |                   |     PERSISTENCE LAYER     |
|  +---------------------+  |                   |  +---------------------+  |
|  |    Ollama Server    |  |                   |  |    PostgreSQL 16    |  |
|  |  +---------------+  |  |                   |  |  +---------------+  |  |
|  |  | llama3.1:8b   |  |  |                   |  |  |    Users      |  |  |
|  |  +---------------+  |  |                   |  |  +---------------+  |  |
|  +---------------------+  |                   |  |  |    Plans      |  |  |
+---------------------------+                   |  |  +---------------+  |  |
                                                |  |  | TestResults   |  |  |
                                                |  |  +---------------+  |  |
                                                |  +---------------------+  |
                                                +---------------------------+
```

### 4.2 Layer Responsibilities

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| Presentation | User interface, client-side state, routing | Next.js, React, Framer Motion |
| Application | Request handling, business logic, orchestration | FastAPI, Pydantic |
| Service | AI inference, authentication, validation | OllamaService, SecurityUtils |
| Persistence | Data storage, query execution, migrations | PostgreSQL, SQLAlchemy |
| AI Inference | Local LLM execution, prompt processing | Ollama, llama3.1:8b |

### 4.3 Communication Patterns

```
Frontend <---> Backend:    REST/JSON over HTTPS
Backend  <---> Database:   SQLAlchemy Async Sessions
Backend  <---> Ollama:     HTTP POST to localhost:11434
```

---

## 5. Component Overview

### 5.1 Frontend Components

| Component | Path | Purpose |
|-----------|------|---------|
| AuthGuard | `/components/auth/` | Route protection, token validation |
| Navbar | `/components/layout/` | Navigation, user context display |
| PracticePanel | `/components/revision/` | Question generation and self-test UI |
| PlannerGraph | `/app/graph/` | Interactive prerequisite visualization |
| StudyPlanner | `/app/study/` | Time-based schedule interface |

### 5.2 Backend Routers

| Router | Prefix | Endpoints | Purpose |
|--------|--------|-----------|---------|
| auth | `/api/auth` | 4 | User registration, login, session management |
| planner | `/api/planner` | 3 | Degree plan CRUD operations |
| practice | `/api/practice` | 2 | Question generation, answer evaluation |
| revision | `/api/revision` | 3 | Document analysis, topic extraction |
| ai | `/api/ai` | 4 | Plan analysis, career advice, explanations |
| courses | `/api/courses` | 4 | Course catalog operations |
| history | `/api/history` | 3 | Plan history management |
| manual_entry | `/api/manual-entry` | 2 | Transcript parsing |

### 5.3 Service Layer

| Service | File | Methods | Purpose |
|---------|------|---------|---------|
| OllamaService | `ollama_service.py` | 12 | All AI inference operations |
| SecurityUtils | `security.py` | 6 | JWT handling, password hashing |

---

## 6. Data Flow Diagrams

### 6.1 User Registration Flow

```
User Action: Submit registration form
        |
        v
[Next.js Frontend]
        |
        | POST /api/auth/register
        | Body: {email, password}
        v
[FastAPI Backend - Auth Router]
        |
        | 1. Validate request (Pydantic)
        | 2. Check email uniqueness
        | 3. Hash password (bcrypt)
        v
[Database - Users Table]
        |
        | INSERT user record
        | INSERT empty profile
        v
[Auth Router]
        |
        | Return UserResponse
        v
[Frontend]
        |
        | Redirect to onboarding
        v
User sees: Onboarding wizard
```

### 6.2 User Login Flow

```
User Action: Submit login credentials
        |
        v
[Next.js Frontend]
        |
        | POST /api/auth/login
        | Body: {username, password} (OAuth2 form)
        v
[FastAPI Backend - Auth Router]
        |
        | 1. Query user by email
        | 2. Verify password hash
        | 3. Generate JWT token
        v
[Auth Router]
        |
        | Return {access_token, token_type}
        v
[Frontend - Auth Context]
        |
        | Store token in localStorage
        | Set authenticated state
        v
User sees: Dashboard redirect
```

### 6.3 Study Plan Generation Flow

```
User Action: Request AI plan analysis
        |
        v
[Planner Page]
        |
        | POST /api/ai/analyze
        | Body: {degree_plan, career_goal}
        | Headers: Authorization: Bearer <token>
        v
[FastAPI Backend - AI Router]
        |
        | 1. Validate JWT
        | 2. Extract user context
        v
[OllamaService.analyze_plan()]
        |
        | 1. Construct analysis prompt
        | 2. Include plan structure
        | 3. Add career alignment context
        v
[Ollama Server - localhost:11434]
        |
        | POST /api/generate
        | Model: llama3.1:8b
        | Options: {temperature: 0.4, num_predict: 4096}
        v
[OllamaService]
        |
        | 1. Parse JSON response
        | 2. Validate required fields
        | 3. Apply fallback defaults
        v
[AI Router]
        |
        | Return analysis object
        v
User sees: Plan insights, suggestions, career alignment
```

### 6.4 Revision Practice - Question Generation Flow

```
User Action: Click "Start Practice" on topic
        |
        v
[PracticePanel Component]
        |
        | POST /api/practice/generate
        | Body: {topic_name, topic_notes, difficulty, question_type, count, mode}
        v
[FastAPI Backend - Practice Router]
        |
        | 1. Validate request parameters
        | 2. Generate session_id (UUID)
        v
[OllamaService.generate_practice_questions()]
        |
        | 1. Build question generation prompt
        | 2. Specify difficulty and type constraints
        | 3. Include topic notes as context
        v
[Ollama Server]
        |
        | Generate questions with answers
        v
[Practice Router]
        |
        | IF mode == "self-test":
        |   - Store answers in _answer_store[session_id]
        |   - Strip answers from response
        | ELSE:
        |   - Return full questions with answers
        v
User sees: Question cards (with/without answers based on mode)
```

### 6.5 Self-Test Evaluation Flow

```
User Action: Submit answers for evaluation
        |
        v
[PracticePanel Component]
        |
        | POST /api/practice/evaluate
        | Body: {session_id, topic_name, question_type, answers}
        v
[FastAPI Backend - Practice Router]
        |
        | 1. Retrieve stored answers by session_id
        | 2. If not found, return 404
        v
[OllamaService.evaluate_answers()]
        |
        | 1. Build evaluation prompt with:
        |    - User answers
        |    - Correct answers (from server store)
        |    - Scoring rubric
        | 2. Request semantic evaluation
        v
[Ollama Server]
        |
        | Evaluate each answer
        | Generate feedback and scores
        v
[Practice Router]
        |
        | 1. Parse evaluation result
        | 2. Delete answers from _answer_store
        | 3. Return EvaluateResponse
        v
User sees: Score breakdown, per-question feedback, next steps
```

### 6.6 AI Study Buddy Interaction Flow

```
User Action: Send message to Study Buddy
        |
        v
[Buddy Page]
        |
        | POST /api/ai/buddy
        | Body: {message, conversation_history}
        v
[FastAPI Backend - AI Router]
        |
        | 1. Validate message content
        | 2. Append to conversation context
        v
[OllamaService.study_buddy_chat()]
        |
        | 1. Build conversational prompt
        | 2. Include behavioral context
        | 3. Apply safety guardrails
        v
[Ollama Server]
        |
        | Generate supportive response
        v
[AI Router]
        |
        | Return buddy response
        v
User sees: Motivational message with study tips
```

### 6.7 Profile Update Flow

```
User Action: Update profile settings
        |
        v
[Profile Page]
        |
        | PUT /api/auth/profile
        | Body: {name, university, degree_major, goals}
        | Headers: Authorization: Bearer <token>
        v
[FastAPI Backend - Auth Router]
        |
        | 1. Validate JWT, extract user_id
        | 2. Query existing profile
        v
[Database - Profiles Table]
        |
        | UPDATE profile fields
        | SET completed_onboarding = true
        v
[Auth Router]
        |
        | Return updated ProfileResponse
        v
User sees: Success confirmation
```

---

## 7. Low-Level Design (LLD)

### 7.1 Request-Response Lifecycle

```
HTTP Request
     |
     v
[Uvicorn ASGI Server]
     |
     v
[FastAPI Application]
     |
     +---> [CORS Middleware] ---> Allow/Block based on origin
     |
     +---> [Router Matching] ---> Match path to handler
     |
     v
[Endpoint Handler]
     |
     +---> [Dependency Injection]
     |         |
     |         +---> get_db() ---> AsyncSession
     |         +---> get_current_user() ---> User object
     |
     +---> [Pydantic Validation] ---> Request body parsing
     |
     +---> [Business Logic] ---> Service layer calls
     |
     +---> [Response Model] ---> Serialize to JSON
     |
     v
HTTP Response
```

### 7.2 Practice Router Module Breakdown

```
practice.py
├── Pydantic Models
│   ├── Question              # Single question with optional answer
│   ├── GenerateQuestionsRequest   # Topic, notes, difficulty, type, count, mode
│   ├── GenerateQuestionsResponse  # Session ID, questions list
│   ├── UserAnswer            # Question ID + user response
│   ├── EvaluateRequest       # Session ID + answers list
│   ├── QuestionFeedback      # Per-question evaluation result
│   └── EvaluateResponse      # Total score, feedback list, next steps
│
├── In-Memory Store
│   └── _answer_store: Dict[session_id, Dict[question_id, answer]]
│
└── Endpoints
    ├── POST /generate
    │   ├── Validate mode (practice/self-test)
    │   ├── Call OllamaService.generate_practice_questions()
    │   ├── Assign UUIDs to questions
    │   ├── If self-test: store answers, strip from response
    │   └── Return GenerateQuestionsResponse
    │
    └── POST /evaluate
        ├── Retrieve answers from _answer_store
        ├── If missing: 404 error
        ├── Call OllamaService.evaluate_answers()
        ├── Delete stored answers (cleanup)
        └── Return EvaluateResponse
```

### 7.3 OllamaService Module Breakdown

```
ollama_service.py
├── Configuration
│   ├── base_url: str (OLLAMA_BASE_URL)
│   ├── model: str (OLLAMA_MODEL)
│   └── timeout: float (180.0s)
│
├── Core Method
│   └── _call_ollama(prompt, system_instruction)
│       ├── Build request payload
│       ├── Set options (temperature, num_ctx, num_predict)
│       ├── Set keep_alive: 0 (unload after response)
│       ├── POST to /api/generate
│       └── Return response text
│
├── Utility Method
│   └── _extract_json(text)
│       ├── Regex pattern matching for JSON
│       ├── Multiple extraction attempts
│       └── Return parsed dict or None
│
├── AI Features (12 methods)
│   ├── analyze_plan()          # Comprehensive degree plan analysis
│   ├── get_career_advice()     # Career-aligned recommendations
│   ├── analyze_burnout()       # Semester difficulty assessment
│   ├── generate_study_plan()   # Time-based study scheduling
│   ├── explain_topic()         # Topic explanation from notes
│   ├── analyze_document()      # PDF/PPT content extraction
│   ├── generate_revision_strategy()  # Personalized revision plan
│   ├── generate_practice_questions() # Question generation
│   ├── evaluate_answers()      # Semantic answer evaluation
│   ├── study_buddy_chat()      # Motivational conversation
│   ├── validate_plan()         # Prerequisite validation
│   └── suggest_courses()       # Course recommendations
│
└── Singleton Instance
    └── ollama_service = OllamaService()
```

### 7.4 Mode-Locking Implementation

The Practice Router implements strict mode separation to prevent answer leakage:

```python
# Question Generation
if request.mode == "self-test":
    # SECURITY: Answers stored server-side only
    _answer_store[session_id] = answer_map
    
    # SECURITY: Strip answers from client response
    for question in questions:
        question.correct_answer = None
        question.explanation = None

# Answer Evaluation
stored_answers = _answer_store.get(request.session_id, {})
if not stored_answers:
    raise HTTPException(404, "Session not found")  # Prevents guessing

# Cleanup after evaluation
if request.session_id in _answer_store:
    del _answer_store[request.session_id]  # One-time use
```

This design ensures:
1. Clients in self-test mode NEVER receive correct answers
2. Answers are only accessible server-side during evaluation
3. Sessions are invalidated after single evaluation
4. Session IDs are UUIDs (non-guessable)

### 7.5 Authentication Flow Implementation

```
Auth Router Dependencies
├── get_db() -> AsyncSession
│   └── Yields database session, commits on success, rollbacks on error
│
├── oauth2_scheme -> OAuth2PasswordBearer
│   └── Extracts token from Authorization header
│
└── get_current_user(token, db) -> User
    ├── Decode JWT (decode_access_token)
    ├── Extract email from payload
    ├── Query user from database
    ├── If not found: 401 Unauthorized
    └── Return User object

Security Utilities
├── get_password_hash(password) -> str
│   └── bcrypt with default rounds
│
├── verify_password(plain, hashed) -> bool
│   └── bcrypt verification
│
├── create_access_token(subject, expires_delta) -> str
│   ├── Build payload with subject and expiry
│   └── Sign with SECRET_KEY using HS256
│
└── decode_access_token(token) -> dict
    ├── Verify signature
    ├── Check expiration
    └── Return payload or raise
```

---

## 8. API Design

### 8.1 Authentication Endpoints

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| POST | `/api/auth/register` | `{email, password}` | UserResponse | None |
| POST | `/api/auth/login` | OAuth2 Form (username, password) | Token | None |
| POST | `/api/auth/social-login` | `{email, provider, provider_id, name}` | Token | None |
| GET | `/api/auth/me` | - | UserResponse | Required |

### 8.2 Planner Endpoints

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| GET | `/api/planner/plans` | - | List[Plan] | Required |
| POST | `/api/planner/plans` | PlanCreate | Plan | Required |
| GET | `/api/planner/plans/{id}` | - | PlanDetail | Required |
| DELETE | `/api/planner/plans/{id}` | - | 204 | Required |

### 8.3 Practice Endpoints

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| POST | `/api/practice/generate` | GenerateQuestionsRequest | GenerateQuestionsResponse | None* |
| POST | `/api/practice/evaluate` | EvaluateRequest | EvaluateResponse | None* |

*Authentication recommended but not enforced for MVP

### 8.4 AI Endpoints

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| POST | `/api/ai/analyze` | `{degree_plan, career_goal}` | AnalysisResult | Required |
| POST | `/api/ai/advisor` | `{message, context}` | AdvisorResponse | Required |
| POST | `/api/ai/explain-topic` | `{topic, notes}` | ExplanationResponse | Required |
| POST | `/api/ai/buddy` | `{message, history}` | BuddyResponse | Required |

### 8.5 Revision Endpoints

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| POST | `/api/revision/analyze-document` | FormData (file) | DocumentAnalysis | Required |
| POST | `/api/revision/strategy` | `{topics, time_available}` | RevisionStrategy | Required |
| POST | `/api/revision/explain` | `{topic_name, notes}` | TopicExplanation | Required |

### 8.6 Request/Response Examples

**Generate Questions Request**
```json
{
  "topic_name": "Binary Search Trees",
  "topic_notes": "A BST is a data structure where each node has at most two children...",
  "difficulty": "Medium",
  "question_type": "mcq",
  "count": 5,
  "mode": "self-test"
}
```

**Generate Questions Response (Self-Test Mode)**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "topic_name": "Binary Search Trees",
  "question_type": "mcq",
  "questions": [
    {
      "question_id": "q1-uuid",
      "text": "What is the time complexity of search in a balanced BST?",
      "question_type": "mcq",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "correct_answer": null,
      "explanation": null
    }
  ]
}
```

**Evaluate Request**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "topic_name": "Binary Search Trees",
  "question_type": "mcq",
  "answers": [
    {"question_id": "q1-uuid", "user_answer": "O(log n)"}
  ]
}
```

**Evaluate Response**
```json
{
  "total_score": 4,
  "max_score": 5,
  "percentage": 80.0,
  "performance_level": "Strong",
  "question_feedback": [
    {
      "question_id": "q1-uuid",
      "question_text": "What is the time complexity...",
      "user_answer": "O(log n)",
      "correct_answer": "O(log n)",
      "is_correct": true,
      "score": 1.0,
      "max_score": 1.0,
      "feedback": "Correct! In a balanced BST, each comparison eliminates half the remaining nodes."
    }
  ],
  "next_steps": ["Try harder questions on tree balancing", "Review AVL rotation operations"]
}
```

---

## 9. Database Design

### 9.1 Entity Relationship Diagram

```
+------------------+       1:1       +------------------+
|      users       |<--------------->|     profiles     |
+------------------+                 +------------------+
| id (PK)          |                 | id (PK)          |
| email (UNIQUE)   |                 | user_id (FK)     |
| hashed_password  |                 | name             |
| provider         |                 | university       |
| provider_id      |                 | degree_major     |
| created_at       |                 | academic_year    |
+------------------+                 | goals (JSON)     |
        |                            | preferences (JSON)|
        |                            | completed_onboarding |
        |                            +------------------+
        |
        | 1:N
        v
+------------------+
|   test_results   |
+------------------+
| id (UUID PK)     |
| user_id (FK)     |
| topic_name       |
| question_type    |
| mode             |
| total_score      |
| max_score        |
| percentage       |
| performance_level|
| questions_json   |
| created_at       |
+------------------+
```

### 9.2 Table Definitions

**users**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Login identifier |
| hashed_password | VARCHAR(255) | NULLABLE | bcrypt hash (null for social auth) |
| provider | VARCHAR(50) | DEFAULT 'local' | Authentication source |
| provider_id | VARCHAR(255) | NULLABLE | External provider user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

**profiles**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| user_id | INTEGER | FK(users.id), UNIQUE, ON DELETE CASCADE | Owner reference |
| name | VARCHAR(255) | NULLABLE | Display name |
| university | VARCHAR(255) | NULLABLE | Institution |
| degree_major | VARCHAR(255) | NULLABLE | Academic program |
| academic_year | VARCHAR(50) | NULLABLE | Year of study |
| goals | JSON | DEFAULT [] | Career objectives |
| preferences | JSON | DEFAULT {} | UI/planning preferences |
| completed_onboarding | BOOLEAN | DEFAULT FALSE | Onboarding completion flag |

**test_results**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | UUID | FK(users.id), NULLABLE | Owner (null for anonymous) |
| topic_name | VARCHAR | NOT NULL | Subject of test |
| question_type | VARCHAR | NOT NULL | mcq/short/long |
| mode | VARCHAR | NOT NULL | practice/self-test |
| total_score | FLOAT | DEFAULT 0 | Points earned |
| max_score | FLOAT | DEFAULT 0 | Maximum possible points |
| percentage | FLOAT | DEFAULT 0 | Score as percentage |
| performance_level | VARCHAR | DEFAULT 'Average' | Weak/Average/Strong |
| questions_json | JSON | NULLABLE | Full question and answer data |
| created_at | TIMESTAMP | DEFAULT NOW() | Test completion time |

### 9.3 Design Rationale

**Why TestResult Persistence?**

1. **Learning Analytics**: Enables tracking performance over time
2. **Progress Visualization**: Users can review historical attempts
3. **Spaced Repetition**: Future enhancement for smart review scheduling
4. **Accountability**: Provides evidence of study activity

**Why JSON Fields?**

1. **Flexibility**: Goals and preferences evolve without schema migration
2. **Atomicity**: Complete question sets stored as single unit
3. **Query Efficiency**: Avoid complex joins for hierarchical data

**Why UUID for TestResults?**

1. **Stateless Generation**: No database round-trip for ID creation
2. **Security**: Non-enumerable (prevents ID guessing attacks)
3. **Future Sharding**: Enables horizontal partitioning

---

## 10. AI System Design

### 10.1 Architecture Philosophy

The AI layer is designed around three core principles:

1. **Feature Isolation**: Each feature has dedicated prompt templates and output schemas
2. **Strict Scoping**: AI responses are constrained to provided context only
3. **Graceful Degradation**: Fallback responses exist for all AI failures

### 10.2 Why Feature-Separated AI Responsibilities

```
INCORRECT: Single "super-prompt" for all features
  - Prompt confusion across domains
  - Inconsistent output formats
  - Harder to debug and tune

CORRECT: Feature-specific prompts
  +------------------+     +------------------+     +------------------+
  | Plan Analysis    |     | Question Gen     |     | Answer Eval      |
  | Prompt Template  |     | Prompt Template  |     | Prompt Template  |
  +------------------+     +------------------+     +------------------+
          |                        |                        |
          v                        v                        v
  +--------------------------------------------------------------+
  |                    OllamaService._call_ollama()              |
  +--------------------------------------------------------------+
                                   |
                                   v
                          [llama3.1:8b Model]
```

**Benefits:**
- Each prompt is optimized for its specific task
- Output parsing is tailored per feature
- Failures are isolated (question gen failure does not affect plan analysis)
- Easier A/B testing of prompt variations

### 10.3 Prompt Structure (Conceptual)

All prompts follow a consistent structure:

```
[ROLE DEFINITION]
You are an {expert type} with {specific expertise}.

[TASK DESCRIPTION]
Your task is to {specific action}.

[CONTEXT]
{User-provided data - notes, plans, answers}

[CONSTRAINTS]
- ONLY use information from the provided context
- Do NOT invent facts not present in the input
- {Feature-specific constraints}

[OUTPUT FORMAT]
Respond with ONLY valid JSON in this format:
{schema definition}
```

### 10.4 Hallucination Prevention

| Strategy | Implementation |
|----------|----------------|
| Context Binding | All prompts explicitly state "ONLY use provided material" |
| Input Truncation | Large inputs are truncated to 4000 characters |
| Schema Enforcement | Strict JSON output format with required fields |
| Fallback Defaults | If AI output fails parsing, use domain-appropriate defaults |
| Temperature Control | Low temperature (0.3-0.4) reduces randomness |
| Explicit Prohibitions | Prompts state "Do NOT invent facts not present" |

### 10.5 Evaluation System Design

The evaluation system uses AI for semantic grading:

```
Input: {question_id, user_answer, correct_answer}

Evaluation Prompt:
  - Define scoring rubric by question type
  - MCQ: Binary (correct/incorrect)
  - Short Answer: 0/1/2 (wrong/partial/correct)
  - Long Answer: 0-5 scale with rubric

AI Processing:
  - Compare semantic meaning, not exact string match
  - Generate constructive feedback per question
  - Assign performance_level based on percentage thresholds

Output: Structured feedback with scores and next_steps
```

### 10.6 Why llama3.1:8b is Sufficient

| Requirement | llama3.1:8b Capability |
|-------------|------------------------|
| JSON Output | Native instruction following |
| Context Window | 8192 tokens (adequate for single topic) |
| Reasoning | Sufficient for educational Q&A |
| Latency | Sub-30s on RTX 4060 8GB |
| Memory | Fits in 8GB VRAM quantized |
| Accuracy | Acceptable for formative assessment |

**Why Not Larger Models?**
- 13B+ models exceed typical consumer GPU memory
- Marginal accuracy improvement not justified for educational use
- Latency increases significantly

### 10.7 Why Antigravity is NOT Used in Runtime

Antigravity (external AI service) was used exclusively for:
- Generating this System Design document
- Development-time code assistance

It is explicitly excluded from runtime because:
1. **Privacy Commitment**: No student data leaves the local environment
2. **Latency**: External API calls add network overhead
3. **Cost**: Per-token pricing is prohibitive for high-volume use
4. **Availability**: Local inference works offline

---

## 11. Security and Privacy Considerations

### 11.1 Authentication Security

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with default work factor |
| Token Format | JWT with HS256 signing |
| Token Expiry | Configurable (default 24 hours) |
| Token Storage | Client-side localStorage (frontend) |
| Transport Security | HTTPS enforced in production |

### 11.2 Authorization Model

```
Authorization Check Flow:
  1. Extract Bearer token from Authorization header
  2. Decode and verify JWT signature
  3. Check token expiration
  4. Query user by email from payload
  5. If any step fails: 401 Unauthorized

Resource Isolation:
  - All database queries filter by user_id
  - User A cannot access User B's plans or test results
  - No admin endpoints (single-tenant design)
```

### 11.3 Data Privacy Architecture

```
+---------------------------+
|    Student Browser        |
+---------------------------+
            |
            | HTTPS (encrypted)
            |
            v
+---------------------------+
|    Backend Server         |
|    (runs locally)         |
+---------------------------+
            |
            | HTTP (localhost only)
            |
            v
+---------------------------+
|    Ollama Server          |
|    (localhost:11434)      |
+---------------------------+
            |
            | (no external calls)
            |
            v
+---------------------------+
|    LLM Model              |
|    (local weights)        |
+---------------------------+
```

**Privacy Guarantees:**
1. No transcript data transmitted externally
2. AI context is ephemeral (discarded after response)
3. Model runs entirely on local hardware
4. No telemetry or analytics collection

### 11.4 Answer Leak Prevention

The self-test mode implements defense-in-depth:

| Layer | Protection |
|-------|------------|
| API Response | Answers stripped before serialization |
| Client State | Frontend never receives correct answers |
| Session Management | Answers stored server-side by UUID |
| Session Cleanup | Answers deleted after single evaluation |
| Session ID | UUIDv4 (cryptographically random) |

---

## 12. Scalability and Extensibility

### 12.1 Current Bottlenecks

| Component | Bottleneck | Impact |
|-----------|------------|--------|
| AI Inference | Single Ollama instance | Sequential request processing |
| Answer Store | In-memory dict | Lost on server restart |
| Database | Single PostgreSQL | Adequate for single-node |

### 12.2 Scaling Strategies

**Horizontal Scaling (Web Tier)**
```
                    +------------------+
                    |   Load Balancer  |
                    +------------------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
    +---------+      +---------+      +---------+
    | FastAPI |      | FastAPI |      | FastAPI |
    |   #1    |      |   #2    |      |   #3    |
    +---------+      +---------+      +---------+
          |                |                |
          +----------------+----------------+
                           |
                    +------------------+
                    |   PostgreSQL     |
                    +------------------+
```

**AI Layer Scaling**
```
Option A: Request Queue
  - Redis queue for AI requests
  - Worker pool for Ollama instances
  - Async response delivery

Option B: Multiple Ollama Instances
  - One Ollama per GPU
  - Load balancer distributes by availability
```

### 12.3 Extensibility Points

| Extension Point | Mechanism |
|-----------------|-----------|
| New Question Types | Add handler in OllamaService.generate_practice_questions() |
| New AI Features | Add method to OllamaService, create router endpoint |
| External Integrations | Add new router under /api/integrations/ |
| Authentication Providers | Add handler in social_login endpoint |
| Database Migrations | Alembic migration scripts |

---

## 13. Failure Scenarios and Edge Cases

### 13.1 AI Inference Failures

| Failure Mode | Detection | Recovery |
|--------------|-----------|----------|
| Ollama not running | ConnectError | Return user-friendly error message |
| Model timeout | TimeoutException (180s) | Return partial results or retry prompt |
| Invalid JSON output | JSONDecodeError | Apply fallback defaults |
| Empty response | Null check | Return predefined fallback |

**Fallback Example (Plan Analysis)**
```python
if not parsed:
    return {
        "explanation": "Analysis unavailable. Please ensure Ollama is running.",
        "strengths": ["Balanced course load"],
        "suggestions": ["Consider adding electives"],
        "career_alignment_score": 70
    }
```

### 13.2 Authentication Edge Cases

| Scenario | Handling |
|----------|----------|
| Expired token | 401 response, frontend redirects to login |
| Invalid token signature | 401 response |
| Deleted user tries to access | 401 response (user query fails) |
| Concurrent profile updates | Database transaction isolation |

### 13.3 Practice Session Edge Cases

| Scenario | Handling |
|----------|----------|
| Evaluate with unknown session_id | 404 "Session not found" |
| Re-evaluate same session | 404 (answers deleted after first eval) |
| Empty answers submitted | 400 "No answers provided" |
| Server restart during session | Sessions lost (in-memory store) |

### 13.4 Database Failures

| Scenario | Handling |
|----------|----------|
| Connection pool exhausted | 500 error, client retries |
| Constraint violation | 400 with descriptive message |
| Transaction timeout | Rollback, retry guidance |

---

## 14. Trade-offs and Design Decisions

### 14.1 Local AI vs Cloud AI

| Factor | Local (Chosen) | Cloud |
|--------|----------------|-------|
| Privacy | Complete data sovereignty | Data transmitted externally |
| Latency | Consistent (~30s) | Variable (network dependent) |
| Cost | One-time GPU investment | Per-token ongoing cost |
| Quality | Good (8B model) | Better (larger models available) |
| Offline Support | Yes | No |
| Maintenance | User manages Ollama | Managed service |

**Decision: Local AI** - Privacy is a non-negotiable requirement for academic data.

### 14.2 In-Memory Answer Store vs Redis

| Factor | In-Memory (Chosen) | Redis |
|--------|---------------------|-------|
| Latency | Fastest | Fast |
| Complexity | None | Requires Redis deployment |
| Persistence | Lost on restart | Survives restart |
| Scalability | Single-node only | Multi-node ready |

**Decision: In-Memory** - Acceptable for MVP; self-test sessions are short-lived.

### 14.3 Monolithic Backend vs Microservices

| Factor | Monolith (Chosen) | Microservices |
|--------|-------------------|---------------|
| Development Speed | Fast | Slow (more boilerplate) |
| Deployment | Single container | Multiple containers |
| Debugging | Simple stack traces | Distributed tracing needed |
| Scaling | Vertical only | Horizontal per service |

**Decision: Monolith** - Team size and scope do not justify microservice complexity.

### 14.4 SQLAlchemy ORM vs Raw SQL

| Factor | ORM (Chosen) | Raw SQL |
|--------|--------------|---------|
| Type Safety | Strong | None |
| Migration Support | Alembic integration | Manual scripts |
| Query Flexibility | Limited for complex queries | Full SQL power |
| Performance | Slight overhead | Optimal |

**Decision: ORM** - Developer productivity outweighs marginal performance cost.

### 14.5 JWT vs Session-Based Auth

| Factor | JWT (Chosen) | Sessions |
|--------|--------------|----------|
| Statelessness | Yes | No (requires session store) |
| Cross-Origin Support | Native | Requires cookies/CSRF handling |
| Token Revocation | Difficult | Easy |
| Payload Size | Larger (contains claims) | Smaller (session ID only) |

**Decision: JWT** - Statelessness simplifies architecture; revocation handled by short expiry.

---

## 15. Future Enhancements

### 15.1 Short-Term (1-3 Months)

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Redis Answer Store | Persist self-test sessions across restarts | High |
| Test Result Dashboard | Visualize performance trends | High |
| Bulk Question Export | Download practice questions as PDF | Medium |
| Question Bank Sharing | Share custom question sets | Medium |

### 15.2 Medium-Term (3-6 Months)

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Real-Time Collaboration | Multiple users editing same plan | High |
| SIS Integration | Sync with university student systems | High |
| Spaced Repetition | Smart revision scheduling | Medium |
| Study Groups | Peer-based learning features | Medium |

### 15.3 Long-Term (6-12 Months)

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Mobile Applications | React Native iOS/Android apps | High |
| Multi-Language Support | UI and AI content localization | Medium |
| LMS Integrations | Canvas, Blackboard, Moodle connectors | Medium |
| Advanced Analytics | ML-based learning pattern detection | Low |

### 15.4 Architecture Evolution Path

```
Phase 1 (Current): Monolith + Local AI
         |
         v
Phase 2: Redis for session state
         |
         v
Phase 3: API Gateway + Load Balancer
         |
         v
Phase 4: Extract AI Service (separate deployment)
         |
         v
Phase 5: Event-Driven Architecture (async processing)
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| HLD | High-Level Design - architectural overview without implementation details |
| LLD | Low-Level Design - detailed internal module breakdown |
| Mode-Locking | Security pattern preventing unauthorized feature access |
| Hallucination | AI generating false or unsupported information |
| Keep-Alive | Ollama setting controlling model memory retention |
| ASGI | Asynchronous Server Gateway Interface |

---

## Appendix B: Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama server endpoint |
| OLLAMA_MODEL | llama3.1:8b | Model identifier |
| DATABASE_URL | postgresql://... | PostgreSQL connection string |
| SECRET_KEY | (generated) | JWT signing key |
| ACCESS_TOKEN_EXPIRE_MINUTES | 1440 | Token validity period |

---

*End of Document*
