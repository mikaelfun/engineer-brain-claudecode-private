---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Entra ID QR Code Authentication Method"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FEntra%20ID%20QR%20Code%20Authentication%20Method"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra ID QR Code Authentication Method

## Feature Overview
QR code + PIN authentication for frontline workers and students. QR code contains embedded UPN and secret, PIN is 8+ digits bound to the QR code. Two types: Standard (1-395 days, up to 5 years at GA) and Temporary (1-12 hours). Supported by Identity Security and Protection community.

## Prerequisites
- Entra ID tenant with F1, F3, or P1 license
- Android, iOS, or iPadOS (15.0+) shared devices
- Shared device mode recommended
- Printer for 2"x2" QR codes
- Teams app (Android 1.0.0.2024143204+, iOS 1.0.0.77.2024132501+)

## Limitations and Known Issues
- End users cannot reset QR code (no SSPR) - must go through admin
- Admins can only view QR code at initial creation
- Admins cannot see PIN, only reset it
- Users cannot reset PIN on demand
- No report for upcoming QR code expirations
- QR code is single factor (not MFA)
- PIN complexity enforced: numbers only (0-9), min 8 digits
- After 10 wrong PIN attempts: account locked 60 sec, exponential increase

### Known Bug: Disable/Re-enable
If admin disables then re-enables QR code auth method, it won't work until user signs in with another method first. Same issue if admin removes then reassigns QR Code auth method to a user.

## Regions
- Public: Available
- Fairfax/Arlington: TBD
- Gallatin/Mooncake: TBD

## Configuration

### Via Entra Admin Center
1. Protection > Authentication methods > Policies > QR code
2. Enable and target groups
3. Configure PIN length (8-20 digits) and QR code lifetime (1-395 days)

### Via Graph API
```
PATCH https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/qrCodePin
```

## Adding QR Code for User
- Entra admin center: Users > select user > Authentication methods > Add > QR code
- My Staff portal (for frontline managers)
- Graph API

## Sign-in Methods

### Teams (Mobile)
MDM config key `preferred_auth_config` = `qrpin` (iOS: SSO extension, Android: Authenticator)

### login.microsoftonline.com
More sign-in options > Sign in to an organization > Sign in with QR code

## Troubleshooting

### View Tenant Configuration (ASC Graph Explorer)
```
GET https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/qrCodePin
```

### View User QR Code Status
```
GET https://graph.microsoft.com/beta/users/{upn}/authentication/qrCodePinMethod
```
Key fields: standardQRCode (expireDateTime, startDateTime), temporaryQRCode, pin (forceChangePinNextSignIn)

### Incorrect QR Code Error
No sign-in logs generated. 5 possible causes:
1. QR code damaged
2. QR code deleted from account
3. QR code expired
4. QR code not yet active
5. QR code not provisioned by admin

**Resolution:** Check user's QR code status via Graph API, review audit logs, create new QR code if needed.

### Invalid PIN (Error 1301021)
Logged in sign-in logs with authenticationMethod "QR code pin", succeeded: false.

## Error Codes Reference

| Code | Name | Message |
|------|------|---------|
| 130100 | QrCodeKeyInvalidKey | Signature key ID invalid |
| 1301011 | QrCodeKeyInvalid | QR Code invalid, contact admin |
| 1301012 | QrCodeKeyExpired | QR Code expired, contact admin |
| 1301021 | QrPinInvalid | User provided invalid PIN |
| 1301023 | QrPinUpdateOnLogin | User must change temporary PIN |
| 1301024 | InvalidGrantQrPinChanged | Grant expired due to PIN change |
| 130103 | QrCodePinBlockedByUserCredentialPolicy | Blocked by User Credential Policy |
| 1301046 | UpdateQrPinPinTooShort | New PIN too short |

## ICM Escalation
- **Sign-in issues**: ESTS service, follow Identity CEN Model
  - Sev 3/4 CRI: ESTS > Incident Triage (CRI's only - No Sev 2)
  - Sev 2+: ESTS > ESTS
- **Portal issues**: Credential Enforcement and Provisioning > Triage
- **MyStaff issues**: IAM Services > AAD End User Experiences

## Policy Propagation
Auth method policy changes may take up to 15 minutes to become active.
