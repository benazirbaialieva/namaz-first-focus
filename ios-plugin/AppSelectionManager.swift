// AppSelectionManager.swift
// Stores the user's selected apps from FamilyActivityPicker

import Foundation
import FamilyControls

class AppSelectionManager: ObservableObject {
    static let shared = AppSelectionManager()

    @Published var currentSelection: FamilyActivitySelection?

    private init() {
        // Load saved selection
        if let data = UserDefaults.standard.data(forKey: "selectedApps"),
           let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data) {
            currentSelection = selection
        }
    }

    func save(_ selection: FamilyActivitySelection) {
        currentSelection = selection
        if let data = try? JSONEncoder().encode(selection) {
            UserDefaults.standard.set(data, forKey: "selectedApps")
        }
    }
}
