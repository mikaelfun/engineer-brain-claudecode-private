---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/PKCS/PKCS Certificate Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FPKCS%2FPKCS%20Certificate%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## About PKCS Certificate Troubleshooting

This page provides comprehensive guidance for troubleshooting PKCS certificate deployment issues in Microsoft Intune, including Certificate Connector errors, processing delays, and platform-specific behaviors.

> **NOTE**: PKCS certificate deployment involves multiple components (Device > Intune > Connector > Enterprise CA). Delays can occur at any point in this chain.

## How PKCS Certificate Deployment Works

### Complete Flow

1. **Device Check-in**: Device → Intune: Request certificate profile. Intune creates PfxCertificate entity (Status=0, Pending)
2. **Connector Download (DownloadNewMessages)**: Connector → Intune: Poll for new certificate requests (PfxCertificates where Status eq 0)
3. **Connector Local Processing**: Connector → CA: Submit certificate request. CA → Connector: Return issued certificate. Potential failure point: NullReferenceException, CA errors
4. **Connector Upload**: Connector → Intune: Upload issued certificate. Intune: Update PfxCertificate (Status=1, Issued). HTTP Response: 204 No Content (Success)
5. **Device Notification**: Intune → APNs/WNS/FCM: Push notification to device. Device: Receive and install certificate

### PfxCertificate Status Values

| Status | Value | Description |
|--------|-------|-------------|
| Pending | 0 | Waiting for Connector to process |
| Issued | 1 | Certificate issued and uploaded |
| Failed | 2 | Certificate issuance failed |
| Revoked | 3 | Certificate revoked |

## Scoping Questions

1. What is the device platform? (Windows/iOS/Android/macOS)
2. How long has the certificate been in "Pending" status?
3. Are other devices/users able to receive certificates successfully?
4. Is this a new deployment or was it previously working?
5. Has anything changed recently? (Connector update, CA changes, network changes)
6. Is the certificate linked to a VPN profile? (especially important for iOS)
7. When was the Connector service last restarted?

## Troubleshooting Workflow

```
1. Check Intune received request
   Search: "Processing request of DownloadNewMessages"
     Not found → Network/Connector connectivity issue
     Found → Continue to step 2

2. Check pending certificates found
   Search: "Searching for pending PfxCertificates...returned"
     returned 0 → No pending requests, check device sync
     returned X → Continue to step 3

3. Check Connector uploaded result
   Search: "Processing request of Upload"
     Not found → Check Connector Event Log for errors
     Found → Continue to step 4

4. Check Upload success
   Search: "statusCode: 204"
     Not found → Upload failed, check TraceLevel for errors
     Found → Certificate issued, check device sync

5. If no Upload, check Connector Event Log
   Search: NullReferenceException, RPC_S_SERVER_UNAVAILABLE
     NullReferenceException → Connector bug, restart service
     RPC error → Check CA connectivity
     No errors → Check CA processing time
```

## Kusto Queries

### Query 1: Check Connector Operations (Download/Upload)

```kusto
IntuneEvent
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where AccountId == "['AccountID']"
| where Col2 contains "Processing request of"
| project env_time, ServiceName, EventUniqueName, Col2
| order by env_time asc
```

> **TIP**: Look for `DownloadNewMessages` followed by `Upload`. Multiple downloads without uploads indicates a Connector issue.

### Query 2: Verify Upload Success

```kusto
IntuneEvent
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where AccountId == "['AccountID']"
| where Col2 contains "PfxCertificate individual patch statusCode"
| project env_time, Col2
```

**Success Indicator**: `statusCode: 204`

### Query 3: Check VPN Dependency (iOS)

```kusto
DeviceManagementProvider
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where ActivityId == '['DeviceID']'
| where message contains "Dependent payload" or message contains "Issuing certificate profile"
| project env_time, TaskName, message
| sort by env_time asc
```

### Query 4: Check NotNow Responses (iOS Device Busy)

```kusto
DeviceManagementProvider
| where env_time between (datetime(['_startTime']) .. datetime(['_endTime']))
| where ActivityId == '['DeviceID']'
| where message contains "NotNow"
| project env_time, TaskName, message
| sort by env_time asc
```

### Query 5: Certificate Delivery Time Analysis

```kusto
let accountId = "['AccountID']";
let startTime = ago(7d);

IntuneEvent
| where env_time > startTime
| where AccountId == accountId
| where ApplicationName == "RACerts"
| where EventUniqueName contains "PfxCertificate"
| extend
    isRequest = iff(EventUniqueName contains "Processing", 1, 0),
    isComplete = iff(EventUniqueName contains "PatchComplete", 1, 0)
| summarize
    RequestTime = minif(env_time, isRequest == 1),
    CompleteTime = maxif(env_time, isComplete == 1)
    by DeviceId
| extend DeliveryTimeMinutes = datetime_diff('minute', CompleteTime, RequestTime)
| where isnotnull(DeliveryTimeMinutes)
| summarize
    AvgDeliveryTime = avg(DeliveryTimeMinutes),
    MaxDeliveryTime = max(DeliveryTimeMinutes),
    MinDeliveryTime = min(DeliveryTimeMinutes),
    Count = count()
```

## Connector Event Log Analysis

### Log Location
Event Viewer: `Applications and Services Logs` > `Microsoft` > `Intune` > `CertificateConnectors` > `Operational`

### Key Event IDs

| Event ID | Level | Description |
|----------|-------|-------------|
| **1000** | Info | PKCS certificate successfully processed |
| **1001** | Error | PKCS certificate processing failed |
| 1002 | Info | Successfully downloaded requests from Intune |
| **1020** | Info | Specific request downloaded |
| **1050** | Info | CA successfully issued certificate |
| 1051 | Warning | CA issue failed, retrying |
| **1052** | Error | CA permanently failed to issue |
| 1100 | Info | Successfully uploaded to Intune |
| **1101** | Error | Failed to upload to Intune |
| **1102** | Info | Specific request uploaded |
| 2 | Error | General exception (NullReferenceException) |

### PowerShell Commands

```powershell
# Check Connector service status
Get-Service | Where-Object { $_.Name -like "*Intune*" -or $_.Name -like "*PFX*" }

# Restart Connector services
Get-Service | Where-Object { $_.Name -like "*Intune*" -or $_.Name -like "*PFX*" } | Restart-Service

# Export Connector Event Log
wevtutil epl "Microsoft-Intune-CertificateConnectors/Operational" "C:\temp\connector.evtx"

# Query recent errors
Get-WinEvent -LogName "Microsoft-Intune-CertificateConnectors/Operational" -MaxEvents 100 |
    Where-Object { $_.Level -le 2 } |
    Format-List TimeCreated, Id, Message
```

## Reference Codes

### ServiceName Values

| ServiceName | Description |
|-------------|-------------|
| `StatelessConnectorService` | Connector communication service |
| `StatelessDeviceService` | Device service (PfxCertificates table) |
| `StatelessAccountService` | Account service (CICertificates table) |
| `StatelessCertificateAuthority` | Certificate authority service |
| `RTNService` | Remote notification service (APNs/WNS) |

### Col2 Search Keywords

| Phase | Keyword | Description |
|-------|---------|-------------|
| Download | `Processing request of DownloadNewMessages` | Connector polling |
| Download | `Searching for pending PfxCertificates...returned` | Found pending certs |
| Upload | `Processing request of Upload` | Connector uploading result |
| Upload | `PfxCertificate individual patch statusCode: 204` | Success |

### Connector Event Log Search Keywords

| Keyword | Indicates |
|---------|-----------|
| `NullReferenceException` | Connector bug |
| `UploadResults` | Upload phase failure |
| `RPC_S_SERVER_UNAVAILABLE` | CA unreachable |
| `0x800706BA` | RPC connection failure |

## FAQ

- **Normal processing time**: 1-5 minutes. If pending >15 minutes, investigate.
- **Hours in Pending**: Common causes include Connector bugs (NullReferenceException), CA processing delays, or device sync intervals (default 8 hours).
- **Speed up iOS delivery**: Manual sync from Settings > General > VPN & Device Management > Sync.
- **Restart Connector**: Yes, often resolves transient issues like NullReferenceException.

## Additional Documentation

- [PKCS certificate profiles in Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-pfx-configure)
- [Certificate Connector for Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-overview)
- [Troubleshoot PKCS certificate deployment](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-pkcs-certificate-profiles)
- [iOS device is currently busy error (2016341112)](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/2016341112-ios-device-is-currently-busy)
