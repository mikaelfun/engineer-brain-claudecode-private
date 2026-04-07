---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/Deployment modes"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FDeployment%20modes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Azure Resource Manager (ARM) template offers two primary deployment modes: **Incremental** and **Complete**.

## Incremental mode

This is the default mode that will be used if the mode property is not defined on the template. In this mode, ARM adds or modifies the resources in the template but does not delete existing resources from the resource group where the template is being deployed to.

### Example scenario
A template is deployed with two storage accounts to a resource group, but the resource group already contains a third storage account that is not defined in the template. The third storage account **will not** be affected by this deployment.

**Usage example:** Set the mode property to `incremental`.

#### JSON
``` json
"resources": [
  {
    "type": "Microsoft.Resources/deployments",
    "apiVersion": "2020-10-01",
    "name": "linkedTemplate",
    "properties": {
      "mode": "Incremental",
          <nested-template-or-external-template>
    }
  }
]
```

#### PowerShell cmdlet
``` powershell
New-AzResourceGroupDeployment  -Mode Incremental -Name ExampleDeployment  -ResourceGroupName ExampleResourceGroup  -TemplateFile c:\MyTemplates\storage.json
```

#### Azure CLI command
```bash
az deployment group create --mode Incremental --name ExampleDeployment --resource-group ExampleResourceGroup --template-file storage.json
```

## Complete mode

In this mode, resources in the resource group that are not defined in the template will be deleted.

### Example scenario
A template is deployed with two storage accounts to a resource group, but the resource group already contains a third storage account that is not defined in the template. The third storage account **will be deleted** by the deployment.

**Usage example:** Set the mode property to `complete`.

#### JSON
```json
"resources": [
  {
    "type": "Microsoft.Resources/deployments",
    "apiVersion": "2020-10-01",
    "name": "linkedTemplate",
    "properties": {
      "mode": "Complete",
          <nested-template-or-external-template>
    }
  }
]
```

#### PowerShell cmdlet
``` powershell
New-AzResourceGroupDeployment -Mode Complete -Name ExampleDeployment  -ResourceGroupName ExampleResourceGroup  -TemplateFile c:\MyTemplates\storage.json
```

#### Azure CLI command
```bash
az deployment group create --mode Complete --name ExampleDeployment --resource-group ExampleResourceGroup --template-file storage.json
```

## Common Issues related to deployment modes

### Accidental resource deletion
When using Complete mode, resources not included in the template will be deleted, which can lead to accidental loss of important resources. It is recommended to use what-if operation when using complete mode which shows you which resources will be created, deleted, or modified without applying the deployment.

For more information about deployment modes, see [[LEARN] Azure Resource Manager deployment modes](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deployment-modes).
