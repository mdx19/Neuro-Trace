@echo off
echo.
echo ======================================
echo    🧠 NEURO TRACE - System Startup
echo ======================================
echo.

echo 🔍 Running system check...
python system_check.py

echo.
echo 🚀 Starting Neuro Trace API...
echo    Access at: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py