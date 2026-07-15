@echo off
title Diagnostico de Red - Sistema JBA
color 0A
echo ============================================================
echo   DIAGNOSTICO DE RED - Sistema JBA
echo ============================================================
echo.

echo [1/4] Verificando si el Backend esta escuchando en el puerto 5188...
echo -------------------------------------------------------------------
netstat -an | findstr "5188"
echo.

echo [2/4] Verificando si el Frontend esta escuchando en el puerto 4200...
echo -------------------------------------------------------------------
netstat -an | findstr "4200"
echo.

echo [3/4] Mostrando la IP de esta computadora...
echo -------------------------------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo    IP encontrada: %%a
echo.

echo [4/4] Verificando reglas del Firewall para puertos 5188 y 4200...
echo -------------------------------------------------------------------
netsh advfirewall firewall show rule name=all dir=in | findstr /c:"5188" /c:"4200" /c:"Sistema JBA"
echo.

echo ============================================================
echo   DIAGNOSTICO COMPLETADO
echo   Copia todo el texto de esta ventana y compartelo.
echo ============================================================
pause
