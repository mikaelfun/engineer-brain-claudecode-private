---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/Troubleshooting Guides/Troubleshooting AMA-Linux Common Event Format [CEF] collection for Sentinel"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Linux%2FTroubleshooting+Guides%2FTroubleshooting+AMA-Linux+CEF+collection+for+Sentinel"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting AMA Linux CEF Collection for Sentinel

## Scope
CEF syslog messages collected via **Sentinel CEF connector** into **CommonSecurityLog** table. If customer uses standard Syslog DCR → data goes to **Syslog** table instead (different TSG).

## SAP Path
Azure/Data Collection Rules (DCR) and Agent (AMA)/I created a DCR but the data is not in the Log Analytics Table/No SysLogs/RSysLogs in Log Analytics Workspace

## Data Collection
Run AMA Linux Troubleshooter first. If unavailable, collect:
- rsyslog: `/etc/rsyslog.conf`, `/etc/rsyslog.d/10-azuremonitoragent.conf` (≤1.27.x) or `10-azuremonitoragent-omfwd.conf` (≥1.28.x)
- syslog-ng: `/etc/syslog-ng/conf.d/azuremonitoragent.conf`, `/etc/syslog-ng/syslog-ng.conf`
- AMA logs: `/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/*`, `/var/opt/microsoft/azuremonitoragent/log/mdsd.*`

## Troubleshooting Steps

1. **Which syslog provider?** — rsyslog (most common) vs syslog-ng
2. **DCR downloaded for Syslog?** — Verify DCR has `Microsoft-CommonSecurityLog` stream, correct facilityNames and logLevels, destination to workspace, and dataFlow including the stream
3. **Agent heartbeating?** — Check Heartbeat table
4. **CEF data really missing?** — Query: `CommonSecurityLog | where _ResourceId contains "<AgentName>"` (note: forwarded CEF events use source Computer, not agent Computer)
5. **Syslog workflow in place?**
   - AMA ≤1.27.x: Check `/etc/rsyslog.d/10-azuremonitoragent.conf` uses Unix Domain Socket (`$OMUxSockSocket /run/azuremonitoragent/default_syslog.socket`)
   - AMA ≥1.28.x: Check `/etc/rsyslog.d/10-azuremonitoragent-omfwd.conf` uses TCP forwarding to `127.0.0.1:28330`
   - Ensure rsyslog.conf includes `/etc/rsyslog.d/*.conf`
6. **CEF forwarder configured?** — For remote CEF sources, ensure rsyslog/syslog-ng is configured to accept remote syslog and forward to AMA
7. **mdsd errors** — Check `/var/opt/microsoft/azuremonitoragent/log/mdsd.err` for connection failures

## Key Differences: CEF vs Syslog
- Sentinel CEF connector → CommonSecurityLog table
- Standard Syslog DCR → Syslog table
- CEF forwarded events: `_ResourceId` = agent, `Computer` = source

## IcM Escalation
| Scenario | Path |
|----------|------|
| Linux AMA syslog/CEF issues | Azure Monitor Data Collection/AMA Linux |
| DCR create/delete/associate | Azure Monitor Control Service (AMCS)/Triage |
