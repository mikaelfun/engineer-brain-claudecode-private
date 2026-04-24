---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-cluster-connection-issues-api-server
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Cluster Connection Issues with API Server

## Steps
1. Get FQDN: az aks show --query fqdn
2. nslookup/curl/telnet to test
3. Private clusters: ensure VM on same VNet
4. Check authorized IP ranges
5. Verify kubectl version
6. Validate kubeconfig
7. Check firewall egress
8. Verify NSG port 10250
