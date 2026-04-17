# AKS 外部负载均衡器与 SNAT — image-pull -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ControlPlaneAddOnsNotReady during CRUD/Start operations. kube-proxy pods stuck i... | Third-party firewall performing SSL deep packet inspection i... | Ask customer to disable SSL packet inspection on firewall fo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 2 | Pod fails with ImagePullBackOff or ErrImagePull on Windows2022 node: 'Back-off p... | Windows2022 nodes cannot host and run Windows2019 (ltsc2019)... | Update the application container image from Windows2019 base... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements) |
| 3 | ControlPlaneAddOnsNotReady error during CRUD/Start operations: kube-proxy pods s... | Third-party firewall or network appliance performing SSL/TLS... | 1) SSH/node-shell into the affected node, check kubelet logs... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 4 | AKS image pull from container registry proxy (mirror.azk8s.cn) is slow or fails ... | Mooncake container registry proxy servers (per region) pull ... | 1) Check Zabbix alerts for 'too many active nginx connection... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.7] |
| 5 | Image pulls from private container registries with self-signed certs fail: 'x509... | AKS nodes lack the self-signed CA certificate in trust store... | Option 1 (Preferred): Use AKS Custom Certificate Authority f... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTLS%20Connectivity%20Errors%20From%20AKS%20to%20Private%20Container%20Registries) |
| 6 | Pods on WindowsAnnual AKS nodes fail with ImagePullBackOff/ErrImagePull using WS... | WS2019 container images are not compatible with WindowsAnnua... | Option 1: Change node-selector to kubernetes.azure.com/os-sk... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Annual%20Channel) |

## Quick Troubleshooting Path

1. Check: Ask customer to disable SSL packet inspection on firewall for traffic to mcr `[source: ado-wiki]`
2. Check: Update the application container image from Windows2019 base (e `[source: ado-wiki]`
3. Check: 1) SSH/node-shell into the affected node, check kubelet logs for x509 certificate errors; 2) Ask cus `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-external-image-pull.md)
