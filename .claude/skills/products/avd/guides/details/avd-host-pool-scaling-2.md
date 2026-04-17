# AVD AVD Host Pool 与缩放 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 5 | **Kusto queries fused**: 2
**Source drafts**: mslearn-host-pool-setup-troubleshooting.md, onenote-add-vm-to-host-pool-manually.md, onenote-avd-scaling-plan-reference.md, onenote-avd-session-limit-management.md, onenote-avd-start-vm-on-connect.md
**Kusto references**: deployment-info.md, hostpool-info.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Deploying AVD host pool VMs in a subnet fails with error tha... | IaaS resources (VMs) cannot be created in a subnet that has ... | 1) Remove the VNet integration/service association link from... |
| Deploying AVD host pool VMs in a subnet fails with error tha... | IaaS resources (VMs) cannot be created in a subnet that has ... | 1) Remove the VNet integration/service association link from... |

### Phase 2: Detailed Investigation

#### AVD Host Pool & Session Host Setup Troubleshooting Guide
> Source: [mslearn-host-pool-setup-troubleshooting.md](guides/drafts/mslearn-host-pool-setup-troubleshooting.md)

> Source: [Troubleshoot host pool creation](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-issues)

#### Manually Add a VM to AVD Host Pool (AADDS Environment)
> Source: [onenote-add-vm-to-host-pool-manually.md](guides/drafts/onenote-add-vm-to-host-pool-manually.md)

> Source: OneNote case study - Week 3, 8th Nov 2021

#### AVD Scaling Plan (Autoscale) Reference (OneNote)
> Source: [onenote-avd-scaling-plan-reference.md](guides/drafts/onenote-avd-scaling-plan-reference.md)

- Scale up/down is only triggered by **connect/disconnect events**

*Contains 1 KQL query template(s)*

#### AVD Session Limit Management Guide
> Source: [onenote-avd-session-limit-management.md](guides/drafts/onenote-avd-session-limit-management.md)

> Source: OneNote Case Study [Ning] 2105110060000571

*Contains 1 KQL query template(s)*

#### AVD Start Virtual Machine on Connect
> Source: [onenote-avd-start-vm-on-connect.md](guides/drafts/onenote-avd-start-vm-on-connect.md)

**Source**: OneNote Lab Verification (Susan, 2021-11)

### Phase 3: Kusto Diagnostics

#### deployment-info
> `[Tool: Kusto skill - deployment-info.md]`

主机池 ID

#### hostpool-info
> `[Tool: Kusto skill - hostpool-info.md]`

租户 ID

### Key KQL Queries

**Query 1:**
```kql
RDOperation
| where TIMESTAMP >= datetime(YYYY-MM-DD HH:MM)
| where SessionHostPoolId == "<host-pool-id>"
| where host_Role == "RDScaling"
| project TIMESTAMP, Name, ActivityId, ResType, ResDesc, HostPoolArmPath = ArmPath, Props, AADTenantId
```

**Query 2:**
```kql
WVDAgentHealthStatus
| where TimeGenerated > ago(1d)
| project TimeGenerated, SessionHostName, ActiveSessions, InactiveSessions
| order by TimeGenerated desc
```

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```

**Query 4:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
```

**Query 5:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location
```

**Query 6:**
```kql
let aadTenantId = "{AADTenantId}";
let hostPools = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project HostPoolName = Name, HostPoolId = Id, SHCount, PoolType;
let appGroups = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where AADTenantId == aadTenantId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Deploying AVD host pool VMs in a subnet fails with error that subnet is referenc... | IaaS resources (VMs) cannot be created in a subnet that has existing PaaS VNet i... | 1) Remove the VNet integration/service association link from the subnet before d... | 🔵 6.0 | OneNote |
| 2 | Deploying AVD host pool VMs in a subnet fails with error that subnet is referenc... | IaaS resources (VMs) cannot be created in a subnet that has existing PaaS VNet i... | 1) Remove the VNet integration/service association link from the subnet before d... | 🔵 6.0 | OneNote |
