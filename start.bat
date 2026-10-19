@echo off
cd /d "%~dp0"
echo.
echo === Step 1: Purono file clean kora hocche ===
if exist src\middleware.ts del /q src\middleware.ts
for %%D in (src\app\sign-in src\app\sign-up src\app\about src\components\layout .next) do (
  if exist %%D rmdir /s /q %%D
)
echo.
echo === Step 2: Package install hocche ===
call npm install
echo.
echo === Step 3: Server chalu hocche ===
echo Browser e terminal e deya link ta (localhost) khulun
echo.
call npm run dev
pause
