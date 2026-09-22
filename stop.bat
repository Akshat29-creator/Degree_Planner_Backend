@echo off
setlocal
title Stop Degree Planner Agent

echo =====================================================================
echo                STOPPING DEGREE PLANNER AGENT SERVICES
echo =====================================================================
echo.

echo [1/3] Stopping Docker containers...
docker compose down
echo Docker containers stopped.

echo.
echo [2/3] Terminating any running servers on ports 3000, 8000, and 3001...
for %%p in (3000 8000 3001) do (
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":%%p" ^| findstr "LISTENING"') do (
        echo Killing process ID %%a listening on port %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo [3/3] Closing any service windows...
taskkill /FI "WINDOWTITLE eq Degree Planner*" /F >nul 2>&1

echo.
echo =====================================================================
echo [SUCCESS] All Degree Planner services and containers have been stopped.
echo =====================================================================
echo.
pause
