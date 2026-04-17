---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Resource health - \"Ingestion latency\" signal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FResource%20health%20-%20%22Ingestion%20latency%22%20signal"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Resource Health - "Ingestion Latency" Signal

- **P90 = 90th percentile.**

## Service Health, Outages and Resource Health

The following rule-of-thumb should be followed:
- A Service Health of latency would typically correspond to one (or more) Resource Health latency signals.
- Not every Resource Health signal necessarily indicates an outage (Although it is likely to be correlated).

Each issue should be checked on a case-by-case basis at this point to see whether or not it is an outage related signal.

## The Resource Health ingestion latency signal states

The workspace resource health lists current and past ingestion latency incidents, as long as they meet the latency criteria as defined for this signal as described below.

The ingestion latency resource health report shows three states:

1. **Available** - No workspace latency issues detected in the specified timeframe.
2. **Degraded** - Estimated ingestion latency of more than one hour for more than 15 minutes. We're actively working to mitigate this incident.
   - INTERNAL NOTE: This means that **if the latency value of max P90 is 1 hour for more than 15 consecutive minutes, it will be classified as Degraded.**
3. **Unknown** - We are currently unable to determine the health of this workspace, or no data was ingested to this workspace in over 3 days.

## How to access Resource Health for Log Analytics workspaces

Workspace's resource health can be viewed in several places in the Azure portal:

1. From the Monitor service menu, select **Service health > Resource health** and filter for the Log Analytics resource type.
2. From the Log Analytics workspace screen, select **Resource health**.
3. From the Log Analytics workspace screen, select **Insights** and select the **health** tab.

## Which tables are monitored by Resource Health Latency signal?

- Only tables which are internally referred to as **P0Types** are monitored by this Resource Health latency signal.
- **App* prefixed tables** (Application Insights) are **excluded** from Resource Health monitoring, effectively mid-July 2023 onwards due to their built-in latency.
- **Custom logs** (All types) are **not monitored** by this Resource Health Latency signal.
- **AzureActivity** table is also in the process of being excluded from this monitoring.

### List of monitored tables (Subject to changes)

```
event, insightsmetrics, signinlogs, networkmonitoring, dnsevents, containerinventory,
behavioranalytics, windowsevent, kubepodinventory, kubeservices, kubenodeinventory,
containernodeinventory, kubehealth, threatintelligenceindicator, protectionstatus,
containerimageinventory, userpeeranalytics, appservicehttplogs, containerservicelog,
windowsfirewall, auditlogs, awscloudtrail, update, updatesummary, kubeevents,
securityevent, adfactivityrun, appevents, appdependencies, autoscaleevaluationslog,
dnsinventory, wiredata, kubemonagentevents, securitybaseline, apptraces,
securitybaselinesummary, storagebloblogs, apimanagementgatewaylogs, functionapplogs,
securityalert, adfpipelinerun, useraccessanalytics, configurationdata,
securitydetection, updaterunprogress, securityrecommendation, adftriggerrun,
aaddomainserviceslogonlogoff, appserviceconsolelogs, containerregistryrepositoryevents,
apppageviews, storagequeuelogs, coreazurebackup, appserviceauditlogs,
aaddomainservicesaccountlogon, appavailabilityresults, appplatformlogsforspring,
aaddomainservicesprivilegeuse, aegdeliveryfailurelogs, succeededingestion,
securityiotrawevent, addonazurebackupstorage, wvdmanagement,
addonazurebackupprotectedinstance, appplatformsystemlogs, addonazurebackupjobs,
appservicefileauditlogs, containerregistryloginevents, securityincident,
addonazurebackupalerts, wvdcheckpoints, autoscalescaleactionslog, wvdconnections,
wvdfeeds, aaddomainservicesaccountmanagement, addonazurebackuppolicy,
appserviceapplogs, storagetablelogs, wvderrors, storagefilelogs,
aaddomainservicespolicychange, appserviceenvironmentplatformlogs, appsystemevents,
aaddomainservicesdirectoryserviceaccess, configurationchange, commonsecuritylog,
containerlog, syslog, heartbeat, perf, vmconnection, vmcomputer, vmprocess, vmboundport
```

## How to identify which tables are affected by the Latency Signal of Resource Health?

Use the Geneva dashboard (LA-SLIM) to identify affected tables. Filter by:
- Account (workspace mapping)
- Region
- ResourceId
- Table name

This allows you to pinpoint which specific P0Type tables are experiencing elevated ingestion latency.
