# AYXA Planner Pro — macOS & iOS Build Guide (دليل بناء التطبيق على ماك)

This guide provides step-by-step instructions for extracting, installing dependencies, building, and running **AYXA Planner Pro** on macOS for **iOS (iPhone / iPad)** using Xcode and Capacitor.

---

## 1. Prerequisites on macOS

Before you start, ensure your Mac has the following tools installed:

1. **macOS:** macOS Sonoma (14.x) or macOS Sequoia (15.x) recommended.
2. **Xcode:** Download and install Xcode 15 or 16 from the Mac App Store.
3. **Xcode Command Line Tools:** Run in Terminal:
   ```bash
   xcode-select --install
   ```
4. **Node.js:** Node.js v20+ or v22 LTS:
   ```bash
   # Using Homebrew:
   brew install node
   # Or verify existing installation:
   node -v
   npm -v
   ```
5. **CocoaPods (Optional / Recommended for legacy plugins):**
   ```bash
   sudo gem install cocoapods
   # Or via Homebrew:
   brew install cocoapods
   ```

---

## 2. Quick Start Steps

### Step 1: Unzip and Navigate to Project
Extract the zip file to your preferred folder (e.g., Desktop or `~/Projects`):
```bash
cd ~/Desktop
unzip AYXA_Planner_Pro_macOS_Build.zip -d ProPlanner
cd ProPlanner
```

### Step 2: Install Node Dependencies
Install the exact dependencies required by the application:
```bash
npm install
```

### Step 3: Verify Integrity & Type Check
Verify that the codebase has 0 compiler errors and passes all automated tests:
```bash
# 1. Type check with strict TypeScript compiler (should exit with 0 errors):
npx tsc --noEmit

# 2. Run all unit & integration test suites (177/177 passing):
npm test
```

### Step 4: Build Web Production Assets & Sync to Capacitor
Build the production web bundle and synchronize clean assets into the native iOS project:
```bash
npm run build
```
*Note: This command runs Vite build + Nitro SSR + `prepare-capacitor-dist.mjs`, which automatically synchronizes the bundled assets to `ios/App/App/public` and updates `capacitor.config.json`.*

Alternatively, you can also run the Capacitor sync command directly:
```bash
npx cap sync ios
```

---

## 3. Running & Building in Xcode

### Step 5: Open the Project in Xcode
You can open Xcode directly from Terminal:
```bash
npx cap open ios
```
*Or manually:* Double-click `ios/App/App.xcodeproj` in Finder.

### Step 6: Configure Code Signing & Bundle ID
1. In the Xcode left navigator, select the top-level **App** project.
2. Select the **App** target.
3. Click the **Signing & Capabilities** tab.
4. Check **Automatically manage signing**.
5. Under **Team**, select your Apple Developer Account / Personal Team.
6. Verify or adjust the **Bundle Identifier** (default: `com.ayxa.planner` or your registered ID).

### Step 7: Run on iOS Simulator
1. In the Xcode top toolbar, click the device selector and choose any Simulator (e.g., **iPhone 16 Pro** or **iPhone 15**).
2. Click the **Play (Run)** button or press `Cmd + R`.
3. The simulator will boot, install AYXA Planner Pro, and launch the application.

### Step 8: Run on a Physical iPhone
1. Connect your iPhone to your Mac via USB cable or ensure both are on the same Wi-Fi network.
2. Unlock your iPhone and tap **Trust This Computer** if prompted.
3. In Xcode, select your connected iPhone from the top device target list.
4. Click **Run** (`Cmd + R`).
5. *First-time run on device:* On your iPhone, go to:
   **Settings > General > VPN & Device Management**, tap your developer certificate, and tap **Trust**.
6. Launch AYXA Planner Pro on your iPhone.

---

## 4. Archiving & Creating `.ipa` for TestFlight / App Store

When you are ready to create a release build for distribution:

1. In Xcode, select **Product > Destination > Any iOS Device (arm64)**.
2. In the menu bar, select **Product > Archive**.
3. Xcode will build the project. Once complete, the **Organizer** window will automatically appear with your archive.
4. Click **Distribute App** in the right panel.
5. Select **App Store Connect** (or **TestFlight & App Store**).
6. Follow the on-screen prompts to upload directly to App Store Connect, or select **Export** to save an `.ipa` file locally on your Mac.

---

## 5. Live Development & Debugging

If you want to edit code on Mac and see changes live on your iOS device/simulator:

1. Start the local development server:
   ```bash
   npm run dev
   ```
2. In `capacitor.config.json`, you can optionally set `server.url` to your Mac's local IP address (e.g., `http://192.168.1.50:8081`) for live reload over local Wi-Fi.
3. In Safari on your Mac, enable **Develop menu** (`Safari > Settings > Advanced > Show features for web developers`). You can inspect the running web view, view logs, and inspect DOM elements directly on your iPhone or simulator.

---

## 6. Common Issues & Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Signing for 'App' requires a development team"** | No Apple ID selected in Xcode. | Go to `Signing & Capabilities` tab in Xcode, and select your Apple Developer Account under `Team`. |
| **"Command Line Tools not configured"** | Xcode locations not set. | Open `Xcode > Settings > Locations`, and ensure the **Command Line Tools** dropdown has your Xcode version selected. |
| **"Could not resolve Swift Package Manager (SPM)"** | Cached package dependencies mismatch. | In Xcode, select `File > Packages > Reset Package Caches`, then `File > Packages > Update to Latest Package Versions`. |
| **"Blank white screen on launch"** | Web assets were not synced before building. | Run `npm run build && npx cap sync ios` in terminal, then rebuild in Xcode. |
| **"Assets not updated in simulator"** | Simulator running cached web build. | Run `npm run build`, then in Xcode press `Cmd + Shift + K` (Clean Build Folder) followed by `Cmd + R`. |

---

## 7. Project Summary

- **App Name:** AYXA Planner Pro (أجندة المرأة المسلمة الذكية)
- **Target OS:** iOS 14.0+ (iPhone & iPad)
- **Framework:** React 19 + TanStack Start / Router + Capacitor 8.5
- **Local-First:** Dexie/IndexedDB + localStorage
- **Language Support:** Arabic RTL & English LTR
- **Offline Capability:** 100% functional without internet connectivity
