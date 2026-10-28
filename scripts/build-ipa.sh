#!/bin/bash
set -e
echo "=== Building AYXA Planner Pro iOS Archive (.ipa) ==="
cd "$(dirname "$0")/.."

# 1. Build web bundle & sync capacitor
npm run build
npx cap sync ios

# 2. Build iOS App
cd ios/App
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  build

# 3. Package into .ipa
mkdir -p build/Payload
cp -R build/Debug-iphoneos/App.app build/Payload/
cd build
zip -r -q ../../../AYXA-Planner-Pro.ipa Payload
rm -rf Payload

echo "=== SUCCESS: AYXA-Planner-Pro.ipa created at project root ==="
