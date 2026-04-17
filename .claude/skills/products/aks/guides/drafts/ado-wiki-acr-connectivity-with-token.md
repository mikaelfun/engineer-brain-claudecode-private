---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Azure Container Registry connectivity with Token"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FAzure%20Container%20Registry%20connectivity%20with%20Token"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Container Registry Connectivity with Token

## Objective

Steps to connect to an ACR Registry with a Token from a virtual machine/VMSS instance.

## Prerequisites

Az CLI must be installed on the virtual machine/VMSS instance.

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl apt-transport-https lsb-release gnupg

curl -sL https://packages.microsoft.com/keys/microsoft.asc |
    gpg --dearmor |
    sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null

AZ_REPO=$(lsb_release -cs)
echo "deb [arch=$(dpkg --print-architecture)] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" |
    sudo tee /etc/apt/sources.list.d/azure-cli.list

sudo apt-get update
sudo apt-get install azure-cli
```

## Steps

1. Obtain the user assigned identity:

```bash
az vmss list -o table
az vmss identity show -n <vmss-name> -g <resource-group>
```

2. Login with MSI:

```bash
az login --identity --username /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<identity-name>
```

3. Expose the ACR Token:

```bash
TOKEN=$(az acr login --expose-token -n <acr-name> -o tsv --query accessToken)
```

4. From a pod or another VM with docker installed, use the token:

```bash
# Create a helper pod if needed
kubectl run docker --image docker -- sleep 3600
kubectl exec -it docker -- sh

# Inside the pod/VM
export TOKEN="<token_value>"
docker login <acr_name>.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password $TOKEN
```
