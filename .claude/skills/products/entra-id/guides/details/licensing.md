# ENTRA-ID Licensing — Detailed Troubleshooting Guide

**Entries**: 35 | **Drafts fused**: 1 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-extend-aad-trial-license.md
**Generated**: 2026-04-07

---

## Phase 1: Tenant Deletion
> 4 related entries

### Tenant deletion is blocked by subscription objects not visible in Azure Portal or standard tools. Need to identify MSODS subscription objects preve...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Orphaned or non-deleted MSODS subscription objects exist in the directory with SubscriptionStatus other than 3 (Deleted). These objects block tenant deletion but may not be visible through normal admin tools.

**Solution**: Query D2K Kusto cluster (idsharedwus.westus/d2kredacted) with CLD-D2KRedacted-MSIT-R entitlement. Filter by TenantId. Check SubscriptionStatus: 0=Enabled, 1=Warning, 2=Suspended (all block deletion), 3=Deleted (OK). Cross-reference SkuID via Licensing Service Plan Reference doc. Note: D2K data is daily snapshot from midnight UTC; for live data use DS Explorer via Azure Identity TA.

---

### CMAT shows tenant status is Released but tenant still exists and is visible to customer in Azure AD/Entra ID. Tenant deletion did not complete desp...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Orphaned subscriptions in MSODS prevent actual tenant deletion after commerce release. OMS subscription history shows: UpdateCompanyProfile: The released tenant on commerce has orphan subscriptions on the directory.

**Solution**: Check OMS Admin Console subscription history for orphan subscription error. Identify orphaned subscriptions using DS Explorer or D2K Kusto queries. Remove orphaned subscriptions through OMS Subscription Console or escalate to Azure Identity TA. Re-run CMAT Validate+Delete after cleanup.

---

### D2K Kusto query for MSODS subscription objects returns stale/outdated data. Subscription status does not reflect recent changes.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: D2K Kusto data (idsharedwus.westus/d2kredacted) is a snapshot of MSODS directory state taken once daily at midnight UTC. Not real-time.

**Solution**: For live data, contact Azure Identity TA to check DS Explorer. D2K requires CLD-D2KRedacted-MSIT-R core entitlement.

---

### Azure AD tenant deletion is blocked by 'company account is present in modern' error in CMAT; tenant has a modern billing account (MCA) associated w...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: A modern billing account (Billing Account/Legal Entity in modern commerce) exists and is associated with the tenant; CMAT's Validate+Delete requires this to be removed before tenant deletion can proceed

**Solution**: CSS SE must: 1) Validate prerequisites in CST portal (billing profiles, subscriptions all deleted, invoices paid, no Azure Credits, IAM only 1 user, 1 invoice section, no active quotes). 2) For IW/Type B accounts: customer must self-delete by hard-deleting associated AAD users. 3) For Organization/Type C accounts: get written Global Admin consent, submit billing account deletion request in CST (Approver: CST_Azure_Identity_CSS_TA_Approvers), TA approves, then add CMAT skipmoderncheck tag after s

---

## Phase 2: Copilot
> 3 related entries

### Admin cannot change the Azure subscription or resource group after Copilot Pay-As-You-Go billing has been configured and is active.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: By design, the subscription and resource group cannot be updated while Pay-As-You-Go is active. The configuration is locked after initial setup.

**Solution**: Turn off Copilot Pay-As-You-Go billing first (Settings > Copilot > Pay-as-you-go > Turn off pay-as-you-go billing), confirm the action, then re-run the setup wizard to select a new subscription or resource group. Note: users will lose access to their agents while PAYG is off.

---

### Copilot usage report in M365 Admin Center shows zeros (0) for user activity in Past 7 days and/or Past 30 days columns, even though the user has a ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: By design: if the users last activity date is beyond the selected report period range, the usage count displays as zero. This is expected behavior, not a bug.

**Solution**: Check the Last activity date (UTC) column for the affected user. If it falls outside the report period, the zeros are expected. Adjust the report period to include the users last activity date to see non-zero values. Reference ICM: 704544860.

---

### Licensed Microsoft 365 Copilot users using Personal Content Mode (PCM) are misclassified in usage reporting. Licensed Copilot Chat usage appears in...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: When the Copilot Chat graph grounding service plan is toggled off (which activates PCM capability), the usage reporting logic incorrectly classifies the user as unlicensed because it relies on that specific service plan to attribute licensed Copilot Chat usage.

**Solution**: Microsoft-side fix is being deployed (targeted end of Feb 2026). The fix updates reporting logic to treat users as licensed if they have the M365 Copilot SKU with any service plan enabled, rather than requiring the Copilot Chat graph grounding plan specifically. Reference ICM: 51000000788611.

---

## Phase 3: Tenant Creation
> 2 related entries

### Unable to create new Microsoft Entra ID tenant - option greyed out in portal with message 'Customers must own a paid license to create Microsoft En...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Starting Oct 2023, tenant creation from an existing tenant requires a non-trial paid M365 seat-based subscription. Azure subscriptions alone are not sufficient. A Graph query to /directory/subscriptions checks isTrial and commerceSubscriptionId to determine eligibility.

**Solution**: 1) Verify tenant has paid M365 subscription via Graph: GET /beta/directory/subscriptions?$select=isTrial,status,skuId,commerceSubscriptionId. Need isTrial=False and commerceSubscriptionId!=skuId. 2) If no paid M365 subscription, customer can create tenant via https://azure.microsoft.com/free/ signup flow instead. 3) Any non-trial M365 seat-based subscription (e.g. Power BI paid) qualifies.

---

### Unable to create new Entra ID tenant - option greyed out: Customers must own a paid license to create Microsoft Entra Workforce tenant
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Starting Oct 2023, tenant creation from existing tenant requires non-trial paid M365 seat-based subscription. Azure subscriptions alone are not sufficient.

**Solution**: 1) Verify via Graph: GET /beta/directory/subscriptions?$select=isTrial,status,skuId,commerceSubscriptionId. Need isTrial=False and commerceSubscriptionId!=skuId. 2) Create via https://azure.microsoft.com/free/. 3) Any non-trial M365 seat-based subscription qualifies.

---

## Phase 4: Tenant Governance
> 2 related entries

### Governance request fails with "License required" error when attempting to establish GDAP relationship or app injection
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Missing required licensing: Microsoft Entra ID P1 or P2 is required for GDAP relationships; Microsoft Entra ID Governance license is required for app injection (multitenant application provisioning) scenarios

**Solution**: Ensure the governing tenant has Microsoft Entra ID P1 or P2 license for GDAP. For app injection scenarios, ensure Microsoft Entra ID Governance license is available. Verify licensing before sending governance requests

---

### Sending a governance request fails with License required error for GDAP or app injection scenarios
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GDAP relationships require Microsoft Entra ID P1 or P2 license; app injection scenarios require Microsoft Entra ID Governance license

**Solution**: Ensure governing tenant has required licenses: Entra ID P1/P2 for GDAP delegation, Entra ID Governance for multitenant app injection. Check in Entra admin center > Billing > Licenses

---

## Phase 5: Myapps
> 2 related entries

### Applications in a My Apps Collection differ between team members - some users see all apps in the collection while others see only a subset
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Individual users were assigned directly to applications instead of through groups, or users are assigned via nested group membership which Collections do not support for visibility. Collections only organize apps visually; they do not grant permissions.

**Solution**: Assign users to a group and grant that group direct access to the applications. Verify the user has been assigned any necessary licenses. Note: nested group membership is not supported for application visibility in Collections.

---

### Applications in a My Apps Collection differ between team members: some users see all apps while others see an incomplete list
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Users assigned individually to applications may see different subsets. Nested group membership is not expanded for Collections, so apps assigned via nested groups do not appear.

**Solution**: 1) Assign users to a group and grant that group access to applications (instead of individual assignment). 2) Verify user has required licenses. 3) Note: Collections do not expand nested groups - use direct group membership.

---

## Phase 6: Entra Portal
> 2 related entries

### TenantOverview blade in Entra portal displays incorrect license type (shows P1 when tenant has P2, or vice versa).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TenantOverview calls graph.microsoft.com/beta/subscribedSkus to detect P1/P2. If response contains AAD_PREMIUM it shows P1, AAD_PREMIUM_P2 shows P2. License may be bundled in SKUs like M365 E5 Security.

**Solution**: 1) Check ASC Graph Explorer for subscribedSkus response. 2) Cross-reference SKU IDs with https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference

---

### Duplicated users returned when checking user license assignment in Entra portal. Clicking Load More shows duplicate entries in license product blades.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: BEC API limitation in ListUsers. Affected blades: ProductUsersBladeV2, ProductGroupsBladeV2, GroupsProductsBladeV2, UserAssignmentErrorsBlade. Work item: 1066723.

**Solution**: Known issue being addressed. No current workaround in portal. Use PowerShell/Graph API for accurate license assignment data.

---

## Phase 7: Permissions Management
> 2 related entries

### Blank tables in Entra Permissions Management Permissions Analytics Report (PAR) PDF download
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: The authorization system (AWS account, Azure subscription, or GCP project) has no findings for that particular category.

**Solution**: This is expected behavior. The table will display a message like 'You do not have any inactive users.' No action needed - the blank table means zero findings in that category.

---

### Customer asking about Microsoft Entra Permissions Management (MEPM) retirement, end-of-life, or inability to purchase new licenses
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft announced MEPM retirement effective October 1, 2025. End-of-sale for new customers: April 1, 2025. End-of-sale CSP: May 1, 2025. Decision driven by realignment of security investments toward core identity categories and AI.

**Solution**: Existing customers retain access until Sept 30, 2025 with full support. Migration options: (1) Delinea partner CIEM solution (https://delinea.com/microsoft-ciem), (2) CIEM capabilities in Microsoft Defender for Cloud CSPM plan continue and are being enhanced. Refunds available for remaining contract value after April 1, 2025. Offboarding guide: https://aka.ms/MEPMmigration. Refund questions to commerce team. Non-technical questions to customer account specialist. ICM template: https://portal.mic

---

## Phase 8: M365 Admin Center
> 2 related entries

### Customer receiving unexpected mandatory MFA prompt when signing into M365 Admin Center (admin.microsoft.com, admin.cloud.microsoft, portal.office.c...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Tenant has been targeted for M365 Admin Center MFA enforcement rollout as part of Secure Future Initiative (SFI). Currently rolling out to Enterprise subscription tenants. App ID 00000006-0000-0ff1-ce00-000000000000 enforces MFA.

**Solution**: 1) Customer can request grace period at https://aka.ms/manageazuremfa (requires GA with elevated access), extends until Sept 30, 2025. Allow 24 hours to take effect. 2) For 40+ tenants (S500/CSS/CSD/Azure ACE customers), use IcM template https://aka.ms/postponemfaicm with CSV of tenant IDs for bulk enablement. 3) Set SAP: Microsoft 365/Authentication and Access/Setup and Use Multifactor Authentication/Unexpected MFA prompt. 4) Set Internal Title: [Portal Enforcement]. 5) Set Root Cause: Root Cau

---

### Admin added a custom app in M365 Admin Center but the tile is missing or not showing on the app launcher.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Custom tile changes can take up to 24 hours to propagate. The issue may be browser cache related or portal-specific.

**Solution**: 1. Test in InPrivate/Incognito and multiple browsers. 2. Check behavior across portals: myapps.microsoft.com, portal.office.com, outlook.office.com. 3. Allow up to 24 hours for replication. 4. Collect HAR/Fiddler trace, PSR/video recording, page source. Confirm valid EXO license on end user. 5. If only on *.office.com, escalate to Office Shell. If on App Launcher, escalate to TAOS Platform Services.

---

## Phase 9: Aadsts500014
> 1 related entries

### AADSTS500014: Service principal for resource is disabled. Affects multiple services: Power BI Desktop login, Logic App on-premise data gateway, AIP...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: First-party apps with ServicePrincipalLifecyclePolicy=SubscriptionManaged(1) are managed by the ordering management system. It periodically checks if the tenant has a paid subscription associated with the service. If no valid subscription found, the SP is disabled. E.g., PBI requires PBI Pro/Premium license, AIP requires EMS/AIP license, MFA requires MFA/AAD Premium license.

**Solution**: 1. Verify customer has valid paid subscription at portal.partner.microsoftonline.cn. 2. Check first-party portal for ServicePrincipalLifecyclePolicy setting. 3. Workaround: Schedule PowerShell task every 30 min to re-enable SP if disabled (Get-MsolServicePrincipal + Set-MsolServicePrincipal -AccountEnabled $true). 4. For AIP Sync service in Mooncake, known bug that it's not bound to any SKU (ICM-281185138).

---

## Phase 10: 21V
> 1 related entries

### 21V tenant promo code redemption fails when the target tenant already has an Expired M365 subscription for the same offer
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: 21V commerce portal blocks new promo code redemption if an Expired subscription for the same offer already exists on the tenant

**Solution**: File ticket to 21V O365 commerce team to cancel the Expired subscription from backend (status changes to Disabled) → delete subscription via admin portal → verify no "You own this" mark on the offer in Purchase Services → redeem promo code with AliPay billing set to CNY 0.00. M365 E5 IP&G trial activation: portal.partner.microsoftonline.cn/Commerce/Trial.aspx

---

## Phase 11: Ssh
> 1 related entries

### az ssh vm --ip command fails silently with no error and no connection when connecting from Windows to Azure Linux VM
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Just-In-Time (JIT) access is enabled on the Azure Linux VM (common in AIRS subscriptions), blocking SSH port 22

**Solution**: Enable JIT on VM via Azure Portal > Connection blade > Configuration > Enable just-in-time, then click Request access before SSH

---

## Phase 12: Subscription Activation
> 1 related entries

### Windows 10 Pro does not auto-upgrade to Enterprise via Subscription Activation on AAD joined / Hybrid AAD joined device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User does not have WIN10_PRO_ENT_SUB service plan (ID: 21b439ba-a0ca-424f-a6cc-52f954a5b111) assigned

**Solution**: Verify in ASC > Tenant Explorer > User blade > Licenses > Assigned Plans, filter by Service Plan ID 21b439ba-a0ca-424f-a6cc-52f954a5b111. If missing, assign Windows 10 Enterprise E3/E5 license to user.

---

## Phase 13: Workload Identity
> 1 related entries

### Error 1150: Workload Identity premium license required for CA policy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Post-GA licensing enforcement.

**Solution**: Purchase Workload Identities premium or activate 90-day trial.

---

## Phase 14: Gbl
> 1 related entries

### License seats not released after on-prem synced group with GBL removed from sync scope and deleted
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Deletion bypasses DeletingLicensedGroupNotAllowed protection. GBL does not release license count.

**Solution**: Reprocess users via Entra portal or Invoke-MgLicenseUser cmdlet for bulk reprocessing.

---

## Phase 15: Entra Domain Services
> 1 related entries

### Customer reports being billed for Microsoft Entra Domain Services after disabling the service
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MEDS may still be active in another tenant linked to the same billing subscription. MEDS billing is tied to the subscription owning the VNet, and a co-admin could have enabled MEDS in a separate Entra tenant using that subscription's VNet.

**Solution**: 1) Get billing subscription ID. 2) Use ACIS (AD Fabric DCAAS ARM PROD → GetActiveTenants) to find active MEDS deployments. 3) If found, customer must sign in as subscription admin to disable MEDS. 4) If subscription expired and customer can't access, open ICM to PG to disable/delete deployment from backend.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AADSTS500014: Service principal for resource is disabled. Affects multiple se... | First-party apps with ServicePrincipalLifecyclePolicy=Sub... | 1. Verify customer has valid paid subscription at portal.... | 🟢 9.0 | OneNote |
| 2 | az ssh vm --ip command fails silently with no error and no connection when co... | Just-In-Time (JIT) access is enabled on the Azure Linux V... | Enable JIT on VM via Azure Portal > Connection blade > Co... | 🟢 8.5 | ADO Wiki |
| 3 | Windows 10 Pro does not auto-upgrade to Enterprise via Subscription Activatio... | User does not have WIN10_PRO_ENT_SUB service plan (ID: 21... | Verify in ASC > Tenant Explorer > User blade > Licenses >... | 🟢 8.5 | ADO Wiki |
| 4 | Governance request fails with "License required" error when attempting to est... | Missing required licensing: Microsoft Entra ID P1 or P2 i... | Ensure the governing tenant has Microsoft Entra ID P1 or ... | 🟢 8.5 | ADO Wiki |
| 5 | Sending a governance request fails with License required error for GDAP or ap... | GDAP relationships require Microsoft Entra ID P1 or P2 li... | Ensure governing tenant has required licenses: Entra ID P... | 🟢 8.5 | ADO Wiki |
| 6 | Error 1150: Workload Identity premium license required for CA policy | Post-GA licensing enforcement. | Purchase Workload Identities premium or activate 90-day t... | 🟢 8.5 | ADO Wiki |
| 7 | License seats not released after on-prem synced group with GBL removed from s... | Deletion bypasses DeletingLicensedGroupNotAllowed protect... | Reprocess users via Entra portal or Invoke-MgLicenseUser ... | 🟢 8.5 | ADO Wiki |
| 8 | Customer reports being billed for Microsoft Entra Domain Services after disab... | MEDS may still be active in another tenant linked to the ... | 1) Get billing subscription ID. 2) Use ACIS (AD Fabric DC... | 🟢 8.5 | ADO Wiki |
| 9 | Applications in a My Apps Collection differ between team members - some users... | Individual users were assigned directly to applications i... | Assign users to a group and grant that group direct acces... | 🟢 8.5 | ADO Wiki |
| 10 | Applications in a My Apps Collection differ between team members: some users ... | Users assigned individually to applications may see diffe... | 1) Assign users to a group and grant that group access to... | 🟢 8.5 | ADO Wiki |
| 11 | No data displayed in Entra Authentication Methods Activity report after licen... | Two causes: (1) Recently upgraded to Premium and data nee... | For new Premium tenants: wait a few days. For IAMTenantCr... | 🟢 8.5 | ADO Wiki |
| 12 | Tenant deletion is blocked by subscription objects not visible in Azure Porta... | Orphaned or non-deleted MSODS subscription objects exist ... | Query D2K Kusto cluster (idsharedwus.westus/d2kredacted) ... | 🟢 8.5 | ADO Wiki |
| 13 | CMAT shows tenant status is Released but tenant still exists and is visible t... | Orphaned subscriptions in MSODS prevent actual tenant del... | Check OMS Admin Console subscription history for orphan s... | 🟢 8.5 | ADO Wiki |
| 14 | Entra ID Governance features for guest users are blocked. Cannot create/updat... | EIG for Guest Add-on enforcement started Jan 30 2026 (EM/... | Link Azure subscription: Entra ID > ID Governance > Dashb... | 🟢 8.5 | ADO Wiki |
| 15 | Lifecycle Workflow error: Workflow scheduling is not supported for disabled w... | After LCW GA with Entra ID Governance license, tenants fr... | Go to Identity Governance > Lifecycle workflows > Workflo... | 🟢 8.5 | ADO Wiki |
| 16 | TenantOverview blade in Entra portal displays incorrect license type (shows P... | TenantOverview calls graph.microsoft.com/beta/subscribedS... | 1) Check ASC Graph Explorer for subscribedSkus response. ... | 🟢 8.5 | ADO Wiki |
| 17 | Insufficient Privileges error when Global Admin tries to list all users from ... | The Last sign-in time column is selected for display, whi... | Remove the Last sign-in time column from the Users blade ... | 🟢 8.5 | ADO Wiki |
| 18 | Agent Publishing Error in M365 Admin Center when attempting to activate or pu... | One or more prerequisites are missing: insufficient Agent... | Verify and resolve all three prerequisites: (1) Confirm s... | 🟢 8.5 | ADO Wiki |
| 19 | Cannot remove or modify alias@tenant.onmicrosoft.com ProxyAddress from a sync... | The alias@tenant.onmicrosoft.com address is required by E... | Workaround: 1) Pause AADConnect sync. 2) Soft-delete user... | 🟢 8.5 | ADO Wiki |
| 20 | 21V tenant promo code redemption fails when the target tenant already has an ... | 21V commerce portal blocks new promo code redemption if a... | File ticket to 21V O365 commerce team to cancel the Expir... | 🟢 8.0 | OneNote |
| 21 | Need to verify if tenant has Entra ID Premium subscription for reporting feat... | AAD_PREMIUM or AAD_PREMIUM_P2 required, standalone or bun... | Check ASC > Customer > Subscriptions tab for AAD_PREMIUM/... | 🔵 7.5 | ADO Wiki |
| 22 | D2K Kusto query for MSODS subscription objects returns stale/outdated data. S... | D2K Kusto data (idsharedwus.westus/d2kredacted) is a snap... | For live data, contact Azure Identity TA to check DS Expl... | 🔵 7.5 | ADO Wiki |
| 23 | Duplicated users returned when checking user license assignment in Entra port... | BEC API limitation in ListUsers. Affected blades: Product... | Known issue being addressed. No current workaround in por... | 🔵 7.5 | ADO Wiki |
| 24 | Unable to create new Microsoft Entra ID tenant - option greyed out in portal ... | Starting Oct 2023, tenant creation from an existing tenan... | 1) Verify tenant has paid M365 subscription via Graph: GE... | 🔵 6.5 | ADO Wiki |
| 25 | Unable to create new Entra ID tenant - option greyed out: Customers must own ... | Starting Oct 2023, tenant creation from existing tenant r... | 1) Verify via Graph: GET /beta/directory/subscriptions?$s... | 🔵 6.5 | ADO Wiki |
| 26 | Azure AD tenant deletion is blocked by 'company account is present in modern'... | A modern billing account (Billing Account/Legal Entity in... | CSS SE must: 1) Validate prerequisites in CST portal (bil... | 🔵 6.5 | ADO Wiki |
| 27 | Blank tables in Entra Permissions Management Permissions Analytics Report (PA... | The authorization system (AWS account, Azure subscription... | This is expected behavior. The table will display a messa... | 🔵 6.5 | ADO Wiki |
| 28 | Customer asking about Microsoft Entra Permissions Management (MEPM) retiremen... | Microsoft announced MEPM retirement effective October 1, ... | Existing customers retain access until Sept 30, 2025 with... | 🔵 6.5 | ADO Wiki |
| 29 | Customer receiving unexpected mandatory MFA prompt when signing into M365 Adm... | Tenant has been targeted for M365 Admin Center MFA enforc... | 1) Customer can request grace period at https://aka.ms/ma... | 🔵 6.5 | ADO Wiki |
| 30 | Azure AD Premium trial license for internal lab/test tenant is near expiry an... | Trial licenses have fixed expiration and require manual e... | Email aadpdemo@microsoft.com with CC to manager and abiga... | 🔵 5.5 | ADO Wiki |
