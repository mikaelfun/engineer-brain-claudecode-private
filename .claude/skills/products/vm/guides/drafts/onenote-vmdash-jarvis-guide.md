# VM Performance Dashboard (VMDash) in Jarvis

**Source**: MCVKB 3.10 | **Product**: VM | **ID**: vm-onenote-138

## Prerequisites
- VM ID (VMID from ASC, sometimes called "Virtual Machine Unique Id" in Kusto)
- Precise date & time (or period) of impact
- Regional Shoebox name (from ASC)

## Usage Steps
1. Open [VMDash](http://aka.ms/vmdash) in browser
2. Specify date/time, regional shoebox name, and VM ID
3. Wait for performance graphs to render

> **Note**: If the node is/was unresponsive (networking), some graphs may not display.

## Auto-generate VMDash Link via Kusto

```kql
let starttime = ago(1d);
let endtime = now();
let subid = pack_array('<subscription-id>');
let vmnames = pack_array('<vm-name>');
let toUnixTime = (dt:datetime) { (dt - datetime(1970-01-01)) / 1ms };
let toUnixTimeString = (startdt:datetime, enddt:datetime) {
    strcat("&globalStartTime=", toUnixTime(startdt),
           "&globalEndTime=", toUnixTime(enddt),
           "&pinGlobalTimeRange=true")
};
let VMdashP1 = 'https://aka.ms/vmdash?overrides=[{"query":"//dataSources","key":"account","replacement":"';
let VMdashP2 = '"},{"query":"//*[id=\'ResourceId\']","key":"value","replacement":"';
let VMdashP3 = '"}]';
let shoeboxnames = TMMgmtFabricSettingEtwTable
| where TIMESTAMP > ago(1d)
| where Name in~ ('Azure.Metrics.ShoeboxMdmAccountName')
| where Value !in ('(empty)')
| summarize by Tenant, shoeboxname=Value, Region;
cluster('Azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
| where TIMESTAMP > starttime and TIMESTAMP < endtime
| where subscriptionId in~ (subid)
| where roleInstanceName in~ (vmnames)
| distinct Region, roleInstanceName, virtualMachineUniqueId, subscriptionId
| summarize make_list(virtualMachineUniqueId), make_list(roleInstanceName) by Region, subscriptionId
| join kind=inner (shoeboxnames) on $left.Region == $right.Region
| extend vmids = strcat_array(list_virtualMachineUniqueId, ',')
| extend vmnames = strcat_array(list_roleInstanceName, ',')
| summarize by Region, vmids, shoeboxname, subscriptionId, vmnames
| project Region, subscriptionId, vmnames,
    vmdash = strcat(VMdashP1, shoeboxname, VMdashP2, vmids, VMdashP3, toUnixTimeString(starttime, endtime))
```

## Sharing
1. Click "Share" at upper left of dashboard
2. Copy the "Exact time link"
