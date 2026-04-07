# macOS Preference Domain Names for Intune Configuration Profiles

## Overview

When deploying macOS preference configuration profiles via Intune, the **preference domain name** differs between Store apps and Standalone apps.

## Key Difference: Store vs Standalone

| App | Store (Mac App Store) | Standalone |
|-----|----------------------|------------|
| OneDrive | `com.microsoft.OneDrive-mac` | `com.microsoft.OneDrive` |
| Google Chrome | `com.google.Keystone` | `com.google.Keystone` |

Reference: [Deploy and configure OneDrive sync app for Mac](https://docs.microsoft.com/en-us/onedrive/deploy-and-configure-on-macos)

## Where Preferences Are Stored

Managed preference profiles are written to:

```
/Library/Managed Preferences/<preference-domain-name>.plist
```

## Best Practices

- [Best practice examples for configuring macOS apps with Microsoft Endpoint Manager](https://techcommunity.microsoft.com/t5/intune-customer-success/best-practice-examples-for-configuring-macos-apps-with-microsoft/ba-p/2564255)
- Always verify the correct domain name for the app variant (Store vs Standalone) before creating the configuration profile
- Use `defaults read <domain>` on a test device to verify settings are applied

---
*Source: OneNote - Mooncake POD Support Notebook / MacOS TSG / Preference*
