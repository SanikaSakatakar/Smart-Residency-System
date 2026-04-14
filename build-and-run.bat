@echo off
echo ==========================================
echo   Smart Residency Management System
echo ==========================================
echo.

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Install Java 21+
    pause
    exit /b 1
)
echo [OK] Java found

where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven not found. Install Maven 3.8+
    pause
    exit /b 1
)
echo [OK] Maven found

if "%ANTHROPIC_API_KEY%"=="" (
    echo.
    echo [WARN] ANTHROPIC_API_KEY not set. AI features disabled.
    echo        Set: set ANTHROPIC_API_KEY=sk-ant-api03-...
    echo.
)

echo.
echo Building backend...
cd backend
mvn package -DskipTests -q
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build complete

echo.
echo Starting server on http://localhost:8081
java -jar target\smart-residency-0.0.1-SNAPSHOT.jar
