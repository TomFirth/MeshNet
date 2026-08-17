#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_APP_DIR="$PROJECT_ROOT/apps/mobile"
ANDROID_DIR="$MOBILE_APP_DIR/android"
APP_JSON="$MOBILE_APP_DIR/app.json"

echo "🚀 Starting MeshNet Android Production Build..."

if [ ! -d "$MOBILE_APP_DIR" ]; then
    echo "❌ Error: Could not find apps/mobile directory."
    exit 1
fi

if [ ! -d "$ANDROID_DIR" ]; then
    echo "❌ Error: Could not find Android project:"
    echo "$ANDROID_DIR"
    exit 1
fi

if [ -f "$APP_JSON" ]; then
    VERSION=$(grep '"version":' "$APP_JSON" | head -1 | awk -F '"' '{print $4}')
    echo "📦 Detected version: $VERSION"
else
    VERSION="unknown"
    echo "⚠️ Warning: Could not find app.json to detect version."
fi

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 node_modules not found. Running npm install..."
    cd "$PROJECT_ROOT"
    npm install
fi

echo "🔍 Checking assets..."

for f in \
    "$MOBILE_APP_DIR/assets/icon.png" \
    "$MOBILE_APP_DIR/assets/splash.png" \
    "$MOBILE_APP_DIR/assets/adaptive-icon.png"
do
    if [ ! -s "$f" ]; then
        echo "❌ Asset is empty or missing:"
        echo "$f"
        exit 1
    fi
done

echo "🏗️ Building App Bundle (Release)..."

cd "$ANDROID_DIR"
./gradlew bundleRelease

SOURCE_AAB="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"

if [ ! -f "$SOURCE_AAB" ]; then
    echo "❌ Build completed but AAB was not found:"
    echo "$SOURCE_AAB"
    exit 1
fi

DEST_DIR="$PROJECT_ROOT/builds"
DEST_AAB="$DEST_DIR/meshnet-$VERSION.aab"

mkdir -p "$DEST_DIR"
cp "$SOURCE_AAB" "$DEST_AAB"

echo "✅ Build successful!"
echo "📍 Bundle location:"
echo "$DEST_AAB"