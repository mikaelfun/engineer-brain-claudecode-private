# ENTRA-ID Mooncake/21V Specific Issues — Quick Reference

**Entries**: 42 | **21V**: Partial (29/42)
**Last updated**: 2026-04-06
**Keywords**: mooncake, 21v-unsupported, 21v, mfa, sms-sign-in, b2c

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/mooncake-21v.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Azure DevOps pipeline fails with AADSTS700212: No matching federated identity record found for pr... | Azure DevOps backend changed the audience from api://AzureADTokenExchange to ... | Update the audience in the federated identity credential (Azure Portal > Mana... | 🟢 10.0 | OneNote |
| 2 📋 | Cannot query MFA logs from Jarvis SASPerRequestEvent / SASCommonEvent tables for Mooncake. Data n... | Jarvis SAS tables (SASPerRequestEvent, SASCommonEvent) were deprecated for MF... | Use Kusto queries instead: cluster('idsharedmcsha.chinaeast2.kusto.chinacloud... | 🟢 10.0 | OneNote |
| 3 📋 | MFA Authenticator app displays Object ID instead of UPN when using notification-based verificatio... | This is by design (intentional). Azure MFA prevents EUII (end-user identifiab... | Use 'Verification code without notification' mode instead of 'Receive notific... | 🟢 9.0 | OneNote |
| 4 📋 | NPS extension for Azure MFA does not work in Azure China (21Vianet/Mooncake) environment with def... | Default NPS extension configuration points to global Azure endpoints. China c... | 1) Modify AzureMfaNpsExtnConfigSetup.ps1: use Connect-MgGraph -Environment Ch... | 🟢 9.0 | OneNote |
| 5 📋 | Microsoft Graph PowerShell SDK fails in Azure China (Mooncake) with AADSTS700016 | MS Graph PS SDK app (14d82eec) is 3P, not provisioned in Mooncake. PG will no... | Register custom app, grant MS Graph permissions, use cert auth with -Environm... | 🟢 9.0 | OneNote |
| 6 📋 | Cannot create dynamic groups with extension attributes via Azure China portal | Azure China portal does not support selecting extension attributes in dynamic... | Use MS Graph API: create extension property, assign to users, then POST /beta... | 🟢 9.0 | OneNote |
| 7 📋 | Customer requests dual federation - single SSO covering both Global AAD and Mooncake AAD (sync on... | No general solution available. PG must evaluate individually. Implementing wi... | [DEPRECATED] Do NOT deliver dual-federation guidance. Pass-through: escalate ... | 🟢 9.0 | OneNote |
| 8 📋 | Cannot retrieve MFA device/phone info via Microsoft Graph API in Mooncake. Authentication methods... | MS Graph authentication methods API not supported in Mooncake. | Workaround: AAD Graph API 1.6-internal. 1) Get AADv1 token via password grant... | 🟢 9.0 | OneNote |
| 9 📋 | onPremiseSamAccountName not visible in Mooncake AAD despite being synced by AADC. Not shown via P... | Many on-prem attributes synced as hint attributes. In Mooncake, hint attribut... | Use MS Graph REST API directly (Postman/Graph Explorer) to query user object.... | 🟢 9.0 | OneNote |
| 10 📋 | Azure AD B2C local account authentication fails with 'Invalid username or password' even though c... | Two issues: 1) The ESTS login endpoint in custom policy TrustFrameworkBase wa... | In B2C custom policy XML, change the login endpoint to the 21V-specific endpo... | 🟢 9.0 | OneNote |
| 11 📋 | Managed Identity token request returns HTTP 500 Internal Server Error from IMDS endpoint (169.254... | IMDS node-level issue: PFXImportCertStore failed with 'There is not enough sp... | 1) Check ImdsSpan Kusto table: cluster('azcore.chinanorth3.kusto.chinacloudap... | 🟢 9.0 | OneNote |
| 12 📋 | Outlook Report Phishing add-in fails on VDI (VMware) with CAE error: InteractionRequired / Locati... | VDI routes login and Graph traffic through different outbound IPs (firewall v... | Option 1: Add VDI outbound IP (Zscaler) to CA trusted IP-based Named Location... | 🟢 9.0 | OneNote |
| 13 📋 | RDP to AADJ VM fails with internal error when using FQDN for Entra ID web account auth. Succeeds ... | Custom domain FQDN suffix missing ICP record in 21Vianet. Azure China blocks ... | Option 1: Complete ICP registration at support.azure.cn. Option 2: Change VM ... | 🟢 9.0 | OneNote |
| 14 📋 | Microsoft Authenticator app cannot handle two accounts with same UPN from different cloud instanc... | Authenticator app identifies accounts by UPN and cannot distinguish multiple ... | Register one of the accounts in a different authenticator app (e.g. Google Au... | 🟢 9.0 | OneNote |
| 15 📋 | Custom domain unexpectedly appears in public Azure AD due to viral tenant created by Power BI tri... | When a user signs up for PBI trial using corporate email, Azure AD auto-creat... | (1) Customer performs admin takeover of viral tenant per MS docs. (2) File IC... | 🟢 9.0 | OneNote |
| 16 📋 | Customer concerned that MFA phone calls/SMS for 21Vianet (Mooncake) M365 services originate from ... | 21Vianet uses centralized global telecom services to deliver MFA SMS/voice ca... | Share CELA official response: 21Vianet has obtained prior authorization under... | 🟢 9.0 | OneNote |
| 17 📋 | LogsMiner tool cannot authenticate or access logs in Mooncake environment | LogsMiner requires CME account authentication and Environment=China selection... | 1) Download latest LogsMiner (v1.0.4942.0+) from https://aka.ms/logsminer. 2)... | 🟢 9.0 | OneNote |
| 18 📋 | Need Microsoft Graph Explorer URL for Mooncake (Azure China) environment | Mooncake uses separate Graph Explorer endpoints from public Azure. | Mooncake Graph Explorer URLs: 1) https://developer.microsoft.com/zh-cn/graph/... | 🟢 9.0 | OneNote |
| 19 📋 | AADB2C90052 Invalid username or password in Azure AD B2C China (Mooncake). Login-NonInteractive t... | In B2C China (Mooncake), the Login-NonInteractive technical profile ProviderN... | Set ProviderName to include tenant ID: <Item Key="ProviderName">https://sts.c... | 🟢 8.5 | ADO Wiki |
| 20 📋 | International social IDPs (Google, Facebook, Twitter) cannot be used as B2C identity providers in... | China's national firewall blocks access to Google, Facebook, and Twitter serv... | PG is planning to hide blocked IDPs from the UI. Workaround: use Global AAD a... | 🟢 8.0 | OneNote |
| 21 📋 | Customer asks about MFA enforcement timeline for Azure admin portals in Mooncake (21Vianet). | Microsoft rolling out mandatory MFA for all Azure users globally. Mooncake en... | No Mooncake enforcement date set yet. Customer can proactively prepare by ena... | 🟢 8.0 | OneNote |
| 22 📋 | SMS-based primary authentication (SMS Sign-in) is not available in Mooncake. | No plans to support SMS as primary authentication in Mooncake, per PG (anjusi... | No plan to support. Use other auth methods. | 🟢 8.0 | OneNote |
| 23 📋 | Sign-in with email as alternate login ID not available in Mooncake. Being replaced by Alternate S... | Current feature has security issues. PG replacing with ASI supporting email, ... | ASI parity across clouds planned once GA (later CY25). Not clear if Mooncake ... | 🟢 8.0 | OneNote |
| 24 📋 | Need to identify tenants still using AAD Connect v1.x in Mooncake to confirm whether retirement b... | AAD Connect v1.x retirement is rolling; some tenants still using v1 and not y... | Query msodsmooncake.chinanorth2.kusto: Global('IfxUlsEvents') / where env_clo... | 🟢 8.0 | OneNote |
| 25 📋 | Number matching in Microsoft Authenticator push notification is not available in Mooncake (21Vian... | Feature gap in Mooncake. No ETA from PG. Related to case 2406180040001262. | Not available in Mooncake. No ETA. Use SMS or OATH token for MFA verification... | 🔵 7.0 | OneNote |
| 26 📋 | Temporary Access Pass (TAP) support in Azure portal UI is not available in Mooncake (21Vianet). | TAP UI support is a feature gap in Mooncake. No ETA. Related to case 24042300... | TAP UI not available in Mooncake portal. No ETA. Explore PowerShell/Graph API... | 🔵 7.0 | OneNote |
| 27 📋 | Get-UserSMSSignInSettings returns 'notAllowedByPolicy' for a user with a unique phone number in t... | The user has a valid phone number but is not within scope of the Text message... | Add the user directly to the Text message sign-in policy under Authentication... | 🔵 6.5 | ADO Wiki |
| 28 📋 | SMS Sign-in fails to enable for a user. Admin sees 'Unable to set sign-in method' notification. A... | Phone number collision: another user in the tenant already has the same phone... | Identify the existing user with that phone number (use Kusto query or check A... | 🔵 6.5 | ADO Wiki |
| 29 📋 | SMS Sign-in previously worked for a user but suddenly stopped. No check mark next to Phone on Aut... | The user was removed from the Text message policy or from membership in a gro... | Re-add the user directly to the Text message policy, or add them to a group t... | 🔵 6.5 | ADO Wiki |
| 30 📋 | SMS Sign-in: notAllowedByPolicy despite valid phone | User not in Text message policy scope | Add user to policy or assigned group | 🔵 6.5 | ADO Wiki |
| 31 📋 | SMS Sign-in fails: Unable to set method. DirectoryUniquenessException | Phone number collision - another user has same number | Find conflicting user via Kusto/Audit, remove duplicate, re-provision | 🔵 6.5 | ADO Wiki |
| 32 📋 | SMS Sign-in stopped working. No SMS sign-in ready checkmark | User removed from Text message policy or group | Re-add user to policy or assigned group | 🔵 6.5 | ADO Wiki |
| 33 📋 | AADSTS70001: Application {GUID} is disabled. Users cannot sign in to app disabled by Microsoft du... | Microsoft Identity Protection detected app as malicious. disabledByMicrosoftS... | File IcM: Identity Protection Service > Identity Reputation Management and Ab... | 🔵 6.5 | ADO Wiki |
| 34 📋 | AADSTS700239: Claims matching expressions are not supported in this cloud at this time (Federated... | Flexible FIC (expression-based matching) is not available in certain sovereig... | Use standard FIC with explicit subject matching instead of Flexible FIC expre... | 🔵 6.5 | ADO Wiki |
| 35 📋 | Managed Identity from one cloud (e.g., Public) fails to authenticate as FIC for an Entra ID appli... | Managed Identities from one cloud cannot be federated into Entra ID applicati... | Ensure the Managed Identity and the Entra ID application are in the same clou... | 🔵 6.5 | ADO Wiki |
| 36 📋 | Azure AD B2C custom policies with OpenID Connect in Mooncake (Azure China) fail authentication or... | The ProviderName key behavior changed. It now requires the tenant ID to be ap... | Change ProviderName in custom policy technical profile metadata from https://... | 🔵 6.5 | ADO Wiki |
| 37 📋 | Customer asks about PTA, Staged Rollout, or Seamless SSO availability in Azure China (Mooncake) c... | These Hybrid Authentication features are not supported in China (Mooncake) cl... | Inform customer that PTA, Staged Rollout, and AAD Seamless SSO are not suppor... | 🔵 6.5 | ADO Wiki |
| 38 📋 | Seamless SSO, PTA, and Staged Rollout features do not work in Azure China Mooncake cloud | These hybrid authentication features are not supported in China Mooncake clou... | Use Password Hash Sync PHS instead. PTA, Seamless SSO, and Staged Rollout are... | 🔵 6.5 | ADO Wiki |
| 39 📋 | PTA, Staged Rollout, and Azure AD Seamless SSO features are not available in Azure China (Mooncak... | These hybrid authentication features are not supported in China (Mooncake) cl... | Use Password Hash Sync (PHS) only. PHS is the only supported hybrid authentic... | 🔵 6.5 | ADO Wiki |
| 40 📋 | Need to extend or purchase trial license for 21Vianet test tenants (Entra ID P2, EMS, Intune, Off... | - | Extend: portal.partner.microsoftonline.cn -> Billing -> Subscriptions -> supp... | 🔵 6.0 | OneNote |
| ... | *2 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **mfa** related issues (6 entries) `[onenote]`
2. Check **mooncake** related issues (6 entries) `[onenote]`
3. Check **b2c** related issues (3 entries) `[onenote]`
4. Check **authenticator** related issues (2 entries) `[onenote]`
5. Check **msgraph** related issues (2 entries) `[onenote]`
