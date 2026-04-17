---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/Log Sources for DDoS Protection"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Log%20Sources%20for%20DDoS%20Protection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

::: template /.templates/LogSourcesPreface.md
:::

# Overview

This document outlines the various log sources that Azure DDoS Protection utilizes that are useful in SR troubleshooting.

# Jarvis Dashboards

## SLB: How many Packets/sec is/was my VIP handling?

Whether or not under a DDoS, and no matter the SKU of the DDoS plan, you can use the [slbv2prod > Azure Monitor > BandwidthUsage](https://portal.microsoftgeneva.com/s/DD7FC6E9?overrides=[{"query":"//dataSources","key":"account","replacement":"slbhpeastus2"},{"query":"//*[id='VipAddress']","key":"value","replacement":""}]%20) in Jarvis Dashboards to see the number of packets a VIP has handled in a timeframe:

![PacketCount and SynPacketCount Line Charts](/.attachments/image-a450d9e2-825d-46a2-9f72-7e955df14e28.png)

This indicates that the SLB was DNATing ~30k TCP packets/sec inbound to the VIP, and ~100 SYNs/sec (with a small spike to 500).

* TCP: Protocol 6
* UDP: Protocol 17

> NOTE: DDoS mitigation happens *before* the SLB - so any traffic dropped by DDoS mitigation will **not** show in this dashboard.

## DDoS Dashboards (DDoS Standard)

The PG team has designed a dashboard for the CSS team: [CNS > CRI](https://portal.microsoftgeneva.com/dashboard/CNS/CRI?overrides=[{"query":"//*[id='DestinationVIP']","key":"value","replacement":"Customer_Public_IP"}]%20). When using this dashboard, you can filter by `CustomerVIP` as shown in the screenshot below:

<IMG  style="width:600px" src="https://supportability.visualstudio.com/601a307c-0e65-4ddb-9a57-ec9ef1e42e16/_apis/git/repositories/03c85728-b2cf-4976-b7ca-f301613698ba/Items?path=%2F.attachments%2Fimage-4314f56a-be69-4876-8d53-a2488fd54959.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=master"  alt="CustomerVIP drop-down option"/>

### Is/Was my VIP under DDoS Mitigation?

This dashboard will tell you if a given customer VIP is actively under DDoS mitigation or not. Note that this will *not* tell you if a customer is actually *being* DDoS'd, it'll only tell you if DDoS Protection Standard is actively mitigating a DDoS.

<IMG  style="width:600px" src="https://supportability.visualstudio.com/601a307c-0e65-4ddb-9a57-ec9ef1e42e16/_apis/git/repositories/03c85728-b2cf-4976-b7ca-f301613698ba/Items?path=%2F.attachments%2Funder-mitigation-b061b8eb-3691-4d80-8373-e6d315cab032.PNG&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=master"  alt="DDoS mitigation Line Chart"/>

Notice that this VIP was actively being mitigated between 11:40 and 13:50.

* 1 = under mitigation
* 0 = not under mitigation

### What DDoS Autotune Policy is Applied to my VIP?

Using the dashboard `Thresholds to start DDoS mitigation`, you can see when DDoS Autotune policies are applied to this VIP at any given moment. Notice below, our DDoS autotune policy is set to 10k SYNs, 20k UDP and 50k TCP:

<IMG  style="width:600px" src="https://supportability.visualstudio.com/601a307c-0e65-4ddb-9a57-ec9ef1e42e16/_apis/git/repositories/03c85728-b2cf-4976-b7ca-f301613698ba/Items?path=%2F.attachments%2Fimage-3e92cdba-db03-442c-afa4-80da173ba3a0.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=master"  alt="Thresholds to start DDoS mitigation Line Chart"/>

This trigger dictates when DDoS Protection Standard will begin actively mitigating a DDoS event. Note that this autotune policy may not align with customer expectations - if the backend service cannot handle nearly 10k SYNs/sec, the service may go down even if DDoS protection doesn't trigger.

The thresholds are set through data analysis of the traffic passing through the public IPs/Vnets selected on the DDOS policy, PG engagement would be required to set a fixed threshold.

### How many packets/sec are traversing my VIP (during an attack)? 

This dashboard helps you understand why a DDoS Mitigation did or did not trigger. You can compare this data with the autotune policies noted above to determine if a DDoS should or should not have been mitigated. 

Some customers may say "DDoS Protection Standard incorrectly fired" or "DDoS Protection Standard didn't fire when it should have" - this helps you figure out what should have occurred.

![TCP packets per sec Line Chart](/.attachments/image-af3bc1a8-34fc-4be5-bcee-6b7c90b52c58.png)

# Jarvis Dashboards (DDoS Infrastructure protection - NOT DDoS Standard)

**Example Query**: [DDoS Sflow Counters](https://portal.microsoftgeneva.com/s/FC404952?overrides=[{"query":"//*[id='DestinationVIP']","key":"value","replacement":"Customer_Public_IP"}]&20)

This dashboard is *only* effective for DDoS *DDoS Infrastructure* (used to be called "basic SKU" customers. DDoS Standard customers should use the dashboards elsewhere in this doc.

The most effective use of this dashboard is to identify if DDoS Basic prevented traffic from getting to the customer VM. Example:

![UDP drop Line Chart](/.attachments/image-a8708f8e-cb1b-4031-a305-a262b9e5fe7a.png)

> NOTE: If you don't see anything in the "drop" tables, nothing was dropped by the DDoS service.

# Jarvis Actions

## View DDoS Configuration for Vnet

**Jarvis Query:** [Jarvis Actions > NRP > Get NRP Subscription Details](https://portal.microsoftgeneva.com/C6F86FFB?genevatraceguid=a321edb9-e797-438f-9149-68e34384037a)  

The VNet configuration within NRP shows if there is an associated DDoS Plan. Here's our example vnet:

```  json
    {
    "metadata": {
        "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZURE1071RG/providers/Microsoft.Network/virtualNetworks/VNET10-71",
```

We can find the associated DDoS Protection Plan info within this VNet's json:

```  json
    "enableDdosProtection": true,
…
    "ddosProtectionFlagHasChanged": false,
...
    "ddosProtectionPlan": {
    "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Azure1071RG/providers/Microsoft.Network/ddosProtectionPlans/DDoSProtectionPlan1"
    },
    "remoteDdosProtectionPlanHasChanged": false,
    "remoteDdosProtectionPlanGuid": "00000000-0000-0000-0000-000000000000",
    "remoteDdosProtectionPlanLocation": "westcentralus",
```

## Viewing DDoS Plan Information

`Microsoft.Network` now contains the `ddosProtectionPlans` object/ResourceType:  

``` json
{
    "metadata": {
    "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZURE1071RG/providers/Microsoft.Network/ddosProtectionPlans/DDOSPROTECTIONPLAN1",
```

And within the `ddosProtectionPlans` metadata, we can view what VNets are associated with the plan:  

``` json
"properties": {
    "provisioningState": "Succeeded",
    "virtualNetworks": [
    {
        "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Azure1071RG/providers/Microsoft.Network/virtualNetworks/VNET10-71"
    }
    ],
```

## Viewing Individual IP protection details
This can be obtained via NRP Subscription Details. 

Sample of the IP address metadata: 
```json
"properties": {
        ...
        "slbSequenceNumber": 0,
        "updateTenantState": "TenantUpdateSucceeded",
        "dnsAliases": [],
        "ddosSettings": {
          "protectionMode": "Enabled"
        },
        "dDoSSettingsUpdatesNeeded": false,
        "noZone": true,
        "isSkuUpgraded": false,
        "publicIPSource": "Standalone",
        "isMarkedForDeletion": false
        ...
}
```
Note the inclusion of **ddosSettings** and **protectionMode** parameter now. For IPs that are protected, the protectionMode parameter is set to "Enabled". 

# Jarvis Logs

## View DDoS Operations in NRP FrontendOperationEtwEvent

Always start with Azure Support Center (ASC).  These are the NRP calls made when customers update their DDoS Protection Plans.

**Sample Jarvis Query:** [Jarvis Logs > NRP > FrontendOperationEtwEvent](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-2&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=Nrp&en=FrontendOperationEtwEvent&scopingConditions=[[%22__Region__%22,%22%22]]&conditions=[[%22SubscriptionId%22,%22contains%22,%22%22]]&kqlClientQuery=source%0A|%20sort%20by%20PreciseTimeStamp%20asc%0A|%20where%20ResourceType%20%3D%3D%20%22ddosProtectionPlans%22%20or%20ResourceType%20%3D%3D%20%22ddosProtectionPlanProxies%22&aggregates=[%22Count%20by%20PerItemErrorCount%22,%22Count%20by%20isPerItemFailure%22,%22Count%20by%20isSyncFailure%22,%22Count%20by%20ServerId%22,%22Count%20by%20HResult%22]&chartEditorVisible=true&chartType=line&chartLayers=[[%22New%20Layer%22,%22%22]]%20)

![DDoS Protection Plans Logs using Jarvis Dashboard](/.attachments/1000px-AzureNetworking-DDoSProtection-JarvisLogsNRPFrontendOperationEtwEvent.png)

## View DDoS Operations in Jarvis Logs > NRP > DDoS

You can quickly find the DDoS operations with this query.

**Sample Jarvis Query:** [Jarvis Logs > NRP](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-2&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=Nrp&en=DeleteDdosProtectionPlanOperation,DeleteDdosProtectionPlanProxyOperation,PutDdosProtectionPlanOperation,PutDdosProtectionPlanProxyOperation&scopingConditions=[["__Region__","West%20Central%20US"]]&conditions=[["SubscriptionId","contains","2929671a-556f-46db-9a06-e2170fe7455f"]]&kqlClientQuery=source&aggregates=["Count%20by%20PerItemErrorCount","Count%20by%20isPerItemFailure","Count%20by%20isSyncFailure","Count%20by%20ServerId","Count%20by%20HResult"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20)

- Note: Set your "Filtering Conditions" to your customers' SubscriptionId, and the "Scoping Conditions" to the appropriate region:

![Filtering DDoS Protection Plans Logs using Jarvis Dashboard](/.attachments/1000px-AzureNetworking-DDoSProtection-JarvisLogsNRP.png)

# Contributors

* @<B0B19791-83EB-4561-9380-2B186BDF9BC7> 
* @<B307D353-540C-65C9-AF2F-83861F4AFD46> 