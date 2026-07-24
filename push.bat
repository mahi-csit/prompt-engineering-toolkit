@echo off
cd /d "%~dp0"
echo === Staging changes ===
git add .
git commit -m "Deploy production build"
echo === Pushing to GitHub ===
git push origin main
echo Done.

