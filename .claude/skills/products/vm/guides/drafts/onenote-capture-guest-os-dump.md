# How to Capture Guest OS Memory Dump (Mooncake)

> Source: MCVKB 2.17 | Applies to: Mooncake (Serial Console not available)

## Overview

Since Serial Console is not available in Mooncake, capturing VM memory dumps requires escalation to WASU or asking the customer to use a Hyper-V environment.

**Important (2023/1/18 update)**: Legacy vmconnect.exe is retiring. On upgraded nodes, there is no Hyper-V management console, meaning the "save" button method no longer works. Raise Sev-3 to WASU first to check if the host still supports dump capture.

## Method 1: Via WASU Escalation

### Prerequisites
- Get written customer approval to move dump outside datacenter boundary
- Prepare a Storage Account (VMRS) to receive dump files

### Steps

1. **Raise Sev-2 ICM** to Azure Operations Center ChinaWindows - China/Gallatin/WASU
   - Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Z02v2x

2. **Get customer written approval** for data transfer outside datacenter

3. **Get VM info via Kusto**:
```kql
// Cluster: azurecmmc.kusto.chinacloudapi.cn/AzureCM
LogContainerSnapshot
| where TIMESTAMP >= datetime(start) and TIMESTAMP <= datetime(end)
| where subscriptionId == "<subId>" and roleInstanceName contains "<vmName>"
| project creationTime, TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName, containerType, virtualMachineUniqueId, availabilitySetName, subscriptionId
```

4. **WASU captures dump on host node**:
   1. Create sub-folder under `c:\tmp` on host node
   2. Run `D:\vmadmin\vmadmin listdetail` to get VM container ID and VM ID
   3. In guest OS console: Action > Save (generates VMRS snapshot)
   4. Copy `C:\Resources\Virtual Machines\<vm id>.VMRS` to `C:\tmp\`
   5. Repeat steps 3-4 for 2-3 dump files (each overwrites previous)
   6. Resume VM: Action > Start
   7. Transfer dumps from host to jumpbox to Storage Account

5. **WASU transfers dumps** to the prepared Storage Account

## Method 2: Customer Self-Capture (Hyper-V)

If WASU cannot help due to console changes, ask customer to:

1. Start their custom image in a local Hyper-V Manager
2. Reproduce the issue
3. Click "Save" in Hyper-V to generate dump (.vmrs file)
4. Upload the .vmrs file from Hyper-V's default config path
