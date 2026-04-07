---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/Mobile Phone Data Gathering"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FMobile%20Phone%20Data%20Gathering"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Mobile Phone Data Gathering

Sometimes we have issues with our mobile experiences requiring us to gather reproduction data off of mobile phones. This document covers how to perform data collection using mobile phone developer tools and Fiddler proxy.

## Mobile Phone Developer Tools (Android)

[Document Reference](https://developer.chrome.com/docs/devtools/remote-debugging/)

### Discover the device
1. Enable developer options on the Android device [see here](https://developer.android.com/studio/debug/dev-options)
2. On the Android Phone, in Developer options, enable USB debugging
3. On the desktop, in Chrome, Navigate to `chrome://inspect#devices`
4. Ensure that Discover USB devices is enabled
5. Connect your Android device directly to your development machine using a USB cable
6. If you are connecting your device for the first time, the device will show up as "Offline" and pending authentication. Accept the debugging session prompt on your device's screen.

### Open Developer Tools
1. Open Chrome on the Android device
2. On the Desktop in `chrome://inspect/#devices` you should see the device Model name, serial number, and the version of Chrome.
3. On this page you should see open tabs or you can initiate a remote tab.
4. Click inspect on the tab and you should see a DevTools instance.

## Mobile Phone Developer Tools (iPhone)

> **The steps regarding iPhone can only be performed on a MacOS device**

### Enable Developer Features
[Document Reference](https://developer.apple.com/documentation/safari-developer-tools/enabling-developer-features)

1. On the Mac, from the menu bar, choose Safari
2. Select **Settings**
3. Go to the **Advanced** tab
4. Check the **Show features for web developers** checkbox

### Open Developer Tools
[Document Reference](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)

1. On the iPhone, open the Settings app
2. Go to Safari
3. Scroll down to Advanced
4. Enable the Web Inspector toggle
5. Connect the iPhone to the Mac using a cable
6. Accept any trust prompts on the iPhone device to trust the Mac device.
7. You should see the iPhone and its open Safari tabs in the Develop menu

## Fiddler Proxy (Android + iPhone)

If the above options do not work for customer, you can use the following process using Fiddler Classic.

- [How to capture Android traffic with Fiddler](https://www.telerik.com/blogs/how-to-capture-android-traffic-with-fiddler)
- [How to capture iOS traffic with Fiddler](https://www.telerik.com/blogs/how-to-capture-ios-traffic-with-fiddler)
