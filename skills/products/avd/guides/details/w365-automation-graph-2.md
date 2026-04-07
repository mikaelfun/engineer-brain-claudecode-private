# AVD W365 Graph API 自动化 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 3 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-automation-solutions.md, ado-wiki-cloudpc-retargeting-oce-api.md, ado-wiki-w365-power-state-events-query.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cannot delete assigned user from personal AVD session host v... | Azure portal does not provide UI option to remove assigned u... | Use PowerShell: 1. New-AzWvdRegistrationInfo to create token... |
| New-AzWvdApplicationGroup fails with 'must be in same locati... | Application group being created in different location than t... | Retrieve host pool location and create application group in ... |
| AVD auto scaling script (CreateOrUpdateAzAutoAccount.ps1) fa... | The AVD auto scaling setup script references the Global Azur... | 1. Verify the Log Analytics workspace endpoint uses .azure.c... |

### Phase 2: Detailed Investigation

#### Automation Solutions – Reference Links
> Source: [ado-wiki-a-automation-solutions.md](guides/drafts/ado-wiki-a-automation-solutions.md)

A collection of resources for ARM Templates, Bicep, DevOps Pipelines, REST API, and Terraform support scenarios.

#### CloudPC Retargeting OCE API
> Source: [ado-wiki-cloudpc-retargeting-oce-api.md](guides/drafts/ado-wiki-cloudpc-retargeting-oce-api.md)

Retargeting is the combination of unassign session host + reinstall RD agent + reassign session host. Use this OCE API for session host or RD agent related issues.

*Contains 1 KQL query template(s)*

#### Get Power State Events (Kusto Query)
> Source: [ado-wiki-w365-power-state-events-query.md](guides/drafts/ado-wiki-w365-power-state-events-query.md)

Check PowerOn/PowerOff actions and reasons for Cloud PC.

*Contains 1 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
let GetDataFrom = (clusterName:string) {
  cluster(clusterName).database('WVD').RDAgentMetadata
  | join kind=leftouter (cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DeviceEntity_MV)
    on $right.DeviceResourceId == $left.AzureResourceId
  | where HostInstance contains "<Managed Device Name>"
  | top 1 by Timestamp desc
  | project UniqueId, TenantId, HostInstance
};
GetDataFrom('rdsprodus.eastus2') | union GetDataFrom('rdsprodeu.westeurope') | union GetDataFrom
```

**Query 2:**
```kql
let CheckPowerActions = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where Day1 > Day2
| where env_time between (ago(Day1)..ago(Day2))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where * has CompanyID and Col1 !
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cannot delete assigned user from personal AVD session host via Azure portal. No ... | Azure portal does not provide UI option to remove assigned user from personal de... | Use PowerShell: 1. New-AzWvdRegistrationInfo to create token. 2. Get-AzWvdSessio... | 🟢 8.0 | OneNote |
| 2 | New-AzWvdApplicationGroup fails with 'must be in same location as associated Hos... | Application group being created in different location than the host pool | Retrieve host pool location and create application group in the same location. A... | 🔵 7.0 | MS Learn |
| 3 | AVD auto scaling script (CreateOrUpdateAzAutoAccount.ps1) fails with 'Invoke-Web... | The AVD auto scaling setup script references the Global Azure ODS endpoint (.ods... | 1. Verify the Log Analytics workspace endpoint uses .azure.cn suffix for Mooncak... | 🔵 6.5 | OneNote |
