---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to Capture ETL Traces for Healthservice in MMA Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20Capture%20ETL%20Traces%20for%20Healthservice%20in%20MMA%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Capture ETL Traces for Healthservice in MMA Agent

Applies To: Microsoft Monitoring Agent - All versions

## Scenario
Analyzing the event trace log (.etl) file helps understand connectivity between the machine and the network. These traces are useful to narrow down issues related to agent connectivity.

> **Note**: The Getagentinfo.ps1 script under updated MMA Agent already performs this step automatically. This article is shared in case the PowerShell script is unable to execute.

## High level steps

1. **Stop the agent** on the affected server

2. **Rename Health Service State folder**:
   `C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State`

3. **Enable agent trace in verbose mode**:
   Open an administrative command prompt and navigate to:
   `C:\Program Files\Microsoft Monitoring Agent\Agent\Tools`
   Run:
   ```cmd
   Stoptracing.cmd
   Starttracing.cmd VER
   ```

4. **Start the MMA agent**

5. **Wait for the related error** to reproduce

6. **Stop Agent trace and format ETL logs**:
   Navigate to `C:\Program Files\Microsoft Monitoring Agent\Agent\Tools` and run:
   ```cmd
   Stoptracing.cmd
   FormatTracing.cmd
   ```

7. **Collect logs** from: `C:\Windows\Logs\OpsMgrTrace`
   Have the customer zip these files and upload them.

8. **Export Operation Manager event log** (under Application and Service Logs in Event Viewer) from the affected server and upload it to the workspace.
