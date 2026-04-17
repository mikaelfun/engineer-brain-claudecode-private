# AVD AVD 条件访问与 MFA - conditional-access - Quick Reference

**Entries**: 7 | **21V**: partial
**Keywords**: aadj, application-group, authentication, autologon, block, browser, conditional-access, credentials
**Last updated**: 2026-04-07

> Note: avd-ado-wiki-0857 and avd-mslearn-002 have context-dependent differences (21v_conflict)
> Note: avd-mslearn-002 and avd-onenote-026 have context-dependent differences (21v_conflict)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Legacy per-user MFA enabled on Azure AD cloud user causes login failure on AADJ ... | Legacy per-user MFA is not supported for AADJ session host desktop logon. Both R... | Replace legacy per-user MFA with Conditional Access policy-based MFA. CA MFA onl... | 🟢 8.0 | OneNote |
| 2 | Unable to sign in to Azure AD-joined VMs from non-Windows clients when multifact... | MFA not configured correctly for AADJ VM connections from non-Windows clients; M... | Disable MFA for AADJ VM access or configure MFA properly per: https://docs.micro... | 🔵 7.5 | ADO Wiki |
| 3 | Admin needs to block users from connecting to Cloud PCs via browser while still ... | - | Create Conditional Access policy: (1) Target needed users (2) Select AVD app (3)... | 🔵 6.0 | ADO Wiki |
| 4 | CloudPC sign-in blocked by Conditional Access policy due to unexpected private I... | VNet with Microsoft.AzureActiveDirectory service endpoint enabled converts VM so... | Disable Microsoft.AzureActiveDirectory service endpoint on the VNET/Subnet where... | 🔵 6.0 | ADO Wiki |
| 5 | AVD sign-in fails when Conditional Access sign-in frequency policy is configured... | With sign-in frequency CA policy active, the Primary Refresh Token (PRT) is reje... | 1) Ensure autologon.microsoftazuread-sso.com is accessible from client devices. ... | 🔵 6.0 | OneNote |
| 6 | Entra joined VM: 'The user name or password is incorrect' despite correct creden... | Per-user MFA enabled/enforced (not supported for Entra joined VMs), or VM User L... | Disable per-user MFA; use Conditional Access instead with exclusion for Azure Wi... | 🔵 5.0 | MS Learn |
| 7 | Cannot add user assignments to application group - Azure portal shows 'Session E... | Conditional Access policy 'Microsoft Office 365 Data Storage Terms of Use' block... | Admin must first sign in to SharePoint and accept Terms of Use before accessing ... | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: Legacy per-user MFA is not supported for AADJ sess `[Source: OneNote]`
2. Check: MFA not configured correctly for AADJ VM connectio `[Source: ADO Wiki]`
3. Check: Unknown `[Source: ADO Wiki]`
4. Check: VNet with Microsoft.AzureActiveDirectory service e `[Source: ADO Wiki]`
5. Check: With sign-in frequency CA policy active, the Prima `[Source: OneNote]`
