---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/[TSG] Agentless VM scanning - Troubleshooting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/pages/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Servers/%5BTSG%5D%20Agentless%20VM%20scanning%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] Agentless VM Scanning - Troubleshooting

## How Agentless Works

1. Defender for Cloud takes snapshots of VM disks.
2. It scans the snapshot in its regional, volatile, isolated, and highly secure environment.
3. Upon successful scan, it pushes the results to the MDC portal (Recommendations or Alerts).
4. If scan fails, the machine will be listed under "Not Applicable" with "Failed to scan" under Recommendations.

**Learn more:**
- [Public Doc - Agentless machine scanning](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-agentless-data-collection)

## Kusto Dashboards
- [Defender for Cloud - Defender for Servers - Agentless](https://dataexplorer.azure.com/dashboards/b831d367-1774-4024-88a4-6f890c030e84)
- [Agentless VA | Jarvis](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/Agentless%2520VA)
- [Infrastructure Solutions - Common Queries](https://dataexplorer.azure.com/dashboards/dee7f3f7-1f8c-4b09-9518-433be60836eb)

## Initial Troubleshooting Steps

### Step 1: Get Azure Resource ID
Example: `/subscriptions/xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx/resourceGroups/RGNAME/providers/Microsoft.Compute/virtualMachines/VMNAME`

### Step 2: Check if Agentless is Enabled

Verify using dashboards or KQL:

**Check plan at subscription level:**
```kusto
let SubscriptionId = ""; //Add customer subscription
let shouldCheckSubscription = not(isempty(SubscriptionId));
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(1d)
| where shouldCheckSubscription == false or Scope has SubscriptionId
| summarize arg_max(TimeStamp, Level, *) by Plan
| project-reorder TimeStamp, RecordCreationTime, Scope, Level, Plan, SubPlan, IsEnabled, Extensions
| sort by Plan
```

**Check plan at resource level:**
```kusto
let SubscriptionId = ""; //Add customer subscription
let _resourceid = '';
cluster('Rometelemetrydata').database("RomeTelemetryProd").DefenderPlans
| where TimeStamp >= ago(7d)
| where HierarchyId == SubscriptionId
| where Level == "Resource" or Level == "ResourceGroup"
| where Scope contains _resourceid
| summarize arg_max(TimeStamp, Level, *) by Plan, Scope
| project-reorder TimeStamp, Level, Plan, SubPlan, IsEnabled, Scope, Extensions
```

### Step 3: Verify Device Was Considered Valid for Scan

```kusto
let _startTime = datetime(2024-12-02T23:21:31Z);
let _endTime = datetime(2024-12-03T23:21:31Z);
let _subscriptionid = '';
let _resourceid = '';
cluster("Romelogs").database("Rome3Prod").DS_ResourcesValidation(_startTime, _endTime)
| where SubscriptionId == _subscriptionid
| where ResourceId contains _resourceid
| sort by env_time
| project-reorder env_time, ValidationResult
| take 100
```

**Decision Tree:**

**A. ValidationResult = 'Unsupported' or by-design behavior** (Max disk, No disk, ExclusionTags):
- Review [Agentless machine scanning - availability](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-agentless-data-collection#availability)
- Provide advisory to customer
- If undocumented → communicate with Team/TA/EEE/PG or request ICM
- If log appears wrong and Machine/Disk should be supported → gather proof and bring to TA for ICM

**B. ValidationResult is not "Valid":**
- Review known issues for matching scenarios

**C. ValidationResult = "Valid":**
- Proceed to Step 4

### Step 4: Review Disk Scan Job Completion

```kusto
let _endTime = datetime(2024-12-04T20:08:03Z);
let _resourceid = '';
let _startTime = datetime(2024-12-03T20:08:03Z);
let _subscriptionid = '';
cluster('romelogs.kusto.windows.net').database('Rome3Prod').FabricServiceOE
| where env_time between (_startTime .. _endTime)
| where applicationName endswith "DiskScanningApp"
| where operationName has "AzureScanJobPreparer.PrepareAsync"
| extend Data = todynamic(customData)
| extend ScannedVmByScanId = Data.ScannedVmByScanId
| extend Completed = tobool(Data.Completed)
| mv-expand ScannedVmByScanId
| extend ScannedAzureVmId = tostring(ScannedVmByScanId.Key)
| extend ScanId = tostring(ScannedVmByScanId.Value)
| where ScannedAzureVmId has _subscriptionid
| where ScannedAzureVmId has _resourceid
| extend ValidationError = Data.ValidationError
| project env_time, ScanId, ScannedAzureVmId, Completed, ValidationError, deploymentId, SourceVersion, serviceName, applicationName, customData
| sort by env_time desc
```

**Decision Tree:**

**a. Error: NoPermissionForCustomerKeyVaultRBAC:**
- Follow wiki: [Agentless disk scanning of CMK encrypted disks](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender-for-Cloud/7192/Agentless-disk-scanning-of-CMK-encrypted-disks)

**b. No clear ValidationError or empty:**
- Note the ScanID and proceed to Step 5

### Step 5: Review All Operations by Scan ID

```kusto
let _scanid = ''; //Add scan Id from step 4
cluster("Romelogs").database("Rome3Prod").DiskScanningWorkerOperations
| where ScanId has _scanid
| sort by env_time
| project-away env_name, env_ver, env_dt_spanId, env_dt_traceId, parentId
| project-reorder env_time, name, success, OperationResult, resultDescription, ScanId, customData
```

**Decision Tree:**

**A.** Review individual logs for clear indication of scan failure cause → advise customer accordingly
- Review [Agentless machine scanning - availability](https://learn.microsoft.com/en-us/azure/defender-for-cloud/concept-agentless-data-collection#availability)

**B.** If no clear indication → bring case to TA/EEE and request approval for ICM

## Related Recommendations

| assessmentKey | Name | Notes |
|------|------|-------|
| dc5357d0-3858-4d17-a1a3-072840bff5be | EDR configuration issues should be resolved on virtual machines | [EDR misconfiguration](https://learn.microsoft.com/en-us/azure/defender-for-cloud/endpoint-detection-response) |
| 06e3a6db-6c0c-4ad9-943f-31d9d73ecf6c | EDR solution should be installed on virtual machines | [EDR discovery](https://learn.microsoft.com/en-us/azure/defender-for-cloud/endpoint-detection-response) |
| 17618b1a-ed14-49bb-b37f-9f8ba967be8b | Machines should have secrets findings resolved | [VM secrets](https://learn.microsoft.com/en-us/azure/defender-for-cloud/secrets-scanning-servers) |
| ffff0522-1e88-47fc-8382-2a80ba848f5d | Machines should have a vulnerability assessment solution | Only if Agentless Scanning enabled |
