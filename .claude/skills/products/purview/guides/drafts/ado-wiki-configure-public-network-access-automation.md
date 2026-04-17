---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Microsoft Purview Administration/Create or delete an Microsoft Purview instance/Configure public network access settings during deployment via automation"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FMicrosoft%20Purview%20Administration%2FCreate%20or%20delete%20an%20Microsoft%20Purview%20instance%2FConfigure%20public%20network%20access%20settings%20during%20deployment%20via%20automation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configure Public Network Access Settings During Deployment via Automation

Customers when deploying a Purview account using the ARM template or bicep code can use the following settings in the template to manage the Public network access settings:

## Configuration Options

### Enabled for all networks

```json
"publicNetworkAccess": "Enabled",
"managedResourcesPublicNetworkAccess": "Enabled"
```

### Disabled for ingestion only (Preview)

```json
"publicNetworkAccess": "Enabled",
"managedResourcesPublicNetworkAccess": "Disabled"
```

### Disabled from all networks

```json
"publicNetworkAccess": "Disabled",
"managedResourcesPublicNetworkAccess": "Disabled"
```

## Sample ARM Template

```json
"resources": [
    {
      "type": "Microsoft.Purview/accounts",
      "apiVersion": "2021-12-01",
      "name": "[parameters('purviewName')]",
      "location": "[parameters('location')]",
      "sku": {
        "name": "Standard",
        "capacity": 1
      },
      "identity": {
        "type": "SystemAssigned"
      },
      "properties": {
        "publicNetworkAccess": "Enabled",
        "managedResourcesPublicNetworkAccess": "Enabled",
        "managedResourceGroupName": "[format('managed-rg-{0}', parameters('purviewName'))]"
      }
    }
  ]
```
