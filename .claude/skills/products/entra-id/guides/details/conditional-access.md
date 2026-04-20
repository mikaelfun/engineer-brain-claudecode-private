# ENTRA-ID Conditional Access — Detailed Troubleshooting Guide

**Entries**: 74 | **Drafts fused**: 2 | **Kusto queries**: 1
**Draft sources**: ado-wiki-b-mcp-server-conditional-access.md, ado-wiki-c-conditional-access-tsg.md
**Kusto references**: conditional-access-decode.md
**Generated**: 2026-04-07

---

## Phase 1: Conditional Access
> 40 related entries

### Conditional Access geo-based block policy does not block sign-in from blacklisted country/IP. Attacker still accesses Exchange Online despite CA po...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Legacy/basic auth apps (e.g., iOS default Mail, AppId bfc44fc5-...) use OrgID traffic. CA is skipped for Exchange Server OrgID traffic. Only modern auth evaluated by CA.

**Solution**: Mitigations: (1) app-based CA, (2) disable basic auth via Set-AuthenticationPolicy, (3) Set-OrganizationConfig -IPListBlocked, (4) Client Access Rules in EXO, (5) ADFS claim rules to block non-modern auth, (6) Set-SPOTenant -LegacyAuthProtocolsEnabled false.

---

### Clients with IPv6 addresses incorrectly have Conditional Access location-based policy applied; blocked despite being in excluded country
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Named Locations does not support IPv6 addresses for geolocation mapping. IPv6 addresses cannot be mapped to a country, so they fall into 'unknown areas'. If the Named Location has 'Include unknown areas' checked, the policy applies to IPv6 clients.

**Solution**: Customer should uncheck the 'Include unknown areas' option in the Conditional Access Named Location. Alternatively, add IPv6 address ranges as IP-based Named Locations.

---

### Error 1150: Cannot create or update policies with workload identity premium features when creating/editing CA policy for service principals via API
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Post-GA, Microsoft Entra Workload Identities premium licenses are required to create or edit Conditional Access policies targeting service principals. The Conditional Access APIs enforce licensing requirements.

**Solution**: Customer must acquire Microsoft Entra Workload Identities premium licenses by purchasing them or activating a 90-day free trial. Trial activation URLs: Entra admin center (entra.microsoft.com) or Azure AD Portal (portal.azure.com) with feature flags. Note: 'Workload_Identities_for_EPM_customers' is NOT the same as Workload Identities premium.

---

### CA policies targeting individual Office 365 apps (e.g. Exchange Online, Teams, SharePoint separately) cause inconsistent enforcement, unexpected si...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Office 365 apps have inter-service dependencies (e.g. Teams depends on SharePoint and Exchange). Targeting individual apps in CA policies leads to unpredictable evaluation as dependent services trigger additional CA policy checks for their own resource AppIDs.

**Solution**: Use the combined Office 365 application group in CA policies for consistent enforcement. The group includes all Office 365 AppIDs (Exchange, SharePoint, Teams, Yammer, Stream, PowerApps, etc.). Review the CA application picker recommendation. Full AppID list available in ESTS-Main Office365Apps.cs.

---

### 'Require approved client app' Conditional Access grant control scheduled for retirement on June 30, 2026 (MC540749). Organizations must migrate to ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft retiring the 'Require approved client app' control (originally announced March 2023) in favor of 'Require app protection policy' which provides additional security including Intune app protection policy verification.

**Solution**: Transition to 'Require app protection policy' before June 30, 2026. Recommended: select both controls and choose 'Require one of the selected controls'. See MC540749.

---

### Error 'Policy configuration is not supported' when enabling an EAS Conditional Access policy for MAM (Require approved client app) with other Condi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MAM EAS policy does not support having other Conditions enabled simultaneously with Exchange ActiveSync client app condition and Require approved client app control.

**Solution**: Set all other Conditions to 'Not configured' before enabling the EAS policy with 'Require approved client app' control.

---

### Devices already enrolled continue to prompt for device enrollment when accessing O365 Exchange Online with 'Require approved client app' and Exchan...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Native built-in Mail clients on iOS and Android are not MAM compatible. The device is enrolled but the mail app itself does not support MAM SDK.

**Solution**: Users must use MAM-compatible apps like Microsoft Outlook. Native mail clients are blocked by design; users receive quarantine email directing to approved apps.

---

### WhatIf tool in Conditional Access does not show policies targeting User actions (Register security information); admins think CA policies are not a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WhatIf defaults to Cloud apps tab, not User actions tab. The condition label was not renamed to Cloud apps or actions in WhatIf at time of release

**Solution**: In WhatIf, explicitly select the User action tab and check Register security information before running the query. The condition will be renamed to Cloud apps or actions by GA

---

### Users get Oops something went wrong or unexpected error when accessing My Apps portal while CA policy blocks All cloud apps but excludes My Apps
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: My Apps depends on legacy IAMUX application launcher service which is not targetable in CA policy. Excluding My Apps from CA does not exclude IAMUX, so the CA policy still blocks the launch flow

**Solution**: Enable new MyApps launcher (launcher.myapps.microsoft.com/api/signin) which bypasses IAMUX. Admin can toggle Enable new My Apps launch experience for conditional access in App launchers settings. For legacy Secret Store apps, update app properties to migrate to new Secret Store. MSA guest users still fall back to IAMUX (unsupported)

---

### VPN connection fails when combining Conditional Access for VPN with NPS Extension for Azure MFA using SSTP, L2TP, or IKEv2 connection types
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate-based authentication is officially unsupported with NPS Extension for Azure MFA. Only PPTP connection type works with this configuration

**Solution**: Use PPTP connection type. Configure EAP XML with AAD Conditional Access EKU (OID 1.3.6.1.4.1.311.87). Add IgnoreNoRevocationCheck=1 registry key under HKLM\SYSTEM\CurrentControlSet\Services\RasMan\PPP\EAP\13 and reboot. Note: this combined configuration is not officially supported

---

## Phase 2: Aadsts53003
> 2 related entries

### Az CLI login fails with AADSTS53003 blocked by CA even though browser auth succeeds from same machine.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Browser uses PAC-file proxy (corporate IP in CA trusted locations), but Az CLI does not inherit proxy. Az CLI sends token redemption directly without proxy, using different IP not in trusted locations.

**Solution**: Configure proxy env vars before az login: HTTP_PROXY and HTTPS_PROXY. Also check WinHTTP proxy (netsh winhttp show proxy).

---

### AADSTS53003: Access has been blocked by Conditional Access policies. The access policy does not allow token issuance. The capolids claim in error r...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A Conditional Access policy blocked authentication. Common in non-interactive (daemon/background) flows where the user/service account does not meet CA requirements (MFA, device compliance, location restrictions).

**Solution**: For non-interactive flows: (1) Add service account as exception to the CA policy. (2) Switch to client credentials flow (app-only token) - note each resource may have additional requirements. (3) Implement interactive sign-in capability. For interactive flows: ensure app handles this error and prompts for interactive sign-in. Use capolids value from error claims to identify blocking CA policy.

---

## Phase 3: Tenant Governance
> 2 related entries

### GDAP users from governing tenant cannot sign in to governed tenant; Conditional Access policies block GDAP sign-in
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GDAP users do not have a user presence in the governed tenant. Conditional Access policies that require user resolution (e.g., Terms of Use) will block sign-in because there is no user object to resolve against

**Solution**: Review and adjust Conditional Access policies in the governed tenant to accommodate GDAP users. Exclude policies requiring user presence (Terms of Use, user-based conditions) for GDAP/cross-tenant scenarios. GDAP users sign in via entra.microsoft.com/{governed tenant ID}

---

### GDAP users from governing tenant cannot sign in to the governed tenant; Conditional Access policy blocks authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conditional Access policies in the governed tenant require user resolution (e.g. Terms of Use) but GDAP users have no user presence in the governed tenant

**Solution**: Adjust Conditional Access policies in the governed tenant to accommodate GDAP users who lack a local user object. Exclude GDAP sign-ins from policies requiring Terms of Use or similar user-presence-dependent controls

---

## Phase 4: Linux Sso
> 2 related entries

### Edge on Linux does not show trace information (Request ID) when a Conditional Access policy's grant controls are not satisfied. This differs from W...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: By design — Edge on Linux does not currently surface end-user trace information for CA policy failures, unlike the Windows client.

**Solution**: Instruct the user to enable browser trace logging in Edge to discover the Request ID: launch Edge with '--enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii' flags to capture detailed OneAuth logs.

---

### Device is marked as compliant in intune-portal, but Edge on Linux cannot access Teams or other 2FA-gated resources. User sees 'Set up your device t...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Stale browser cookies or session state in Edge causes the device state to appear unregistered to the resource despite Intune compliance status being correct.

**Solution**: Clear cookies in Edge and restart the browser.

---

## Phase 5: Aadsts50177
> 2 related entries

### AADSTS50177 for passthrough user (B2B/CSP) accessing resource tenant. True error: ExternalChallengeNotSupportedForPassthroughusers.
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Resource tenant has conditional access policy with external challenge controls (e.g., Terms of Use) that are not supported for CSP/B2B passthrough users.

**Solution**: Customer must exclude CSP service provider from CA policies enforcing external challenge controls. Use Auth Troubleshooter with correlation ID to identify blocking policy. See GDAP FAQ.

---

### AADSTS50177/50178: CSP admin blocked by Terms of Use or Session Control CA policy - actual error is ExternalChallengeNotSupportedForPassthroughUser...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Passthrough User authentication (CSP/GDAP) does not support certain CA policies including Terms of Use and Session Controls. Customer-facing error misleadingly says user does not exist.

**Solution**: Customer must exclude the application or External User Type = Service Provider from the Terms of Use / Session Control CA policy. Use ASC Auth Troubleshooter with correlation ID to find true error in expert diagnostic logs.

---

## Phase 6: Identity Protection
> 2 related entries

### Service principal risk condition shows 'Not available' when creating Conditional Access Policy with workload identities selected.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Requires 'All cloud apps' under Cloud apps or actions. Selecting specific apps makes condition unavailable.

**Solution**: Select Cloud apps or actions > All cloud apps when creating CA policy targeting workload identities.

---

### When creating a Conditional Access Policy with Workload identities selected, the Service principal risk condition shows as Not available and is unm...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: All cloud apps is not selected under Cloud apps or actions when Workload identities is chosen as the identity type.

**Solution**: Select Cloud apps or actions and choose All cloud apps to make the Service principal risk condition available.

---

## Phase 7: Terms Of Use
> 2 related entries

### Creating Terms of Use fails with error 'There was a problem creating terms of use <DisplayName>' when the combined PDF file size for all selected l...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The initial Create of a TOU term is written as a single blob. There is a 2MB limitation at the gateway, so if the total size of the files exceeds 2MB the Create will fail.

**Solution**: If only one language file exceeds 2MB, use a smaller file. If creating a TOU with multiple languages where each file is <2MB but the total exceeds 2MB, create the TOU with only one language first, then add each additional language file afterward (subsequent additions are not subject to the same limit).

---

### Users are blocked from enrolling their devices when 'Consent per device' setting is enabled on Terms of Use and the Conditional Access policy has t...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Consent per device' TOU setting is incompatible with Intune enrollment app as the CA policy target. Device enrollment flow cannot satisfy the per-device consent requirement through the Intune enrollment app.

**Solution**: Option 1: Turn the 'Consent per device' setting off on the TOU. Option 2: Update the CA policy app targeting from Intune enrollment to the actual resource apps the users will be accessing (e.g., SharePoint Online, Exchange Online).

---

## Phase 8: Global Secure Access
> 2 related entries

### Admin configures a Conditional Access policy to block Global Secure Access M365 traffic profile, but users can still access M365 destinations bypas...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: M365 forwarding traffic policies have hardening set to bypass by default. When a user cannot acquire a token for the M365 traffic profile, traffic goes over the internet without flowing through NaaS. Hardening=tunnel mode is not yet supported.

**Solution**: Confirm the M365 forwarding profile hardening setting is set to bypass (default). If customer requires full blocking, they must wait for tunnel hardening support in GA. Note GSA resource tokens have approximately 3-hour lifetime; admin may need to wait for token expiry or manually clear the token cache (e.g., switch user) to observe policy taking effect.

---

### Admin cannot configure a Conditional Access policy with Global Secure Access as target resource and Compliant Network location condition simultaneo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: a user cannot come from a compliant network before connecting to one. The Compliant Network location condition in CA can only be used for destination resources after the user and traffic is already flowing through the NaaS service.

**Solution**: Inform customer this is by design. Use the Compliant Network location condition only for destination resource CA policies (after user is connected to NaaS), not for the Global Secure Access target resource itself.

---

## Phase 9: Seamless Sso
> 1 related entries

### AVD sign-in repeatedly asks for credentials despite Seamless SSO enabled. Error 70044 then Seamless SSO fallback fails with connectivity error to a...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Sign-in frequency CA policy rejects PRT (70044 expected). Seamless SSO fallback fails because autologon.microsoftazuread-sso.com blocked by firewall.

**Solution**: Unblock autologon.microsoftazuread-sso.com. Test by visiting URL directly. If still failing, capture Fiddler + Network Monitor.

---

## Phase 10: Windows 365
> 1 related entries

### RDP sign-in to Windows 365 Cloud PC fails for user with Per-User MFA enabled
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Per-User MFA is not supported for Windows 365 Cloud PC RDP sign-in

**Solution**: Switch from Per-User MFA to Conditional Access based MFA. Disable Per-User MFA for the affected user and configure CA policy with MFA requirement instead.

---

## Phase 11: Breaking Change
> 1 related entries

### Application breaks after July 2024 parsing ipaddr claim from tokens. IPv6+IPv4 format changed from mixed notation (YYY.YYY.YYY.YYY) to pure hex (xx...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Breaking change MC798672: IPv6 addresses with embedded IPv4 now serialized in pure hexadecimal format. Apps comparing ipaddr as string fail.

**Solution**: Parse ipaddr using IPAddress.Parse() instead of string comparison. Do not depend on string format. Change does not impact Conditional Access.

---

## Phase 12: Workload Identity
> 1 related entries

### Unable to edit or create new Conditional Access policies for workload identities; existing policies cannot be modified
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Workload Identities Premium license (or 90-day trial) has expired. After expiration, existing CA policies continue to function but cannot be edited, and new ones cannot be created.

**Solution**: Purchase Workload Identities Premium licenses ($3/workload identity/month) or activate a new trial from the Microsoft 365 admin center. Check license status via Graph API: List subscribedSkus.

---

## Phase 13: Entra Portal
> 1 related entries

### After toggling Restrict access to Microsoft Entra admin center, non-admins can still access some blades like Groupslist.ReactView, Devices, Enterpr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Feature gap - Devices, Enterprise Apps and Groups blades do not honor the client-side setting. Enforcement is limited to AAD_IAM and UsersAndTenants extension blades only. Multiple partner teams needed. Related CRI: 649723689.

**Solution**: This switch is NOT a security measure. Create Conditional Access policy targeting Windows Azure Service Management API to block non-admin access. Even if the switch worked, users could still access data via Graph API/PowerShell. Work item: 3047372.

---

## Phase 14: Aadsts50158
> 1 related entries

### AADSTS50158: "External security challenge not satisfied" during non-interactive sign-in to application with Terms of Use or third-party MFA conditi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Terms of Use (and similar CA extensibility features) require interactive sign-in. Non-interactive sign-in (token endpoint) cannot verify ToU agreement. The client app receives interaction_required but does not handle it correctly.

**Solution**: Client application must handle interaction_required error by prompting user for interactive sign-in. Refer to MSAL.js error handling docs. For CRI/ICM: confirm error relates to interactive sign-in requirement, then transfer to partner team.

---

## Phase 15: Aadsts50178
> 1 related entries

### AADSTS50178 for passthrough user (B2B/CSP) accessing resource tenant. True error: SessionControlNotSupportedForPassthroughUsers.
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Resource tenant has conditional access policy with session controls that are not supported for CSP/B2B passthrough users.

**Solution**: Customer must exclude CSP service provider from CA policies enforcing session controls. Use Auth Troubleshooter with correlation ID to identify blocking policy. See GDAP FAQ.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSTS50177 for passthrough user (B2B/CSP) accessing resource tenant. True er... | Resource tenant has conditional access policy with extern... | Customer must exclude CSP service provider from CA polici... | 🟢 9.5 | ADO Wiki |
| 2 | AADSTS50178 for passthrough user (B2B/CSP) accessing resource tenant. True er... | Resource tenant has conditional access policy with sessio... | Customer must exclude CSP service provider from CA polici... | 🟢 9.5 | ADO Wiki |
| 3 | AVD sign-in repeatedly asks for credentials despite Seamless SSO enabled. Err... | Sign-in frequency CA policy rejects PRT (70044 expected).... | Unblock autologon.microsoftazuread-sso.com. Test by visit... | 🟢 9.0 | OneNote |
| 4 | Conditional Access geo-based block policy does not block sign-in from blackli... | Legacy/basic auth apps (e.g., iOS default Mail, AppId bfc... | Mitigations: (1) app-based CA, (2) disable basic auth via... | 🟢 9.0 | OneNote |
| 5 | Az CLI login fails with AADSTS53003 blocked by CA even though browser auth su... | Browser uses PAC-file proxy (corporate IP in CA trusted l... | Configure proxy env vars before az login: HTTP_PROXY and ... | 🟢 9.0 | OneNote |
| 6 | Clients with IPv6 addresses incorrectly have Conditional Access location-base... | Named Locations does not support IPv6 addresses for geolo... | Customer should uncheck the 'Include unknown areas' optio... | 🟢 8.5 | ADO Wiki |
| 7 | Error 1150: Cannot create or update policies with workload identity premium f... | Post-GA, Microsoft Entra Workload Identities premium lice... | Customer must acquire Microsoft Entra Workload Identities... | 🟢 8.5 | ADO Wiki |
| 8 | GDAP users from governing tenant cannot sign in to governed tenant; Condition... | GDAP users do not have a user presence in the governed te... | Review and adjust Conditional Access policies in the gove... | 🟢 8.5 | ADO Wiki |
| 9 | GDAP users from governing tenant cannot sign in to the governed tenant; Condi... | Conditional Access policies in the governed tenant requir... | Adjust Conditional Access policies in the governed tenant... | 🟢 8.5 | ADO Wiki |
| 10 | Application breaks after July 2024 parsing ipaddr claim from tokens. IPv6+IPv... | Breaking change MC798672: IPv6 addresses with embedded IP... | Parse ipaddr using IPAddress.Parse() instead of string co... | 🟢 8.5 | ADO Wiki |
| 11 | AADSTS50177/50178: CSP admin blocked by Terms of Use or Session Control CA po... | Passthrough User authentication (CSP/GDAP) does not suppo... | Customer must exclude the application or External User Ty... | 🟢 8.5 | ADO Wiki |
| 12 | Unable to edit or create new Conditional Access policies for workload identit... | Workload Identities Premium license (or 90-day trial) has... | Purchase Workload Identities Premium licenses ($3/workloa... | 🟢 8.5 | ADO Wiki |
| 13 | After toggling Restrict access to Microsoft Entra admin center, non-admins ca... | Feature gap - Devices, Enterprise Apps and Groups blades ... | This switch is NOT a security measure. Create Conditional... | 🟢 8.5 | ADO Wiki |
| 14 | AADSTS50158: "External security challenge not satisfied" during non-interacti... | Terms of Use (and similar CA extensibility features) requ... | Client application must handle interaction_required error... | 🟢 8.5 | ADO Wiki |
| 15 | Outlook Mobile sign-in using QR code fails; error indicates Intune and Condit... | Intune App Protection and Conditional Access policies blo... | Have the user sign in manually instead of using QR code s... | 🟢 8.5 | ADO Wiki |
| 16 | Outlook mobile sign-in using QR code fails. Users scan the QR code but are pr... | Intune device compliance or Conditional Access policies b... | Review Intune and Conditional Access policies that may bl... | 🟢 8.5 | ADO Wiki |
| 17 | CA policies targeting individual Office 365 apps (e.g. Exchange Online, Teams... | Office 365 apps have inter-service dependencies (e.g. Tea... | Use the combined Office 365 application group in CA polic... | 🟢 8.5 | ADO Wiki |
| 18 | 'Require approved client app' Conditional Access grant control scheduled for ... | Microsoft retiring the 'Require approved client app' cont... | Transition to 'Require app protection policy' before June... | 🟢 8.5 | ADO Wiki |
| 19 | Error 'Policy configuration is not supported' when enabling an EAS Conditiona... | MAM EAS policy does not support having other Conditions e... | Set all other Conditions to 'Not configured' before enabl... | 🟢 8.5 | ADO Wiki |
| 20 | Devices already enrolled continue to prompt for device enrollment when access... | Native built-in Mail clients on iOS and Android are not M... | Users must use MAM-compatible apps like Microsoft Outlook... | 🟢 8.5 | ADO Wiki |
| 21 | WhatIf tool in Conditional Access does not show policies targeting User actio... | WhatIf defaults to Cloud apps tab, not User actions tab. ... | In WhatIf, explicitly select the User action tab and chec... | 🟢 8.5 | ADO Wiki |
| 22 | Users get Oops something went wrong or unexpected error when accessing My App... | My Apps depends on legacy IAMUX application launcher serv... | Enable new MyApps launcher (launcher.myapps.microsoft.com... | 🟢 8.5 | ADO Wiki |
| 23 | VPN connection fails when combining Conditional Access for VPN with NPS Exten... | Certificate-based authentication is officially unsupporte... | Use PPTP connection type. Configure EAP XML with AAD Cond... | 🟢 8.5 | ADO Wiki |
| 24 | Creating or updating TokenLifetimePolicy with MaxInactiveTime, MaxAgeSingleFa... | As of June 19, 2020, CTL only supports Access Token lifet... | Use Sign-in Frequency Session Control in CA Policy instea... | 🟢 8.5 | ADO Wiki |
| 25 | After Azure AD IPv6 rollout, users get unexpected CA blocks or extra MFA prom... | Client devices connect via IPv6 not in tenant Named Locat... | Audit Named Locations, identify IPv6 via sign-in logs (ht... | 🟢 8.5 | ADO Wiki |
| 26 | CA DevicePlatforms exclusion for iOS not working with legacy auth block for E... | EAS legacy auth reports DevicePlatform as Unknown (type 1... | Workaround: Two separate CA policies - one for iOS only, ... | 🟢 8.5 | ADO Wiki |
| 27 | Teams blocked when CA requires both Require approved client app AND Require a... | AND operand requires Teams to satisfy both controls. Team... | Use Require one of the selected controls (OR). Azure AD p... | 🟢 8.5 | ADO Wiki |
| 28 | Require approved client app retiring June 30, 2026. Must migrate to avoid dis... | Microsoft deprecating in favor of Require app protection ... | Migrate to Require app protection policy by June 30, 2026... | 🟢 8.5 | ADO Wiki |
| 29 | Disabling Resilience Defaults on CA policy targeting group/role blocks ALL us... | During outage, Backup Auth Service cannot evaluate group/... | Apply policy to individual users instead of groups/roles.... | 🟢 8.5 | ADO Wiki |
| 30 | Conditional Access policies targeting Windows Azure Service Management API (A... | Azure DevOps no longer relies on Azure Resource Manager (... | Update CA policies to explicitly include Azure DevOps (Ap... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +1 entries from contentidea-kb

### When Conditional Access Policy is created to force MFA on Exchange Online (EXO) and/or SharePoint Online (SPO) cloud application, and the users open t...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3645

**Root Cause**: When user tries to create Word/Excel/PowerPoint document from https://portal.office.com portal, the selected application tries to access Exchange Online (EXO) and/or SharePoint Online (SPO) using non-interactive login. And since MFA does not complete with non-interactive login, the authentication wi...

**Solution**: Since this is non-interactive login, MFA will not trigger, and the MFA popup will not show to the end user. Hence, creating Word/Excel/PowerPoint documents from office portal will fail.  Therefore, we need to modify the configured Conditional Access Policy to target �All Cloud Applications� instead ...

