---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Collaboration Guides/Escalating to the Azure Log Analytics product group/Escalating issues to the Log Analytics Portal team"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCollaboration%20Guides%2FEscalating%20to%20the%20Azure%20Log%20Analytics%20product%20group%2FEscalating%20issues%20to%20the%20Log%20Analytics%20Portal%20team"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Escalating Issues to the Log Analytics Portal Team

## Pre-Escalation Checks
Before escalating to the Portal team:
1. Test the customer scenario in different browsers and InPrivate/Incognito mode
2. Test on different machines
3. Examine proxy configuration as it may impact customer experience
4. Verify the Azure Portal page is supported by Log Analytics team (How to: Check if a portal page is supported by Log Analytics team)

## Data Collection for IcM
- Collect HTTP network trace in HAR/SAZ format (Fiddler preferred by PG)
- Attach a screenshot demonstrating the issue
- Alternative: use FiddlerCap for non-technical customers

## Uploading Information to ICM
1. Upload the captured trace to DTM and provide the HAR/Trace link in the IcM discussion thread
2. Indicate the start and end times of the issue
3. Include CorrelationId/RequestID if available
4. If possible, obtain examples of both effective and problematic behaviors

## Logs Portal IcM Template
Name: X-Portal-Route-CRI
Supported topics:
- Azure dashboard Logs parts (dashboard parts - LogsDashboardParts)
- Embedded Query Editor (Alerts Editor and Sentinel editor)
- Logic App Connector
- Log Analytics Workspace UX
- Logs Blade

## ASC Template
In ASC, select the Portal CRI Template for creating the IcM.
