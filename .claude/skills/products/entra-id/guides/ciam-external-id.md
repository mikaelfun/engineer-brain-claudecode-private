# ENTRA-ID CIAM/External ID — Quick Reference

**Entries**: 25 | **21V**: Partial (11/25)
**Last updated**: 2026-04-07
**Keywords**: ciam, external-id, sign-in, device-code-flow, app-registration, username

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/ciam-external-id.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | User has username identity on their Entra External ID user object but cannot sign in using userna... | Username sign-in method is not enabled in tenant Sign-in Identifiers policy. ... | Enable Username in Sign-in Identifiers under Entra ID > External Identities. ... | 🟢 8.5 | ADO Wiki |
| 2 📋 | Custom regex validation configured for username in Entra External ID but users can still sign in ... | Both Username and Custom Username are selected in Sign-in Identifiers. Userna... | Configure Sign-in identifiers to only include Custom Username, remove the Use... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Email OTP verification code stated to work for 30 minutes expires before 30 minutes during MFA in... | OTP expiration depends on scenario: 30 minutes for first-factor auth, but onl... | By design. First-factor OTP valid 30 min. MFA second-factor or SSPR must comp... | 🟢 8.5 | ADO Wiki |
| 4 📋 | Customer wants to unlink Entra External ID tenant from one Azure subscription and relink to anoth... | Unlike Azure AD B2C, Entra External ID does not support unlinking and re-link... | Unlinking/re-linking is NOT supported. WARNING: Deleting the Azure resource w... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Invited guest users cannot sign in through External ID Tenant User Flows in Entra External ID (CIAM) | Invited guest users are only supported in External ID Tenants for managing th... | Instruct users to create new consumer accounts. Guest users in CIAM tenants a... | 🟢 8.5 | ADO Wiki |
| 6 📋 | AADSTS500207: The account type cannot be used for the resource you are trying to access. Occurs w... | CIAM apps only support applications configured for single-tenant (Accounts in... | Configure the application registration as single-tenant (Accounts in this dir... | 🟢 8.5 | ADO Wiki |
| 7 📋 | AADSTS500208: The domain is not a valid login domain for the account type. Consumer user from Azu... | Consumer user from B2C or CIAM tenant is directed to login.microsoftonline.co... | For B2C users: redirect to b2clogin.com. For CIAM users: redirect to ciamlogi... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Custom regex for username validation in Entra External ID does not enforce validation - authentic... | The regex expression itself is invalid. No built-in validation exists for cus... | Verify the regex is actually valid. Test regex patterns independently before ... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Workforce login page displayed instead of CIAM/External ID sign-up page (shows 'Can't access your... | Replication delay for the user flow configuration. User flow data not yet rep... | Refresh browser after 1-2 minutes. Verify user flow is linked to the applicat... | 🔵 6.5 | ADO Wiki |
| 10 📋 | AADSTS50011: Redirect URI mismatch when running CIAM sample app - 'The redirect URI specified in ... | Replication delay updating the redirect URI in app registration, or multiple ... | 1) Wait a few minutes and retry. 2) Verify redirect URI in app registration m... | 🔵 6.5 | ADO Wiki |
| 11 📋 | AADSTS7000215: Invalid client secret provided when running ASP.NET Core CIAM sample | Replication delay updating the client secret in app registration, or multiple... | Wait a few minutes and retry (may need up to next day in some cases). Verify ... | 🔵 6.5 | ADO Wiki |
| 12 📋 | Unable to delete CIAM/External ID tenant - deletion fails even after removing all resources | The b2c-extensions-app was not deleted. This app is hidden under 'All applica... | Delete the b2c-extensions-app found under 'All applications' in the Entra por... | 🔵 6.5 | ADO Wiki |
| 13 📋 | CIAM tenant deleted but Azure resource stuck - cannot remove resource from subscription, redeploy... | Product defect: when following official deletion docs, tenant is erased befor... | 1) Confirm tenant is deleted in backend (use DSXplorer, not CMAT). 2) Request... | 🔵 6.5 | ADO Wiki |
| 14 📋 | JWT decode error after July 2025: 'Signed JWT rejected: Another algorithm expected, or no matchin... | Application is using login.microsoftonline.com openid-configuration endpoint ... | Configure the application to use https://{tenant}.ciamlogin.com/{TENANT-ID}/.... | 🔵 6.5 | ADO Wiki |
| 15 📋 | Disable sign-up feature not working correctly when home tenant has Alt Login ID enabled - local a... | Bug 3043172: When signup is disabled in user flow AND home tenant has Alterna... | Known PG bug (Epic 2678087 / Bug 3043172). Escalate via ICM to CPIM/CIAM-CRI-... | 🔵 6.5 | ADO Wiki |
| 16 📋 | Email OTP users cannot sign in and see blank screen when Identity Protection MFA registration pol... | Identity Protection should NOT be enabled for EEID tenants. When MFA authenti... | Disable Identity Protection MFA registration policy on the EEID tenant. Ident... | 🔵 6.5 | ADO Wiki |
| 17 📋 | OAuth 2.0 Device Code Flow in Entra External ID (CIAM): verification_uri points to microsoft.com/... | Preview limitation: Device Code Flow response returns verification_uri pointi... | Manually change verification_uri from login.microsoftonline.com/common/oauth2... | 🔵 6.5 | ADO Wiki |
| 18 📋 | OAuth 2.0 Device Code Flow in Entra External ID (CIAM) tenant fails - verification_uri points to ... | Preview limitation: initial verification_uri returned by /devicecode endpoint... | Manually change verification_uri from https://login.microsoftonline.com/commo... | 🔵 6.5 | ADO Wiki |
| 19 📋 | ADSTS50132 error (session not valid due to password expiration/recent change/SSO artifact invalid... | Known preview limitation of Device Code Flow in Entra External ID tenants - e... | No current workaround for external IDP + Device Code Flow in CIAM. Use local ... | 🔵 6.5 | ADO Wiki |
| 20 📋 | User cannot access allowed partner tenant SPO/resources with Universal TR (NaaS) even though the ... | Confusion between outbound access policy and TRv2: if user uses home tenant i... | 1) Clarify identity type: home identity = outbound access policy, external id... | 🔵 6.5 | ADO Wiki |
| 21 📋 | OAuth 2.0 Device Code Flow in CIAM: signing in with external IDP fails with ADSTS50132 'The sessi... | Preview limitation: External IDP federation + Device Code Flow in Entra Exter... | Known preview limitation (Oct 2025). No workaround. Use local account auth (e... | 🔵 5.5 | ADO Wiki |
| 22 📋 | SMS cannot be used as first factor or for self-service password reset in Entra External ID tenant... | SMS is only supported as a second-factor MFA method in External ID. SSPR and ... | Use Email OTP for SSPR. SMS is only for MFA second factor. Cannot disable EOT... | 🔵 5.5 | ADO Wiki |
| 23 📋 | In Entra External ID (CIAM), using login_hint parameter with email addresses from providers like ... | When login_hint contains an email from a well-known provider domain, the auth... | Add the domain_hint parameter alongside login_hint in the authorization reque... | 🔵 5.5 | ADO Wiki |
| 24 📋 | After Fluent migration UX rollout in Entra External ID, internal navigation links ("No account? C... | As part of modern accessibility enhancements (Fluent migration), internal nav... | Update the custom CSS file to include the new ".ext-link" selector. Copy the ... | 🔵 5.5 | ADO Wiki |
| 25 📋 | Local account guest users in Entra External ID are redirected to federated login page when signup... | Bug in ESTS (Bug 3043172): When signup is disabled in user flow and the home ... | Workaround: Enable signup in user flow, then configure an OnAttributeCollecti... | 🔵 5.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Check **ciam** related issues (19 entries) `[ado-wiki]`
2. Check **external-id** related issues (11 entries) `[ado-wiki]`
3. Check **username** related issues (3 entries) `[ado-wiki]`
4. Check **device-code-flow** related issues (3 entries) `[ado-wiki]`
5. Check **user-flow** related issues (2 entries) `[ado-wiki]`
6. Check **aadsts** related issues (2 entries) `[ado-wiki]`
7. Check **tenant-deletion** related issues (2 entries) `[ado-wiki]`
