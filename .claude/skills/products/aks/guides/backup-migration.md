# AKS 备份恢复与迁移 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 2
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer asks about migrating AKS cluster from CE1 (China East 1) or CN1 (China ... | CE1 and CN1 regions are being retired after 10+ years of ser... | 1) AKS clusters cannot be migrated between regions - must re... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | OSSKU Migration returns 'property change not allowed' error when attempting to c... | For preview features, the OSSKUMigrationPreview feature flag... | 1) Register 'OSSKUMigrationPreview' feature flag on the subs... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
