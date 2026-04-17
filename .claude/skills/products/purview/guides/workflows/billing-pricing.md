# Purview 计费与定价 — 排查工作流

**来源草稿**: `ado-wiki-a-ame-access-setup.md`, `ado-wiki-a-billing-roadmap.md`, `ado-wiki-b-required-information-data-explorer.md`, `ado-wiki-b-support-boundaries-data-explorer.md`, `ado-wiki-billing-troubleshooting-guideline.md`, `ado-wiki-look-up-billing-charges.md`, `ado-wiki-migration-managed-to-ingestion-storage.md`, `ado-wiki-ms-security-copilot-offering.md`, `ado-wiki-security-options.md`
**Kusto 引用**: 无
**场景数**: 53
**生成日期**: 2026-04-07

---

## Scenario 1: Summary
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
This process is to assist engineers in gaining access to the AME environment. Having access to AME grants engineers the ability to access elevated tools (Geneva Actions (Jarvis), XTS, DS Console, CMS etc.) to perform required troubleshoot steps on customer resources thru SAW device or SAVM (Virtual SAW).

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 2: Create an AME account
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
1. From a SAW device or SAVM log into https://aka.ms/oneidentity (Select "@microsoft.com account" for auth).
2. Click on "Create / Manage user Account" under "User Accounts".
3. Select the AME domain from the domain dropdown.
4. Duplicate your current corporate user alias (e.g., if alias is "abcd", create AME domain user for "abcd").
   - If "(already exists)" appears next to it, you already have an AME account.
   - Keep "Unix Enabled" unchecked.

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 3: Request a YubiKey (Security Key)
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
1. Once your AME account has been created, request a YubiKey.
2. Browse to https://aka.ms/CloudMFARequest (can be done outside of SAW/SAVM).
3. Sign in, select "Security Key Services" and "Security Key Request".
4. Fill in:
   - Services: Azure (*ME Domains AME GME etc)
   - Domain Name: AME
   - Form-Factor: USB Device (USB-A is safest)
   - Replacement: No
   - On behalf of someone else: No
   - Delivery method depends on location (within 25 miles of Redmond → pickup; otherwise Office/Residential)
5. An ICM will be opened after submit. Wait for YubiKey to arrive.

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 4: After YubiKey arrives
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
Follow: **[(*ME) YubiKey Certificate Setup](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/YubiKey-Management.aspx#initial-setup%2C-yubikey-unblocking%2C-certificate-renewal%2C-resetting-the-yubikey)** under "Initial Setup, Yubikey Unblocking, Certificate Renewal, Resetting the Yubikey"

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 5: Join an AME Security Group
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
1. Using SAW/SAVM, navigate to https://aka.ms/oneidentity
2. Select "@ame.gbl account" and authenticate with AME certificate on YubiKey
3. Type group name next to "Group Name" and click Next
4. In "Members" section, enter your AME alias and click "Add Members"
5. Confirm your alias in the members list
6. Click "Modify" button
7. Select your TA as approver, enter justification, click "Ok"
8. Wait for approval confirmation

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 6: Purview POD AME Silos
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
- Open SAS Portal, navigate to SAW section > 'My Silos'
- Search for 'CloudEnterprise', click it, then 'Join Silo'
- Identity is your Corp identity (e.g., REDMOND\USER)
- Repeat for 'KustoExplorerSilo'
- For AME login with YubiKey, join 'CloudEnterpriseAME'

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 7: References
> 来源: ado-wiki-a-ame-access-setup.md | 适用: 未标注

### 排查步骤
- [AME Guide](https://strikecommunity.azurewebsites.net/articles/1014/ame-azure-management-environment.html)
- [SAS Portal](https://portal.sas.msft.net/sas/portal/)

`[来源: ado-wiki-a-ame-access-setup.md]`

---

## Scenario 8: Billing Features
> 来源: ado-wiki-a-billing-roadmap.md | 适用: 未标注

### 排查步骤
| # | Item | Squad | Status | Biz Model Approval | Biz Model Operational | Comments |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Governed asset counting method | Catalog | DONE | - | - | Stay with current method (asset with governance concept directly applied) |
| 2 | Data asset with glossary term as governed asset | Catalog | With BP | 10/30/2025 | 12/1/2025 | PM/PMM/Finance making progress on biz model proposal |
| 3 | Data asset with DQ score as governed asset | Catalog | With BP | 10/17/2025 | 12/1/2025 | Preparing materials for final sign off |
| 4 | Run DQ on data assets | DQ | - | - | 12/1/2025 | Depends on finalizing plan for assets with DQ as governed asset |
| 5 | On-prem data quality | DQ | With BP | 10/30/2025 | 1/1/2026 | Propose new meter |
| 6 | Enhanced DEH report on all assets | DEH | - | TBD | TBD | Complete PM mockups, finalize migration strategy |
| 7 | Workflow | DEH | With BP | 10/30/2025 | TBD | Finalize COGS |
| 8 | Observability | DEH | With BP | TBD | TBD | Review COGS and biz model |
| 9 | Advanced resource set | Catalog | With BP | 10/30/2025 | 1/1/2026 | ~600 customers have ARS enabled (using for free) |
| 10 | DQ in Fabric billed through F-SKU | - | - | TBD | TBD | Waiting for UX and architecture alignment |
| 11 | Un-subsume data map and scan meters | Data map/Scan | With BP | TBD | TBD | Plan to complete COGS |
| 12 | Manual BCDR | All | - | TBD | TBD | Ensure customers pay for secondary Purview account |
| 13 | Tag usage with workload/sub-workload | All | DONE | - | 10/6/2025 | DQ/DEH completed on 9/30 |

`[来源: ado-wiki-a-billing-roadmap.md]`

---

## Scenario 9: Notes
> 来源: ado-wiki-a-billing-roadmap.md | 适用: 未标注

### 排查步骤
- Dates are internal targets, not customer-facing.
- Business model needs approval 4 months prior to operational for new meters.
- New meter operational is on the 1st of the month.

`[来源: ado-wiki-a-billing-roadmap.md]`

---

## Scenario 10: Required Information: Data Explorer
> 来源: ado-wiki-b-required-information-data-explorer.md | 适用: 未标注

### 排查步骤
When creating an escalation, please get this information:

- Describe what is the expected vs actual Behavior
- A screenshot or [recording](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9072/How-to-Capture-a-recording-of-an-issue) of the issue 
- A [network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace) of the issue 
   - If the issue is in  the portal, collect har log or Fiddler trace
   - If the issue is with Export-ContentExplorerData PowerShell command, collect Fiddler trace (not har log) while running the command with -**Verbose** parameter to get more detailed error information.
- A copy of the affected file
- Information regarding the item for which the activity was performed
  - If SPO/ODB Document: [Document Path](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8938/How-to-Get-the-document-path-of-a-document-in-SharePoint-or-OneDrive)
  - If an Exchange email: [email message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-1%3A-get-the-message-id-of-the-email)
  - If a Teams message: [Teams message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8950/How-to-Get-the-message-id-of-a-Teams-message)
  - If Endpoint: [Client Analyzer](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8950/How-to-Get-the-message-id-of-a-Teams-message) of the issue reproduction

`[来源: ado-wiki-b-required-information-data-explorer.md]`

---

## Scenario 11: Support Boundaries: Data Explorer
> 来源: ado-wiki-b-support-boundaries-data-explorer.md | 适用: 未标注

### 排查步骤
| Support Topic | Workload | Support Owner | DfM Support Area Path (SAP) | Comments | Links / TSG |
| ----------------- | ------------ | ----------------- | ------------------------------- | ------------ | --------------- |
| Data Explorer | Microsoft Purview Information Protection | Compliance | Security/Microsoft Purview Compliance/Label Analytics | | [Data Explorer TSG](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9026/Troubleshooting-Scenarios-Data-Explorer) |

`[来源: ado-wiki-b-support-boundaries-data-explorer.md]`

---

## Scenario 12: Note
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
Classic Billing Model applies only to users still using Classic Microsoft Purview who have not consented to the New Billing Model. For New Billing Model, refer to: https://learn.microsoft.com/en-us/purview/data-governance-billing

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 13: Classic Billing Overview
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
Purview billing components:
- **Storage** - ~$300 for every 10 GB metadata storage
- **Scanning** - Longer scan duration = more charges
- **Asset Search and Update** - REST API calls, SDKs, lineage extraction
- **Resource Sets** - Enabling "Advanced Resource Sets" incurs more costs

4 Kusto components: Scanning Service, Insights Service, Ingestion Service, Data Map

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 14: Information Needed for Escalation
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
- CU and Storage Size Monitoring UI from Purview in Azure Portal
- Cost Analysis from Cost Management Center Portal
- Resource ID
- Specific meter ID causing the issue

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 15: Billing Service Query
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
```kusto
BillingLogEvent
| where ResourceId == "<customer_ResourceId>"
| summarize sum(Quantity) by Component
| order by Component
```

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 16: Breakdown by Day
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
```kusto
let accountName = "<account_name>";
let billingMonth = datetime(2025-01-01);
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').BillingLogEvent
| where tolower(ResourceId) endswith tolower(accountName)
| where todatetime(EventDateTime) > billingMonth and todatetime(EventDateTime) < datetime_add('month', 5, billingMonth)
| summarize sum(Quantity), count() by MeterId, bin(['time'], 1d)
```

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 17: Action Plan: High Data Map Quantity (CU)
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
- Check metadata storage size in Azure Portal (Purview account > Overview)
- 1 CU = 10GB metadata, ~$300/month per CU
- If metadata is root cause -> advise customer to reduce by deleting assets

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 18: Action Plan: High Ingestion Service Quantity
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
Ingestion affected by:
- **Scanning** - More assets discovered = more ingestion
- **Lineage** - Source can be scan or ADF/Synapse

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 19: Troubleshooting ADF/Synapse Ingestion
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
```kusto
BillingLogEvent
| where MeterId == "811e3118-5380-5ee8-a5d9-01d48d0a0627"
| where SubscriptionId == "<sub_id>"
| where AccountId == "<account_id>"
| extend Source = tostring(parse_json(AdditionalProperties).Source), Month = monthofyear(['time'])
| summarize sum(todouble(Quantity)) by Month, Source, Component
```

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 20: Troubleshooting Lineage Charges
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
1. Check Monitor Links in Purview portal for asset/relationship ingestion counts
2. If high ingestion found, check ADF/Synapse connection to Purview
3. Customer can stop lineage by disconnecting the connection

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 21: Q&A
> 来源: ado-wiki-billing-troubleshooting-guideline.md | 适用: 未标注

### 排查步骤
- **Pricing vs Billing**: Pricing questions -> PM/BP team. Billing charge questions -> Engineering team.
- **Identifying ADF jobs causing charges**: Only Copy Activity and Data Flow Activity push lineage. Check ADF Monitor > Pipeline Run, or use Monitor Links in Purview.
- **Synapse connection check**: Synapse > Manage > Microsoft Purview

`[来源: ado-wiki-billing-troubleshooting-guideline.md]`

---

## Scenario 22: Billing Overview
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
Detailed Pricing information: https://azure.microsoft.com/en-us/pricing/details/purview/

Direct and indirect costs: https://learn.microsoft.com/en-us/azure/purview/concept-guidelines-pricing

Best Practices for Scanning (cost optimization): https://learn.microsoft.com/en-us/azure/purview/concept-best-practices-scanning

When a customer provisions a Purview account, the first 1MB in the Data Map is free. Fixed cost: $300/month for 1 CU (always on, no pause functionality).

Billing is mainly composed of 4 components: **Scanning Service, Insights Service, Ingestion Service, Data Map**.

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 23: Information Needed for Escalation
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
- CU and Storage Size Monitoring UI from Purview in the Azure Portal
- Cost Analysis in the Cost Management Center Portal
- Resource ID (e.g., `/subscriptions/XXX/resourceGroups/my-group/providers/Microsoft.Purview/accounts/my-purview`)

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 24: Check Which Service Billing Charge is Too High
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kusto
BillingLogEvent
| where ResourceId == "<customer_Full ResourceURI>"
| summarize sum(Quantity) by Component
| order by Component
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 25: Action Plan: Data Map (Catalog/CU) Charges Too High
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
Check metadata size in Azure Portal → 1 Capacity Unit = 10GB metadata (~$300/month per CU). If metadata size is root cause, reduce by deleting unused assets.

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 26: Action Plan: Ingestion Service Charges Too High
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
Usually caused by ADF, Synapse, or Power BI pushing lineage to Purview without customer awareness. Verify in Purview Studio (Monitor > Data Map Population). Disconnect lineage connection if needed: https://learn.microsoft.com/en-us/azure/synapse-analytics/catalog-and-governance/quickstart-connect-azure-purview

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 27: General Query: Scanning Cost by Date
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kusto
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| summarize round(sum(Quantity),2) by Meter, CatalogName, OrganizationName, TPID, date_time
| sort by date_time asc
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 28: Visualize Changes in Charges by Account
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kql
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-12-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| summarize sum(Quantity) by bin(TIMESTAMP,5m), Meter
| render timechart
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 29: Calculate Scan Service Billing by Scan Result ID
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kql
let accountName = "";
let scanResultId = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
iff(MeterId contains "811e3118-5380-5ee8-a5d9-01d48d0a0627", "Scanning - Charged",
iff(MeterId contains "5d157295-441c-5ea7-ba7c-5083026dc456", "Scanning - Free SQL/PBI",
iff(MeterId contains "053e2dcb-82c0-5e50-86cd-1f1c8d803705", "Scanning - Free SQL/PBI",
iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other"))))))
| where IsInternal != 1
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
| where AccountName == accountName
| extend date_time = format_datetime(TIMESTAMP, 'yyyy-MM-dd')
| where Meter == "Scanning - Charged"
| where Component == "Scanning Service"
| where AdditionalProperties contains scanResultId
| summarize round(sum(Quantity),2) by Meter, CatalogName, OrganizationName, TPID, date_time
| sort by date_time asc
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 30: Correlate Insights Charges
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kql
let accountName = "";
let subId = "";
let startdate = datetime(2023-09-01);
let enddate = datetime(2024-01-11);
BillingLogEvent
| lookup (AccountInfo) on SubscriptionId
| extend resourceIdArr = split(ResourceId, "/")
| extend CatalogName = tostring(resourceIdArr[8])
| extend Meter = iif(MeterId contains "0745df0d-ce4f-52db-ac31-ac574d4dcfe5", "Data Map",
    iff(MeterId contains "8ce915f7-20db-564d-8cc3-5702a7c952ab", "Insights Service",
    iff(MeterId contains "7ce2db1d-59a0-5193-8a57-0431a10622b6","Insights ?","other") ) )
| where IsInternal != 1
| where TIMESTAMP between (startdate .. enddate)
| where SubscriptionId == subId
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 31: Scan Charges - Identify Scan Name
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
Use correlation ID from BillingLogEvent AdditionalProperties to map to GatewayEvent:

```kql
let corrId = "";
let accountName = "";
let scanId = "";
let subId = "";
GatewayEvent
| where AccountName == accountName
| where CorrelationId == corrId
| project AccountName, Source, PreciseTimeStamp, RequestId, Status, CorrelationId, CallerObjectId, Message, Query
```

```kql
let scanId = "";
ScanningLog
| where ScanResultId == scanId
| where * contains "Enq"
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 32: Ingestion Charges - Identify Source
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kql
let accountName = "";
let ingestionId = "";
GatewayEvent
| where * contains accountName
| where TIMESTAMP between (datetime(2023-02-24) .. datetime(2023-02-25))
| where * contains ingestionId
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 33: Ingestion Charges from ADF - Identify Pipeline
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
```kql
let resourceId = "";
let startTime = datetime();
let endTime = datetime();
BillingLogEvent
| where ResourceId == resourceId
| where TIMESTAMP between (startTime .. endTime)
| extend AdditionalProperties_json = parse_json(AdditionalProperties)
| extend IngestionJobId = tostring(AdditionalProperties_json.IngestionJobId)
| extend Source = tostring(AdditionalProperties_json.Source)
| extend Hours = toreal(AdditionalProperties_json.Hours)
| project ['time'], IngestionJobId, Quantity, Source, Hours
| where Source == "DataFactory"
| join kind=leftouter (OnlineTierIngestionDetails | where Message startswith "Ingestion job context: SourceName"| project Message, IngestionJobId | parse Message with * "SourceName" SourceName "SourcePath" SourcePath) on IngestionJobId
| summarize sum(Quantity), sum(Hours) by SourceName, SourcePath, bin(['time'], 1d)
| order by sum_Quantity
```

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 34: Unhappy Customer Due to Costs
> 来源: ado-wiki-look-up-billing-charges.md | 适用: 未标注

### 排查步骤
Update the Supportability Excel Spreadsheet (internal SharePoint link).

`[来源: ado-wiki-look-up-billing-charges.md]`

---

## Scenario 35: Background
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
- Accounts created **before Dec 15, 2023**: Blob/Queue private endpoints linked to **managed storage account** (visible in Azure portal).
- Accounts created **after Dec 15, 2023** (or API version 2023-05-01-preview+): Blob/Queue private endpoints linked to **ingestion storage** (hosted in Microsoft internal tenant, not visible to customers).

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 36: FQDN Change
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
Old (managed storage): `<StorageAccountName>.blob.core.windows.net` / `.queue.core.windows.net`
New (ingestion storage): `ingestioneus2eastusksqky.z29.blob.storage.azure.net`

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 37: Migration Process
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
Migration is conducted by the **platform team** (not self-service).

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 38: Important
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
- Small downtime during migration (handled by PG)
- Additional downtime post-migration if using private endpoints / managed VNet IR / SHIR with proxy
- Portal access NOT affected

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 39: Preparation Checklist
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
Gather for each Purview account:
1. Screenshot from networking settings
2. Screenshot from networking private endpoint
3. Screenshot from networking ingestion private endpoint
4. Types of Integration Runtime used in scans (Autoresolve/Managed VNet/SHIR)
5. Whether proxy is used with SHIR + bypass list config
6. Whether domain whitelisting is done on customer firewall
7. ADF/Synapse connection details to Purview for lineage

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 40: Post-Migration Steps
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
- Managed VNet IR → recreate and update all scans
- Recreate existing ingestion private endpoints
- Recreate ADF/Synapse ingestion private endpoints from ADF/Synapse side
- SHIR proxy bypass list → update system files with new FQDN
- Update firewall rules for new FQDN

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 41: DNS Zones
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
Ingestion PE remains in same private DNS zone: `privatelink.blob.core.windows.net` and `privatelink.queue.core.windows.net`

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 42: Limitation
> 来源: ado-wiki-migration-managed-to-ingestion-storage.md | 适用: 未标注

### 排查步骤
Synapse with Data Exfiltration Protection (DEP) enabled will NOT work with ingestion private endpoint.

`[来源: ado-wiki-migration-managed-to-ingestion-storage.md]`

---

## Scenario 43: MS Security Copilot Offering for Purview
> 来源: ado-wiki-ms-security-copilot-offering.md | 适用: 未标注

### 排查步骤
> Source: ADO Wiki — Apps - Data Governance / Troubleshooting Guides / MS Security Copilot Offering
> Quality: guide-draft (needs review)

`[来源: ado-wiki-ms-security-copilot-offering.md]`

---

## Scenario 44: Current Limitations
> 来源: ado-wiki-ms-security-copilot-offering.md | 适用: 未标注

### 排查步骤
Copilot for Purview currently ONLY supports **Data Security (Compliance)** skills:
- Insider Risk
- Communication Compliance
- DLP
- eDiscovery

**Data Governance is NOT supported** — on roadmap but no ETA.

`[来源: ado-wiki-ms-security-copilot-offering.md]`

---

## Scenario 45: How to Enable Copilot for Purview
> 来源: ado-wiki-ms-security-copilot-offering.md | 适用: 未标注

### 排查步骤
1. **Complete First Run Experience (FRE)** at `securitycopilot.microsoft.com` (for new tenants)
2. **Create Copilot capacity** in Azure — Global/Security admin checks: [Microsoft Copilot for Security Owner Settings](https://securitycopilot.microsoft.com/owner-settings)
3. **User must be a Contributor** on `securitycopilot.microsoft.com` to use Copilot in Purview

`[来源: ado-wiki-ms-security-copilot-offering.md]`

---

## Scenario 46: Customer Connection Program
> 来源: ado-wiki-ms-security-copilot-offering.md | 适用: 未标注

### 排查步骤
For customers wanting early access to roadmap features (under NDA):
- [aka.ms/joinccp](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR5n91RGSMY5MoMjm9pNflCtUMkMxWEJIVzhNSkRZRVg4S1ZQS0xBSEgxTSQlQCN0PWcu)

`[来源: ado-wiki-ms-security-copilot-offering.md]`

---

## Scenario 47: Resources
> 来源: ado-wiki-ms-security-copilot-offering.md | 适用: 未标注

### 排查步骤
- [Copilot for Security in Purview (YouTube)](https://www.youtube.com/watch?v=5WlLz7Q1pIY)
- [Harnessing the power of Generative AI (Tech Community)](https://techcommunity.microsoft.com/t5/security-compliance-and-identity/harnessing-the-power-of-generative-ai-to-protect-your-data/ba-p/4237729)

`[来源: ado-wiki-ms-security-copilot-offering.md]`

---

## Scenario 48: I. Public Purview to Public Data Source
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- Connection over secured public internet
- TLS 1.2+ used for HTTPS/TLS over TCP

`[来源: ado-wiki-security-options.md]`

---

## Scenario 49: 1. Private Endpoint
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- IPSec VPN or Azure ExpressRoute for on-prem → Azure
- SHIR on Azure VM or on-prem within the VNET

`[来源: ado-wiki-security-options.md]`

---

## Scenario 50: 2. Service Endpoint
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- Allow Trusted Resources for qualified Azure services (e.g., Key Vault)

`[来源: ado-wiki-security-options.md]`

---

## Scenario 51: 3. Managed VNet IR
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- Supported data sources only
- Setup: PE-enabled account → approve managed PEs → create managed PE for datasource + keyvault → scan

**Known Issue**: Azure Synapse Analytics — Allowed Trusted Services is NOT sufficient. Must add Firewall rule in Synapse Network.

`[来源: ado-wiki-security-options.md]`

---

## Scenario 52: III. Public Purview to Private Data Source
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- Purview = Trusted Azure Service
- Connect via Allow Trusted Services on data source
- If not supported: whitelist Purview Public IP or create NSG rule

`[来源: ado-wiki-security-options.md]`

---

## Scenario 53: IV. Private Purview to Public Data Source
> 来源: ado-wiki-security-options.md | 适用: 未标注

### 排查步骤
- Install SHIR on same VNET as Purview
- Key Vault needs: Public IP whitelist OR same VNet as SHIR
- Data source must qualify as Allowed Trusted Service
- Key Vault: Enable "Allow Trusted Azure Services" + add Secret for auth

Reference: [Azure Security baseline for Microsoft Purview](https://docs.microsoft.com/en-us/security/benchmark/azure/baselines/purview-security-baseline)

`[来源: ado-wiki-security-options.md]`

---
