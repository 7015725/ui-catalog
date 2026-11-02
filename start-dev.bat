@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 没有找到 Node.js，请先安装：https://nodejs.org  （选 LTS 版本）
  pause
  exit /b 1
)
node dev-server.mjs --open
pause
