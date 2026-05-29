@echo off
title Starting Aditi Assistant
echo Starting Aditi Assistant...

echo Starting MongoDB...
net start MongoDB

echo Starting Ollama...
start "Ollama" cmd /k "ollama serve"

timeout /t 5 /nobreak

echo Starting Backend...
start "Aditi Backend" cmd /k "cd /d %~dp0aiBackend && npm run dev"

timeout /t 3 /nobreak

echo Starting Frontend...
start "Aditi Frontend" cmd /k "cd /d %~dp0aiFrontend && npm run dev"

timeout /t 8 /nobreak

echo Opening browser...
start http://localhost:5173

pause