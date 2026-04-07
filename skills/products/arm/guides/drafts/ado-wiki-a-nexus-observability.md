---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/Observability"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FCustomer%20Scenarios%2FObservability"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Nexus Observability Troubleshooting Guide

_Date of Last Full Review: 01/04/2026_

## Troubleshooting Guides
- [NetworkCloud Observability Framework](https://eng.ms/docs/cloud-ai-platform/microsoft-specialized-clouds-msc/msc-edge/linux-edge-large/afoi-network-cloud/network-cloud-tsgs/doc/observability)

## Quick Questions Channel
- For observability questions: [Observability and Telemetry Teams channel](https://teams.microsoft.com/l/channel/19%3A1aede64efac84082b661136b64017037%40thread.tacv2/Observability%20and%20Telemetry) - tag `@lma`
- For Network Fabric observability: [Nexus Network Fabric Incident Manager/CSS Sync chat](https://teams.microsoft.com/l/chat/19:meeting_MGNiZDFlNTQtOGI0YS00YzAyLWJmNDUtNDk1NWQzZWVhOTcx@thread.v2/conversations)

## Diagnostics to Collect for Observability IcMs

When engaging the `AFOI-Network Cloud/Observability Infrastructure` team, collect ALL of the following:

1. **Problem statement:**
   - Issue description with timing (when occurred, ongoing?, time zones)
   - Scope: which resources affected, timing per instance
   - Versions of all affected clusters or cluster managers
   - Clear statement: what was attempted and failed, expected vs. observed behavior

2. **Evidence:** Logs, screenshots

3. **Customer configuration (as applicable):**
   - Diagnostics Settings (if logs missing)
   - Metrics Configurations (if optional metrics missing)
   - Alert Rule configuration (export JSON from Portal or `az monitor metrics alert show`)

4. **Severity/urgency:** Is this blocking? Is there a workaround?

## IcM Best Practices

**One Incident per problem.** Do NOT combine:
- Different metrics misbehaving on the same resource (unless related/simultaneous)
- Different alert rules with similar config (unless simultaneous instances)
- Observability pods hitting unrelated errors at different times

**When reopening:** Include clear statement of what still needs addressing.

## IcM Description Template

For IcMs against `AFOI-Network Cloud/Observability Infrastructure`:
```
Problem statement
-----------------
- Issue description
- Timeframe
- Scope
- Versions
- Customer urgency

Supporting evidence
-------------------
- Logs
- Screenshots

Customer configuration
----------------------
- Logs: <diagnostics settings>
- Metrics: <metrics configuration>
- Alerts: <alert rule JSON>
```

For Network Fabric observability, raise IcM against `Nexus Network Fabric/Network Fabric Triage`.

## References
- [Azure Operator Nexus observability](https://learn.microsoft.com/en-us/azure/operator-nexus/concepts-observability)
- [Azure Monitor alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview)
- [Azure Operator Nexus ARM alerts templates](https://github.com/microsoft/AzureMonitorCommunity/tree/master/Azure%20Services/Azure%20Operator%20Nexus#alert-rules)
