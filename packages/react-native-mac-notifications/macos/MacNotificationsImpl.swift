import Foundation
import UserNotifications

/// Pure-Swift implementation of the macOS notification logic. Exposed to the
/// Objective-C++ TurboModule boundary via `@objc`; it deliberately deals only
/// in Foundation types + completion handlers so nothing here touches JSI/C++.
@objc(MacNotificationsImpl)
public class MacNotificationsImpl: NSObject {

  private var center: UNUserNotificationCenter { UNUserNotificationCenter.current() }

  @objc(requestPermissionWithResolve:reject:)
  public func requestPermission(
    resolve: @escaping (Bool) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        reject("E_PERMISSION", error.localizedDescription, error as NSError)
        return
      }
      resolve(granted)
    }
  }

  @objc(getPermissionStatusWithResolve:reject:)
  public func getPermissionStatus(
    resolve: @escaping (String) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    center.getNotificationSettings { settings in
      resolve(MacNotificationsImpl.string(from: settings.authorizationStatus))
    }
  }

  @objc(notifyWithTitle:body:subtitle:sound:resolve:reject:)
  public func notify(
    title: String,
    body: String,
    subtitle: String?,
    sound: NSNumber?,
    resolve: @escaping () -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    if let subtitle = subtitle {
      content.subtitle = subtitle
    }
    // Sound defaults to on when the caller doesn't specify it.
    if sound?.boolValue ?? true {
      content.sound = .default
    }

    // nil trigger => deliver immediately.
    let request = UNNotificationRequest(
      identifier: UUID().uuidString,
      content: content,
      trigger: nil
    )

    center.add(request) { error in
      if let error = error {
        reject("E_NOTIFY", error.localizedDescription, error as NSError)
        return
      }
      resolve()
    }
  }

  private static func string(from status: UNAuthorizationStatus) -> String {
    switch status {
    case .authorized: return "authorized"
    case .denied: return "denied"
    case .notDetermined: return "notDetermined"
    case .provisional: return "provisional"
    @unknown default: return "unknown"
    }
  }
}
