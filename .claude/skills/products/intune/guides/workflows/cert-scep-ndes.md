# Intune SCEP / NDES 证书部署与排查 — 排查工作流

**来源草稿**: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md, ado-wiki-NDES-SCEP-Overview.md, ado-wiki-SCEP-Android-Troubleshooting.md, ado-wiki-SCEP-Apple-Troubleshooting.md, ado-wiki-SCEP-Windows-Troubleshooting.md, onenote-SCEP-NDES-Workflow.md, onenote-macos-scep-renewal-kusto.md, onenote-ndes-scep-configuration-guide.md, onenote-ndes-scep-configuration.md, onenote-ndes-scep-lab-setup.md, onenote-scep-ndes-architecture.md, onenote-scep-ndes-troubleshooting.md, onenote-scep-ndes-workflow-reference.md, onenote-scep-renew-vpn-log-analysis.md, onenote-scep-troubleshooting-workflow.md
**Kusto 引用**: certificate.md
**场景数**: 76
**生成日期**: 2026-04-07

---

## Portal 路径

- `Portal > Menu > Settings > Verbose Logging ON > Menu > Help > Send logs`
- `Intune > Certificate Connectors > Admin/Operational`

## Scenario 1: Option A: HighLevelCheckin
> 来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
HighLevelCheckin("<IntuneDeviceID>", ago(5d))
| where PolicyType == "ClientAuthCertificate"
| project env_time, PolicyName, PolicyApplicability, PolicyCompliance, PolicyType, PolicyId
```

## Scenario 2: Option B: DeviceManagementProvider
> 来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time >= ago(15d)
| where typeAndCategory == "ConfigurationPolicy;ClientAuthCertificate" or typeAndCategory == "ConfigurationPolicy;TrustedRootCertificate"
| where deviceId == "<IntuneDeviceID>"
| where applicablilityState == "Applicable"
| project env_time, userId, PolicyName=name, PolicyType=typeAndCategory, Applicability=applicablilityState, Compliance=reportComplianceState, deviceId=ActivityId, PolicyID=['id'], message, TaskName, name
| order by env_time desc
```

## 3. Policy Assignment & Intent Validation (Cross-cluster)
Use Deployment_Snapshot + DeploymentStatus_Snapshot + CMPolicyAssignment_Snapshot with AccountID and PolicyID to verify assignment across EU and Non-EU clusters.

## 4. Android Fully Managed/Dedicated (No DMP data)
```kusto
IntuneEvent
| where DeviceId == "<IntuneDeviceID>"
| project env_time, ComponentName, ApplicationName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3
```

## 5. Transaction ID Deep Dive
```kusto
IntuneEvent
| where env_time > ago(2d)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "<TransactionID>"
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```
- Col3: EKU details from SCEP config
- Col4: Certificate thumbprint

## 6. SCEP Events by Device ID (without Transaction ID)
```kusto
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'RACerts'
| where ServiceName == "StatelessCertDeliveryService"
| where DeviceId == "<IntuneDeviceID>"
| where * contains "SCEP"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId, ScenarioInstanceId
```

## 7. Verify & Notify Requests (Account-wide)
```kusto
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where SourceNamespace == "IntunePE"
| where AccountId == "<AccountID>"
| where ApplicationName == "RACerts"
| where ColMetadata startswith_cs "transactionId;callerInfo"
| project env_time, ComponentName, EventUniqueName, Col1, Col2, Col3, Col4, DeviceId, UserId, RelatedActivityId, cV
```

## 8. Mac Devices Approaching SCEP Cert Expiry
```kusto
DeviceManagementProvider
| where env_time > ago(1d)
| where accountId == "<AccountID>"
| where message contains "Finishing SCEP expiration threshold calculation with threshold = '24'" or message contains "threshold = '23'" or message contains "threshold = '22'" or message contains "threshold = '21'"
| distinct deviceId
| join kind=inner Device_Snapshot on $left.deviceId == $right.DeviceId
| where Model contains "Mac"
| distinct DeviceId, Manufacturer, Model
```

## Scenario 3: 9. Android Fully Managed SCEP Deployment
> 来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'AndroidSync'
| where ComponentName in ("StatelessAndroidSyncService", "StatelessGooglePolicyService")
| where DeviceId == "<IntuneDeviceID>"
| where Col1 startswith "SCEP" or Col1 startswith "GetScepEncryptedCertRequestToken" or Col1 startswith "GetEncryptedCertRequestToken" or Col1 contains "PolicyDeploymentMessage" or Col1 endswith "PublicKeyCert."
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, AccountId, DeviceId, UserId, Pid, BuildVersion, env_cloud_name, cV, env_cv, ServiceName, ActivityId
```

## Scenario 4: Step 1: Check dynamic values before resolution
> 来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > datetime(start)
| where AccountId == "<AccountID>"
| where DeviceId contains_cs "<DeviceID>"
| where ApplicationName == "RACerts"
| where EventUniqueName in ("GenerateMachineSubjectNameAsync-PrintSAN","ResolveScepRequestVariables","ScepGetConfigurationProfileSync","GetStringHash")
| extend SubjectName_DynamicValue = iff(Col1 startswith_cs "Resolving SCEP", extract("(SubjectNameFormat: .+), SubjectAlternativeNameFormatType",1,Col1),"")
| extend SubjectAlternativeName_ActualValue = iff(Col1 startswith_cs "Formatted SAN:", extract("Formatted SAN: (.+)",1,Col1),"")
| project env_time, Col1, SubjectName_DynamicValue, SubjectAlternativeName_ActualValue, DeviceId, UserId, EventUniqueName, cV
```

## Scenario 5: Step 2: Check resolution errors by cV
> 来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where cV == "<cV_value>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, UserId, EventUniqueName, ComponentName
```

## Key Notes
- Always verify Trusted Root profile is also targeted when SCEP/PKCS fails
- Multiple connectors: check ConnectorID to identify which server handles the request
- VPN/WiFi profile dependencies may affect certificate delivery if targeting differs

## Scenario 6: Log Collection
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Run NDES Validator script:
```powershell
Invoke-WebRequest https://aka.ms/NDESValidatorPS1 -outfile NDESValidator.ps1
Invoke-WebRequest https://aka.ms/NDESValidatorcsv -outfile ResultMessages.csv
PowerShell -ExecutionPolicy Bypass -File .\NDESValidator.ps1
```

## Scenario 7: IIS Log Analysis
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Check for expected flow in IIS logs (C:\inetpub\logs\LogFiles\W3SVC1):
1. GET CACert message
2. GET GetCACaps message
3. POST PKIOperation

If no requests → networking issue blocking device access to NDES.

## Scenario 8: NDES URL Validation
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- GetCACert: `https://ndes.externalfqdn.com/certsrv/mscep?operation=GetCACert&message=MyDeviceID`
- GetCACaps: `https://ndes.externalfqdn.com/certsrv/mscep?operation=GetCACaps&message=MyDeviceID`

## Scenario 9: IIS SSL Settings
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Default WebSite: Require SSL, Client certificates: Ignore
- CertificateRegistrationSvc: Require SSL, Client certificates: Require

## Scenario 10: SSL Certificate Requirements
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Subject name: External name in Common Name format
- SAN: External + Internal name in DNS name format
- Usage: Server Authentication

## Scenario 11: Only GetCACert Received (No GetCACaps/PKIOperation)
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

→ Most likely a certificate chain issue. Capture Android device logs for most information.

## Scenario 12: CA Reachability (TCAInfo)
> 来源: ado-wiki-NDES-SCEP-Overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- CA not reachable → Transfer to PKI team
- Template not shown in TCAInfo → Template not published on CA

## SME Contacts
- ATZ: Carlos Jenkins, Jesus Santaella, Martin Kirtchayan, David Meza Umana, Manoj Kulkarni
- EMEA: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad, Ammar Tawabini, Jordi Segarra
- APAC: Xinkun Yang, Joe Yang, Conny Cao, Gaurav Singh
- Teams channel: Device Config - Certificates, Email, VPN and Wifi
- Full SME list: https://aka.ms/IntuneSMEs

## Scenario 13: Logs to Collect
> 来源: ado-wiki-SCEP-Android-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Server side (NDES server):**
- Microsoft Intune Connector Logs: Event Viewer > Application and Services Logs > Microsoft > Intune > Certificate Connectors > Admin/Operational
- IIS Logs: `%SystemDrive%\inetpub\logs\LogFiles\W3SVC1\`

**Android device:**
- Company Portal OMADM logs: Company Portal > Menu > Settings > Verbose Logging ON > Menu > Help > Send logs

## Scenario 14: SCEP Deployment Steps (BYOD)
> 来源: ado-wiki-SCEP-Android-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 15: Key Differences from BYOD
> 来源: ado-wiki-SCEP-Android-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- DO uses **Intune App** (not Company Portal) and **CloudExtension logs** (not OMADM)
- **DeviceManagementProvider table NOT available** in Kusto for DO

## Scenario 16: SCEP Deployment Steps (DO)
> 来源: ado-wiki-SCEP-Android-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 17: SCEP Deployment Steps (iOS)
> 来源: ado-wiki-SCEP-Apple-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 18: Key Differences from iOS
> 来源: ado-wiki-SCEP-Apple-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- macOS also does NOT require full chain but strongly recommended
- macOS also uses Console logs (Company Portal has no cert info)
- macOS Console log keywords differ from iOS

## Scenario 19: SCEP Deployment Steps (macOS)
> 来源: ado-wiki-SCEP-Apple-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 20: SCEP Deployment Steps
> 来源: ado-wiki-SCEP-Windows-Troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 21: Workflow Steps
> 来源: onenote-SCEP-NDES-Workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Profile Creation & Assignment**: Admin creates a *SCEP certificate profile* and a *Trusted Certificate profile* in Intune console, assigns to device group.
   - Trusted Certificate profile delivers the actual root certificate
   - SCEP certificate profile tells the device *how* to request the certificate (not the certificate itself)

2. **Device Contacts NDES**: When device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC with Intune Certificate Connector). Device locates NDES using the URI in the SCEP profile.

3. **Request Validation**: NDES Connector policy module (part of Intune Certificate Connector) validates the request is legitimate.

4. **Forward to CA**: If valid, NDES forwards the certificate request to the Certification Authority (CA).

5. **Certificate Issuance**: CA sends the SCEP certificate back to NDES, which forwards it to the requesting device. Device now has both:
   - Trusted root certificate
   - SCEP certificate
   - Together enabling certificate-based authentication to company resources

6. **Status Reporting**: Intune Certificate Connector reports enrollment status back to the Intune service.

## Scenario 22: Key Points for Troubleshooting
> 来源: onenote-SCEP-NDES-Workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- SCEP profile only contains enrollment instructions, not the certificate itself
- NDES server must be reachable from the device (check URI in SCEP profile)
- Connector policy module validates requests before forwarding to CA
- Both Trusted Root + SCEP profiles must be assigned to the same device group
- Check connector event logs if step 3 (validation) fails
- Check CA issued/failed certificates if step 4-5 fails

## Scenario 23: Scenario
> 来源: onenote-macos-scep-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Troubleshoot macOS device SCEP certificate renewal, verify SSL client certificate authentication, and track certificate issuance.

## Kusto Queries

## Scenario 24: 1. Verify SSL Client Certificate Authentication
> 来源: onenote-macos-scep-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```

**Key output**: Look for `ReceivedCallWithSslClientCertificate,<thumbprint>,CN=<device-id>` followed by `UdaCertificateValidatedSuccessfully`.

## Scenario 25: 2. Track Certificate Renewal Events
> 来源: onenote-macos-scep-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState, newManagementState, newThumbprint
```

## Scenario 26: 3. Track Certificate Issuance
> 来源: onenote-macos-scep-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > datetime(<start>) and env_time < datetime(<end>)
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, env_cloud_environment, ActivityId, env_cloud_roleInstance
```

## Scenario 27: 4. Verify Renewal Success
> 来源: onenote-macos-scep-renewal-kusto.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName, EventUniqueName, ActivityId, Message, ColMetadata, Col1, Col4, Col2, Col3, Col5, Col6
```

## Expected Renewal Flow
1. Device connects with existing SSL client certificate (UDA cert)
2. `FabricAuthenticationModule` validates the certificate -> `UdaCertificateValidatedSuccessfully`
3. `CertificateAuthority` issues new certificate -> `IssueCertSuccess`
4. `EnrollmentSessionManager` processes SCEP renewal challenge -> `TryAddEnrollmentSessionStateDetails_WriteComplete`
5. `EnrollmentLibrary` confirms -> `DeviceRenewalSuccess`

## Key Fields
- **CHALLENGETYPE**: `RenewalScep - 3` indicates renewal (not fresh enrollment)
- **ISRENEWAL**: `True` confirms this is a renewal flow
- **CURRENTCERTIFICATETHUMBPRINT**: The old cert being renewed
- **IssueCertSuccess Col4**: New certificate thumbprint

## Source
Case 2308100060001116

## Scenario 28: 1. NDES Service Account Setup
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Create a dedicated service account in AD (Active Directory Users and Computers)
2. Add the account to local group `IIS_IUSRS` on the NDES computer
3. Grant `Request Certificates` permission on the Enterprise CA Security tab
4. Set SPN: `setspn -s http/<NDES server computer name> <domain>\<NDES service account>`

## Scenario 29: 2. NDES Server Installation
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Add ADCS role via Server Manager → Add Roles and Features
2. Select Network Device Enrollment Service role
3. Post-installation: specify NDES service account and connect Enterprise CA
4. **CA and NDES must be on separate servers**

## 3. NDES Server Configuration

## Scenario 30: IIS Configuration
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Default Website → Request Filtering → Edit Feature Settings
- Set Maximum URL length and Maximum query string to accommodate large SCEP requests

## Scenario 31: Registry Configuration
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` - configure for large HTTP requests
- Without this, devices get: "Experiencing authentication issues" / "The portal is having issues getting authentication tokens"

## Scenario 32: External Publishing
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Publish NDES via Azure Application Proxy or Windows Application Proxy (WAP)
- Configure internal URL as NDES server FQDN
- Note the generated External URL for later use

## Scenario 33: 4. SSL Certificate Setup
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. On Enterprise CA: duplicate `Web Server` template
2. Configure: client + server authentication under Extensions → Application Policies
3. Grant NDES server computer account Read + Enroll on Security tab
4. Subject Name tab: check "Supply in the request"
5. Issue the new template
6. On NDES server: request cert using the new template via MMC
   - Subject name: Common name = NDES internal FQDN
   - SAN: DNS = internal FQDN + external FQDN
7. Bind the SSL cert in IIS on port 443
8. **Restart NDES server**

## 5. NDES Certificate Template

1. On Enterprise CA: duplicate `User` template
2. Subject Name: "Supply in the request"
3. Extensions: ensure Client Authentication
4. Key Usage: un-check "Signature is proof of origin" (required for iOS)
5. Request Handling: do NOT allow private key export
6. Security: grant NDES service account Read + Enroll
7. Cryptography: minimum key size 2048
8. Issue the template

## Scenario 34: Registry Mapping (Critical!)
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

On NDES server: `HKLM\Software\Microsoft\Cryptography\MSCEP`
- `SignatureTemplate` → Signature purpose
- `EncryptionTemplate` → Encryption purpose
- `GeneralPurposeTemplate` → Signature and encryption purpose

Set the value to your template name based on the template's purpose setting.

## Scenario 35: 6. Intune Connector Installation
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Intune Portal → Device Configuration → Certificate Connectors → Add → Download
2. Copy installer to NDES server, run as admin
3. Select the SSL certificate (client/server authentication cert from step 4)
4. Sign in with **Global Administrator or Intune Administrator**
5. **Restart NDES server** after installation

## 7. SCEP Profile in Intune

## Scenario 36: Prerequisites
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Deploy trusted root certificate profile first
- For Android: export root cert from both root CA and issuing CA
- For iOS: only root CA certificate needed
- Command: `certutil -ca.cert C:\root.cer`

## Scenario 37: Key Usage Mapping
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| SCEP Profile Key Usage | Registry Key Read |
|---|---|
| Digital signature | SignatureTemplate |
| Key encipherment | EncryptionTemplate |
| Both | GeneralPurposeTemplate |

## Scenario 38: SCEP Server URL Format
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
https://<external FQDN of NDES server>/certsrv/mscep/mscep.dll
```

## Scenario 39: Common Issues (Cross-reference)
> 来源: onenote-ndes-scep-configuration-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Proxy format error → intune-onenote-099
- Password expired / RPC failure → intune-onenote-100
- TLS 1.2 not enabled → intune-onenote-101
- NDES stops after KB update → intune-onenote-088
- NDES HTTP 500 → intune-onenote-089
- SCEP infrastructure troubleshooting workflow → intune-onenote-094

## Scenario 40: Service Account Setup
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Create AD service account in Active Directory Users and Computers
2. On NDES computer: add account to local **IIS_IUSRS** group (`compmgmt.msc`)
3. On Enterprise CA: add account with **Request Certificates** permission (Security tab)
4. Set SPN: `setspn -s http/<NDES-FQDN> <domain>\<service-account>`
   > **Warning**: Check [MS docs](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/create-domain-user-account-ndes-service-account#verify-whether-its-necessary-to-set-a-service-principal-name-for-ndes) before registering SPN to avoid duplicate SPN issues.

## Scenario 41: NDES Role Installation
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Server Manager → Add Roles and Features → AD CS → Network Device Enrollment Service
2. Post-install: Configure NDES → select service account → connect Enterprise CA
3. **CA and NDES must be on separate servers**

## Phase 2: NDES Server Configuration

## Scenario 42: IIS Long URL Support
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. IIS Manager → Default Website → Request Filtering → Edit Feature Settings
   - If missing: `Install-WindowsFeature Web-Filtering`
2. Set Maximum URL length and Maximum query string to high values
3. Registry: `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` — edit URL/query limits

## Scenario 43: Azure Application Proxy (for external access)
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅

### 排查步骤

1. Azure Portal → Enterprise Applications → Add → On-premises application
2. Internal URL = `https://<NDES-internal-FQDN>/certsrv/mscep/mscep.dll`
3. Note the generated External URL
4. **For 21v (Azure China)**: Install proxy agent with China cloud flag:
   ```cmd
   MicrosoftEntraPrivateNetworkConnectorInstaller.exe ENVIRONMENTNAME=AzureChinaCloud
   ```

## Scenario 44: SSL Certificate
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. On CA: duplicate **Web Server** template → name "NDES SSL certificate"
2. Extensions: include Client + Server Authentication
3. Security: NDES computer account → Read + Enroll
4. Subject Name: Supply in the request
5. On NDES: Request cert with CN = internal FQDN, SAN DNS = internal + external FQDN
6. IIS → Default Web Site → Bindings → Add → HTTPS port 443 with new SSL cert

## Scenario 45: NDES Certificate Template
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. On CA: duplicate **User** template → set display name
2. Subject Name: Supply in the request
3. Extensions: Client Authentication
4. Key Usage: un-check "Signature is proof of origin (nonrepudiation)" for iOS compatibility
5. Request Handling: do NOT allow private key export
6. Security: NDES service account → Read + Enroll
7. Cryptography: minimum key size 2048
8. Issue the template

## Scenario 46: Registry Key Mapping
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

On NDES server: `HKLM\Software\Microsoft\Cryptography\MSCEP`
- **SignatureTemplate** → maps to "Digital signature" key usage in SCEP profile
- **EncryptionTemplate** → maps to "Key encipherment" key usage
- **GeneralPurposeTemplate** → maps to both (Signature and encryption)

Set the template name in the registry key matching your template's purpose.

## Scenario 47: Phase 3: Intune Connector Installation
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download from: Intune Portal → Tenant Administration → Connectors and tokens → Certificate Connectors → Add
2. Run on NDES server with Admin rights, select SCEP features
3. Service account: use NDES service account (needs Admin group + "Log on as a service")
   - `Local Security Policy → Local Policies → User Rights Assignment → Log on as a service`
4. Sign in with **Global Administrator or Intune Administrator**
5. If AAD sign-in loops: turn off IE ESC (Server Manager → Local Server)
6. **Restart NDES server after installation**

## Phase 4: Intune Profile Creation

## Scenario 48: Trusted Certificate Profile
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Export root cert: `certutil -ca.cert C:\root.cer`
- For Android: export from BOTH root CA and issuing CA
- For iOS: only root CA needed

## Scenario 49: SCEP Certificate Profile
> 来源: onenote-ndes-scep-configuration.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Key usage must match registry template mapping
- SCEP Server URL: `https://<external-FQDN>/certsrv/mscep/mscep.dll`
- Link to Trusted Certificate profile
- Assign to target groups

---
*Source: OneNote — Support Tip - How to configure NDES for SCEP certificate deployments in Intune*

## Scenario 50: Step 1: Build and Configure CA
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Install CA on on-premises DC
   - Recommended: [Install CA (2016+)](https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/install-the-certification-authority)
2. Configure CA for NDES per [Microsoft docs](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-scep-configure#configure-the-certification-authority)
3. Create **SCEP Certificate Template** (for device certs — signing/encryption)
4. Create **Server Certificate Template** (optional, for IIS; can use 3rd-party cert instead)
5. Set certificate permissions for NDES service account
6. Allow configurable certificate validity period:
   ```cmd
   certutil -setreg Policy\EditFlags +EDITF_ATTRIBUTEENDDATE
   net stop certsvc
   net start certsvc
   ```
7. Publish the templates in CA

## Scenario 51: Step 2: Install and Configure NDES
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Important**: If publishing NDES to Internet, you need a valid DNS zone. If on-prem domain has different DNS suffix than Azure verified domain, add both DNS names in certificate SAN.

1. Set SPN for NDES service account:
   ```cmd
   setspn -s http/<ndes-server-fqdn> domain\NdesService
   ```
2. Add NDES role on the server
3. Install required IIS features (critical for Connector later):
   - See [Prerequisites](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-prerequisites#general-prerequisites)
4. Configure NDES service with the service account
5. Configure IIS bindings
6. Update registry to point to correct certificate template
7. Restart NDES server
8. **Configure IIS SSL binding** with valid certificate (DigiCert or internal CA)
9. Verify: Browse `https://<server>/certsrv/mscep/mscep.dll` — should show 403 (expected) without cert warning

## Scenario 52: Step 3: Install Certificate Connector
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Internal doc**: [Intune: New Certificate Connector tips and tricks](https://internal.evergreen.microsoft.com/en-us/topic/3364fd81-8bf3-0a5d-9d5c-aad35734d7b4)

1. Download connector: https://go.microsoft.com/fwlink/?linkid=2168535
2. Install on NDES server
3. Connector UI path: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`
   - Shortcut: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Microsoft Intune`
   - If exe not found, re-run installer to access configuration page
4. Configure with domain account (needs local admin rights)
5. Enable SCEP feature in connector

## Scenario 53: Optional: Publish NDES to Internet
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Create external load balancer with NDES server as backend pool
2. Create NAT rule for port 443 only
3. Add A record in DNS zone pointing to load balancer public IP
4. If VNET has NSG, allow test device IP

## Scenario 54: Testing
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
Internal: https://<internal_DNS>/certsrv/mscep/mscep.dll?operation=GetCACaps
External: https://<external_DNS>/certsrv/mscep/mscep.dll?operation=GetCACaps
```
Valid response should return supported CA operations list.

## Scenario 55: Step 4: Create Trusted Certificate Profile
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Export trusted root CA certificate from CA server
   - See [Export Root CA Certificate](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/export-root-certification-authority-certificate)
2. Create Trusted Certificate Profile in Intune admin center
3. Upload the exported root CA certificate
4. Assign to target device/user groups

## Scenario 56: Step 5: Create SCEP Certificate Profile
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

(Configure in Intune admin center, assign to groups)

## Scenario 57: Common Issues
> 来源: onenote-ndes-scep-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Issue | Cause | Fix |
|-------|-------|-----|
| NDES page shows cert warning | IIS SSL binding missing/wrong cert | Reconfigure IIS HTTPS binding |
| Connector install fails | Missing IIS features | Install prerequisites per MS docs |
| GetCACaps returns error | Binding lost after reconfig | Re-bind certificate in IIS, iisreset |

## Scenario 58: High-Level Workflow
> 来源: onenote-scep-ndes-architecture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Admin creates profiles**: A *SCEP certificate* profile and a *Trusted Certificate* profile are created in Intune and assigned to a device.
   - The Trusted Certificate profile delivers the actual root certificate
   - The SCEP certificate profile tells the device *how* to request the SCEP certificate (not the certificate itself)

2. **Device contacts NDES**: When the device receives the SCEP profile, it contacts the NDES server on the customer's internal network (same PC as the Intune Certificate Connector). The device finds the NDES server using the URI in the SCEP Certificate profile.

3. **Request validation**: The NDES Connector policy module (part of the Intune Certificate Connector) validates the request.

4. **Certificate request forwarding**: If valid, the NDES server forwards the certificate request to the Certification Authority (CA).

5. **Certificate delivery**: The CA sends the SCEP certificate back to the NDES server, which forwards it to the device. At this point the device has both:
   - The trusted root certificate
   - The SCEP certificate
   → Ready for certificate-based authentication to company resources.

6. **Status reporting**: The Intune Certificate Connector reports status back to the Intune service.

## Key Points

- NDES server and Intune Certificate Connector run on the **same machine**
- The SCEP URI in the profile must be reachable from the device
- Both Trusted Root CA and SCEP profiles must be deployed (Trusted Root first)
- Certificate-based auth requires both certs in the chain to be valid

---
*Source: OneNote — Intune Workflow: How SCEP and NDES works*

## Scenario 59: Connector Setup
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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
`[来源: onenote-scep-ndes-troubleshooting.md]`

## Scenario 60: 1. Connector Setup Failures
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Missing admin privileges
- Missing Intune admin permission or license
- NDES service account missing "Logon as a service"
- .NET Framework 4.7.2 not installed (error: `Failed to verify payload: NetFx472Redist`)

## Scenario 61: 2. NDES 500 Error - CRL Expired
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Root CA CRL expired even though NDES certs renewed
- Check: PKIVIEW.msc on CA jump server
- Fix: `certutil -crl` on root CA, then `certutil -dspublish -f <CRL> <CA-name>`

## Scenario 62: 3. External URL BadGateway
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Multiple Azure AD App Proxy connectors causing wrong routing
- Fix: Create Application Proxy group with correct connector assignment

## Scenario 63: 4. Hybrid AADJ SCEP Failure
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- KSP set to "Windows Hello for Business" but WHfB enabled via GPO
- Fix: Change KSP to "Enroll to TPM KSP if present, otherwise Software KSP"

## Scenario 64: 5. DCOM Authentication After KB5014702
> 来源: onenote-scep-ndes-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- KB5014702 on CA raises DCOM auth level; NDES on older OS can't match
- Fix: Install KB on NDES or set RequireIntegrityActivationAuthenticationLevel=0

## References

- [Certificate Connector Overview](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-overview)
- [KB5004442 - DCOM Security Feature Bypass](https://support.microsoft.com/en-us/topic/kb5004442)

## Scenario 65: SCEP Certificate Deployment Flow
> 来源: onenote-scep-ndes-workflow-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Admin** creates a SCEP certificate profile and a Trusted Certificate profile in Intune console, assigns to device
   - Trusted Certificate profile delivers the actual trusted root certificate
   - SCEP certificate profile tells the device **how to request** the SCEP certificate (not the cert itself)

2. **Device** receives the SCEP certificate profile and contacts the NDES server using the URI configured in the profile
   - NDES server = same PC with Microsoft Intune Certificate Connector installed
   - Communication is on the customer's internal network

3. **NDES Connector** policy module validates the request is valid

4. **NDES server** forwards the certificate request to the Certification Authority (CA)

5. **CA** issues the SCEP certificate → sends back to NDES → forwards to device
   - Device now has both certificates needed: trusted root + SCEP certificate

6. **Intune Certificate Connector** reports status back to Intune service

## Key Points

- The SCEP certificate profile does NOT contain the certificate — it only contains the request parameters
- The NDES server acts as a proxy between the device and the CA
- Certificate-based authentication requires both the trusted root and the SCEP certificate
- The Intune Certificate Connector handles status reporting back to the Intune cloud service

## Scenario 66: 1. Expiration Threshold Calculation
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: Finishing SCEP expiration threshold calculation with threshold = '19'
```
The threshold (in days) triggers renewal when the certificate is within this many days of expiration.

## Scenario 67: 2. SCEP Profile Reissue
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: NDES SCEP - KeyLength is: 2048, KeyUsage is 5, SAN format is 0, Num of retries is 3
iOSPlugin: Issuing an iOS Command of type InstallProfileCommand
```

## Scenario 68: 3. VPN Profile Listener Triggered
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: Calling listener 'Intune VPN' for change to certificate UUID '...'
iOSPlugin: Certificate payload with UUID '...' change notification was called, issuing an install profile command for payload with identifier Intune VPN.
```
The VPN profile has a dependency on the SCEP certificate. When the cert changes, the VPN profile is automatically reinstalled.

## Scenario 69: 4. Possible Delay
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
iOSPlugin: TryEncryptInstallProfileCommand: ReferencedEncryptedCertRequestIds is null or empty, delaying the install of the profile.
```
This is expected during the renewal window - the VPN profile install is delayed until the SCEP certificate is fully processed.

## Scenario 70: 5. Successful Installation
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Device] Received an iOS command result of type InstallProfile and status 'Acknowledged'
```

## Scenario 71: 6. Post-Renewal Threshold
> 来源: onenote-scep-renew-vpn-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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
`[来源: onenote-scep-renew-vpn-log-analysis.md]`

## Key Identifiers in Logs

- **PayloadUUID**: Maps to the SCEP certificate model (e.g., `ModelName=AC_{accountId}/LogicalName_{guid}`)
- **CmdUUID**: Unique command ID for each InstallProfile command
- **CertificateUsageType**: `1` = client authentication

## Scenario 72: Connector Event Log Sequence
> 来源: onenote-scep-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Event 4003** — Successfully received SCEP request
2. **Event 4006** — Successfully verified SCEP request
3. **Event 4006** — Successfully issued for SCEP request
4. **Event 4008** — Successfully notified SCEP request

## Scenario 73: Connector Setup Failures
> 来源: onenote-scep-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Run connector as Admin** — Always required
- **Admin account** must have Intune admin permission AND Intune license
- **NDES service account** must have "Log on as a service" right
- **.NET Framework 4.7.2** must be installed (error: `NetFx472Redist` cache failure `0x80070490`)

## Scenario 74: SCEP Challenge Expired
> 来源: onenote-scep-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 75: Root CA CRL Expired → NDES 500
> 来源: onenote-scep-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- NDES shows 500 error even after RA cert renewal
- Check with `PKIVIEW.msc` → if CDP of root CA expired
- Fix: On root CA run `certutil -crl`, then publish: `certutil -dspublish -f <CA>.crl <CA-Name>`

## Scenario 76: HAADJ SCEP Fails with WHfB KSP
> 来源: onenote-scep-troubleshooting-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If SCEP profile uses "Windows Hello for Business" as KSP and device enables WHfB via GPO → conflict
- Fix: Change KSP to "Enroll to TPM KSP if present, otherwise Software KSP"

---
*Source: OneNote — NEW Intune Cert SCEP troubleshooting workflow*

---

## Kusto 查询参考

### 查询 1: 证书部署状态查询

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId contains '{deviceId}'
| where * contains "scep" or * contains "pkcs" or * contains "certificate"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, EventMessage, message, TaskName
```
`[来源: certificate.md]`

### 查询 2: SCEP 证书事件查询

```kql
IntuneEvent
| where env_time > ago(3h)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "scep"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId
```
`[来源: certificate.md]`

### 查询 3: 检查 SCEP/Trusted Root Profile 部署状态

```kql
let _deviceId = '{deviceId}';
let _startTime = datetime({startTime});
let _endTime = datetime({endTime});

DeviceManagementProvider 
| where env_time between (_startTime .. _endTime)
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == _deviceId
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState, EventMessage
| order by env_time desc
```
`[来源: certificate.md]`

### 查询 4: 证书指纹查询

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId == '{deviceId}' or userId == '{userId}'
| where message contains '{thumbprint}'
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```
`[来源: certificate.md]`

### 查询 5: 依赖配置文件查询

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where message contains "dependent profile"
| project env_time, ActivityId, cV, message
```
`[来源: certificate.md]`

### 查询 6: 使用 IntuneEvent 查询证书过期 (推荐)

```kql
let accountId = '{accountId}';

// 获取 macOS 设备列表 (platform=10)
let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // 10=macOS, 7=iPhone, 8=iPad
| where deviceId != ""
| summarize by deviceId;

// 从 GetDeviceIdentityAsync 事件提取证书信息
IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (macDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend CertStartDate = todatetime(Col2)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```
`[来源: certificate.md]`

### 查询 7: 使用 DeviceManagementProvider 查询证书过期

```kql
let accountId = '{accountId}';

let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // macOS
| where deviceId != ""
| summarize by deviceId;

DeviceManagementProvider
| where env_time > ago(14d)
| where accountId == accountId
| where ActivityId in (macDevices)
| where message contains "Enroll cert expiry time:"
| extend CertExpiryStr = extract("Enroll cert expiry time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| extend CertStartStr = extract("Enroll cert start time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| summarize arg_max(env_time, CertExpiryStr, CertStartStr) by DeviceId=ActivityId
| extend CertExpiryDate = todatetime(CertExpiryStr)
| extend CertStartDate = todatetime(CertStartStr)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```
`[来源: certificate.md]`

### 查询 8: 查询即将过期的设备（60天内）

```kql
let accountId = '{accountId}';
let warningDays = 60;

let appleDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize by deviceId;

IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (appleDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| where DaysUntilExpiry <= warningDays and DaysUntilExpiry >= 0
| project DeviceId, CertExpiryDate, DaysUntilExpiry, LastCheckedTime = env_time
| order by DaysUntilExpiry asc
```
`[来源: certificate.md]`

### 1. Check Intune Certificate Connector Version

```kql
let Account_ID = "<AccountID>";
let start_time = datetime(YYYY-MM-DD HH:MM:SS);
let End_time = datetime(YYYY-MM-DD HH:MM:SS);
let AMSU=toscalar(DeviceManagementProvider | where accountId == Account_ID | project env_cloud_name | take 1);
IntuneEvent
| where env_time between (start_time .. End_time)
| where SourceNamespace == "IntunePE"
| where env_cloud_name == AMSU
| where AccountId == Account_ID
| where ApplicationName == "RACerts"
| where ServiceName == "StatelessPkiConnectorService"
| where EventUniqueName == "UploadConnectorHealthLogs"
| where ColMetadata == "AgentId;MessageType;Parameters;InstanceId;PkiConnectorRole;"
| where Col2 == "AgentInformation"
| extend Connector_version = extract('ConnectorVersion":"(.+?)"}', 1, Col3)
| extend Enrolled_Date = extract('EnrolledDate":"(.+?)","EncryptionKeyConfigured', 1, Col3)
| project env_time, Connector_ID = Col1, Connector_version, Enrolled_Date
| order by env_time asc
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### Option A: HighLevelCheckin

```kql
HighLevelCheckin("<IntuneDeviceID>", ago(5d))
| where PolicyType == "ClientAuthCertificate"
| project env_time, PolicyName, PolicyApplicability, PolicyCompliance, PolicyType, PolicyId
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### Option B: DeviceManagementProvider

```kql
DeviceManagementProvider
| where env_time >= ago(15d)
| where typeAndCategory == "ConfigurationPolicy;ClientAuthCertificate" or typeAndCategory == "ConfigurationPolicy;TrustedRootCertificate"
| where deviceId == "<IntuneDeviceID>"
| where applicablilityState == "Applicable"
| project env_time, userId, PolicyName=name, PolicyType=typeAndCategory, Applicability=applicablilityState, Compliance=reportComplianceState, deviceId=ActivityId, PolicyID=['id'], message, TaskName, name
| order by env_time desc
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 4. Android Fully Managed/Dedicated (No DMP data)

```kql
IntuneEvent
| where DeviceId == "<IntuneDeviceID>"
| project env_time, ComponentName, ApplicationName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 5. Transaction ID Deep Dive

```kql
IntuneEvent
| where env_time > ago(2d)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "<TransactionID>"
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 6. SCEP Events by Device ID (without Transaction ID)

```kql
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'RACerts'
| where ServiceName == "StatelessCertDeliveryService"
| where DeviceId == "<IntuneDeviceID>"
| where * contains "SCEP"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId, ScenarioInstanceId
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 7. Verify & Notify Requests (Account-wide)

```kql
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where SourceNamespace == "IntunePE"
| where AccountId == "<AccountID>"
| where ApplicationName == "RACerts"
| where ColMetadata startswith_cs "transactionId;callerInfo"
| project env_time, ComponentName, EventUniqueName, Col1, Col2, Col3, Col4, DeviceId, UserId, RelatedActivityId, cV
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 8. Mac Devices Approaching SCEP Cert Expiry

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where accountId == "<AccountID>"
| where message contains "Finishing SCEP expiration threshold calculation with threshold = '24'" or message contains "threshold = '23'" or message contains "threshold = '22'" or message contains "threshold = '21'"
| distinct deviceId
| join kind=inner Device_Snapshot on $left.deviceId == $right.DeviceId
| where Model contains "Mac"
| distinct DeviceId, Manufacturer, Model
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### 9. Android Fully Managed SCEP Deployment

```kql
IntuneEvent
| where env_time > ago(9d)
| where ApplicationName == 'AndroidSync'
| where ComponentName in ("StatelessAndroidSyncService", "StatelessGooglePolicyService")
| where DeviceId == "<IntuneDeviceID>"
| where Col1 startswith "SCEP" or Col1 startswith "GetScepEncryptedCertRequestToken" or Col1 startswith "GetEncryptedCertRequestToken" or Col1 contains "PolicyDeploymentMessage" or Col1 endswith "PublicKeyCert."
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, AccountId, DeviceId, UserId, Pid, BuildVersion, env_cloud_name, cV, env_cv, ServiceName, ActivityId
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### Step 1: Check dynamic values before resolution

```kql
IntuneEvent
| where env_time > datetime(start)
| where AccountId == "<AccountID>"
| where DeviceId contains_cs "<DeviceID>"
| where ApplicationName == "RACerts"
| where EventUniqueName in ("GenerateMachineSubjectNameAsync-PrintSAN","ResolveScepRequestVariables","ScepGetConfigurationProfileSync","GetStringHash")
| extend SubjectName_DynamicValue = iff(Col1 startswith_cs "Resolving SCEP", extract("(SubjectNameFormat: .+), SubjectAlternativeNameFormatType",1,Col1),"")
| extend SubjectAlternativeName_ActualValue = iff(Col1 startswith_cs "Formatted SAN:", extract("Formatted SAN: (.+)",1,Col1),"")
| project env_time, Col1, SubjectName_DynamicValue, SubjectAlternativeName_ActualValue, DeviceId, UserId, EventUniqueName, cV
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### Step 2: Check resolution errors by cV

```kql
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where cV == "<cV_value>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, UserId, EventUniqueName, ComponentName
```
`[来源: ado-wiki-Kusto-SCEP-PKCS-Troubleshooting.md]`

### SCEP Deployment Steps (BYOD)

```kql
DeviceManagementProvider 
| where env_time > ago(1d) 
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == "IntuneDeviceID" 
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| where applicablilityState == "Applicable"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState
```
`[来源: ado-wiki-SCEP-Android-Troubleshooting.md]`

### 1. Verify SSL Client Certificate Authentication

```kql
IntuneEvent
| where env_time between (datetime(<start>) .. datetime(<end>))
| where SourceNamespace == "IntuneCNP"
| where ComponentName == "FabricAuthenticationModule"
| where ServiceName == "DeviceGatewayProxy"
| where Col3 has '<intune-device-id>'
| extend deviceId = extract("DeviceId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| extend accountId = extract("AccountId=([[:alnum:]-_.]+)", 1, Col3, typeof(string))
| extend userId = extract("UserId=([[:alnum:]-_.]+),", 1, Col3, typeof(string))
| where deviceId == '<intune-device-id>'
| project env_time, Col3
```
`[来源: onenote-macos-scep-renewal-kusto.md]`

### 2. Track Certificate Renewal Events

```kql
DeviceLifecycle
| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState, newManagementState, newThumbprint
```
`[来源: onenote-macos-scep-renewal-kusto.md]`

### 3. Track Certificate Issuance

```kql
IntuneEvent
| where env_time > datetime(<start>) and env_time < datetime(<end>)
| where ServiceName == "CertificateAuthority"
| where ActivityId == "<intune-device-id>"
| where EventUniqueName startswith "CosmosPutCert"
| project env_time, ServiceName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, env_cloud_environment, ActivityId, env_cloud_roleInstance
```
`[来源: onenote-macos-scep-renewal-kusto.md]`

### 4. Verify Renewal Success

```kql
IntuneEvent
| where env_time > ago(90d)
| where DeviceId == "<intune-device-id>"
| where * contains "<certificate-thumbprint>"
| project env_time, env_cloud_name, ComponentName, ApplicationName, EventUniqueName, ActivityId, Message, ColMetadata, Col1, Col4, Col2, Col3, Col5, Col6
```
`[来源: onenote-macos-scep-renewal-kusto.md]`

---

## 判断逻辑参考

### 5. Transaction ID Deep Dive

| where env_time > ago(2d)
| where SourceNamespace == "IntunePE"
| where ServiceName == "StatelessScepRequestValidationService"
| where Col1 == "<TransactionID>"
| project ActivityId, env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId

### 6. SCEP Events by Device ID (without Transaction ID)

| where env_time > ago(9d)
| where ApplicationName == 'RACerts'
| where ServiceName == "StatelessCertDeliveryService"
| where DeviceId == "<IntuneDeviceID>"
| where * contains "SCEP"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId, ScenarioInstanceId

### Step 2: Check resolution errors by cV

| where env_time between (datetime(start)..datetime(end))
| where cV == "<cV_value>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, DeviceId, UserId, EventUniqueName, ComponentName

### 2. Track Certificate Renewal Events

| where TaskName == "EnrollmentRenewDeviceEvent"
| where deviceId == '<intune-device-id>'
| project env_time, TaskName, oldThumbprint, oldManagementState, newManagementState, newThumbprint

### Event ID Ranges

| Range | Category |
|-------|----------|
| 0001-0999 | General (not single scenario) |
| 1000-1999 | PKCS |
| 2000-2999 | PKCS Import |
| 3000-3999 | Revoke |
| 4000-4999 | SCEP |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
