@echo off
rem Opens the posts folder in VS Code and publishes saved posts automatically.
cd /d "%~dp0"
title Blog yazma modu - kapatinca otomatik gonderme durur
start "" code "%~dp0" "%~dp0content\blog"
npm run izle
