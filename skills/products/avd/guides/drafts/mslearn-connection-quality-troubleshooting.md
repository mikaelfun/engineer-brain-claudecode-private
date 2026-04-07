# AVD Connection Quality Troubleshooting Guide

> Source: [Troubleshoot connection quality in Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-connection-quality)

## Latency Thresholds

| Latency | Impact |
|---------|--------|
| < 150ms | No impact (even for non-rendering tasks) |
| 150-200ms | Fine for text processing |
| > 200ms | Affects user experience noticeably |

## Diagnosing Round Trip Time Issues

Use **Connection Network Data** diagnostic table in Log Analytics to identify factors:
- Network configuration
- Network load
- VM load

### Common Causes of High Latency
1. Unstable local internet connection (latency > 200ms)
2. Network saturation or rate-limiting
3. Physical distance between end-user and Azure region
4. Firewall/ExpressRoute/network configuration overhead
5. Insufficient compute resources (CPU/memory)

### Remediation Steps
1. **Reduce physical distance**: Connect users to VMs in closest Azure region
2. **Check network config**: Review firewall, ExpressRoute settings
3. **Check bandwidth**: Follow [network guidelines](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/network-guidance)
4. **Check compute**: Monitor CPU (Processor Information Total% Processor Time) and Memory (Available Mbytes) via performance counters
5. **Review Azure RTT stats**: Check [Azure network round-trip latency statistics](https://learn.microsoft.com/en-us/azure/networking/azure-network-latency) every 2-3 months

## Connection Network Data Logs Not Reaching Log Analytics

- Verify diagnostic settings configured correctly
- Verify VM configured correctly
- Sessions must be actively used to send data (inactive sessions send less frequently)
- Data should arrive every 2 minutes when active
