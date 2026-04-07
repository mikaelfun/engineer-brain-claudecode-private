# DEFENDER MDC 数据隐私与驻留 — Troubleshooting Quick Reference

**Entries**: 5 | **21V**: all applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/mdc-data-privacy.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MDC Continuous Export configured but no messages arriving in Event Hub |  | 1) Verify Continuous Export settings (correct EH namespace, hub, data types selected). 2) Check E... | 🟢 8.5 | ADO Wiki |
| 2 | MDC Continuous Export sending only partial alerts/recommendations to Event Hub - some items visib... |  | Use Service Bus Explorer to inspect events directly: connect with EH namespace connection string,... | 🟢 8.5 | ADO Wiki |
| 3 | Need to verify whether a specific MDC security alert was exported to Event Hub via Continuous Export |  | Kusto: cluster('romeservicelogs').database('RomeServiceProd').ServiceFabricDynamicOE / where env_... | 🟢 8.5 | ADO Wiki |
| 4 | Continuous Export logs are not being forwarded to the Log Analytics Workspace; discrepancies in C... | Incorrect or missing Continuous Export settings, failed actions in the CE process, or issues with... | Use Kusto queries on rometelemetrydata/RomeServiceProd clusters to diagnose: PlaybookConfiguratio... | 🟢 8.5 | ADO Wiki |
| 5 | Continuous Export to isolated/private Event Hubs behind a Virtual Network (vNet) fails to send al... | Private/isolated Event Hub resources behind a vNet block Continuous Export connections; MDC servi... | Select 'Export as a trusted service' option in MDC Continuous Export settings (available since 26... | 🟢 8.5 | ADO Wiki |

## Quick Troubleshooting Path

1. 1) Verify Continuous Export settings (correct EH namespace, hub, data types selected). 2) Check EH namespace Networking - enable 'Allow trusted Microsoft services to bypass firewall'. 3) Validate i... `[Source: ADO Wiki]`
2. Use Service Bus Explorer to inspect events directly: connect with EH namespace connection string, create consumer group listener, verify events. If events in EH but missing in 3rd party SIEM, invol... `[Source: ADO Wiki]`
3. Kusto: cluster('romeservicelogs').database('RomeServiceProd').ServiceFabricDynamicOE / where env_time > ago(10d) / where operationName == 'InvokerActorService.InvokeActionEventHub' / where customDa... `[Source: ADO Wiki]`
4. Use Kusto queries on rometelemetrydata/RomeServiceProd clusters to diagnose: PlaybookConfigurationSnapshotsAggregation for config snapshot checks (filter by FamilyId containing SubscriptionId), Ser... `[Source: ADO Wiki]`
5. Select 'Export as a trusted service' option in MDC Continuous Export settings (available since 26/12/2022). Alternative workarounds: 1) Add MDC Service Tag IP ranges (20.44.10.224/27, 52.168.112.96... `[Source: ADO Wiki]`
