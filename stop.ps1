<#
.SYNOPSIS
    Degree Planner Agent - Stop All Services Script
.DESCRIPTION
    Stops all Docker containers, terminates processes on ports 3000, 8000, 3001,
    and closes all spawned terminal windows.
.EXAMPLE
    .\stop.ps1
#>

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "                STOPPING DEGREE PLANNER AGENT SERVICES              " -ForegroundColor Red
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping Docker containers..." -ForegroundColor Yellow
try {
    docker compose down
    Write-Host "Docker containers stopped." -ForegroundColor Green
} catch {
    Write-Host "Docker containers not running or error stopping." -ForegroundColor DarkGray
}

Write-Host "`n[2/3] Checking and freeing ports 3000, 8000, 3001..." -ForegroundColor Yellow
$ports = @(3000, 8000, 3001)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($procId in $pids) {
                if ($procId -gt 4) { # Avoid system processes
                    Write-Host "Terminating PID $procId on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}
}

Write-Host "`n[3/3] Closing any spawned Degree Planner terminal windows..." -ForegroundColor Yellow
Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Degree Planner*" } | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "[SUCCESS] All services and containers have been stopped!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
