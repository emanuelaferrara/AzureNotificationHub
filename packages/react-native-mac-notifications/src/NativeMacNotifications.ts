import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface NotificationOptions {
  title: string;
  body: string;
  subtitle?: string;
  /** Play the default notification sound. Defaults to true when omitted. */
  sound?: boolean;
  /**
   * Stable OS-level identifier for the notification. If omitted a random UUID
   * is used. Echoed back verbatim on the response event.
   */
  identifier?: string;
  /**
   * Opaque, app-defined payload as a JSON string. The package stores it on the
   * notification and hands it back verbatim on click; it never parses or
   * inspects it. The public JS API (index.ts) accepts an object and serialises
   * it into this field, so nothing app-specific reaches the native layer.
   */
  userInfoJson?: string;
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

  /**
   * The response for the notification click that launched/foregrounded the app,
   * as a JSON string ({identifier, actionIdentifier, userInfoJson}), or an
   * empty string if the app was not started by a click. Reads-and-clears: a
   * second call returns "". Use this once at startup to handle a cold-start
   * click; use the event below for clicks while the app is running.
   */
  getInitialNotificationResponse(): Promise<string>;

  /**
   * Fires when a delivered notification is clicked while a JS listener is
   * attached. Payload is a JSON string: {identifier, actionIdentifier,
   * userInfoJson}. Kept as a string so the package carries no codegen object
   * schema — the opaque payload is never modelled natively.
   */
  readonly onNotificationResponse: EventEmitter<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MacNotifications');
