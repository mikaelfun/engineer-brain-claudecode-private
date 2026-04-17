---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Copy SIG Images Across Tenants_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FCopy%20SIG%20Images%20Across%20Tenants_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Copy SIG Images Across Tenants (Azure Compute Gallery)

## Scenario
Customer wants to copy a SIG image from one Shared Image Gallery to a Shared Image Gallery **in a different Tenant**.

> Note: This does not currently work with PowerShell. Use Azure CLI only.

Reference docs:
- [Share images across tenants](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/share-images-across-tenants)
- [Copy an image from another gallery using the Azure CLI](https://docs.microsoft.com/en-us/azure/virtual-machines/image-version-another-gallery-cli)

## Step 1: Create the App Registration

Create an application registration used by both tenants to share the image gallery resources.

1. Open App registrations in the Azure portal
2. Select **New registration**
3. In **Name**, type `myGalleryApp`
4. In **Supported account types**, select **Accounts in any organizational directory and personal Microsoft accounts**
5. In **Redirect URI**, type `https://www.microsoft.com` then select **Register**
6. Copy the **Application (client) ID** — save for later
7. Select **Certificates & secrets** → **New client secret**
8. Description: `Shared image gallery cross-tenant app secret`; Expires: In 1 year; select **Add**
9. Copy the secret value immediately (cannot retrieve later)

**Grant app registration access to the source gallery:**
1. Select the source Shared Image Gallery → **Access control (IAM)** → **Add role assignment**
2. Role: **Reader**; Assign access to: Azure AD user/group/service principal
3. Select `myGalleryApp` → **Save**

## Step 2: Give Tenant 2 Access

Paste this URL in a browser (replace placeholders), sign in as Tenant 2:
```
https://login.microsoftonline.com/<Tenant 2 ID>/oauth2/authorize?client_id=<Application (client) ID>&response_type=code&redirect_uri=https%3A%2F%2Fwww.microsoft.com%2F
```

Then in the Azure portal as Tenant 2:
1. Select the target resource group → **Access control (IAM)** → **Add role assignment**
2. Role: **Contributor**; Assign access to: Azure AD user/group/service principal
3. Select `myGalleryApp` → **Save**

## Step 3: Copy the Image (Azure CLI)

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

Prerequisites:
- Source gallery with image definition and image version must already exist
- Source image version must be replicated to the region where destination gallery is located
- Destination gallery and image definition must already exist

Get source image ID:
```bash
az sig image-version list \
   --resource-group myGalleryRG \
   --gallery-name myGallery \
   --gallery-image-definition myImageDefinition \
   -o table

az sig image-version show \
   --resource-group myGalleryRG \
   --gallery-name myGallery \
   --gallery-image-definition myImageDefinition \
   --gallery-image-version 1.0.0 \
   --query "id" -o tsv
```

Copy the image to destination gallery:
```bash
az sig image-version create \
   --resource-group DestGalleryRG \
   --gallery-name DestGallery \
   --gallery-image-definition DestImageDefinition \
   --gallery-image-version 1.0.0 \
   --target-regions "southcentralus=1" "eastus=1" \
   --replica-count 1 \
   --managed-image "/subscriptions/<SubscriptionID>/resourceGroups/myGalleryRG/providers/Microsoft.Compute/galleries/myGallery/images/myImageDefinition/versions/1.0.0"
```
