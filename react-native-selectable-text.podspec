Pod::Spec.new do |s|
  s.name         = "react-native-selectable-text"
  s.version      = "0.1.0"
  s.summary      = "Selectable UITextView based rich text component for React Native"
  s.license      = "MIT"
  s.author       = "toupitutuetoudada"
  s.homepage     = "https://github.com/toupitutuetoudada/react-native-selectable-text"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/toupitutuetoudada/react-native-selectable-text.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm}"
  s.requires_arc = true

  install_modules_dependencies(s)
end