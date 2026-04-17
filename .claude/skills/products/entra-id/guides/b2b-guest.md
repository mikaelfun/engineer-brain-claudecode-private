# ENTRA-ID B2B Guest Access — Quick Reference

**Entries**: 123 | **21V**: Partial (122/123)
**Last updated**: 2026-04-07
**Keywords**: b2b, guest-user, cross-tenant, xtap, cross-cloud, by-design

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/b2b-guest.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Cross-tenant B2B collaboration fails when customer restricts allowed applications to Office365 on... | MicrosoftAdminPortals app is implicitly required for portal access but not in... | Use Graph API to PATCH crossTenantAccessPolicy partner settings. Add Microsof... | 🟢 10.0 | OneNote |
| 2 📋 | AADSTS50020: User account from identity provider does not exist in tenant and cannot access the a... | User account from partner/external tenant is not present as a guest or does n... | Ensure user is added to Partner Admin Groups (e.g., AdminAgents) in the Partn... | 🟢 9.5 | ADO Wiki |
| 3 📋 | B2B/CCB2B users cannot SSO on MDM iOS devices. Edge login always requires password; cross-tenant ... | Issue 1: Prompt=login forces fresh login. Issue 2: Device compliance not pass... | Check broker logs for Prompt=login. Cross-tenant issue: escalate to Edge PG. ... | 🟢 9.0 | OneNote |
| 4 📋 | B2B guest user authentication fails after migrating from Tango to CC B2B. Guest users in Tenant B... | After deprecating Tenant A (global), Tenant B's guest users still point to Te... | 1) Set up cross-tenant access between Tenant B and 21V Tenant C. 2) Reset red... | 🟢 9.0 | OneNote |
| 5 📋 | Encrypted documents shared from Azure China cloud to Commercial cloud users are inaccessible via ... | Cross-cloud AIP/sensitivity label encryption does not support document attach... | Do NOT send encrypted documents as attachments across cloud boundaries. Share... | 🟢 9.0 | OneNote |
| 6 📋 | Cross-cloud B2B guest user cannot access SharePoint documents. Authentication fails when using em... | SharePoint cross-cloud B2B authentication requires the UPN, not the email add... | Authenticate using UPN, not email address. Inform users to check their UPN in... | 🟢 9.0 | OneNote |
| 7 📋 | B2B invitation cannot be sent when invited user UPN and email address differ. Portal and PowerShe... | Azure AD B2B invitation mechanism uses the same address for both authenticati... | Workaround 1: Invite via Portal, manually copy InviteRedeemUrl and forward to... | 🟢 9.0 | OneNote |
| 8 📋 | Cross-cloud B2B guest user cannot access Azure Portal when navigating to portal.azure.com or port... | Default portal endpoint cannot determine which tenant the guest user should a... | MUST use tenanted endpoint: portal.azure.com/<tenant>.onmicrosoft.com or port... | 🟢 9.0 | OneNote |
| 9 📋 | Cross-cloud B2B guest invitation fails for consumer accounts (Microsoft personal accounts / LiveID). | CC B2B only supports organizational accounts. Consumer accounts (outlook.com,... | Use organizational accounts (onmicrosoft.com or custom verified domain). Cons... | 🟢 9.0 | OneNote |
| 10 📋 | CC B2B does not support Azure Data Explorer (ADX) web UI authentication or Dynamics 365 access fo... | ADX web UI and Dynamics 365 are not on the official supported app list for cr... | No workaround for ADX web UI or Dynamics 365 via CC B2B. For ADX: use REST AP... | 🟢 9.0 | OneNote |
| 11 📋 | 21v Azure portal has a known issue blocking Cross-Cloud B2B guest user login. Guest users from an... | Platform-level known issue in 21v (Mooncake) Azure portal that blocks CC B2B ... | Issue has been fixed by PG. If recurring, escalate via ICM to Azure Portal te... | 🟢 9.0 | OneNote |
| 12 📋 | Guest user cross-tenant SSO shows GUID as NameID instead of email address. NameID format is persi... | Claims mapping policies do not apply to guest users (B2B). For B2B users, map... | Cannot use mail as NameID for guest users via claims mapping. Change the appl... | 🟢 9.0 | OneNote |
| 13 📋 | Email one-time passcode (EOTP) is not delivered to B2B guest users whose account is not registere... | In Mooncake, the EOTP flow relies on live.com (GetOneTimeCode.srf). If the B2... | Verify whether the B2B guest user account is MSA-registered. If not, EOTP wil... | 🟢 8.5 | OneNote |
| 14 📋 | Verified ID Issuance: "attestations.missing" / "Credential subject in output Verifiable Credentia... | B2B guest account does not have First name and Last name populated. Credentia... | Edit the guest user account properties in the resource tenant - supply First ... | 🟢 8.5 | ADO Wiki |
| 15 📋 | AADSTS50107: The requested federation realm object does not exist - occurs during B2B SAML/WS-Fed... | Three possible causes: (1) IDP-initiated sign-on attempted, which is not supp... | (1) Use SP-initiated sign-on via Entra supported endpoints only; (2) Verify f... | 🟢 8.5 | ADO Wiki |
| 16 📋 | AADSTS5000819: Email address claim is missing or does not match domain from an external realm / A... | SAML Response from external IDP is missing required attributes or sent to inc... | Capture HAR/Fiddler trace, decode SAMLResponse sent to login.microsoftonline.... | 🟢 8.5 | ADO Wiki |
| 17 📋 | AADSTS5000811: Unable to verify token signature. The signing key identifier does not match any va... | SAML Response signed with a certificate that does not match the signing certi... | (1) Capture Fiddler trace, decode SAMLResponse, extract X509Certificate value... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Invitation redemption failed - An error has occurred. Please retry again shortly - on invitations... | Underlying AADSTS authentication error on login.microsoftonline.com/login.srf... | Capture HAR/Fiddler, inspect invitations.microsoft.com request Webforms secti... | 🟢 8.5 | ADO Wiki |
| 19 📋 | B2B invite redemption prompt: You are currently signed in as user1@domain.com, however, user2@dom... | Email claim in the SAMLResponse (http://schemas.xmlsoap.org/ws/2005/05/identi... | Capture HAR/Fiddler, decode SAMLResponse, check emailaddress attribute value ... | 🟢 8.5 | ADO Wiki |
| 20 📋 | B2B guest users with SAML/WS-Fed federation are redirected to an Entra tenant login page instead ... | Guest's domain (e.g., contoso.com) is a DNS-verified domain on another Entra ... | (1) Verify SAML federation config exists via ASC Graph Explorer; (2) Confirm ... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Unable to configure SAML/WS-Fed direct federation for a domain - API error: Invalid domain. Domai... | Known bug: when the federation domain (e.g., mydomain.com) differs from the p... | Workaround for domain mismatch bug: add DNS TXT record in format DirectFedPas... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Google Workspace SAML federated B2B guest user gets 403 error: app_not_configured_for_user / Serv... | Google Workspace does not have a SAML relying party application configured wi... | Google Workspace IDP admin follows https://support.google.com/a/answer/630107... | 🟢 8.5 | ADO Wiki |
| 23 📋 | B2B invitation fails due to proxyAddress or mail attribute conflict — invited user's email matche... | ProxyAddress or mail attribute conflict: the invited email address already ex... | In Azure Support Center → Tenant Explorer, search Users/Groups/Contacts in th... | 🟢 8.5 | ADO Wiki |
| 24 📋 | B2B service logs on aadb2bprod.westus2 Kusto cluster are PII-redacted since August 2023; unable t... | PII redaction policy applied to B2B service logs starting 2023-08, making Kus... | Track scenarios/ICMs/Cases in CSS AAD Log Access Tracking Spreadsheet (https:... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Sending a governance invitation from the governed tenant fails with HTTP 403 forbidden: "Failed t... | The governing tenant has not enabled the "Allow other tenants to send governa... | Navigate to Tenant governance settings blade under Settings → Toggle "Allow o... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Sending a governance invitation from the governed tenant fails with HTTP 403 Forbidden: Failed to... | The governing tenant has not enabled the Allow other tenants to send governan... | In the governing tenant: Entra admin center > Settings > Tenant governance se... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Sending a governance invitation fails with HTTP 403: Maximum limit of 10 reached | The governed tenant has already sent the maximum of 10 outbound governance in... | Delete existing outbound invitations that are no longer needed, then retry. I... | 🟢 8.5 | ADO Wiki |
| 28 📋 | User.usertype claim returns "UserTypeCloudManaged" instead of expected "Member" or "Guest" values | Known backend bug (Work Item 2838247) | Use conditional claim issuance: emit "Member" if User Type is "Members", emit... | 🟢 8.5 | ADO Wiki |
| 29 📋 | User.usertype claim returns UserTypeCloudManaged instead of Member/Guest | Known backend bug (Work Item 2838247) | Use conditional claim issuance. B2B converted to Member still shows Guest; us... | 🟢 8.5 | ADO Wiki |
| 30 📋 | SamAccountName in Microsoft Entra Domain Services has random GUID characters appended (e.g. CN=Jo... | SamAccountName is based on MailNickname property. When MailNickname is >20 ch... | 1) Find conflicting users via Get-EntraUser filtering by mailNickname. 2) Tem... | 🟢 8.5 | ADO Wiki |
| 31 📋 | External/guest user cannot sign in to Microsoft Entra Domain Services managed domain | MEDS does not have credentials for external user accounts. External users aut... | Inform customer this is not supported. External users cannot sign in to the m... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Unable to invite an external user via Azure AD B2B; invitation fails due to proxy conflict error | ProxyAddress collision between the invited external user's email and (Scenari... | Scenario 1 (conflict with local user): direct the user to sign in with their ... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Collection Owners don't see the Collections blade under Enterprise Apps when they sign into the A... | The Collection owner account has Guest membership in another tenant and they ... | Perform a 'Switch user' or 'Switch directory' in the Azure portal to change b... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Collection Owners cannot see the Collections blade under Enterprise Apps in Azure portal | The Collection owner account has Guest membership in another tenant and signe... | Perform Switch user / switch directory to change back to the home tenant wher... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Error 'Temporary Access Pass cannot be added to an external guest user' when trying to assign TAP | TAP is not supported for external guest users (users federated or invited fro... | TAP can only be issued to members and internally managed guests. For external... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Error 'Temporary Access Pass cannot be added to an external guest user' when trying to add TAP to... | TAP is supported for internal guest accounts but NOT for external guest accou... | Verify account type in ASC: Internal Guest has Sources=MOERA domain only, Cre... | 🟢 8.5 | ADO Wiki |
| 37 📋 | TAP does not work for external guest users - error: Temporary Access Pass cannot be added to an e... | External guest users (federated signInType) are not supported for TAP. Only i... | Verify account type via Graph API: GET /users/{id}?$select=identities. If sig... | 🟢 8.5 | ADO Wiki |
| 38 📋 | TAP provisioning fails for guest account - need to determine if account is internal guest (TAP su... | TAP only applies to Internal Guest Accounts (signInType=userPrincipalName, is... | Check user identities via Graph: GET /users/{id}?$select=identities. Internal... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Cannot use Microsoft Graph Explorer to access a different tenant as a guest user; Graph Explorer ... | By default, Graph Explorer authenticates against the user home tenant without... | Append ?tenant={tenantname.onmicrosoft.com} to the Graph Explorer URL (e.g., ... | 🟢 8.5 | ADO Wiki |
| 40 📋 | B2B guest user connecting to Azure Virtual Desktop receives "An authentication error has occurred... | Guest user is assigned to AVD Application Group but not assigned to "Virtual ... | Assign the guest user to "Virtual Machine Administrator Login" or "Virtual Ma... | 🟢 8.5 | ADO Wiki |
| ... | *83 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **b2b** related issues (16 entries) `[onenote]`
2. Check **saml-federation** related issues (6 entries) `[ado-wiki]`
3. Check **cross-cloud** related issues (5 entries) `[onenote]`
4. Check **cross-tenant** related issues (2 entries) `[onenote]`
5. Check **guest-user** related issues (2 entries) `[ado-wiki]`
6. Check **ccb2b** related issues (2 entries) `[onenote]`
7. Check **upn** related issues (2 entries) `[onenote]`
8. Check **invitation-redemption** related issues (2 entries) `[ado-wiki]`
