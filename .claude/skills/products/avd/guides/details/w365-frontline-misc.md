# AVD W365 Frontline 一线员工 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 19 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-autopilot-dpp-w365-setup-guide.md, ado-wiki-citrix-hdx-frontline-dedicated.md, ado-wiki-cloud-apps-dpp-fls-setup-guide.md, ado-wiki-fls-devices-automatically-reset-scoping-questions.md, ado-wiki-fls-dpp-successful-event-kusto.md, ado-wiki-fls-provisioning-policy-details-kusto.md, ado-wiki-frontline-shared-dpp-troubleshooting.md, ado-wiki-resize-frontline-dedicated-scoping-questions.md, ado-wiki-resize-frontline-dedicated-setup-guide.md, ado-wiki-session-state-retention-fld-scoping-questions.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Win32 and Store Winget apps show as Skipped in DPP (Device P... | When Managed Installer is enabled, Intune delivers Win32/Win... | Known behavior - apps will still get installed despite showi... |
| Windows 365 COGS Optimization device actions (hibernate/resu... | Internal service errors during COGS optimization device acti... | 1) Ask customer to Restart the machine. 2) If Restart fails,... |
| Windows 365 Frontline Cloud PCs are unexpectedly logged off ... | Cylance PROTECT Script Control blocking PowerShell scripts u... | 1) Check event logs for Event ID 40 reason code 2 and RdpCor... |
| Frontline Cloud PC concurrency status report not visible or ... | Admin missing required permissions: SharedUseLicenseUsageRep... | 1) Assign SharedUseLicenseUsageReport and SharedUseServicePl... |
| Reprovision button in Windows 365 Frontline Shared provision... | Known product limitation - Reprovision button requires the p... | Edit the provisioning policy first, then click the Reprovisi... |
| Windows 365 Frontline Shared CPC provisioned with warnings; ... | Device Preparation Profile (DPP) not assigned to the device ... | 1) Verify DPP profile is created as Automatic (Preview) and ... |
| Windows 365 provisioning, COGS resume, Flex Start, or ANC ch... | Azure capacity outage in the region where Cloud PCs are loca... | For CSS: Check internally for capacity issues in affected re... |
| Customer requests Microsoft Support to access their Virtual ... | - | Decline the request. Support Engineers do not have access to... |

### Phase 2: Detailed Investigation

#### Feature Description
> Source: [ado-wiki-autopilot-dpp-w365-setup-guide.md](guides/drafts/ado-wiki-autopilot-dpp-w365-setup-guide.md)

**This feature is currently in Public Preview.**

#### Citrix HDX Plus Integration with Windows 365 Frontline Dedicated
> Source: [ado-wiki-citrix-hdx-frontline-dedicated.md](guides/drafts/ado-wiki-citrix-hdx-frontline-dedicated.md)

**Scenario:** 3P Client end users can request access to Frontline Cloud PC and are able to log in if there are enough active licenses.

#### Cloud Apps Support for Intune Autopilot DPP-FLS Setup Guide
> Source: [ado-wiki-cloud-apps-dpp-fls-setup-guide.md](guides/drafts/ado-wiki-cloud-apps-dpp-fls-setup-guide.md)

Create a Windows Autopilot device preparation policy (DPP) using this tutorial: [Overview for Windows Autopilot device preparation in automatic mode for Windows 365 (preview) in Intune | Microsoft Lea

#### FLS Devices Automatically Reset - Scoping Questions
> Source: [ado-wiki-fls-devices-automatically-reset-scoping-questions.md](guides/drafts/ado-wiki-fls-devices-automatically-reset-scoping-questions.md)

## 1. Environment & Configuration

#### Successful provisioning with DPP - Kusto Trace Guide
> Source: [ado-wiki-fls-dpp-successful-event-kusto.md](guides/drafts/ado-wiki-fls-dpp-successful-event-kusto.md)

## Step 1: Get the Workload ID using the CPC Name

*Contains 5 KQL query template(s)*

#### Viewing FLS Provisioning Policy Details
> Source: [ado-wiki-fls-provisioning-policy-details-kusto.md](guides/drafts/ado-wiki-fls-provisioning-policy-details-kusto.md)

Because of different data ingestion methods, the provisioning policy for Frontline Shared can be viewed in two ways:

*Contains 2 KQL query template(s)*

#### W365 Frontline Shared: Autopilot V2 DPP Troubleshooting
> Source: [ado-wiki-frontline-shared-dpp-troubleshooting.md](guides/drafts/ado-wiki-frontline-shared-dpp-troubleshooting.md)

## Scenario 1: DPP Profile Not Assigned - FLS CPC Provisioned with Warnings

*Contains 3 KQL query template(s)*

#### Resize Frontline Dedicated Mode - Scoping Questions
> Source: [ado-wiki-resize-frontline-dedicated-scoping-questions.md](guides/drafts/ado-wiki-resize-frontline-dedicated-scoping-questions.md)

## 1. Environment & Configuration

#### Resize Windows 365 Frontline Cloud PCs in Dedicated Mode - Setup Guide
> Source: [ado-wiki-resize-frontline-dedicated-setup-guide.md](guides/drafts/ado-wiki-resize-frontline-dedicated-setup-guide.md)

1. Sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431)

#### Session State Retention FLD - Scoping Questions
> Source: [ado-wiki-session-state-retention-fld-scoping-questions.md](guides/drafts/ado-wiki-session-state-retention-fld-scoping-questions.md)

## 1. Environment & Configuration

#### Setup Guide - Windows 365 Session State Retention (Frontline Dedicated Mode)
> Source: [ado-wiki-session-state-retention-fld-setup-guide.md](guides/drafts/ado-wiki-session-state-retention-fld-setup-guide.md)

1. Confirm Cloud PC is Windows 365 Frontline in Dedicated Mode

#### Session State Retention FLD - Troubleshooting
> Source: [ado-wiki-session-state-retention-fld-troubleshooting.md](guides/drafts/ado-wiki-session-state-retention-fld-troubleshooting.md)

1. Confirm eligibility (Dedicated Mode, OS, size, region)

#### FLS (Frontline Shared) Devices Automatically Reset - Setup Guide
> Source: [ado-wiki-w365-fls-devices-reset-setup-guide.md](guides/drafts/ado-wiki-w365-fls-devices-reset-setup-guide.md)

## Step 1: Provision Frontline Shared Cloud PC

#### W365 Frontline (FLD & FLS) Concurrency Report
> Source: [ado-wiki-w365-frontline-concurrency-report.md](guides/drafts/ado-wiki-w365-frontline-concurrency-report.md)

The Cloud PCs Connected report in Intune provides admins with information regarding the maximum number of FLA/FLS Cloud PCs that can be connected at the same time (i.e. concurrency). This max number o

*Contains 3 KQL query template(s)*

#### Intelligent Pre-start for Frontline - Investigation Guide
> Source: [ado-wiki-w365-frontline-intelligent-prestart.md](guides/drafts/ado-wiki-w365-frontline-intelligent-prestart.md)

Intelligent pre-start predicts when a Frontline user will log in and pre-starts the Cloud PC before the predicted login time to improve user experience.

*Contains 2 KQL query template(s)*

#### Windows 365 Frontline OCE API (Concurrent Access Service)
> Source: [ado-wiki-w365-frontline-oce-api.md](guides/drafts/ado-wiki-w365-frontline-oce-api.md)

- **[CloudPC] Update Concurrent Access CPC Status** by CPC Id

*Contains 1 KQL query template(s)*

#### Windows 365 Frontline Shared
> Source: [ado-wiki-w365-frontline-shared-overview.md](guides/drafts/ado-wiki-w365-frontline-shared-overview.md)

- Private Preview: Jun 2024 (2405)

#### **Frontline overview**
> Source: [ado-wiki-w365-frontline-worker-tsg.md](guides/drafts/ado-wiki-w365-frontline-worker-tsg.md)

The below URL contains TSG/Architecture for Windows 365 Frontline Worker.

#### Windows 365 Frontline Overview
> Source: [ado-wiki-windows-365-frontline-overview.md](guides/drafts/ado-wiki-windows-365-frontline-overview.md)

Windows 365 Frontline is a version of Windows 365 that helps organizations save costs by letting them provision a Cloud PC that can be used by multiple users with a single license.

### Key KQL Queries

**Query 1:**
```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union clu
```

**Query 2:**
```kql
let ServiceEvent = cluster('https://cdp-gds-eudb-int.northeurope.kusto.windows.net').database('cdp-gds-eudb-int').ServiceEvent
| union cluster('https://cdp-gds-global-int.eastus.kusto.windows.net').database('cdp-gds-global-int').ServiceEvent
| union cluster('https://cdp-gds-global-preprod.eastus.kusto.windows.net').database('cdp-gds-global-preprod').ServiceEvent
| union cluster('https://cdp-gds-eudb-preprod.northeurope.kusto.windows.net').database('cdp-gds-eudb-preprod').ServiceEvent
| union clu
```

**Query 3:**
```kql
let startTime = ago(3h);
let endTime = now();
let caredCatergories = dynamic(["RDAgent.DPPProvisioningService.DPPProvisioningService","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.OrchestratorClient","Microsoft.RDInfra.RDAgent.SidecarOrchestratorClient.AutopilotHelper"]);
cluster('rdsprodus.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprod.eastus2').database('WVD').RDInfraTrace
| union cluster('rdsprodeu.westeurope').database('WVD').RDInfraTrace
| union cluster('rdsprodjp.ja
```

**Query 4:**
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where FunctionName == "SaveClientIdentity"
| where DeviceId == "<INTUNE Device ID>"
| project ActivityId, env_time
```

**Query 5:**
```kql
IntuneEvent
| where env_time > ago(1d)
| where SourceNamespace == "IntunePE"
| where ActivityId == "<ACTIVITY_ID>"
| where ComponentName == "AutopilotV2EnrollmentHelper"
| project env_time, ActivityId, BuildVersion, FunctionName, ComponentName, TraceLevel, LineNumber, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Message
| order by env_time desc
```

**Query 6:**
```kql
let PolicyID = '<PROV Policy ID>';
let _endTime = now();
let _startTime = ago(7d);
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time >= _startTime and env_time < _endTime
| where Col1 contains "Got provisioning policy:" and Col1 contains PolicyID and Col1 contains "EnableSingleSignOn"
| parse kind
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Win32 and Store Winget apps show as Skipped in DPP (Device Preparation Policy) R... | When Managed Installer is enabled, Intune delivers Win32/Winget apps after DPP p... | Known behavior - apps will still get installed despite showing as Skipped in the... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 COGS Optimization device actions (hibernate/resume/stop/start) fail,... | Internal service errors during COGS optimization device actions (hibernate, resu... | 1) Ask customer to Restart the machine. 2) If Restart fails, request lockbox and... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Frontline Cloud PCs are unexpectedly logged off during active sessio... | Cylance PROTECT Script Control blocking PowerShell scripts used by Cloud PC prov... | 1) Check event logs for Event ID 40 reason code 2 and RdpCoreCDV channel close e... | 🔵 7.5 | ADO Wiki |
| 4 | Frontline Cloud PC concurrency status report not visible or showing empty in Int... | Admin missing required permissions: SharedUseLicenseUsageReport and SharedUseSer... | 1) Assign SharedUseLicenseUsageReport and SharedUseServicePlans permissions via ... | 🔵 7.5 | ADO Wiki |
| 5 | Reprovision button in Windows 365 Frontline Shared provisioning policy does not ... | Known product limitation - Reprovision button requires the policy to be edited f... | Edit the provisioning policy first, then click the Reprovision button | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Frontline Shared CPC provisioned with warnings; error DppNotEnabled ... | Device Preparation Profile (DPP) not assigned to the device group, or Intune Pro... | 1) Verify DPP profile is created as Automatic (Preview) and assigned to a clean ... | 🔵 7.5 | ADO Wiki |
| 7 | Windows 365 provisioning, COGS resume, Flex Start, or ANC checks fail with error... | Azure capacity outage in the region where Cloud PCs are located. Impacts: COGS (... | For CSS: Check internally for capacity issues in affected region, inform SaaF Te... | 🔵 7.5 | ADO Wiki |
| 8 | Customer requests Microsoft Support to access their Virtual Hard Disks (VHDs) fo... | - | Decline the request. Support Engineers do not have access to customer VHDs and a... | 🔵 7.5 | ADO Wiki |
| 9 | Frontline Cloud PC browser connection fails: You are using an invalid link to co... | ZScaler or proxy not configured to bypass WVD/AVD traffic and WireServer IPs 169... | Configure proxy to bypass: (1) WVD gateway URLs (2) WireServer IPs: 169.254.169.... | 🔵 7.5 | ADO Wiki |
| 10 | Windows 365 Frontline Shared Cloud PC provisioned with warnings, DPP (Device Pre... | Device Preparation Profile (DPP) not properly configured: not created as Automat... | 1) Verify DPP profile created as Automatic (Preview) and assigned to device grou... | 🔵 6.0 | ADO Wiki |
