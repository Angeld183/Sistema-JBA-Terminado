@echo off
title Iniciar Proyecto - JBA
echo ====================================================
echo   Iniciando Backend (.NET) y Frontend (Angular)...
echo ====================================================

:: Iniciar el Backend en su propia ventana usando rutas relativas
echo Levantando el Backend (.NET API)...
start "Backend - .NET API" /d "%~dp0ApiJBA\ApiJBA" cmd /k dotnet run --urls "http://0.0.0.0:5188;https://0.0.0.0:7108"

:: Iniciar el Frontend en su propia ventana usando rutas relativas
echo Levantando el Frontend (Angular)...
start "Frontend - Angular" /d "%~dp0" cmd /k npm run start -- --host 0.0.0.0

echo ====================================================
echo Ambos procesos han sido iniciados en ventanas separadas.
echo Esta ventana se cerrara automaticamente en 5 segundos.
echo ====================================================
timeout /t 5
