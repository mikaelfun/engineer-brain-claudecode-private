# Entra ID PowerShell Management — 排查工作流

**来源草稿**: ado-wiki-a-aad-roles-csv-export-powershell.md, ado-wiki-c-applications-experience-powershell-mg-graph-examples.md, ado-wiki-c-repadmin-powershell-forest-replication-health.md, ado-wiki-d-copilot-powershell-script-assistance.md, ado-wiki-f-azure-ad-administrative-units-powershell.md, ado-wiki-f-powershell-modules-deprecation-retirement.md, ado-wiki-f-powershell-tips-and-tricks.md, onenote-ca-block-powershell-non-gui-appids.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: AAD Roles CSV Export (All, Groups, Users, Service Principals) PowerShell Script
> 来源: ado-wiki-a-aad-roles-csv-export-powershell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Download script "UI Export AAD Roles v3.ps1" (distributed as .ps1.txt; remove .txt extension)
- 2. From PowerShell: `& ".\UI AAD Roles CSV report.ps1"` (the & prefix is required)
- 3. Sign in, then select export type: All Roles / All Groups / All Users / All Service Principals
- 4. Click OK; when complete, save the generated CSV file

---

## Scenario 2: ... (export cert, build keyCredentials JSON payload, PATCH via Invoke-MgGraphRequest)
> 来源: ado-wiki-c-applications-experience-powershell-mg-graph-examples.md | 适用: Mooncake ✅ / Global ✅

### 相关错误码: AADSTS700213

---

## Scenario 3: Task - Use repadmin and PowerShell to view forest-wide Active Directory (AD) replication health
> 来源: ado-wiki-c-repadmin-powershell-forest-replication-health.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - Open a PowerShell prompt and type the following commands, and then press ENTER:
   - Repadmin /showrepl * /csv | convertfrom-csv | out-gridview

---

## Scenario 4: Feature overview
> 来源: ado-wiki-d-copilot-powershell-script-assistance.md | 适用: Mooncake ✅

---

## Scenario 5: Summary
> 来源: ado-wiki-f-azure-ad-administrative-units-powershell.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Connect to <https://jarvis-west.dc.ad.msft.net/#/>
- 1.  **Endpoint** = Diagnostic PROD
- 2.  **Namespace** = msodsprod
- 3.  Set Date/Time to within a few minutes after the event and search -5 minutes.
- 4.  **Scoping condition**: ROLE == becwebservice
- 5.  **Filtering condition**: AnyField \> contains \> "AdministrativeUnit\_bcedc102-4ba5-4961-939b-bb1a1754d3ea"
- 2.  Copy the CorrelationID of an event that is found. Remove the Filter condition from the previous search and replace it with the CorrelationID copied from the previous trace results:
- 1.  **Filtering condition**: CorrelationID \> contains \> a0b995ac-d39b-41f6-bec8-8942a99e4b16
- 1.  Click the link below to request access to MSODS tracing in Kusto.
- 1.  [14114](https://ramweb/RequestAccess.aspx?ProjectID=14114) AAD Production MDS General Access (RO)(14114)

---

## Scenario 6: Blocking PowerShell Access via Conditional Access (Non-GUI App IDs)
> 来源: onenote-ca-block-powershell-non-gui-appids.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Ensure the PowerShell service principal exists: `Get-AzureADServicePrincipal -Filter "appId eq '1b730954-1685-4b74-9bfd-dac224a7b894'"`
- 2. If not, create it: `New-AzureADServicePrincipal -AppId $appId`
- 3. Set assignment required: `Set-AzureADServicePrincipal -ObjectId $sp.ObjectId -AppRoleAssignmentRequired $true`
- 4. Assign admin users via `New-AzureADServiceAppRoleAssignment`

---
