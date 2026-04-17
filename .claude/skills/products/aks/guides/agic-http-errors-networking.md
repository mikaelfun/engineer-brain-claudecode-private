# AKS AGIC HTTP 错误码排查 — networking -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AGIC pod logs show 'ErrorGetApplicationGatewayError' with 'Failed fetching confi... | Network connectivity from AGIC pod to Azure Resource Manager... | Check and fix egress rules: (1) If UDR outbound, verify NVA/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 2 | AGIC returns 400 error when updating Application Gateway: InvalidResourceReferen... | AGIC v1.7.5+ introduced a fix to clean up stale URL path map... | Option 1: Use a unique Application Gateway per AKS cluster w... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20fails%20to%20update%20shared%20application%20gateway) |
| 3 | TLS certificate issuance fails with cert-manager and Let's Encrypt using HTTP-01... | The Application Gateway used by AGIC does not expose the HTT... | Update the ClusterIssuer/Issuer http01 solver section to inc... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FHTTP01%20challenges%20fail%20with%20Lets%20Encrypt%20and%20cert%20manager) |
| 4 | AGC (Application Gateway for Containers) does not route HTTP requests as configu... | The ALB controller pod in the AKS cluster cannot reach the A... | 1. Find the AGC configurationEndpoint FQDN from the AGC reso... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGC%2FAGC_routing_not_functioning) |
| 5 | AGIC backend pools not updated with new pod IPs after pod restart. AGIC pod in C... | When managed identity is enabled on a cluster with Microsoft... | Option 1: Install the Microsoft Entra pod-managed identities... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20Backend%20Pools%20Not%20Getting%20Updated%20After%20Migrating%20From%20service%20Principal%20to%20ManageIdentity) |

## Quick Troubleshooting Path

1. Check: Check and fix egress rules: (1) If UDR outbound, verify NVA/Firewall allows traffic to management `[source: ado-wiki]`
2. Check: Option 1: Use a unique Application Gateway per AKS cluster when using the AGIC addon `[source: ado-wiki]`
3. Check: Update the ClusterIssuer/Issuer http01 solver section to include the ingress class: solvers: - http0 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/agic-http-errors-networking.md)
