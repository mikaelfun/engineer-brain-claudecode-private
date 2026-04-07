# ENTRA-ID Licensing — Quick Reference

**Entries**: 35 | **21V**: Partial (28/35)
**Last updated**: 2026-04-07
**Keywords**: licensing, m365-admin-center, tenant-deletion, license, subscription, copilot

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/licensing.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | AADSTS500014: Service principal for resource is disabled. Affects multiple services: Power BI Des... | First-party apps with ServicePrincipalLifecyclePolicy=SubscriptionManaged(1) ... | 1. Verify customer has valid paid subscription at portal.partner.microsoftonl... | 🟢 9.0 | OneNote |
| 2 📋 | az ssh vm --ip command fails silently with no error and no connection when connecting from Window... | Just-In-Time (JIT) access is enabled on the Azure Linux VM (common in AIRS su... | Enable JIT on VM via Azure Portal > Connection blade > Configuration > Enable... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Windows 10 Pro does not auto-upgrade to Enterprise via Subscription Activation on AAD joined / Hy... | User does not have WIN10_PRO_ENT_SUB service plan (ID: 21b439ba-a0ca-424f-a6c... | Verify in ASC > Tenant Explorer > User blade > Licenses > Assigned Plans, fil... | 🟢 8.5 | ADO Wiki |
| 4 📋 | Governance request fails with "License required" error when attempting to establish GDAP relation... | Missing required licensing: Microsoft Entra ID P1 or P2 is required for GDAP ... | Ensure the governing tenant has Microsoft Entra ID P1 or P2 license for GDAP.... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Sending a governance request fails with License required error for GDAP or app injection scenarios | GDAP relationships require Microsoft Entra ID P1 or P2 license; app injection... | Ensure governing tenant has required licenses: Entra ID P1/P2 for GDAP delega... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Error 1150: Workload Identity premium license required for CA policy | Post-GA licensing enforcement. | Purchase Workload Identities premium or activate 90-day trial. | 🟢 8.5 | ADO Wiki |
| 7 📋 | License seats not released after on-prem synced group with GBL removed from sync scope and deleted | Deletion bypasses DeletingLicensedGroupNotAllowed protection. GBL does not re... | Reprocess users via Entra portal or Invoke-MgLicenseUser cmdlet for bulk repr... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Customer reports being billed for Microsoft Entra Domain Services after disabling the service | MEDS may still be active in another tenant linked to the same billing subscri... | 1) Get billing subscription ID. 2) Use ACIS (AD Fabric DCAAS ARM PROD → GetAc... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Applications in a My Apps Collection differ between team members - some users see all apps in the... | Individual users were assigned directly to applications instead of through gr... | Assign users to a group and grant that group direct access to the application... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Applications in a My Apps Collection differ between team members: some users see all apps while o... | Users assigned individually to applications may see different subsets. Nested... | 1) Assign users to a group and grant that group access to applications (inste... | 🟢 8.5 | ADO Wiki |
| 11 📋 | No data displayed in Entra Authentication Methods Activity report after license upgrade or app de... | Two causes: (1) Recently upgraded to Premium and data needs days to populate,... | For new Premium tenants: wait a few days. For IAMTenantCrawler: verify app ex... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Tenant deletion is blocked by subscription objects not visible in Azure Portal or standard tools.... | Orphaned or non-deleted MSODS subscription objects exist in the directory wit... | Query D2K Kusto cluster (idsharedwus.westus/d2kredacted) with CLD-D2KRedacted... | 🟢 8.5 | ADO Wiki |
| 13 📋 | CMAT shows tenant status is Released but tenant still exists and is visible to customer in Azure ... | Orphaned subscriptions in MSODS prevent actual tenant deletion after commerce... | Check OMS Admin Console subscription history for orphan subscription error. I... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Entra ID Governance features for guest users are blocked. Cannot create/update guest-scoped entit... | EIG for Guest Add-on enforcement started Jan 30 2026 (EM/LCW) and Mar 31 2026... | Link Azure subscription: Entra ID > ID Governance > Dashboard > Guest access ... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Lifecycle Workflow error: Workflow scheduling is not supported for disabled workflows; on-demand ... | After LCW GA with Entra ID Governance license, tenants from P2 preview were t... | Go to Identity Governance > Lifecycle workflows > Workflows. Select each Work... | 🟢 8.5 | ADO Wiki |
| 16 📋 | TenantOverview blade in Entra portal displays incorrect license type (shows P1 when tenant has P2... | TenantOverview calls graph.microsoft.com/beta/subscribedSkus to detect P1/P2.... | 1) Check ASC Graph Explorer for subscribedSkus response. 2) Cross-reference S... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Insufficient Privileges error when Global Admin tries to list all users from Azure/Entra Portal | The Last sign-in time column is selected for display, which requires Entra ID... | Remove the Last sign-in time column from the Users blade display columns. Alt... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Agent Publishing Error in M365 Admin Center when attempting to activate or publish an Agent 365 a... | One or more prerequisites are missing: insufficient Agent 365 licenses availa... | Verify and resolve all three prerequisites: (1) Confirm sufficient Agent 365 ... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Cannot remove or modify alias@tenant.onmicrosoft.com ProxyAddress from a synced user | The alias@tenant.onmicrosoft.com address is required by EXO for all licensed ... | Workaround: 1) Pause AADConnect sync. 2) Soft-delete user (Remove-EntraUser).... | 🟢 8.5 | ADO Wiki |
| 20 📋 | 21V tenant promo code redemption fails when the target tenant already has an Expired M365 subscri... | 21V commerce portal blocks new promo code redemption if an Expired subscripti... | File ticket to 21V O365 commerce team to cancel the Expired subscription from... | 🟢 8.0 | OneNote |
| 21 📋 | Need to verify if tenant has Entra ID Premium subscription for reporting features; sign-in logs t... | AAD_PREMIUM or AAD_PREMIUM_P2 required, standalone or bundled in EMS, EMSPREM... | Check ASC > Customer > Subscriptions tab for AAD_PREMIUM/AAD_PREMIUM_P2 or bu... | 🔵 7.5 | ADO Wiki |
| 22 📋 | D2K Kusto query for MSODS subscription objects returns stale/outdated data. Subscription status d... | D2K Kusto data (idsharedwus.westus/d2kredacted) is a snapshot of MSODS direct... | For live data, contact Azure Identity TA to check DS Explorer. D2K requires C... | 🔵 7.5 | ADO Wiki |
| 23 📋 | Duplicated users returned when checking user license assignment in Entra portal. Clicking Load Mo... | BEC API limitation in ListUsers. Affected blades: ProductUsersBladeV2, Produc... | Known issue being addressed. No current workaround in portal. Use PowerShell/... | 🔵 7.5 | ADO Wiki |
| 24 📋 | Unable to create new Microsoft Entra ID tenant - option greyed out in portal with message 'Custom... | Starting Oct 2023, tenant creation from an existing tenant requires a non-tri... | 1) Verify tenant has paid M365 subscription via Graph: GET /beta/directory/su... | 🔵 6.5 | ADO Wiki |
| 25 📋 | Unable to create new Entra ID tenant - option greyed out: Customers must own a paid license to cr... | Starting Oct 2023, tenant creation from existing tenant requires non-trial pa... | 1) Verify via Graph: GET /beta/directory/subscriptions?$select=isTrial,status... | 🔵 6.5 | ADO Wiki |
| 26 📋 | Azure AD tenant deletion is blocked by 'company account is present in modern' error in CMAT; tena... | A modern billing account (Billing Account/Legal Entity in modern commerce) ex... | CSS SE must: 1) Validate prerequisites in CST portal (billing profiles, subsc... | 🔵 6.5 | ADO Wiki |
| 27 📋 | Blank tables in Entra Permissions Management Permissions Analytics Report (PAR) PDF download | The authorization system (AWS account, Azure subscription, or GCP project) ha... | This is expected behavior. The table will display a message like 'You do not ... | 🔵 6.5 | ADO Wiki |
| 28 📋 | Customer asking about Microsoft Entra Permissions Management (MEPM) retirement, end-of-life, or i... | Microsoft announced MEPM retirement effective October 1, 2025. End-of-sale fo... | Existing customers retain access until Sept 30, 2025 with full support. Migra... | 🔵 6.5 | ADO Wiki |
| 29 📋 | Customer receiving unexpected mandatory MFA prompt when signing into M365 Admin Center (admin.mic... | Tenant has been targeted for M365 Admin Center MFA enforcement rollout as par... | 1) Customer can request grace period at https://aka.ms/manageazuremfa (requir... | 🔵 6.5 | ADO Wiki |
| 30 📋 | Azure AD Premium trial license for internal lab/test tenant is near expiry and requires extension | Trial licenses have fixed expiration and require manual extension request for... | Email aadpdemo@microsoft.com with CC to manager and abigail.brown@microsoft.c... | 🔵 5.5 | ADO Wiki |
| 31 📋 | Cannot update mail property to a non-verified domain (e.g. hotmail.com, gmail.com) for users with... | By design, EXO-licensed users can only have mail on a verified domain of the ... | 1) Remove the Exchange license (including implicit EXO licenses like Teams) b... | 🔵 5.5 | ADO Wiki |
| 32 📋 | Admin cannot change the Azure subscription or resource group after Copilot Pay-As-You-Go billing ... | By design, the subscription and resource group cannot be updated while Pay-As... | Turn off Copilot Pay-As-You-Go billing first (Settings > Copilot > Pay-as-you... | 🔵 5.5 | ADO Wiki |
| 33 📋 | Copilot usage report in M365 Admin Center shows zeros (0) for user activity in Past 7 days and/or... | By design: if the users last activity date is beyond the selected report peri... | Check the Last activity date (UTC) column for the affected user. If it falls ... | 🔵 5.5 | ADO Wiki |
| 34 📋 | Licensed Microsoft 365 Copilot users using Personal Content Mode (PCM) are misclassified in usage... | When the Copilot Chat graph grounding service plan is toggled off (which acti... | Microsoft-side fix is being deployed (targeted end of Feb 2026). The fix upda... | 🔵 5.5 | ADO Wiki |
| 35 📋 | Admin added a custom app in M365 Admin Center but the tile is missing or not showing on the app l... | Custom tile changes can take up to 24 hours to propagate. The issue may be br... | 1. Test in InPrivate/Incognito and multiple browsers. 2. Check behavior acros... | 🔵 5.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Check **licensing** related issues (5 entries) `[ado-wiki]`
2. Check **tenant-governance** related issues (2 entries) `[ado-wiki]`
3. Check **gdap** related issues (2 entries) `[ado-wiki]`
4. Check **myapps** related issues (2 entries) `[ado-wiki]`
5. Check **collections** related issues (2 entries) `[ado-wiki]`
6. Check **tenant-deletion** related issues (2 entries) `[ado-wiki]`
