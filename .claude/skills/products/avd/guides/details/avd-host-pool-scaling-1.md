# AVD AVD Host Pool 与缩放 (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 5 | **Kusto queries fused**: 2
**Source drafts**: mslearn-host-pool-setup-troubleshooting.md, onenote-add-vm-to-host-pool-manually.md, onenote-avd-scaling-plan-reference.md, onenote-avd-session-limit-management.md, onenote-avd-start-vm-on-connect.md
**Kusto references**: deployment-info.md, hostpool-info.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| WVD host pool deployment fails with ResourceDeploymentFailur... | GPO Allow remote server management through WinRM had restric... | Change IPv4/IPv6 filter to * in GPO. |
| WVD host pool deployment fails: User not authorized and Host... | Incorrect tenant name in host pool wizard. | Deploy with correct tenant name. |
| User-assigned managed identity assigned to host pool does no... | Bug in host pool API - accepts identity ID even if missing l... | Double-check the user-assigned managed identity ID format, e... |
| Host pool deployment fails with Exceeding quota limit | VM core quota exceeded for SKU in subscription/region | Create host pool with fewer VMs or submit quota increase req... |
| Scenario:User adds the Azure AD Domain Services for use with... | The password hash between the AAD and the AADDS accounts has... | Users will need to reset their password to sync the password... |
| Start VM on Connect enabled but VM does not start. Error: Th... | AVD service principal lacks required RBAC permissions to sta... | Create custom RBAC role with start/read/instanceView permiss... |
| Start VM on Connect enabled but VM does not start. Error: no... | VM was shutdown while active session present. Known bug. | Update RBAC role permissions for Start VM on Connect. |
| Naming convention with capital letters showing lowercase in ... | Customer has deployed resource groups and host pool using a ... | Business impact:&nbsp;They are in the process of importing a... |

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

### Conflict Notes

- **avd-contentidea-kb-010** vs **avd-mslearn-039** (rootcause_conflict): Both valid. Prefer contentidea-kb (weight 3), mark other as alt
- **avd-contentidea-kb-011** vs **avd-mslearn-039** (rootcause_conflict): Both valid. Prefer contentidea-kb (weight 3), mark other as alt

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | WVD host pool deployment fails with ResourceDeploymentFailure WinRM related. | GPO Allow remote server management through WinRM had restrictive filters. | Change IPv4/IPv6 filter to * in GPO. | 🔵 7.5 | KB |
| 2 | WVD host pool deployment fails: User not authorized and Host pool does not exist... | Incorrect tenant name in host pool wizard. | Deploy with correct tenant name. | 🔵 7.5 | KB |
| 3 | User-assigned managed identity assigned to host pool does not appear in managed ... | Bug in host pool API - accepts identity ID even if missing leading '/' in the re... | Double-check the user-assigned managed identity ID format, ensure it starts with... | 🔵 7.0 | MS Learn |
| 4 | Host pool deployment fails with Exceeding quota limit | VM core quota exceeded for SKU in subscription/region | Create host pool with fewer VMs or submit quota increase request | 🔵 7.0 | MS Learn |
| 5 | Scenario:User adds the Azure AD Domain Services for use with Windows Virtual Des... | The password hash between the AAD and the AADDS accounts has not been synced bec... | Users will need to reset their password to sync the password hash between AAD an... | 🔵 6.5 | KB |
| 6 | Start VM on Connect enabled but VM does not start. Error: There was a problem co... | AVD service principal lacks required RBAC permissions to start VMs. | Create custom RBAC role with start/read/instanceView permissions and assign to W... | 🔵 6.5 | KB |
| 7 | Start VM on Connect enabled but VM does not start. Error: no available resources... | VM was shutdown while active session present. Known bug. | Update RBAC role permissions for Start VM on Connect. | 🔵 6.5 | KB |
| 8 | Naming convention with capital letters showing lowercase in host pool and Resour... | Customer has deployed resource groups and host pool using a naming convention wi... | Business impact:&nbsp;They are in the process of importing all resources into Te... | 🔵 6.5 | KB |
| 9 | Customer has 2 application groups in the same host pool. The user opens remoteap... | Issue is caused by RemoteApp application groups that are in different resource g... | Remove the old appgroup and create a new one within correct resource group, then... | 🔵 6.5 | KB |
| 10 | The customer is encountering issues with Azure Virtual Desktop (AVD) virtual mac... | Incorrect      Alert Trigger Configuration:&nbsp;The alerts are being created ba... | Combine      Alert Triggers:      Modify       the alert configuration to combin... | 🔵 6.5 | KB |
| 11 | Depth First Load Balancing keeps reverting to Breadth First every 5 minutes due ... | The WVD scaling tool script enforces breadth-first load balancing by default, ov... | Add SkipUpdateLoadBalancerType: true to the HTTP request body in the Logic App s... | 🔵 6.5 | KB |
| 12 | Unable to delete AVD resources from both Azure portal and PowerShell. Migration ... | Host Pool Migration was still in Migration state. | Complete or revert the migration. PowerShell: Revert-RdsHostPoolMigration or Com... | 🔵 6.5 | KB |
| 13 | Unable to configure custom alert when scaling plan is enabled/disabled for AVD h... | Data/logs not available by design. Scaling plan assignment activities are not lo... | PG confirmed log location not available. Feature change request filed. Logs will... | 🔵 6.5 | KB |
| 14 | Adding VM to existing host pool fails. Windows update error 0x8024401c. | Corrupted OS update KB5017315 found in CBS logs. | Run DISM /Online /Cleanup-image /Restorehealth and sfc /scannow. Download and in... | 🔵 6.5 | KB |
| 15 | AVD management portal shows 'Failed to create registration key' error | Registration token creation failed, possibly due to too long expiry time | Retry creating registration key with shorter expiry time (between 1 hour and 1 m... | 🔵 6.0 | MS Learn |
