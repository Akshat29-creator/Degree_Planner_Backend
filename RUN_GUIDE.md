# Degree Planner Agent - Quick Run Guide

This project can be started using the all-in-one launcher script or manually.

---

## ⚡ 1-Click Launch (Easiest)

You can run the all-in-one launcher:

### Option A: Windows Batch (File Explorer or Terminal)
Double-click [run.bat](file:///c:/Users/aksha/Downloads/degree_planner_agent/run.bat) or run:
```powershell
.\run.bat
```

### Option B: PowerShell
Run [run.ps1](file:///c:/Users/aksha/Downloads/degree_planner_agent/run.ps1):
```powershell
.\run.ps1
```

Both scripts automatically:
1. Start PostgreSQL and Redis via Docker (falls back to local SQLite if Docker isn't running).
2. Check and start the Ollama AI server (`ollama serve`).
3. Launch the FastAPI backend at `http://localhost:8000`.
4. Launch the Next.js frontend at `http://localhost:3000`.
5. Launch the Developer Feature Flags Panel at `http://localhost:3001`.
6. Open your web browser to `http://localhost:3000`.

---

## 🛑 1-Click Stop (Stop Everything)

To stop all containers, free the ports (3000, 8000, 3001), and close all project windows:

- **Batch**: Double-click [stop.bat](file:///c:/Users/aksha/Downloads/degree_planner_agent/stop.bat) or run `.\stop.bat`
- **PowerShell**: Run [stop.ps1](file:///c:/Users/aksha/Downloads/degree_planner_agent/stop.ps1) (`.\stop.ps1`)

---

## 🛠️ Manual Terminal Commands

If you prefer starting each service manually in separate terminals:

### 1. Prerequisites (Ollama AI)
```powershell
ollama pull qwen3:8b-q4_K_M
ollama pull nomic-embed-text
ollama serve
```

### 2. Database & Cache
```powershell
docker compose up -d db redis
```

### 3. FastAPI Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Endpoint: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 4. Next.js Frontend
```powershell
cd frontend
npm run dev
```
- Web UI: `http://localhost:3000`

### 5. Developer Panel (Optional)
```powershell
cd developer-panel
node server.js
```
- Flags Controller: `http://localhost:3001`

---

## 🐳 Full Docker Setup (Alternative)

To run the entire system inside Docker containers:
```powershell
docker compose up --build -d
docker compose logs -f
```
To stop:
```powershell
docker compose down
```

---

## 📂 Useful Database Migrations
Run these from inside `backend/` with the virtual environment activated:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python migrate_courses_data.py
python migrate_assessment.py
python migrate_add_user_id.py
```
