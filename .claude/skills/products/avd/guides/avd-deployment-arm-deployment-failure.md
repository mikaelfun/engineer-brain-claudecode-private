# AVD AVD ARM 部署 - deployment-failure - Quick Reference

**Entries**: 4 | **21V**: all applicable
**Keywords**: arm-template, deployment-failure, eosd, ephemeral-os-disk, invalidcontentlink, storage-blob, vm-size
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD deployment fails with InvalidContentLink error: Unable to download deploymen... | ARM templates artifacts missing from the storage blob used during AVD deployment... | Create an ICM incident to PG. The product group will need to upload the missing ... | 🔵 7.5 | ADO Wiki |
| 2 | AVD deployment fails with error InvalidTemplateDeployment / InvalidContentLink: ... | ARM template artifacts are missing from the storage blob used by the AVD deploym... | Create an ICM incident. PG will need to upload the missing ARM templates using t... | 🔵 7.5 | ADO Wiki |
| 3 | AVD deployment fails with 'Unable to download deployment content from Storage Bl... | ARM templates artifacts missing from storage blob, causing deployment to fail wh... | Create an ICM incident to PG team. PG will upload missing ARM templates using th... | 🔵 7.5 | ADO Wiki |
| 4 | Ephemeral OS disk deployment fails on certain VM sizes | VM size does not have enough local cache or temporary disk space to accommodate ... | Verify VM size supports EOSD using Azure CLI EphemeralOSDiskSupported check; for... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: ARM templates artifacts missing from the storage b `[Source: ADO Wiki]`
2. Check: ARM template artifacts are missing from the storag `[Source: ADO Wiki]`
3. Check: ARM templates artifacts missing from storage blob, `[Source: ADO Wiki]`
4. Check: VM size does not have enough local cache or tempor `[Source: MS Learn]`
