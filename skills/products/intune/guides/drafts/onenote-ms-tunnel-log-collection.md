# MS Tunnel Gateway Log Collection (Linux)

## 1. Verbose Server Logs (journalctl)
Collect logs from MS Tunnel server, agent, and monitor:
```bash
journalctl -t ocserv -t mstunnel-agent -t mstunnel_monitor > <logfilename>
```
- For Red Hat Linux: use provided shell script

## 2. Intune Portal Upload (Online Servers)
If MS Tunnel server is online, collect logs directly from Intune portal:
- Reference: [Monitor Microsoft Tunnel VPN](https://learn.microsoft.com/en-us/mem/intune/protect/microsoft-tunnel-monitor#easy-upload-of-diagnostic-logs-for-tunnel-servers)

## 3. Access Logs
By default, access logging is **disabled**. Enabling can reduce performance.

### Log Format
```
<timestamp> <ServerName> <PID> <userId> <deviceId> <protocol> <srcIP:port> <dstIP:port> <bytesSent> <bytesReceived> <connectionTimeSec>
```
Example:
```
Feb 25 16:37:56 MSTunnelTest-VM ocserv-access[9528]: ACCESS_LOG,41150dc4-...,f5132455-...,tcp,169.254.54.149:49462,10.88.0.5:80,112,60,10
```

### Enable Access Logging
1. Set `TRACE_SESSIONS=1` in `/etc/mstunnel/env.sh`
2. Set `TRACE_SESSIONS=2` to include DNS connection logging
3. Run `mst-cli server restart`

To reduce noise: set `TRACE_SESSIONS=1` (disables DNS logging) and restart.

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Linux > Gather Access Log + Gather MS Tunnel Gateway verbose log
