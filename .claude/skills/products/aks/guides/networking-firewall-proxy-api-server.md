# AKS 防火墙与代理 — api-server -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation/start fails with K8SAPIServerConnFailVMExtensionError (exit... | Cluster nodes cannot connect to API server pod. Firewall/egr... | Verify from node: nc -vz <cluster-fqdn> 443. If using egress... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverconnfailvmextensionerror) |
| 2 | KEDA add-on fails to start: Failed to get API Group-Resources, EOF error connect... | Cluster firewall misconfigured, blocking KEDA from reaching ... | Configure firewall to meet Azure Global required network rul... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on) |
| 3 | AKS cluster start/create fails with VMExtensionError_K8SAPIServerConnFail (exit ... | Cluster nodes cannot establish TCP connection to API server ... | Run 'nc -vz <cluster-fqdn> 443' from node to verify; allow t... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-k8sapiserverconnfail) |

## Quick Troubleshooting Path

1. Check: Verify from node: nc -vz <cluster-fqdn> 443 `[source: mslearn]`
2. Check: Configure firewall to meet Azure Global required network rules for AKS egress traffic; verify KEDA p `[source: mslearn]`
3. Check: Run 'nc -vz <cluster-fqdn> 443' from node to verify; allow traffic to cluster FQDN in firewall; add  `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-firewall-proxy-api-server.md)
