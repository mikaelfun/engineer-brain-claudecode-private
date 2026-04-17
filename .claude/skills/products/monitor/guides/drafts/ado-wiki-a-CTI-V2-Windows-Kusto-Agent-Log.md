---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/How To/How To: Kusto for checking CT&I V2 Agent Log"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/How%20To/How%20To%3A%20Kusto%20for%20checking%20CT%26I%20V2%20Agent%20Log"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::





# Scenario
---

Below Kusto is for Azure VM and Azure Arc respectively. Please note that it is the same with `cta_linux_agent.log`, but only with `INFO` level and above. For debug log, you still need to collect from customer's environment. See [How To: Enable Debug Logging of CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Enable-Trace-Logging-of-CT&I-Windows-Agent)
- For Azure VM
```
cluster("cxpkustoprod.centralus.kusto.windows.net").database("CxpProd").CTAzureExtensionLgs(ago(3d),now())
| where ResourceId == tolower("<VM-Resource-Id>")
| sort by Context2 desc
```

- For Arc machine (not always stable as relied on AMA)
```
cluster("cxpkustoprod.centralus.kusto.windows.net").database("CxpProd").ActivityCompletedEvent
| where PreciseTimeStamp > ago(3d)
| where activityName == "AMATelemetryLog"
| parse properties with "AzureResourceId=["ResourceId"] " * "EventDetails=["EventDetails"] "* "EventSource=["EventSource"] "* "EventType=["EventType"] "* "ExtensionVersion=["ExtensionVersion"] "* "OS=["OS"] "* "OSVersion=["OSVersion"] "*//"TimeStamp=["Time: date" ] "*
//| where Environment == "AAPRODEJP" //LAW region
| where ResourceId =~ "<Arc-Resource-Id>"
| project PreciseTimeStamp, ResourceId, Environment,EventDetails,EventSource,EventType,ExtensionVersion,OS,OSVersion,properties


