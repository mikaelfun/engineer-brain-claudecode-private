---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/AKS azure backup troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20azure%20backup%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Backup Troubleshooting

## Summary

Guide for troubleshooting Azure Backup installation and operation issues on AKS clusters. The backup extension is an Azure Arc-enabled Kubernetes cluster extension delivered via Helm Chart.

## Prerequisites Checklist

### Required Resource Providers

```bash
Microsoft.KubernetesConfiguration
Microsoft.DataProtection
Microsoft.ContainerService
```

Register with: `az provider register --namespace <namespace>`

### Backup Vault

- Must be in the same region as the AKS cluster
- Must have **Trusted Access** enabled to bypass kube-apiserver endpoint
- Role: `Microsoft.DataProtection/backupVaults/backup-operator`

### Enable Trusted Access

```bash
az aks trustedaccess rolebinding create \
  --resource-group <aksclusterrg> \
  --cluster-name <aksclustername> \
  --name <randomRoleBindingName> \
  --source-resource-id $(az dataprotection backup-vault show --resource-group <vaultrg> --vault <VaultName> --query id -o tsv) \
  --roles Microsoft.DataProtection/backupVaults/backup-operator
```

### CSI Drivers (Kubernetes >= 1.21.1)

```bash
az aks update \
  --name myAKSCluster \
  --resource-group myResourceGroup \
  --enable-disk-driver \
  --enable-file-driver \
  --enable-blob-driver \
  --enable-snapshot-controller
```

Verify: `storageProfile` should show `"enabled": true` for all drivers.

### Network Requirements

- Firewall: Allow access to MCR (Microsoft Container Registry)
- Azure Policy: If enforced, add `dataprotection-microsoft` namespace to exception list
- NSG: Inbound rules for service tags `azurebackup` and `azurecloud`
- Blob container must not contain existing unrelated files

### Required FQDNs

```
mcr.microsoft.com:443 (HTTPS)
*.data.mcr.microsoft.com:443 (HTTPS)
mcr-0001.mcr-msedge.net:443 (HTTPS)
```

## Common Installation Issues

### Extension Install Hangs Until Timeout

**Symptom**: `az k8s-extension create` command hangs, eventually times out.

**Root Cause**: Network connectivity issue preventing the cluster from reaching MCR to download extension catalog manifest and Helm chart images.

**Error Indicators**:
```
failed to do request: Head "https://mcr.microsoft.com/v2/azurearck8s/extension-catalog/manifests/public": dial tcp: lookup mcr.microsoft.com: i/o timeout
```

**Resolution**:
1. Verify firewall/NSG rules allow outbound to MCR endpoints
2. Check DNS resolution from cluster nodes: `nslookup mcr.microsoft.com`
3. Verify no proxy is blocking HTTPS traffic to MCR
4. Check if the cluster is a private cluster and needs appropriate egress configuration
