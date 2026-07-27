import Foundation
import UserNotifications

/// Pure-Swift implementation of the macOS notification logic. Exposed to the
/// Objective-C++ TurboModule boundary via `@objc`; it deliberately deals only
/// in Foundation types + completion handlers so nothing here touches JSI/C++.
///
/// It is also the `UNUserNotificationCenter` delegate. It is a singleton so a
/// single delegate survives for the whole process (the center holds its
/// delegate weakly) and so it can be registered very early — from the Obj-C
/// `+load` — to catch clicks that launched the app.
@objc(MacNotificationsImpl)
public class MacNotificationsImpl: NSObject, UNUserNotificationCenterDelegate {

  @objc public static let shared = MacNotificationsImpl()

  private var center: UNUserNotificationCenter { UNUserNotificationCenter.current() }

  /// Set by the Obj-C module once JS is wired up. When present, clicks are
  /// emitted live to JS. When nil (e.g. during a cold launch, before JS is
  /// running) the click is buffered instead and later drained via
  /// `takeInitialResponse()`.
  @objc public var emitHandler: ((String) -> Void)?

  /// The click that arrived before JS was listening (typically the click that
  /// launched the app). Held until `takeInitialResponse()` reads it.
  private var pendingInitialResponse: String?

  /// Applied to every posted notification so the OS reports explicit user
  /// dismissals (delivered to `didReceive` with the system dismiss action id)
  /// in addition to clicks. Without a category carrying `.customDismissAction`
  /// the OS silently drops dismissals. Package-internal; callers never see it.
  private static let categoryIdentifier = "RNMacNotificationsDefault"

  // MARK: - Delegate wiring / cold-start buffer

  /// Become the notification-center delegate and register the dismissal-aware
  /// category. Called from the Obj-C `+load` so both are in place before the OS
  /// delivers a launch click.
  @objc public func registerAsDelegate() {
    center.delegate = self
    let category = UNNotificationCategory(
      identifier: MacNotificationsImpl.categoryIdentifier,
      actions: [],
      intentIdentifiers: [],
      options: [.customDismissAction]
    )
    center.setNotificationCategories([category])
  }

  /// Return (and clear) the buffered launch click, or "" if there wasn't one.
  @objc public func takeInitialResponse() -> String {
    let response = pendingInitialResponse ?? ""
    pendingInitialResponse = nil
    return response
  }

  // MARK: - Permissions

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

  // MARK: - Posting

  @objc(notifyWithTitle:body:subtitle:sound:identifier:userInfoJson:resolve:reject:)
  public func notify(
    title: String,
    body: String,
    subtitle: String?,
    sound: NSNumber?,
    identifier: String?,
    userInfoJson: String?,
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
    // Stored opaquely under a single key; the package never parses it.
    if let userInfoJson = userInfoJson {
      content.userInfo = ["payload": userInfoJson]
    }
    // Opts this notification into dismissal reporting (see categoryIdentifier).
    content.categoryIdentifier = MacNotificationsImpl.categoryIdentifier

    // nil trigger => deliver immediately.
    let request = UNNotificationRequest(
      identifier: identifier ?? UUID().uuidString,
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

  // MARK: - UNUserNotificationCenterDelegate

  /// Present notifications as a banner (+ sound) even when the app is focused;
  /// without this the OS suppresses them while the app is frontmost.
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .sound, .list])
  }

  /// A delivered notification was interacted with — either clicked (default
  /// action) or explicitly dismissed (dismiss action; the two are distinguished
  /// by `response.actionIdentifier`). Emit it live if JS is listening, otherwise
  /// buffer it as the launch response.
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let json = MacNotificationsImpl.serialize(response)
    if let emitHandler = emitHandler {
      emitHandler(json)
    } else {
      pendingInitialResponse = json
    }
    completionHandler()
  }

  // MARK: - Helpers

  /// Serialise a response into the JSON envelope the JS layer expects. The
  /// opaque payload is copied through as a raw string, never parsed here.
  private static func serialize(_ response: UNNotificationResponse) -> String {
    let content = response.notification.request.content
    var dict: [String: Any] = [
      "identifier": response.notification.request.identifier,
      "actionIdentifier": response.actionIdentifier,
    ]
    if let payload = content.userInfo["payload"] as? String {
      dict["userInfoJson"] = payload
    }
    guard let data = try? JSONSerialization.data(withJSONObject: dict),
          let string = String(data: data, encoding: .utf8) else {
      return ""
    }
    return string
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
