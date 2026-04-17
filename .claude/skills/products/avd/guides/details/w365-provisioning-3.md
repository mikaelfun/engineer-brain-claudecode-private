# AVD W365 Provisioning 配置 (Part 3) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 16 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-sso-aadj-haadj-provisioning-policy.md, ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md, ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md, ado-wiki-b-cpc-relocation-troubleshooting.md, ado-wiki-b-outbound-connection-cloud-pc.md, ado-wiki-cloud-pc-passive-deletion-scoping-questions.md, ado-wiki-cloudprofile-agent-troubleshooting.md, ado-wiki-cpc-wdac-provisioning-troubleshooting.md, ado-wiki-post-provisioning-advanced-kusto-checks.md, ado-wiki-provisioning-overview.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Need to collect CMD (Cloud Managed Desktop) Agent logs for W... | - | CMD Agent logs are located at: C:\ProgramData\Microsoft\CMDE... |
| Windows 365 Cloud PC is provisioned with half of the disk si... | CMD (Cloud Managed Desktop) Agent running inside the VM fail... | Allow outbound access to *.infra.windows365.microsoft.com (c... |
| Group Based Licensed (GBL) Cloud PC resize fails to reach 'R... | A direct license assignment coexists with a group license as... | Remove the direct W365 license assignment from the affected ... |
| M365 license not returned to available pool after end user r... | Improper user deletion flow: user was removed only from M365... | For hybrid identities: delete user from on-premises AD DC (S... |
| Windows 365 Cloud PC provisioned with warnings; Language Pac... | A GPO, Settings Catalog, or Custom OMA-URI policy sets 'Allo... | Set the 'Allow remote server management through WinRM' polic... |
| Windows 365 Cloud PC provisioning, Language Pack installatio... | Palo Alto Next-Gen Firewall has App Categories configured in... | Check Palo Alto firewall App Categories policy configuration... |
| Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEn... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query ... |
| Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEn... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query ... |

### Phase 2: Detailed Investigation

#### **Single Sign On**
> Source: [ado-wiki-a-sso-aadj-haadj-provisioning-policy.md](guides/drafts/ado-wiki-a-sso-aadj-haadj-provisioning-policy.md)

Please find below the different topics related to Windows 365 and SSO. The following information is as I understand it and based on feature recordings.

#### AI-enabled Cloud PCs — Scoping Questions
> Source: [ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md](guides/drafts/ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md)

## 1. Environment & Configuration

#### Copilot+ (AI-enabled Cloud PCs) Troubleshooting
> Source: [ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md](guides/drafts/ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md)

## Copilot+ Architecture & Flows

*Contains 4 KQL query template(s)*

#### CPC Relocation / RegionRelocation Troubleshooting
> Source: [ado-wiki-b-cpc-relocation-troubleshooting.md](guides/drafts/ado-wiki-b-cpc-relocation-troubleshooting.md)

This is a backend feature - no user interaction nor troubleshooting is applicable for this release.

*Contains 1 KQL query template(s)*

#### Outbound Connection Issue for Cloud PC
> Source: [ado-wiki-b-outbound-connection-cloud-pc.md](guides/drafts/ado-wiki-b-outbound-connection-cloud-pc.md)

This guide covers Cloud PC networking issues such as:

*Contains 1 KQL query template(s)*

#### Scoping Questions - Cloud PC Recovery for Passive Deletion
> Source: [ado-wiki-cloud-pc-passive-deletion-scoping-questions.md](guides/drafts/ado-wiki-cloud-pc-passive-deletion-scoping-questions.md)

## 1. Environment & Configuration

#### Install or Update Agent
> Source: [ado-wiki-cloudprofile-agent-troubleshooting.md](guides/drafts/ado-wiki-cloudprofile-agent-troubleshooting.md)

The ICM incident may include a **workflowId** linked to the install or update operation, or it may have been forwarded to us because the initial investigation by CDP Core OCE suggests the issue is rel

*Contains 7 KQL query template(s)*

#### ado-wiki-cpc-wdac-provisioning-troubleshooting.md
> Source: [ado-wiki-cpc-wdac-provisioning-troubleshooting.md](guides/drafts/ado-wiki-cpc-wdac-provisioning-troubleshooting.md)

Received the error PowerShell Constrained Language Mode is causing provisioning to fail during the provisioning of CPCs for the Hybrid joined scenario.

*Contains 1 KQL query template(s)*

#### Post Provisioning Advanced Kusto Checks
> Source: [ado-wiki-post-provisioning-advanced-kusto-checks.md](guides/drafts/ado-wiki-post-provisioning-advanced-kusto-checks.md)

## Common Errors (CSS - do not raise an ICM or ping devs directly)

*Contains 1 KQL query template(s)*

#### Provisioning Overview
> Source: [ado-wiki-provisioning-overview.md](guides/drafts/ado-wiki-provisioning-overview.md)

Assignment is a 3-tuple of (user Id, policy id, license type).

#### Reservation Error List for Provision and Resize
> Source: [ado-wiki-reservation-error-list.md](guides/drafts/ado-wiki-reservation-error-list.md)

When the following errors are encountered during provisioning/reprovision or resizing, the failed VM will be deferred for deletion to allow further investigation:

#### Reserve - User Provisioning Scoping Questions
> Source: [ado-wiki-reserve-user-provisioning-scoping.md](guides/drafts/ado-wiki-reserve-user-provisioning-scoping.md)

## 1. Environment & Configuration

#### Reserve - User Provisioning Setup Guide
> Source: [ado-wiki-reserve-user-provisioning-setup.md](guides/drafts/ado-wiki-reserve-user-provisioning-setup.md)

## Enable user provisioning (admin steps)

#### Reserve - User Provisioning Troubleshooting
> Source: [ado-wiki-reserve-user-provisioning-troubleshooting.md](guides/drafts/ado-wiki-reserve-user-provisioning-troubleshooting.md)

## Provisioning option not visible in Windows App

#### Troubleshoot Failed Device Actions from COGS Optimization Scenarios
> Source: [ado-wiki-w365-cpc-cogs-optimization-tsg.md](guides/drafts/ado-wiki-w365-cpc-cogs-optimization-tsg.md)

Troubleshooting guide for failed Cloud PC device actions triggered from CPC Optimization (COGS) scenarios.

#### Find Cloud PC with VIP (Outbound Public IP)
> Source: [ado-wiki-w365-find-cpc-with-vip.md](guides/drafts/ado-wiki-w365-find-cpc-with-vip.md)

Cloud PC may be abused as attacker; VIP captured by Azure Security team triggers a security incident.

### Key KQL Queries

**Query 1:**
```kql
let CloudPCEvent = cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent;
CloudPCEvent
| where ApplicationName == "dml-function"
| where ComponentName == "WorkspaceInputV1Handler"
| where EventUniqueName startswith "ProcessAsync-EntityAfter"
| extend CloudPcId = DeviceId
| where CloudPcId == cloudPcId
```

**Query 2:**
```kql
-- Filter by ActionType contains "OAICapabilities"
-- Check ActionStatus, ErrorCode, ErrorCategory
```

**Query 3:**
```kql
-- ApplicationName == "connectivity-function"
-- ComponentName == "DeviceGatewayEventConsumer"
-- Check OsVersion, HcfState, OaiModelState
```

**Query 4:**
```kql
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where AccountId == "" //TenantID
| where ComponentName in ("OaiService")
| where EventUniqueName contains "GetCloudPcOaiEligibility" or EventUniqueName contains "EnableOaiAsync"
```

**Query 5:**
```kql
let MyCloudPCEvent =
    union cluster("cloudpc.eastus2").database("CloudPC").CloudPCEvent,
    cluster("cloudpcneu.northeurope").database("CloudPCProd").CloudPCEvent;
let GetPersistLogs = (StartTime:datetime, EndTime:datetime, Env:string, TenantIds:dynamic)
{
    MyCloudPCEvent
    | extend TruncId = Col1, Col1 = iff(ApplicationName in ("prov", "prov-function"), OtherIdentifiers, Col1)
    | where env_time between (StartTime .. EndTime) and iff(Env != "", env_cloud_environment == Env, true) and
```

**Query 6:**
```kql
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<CloudPC_PublicIP>" or DstIpAddress == "<CloudPC_PublicIP>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Need to collect CMD (Cloud Managed Desktop) Agent logs for Windows 365 provision... | - | CMD Agent logs are located at: C:\ProgramData\Microsoft\CMDExtension\Logs | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Cloud PC is provisioned with half of the disk size specified in the ... | CMD (Cloud Managed Desktop) Agent running inside the VM fails to reach Azure end... | Allow outbound access to *.infra.windows365.microsoft.com (covers *.cmdagent.inf... | 🔵 7.5 | ADO Wiki |
| 3 | Group Based Licensed (GBL) Cloud PC resize fails to reach 'Resize pending licens... | A direct license assignment coexists with a group license assignment for the sam... | Remove the direct W365 license assignment from the affected user(s) before start... | 🔵 7.5 | ADO Wiki |
| 4 | M365 license not returned to available pool after end user removal; Cloud PC not... | Improper user deletion flow: user was removed only from M365 Admin Center but th... | For hybrid identities: delete user from on-premises AD DC (Server Manager > AD U... | 🔵 7.5 | ADO Wiki |
| 5 | Windows 365 Cloud PC provisioned with warnings; Language Pack (LP) installation ... | A GPO, Settings Catalog, or Custom OMA-URI policy sets 'Allow remote server mana... | Set the 'Allow remote server management through WinRM' policy to 'Not Configured... | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Cloud PC provisioning, Language Pack installation, activation, or WN... | Palo Alto Next-Gen Firewall has App Categories configured in its firewall policy... | Check Palo Alto firewall App Categories policy configuration. Identify App Categ... | 🔵 7.5 | ADO Wiki |
| 7 | Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy video, or GPU not d... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEnumerateHWBeforeSW, A... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query "Select * FROM Win32... | 🔵 7.5 | ADO Wiki |
| 8 | Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy video, or GPU not d... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEnumerateHWBeforeSW, A... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query "Select * FROM Win32... | 🔵 7.5 | ADO Wiki |
| 9 | Windows App for macOS crashes when user attempts to join a Teams Town Hall meeti... | Teams media optimization (VDI 1.0) does not support Town Hall meetings in Teams.... | Turn off media optimizations and join the Town Hall meeting, or connect to the C... | 🔵 7.5 | ADO Wiki |
| 10 | In Citrix VDI 2.0 environment, Teams app sharing sessions freeze for other parti... | Bug in Citrix VDA 2402 + CWA 2309.1+ interaction with Slimcore VDI 2.0 when vide... | Stopping and resharing the window resolves the issue temporarily. Permanent fix ... | 🔵 7.5 | ADO Wiki |
| 11 | Large Cloud PC provisioning batch fails with service error or NameResolutionFail... | VPN Gateway overwhelmed by packet volume from Cloud PCs. With AES256+SHA256 algo... | 1) Upgrade VPN Gateway to higher SKU. 2) Change algorithm to GCMAES256 (120k pps... | 🔵 7.5 | ADO Wiki |
| 12 | SharePoint site configured for auto-sync via Intune policy takes 8 or more hours... | OneDrive sync timer behavior - not a Windows 365 issue. The Timerautomount regis... | 1) Set HKCU\Software\Microsoft\OneDrive\Accounts\Business1 QWORD Timerautomount ... | 🔵 7.5 | ADO Wiki |
| 13 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 14 | Teams calls drop on the local machine that has an HID peripheral connected if a ... | Known issue with Slimcore VDI 2.0 - HID peripheral connected to the local endpoi... | Known issue - avoid running Teams simultaneously on the local machine and in the... | 🔵 7.0 | ADO Wiki |
| 15 | Large Cloud PC provisioning batch fails with 'We encountered a service error'; u... | Default route sends all Cloud PC traffic through VPN Gateway, overwhelming it; p... | Options: 1) Upgrade VPN Gateway to higher SKU; 2) Change encryption algorithm to... | 🔵 6.0 | ADO Wiki |
