// AppPickerView.swift
// SwiftUI view that presents Apple's native FamilyActivityPicker

import SwiftUI
import FamilyControls

@available(iOS 16.0, *)
struct AppPickerView: View {
    @ObservedObject var manager = AppSelectionManager.shared
    @State private var selection = FamilyActivitySelection()
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Select Apps to Block")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            manager.save(selection)
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                }
        }
        .onAppear {
            if let existing = manager.currentSelection {
                selection = existing
            }
        }
    }
}
