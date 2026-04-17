# ENTRA-ID Conditional Access — Quick Reference

**Entries**: 73 | **21V**: Partial (63/73)
**Last updated**: 2026-04-07
**Keywords**: conditional-access, cae, terms-of-use, identity-protection, ipv6, named-locations

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/conditional-access.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | AADSTS50177 for passthrough user (B2B/CSP) accessing resource tenant. True error: ExternalChallen... | Resource tenant has conditional access policy with external challenge control... | Customer must exclude CSP service provider from CA policies enforcing externa... | 🟢 9.5 | ADO Wiki |
| 2 📋 | AADSTS50178 for passthrough user (B2B/CSP) accessing resource tenant. True error: SessionControlN... | Resource tenant has conditional access policy with session controls that are ... | Customer must exclude CSP service provider from CA policies enforcing session... | 🟢 9.5 | ADO Wiki |
| 3 📋 | AVD sign-in repeatedly asks for credentials despite Seamless SSO enabled. Error 70044 then Seamle... | Sign-in frequency CA policy rejects PRT (70044 expected). Seamless SSO fallba... | Unblock autologon.microsoftazuread-sso.com. Test by visiting URL directly. If... | 🟢 9.0 | OneNote |
| 4 📋 | Conditional Access geo-based block policy does not block sign-in from blacklisted country/IP. Att... | Legacy/basic auth apps (e.g., iOS default Mail, AppId bfc44fc5-...) use OrgID... | Mitigations: (1) app-based CA, (2) disable basic auth via Set-AuthenticationP... | 🟢 9.0 | OneNote |
| 5 📋 | Az CLI login fails with AADSTS53003 blocked by CA even though browser auth succeeds from same mac... | Browser uses PAC-file proxy (corporate IP in CA trusted locations), but Az CL... | Configure proxy env vars before az login: HTTP_PROXY and HTTPS_PROXY. Also ch... | 🟢 9.0 | OneNote |
| 6 📋 | Clients with IPv6 addresses incorrectly have Conditional Access location-based policy applied; bl... | Named Locations does not support IPv6 addresses for geolocation mapping. IPv6... | Customer should uncheck the 'Include unknown areas' option in the Conditional... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Error 1150: Cannot create or update policies with workload identity premium features when creatin... | Post-GA, Microsoft Entra Workload Identities premium licenses are required to... | Customer must acquire Microsoft Entra Workload Identities premium licenses by... | 🟢 8.5 | ADO Wiki |
| 8 📋 | GDAP users from governing tenant cannot sign in to governed tenant; Conditional Access policies b... | GDAP users do not have a user presence in the governed tenant. Conditional Ac... | Review and adjust Conditional Access policies in the governed tenant to accom... | 🟢 8.5 | ADO Wiki |
| 9 📋 | GDAP users from governing tenant cannot sign in to the governed tenant; Conditional Access policy... | Conditional Access policies in the governed tenant require user resolution (e... | Adjust Conditional Access policies in the governed tenant to accommodate GDAP... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Application breaks after July 2024 parsing ipaddr claim from tokens. IPv6+IPv4 format changed fro... | Breaking change MC798672: IPv6 addresses with embedded IPv4 now serialized in... | Parse ipaddr using IPAddress.Parse() instead of string comparison. Do not dep... | 🟢 8.5 | ADO Wiki |
| 11 📋 | AADSTS50177/50178: CSP admin blocked by Terms of Use or Session Control CA policy - actual error ... | Passthrough User authentication (CSP/GDAP) does not support certain CA polici... | Customer must exclude the application or External User Type = Service Provide... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Unable to edit or create new Conditional Access policies for workload identities; existing polici... | Workload Identities Premium license (or 90-day trial) has expired. After expi... | Purchase Workload Identities Premium licenses ($3/workload identity/month) or... | 🟢 8.5 | ADO Wiki |
| 13 📋 | After toggling Restrict access to Microsoft Entra admin center, non-admins can still access some ... | Feature gap - Devices, Enterprise Apps and Groups blades do not honor the cli... | This switch is NOT a security measure. Create Conditional Access policy targe... | 🟢 8.5 | ADO Wiki |
| 14 📋 | AADSTS50158: "External security challenge not satisfied" during non-interactive sign-in to applic... | Terms of Use (and similar CA extensibility features) require interactive sign... | Client application must handle interaction_required error by prompting user f... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Outlook Mobile sign-in using QR code fails; error indicates Intune and Conditional Access policie... | Intune App Protection and Conditional Access policies block the token transfe... | Have the user sign in manually instead of using QR code scan. Review and adju... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Outlook mobile sign-in using QR code fails. Users scan the QR code but are prevented from signing... | Intune device compliance or Conditional Access policies block token transfer ... | Review Intune and Conditional Access policies that may block Outlook mobile. ... | 🟢 8.5 | ADO Wiki |
| 17 📋 | CA policies targeting individual Office 365 apps (e.g. Exchange Online, Teams, SharePoint separat... | Office 365 apps have inter-service dependencies (e.g. Teams depends on ShareP... | Use the combined Office 365 application group in CA policies for consistent e... | 🟢 8.5 | ADO Wiki |
| 18 📋 | 'Require approved client app' Conditional Access grant control scheduled for retirement on June 3... | Microsoft retiring the 'Require approved client app' control (originally anno... | Transition to 'Require app protection policy' before June 30, 2026. Recommend... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Error 'Policy configuration is not supported' when enabling an EAS Conditional Access policy for ... | MAM EAS policy does not support having other Conditions enabled simultaneousl... | Set all other Conditions to 'Not configured' before enabling the EAS policy w... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Devices already enrolled continue to prompt for device enrollment when accessing O365 Exchange On... | Native built-in Mail clients on iOS and Android are not MAM compatible. The d... | Users must use MAM-compatible apps like Microsoft Outlook. Native mail client... | 🟢 8.5 | ADO Wiki |
| 21 📋 | WhatIf tool in Conditional Access does not show policies targeting User actions (Register securit... | WhatIf defaults to Cloud apps tab, not User actions tab. The condition label ... | In WhatIf, explicitly select the User action tab and check Register security ... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Users get Oops something went wrong or unexpected error when accessing My Apps portal while CA po... | My Apps depends on legacy IAMUX application launcher service which is not tar... | Enable new MyApps launcher (launcher.myapps.microsoft.com/api/signin) which b... | 🟢 8.5 | ADO Wiki |
| 23 📋 | VPN connection fails when combining Conditional Access for VPN with NPS Extension for Azure MFA u... | Certificate-based authentication is officially unsupported with NPS Extension... | Use PPTP connection type. Configure EAP XML with AAD Conditional Access EKU (... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Creating or updating TokenLifetimePolicy with MaxInactiveTime, MaxAgeSingleFactor, MaxAgeMultiFac... | As of June 19, 2020, CTL only supports Access Token lifetime. Refresh/Session... | Use Sign-in Frequency Session Control in CA Policy instead. Existing tenants ... | 🟢 8.5 | ADO Wiki |
| 25 📋 | After Azure AD IPv6 rollout, users get unexpected CA blocks or extra MFA prompts. Sign-in logs sh... | Client devices connect via IPv6 not in tenant Named Locations. CA location co... | Audit Named Locations, identify IPv6 via sign-in logs (https://aka.ms/azuread... | 🟢 8.5 | ADO Wiki |
| 26 📋 | CA DevicePlatforms exclusion for iOS not working with legacy auth block for EXO. What If says pol... | EAS legacy auth reports DevicePlatform as Unknown (type 14), causing exclusio... | Workaround: Two separate CA policies - one for iOS only, another for all plat... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Teams blocked when CA requires both Require approved client app AND Require app protection policy... | AND operand requires Teams to satisfy both controls. Teams cannot satisfy app... | Use Require one of the selected controls (OR). Azure AD prefers app protectio... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Require approved client app retiring June 30, 2026. Must migrate to avoid disruption. | Microsoft deprecating in favor of Require app protection policy with Intune p... | Migrate to Require app protection policy by June 30, 2026. Select both with O... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Disabling Resilience Defaults on CA policy targeting group/role blocks ALL users during Azure AD ... | During outage, Backup Auth Service cannot evaluate group/role membership in r... | Apply policy to individual users instead of groups/roles. Or leave Resilience... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Conditional Access policies targeting Windows Azure Service Management API (App ID: 797f4846) no ... | Azure DevOps no longer relies on Azure Resource Manager (ARM) resource during... | Update CA policies to explicitly include Azure DevOps (App ID: 499b84ac-1321-... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Service principal risk condition shows 'Not available' when creating Conditional Access Policy wi... | Requires 'All cloud apps' under Cloud apps or actions. Selecting specific app... | Select Cloud apps or actions > All cloud apps when creating CA policy targeti... | 🟢 8.5 | ADO Wiki |
| 32 📋 | When creating a Conditional Access Policy with Workload identities selected, the Service principa... | All cloud apps is not selected under Cloud apps or actions when Workload iden... | Select Cloud apps or actions and choose All cloud apps to make the Service pr... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Conditional Access policy shows Result as Failure in interactive sign-in log, but the user sign-i... | By design: compliant application requirement can only be evaluated at the Tok... | Check the non-interactive sign-in log with the same Correlation ID - the CA p... | 🟢 8.5 | ADO Wiki |
| 34 📋 | CSP/partner technician with GDAP relationship cannot sign in to customer tenant - blocked by Cond... | Conditional Access policies that target external users may interfere with ser... | Use the updated fine-grained CA policies for guests and external users (relea... | 🟢 8.5 | ADO Wiki |
| 35 📋 | AADSTS53003: Access has been blocked by Conditional Access policies. The access policy does not a... | A Conditional Access policy blocked authentication. Common in non-interactive... | For non-interactive flows: (1) Add service account as exception to the CA pol... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Creating Terms of Use fails with error 'There was a problem creating terms of use <DisplayName>' ... | The initial Create of a TOU term is written as a single blob. There is a 2MB ... | If only one language file exceeds 2MB, use a smaller file. If creating a TOU ... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Users are blocked from enrolling their devices when 'Consent per device' setting is enabled on Te... | The 'Consent per device' TOU setting is incompatible with Intune enrollment a... | Option 1: Turn the 'Consent per device' setting off on the TOU. Option 2: Upd... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Admin configures a Conditional Access policy to block Global Secure Access M365 traffic profile, ... | M365 forwarding traffic policies have hardening set to bypass by default. Whe... | Confirm the M365 forwarding profile hardening setting is set to bypass (defau... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Admin cannot configure a Conditional Access policy with Global Secure Access as target resource a... | By design: a user cannot come from a compliant network before connecting to o... | Inform customer this is by design. Use the Compliant Network location conditi... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Conditional Access location-based policy does not effectively restrict IP-based access to Applica... | Conditional Access Policy only blocks authentication, not application access.... | Do not rely solely on CA location-based policy for IP restriction with App Pr... | 🟢 8.5 | ADO Wiki |
| ... | *33 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **conditional-access** related issues (16 entries) `[onenote]`
2. Check **passthrough-user** related issues (3 entries) `[ado-wiki]`
3. Check **approved-client-app** related issues (3 entries) `[ado-wiki]`
4. Check **aadsts50177** related issues (2 entries) `[ado-wiki]`
5. Check **csp** related issues (2 entries) `[ado-wiki]`
6. Check **aadsts50178** related issues (2 entries) `[ado-wiki]`
7. Check **ipv6** related issues (2 entries) `[ado-wiki]`
8. Check **workload-identity** related issues (2 entries) `[ado-wiki]`
