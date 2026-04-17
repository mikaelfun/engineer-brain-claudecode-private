# VM Planned Maintenance — 排查工作流

**来源草稿**: onenote-fabric-maintenance-migration-check.md, onenote-maintenance-notification-node-list.md, onenote-scheduled-maintenance-troubleshooting.md, onenote-tor-maintenance-investigation.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 4
**覆盖子主题**: vm-maintenance
**生成日期**: 2026-04-07

---

## Scenario 1: Fabric Maintenance Migration Check
> 来源: onenote-fabric-maintenance-migration-check.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
### 1. Get VM Tenant Info from Jarvis
- For ARM VM: Query Jarvis with VM resource info
- Result contains Cluster name and Tenant name
### 2. Check Node via Fcshell
- Login to the VM's Cluster in Fcshell
- Query the Node hosting the VM
### 3. Check Node OS Version
- Inspect the Node OS information:
  - **WS16H** = Node has been upgraded to Windows Server 2016
  - **WS12H** = Node has NOT been upgraded yet

---

## Scenario 2: Maintenance Notification Node List
> 来源: onenote-maintenance-notification-node-list.md | 适用: Mooncake \u2705

### 排查步骤
## Steps to Find Impacted Nodes/VMs
### Step 1: Get Notification Details from Tracking ID
Replace tracking ID in: `https://iridias.microsoft.com/maintenance?id=<TRACKING-ID>`
Or search at: https://iridias.microsoft.com/ → Maintenance - List → Search box
### Step 2: Find the Source ICM
The Iridias page shows which ICM triggered the notification. The ICM contains:
- SN number
- General reason for maintenance
- Attachment with impacted VM list (at time of ICM creation)
**Warning**: The attached Excel may not list all impacted VMs if engineer used wrong Kusto query. Follow Step 3 to double-confirm.
### Step 3: Find Original Requesting ICM
- Search SN number to find original ICM (team: Azure Communication Manager, NOT the Mooncake one)
- Look for linked ICMs - the one from AzureRT/CLSTS has full node details
### Important Notes
- Time delay exists between ICM raised and notification received
- During this gap, VMs may have migrated due to: customer-initiated redeploy/deallocate, node fault, etc.
- Always verify current VM placement against maintenance nodes

---

## Scenario 3: Scheduled Maintenance Troubleshooting
> 来源: onenote-scheduled-maintenance-troubleshooting.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting Steps
1. **Check ASC VM health events** - look for migration trigger type indicating scheduled maintenance
2. **Query Kusto** (azurecm cluster):
   ```kql
   ScheduledMaintenanceInformational
   | where PreciseTimeStamp > ago(7d)
   | where message contains "<VMName>"
   | project PreciseTimeStamp, Tenant, scheduledMaintenanceId, message
   ```
3. **Cross-reference maintenanceId in ICM** for maintenance details
4. **Verify node status** if impacted node not found in notification ICM:
   ```kql
   LogNodeSnapshot
   | where nodeId == "<nodeId>"
   | where TIMESTAMP > ago(30d)
   | project TIMESTAMP, nodeId, nodeState, nodeAvailabilityState, containerCount, faultInfo
   ```
   - Confirm node was not "Unallocatable" when ICM was created

`[来源: onenote-scheduled-maintenance-troubleshooting.md]`

---

## Scenario 4: Step 1: Find Impacted ToR Device
> 来源: onenote-tor-maintenance-investigation.md | 适用: Mooncake \u2705

### 排查步骤
## Step 1: Find Impacted ToR Device
1. Find the maintenance ICM in iridias (e.g., search the SN number like `SN-13473`)
2. Locate the ICM owned by **Maintenance Comms Team**
3. The ToR device name is in the ICM title (e.g., `BJS20-0101-0603-02T0`)
## Step 2: Find All Nodes Under the ToR
```kql
// Cluster: azdhmc.chinaeast2.kusto.chinacloudapi.cn / azdhmds
DeviceInterfaceLinks
| where LinkType =~ 'DeviceInterfaceLink' and EndDevice =~ '<ToR_DEVICE_NAME>'
| summarize by DeviceName = StartDevice
| join kind = inner (
    Servers
    | where DeviceName =~ DeviceName
) on DeviceName
| project NodeId
```
## Step 3: Check VMs on Those Nodes
```kql
// Cluster: azurecm.chinanorth2.kusto.chinacloudapi.cn / azurecm
LogContainerSnapshot
| where PreciseTimeStamp >= datetime(<START_TIME>) and PreciseTimeStamp <= datetime(<END_TIME>)
| where nodeId in (<NODE_ID_LIST>)
| where subscriptionId in (<SUBSCRIPTION_ID_LIST>)
| distinct roleInstanceName, subscriptionId, nodeId
```

`[来源: onenote-tor-maintenance-investigation.md]`

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
| - Time delay exists between ICM raised and notification received - During this g | 见详情 | → onenote-maintenance-notification-node-list.md |
| 1. **Affected resource not showing in Planned Maintenance portal** - Tracked in  | 见详情 | → onenote-tor-maintenance-investigation.md |
