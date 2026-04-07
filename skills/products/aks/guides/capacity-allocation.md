# AKS 容量与可用性区域 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 2
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Auto Assign Host Ports: Failed to allocate host port for container - no enou... | ccp-webhook could not find available ports. Either it failed... | Check error field in mutator logs. If no enough host ports a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Auto%20Assign%20Host%20Ports) |
| 2 | AKS cluster creation fails with AvailabilityZoneNotSupported: the requested zone... | The requested VM SKU has zone restrictions in the subscripti... | 1) az vm list-skus -l <location> --size <SKU> to check restr... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/availabilityzonenotsupported-error) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/capacity-allocation.md)
