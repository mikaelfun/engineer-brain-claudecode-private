# DEFENDER MDC 数据隐私与驻留 — Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-r5-mdc-data-privacy-residency.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Continuous Export
> Sources: ado-wiki

**1. MDC Continuous Export configured but no messages arriving in Event Hub**

- **Solution**: 1) Verify Continuous Export settings (correct EH namespace, hub, data types selected). 2) Check EH namespace Networking - enable 'Allow trusted Microsoft services to bypass firewall'. 3) Validate incoming messages in EH metrics. 4) Check ports 5671, 5672, 443 accessible.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDC Continuous Export sending only partial alerts/recommendations to Event Hub - some items visible in MDC but missing in EH**

- **Solution**: Use Service Bus Explorer to inspect events directly: connect with EH namespace connection string, create consumer group listener, verify events. If events in EH but missing in 3rd party SIEM, involve SIEM vendor. If alerts in MDC but not exported, escalate to PG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Need to verify whether a specific MDC security alert was exported to Event Hub via Continuous Export**

- **Solution**: Kusto: cluster('romeservicelogs').database('RomeServiceProd').ServiceFabricDynamicOE | where env_time > ago(10d) | where operationName == 'InvokerActorService.InvokeActionEventHub' | where customData has '{SystemAlertId}' | extend json=parse_json(customData) | project env_time, Action=json.PlaybookConfigurationId, ExportedtoEventHub=json.WasActionInvokedSuccessfully
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Continuous Export logs are not being forwarded to the Log Analytics Workspace; discrepancies in CE configuration snapshots or errors in invoking actions to Workspace/Event Hub**

- **Root Cause**: Incorrect or missing Continuous Export settings, failed actions in the CE process, or issues with Playbook/Event Hub configuration
- **Solution**: Use Kusto queries on rometelemetrydata/RomeServiceProd clusters to diagnose: PlaybookConfigurationSnapshotsAggregation for config snapshot checks (filter by FamilyId containing SubscriptionId), ServiceFabricDynamicOE with operationName InvokeActionWorkspace or InvokeActionEventHub to verify action invocation status. Mandatory data collection: provide JSON dump of Automations List REST API (Microsoft.Security/automations).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Continuous Export to isolated/private Event Hubs behind a Virtual Network (vNet) fails to send alerts and data**

- **Root Cause**: Private/isolated Event Hub resources behind a vNet block Continuous Export connections; MDC service cannot reach the private EH namespace
- **Solution**: Select 'Export as a trusted service' option in MDC Continuous Export settings (available since 26/12/2022). Alternative workarounds: 1) Add MDC Service Tag IP ranges (20.44.10.224/27, 52.168.112.96/27, etc.) to EH firewall allow list; 2) Route via MDC -> Log Analytics Workspace -> Event Hub to keep EH private.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MDC Continuous Export configured but no messages arriving in Event Hub |  | 1) Verify Continuous Export settings (correct EH namespace, hub, data types selected). 2) Check E... | 🟢 8.5 | ADO Wiki |
| 2 | MDC Continuous Export sending only partial alerts/recommendations to Event Hub - some items visib... |  | Use Service Bus Explorer to inspect events directly: connect with EH namespace connection string,... | 🟢 8.5 | ADO Wiki |
| 3 | Need to verify whether a specific MDC security alert was exported to Event Hub via Continuous Export |  | Kusto: cluster('romeservicelogs').database('RomeServiceProd').ServiceFabricDynamicOE / where env_... | 🟢 8.5 | ADO Wiki |
| 4 | Continuous Export logs are not being forwarded to the Log Analytics Workspace; discrepancies in C... | Incorrect or missing Continuous Export settings, failed actions in the CE process, or issues with... | Use Kusto queries on rometelemetrydata/RomeServiceProd clusters to diagnose: PlaybookConfiguratio... | 🟢 8.5 | ADO Wiki |
| 5 | Continuous Export to isolated/private Event Hubs behind a Virtual Network (vNet) fails to send al... | Private/isolated Event Hub resources behind a vNet block Continuous Export connections; MDC servi... | Select 'Export as a trusted service' option in MDC Continuous Export settings (available since 26... | 🟢 8.5 | ADO Wiki |
