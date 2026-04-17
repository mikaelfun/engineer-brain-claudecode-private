---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Settings Framework/AI-enabled Cloud PCs/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FSettings%20Framework%2FAI-enabled%20Cloud%20PCs%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Copilot+ (AI-enabled Cloud PCs) Troubleshooting

## Copilot+ Architecture & Flows

### Eligibility Requirements
- **Supported Regions**: Specific Azure regions
- **Service Plans**: Only certain license SKUs
- **Minimum OS Version**: Must meet minimum requirements
- **Configuration Source**: Defined in ResourceMgmtCustomSettings.json on ADO

### Enable/Disable Flow
1. **Setting Event Reception** (FleetMgmt): Receives AI-enabled setting event
2. **Desired State Configuration** (RAS): Sets Cloud PC level setting
   - Special Case: Pre-Provision Settings bypass Desired State framework
3. **Action Creation**: Enable when setting enabled + eligible + status disabled; Disable when setting disabled or ineligible
4. **Action Execution Triggers**: User/Admin change, Post-WorkItem (Provision/Reprovision/Upgrade/Move)
5. **Action Execution**: Enable installs HCF MSIXes; Disable uninstalls them

### State Definitions
- **Action States**: Accepted, InProgress, Succeeded, Failed
- **Health States**: Healthy, Unhealthy, NotApplicable

## Troubleshooting Workflow

### Investigation Process
1. **Query #1**: Cloud PC Property Mapping (ProductType, ServicePlanId, Region, CopilotPlusStatus, DeviceId)
2. **Query #5 & #6**: Setting Propagation verification
3. **Query #3**: Check EnableOAICapabilities/DisableOAICapabilities actions
4. **Query #4**: Device Health (OsVersion, HcfState, OaiModelState)

### Common Failure Patterns
- **Enablement Failed**: Check eligibility → setting propagation → action failures
- **Unexpected Disablement**: Check service plan downgrades, region moves, disable actions
- **Stuck InProgress**: Check action duration (>2 hours) and device connectivity
- **Widespread Failures**: Aggregate failures by ErrorCode/Category

## Kusto Query Templates

### Query #1: Cloud PC Property Mapping
Database: CloudPC (cloudpc.eastus2.kusto.windows.net)
```kusto
let CloudPCEvent = cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent;
CloudPCEvent
| where ApplicationName == "dml-function"
| where ComponentName == "WorkspaceInputV1Handler"
| where EventUniqueName startswith "ProcessAsync-EntityAfter"
| extend CloudPcId = DeviceId
| where CloudPcId == cloudPcId
```

### Query #3: Cloud PC Actions (OAI Enable/Disable)
```kusto
-- Filter by ActionType contains "OAICapabilities"
-- Check ActionStatus, ErrorCode, ErrorCategory
```

### Query #4: OS Version and Feature Status
```kusto
-- ApplicationName == "connectivity-function"
-- ComponentName == "DeviceGatewayEventConsumer"
-- Check OsVersion, HcfState, OaiModelState
```

### Query #5: AI-Enabled Setting Events (FleetMgmt)
### Query #6: Copilot+ Settings in RAS Desired State
### Query #7: Work Item Failure Logs

## OAI Eligibility Check Query
```kusto
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where AccountId == "" //TenantID
| where ComponentName in ("OaiService")
| where EventUniqueName contains "GetCloudPcOaiEligibility" or EventUniqueName contains "EnableOaiAsync"
```

## AI-Enabled Report Error Codes

### Service-side errors (remediable by engineering):
| Error | Description |
|-------|-------------|
| Installation failure | HCF packages installation failed |
| Internal error | Unable to use required AI-enablement component |
| Feature disabled | Collected by monitoring plugin, mostly auto-remediated |

### Client-side errors (not remediable by engineering):
| Error | Description |
|-------|-------------|
| Unsupported Region | CPC provisioned in unsupported region |
| Networking error | Firewall blocking AI features |
| Unsupported OS version | Below minimum OS build |
| Unsupported OS image | OS image not supported |
| Unsupported license plan | License plan not supported |
| Disabled via Intune | Disabled by Intune settings |

## SemanticIndexingStatus Registry Values
Path: `HKLM\SOFTWARE\Microsoft\Windows Search\SemanticIndexer`

| Code | Name | Remediation |
|------|------|-------------|
| 0x0 | Allowed | Working correctly |
| 0x6 | DisabledAsCapableNpuNotPresent | Check for Windows updates |
| 0xF | PackageDownloadInProgress | Wait for packages to install |
| 0x14 | DisabledDueToTemporaryCommercialControl | Enable GP: "Enable features introduced via servicing that are off by default" |
| 0x15 | DisabledDueToRepeatedSemanticIndexingFailures | Generate ETL traces |

## Device Debugging Commands
```powershell
Get-appxpackage "*hybrid*" -AllUsers
Get-appxpackage "*hcf*" -AllUsers
(Get-appxpackage "*workload*" -AllUsers).Count
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WorkloadManager\HCF" /s
reg query "HKLM\SYSTEM\WaaS\Device\Detect\Software\HybridCompute"
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\UnattendSettings\WaaS\Device\Detect\Software\HybridCompute"
reg query "HKLM\SOFTWARE\Microsoft\Windows Search\SemanticIndexer"
```

## ETL Trace Collection
1. Download wsearchcore_ai_etwlogger.wprp
2. Admin PowerShell: `wpr -start wsearchcore_ai_etwlogger.wprp`
3. Reproduce issue
4. `wpr -stop <fileName>.etl`

## Feature-specific Troubleshooting

### Federated Search
- Check Microsoft.Sharepoint.exe running via Task Manager
- Ensure OneDrive folder in Indexing scope
- Use SearchMonitor app for diagnostics

### Click to Do
- First time: must manually open the application
- If shortcut keys don't work, search for it in taskbar
- Collect ETL logs if persistent issues
