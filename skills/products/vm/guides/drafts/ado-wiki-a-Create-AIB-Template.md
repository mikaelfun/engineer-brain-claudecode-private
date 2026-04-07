---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/How Tos/Create AIB Template_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Image%20Builder%20%28AIB%29/How%20Tos/Create%20AIB%20Template_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AIB
- cw.How-To
- cw.Reviewed-03-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

#How-To create an image with Azure Image Builder
This wiki page goes over creating an image with Azure Image builder. It will mostly link to the online documentation, to concisely show the different steps/prerequisites necessary to configure and follow in order to create your first image with Azure Image Builder.
 
First make sure you have the resource provider [registered](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/image-builder#register-the-providers) 

After the resource provider has been registered you can create the Image Template, which is a JSON file. The general structure is as follows:

##[Basic Template Format](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=/azure/virtual-machines/windows/toc.json)
####Required
- [Type and API Version](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#type-and-api-version)
- [Location](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#location)
- [User assigned Identity] (https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json&tabs=json%2Cazure-powershell#identity)- You must create a user assigned managed identity for use with AIB, this will be used during the image build to read images, write images, access Azure storage, access existing VNETs etc. You will need to give this User Identity access to those necessary resources. [Template Reference](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json&tabs=json%2Cazure-powershell#identity)

- Source - This is your source image AIB will create a VM from and then customize, sysprep/deprovision, and capture. This can be a MarketPlace image or a custom image. [Template Reference](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#identity)
- Customizers - Customizers are functions that are used to customize your image, such as running scripts, or rebooting Servers. [Template Reference](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#identity)
    - Windows Customizers
        - PowerShell - [ScriptUri or inline command](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#windows-update-customizer)
        - File - [copy a file](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#file-customizer)
        - [Windows Restart](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#windows-restart-customizer)
        - [Windows Update](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#windows-update-customizer)
    - Linux Customizers
        - Shell - [ScriptUri or inline command](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#shell-customizer)
        - File - [copy a file](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#file-customizer)

- Distribute - You can distribute your image to a managed image or to Shared Image Gallery. [Template Reference](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#properties-distribute)

####Optional
- [vmProfile](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#vmprofile) - By default Image Builder will use a "Standard_D1_v2" build VM, you can override this.
- [osDiskSizeGB](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#osdisksizegb) - By default, Image Builder will not change the size of the image, it will use the size from the source image.
- [vnetConfig](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#vnetconfig) - You can specify a custom VNET if you wish to have AIB not assign a public IP to the VM to interact with for security purpose or preference. In this case, AIB will create a Load Balancer and Proxy VM and use Azure Private Link service to connect through to the VM in the custom VNET. Github has additional information on using custom VNETs and the necessary permissions that need to be configured, [AIBNetworking](https://github.com/danielsollondon/azvmimagebuilder/blob/master/aibNetworking.md).
- [buildTimeoutInMinutes](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json&bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#linux-restart) - By default, the Image Builder will run for 240 minutes. After that, it will timeout and stop, whether or not the image build is complete. If you do not specify a buildTimeoutInMinutes value, or set it to 0, this will use the default value. You can increase or decrease the value, up to the maximum of 960mins (16hrs). For Windows, we do not recommend setting this below 60 minutes.

###Submit image configuration
Configure Variables for use:
- [$RG](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/image-builder#create-the-resource-group) = Resource group where you want to store image configuration template artifact and the image.
- $name = name for the image template
- $templateLoc =  location where the template you created is saved
    - **NOTE**: The @ symbol is <u>required</u> before the template location. Ex: @c:\template\imagetemplate.json

[Azure CLI](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/image-builder#create-the-image):
```
az resource create --resource-group $RG --properties $templateLoc --is-full-object --resource-type Microsoft.VirtualMachineImages/imageTemplates -n $name
```
###Start the image build
After submitting the template you have to kick off the image builder process.

[Azure CLI](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/image-builder#start-the-image-build):
```
az resource invoke-action --resource-group $RG --resource-type Microsoft.VirtualMachineImages/imageTemplates -n $name --action Run
```
###Additional Resources
[Github template examples](https://github.com/danielsollondon/azvmimagebuilder)
Full Template example:
```JSON
{
    "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "imageTemplateName": {
        "type": "string"
        },
        "api-version": {
          "type": "string"
        },
        "svclocation": {
            "type": "string"
        }
    },
    
    "variables": {
    },

    "resources": [
      {
    "name": "[parameters('imageTemplateName')]",
    "type": "Microsoft.VirtualMachineImages/imageTemplates",
    "apiVersion": "[parameters('api-version')]",
    "location": "[parameters('svclocation')]",
    "dependsOn": [],
    "tags": {
        "imagebuilderTemplate": "windows2019",
        "userIdentity": "enabled"
            },
        "identity": {
            "type": "UserAssigned",
                    "userAssignedIdentities": {
                    "<imgBuilderId>": {}
                        
                }
                },
    "properties": {

        "buildTimeoutInMinutes" : 100,

        "vmProfile": 
                {
                "vmSize": "Standard_D1_v2",
                "osDiskSizeGB": 127
                },
        
        "source": {
            "type": "PlatformImage",
                "publisher": "MicrosoftWindowsServer",
                "offer": "WindowsServer",
                "sku": "2019-Datacenter",
                "version": "latest"
            
        },
        "customize": [
            {
                "type": "PowerShell",
                "name": "CreateBuildPath",
                "runElevated": false,
                "scriptUri": "https://raw.githubusercontent.com/danielsollondon/azvmimagebuilder/master/testPsScript.ps1"
            },
            {
                "type": "WindowsRestart",
                "restartCheckCommand": "echo Azure-Image-Builder-Restarted-the-VM  > c:\\buildArtifacts\\azureImageBuilderRestart.txt",
                "restartTimeout": "5m"
            },
            {
                "type": "File",
                "name": "downloadBuildArtifacts",
                "sourceUri": "https://raw.githubusercontent.com/danielsollondon/azvmimagebuilder/master/quickquickstarts/exampleArtifacts/buildArtifacts/index.html",
                "destination":"c:\\buildArtifacts\\index.html"
            },

            {
                "type": "PowerShell",
                "name": "settingUpMgmtAgtPath",
                "runElevated": false,
                "inline": [
                    "mkdir c:\\buildActions",
                    "echo Azure-Image-Builder-Was-Here  > c:\\buildActions\\buildActionsOutput.txt"
                ]
                },
                {
                    "type": "WindowsUpdate",
                    "searchCriteria": "IsInstalled=0",
                    "filters": [
                        "exclude:$_.Title -like '*Preview*'",
                        "include:$true"
                                ],
                    "updateLimit": 20
                }
        ],
        "distribute": 
            [
                {   "type":"ManagedImage",
                    "imageId": "/subscriptions/<subscriptionID>/resourceGroups/<rgName>/providers/Microsoft.Compute/images/<imageName>",
                    "location": "<region>",
                    "runOutputName": "<runOutputName>",
                    "artifactTags": {
                        "source": "azVmImageBuilder",
                        "baseosimg": "windows2019"
                    }
                }
            ]
        }
    }
]

}
```
##[Clean Up](https://github.com/danielsollondon/azvmimagebuilder/tree/master/quickquickstarts/0_Creating_a_Custom_Windows_Managed_Image#clean-up)
- Delete submitted image template
```
az resource delete --resource-group $RG --resource-type Microsoft.VirtualMachineImages/imageTemplates -n $name
```
- Delete the resource group if you are done with it
```
az group delete -n $RG
```
##Additional notes
- You can use [PowerShell](https://github.com/danielsollondon/azvmimagebuilder/tree/master/quickquickstarts/1_Creating_a_Custom_Win_Shared_Image_Gallery_Image#using-powershell-to-create-a-windows-server-custom-image-using-azure-vm-image-builder) instead of Azure CLI to accomplish all the same steps.
- [Troubleshooting Doc](https://github.com/danielsollondon/azvmimagebuilder/blob/master/troubleshootingaib.md) if you run into issues with your template or build.




::: template /.templates/Processes/Knowledge-Management/Azure-Virtual-Machine-AzureImageBuilder-Feedback-Template.md
:::

