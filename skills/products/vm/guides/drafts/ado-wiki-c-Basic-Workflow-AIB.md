---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/Workflows/Basic Workflow_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Image%20Builder%20%28AIB%29/Workflows/Basic%20Workflow_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AIB
- cw.Workflow
- cw.Reviewed-10-2023
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

##Scenario
Customer has experienced an issue or received an error when trying to create an image with Azure Image Builder (AIB).

# Troubleshooting Flow

:::mermaid
graph TD
     Start[Start] -->ACGorAIB(Is the issue with ACG or AIB)
     ACGorAIB --> ACGWF([ACG Basic Workflow])
     ACGorAIB --> AIBWF([AIB Basic Workflow])
     AIBWF --> Information(Information Collection <br><br> - What error are you receiving? <br> - Are you using Azure Image Builder DevOps task? <br> - Are you using custom scripting inside your template? <br> - Has the custom script been tested and verified to work outside of Image Builder? <br> - What is the name of the resource group where you are storing your image template and/or image? <br>- What is the name of the image template you submitted that is having the issue? <br> - Is your source image a custom image or a marketplace image? <br> - Can you provide the JSON image configuration template you are using? <br> - Can you provide the customization.log file for the latest build that failed? <br> - Customer approval for log collection)
     Information --> Template(Is the image template available in ASC?)
     Template --> |NO| AdvancedWF([AIB Advanced Workflow])
     Template -->|YES|Data(Data Collection <br><br> - Confirm the customer is using AIB <br> - Verify the staging Resource Group where AIB is creating the VM to build the image <br>- Verify the region it is located in <br> - Verify the LastRunStatus State <br> Verify the LastRunStatus Message <br> - Collect the Customization.log file aka Packer Logs)

   
 class Start startAWorkflow;
 click ACGWF "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1202262/Basic-Workflow_ACG"
 click AdvancedWF "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495093/Advnced-Workflow_AIB"
 classDef clickable fill:#2a9df4,color:#ffffff;
 classDef startAWorkflow fill:#80c904,color:#ffffff;
:::

# AIB Prerequisites
- Customer's Azure Policy must allow AIB to create a staging resource group with a prefix of **"IT_"** and tags **"createdBy": "AzureVMImageBuilder"**
- Customer's Azure Policy must allow AIB to create a storage account in the staging resource group, this storage account stores log files as well as some other files needed by AIB. Requirements for the storage account are:
    - Cannot have the storage firewall enabled
    - Storage account type general-purpose V2 with ZRS redundancy options

**NOTE**: If the customer is using AIB DevOps task, it may do some automated cleanup. This may end up deleting some of the logs and image templates we usually use for troubleshooting, the customer will need to help provide the necessary logs for troubleshooting.

# Azure Image Builder Service DevOps Task
<details>

<summary>Click to expand/collapse this section</summary>

If the customer is using the AIB DevOps task, please rule out the AIB service as an issue first and then engage the DevOps team on a collab for assistance. **NOTE**: specifically ask for assistance with capturing the debug logs from the pipeline and verifying DevOps is not a possible issue. Otherwise, the DevOps team will reroute your collab. The Azure VM team only supports troubleshooting the AIB service (Microsoft.VirtualMachineImages Resource Provider). This DevOps Task is owned by the Image Builder team. After troubleshooting, if it is deemed the issue is most likely with the task itself you will need to open an ICM to the Image Builder Product Group team, AzureRT/AzureVMImageBuilder.


- SAP for routing collab to DevOps team for assistance with log collection: Azure\Azure DevOps Service\ Pipelines - Configuring pipelines\ Other

[Azure Image Builder Service DevOps Task Public Doc](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-devops-task)

[Troubleshooting AIB DevOps Task Public Doc](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-troubleshoot#devops-task)

To run multiple commands/scripts in the devops task it can be specified like the example below:

```
& 'c:\buildArtifacts\webapp\webconfig.ps1'
& 'c:\buildArtifacts\webapp\Script2.ps1'
```
This expands on the public example for inline customization scripts found [here](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-devops-task#inline-customization-script)

**Additional Notes:**
- The AIB DevOps task does not currently support running as elevated as seen [here](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/image-builder-virtual-desktop#tips-for-building-windows-images), which may cause issues is some customer's custom scripts on Windows 10.
- The AIB DevOps task does not currently support passing secrets from the keyvault to a custom script being run as part of the PowerShell inline commands
- The AIB DevOps task does not have support for rebooting Windows builds, if you try to reboot with PowerShell code, the build will fail. However, you can use code to reboot Linux builds. [Public Doc](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-devops-task#handling-reboots)
</details>

# Information Collection
##Scoping Questions
- What error are you receiving?
- Are you using [Azure Image Builder DevOps task](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-devops-task) or submitting a template via PowerShell or Azure CLI?
- Are you using custom scripting inside your template?
    - If so, has it been tested and verified to work outside of Image Builder? -- see ["Tips for troubleshooting script/inline customization"](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-troubleshoot#tips-for-troubleshooting-scriptinline-customization) section in the Public docs.
- What is the name of the resource group where you are storing your image template and/or image?
- What is the name of the image template you submitted that is having the issue?
- Is your source image a custom image or a marketplace image?
- Can you provide the JSON image configuration template you are using? -- Image template reference public doc [here](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json)
- Can you provide the customization.log file for the latest build that failed? -- For help understanding the customization.log please see this [wiki page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495092)

Verify the Region is available for the AIB service: [Region Availability](https://docs.microsoft.com/en-us/azure/virtual-machines/image-builder-overview?bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#regions)
 
Verify if the OS is officially supported: [OS Supported](https://docs.microsoft.com/en-us/azure/virtual-machines/image-builder-overview?bc=%2Fazure%2Fvirtual-machines%2Fwindows%2Fbreadcrumb%2Ftoc.json#os-support)

**NOTE:** What does 'supported OS mean'? This means we test with these OS, it does not mean other OS's do not work on Image Builder. If a customer is using a 'non-supported os', please try to help, by checking basics, raise an ICM for a support request if necessary.

# Data Collection
##Troubleshooting in ASC
The easiest way to confirm the customer is using AIB is to open resource explorer and View by Resource Provider. Make sure **Microsoft.VirtualMachineImages** is listed.

[![AIBrpInASC.png](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBrpInASC.png)](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBrpInASC.png)

Navigate to the resource group where the customer is storing the image template and click on the template name. You will now be able to see the following information:
- Staging Resource Group where AIB is creating the VM to build the image
- Region
- LastRunStatus State
- LastRunStatus Message

[![AIBimagetemplateASC.png](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBimagetemplateASC.png)](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBimagetemplateASC.png)

You can also download the customization.log (Packer Logs) here as well for further troubleshooting. -- For help understanding the customization.log and using the customization log analyzer please see this [wiki page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495092)

[![AIBlogsASC.png](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBlogsASC.png)](/.attachments/SME-Topics/Azure-Image-Builder-(AIB)/AIBlogsASC.png)

##Manually gather the customization.log file

- Important: Customer will need to upload the log to the case via DTM once gathered.

###Step 1: Locate the customization.log

After the image build completes or fails, Azure Image Builder stores logs in a storage account within the staging resource group created for the build.

####In the Azure Portal:
Navigate to Resource Groups and find the staging group (format: IT_<DestinationRG>_<TemplateName>_<GUID>).
- Open the Storage Account inside this group.


Under Data Storage, select Containers  look for the container named packerlogs.
- Inside packerlogs, folders are organized by build runs (oldest to newest). Open the folder for the build you want.

####Download the file named:

customization.log

####For help understanding the customization.log and using the customization log analyzer please see this [wiki page](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495092)

# Additional Troubleshooting Resources
[Public AIB Troubleshooting Doc](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-troubleshoot)

[Internal AIB Home wiki page TSG section](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495090/Image-Builder?anchor=troubleshooting-guide)

- Customers can cancel a currently running build if needed, see [cancelling an image build](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json#cancelling-an-image-build) in the public docs.
- As noted in the [public documentation](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/image-builder#create-the-image), you must not delete the staging resource group directly (this is prefixed with **IT_**, it is the resource group the AIB service creates). **First delete the image template artifact**, this will cause the staging resource group to be deleted.
- Permission Requirements in [CLI](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-permissions-cli) or [PowerShell](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-permissions-powershell), and explained in extra detail on [GitHub](https://github.com/danielsollondon/azvmimagebuilder/blob/master/aibPermissions.md#azure-vm-image-builder-permissions-explained-and-requirements)
- Check to make sure the Customer's Azure Policy in their Subscription allows the AIB service to create storage accounts, this is required for AIB to work.
    - Storage Account requirements: General Purpose V2, redundancy - ZRS
- The AIB service does not allow Customer specified tags, but does specify its own. 
    - AIB service specified tag: **"createdBy": "AzureVMImageBuilder"**
    - Resources created by AIB have this tag.
    - The customer can use this tag if needed to edit their Azure Policy to allow the AIB service to function in their environment.
    - The current [Tag property](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json#tags) that can be used in a template is for the image generated by AIB only.
- AIB assumes an exit code of 0 unless otherwise specified in the image template properties, [see here to specify.](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json#powershell-customizer) A non-zero exit code from a custom script will cause AIB to fail the build and exit. 
- If after following this General troubleshooting TSG, you have not been able to gather enough information to troubleshoot the issue please reach out to the [AIB SME channel](https://wikiredirectorendpoint.azurewebsites.net/api/wikiredirecting?url=https://teams.microsoft.com/l/channel/19%3a4a5c376b6fef4a808701d2526781eb8b%40thread.tacv2/CONF%2520-%2520Compute%2520Gallery%2520-%2520AIB%2520(AVA)?groupId=55f6a42a-c262-4937-bf2d-d290d7037af3&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) on Teams as we may need to create an ICM to engage the AIB Product Group team.


::: template /.templates/Processes/Knowledge-Management/Azure-Virtual-Machine-AzureImageBuilder-Feedback-Template.md
:::

<font size='2'>_Last reviewed 06/2021_</font>