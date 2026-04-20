---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How to Check for BGP Flaps Between GWT and MSEE"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20to%20Check%20for%20BGP%20Flaps%20Between%20GWT%20and%20MSEE"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# How to Check for BGP Flaps Between GWT and MSEE

[[_TOC_]]

## EagleEye
Use [EagleEye](https://aka.ms/eagleeye) for fully automated analysis of BGP Flaps between GWT and MSEE. EagleEye does localization of problem and analyses metrics from all the devices in the path (both Phynet and WAN).
Pass **ServiceKey**, **GatewayId**, **CustomerProblemCategory** as **Short** and pass the **TimeStamp** at which the BGP sessions flapped. 

Use below steps ONLY if EagleEye doesn't help. Drop an email to eagleeye-support@microsoft.com if EagleEye is not helpful.

## Description

This wiki explains how to identify transient events causing GWT BGP sessions on a MSEE pair to flap due to failures upstream i.e., failures on the network path from MSEE to the region or failures on the edge routers etc. 

## Step 1

Find the MSEE device name: 

### ASC
![MSEE Device information on ASC](/.attachments/image-d43105a2-2422-4f57-9a30-fc2069451abc.png)

### Kusto

```
let skey = dynamic(['00000000-0000-0000-0000-000000000000']); //Replace with customer servicekey
cluster('HybridNetworking').database('aznwmds').['CircuitTable'] 
| where TIMESTAMP >= ago(1d) and AzureServiceKey in (skey)
| summarize by AzureServiceKey, AzureSubscriptionId, PrimaryDeviceName, SecondaryDeviceName
```
![MSEE Device information on Kusto](/.attachments/image-a9df3d88-5d3b-4645-9f68-32472d7e6be2.png)

## Step 2

Populate the impact start (-4hrs) and end time (+4hrs) along with the device names to check if any failures were reported.

You must use Kusto: 

```
//If issues with cluster name failure, use "Eagleeyecentralus.centralus"
let startTime = datetime(2022-08-01 00:00); // Atleast 4 hrs before customer issue started
let endTime = datetime(2022-08-06 23:59); // Atleast 4 hrs after customer issue ended
cluster('Eagleeyecentralus').database('ImpactAnalysis').SysLog_MSEEToGatewayBGPDisconnects
| where PreciseTimeStamp between(startTime..endTime)
| where Device in ('exr01.lon04', 'exr02.lon04') // Replace with customer Circuit's devices
| make-series count() default=0 on PreciseTimeStamp step 1m by Device
| render timechart
```

![Connectivity performance chart](/.attachments/image-e21e15f7-fed7-4891-80cf-7ca8d6ae030b.png)

## Step 3

Check for any ongoing issues with MSEE. 

Kusto:

```
cluster('Icmcluster').database("IcMDataWarehouse").Incidents
| where CreateDate between (datetime(2022-08-01)..datetime(2022-08-03))
| where Title matches regex "exr0[12].lon04" //Juniper
//| where Title matches regex "lon31-09xgmr-cis-[12]" // Cisco
| summarize by IncidentId, Title, CreateDate
```
Example Output:

![Incident logs example](/.attachments/image-fb686c17-51d0-41fa-ad46-49f729fd5d4f.png)

### IcM Alerts Detected
- Check for any ongoing issues with MSEE and if any alerts are detected, please post to teams and a TA will approve IcM to ExpressRoute Operations.

  Use the following template in ASC:

  ![Template for express route BGP Flaps with alerts detected](/.attachments/image-f9d4f96a-a893-4f2b-8f78-4ebf941d108d.png)

### No IcM Alerts Detected
- If **NO** alerts are detected, please post to teams and a TA will approve IcM to ExpressRoute engineering to investigate the flaps further.

   Use the following template in ASC:

  ![Template for express route BGP Flaps without alerts detected](/.attachments/image-3e44f345-beff-482d-817c-4dfe5e37a73c.png)

# Contributions
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 













