---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/13 - Common Troubleshoot Steps"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Common Troubleshoot Steps

## Linux-based client application — TCP settings causing 15-minute connection stalls

Using optimistic TCP settings in Linux might cause client applications to experience connectivity issues. Default tcp_retries2=15 means 924.6 seconds (~15 min) before a broken connection is detected.

### Recommended TCP settings

| Setting | Value |
|--|--|
| net.ipv4.tcp_retries2 | 5 |
| net.ipv4.tcp_keepalive_time | 600 |
| net.ipv4.tcp_keepalive_probes | 5 |
| net.ipv4.tcp_keepalive_intvl | 15 |

### Check current keepalive settings

```console
sysctl -a | grep net.ipv4.tcp_keepalive
```

- net.ipv4.tcp_keepalive_time = X (idle time before first keepalive)
- net.ipv4.tcp_keepalive_probes = Y (number of retransmits)
- net.ipv4.tcp_keepalive_intvl = Z (interval between keepalives)

### Summary for long hangup connections

- Idling ESTABLISHED connection: never notices issues → solution is TCP keepalives
- Busy ESTABLISHED connection: adheres to tcp_retries2, ignores TCP keepalives
- Zero-window ESTABLISHED connection: adheres to tcp_retries2, ignores TCP keepalives

**Application side**: Implement "Command timeout" and central interval checking/reconnect rather than timeout everywhere.

Apply changes at both nodes and pods.

Ref: https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-troubleshoot-timeouts#client-side-troubleshooting

## Kubernetes hosted applications

- Check if the pod running client app or cluster nodes are under memory/CPU/Network pressure
- A pod can be affected by other pods on same node → throttle connections or IO operations
- If using **Istio** or service mesh: check proxy reserved ports (e.g. 13000-13019, 15000-15019 for Azure Redis Cache)

## Pod connectivity testing (without special tools)

### Using nmap

```console
apt update && apt install nmap
nmap -sT <ip> -p <port>
```

### Using cat (like telnet)

```console
cat < /dev/tcp/localhost/<port>
```

### Using echo (connection test only)

```console
echo < /dev/tcp/localhost/22 && echo up || echo "down"
```

> Tip: When customer says nmap is a vulnerability tool and has no telnet/nc, use `cat` and `echo` with /dev/tcp.

**Owner:** mario.chaves <mariochaves@microsoft.com>
