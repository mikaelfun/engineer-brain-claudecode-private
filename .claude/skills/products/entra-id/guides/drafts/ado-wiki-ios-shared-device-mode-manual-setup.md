---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Apple Devices/How_to_manually_configure_a_shared_device_mode_for_iOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FApple%20Devices%2FHow_to_manually_configure_a_shared_device_mode_for_iOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Manually Configure Shared Device Mode for iOS

## Steps

### A. Set up device configuration profiles for Enterprise SSO Plug-in with shared device mode

1. Create new device configuration profile: Intune admin center > Devices > iOS/iPadOS > Configuration
2. Select Template > Device Features
3. Under SSO App Extension Type: select Microsoft Entra ID, Enable Shared Device Mode: Yes
4. Assign to users/devices and save

### B. iOS device enrollment from Intune Company Portal

1. Install Microsoft Authenticator and Intune Company Portal from AppStore
2. Enroll device to Intune
3. Verify configuration profile from step A is applied
4. If cache issues: reinstall Authenticator and initialize iOS

### C. Remove and re-enroll device IDs from Authenticator

1. Open Authenticator > Settings > Enroll Devices > remove existing DeviceID
2. Reopen Authenticator - should see shared device mode screen
3. Sign in with Cloud Device Administrator role user
4. New DeviceID issued - device available as shared device mode

> **Important**: If authentication is requested while DeviceID is still displayed, it will fail. May need to reopen app, delete DeviceID again, or reset iOS.

### Verify Shared Device Mode

If multiple users detected after sign-in attempt, a message will be displayed indicating shared device mode is active.
