---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure Portal MFA Enforcement"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20Portal%20MFA%20Enforcement"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure Portal MFA Enforcement

## Feature Overview

As part of the Secure Future Initiative (SFI), Microsoft requires all customers to sign in to Azure Core Services using MFA.

**Update 5/14/25:** New Portal MFA Enforcement prompts for users and Global Admins who have never used MFA on the portal.

**Update 4/21/25:** PowerShell script released for customers locked out of portal but have Global Admin access: [How to postpone enforcement](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-unlock-users-for-mandatory-multifactor-authentication)

**Update 2/18/25:** Enforcement date picker at https://aka.ms/managemfaforazure allows admins to choose enforcement date up to September 30, 2025.

## Timeline

- **Phase 0 (Aug 15, 2024):** Email notifications to tenant admins
- **Phase 1 (Oct 15, 2024):** Azure Portal, Entra Portal, Intune Portal enforcement rollout
- **Phase 2 (2025):** Azure CLI, Azure PowerShell, IaC tools enforcement
- **Grace period deadline:** September 30, 2025 (no extensions beyond this)

## Scope

### User Accounts
All users performing CRUD operations via Azure Portal, CLI, PowerShell, IaC tools require MFA. End users accessing apps/websites hosted on Azure (not signing into portal/CLI/PS) are NOT subject to this requirement.

### Automation Accounts
Workload Identities (managed identities, service principals) are NOT impacted. User identities used for automation WILL require MFA - migrate to Workload Identities.

## Implementation and Logging

- Sign-in logs show: **App requires multifactor authentication** under Authentication Details
- ASC shows: **MFA is explicitly enforced by the client application 'Azure Portal' via request parameters**
- SourcesOfMfaRequirement: **Request**
- MFA status icon appears on user image when authenticated with MFA

## Grace Period Process

1. Log in as Global Administrator
2. [Elevate access](https://aka.ms/enableelevatedaccess)
3. Go to https://aka.ms/managemfaforazure and click **Postpone enforcement**
4. Confirm postponement
5. Remove elevated access

### Common Grace Period Issues

**"You do not have access" error:**
- Cause: Non-GA account or GA without elevated access
- Fix: Use Global Administrator + complete Elevated Access process

**"Unable to fetch MFA enforcement status" error:**
- Cause: GA has not completed Elevated Access
- Fix: Complete Elevated Access at aka.ms/enableelevatedaccess

**Retroactive grace period (after Oct 15, 2024):**
- Customer can still use grace period page up to Sep 30, 2025
- If tenant already enforced, grace period temporarily defers enforcement

## Enable Enforcement (Opt-in)

1. Log in as GA using MFA (required to confirm MFA works)
2. Elevate access
3. Go to https://aka.ms/managemfaforazure, click **Enable enforcement**
4. Can click **Postpone enforcement** to remove opt-in

## Break Glass Accounts

Recommended: Update break glass accounts to use FIDO2 or certificate-based authentication (configured as MFA). Use multiple FIDO2 keys stored in separate secure locations with regular testing.

## Available MFA Methods

All [supported MFA methods](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks#available-verification-methods) are available. External authentication methods (preview) supported. Deprecated Conditional Access Custom Controls will NOT satisfy MFA requirement.

## Identifying Impacted Users

1. PowerShell export: https://aka.ms/AzMFA
2. MFA Gaps workbook: [Link](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/workbook-mfa-gaps)
3. App IDs for queries:
   - Azure Portal: c44b4083-3bb0-49c1-b47d-974e53cbdf3c
   - Azure CLI: 04b07795-8ddb-461a-bbee-02f9e1bf7b46
   - Azure PowerShell: 1950a258-227b-4e31-a9cf-717495945fc2
   - Azure Mobile: 0c1307d4-29d6-4389-a11c-5cbe7f65d7fa

## Case Handling

- **SAP:** Azure/Microsoft Entra Sign-in and Multifactor Authentication/Multi-Factor Authentication (MFA)/Plan and manage your MFA deployment
- **Internal Title:** [Portal Enforcement]
- **Root Cause:** Root Cause - CID Sign In and MFA/MFA/Unexpected MFA prompt/Azure Portal MFA Requirement
- **Community:** Identity Security and Protection (or M365 Cloud Identity)

## KMSI and MFA Challenge Ordering

MFA challenge prompt may appear after KMSI prompt - this is normal depending on tenant CA policies, KMSI policies, etc.
