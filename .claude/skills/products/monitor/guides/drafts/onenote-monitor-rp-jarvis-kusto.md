# Monitor RP Jarvis/Kusto Diagnostics

## Overview
Diagnostic tools for Azure Monitor Resource Provider (RP) troubleshooting in Mooncake environment.

## Jarvis Dashboards

### Incoming & Outgoing Requests
- Dashboard: https://portal.microsoftgeneva.com/s/D18A905F
- Use to check Monitor RP incoming requests from ARM and outgoing requests to backend services

### Get Activity ID from Correlation ID
- Dashboard: https://portal.microsoftgeneva.com/s/8285315A
- Flow: correlationID → activity ID → detailed trace

## Kusto Cluster

| Service | Cluster URL | Access |
|---------|------------|--------|
| Insights/Monitoring/Autoscale | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn | MyAccess: AzMon Essentials Logs |

## Important Notes
- **Context activity logs** are in the `SvcInformational` table of **Jarvis only** - Kusto does not contain this table
- For Mooncake Monitor RP diagnostics, Jarvis is the primary tool for service-level traces

## Source
- OneNote: Mooncake POD Support Notebook > MONITOR > ## Monitor > Mon RP Jarvis/Kusto
