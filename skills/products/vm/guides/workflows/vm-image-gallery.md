# VM Image & Gallery — 排查工作流

**来源草稿**: ado-wiki-a-Jarvis-Actions-for-Shared-Image-Gallery-ACG.md, ado-wiki-a-attributes-for-image-gallery-definition-version-acg.md, ado-wiki-b-Copy-SIG-Images-Across-Tenants-ACG.md, ado-wiki-b-Deploy-VM-From-Community-Gallery-Image-ACG.md, ado-wiki-b-Share-Gallery-with-Community-ACG.md, ado-wiki-c-AutomaticImageCreation-AIB.md, ado-wiki-e-Image-Version-Encryption-ACG.md, ado-wiki-f-azure-compute-gallery-home.md, ado-wiki-f-startbuild-fail-avdimage-languagepack.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 7
**覆盖子主题**: vm-image-gallery
**生成日期**: 2026-04-07

---

## Scenario 1: Step 1: Create the App Registration
> 来源: ado-wiki-b-Copy-SIG-Images-Across-Tenants-ACG.md | 适用: Mooncake \u2705

### 排查步骤
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

`[来源: ado-wiki-b-Copy-SIG-Images-Across-Tenants-ACG.md]`

---

## Scenario 2: Step 1: List Image Definitions in the Community Gallery
> 来源: ado-wiki-b-Deploy-VM-From-Community-Gallery-Image-ACG.md | 适用: Global-only \u274c

### 排查步骤
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

`[来源: ado-wiki-b-Deploy-VM-From-Community-Gallery-Image-ACG.md]`

---

## Scenario 3: Share Gallery With Community Acg
> 来源: ado-wiki-b-Share-Gallery-with-Community-ACG.md | 适用: Global-only \u274c

### 排查步骤
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

`[来源: ado-wiki-b-Share-Gallery-with-Community-ACG.md]`

---

## Scenario 4: Automaticimagecreation Aib
> 来源: ado-wiki-c-AutomaticImageCreation-AIB.md | 适用: Mooncake \u2705

### 排查步骤
# Troubleshooting
**1. Check the API version:** 
- Ensure the customer is using the correct API version (API version must be 2022-07-01 or above for automatic image creation to work) 
**2. Make sure the customer has registered the automatic image creation triggers feature using the following command:** 
- az feature register --namespace Microsoft.VirtualMachineImages --name Triggers 
**3. Double check the location of the trigger:** 
- The location in the trigger needs to be the same as the location in the image template. This is a requirement of the az resource create cmdlet. 
**4. Make sure the customer does not already have a trigger created for the source image:** 
- We only support one "SourceImage" trigger per image. If you already have a "SourceImage" trigger on the image, then you can't create a new one. 
**5. Double check the customer is Azure Policies:**
- Verify that the Azure Policies in the customer�s subscription do not deny the deployment of the required resources. 
- Policies restricting resource types (excluding Azure Container Instance) could block deployment.  

---

## Scenario 5: Image Version Encryption Acg
> 来源: ado-wiki-e-Image-Version-Encryption-ACG.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
To create encrypted image version through Portal:
1. On the Create VM image version, select the **Encryption** tab.
2. In the Encryption type, select any one of the below options: PMK, CMK, or Dual encryption (PMK+CMK).
3. For Customer-managed key and Double encryption with PMK+CMK, you need to select the **Disk name** and **Disk Encryption set**.

---

## Scenario 6: Azure Compute Gallery Home
> 来源: ado-wiki-f-azure-compute-gallery-home.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting
For common error messages and mitigations: [Common Error Messages TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496063/Azure_Virtual-Machine_Shared-Image-Gallery_TSG_Common-Error-Messages)

---

## Scenario 7: Troubleshooting Notes
> 来源: ado-wiki-f-startbuild-fail-avdimage-languagepack.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting Notes
- Ensure all resource providers are registered before template submission
- Verify managed identity has correct RBAC permissions scoped to the resource group
- If using existing VNet, disable Private Link Service Network Policy on the subnet
- Check customization.log in the staging resource group for detailed error messages
- Image generation must match VM image definition (Gen1 vs Gen2)

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
