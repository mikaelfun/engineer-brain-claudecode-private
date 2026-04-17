# macOS FileVault Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Intune / MacOS TSG / MacOS FileVault troubleshooting

## Error Codes Reference

| Error Code | Constant | Meaning |
|-----------|----------|---------|
| -2016341108 | PrerequisitesNotSatisfied | Prerequisites for FileVault not met |
| -2016341107 | FileVaultNotEnabled | FileVault profile installed but FileVault not enabled on device |
| -2016341106 | FileVaultEnabledByUser | FileVault already enabled by user - Intune cannot manage recovery |

## Kusto Query - Check FileVault Status

```kusto
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == "{deviceID}"
| where message contains "iOSPlugin"
| project env_time, deviceName, userId, DeviceID=ActivityId, PolicyName=name,
    PolicyType=typeAndCategory, Applicability=applicablilityState,
    Compliance=reportComplianceState, EventMessage, message, TaskName
```

## Log Patterns

### Working (Profile Installed + FileVault Enabled)

```
iOSPlugin: Received profile list response with '4' profiles. Profile identifiers:
  www.windowsintune.com.security.filevault,
  www.windowsintune.com.pkcs1credentials.filevaultescrowcertificate,
  Microsoft.Profiles.MDM,
  www.windowsintune.com.security.filevault.escrow
```

### Error - Payload Installed But Not Enabled (-2016341107)

```
iOSPlugin: FileVault payload is installed but FileVault isn't enabled.
iOSPlugin: Processing recovery key for SecurityInfo with value:
iOSPlugin: CommandResult did not contain a FileVault personal recovery key.
```

**Action**: User must log out and log back in to trigger the FileVault enablement prompt.

### Error - Enabled By User, Not Via Payload (-2016341106)

```
iOSPlugin: FileVault is enabled but not via a FileVault payload.
Report an error as this prevents us from backing up a personal recovery key
```

**Action**: Deploy FileVault policy -> user uploads personal recovery key -> Intune assumes management.

## Assume Management Workflow

Prerequisites:
1. Deploy a FileVault policy to the device (will not decrypt/re-encrypt)
2. Direct the device user to upload their personal recovery key to Intune
3. If key is valid, Intune assumes management and generates a new recovery key

> **Important**: Intune does NOT alert users to upload their key. Use IT communication channels.

## References

- [Apple FDEFileVault Documentation](https://developer.apple.com/documentation/devicemanagement/fdefilevault)
- [Apple: Set a FileVault recovery key](https://support.apple.com/en-us/HT202385)
- [Microsoft: Assume management of FileVault](https://docs.microsoft.com/en-us/mem/intune/protect/encrypt-devices-filevault#assume-management-of-filevault-on-previously-encrypted-devices)
