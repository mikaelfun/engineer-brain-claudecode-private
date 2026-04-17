---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/Troubleshooting/Windows"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FNDES%20and%20SCEP%2FTroubleshooting%2FWindows"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows SCEP Certificate Troubleshooting

### Logs to Collect

**Server side (NDES server):**
- Intune Certificate Connector logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`

**Windows device:**
- Event Viewer: Application and Services > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- SyncMLViewer tool (real-time XML sync viewer): https://github.com/okieselbach/SyncMLViewer

### SCEP Deployment Steps

**Step 1: Deploy Trusted Certificate chain**
- Windows does NOT require full chain but strongly recommended (WiFi/Radius)
- SyncML log keyword: "RootCATrustedCertificates" for thumbprints
- Root stored under `RootCATrustedCertificates/Root/`, Intermediate under `RootCATrustedCertificates/CA/`
- View on device: MMC > Certificates (Local Computer) > Trusted Root / Intermediate CAs

**Kusto validation:**
```kusto
DeviceManagementProvider 
| where env_time > ago(1d) 
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == "IntuneDeviceID" 
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| where applicablilityState == "Applicable"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState, EventMessage
```

**Step 2: Device gets SCEP profile**
- SyncML keyword: "ClientCertificateInstall" with full SCEP profile XML details
- Event Viewer keyword: Event 306 - "SCEP: CspExecute for UniqueId"
- Validate policyID: `LogicalName_{policyID}` (underscores in logs, dashes in Assist365)

**Step 3: Device contacts NDES server**
- Event Viewer keyword: Event 36 - "SCEP: Certificate request generated successfully"
- IIS log: Windows entries show as "Mozilla/4.0+(compatible;+Win32;+NDES+client)"
- Expect HTTP 200. If non-200: browse SCEP Server URL → expected: HTTP 403.0 Forbidden
- Connector: Event ID 4003 - ScepRequestReceived

**Step 4: Request validated**
- Connector: Event ID 4004 - ScepVerifySuccess

**Step 5: Certificate issued**
- Connector: Event ID 4006 - ScepIssuedSuccess
- SyncML keyword: "ClientCertificateInstall...Enroll"
- Event Viewer keywords:
  - Event 39: "SCEP: Certificate installed successfully"
  - Event 256: "com.microsoft:mdm.SCEPcertinstall.result"
  - Event 309: "SCEP: InstallFromRegEntries" (includes certificate thumbprint)
- View cert on device: MMC > Certificates snap-in:
  - User cert: Certificates - Current User > Personal > Certificates
  - Device cert: Certificates (Local Computer) > Personal > Certificates
