#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

// Short label shown in the menu bar. Swap for a template NSImage/SF Symbol here
// if you ever want a glyph instead of text.
static NSString *const kStatusItemTitle = @"ANH";
static const CGFloat kPopoverWidth = 380;
static const CGFloat kPopoverHeight = 520;

@interface AppDelegate ()
@property (nonatomic, strong) NSStatusItem *statusItem;
@property (nonatomic, strong) NSPopover *popover;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"AzureNotificationHub";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];

  // Host React Native inside a menu-bar popover instead of the standalone
  // window RCTAppDelegate would otherwise create. This MUST be set before
  // -[super applicationDidFinishLaunching:] so the base class builds the
  // React Native factory but skips -loadReactNativeWindow.
  self.automaticallyLoadReactNativeWindow = NO;

  [super applicationDidFinishLaunching:notification];

  [self setUpStatusItem];
  [self setUpPopoverWithLaunchOptions:notification.userInfo];
}

#pragma mark - Menu bar setup

- (void)setUpStatusItem
{
  self.statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSVariableStatusItemLength];
  NSStatusBarButton *button = self.statusItem.button;
  button.title = kStatusItemTitle;
  button.target = self;
  button.action = @selector(statusItemClicked:);
  // Receive both mouse-up kinds so we can tell a left click (toggle popover)
  // from a right / control click (context menu).
  [button sendActionOn:(NSEventMaskLeftMouseUp | NSEventMaskRightMouseUp)];
}

- (void)setUpPopoverWithLaunchOptions:(NSDictionary *)launchOptions
{
  NSView *rootView = [self.rootViewFactory viewWithModuleName:self.moduleName
                                            initialProperties:self.initialProps
                                                launchOptions:launchOptions];
  rootView.frame = NSMakeRect(0, 0, kPopoverWidth, kPopoverHeight);
  rootView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;

  NSViewController *contentViewController = [NSViewController new];
  contentViewController.view = rootView;

  self.popover = [[NSPopover alloc] init];
  self.popover.contentViewController = contentViewController;
  self.popover.contentSize = NSMakeSize(kPopoverWidth, kPopoverHeight);
  self.popover.behavior = NSPopoverBehaviorTransient; // dismiss when clicking away
  self.popover.animates = YES;
}

#pragma mark - Status item interaction

- (void)statusItemClicked:(id)sender
{
  NSEvent *event = [NSApp currentEvent];
  BOOL wantsMenu = event.type == NSEventTypeRightMouseUp ||
                   (event.modifierFlags & NSEventModifierFlagControl) != 0;
  if (wantsMenu) {
    [self showStatusMenu];
  } else {
    [self togglePopover];
  }
}

- (void)togglePopover
{
  if (self.popover.isShown) {
    [self.popover performClose:nil];
    return;
  }

  NSStatusBarButton *button = self.statusItem.button;
  // Bring this accessory (LSUIElement) app forward so the popover can take
  // keyboard focus for text input.
  [NSApp activate];
  [self.popover showRelativeToRect:button.bounds ofView:button preferredEdge:NSRectEdgeMinY];
}

- (void)showStatusMenu
{
  NSMenu *menu = [[NSMenu alloc] init];
  NSMenuItem *quitItem = [[NSMenuItem alloc] initWithTitle:@"Quit AzureNotificationHub"
                                                    action:@selector(terminate:)
                                             keyEquivalent:@"q"];
  quitItem.target = NSApp;
  [menu addItem:quitItem];

  NSStatusBarButton *button = self.statusItem.button;
  NSPoint location = NSMakePoint(0, NSHeight(button.bounds) + 5);
  [menu popUpMenuPositioningItem:nil atLocation:location inView:button];
}

#pragma mark - React Native bridge

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
