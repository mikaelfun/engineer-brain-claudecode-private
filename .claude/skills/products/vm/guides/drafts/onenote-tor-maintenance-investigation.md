# ToR (Top of Rack) Planned Maintenance Investigation Guide

**Source**: Mooncake POD Support Notebook - SME Topics/2. Azure VM/2-8
**Related**: vm-onenote-100 (maintenance notification node list)

## Background

Before VM maintenance notification is sent, live migration may have already completed the VM migration. Customer has no method to track whether VM is still running on nodes under the ToR being rebooted. When customer opens a ticket, follow these steps.

**Reference**: [Maintenance and updates - Azure Virtual Machines](https://docs.azure.cn/en-us/virtual-machines/maintenance-and-updates)

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

## Known Issues

1. **Affected resource not showing in Planned Maintenance portal** - Tracked in ICM-376870781
2. **VM blade maintenance list not showing properly** - Tracked in ICM-381463877; Portal does not display VM maintenance info correctly

## Escalation

If maintenance notification list contains imprecise data, email: `AzureRT-CLSTS@microsoft.com`
