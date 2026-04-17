---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Microsoft Authenticator (PSI) For Work Accounts/Whats New"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FMicrosoft%20Authenticator%20(PSI)%20For%20Work%20Accounts%2FWhats%20New"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MS Authenticator PSI — What's New

## Multiple Passwordless Phone Sign-in Accounts for Android

- Android 6.2404.2872+ supports multiple PSI Work/School accounts (same or different tenants)
- iOS already supported multi-account PSI
- Guest accounts never support PSI

## Hardware-bound Credential (ECC Keys)

Starting with:
- **iOS 6.7.14+**: New registrations use ECC keys stored in Secure Enclave (hardware-based)
- **Android 6.2308.x+**: Key type changed from RSA to ECC for new registrations

In sign-in event Authentication Policies tab:
- **Success**: "Secure enclave activated"
- **Failure**: Indicates tamper-resistant hardware was not used

## Updates to Microsoft Authenticator Policy

The Microsoft Authenticator auth method policy now manages both PSI and MFA Push notifications:
- Number matching for MFA push (not just passwordless)
- Rich context: app name + IP-based location map view
- Users/groups can be configured separately for Push vs Passwordless

## Two-Step Deployment

1. **Admin**: Enable Microsoft Authenticator policy in tenant (also enables number matching Push)
2. **End user**: Must tap "Set up phone sign-in" in Authenticator app to:
   - Register device in Entra ID
   - Generate NGC (Next Generation Credential) private key on device
   - Public key stored on user object in MSODS

## Multiple Device Support

- Up to 5 devices per user for Entra MFA (hardware OATH, software OATH, Authenticator; not phone numbers)
- PSI devices stored in `StrongAuthenticationPhoneAppDetails` attribute
- Each Device-App combination is unique, differentiated by DeviceToken

## No Notification on Risk for Passwordless Sign-ins

Starting August 2023:
- Smart lockout blocks PSI notifications from unfamiliar locations
- Prevents MFA fatigue attacks from bad actors triggering PSI prompts
- Location becomes "familiar" after 14 days or 10 logins (determined by ESTS Risk Assessment Module / RAM)

**User workaround**: If user initiated from unfamiliar location, open Authenticator app and swipe down to see prompt manually.

**Investigation**: Check ESTS Kusto for `PSIBLK` flag in `RamAdhocDebuggingInfo`:

```kql
AllPerRequestTable
| where env_time > ago(2d)
| where RequestId == "<request-id>"
| project env_time, CorrelationId, RequestId, Call, UserPrincipalObjectID, ErrorCode, ErrorNo, RamAdhocDebuggingInfo, RngcData, env_appId
```

### Location Logic

Familiar location determined by D Protection ESTS RAM — evaluates IP, location, browserID, ASN, and other login properties. ~14 days or ~10 logins to become familiar.
