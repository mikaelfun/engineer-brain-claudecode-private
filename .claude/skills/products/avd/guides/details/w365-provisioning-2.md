# AVD W365 Provisioning 配置 (Part 2) - Comprehensive Troubleshooting Guide

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
| Windows 365 Cloud PC provisioning takes much longer than usu... | Tenant TrustLevel set to Suspicious or HighlySuspicious, mov... | Verify TrustLevel in CPCD. If Suspicious: provisioning throt... |
| Windows 365 Reserve self-provisioning option (Set up my Clou... | User not included in scoped Entra ID group for self-provisio... | 1) Try web client and app versions to isolate. 2) Wait a few... |
| Windows 365 Reserve Cloud PC entry unexpectedly removed from... | Self-provisioning setting was disabled or Entra group scope ... | 1) Check if user received a notification in Windows App. 2) ... |
| Windows 365 Business Cloud PC does not resume after hibernat... | Cloud PC fails to transition out of hibernation state, sessi... | 1) Confirm Cloud PC is Business SKU. 2) Reproduce by allowin... |
| Cloud PC deprovisioned after license expired; re-assigning l... | License expiration triggers automatic deprovisioning; re-ass... | Use Legacy Recovery OCE API: 1) Confirm license re-enabled (... |
| All Cloud PCs under a W365 tenant are deallocated/stopped an... | Tenant marked as 'highly suspicious' by anti-fraud system; C... | Check tenant HITStatus via Reporting Kusto query or CPCD. Fo... |
| All Cloud PCs under tenant are deallocated/stopped and custo... | Tenant marked as highly suspicious by anti-fraud system (HIT... | Check tenant fraud status via CPCD dashboard and Kusto Daily... |
| Windows 365 Cloud PC provisioning limited to 2 per week; ten... | Tenant score below 0.03 (range 0-1) triggers slow lane class... | Check tenant score via CPCD (aka.ms/cpcd) or Kusto DailyTena... |

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
| 1 | Windows 365 Cloud PC provisioning takes much longer than usual without failures;... | Tenant TrustLevel set to Suspicious or HighlySuspicious, moving provisioning to ... | Verify TrustLevel in CPCD. If Suspicious: provisioning throttled but no dealloca... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Reserve self-provisioning option (Set up my Cloud PC) not visible in... | User not included in scoped Entra ID group for self-provisioning setting; confli... | 1) Try web client and app versions to isolate. 2) Wait a few minutes and refresh... | 🔵 7.5 | ADO Wiki |
| 3 | Windows 365 Reserve Cloud PC entry unexpectedly removed from Windows App - user ... | Self-provisioning setting was disabled or Entra group scope changed; usage perio... | 1) Check if user received a notification in Windows App. 2) Verify self-provisio... | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 Business Cloud PC does not resume after hibernation - session lost o... | Cloud PC fails to transition out of hibernation state, session state not preserv... | 1) Confirm Cloud PC is Business SKU. 2) Reproduce by allowing >1 hour inactivity... | 🔵 7.5 | ADO Wiki |
| 5 | Cloud PC deprovisioned after license expired; re-assigning license creates new C... | License expiration triggers automatic deprovisioning; re-assignment provisions n... | Use Legacy Recovery OCE API: 1) Confirm license re-enabled (UserLicenseEntity_MV... | 🔵 7.5 | ADO Wiki |
| 6 | All Cloud PCs under a W365 tenant are deallocated/stopped and customer cannot st... | Tenant marked as 'highly suspicious' by anti-fraud system; Cloud PCs are automat... | Check tenant HITStatus via Reporting Kusto query or CPCD. Follow suspicious tena... | 🔵 7.5 | ADO Wiki |
| 7 | All Cloud PCs under tenant are deallocated/stopped and customer cannot start the... | Tenant marked as highly suspicious by anti-fraud system (HIT investigation pendi... | Check tenant fraud status via CPCD dashboard and Kusto DailyTenantEvaluation_Sna... | 🔵 7.5 | ADO Wiki |
| 8 | Windows 365 Cloud PC provisioning limited to 2 per week; tenant placed in slow p... | Tenant score below 0.03 (range 0-1) triggers slow lane classification, limiting ... | Check tenant score via CPCD (aka.ms/cpcd) or Kusto DailyTenantEvaluation_Snapsho... | 🔵 7.5 | ADO Wiki |
| 9 | Cloud PC shows black or white screen when connecting. Restart/reprovision does n... | GPO or Intune CSP policy blocking driver installations prevents the Indirect Dis... | Check for policies blocking driver installations via GPO or Intune CSP (DeviceIn... | 🔵 7.5 | ADO Wiki |
| 10 | CPC no available resources; BitLocker via MBAM/Intune; VM stopped | Windows update triggered BitLocker Recovery; W365 unsupported | Disable BitLocker config; unencrypt; restore or reprovision | 🔵 7.5 | ADO Wiki |
| 11 | AVD deployment fails with 'The Admin Username specified is not allowed' error | - | See Microsoft documentation: https://docs.microsoft.com/en-us/azure/virtual-desk... | 🔵 7.0 | ADO Wiki |
| 12 | W365 Business customer deleted CloudPCBPRT (Windows 365 BPRT Permanent User) acc... | The BPRT account is required for W365 Business provisioning. When deleted, the b... | 1) Request CMDCPCSupport eligibility in OSP portal (24hr activation). 2) Find sc... | 🔵 6.0 | ADO Wiki |
| 13 | ConnectionFailedUserHasValidSessionButRDSHIsUnHealthy error when connecting to C... | RDAgentBootLoader service is not running on the session host | Collect Application Event Logs via Azure Support Center (ASC) to determine why R... | 🔵 6.0 | ADO Wiki |
| 14 | Users get disconnected instead of seeing OS lock screen when Device Lock or scre... | Lock screen does not support new Azure AD authentication used by SSO. It also do... | This is by design when SSO is enabled. Disconnection ensures CA/MFA policies are... | 🔵 6.0 | ADO Wiki |
| 15 | Cloud PC provisioning fails with 'Not Enough IP Addresses' error when using Micr... | - | Reach out to SaaF Engineer and raise ICM with complete details: Tenant ID, provi... | 🔵 5.5 | ADO Wiki |
