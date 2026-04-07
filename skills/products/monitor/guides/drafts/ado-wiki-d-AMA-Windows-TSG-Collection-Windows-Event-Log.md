---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG:  Collection - Windows Event Log"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Windows%2FTroubleshooting%20Guides%2FAMA%20Windows%3A%20TSG%3A%20%20Collection%20-%20Windows%20Event%20Log"
importDate: "2026-04-07"
type: troubleshooting-guide
---

  

:::template /.templates/Common-Header.md  
:::  
  
[[_TOC_]]  
  
# Overview  
  
Use this guide when **Azure Monitor Agent (AMA) on Windows** is sending **heartbeat** to the destination **Log Analytics Workspace (LAW)**, but **Windows Event Log** records are **missing, duplicated, delayed, or malformed**.  
  
This guide helps determine whether the issue is related to:  
- Data Collection Rule (DCR) association  
- DCR configuration  
- XPath query definition  
- AMA event subscription behavior  
- Local event availability on the machine  
- Agent cache behavior  
- Ingestion pipeline processing  
- Destination workspace validation  
  
# Scenario  
  
Use this guide when **ALL** of the following are TRUE:  
- The [heartbeat](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat) is present in the destination Log Analytics Workspace (LAW).  
- If not, follow the [Heartbeat TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat) instead.  
- Records for the [Windows Event Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-windows-event-logs) are missing, duplicated, delayed, or appear to be malformed in the destination Log Analytics Workspace (LAW).  
  
  
##Support�Area�Path
```Azure/Azure�Monitor�Agent�(AMA)�on�Windows�machine/I�created�a�DCR�but�the�data�is�not�in�the�Log�Analytics�Workspace/No�Event�Logs�in�Log�Analytics�Workspace``` 
  
# Documentation  
- [Collect Windows events from virtual machines with Azure Monitor Agent - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-windows-events)  
  
# What you will need  
- **ResourceID** of the machine where AMA is installed  
- Admin access to the agent machine operating system  
- Access to the associated Data Collection Rule (DCR)  
- Access to the destination Log Analytics Workspace  
- The affected Windows Event Log name or channel  
- Approximate time range when the issue was observed  
- Ability to run PowerShell or use Event Viewer on the machine  
  
# Common causes  
Common causes for Windows Event Log collection issues include:  
- No DCR associated with the machine  
- DCR does not include the required event log or XPath query  
- XPath query is invalid or too restrictive  
- AMA has not successfully subscribed to the event channel  
- Expected events are not being generated locally on the machine  
- Agent cache contains unexpected or incomplete values  
- Ingestion succeeds, but data is delayed, transformed unexpectedly, or filtered downstream  
  
# Known Issues  
Before starting detailed troubleshooting, review currently known issues that may affect Windows Event Log collection.  
  
- [AMA for WindowsEventLog Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforWindows%22%20and%20Tags%3A%22WindowsEventLog%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)  
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=s2mvo2q0ooc)  
  
When reviewing known issues, check whether the symptom matches:  
- subscription failures  
- XPath parsing or event channel issues  
- delays, duplication, or malformed event records  
- recent regressions or active incidents  
  
# Logs to Collect  
- [AMA Troubleshooter for Windows](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter)  
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama)  
- A copy of the event log (.evtx)  
  
# Troubleshooting  
:::template /.templates/AMA-LatestVersion.md  
:::  
  
## Step 1: Scoping  
  
### Step 1a: What issue is being experienced?  
For each of these scenarios, export a copy of the event log file (.evtx) that contains the source record.  
  
- All records are missing from multiple event logs  
- All records are missing from a specific event log  
- Some records are missing from a specific event log  
- Records are being duplicated in the Log Analytics Workspace  
- Create a log query that returns the duplicate records using absolute times  
- Example:  
```kusto  
| where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))  
```  
- Records appear to be malformed in the Log Analytics Workspace  
- Create a log query that returns the malformed records using absolute times  
- Example:  
```kusto  
| where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))  
```  
  
### Step 1b: What event log is experiencing issues?  
The answer should be the **Full Name** and **Log path** from the event log.

```
Full�Name:�System
Log�path:�%SystemRoot%\System32\Winevt\Logs\System.evtx
```

![image.png](/.attachments/image-a813efa7-ff35-4fa9-a4d5-ee0f16a617e8.png)
![image.png](/.attachments/image-22d49210-4415-4a51-9666-5d23f3eb6bc5.png)

Even�if�multiple�event�logs�are�not�being�collected,�we�should�narrow�the�scope�of�the�investigation�to�a�single�event�log.

##�Step�2:�Is�the�DCR�properly�configured?

###�Step�2a:�Is�there�an�associated�DCR�to�collect�the�event�log?
[AMA:�HT:�List�Associated�DCRs�and�DCEs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)

- If�an�associated�Data�Collection�Rule�(DCR)�instructs�the�agent�to�monitor�the�event�log,�proceed�to�the�next�step.
- If�an�associated�Data�Collection�Rule�(DCR)�does�not�instruct�the�agent�to�monitor�the�event�log,�[update�the�DCR](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-windows-events#configure-windows-event-data-source)�and�test�again.

###�Step�2b:�Is�the�DCR�configuration�properly�defined?
[AMA:�HT:�Review�Data�Collection�Rule�(DCR)�Config�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732149/AMA-HT-Review-Data-Collection-Rule-(DCR)-Config?anchor=scenario%3A-windows-event-log-(microsoft-event))
[AMA:�HT:�Review�Data�Collection�Rule�(DCR)�Config�-�Scenario:�Windows�Security Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732149/AMA-HT-Review-Data-Collection-Rule-(DCR)-Config?anchor=scenario%3A-windows-security-event-log-(microsoft-securityevent))

- If�the�DCR�meets�the�conditions�defined�in�the�Windows�Event�Log�scenario,�proceed�to�the�next�step.
- If�the�DCR�does�not�meet�the�conditions�defined�in�the�Windows�Event�Log�scenario,�[update�the�DCR](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-windows-events#configure-windows-event-data-source)�and�test�again.

##�Step�3:�Does�the�mcsconfig�contain�the�XPath�query?
[How-to�review�agent�instruction�set�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-windows-event-log)

- If�the�mcsconfig.latest.xml�shows�the�desired�**XPath�query**,�the�**DCR�immutableId**�matches�the�in-scope�DCR,�and�the�**endpoint**�matches�the�expected�destination,�proceed�to�the�next�step.
- If�the�mcsconfig.latest.xml�does�not�show�any�XPath�query�or�the�XPath�queries�don't�match�the�associated�DCR�configuration,�the�agent�may�have�an�old�configuration�and�not�be�able�to�acquire�a�current�configuration�-�check�here�instead:�[VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)) | [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1587539/AMA-Windows-TSG-Configuration-(Azure-Arc-Machine)).�

##�Step�4:�Does�the�MAEventTable.csv�indicate�AMA�is�operating�correctly?
[AMA�Windows:�HT:�Review�the�MAEventTable.csv�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=scenario%3A-windows-event-log)

###�Step�4a.�Did�AMA�successfully�subscribe�to�the�XPath�query?
- If�the�MAEventTable.csv�shows�a�**recent**�function�call�```SystemEventsListener::SubscribeEvents```�and�```SystemEventsListener::ResetSubscription```�as�successful�for�the�in-scope�XPath�query,�proceed�to�the�next�step.
���� - For�example:�```Subscribed�to�event�eventName=c12104102755888414883_546419284751770569�query=System!*[System[(EventID=7040)]]```
���� - For�example:�```Successfully�resubscribed�to�Subscription�"System!*[System[(EventID=7040)]]"```
- If�the�MAEventTable.csv�shows�a�failure�to�subscribe�to�the�in-scope�XPath�query,�review�the�[known�issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=known-issues-(windows-event-log))�for�a�solution.
- If�we�are�unable�to�use�the�known�issues�to�ascertain�the�cause�of�the�subscription�failure,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

###�Step�4b.�Are�there�other�errors�related�to�the�Windows�Event�Log�scenario?
- If�the�MAEventTable.csv�does�not�show�other�errors�related�to�the�Windows�Event�Log�scenario,�proceed�to�the�next�step.
- If�the�MAEventTable.csv�shows�other�errors�related�to�the�Windows�Event�Log�scenario,�review�the�[known�issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=known-issues-(windows-event-log))�for�a�solution.
- If�we�are�unable�to�use�the�known�issues�to�ascertain�the�cause�of�the�other�errors,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Step�5:�Does�PowerShell�or�Windows�Event�Viewer�return�the�expected�events�with�the�XPath�query?
[AMA�Windows:�HT:�Use�XPath�to�query�Windows�Event�Log](https://dev.azure.com/AzureMonitorPOD/Azure%20Monitor%20Wiki%20Sandbox/_wiki/wikis/Azure-Monitor-Wiki-Sandbox.wiki/1554/AMA-Windows-HT-Use-XPath-to-query-Windows-Event-Log)

- If�PowerShell�or�Windows�Event�Viewer�returns�the�expected�events�with�the�XPath�query,�proceed�to�the�next�step.
- If�PowerShell�or�Windows�Event�Viewer�does�NOT�return�the�expected�events�with�the�XPath�query,�[Review�the�XPath�query](https://dev.azure.com/AzureMonitorPOD/Azure%20Monitor%20Wiki%20Sandbox/_wiki/wikis/Azure-Monitor-Wiki-Sandbox.wiki/1554/AMA-Windows-HT-Use-XPath-to-query-Windows-Event-Log?anchor=components-of-xpath)�to�evaluate�whether�or�not�the�query�is�properly�defined�and�would�logically�result�in�the�expected�events.
- If�you�are�unable�to�define�an�XPath�query�that�results�in�the�expected�events,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Step�6:�Does�the�agent�cache�show�the�desired�events�and�expected�values?
[How-to�review�agent�cached�data�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590100/AMA-Windows-HT-Review-agent-cached-data?anchor=scenario%3A-windows-event-log)

- If�the�agent�cache�shows�the�desired�events�and�expected�values,�proceed�to�the�next�step.
- If�the�agent�cache�does�not�show�the�desired�events�or�the�event�values�don't�match�the�expected�values,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Step�7:�Does�the�QoS�table�show�success?
[How-to�review�MAQosEvent.csv�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590102/AMA-Windows-HT-Review-MAQosEvent.csv?anchor=scenario%3A-windows-event-log)

- If�there�are�only�"Success�=�TRUE"�values�in�the�MAQosEvent.csv,�proceed�to�the�next�step.
- If�there�are�failures�in�the�MAQoSEvent.csv,�verify�we�can�[connect�to�the�endpoint](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints)�that�we�discovered�in�[Step�3](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2143186/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=step-3%3A-does-the-mcsconfig-contain-the-xpath-query%3F)�and�[Review�Related�Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints?anchor=review-related-logs).
- If�we�cannot�discover�the�cause�of�the�failures�to�connect�using�the�above�steps,�[Capture�a�Network�Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama)�and�[Review�the�Network�Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913134/How-to-analyze-AMA-Network-Trace-ODS-Connection).
- If�we�are�unable�to�use�the�Network�Trace�to�ascertain�the�cause�of�the�issue,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Step�8:�Does�the�ingestion�pipeline�show�the�blob�type?
Use�[How-to�review�agent�data�in�the�ingestion�pipeline](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590104/AMA-HT-Review-agent-data-in-ingestion-pipeline?anchor=scenario%3A-windows-event-log)�with�the�input�type�as�**GENERIC_EVENT_BLOB**.
- If�GENERIC_PERF_BLOB�**IS**�in�ingestion�pipeline,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.
- If�GENERIC_PERF_BLOB�**IS�NOT**�in�ingestion�pipeline,�[Capture�a�Network�Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama)�and�[Review�the�Network�Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913134/How-to-analyze-AMA-Network-Trace-ODS-Connection).
- If�we�are�unable�to�use�the�Network�Trace�to�ascertain�the�cause�of�the�issue,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Step�9:�Does�data�appear�as�expected�in�the�destination?
[AMA:�HT:�Query�Data�-�Log�Analytics�Workspace�-�Scenario:�Windows�Event�Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-windows-event-logs)

- If�the�record�is�present�as�expected,�the�issue�may�have�previously�been�mitigated.�Review�with�the�customer.
- If�the�record�is�present,�but�does�not�appear�as�expected,�Review�the�[Known�Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=known-issues-text-logs).
- If�none�of�the�known�issues�explains�why�the�record�does�not�appear�as�expected,�see�the�[Getting�Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2415303/AMA-Windows-TSG-Collection-Windows-Event-Log?anchor=getting-help)�section�below�to�escalate.

##�Getting�Help
:::template�/.templates/TSG-GettingHelp-Agents.md
:::

#�Product�Group�Escalation
---
:::template�/.templates/TSG-ProductTeamEscalation.md
:::