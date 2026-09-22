<#
.SYNOPSIS
    Degree Planner Agent - All-in-One Runner Script for PowerShell
.DESCRIPTION
    Launches the entire project including Docker containers (Postgres & Redis),
    Ollama LLM server, FastAPI Backend, Next.js Frontend, and Dev Panel.
.EXAMPLE
    .\run.ps1
    .\run.ps1 -Mode docker
    .\run.ps1 -Mode stop
#>

param(
    [Parameter(Position=0)]
    [ValidateSet("1", "2", "3", "4", "dev", "docker", "stop", "migrate")]
    [string]$Mode = "1"
)

$RootPath = $PSScriptRoot

function Show-Header {
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "           DEGREE PLANNER AGENT - ALL-IN-ONE LAUNCHER               " -ForegroundColor Yellow
    Write-Host "=====================================================================" -ForegroundColor Cyan
}

Show-Header

if ($PSBoundParameters.Count -eq 0) {
    Write-Host ""
    Write-Host "Choose how you want to run the project:" -ForegroundColor Green
    Write-Host "  [1] Start Local Dev (Ollama + Docker DB/Redis + Backend + Frontend + Dev Panel) [Default]"
    Write-Host "  [2] Start Full Docker Stack (All services in Docker containers)"
    Write-Host "  [3] Stop All Docker Services (docker compose down)"
    Write-Host "  [4] Run Database Migrations"
    Write-Host ""
    $Choice = Read-Host "Enter choice [1-4] (Press ENTER for Default 1)"
    if ([string]::IsNullOrWhiteSpace($Choice)) {
        $Mode = "1"
    } else {
        $Mode = $Choice
    }
}

switch ($Mode) {
    { $_ -in "1", "dev" } {
        Write-Host "`n[1/5] Checking Docker & starting PostgreSQL and Redis..." -ForegroundColor Cyan
        try {
            $null = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Docker is running. Starting db and redis..." -ForegroundColor Green
                docker compose up -d db redis
            } else {
                Write-Host "[WARNING] Docker is not running. Backend will use local SQLite fallback." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[WARNING] Docker check failed. Backend will use local SQLite fallback." -ForegroundColor Yellow
        }

        Write-Host "`n[2/5] Checking Ollama AI Service..." -ForegroundColor Cyan
        $ollamaRunning = $false
        try {
            $res = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($res.StatusCode -eq 200) { $ollamaRunning = $true }
        } catch {}

        if ($ollamaRunning) {
            Write-Host "Ollama is running on http://127.0.0.1:11434." -ForegroundColor Green
        } else {
            Write-Host "Starting Ollama server with GPU optimizations (Flash Attention + Hot VRAM)..." -ForegroundColor Yellow
            Start-Process cmd.exe -ArgumentList '/k "set OLLAMA_FLASH_ATTENTION=1 && set OLLAMA_KEEP_ALIVE=60m && set OLLAMA_NUM_PARALLEL=1 && set OLLAMA_MAX_LOADED_MODELS=1 && ollama serve"'
            Start-Sleep -Seconds 3
        }

        Write-Host "`n[3/5] Starting FastAPI Backend (Port 8000)..." -ForegroundColor Cyan
        Start-Process cmd.exe -WorkingDirectory "$RootPath\backend" -ArgumentList '/k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"'

        Write-Host "`n[4/5] Starting Next.js Frontend (Port 3000)..." -ForegroundColor Cyan
        Start-Process cmd.exe -WorkingDirectory "$RootPath\frontend" -ArgumentList '/k "npm run dev"'

        Write-Host "`n[5/5] Starting Developer Panel (Port 3001)..." -ForegroundColor Cyan
        Start-Process cmd.exe -WorkingDirectory "$RootPath\developer-panel" -ArgumentList '/k "node server.js"'

        Write-Host "`n=====================================================================" -ForegroundColor Green
        Write-Host "All services launched in dedicated terminal windows!" -ForegroundColor Green
        Write-Host "  - Frontend:        http://localhost:3000" -ForegroundColor White
        Write-Host "  - Backend API:     http://localhost:8000" -ForegroundColor White
        Write-Host "  - API Docs:        http://localhost:8000/docs" -ForegroundColor White
        Write-Host "  - Developer Panel: http://localhost:3001" -ForegroundColor White
        Write-Host "=====================================================================" -ForegroundColor Green
        Write-Host "`nOpening browser in 4 seconds..." -ForegroundColor Cyan
        Start-Sleep -Seconds 4
        Start-Process "http://localhost:3000"

        while ($true) {
            Write-Host "`n=====================================================================" -ForegroundColor Green
            Write-Host "[MONITOR] All Degree Planner services are active." -ForegroundColor Yellow
            Write-Host "  [F] Re-open Frontend in Browser (http://localhost:3000)"
            Write-Host "  [A] Open Backend API Docs       (http://localhost:8000/docs)"
            Write-Host "  [P] Open Developer Panel        (http://localhost:3001)"
            Write-Host "  [S] Stop all services and containers"
            Write-Host "  [Q] Close this launcher window"
            Write-Host "=====================================================================" -ForegroundColor Green
            $act = Read-Host "Choose an option [F/A/P/S/Q]"
            if ($act -eq "F" -or $act -eq "f") { Start-Process "http://localhost:3000" }
            elseif ($act -eq "A" -or $act -eq "a") { Start-Process "http://localhost:8000/docs" }
            elseif ($act -eq "P" -or $act -eq "p") { Start-Process "http://localhost:3001" }
            elseif ($act -eq "S" -or $act -eq "s") { & "$RootPath\stop.bat"; break }
            elseif ($act -eq "Q" -or $act -eq "q") { break }
        }
    }

    { $_ -in "2", "docker" } {
        Write-Host "`nStarting Full Docker Stack..." -ForegroundColor Cyan
        docker compose up --build -d
        Write-Host "`nContainers started. Logs: docker compose logs -f" -ForegroundColor Green
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:3000"
    }

    { $_ -in "3", "stop" } {
        Write-Host "`nStopping Docker services..." -ForegroundColor Cyan
        docker compose down
        Write-Host "Docker services stopped." -ForegroundColor Green
    }

    { $_ -in "4", "migrate" } {
        Write-Host "`nStarting PostgreSQL container for migrations..." -ForegroundColor Cyan
        docker compose up -d db
        Start-Sleep -Seconds 5
        Write-Host "`nRunning Database Migrations..." -ForegroundColor Cyan
        Set-Location "$RootPath\backend"
        & "$RootPath\backend\venv\Scripts\python.exe" migrate_courses_data.py
        & "$RootPath\backend\venv\Scripts\python.exe" migrate_assessment.py
        & "$RootPath\backend\venv\Scripts\python.exe" migrate_add_user_id.py
        Set-Location $RootPath
        Write-Host "All migrations finished!" -ForegroundColor Green
    }
}
