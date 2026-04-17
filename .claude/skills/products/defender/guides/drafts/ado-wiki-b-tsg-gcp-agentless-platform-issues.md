---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/GCP Agentless scanning/[TSG] GCP Agentless scanning platform issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2FGCP%20Agentless%20scanning%2F%5BTSG%5D%20GCP%20Agentless%20scanning%20platform%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] GCP Agentless Scanning Platform Issues

## Questions to understand the issue in the platform

### Did the customer turn on GCP Agentless scanning?

Run this query in the MDC environments entity store. Replace `{CUSTOMER_PROJECT_ID}` with the numeric customer project ID:

```kusto
union cluster("https://ascentitystoreprdus.centralus.kusto.windows.net").database("MDCGlobalData").Environments,
cluster("https://ascentitystoreprdeu.westeurope.kusto.windows.net").database("MDCGlobalData").Environments
| where TimeStamp >= ago(1d)
| where HierarchyId == "{CUSTOMER_PROJECT_ID}"
| where EnvironmentName == "GCP"
| summarize arg_max(TimeStamp, *) by HierarchyId
| mv-expand offering = SecurityConnector.offerings
| where offering.offeringType == "DefenderCspm"
| extend VmScannersString = tostring(offering.additionalData.VmScanners)
| extend VmScannersJson = parse_json(VmScannersString)
| extend VmScannersEnabled = tobool(VmScannersJson.enabled)
| project HierarchyId, Plans, offering, VmScannersEnabled
```

### Did the platform manage to discover the customer?

Run in Romelogs cluster Rome3Prod database. Replace `{CUSTOMER_PROJECT_ID}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Starting resources discovery job for GCP ProjectId: {CUSTOMER_PROJECT_ID}"
| project env_time, env_cv, buildId, message
```

### Was the instance discovered?

Replace `{CUSTOMER_PROJECT_ID}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Found"
| parse message with "[GcpScanJobQueuerProjectStateMachine] Found " InstanceCount " vmsToScan for: Subscription=" SubscriptionId " ProjectId=" ProjectId " | vmsToScan: [" VmsToScan "]"
| where ProjectId == "{CUSTOMER_PROJECT_ID}"
| project env_time, env_cv, buildId, message, InstanceCount, VmsToScan
```

### What is the instance validation status?

Replace `{INSTANCE_SELF_LINK}` with format: `https://www.googleapis.com/compute/v1/projects/{CUSTOMER_PROJECT_NAME}/zones/{INSTANCE_ZONE}/instances/{INSTANCE_NAME}`

```kusto
cluster("Romelogs").database("Rome3Prod").DS_ResourcesValidation(ago(7d), now())
| where Cloud == "GCP"
| where ResourceId == "{INSTANCE_SELF_LINK}"
```

### Was a new scan job created for the instance?

Replace `{INSTANCE_SELF_LINK}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message has "[GcpScanJobQueuerProjectStateMachine] Got" and message has "scan jobs to queue"
| parse message with "[GcpScanJobQueuerProjectStateMachine] Got " ScanJobsCount " scan jobs to queue. Subscription=" SubscriptionId " ProjectId=" ProjectId " | ScanJobs: [" ScanJobs "] "
| where ScanJobs has "{INSTANCE_SELF_LINK}"
| project env_time, env_cv, buildId, message, ScanJobs
```

### Are there failures in the preparation process of the scan job?

**Step 1** - Get env_cv for a given scan job. Replace `{JOB_ID}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message startswith "[GcpScanJobPreparationStateMachine]"
| where message has "{JOB_ID}"
| parse env_cv with env_cv_start "_" env_cv_end
| project env_time, env_cv, message, env_cv_start
| take 1
```

**Step 2** - Get the preparation process. Replace `{ENV_CV_START}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where env_cv startswith "{ENV_CV_START}"
| where message has_any ("[GcpSnapshotHandler]", "[CreateSnapshotsGcpScanJobPreparationAction]", "[GcpScanJobPreparer]", "[GcpScanJobPreparationStateMachine]", "[CreateDisksGcpScanJobPreparationAction]", "[GcpDiskHandler]", "[AttachDisksGcpScanJobPreparationAction]")
| project env_time, env_cv, buildId, message
```

### Were the scan results processed?

**Step 1** - Get env_cv. Replace `{JOB_ID}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where message startswith "[GcpScanJobResultProcessingStateMachine] Processing scan"
| where message has "{JOB_ID}"
| parse env_cv with env_cv_start "_" env_cv_end
| project env_time, env_cv, message, env_cv_start
| take 1
```

**Step 2** - Get the result processing. Replace `{ENV_CV_START}`:

```kusto
cluster("Romelogs").database("Rome3Prod").FabricTraceEvent
| where env_time > ago(7d)
| where serviceName == "fabric:/DiskScanningApp/DiskScanningBackgroundService"
| where env_cv startswith "{ENV_CV_START}"
| where message has_any ("[GcpScanJobResultProcessingStateMachine]", "[GcpInstanceGroupsHandler]", "[GcpScanResultProcessExecutor]")
| project env_time, env_cv, buildId, message
```
