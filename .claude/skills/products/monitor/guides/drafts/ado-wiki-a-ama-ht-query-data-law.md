---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Query Data - Log Analytics Workspace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Query%20Data%20-%20Log%20Analytics%20Workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Azure Support Center (ASC)
***Azure Support Center > Resource Explorer > Resource Provider (drop down)***

![image.png](/.attachments/image-2de0b7bb-8516-4830-84b7-0472fd8516c4.png)

***Microsoft.OperationalInsights > workspaces > Select Workspace Name***

![image.png](/.attachments/image-ef319c7d-3109-4036-8daa-47ec401cf656.png)

***Query Customer Data (tab)***

![image.png](/.attachments/image-1d9b023a-4860-4f04-8504-c5b5c6f75500.png)

Select an appropriate query from the samples above, run it, and review the resultss.

![image.png](/.attachments/image-e575295b-28bc-4364-8e68-01c2f3bf044b.png)

# Azure Portal
***Azure Portal > Log Analytics Workspaces > Select Workspace > Logs (blade) > Run query***

![image.png](/.attachments/image-ea0ebb5b-6ac2-4ee4-9018-a52aa3d28505.png)

# Azure Cloud Shell
Reference [Invoke-AzOperationalInsightsQuery](https://learn.microsoft.com/powershell/module/az.operationalinsights/invoke-azoperationalinsightsquery?view=azps-12.1.0)

```
$query = "Heartbeat| summarize arg_max(TimeGenerated, *) by _ResourceId, Category"
$queryResults = Invoke-AzOperationalInsightsQuery -WorkspaceId "xxxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx" -Query $query
$queryResults.Results | Select Category, Version, Computer, TimeGenerated | Sort-Object Category, Version, Computer
```

![image.png](/.attachments/image-e7e73650-d68a-4531-898b-ab0b024917ec.png)

# Azure PowerShell
Reference [Invoke-AzOperationalInsightsQuery](https://learn.microsoft.com/powershell/module/az.operationalinsights/invoke-azoperationalinsightsquery?view=azps-12.1.0)

```
$tenantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$subscriptionId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$workspaceId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$query = @"
Heartbeat
| summarize arg_max(TimeGenerated, *) by _ResourceId, Category
"@

# Connect to Azure
# Find-Module -Name Az.Accounts | Install-Module
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
if (!($AzureContext)) {Connect-AzAccount -TenantId $TenantId}     
$AzureContext = Set-AzContext -SubscriptionId $subscriptionID
$token = (Get-AZAccessToken).Token

# Find-Module -Name Az.OperationalInsights | Install-Module
# Find-Module -Name Az.OperationalInsights | Install-Module
$queryResults = Invoke-AzOperationalInsightsQuery -WorkspaceId $workspaceId -Query $query
$queryResults.Results | Select Category, Version, Computer, TimeGenerated | Sort-Object Category, Version, Computer
```

![image.png](/.attachments/image-f9111edb-6d34-43ce-b858-34701bea9143.png)

# REST API
Reference [Query - Get](https://learn.microsoft.com/rest/api/loganalytics/query/get?view=rest-loganalytics-2022-10-27-preview&tabs=HTTP)

![image.png](/.attachments/image-1838e583-57b6-4664-93df-c603a5148103.png)

![image.png](/.attachments/image-9cfc6ed6-3744-437c-8720-dfc8d2a49685.png)

# Scenario: All Data Sources
**Average and Max EPS over a day**

```
let Start = datetime(2025-04-29 00:00:00);
let End = datetime(2025-04-30 00:00:00);
let id = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/azmonwks1/providers/Microsoft.Compute/virtualMachines/rhel86ama";
search *
| where TimeGenerated between (Start .. End)
| where _ResourceId =~ id
| summarize count() by bin(TimeGenerated, 15m), $table, Category
| extend EventsPerSecond = count_ / 900.0
| summarize
� � AvgEventsPerSecond = avg(count_) / 900.0,
� � MaxEventsPerSecond = max(count_) / 900.0
� � by $table, Category
```

![image.png](/.attachments/image-a0f06e94-85a5-48bb-b904-b3be773b2bf7.png)

NOTE: If we see more than one Category, then there may be multiple agents sending data and EPS may not be accurate.

# Scenario: Heartbeat
**Last AMA heartbeat for a specific resource**

```
let id = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/azmonwks1/providers/Microsoft.Compute/virtualMachines/rhel86ama";
Heartbeat
| where _ResourceId =~ id
| where Category contains "Azure Monitor Agent"
| summarize arg_max(TimeGenerated, *)
```

**Last heartbeat of each agent for a specific resource**

```
let id = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/azmonwks1/providers/Microsoft.Compute/virtualMachines/rhel86ama";
Heartbeat
| where _ResourceId =~ id
| summarize arg_max(TimeGenerated, *) by Category
```

**Last heartbeat of each agent for all resources**

```
Heartbeat
| summarize arg_max(TimeGenerated, *) by _ResourceId, Category
```

**Gaps in heartbeat (timechart)**

Do you see evidence here of gaps in Heartbeat that cannot be explained by expected reasons (such as a reboot)? For instance, if the agent is crashing repeatedly, you would see gaps in the agent heartbeats (i.e. they are not appearing every 1 minute, as expected). If so, see known issues below.

```
let id = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/azmonwks1/providers/Microsoft.Compute/virtualMachines/rhel86ama";
let Start = ago(1d);
let End = now();
Heartbeat
| where TimeGenerated between (Start .. End) and _ResourceId =~ id
| where Category contains "Azure Monitor Agent"
| summarize count() by bin(TimeGenerated, 5m)
| union (
range TimeGenerated from Start to End step 5m
| extend count_ = 0
)
| summarize sum(count_) by bin(TimeGenerated, 5m)
| render timechart
```

![image.png](/.attachments/image-314432e6-204e-48fb-b2c3-d1060c510f6a.png)

**Gaps in heartbeat (top 10)**

```
let Start = ago(7d);
let End = now();
let id = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/azmonwks1/providers/Microsoft.Compute/virtualMachines/rhel86ama";
Heartbeat
| where TimeGenerated between (Start .. End)
| where _ResourceId =~ id
| where Category contains "Azure Monitor Agent"
| order by TimeGenerated asc
| extend previous = prev(TimeGenerated)
| extend DifferenceTR = TimeGenerated - previous
| project _ResourceId, DifferenceTR, TimeGenerated, previous
| order by DifferenceTR
| take 10
```

![image.png](/.attachments/image-bd216cb5-679a-4f0b-9f4a-2632f2d51b7c.png)

## Known Issues (Heartbeat)
[Pending: Agent core process terminated with code...]()

# Scenario: Performance Counters (Microsoft-Perf)
**All performance counters for a specific computer**

```
Perf
| where Computer =~ "MyComputer"
```

![image.png](/.attachments/image-92500a04-42a1-4602-b6df-42415ea18956.png)

**Average CPU utilization across all computers**

```
Perf 
| where ObjectName == "Processor" and CounterName == "% Processor Time" and InstanceName == "_Total"
| summarize AVGCPU = avg(CounterValue) by Computer
```

![image.png](/.attachments/image-a0c348f5-bb3c-4a85-997f-caed52bc1c72.png)

## Known Issues (Microsoft-Perf)
#90447
#94796

# Scenario: VM Insights (Microsoft-InsightsMetrics)
**Earliest and latest heartbeat for each _ResourceId**

```
InsightsMetrics
| where TimeGenerated <= now()
| where Namespace == "Computer" and Name == "Heartbeat"
| summarize NewestData = max(TimeGenerated), OldestData = min(TimeGenerated) by Computer, Origin, _ResourceId
| extend Age = iff(NewestData < ago(30m), "Not updated in the last 30 minutes", "")
| sort by Computer asc , Origin, _ResourceId asc
```

**Latest counters for a specific _ResourceId**

```
InsightsMetrics
| where _ResourceId =~ "RESOURCEID"
| summarize arg_max(TimeGenerated, *) by Namespace, Name
```

## Known Issues (Microsoft-InsightsMetrics)

# Scenario: Syslog (Microsoft-Syslog)
**All syslogs for a specific _ResourceId**

```
Syslog
| where _ResourceId =~ "RESOURCEID"
```

## Known Issues (Microsoft-Syslog)
[Data is duplicated in Syslog and CommonSecurityLog tables](https://learn.microsoft.com/en-us/azure/sentinel/cef-syslog-ama-overview?tabs=single#data-ingestion-duplication-avoidance)
#88044


# Scenario: CommonSecurityLog (Microsoft-CommonSecurityLog)
**All CEF syslogs for a specific _ResourceId**

```
CommonSecurityLog
| where _ResourceId =~ "RESOURCEID"
```

## Known Issues (Microsoft-CommonSecurityLog)
[Data is duplicated in Syslog and CommonSecurityLog tables](https://learn.microsoft.com/en-us/azure/sentinel/cef-syslog-ama-overview?tabs=single#data-ingestion-duplication-avoidance)
#88044
#89463

# Scenario: Text Logs
**All text logs for a specific _ResourceId**

```
<tableName>_CL
| where _ResourceId =~ "RESOURCEID"
```

## Known Issues Text Logs
#90454

# Scenario: Windows Event Logs
**All event logs for a specific _ResourceId**
```
Event
| where _ResourceId =~ "RESOURCEID"
```

**All event logs from the System event log**

```
Event
| where EventLog == "System"
```

**Filter specific log name, event id, and description string**

```
Event
| where EventLog == "System"
| where EventID == 7040
| where RenderedDescription contains "Background Intelligent Transfer Service"
```

## Known Issues Windows Event Logs