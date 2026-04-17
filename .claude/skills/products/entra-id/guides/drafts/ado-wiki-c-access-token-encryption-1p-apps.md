---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/First_Party_Applications/How to/Access Token Encryption using auto rolled Entra managed keys for 1P Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FFirst_Party_Applications%2FHow%20to%2FAccess%20Token%20Encryption%20using%20auto%20rolled%20Entra%20managed%20keys%20for%201P%20Apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Access Token Encryption with Entra Managed Keys for 1P Apps

## Feature Overview

Auto Key Rollover policy allows resource API developers to receive encrypted access tokens using symmetric keys automatically managed by Microsoft Entra. Initially targets GCC High (Arlington) cloud.

**Key dates:**
- Oct 1, 2024: Communications sent to non-compliant 1P app owners in GCC-High
- Jan 15, 2025: Audience claim `aud` format changes from URI to AppID GUID for Microsoft Graph tokens

## Troubleshooting Impact

When auto token encryption is enabled:
- Access token payload and signature **cannot be decoded** at jwt.ms
- Only the access token **header** is viewable
- Claims like `aud, iss, exp, acr, xms_cc` are no longer visible
- Alternative decoders: [CalebB JWT Decode](https://calebb.net) or [JWT.IO](https://jwt.io) may decode the header

## Client Application Impact

Client apps that inspect/parse access tokens (anti-pattern) may fail when encryption is enforced. Access tokens should be treated as opaque strings by client applications.

## Distinguish Encryption Types (in Fiddler)

| Type | Pattern |
|------|---------|
| Auto token encryption | Double dot within the token |
| Manual token encryption | Single dot within the token |

## Check 1P App Token Encryption Status

1. Identify the `appId` from the `aud` claim:
   - ASC Sign-in event Details → `appId` property
   - Authentication Diagnostic → Expert view → Diagnostic Logs → filter "Application attributes report for audience"

2. Locate app in [AAD-FirstPartyApps](https://aka.ms/entra/appreg)

### PROD Status

Check `AppReg.Parameters.Arlington.json`:
- Look at `api.tokenEncryptionSetting.scheme` (e.g., "automatic")

### ROLLOUT Status

Check `AppReg.Parameters.Production.json` → `approllouts` section:
- `isActive`, `rolloutScope`, `percentOfTenants`, `percentOfUsers`

## 1P Adoption Dashboard

[TokenEncryptionStatus Dashboard](https://aka.ms/token-encryption/dash)
- Shows adoption progress of individual 1P apps in GCC High
- Identifies affected client IDs and their target resource APIs
- Identifies resource app owners

**Access**: Request Reader access to [Security CxE Shared Services](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/securitycxed-mnwm)

## Key Rotation Types

### Manual (Legacy)
- Public encryption cert in `keyCredentials` with `tokenEncryptionKeyId`
- Developer manages key rotation manually
- Prone to errors and outages

### Automatic (New)
- ESTS manages the encryption key
- `tokenEncryptionSetting.scheme: "automatic"`
- MISE pipeline obtains DEK from ESTS, decrypts and validates token

## Case Handling

1. Identify the `aud` claim appId from ASC Authentication Diagnostic
2. Find the API owner via [Token Encryption Dashboard](https://aka.ms/token/encryption/dash) or [AAD-FirstPartyApps](https://aka.ms/entra/appreg) → owners.txt
3. Contact AppID owner (CC SureshJa)
4. Engage the support team for the 1P API to file ICM

## ICM

### Encryption token management issues
- SAP: **Azure/Microsoft Entra App Integration and Development/App Registrations/Certificates & Client Secrets Configuration in App Registrations**
- Owning Service: AAD Applications
- Owning Team: AAD Application model

### 1P Application issues
- Create ICM with the 1P application's engineering team
- Identify owner via 1P Adoption Dashboard

## Sovereign Cloud

Currently GCC High only; GCC planned; PROD possible in future.

## Training

Deep Dive 218606 - Token Encryption with Entra managed keys
- Format: Self-paced eLearning (53 min)
- Course: [QA](https://aka.ms/AAs4tuv)
