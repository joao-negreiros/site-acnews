@echo off
rem Gera agora o post do Instagram mais relevante (imagem 4:5 + legenda) em posts-instagram\<data>\
rem Para gerar varios de uma vez: gerar-posts.bat 5
cd /d "%~dp0"
node node_modules\tsx\dist\cli.mjs scripts\gerar-posts.ts %1
echo.
echo Pronto. Os arquivos estao em: %~dp0posts-instagram
pause
