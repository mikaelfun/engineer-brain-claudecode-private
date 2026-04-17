# AVD W365 第三方连接器 (Citrix/VMware/HP) - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 14 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-citrix-hdx-plus-resources.md, ado-wiki-b-hp-anyware-resources.md, ado-wiki-b-vmware-blast-resources.md, ado-wiki-citrix-connector-status-check.md, ado-wiki-citrix-hdx-connectivity-check.md, ado-wiki-citrix-hdx-license-status-check.md, ado-wiki-citrix-hdx-provision-status-check.md, ado-wiki-citrix-tenant-onboard-offboard-check.md, ado-wiki-hp-anyware-connectivity-status-check.md, ado-wiki-hp-anyware-provision-status-check.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| After removing Citrix connector from Intune, existing Cloud ... | By design: 7-day grace period exists after Citrix connector ... | This is expected behavior - 7 day grace period. Check extern... |
| VMware BLAST not enabled correctly on Cloud PC after onboard... | BLAST onboarding process failed or did not complete during i... | Remove VMware license from W365 node in VMware Cloud admin c... |
| Cannot connect to Cloud PCs using Citrix after reboot; machi... | After reboot, network profile does not switch to Domain Auth... | Check Microsoft-Windows-NetworkProfile-Operational.evtx to c... |
| Citrix app sharing session freezes for other participants wh... | Bug in Teams Slimcore VDI 2.0 on Citrix with VDA 2402 + CWA ... | Immediate workaround: stop and reshare the window. Permanent... |
| In Citrix VDI 2.0 environment, Teams app sharing sessions fr... | Bug in Citrix VDA 2402 + CWA 2309.1+ interaction with Slimco... | Stopping and resharing the window resolves the issue tempora... |
| DeviceLock policy (Max Inactivity Time Device Lock) not work... | Citrix VDA overrides the display-required state, preventing ... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACH... |
| RDClient as a Published Citrix App fails to do Feed Discover... | Citrix remote app uses InitialProgram RDP option to launch W... | PG confirmed WVD Client was not designed/tested for Citrix p... |
| When trying to activate Windows 11 client you may receive th... | Install was Azure Virtual Desktop (AVD) and it was configure... | Azure Virtual Desktop (AVD) must use Azure KMS hosts.&nbsp; ... |

### Phase 2: Detailed Investigation

#### Overview
> Source: [ado-wiki-b-citrix-hdx-plus-resources.md](guides/drafts/ado-wiki-b-citrix-hdx-plus-resources.md)

This page summarizes documentation for the Citrix HDX Plus feature from both Citrix and Microsoft sides.

#### Overview
> Source: [ado-wiki-b-hp-anyware-resources.md](guides/drafts/ado-wiki-b-hp-anyware-resources.md)

This page summarizes documentation for the HP Anyware feature from Microsoft side.

#### Overview
> Source: [ado-wiki-b-vmware-blast-resources.md](guides/drafts/ado-wiki-b-vmware-blast-resources.md)

This page summarizes documentation for the VMWare Blast feature from both VMWare and Microsoft sides.

#### Citrix Connector Status Check
> Source: [ado-wiki-citrix-connector-status-check.md](guides/drafts/ado-wiki-citrix-connector-status-check.md)

Customer will need to enable Citrix Cloud Connector in Microsoft Endpoint Manager before they can connect Azure Active Directory to Citrix Cloud.

*Contains 1 KQL query template(s)*

#### Citrix HDX Connectivity Status Check
> Source: [ado-wiki-citrix-hdx-connectivity-check.md](guides/drafts/ado-wiki-citrix-hdx-connectivity-check.md)

HDX protocol is enabled by default in Citrix HDX Plus scenario. If customer encountered HDX related connectivity issues, Citrix support will be the first-tier support for these issues.

#### Citrix HDX Plus License Status Check
> Source: [ado-wiki-citrix-hdx-license-status-check.md](guides/drafts/ado-wiki-citrix-hdx-license-status-check.md)

Customer will have both Citrix tenant **and** Azure tenant in Citrix HDX Plus scenario. Both Citrix license **and** Windows365 license are needed.

*Contains 1 KQL query template(s)*

#### Citrix HDX Plus Provision Status Check
> Source: [ado-wiki-citrix-hdx-provision-status-check.md](guides/drafts/ado-wiki-citrix-hdx-provision-status-check.md)

Citrix agent will install and be registered inside VMs as part of the general provisioning process.

*Contains 4 KQL query template(s)*

#### Citrix Tenant Onboard/Offboard Status Check
> Source: [ado-wiki-citrix-tenant-onboard-offboard-check.md](guides/drafts/ado-wiki-citrix-tenant-onboard-offboard-check.md)

Customer will need to connect to Azure tenant in Citrix Cloud console before they can assign Citrix license to customers.

*Contains 1 KQL query template(s)*

#### HP Anyware Connectivity Status Check
> Source: [ado-wiki-hp-anyware-connectivity-status-check.md](guides/drafts/ado-wiki-hp-anyware-connectivity-status-check.md)

HP Anyware protocol is enabled by default in HP scenario. If customer encountered HP related connectivity issues, HP support will be the first-tier support for these issues.

#### Overview
> Source: [ado-wiki-hp-anyware-provision-status-check.md](guides/drafts/ado-wiki-hp-anyware-provision-status-check.md)

The major difference from regular Cloud PC and 3rd party integrated Cloud PC is that connectivity will be established by 3rd party agent instead of AVD RD agent. And a 3rd party license will be assign

*Contains 7 KQL query template(s)*

#### Overview
> Source: [ado-wiki-hp-anyware-tenant-onboard-offboard-status.md](guides/drafts/ado-wiki-hp-anyware-tenant-onboard-offboard-status.md)

Customer will need to connect to Azure tenant in HP admin portal before they can assign HP license to customers.

#### Overview
> Source: [ado-wiki-vmware-blast-connectivity-status-check.md](guides/drafts/ado-wiki-vmware-blast-connectivity-status-check.md)

Blast protocol is enabled by default in VMWare Blast scenario. If customer encountered Blast related connectivity issues, VMWare support will be the first-tier support for these issues.

#### Azure Network Connection canary checks
> Source: [ado-wiki-vmware-blast-general-troubleshooting-tools.md](guides/drafts/ado-wiki-vmware-blast-general-troubleshooting-tools.md)

In product we provide a few troubleshooting tools to help customers identify issues that may impact Windows 365 experiences. These tools may also be used to support BLAST scenarios.

#### Overview
> Source: [ado-wiki-vmware-blast-provision-status-check.md](guides/drafts/ado-wiki-vmware-blast-provision-status-check.md)

VMWare agent will install and be registered inside VMs comparing with general provisioning process.

### Key KQL Queries

**Query 1:**
```kql
CloudPCEvent
| where env_time > ago(30d)
| where env_cloud_environment =~ "Prod"
| where ComponentName == "UpdateExternalPartnerSettingAsync" or ComponentName == "CreateExternalPartnerSettingAsync"
| where EventUniqueName == "UpdateExternalPartnerSetting" or EventUniqueName == "CreateExternalPartnerSetting"
| extend OperationTime = env_time
| project OperationTime, env_cloud_name, TenantId = AccountId, EnableConnector = Col2
| where TenantId contains "<Customer Azure Tenant Id>"
| sort by Operat
```

**Query 2:**
```kql
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_time > ago(3d)
| where env_cloud_environment =~ "Prod"
| where ComponentName == "UserClient"
| where * == "{UserID}" // UserID
| where AccountId contains "{TenantID}" // TID
| extend LicenseActionType = case(
    Col1 == "0", "Assign",
    Col1 == "1", "Unassign",
    Col1 == "2", "Refresh",
```

**Query 3:**
```kql
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where AccountId == "{TenantID}"
| where OtherIdentifiers contains "{UserID}"
| where EventUniqueName == "ExecuteStorageBlobRelatedRequestWithFallbackAsync(Ln: 155)"
| where OtherIdentifiers contains "Command execution finished, but failed because it returned a non-zero exit code"
| project env_time, A
```

**Query 4:**
```kql
let truncatedID = "{TruncatedId}";
union cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPC').CloudPCEvent,
      cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where Col1 == truncatedID
| project env_time, AccountId, ActivityId, Truncatedid = Col1, OtherIdentifiers
```

**Query 5:**
```kql
Provision_GetProvisionHistoryV2(ago(7d), now())
| mv-expand PostProvisionStepResults
| where (PostProvisionStepResults.stepName == 'InstallCitrixAgent')
    or (ActionType in ("InstallCitrixAgent", "UninstallCitrixAgent"))
| where isnotnull(PostProvisionStepResults.stepError) or Status like 'fail'
| project AccountId, WorkItemId, ActivityId, ActionType, Region, ImageType,
    UserId, ServicePlanId, PolicyId, ServicePlanType, PartnerAppType,
    env_time, Status, DeviceId,
    CitrixError = coale
```

**Query 6:**
```kql
let StartTime = datetime({startTime});
let EndTime = datetime({endTime});
let PartnerId = "198d71c0-80bb-4843-8cc4-811377a49a92";
let TargetTenantId = "{TargetTenantId}";
let TargetUserId = "{TargetUserId}";
let MyCloudPCEvent = union
    cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPC").table("CloudPCEvent"),
    cluster("https://cloudpc.eastus2.kusto.windows.net").database("CloudPCProd").table("CloudPCEvent"),
    cluster("https://cloudpcneu.northeurope.kusto.windows.net
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | After removing Citrix connector from Intune, existing Cloud PCs still show 'Citr... | By design: 7-day grace period exists after Citrix connector removal before the C... | This is expected behavior - 7 day grace period. Check external partner connector... | 🔵 7.5 | ADO Wiki |
| 2 | VMware BLAST not enabled correctly on Cloud PC after onboarding | BLAST onboarding process failed or did not complete during initial VMware agent ... | Remove VMware license from W365 node in VMware Cloud admin console → wait 10 min... | 🔵 7.5 | ADO Wiki |
| 3 | Cannot connect to Cloud PCs using Citrix after reboot; machine shows unregistere... | After reboot, network profile does not switch to Domain Authenticated and remain... | Check Microsoft-Windows-NetworkProfile-Operational.evtx to compare reboot timest... | 🔵 7.5 | ADO Wiki |
| 4 | Citrix app sharing session freezes for other participants when presenter is on V... | Bug in Teams Slimcore VDI 2.0 on Citrix with VDA 2402 + CWA 2309.1+: freeze when... | Immediate workaround: stop and reshare the window. Permanent fix: upgrade to new... | 🔵 7.5 | ADO Wiki |
| 5 | In Citrix VDI 2.0 environment, Teams app sharing sessions freeze for other parti... | Bug in Citrix VDA 2402 + CWA 2309.1+ interaction with Slimcore VDI 2.0 when vide... | Stopping and resharing the window resolves the issue temporarily. Permanent fix ... | 🔵 7.5 | ADO Wiki |
| 6 | DeviceLock policy (Max Inactivity Time Device Lock) not working on Windows 365 C... | Citrix VDA overrides the display-required state, preventing Windows from trigger... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\... | 🔵 7.5 | ADO Wiki |
| 7 | RDClient as a Published Citrix App fails to do Feed Discovery for WVD. Error: Fa... | Citrix remote app uses InitialProgram RDP option to launch WVD Client in place o... | PG confirmed WVD Client was not designed/tested for Citrix published app usage. ... | 🔵 6.5 | KB |
| 8 | When trying to activate Windows 11 client you may receive the following error me... | Install was Azure Virtual Desktop (AVD) and it was configured to contact onprem ... | Azure Virtual Desktop (AVD) must use Azure KMS hosts.&nbsp; Cannot use onprem KM... | 🔵 6.5 | KB |
| 9 | Abstract You are running Windows 11 22H2 (Nickel) host pool.&nbsp; Randomly, the... | This condition occurs because of a deadlock generated by a UDP Endpoint that was... | Temporary mitigation Reboot solves the issue  The fix has been implemented in th... | 🔵 6.5 | KB |
| 10 | HP Anyware agent not enabled correctly on Cloud PC - HP Anyware client cannot co... | HP Anyware agent installation or onboarding process failed during initial provis... | Remove HP license from Windows 365 node in HP admin console → wait 10 min for of... | 🔵 6.0 | ADO Wiki |
