---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Image Builder (AIB)/Workflows/Advnced Workflow_AIB"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Image%20Builder%20(AIB)%2FWorkflows%2FAdvnced%20Workflow_AIB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AIB: Advanced Workflow - Preserving Build VM for Troubleshooting

This guide covers two methods for preserving the AIB build VM when advanced troubleshooting is needed (e.g., Windows Update or sysprep issues).

## Method 1: Resource Lock on Staging Resource Group

Use this when you need the build VM to stay running for investigation by another team.

### Steps

1. Have the customer run their Image Template to start the build
2. After the template is submitted, navigate to the **IT_** resource group that gets created
3. Create a **Delete lock** on the IT_ resource group:
   - Go to the resource group > Settings > Locks
   - Add a lock with Lock type = Delete
4. The AIB build will fail after ~30 minutes when it cannot delete resources
5. With the delete lock in place and build VM running, use **Reset Password** in Portal to set a username/password for local RDP access
6. Perform troubleshooting on the build VM
7. When done:
   - Remove the delete lock
   - Have the customer delete the Image Template first
   - Then manually delete any remaining resources

## Method 2: errorHandling Property

Use the `errorHandling` property in the image template to preserve resources on failure.

### Template Configuration

```json
{
  "errorHandling": {
    "onCustomizerError": "abort",
    "onValidationError": "cleanup"
  }
}
```

### Property Details

- **onCustomizerError**: Action on customizer phase error
- **onValidationError**: Action on validation phase error

### Values

- **cleanup** (default): Temporary resources created by Packer are cleaned up even on error. Maintains backwards compatibility.
- **abort**: AIB service skips cleanup of temporary resources. The template owner is responsible for cleaning up. Resources may contain useful logs and files for investigation.

### Requirements

- Minimum API version: 2022-07-01
- Case-sensitive property names as of API version 2024-02-01

### Reference

- [Public Doc: errorHandling property](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?tabs=json%2Cazure-powershell#properties-errorhandling)
