@echo off
setlocal enabledelayedexpansion
title Degree Planner Agent Launcher

echo =====================================================================
echo                DEGREE PLANNER AGENT - ALL-IN-ONE LAUNCHER
echo =====================================================================
echo.
echo Choose how you want to run the project:
echo.
echo   [1] Start Local Dev (Ollama + Docker DB/Redis + Backend + Frontend + Dev Panel) [RECOMMENDED]
echo   [2] Start Full Docker Stack (All services in Docker containers via docker compose)
echo   [3] Stop All Services (Stop containers and free ports)
echo   [4] Run Database Migrations (migrate courses, assessment, user_id)
echo.

if "%~1"=="1" goto START_LOCAL
if "%~1"=="2" goto START_DOCKER
if "%~1"=="3" goto STOP_SERVICES
if "%~1"=="4" goto RUN_MIGRATIONS
if "%~1"=="dev" goto START_LOCAL

set "CHOICE=1"
set /p "CHOICE=Enter choice [1-4] (Press ENTER for Default 1): "

if "%CHOICE%"=="1" goto START_LOCAL
if "%CHOICE%"=="2" goto START_DOCKER
if "%CHOICE%"=="3" goto STOP_SERVICES
if "%CHOICE%"=="4" goto RUN_MIGRATIONS
goto START_LOCAL

:START_LOCAL
echo.
echo =====================================================================
echo [1/5] Checking Docker and starting PostgreSQL and Redis...
echo =====================================================================
docker info >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Docker is running. Starting db and redis containers...
    docker compose up -d db redis
) else (
    echo [WARNING] Docker is not running. Backend will fall back to local SQLite.
)

echo.
echo =====================================================================
echo [2/5] Checking Ollama AI Service...
echo =====================================================================
curl.exe -s --connect-timeout 2 --max-time 3 http://127.0.0.1:11434/api/tags >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Ollama is already running on http://127.0.0.1:11434.
) else (
    echo Starting Ollama server with GPU optimizations...
    set "OLLAMA_FLASH_ATTENTION=1"
    set "OLLAMA_KEEP_ALIVE=60m"
    set "OLLAMA_NUM_PARALLEL=1"
    set "OLLAMA_MAX_LOADED_MODELS=1"
    start "Ollama AI Server" cmd /k "ollama serve"
    ping 127.0.0.1 -n 4 >nul
)

echo.
echo =====================================================================
echo [3/5] Launching FastAPI Backend (Port 8000)...
echo =====================================================================
start "Degree Planner - Backend (Port 8000)" /D "%~dp0backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo =====================================================================
echo [4/5] Launching Next.js Frontend (Port 3000)...
echo =====================================================================
start "Degree Planner - Frontend (Port 3000)" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo =====================================================================
echo [5/5] Launching Developer Feature-Flags Panel (Port 3001)...
echo =====================================================================
start "Degree Planner - Dev Panel (Port 3001)" /D "%~dp0developer-panel" cmd /k "node server.js"

echo.
echo =====================================================================
echo [SUCCESS] All services have been launched in separate windows!
echo.
echo   - Frontend:        http://localhost:3000
echo   - Backend API:     http://localhost:8000
echo   - API Docs:        http://localhost:8000/docs
echo   - Developer Panel: http://localhost:3001
echo.
echo Opening browser to http://localhost:3000 in 4 seconds...
echo =====================================================================
ping 127.0.0.1 -n 5 >nul
start http://localhost:3000

:STATUS_LOOP
echo.
echo =====================================================================
echo [MONITOR] All Degree Planner services are active.
echo.
echo   [F] Re-open Frontend in Browser   (http://localhost:3000)
echo   [A] Open Backend API Docs         (http://localhost:8000/docs)
echo   [P] Open Developer Panel          (http://localhost:3001)
echo   [S] Stop all services and containers
echo   [Q] Close this launcher window (services keep running)
echo =====================================================================
set "ACTION="
set /p "ACTION=Choose an option [F/A/P/S/Q] (or close window): "
if /i "!ACTION!"=="F" start http://localhost:3000 & goto STATUS_LOOP
if /i "!ACTION!"=="A" start http://localhost:8000/docs & goto STATUS_LOOP
if /i "!ACTION!"=="P" start http://localhost:3001 & goto STATUS_LOOP
if /i "!ACTION!"=="S" goto STOP_SERVICES
if /i "!ACTION!"=="Q" exit /b 0
goto STATUS_LOOP

:START_DOCKER
echo.
echo =====================================================================
echo Starting Full Docker Compose Stack...
echo =====================================================================
docker compose up --build -d
echo.
echo Containers started!
echo Check logs with: docker compose logs -f
echo Opening frontend...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3000
echo.
pause
exit /b 0

:STOP_SERVICES
call "%~dp0stop.bat"
exit /b 0

:RUN_MIGRATIONS
echo.
echo =====================================================================
echo Checking PostgreSQL container for migrations...
echo =====================================================================
docker info >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Starting PostgreSQL database container...
    docker compose up -d db
    echo Waiting 5 seconds for PostgreSQL to accept connections...
    ping 127.0.0.1 -n 6 >nul
) else (
    echo [WARNING] Docker is not running. PostgreSQL must be running on localhost:5432 for these migration scripts.
)
echo.
echo =====================================================================
echo Running Database Migrations...
echo =====================================================================
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo Running migrate_courses_data.py...
python migrate_courses_data.py
echo Running migrate_assessment.py...
python migrate_assessment.py
echo Running migrate_add_user_id.py...
python migrate_add_user_id.py
echo.
echo All migrations executed.
pause
exit /b 0
