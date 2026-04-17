---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/TSGs/AutomaticImageCreation_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Image%20Builder%20%28AIB%29%2FTSGs%2FAutomaticImageCreation_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AIB
- cw.TSG
- cw.Reviewed-10-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

# Introduction
Automatic Image Creation uses triggers  to allow customers to start image builds for new base images automatically. Customers can start using the Automatic Image Creation feature by following the instructions provided in the public documentation. https://learn.microsoft.com/en-us/azure/virtual-machines/image-builder-triggers-how-to

 Automatic image creation improves customer experiences by offering the following benefits:
  - Customers can secure their images with automatic image-based operating system upgrades. 
 - Minimizes manual steps in image building for managing individual security and image update requirements. 

## Current Limitations: 

    - There is a limit of 100 triggers per region, per subscription. 
    - Minimum Azure Image Builder API version 2022-07-01.

#### **Image template requirements:**
    - The source must be either a Platform image or Azure Compute Gallery image (only these two sources are allowed currently)
    - If the customer is using a Platform Image, then the version in the source needs to be Latest. For an Azure Compute Gallery image the last part of the resource ID that has the version name needs to be set to Latest.
    - Customers cannot specify a version if their distributing the image to an Azure Compute Gallery. The version is automatically incremented.
    - When the source is set to an Azure Compute Gallery image and distribute is set to an Azure Compute Gallery, the source gallery image and the distribute gallery image can't be the same. 
    - The Azure Compute Gallery image definition ID cannot be the same for both the source gallery image and the distribute gallery image.
    - The image template should have "Succeeded" in the provisioningState, meaning the template was created without any issues. If the template isn't provisioned successfully, you won't be able to create a trigger.

#### **Trigger requirements:**
    - The location in the trigger needs to be the same as the location in the image template. This is a requirement of the az resource create cmdlet.
    - We currently support one kind of trigger, which is a "SourceImage"
    - We only support one "SourceImage" trigger per image. 
    - Customer's cannot update the kind field to another type of trigger. You have to delete the trigger and recreate it or create another trigger with the appropriate configuration.


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

# Mitigation

Always advise the customer to follow best practices while using Azure VM Image Builder. AIB Best Practices: https://learn.microsoft.com/en-us/azure/virtual-machines/image-builder-best-practices 
- The customer needs to review the prerequisites for Azure Image Builder and ensure they are allowing AIB to create these resources according to the prerequisite documentation. A collaboration to the Azure policy team may be needed but to open one, please verify via an AVA request or verify with a TA.

::: template /.templates/Processes/Knowledge-Management/Azure-Virtual-Machine-AzureImageBuilder-Feedback-Template.md
:::
