---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/Troubleshooting/Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FNDES%20and%20SCEP%2FTroubleshooting%2FAndroid"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Android SCEP Certificate Troubleshooting

## 1. Android Personally Owned Work Profile (BYOD)

### Logs to Collect

**Server side (NDES server):**
- Microsoft Intune Connector Logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`

**Android device:**
- Company Portal OMADM logs: Company Portal > Menu > Settings > Verbose Logging ON > Menu > Help > Send logs

### SCEP Deployment Steps (BYOD)

**Step 1: Deploy Trusted Certificate chain**
- Must deploy Trusted Root + Intermediate certificates
- Android requires intermediates (see Google docs: Missing intermediate certificate authority)
- IMPORTANT: Trusted Certificate profile only supports root or intermediate certs. Non-root/intermediate → error `-2016281112 (Remediation failed)`
- Verify in OMADM log: search "IsInstalled" for thumbprints, "state changed from" for CERT_INSTALL_SUCCESS

**Kusto validation:**
```kusto
DeviceManagementProvider 
| where env_time > ago(1d) 
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == "IntuneDeviceID" 
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| where applicablilityState == "Applicable"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState
```

**Step 2: Device gets SCEP profile**
- OMADM log keywords: "Trying to enroll pending SCEP certificates for user", "Trying to enroll certificate request"
- Validate policyID via "LogicalName_{policyID}" (underscores in logs, dashes in Assist365)

**Step 3: Device contacts NDES server**
- OMADM log keywords: "Sending GetCACaps(ca)", "Sending GetCACert(ca)"
- IIS log keywords: "GetCACert&message=ca", "GetCACaps&message=ca" (Android entries show as "Dalvik")
- Expect HTTP 200 status code
- If non-200: navigate to SCEP Server URL in browser → expected result: HTTP Error 403.0 Forbidden
- Connector Operational log: Event ID 4003 - ScepRequestReceived

**Step 4: Request validated**
- Connector Operational log: Event ID 4004 - ScepVerifySuccess

**Step 5: Certificate issued**
- Connector Operational log: Event ID 4006 - ScepIssuedSuccess
- OMADM log keywords: "pkiStatus=SUCCESS", "CERT_ACCESS_GRANTED"
- Kusto validation via IntuneEvent table, Col1: "Adding Cert value:"
- View cert on device: use X509 Certificate Viewer Tool (push via Managed Google Play)
- BYOD cert name format: User{Thumbprint}

## 2. Android Device Owner (DO) - Fully Managed/Dedicated/COPE

### Key Differences from BYOD
- DO uses **Intune App** (not Company Portal) and **CloudExtension logs** (not OMADM)
- **DeviceManagementProvider table NOT available** in Kusto for DO

### Logs to Collect

**Server side:** Same as BYOD
**Android device:** Intune App CloudExtension logs

### SCEP Deployment Steps (DO)

**Step 1: Deploy Trusted Certificate chain**
- Same root/intermediate requirement as BYOD
- CloudExtension log keyword: "Successfully installed CA certificate"
- Kusto: use IntuneEvent table with search for policyID

**Step 2: Device gets SCEP profile**
- CloudExtension log keywords: "ScepStateMachine", "Loop initialized"

**Step 3: Device contacts NDES server**
- CloudExtension log keyword: "AcquireScepCertEffectHandler"
- IIS log: same as BYOD (Dalvik entries)
- Connector: Event ID 4003

**Step 4: Request validated**
- Connector: Event ID 4004 - ScepVerifySuccess

**Step 5: Certificate issued**
- Connector: Event ID 4006 - ScepIssuedSuccess
- CloudExtension log keywords: "CertAcquiredEvent", "CertSavedEvent", "CertAccessGrantedEvent"
- Kusto: IntuneEvent table, search thumbprint → "Updated thumbprint cache for policy"
- View cert: Settings > Certificates > User certificates (name: "User {policyID}")
- For details: use X509 Certificate Viewer Tool
