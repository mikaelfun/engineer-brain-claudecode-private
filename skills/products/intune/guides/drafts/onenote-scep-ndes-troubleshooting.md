# Intune SCEP/NDES Certificate Troubleshooting Workflow

> Source: MCVKB/Intune/NDES/NEW Intune Cert SCEP troubleshooting workflow.md, Intune Workflow_ How SCEP and NDES works.md
> Quality: guide-draft (pending review)

## SCEP/NDES Architecture

1. SCEP certificate profile + Trusted Certificate profile created in Intune, assigned to device
2. Device contacts NDES server (same PC as Microsoft Intune Certificate Connector) using URI in SCEP profile
3. NDES Connector policy module validates the request
4. NDES forwards valid request to Certification Authority (CA)
5. CA sends SCEP certificate back via NDES to device
6. Connector reports status to Intune service

## Connector Setup

- Installed at: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`
- Must run as Admin
- Account used to sign in must have Intune admin permission AND Intune license
- NDES service account needs "Logon as a service" right
- .NET Framework 4.7.2 required

## Event Log Locations

- **Connector logs**: Event Viewer > Application and Service Logs > Microsoft > Intune > Certificate Connectors
  - Admin: one log per request with final result
  - Operational: multiple logs per request with details
- **IIS logs**: `C:\inetpub\logs\LogFiles\W3SVC1\u_exlog`
- **Application log**: Event Viewer > Windows Logs > Application

## Event ID Ranges

| Range | Category |
|-------|----------|
| 0001-0999 | General (not single scenario) |
| 1000-1999 | PKCS |
| 2000-2999 | PKCS Import |
| 3000-3999 | Revoke |
| 4000-4999 | SCEP |

## Successful SCEP Flow (Event Log)

1. **4003** - Successfully received SCEP request
2. **4006** - Successfully verified SCEP request
3. **4006** - Successfully issued for SCEP request
4. **4008** - Successfully notified SCEP request

## Kusto Query

Find SCEP cert request by transaction ID (from connector event log):
```kql
IntuneEvent
| where env_time > ago(1h)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "{transactionID}"
| project ActivityId, env_time, ComponentName, EventUniqueName,
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```

## Common Failure Scenarios

### 1. Connector Setup Failures
- Missing admin privileges
- Missing Intune admin permission or license
- NDES service account missing "Logon as a service"
- .NET Framework 4.7.2 not installed (error: `Failed to verify payload: NetFx472Redist`)

### 2. NDES 500 Error - CRL Expired
- Root CA CRL expired even though NDES certs renewed
- Check: PKIVIEW.msc on CA jump server
- Fix: `certutil -crl` on root CA, then `certutil -dspublish -f <CRL> <CA-name>`

### 3. External URL BadGateway
- Multiple Azure AD App Proxy connectors causing wrong routing
- Fix: Create Application Proxy group with correct connector assignment

### 4. Hybrid AADJ SCEP Failure
- KSP set to "Windows Hello for Business" but WHfB enabled via GPO
- Fix: Change KSP to "Enroll to TPM KSP if present, otherwise Software KSP"

### 5. DCOM Authentication After KB5014702
- KB5014702 on CA raises DCOM auth level; NDES on older OS can't match
- Fix: Install KB on NDES or set RequireIntegrityActivationAuthenticationLevel=0

## References

- [Certificate Connector Overview](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-overview)
- [KB5004442 - DCOM Security Feature Bypass](https://support.microsoft.com/en-us/topic/kb5004442)
