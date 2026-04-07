---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to Analyze Network Trace/How to analyze MMA Network Trace OMS Connection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20Analyze%20Network%20Trace%2FHow%20to%20analyze%20MMA%20Network%20Trace%20OMS%20Connection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to analyze MMA Network Trace - OMS Connection

Applies To: Microsoft Monitoring Agent - All versions

## Capture Steps

From an administrative command prompt run:

```dos
net stop healthservice
ren "C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State" "Health Service State.old"
netsh trace start capture=yes
ipconfig /flushdns
net start healthservice
** wait five minutes **
netsh trace stop
```

## DNS Lookup

Look for DNS query for `{workspaceId}.oms.opinsights.azure.com`.

The endpoint is typically aliased to `oms-analytics.trafficmanager.net` which resolves to a regional host (e.g., `ipv4-cses-oms-eus-prod.eastus.cloudapp.azure.com`). The exact names and IPs will vary — the important thing is that an IP address was returned.

> **NOTE**: If a proxy server or OMS Gateway is used, the Agent will NOT make a DNS query for the endpoint. It may instead query the proxy server IP. This is a clue if proxy is configured and the customer is unaware.

## TCP 3-way Handshake

The Agent makes a TCP connection to the IP address returned in DNS response on port 443 (HTTPS). Verify the standard SYN → SYN-ACK → ACK handshake.

## TLS Handshake

### Client Hello
- **TLS version must be 1.2**
- Verify cipher suites — **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** must be enabled
- Validate the **ServerName** extension matches the OMS endpoint

> **NOTE**: If there is no Client Hello message present, this may indicate that the required ciphers are disabled. **(Even if those ciphers appear present based on results from Get-TlsCipherSuite)** If ciphers are disabled, you will see event ID 4008 logged by OperationsManager.

### Common Failure Scenarios

**Scenario 1 — Cipher mismatch**: Azure responds with TCP Reset if no compatible cipher found. Ensure TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 is in Client Hello.

**Scenario 2 — Firewall blocking**: Firewall may issue TCP reset impersonating Azure endpoint. Look for **R** (Reset) flag in TCP:Flags. A TCP FIN (**F** flag) may also be used.

### Server Hello
- Verify TLSCipherSuite selected
- Validate certificate Issuer is a Microsoft CA

## HTTPS/SSL Inspection Detection

If a firewall performs HTTPS inspection, it substitutes its own CA certificate. The Agent detects this man-in-the-middle scenario and prevents the connection from completing.

## Success

A successful negotiation shows Client Key Exchange with the self-signed cert from the MMA certificate store, followed by symmetric encryption key exchange and SSL Application Data.
