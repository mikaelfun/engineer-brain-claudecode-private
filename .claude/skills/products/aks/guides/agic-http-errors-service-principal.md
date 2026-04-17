# AKS AGIC HTTP 错误码排查 — service-principal -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AGIC pod logs show 'invalid_client' error - Application Gateway configuration up... | The Service Principal secret used by AGIC to authenticate wi... | Generate a new secret for the Service Principal and update A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 2 | AGIC pod logs show invalid_client error. Application Gateway config updates fail... | AGIC uses Service Principal for auth and the SP secret/crede... | Renew SP secret and update AGIC config per MS docs ingress-c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/AKS%20Network%20Troubleshooting%20Methodology/%5BTSG%5D%20AGIC/%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 3 | AGIC pod logs show 'invalid_client' error when authenticating to configure Appli... | AGIC uses a Service Principal whose secret has expired. | Add a new secret to the Service Principal and update AGIC co... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |

## Quick Troubleshooting Path

1. Check: Generate a new secret for the Service Principal and update AGIC to use the new secret following: htt `[source: ado-wiki]`
2. Check: Renew SP secret and update AGIC config per MS docs ingress-controller-install-existing#using-a-servi `[source: ado-wiki]`
3. Check: Add a new secret to the Service Principal and update AGIC config `[source: ado-wiki]`
