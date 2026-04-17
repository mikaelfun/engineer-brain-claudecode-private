---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AKS troubleshooting DNS issues lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20troubleshooting%20DNS%20issues%20lab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS troubleshooting DNS issues lab example

## Summary

Guide for setting up and resolving AKS cluster intermittent DNS issues. Includes opensource tools for automated pod network traffic capture and basic traffic capture analysis.

## Lab setup

Deploy AKS DNS troubleshooting lab using Bicep template:

```bash
git clone https://github.com/sturrent/aks-dns-troubleshooting-bicep.git
cd aks-dns-troubleshooting-bicep
az deployment sub create --name aks-dns-lab1 -l southcentralus --template-file main.bicep
```

Confirm cluster status:

```bash
az aks show -g aks-dns-ex1-rg -n aks-dns-ex1 -o table
az aks get-credentials --resource-group aks-dns-ex1-rg --name aks-dns-ex1 --overwrite-existing
```

## Problem description

Deployment "db-check" intermittently fails to resolve DNS record `db.contoso.com` with NXDOMAIN:

```text
Date = Sun Mar 31 16:05:29 UTC 2024 - Status = Success: host db.contoso.com resolves to 10.100.0.7
Date = Sun Mar 31 16:05:34 UTC 2024 - Status = Error: not able to resolve host db.contoso.com, fails with:
Server:         172.16.0.10
Address:        172.16.0.10#53
** server can't find db.contoso.com: NXDOMAIN
```

## Troubleshooting steps — Multi-layer DNS isolation

DNS resolution layers to check (top to bottom):
1. CoreDNS pods
2. CoreDNS service
3. Nodes
4. VNET DNS

### 1. Testing at CoreDNS pod level

Deploy test pod:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: aks-test
spec:
  containers:
  - name: aks-test
    image: sturrent/debian-ssh
    command: ["/bin/sh"]
    args: ["-c", "while true; do sleep 1000; done"]
EOF
```

Get CoreDNS pod IPs and test resolution:

```bash
kubectl -n kube-system get po -l k8s-app=kube-dns -o wide
FQDN="db.contoso.com"; DNS_SERVER="<COREDNS_POD_IP>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

### 2. Testing at CoreDNS service level

```bash
kubectl -n kube-system get svc kube-dns
FQDN="db.contoso.com"; DNS_SERVER="<KUBEDNS_SERVICE_IP>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

### 3. Testing at Node level

```bash
grep ^nameserver /etc/resolv.conf
FQDN="db.contoso.com"; DNS_SERVER="<DNS_SERVER_IN_NODE_CONF>"; for i in $(seq 1 1 10); do echo "host= $(dig +short ${FQDN} @${DNS_SERVER})"; sleep 1; done
```

### 4. Testing at VNET DNS level

Check VNET DNS server configuration and verify each server can resolve the target record.

## Using dumpy for pod traffic capture

Install krew + dumpy:

```bash
kubectl krew update; kubectl krew install dumpy
```

Start capture on CoreDNS deployment:

```bash
kubectl dumpy capture deploy coredns -n kube-system -f "-i any port 53" --name dns-cap1
kubectl dumpy get -n kube-system
```

Export and merge captures:

```bash
mkdir dns-captures
kubectl dumpy export dns-cap1 ./dns-captures -n kube-system
mergecap -w coredns-cap1.pcap dns-cap1-<POD1>.pcap dns-cap1-<POD2>.pcap
```

### Wireshark analysis filters

| Filter | Purpose |
|--------|---------|
| `_ws.col.info matches "db.contoso.com"` | Filter specific domain queries |
| `(dns.flags.response == 0) && ! dns.response_in` | DNS queries without response |
| `dns.time >= 0.250` | Queries taking 250ms+ |

Use Statistics > DNS tab for query/response counts and timing analysis.

Stop and clean up:

```bash
kubectl dumpy stop dns-cap1 -n kube-system
kubectl dumpy delete dns-cap1 -n kube-system
```

## Mitigation Steps

### Option 1: Custom CoreDNS config (recommended)

Force CoreDNS to use Azure internal DNS for specific domain:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  contoso.server: |
    contoso.com:53 {
        errors
        cache 30
        forward . 168.63.129.16
    }
EOF
kubectl -n kube-system rollout restart deployment coredns
```

### Option 2: Remove public DNS from VNET

Check current VNET DNS:

```bash
az network vnet show -g vnet-aks-dns-ex1-rg -n aks-vnet --query dhcpOptions.dnsServers
```

Remove public DNS servers (1.1.1.1, 8.8.8.8), keep only 168.63.129.16. Requires node reboot or `netplan apply` (Ubuntu) to renew DHCP.

**Note:** Other custom DNS servers may be needed for resolving other domains.

## References

- [Troubleshoot DNS resolution failures from inside the pod but not from the worker node](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-dns-failure-from-pod-but-not-from-worker-node)
- [Customize CoreDNS with Azure Kubernetes Service](https://learn.microsoft.com/en-us/azure/aks/coredns-custom)
