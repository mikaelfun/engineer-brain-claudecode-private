# Purview Fabric 与 Power BI 扫描 — 排查工作流

**来源草稿**: `ado-wiki-a-protection-policy-fabric.md`, `ado-wiki-allow-list-private-purview-fabric-onelake.md`, `ado-wiki-fabric-powerbi-scanning.md`
**Kusto 引用**: 无
**场景数**: 13
**生成日期**: 2026-04-07

---

## Scenario 1: Protection Policy support for Fabric
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
_Applies to_: Microsoft Purview Information Protection

This extended Protection Policy support will allow organizations to protect data assets labeled in Fabric workspaces via access control. Administrators can now create and assign a label to be used in Fabric workspaces that applies retain "Allow read" and/or "Allow full access" protection.

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 2: Timeline
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
| Milestone | Date |
| --------- | ---- |
| Preview | Oct 2024 |
| Worldwide | June 2025 |
| GCC | TBD |
| GCC High | TBD |
| DoD | TBD |

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 3: Pre-requisites
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
1. M365 E5 license (or equivalent) is required in the tenant and assigned to users.
2. Organization is already using the new Purview portal (purview.microsoft.com).
3. Microsoft Fabric is available (trial license can be obtained).

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 4: Label & Label policy creation
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
**NOTE:** If the tenant already has labels published with "Files & other data assets" scope, and Access control protection turned on, skip this section.

1. Go to https://purview.microsoft.com with administrator account.
2. Navigate to "Information Protection" solution page.
3. Ensure labels are scoped to **"Files & other data assets"** (may still show as "Files" in some tenants during UX rollout).
4. Ensure label has **"Control access"** (Access control) protection turned on.
5. Publish the label via a Label publishing policy. See: https://learn.microsoft.com/en-us/purview/create-sensitivity-labels#publish-sensitivity-labels-by-creating-a-label-policy

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 5: Creating a Protection policy scoped to Fabric
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
1. Navigate to "Protection policies (preview)" page under Information Protection.
2. Create a new protection policy.
3. Select the label (must have "Files & other data assets" scope AND "Access Control" protection).
4. Scope the label to Microsoft Fabric all workspaces.

**IMPORTANT:** Microsoft Fabric is mutually exclusive and cannot be used in conjunction with Azure and Amazon data sources. Create a separate Protection policy for other data sources.

5. Select access control protection type:
   - Allow users to retain read access
   - Allow users to retain full control
6. Turn the protection policy "on" to start protecting labeled assets.
7. Review configuration and create.

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 6: Fabric Configuration (Required)
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
Before protection policies can be applied, enable these admin settings:

1. **Fabric Admin portal** (app.powerbi.com/admin-portal): Enable "Information Protection > Allow users to apply sensitivity labels for content".
2. **Fabric Admin portal**: Enable all Microsoft Fabric settings:
   - Data Activator
   - Users can create Fabric items
   - Users can create Fabric environments
3. Ensure tenant has Fabric license or trial enabled.

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 7: Key Troubleshooting Points
> 来源: ado-wiki-a-protection-policy-fabric.md | 适用: 未标注

### 排查步骤
- If labels don't appear when creating Protection Policy → verify label scope includes "Files & other data assets" and "Access Control" is enabled.
- If protection not applying to Fabric items → verify Fabric Admin portal settings are enabled.
- Cannot combine Fabric with Azure/Amazon data sources in one policy → create separate policies.
- "Files" vs "Files & other data assets" label scope → same thing, UX string update rolling out.

`[来源: ado-wiki-a-protection-policy-fabric.md]`

---

## Scenario 8: Allow-List for Private Purview + Fabric OneLake Cx
> 来源: ado-wiki-allow-list-private-purview-fabric-onelake.md | 适用: 未标注

### 排查步骤
For cases regarding an "Allow-list" for Private Purview/Purview Data Map and Fabric OneLake you must ping a PM (**Sri Kutuva, srik@microsoft.com or Shafiq Mannan, shafiqul.mannan@microsoft.com**) and share the following information to them so they can create the request:

To allowlist a customer to use Fabric Lakehouse for DQ, we need the below information:

| Requestor | Tenant ID | Organization Name | Account Name | Account ID | Catalog ID | Region |
|--|--|--|--|--|--|--|

_Note: If your customer provides you the Tenant ID, you can check the logs for the remaining information:_

You can find that with this Kusto Query:
(Cx should always provide either TenantID or OrganizationName)

```kql
cluster('babylon.eastus2.kusto.windows.net').database("babylonMdsLogs").AccountInfo
|where tenantId == '<tenantID>'
```

Ensure the following:

- ReconciledStatus = Active
- AccountTier = EnterpriseTier

or

```kql
cluster('babylon.eastus2.kusto.windows.net').database("babylonMdsLogs").AccountInfo
|where OrganizationName contains "<CompanyName>"
```

`[来源: ado-wiki-allow-list-private-purview-fabric-onelake.md]`

---

## Scenario 9: Issues
> 来源: ado-wiki-fabric-powerbi-scanning.md | 适用: 未标注

### 排查步骤
-------------------------

*   **Scan failed with exceptions**: This is a general error, first try to involve the Data scan team to check why the scan has failed. If it is related to data source specific issues, please check the below logs.
*   **Scan failed/succeeded after taking a long time (for example, 5 days)**: Scan might be taking a lot of time in the discovery or classification or ingestion phase.
    *   Succeeded after long time: Check whether the number of assets to be discovered and ingested are huge. If the number is high, then it is expected that scan will take long time.
    *   If it is not the discovery phase which is taking the longest amount of time, involve the teams for which the scan is taking the highest amount of time.
Query to determine:

```
let _scanId = "5fd6a883-3f80-4af7-b69f-97b8f2d160c5";
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').CustomerFacingEvent
| where * contains _scanId
| extend parsedProperties = parse_json(properties)
| extend scanId = tostring(parsedProperties.scanResultId)
| project PreciseTimeStamp, resultType, resultDescription, properties
```

*   **Some files are not appearing in the scanned assets**: Scan did not ingest this file, could happen when the scan could not discover this file correctly.
*   **Auth issues**: For Fabric, Scan calls different Fabric apis and SDK to gather the metadata and lineage. Auth issues generally happen when CX has not provided enough permissions while running the scan.
*   Hidden columns in Fabric scanned to Purview - this is **expected behavior**. Hiding the column in fabric is a standalone UI feature in fabric. Purview scans underlying schema where it is still present.

Identification
--------------

Run below script to identify what all issues are there in scan (update the cluster according to the Purview region).

```
cluster('purviewadxcc.canadacentral.kusto.windows.net').database('DataScanLogs').DataScanAgentLinuxEvent
| where ScanResultId == '90d2a045-c354-4f5a-a52c-8400674c45d5'
| where Level == 2
| where Message !contains "[LogId:"
| project Source, Level, Message
```

`[来源: ado-wiki-fabric-powerbi-scanning.md]`

---

## Scenario 10: Non-Service Principal Auth Issue
> 来源: ado-wiki-fabric-powerbi-scanning.md | 适用: 未标注

### 排查步骤
Currently, Fabric lakehouse metadata and lineage is supported with service principal auth only. If user complaints, lakehouse tables or files data are not appearing then check whether customer is using service principal auth or some other auth mechanism.

Query to check the auth type:

```
let _scanResultID = "5799a6d9-6181-4741-a9a7-f42b4f36db01";
cluster('https://catalogtelemetrykusto.eastus.kusto.windows.net').database('Scan').GetScanAgentLinuxEvent(_scanResultID)
| where Message contains "credential kind"
| project Message
```

> Note: In this scenario, ask the customer to switch to service principal auth and re-run the scan.

`[来源: ado-wiki-fabric-powerbi-scanning.md]`

---

## Scenario 11: Auth issues
> 来源: ado-wiki-fabric-powerbi-scanning.md | 适用: 未标注

### 排查步骤
First thing is to ensure that the user has provided all the permissions to the credentials as per this document: [Connect to your Microsoft Fabric tenant in same tenant as Microsoft Purview (preview)](https://learn.microsoft.com/en-us/purview/register-scan-fabric-tenant?context=%252Ffabric%252Fgovernance%252Fcontext%252Fcontext-purview&tabs=Scenario1).

| Category | Owner | Action |
| --- | --- | --- |
| Forbidden/Unauthorized issue for a table artifact/URI | Fabric team (Fabric SDK Scanner) | Involve and share the logs to Fabric CSS and Engineering team to look into the issue. |
| Forbidden/Unauthorized issue for a file artifact/URI | Fabric team (Onelake/ADLS Gen 2) | Involve and share the logs to Fabric CSS and Engineering team to look into the issue. |
| Error: `MoveNextHandlerAsync: Error fetching next value from enumerator. Value cannot be null. (Parameter 'clientSecret')` | Customer | Ask customer to switch to service principal auth. |

`[来源: ado-wiki-fabric-powerbi-scanning.md]`

---

## Scenario 12: Other issues
> 来源: ado-wiki-fabric-powerbi-scanning.md | 适用: 未标注

### 排查步骤
| Category | Owner | Action |
| --- | --- | --- |
| Logs starting with: `[Microsoft.Fabric.Arctic.Scanner]` and Level == 2 | Fabric team (Fabric SDK Scanner) | Involve and share the logs to Fabric CSS and Engineering team. Transfer ICM to OneLake/OneLakeCore team. |
| Null reference exception in NumRecords | Fabric team (Fabric SDK Scanner) | Handled by catch clause, should not prevent entity publishing. If NumRecords is required, transfer IcM to OneLake/OneLakeCore team. |
| Null reference exception for lakehouse tables | Fabric team (Fabric SDK Scanner) | Involve Fabric CSS and Engineering team. Transfer ICM to OneLake/OneLakeCore team. |
| Issue related to parquet files | Customer/Datasource team/Fabric onelake team | Check known limitations for parquet. If not a known limitation, involve datasource team. |
| Ingestion failure for JPG/Jar/Gzip | Known issue | Currently not supported. |
| DAX expressions not coming | Limitation | Currently not supported. |
| QualifiedNamePatternNotMatch error for fabric_lakehouse | Nonfunctional Bug | Bug 4116866 Fix invalid FQN errors in fabric scanning. Ping EEE for additional information. |
| Hidden columns in Fabric scanned to Purview | Expected Behavior | Hiding is a Fabric UI feature; Purview scans underlying schema. |

`[来源: ado-wiki-fabric-powerbi-scanning.md]`

---

## Scenario 13: What to do from here?
> 来源: ado-wiki-fabric-powerbi-scanning.md | 适用: 未标注

### 排查步骤
Reach out to Datasource oncall, if required create an ICM. Share:

1. Scan Result ID
2. Error logs from customer
3. Credential kind used by customer
4. Type of IR

`[来源: ado-wiki-fabric-powerbi-scanning.md]`

---
