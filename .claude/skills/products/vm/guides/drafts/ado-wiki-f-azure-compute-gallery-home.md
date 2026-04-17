---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/Azure Compute Gallery (ACG) Home"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20(ACG)%2FAzure%20Compute%20Gallery%20(ACG)%20Home"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Compute Gallery (ACG) Overview

**NOTE: Shared Image Gallery (SIG) has been renamed to Azure Compute Gallery (ACG)**

Azure Compute Gallery is an Azure-based solution for building structure and organization around custom VM images. Customers can share images between users, service principals, or AD groups and replicate them to multiple regions.

## Architecture

### Resource Hierarchy

Gallery > Image Definition > Image Version

- **Image Gallery**: Repository for managing and sharing images. Gallery names must be unique within subscription.
- **Image Definition**: Carries all information about the image (OS type, release notes, memory requirements). Properties like name, publisher, offer, SKU, and OS type are mandatory.
- **Image Version**: Used for VM creation. Source image must exist in succeeded state and same region.

### Scaling

Scale tiers control how many instances can be deployed from an image version. Platform creates sufficient replicas to satisfy requested scale and reduce throttling.

### Replication

Image versions can be replicated to different regions. Replication time varies based on number of regions and image size.

## Limits

Per subscription, per region:
- 100 shared image galleries
- 1,000 image definitions
- 10,000 image versions

**If limits exceeded:**
1. Deploy image versions in other regions
2. Use a different subscription
3. Remove older, unused images
4. If all exhausted, escalate with business justification for quota extension

## Billing

- Storage costs for Image Versions and replicas in every region
- Network egress charges for replication from source to target regions (first replica only)
- Old ACG versions show as snapshots in billing

## Workflow

1. Determine if issue is with ACG or AIB (Azure Image Builder)
2. If ACG: determine if issue is with ACG resource or VM Application
3. Collect information: issue description, error message, subscription ID, gallery/definition/version names
4. Check resource type: Compute Gallery workflow vs Image Definition/Version TSGs

## Troubleshooting

For common error messages and mitigations: [Common Error Messages TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496063/Azure_Virtual-Machine_Shared-Image-Gallery_TSG_Common-Error-Messages)

## Escalation

1. Reach out to **SME - Azure Compute Gallery** Teams channel with case number, issue description, and question
2. Set area path to **Azure/Virtual Machine running Windows/Azure Features/Azure Compute Gallery** then escalate via ASC to create ICM (Support\EEE AzureRT queue)

## Reference

- [Azure Compute Gallery Overview](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/shared-image-galleries)
- [Troubleshooting ACG](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/troubleshooting-shared-images)
- [SIG FAQ](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/shared-image-galleries#frequently-asked-questions)
