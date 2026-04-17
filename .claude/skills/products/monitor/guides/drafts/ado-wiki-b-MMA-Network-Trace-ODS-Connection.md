---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to Analyze Network Trace/How to analyze MMA Network Trace ODS Connection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20Analyze%20Network%20Trace%2FHow%20to%20analyze%20MMA%20Network%20Trace%20ODS%20Connection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to analyze MMA Network Trace - ODS Connection

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

The DNS query resolves the ODS endpoint name to an IP address. DNS queries are cached by Windows so you may need to flush DNS cache after starting the trace but before starting the HealthService.

Look for DNS query for `{workspaceId}.ods.opinsights.azure.com`.

## TCP 3-way Handshake

The Agent makes a TCP connection to the IP address returned in DNS response. Verify the standard SYN → SYN-ACK → ACK handshake on port 443 (HTTPS).

## TLS Handshake

After the 3-way handshake, TLS is negotiated:

### Client Hello
- **TLS version must be 1.2**
- Verify cipher suites list — **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384** is known to work and should be enabled
- Validate the **ServerName** extension matches the ODS endpoint

### Common Failure Scenarios

**Scenario 1 — Cipher mismatch**: If Azure doesn't find a compatible cipher, it responds with TCP Reset. Ensure TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 is listed in Client Hello.

**Scenario 2 — Firewall blocking**: If a network firewall isn't configured to allow the connection, it may issue a TCP reset impersonating the Azure endpoint. Look for **R** (Reset) flag in TCP:Flags.

### Server Hello
- Verify the TLSCipherSuite selected (e.g., TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384)
- Validate the certificate Issuer is a Microsoft CA

## HTTPS/SSL Inspection Detection

If a firewall performs HTTPS inspection, it uses its own CA or the customer's internal CA instead of Microsoft's. The Agent detects this man-in-the-middle and prevents the connection.

**Indicator**: Certificate Issuer is NOT a Microsoft CA (e.g., shows Fiddler or internal CA name).

## Success

A successful TLS negotiation shows:
1. Client sends Certificate + Client Key Exchange + Certificate Verify + Cipher Change Spec
2. Server responds with Cipher Change Spec + Encrypted Handshake Message
3. SSL Application Data begins flowing

The client uses a self-signed cert from the Microsoft Monitoring Agent certificate store for authentication.
