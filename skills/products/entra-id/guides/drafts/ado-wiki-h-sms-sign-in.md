---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Azure AD SMS Sign-in"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Azure%20AD%20SMS%20Sign-in"
importDate: "2026-04-05"
type: troubleshooting-guide
21vNote: "SMS Sign-in is NOT supported in 21V/Mooncake (confirmed by PG March 2025)"
---

# Azure AD SMS Sign-in

> ⚠️ **21V/Mooncake**: SMS Sign-in is NOT supported. No plans to support (confirmed by PG March 2025).

## Summary
SMS Sign-in allows users to sign in by entering their phone number instead of a UPN. SAS sends a text message with a One Time Code (OTC). Single-factor authentication only (does not satisfy strong auth).

## Key Facts
- Only impacts authentications at AAD common login (login.microsoftonline.com)
- Federated users are NOT directed to federation server for SMS sign-in
- Phone numbers must be unique per tenant (1:1 relationship)
- Users with number in multiple tenants see disambiguation prompt
- Policy type: UserCredentialPolicy (PolicyType=24), shared with FIDO2 and PhoneSignIn

## Limitations
- No shared phone support (1:1 user-to-number in tenant)
- Does not satisfy strong authentication
- Not compatible with on-premises CA policies or Pass-through authentication
- Not supported on Teams Windows and macOS desktop apps
- B2B users: works but not designed for B2B scenarios

## Known Issues

### Issue #1: 'notAllowedByPolicy'
User not in Text message policy scope. Add user to policy or group.

### Issue #2: Phone Number Collision (DirectoryUniquenessException)
Another user has the same number. Find conflicting user via Kusto or Audit logs (Global Admin/Privileged Auth Admin can see objectId).

### Issue #3: SMS Stopped Working
User removed from policy/group. Re-add to restore.

### Issue #4: Cannot Delete SMS Number
Phone is primary auth method. Change primary method at myprofile.microsoft.com/security-info first.

### Issue #5: Teams Next Button Won't Activate
Enter phone as `##########@contoso.onmicrosoft.com`, then click "Use another account" to re-enter phone number.

## Provisioning
When provisioned, three attributes are set:
- **AlternativeSecurityId**: Type=6 (PublicIdentifierCred), IdentityProvider="phone"
- **StrongAuthenticationMethod**: MethodType=5 (OneWaySms)
- **StrongAuthenticationUserDetails**: PhoneNumber with country code

## smsSignInState Values
| State | Description |
|:---|:---|
| NotSupported | Alternate phone used (only primary works) |
| NotAllowedByPolicy | User not allowed by current policy |
| notProvisioned | Allowed but AlternativeSecurityId not registered |
| phoneNumberCollision | Number already provisioned for another user |
| ready | Successfully provisioned and ready |

## Support Boundaries
AAD - Authentication supports: Provisioning of SMS phone number in PIMD mapping directory + Authentication using the provisioned number.

## Troubleshooting
1. Verify Text message policy is Enabled
2. If Select users, verify user is in scope
3. Verify user is Provisioned (check mark next to Phone, or Get-UserSMSSignInSettings returns "ready")
4. Check Sign-in logs: look for KMSI Interrupt + Success events sharing same Correlation ID
5. Check Audit logs: look for "Update user" with AlternativeSecurityId changes
