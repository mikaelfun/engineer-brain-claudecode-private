# Monitor Log Analytics 自定义日志

**Entries**: 3 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Custom log table query returns 400 Bad Request when run in resource context (... | Resource context queries are only supported for specific resource types: subs... | Inform customer this is not supported. They should run the query in workspace... | 8.5 | ADO Wiki |
| 2 | Custom log table query returns 400 Bad Request in resource context (from Azur... | Resource context queries only supported for: subscription, resourceGroup, mic... | Not supported. Run query in workspace context instead. AzureNetworkAnalytics_... | 8.5 | ADO Wiki |
| 3 | AMA Linux JSON log collection stops working after upgrading to AMA Linux 1.31... | Breaking change from preview to GA: JSON logs now auto-parsed into columns ma... | Use ARM template with table schema matching JSON tags instead of portal-creat... | 8.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/la-custom-logs.md)
