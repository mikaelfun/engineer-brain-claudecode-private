---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/Automatic extension upgrade not happening_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/TSGs/Extension/Automatic%20extension%20upgrade%20not%20happening_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Automatic Extension Upgrade Not Happening

## Overview
A VM has Automatic Extension Upgrade enabled but the extension isn't getting upgraded.

## Troubleshooting Steps

### 1. Confirm Auto Upgrade is Enabled
ASC → VM → Extensions → Select extension → Check "Enable automatic Upgrade" = true

### 2. Check Publisher Enrollment
Publishers must manually enroll each version for Auto Upgrade. Not all versions are enrolled.
- Extension publishers list: https://aka.ms/vmextensionspublishers
- Check azdeployer: https://azdeployer.trafficmanager.net/main/44444 → search RTO column

### 3. Kusto: Check Rollout Status by Region
Gradual rollout takes 1-2 months. Rolls out in phases by region.
```kusto
let phaseMap = cluster('https://azmc2.centralus.kusto.windows.net').database('rsm_Prod').j_smdRtoRegionToPhaseMapRegular();
let monToPhase = cluster('https://azmc2.centralus.kusto.windows.net').database('rsm_Prod').j_smdRegiontocrpRegionMap()
| extend MonitoringApplicationUpper = toupper(strcat("RSM-", crpRegion, "_Monitoring"))
| join kind=leftouter phaseMap on $left.smdRegion == $right.region;
cluster('https://azmc2.centralus.kusto.windows.net').database('rsm_Prod').VMAutoExtensionUpgradeEvent
| where PreciseTimeStamp >= ago(180d)
| where type =~ "{ExtensionType}"
| extend MonitoringApplicationUpper = toupper(MonitoringApplication)
| join kind=leftouter monToPhase on $left.MonitoringApplicationUpper == $right.MonitoringApplicationUpper
| summarize max(version) by phase, crpRegion
| sort by phase desc
```

### 4. Kusto: Check Specific VM State
```kusto
cluster("azmc2.centralus.kusto.windows.net").database("rsm_Prod").VMStateEvent
| where TIMESTAMP >= ago(200d)
| where subscriptionId =~ "{SubID}"
| where vMId contains "{VMname}"
| where publisher =~ "{ExtensionPublisher}"
| where extensionType =~ "{ExtensionType}"
| project TIMESTAMP, publisher, extensionType, currentVersion, targetVersion, upgradeType, upgradeState
```

### 5. Kusto: Check Upgrade Events
```kusto
cluster("azmc2.centralus.kusto.windows.net").database("rsm_Prod").VMAutoExtensionUpgradeEvent
| where PreciseTimeStamp >= ago(30d)
| where subscriptionId =~ "{SubID}"
| where vMId contains "{VMname}"
| where publisher =~ "{ExtensionPublisher}"
| where type =~ "{ExtensionType}"
| project-reorder PreciseTimeStamp, vMId, publisher, type, version, status, errorCode, errorDetails, region
```

### 6. Check for Blocking Maintenance Configuration
If no VMAutoExtensionUpgradeEvent entries exist, check if a Maintenance Configuration is blocking:
```kusto
cluster('https://azmc2.centralus.kusto.windows.net').database('rsm_Prod').EventReaderPluginContextEvent
| where PreciseTimeStamp between (datetime({StartTime}) .. datetime({EndTime}))
| where message contains "{SubID}"
| where message contains "{VMname}"
| where message contains "received resourceresponse"
| project PreciseTimeStamp, message
```
Look for `"IsApproved": false` with reason mentioning maintenanceconfigurations → customer needs to update/remove the Maintenance Configuration.
