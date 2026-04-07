---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Wiki_restructure_archive/Microsoft Authenticator Passwordless Sign-in For Work Accounts"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/Wiki_restructure_archive/Microsoft%20Authenticator%20Passwordless%20Sign-in%20For%20Work%20Accounts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Authenticator Passwordless Sign-in - Detailed Guide

## Summary

Azure AD Microsoft Authenticator Passwordless sign-in allows users to sign in without a password via number matching approvals in the Microsoft Authenticator app. Users must type/select a number matching the sign-in screen, then enter their device PIN to unlock the NGC credential.

MS Authenticator passwordless also functions as two-step verification, eliminating the need for a second MFA approval. While not a FIDO credential, it follows early FIDO UAF specifications.

## Security Enhancements (Sept-Oct 2023)

### iOS (v6.7.14+)
- Previously: RSA key in software-based "Keychain"
- Now: ECC (Elliptic-curve) key in hardware-bound "secure enclave"
- Only new registrations use ECC; existing configurations NOT auto-converted

### Android (v6.2308+)
- Keys already in hardware containers (Secure Element / TEE)
- Key type changed from RSA to ECC to match iOS
- Both StrongBox and TEE configurations satisfy Google's hardware-bound definition

### Enhanced Logging

Sign-in logs show hardware-bound credential usage:
- New **Authentication policies** tab on MFA events
- "Secure enclave activated" with Success = tamper-resistant hardware used
- GraphAPI: `authenticationAppPolicyEvaluationDetails` → `policyName: "Phone Sign-in Tamper Resistant Hardware"` → `status: "tamperResistantHardwareUsed"`

```
GET https://graph.microsoft.com/beta/auditLogs/signIns?$filter=userPrincipalName eq 'user@contoso.com'
```

## Multiple Accounts Support

### iOS
Already supported for some time. See [iOS multi-account docs](https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-phone#multiple-accounts-on-ios).

### Android (v6.2404.2872+, May 2024)
- Multiple Work/School accounts in same or different tenants
- Guest accounts NOT supported for passwordless
- Same enable flow as single account

## Key Technical Details

- Feature enabled via Authentication method policy: Azure AD > Security > Authentication methods
- Number matching replaces simple "Approve" tap
- Functions as both primary and second factor authentication
- NGC (Next Generation Credential) unlock via device PIN
