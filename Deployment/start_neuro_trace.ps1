Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   🧠 NEURO TRACE - System Startup" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Running system check..." -ForegroundColor Green
python system_check.py

Write-Host ""
Write-Host "🚀 Starting Neuro Trace API..." -ForegroundColor Green
Write-Host "   Access at: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python main.py