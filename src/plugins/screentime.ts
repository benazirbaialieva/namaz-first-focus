// TypeScript interface for the native ScreenTime Capacitor plugin
// This file lets your React code talk to the Swift plugin

import { registerPlugin } from '@capacitor/core';

export interface ScreenTimePlugin {
  /** Request Family Controls authorization (shows iOS system prompt) */
  requestAuthorization(): Promise<{ granted: boolean }>;

  /** Check if user already authorized */
  isAuthorized(): Promise<{ authorized: boolean }>;

  /** Show Apple's native app picker (FamilyActivityPicker) */
  showAppPicker(): Promise<void>;

  /** Block all selected apps using ManagedSettingsStore */
  blockApps(): Promise<{ blocked: boolean }>;

  /** Unblock all apps (call after prayer confirmation) */
  unblockApps(): Promise<{ unblocked: boolean }>;
}

const ScreenTime = registerPlugin<ScreenTimePlugin>('ScreenTime');

export default ScreenTime;
