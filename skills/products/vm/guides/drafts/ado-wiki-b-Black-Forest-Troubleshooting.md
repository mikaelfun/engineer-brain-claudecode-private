---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Sovereign Cloud/Black Forest Troubleshooting_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Sovereign%20Cloud/Black%20Forest%20Troubleshooting_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction

Summarizes available IaaS troubleshooting instructions for the **National German Cloud (Black Forest)**.

To gain access to a case, send an email to **GERCloudCSSDM@microsoft.com** requesting it.
If the SE is not from Germany, the customer must have already agreed to work with someone outside that country.

## Troubleshooting Steps

### 1. Get-Sub (no ASC in Black Forest)

Run manually:
```powershell
\\fsu\shares\wats\scripts\get-sub\get-sub.ps1 -subscriptionid <subscriptionId> -output C:\Temp -Cloud BlackForest
```

### 2. Get NodeID and ContainerID

Use **Jarvis Logs** (Endpoint = Black Forest CA !!):
- Scoping condition: `Tenant == CLUSTER NAME` (obtained from get-sub in step 1)

### 3. Get Host Node Logs via FCShell

```powershell
# BF Host Logs via FCShell
$f = Get-Fabric <clusterName>
$n = $f | Get-Node <nodeId-guid>
New-Item -ItemType directory -Path 'C:\Temp\NAD' -force
$d = "C:\Temp"
Get-NodeAgentDiagnostics AllLogs -Node $n -DestinationPath $d -StartTime 'yyyy-mm-dd hh:mm' -EndTime 'yyyy-mm-dd hh:mm'
Get-NodeAgentDiagnostics AgentAllDiagnostics -Node $n -DestinationPath $d -StartTime 'yyyy-mm-dd hh:mm' -EndTime 'yyyy-mm-dd hh:mm'
```

### 4. Run Host-Analyzer (Black Forest version)

Download BF-specific Host-Analyzer from [SharePoint](https://microsoft.sharepoint.com/teams/AzureVMANA/Shared%20Documents/Ask%20a%20SME%20--%20Unable%20to%20RDP%20SSH/BFHostAnalizerVersion.zip)

```powershell
C:\HostAnalyzer\BF\hostanalyzer.ps1 `
  -cluster '<clusterName>' `
  -containerId '<containerId-guid>' `
  -nodeId '<nodeId-guid>' `
  -startTime 'yyyy-mm-dd hh:mm' `
  -endTime 'yyyy-mm-dd hh:mm' `
  -ExecutedFromGetSub `
  -osDiagLogsPath 'C:\Temp\OSdiagnostics' `
  -agentLogsPath 'C:\Temp\AgentLogs' `
  -guestEventsPath 'C:\Temp\GuestLogs'
```

Parameters `osDiagLogsPath`, `agentLogsPath`, `guestEventsPath` come from Step 3 output.

### 5. Kusto Endpoints for Black Forest

```
https://armbf.kusto.cloudapi.de:443
https://azurecmff.kusto.usgovcloudapi.net:443
https://aznwbf.kusto.cloudapi.de:443
```

> Note: Not all engineers have rights to these endpoints.

### 6. InspectIaaS Disk (requires Escort)

Prefer asking customer to send data. With customer consent:
1. Open new ICM for Escort request
2. Open Escort request using ICM number
3. ACIS JIT process: https://aka.ms/azacisjit
4. Detailed steps:
   - Open https://portal.microsofticm.com/imp/v3/incidents/cri
   - Fill in cloud instance "BlackForest" with title & description
   - Fill in SubscriptionId and case number → Submit
   - Open Escort Access Request with alias and ICM number
   - Wait for T-Systems engineer to contact by chat
   - In escort session, go to JarvisActions on BF Endpoint: https://jarvis-west.dc.ad.msft.net/actions
   - Use T-Systems Engineer permissions to grab InspectIaaS Disk report

### 7. Storage

**XDash** works as in Public.

### 8. ExecutionGraph and Tenant Deployment

Works same as Public: https://watsup.cloudapp.net/TenantHistory/Search/Vma

### 9. ORB and Jarvis Logs

Work the same as in Public Cloud.
