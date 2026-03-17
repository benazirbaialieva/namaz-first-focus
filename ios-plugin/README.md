# iOS Screen Time Plugin Setup

## Prerequisites
- Mac with Xcode 15+
- Apple Developer Account (free or paid)
- iOS 16+ device (Screen Time APIs don't work in simulator)

## Step-by-Step Setup in Xcode

### 1. Open the iOS project
```bash
npx cap add ios
npx cap sync
npx cap open ios
```

### 2. Add Family Controls Entitlement
- Select your app target → Signing & Capabilities
- Click "+ Capability" → search "Family Controls"
- Add it (Apple auto-approves for individual use)

### 3. Copy Swift plugin files
Copy all `.swift` files from this folder into your Xcode project:
- `ScreenTimePlugin.swift`
- `AppSelectionManager.swift`
- `AppPickerView.swift`

### 4. Register the plugin
In `AppDelegate.swift` (or the Capacitor bridge setup):
```swift
import Capacitor

// In application(_:didFinishLaunchingWithOptions:)
bridge?.registerPlugin(ScreenTimePlugin.self)
```

### 5. Add Device Activity Monitor Extension
- File → New → Target → "Device Activity Monitor Extension"
- Copy `DeviceActivityMonitorExtension.swift` content into it
- Add Family Controls capability to this extension target too

### 6. Add the App Picker presentation
In your main SwiftUI App or a UIKit wrapper, listen for the notification:
```swift
.onReceive(NotificationCenter.default.publisher(for: .showFamilyActivityPicker)) { _ in
    showPicker = true
}
.sheet(isPresented: $showPicker) {
    AppPickerView()
}
```

### 7. Info.plist
Add these keys:
```xml
<key>NSFamilyControlsUsageDescription</key>
<string>This app blocks distracting apps during prayer times to help you focus on Salah.</string>
```

## Testing
- Must test on a **real iOS device** (not simulator)
- Screen Time APIs require device passcode to be set
