@echo off
echo Killing processes on port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a

echo Killing processes on port 8080 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a
echo Done.
