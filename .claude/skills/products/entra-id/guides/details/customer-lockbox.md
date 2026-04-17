# ENTRA-ID Customer Lockbox — Detailed Troubleshooting Guide

**Entries**: 38 | **Drafts fused**: 9 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-entra-lockbox-tenant-add-scenarios.md, ado-wiki-a-lockbox-kusto-queries.md, ado-wiki-a-lockbox-service-logging.md, ado-wiki-a-lockbox-workflow-in-pictures.md, ado-wiki-a-tsg-obtaining-pending-lockbox-consent-request.md, ado-wiki-b-how-to-enroll-tenant-in-customer-lockbox.md, ado-wiki-b-lockbox-runners.md, ado-wiki-b-tracking-lockbox-notification-emails.md, ado-wiki-e-Azure-Customer-Lockbox.md
**Generated**: 2026-04-07

---

## Phase 1: Customer Lockbox
> 38 related entries

### User with inherited Owner role on a subscription does not receive Azure Customer Lockbox notification email and cannot approve or reject access req...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: An inherited Owner role (e.g., from a management group) is NOT recognized by Customer Lockbox for subscription-scoped requests. Only directly assigned Owner, Global Admin, or Azure Customer Lockbox Approver roles at the subscription scope count for Lockbox notifications and approvals.

**Solution**: Assign the Owner role (or Azure Customer Lockbox Approver role) directly at the subscription scope. Do not rely on inherited roles from management groups or resource group scope for Lockbox approval.

---

### Customer claims they never received or cannot see a pending Azure Customer Lockbox consent request in the Azure Portal, despite support engineer se...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: For Tenant-scoped Lockbox requests (ResourceType=2), only active Entra Global Administrators at request creation time can see the request. For Subscription-scoped requests (ResourceType=1), only active Subscription Owner or Azure Customer Lockbox Approver role holders at subscription scope can see them. Inheriting roles from management groups or resource group scope is NOT sufficient.

**Solution**: 1) In ASC, use F12 Dev Tools to capture GetLockboxConsentRequestStatus API response and identify ResourceType (1=Subscription, 2=Tenant) and ResourceId. 2) For Subscription: verify via Check Access API that user has Owner or Lockbox Approver role at subscription scope. 3) For Tenant: verify user is active Global Administrator. 4) If still unable, collect HAR trace + PSR and submit ICM to Azure LockBox Triage.

---

### User assigned the Azure Customer Lockbox Approver role cannot see pending Lockbox requests or receive notification emails for subscription-scoped L...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Azure Customer Lockbox Approver role must be assigned and active on the user account BEFORE the Lockbox consent request is created. If assigned after the request is sent, user will not receive the notification and cannot approve.

**Solution**: Ensure Azure Customer Lockbox Approver or Owner role is active at subscription scope prior to request creation. If using PIM, activate the role before the request. Verify Customer Lockbox is enabled from Azure Admin Center. Check activity logs at Customer Lockbox Activity Log blade.

---

### Duplicate Lockbox notification emails are sent when primary email and Other Emails field contain the same email address.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure Lockbox Alternate Email sends notifications to both primary and other email addresses without deduplication when identical.

**Solution**: Known issue. Ensure primary email and Other Emails values are different to avoid duplicates.

---

### Lockbox notification emails only sent to first email in Other Emails despite multiple alternate addresses configured.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure Lockbox Alternate Email feature only sends notifications to the first entry in Other Emails list, ignoring additional entries.

**Solution**: Known issue. Place the most important alternate email as the first entry in Other Emails field.

---

### Two identical Lockbox notification emails sent to alternate email when primary email field is empty but Other Emails is configured.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When primary email not set and only Other Emails is configured, the Lockbox notification system sends two copies to the alternate address.

**Solution**: Known issue. Set a primary email on the user account to avoid duplicate notifications.

---

### User not receiving Azure Lockbox notification email for pending consent requests despite alternate email configured.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Owner/Global Administrator/Azure Customer Lockbox Approver role must be applied to the approver account BEFORE the request is sent. No notification is generated if role was not active at request creation time.

**Solution**: Confirm Lockbox is enabled for the tenant. Verify alternate email in Other Emails property. Ensure Owner/GA/Lockbox Approver role was active before request submission. If using PIM, ensure role was activated prior to request.

---

### Entra Customer Lockbox Tenant Add in ASC error: The tenant is not in the same region as the support case.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Case region is determined by EUDB onboarding status, not tenant location. Non-EU case cannot add a remote EU tenant via Tenant Add due to data residency requirements. Only the case-creation tenant is exempted.

**Solution**: Customer must create a separate support case directly from the resource tenant. Tenant Add does not support cross-region scenarios except for the case-creation tenant.

---

### Entra Customer Lockbox Tenant Add in ASC error: Tenant access check request failed with status code: Forbidden.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The support case is not open or not assigned to the engineer attempting the tenant add.

**Solution**: Verify the support case is still open and the engineer performing Tenant Add is the assigned case owner.

---

### Entra Customer Lockbox Tenant Add in ASC error: Support case creator is not authorized to approve access to resource tenant data.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The customer who opened the support case does not have an external identity (guest account) with a required admin role in the remote tenant.

**Solution**: Case contact must have an external identity in the remote tenant with an approved admin role. Create a guest account from the remote tenant and assign a valid admin role before retrying Tenant Add.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | User with inherited Owner role on a subscription does not receive Azure Custo... | An inherited Owner role (e.g., from a management group) i... | Assign the Owner role (or Azure Customer Lockbox Approver... | 🟢 9.5 | ADO Wiki |
| 2 | Customer claims they never received or cannot see a pending Azure Customer Lo... | For Tenant-scoped Lockbox requests (ResourceType=2), only... | 1) In ASC, use F12 Dev Tools to capture GetLockboxConsent... | 🟢 8.5 | ADO Wiki |
| 3 | User assigned the Azure Customer Lockbox Approver role cannot see pending Loc... | The Azure Customer Lockbox Approver role must be assigned... | Ensure Azure Customer Lockbox Approver or Owner role is a... | 🟢 8.5 | ADO Wiki |
| 4 | Duplicate Lockbox notification emails are sent when primary email and Other E... | Azure Lockbox Alternate Email sends notifications to both... | Known issue. Ensure primary email and Other Emails values... | 🟢 8.5 | ADO Wiki |
| 5 | Lockbox notification emails only sent to first email in Other Emails despite ... | Azure Lockbox Alternate Email feature only sends notifica... | Known issue. Place the most important alternate email as ... | 🟢 8.5 | ADO Wiki |
| 6 | Two identical Lockbox notification emails sent to alternate email when primar... | When primary email not set and only Other Emails is confi... | Known issue. Set a primary email on the user account to a... | 🟢 8.5 | ADO Wiki |
| 7 | User not receiving Azure Lockbox notification email for pending consent reque... | Owner/Global Administrator/Azure Customer Lockbox Approve... | Confirm Lockbox is enabled for the tenant. Verify alterna... | 🟢 8.5 | ADO Wiki |
| 8 | Entra Customer Lockbox Tenant Add in ASC error: The tenant is not in the same... | Case region is determined by EUDB onboarding status, not ... | Customer must create a separate support case directly fro... | 🟢 8.5 | ADO Wiki |
| 9 | Entra Customer Lockbox Tenant Add in ASC error: Tenant access check request f... | The support case is not open or not assigned to the engin... | Verify the support case is still open and the engineer pe... | 🟢 8.5 | ADO Wiki |
| 10 | Entra Customer Lockbox Tenant Add in ASC error: Support case creator is not a... | The customer who opened the support case does not have an... | Case contact must have an external identity in the remote... | 🟢 8.5 | ADO Wiki |
| 11 | Entra Customer Lockbox Tenant Add in ASC error: Diagnostic data not approved. | Customer did not allow collection of diagnostic informati... | Ask customer to navigate to their support case page in Az... | 🟢 8.5 | ADO Wiki |
| 12 | Customer reports they cannot see pending Customer Lockbox consent request in ... | For tenant-scoped requests, only active Entra Global Admi... | 1) Use browser DevTools (F12->Network) on ASC Refresh but... | 🟢 8.5 | ADO Wiki |
| 13 | Customer receives duplicate Lockbox notification emails when primary email an... | Known product issue: Lockbox Alternate Email feature send... | Known issue, no workaround. Ensure primary email and Othe... | 🟢 8.5 | ADO Wiki |
| 14 | Lockbox notifications are sent only to the first email address in Other Email... | Known product issue: Lockbox Alternate Email feature only... | Known issue. Workaround: place the most important alterna... | 🟢 8.5 | ADO Wiki |
| 15 | Two duplicate Lockbox notification emails sent to alternate email address whe... | Known product issue: when primary email is empty and Othe... | Known issue. Workaround: set a primary email on the accou... | 🟢 8.5 | ADO Wiki |
| 16 | Customer Lockbox alternate email notification not received by the configured ... | Required roles (Owner/Global Administrator/Azure Customer... | Verify: 1) Lockbox is enabled for the tenant. 2) Alternat... | 🟢 8.5 | ADO Wiki |
| 17 | Entra Lockbox Tenant Add fails with error: The tenant is not in the same regi... | EUDB data boundary restriction. If customer is not onboar... | Customer must create a separate support case directly fro... | 🟢 8.5 | ADO Wiki |
| 18 | Entra Lockbox Tenant Add fails with error: Tenant access check request failed... | The support case is not open or is not assigned to the en... | Verify the support case is still open and assigned to the... | 🟢 8.5 | ADO Wiki |
| 19 | Entra Lockbox Tenant Add fails with error: Support case creator is not author... | The customer who opened the support case does not have an... | Customer needs to create a guest account in the remote te... | 🟢 8.5 | ADO Wiki |
| 20 | Entra Lockbox Tenant Add fails with error: Insufficient case information | System cannot retrieve information about the case creator... | Escalate via ICM to Azure LockBox\Triage with case detail... | 🟢 8.5 | ADO Wiki |
| 21 | Entra Lockbox Tenant Add fails with error: Diagnostic data not approved | Customer did not consent to collection of diagnostic info... | Ask customer to give consent in Advanced diagnostic infor... | 🟢 8.5 | ADO Wiki |
| 22 | Customer using PIM (Privileged Identity Management) cannot see pending Azure ... | When PIM is enabled, the user must have active (elevated)... | 1) Customer activates GA role (for tenant requests) or Ow... | 🟢 8.5 | ADO Wiki |
| 23 | Lockbox runner failure for a request but no corresponding lockbox logs found ... | The issue is at JIT processing level. JIT evaluates the r... | 1) Query JIT Kusto logs by request ID to check request st... | 🟢 8.5 | ADO Wiki |
| 24 | Customer with PIM enabled does not receive Customer Lockbox notification emai... | When PIM is enabled, if a Microsoft employee requests loc... | Customer must first activate GA (for tenant requests) or ... | 🟢 8.5 | ADO Wiki |
| 25 | Customer Lockbox request stuck in pending for 4 days with no notification aft... | If a Microsoft engineer submits a lockbox request before ... | Wait for the stuck request to timeout (4 days). Then: 1) ... | 🟢 8.5 | ADO Wiki |
| 26 | Runner failure for a lockbox request with no corresponding logs in Lockbox se... | The issue is at the JIT (Just-In-Time access) layer. JIT ... | 1) Query JIT logs for the request ID, 2) Check policy eva... | 🟢 8.5 | ADO Wiki |
| 27 | Lockbox request is auto-approved without ever reaching customer notified stat... | The subscription is associated with an internal Microsoft... | 1) Check Service Tree (https://aka.ms/servicetree) for th... | 🟢 8.5 | ADO Wiki |
| 28 | Customer using PIM (Privileged Identity Management) with Customer Lockbox for... | Customer Lockbox notifications and pending request visibi... | This is expected behavior by design. The customer must ac... | 🟢 8.5 | ADO Wiki |
| 29 | Customer Lockbox alert 'IncorrectRequestProcessing' fires when requests are c... | Request processing logic changed and terminated request b... | Investigate LockboxApiRequestProcessing alert first if co... | 🟢 8.5 | ADO Wiki |
| 30 | Customer Lockbox alert 'JIT-RequestSubmitted-SLA' fires when JIT pipeline fai... | JIT pipeline encountered an error processing Lockbox requ... | Use dashboard linked in ICM to narrow time range to 10-mi... | 🟢 8.5 | ADO Wiki |
