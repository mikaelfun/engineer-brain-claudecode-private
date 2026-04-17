# AVD W365 Provisioning 配置 (Part 4) - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 16 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-sso-aadj-haadj-provisioning-policy.md, ado-wiki-ai-enabled-cloud-pcs-scoping-questions.md, ado-wiki-ai-enabled-cloud-pcs-troubleshooting.md, ado-wiki-b-cpc-relocation-troubleshooting.md, ado-wiki-b-outbound-connection-cloud-pc.md, ado-wiki-cloud-pc-passive-deletion-scoping-questions.md, ado-wiki-cloudprofile-agent-troubleshooting.md, ado-wiki-cpc-wdac-provisioning-troubleshooting.md, ado-wiki-post-provisioning-advanced-kusto-checks.md, ado-wiki-provisioning-overview.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD session host domain join fails with error code 1355 duri... | Error 1355 (ERROR_NO_SUCH_DOMAIN) indicates the specified do... | Verify DNS settings point to domain controller, check VNet D... |
| AVD session host provisioning fails to join domain with erro... | Domain join failure error 1355 (ERROR_NO_SUCH_DOMAIN) typica... | Manually join the VM to the domain as workaround. Verify DNS... |

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
| 1 | AVD session host domain join fails with error code 1355 during provisioning. Err... | Error 1355 (ERROR_NO_SUCH_DOMAIN) indicates the specified domain cannot be conta... | Verify DNS settings point to domain controller, check VNet DNS configuration, en... | 🔵 7.5 | OneNote |
| 2 | AVD session host provisioning fails to join domain with error 1355 when deployin... | Domain join failure error 1355 (ERROR_NO_SUCH_DOMAIN) typically indicates DNS re... | Manually join the VM to the domain as workaround. Verify DNS resolution to DC, n... | 🔵 5.5 | OneNote |
