@echo off
cd /d "%~dp0"
title Hospital Backend - FastAPI
echo Starting backend on http://127.0.0.1:8000
echo.
python -m uvicorn backend.main:app --reload --port 8000
pause
