# ENTRA-ID Mooncake/21V Specific Issues — Detailed Troubleshooting Guide

**Entries**: 42 | **Drafts fused**: 11 | **Kusto queries**: 0
**Draft sources**: onenote-21v-test-environments.md, onenote-connectivity-testing-script-mooncake.md, onenote-ds-explorer-mooncake.md, onenote-entra-id-feature-parity-mooncake.md, onenote-ests-cdn-mooncake.md, onenote-ido-21v-portals-readiness.md, onenote-jarvis-query-examples-mooncake.md, onenote-mooncake-aad-tool-readiness.md, onenote-mooncake-entra-id-tool-readiness.md, onenote-mooncake-kusto-endpoints.md
**Generated**: 2026-04-07

---

## Phase 1: Sms Sign In
> 7 related entries

### Get-UserSMSSignInSettings returns 'notAllowedByPolicy' for a user with a unique phone number in the tenant
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The user has a valid phone number but is not within scope of the Text message sign-in policy. The policy must explicitly include the user or a group they belong to.

**Solution**: Add the user directly to the Text message sign-in policy under Authentication method policy in Azure AD > Authentication Methods, or add them to a group that is assigned to this policy.

---

### SMS Sign-in fails to enable for a user. Admin sees 'Unable to set sign-in method' notification. Audit log shows Failure with Status reason Director...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Phone number collision: another user in the tenant already has the same phone number registered. The AlternativeSecurityId attribute requires a unique Type|IdentityProvider|Key combination, which fails when the number is already provisioned.

**Solution**: Identify the existing user with that phone number (use Kusto query or check Audit logs with Global Admin/Privileged Auth Admin who can see the objectId in the PhoneNumberCollision notification). Remove the duplicate number from the other user before re-provisioning.

---

### SMS Sign-in previously worked for a user but suddenly stopped. No check mark next to Phone on Authentication Methods blade indicating 'SMS sign-in ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The user was removed from the Text message policy or from membership in a group assigned to the policy.

**Solution**: Re-add the user directly to the Text message policy, or add them to a group that is assigned to the policy. The mapping will indicate 'SMS sign-in ready' once again.

---

### SMS Sign-in: notAllowedByPolicy despite valid phone
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: User not in Text message policy scope

**Solution**: Add user to policy or assigned group

---

### SMS Sign-in fails: Unable to set method. DirectoryUniquenessException
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Phone number collision - another user has same number

**Solution**: Find conflicting user via Kusto/Audit, remove duplicate, re-provision

---

### SMS Sign-in stopped working. No SMS sign-in ready checkmark
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: User removed from Text message policy or group

**Solution**: Re-add user to policy or assigned group

---

### Teams Next button inactive for SMS Sign-in on Win/Mac
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: SMS Sign-in not supported on Teams Windows/macOS desktop

**Solution**: Enter as ##########@contoso.onmicrosoft.com then Use another account. Or use mobile/web

---

## Phase 2: Mfa
> 5 related entries

### Cannot query MFA logs from Jarvis SASPerRequestEvent / SASCommonEvent tables for Mooncake. Data not available in these Jarvis tables since Dec 2025.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Jarvis SAS tables (SASPerRequestEvent, SASCommonEvent) were deprecated for MFA log queries in Mooncake as of Dec 2025.

**Solution**: Use Kusto queries instead: cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne'). SAS logs: AllSASCommonEvents table (filter by env_time, userObjectId/TrackingID). CAPP logs: AllCappLogEvents table (filter by env_time, userObjectId, smsMessageId). TrackingID = ESTS correlation ID.

---

### MFA Authenticator app displays Object ID instead of UPN when using notification-based verification in Azure China (Mooncake).
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: This is by design (intentional). Azure MFA prevents EUII (end-user identifiable information) from leaving region boundaries, so Object ID is shown instead of UPN in push notifications on both iOS and Android.

**Solution**: Use 'Verification code without notification' mode instead of 'Receive notifications for verification'. This shows UPN correctly. Setup URL for 21V: https://aka.ms/ChinaMFASetup. Note: if Google Play services are unavailable on Android, notification mode won't work anyway — use verification code mode.

---

### Cannot retrieve MFA device/phone info via Microsoft Graph API in Mooncake. Authentication methods resources not available.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MS Graph authentication methods API not supported in Mooncake.

**Solution**: Workaround: AAD Graph API 1.6-internal. 1) Get AADv1 token via password grant with AAD PS AppId (1b730954-...) against login.partner.microsoftonline.cn. 2) GET graph.chinacloudapi.cn/myorganization/users/{objectId}?api-version=1.6-internal. MFA info in strongAuthenticationDetail. Internal API - not for production.

---

### Customer concerned that MFA phone calls/SMS for 21Vianet (Mooncake) M365 services originate from international numbers outside China mainland, rais...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: 21Vianet uses centralized global telecom services to deliver MFA SMS/voice calls. End users' phone numbers are transferred to global telecom service providers outside mainland China during MFA authentication.

**Solution**: Share CELA official response: 21Vianet has obtained prior authorization under customer agreement DPA for cross-border transfers. The DPA incorporates PIPL Article 21 entrusted processing requirements. 21Vianet commits to conducting personal information protection impact assessments and adopting appropriate transfer mechanisms. No current non-compliance under effective PRC law. If PRC law changes, 21Vianet will revisit and take measures. Mark communication as internal-only reference.

---

### Customer asks about MFA enforcement timeline for Azure admin portals in Mooncake (21Vianet).
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Microsoft rolling out mandatory MFA for all Azure users globally. Mooncake enforcement date not yet determined as of Aug 2024.

**Solution**: No Mooncake enforcement date set yet. Customer can proactively prepare by enabling MFA now. Refer to MS blog and MFA FAQ. Internal wiki: Azure Portal MFA Enforcement (AzureAD wiki pageid 1509472).

---

## Phase 3: B2C
> 4 related entries

### Azure AD B2C local account authentication fails with 'Invalid username or password' even though credentials are correct. Occurs in 21V (Mooncake) w...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Two issues: 1) The ESTS login endpoint in custom policy TrustFrameworkBase was pointing to global (login.microsoftonline.com) instead of 21V endpoint. 2) Issuer validation failed because login.partner.microsoftonline.cn is not recognized by B2C CPIM - must use sts.chinacloudapi.cn/{tenantId}/ as issuer.

**Solution**: In B2C custom policy XML, change the login endpoint to the 21V-specific endpoint: use https://login.chinacloudapi.cn/ or https://sts.chinacloudapi.cn/{tenantId}/ instead of login.partner.microsoftonline.cn. Verify via CPIM Kusto logs (cpimmcprod2.chinanorth2.kusto.chinacloudapi.cn/CPIM) using x-ms-cpim-trans correlation ID.

---

### AADB2C90052 Invalid username or password in Azure AD B2C China (Mooncake). Login-NonInteractive technical profile fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: In B2C China (Mooncake), the Login-NonInteractive technical profile ProviderName must include the tenant ID in the URL. Without tenant ID, authentication fails.

**Solution**: Set ProviderName to include tenant ID: <Item Key="ProviderName">https://sts.chinacloudapi.cn/{tenantId}/</Item>. Also set METADATA to https://login.partner.microsoftonline.cn/{tenant}/.well-known/openid-configuration and authorization_endpoint to https://login.partner.microsoftonline.cn/{tenant}/oauth2/token

---

### International social IDPs (Google, Facebook, Twitter) cannot be used as B2C identity providers in Mooncake (21V). Users cannot authenticate via the...
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: China's national firewall blocks access to Google, Facebook, and Twitter services. These IDPs are still shown in B2C UI but are non-functional in Mooncake environment.

**Solution**: PG is planning to hide blocked IDPs from the UI. Workaround: use Global AAD as IDP for Mooncake B2C - the user OID will be base64-converted into the AlternativeSecurityId attribute. Note: customized login UX might not work properly per B2C docs when using this approach.

---

### Azure AD B2C custom policies with OpenID Connect in Mooncake (Azure China) fail authentication or suddenly stop working. ProviderName set to https:...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The ProviderName key behavior changed. It now requires the tenant ID to be appended to the URL instead of just the base STS endpoint.

**Solution**: Change ProviderName in custom policy technical profile metadata from https://sts.chinacloudapi.cn/ to https://sts.chinacloudapi.cn/{tenantId}.

---

## Phase 4: Aadc
> 2 related entries

### onPremiseSamAccountName not visible in Mooncake AAD despite being synced by AADC. Not shown via PowerShell, ASC, or Graph PS SDK.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Many on-prem attributes synced as hint attributes. In Mooncake, hint attributes not exposed via PowerShell/ASC. Public Azure shows them normally.

**Solution**: Use MS Graph REST API directly (Postman/Graph Explorer) to query user object. Verify in AADC MV and CS that attribute exists. Sync rule: AD accountName -> MV accountName -> AAD onPremiseSamAccountName.

---

### Need to identify tenants still using AAD Connect v1.x in Mooncake to confirm whether retirement blocking applies to a specific tenant.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: AAD Connect v1.x retirement is rolling; some tenants still using v1 and not yet blocked. Need KQL on msodsmooncake cluster to check AWS logs.

**Solution**: Query msodsmooncake.chinanorth2.kusto: Global('IfxUlsEvents') | where env_cloud_role=='adminwebservice' and tagId=='a51t' and message startswith '[Exit' | parse appId and headerDirSyncBuildNum | filter appId in ('1651564e-...', '6eb59a73-...') and headerDirSyncBuildNum startswith '1.' | summarize by contextId. This identifies v1 tenants still connecting.

---

## Phase 5: Fic
> 2 related entries

### AADSTS700239: Claims matching expressions are not supported in this cloud at this time (FederatedIdentityFlexibleFicRestrictedCloud).
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Flexible FIC (expression-based matching) is not available in certain sovereign/national cloud environments such as Mooncake (China Cloud) or government clouds.

**Solution**: Use standard FIC with explicit subject matching instead of Flexible FIC expressions in unsupported cloud environments. Wait for Flexible FIC support to be enabled in the target cloud.

---

### Managed Identity from one cloud (e.g., Public) fails to authenticate as FIC for an Entra ID application in a different cloud (e.g., Mooncake/China ...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Managed Identities from one cloud cannot be federated into Entra ID applications in a different cloud. Cross-cloud federation is architecturally unsupported. This includes Public↔Mooncake, Public↔Fairfax, etc.

**Solution**: Ensure the Managed Identity and the Entra ID application are in the same cloud environment. Use cloud-specific audience values: Public=api://AzureADTokenExchange, Mooncake=api://AzureADTokenExchangeChina, Fairfax=api://AzureADTokenExchangeUSGov, USNat=api://AzureADTokenExchangeUSNat, USSec=api://AzureADTokenExchangeUSSec. Only User-Assigned Managed Identities are supported as FICs (not System-Assigned).

---

## Phase 6: Pta
> 2 related entries

### Customer asks about PTA, Staged Rollout, or Seamless SSO availability in Azure China (Mooncake) cloud
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: These Hybrid Authentication features are not supported in China (Mooncake) cloud. Only Password Hash Sync (PHS) is supported (ICM-374761727)

**Solution**: Inform customer that PTA, Staged Rollout, and AAD Seamless SSO are not supported in Mooncake. Recommend using Password Hash Sync (PHS) as the only supported authentication method

---

### PTA, Staged Rollout, and Azure AD Seamless SSO features are not available in Azure China (Mooncake) cloud
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: These hybrid authentication features are not supported in China (Mooncake) cloud by design

**Solution**: Use Password Hash Sync (PHS) only. PHS is the only supported hybrid authentication method in Mooncake

---

## Phase 7: Nps
> 1 related entries

### NPS extension for Azure MFA does not work in Azure China (21Vianet/Mooncake) environment with default configuration.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Default NPS extension configuration points to global Azure endpoints. China cloud requires different endpoints for MFA hostname, resource hostname, and STS URL. Additionally, the setup script needs Connect-MgGraph with -Environment China parameter.

**Solution**: 1) Modify AzureMfaNpsExtnConfigSetup.ps1: use Connect-MgGraph -Environment China. Register redirect URIs (https://login.microsoftonline.com/common/oauth2/nativeclient and http://localhost) and set Allow public client flows=Yes in app registration. 2) Set registry HKLM\SOFTWARE\Microsoft\AzureMfa: AZURE_MFA_HOSTNAME=strongauthenticationservice.auth.microsoft.cn, AZURE_MFA_RESOURCE_HOSTNAME=adnotifications.windowsazure.cn, STS_URL=https://login.chinacloudapi.cn/. 3) Restart IAS service. 4) Verify 

---

## Phase 8: Msgraph
> 1 related entries

### Microsoft Graph PowerShell SDK fails in Azure China (Mooncake) with AADSTS700016
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MS Graph PS SDK app (14d82eec) is 3P, not provisioned in Mooncake. PG will not fix.

**Solution**: Register custom app, grant MS Graph permissions, use cert auth with -Environment China.

---

## Phase 9: Dynamic Group
> 1 related entries

### Cannot create dynamic groups with extension attributes via Azure China portal
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure China portal does not support selecting extension attributes in dynamic group rule builder.

**Solution**: Use MS Graph API: create extension property, assign to users, then POST /beta/groups with membershipRule.

---

## Phase 10: Dual Federation
> 1 related entries

### Customer requests dual federation - single SSO covering both Global AAD and Mooncake AAD (sync on-prem AD to both clouds).
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: No general solution available. PG must evaluate individually. Implementing without PG approval NOT supported.

**Solution**: [DEPRECATED] Do NOT deliver dual-federation guidance. Pass-through: escalate to CSS. Non-pass-through: inform no general solution. Premier support required for PG evaluation/approval.

---

## Phase 11: Workload Identity
> 1 related entries

### Azure DevOps pipeline fails with AADSTS700212: No matching federated identity record found for presented assertion audience api://AzureADTokenExcha...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Azure DevOps backend changed the audience from api://AzureADTokenExchange to api://AzureADTokenExchangeChina for Mooncake environment. The federated identity credential on the Managed Identity still has the old audience value. Cloud-specific audiences: Public=api://AzureADTokenExchange, Mooncake=api://AzureADTokenExchangeChina, Fairfax=api://AzureADTokenExchangeUSGov.

**Solution**: Update the audience in the federated identity credential (Azure Portal > Managed Identity > Federated credentials) to match the cloud environment: api://AzureADTokenExchangeChina for Mooncake. Note: DevOps PG may change the audience back, so monitor and adjust accordingly.

---

## Phase 12: Msi
> 1 related entries

### Managed Identity token request returns HTTP 500 Internal Server Error from IMDS endpoint (169.254.169.254). One pod on a VM gets tokens fine while ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: IMDS node-level issue: PFXImportCertStore failed with 'There is not enough space on the disk' on the hosting node. The MSI certificate store operation fails due to low disk space on the physical node, causing all MSI token requests on that node to return 500.

**Solution**: 1) Check ImdsSpan Kusto table: cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').ImdsSpan with NodeId and statusMessage filters. 2) Check Jarvis ImdsEvent table. 3) If FaultPoint=IdentityException:CertPFXImportCertStoreFailed, this is a node-level issue - file ICM to platform team. 4) Workaround: redeploy workload to different node. Note: ImdsApiReqResp table does NOT work in Mooncake.

---

## Phase 13: Cae
> 1 related entries

### Outlook Report Phishing add-in fails on VDI (VMware) with CAE error: InteractionRequired / LocationConditionEvaluationSatisfied when accessing micr...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: VDI routes login and Graph traffic through different outbound IPs (firewall vs Zscaler). CAE detects IP change mid-session: token issued from trusted IP but Graph call from untrusted IP.

**Solution**: Option 1: Add VDI outbound IP (Zscaler) to CA trusted IP-based Named Location. Option 2: Fix VDI network so both endpoints use same outbound IP. Debug: decode access token at jwt.ms, base64-decode claims in 401 for xms_rp_ipaddr.

---

## Phase 14: Rdp
> 1 related entries

### RDP to AADJ VM fails with internal error when using FQDN for Entra ID web account auth. Succeeds with NetBIOS name or IP.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Custom domain FQDN suffix missing ICP record in 21Vianet. Azure China blocks connections to domains without ICP. TCP RST sent by 21v-bluecloud.

**Solution**: Option 1: Complete ICP registration at support.azure.cn. Option 2: Change VM FQDN suffix to domain with ICP record. Workaround: Use NetBIOS name or IP for RDP.

---

## Phase 15: Dual Federation
> 1 related entries

### Microsoft Authenticator app cannot handle two accounts with same UPN from different cloud instances (e.g. public Azure and Mooncake). Users cannot ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Authenticator app identifies accounts by UPN and cannot distinguish multiple accounts with the same UPN across different Azure cloud instances.

**Solution**: Register one of the accounts in a different authenticator app (e.g. Google Authenticator). The OTP/TOTP method uses open standard OATH algorithm compatible across authenticator apps.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure DevOps pipeline fails with AADSTS700212: No matching federated identity... | Azure DevOps backend changed the audience from api://Azur... | Update the audience in the federated identity credential ... | 🟢 10.0 | OneNote |
| 2 | Cannot query MFA logs from Jarvis SASPerRequestEvent / SASCommonEvent tables ... | Jarvis SAS tables (SASPerRequestEvent, SASCommonEvent) we... | Use Kusto queries instead: cluster('idsharedmcsha.chinaea... | 🟢 10.0 | OneNote |
| 3 | MFA Authenticator app displays Object ID instead of UPN when using notificati... | This is by design (intentional). Azure MFA prevents EUII ... | Use 'Verification code without notification' mode instead... | 🟢 9.0 | OneNote |
| 4 | NPS extension for Azure MFA does not work in Azure China (21Vianet/Mooncake) ... | Default NPS extension configuration points to global Azur... | 1) Modify AzureMfaNpsExtnConfigSetup.ps1: use Connect-MgG... | 🟢 9.0 | OneNote |
| 5 | Microsoft Graph PowerShell SDK fails in Azure China (Mooncake) with AADSTS700016 | MS Graph PS SDK app (14d82eec) is 3P, not provisioned in ... | Register custom app, grant MS Graph permissions, use cert... | 🟢 9.0 | OneNote |
| 6 | Cannot create dynamic groups with extension attributes via Azure China portal | Azure China portal does not support selecting extension a... | Use MS Graph API: create extension property, assign to us... | 🟢 9.0 | OneNote |
| 7 | Customer requests dual federation - single SSO covering both Global AAD and M... | No general solution available. PG must evaluate individua... | [DEPRECATED] Do NOT deliver dual-federation guidance. Pas... | 🟢 9.0 | OneNote |
| 8 | Cannot retrieve MFA device/phone info via Microsoft Graph API in Mooncake. Au... | MS Graph authentication methods API not supported in Moon... | Workaround: AAD Graph API 1.6-internal. 1) Get AADv1 toke... | 🟢 9.0 | OneNote |
| 9 | onPremiseSamAccountName not visible in Mooncake AAD despite being synced by A... | Many on-prem attributes synced as hint attributes. In Moo... | Use MS Graph REST API directly (Postman/Graph Explorer) t... | 🟢 9.0 | OneNote |
| 10 | Azure AD B2C local account authentication fails with 'Invalid username or pas... | Two issues: 1) The ESTS login endpoint in custom policy T... | In B2C custom policy XML, change the login endpoint to th... | 🟢 9.0 | OneNote |
| 11 | Managed Identity token request returns HTTP 500 Internal Server Error from IM... | IMDS node-level issue: PFXImportCertStore failed with 'Th... | 1) Check ImdsSpan Kusto table: cluster('azcore.chinanorth... | 🟢 9.0 | OneNote |
| 12 | Outlook Report Phishing add-in fails on VDI (VMware) with CAE error: Interact... | VDI routes login and Graph traffic through different outb... | Option 1: Add VDI outbound IP (Zscaler) to CA trusted IP-... | 🟢 9.0 | OneNote |
| 13 | RDP to AADJ VM fails with internal error when using FQDN for Entra ID web acc... | Custom domain FQDN suffix missing ICP record in 21Vianet.... | Option 1: Complete ICP registration at support.azure.cn. ... | 🟢 9.0 | OneNote |
| 14 | Microsoft Authenticator app cannot handle two accounts with same UPN from dif... | Authenticator app identifies accounts by UPN and cannot d... | Register one of the accounts in a different authenticator... | 🟢 9.0 | OneNote |
| 15 | Custom domain unexpectedly appears in public Azure AD due to viral tenant cre... | When a user signs up for PBI trial using corporate email,... | (1) Customer performs admin takeover of viral tenant per ... | 🟢 9.0 | OneNote |
| 16 | Customer concerned that MFA phone calls/SMS for 21Vianet (Mooncake) M365 serv... | 21Vianet uses centralized global telecom services to deli... | Share CELA official response: 21Vianet has obtained prior... | 🟢 9.0 | OneNote |
| 17 | LogsMiner tool cannot authenticate or access logs in Mooncake environment | LogsMiner requires CME account authentication and Environ... | 1) Download latest LogsMiner (v1.0.4942.0+) from https://... | 🟢 9.0 | OneNote |
| 18 | Need Microsoft Graph Explorer URL for Mooncake (Azure China) environment | Mooncake uses separate Graph Explorer endpoints from publ... | Mooncake Graph Explorer URLs: 1) https://developer.micros... | 🟢 9.0 | OneNote |
| 19 | AADB2C90052 Invalid username or password in Azure AD B2C China (Mooncake). Lo... | In B2C China (Mooncake), the Login-NonInteractive technic... | Set ProviderName to include tenant ID: <Item Key="Provide... | 🟢 8.5 | ADO Wiki |
| 20 | International social IDPs (Google, Facebook, Twitter) cannot be used as B2C i... | China's national firewall blocks access to Google, Facebo... | PG is planning to hide blocked IDPs from the UI. Workarou... | 🟢 8.0 | OneNote |
| 21 | Customer asks about MFA enforcement timeline for Azure admin portals in Moonc... | Microsoft rolling out mandatory MFA for all Azure users g... | No Mooncake enforcement date set yet. Customer can proact... | 🟢 8.0 | OneNote |
| 22 | SMS-based primary authentication (SMS Sign-in) is not available in Mooncake. | No plans to support SMS as primary authentication in Moon... | No plan to support. Use other auth methods. | 🟢 8.0 | OneNote |
| 23 | Sign-in with email as alternate login ID not available in Mooncake. Being rep... | Current feature has security issues. PG replacing with AS... | ASI parity across clouds planned once GA (later CY25). No... | 🟢 8.0 | OneNote |
| 24 | Need to identify tenants still using AAD Connect v1.x in Mooncake to confirm ... | AAD Connect v1.x retirement is rolling; some tenants stil... | Query msodsmooncake.chinanorth2.kusto: Global('IfxUlsEven... | 🟢 8.0 | OneNote |
| 25 | Number matching in Microsoft Authenticator push notification is not available... | Feature gap in Mooncake. No ETA from PG. Related to case ... | Not available in Mooncake. No ETA. Use SMS or OATH token ... | 🔵 7.0 | OneNote |
| 26 | Temporary Access Pass (TAP) support in Azure portal UI is not available in Mo... | TAP UI support is a feature gap in Mooncake. No ETA. Rela... | TAP UI not available in Mooncake portal. No ETA. Explore ... | 🔵 7.0 | OneNote |
| 27 | Get-UserSMSSignInSettings returns 'notAllowedByPolicy' for a user with a uniq... | The user has a valid phone number but is not within scope... | Add the user directly to the Text message sign-in policy ... | 🔵 6.5 | ADO Wiki |
| 28 | SMS Sign-in fails to enable for a user. Admin sees 'Unable to set sign-in met... | Phone number collision: another user in the tenant alread... | Identify the existing user with that phone number (use Ku... | 🔵 6.5 | ADO Wiki |
| 29 | SMS Sign-in previously worked for a user but suddenly stopped. No check mark ... | The user was removed from the Text message policy or from... | Re-add the user directly to the Text message policy, or a... | 🔵 6.5 | ADO Wiki |
| 30 | SMS Sign-in: notAllowedByPolicy despite valid phone | User not in Text message policy scope | Add user to policy or assigned group | 🔵 6.5 | ADO Wiki |
