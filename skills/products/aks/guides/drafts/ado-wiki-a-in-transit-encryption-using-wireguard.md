---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/In-Transit Encryption using WireGuard"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FIn-Transit%20Encryption%20using%20WireGuard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# In-Transit Encryption using WireGuard

## Overview

WireGuard is used with Cilium to encrypt pod-to-pod traffic at the network layer. Cilium automatically establishes WireGuard tunnels between nodes using public keys.

## Prerequisites

- Cilium Dataplane enabled (check ASI: Networking > Networking Features > Cilium Dataplane)
- Kubernetes v1.29.0 or later

## Verification Steps

### 1. Check cilium-agent
```bash
kubectl get pods -n kube-system -l k8s-app=cilium
```

### 2. Check ConfigMap
```bash
kubectl get cm -n kube-system cilium-config -o yaml | grep enable-wireguard
```

### 3. Check Cilium Status
```bash
kubectl exec -it -n kube-system {cilium-pod} -- cilium status
```

### 4. Check Peering (Cilium 1.16+)
```bash
kubectl exec -it -n kube-system {cilium-pod} -- cilium-dbg encrypt status
```

### 5. Manual Verification (all versions)
```bash
kubectl node-shell -x <node-name>
chroot /host/
apt update && apt install wireguard -y
ip link show cilium_wg0    # Should show UP state
wg show                     # Should show peers with handshake times
```

## Troubleshooting

### Verify IP Reachability
```bash
kubectl node-shell -x <node-name>
chroot /host/
ping -c 4 {another-node-ip}
```

### Verify Port Not Blocked (UDP 51871)

Node 1: `echo "this works" | nc -u -q 0 <node2-ip> 51871`
Node 2: `tshark -i eth0 -f "udp port 51871"`

If no packets seen, check: IPtables, NSGs, and other network filtering technologies.

## References

- [Upstream Cilium WireGuard docs](https://docs.cilium.io/en/latest/security/network/encryption-wireguard/)
