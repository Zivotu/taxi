@echo off
cd /d C:\taxi
git add .
git commit -m "Auto commit"
git pull origin main --no-edit
git push
pause
