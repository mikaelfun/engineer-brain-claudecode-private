---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/TSG: AKS - Troubleshooting Cluster API Connectivity Issues (Start Here Workflow)/[TSG] AKS API Connectivity - Hands-On Labs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20%28Start%20Here%20Workflow%29%2F%5BTSG%5D%20AKS%20API%20Connectivity%20-%20Hands-On%20Labs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS API Connectivity - Hands-On Labs

These hands-on labs complement the AKS Troubleshooting Cluster API Connectivity Issues (Start Here Workflow). Each lab deploys a deliberately broken AKS environment via Bicep.

## Scenario 1: Public Cluster - API Server Unreachable (Authorized IP Ranges)

**Pattern:** DNS resolves fine but TCP 443 times out on a public cluster.

### Diagnostic Steps
1. The 3 triage questions: Is it private? From where? Hard or soft failure?
2. Run: `nslookup $FQDN`, `curl -kIv --connect-timeout 10 "https://$FQDN"`, `kubectl get nodes -v7 --request-timeout=5s`
3. Classify: Hard failure = TCP 443 consistently times out, no TLS handshake

### Root Cause
API server authorized IP ranges enabled but client's egress IP not in allow list. VPN/proxy/firewall NAT can cause actual egress IP to differ from `ifconfig.me`.

### Fix
```bash
MY_IP=$(curl -s ifconfig.me)
EXISTING=$(az aks show -g <rg> -n <aks> --query "apiServerAccessProfile.authorizedIpRanges[]" -o tsv | paste -sd,)
az aks update -g <rg> -n <aks> --api-server-authorized-ip-ranges "$EXISTING,$MY_IP/32"
```

**Tip:** Verify actual egress IP Azure sees via portal NSG → Add inbound rule → Source "My IP address" → read the auto-populated IP.

## Scenario 2: Private Cluster - NSG Blocking TCP 443 Across Peering

**Pattern:** DNS resolves to correct private IP but TCP 443 times out from peered VNet.

### Diagnostic Steps
1. nslookup resolves to private IP → DNS/private DNS zone OK
2. curl TCP 443 timeout → Network-layer block
3. Check NSG rules: `az network nsg rule list -g <rg> --nsg-name <nsg> -o table`

### Root Cause
NSG rule (DenyOutboundHTTPS, priority 100, destination '*') blocks ALL outbound TCP 443, including to peered VNets. Destination '*' blocks both Internet and VirtualNetwork.

### Fix
```bash
az network nsg rule delete -g <rg> --nsg-name <nsg> -n DenyOutboundHTTPS
```
Or refine: change destination to 'Internet' only, or add higher-priority allow rule for specific API server IP.

## Key Takeaways
- Always check `apiServerAccessProfile.authorizedIpRanges` early for public clusters with TCP 443 timeout
- NAT egress IP mismatch is a common pitfall (device IP ≠ firewall/proxy egress IP)
- In hub/spoke topology, verify NSG rules on BOTH source and destination subnets
- NSG destination '*' blocks VirtualNetwork traffic too, not just Internet
