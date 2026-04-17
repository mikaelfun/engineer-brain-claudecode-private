# iOS VPP App Install Troubleshooting Guide

> Source: OneNote Case 2308160010000983
> Status: draft

## Step 1: Determine Licensing Type

- **User Licensing**: Allows 5-10 devices per user via Apple ID association. Requires user affinity.
- **Device Licensing**: Associates VPP license to each unique device. No Apple ID required.

## Step 2: Check Assignment Target

- If deployed to device group without user affinity → only device licensing works
- If user licensing targets device group → uses the Intune user who owns the device

## Step 3: Collect Info

- Device ID (Intune > Devices > All Devices > Hardware)
- VPP App name and iTunes Store ID (adamId)

## Step 4: Kusto Queries

### Check app status
```kusto
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<Intune Device ID>"
| where message contains "<app name>"
| project env_time, EventMessage, message
```

### Check VPP pre-requisites
```kusto
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<Intune Device ID>"
| where message contains "<AppId>" 
| where message contains "IsVppAppReadyForInstall" or message contains "VppLicense" or message contains "VPPService"
| project env_time, message
```

### Check VPP sync status
```kusto
VppFeatureTelemetry
| where env_time > ago(2d)
| where accountId == "<account-id>"
| where productId == "<iTunes Store ID>"
| project env_time, userId, deviceId, TaskName, ActivityId
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `yet to accept VPP invite` | User hasn't accepted VPP invite | Verify invite sent; don't block App Store (use Hide instead) |
| `9632: Too many recent calls` | Too many devices/Apple IDs per org | Switch to device licensing |
| `9616: regUsersAlreadyAssigned` | Apple ID used by another Intune user | New Intune user + new Apple ID, or device licensing |
| `VPP user licensing not supported for userless enrollment` | User licensing on device without user affinity | Switch to device licensing |
| `LicenseNotFound` | User changed Apple ID after initial VPP agreement | Log back in with original Apple ID, or device licensing |
| `VppDeviceLicenseAssignmentFailedEvent` + "depleted licenses" | All user licenses consumed | Switch to device licensing or revoke unused assignments |
| `APP_CI_ENFORCEMENT_IN_PROGRESS` | Pre-requisites not met | Check IsVppAppReadyForInstall details |

## Auto-Update Limitations

- VPP auto-update NOT supported for iOS < 11.3
- Apps will not update even if tenant has auto-update enabled

## References

- [Apple VPP Developer Documentation](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/5-Web_Service_Protocol_VPP/webservice.html)
