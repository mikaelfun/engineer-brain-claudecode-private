# AKS Outbound Connectivity Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/basic-troubleshooting-outbound-connections

## Outbound Traffic Categories

1. **Internal traffic** - pod/service within same cluster
2. **Same/peered VNet** - endpoints in same or peered virtual network
3. **On-premises** - via VPN or ExpressRoute
4. **Public via LB** - through Azure Load Balancer
5. **Public via Firewall/Proxy** - through Azure Firewall or proxy server

## Troubleshooting Checklist

1. **Azure Virtual Network Verifier (Preview)** - check if Azure network resources block traffic
   - Navigate to cluster > Node pools > select nodepool > Connectivity analysis
   - Select VMSS instance as source, endpoint as destination (e.g. mcr.microsoft.com)
   - Covers: LB, Firewall, NAT Gateway, NSG, Network Policy, UDR

2. **DNS Resolution** - verify endpoint DNS works from pod
   ```bash
   kubectl run -it --rm aks-ssh --namespace <ns> --image=debian:stable
   apt-get update && apt-get install -y dnsutils curl
   nslookup microsoft.com
   nslookup microsoft.com 168.63.129.16  # direct Azure DNS
   ```

3. **IP Reachability** - test connectivity to resolved IP
   ```bash
   curl -Ivm5 telnet://microsoft.com:443
   curl -Ivm5 https://microsoft.com
   ```

4. **Cross-endpoint test** - verify cluster can reach any external endpoint
   ```bash
   curl -Ivm5 https://kubernetes.io
   ```

5. **Network Policy** check - verify no policy blocking egress

6. **NSG** check - verify no NSG blocking outbound on subnet/NIC

7. **Firewall/Proxy** check - verify required FQDNs/ports allowed

8. **AKS identity permissions** - verify service principal/managed identity has required AKS service permissions

## Key Diagnostic Tools

- **DNS from node**: `nslookup` via debug pod, check `/etc/resolv.conf`
- **Windows DNS**: `Resolve-DnsName www.microsoft.com` via PowerShell test pod
- **Packet captures**: TCP dump from Linux/Windows nodes or pod-level
- **HTTP response codes**: `curl -Ivm5` to check response before/after each hop

## Notes

- Assumes no service mesh; Istio can produce unusual TCP results
- If DNS fails from pod but works from node, check network policies blocking DNS
- Use `rishasi/ubuntu-netutil:1.0` image if DNS/egress prevents package installation
