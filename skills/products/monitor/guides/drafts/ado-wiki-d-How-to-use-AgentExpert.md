---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/AgentExpert/How to use AgentExpert"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FAgentExpert%2FHow%20to%20use%20AgentExpert"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to use AgentExpert

AgentExpert is a desktop diagnostic tool for analyzing Azure Monitor Agent (AMA) troubleshooter output on both Windows and Linux.

## Download
[AgentExpert Download](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1495715/AgentExpert?anchor=download)

## Launch AgentExpert
Click **Start->All Apps->AgentExpert**

## Open Windows AMA .ZIP file
Open via File menu or drag and drop the .ZIP file from the Windows AMA troubleshooter.

## Open Linux AMA folder
Open via File menu or drag and drop the folder from the Linux AMA troubleshooter.

## Analyze Data

### Error List Tab
The primary view with two error lists:
- **Priority Error List** (top): Errors containing keywords like **Error/Fail/FATAL** plus references to endpoints (monitor.azure.com, HIMDS) or WINHTTP error codes. These likely directly impact agent operation. Summarized (duplicates collapsed with '+' symbol).
- **General Error List** (bottom): All log entries containing **Error**, **Fail**, or **Fatal** keywords. Multi-selectable and copy-enabled.

**Data sources**: Linux = `mdsd.err`, Windows = `MaEventTable.csv`

Default view shows last 1 hour, sorted descending (most recent first). Adjustable via time filters (bottom right).

Context-sensitive assistance: right-clicking a line with keywords matching a known TSG provides a direct link to the TSG.

### Host Info Tab
Contains host information: Hostname, OS Version, Architecture, AMA version. Additional info may include ResourceId, (H)IMDS output, Python Version, Time Zone, IP addresses, Total/Available memory. Each window supports copy to clipboard for case notes.

### Extension Tab
- **Windows AMA**: Lists extension log files; selecting one displays contents (top right) with errors listed below (bottom right). Selecting an error highlights it in the log.
- **Linux AMA**: Shows extension log from current AMA version with same error highlighting behavior.

### ExtensionHealth Tab
Same layout as Extension tab but for ExtensionHealth logs.

### DCR Tab
Three windows:
1. **DCR list** (top left): Data Collection Rules found in log output
2. **DCR JSON view** (right): JSON formatted view of selected DCR
3. **DCR errors** (bottom left): Known conditions that break DCRs

Example: "DataSource is missing a SendToChannel" - known condition from improperly modified Sentinel DCR via Azure Monitor DCR portal.

### ServiceTags Tab
Matches an IP address to Azure Service Tags. Enter IP in text box and click Check IP. AgentExpert attempts to locate `ServiceTags_Public_<date>.json` in Downloads folder (downloads if not found).

### MCSConfig Tab
Shows snapshot of MCSConfig (running configuration from all DCRs):
- **LogType**: Data type being collected
- **Name**: Reference name (often referenced in error logs)
- **GloballyUniqueChannelId**: Immutable ID for DCR
- **Endpoint**: Data destination endpoint
- **Workspace ID**: Log Analytics workspace ID

Note: MCSConfig.latest.xml (Windows) or MCSConfig.lkg.xml (Linux) represents the rendered configuration, not the DCR itself.

### DNS Results Tab
DNS name test results from Windows AMA troubleshooter. Blank for Linux.

### QOS Tab
Collection rate statistics per data type with Events Per Second (EPS) calculation.
- **Linux AMA**: Source is `mdsd.qos`, provides 15-minute summarization intervals
- **Windows AMA**: Source is `MaQOSEvent.csv`, processed as one element for entire file duration

Use to validate collection rate falls within documented agent limits.
