# AVD W365 删除与防欺诈 — 排查工作流

**来源草稿**: ado-wiki-mount-vhd-after-place-under-review.md, ado-wiki-place-under-review-setup-guide.md, ado-wiki-w365-anti-fraud-abuse-process.md, ado-wiki-windows-365-customer-lockbox-faqs.md
**Kusto 引用**: (无)
**场景数**: 15
**生成日期**: 2026-04-07

---

## Scenario 1: Resolution
> 来源: ado-wiki-mount-vhd-after-place-under-review.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Identify the storage account** used to place the Cloud PC under review
   - Take note of the name, subscription, resource group, location and availability zone (if used)
   - Ensure that the performance is set to **Premium**, as recommended by requirements
2. **Create a managed disk** using the VHD in the storage account
   - Use the same subscription, resource group, location and availability zone as the storage account
   - Under source type, select **Storage blob** and browse the storage account and VHD
   - You may also change the size of the disk to match the size of the Cloud PC disk
3. **Mount as data disk** in a new or existing Azure VM
   - The Azure VM should be in the same subscription, resource group, location and availability zone as the storage account
   - Go to the VM's Disks settings and select **Attach existing disks** under Data disks
   - In the dropdown, select the disk created in step 2
4. **Boot the Azure VM** — the data disk should appear with a new drive letter

## Scenario 2: More information
> 来源: ado-wiki-mount-vhd-after-place-under-review.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Follow these instructions to place the Cloud PC under review: https://docs.microsoft.com/en-us/windows-365/enterprise/place-cloud-pc-under-review

## Scenario 3: Steps
> 来源: ado-wiki-place-under-review-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Create Blob Storage Account**
   - Storage Accounts > Blob Storage > Create
2. **Basics Tab**
   - Configure standard settings (subscription, resource group, name, region)
3. **Advanced Tab**
   - Disable "Enable storage account key access"
   - Minimum TLS version: **Version 1.2**
4. **Networking Tab**
   - Network access: **Enable public access from all networks**
5. **Data Protection & Encryption**
   - Accept defaults
6. **Complete wizard and Create**
7. **Configure IAM Role Assignments**
   - Go to the storage account > Access Control (IAM) > Role Assignments > Add
   - Add **two** role assignments:
   - **Storage Account Contributor** → Assign to "Windows 365" service principal
   - **Storage Blob Data Contributor** → Assign to "Windows 365" service principal
8. **Place Cloud PC Under Review**
   - Go to Cloud PC in Intune > Select "Place Cloud PC under review"
   - Select the newly created Storage Account and Container
   - Select "Allow Access" > "Place Under Review"
9. **Verify**
   - Status will initially show "Pending"
   - Check Containers in the storage account to see the newly created container
   - Once complete, status will show "Active"

## Scenario 4: Tenant Score and Provision Lanes
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
To protect Cloud PC service and customers from fraudsters, Cloud PC engineering team launched the Tenant Score feature in backend to assess how trustworthy each tenant is.
   - Tenant score is between 0 and 1
   - **Slow lane**: [min, 0.03) — tenant can only provision **2 Cloud PCs per week**
   - **Ordinary lane**: [0.03, 0.9) — tenant can provision 8 Cloud PCs per 5 min
   - **Fast lane**: [0.9, max] — tenant can provision 50 Cloud PCs per 5 min

## Scenario 5: Suspicion and Fraud Tenant
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Tenant in slow lane may be marked as highly suspicious tenant and after confirmed by HIT (Human Investigation Team) they will be marked as fraud tenant.
   - **Highly suspicious tenant**: all Cloud PCs under the tenant will be **deallocated (stopped, customer cannot start these deallocated devices)**. If confirmed as fraud by HIT, all Cloud PCs will be **deprovisioned**.
   - **Confirmed fraud tenant**: all Cloud PCs will be **deprovisioned**.

## Scenario 6: Check Tenant Trust Level (CloudPC Event Kusto)
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where OtherIdentifiers == "<TenantID>"
| where Col1 startswith "Evaluation: Called usage service, tenantEvaluationResults"
| project env_time, env_cloud_name, env_cloud_environment, Col1, TenantId = OtherIdentifiers
```
`[来源: ado-wiki-w365-anti-fraud-abuse-process.md]`

## Scenario 7: Check Tenant Score History (Reporting Kusto)
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DailyTenantEvaluation_Snapshot
| where TenantId == "<TenantID>"
| project TenantId, EvaluatedAt, TrustLevel, PreviousTrustLevel, HITStatus, SentToHITAt, HITDecisionTime
```
`[来源: ado-wiki-w365-anti-fraud-abuse-process.md]`

## Scenario 8: Process for Slow Lane Tenant Tickets
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer reports provisioning is limited/slow
2. Check tenant trust level via Kusto or CPCD
3. If tenant is in slow lane, follow escalation process

## Scenario 9: Process for Fraud Tenant Tickets
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer reports Cloud PCs deprovisioned
2. Check fraud status via CPCD/Kusto
3. If fraud upheld → inform customer subscription remains disabled
4. If fraud lifted → re-enable subscription and apologize

## Scenario 10: Fraud Upheld
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Thank you for reaching out. Unfortunately, our earlier decision stands and your subscription(s) will remain disabled. Please understand that we keep security checks like these in place in order to help protect the quality and integrity of the Windows 365 service.

## Scenario 11: Fraud Lifted
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Good news, the issue has been resolved! We're sorry about the temporary service interruption. To help protect the security and privacy of your account, we perform routine audits of all Windows 365 subscriptions. We've re-enabled your subscription and apologize for any inconvenience this caused. We are taking active steps to learn from this error.

## Scenario 12: Tools
> 来源: ado-wiki-w365-anti-fraud-abuse-process.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [CPCD Dashboard](https://aka.ms/cpcd) — Check tenant score and trust level history
   - [CMAT](https://cmat.azure.com/)
   - [CST Portal](https://cst.azure.com/)

## Scenario 13: What is Customer Lockbox
> 来源: ado-wiki-windows-365-customer-lockbox-faqs.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows 365 Customer Lockbox provides Windows 365 customers with the ability to control what actions are taken on Cloud PCs within their Windows 365 estate.
It does **not** stop access to:
   - Azure Data Explorer (Kusto) telemetry
   - Assist 365 Graph calls
   - ASC log collection or analysis
It controls only a specific set of actions on Cloud PCs such as restart, reinstall of agents, reassignment of hostpool, etc. Full list of possible OCE actions: https://learn.microsoft.com/en-us/purview/audit-log-activities?view=o365-worldwide#windows-365-customer-lockbox-activities
**NOTE:** Customer Lockbox is **on by default** for all customers. This setting can be controlled via Microsoft 365 Admin Center, under Org Settings > Security & Privacy > Customer lockbox.
For customers to approve a lockbox request they need to be **Global Admin** or have the **Customer Lockbox access approver** role: https://learn.microsoft.com/en-us/office365/admin/add-users/about-admin-roles

## Scenario 14: Steps for support engineer
> 来源: ado-wiki-windows-365-customer-lockbox-faqs.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When requesting an OCE action from SaaF, inform the customer that lockbox approval will be required via the data access request blade in the Microsoft Admin portal. The request will contain the case number and a summary of the actions to be taken.
Customer can view requests at: https://admin.microsoft.com/AdminPortal/home#/support/CustomerDataAccessRequests

## Scenario 15: SaaF/Engineering Customer lockbox approval steps
> 来源: ado-wiki-windows-365-customer-lockbox-faqs.md | 适用: \u901a\u7528 \u2705

### 排查步骤
To carry out OCE actions on a tenant with CLB enabled, request elevation via Torus on SAW device:
1. Set workload: `Set-MyWorkload Windows365`
2. Confirm: `Get-MyWorkload`
3. Request elevation: `Request-ElevatedAccess_V2.ps1 -Role AccessToCustomerData -Reason "CloudPC Retargeting - ICM number" -Tenant [TenantID] -RequestNumber [CaseNumber] -DurationHours 4`
4. Wait for approval
5. Once approved, the request is active for **4 hours only** — perform the required OCE action within this window.
Once approved, an email is sent to the customer from azure-noreply@microsoft.com asking for lockbox approval.
