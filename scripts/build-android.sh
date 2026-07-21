#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting MeshNet Android Production Build..."

# 1. Determine paths
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_APP_DIR="$PROJECT_ROOT/apps/mobile"

# 2. Find expo binary
EXPO_BIN="$PROJECT_ROOT/node_modules/.bin/expo"
if [ ! -f "$EXPO_BIN" ]; then
    EXPO_BIN="$MOBILE_APP_DIR/node_modules/.bin/expo"
fi

# Fallback to npx but with fixed version if local not found
# (though npm install should have been run)
if [ ! -f "$EXPO_BIN" ]; then
    echo "⚠️ Local expo binary not found. Trying npx expo@51..."
    EXPO_CMD="npx expo@51"
else
    EXPO_CMD="$EXPO_BIN"
fi

# 3. Navigate to the mobile app directory
cd "$MOBILE_APP_DIR"

# 4. Prebuild native directories
echo "🛠️ Prebuilding native Android project..."
$EXPO_CMD prebuild --platform android --no-install

# 5. Patch build.gradle to fix Expo 51 + Gradle compatibility and NDK issues
echo "🩹 Applying native configuration patches..."

GRADLE_FILE="android/build.gradle"
NDK_VERSION="26.1.10909125"

# Programmatic patch using python to ensure build stability on Expo 51
cat <<EOF > patch.py
import sys
import re
import os

path = "$GRADLE_FILE"
if not os.path.exists(path):
    print(f"Error: {path} not found")
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

# Replace classpath with stable version for Expo 51
content = re.sub(r"classpath\('com\.android\.tools\.build:gradle'\)", "classpath('com.android.tools.build:gradle:8.1.1')", content)

# Update target to 35 but keep compile at 34 to avoid Expo 51 source incompatibilities
# Google Play requires targetSdkVersion 35, but compileSdkVersion can stay at 34.
content = re.sub(r"compileSdkVersion = Integer\.parseInt\(findProperty\('android\.compileSdkVersion'\) \?: '34'\)", "compileSdkVersion = Integer.parseInt(findProperty('android.compileSdkVersion') ?: '34')", content)
content = re.sub(r"targetSdkVersion = Integer\.parseInt\(findProperty\('android\.targetSdkVersion'\) \?: '34'\)", "targetSdkVersion = Integer.parseInt(findProperty('android.targetSdkVersion') ?: '35')", content)

# Update Kotlin version
content = re.sub(r"kotlinVersion = findProperty\('android\.kotlinVersion'\) \?: '1\.9\.23'", "kotlinVersion = findProperty('android.kotlinVersion') ?: '1.9.24'", content)

# Inject NDK configuration to ensure all subprojects use the correct NDK
patch = """
    if (project.state.executed) {
        if (project.hasProperty('android')) {
            project.android {
                ndkVersion = "$NDK_VERSION"
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
            if (project.hasProperty('tasks')) {
                project.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
                    kotlinOptions { jvmTarget = "17" }
                }
            }
        }
    } else {
        project.afterEvaluate {
            if (project.hasProperty('android')) {
                project.android {
                    ndkVersion = "$NDK_VERSION"
                    compileOptions {
                        sourceCompatibility JavaVersion.VERSION_17
                        targetCompatibility JavaVersion.VERSION_17
                    }
                }
                project.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
                    kotlinOptions { jvmTarget = "17" }
                }
            }
        }
    }
"""

if "project.state.executed" not in content:
    content = content.replace("maven { url 'https://www.jitpack.io' }", "maven { url 'https://www.jitpack.io' }\\n    }\\n" + patch)

with open(path, 'w') as f:
    f.write(content)
EOF

python3 patch.py
rm patch.py

# 6. Navigate to the generated android folder
cd android

# 7. Clean and Build the Release App Bundle (.aab)
echo "🏗️ Building Release AAB (App Bundle)..."
./gradlew bundleRelease

# 8. Locate the output
OUTPUT_PATH="app/build/outputs/bundle/release/app-release.aab"

if [ -f "\$OUTPUT_PATH" ]; then
    echo "✅ Success! Play Store bundle created at:"
    echo "\$(pwd)/\$OUTPUT_PATH"
else
    echo "❌ Build failed. Check the logs above."
    exit 1
fi
