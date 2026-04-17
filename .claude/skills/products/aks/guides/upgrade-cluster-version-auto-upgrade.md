# AKS 集群版本升级 — auto-upgrade -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes running unattended Canonical nightly security updates causing unexpect... | AKS disabled unmanaged Canonical nightly security updates by... | Proactively set node OS upgrade channel to NodeImage or Secu... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS platform auto-upgrades clusters from unsupported K8s versions (N-3 to N-4) t... | AKS platform support policy: all clusters auto-upgraded befo... | Set maintenance window to control timing; use auto-upgrade c... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | TargetK8sVersionNotSupported error appears in existing Fleet auto-upgrade profil... | As new Kubernetes versions are released, the previously supp... | Enable longTermSupport in the auto-upgrade profile and on al... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FTargetK8sVersionNotSupported%20Error) |

## Quick Troubleshooting Path

1. Check: Proactively set node OS upgrade channel to NodeImage or SecurityPatch `[source: onenote]`
2. Check: Set maintenance window to control timing; use auto-upgrade channel proactively; monitor K8s version  `[source: onenote]`
3. Check: Enable longTermSupport in the auto-upgrade profile and on all fleet member clusters to continue usin `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-auto-upgrade.md)
