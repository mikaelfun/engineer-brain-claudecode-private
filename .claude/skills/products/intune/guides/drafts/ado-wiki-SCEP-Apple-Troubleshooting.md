---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/Troubleshooting/Apple"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FNDES%20and%20SCEP%2FTroubleshooting%2FApple"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Apple SCEP Certificate Troubleshooting (iOS & macOS)

## 1. iOS Profiles

### Logs to Collect

**Server side (NDES server):**
- Intune Certificate Connector logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`

**iOS device:**
- Company Portal logs do NOT contain certificate info for iOS
- Use Console logs (live capture during device sync):
  - Best: connect to macOS device for complete debug logs
  - Alternative: internal tool for Windows PC (limited)

### SCEP Deployment Steps (iOS)

**Step 1: Deploy Trusted Certificate chain**
- iOS does NOT require full chain, but strongly recommended (especially for WiFi/Radius)
- Console log keyword: `'94 installed` for trusted cert thumbprints
- Root = `credentials`, Intermediate = `pkcs1credentials`

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
- Console log keyword: "Beginning profile installation"
- Validate policyID: `LogicalName_{policyID}` (underscores in logs, dashes in Assist365)

**Step 3: Device contacts NDES server**
- Console log keyword: "GetCACaps"
- IIS log: iOS entries show as "Darwin"
- Expect HTTP 200. If non-200: browse SCEP Server URL → expected: HTTP 403.0 Forbidden
- Connector: Event ID 4003 - ScepRequestReceived

**Step 4: Request validated**
- Connector: Event ID 4004 - ScepVerifySuccess

**Step 5: Certificate issued**
- Connector: Event ID 4006 - ScepIssuedSuccess
- Console log keyword: `'94 installed`
- View all profiles: keyword `Installed profiles`
- View cert on device: Settings > General > VPN & Device Management > Management Profile > More Details > SCEP DEVICE IDENTITY CERTIFICATES
- NOTE: iOS may show duplicate SCEP certs (one per dependent profile) - by design

## 2. macOS Profiles

### Key Differences from iOS
- macOS also does NOT require full chain but strongly recommended
- macOS also uses Console logs (Company Portal has no cert info)
- macOS Console log keywords differ from iOS

### Logs to Collect
**Server side:** Same as iOS
**macOS device:** Console logs (live capture during sync)

### SCEP Deployment Steps (macOS)

**Step 1: Deploy Trusted Certificate chain**
- Console log keywords: `InstallProfile`, `InstallPayload`, `Installed configuration profile`
- Root = `Credential Profile`, Intermediate = `PKCS1 Credential Profile`

**Step 2: Device gets SCEP profile**
- Console log keyword: "InstallProfile" with SCEP profile name

**Step 3: Device contacts NDES server**
- Console log keyword: "MDM_SCEP_Enroll"
- Shows Subject and SubjectAltName details in log
- IIS log: macOS entries show as "Darwin" + "CertificateService"
- Connector: Event ID 4003

**Step 4: Request validated**
- Connector: Event ID 4004 - ScepVerifySuccess

**Step 5: Certificate issued**
- Connector: Event ID 4006 - ScepIssuedSuccess
- Console log keyword: "Installed configuration profile"
- View cert: Settings > Privacy & Security > Profiles (Management Profile) + Keychain Access > System > Certificates
- NOTE: macOS may show duplicate SCEP certs (one per dependent profile) - by design
