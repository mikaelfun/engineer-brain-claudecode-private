# SCEP Troubleshooting Workflow — New Intune Certificate Connector

## Log Collection Template

Collect the following logs from the NDES server:

1. **IIS log**: `C:\inetpub\logs\LogFiles\W3SVC1\u_exlog`
2. **Event Log → Application**
3. **Event Log → Applications and Services Logs → Microsoft → Intune → CertificateConnectors**
   - **Admin**: One log per request with final result
   - **Operational**: Multiple logs per request for detailed flow
4. **Connector UI**: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`

## Event ID Ranges

| Range | Scenario |
|-------|----------|
| 0001-999 | Not associated with single scenario |
| 1000-1999 | PKCS |
| 2000-2999 | PKCS Import |
| 3000-3999 | Revoke |
| 4000-4999 | SCEP |

Reference: [Certificate Connector Logging](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-overview#logging)

## Successful SCEP Request Flow

### IIS Log
- Shows incoming SCEP request to mscep.dll

### Connector Event Log Sequence
1. **Event 4003** — Successfully received SCEP request
2. **Event 4006** — Successfully verified SCEP request
3. **Event 4006** — Successfully issued for SCEP request
4. **Event 4008** — Successfully notified SCEP request

## Common Failure Scenarios

### Connector Setup Failures
- **Run connector as Admin** — Always required
- **Admin account** must have Intune admin permission AND Intune license
- **NDES service account** must have "Log on as a service" right
- **.NET Framework 4.7.2** must be installed (error: `NetFx472Redist` cache failure `0x80070490`)

### SCEP Challenge Expired
- Connector verifies challenge with Intune service. If delayed, challenge expires (default: 60 min interval)
- Kusto: Find transaction ID in connector event log, then query:
```kusto
IntuneEvent
| where env_time > ago(1h)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "<transaction ID>"
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```

### Root CA CRL Expired → NDES 500
- NDES shows 500 error even after RA cert renewal
- Check with `PKIVIEW.msc` → if CDP of root CA expired
- Fix: On root CA run `certutil -crl`, then publish: `certutil -dspublish -f <CA>.crl <CA-Name>`

### HAADJ SCEP Fails with WHfB KSP
- If SCEP profile uses "Windows Hello for Business" as KSP and device enables WHfB via GPO → conflict
- Fix: Change KSP to "Enroll to TPM KSP if present, otherwise Software KSP"

---
*Source: OneNote — NEW Intune Cert SCEP troubleshooting workflow*
