# NPS Extension for Azure MFA — Architecture and Troubleshooting

> Source: OneNote - Philip AAD MFA Deep Dive (Additional 4)
> Status: draft

## Architecture

NPS Extension acts as adapter between RADIUS and cloud-based Azure MFA:

```
VPN Client → VPN/NAS Server → RADIUS → NPS Server → NPS Extension → Azure MFA (SAS)
```

### Authentication Flow (9 Steps)

**Steps 1-4 (Windows Networking scope):**
1. VPN client sends RADIUS request to VPN server
2. VPN server sends RADIUS request to NPS server
3. NPS performs primary authentication against AD DS
4. Primary auth success → passes to NPS Extension

**Steps 5-7 (Cloud Identity scope):**
5. NPS Extension converts RADIUS→REST, authenticates to tenant via:
   - Client certificate
   - AppId of AzureMultiFactorAuthClient SP
   - TenantID → Azure STS issues token
   - Extension calls adnotifications.windowsazure.com/StrongAuthenticationService.svc/Connector
6. Azure MFA identifies default auth method → sends challenge to user
7. Azure MFA returns result with trust assertion token

**Steps 8-9 (Windows Networking scope):**
8. NPS Extension converts REST response → RADIUS response → VPN server
9. VPN server forwards response to client → VPN connected

## Common Issue: AccessReject Error

**Error:** `NPS Extension for Azure MFA only performs Secondary Auth for Radius requests in AccessAccept State. Request received for User xxx with response state AccessReject, ignoring request.`

**Root Cause:** Primary authentication (Step 3) failed. NPS Extension only fires after first-factor success.

**Troubleshooting:**
1. Enable NPS audit logging:
   ```cmd
   auditpol /set /subcategory:"Network Policy Server" /success:enable /failure:enable
   ```
2. Check Security Event ID 6272 (success) / 6273 (failure)
3. Temporarily remove MFA DLL to isolate:
   - Registry: `HKLM\system\currentcontrolset\services\authsrv\parameters`
   - Remove `AuthorizationDLLs` and `ExtensionDLLs` entries
   - Test primary auth alone
4. Fix primary auth, then re-register MFA DLLs

## Support Scope

- Steps 1-4, 8-9: **Windows Networking / Windows GES**
- Steps 5-7: **Cloud Identity Pod**

## References

- [NPS Extension for Azure MFA](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-nps-extension)
- [NPS Extension Advanced Config](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-mfa-nps-extension-advanced)
- [ADO Wiki: Azure AD NPS Extension](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183970)
