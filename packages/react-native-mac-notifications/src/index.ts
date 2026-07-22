import MacNotifications from './NativeMacNotifications';
import type {NotificationOptions} from './NativeMacNotifications';

export type {NotificationOptions} from './NativeMacNotifications';

/** Possible values returned by {@link getPermissionStatus}. */
export type PermissionStatus =
  | 'authorized'
  | 'denied'
  | 'notDetermined'
  | 'provisional'
  | 'unknown';

/**
 * Ask the OS for permission to post notifications. Shows the system prompt the
 * first time it is called. Resolves to whether permission was granted.
 */
export function requestPermission(): Promise<boolean> {
  return MacNotifications.requestPermission();
}

/** Current notification authorization status. */
export function getPermissionStatus(): Promise<PermissionStatus> {
  return MacNotifications.getPermissionStatus() as Promise<PermissionStatus>;
}

/** Post a system notification immediately. */
export function notify(options: NotificationOptions): Promise<void> {
  return MacNotifications.notify(options);
}

export default MacNotifications;
