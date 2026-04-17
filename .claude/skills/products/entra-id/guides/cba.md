# ENTRA-ID Certificate-Based Auth (CBA) — Quick Reference

**Entries**: 63 | **21V**: All applicable
**Last updated**: 2026-04-07
**Keywords**: cba, pki, crl, certificate-based-authentication, new-trust-store, smartcard

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/cba.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Chrome always prompts certificate selection dialog during ADFS/Azure AD device or client certific... | Chrome does not auto-select client certificates by default. IE/Edge on Window... | Set Chrome policy AutoSelectCertificateForUrls via registry: HKLM\SOFTWARE\Po... | 🟢 9.0 | OneNote |
| 2 📋 | Enabling Certificate-Based Authentication (CBA) in Azure China (21Vianet) fails when using Micros... | 21Vianet Entra ID CBA configuration requires the beta API endpoint (microsoft... | Use Microsoft Graph beta API with PowerShell to enable CBA: Connect-MgGraph -... | 🟢 9.0 | OneNote |
| 3 📋 | az ssh vm command fails with KeyError: access_token in azure/cli/core/_profile.py get_msal_token | Outdated Azure CLI version. SSH certificate-based auth requires Azure CLI 2.2... | Upgrade Azure CLI to version 2.22.1 or higher (latest recommended). | 🟢 8.5 | ADO Wiki |
| 4 📋 | After enabling Issuer Hints in CBA authentication policy, users fail to sign in with certificate-... | Enabling Issuer Hints changes the CBA sign-in endpoint from certauth.login.mi... | Before enabling Issuer Hints, update firewall/proxy TLS inspection exceptions... | 🟢 8.5 | ADO Wiki |
| 5 📋 | After changing Required Affinity Binding to High at tenant level in CBA policy, all users in the ... | Changing Required Affinity Binding to High requires that all user objects hav... | 1) Ensure certificateUserIds attribute of all user objects have the correct h... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Windows interactive CBA login fails with NGC error AADSTS130004: UserPrincipal doesn't have the N... | The Windows version does not support Azure AD Native CBA for interactive logi... | Upgrade Windows to a supported version: Windows 10 20H1+, Windows 11 21H2+, o... | 🟢 8.5 | ADO Wiki |
| 7 📋 | CBA login fails with error 'The Certificate Revocation List (CRL) downloaded from {uri} has excee... | CRL foreground download exceeds the size limit (20MB public cloud, 45MB USGov... | 1) Reduce CRL size by using delta CRLs for frequent updates. 2) Add 'next CRL... | 🟢 8.5 | ADO Wiki |
| 8 📋 | CBA CRL check fails because CRL distribution point uses LDAP path (e.g., ldap://...) | Entra ID only supports HTTP-based CRL paths. LDAP paths are not supported for... | Change CRL distribution points to use HTTP-based URLs. Ensure the CRL endpoin... | 🟢 8.5 | ADO Wiki |
| 9 📋 | CBA CRL validation fails or produces unexpected results when the same CRL path is configured for ... | CRL paths must be unique to each CA and the CRL must be signed by the associa... | Configure unique CRL paths for each CA in Entra ID. Ensure each CRL is signed... | 🟢 8.5 | ADO Wiki |
| 10 📋 | CBA sign-in fails with AADSTS1001000: Unable to acquire certificate policy from tenant | Wrong user's UPN was entered on the sign-in page and the device owner's certi... | In ASC Sign-in Auth Diagnostic, check the PerRequestLogs of the GetCredential... | 🟢 8.5 | ADO Wiki |
| 11 📋 | CBA sign-in fails with AADSTS50034: The User Account {EmailHidden} Does Not Exist In The <TenantI... | The user account type does not align with the userproperty value specified on... | For cloud and synced users NOT using Alternate Security ID: change the userpr... | 🟢 8.5 | ADO Wiki |
| 12 📋 | CBA sign-in fails with AADSTS130501: Sign in was blocked due to User Credential Policy | The X509Certificate Authentication Method policy is not enabled for all users... | Verify the user is a member of a group assigned to the X509Certificate Authen... | 🟢 8.5 | ADO Wiki |
| 13 📋 | CBA sign-in fails with generic 'Sign-in failed' error page showing only a Browser ID. Sign-in log... | The user's certificate has been revoked and is listed in the published CRL (C... | Confirm certificate revocation status in the CRL. If the revocation is intent... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Uploading CA certificates via the Entra ID Portal Certificate Authorities blade fails with 'Certi... | Portal bug (Bug 1940514) affecting tenants with no pre-existing Certificate A... | Use PowerShell to upload CA certificates as a workaround. The bug fix was dep... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED when attempting CBA over TLS 1.3, immedi... | SmartCard (hardware or virtual MS VSC) or TPM does not support the RSA-PSS al... | 1) Use a smartcard that supports RSA-PSS algorithm (e.g., WHfB Cert Trust ins... | 🟢 8.5 | ADO Wiki |
| 16 📋 | CBA authentication fails because Azure AD cannot download the CRL (Certificate Revocation List) —... | The CRL file published by the CA is too large for Azure AD to download and ca... | Keep certificate lifetimes reasonable and clean up expired certificates to re... | 🟢 8.5 | ADO Wiki |
| 17 📋 | CBA authentication is NOT blocked for a revoked certificate when all CA certificates are only in ... | When the old Certificate Authority store returns null (has no CAs), revocatio... | Workaround: Upload a certificate (even a dummy certificate) to the old certif... | 🟢 8.5 | ADO Wiki |
| 18 📋 | After adding, updating, or deleting a Certificate Authority in the new PKI Trust Store, users exp... | CA CRUD operations have a propagation delay (~3 minutes typical, up to 10 min... | This is expected behavior. Wait up to 10 minutes after CA changes. To minimiz... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Attempting to permanently (hard) delete a soft-deleted PKI container before the 30-day retention ... | Hard deletion of soft-deleted PKI containers is not supported during the publ... | Wait for GA when hard deletion will be fully supported. During preview, PKI c... | 🟢 8.5 | ADO Wiki |
| 20 📋 | CBA sign-in fails with AADSTS1001000 'Unable to acquire certificate policy from tenant' in ASC Si... | Wrong user UPN entered on the sign-in page; device owner's certificate was pr... | Check PerRequestLogs of GetCredentialType call in ASC Sign-in Auth Diagnostic... | 🟢 8.5 | ADO Wiki |
| 21 📋 | CBA sign-in returns AADSTS1001003 'Unable To Acquire Value Specified In Binding From Certificate'... | User selected the wrong certificate from the certificate picker during CBA si... | Select the correct user certificate from the picker. On Android, only user ce... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Federated users are no longer redirected to ADFS for CBA after enabling X509Certificate authentic... | Enabling the X509Certificate authentication method policy causes all users in... | Scope the X509Certificate authentication method policy to specific users/grou... | 🟢 8.5 | ADO Wiki |
| 23 📋 | CBA sign-in fails with AADSTS50034 'The User Account Does Not Exist In The Directory' despite X.5... | User account type does not align with the userproperty value specified in the... | For cloud/synced users NOT using Alternate Security Id: set userproperty to '... | 🟢 8.5 | ADO Wiki |
| 24 📋 | CBA sign-in fails with AADSTS130501 'Sign in was blocked due to User Credential Policy' | The user is not included in the X509Certificate Authentication Method policy ... | Add the user to a group assigned to the X509Certificate authentication method... | 🟢 8.5 | ADO Wiki |
| 25 📋 | CBA sign-in fails with generic 'Sign-in failed' error screen showing only a Browser ID; Sign-in l... | User's certificate has been revoked and the revocation is recorded in the pub... | Check sign-in logs for error code 7000214 to confirm certificate revocation. ... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Edge browser throws ERR_SSL_CLIENT_AUTH_SIGNATURE_FAILED error during CBA over TLS 1.3, immediate... | SmartCard (hardware or virtual MS VSC) or TPM does not support the RSA-PSS al... | Option 1: Use a smartcard that supports RSA-PSS algorithm (e.g., WHfB Cert Tr... | 🟢 8.5 | ADO Wiki |
| 27 📋 | CBA authentication is NOT blocked for a revoked certificate when all CA certificates exist only i... | When the old CA store returns null (is empty), revocation checking is bypasse... | Workaround: Upload a certificate (even a dummy certificate) to the old certif... | 🟢 8.5 | ADO Wiki |
| 28 📋 | CBA sign-in fails with AADSTS50034: The User Account does not exist in the directory. Sign-in log... | The user account type does not align with the userproperty value on the certi... | For cloud and synced users NOT using Alternate Security ID: change userproper... | 🟢 8.5 | ADO Wiki |
| 29 📋 | CBA sign-in fails with generic Sign-in failed error page showing only Browser ID. Sign-in logs sh... | The user certificate has been revoked and is listed in the published CRL (Cer... | Confirm certificate revocation status in the CRL. If intentional, issue a new... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Uploading CA certificates via Entra ID Portal Certificate Authorities blade fails with Certificat... | Portal bug (Bug 1940514) affecting tenants with no pre-existing Certificate A... | Use PowerShell to upload CA certificates as workaround. Bug fix deployed star... | 🟢 8.5 | ADO Wiki |
| 31 📋 | CBA authentication fails because Azure AD cannot download the CRL - either CRL file exceeds 20MB ... | CRL file published by the CA is too large for Azure AD to download and cache ... | Keep certificate lifetimes reasonable and clean up expired certs to reduce CR... | 🟢 8.5 | ADO Wiki |
| 32 📋 | CBA authentication NOT blocked for revoked certificate when all CA certificates are only in new P... | When old Certificate Authority store returns null (has no CAs), revocation ch... | Workaround: Upload a certificate (even dummy) to old certificate store. As lo... | 🟢 8.5 | ADO Wiki |
| 33 📋 | After adding/updating/deleting a Certificate Authority in the new PKI Trust Store, users experien... | CA CRUD operations have propagation delay (~3 min typical, up to 10 min) for ... | Expected behavior. Wait up to 10 minutes after CA changes. To minimize: uploa... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Hard deleting a soft-deleted PKI container before 30-day retention fails with HTTP 400 Bad Reques... | Hard deletion of soft-deleted PKI containers is not supported during public p... | Wait for GA when hard deletion will be supported. During preview, PKI contain... | 🟢 8.5 | ADO Wiki |
| 35 📋 | CBA fails after enabling Issuer Hints - TLS inspection blocks new endpoint | Issuer Hints changes endpoint to t{tenantId}.certauth.login.microsoftonline.com | Add *.certauth.login.microsoftonline.com to TLS exceptions before enabling | 🟢 8.5 | ADO Wiki |
| 36 📋 | CBA High Affinity Binding locks out all users | High affinity requires SKI/SHA1PublicKey in certificateUserIds on all users | Populate certificateUserIds first then change to High | 🟢 8.5 | ADO Wiki |
| 37 📋 | Windows CBA fails AADSTS130004: NGC key not configured. AzureAdPrt=No | Windows too old for Native CBA. Need Win10 20H1+/Win11 21H2+/Server 2019+ | Upgrade Windows. Verify with dsregcmd /status | 🟢 8.5 | ADO Wiki |
| 38 📋 | CBA login fails: CRL exceeded maximum allowed size | CRL foreground download exceeds limit (20MB public/45MB USGov) or >11sec | Use delta CRLs. Add next CRL publish field. ICM for >50MB | 🟢 8.5 | ADO Wiki |
| 39 📋 | CBA CRL check fails - LDAP path used | Entra ID only supports HTTP-based CRL paths | Change to HTTP URLs accessible anonymously | 🟢 8.5 | ADO Wiki |
| 40 📋 | CBA CRL validation fails - same path for multiple CAs | CRL paths must be unique per CA. CA cert shows issuer CDP not its own | Use unique CRL paths per CA | 🟢 8.5 | ADO Wiki |
| ... | *23 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **cba** related issues (18 entries) `[onenote]`
2. Check **certificate-based-auth** related issues (4 entries) `[onenote]`
3. Check **crl** related issues (4 entries) `[ado-wiki]`
4. Check **new-trust-store** related issues (3 entries) `[ado-wiki]`
5. Check **aadsts1001000** related issues (2 entries) `[ado-wiki]`
6. Check **pki** related issues (2 entries) `[ado-wiki]`
