# AKS Azure Policy — gatekeeper -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Image Integrity policy reports 'System error calling external data provider' in ... | Ratify pod (gatekeeper-system/ratify) does not exist or is u... | 1) Check Image Integrity addon enabled via ASI. If not, cust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity) |
| 2 | Azure Policy assigned to AKS cluster but policies are not being enforced or appl... | azure-policy pod in kube-system namespace or gatekeeper pods... | 1) Verify azure-policy pod running: kubectl get pods -n kube... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20Policy%2FAzure%20Policy%20Overview) |
| 3 | AKS container deployment denied by Gatekeeper: 'container has no resource/memory... | Container spec missing CPU and memory resource limits, causi... | Add resources.requests and resources.limits (cpu/memory) to ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/enforce-container-cpu-memory-limits) |
| 4 | AKS Deployment Safeguards not taking effect - noncompliant resources deployed wi... | Azure Policy add-on not enabled on the cluster, or the targe... | Verify Azure Policy add-on is enabled: az aks show --query a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/deployment-safeguards-in-azure-kubernetes-service) |
| 5 | Azure Policy reports running container (e.g. Gatekeeper) as ConstraintNotProcess... | AKS cluster version incompatibility or outdated version caus... | Upgrade the AKS cluster to a newer supported version to reso... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/error-azure-policy-constraintnotprocessed) |
| 6 | az aks command invoke fails with admission webhook validation.gatekeeper.sh deni... | Azure Policy (Gatekeeper) enforces constraints (e.g. read-on... | Exempt the aks-command namespace from the restrictive Azure ... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures) |

## Quick Troubleshooting Path

1. Check: 1) Check Image Integrity addon enabled via ASI `[source: ado-wiki]`
2. Check: 1) Verify azure-policy pod running: kubectl get pods -n kube-system `[source: ado-wiki]`
3. Check: Add resources `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/security-azure-policy-gatekeeper.md)
