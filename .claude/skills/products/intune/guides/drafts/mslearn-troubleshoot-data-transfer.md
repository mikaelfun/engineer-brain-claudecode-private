# Troubleshooting Data Transfer Between Managed Apps

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-data-transfer

## Investigation Steps

### 1. Confirm Supported Platforms/OS/Apps
- Supported: iOS, iPadOS, Android
- NOT supported: Shared iPad, Android Enterprise dedicated devices
- Apps must integrate Intune App SDK

### 2. Verify Corporate Account and Data
- Only corporate accounts/data are protected by APP
- Personal accounts/data are NOT managed
- Files saved to OneDrive for Business/SharePoint = corporate
- Files saved to local/non-managed locations = personal
- Multi-identity apps (Outlook, OneDrive): only corporate account data protected

### 3. Android: Check Work Profile
- Apps must be in work profile (briefcase badge on icons)
- Company Portal must be installed in work profile

### 4. Review APP Settings in Intune Admin Center

Key settings (Apps → App protection policies → Data protection):

| Setting | Values | Effect |
|---------|--------|--------|
| Send org data to other apps | Policy managed apps | Restrict to managed apps only |
| Receive data from other apps | Policy managed apps | Accept only from managed apps |
| Save copies of org data | Block | Restrict save locations |
| Restrict web content transfer | Microsoft Edge | Force links to open in Edge |

### 5. Verify on Device
- Edge → about:intunehelp → View Intune App Status
- Compare device-side settings with Intune admin center config

### 6. Compare Across Devices/Users/Apps
- Test on other devices to isolate device-specific issues
- Compare behavior between apps (e.g., Excel vs Word)
- Note app versions and SDK versions
