---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/TSGs/startbuild fail with AVDimage with languagepack_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Image%20Builder%20(AIB)%2FTSGs%2Fstartbuild%20fail%20with%20AVDimage%20with%20languagepack_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AIB: Start Build Fail with AVD Image + Language Pack

This article covers methods for creating Windows custom images with language packs and how to troubleshoot failures.

## Prerequisites

Before creating a custom image template, ensure the following resource providers are registered:

- Microsoft.DesktopVirtualization
- Microsoft.VirtualMachineImages
- Microsoft.Storage
- Microsoft.Compute
- Microsoft.Network
- Microsoft.KeyVault
- Microsoft.ContainerInstance

Check registration:
```powershell
Get-AzResourceProvider -ProviderNamespace Microsoft.VirtualMachineImages
Get-AzResourceProvider -ProviderNamespace Microsoft.Storage
Get-AzResourceProvider -ProviderNamespace Microsoft.Compute
Get-AzResourceProvider -ProviderNamespace Microsoft.KeyVault
Get-AzResourceProvider -ProviderNamespace Microsoft.ContainerInstance
```

Register if needed:
```powershell
Register-AzResourceProvider -ProviderNamespace Microsoft.VirtualMachineImages
Register-AzResourceProvider -ProviderNamespace Microsoft.Storage
Register-AzResourceProvider -ProviderNamespace Microsoft.Compute
Register-AzResourceProvider -ProviderNamespace Microsoft.KeyVault
Register-AzResourceProvider -ProviderNamespace Microsoft.ContainerInstance
```

Additional requirements:
- A resource group (must be empty before image build starts)
- A user-assigned managed identity with custom RBAC role including gallery read/write permissions
- If using existing VNet: managed identity needs access; Private Link Service policy must be disabled on subnet

## Method 1: AVD Custom Image Template Wizard

Use **Custom image templates** under Azure Virtual Desktop in Portal. The wizard provides a built-in language pack installation script.

## Method 2: Template-Based Deployment

Use an ARM template with the language pack customizer. Base template: `raw.githubusercontent.com/azure/azvmimagebuilder/main/solutions/14_Building_Images_WVD/armTemplateWVD.json`

Add the following in the customize section:

```json
{
    "destination": "C:\\AVDImage\\installLanguagePacks.ps1",
    "name": "avdBuiltInScript_installLanguagePacks",
    "sha256Checksum": "519f1dcb41c15dc1726f28c51c11fb60876304ab9eb9535e70015cdb704a61b2",
    "sourceUri": "https://raw.githubusercontent.com/Azure/RDS-Templates/master/CustomImageTemplateScripts/CustomImageTemplateScripts_2024-03-27/InstallLanguagePacks.ps1",
    "type": "File"
},
{
    "inline": [
        "C:\\AVDImage\\installLanguagePacks.ps1 -LanguageList \"Arabic (Saudi Arabia)\""
    ],
    "name": "avdBuiltInScript_installLanguagePacks-parameter",
    "runAsSystem": true,
    "type": "PowerShell"
}
```

## Troubleshooting Notes

- Ensure all resource providers are registered before template submission
- Verify managed identity has correct RBAC permissions scoped to the resource group
- If using existing VNet, disable Private Link Service Network Policy on the subnet
- Check customization.log in the staging resource group for detailed error messages
- Image generation must match VM image definition (Gen1 vs Gen2)
