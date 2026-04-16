# Entra ID Customer Lockbox — 排查工作流

**来源草稿**: ado-wiki-a-entra-lockbox-tenant-add-scenarios.md, ado-wiki-a-lockbox-kusto-queries.md, ado-wiki-a-lockbox-service-logging.md, ado-wiki-a-lockbox-workflow-in-pictures.md, ado-wiki-a-tsg-obtaining-pending-lockbox-consent-request.md, ado-wiki-b-how-to-enroll-tenant-in-customer-lockbox.md, ado-wiki-b-lockbox-runners.md, ado-wiki-b-tracking-lockbox-notification-emails.md, ado-wiki-e-Azure-Customer-Lockbox.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft Entra Customer Lockbox for Tenant Add Scenarios in ASC
> 来源: ado-wiki-a-entra-lockbox-tenant-add-scenarios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Login to ASC (https://azuresupportcenter.azure.com/)
- 2. Access the support case for the SRT tenant
- 3. Ensure ASC connects to the SRT tenant (verify in Tenant Explorer)
- 4. Click "Add Tenant" and enter the RT Tenant ID or Domain Name
- 5. A request for approval is sent to the case contact
- 6. Case contact receives an email with a link to the Microsoft Entra Portal approval page
- 7. From "Microsoft Support Access (Preview)" page, the request can be approved or rejected
- 1. Login to https://ms.portal.azure.com/#view/Microsoft_AAD_DXP/SupportRequestsList.ReactView
- 2. Open F12 debugger, click the Support Request ID
- 3. In Network tab, find the response for the support request

---

## Scenario 2: Customer Lockbox - Kusto Queries
> 来源: ado-wiki-a-lockbox-kusto-queries.md | 适用: Mooncake ✅ / Global ✅

### 关键 KQL 查询
```kql
ResourceAccessGrant
| where PreciseTimeStamp > ago(30d)
| where Operation == "PolicyEvaluated"
| where ResourceDetail contains "<IsCustomerApprovalRequired>true</IsCustomerApprovalRequired>"
| where ResourceDetail contains "Microsoft.WindowsAzure.Wapd.Acis.AccessControl.ACSResourceNode"
| join kind=inner RequestProcess on RequestId
| project PreciseTimeStamp, HostName, RequestId, Requestor, WorkItemSource, WorkItemId, ResourceId, ResourceDetail
```
`[来源: ado-wiki-a-lockbox-kusto-queries.md]`

```kql
ResourceAccessGrant
| where PreciseTimeStamp > ago(90d)
| where PreciseTimeStamp < ago(60d)
| where Operation == "PolicyEvaluated"
| where ResourceDetail contains "<IsCustomerApprovalRequired>true</IsCustomerApprovalRequired>"
| where ResourceDetail contains "Microsoft.WindowsAzure.Wapd.Acis.AccessControl.ACSResourceNode"
| join kind=inner RequestProcess on RequestId
| project PreciseTimeStamp, HostName, RequestId, Requestor, WorkItemSource, WorkItemId, ResourceId, ResourceDetail
| where Requestor != "lockboxrunner@microsoft.com" and Requestor != "lockboxrunnerv@microsoft.com"
| distinct RequestId
```
`[来源: ado-wiki-a-lockbox-kusto-queries.md]`

```kql
<JIT table>
| where PreciseTimeStamp >= ago(1d)
| where Role == "JITProcessorWorkerRole"
| where Requestor != "jitrp@microsoft.com"
| where Requestor != "jitrv@microsoft.com"
| where RequestId == "<request-id>"
```
`[来源: ado-wiki-a-lockbox-kusto-queries.md]`

---

## Scenario 3: TSG: Obtaining Pending Consent Request Details for Azure Lockbox
> 来源: ado-wiki-a-tsg-obtaining-pending-lockbox-consent-request.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps to Get Request Details**
   - 1. Open the case in Azure Support Center
   - 2. Browse to the blade in ASC where the **Pending customer approval** message is displayed
   - 3. Using your browser's Developer Tools (F12 -> Developer Tools) open the Network blade to start a HAR trace

---

## Scenario 4: How to Enroll a Tenant in Customer Lockbox and Test
> 来源: ado-wiki-b-how-to-enroll-tenant-in-customer-lockbox.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Collect Tenant ID and written approval from a valid Global Admin
- 2. In ASC, click the warning icon on the right and select the **"Customer Lockbox"** template
- 3. The template will autocomplete most information
- 4. Confirm the Tenant ID and specify that written approval is appended to case notes
- 5. Submit the ICM
- 1. Request access to customer information via ASC
- 2. The Tenant Admin must approve the request in the Azure Portal
- 3. Requests expire after **12 hours** if not approved
- 4. After approval, customer data should be visible in ASC

---

## Scenario 5: Customer Lockbox - Lockbox Runners Management
> 来源: ado-wiki-b-lockbox-runners.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to https://jarvis-west.dc.ad.msft.net/
- 2. Click **Manage** → **Logs** → **Runners**
- 3. Select **Diagnostics Prod** and **lockbox** as Logs account
- 4. Go to the **Runners** tab
- 5. Right-click individual runner instances to **start/stop** them and to view runner logs

---

## Scenario 6: Customer Lockbox - Tracking Notification Emails
> 来源: ado-wiki-b-tracking-lockbox-notification-emails.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Lockbox Logs**
   - Identify the number of reviewers and their details from Lockbox logs.
2. **Step 2: RAE Logs**
   - Query RAE logs to find:
   - `emailOperationId` — used to track in IGANTF
   - Recipient IDs — who the email was sent to
3. **Step 3: IGANTF Logs**
   - Query with `lockboxrequestId` or `emailOperationId` (from RAE logs):
   - **Endpoint**: DiagnosticsProd
   - **Namespace**: IGANTFProd
4. **Step 4: AEO Portal**
   - Track email delivery status using 4 methods:

---
