# SCEP Certificate Renewal with VPN Profile - Log Analysis

**Source**: OneNote > Mooncake POD Support Notebook > iOS TSG > SCEP renew - VPN

## Overview

When a SCEP certificate used by a VPN profile approaches expiration, Intune automatically triggers renewal. The VPN profile is then reinstalled with the new certificate. This guide explains the log flow.

## Key Log Sequence

### 1. Expiration Threshold Calculation
```
iOSPlugin: Finishing SCEP expiration threshold calculation with threshold = '19'
```
The threshold (in days) triggers renewal when the certificate is within this many days of expiration.

### 2. SCEP Profile Reissue
```
iOSPlugin: NDES SCEP - KeyLength is: 2048, KeyUsage is 5, SAN format is 0, Num of retries is 3
iOSPlugin: Issuing an iOS Command of type InstallProfileCommand
```

### 3. VPN Profile Listener Triggered
```
iOSPlugin: Calling listener 'Intune VPN' for change to certificate UUID '...'
iOSPlugin: Certificate payload with UUID '...' change notification was called, issuing an install profile command for payload with identifier Intune VPN.
```
The VPN profile has a dependency on the SCEP certificate. When the cert changes, the VPN profile is automatically reinstalled.

### 4. Possible Delay
```
iOSPlugin: TryEncryptInstallProfileCommand: ReferencedEncryptedCertRequestIds is null or empty, delaying the install of the profile.
```
This is expected during the renewal window - the VPN profile install is delayed until the SCEP certificate is fully processed.

### 5. Successful Installation
```
[Device] Received an iOS command result of type InstallProfile and status 'Acknowledged'
```

### 6. Post-Renewal Threshold
```
iOSPlugin: Finishing SCEP expiration threshold calculation with threshold = '99'
```
After renewal, the threshold jumps to 99 days (far from expiration).

## Kusto Query for SCEP/VPN Events

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId == "{deviceId}"
| where message contains "SCEP" or message contains "VPN"
| project env_time, message
| order by env_time asc
```

## Key Identifiers in Logs

- **PayloadUUID**: Maps to the SCEP certificate model (e.g., `ModelName=AC_{accountId}/LogicalName_{guid}`)
- **CmdUUID**: Unique command ID for each InstallProfile command
- **CertificateUsageType**: `1` = client authentication
