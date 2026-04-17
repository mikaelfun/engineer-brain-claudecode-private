# AVD Host Pool 与缩放 (Part 2) — 排查工作流

**来源草稿**: mslearn-host-pool-setup-troubleshooting.md, onenote-add-vm-to-host-pool-manually.md, onenote-avd-scaling-plan-reference.md, onenote-avd-session-limit-management.md, onenote-avd-start-vm-on-connect.md
**Kusto 引用**: deployment-info.md, hostpool-info.md
**场景数**: 31
**生成日期**: 2026-04-07

---

## Scenario 1: AVD Host Pool & Session Host Setup Troubleshooting Guide
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: [Troubleshoot host pool creation](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-issues)

## Scenario 2: Pre-deployment Checklist
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Subscription**: Active subscription with Contributor access (not MSDN/Free/Education for production)
2. **Quota**: Verify VM core quota for target SKU and region
3. **Resource Provider**: Microsoft.DesktopVirtualization registered
4. **Network**: VNet DNS set to Custom (not Default), pointing to DC IPs
5. **Domain Join Account**: No MFA, has domain join permissions, correct credentials

## Scenario 3: joindomain Failure
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Credentials wrong** → verify in portal, redeploy
   - **Domain not resolvable** → check VNet peering to DC VNet, DNS settings
   - **VNet DNS = Default** → set to Custom with DC IPs

## Scenario 4: Unauthorized (Scale operation)
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - MSDN/Free/Education subscriptions restricted in certain regions
   - Change subscription type or region

## Scenario 5: VMExtensionProvisioningError
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Often transient → retry
   - Verify AVD environment health via PowerShell

## Scenario 6: DSC Download Failure (catalogartifact.azureedge.net)
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Firewall/NSG/static route blocking → remove blocking rules
   - Alternative: download zip manually, host in allowed location

## Scenario 7: InvalidResourceReference
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Resource group name collision → use unique first two characters
   - NIC name collision → use different host prefix

## Scenario 8: Cannot Delete Session Host
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Must delete session host record BEFORE deleting VM
   - Sequence: drain mode → sign out users → delete session host → delete VM

## Scenario 9: Failed to Initiate
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - No session hosts to update
   - Insufficient VNet subnet or VM core quota
   - Region/subscription/resource group/domain join type changed → remove inconsistent hosts

## Scenario 10: Mid-update Failures
> 来源: mslearn-host-pool-setup-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - First batch failures → usually parameter issues, don't retry blindly
   - Later batch failures → often intermittent, retry usually works
   - Ensure image has NO PowerShell DSC extension (remove C:\packages\plugin)

## Scenario 11: Manually Add a VM to AVD Host Pool (AADDS Environment)
> 来源: onenote-add-vm-to-host-pool-manually.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: OneNote case study - Week 3, 8th Nov 2021
> Status: draft (pending SYNTHESIZE review)

## Scenario 12: Steps
> 来源: onenote-add-vm-to-host-pool-manually.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Join VM to AADDS** - Ensure the VM is domain-joined to Azure AD Domain Services.
2. **Download HostpoolRegistrationKey** - From Azure Portal, navigate to the host pool and generate/download the registration key.
3. **Install Windows Virtual Desktop Agent** - Run the WVD Agent installer on the VM, providing the registration key when prompted.
4. **Install RDAgentBootLoader** - Run the RDAgentBootLoader installer after the WVD Agent is installed.
5. **Verify on the session host** - Check that the following services are running:
   - Remote Desktop Agent Boot Loader (RDAgentBootLoader)
   - Remote Desktop Agent (RDAgent)
6. **Verify on Azure Portal** - Confirm the session host appears in the host pool with status "Available".
7. **Test connection** - Verify end-to-end connectivity by connecting via Remote Desktop client.

## Scenario 13: Reference
> 来源: onenote-add-vm-to-host-pool-manually.md | 适用: Mooncake \u2705

### 排查步骤
   - [Create AVD Host Pool (PowerShell)](https://docs.azure.cn/zh-cn/virtual-desktop/create-host-pools-powershell?tabs=azure-powershell)

## Scenario 14: Key Concepts
> 来源: onenote-avd-scaling-plan-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Scale up/down is only triggered by **connect/disconnect events**
   - RBAC required: **Desktop Virtualization Power On Off Contributor** (vs StartOnConnect which only needs Power On Contributor)
   - Workflow: RD → ARM → CRP

## Scenario 15: Phases
> 来源: onenote-avd-scaling-plan-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Phase | Behavior |
|-------|----------|
| Ramp-up + Peak | Used capacity > threshold → scale up |
| Ramp-down + Off-peak | Used capacity < threshold → scale down |

## Scenario 16: Configuration Parameters
> 来源: onenote-avd-scaling-plan-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - `CapacityThresholdPercent`: Trigger threshold for scaling (e.g., 50%)
   - `MinActiveSessionHostsPercent`: Minimum active hosts to keep (e.g., 20%)
   - `LoadBalancingAlgorithm`: BreadthFirst or DepthFirst
   - `RampDownForceLogoffUsers`: Whether to force logoff during ramp-down
   - `StopHostsWhen`: ZeroSessions or ZeroActiveSessions
   - `RampDownWaitTimeMinutes`: Wait time before deallocating
   - `ScalingMethod`: PowerManage

## Scenario 17: Kusto Diagnostics
> 来源: onenote-avd-scaling-plan-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
RDOperation
| where TIMESTAMP >= datetime(YYYY-MM-DD HH:MM)
| where SessionHostPoolId == "<host-pool-id>"
| where host_Role == "RDScaling"
| project TIMESTAMP, Name, ActivityId, ResType, ResDesc, HostPoolArmPath = ArmPath, Props, AADTenantId
```
`[来源: onenote-avd-scaling-plan-reference.md]`
Key fields in Props:
   - `ScalingReasonType`: e.g., "DeallocateVMs_BelowMinSessionThreshold"
   - `ReasonText`: Human-readable scaling decision explanation
   - `CurrentSessionOccupancyPercent`: Current load
   - `ActiveSessionHostCount` / `TotalSessionHostCount`
   - `Action.BeginDeallocateVmTryCount` / `BeganStartVmCount`: Scaling actions taken

## Scenario 18: References
> 来源: onenote-avd-scaling-plan-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Wiki: [Autoscale for Pooled Host Pools](https://supportability.visualstudio.com/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466077/Autoscale-for-Pooled-Host-Pools)
   - Doc: [Autoscale scaling plans and example scenarios](https://learn.microsoft.com/en-us/azure/virtual-desktop/autoscale-scenarios)

## Scenario 19: AVD Session Limit Management Guide
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: OneNote Case Study [Ning] 2105110060000571
> Status: draft (pending SYNTHESIZE review)

## Scenario 20: Session Counting Rules
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Session State | Counts Toward MaxSessionLimit? |
|---|---|
| Active | Yes |
| Idle | Yes (idle = subset of active) |
| Disconnected | Yes |
| Logged Off | **No** |
**Key takeaway:** Only fully logged-off sessions free up session slots. Idle and disconnected sessions still consume capacity.

## Scenario 21: Via Log Analytics (WVDAgentHealthStatus)
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
WVDAgentHealthStatus
| where TimeGenerated > ago(1d)
| project TimeGenerated, SessionHostName, ActiveSessions, InactiveSessions
| order by TimeGenerated desc
```
`[来源: onenote-avd-session-limit-management.md]`
   - `ActiveSessions`: Currently active user sessions
   - `InactiveSessions`: Includes both disconnected AND logged-off sessions (note: this is broader than just "consuming" sessions)

## Scenario 22: Via PowerShell
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```powershell
$sessions = Get-AzWvdUserSession -ResourceGroupName $rg -HostPoolName $pool -SessionHostName $host
$sessions | Select-Object UserPrincipalName, SessionState, CreateTime
```

## Scenario 23: Recommended GPO Settings
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Configure via **Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Session Time Limits**:
1. **Set time limit for disconnected sessions** — e.g., 2 hours
2. **Set time limit for active but idle sessions** — e.g., 30 minutes
3. **End session when time limits are reached** — Enable

## Scenario 24: Remove a specific user session
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
$CurResGroup = "YourResourceGroup"
$CurPool = "YourHostPoolName"
$SessHost = "YourSessionHostName"
$CurSessID = "3"
Remove-AzWvdUserSession -ResourceGroupName $CurResGroup `
-HostPoolName $CurPool `
-SessionHostName $SessHost `
-Id $CurSessID

## Scenario 25: Best Practices
> 来源: onenote-avd-session-limit-management.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Always configure idle timeout + disconnect timeout GPOs during AVD deployment
2. Monitor `ActiveSessions` vs `MaxSessionLimit` ratio per host
3. Consider auto-scaling (scaling plans) to add hosts when session utilization is high
4. Reference: [Windows Virtual Desktop security best practices](https://docs.microsoft.com/en-us/azure/virtual-desktop/security-guide)

## Scenario 26: AVD Start Virtual Machine on Connect
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Source**: OneNote Lab Verification (Susan, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Scenario 27: Overview
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Start Virtual Machine on Connect allows deallocated session hosts to automatically start when a user attempts to connect, reducing costs by keeping VMs stopped when not in use.

## Scenario 28: Configuration
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Navigate to Host Pool > Properties
2. Enable "Start VM on connect"
3. Assign the "Desktop Virtualization Power On Contributor" role to the Azure Virtual Desktop service principal on the resource group containing session hosts

## Scenario 29: Behavior
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - When all VMs in the host pool are deallocated and a user connects, one VM will automatically start
   - The user may experience a brief wait while the VM starts
   - Once the VM is running, the user connects normally

## Scenario 30: Prerequisites
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Azure Virtual Desktop ARM-based deployment
   - Proper RBAC: Azure Virtual Desktop service principal needs "Desktop Virtualization Power On Contributor" role
   - Reference: [Start virtual machine connect](https://docs.microsoft.com/en-us/azure/virtual-desktop/start-virtual-machine-connect)

## Scenario 31: Notes
> 来源: onenote-avd-start-vm-on-connect.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - This feature helps optimize costs for dev/test or low-usage scenarios
   - Works with both personal and pooled host pools
   - VM start time depends on the VM size and OS

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDTenant
| where TenantGroupId == "{TenantGroupId}"
| where env_time >= ago(1d)
| project env_time, Name, Id, CreationDate, TenantGroupId, AzureADId
| summarize arg_max(env_time, *) by Id
```
`[来源: deployment-info.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
```
`[来源: deployment-info.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').AppGroup
| where HostPoolId == "{HostPoolId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, UsersCount, PubAppsCount, Type, Location
```
`[来源: deployment-info.md]`

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
| summarize arg_max(env_time, *) by Id
| project AppGroupName = Name, AppGroupId = Id, HostPoolId, Type, UsersCount;
hostPools
| join kind=leftouter appGroups on HostPoolId
| project HostPoolName, HostPoolId, SHCount, PoolType, AppGroupName, Type, UsersCount
```
`[来源: deployment-info.md]`

```kql
let subscriptionId = "{SubscriptionId}";
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where SubscriptionId == subscriptionId
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| summarize 
    HostPoolCount = count(),
    TotalSessionHosts = sum(SHCount),
    PooledCount = countif(PoolType == "Pooled"),
    PersonalCount = countif(PoolType == "Personal")
```
`[来源: deployment-info.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where Name has "{HostPoolName}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, 
          Location, EnableStartVMOnConnect, PublicNetworkAccess, RDPProperties
```
`[来源: hostpool-info.md]`

```kql
let st = datetime({starttime});
let et = datetime({endtime});
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where Type == "Connection"
| where SessionHostPoolId == "{HostPoolId}"
| where StartDate between (st .. et)
| summarize ConnectionCount = count() by SessionHostName
| order by ConnectionCount desc
```
`[来源: hostpool-info.md]`
