# AVD RDP Shortpath Troubleshooting Guide

> Source: [Troubleshoot RDP Shortpath](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-rdp-shortpath)

## Diagnostic Tool

**avdnettest.exe** — validates STUN/TURN connectivity and NAT type.
Download: https://raw.githubusercontent.com/Azure/RDS-Templates/master/AVD-TestShortpath/avdnettest.exe

### Expected Output (Success)
```
Checking DNS service ... OK
Checking TURN support ... OK
Checking ACS server <IP:Port> ... OK
You have access to TURN servers and your NAT type appears to be 'cone shaped'.
Shortpath for public networks is very likely to work on this host.
```

## Log Analytics Error Codes

### ShortpathTransportNetworkDrop
- **TCP path**: session host → gateway → client (two hops)
- **UDP path**: session host → client (direct, no gateway)
- UDP has no RST mechanism → connection loss detected only by timeout
- Most TCP errors are RST-triggered (fast); UDP errors are always timeout-based (slow)

### ShortpathTransportReliabilityThresholdFailure
- Triggered when a specific packet fails after 50 retransmission attempts
- Scenarios:
  - Low RTT connection suddenly dies → 50 retries happen fast (< 17s default timeout)
  - Packet too large → probed MTU fluctuated and packet consistently fails

### ConnectionBrokenMissedHeartbeatThresholdExceeded
- RDP-level timeout triggers before UDP-level timeout
- Caused by heartbeat timeout misconfiguration
