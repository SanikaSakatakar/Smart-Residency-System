#!/bin/bash
set -e

echo "╔══════════════════════════════════════════╗"
echo "║     Smart Residency Management System    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install Java 21+: https://adoptium.net"
    exit 1
fi
JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '\d+' | head -1)
if [ "$JAVA_VER" -lt 17 ]; then
    echo "❌ Java 17+ required. Found: Java $JAVA_VER"
    exit 1
fi
echo "✅ Java $JAVA_VER found"

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Install Maven 3.8+: https://maven.apache.org"
    exit 1
fi
echo "✅ Maven found"

# AI Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo ""
    echo "⚠️  ANTHROPIC_API_KEY not set."
    echo "   AI features won't work without it."
    echo "   Set it: export ANTHROPIC_API_KEY=sk-ant-api03-..."
    echo ""
fi

# Build
echo ""
echo "📦 Building backend..."
cd backend
mvn package -DskipTests -q
echo "✅ Build complete"

# Run
echo ""
echo "🚀 Starting server on http://localhost:8081"
echo "   Press Ctrl+C to stop"
echo ""
java -jar target/smart-residency-0.0.1-SNAPSHOT.jar
