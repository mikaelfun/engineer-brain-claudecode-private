---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Cluster upgrades using ARM"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FCluster%20upgrades%20using%20ARM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to upgrade a cluster using an ARM Template

## Instructions for Portal

1. Navigate to the AKS cluster in Azure Portal, click "Export Template" under Automation, then click Deploy.
2. Click "Edit Template".
3. Update the Kubernetes version in the template:
   - Control Plane version (Properties section)
   - Each node pool version (system and user pools)
   - There may be multiple version references (e.g., line 39, 52, 67, 134, 155 in the example)
4. Click Save, then Review + Create, then Create.
5. The cluster control plane and node pools will show "Upgrading" state with the new version.

## Instructions for CLI

1. Navigate to the AKS cluster, click "Export Template" under Automation, then click Download.
2. Extract the downloaded zip file (contains parameters.json and template.json).
3. Edit template.json — update all Kubernetes version references (control plane + each node pool).
4. Deploy using Azure CLI:
   ```
   az group deployment create -g aksrg --template-file template.json
   ```
5. The cluster will show "Upgrading" state.

## Key Points

- All version references in the ARM template must be updated: control plane AND each node pool.
- The `az group deployment create` command is used for CLI deployment (note: newer CLI versions use `az deployment group create`).
