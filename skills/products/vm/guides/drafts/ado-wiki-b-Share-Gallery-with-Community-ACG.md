---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/How Tos/Share Gallery with Community_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20%28ACG%29%2FHow%20Tos%2FShare%20Gallery%20with%20Community_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Share Azure Compute Gallery with Community (Community Gallery)

## What is Community Gallery?

Community Gallery makes a gallery and all images/artifacts publicly accessible to all Azure customers. Shared as resource type `Microsoft.Compute/communityGalleries`. The original `Microsoft.Compute/galleries` resource remains private and unchanged.

## Community Gallery Limitations

| Limitation | Detail |
|---|---|
| Conversion from private gallery | Cannot convert existing private (RBAC-only) gallery to Community gallery |
| Third-party Marketplace images | Cannot publish third-party marketplace images to community |
| Encrypted images | Not supported |
| Image resource location | Images must be created in the same region as the gallery |
| VM Applications | Cannot share VM Applications to community yet |
| Export | Cannot export community images to your own gallery |
| Sharing scope | All images in the gallery go public when community sharing is enabled |

> **Warning**: When community sharing is enabled, images are publicly distributed to all Azure customers. Exercise caution with images containing intellectual property.

## Prerequisites

Only the **owner of a subscription**, or a user/service principal with the **Compute Gallery Sharing Admin** role at the subscription or gallery level, can enable a gallery to go public.

## Steps to Create and Share a Community Gallery

### Step 1: Install CLI Extension

```bash
az extension add --name image-gallery --upgrade
```

### Step 2: Create a New Community-Shareable Gallery

**Cannot convert existing gallery** — must create a new one.

#### Azure Portal
1. Create new Compute Gallery
2. Sharing method: select **Community**
3. Fill in: Prefix (public display name), Publisher support email, Publisher URL
4. After creation, click the warning banner at the top of the gallery page to activate public sharing

#### REST API
```http
PUT https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.Compute/galleries/{galleryName}?api-version=2020-09-30

{
  "location": "{region}",
  "properties": {
    "sharingProfile": {
      "permissions": "Community",
      "communityGalleryInfo": {
        "publisherUri": "https://yourwebsite.com",
        "publisherContact": "support@yourcompany.com",
        "eula": "...",
        "publicNamePrefix": "MyPublicGallery"
      }
    }
  }
}
```

#### CLI
```bash
az sig create \
  --gallery-name <galleryName> \
  --resource-group <rg> \
  --permissions Community \
  --publisher-uri https://yourwebsite.com \
  --publisher-email support@yourcompany.com \
  --eula "..." \
  --public-name-prefix MyPublicGallery
```

### Step 3: Share the Gallery (Activate Community Sharing)

```bash
az sig share enable-community \
  --gallery-name <galleryName> \
  --resource-group <rg>
```

### Reset (Revert to RBAC-only Sharing)

```bash
az sig share reset \
  --gallery-name <galleryName> \
  --resource-group <rg>
```

> **Note**: To delete a community gallery, first reset sharing, then delete the gallery.

## VM Deployment from Community Gallery

When deploying VMs from community gallery images, use `imageReference.communityGalleryImageId`:

```json
"imageReference": {
  "communityGalleryImageId": "/communityGalleries/{publicGalleryName}/images/{imageName}/versions/{version}"
}
```

For RBAC-shared images, use `imageReference.id` instead.

## Best Practices

- Use resource locks to prevent accidental deletion of gallery or images
- Create image definitions and image versions in the same region as the gallery
- Use `Reset` command before attempting to delete a community gallery
