# Troubleshooting App Protection Policy Deployment

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-app-protection-policy-deployment

## Investigation Flow

### Step 1: Verify Prerequisites
- User has Intune license assigned
- User belongs to security group targeted by APP
- Android: Company Portal app installed
- Office apps: M365 Apps license + managed save location configured

### Step 2: Check APP Status
- Intune admin center → Apps → Monitor → App protection status → Assigned users
- Verify user is licensed, has policy check-in, last sync time

### Step 3: Verify User Targeting
- APP must target user groups (NOT device groups)
- Android Enterprise: only personally-owned work profiles support APP
- Apple ADE: User Affinity must be enabled

### Step 4: Verify App Targeting
- App must use Intune App SDK
- Check app is in Microsoft Intune protected apps list
- iOS: ensure latest SDK version

### Step 5: Verify Corporate Account Sign-in
- User must sign in with corporate (UPN) credentials
- UPN must match between app and Entra ID
- Modern authentication recommended

### Step 6: Collect Device Data
- Microsoft Edge → about:intunehelp → View Intune App Status
- Collect APP logs for support ticket

## Common Scenarios

### Policy Changes Not Applying
- SDK checks every 30 min for selective wipe
- Existing policy changes may take up to 8 hours
- Fix: Log out and back in, or restart device
- Company Portal removal breaks policy updates

### iOS Managed Devices Need Extra Config
- IntuneMAMUPN + IntuneMAMOID required for MDM-managed apps
- IntuneMAMDeviceID required for third-party/LOB MDM apps
- Without IntuneMAMDeviceID, device treated as unmanaged
