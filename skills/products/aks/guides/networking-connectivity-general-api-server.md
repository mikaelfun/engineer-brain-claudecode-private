# AKS 网络连通性通用 — api-server -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Client IP cannot access AKS API server: dial tcp <API-SERVER-IP>:443: i/o timeou... | API server authorized IP ranges enabled but client IP not in... | Get client IP: curl https://ipinfo.io/ip; add to authorized ... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/client-ip-address-cannot-access-api-server) |
| 2 | kubectl fails with Unable to connect to the server: net/http: TLS handshake time... | Network connectivity issue between client and AKS API server | Check network connectivity, DNS resolution, firewall/NSG rul... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | Cannot access AKS cluster API server: Unable to connect to the server: dial tcp ... | AKS cluster configured with --api-server-authorized-ip-range... | Add client IP to authorized IP ranges: az aks update --resou... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-access-cluster-api-server-using-authorized-ip-ranges) |
| 4 | kubectl commands timeout repeatedly - konnectivity-agent (or legacy tunnelfront/... | Pods responsible for node-to-control-plane communication (ko... | Move konnectivity-agent to dedicated system node pool; reduc... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 5 | Error "tls: client offered only unsupported versions" when connecting to AKS API... | Client TLS version is outdated; AKS API server requires mini... | Upgrade client TLS version to 1.2 or later. Follow Microsoft... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/tls-client-offered-unsupported-versions) |
| 6 | API server high latency, timeouts, etcd database size approaching 8GB limit; etc... | Objects continuously created without cleanup (completed jobs... | Check etcd size: kubectl get --raw /metrics \| grep apiserve... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd) |

## Quick Troubleshooting Path

1. Check: Get client IP: curl https://ipinfo `[source: mslearn]`
2. Check: Check network connectivity, DNS resolution, firewall/NSG rules, API server authorized IP ranges `[source: onenote]`
3. Check: Add client IP to authorized IP ranges: az aks update --resource-group <rg> --name <cluster> --api-se `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-connectivity-general-api-server.md)
