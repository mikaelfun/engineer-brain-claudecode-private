# AVD AVD ARM 部署 - deployment-failure - Issue Details

**Entries**: 4 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. AVD deployment fails with InvalidContentLink error: Unable to download deployment content from Stora...
- **ID**: `avd-ado-wiki-b-r3-001`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: ARM templates artifacts missing from the storage blob used during AVD deployment.
- **Solution**: Create an ICM incident to PG. The product group will need to upload the missing ARM templates using the artifact deployment pipeline.
- **Tags**: deployment-failure, arm-template, storage-blob, InvalidContentLink

### 2. AVD deployment fails with error InvalidTemplateDeployment / InvalidContentLink: Unable to download d...
- **ID**: `avd-ado-wiki-a-r6-001`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: ARM template artifacts are missing from the storage blob used by the AVD deployment pipeline.
- **Solution**: Create an ICM incident. PG will need to upload the missing ARM templates using the artifact deployment pipeline.
- **Tags**: deployment-failure, arm-template, storage-blob, InvalidContentLink

### 3. AVD deployment fails with 'Unable to download deployment content from Storage Blob' and InvalidConte...
- **ID**: `avd-ado-wiki-b-r6-001`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: ARM templates artifacts missing from storage blob, causing deployment to fail when trying to download required content
- **Solution**: Create an ICM incident to PG team. PG will upload missing ARM templates using the artifact deployment pipeline
- **Tags**: deployment-failure, arm-template, storage-blob, invalidcontentlink

### 4. Ephemeral OS disk deployment fails on certain VM sizes
- **ID**: `avd-mslearn-063`
- **Source**: MS Learn | **Score**: 🔵 6.0
- **Root Cause**: VM size does not have enough local cache or temporary disk space to accommodate the OS image
- **Solution**: Verify VM size supports EOSD using Azure CLI EphemeralOSDiskSupported check; for AVD use Temp Disk placement (NVMe not supported in public preview)
- **Tags**: ephemeral-os-disk, vm-size, deployment-failure, EOSD
