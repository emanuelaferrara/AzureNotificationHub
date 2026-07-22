#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// Codegen-generated spec (protocol `NativeMacNotificationsSpec` + JSI class
// `NativeMacNotificationsSpecJSI`). The header dir matches codegenConfig.name.
#import <RNMacNotificationsSpec/RNMacNotificationsSpec.h>

// CocoaPods-generated Swift interop header (name == sanitized pod name).
// If the build can't find it, check Pods/Target Support Files/... for the
// exact generated name and adjust here.
#import "react_native_mac_notifications-Swift.h"

@interface MacNotifications : NSObject <NativeMacNotificationsSpec>
@end

@implementation MacNotifications {
  MacNotificationsImpl *_impl;
}

RCT_EXPORT_MODULE(MacNotifications)

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [MacNotificationsImpl new];
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
  NSString *subtitle = options.subtitle(); // nullable for optional string
  std::optional<bool> soundOpt = options.sound();
  NSNumber *sound = soundOpt.has_value() ? @(soundOpt.value()) : nil;

  [_impl notifyWithTitle:title
                    body:body
                subtitle:subtitle
                   sound:sound
                 resolve:^{
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
