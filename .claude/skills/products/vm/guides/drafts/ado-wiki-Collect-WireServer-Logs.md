---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Collect WireServer Logs_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FCollect%20WireServer%20Logs_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect WireServer Logs

Short URL: https://aka.ms/agexWireserverLogs

## HostAnalyzer (Automatic Collection)

In **Azure Support Center** (ASC) → **Resource Explorer** → select VM → **Diagnostics** tab.

HostAnalyzer runs by default at case submission and includes WireServer logs in `..\Logs\Logs\WireServerLogs` folder. Select **Create Report** for different node or timeframe.

## Jarvis Operation - Node WireServer Logs

### Prerequisites
Request access to OneIdentity group `AME\TM-PullNodeDiaglogs-VM` from SAW. All TAs have been added.

### Steps
1. Get the following info from Deployment Execution Graph or ASC Resource Explorer:
   - NodeID
   - Fabric Host = Compute cluster
   - Tags = wireserverlogs
   - Start Time / End Time
2. Go to [Jarvis](https://jarvis-west.dc.ad.msft.net/EDB63D09)
3. Enter inputs and click **Run**
4. Wait 5-10 minutes for ZIP download
5. WireServer logs are in the **WireServer** folder

## Next Steps
- [Provisioning Agent Advanced TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495735)
- [Guest Agent Advanced TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495025)
- [Extensions Advanced TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495023)
