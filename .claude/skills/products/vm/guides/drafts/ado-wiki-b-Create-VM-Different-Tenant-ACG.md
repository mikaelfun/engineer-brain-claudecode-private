---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Create VM Different Tenant_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FCreate%20VM%20Different%20Tenant_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Create VM from SIG Image in a Different Tenant (Azure Compute Gallery)

## Summary

With RBAC assignments, customers can share SIG images across tenants. For a more scalable approach, use an app registration to facilitate cross-tenant sharing.

> **Note: Currently only possible using Azure CLI** (not PowerShell or Portal).
> Reference: [Share gallery VM images across Azure tenants](https://docs.microsoft.com/en-gb/azure/virtual-machines/linux/share-images-across-tenants)

## Step 1: Create the App Registration

1. Open App registrations in the Azure portal
2. Select **New registration**
3. Name: `myGalleryApp`
4. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
5. Redirect URI: `https://www.microsoft.com` → **Register**
6. Copy the **Application (client) ID**
7. Select **Certificates & secrets** → **New client secret** → Description: `Shared image gallery cross-tenant app secret` → **Add**
8. Copy the secret value immediately

**Grant access to the source gallery:**
1. Source Shared Image Gallery → **Access control (IAM)** → **Add role assignment**
2. Role: **Reader**; Select `myGalleryApp` → **Save**

## Step 2: Give Tenant 2 Access

Navigate to this URL in a browser (replace placeholders):
```
https://login.microsoftonline.com/<Tenant 2 ID>/oauth2/authorize?client_id=<Application (client) ID>&response_type=code&redirect_uri=https%3A%2F%2Fwww.microsoft.com%2F
```

In Azure portal as Tenant 2, grant access to the destination resource group:
1. Resource group → **Access control (IAM)** → **Add role assignment**
2. Role: **Contributor**; Select `myGalleryApp` → **Save**

> **Note**: Wait for the source image version to completely finish building and replicating before creating another image version from the same managed image.

## Step 3: Create the VM (Azure CLI)

Sign in with service principal for Tenant 1:
```bash
az account clear
az login --service-principal -u '<app ID>' -p '<Secret>' --tenant '<tenant 1 ID>'
az account get-access-token
```

Sign in with service principal for Tenant 2:
```bash
az login --service-principal -u '<app ID>' -p '<Secret>' --tenant '<tenant 2 ID>'
az account get-access-token
```

Create the VM referencing the cross-tenant SIG image:
```bash
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image "/subscriptions/<Tenant 1 subscription>/resourceGroups/<Resource group>/providers/Microsoft.Compute/galleries/<Gallery>/images/<Image definition>/versions/<version>" \
  --admin-username azureuser \
  --generate-ssh-keys
```

Alternatively, use an ARM template deployment with the `--aux-subs` parameter:
```bash
az group deployment create \
  --resource-group myResourceGroup \
  --template-file azuredeploy.json \
  --parameters @myparameters.json
```
