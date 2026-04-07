---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Deploy VM From Community Gallery Image_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FDeploy%20VM%20From%20Community%20Gallery%20Image_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Deploy a VM From a Community Gallery Image (Azure Compute Gallery)

## Prerequisites: Install CLI Extension

```bash
az extension add --name image-gallery --upgrade
```

Also install the Edge Build for the latest community gallery `az vm`/`az vmss` CLI commands:
[Edge Build Pipelines Artifacts](https://dev.azure.com/azure-sdk/public/_build/results?buildId=1194854&view=artifacts)

## Step 1: List Image Definitions in the Community Gallery

### REST API
```http
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Compute/locations/{location}/communityGalleries/{communityGalleryName}/images?api-version=2021-07-01
```

### CLI
```bash
az sig image-definition list-community \
  --public-gallery-name $publicGalleryName \
  --location $region \
  --show-next-marker
```

## Step 2: List Image Versions

### REST API
```http
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Compute/locations/{location}/communityGalleries/{publicGalleryName}/images/{galleryImageName}/versions?api-version=2021-07-01
```

### CLI
```bash
az sig image-version list-community \
  --public-gallery-name $publicGalleryName \
  --gallery-image-definition $galleryDefinitionName \
  --location $region \
  --show-next-marker
```

## Step 3: Get the Community Gallery Image ID

### REST API
```http
GET https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Compute/Locations/{location}/CommunityGalleries/{CommunityGalleryPublicName}/Images/{galleryImageName}/Versions/{1.0.0}?api-version=2021-07-01
```

### CLI
```bash
az sig image-version show-community \
  --public-gallery-name $publicGalleryName \
  --gallery-image-definition $galleryDefinitionName \
  --location $region \
  --gallery-image-version $galleryImageVersionName
```

## Step 4: Deploy the VM

Use API version **2021-07-01 or later**.

### REST API
```http
PUT https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{VMName}?api-version=2021-03-01

{
  "location": "{location}",
  "properties": {
    "hardwareProfile": { "vmSize": "Standard_D1_v2" },
    "storageProfile": {
      "imageReference": {
        "communityGalleryImageId": "/communityGalleries/{publicGalleryName}/images/{galleryImageName}/versions/1.0.0"
      },
      "osDisk": {
        "caching": "ReadWrite",
        "managedDisk": { "storageAccountType": "Standard_LRS" },
        "name": "myVMosdisk",
        "createOption": "FromImage"
      }
    },
    "osProfile": {
      "adminUsername": "johndoe",
      "computerName": "myVM",
      "adminPassword": "{password}"
    },
    "networkProfile": {
      "networkInterfaces": [
        {
          "id": "/subscriptions/.../providers/Microsoft.Network/networkInterfaces/{nicName}",
          "properties": { "primary": true }
        }
      ]
    }
  }
}
```

### CLI
```bash
az vm create \
  --name $vmName \
  --resource-group $resourceGroup \
  --image /CommunityGalleries/{publicGalleryName}/Images/{imageName}/Versions/{version} \
  --admin-username azureuser \
  --generate-ssh-keys
```
