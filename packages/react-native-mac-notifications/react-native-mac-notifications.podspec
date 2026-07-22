require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-mac-notifications'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = 'MIT'
  s.authors      = { 'Provol' => 'noreply@example.com' }
  s.homepage     = 'https://github.com/provol/react-native-mac-notifications'
  s.platforms    = { :osx => '14.0' }
  s.source       = { :git => 'https://github.com/provol/react-native-mac-notifications.git', :tag => "v#{s.version}" }

  s.source_files = 'macos/**/*.{h,m,mm,swift}'

  s.frameworks   = 'UserNotifications'

  # CocoaPods needs an explicit module + Swift version so it emits the
  # `<pod>-Swift.h` header the Objective-C++ TurboModule boundary imports.
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_VERSION' => '5.0'
  }

  # Pulls in the New Architecture / TurboModule + codegen dependencies.
  install_modules_dependencies(s)
end
