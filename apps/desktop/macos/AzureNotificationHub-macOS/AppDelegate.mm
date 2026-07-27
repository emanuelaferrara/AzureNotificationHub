#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"AzureNotificationHub";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];

  [super applicationDidFinishLaunching:notification];

  // Keep the single main window alive when the user closes it, so a later
  // dock/notification reactivation can re-focus the existing window instead of
  // spawning a fresh one (see applicationShouldHandleReopen: below).
  self.window.releasedWhenClosed = NO;
}

// Reuse the existing main window whenever the app is reactivated (dock click, or
// a notification click that reactivates the single instance) rather than letting
// AppKit open another window. Together with LSMultipleInstancesProhibited
// (Info.plist), this keeps the app to one instance with one window.
- (BOOL)applicationShouldHandleReopen:(NSApplication *)sender hasVisibleWindows:(BOOL)flag
{
  if (self.window) {
    if (self.window.isMiniaturized) {
      [self.window deminiaturize:self];
    }
    [self.window makeKeyAndOrderFront:self];
    [sender activateIgnoringOtherApps:YES];
    return NO;
  }
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
