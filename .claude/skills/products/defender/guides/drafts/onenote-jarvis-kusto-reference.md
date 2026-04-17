# MDC Jarvis & Kusto Access Reference

> Source: OneNote — Troubleshooting Tool & Channel / Jarvis & Kusto
> Quality: draft | Needs: review, check Jarvis links accessibility

## Jarvis Dashboards

### ODS/In-Mem

Track activity for ODS injection.

### Scuba

Uses the security event hub for threat detection monitoring.

### Rome

Check if the alert generating pipeline is working as expected.

## Kusto Access

- Wiki: [Kusto Access - ADO Wiki](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Defenders%20Wiki/146187/Kusto-Access)
- Mooncake cluster: `romelogsmc.kusto.chinacloudapi.cn/Prod`

## Known Limitation (Mooncake)

- `SecureScoreV3Assessments` table does NOT exist in `Romelogsmc\RomeTelemetry`
- Cannot query recommendations for Mooncake subscriptions via this table
- PG response: "We plan on having our telemetry in MC at some point but we still don't have any timelines for that."

## Note

Secure score job runs on all population every **8 hours**.
