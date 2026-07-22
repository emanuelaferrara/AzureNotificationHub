import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface NotificationOptions {
  title: string;
  body: string;
  subtitle?: string;
  /** Play the default notification sound. Defaults to true when omitted. */
  sound?: boolean;
}

export interface Spec extends TurboModule {
  /**
   * Ask the OS for permission to post notifications. Triggers the system
   * prompt the first time it is called. Resolves to whether permission was
   * granted.
   */
  requestPermission(): Promise<boolean>;

  /**
   * Current authorization status, one of:
   * 'authorized' | 'denied' | 'notDetermined' | 'provisional'.
   * (unknown future values are surfaced verbatim as 'unknown')
   */
  getPermissionStatus(): Promise<string>;

  /**
   * Post a system notification immediately. Rejects if the OS refuses the
   * request (e.g. permission not granted).
   */
  notify(options: NotificationOptions): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MacNotifications');
