# AKS ACR 认证与 RBAC — kusto -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR tasks are not being triggered or failing to complete with no actionable outp... | Various causes - need to check BuildHostTrace Kusto logs to ... | Query cluster("ACR").database("acrprod").BuildHostTrace with... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs) |
| 2 | ACR throttling errors: 'too many requests' when pulling or pushing images | Customer exceeds 10 concurrent pull limit for their ACR tier | Upgrade ACR to a higher tier to support more concurrent pull... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors) |
| 3 | ACR pull fails intermittently with "503 Egress is over the account limit" error ... | Internal bandwidth throttling from the Azure Storage account... | Use Kusto query on RegistryActivity table filtering http_res... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit) |
| 4 | ACR is reported as disabled - cannot login or pull images. Re-enabling admin use... | ARM maintenance during an ACR update request caused inconsis... | Open ICM with ACR PG Triage and request review of the Master... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20disabled%20issue) |
| 5 | ACR image tags/repositories disappearing unexpectedly — pulls fail with 'manifes... | External automation (CI/CD pipeline, script, scheduled job) ... | Investigate via Kusto RegistryManifestEvent queries: 1) Conf... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20deletion%20investigation) |

## Quick Troubleshooting Path

1. Check: Query cluster("ACR") `[source: ado-wiki]`
2. Check: Upgrade ACR to a higher tier to support more concurrent pulls `[source: ado-wiki]`
3. Check: Use Kusto query on RegistryActivity table filtering http_response_status=307 to identify the affecte `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/acr-authentication-rbac-kusto.md)
