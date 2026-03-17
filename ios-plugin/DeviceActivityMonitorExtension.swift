// DeviceActivityMonitorExtension.swift
// App Extension that auto-locks apps at prayer times (runs in background)
//
// IMPORTANT: This must be added as a separate target in Xcode:
// File → New → Target → Device Activity Monitor Extension
//
// This extension runs even when your app is closed.

import DeviceActivity
import ManagedSettings
import Foundation

class PrayerActivityMonitor: DeviceActivityMonitor {
    let store = ManagedSettingsStore()

    // Called when a prayer time interval STARTS → BLOCK apps
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        guard let selection = AppSelectionManager.shared.currentSelection else { return }

        store.shield.applications = selection.applicationTokens
        store.shield.applicationCategories = .specific(selection.categoryTokens)
        store.shield.webDomainCategories = .specific(selection.categoryTokens)
    }

    // Called when prayer time interval ENDS → UNBLOCK apps
    // (Or user confirms prayer from the web app)
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        store.clearAllSettings()
    }
}
