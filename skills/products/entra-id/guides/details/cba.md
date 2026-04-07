# ENTRA-ID Certificate-Based Auth (CBA) — Detailed Troubleshooting Guide

**Entries**: 63 | **Drafts fused**: 13 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-cba-auth-strengths-advanced.md, ado-wiki-b-cba-ca-scoping.md, ado-wiki-b-cba-how-to-build-your-lab.md, ado-wiki-b-cba-introduction.md, ado-wiki-b-cba-new-trust-store.md, ado-wiki-c-pki-smartcard-logon.md, ado-wiki-d-avd-federated-cba.md, ado-wiki-h-cba-case-scoping-questions.md, ado-wiki-h-cba-cert-revocation-lists.md, ado-wiki-h-cba-data-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: Certificate Based Authentication
> 13 related entries

### CBA sign-in fails with AADSTS1001000 'Unable to acquire certificate policy from tenant' in ASC Sign-in Auth Diagnostic
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Wrong user UPN entered on the sign-in page; device owner's certificate was presented and selected for a different user account

**Solution**: Check PerRequestLogs of GetCredentialType call in ASC Sign-in Auth Diagnostic to find the ObjectID/PUID. Verify this account matches the SubjectName on the user certificate.

---

### CBA sign-in returns AADSTS1001003 'Unable To Acquire Value Specified In Binding From Certificate' after user selects a certificate at certauth.logi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User selected the wrong certificate from the certificate picker during CBA sign-in

**Solution**: Select the correct user certificate from the picker. On Android, only user certificates with a GUID are shown. On iOS, all certificates (including device certs) are displayed — select the one showing the user's name.

---

### Federated users are no longer redirected to ADFS for CBA after enabling X509Certificate authentication method in Entra ID; they are authenticated d...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Enabling the X509Certificate authentication method policy causes all users in scope to use native Azure AD CBA, overriding federated CBA via ADFS

**Solution**: Scope the X509Certificate authentication method policy to specific users/groups only. Ensure users who need federated CBA via ADFS are excluded from the policy scope.

---

### CBA sign-in fails with AADSTS50034 'The User Account Does Not Exist In The Directory' despite X.509 certificate authentication succeeding at certau...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User account type does not align with the userproperty value specified in the certificate-to-user attribute binding in the CBA policy

**Solution**: For cloud/synced users NOT using Alternate Security Id: set userproperty to 'userPrincipalName'. For synced users using Alternate Security Id: set userproperty to 'onPremisesUserPrincipalName'.

---

### CBA sign-in fails with AADSTS130501 'Sign in was blocked due to User Credential Policy'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user is not included in the X509Certificate Authentication Method policy — the policy is not enabled for all users and this user is not a member of any assigned group

**Solution**: Add the user to a group assigned to the X509Certificate authentication method policy, or directly add them to the policy, then retry sign-in.

---

### CBA sign-in fails with generic 'Sign-in failed' error screen showing only a Browser ID; Sign-in logs show error code 7000214 with failure reason 'C...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User's certificate has been revoked and the revocation is recorded in the published CRL

**Solution**: Check sign-in logs for error code 7000214 to confirm certificate revocation. The generic error screen is a known UX issue — a bug has been filed to improve the error message. The user needs a new, valid certificate.

---

### Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED error during CBA over TLS 1.3, immediately after user selects certificate and enters PIN
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SmartCard (hardware or virtual MS VSC) or TPM does not support the RSA-PSS algorithm required for TLS 1.3 client certificate authentication

**Solution**: Option 1: Use a smartcard that supports RSA-PSS algorithm (e.g., WHfB Cert Trust instead of MS Virtual SC). Option 2: Upgrade TPM firmware to a version supporting RSA-PSS — contact TPM vendor. Note: Edge TLS troubleshooting is handled by Developer Browser Team (BoringSSL); SmartCard troubleshooting is Directory Services team.

---

### CBA authentication is NOT blocked for a revoked certificate when all CA certificates exist only in the new PKI trust store and the old Certificate ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When the old CA store returns null (is empty), revocation checking is bypassed even if CAs exist in the new trust store. Fix was checked in but seasonal lockdown delayed rollout.

**Solution**: Workaround: Upload a certificate (even a dummy certificate) to the old certificate store. As long as the old store does not return null, revocation checking will be enforced. This is publicly documented under Step 1 of CBA configuration docs.

---

### Upload of CA certificates fails in the Entra portal Certificate authorities blade for tenants creating Trusted Certificate Authorities for the firs...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Bug 1940514 — portal issue occurs when no CA created via PowerShell previously exists in the tenant

**Solution**: Use PowerShell to upload CA certificates as a workaround. The bug fix (code checked in June 13, 2022) has been deployed to production.

---

### Users experience up to 10-minute CBA authentication delay after Certificate Authority create/update/delete operations in the new PKI trust store. N...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: CA issuer hints cache propagation delay — typically ~3 minutes but stated as 10 minutes to allow buffer. ESTS needs time to refresh its CA cache.

**Solution**: Expected behavior — wait for cache propagation (up to 10 minutes). Only affects users with certs from the modified CA. Other users are unaffected. Workaround: keep CAs in both old and new stores during migration so ESTS uses cached old CAs while new ones propagate.

---

## Phase 2: Crl
> 8 related entries

### CBA login fails with error 'The Certificate Revocation List (CRL) downloaded from {uri} has exceeded the maximum allowed size ({size} bytes)'. User...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CRL foreground download exceeds the size limit (20MB public cloud, 45MB USGov) or takes longer than 11 seconds. Large CRLs that exceed foreground download limits cause login failures.

**Solution**: 1) Reduce CRL size by using delta CRLs for frequent updates. 2) Add 'next CRL publish' field to CRLs to enable background downloads before expiry. 3) After first failure, service auto-adjusts to higher background limit (45MB public, 150MB USGov). 4) If CRL >50MB public or >150MB USGov, request manual increase via ICM.

---

### CBA CRL check fails because CRL distribution point uses LDAP path (e.g., ldap://...)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID only supports HTTP-based CRL paths. LDAP paths are not supported for CRL distribution points. The CRL must also be accessible anonymously without authentication.

**Solution**: Change CRL distribution points to use HTTP-based URLs. Ensure the CRL endpoint is publicly accessible and does not require authentication. Update the CRL path in Entra ID CA configuration accordingly.

---

### CBA CRL validation fails or produces unexpected results when the same CRL path is configured for multiple Certificate Authorities in Entra ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CRL paths must be unique to each CA and the CRL must be signed by the associated CA. Using the same CRL path for multiple CAs causes validation to fail because the CRL signature won't match all CAs. Also note: each CA cert shows the CRL distribution point for its issuer, not its own.

**Solution**: Configure unique CRL paths for each CA in Entra ID. Ensure each CRL is signed by the corresponding CA. Be careful to use the correct CRL path - each CA's own cert shows the CDP for its issuer, not its own CRL.

---

### CBA authentication fails because Azure AD cannot download the CRL (Certificate Revocation List) — either the CRL file exceeds the 20MB size limit (...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The CRL file published by the CA is too large for Azure AD to download and cache within its constraints (max 20MB commercial / 45MB Federal, max 11 second download time).

**Solution**: Keep certificate lifetimes reasonable and clean up expired certificates to reduce CRL size. If blocked by CRL size limit, as workaround: remove the CRL path and disable CRL checking for the specific CA until the limit is increased. Also note: OCSP is not supported — only HTTP CRL works for revocation checking.

---

### CBA authentication fails because Azure AD cannot download the CRL - either CRL file exceeds 20MB size limit (45MB for Federal) or download takes lo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CRL file published by the CA is too large for Azure AD to download and cache (max 20MB commercial / 45MB Federal, max 11 second download time).

**Solution**: Keep certificate lifetimes reasonable and clean up expired certs to reduce CRL size. If blocked by CRL size limit: remove CRL path and disable CRL checking for the specific CA as workaround. Note: OCSP not supported - only HTTP CRL works for revocation checking.

---

### CBA login fails: CRL exceeded maximum allowed size
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CRL foreground download exceeds limit (20MB public/45MB USGov) or >11sec

**Solution**: Use delta CRLs. Add next CRL publish field. ICM for >50MB

---

### CBA CRL check fails - LDAP path used
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID only supports HTTP-based CRL paths

**Solution**: Change to HTTP URLs accessible anonymously

---

### CBA CRL validation fails - same path for multiple CAs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CRL paths must be unique per CA. CA cert shows issuer CDP not its own

**Solution**: Use unique CRL paths per CA

---

## Phase 3: New Trust Store
> 8 related entries

### CBA authentication is NOT blocked for a revoked certificate when all CA certificates are only in the new PKI Trust Store and the old Certificate Au...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When the old Certificate Authority store returns null (has no CAs), revocation checking is not enforced even if the CRL in the new store lists the certificate as revoked. A fix was checked in but blocked by seasonal lockdown.

**Solution**: Workaround: Upload a certificate (even a dummy certificate) to the old certificate store. As long as the old store does not return null, revocation checking will be enforced. The fix is expected to complete rollout by January 2025. Documented in MS Learn under 'Step 1: Configure the certificate authorities with PKI-based trust store (Preview)'.

---

### After adding, updating, or deleting a Certificate Authority in the new PKI Trust Store, users experience up to 10 minutes delay before CBA authenti...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CA CRUD operations have a propagation delay (~3 minutes typical, up to 10 minutes) for issuer hints to be set in the ESTS cache. New CAs must be cached before their certificates appear in the cert picker.

**Solution**: This is expected behavior. Wait up to 10 minutes after CA changes. To minimize impact: upload CAs to new store while they still exist in old store (ESTS uses old CAs until new ones are cached). Rolling an expired CA (same subject name) has no visible impact as the subject persists in cache.

---

### Attempting to permanently (hard) delete a soft-deleted PKI container before the 30-day retention period fails with HTTP 400 Bad Request. Audit even...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hard deletion of soft-deleted PKI containers is not supported during the public preview phase.

**Solution**: Wait for GA when hard deletion will be fully supported. During preview, PKI containers can only be soft-deleted and will be automatically purged after 30 days.

---

### CBA authentication NOT blocked for revoked certificate when all CA certificates are only in new PKI Trust Store and old Certificate Authority store...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When old Certificate Authority store returns null (has no CAs), revocation checking is not enforced even if CRL in new store lists cert as revoked.

**Solution**: Workaround: Upload a certificate (even dummy) to old certificate store. As long as old store does not return null, revocation checking will be enforced. Fix expected to complete rollout by January 2025.

---

### After adding/updating/deleting a Certificate Authority in the new PKI Trust Store, users experience up to 10 minutes delay before CBA authenticatio...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CA CRUD operations have propagation delay (~3 min typical, up to 10 min) for issuer hints to be set in ESTS cache.

**Solution**: Expected behavior. Wait up to 10 minutes after CA changes. To minimize: upload CAs to new store while they still exist in old store (ESTS uses old CAs until new ones cached). Rolling expired CA with same subject name has no visible impact.

---

### Hard deleting a soft-deleted PKI container before 30-day retention fails with HTTP 400 Bad Request. Audit shows Delete PublicKeyInfrastructure fail...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hard deletion of soft-deleted PKI containers is not supported during public preview.

**Solution**: Wait for GA when hard deletion will be supported. During preview, PKI containers can only be soft-deleted and auto-purge after 30 days.

---

### In the new PKI Trust Store, clicking 'Deleted CAs' under a specific PKI container shows all deleted CAs across all containers instead of only the C...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: During public preview, the certificateAuthorityDetail objects lack a property associating them with their parent PKI container, so filtering is not possible.

**Solution**: This is a known public preview limitation. By GA, a parent association property will be added to filter deleted CAs to their parent PKI container.

---

### In new PKI Trust Store, clicking Deleted CAs under a specific PKI container shows all deleted CAs across all containers instead of only CAs from th...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: During public preview, certificateAuthorityDetail objects lack a property associating them with their parent PKI container, so filtering not possible.

**Solution**: Known public preview limitation. By GA, a parent association property will be added to filter deleted CAs to their parent PKI container.

---

## Phase 4: Certificate Based Auth
> 5 related entries

### Enabling Certificate-Based Authentication (CBA) in Azure China (21Vianet) fails when using Microsoft Graph v1.0 API endpoint. No UI available for C...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: 21Vianet Entra ID CBA configuration requires the beta API endpoint (microsoftgraph.chinacloudapi.cn/beta/), not the standard v1.0 endpoint. The CBA management UI is not yet available in Mooncake environment.

**Solution**: Use Microsoft Graph beta API with PowerShell to enable CBA: Connect-MgGraph -Environment China, then Update-MgBetaPolicyAuthenticationMethodPolicyAuthenticationMethodConfiguration with X509Certificate config. Set authenticationModeConfiguration to x509CertificateMultiFactor for MFA-equivalent CBA. Upload root/intermediate CA certs to PKI Trust Store via Graph API.

---

### After enabling Issuer Hints in CBA authentication policy, users fail to sign in with certificate-based authentication. Organizations with TLS inspe...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Enabling Issuer Hints changes the CBA sign-in endpoint from certauth.login.microsoftonline.com to t{tenantId}.certauth.login.microsoftonline.com. If TLS inspection rules only allow the old endpoint, the new tenant-specific endpoint is blocked.

**Solution**: Before enabling Issuer Hints, update firewall/proxy TLS inspection exceptions to use wildcard *.certauth.login.microsoftonline.com (or *.certauth.login.microsoftonline.us for Azure Government). Organizations not doing TLS inspection are not affected.

---

### After changing Required Affinity Binding to High at tenant level in CBA policy, all users in the tenant are locked out of certificate-based authent...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Changing Required Affinity Binding to High requires that all user objects have correct high-affinity binding values (SKI or SHA1PublicKey) in their certificateUserIds attribute. Without these values, no certificates can match the high-affinity requirement.

**Solution**: 1) Ensure certificateUserIds attribute of all user objects have the correct high-affinity binding value (SKI or SHA1PublicKey). 2) Add a Username binding rule of SKI or SHA1PublicKey to match user accounts. Only change to High after verifying user data is properly populated.

---

### Windows interactive CBA login fails with NGC error AADSTS130004: UserPrincipal doesn't have the NGC key configured. AzureAdPrt shows No with Attemp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Windows version does not support Azure AD Native CBA for interactive login. Requires Windows 10 20H1+, Windows 11 21H2+, or Windows Server 2019+.

**Solution**: Upgrade Windows to a supported version: Windows 10 20H1+, Windows 11 21H2+, or Windows Server 2019+. Verify with dsregcmd /status to check PRT acquisition status.

---

### Certificate-based authentication (CBA) fails with error code 500189 when CA scoping policy is configured. End users see 'Your account or session co...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user's certificate issuing CA is scoped to a security group via CA Scoping policy, but the authenticating user is not a member of that group. Entra walks up the entire CA chain and applies all scope rules; if the user is not found in any of the scoped groups, authentication is denied (error 500189) even if the certificate is otherwise valid.

**Solution**: 1) Check sign-in logs for error code 500189 in Basic info tab. 2) Verify the user is a member of the group assigned to the CA scoping rule. 3) Review CA scoping rules in Microsoft Entra admin center > Authentication methods > Certificate-based Authentication > Certificate issuer scoping policy. 4) SKI of the blocking CA is shown in the Additional Details tab of sign-in logs.

---

## Phase 5: Aadsts50034
> 2 related entries

### CBA sign-in fails with AADSTS50034: The User Account {EmailHidden} Does Not Exist In The <TenantId> Directory. Sign-in logs show X.509 Certificate ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user account type does not align with the userproperty value specified on the certificate-to-user attribute binding. For example, cloud/synced users may need userPrincipalName while synced users with Alternate Security ID need onPremisesUserPrincipalName.

**Solution**: For cloud and synced users NOT using Alternate Security ID: change the userproperty on the binding to userPrincipalName. For synced users using Alternate Security ID: change the userproperty to onPremisesUserPrincipalName.

---

### CBA sign-in fails with AADSTS50034: The User Account does not exist in the directory. Sign-in logs show X.509 Certificate auth succeeded but ESTS f...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user account type does not align with the userproperty value on the certificate-to-user attribute binding. Cloud/synced users need userPrincipalName; synced users with Alternate Security ID need onPremisesUserPrincipalName.

**Solution**: For cloud and synced users NOT using Alternate Security ID: change userproperty to userPrincipalName. For synced users using Alternate Security ID: change userproperty to onPremisesUserPrincipalName.

---

## Phase 6: Certificate Revoked
> 2 related entries

### CBA sign-in fails with generic 'Sign-in failed' error page showing only a Browser ID. Sign-in logs show error code 7000214 with failure reason 'Cer...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user's certificate has been revoked and is listed in the published CRL (Certificate Revocation List).

**Solution**: Confirm certificate revocation status in the CRL. If the revocation is intentional, issue a new certificate. The generic error message is a known UX issue — check sign-in logs for error code 7000214 to confirm revocation as the cause.

---

### CBA sign-in fails with generic Sign-in failed error page showing only Browser ID. Sign-in logs show error code 7000214 with failure reason Certific...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user certificate has been revoked and is listed in the published CRL (Certificate Revocation List).

**Solution**: Confirm certificate revocation status in the CRL. If intentional, issue a new certificate. The generic error message is a known UX issue - check sign-in logs for error code 7000214 to confirm revocation.

---

## Phase 7: Ca Upload
> 2 related entries

### Uploading CA certificates via the Entra ID Portal Certificate Authorities blade fails with 'Certificate uploading failed' — no HTTP activity is cap...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal bug (Bug 1940514) affecting tenants with no pre-existing Certificate Authorities. Tenants that already had CAs created via PowerShell are not affected.

**Solution**: Use PowerShell to upload CA certificates as a workaround. The bug fix was deployed starting June 2022.

---

### Uploading CA certificates via Entra ID Portal Certificate Authorities blade fails with Certificate uploading failed - no HTTP activity in browser/F...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal bug (Bug 1940514) affecting tenants with no pre-existing Certificate Authorities created via PowerShell.

**Solution**: Use PowerShell to upload CA certificates as workaround. Bug fix deployed starting June 2022.

---

## Phase 8: Ca Scoping
> 2 related entries

### CBA CA Scoping policy configuration fails or produces unexpected results due to design limitations: only one group per CA, maximum 30 scoping rules...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Design limitation of the CA Scoping feature in Microsoft Entra CBA: (1) Only one security group can be assigned per Certificate Authority, (2) Maximum of 30 scoping rules is supported, (3) Scoping is enforced at intermediate CA level, not at root or leaf CA level. Improper configuration may result in user lockouts.

**Solution**: Consolidate users into a single group per CA. Plan CA scoping rules within the 30-rule limit. For large organizations with multiple user populations per CA, use nested groups to consolidate into one group. Test thoroughly in a non-production environment before applying to avoid user lockouts.

---

### CBA CA Scoping misconfiguration causes user lockouts: improper scoping rules block all certificate-based authentication for affected users
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: CA Scoping enforces at intermediate CA level with strict rules: only one group per CA, max 30 scoping rules. If no valid scoping rules exist for a user certificate chain, authentication fails.

**Solution**: Review all CA scoping rules before enabling. Ensure each affected user belongs to at least one scoped group in the certificate chain. Test with a pilot group first. Max 1 group per CA, max 30 rules, scoping at intermediate CA level only.

---

## Phase 9: Pta
> 2 related entries

### Staged Rollout feature option appears grayed out in the Entra portal, cannot be enabled or configured
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Staged Rollout option is grayed out when MFA Staged Rollout or CBA (Certificate-Based Authentication) Rollout feature is already enabled. This is by design per Product Group (ICM-461600704)

**Solution**: Disable MFA or CBA Staged Rollout policy first using Microsoft Graph PowerShell: Connect-MgGraph, Get-MgPolicyFeatureRolloutPolicy to find the policy ID, then Update-MgPolicyFeatureRolloutPolicy with isEnabled=false, then Remove-MgPolicyFeatureRolloutPolicy

---

### Staged Rollout option appears grayed out in Entra ID portal and cannot be configured
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Staged Rollout option is grayed out by design when MFA Staged Rollout or CBA (Certificate-Based Authentication) Rollout feature is enabled

**Solution**: Disable MFA/CBA Staged Rollout via PowerShell: Connect-MgGraph, Get-MgPolicyFeatureRolloutPolicy to find policy ID, then Update-MgPolicyFeatureRolloutPolicy with isEnabled=$false, then Remove-MgPolicyFeatureRolloutPolicy

---

## Phase 10: Pki
> 2 related entries

### Smartcard logon fails - KDC Event ID 19 or Event ID 29 on domain controller indicating KDC cannot find a valid certificate for smartcard logon
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KDC certificate has expired, been superseded by another not valid for smartcard logon, or the CA certificate that issued the KDC/client smartcard certificate is not in the NTAuth store in AD.

**Solution**: 1) Verify KDC cert: certutil -verify -urlfetch KDC_CERT.cer. 2) Check NTAuth store: certutil -store -enterprise NTAuth. 3) Ensure KDC cert has OID 1.3.6.1.5.2.3.5 (KDC Auth) or 1.3.6.1.4.1.311.20.2.2 (SmartcardLogon). 4) Renew expired KDC certificate. 5) Add issuing CA cert to NTAuth if missing.

---

### Smartcard logon fails with 'Signing in with a smart card isnt supported for your account' after domain controller reboot
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party certificate validation software (Tumbleweed/AXWAY Desktop Validator) service does not start before the KDC service after DC reboot, causing a race condition where KDC cannot validate smartcard certificates.

**Solution**: Configure the third-party certificate validation service to start before the KDC service, or restart the KDC service after the validation service has fully started.

---

## Phase 11: Chrome
> 1 related entries

### Chrome always prompts certificate selection dialog during ADFS/Azure AD device or client certificate authentication, even with only one cert.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Chrome does not auto-select client certificates by default. IE/Edge on Windows 10 auto-selects. iOS/Android Chrome/Safari prompts once and remembers.

**Solution**: Set Chrome policy AutoSelectCertificateForUrls via registry: HKLM\SOFTWARE\Policies\Google\Chrome\AutoSelectCertificateForUrls. Use pattern https://device.login.microsoftonline.com with filter ISSUER CN=MS-Organization-Access for AAD.

---

## Phase 12: Az Ssh
> 1 related entries

### az ssh vm command fails with KeyError: access_token in azure/cli/core/_profile.py get_msal_token
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Outdated Azure CLI version. SSH certificate-based auth requires Azure CLI 2.22.1 or higher.

**Solution**: Upgrade Azure CLI to version 2.22.1 or higher (latest recommended).

---

## Phase 13: Aadsts1001000
> 1 related entries

### CBA sign-in fails with AADSTS1001000: Unable to acquire certificate policy from tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Wrong user's UPN was entered on the sign-in page and the device owner's certificate was presented and selected instead of the correct user's certificate.

**Solution**: In ASC Sign-in Auth Diagnostic, check the PerRequestLogs of the GetCredentialType call to find the ObjectID/PUID of the account attempting sign-in. Verify this matches the SubjectName on the user certificate. Instruct user to enter the correct UPN matching their certificate.

---

## Phase 14: Aadsts130501
> 1 related entries

### CBA sign-in fails with AADSTS130501: Sign in was blocked due to User Credential Policy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The X509Certificate Authentication Method policy is not enabled for all users in the tenant, and the signing-in user is not a member of any group assigned to the policy.

**Solution**: Verify the user is a member of a group assigned to the X509Certificate Authentication Method policy, or directly add them to the policy, then retry sign-in.

---

## Phase 15: Err_Ssl_Client_Auth_Signature_Failed
> 1 related entries

### Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED when attempting CBA over TLS 1.3, immediately after user selects certificate and enters PI...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SmartCard (hardware or virtual MS VSC) or TPM does not support the RSA-PSS algorithm required for TLS 1.3 client certificate authentication.

**Solution**: 1) Use a smartcard that supports RSA-PSS algorithm (e.g., WHfB Cert Trust instead of MS Virtual SC, depends on TPM). 2) Upgrade TPM firmware to a version supporting RSA-PSS — contact TPM vendor. Reference: KB article on TPM-based RSA cert failures with TLS 1.3. Note: Edge TLS troubleshooting is Developer Browser Team scope; SmartCard troubleshooting is Directory Services team scope.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Chrome always prompts certificate selection dialog during ADFS/Azure AD devic... | Chrome does not auto-select client certificates by defaul... | Set Chrome policy AutoSelectCertificateForUrls via regist... | 🟢 9.0 | OneNote |
| 2 | Enabling Certificate-Based Authentication (CBA) in Azure China (21Vianet) fai... | 21Vianet Entra ID CBA configuration requires the beta API... | Use Microsoft Graph beta API with PowerShell to enable CB... | 🟢 9.0 | OneNote |
| 3 | az ssh vm command fails with KeyError: access_token in azure/cli/core/_profil... | Outdated Azure CLI version. SSH certificate-based auth re... | Upgrade Azure CLI to version 2.22.1 or higher (latest rec... | 🟢 8.5 | ADO Wiki |
| 4 | After enabling Issuer Hints in CBA authentication policy, users fail to sign ... | Enabling Issuer Hints changes the CBA sign-in endpoint fr... | Before enabling Issuer Hints, update firewall/proxy TLS i... | 🟢 8.5 | ADO Wiki |
| 5 | After changing Required Affinity Binding to High at tenant level in CBA polic... | Changing Required Affinity Binding to High requires that ... | 1) Ensure certificateUserIds attribute of all user object... | 🟢 8.5 | ADO Wiki |
| 6 | Windows interactive CBA login fails with NGC error AADSTS130004: UserPrincipa... | The Windows version does not support Azure AD Native CBA ... | Upgrade Windows to a supported version: Windows 10 20H1+,... | 🟢 8.5 | ADO Wiki |
| 7 | CBA login fails with error 'The Certificate Revocation List (CRL) downloaded ... | CRL foreground download exceeds the size limit (20MB publ... | 1) Reduce CRL size by using delta CRLs for frequent updat... | 🟢 8.5 | ADO Wiki |
| 8 | CBA CRL check fails because CRL distribution point uses LDAP path (e.g., ldap... | Entra ID only supports HTTP-based CRL paths. LDAP paths a... | Change CRL distribution points to use HTTP-based URLs. En... | 🟢 8.5 | ADO Wiki |
| 9 | CBA CRL validation fails or produces unexpected results when the same CRL pat... | CRL paths must be unique to each CA and the CRL must be s... | Configure unique CRL paths for each CA in Entra ID. Ensur... | 🟢 8.5 | ADO Wiki |
| 10 | CBA sign-in fails with AADSTS1001000: Unable to acquire certificate policy fr... | Wrong user's UPN was entered on the sign-in page and the ... | In ASC Sign-in Auth Diagnostic, check the PerRequestLogs ... | 🟢 8.5 | ADO Wiki |
| 11 | CBA sign-in fails with AADSTS50034: The User Account {EmailHidden} Does Not E... | The user account type does not align with the userpropert... | For cloud and synced users NOT using Alternate Security I... | 🟢 8.5 | ADO Wiki |
| 12 | CBA sign-in fails with AADSTS130501: Sign in was blocked due to User Credenti... | The X509Certificate Authentication Method policy is not e... | Verify the user is a member of a group assigned to the X5... | 🟢 8.5 | ADO Wiki |
| 13 | CBA sign-in fails with generic 'Sign-in failed' error page showing only a Bro... | The user's certificate has been revoked and is listed in ... | Confirm certificate revocation status in the CRL. If the ... | 🟢 8.5 | ADO Wiki |
| 14 | Uploading CA certificates via the Entra ID Portal Certificate Authorities bla... | Portal bug (Bug 1940514) affecting tenants with no pre-ex... | Use PowerShell to upload CA certificates as a workaround.... | 🟢 8.5 | ADO Wiki |
| 15 | Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED when attempting CBA ... | SmartCard (hardware or virtual MS VSC) or TPM does not su... | 1) Use a smartcard that supports RSA-PSS algorithm (e.g.,... | 🟢 8.5 | ADO Wiki |
| 16 | CBA authentication fails because Azure AD cannot download the CRL (Certificat... | The CRL file published by the CA is too large for Azure A... | Keep certificate lifetimes reasonable and clean up expire... | 🟢 8.5 | ADO Wiki |
| 17 | CBA authentication is NOT blocked for a revoked certificate when all CA certi... | When the old Certificate Authority store returns null (ha... | Workaround: Upload a certificate (even a dummy certificat... | 🟢 8.5 | ADO Wiki |
| 18 | After adding, updating, or deleting a Certificate Authority in the new PKI Tr... | CA CRUD operations have a propagation delay (~3 minutes t... | This is expected behavior. Wait up to 10 minutes after CA... | 🟢 8.5 | ADO Wiki |
| 19 | Attempting to permanently (hard) delete a soft-deleted PKI container before t... | Hard deletion of soft-deleted PKI containers is not suppo... | Wait for GA when hard deletion will be fully supported. D... | 🟢 8.5 | ADO Wiki |
| 20 | CBA sign-in fails with AADSTS1001000 'Unable to acquire certificate policy fr... | Wrong user UPN entered on the sign-in page; device owner'... | Check PerRequestLogs of GetCredentialType call in ASC Sig... | 🟢 8.5 | ADO Wiki |
| 21 | CBA sign-in returns AADSTS1001003 'Unable To Acquire Value Specified In Bindi... | User selected the wrong certificate from the certificate ... | Select the correct user certificate from the picker. On A... | 🟢 8.5 | ADO Wiki |
| 22 | Federated users are no longer redirected to ADFS for CBA after enabling X509C... | Enabling the X509Certificate authentication method policy... | Scope the X509Certificate authentication method policy to... | 🟢 8.5 | ADO Wiki |
| 23 | CBA sign-in fails with AADSTS50034 'The User Account Does Not Exist In The Di... | User account type does not align with the userproperty va... | For cloud/synced users NOT using Alternate Security Id: s... | 🟢 8.5 | ADO Wiki |
| 24 | CBA sign-in fails with AADSTS130501 'Sign in was blocked due to User Credenti... | The user is not included in the X509Certificate Authentic... | Add the user to a group assigned to the X509Certificate a... | 🟢 8.5 | ADO Wiki |
| 25 | CBA sign-in fails with generic 'Sign-in failed' error screen showing only a B... | User's certificate has been revoked and the revocation is... | Check sign-in logs for error code 7000214 to confirm cert... | 🟢 8.5 | ADO Wiki |
| 26 | Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED error during CBA ove... | SmartCard (hardware or virtual MS VSC) or TPM does not su... | Option 1: Use a smartcard that supports RSA-PSS algorithm... | 🟢 8.5 | ADO Wiki |
| 27 | CBA authentication is NOT blocked for a revoked certificate when all CA certi... | When the old CA store returns null (is empty), revocation... | Workaround: Upload a certificate (even a dummy certificat... | 🟢 8.5 | ADO Wiki |
| 28 | CBA sign-in fails with AADSTS50034: The User Account does not exist in the di... | The user account type does not align with the userpropert... | For cloud and synced users NOT using Alternate Security I... | 🟢 8.5 | ADO Wiki |
| 29 | CBA sign-in fails with generic Sign-in failed error page showing only Browser... | The user certificate has been revoked and is listed in th... | Confirm certificate revocation status in the CRL. If inte... | 🟢 8.5 | ADO Wiki |
| 30 | Uploading CA certificates via Entra ID Portal Certificate Authorities blade f... | Portal bug (Bug 1940514) affecting tenants with no pre-ex... | Use PowerShell to upload CA certificates as workaround. B... | 🟢 8.5 | ADO Wiki |
