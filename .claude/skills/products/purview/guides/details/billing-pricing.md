# Purview 计费与定价 -- Comprehensive Troubleshooting Guide

**Entries**: 17 | **Drafts fused**: 9 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-ame-access-setup.md](..\guides/drafts/ado-wiki-a-ame-access-setup.md), [ado-wiki-a-billing-roadmap.md](..\guides/drafts/ado-wiki-a-billing-roadmap.md), [ado-wiki-b-required-information-data-explorer.md](..\guides/drafts/ado-wiki-b-required-information-data-explorer.md), [ado-wiki-b-support-boundaries-data-explorer.md](..\guides/drafts/ado-wiki-b-support-boundaries-data-explorer.md), [ado-wiki-billing-troubleshooting-guideline.md](..\guides/drafts/ado-wiki-billing-troubleshooting-guideline.md), [ado-wiki-look-up-billing-charges.md](..\guides/drafts/ado-wiki-look-up-billing-charges.md), [ado-wiki-migration-managed-to-ingestion-storage.md](..\guides/drafts/ado-wiki-migration-managed-to-ingestion-storage.md), [ado-wiki-ms-security-copilot-offering.md](..\guides/drafts/ado-wiki-ms-security-copilot-offering.md), [ado-wiki-security-options.md](..\guides/drafts/ado-wiki-security-options.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-ame-access-setup.md

1. Step by Step Process for AME Access `[source: ado-wiki-a-ame-access-setup.md]`
2. Create an AME account `[source: ado-wiki-a-ame-access-setup.md]`
3. From a SAW device or SAVM log into https://aka.ms/oneidentity (Select "@microsoft.com account" for auth). `[source: ado-wiki-a-ame-access-setup.md]`
4. Click on "Create / Manage user Account" under "User Accounts". `[source: ado-wiki-a-ame-access-setup.md]`
5. Select the AME domain from the domain dropdown. `[source: ado-wiki-a-ame-access-setup.md]`
6. Duplicate your current corporate user alias (e.g., if alias is "abcd", create AME domain user for "abcd"). `[source: ado-wiki-a-ame-access-setup.md]`
7. Request a YubiKey (Security Key) `[source: ado-wiki-a-ame-access-setup.md]`
8. Once your AME account has been created, request a YubiKey. `[source: ado-wiki-a-ame-access-setup.md]`
9. Browse to https://aka.ms/CloudMFARequest (can be done outside of SAW/SAVM). `[source: ado-wiki-a-ame-access-setup.md]`
10. Sign in, select "Security Key Services" and "Security Key Request". `[source: ado-wiki-a-ame-access-setup.md]`

### Phase 2: Data Collection (KQL)

```kusto
BillingLogEvent
| where ResourceId == "<customer_ResourceId>"
| summarize sum(Quantity) by Component
| order by Component
```
`[tool: ado-wiki-billing-troubleshooting-guideline.md]`

```kusto
let accountName = "<account_name>";
let billingMonth = datetime(2025-01-01);
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').BillingLogEvent
| where tolower(ResourceId) endswith tolower(accountName)
| where todatetime(EventDateTime) > billingMonth and todatetime(EventDateTime) < datetime_add('month', 5, billingMonth)
| summarize sum(Quantity), count() by MeterId, bin(['time'], 1d)
```
`[tool: ado-wiki-billing-troubleshooting-guideline.md]`

```kusto
BillingLogEvent
| where MeterId == "811e3118-5380-5ee8-a5d9-01d48d0a0627"
| where SubscriptionId == "<sub_id>"
| where AccountId == "<account_id>"
| extend Source = tostring(parse_json(AdditionalProperties).Source), Month = monthofyear(['time'])
| summarize sum(todouble(Quantity)) by Month, Source, Component
```
`[tool: ado-wiki-billing-troubleshooting-guideline.md]`

```kusto
BillingLogEvent
| where ResourceId == "<customer_Full ResourceURI>"
| summarize sum(Quantity) by Component
| order by Component
```
`[tool: ado-wiki-look-up-billing-charges.md]`

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
`[tool: ado-wiki-look-up-billing-charges.md]`

```kusto
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
`[tool: ado-wiki-look-up-billing-charges.md]`

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
`[tool: ado-wiki-look-up-billing-charges.md]`

```kusto
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
`[tool: ado-wiki-look-up-billing-charges.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Customer wants to check if their Purview account has consented to the new Data G... | New pricing model requires explicit consent; without checkin... | Use Kusto query on babylon.eastus2.kusto.windows.net / babylonMdsLogs: 1) Query ... |
| Customer observes unexpected charges under 'Data Management Basic Data Governanc... | DGPUs are automatically spun up for Data Estate Health (DEH)... | Review the Data Health Billing Awareness guidance to understand DEH charges and ... |
| Customer reports billing spike caused by Purview Insights reports; AtlasAnalytic... | AtlasAnalytics job hits the default Platform Job Service (PJ... | 1) Query JobInfoEvent to find AtlasAnalytics JobId and confirm status. 2) If res... |
| Customer asks how to calculate VCoreHour consumption for a specific Purview scan | - | VCoreHour = numOfWorkers x defaultVCorePerWorker x scanRunTime(hours). numOfWork... |
| Customer billed for a scan that did not complete successfully (Classic Billing M... | If a scan fails after a partial run, the customer is still c... | Check the 'Assets discovered' field for the mentioned scan run ID. If non-zero, ... |
| Purview Ingestion Service billing charges unexpectedly high; customer does not h... | ADF, Synapse, or Power BI pushing lineage information to Pur... | Verify ingestion source in Purview Studio (Data Map > Monitor links). If lineage... |
| Customer requests CU (Capacity Unit) upgrade due to slow scan performance in Pur... | CU is usually NOT the root cause of scan performance issues.... | Do NOT immediately request CU upgrade. Investigation steps: 1) Check SHIR memory... |
| Customer requests to downgrade Purview CU (Capacity Unit) quota | CU downgrade functionality is not implemented in the platfor... | Inform customer that decreasing CU limit is NOT supported. Advise caution: once ... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer wants to check if their Purview account has consented to the new Data Governance billing mo... | New pricing model requires explicit consent; without checking, unclear if accoun... | Use Kusto query on babylon.eastus2.kusto.windows.net / babylonMdsLogs: 1) Query AccountInfo with ten... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FNew%20Pricing%20Model%3A%20Microsoft%20Purview%20Data%20Governance%20Enterprise%20Solution) |
| 2 | Customer observes unexpected charges under 'Data Management Basic Data Governance Processing Unit (D... | DGPUs are automatically spun up for Data Estate Health (DEH) operations, which p... | Review the Data Health Billing Awareness guidance to understand DEH charges and how to stop them. DE... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Estate%20Health%2FClarification%20on%20Data%20Management%20Basic%20Data%20Governance%20Processing%20Unit%20(DGPU)%20Charges%20Due%20to%20Data%20Estate%20Health%20(DEH)) |
| 3 | Customer reports billing spike caused by Purview Insights reports; AtlasAnalytics job stuck in Submi... | AtlasAnalytics job hits the default Platform Job Service (PJS) timeout of 1440 m... | 1) Query JobInfoEvent to find AtlasAnalytics JobId and confirm status. 2) If result shows only Submi... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Insights/Troubleshoot%20billing%20issues%20insights) |
| 4 | Customer asks how to calculate VCoreHour consumption for a specific Purview scan | - | VCoreHour = numOfWorkers x defaultVCorePerWorker x scanRunTime(hours). numOfWorkers = CUs specified ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FMicrosoft%20Purview%20Administration%2FHow%20To%2FHow-To%20FAQs) |
| 5 | Customer billed for a scan that did not complete successfully (Classic Billing Model) | If a scan fails after a partial run, the customer is still charged for the vCore... | Check the 'Assets discovered' field for the mentioned scan run ID. If non-zero, some assets were ing... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Purview%20Billing/Customer%20billed%20for%20an%20incomplete%20scan(Classic%20Billing%20Model)) |
| 6 | Purview Ingestion Service billing charges unexpectedly high; customer does not have many scanning jo... | ADF, Synapse, or Power BI pushing lineage information to Purview without custome... | Verify ingestion source in Purview Studio (Data Map > Monitor links). If lineage is the cause, disco... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FPurview%20Billing%2FBilling%20Refund%2FLook%20Up%20Billing%20Charges) |
| 7 | Customer requests CU (Capacity Unit) upgrade due to slow scan performance in Purview Data Map | CU is usually NOT the root cause of scan performance issues. Common actual root ... | Do NOT immediately request CU upgrade. Investigation steps: 1) Check SHIR memory utilization, 2) Ass... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FUser%20request%20for%20upgrading%20or%20downgrade%20CU%20quota) |
| 8 | Customer requests to downgrade Purview CU (Capacity Unit) quota | CU downgrade functionality is not implemented in the platform | Inform customer that decreasing CU limit is NOT supported. Advise caution: once CU is upgraded, it c... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FUser%20request%20for%20upgrading%20or%20downgrade%20CU%20quota) |
| 9 | Customer requests CU (Capacity Unit) upgrade for Purview Data Map due to perceived performance issue... | CU is usually NOT the root cause of performance issues. Common actual causes: in... | Investigate actual root cause before requesting CU upgrade: work with SME/PG in AVA, complete invest... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FUser%20request%20for%20upgrading%20or%20downgrade%20CU%20quota) |
| 10 | Customer reports unexpectedly high Purview billing charges (Classic Billing Model) | Classic Purview billing based on 4 components: Scanning Service, Insights Servic... | Run BillingLogEvent Kusto query (babylonMdsLogs) to identify which component: summarize sum(Quantity... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline) |
| 11 | Customer reports high Purview billing but few scanning jobs configured; unexpected ingestion charges... | ADF, Synapse, or PowerBI automatically pushing lineage to Purview. Only Copy Act... | Step 1: Check Monitor Links in Purview (Monitor > Scans > Links) for asset/relationship counts. Step... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline) |
| 12 | Need to check billing quantity for Purview Offline Tier (Resource Set) jobs to investigate vCore-hrs... | Offline Tier jobs (Resource Set meters) generate vCore-hrs charges that need ver... | Use PAV2 Kusto cluster (pav2data.eastus.kusto.windows.net). Access: 1) Follow onboarding guide, 2) J... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FGet%20Billing%20quantity%20for%20Offline%20Tier%20jobs) |
| 13 | Unexpectedly high Purview billing charges despite few scanning jobs configured | ADF, Synapse, or Power BI is pushing lineage information to Purview without cust... | Check Purview Monitor → Links to identify lineage sources and asset ingestion volume. Go to ADF acco... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline) |
| 14 | High Data Map capacity unit (CU) billing charges in Classic Purview | Large amount of metadata stored in Purview DataMap. 1 Capacity Unit stores up to... | Check metadata storage size in Azure Portal under Data Map Capacity Units monitoring. Use Kusto Bill... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline) |
| 15 | High Ingestion Service billing charges in Classic Purview | Excessive asset ingestion from scanning or lineage extraction (ADF/Synapse/Power... | Run BillingLogEvent Kusto query with MeterId filter to identify ingestion source (DataFactory vs sca... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline) |
| 16 | DGPU and governed assets billing metrics not visible in Azure portal when using Enterprise version o... | Billing instrumentation for Enterprise version does not expose consumption metri... | Feature gap (FR #2875): Use Classic Experience to view billing metrics. Enterprise billing metrics v... | 🔵 7.0 | ado-wiki |
| 17 | Cannot access Datamap and Unified Catalog in new portal. Error: Azure subscription must first be lin... | - | Engineering applied fix on Feb 24. Attach case to ICM 51000000913552. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |