# AVD W365 Provisioning 配置 (Part 1) - Comprehensive Troubleshooting Guide

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
| Custom image upload fails in Intune Admin Center after Servi... | As of SR 2503 (March 31, 2025), adding a custom image fails ... | Create a new custom image ensuring the source VM does not ha... |
| Cloud PCs provisioned with custom image result in warnings; ... | WMI repository corruption on the golden VM (custom image sou... | Rebuild the WMI repository on the golden VM and recapture th... |
| Windows 365 Business grace period (7 days) blocks provisioni... | Extended 7-day grace period for W365 Business keeps old Clou... | Use PowerShell script with Microsoft.Graph module (CloudPC.R... |
| Cloud PC Move fails with error ResetComputerPassword_deploym... | DNS configuration on the destination region Azure vNet was p... | Remove the stale/decommissioned DNS server IP from the Azure... |
| Azure AD Device Object not removed (stale) when Cloud PC is ... | The enterpriseregistration.windows.net endpoint is blocked b... | Verify and unblock outbound TCP 443 traffic to enterprisereg... |
| Cloud PC provisioning fails with PowerShell Constrained Lang... | WDAC policy, AppLocker, GPO, or Intune policy is enforcing P... | 1) If GPO/Intune policy is applying Constrained Language Mod... |
| Cloud PCs are provisioned twice - multiple computer objects ... | User is added to multiple groups (e.g., provisioning policy ... | Add the user to the local admin group (or other supplementar... |
| Cloud PC deprovisioning fails to unjoin device from AD with ... | Proxy configuration (e.g., Zscaler, Forcepoint) on the Cloud... | Configure proxy bypass for Azure/Windows 365 endpoints. Impl... |

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
| 1 | Custom image upload fails in Intune Admin Center after Service Release 2503 - er... | As of SR 2503 (March 31, 2025), adding a custom image fails if the source VM had... | Create a new custom image ensuring the source VM does not have any additional ma... | 🔵 7.5 | ADO Wiki |
| 2 | Cloud PCs provisioned with custom image result in warnings; error 'Cannot valida... | WMI repository corruption on the golden VM (custom image source) preventing driv... | Rebuild the WMI repository on the golden VM and recapture the custom image. If c... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Business grace period (7 days) blocks provisioning of new Cloud PCs ... | Extended 7-day grace period for W365 Business keeps old Cloud PC allocated, bloc... | Use PowerShell script with Microsoft.Graph module (CloudPC.ReadWrite.All scope) ... | 🔵 7.5 | ADO Wiki |
| 4 | Cloud PC Move fails with error ResetComputerPassword_deploymentTimeout - move to... | DNS configuration on the destination region Azure vNet was pointing to a decommi... | Remove the stale/decommissioned DNS server IP from the Azure vNet DNS configurat... | 🔵 7.5 | ADO Wiki |
| 5 | Azure AD Device Object not removed (stale) when Cloud PC is deprovisioned or rep... | The enterpriseregistration.windows.net endpoint is blocked by firewall or networ... | Verify and unblock outbound TCP 443 traffic to enterpriseregistration.windows.ne... | 🔵 7.5 | ADO Wiki |
| 6 | Cloud PC provisioning fails with PowerShell Constrained Language Mode error duri... | WDAC policy, AppLocker, GPO, or Intune policy is enforcing PowerShell Constraine... | 1) If GPO/Intune policy is applying Constrained Language Mode, disable it and te... | 🔵 7.5 | ADO Wiki |
| 7 | Cloud PCs are provisioned twice - multiple computer objects appear in Active Dir... | User is added to multiple groups (e.g., provisioning policy group and local admi... | Add the user to the local admin group (or other supplementary groups) either 1-2... | 🔵 7.5 | ADO Wiki |
| 8 | Cloud PC deprovisioning fails to unjoin device from AD with error AzureCompute_V... | Proxy configuration (e.g., Zscaler, Forcepoint) on the Cloud PC is blocking outb... | Configure proxy bypass for Azure/Windows 365 endpoints. Implement recommended Zs... | 🔵 7.5 | ADO Wiki |
| 9 | Cloud PC provisioning fails with error CreateVM_managedServiceIdentityNotFound w... | Azure Disk Service failed to bind Managed Service Identity (MSI) with Disk Encry... | 1) Engage W365 ConfigurationNetworkStorage team (CMK owner) via ICM to remove in... | 🔵 7.5 | ADO Wiki |
| 10 | Cloud PC computer name shown on MEM/Intune Portal changes after resize, restore,... | By design. If customer renames the Cloud PC inside the VM or in AAD, the CPC ser... | This is by design behavior. The computer name in MEM Portal will be updated to m... | 🔵 7.5 | ADO Wiki |
| 11 | Windows 365 Cloud PC provisioning fails with error HybridAzureADJoin_hybridAADJ_... | Service Connection Point (SCP) object is not configured or misconfigured in on-p... | 1) Verify SCP exists by running LDAP query on DC: New-Object System.DirectorySer... | 🔵 7.5 | ADO Wiki |
| 12 | Windows 365 Cloud PC snapshot/restore point is marked as Unhealthy status after ... | At the time of snapshot capture, both the VMAgent (GuestAgent) was not ready AND... | The unhealthy status is suggestive only and does NOT block any actions (export, ... | 🔵 7.5 | ADO Wiki |
| 13 | Windows 365 Cloud PC reports returning no data in Intune portal - no device deta... | Azure Connected Machine agent (Azure Arc) was installed on Cloud PCs, causing mi... | Uninstall the Azure Connected Machine agent from affected Cloud PCs and reboot. ... | 🔵 7.5 | ADO Wiki |
| 14 | Bluetooth and hardware settings cannot be managed from Cloud PC Settings app or ... | Cloud PCs lack hardware components like Bluetooth adapters, so these settings ar... | Users must switch back to their physical device and change Bluetooth/hardware se... | 🔵 7.5 | ADO Wiki |
| 15 | User does not receive a Reserve CPC even though they have an active UPA | No license available - ULA in Candidate state waiting for license to become free | Check ULA state. If Candidate, need to purchase more licenses or wait for reclai... | 🔵 7.5 | ADO Wiki |
