---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Windows Agent Basics (Microsoft Monitoring Agent)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FWindows%20Agent%20Basics%20(Microsoft%20Monitoring%20Agent)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies To:
- Microsoft Monitoring Agent :- All versions

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

# Must Know Agent Details:

- Confirm Azure Subscription for Workspace is Active
- Workspace: Workspace ID configured for MMA Agent when connecting to Log Analytic workspace.
- MMA Agent certificate with correct Hostname of Computer.
- Proxy Settings of MMA Agent connecting to workspace via Either OMS Gateway or an actual corporate proxy.
- Agent Topology means how agent is configured to connect to workspace? Direct Agent or via Scom Integration.
- Document customer's Installed MMA Agent Version.

# Basic Requirements to run the Windows Log Analytics Agent:
- Supported Operating System Version
- TLS & Network / Firewall Requirements

---

# Previously released MMA Agent builds by version

- Previous Releases prior to May 2019:
  `\\cdmbuilds\Archive\OnPrem\MAIN\MonAgent\builds\MONAGENT.BLUE.MAIN\EN`

- Future Releases May 2019 Onwards:
  `\\cdmbuilds\archive\OnPrem\MonAgentMain\MonAgent\builds\MonAgent.MonAgentMain\EN`

---

# ETL Data Collection

It is strongly recommended to capture ETL healthservice traces using Getagentinfo.ps1 script.

In rare cases where getagentinfo.ps1 is not executing properly, one can manually capture healthservices traces of Log analytic MMA agent.

On Affected MMA Agent machine:
1. Open a command prompt window as Administrator.
2. At the command prompt, go to the following directory: `%programfiles%\Microsoft Monitoring Agent\Agent\Tools`
3. Run the following command to stop trace logging:
```
StopTracing.cmd
```
4. Run the following command to enable verbose trace logging:
```
StartTracing.cmd VER
```
* Be aware that the trace level option in the above command (VER) must be UPPERCASE
5. Reproduce the issue.
6. At the command prompt, run the following command to stop trace logging:
```
StopTracing.cmd
```
7. Then run this command:
```
FormatTracing.cmd
```
* Wait until all the Traces get converted
8. Collect the traces (*.log files) from the folder path `C:\windows\logs\OpsMgrTrace`

## Decoding ETLs

1. Identify which Advisor Knowledge build was most recently published to Public. Look for the last entries on this page: https://scadvisorcontent.blob.core.windows.net/ipcontentdirectagent/IntelligencePackHistory.xml
2. Go to the corresponding build in Advisor Knowledge repo: `\\reddog\builds\branches\git_mgmt_loganalytics_advisorknowledge_master\{version}\`
3. Download the TMF file: `\\reddog\builds\...\retail-amd64-deploy\Symbol\AdvisorKnowledge_{version}_Release.tmf`
4. Place the above TMF file in agent TMF folder: `C:\Program Files\Microsoft Monitoring Agent\Agent\Tools\TMF`
5. Now you are all set to decode the managed traces.

*Note: If you are looking at older traces, you will have to go to an older Advisor Knowledge public build to download the TMF.

---

# Windows Agent cache, retry and buffer

| How long is the data cached/buffered? | Minimum and maximum size of the cache/buffer? | What happens if the link/network to LAW is down? |
|--|--|--|
| Max 8.5 hours. Agent backs off exponentially over 10 retries up to 8.5 hours. The agent never gives up - after retrying 10 times, it will continue to retry every 8.5 hours until it gets connectivity again. Data is discarded when the buffer max is reached. The retry time is slightly randomized to avoid all agents retrying at the same time. | 100 MB the default max setting and the maximum is 1.5 GB. This can be modified in the registry. | The agent backs off retrying exponentially up to 8.5 hours per retry. It will continue to retry every 8.5 hours indefinitely and discard oldest data when the buffer limit is reached. When the agent is able to successfully connect, it will upload data until it is back to processing the latest data. |
