# AKS 节点配置错误 -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container logs do not get rotated upon hitting --container-log-max-size on Windo... | Kubelet log compression bug on Windows in k8s versions prior... | Upgrade k8s version to v1.23.15+ or v1.24.9+ or v1.25.0+. If... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config) |
| 2 | Kaito workspace RESOURCEREADY condition not true after 10+ minutes; GPU node nev... | Possible causes: (1) Identity lacks Contributor role on reso... | Check machine CR status for errors. Verify role assignment: ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29) |
| 3 | Customer needs Prometheus + Grafana monitoring stack on AKS cluster for pod/node... | AKS does not include Prometheus/Grafana by default (before A... | 1) helm repo add prometheus-community https://prometheus-com... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 4 | GPU node not created by KAITO gpu-provisioner controller; machine CR shows quota... | GPU quota limitations in subscription or region prevent node... | Request quota increase for GPU VM family via Azure portal; c... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues) |
| 5 | AKS node creation times out. Logs show: The kernel module failed to load. Secure... | Unsigned kernel module (e.g., GPU driver) cannot be loaded w... | Disable secure boot on the nodepool (az aks nodepool update ... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Launch) |

## Quick Troubleshooting Path

1. Check: Upgrade k8s version to v1 `[source: ado-wiki]`
2. Check: Check machine CR status for errors `[source: ado-wiki]`
3. Check: 1) helm repo add prometheus-community https://prometheus-community `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-provisioning-errors.md)
