---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Backup and Restore AKS cluster or Migrate to another AKS cluster using Velero"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FBackup%20and%20Restore%20AKS%20cluster%20or%20Migrate%20to%20another%20AKS%20cluster%20using%20Velero"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Backup and Restore AKS cluster or Migrate to another AKS cluster using Velero

## Summary

This article covers how to backup and restore an AKS cluster, and how to migrate to another AKS cluster using Velero.

## Prerequisites

1. Azure CLI
2. Connect to the AKS cluster: `az aks get-credentials --resource-group <RGname> --name <AKSname>`
3. Works on Azure Cloud Shell (bash) and local machine (bash).

## Part 1: Create storage account and install Velero on source AKS cluster

### Installation

```bash
curl -LO https://raw.githubusercontent.com/mutazn/Backup-and-Restore-AKS-cluster-using-Velero/master/source-aks-cluster.sh
chmod +x ./source-aks-cluster.sh
./source-aks-cluster.sh
```

Key steps in the script:
1. Create resource group for backup storage
2. Create storage account (Standard_GRS, BlobStorage, Hot tier)
3. Create blob container named `velero`
4. Create service principal with Contributor role on backup RG and source AKS infrastructure RG
5. Save credentials to local file
6. Install Velero CLI and configure with Azure plugin
7. Patch Velero deployment with Linux node selector

## Part 2: Install Velero on target AKS cluster (for cross-cluster restore/migration)

```bash
curl -LO https://raw.githubusercontent.com/mutazn/Backup-and-Restore-AKS-cluster-using-Velero/master/target-aks-cluster.sh
chmod +x ./target-aks-cluster.sh
./target-aks-cluster.sh
```

Key steps:
1. Create new service principal with Contributor role on backup RG and target AKS infrastructure RG
2. Install Velero CLI and connect to the same storage account/blob container

## Backup and Restore Commands

| Operation | Command |
|-----------|---------|
| Backup all namespaces + PVs | `velero backup create <name>` |
| Backup specific namespace | `velero backup create <name> --include-namespaces <ns>` |
| Daily schedule | `velero create schedule daily --schedule="@daily" --include-namespaces <ns>` |
| Weekly schedule | `velero create schedule weekly --schedule="@weekly" --include-namespaces <ns>` |
| Custom cron schedule | `velero create schedule backup-schedule --schedule="0 11 * * 6" --include-namespaces <ns>` |
| Backup only PV/PVC | `velero backup create my-backup --include-resources PersistentVolumeClaim,PersistentVolume` |
| Restore from backup | `velero restore create <name> --from-backup <backup-name>` |
| Restore specific namespace | `velero restore create <name> --from-backup <backup-name> --include-namespaces <ns>` |
| Restore to different namespace | `velero restore create <name> --from-backup <backup-name> --include-namespaces <ns> --namespace-mappings [old]:[new]` |

## Troubleshooting

```bash
# Check Velero pod and logs
kubectl get pod -n velero
kubectl logs deploy/velero -n velero

# List/describe backups
velero backup get
velero backup describe <name> --details
velero backup logs <name>

# List/describe restores
velero restore get
velero restore describe <name> --details
velero restore logs <name>

# Schedules
velero schedule get
velero schedule describe <name>

# Cleanup
velero backup delete <name>
velero restore delete <name>
velero schedule delete <name>

# Check snapshots
az resource list -g Velero_Backups -o table

# Uninstall
velero uninstall
```

## References

- [Velero plugin for Azure](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure)
- [Velero releases](https://github.com/vmware-tanzu/velero/releases)
- [Scripts repository](https://github.com/mutazn/Backup-and-Restore-AKS-cluster-using-Velero)
