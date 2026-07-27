#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// Codegen-generated spec (protocol `NativeMacNotificationsSpec` + JSI class
// `NativeMacNotificationsSpecJSI`). The header dir matches codegenConfig.name.
#import <RNMacNotificationsSpec/RNMacNotificationsSpec.h>

// Must be imported *before* the Swift bridging header below: that header exposes
// `MacNotificationsImpl`'s `UNUserNotificationCenterDelegate` conformance and
// `UNNotificationPresentationOptions`, so these types have to be in scope first.
#import <UserNotifications/UserNotifications.h>

// CocoaPods-generated Swift interop header (name == sanitized pod name).
// If the build can't find it, check Pods/Target Support Files/... for the
// exact generated name and adjust here.
#import "react_native_mac_notifications-Swift.h"

// Registers the notification-center delegate as early as possible — before the
// app processes a click that *launched* it — so that click is captured and
// buffered rather than lost. This lives in a dedicated class because
// RCT_EXPORT_MODULE already defines +load on the module class itself (two +loads
// on one class is a compile error). The work is bounced to the main queue so we
// don't touch UserNotifications during the fragile +load phase; that block still
// runs at the very top of the run loop, before the launch click is delivered.
@interface MacNotificationsBootstrap : NSObject
@end

@implementation MacNotificationsBootstrap
+ (void)load
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [MacNotificationsImpl.shared registerAsDelegate];
  });
}
@end

@interface MacNotifications : NativeMacNotificationsSpecBase <NativeMacNotificationsSpec>
@end

@implementation MacNotifications {
  MacNotificationsImpl *_impl;
}

RCT_EXPORT_MODULE(MacNotifications)

- (instancetype)init
{
  if (self = [super init]) {
    _impl = MacNotificationsImpl.shared;
    // Route native clicks to the JS event once this module exists. Weak self so
    // the singleton's handler doesn't pin the module alive.
    __weak __typeof(self) weakSelf = self;
    _impl.emitHandler = ^(NSString *json) {
      [weakSelf emitOnNotificationResponse:json];
    };
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (void)requestPermission:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  [_impl requestPermissionWithResolve:^(BOOL granted) {
    resolve(@(granted));
  }
                               reject:reject];
}

- (void)getPermissionStatus:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
  [_impl getPermissionStatusWithResolve:^(NSString *status) {
    resolve(status);
  }
                                 reject:reject];
}

- (void)notify:(JS::NativeMacNotifications::NotificationOptions &)options
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
  NSString *title = options.title();
  NSString *body = options.body();
  NSString *subtitle = options.subtitle();       // nullable for optional string
  std::optional<bool> soundOpt = options.sound();
  NSNumber *sound = soundOpt.has_value() ? @(soundOpt.value()) : nil;
  NSString *identifier = options.identifier();    // nullable
  NSString *userInfoJson = options.userInfoJson(); // nullable, opaque

  [_impl notifyWithTitle:title
                    body:body
                subtitle:subtitle
                   sound:sound
              identifier:identifier
            userInfoJson:userInfoJson
                 resolve:^{
                   resolve(nil);
                 }
                  reject:reject];
}

- (void)getInitialNotificationResponse:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject
{
  resolve([_impl takeInitialResponse]);
}

- (void)getDeliveredNotifications:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject
{
  [_impl getDeliveredNotificationsWithResolve:^(NSString *json) {
    resolve(json);
  }
                                       reject:reject];
}

- (void)removeDeliveredNotifications:(NSArray *)identifiers
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject
{
  [_impl removeDeliveredNotificationsWithIdentifiers:identifiers
                                             resolve:^{
                                               resolve(nil);
                                             }
                                              reject:reject];
}

- (void)removeAllDeliveredNotifications:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject
{
  [_impl removeAllDeliveredNotificationsWithResolve:^{
    resolve(nil);
  }
                                             reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeMacNotificationsSpecJSI>(params);
}

@end
