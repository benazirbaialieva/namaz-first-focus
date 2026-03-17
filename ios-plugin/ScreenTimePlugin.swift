// ScreenTimePlugin.swift
// Capacitor plugin bridging Family Controls → JavaScript

import Foundation
import Capacitor
import FamilyControls
import ManagedSettings
import DeviceActivity

@objc(ScreenTimePlugin)
public class ScreenTimePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ScreenTimePlugin"
    public let jsName = "ScreenTime"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAppPicker", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "blockApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unblockApps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAuthorized", returnType: CAPPluginReturnPromise),
    ]

    private let store = ManagedSettingsStore()
    private let center = AuthorizationCenter.shared

    // MARK: - Step 1: Request Family Controls permission
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            Task {
                do {
                    try await center.requestAuthorization(for: .individual)
                    call.resolve(["granted": true])
                } catch {
                    call.reject("Authorization denied: \(error.localizedDescription)")
                }
            }
        } else {
            call.reject("Requires iOS 16+")
        }
    }

    // MARK: - Step 2: Check authorization status
    @objc func isAuthorized(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            let status = center.authorizationStatus
            call.resolve(["authorized": status == .approved])
        } else {
            call.resolve(["authorized": false])
        }
    }

    // MARK: - Step 3: Show the FamilyActivityPicker (native UI)
    // Note: FamilyActivityPicker must be presented from SwiftUI.
    // This method triggers the native picker via NotificationCenter.
    @objc func showAppPicker(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .showFamilyActivityPicker,
                object: nil,
                userInfo: ["call": call]
            )
        }
    }

    // MARK: - Step 4: Block selected apps
    @objc func blockApps(_ call: CAPPluginCall) {
        guard let selection = AppSelectionManager.shared.currentSelection else {
            call.reject("No apps selected. Show the app picker first.")
            return
        }

        store.shield.applications = selection.applicationTokens
        store.shield.applicationCategories = .specific(selection.categoryTokens)
        store.shield.webDomainCategories = .specific(selection.categoryTokens)

        call.resolve(["blocked": true])
    }

    // MARK: - Step 5: Unblock all apps (after prayer)
    @objc func unblockApps(_ call: CAPPluginCall) {
        store.clearAllSettings()
        call.resolve(["unblocked": true])
    }
}

// MARK: - Notification name for picker
extension Notification.Name {
    static let showFamilyActivityPicker = Notification.Name("showFamilyActivityPicker")
}
