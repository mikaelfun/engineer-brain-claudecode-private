# macOS Preference Domain Names Reference

> Source: OneNote - Mooncake POD Support Notebook / Intune / MacOS TSG / Preference

## Key Concept

macOS apps use **preference domain names** to identify their managed settings. The domain name differs between **Store app** and **Standalone app** versions.

## Common Domain Names

| App | Store App Domain | Standalone App Domain |
|-----|-----------------|----------------------|
| OneDrive | com.microsoft.OneDrive-mac | com.microsoft.OneDrive |
| Google Chrome (updates) | - | com.google.Keystone |

## Where to Find Preference Profiles on Device

Managed preference files are stored at:

```
/Library/Managed Preferences/<Preference domain name>.plist
```

## References

- [Best practice examples for configuring macOS apps (Microsoft Tech Community)](https://techcommunity.microsoft.com/t5/intune-customer-success/best-practice-examples-for-configuring-macos-apps-with-microsoft/ba-p/2564255)
- [Deploy and configure OneDrive on Mac (Microsoft Docs)](https://docs.microsoft.com/en-us/onedrive/deploy-and-configure-on-macos)
- [Chrome browser on Mac / Linux (Google)](https://support.google.com/chrome/a/topic/7590800)
