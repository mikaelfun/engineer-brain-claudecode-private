---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Verified ID/How to/Verified ID Face Check"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Verified%20ID/How%20to/Verified%20ID%20Face%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Verified ID Face Check

## Summary

Face Check adds a critical layer of trust by performing facial matching between a user's real-time selfie and a photo claim on their credential (VerifiedEmployee, Government ID, or custom credential).

Microsoft Authenticator sends the user's selfie and the source photo claim to Azure AI services, which returns a facial match confidence score.

## Requirements

- Entra Suite License required (was free prior to GA)
- See [Face Check Addon Licensing](ado-wiki-f-face-check-addon-licensing.md) for billing details

## How Face Check Works

1. User navigates to vendor web app, clicks to provide credential → QR code displayed
2. User scans QR code from Authenticator **Verified IDs** tab
3. User selects credential, taps **Next** → Face check selfie scan launches
4. Azure AI compares selfie to photo claim, returns confidence score
5. User taps **Share** to supply score to web application
6. If score >= `matchConfidenceThreshold` → authentication succeeds
7. If score < threshold → Error 403

## Configuration

### matchConfidenceThreshold

Percentages are not accuracy ratings. They measure how often Azure AI won't return a false match:
- Setting of `50` = 1:1,000,000,000 incorrect matches
- Default: 70

### Sample App Settings (appsettings.json)

| Key | Value | Description |
|-----|-------|-------------|
| useFaceCheck | true/false | Enable FaceCheck during presentation requests |
| PhotoClaimName | claim name | Name of photo claim in credential type |
| matchConfidenceThreshold | 50-100 | Confidence threshold (default: 70) |

### Custom Credential Definitions

For non-VerifiedEmployee credentials, add photo claim to Display and Rule definitions:

**Display definition:**
```json
{
  "claim": "vc.credentialSubject.photo",
  "label": "User picture",
  "type": "image/jpg;base64url"
}
```

**Rule definition:**
```json
{
  "outputClaim": "photo",
  "required": true,
  "inputClaim": "photo",
  "indexed": false
}
```

## Known Issues

### Issue 1: "Your organization hasn't authorized you to get a Verified ID"

- **Error:** 401 Unauthorized, "Provided access token contains no scp"
- **Root Cause:** Missing "My Profile" servicePrincipal (AppId: 8c59ead7-d703-4a27-9e55-c96a0054c8d2)
- **Fix:**
```powershell
Connect-MgGraph -scopes Application.ReadWrite.All
New-MgServicePrincipal -AppId "8c59ead7-d703-4a27-9e55-c96a0054c8d2"
```
- Related ICM: 526091447

### Issue 2: "User Key for iOS App Integrity is not found"

- **Error:** 400, code `AppIntegrity_iOS_KeyNotFound` (iOS only, intermittent)
- **Troubleshooting:** Upload Authenticator logs, provide Easy ID for ASC analysis
- **Logs location:** `MicrosoftAuthenticatorVerifiableCredentialLogs` in PowerLift
- ASC Repair item: 29650343

## Terms

- Photo in the VerifiedCredential = "Source" photo
- Photo taken in Authenticator = not called "selfie" (not captured in the app)
