import MacNotifications from './NativeMacNotifications';

/** Possible values returned by {@link getPermissionStatus}. */
export type PermissionStatus =
  | 'authorized'
  | 'denied'
  | 'notDetermined'
  | 'provisional'
  | 'unknown';

/**
 * App-defined data attached to a notification and handed back verbatim when it
 * is clicked. Must be JSON-serialisable. The package never looks inside it.
 */
export type NotificationUserInfo = {[key: string]: unknown};

export type NotificationOptions = {
  title: string;
  body: string;
  subtitle?: string;
  /** Play the default notification sound. Defaults to true when omitted. */
  sound?: boolean;
  /** Stable OS-level identifier. Defaults to a random UUID. */
  identifier?: string;
  /** Opaque payload echoed back on click. */
  userInfo?: NotificationUserInfo;
};

export type NotificationResponse = {
  /** The identifier you passed to {@link notify}, or an OS-generated UUID. */
  identifier: string;
  /**
   * Which action was invoked. A plain click is the system default action
   * ('com.apple.UNNotificationDefaultActionIdentifier').
   */
  actionIdentifier: string;
  /** The opaque payload you attached via {@link notify}, if any. */
  userInfo?: NotificationUserInfo;
};

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
  const {userInfo, ...rest} = options;
  return MacNotifications.notify({
    ...rest,
    userInfoJson: userInfo !== undefined ? JSON.stringify(userInfo) : undefined,
  });
}

function parseResponse(json: string): NotificationResponse | null {
  if (!json) {
    return null;
  }
  try {
    const raw = JSON.parse(json) as {
      identifier?: string;
      actionIdentifier?: string;
      userInfoJson?: string;
    };
    let userInfo: NotificationUserInfo | undefined;
    if (raw.userInfoJson) {
      try {
        userInfo = JSON.parse(raw.userInfoJson) as NotificationUserInfo;
      } catch {
        userInfo = undefined;
      }
    }
    return {
      identifier: raw.identifier ?? '',
      actionIdentifier: raw.actionIdentifier ?? '',
      userInfo,
    };
  } catch {
    return null;
  }
}

/**
 * Subscribe to notification clicks that happen while the app is running.
 * Returns an unsubscribe function. For a click that *launched* the app, use
 * {@link getInitialNotificationResponse} instead.
 */
export function addNotificationResponseListener(
  listener: (response: NotificationResponse) => void,
): () => void {
  const subscription = MacNotifications.onNotificationResponse(
    (json: string) => {
      const response = parseResponse(json);
      if (response) {
        listener(response);
      }
    },
  );
  return () => subscription.remove();
}

/**
 * The click that launched/foregrounded the app, if any. Reads-and-clears, so
 * call it once at startup. Returns null when the app was not started by a click.
 */
export async function getInitialNotificationResponse(): Promise<NotificationResponse | null> {
  const json = await MacNotifications.getInitialNotificationResponse();
  return parseResponse(json);
}

export default MacNotifications;
