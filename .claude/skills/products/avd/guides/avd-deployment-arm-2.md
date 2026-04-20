# AVD AVD ARM 部署 (Part 2) - Quick Reference

**Entries**: 13 | **21V**: mixed
**Keywords**: arm-deployment, arm-template, azure-monitor, break/fix, content idea request, contentidea-kb, deployment, deployment-failure, deployment-validation, downgrade, download, dsc, ephemeral-os-disk, firewall, icm-required
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD deployment fails with InvalidContentLink error: 'Unable to download deployme... | ARM templates artifacts are missing from the storage blob used for AVD deploymen... | Create an ICM incident. PG team will need to upload the missing ARM templates us... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Customer cannot download or install Windows App because company blocks Microsoft... | Organization policy blocks Microsoft Store access, preventing standard Windows A... | Download Windows App directly from Microsoft Learn: https://learn.microsoft.com/... | 🟢 8.0 | ADO Wiki |
| 3 📋 | AVD deployment fails with InvalidContentLink: Unable to download deployment cont... | ARM template artifacts are missing from the storage blob used during AVD host po... | Create an IcM to AVD PG. PG will need to upload the missing ARM templates using ... | 🟢 8.0 | ADO Wiki |
| 4 📋 | AVD VM deployed with Windows Enterprise multi-session image gets downgraded to P... | Backend issue potentially caused by old WinPA agent on certain VM clusters. Duri... | 1) Collect MSRD-Collect data. 2) Check Application event logs for Microsoft-Wind... | 🟢 8.0 | ADO Wiki |
| 5 📋 | AVD host pool deployment fails with InvalidContentLink error: Unable to download... | ARM template artifacts are missing from the storage blob used by the AVD deploym... | Create an ICM incident to the AVD PG team. PG will upload the missing ARM templa... | 🟢 8.0 | ADO Wiki |
| 6 📋 | Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Professional ed... | Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes ... | Redeploy the VM. The underlying cause is a backend issue that should be resolved... | 🔵 7.0 | ADO Wiki |
| 7 📋 | DSC extension fails to download Configuration.zip - catalogartifact.azureedge.ne... | Firewall/NSG/static route blocking download | Remove blocking network rules or download zip manually | 🔵 7.0 | MS Learn |
| 8 📋 | AVD deployment fails with DeploymentFailed InvalidResourceReference error during... |  | See Microsoft documentation: https://docs.microsoft.com/en-us/azure/virtual-desk... | 🔵 7.0 | ADO Wiki |
| 9 📋 | WVD Deployment failed with DSC extension error. User is not authorized to query ... | SPN was missing role assignment. | Create service principal role assignment per docs. | 🔵 6.5 | ContentIdea |
| 10 📋 | WVD ARM deployment fails: The template deployment vmCreation-linkedTemplate is n... | Azure subscription quota limit exceeded for a region or VM family. | Check detailed error by clicking error banner in Portal. Request quota increase ... | 🔵 6.5 | ContentIdea |
| 11 📋 | Ephemeral OS disk deployment fails in certain regions due to SKU rollout gaps | Incomplete rollout of supported SKUs or backend bugs cause regional deployment i... | Monitor Azure announcements for SKU availability updates; deploy to another regi... | 🔵 6.0 | MS Learn |
| 12 📋 | Azure Monitor workbook deployment for AVD fails with 'Deployment validation fail... | Azure Monitor configuration workbook passes object-type parameter instead of str... | If workbook deployment fails, go to Log Analytics workspace > Agents configurati... | 🟡 5.5 | OneNote |
| 13 📋 | Deployment fails Unauthorized - scale operation not allowed for subscription in ... | Subscription type (MSDN/Free/Education) lacks VM features in region | Change subscription type or deploy to different region | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: ARM templates artifacts are missing from the storage blob us... `[Source: ADO Wiki]`
2. Check: Organization policy blocks Microsoft Store access, preventin... `[Source: ADO Wiki]`
3. Check: ARM template artifacts are missing from the storage blob use... `[Source: ADO Wiki]`
4. Check: Backend issue potentially caused by old WinPA agent on certa... `[Source: ADO Wiki]`
5. Check: ARM template artifacts are missing from the storage blob use... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-deployment-arm-2.md#troubleshooting-flow)