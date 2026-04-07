---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy Connector cannot be installed"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20Connector%20cannot%20be%20installed"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy Connector - Installation Troubleshooting

## Background

Three installation options:
1. Normal installation guided by the installer
2. Silent installation with username/password (known issue: silent registration with credentials may fail)
3. Silent installation with token - advantage: if connector server cannot reach login.microsoftonline.com, token can be obtained on a different computer

### Installation Phases
1. Files copied to install folder (`X:\Program Files\Microsoft Entra private network connector\` & updater folder)
2. Authentication / Authorization
3. Connector registration (SSL Client Certificate creation)

Registration endpoint: `https://{TENANTID}.registration.msappproxy.net/register/RegisterConnector`
The installer uses the outbound proxy configured in the context of the user running the installer.

### Possible Root Causes
- Network issues / network configuration
- Problems with the registration account
- Browser configuration issues

## Troubleshooting Steps

> The error message from the connector installer might be misleading. Follow these steps regardless of the displayed error.

### 1. Subscription Check
Requires valid Entra Premium P1 or P2 license.
If license issue: Portal shows "EID Premium or Basic License is required for access to ApplicationProxy."
Check licenses in ASC.

### 2. "Enable application proxy" Button Grayed Out
This is **expected behavior** when no connector is registered yet. After first successful connector registration, the service gets enabled.

### 3. Supported Operating Systems
- Windows Server 2012 R2
- Windows Server 2016
- Windows Server 2019 and later

### 4. Connector Version
Check: `MicrosoftEntraPrivateNetworkConnectorInstaller.exe` -> right click -> Properties -> Details -> File Version.
Ensure latest version is installed.

### 5. .NET Framework Version
Starting from connector version 1.5.3437.0, .NET 4.7.1 or greater is required.
**Typical error:** "Time out has expired and the operation has not been completed."
May not be installed by default on older OS (Server 2012 R2, 2016).

### 6. SSL Settings
Verify SSL settings based on TLS requirements section in Microsoft docs.

### 7. Root CA Certificates
Required root certificates in certlm.msc Root Certification Authorities (local computer store):

| Common name | Thumbprint (SHA1) |
|--|--|
| DigiCert Global Root G2 | df3c24f9bfd666761b268073fe06d1cc8d4f82a4 |
| DigiCert Global Root CA | a8985d3a65e5e5c4b2d7d66d40c6dd2fb19c5436 |

### 8. Account Validation
- Cannot be a guest user
- Must be Global Administrator or Application Administrator in the target tenant

### 9. Sign-in Validation
User must be successfully authenticated to get a token for the App Proxy Connector (app ID: `55747057-9b5d-4bd4-b387-abf52a8bd489`).

Check in ASC Sign-ins:
- **Silent install** → check under Non-Interactive User
- **GUI install** → check under Interactive User

### 10. Checking Registration in Kusto

```kql
RegistrationRegisterOperationEvent
| where env_time > ago(1h) and subscriptionId == "REPLACE_WITH_TENANTID" and feature == "ApplicationProxy"
| project operationName, operationType, connectorId, SourceNamespace, userAgent, resultType
```

- Consider Kusto log population delay
- No record in output → registration request did not reach Entra (network/auth issue)
- resultType not Success → investigate further, start @Ava request in MEAP Teams channel

### 11. Network Requirements

> No official troubleshooter tool currently exists for testing connectivity. The old tool is deprecated.

Verify with customer:
- Does the server use an outbound proxy? If yes, configure connector to use it
- If direct internet access: TCP 80 / TCP 443 open for outbound communication to Entra endpoints
- SSL inspection for outbound traffic → must be disabled
- Can connector access URLs documented in the Microsoft docs prerequisites article?
