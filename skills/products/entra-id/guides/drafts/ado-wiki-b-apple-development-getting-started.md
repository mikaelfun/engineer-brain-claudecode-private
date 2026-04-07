---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Apple/Getting Started with Apple Development"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FApple%2FGetting%20Started%20with%20Apple%20Development"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Getting started with Apple development

## Overview

There are two native programming languages for iOS: Objective-C and Swift.

### Objective-C History
Brad Cox and Tom Love designed Objective-C in the early 1980s. It is layered on top of C. Apple acquired NeXT Software in 1996, and their NEXTSTEP/OPENSTEP environment became the basis for OS X (Cocoa API).

### Swift History
Swift development began at Apple in 2010 by Chris Lattner. Released publicly in 2014. Made open source with version 2.2 in December 2015. Designed to work with Cocoa/Cocoa Touch and existing Objective-C code.

### Benefits of Swift
- Easier for beginners, more modern, less verbose
- Xcode Playgrounds / Swift Playgrounds for interactive learning
- Strong typing system, optionals, error handling
- Apple is committed to Swift as the future

### Pitfalls of Swift / Benefits of Objective-C
- Swift version updates require code migration
- Better Xcode code completion with Objective-C
- iOS < 7 requires Objective-C
- Some Foundation APIs (AVFoundation, CoreAnimation) work more naturally with Objective-C
- C++ libraries / cross-platform C++ SDKs work with Objective-C

## Getting started

### Set up a free Apple developer account

1. Create a Free Apple ID: https://appleid.apple.com/account
2. Open Xcode 7+
3. Navigate to Xcode -> Preferences -> Accounts, add your Apple ID
4. View Details -> Create iOS development certificate
5. Connect iOS device, create new project (Game template)
6. Fill in Product name, Organization Name, Organization Identifier (reverse domain notation)
7. Press "Fix Issue" to create provisioning profile
8. Test deployment with Play icon

**Microsoft resources:**
- Apple Developer Registration: internal SharePoint link
- Profile/provisioning support: https://aka.ms/mapsupport
- Purchase Apple developer license: https://developer.apple.com/programs/enroll/

### Learn Swift
- https://www.codecademy.com/learn/learn-swift

### Common problems - Signing errors
1. Select your developer profile as "Team" in project settings
2. Plug in an iOS device
3. Change package name to something unique (not com.example)
- More tips: https://ionic.io/blog/deploying-to-a-device-without-an-apple-developer-account

### iOS App lifecycle
https://developer.apple.com/documentation/uikit/app_and_environment/managing_your_app_s_life_cycle

## Package managers
- **Cocoapods**: https://cocoapods.org/ (needed for MSAL)
- **Homebrew**: https://brew.sh/

## HTTP Capturing tools
- https://mitmproxy.org/
- https://www.telerik.com/fiddler/fiddler-everywhere
- https://www.charlesproxy.com/documentation/getting-started/
