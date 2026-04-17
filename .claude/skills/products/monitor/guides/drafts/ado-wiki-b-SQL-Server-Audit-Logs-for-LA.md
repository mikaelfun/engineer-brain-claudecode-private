---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How to collect OnPrem SQL Server Audit logs for Log analytics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20to%20collect%20OnPrem%20SQL%20Server%20Audit%20logs%20for%20Log%20analytics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to collect OnPrem SQL Server Audit logs for Log Analytics

## Scenario
This article discusses steps for Azure Log Analytics (MMA) Agent to collect and upload SQL Server audit logs into Azure Log Analytics, supporting SQL Server both on-premises, as well as on Azure VMs.

## Enable SQL Server Audit Logs
SQL Server audit logs need to be written to the Windows Application Log. This can be configured using T-SQL, as well as via the Audit Properties in SSMS:

**T-SQL example:**

```sql
CREATE SERVER AUDIT MyServerAudit
TO APPLICATION_LOG
WITH (QUEUE_DELAY = 1000, ON_FAILURE = CONTINUE)
```

## Configuring MMA for LA Workspace

After setting up SQL Server auditing, the Azure Log Analytics (OMS) agent should be configured to send logs to a Workspace. This can be done from Control Panel --> Microsoft Monitoring Agent Properties --> Azure Log Analytics (OMS).

## Enabling Windows Event Log collection on Workspace
The Azure Log Analytics Workspace needs to be configured to collect Application Logs. This can be done from the Azure Log Analytics / OMS portals via Classic → Legacy agents management → Windows event logs → Application.

Once the MMA agent starts sending the events logs to the LA workspace, all the logs appear in the "Event" table:

```kusto
Event
| where Source has "MSSQL"
| project TimeGenerated, Source, Computer, EventID, RenderedDescription
```

All critical information about audit events is available in the **RenderedDescription** column including Action ID, Client IP, Current Logged on User, Database Name, Object Name and SQL Statement.

> **Important**: Legacy MMA agent will capture all Event IDs from Application log. Suggest customer to consider migrating to AMA agent. AMA agent via DCR can collect specific Event ID from event viewer logs, which means less data to ingest and more savings. See [Filter events using XPath queries](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent?tabs=portal#filter-events-using-xpath-queries).
