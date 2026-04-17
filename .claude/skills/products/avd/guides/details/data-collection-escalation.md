# AVD 数据收集与升级流程 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Drafts fused**: 15 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-assist-365-request-access.md, ado-wiki-assist365-usage.md, ado-wiki-css-saaf-cat-collaboration-escalation-flows.md, ado-wiki-escalation-workflow-w365.md, ado-wiki-extra-goodies-scripts-powershell-python.md, ado-wiki-msrd-collect.md, ado-wiki-sfi-compliance.md, ado-wiki-share-customer-data-with-pg.md, ado-wiki-vm-os-dump-from-azure-host.md, ado-wiki-w365-css-mcaps-subscription-lab.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cloud PC VM fails to boot or stuck on restarting | Azure Host level changes - VMs running in certain Cluster or... | Engage RDOS DRI (OCE) via IcM to capture memory dump. Get No... |
| AccessDenied error when performing Inspect IaaS Disk log col... | VM not pinned to the DfM case in Azure Support Center | Pin the VM to the case using Resource Explorer (Step 6 in AS... |
| Windows 10/11 Enterprise multi-session OS on AVD VM gets dow... | The VM gets activated/reactivated by a customer custom KMS s... | 1) Confirm the customer is using their own KMS server. 2) Th... |
| AVD agent process crashing with Event ID 1000 in Application... | Agent crashes can be misleading - often caused by underlying... | 1) Collect MSRD-Collect and check Event ID 1000s. 2) First v... |
| Azure AD joined Windows 11 AVD VMs: users get 'The sign-in m... | AVD VMs deployed via Intune never got into managed state. In... | Ensure machines are successfully provisioned and managed in ... |
| Users trying to login to Azure AD VMs get error: "The sign-i... | AVD VMs deployed using Intune had broken settings. Provision... | Engage internal Intune team. Ensure machines are successfull... |
| Error SubscriptionNotRegisteredForFeature when creating Publ... | Subscription not registered for Microsoft.Network/AllowBring... | 1. Register subscription for AllowBringYourOwnPublicIpAddres... |

### Phase 2: Detailed Investigation

#### Assist 365 - How to Request Access
> Source: [ado-wiki-assist-365-request-access.md](guides/drafts/ado-wiki-assist-365-request-access.md)

1. Login to physical or virtual SAW

#### Assist 365 - How to Use
> Source: [ado-wiki-assist365-usage.md](guides/drafts/ado-wiki-assist365-usage.md)

Request access first (see Assist 365 access request guide).

#### CSS - SaaF - CAT Collaboration and Escalation Flows
> Source: [ado-wiki-css-saaf-cat-collaboration-escalation-flows.md](guides/drafts/ado-wiki-css-saaf-cat-collaboration-escalation-flows.md)

The CSS (Customer Service & Support) team focuses on providing exceptional support and service to customers.

#### Escalation Workflow for Service Engineers, W365 Rangers, and SaaF
> Source: [ado-wiki-escalation-workflow-w365.md](guides/drafts/ado-wiki-escalation-workflow-w365.md)

2. Engineer assigned, contacts customer to scope issue

#### Microsoft has a clear rule when it comes to customers requesting assistance with scripts
> Source: [ado-wiki-extra-goodies-scripts-powershell-python.md](guides/drafts/ado-wiki-extra-goodies-scripts-powershell-python.md)

Support for building and fixing scripts is not in scope!

#### MSRD-Collect (Microsoft Remote Desktop Collect)
> Source: [ado-wiki-msrd-collect.md](guides/drafts/ado-wiki-msrd-collect.md)

PowerShell script for collecting diagnostic data for AVD, RDS, and Windows 365 Cloud PC troubleshooting.

#### Public IP Addresses
> Source: [ado-wiki-sfi-compliance.md](guides/drafts/ado-wiki-sfi-compliance.md)

In May 2024, Microsoft CEO Satya Nadella made security the company's top priority, with the Secure Future Initiative (SFI) highlighted as the way we will drive progress toward greater security and res

#### How to Share Customer Data with CPC PG
> Source: [ado-wiki-share-customer-data-with-pg.md](guides/drafts/ado-wiki-share-customer-data-with-pg.md)

- Add PII into ICM (email, UPN, etc.)

#### General Steps to get VM OS Dump from Azure Host (Deprecated)
> Source: [ado-wiki-vm-os-dump-from-azure-host.md](guides/drafts/ado-wiki-vm-os-dump-from-azure-host.md)

CPC VM encounters bootup issue and customer requests RCA.

#### CSS MCAPS Subscription Lab (W365)
> Source: [ado-wiki-w365-css-mcaps-subscription-lab.md](guides/drafts/ado-wiki-w365-css-mcaps-subscription-lab.md)

## CSS Azure Subscription Management

#### W365 Lab using Visual Studio (FTE) Benefit Subscription
> Source: [ado-wiki-w365-lab-visual-studio-subscription.md](guides/drafts/ado-wiki-w365-lab-visual-studio-subscription.md)

Guide for setting up a Windows 365 test lab using Microsoft FTE Visual Studio Enterprise subscription ($150/month Azure credit).

#### SaaF CRI Review Process
> Source: [ado-wiki-w365-saaf-cri-review-process.md](guides/drafts/ado-wiki-w365-saaf-cri-review-process.md)

The WCX SaaF team performs a monthly review of ICM escalations (CRIs) to determine insights:

*Contains 4 KQL query template(s)*

#### Windows Error Dump Collection
> Source: [ado-wiki-windows-error-dump.md](guides/drafts/ado-wiki-windows-error-dump.md)

1. Create registry key: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps`

#### Windows Performance Recorder (WPR) Logs Collection
> Source: [ado-wiki-wpr-logs-collection.md](guides/drafts/ado-wiki-wpr-logs-collection.md)

1. Download the Windows ADK from https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk

#### AVD Troubleshooting Overview & Escalation Tracks
> Source: [mslearn-setup-overview-escalation.md](guides/drafts/mslearn-setup-overview-escalation.md)

> Source: [Troubleshooting overview, feedback, and support for Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-overview)

### Key KQL Queries

**Query 1:**
```kql
cluster('cpcsre.eastus.kusto.windows.net').database('SaaF').fn_GetW365SupportCase()
| where CreatedDateTime >= datetime(2023-07-01 00:00) and CreatedDateTime < datetime(2023-08-01 00:00)
| where InitialResponseQueueKey != 3447
| distinct CaseNumber
| count
```

**Query 2:**
```kql
cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
| where OwningTenantId == 27011 and OwningTeamId == 78675
| where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
```

**Query 3:**
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| extend Status = iff(OwningTeamName !contains "jarnold", "Transferred", Status)
| summarize count
```

**Query 4:**
```kql
let icmlist = cluster('icmcluster.kusto.windows.net').database('IcMDataWarehouse').Incidents
    | where OwningTenantId == 27011 and OwningTeamId == 78675
    | where CreateDate >= datetime(2023-08-01 00:00) and CreateDate < datetime(2023-09-01 00:00)
    | distinct IncidentId;
cluster('icmcluster.kusto.windows.net').database('IcmDataWarehouse').IncidentsSnapshotV2()
| where IncidentId in (icmlist)
| where OwningTeamName !contains "jarnold"
| extend OwningTeamName = case(
    OwningTeamName star
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cloud PC VM fails to boot or stuck on restarting | Azure Host level changes - VMs running in certain Cluster or Host version may hi... | Engage RDOS DRI (OCE) via IcM to capture memory dump. Get NodeId/ContainerId/VMI... | 🔵 7.5 | ADO Wiki |
| 2 | AccessDenied error when performing Inspect IaaS Disk log collection in ASC for W... | VM not pinned to the DfM case in Azure Support Center | Pin the VM to the case using Resource Explorer (Step 6 in ASC workflow) and refr... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 10/11 Enterprise multi-session OS on AVD VM gets downgraded to Enterpris... | The VM gets activated/reactivated by a customer custom KMS server using an activ... | 1) Confirm the customer is using their own KMS server. 2) The only supported fix... | 🔵 7.5 | ADO Wiki |
| 4 | AVD agent process crashing with Event ID 1000 in Application logs. Processes aff... | Agent crashes can be misleading - often caused by underlying INVALID_REGISTRATIO... | 1) Collect MSRD-Collect and check Event ID 1000s. 2) First verify NOT hitting IN... | 🔵 7.5 | ADO Wiki |
| 5 | Azure AD joined Windows 11 AVD VMs: users get 'The sign-in method you're trying ... | AVD VMs deployed via Intune never got into managed state. Intune compliance show... | Ensure machines are successfully provisioned and managed in Intune. Once machine... | 🔵 6.5 | KB |
| 6 | Users trying to login to Azure AD VMs get error: "The sign-in method you're tryi... | AVD VMs deployed using Intune had broken settings. Provisioned machines never go... | Engage internal Intune team. Ensure machines are successfully provisioned in Int... | 🔵 6.5 | KB |
| 7 | Error SubscriptionNotRegisteredForFeature when creating Public IP Address withou... | Subscription not registered for Microsoft.Network/AllowBringYourOwnPublicIpAddre... | 1. Register subscription for AllowBringYourOwnPublicIpAddress feature via SAW/AM... | 🔵 6.0 | ADO Wiki |
