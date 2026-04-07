---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Wizard and ADSync service/Troubleshooting guides/Troubleshooting connectivity issues using Netmon"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FWizard%20and%20ADSync%20service%2FTroubleshooting%20guides%2FTroubleshooting%20connectivity%20issues%20using%20Netmon"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting AAD Connect/Cloud Sync Connectivity Issues with Netmon

This guide covers how to troubleshoot AAD Connect/Cloud Sync connectivity issues using Network Monitor (Netmon) or Wireshark.

## How to Collect Network Traces

Using netsh (no software installation needed):
```
netsh trace start traceFile=C:\netmon.etl capture=yes
```

After starting capture, flush DNS:
```
Ipconfig /flushdns
```

For authentication issues, also clear:
```
nbtstat -RR
klist purge
Klist -li 0x3e7 purge
```

**MANDATORY**: Also collect a text log capturing the error for correlation:
- AAD Connect wizard errors: tracelog from `C:\ProgramData\AAD Connect`
- Other errors: Application log from Event Viewer
- Cloud Sync/ProvAgent: ProvAgent log from Event Viewer or verbose logging

## Filtering Techniques

- By protocol: `DNS`, `HTTP`, `TLS`, `LDAP`, `KerberosV5`, `MSRPC`
- By IP: `ipv4.Address==192.168.0.1`
- By port: `tcp.port==443`

## TCP 3-Way Handshake

The handshake uses 3 operations: SYN, SYN-ACK, ACK.
- SYN flag: `..S.` or `CE..S.`
- SYN-ACK flag: `.A..S.`
- ACK flag: `.A..`

When the handshake cannot finish, data communication fails. This is commonly caused by firewall port blockage. You will observe SYN retransmits with doubling time deltas (3s, 6s, etc.).

## TLS Handshake

Steps: Client Hello -> Server Hello -> Server Certificate -> Key Exchange -> Finished -> Secure Data Exchange.

TLS handshake failure is almost always caused by incorrect TLS configuration on server side or SSL inspection on proxy.

## Domain Connectivity Troubleshooting

### DNS
Filter: `DNS`
- If NAME ERROR for ALL SRV AD records -> DC locator process failing
- Need to flush DNS cache before trace capture

### Required Ports (AD Connectivity)

| Service | Port | Used For |
|---------|------|----------|
| MS-RPC | 135 (TCP) | Initial AADC wizard config, password sync |
| LDAP | 389 (TCP/UDP) | Data import from AD (object sync) |
| SMB | 445 (TCP) | Seamless SSO computer account, password writeback |
| RPC Dynamic | 49152-65535 (TCP) | AADC wizard binding, password sync |

### Troubleshooting Steps

1. **Domain not found errors**: Filter by `DNS`, check for NAME ERROR on SRV AD records
2. **DC IP unreachable**: Filter by `ipv4.Address==<DC_IP>`, look for SYN retransmits (port blocked by firewall)
3. **Port 135 blocked**: Filter `tcp.port==135`, check for failed 3-way handshake
4. **Dynamic port blocked**: After successful port 135 EPM response, note the dynamic port in `[NNNNN]`, filter by that port to check handshake

### Proxy Configuration

Check system proxy:
```
netsh winhttp show proxy
```

Set proxy:
```
netsh winhttp setproxy proxy-server="proxyaddress:port"
```

Proxy misconfiguration is a common cause of connectivity issues between on-prem servers and Azure endpoints.

## Web/Azure Connectivity

For issues connecting to Azure endpoints, filter by destination IP or port 443, check TLS handshake completion and proxy interference.
