---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/TSGs/Monitoring TSGs/Monitoring Extension Linux manual upgrade_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20%28ACSS%29%2FTSGs%2FMonitoring%20TSGs%2FMonitoring%20Extension%20Linux%20manual%20upgrade_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Monitoring Extension Linux Manual Upgrade

## Upgrade Instructions

To be executed from the Azure Cloud Shell - "Bash"

1. Download "MonitoringExtensionUpgradePerSub.sh"

2. Open Azure Cloud Shell

3. Click on "Upload/Download files"

4. Set execution permissions on the file
```bash
chmod +x MonitoringExtensionUpgradePerSub.sh
```

5. Execute the script by providing `<subscriptionId>` and `<monitoringExtensionVersion>` as input
```bash
./MonitoringExtensionUpgradePerSub.sh <subscriptionId> 1.0.9.0
```

## FAQ

### Sample Input and Output

Input:
```bash
chmod +x MonitoringExtensionUpgradePerSub.sh
./MonitoringExtensionUpgradePerSub.sh <subscriptionId> 1.0.9.0
```

Output: Will get a "running" prompt when the install is in progress.
```json
[
  {
    "autoUpgradeMinorVersion": true,
    "enableAutomaticUpgrade": false,
    "forceUpdateTag": "d3f2b931-92a6-4982-be0b-8d031e09372a",
    "id": "/subscriptions/xxx/resourceGroups/opx-e2e-rg/providers/Microsoft.Compute/virtualMachines/opxascsvm1/extensions/MonitoringExtensionLinux",
    "provisioningState": "Succeeded",
    "publisher": "Microsoft.Azure.Workloads",
    "typePropertiesType": "MonitoringExtensionLinux"
  }
]
```

### Alternative to Azure Cloud Shell

The script can be run locally:
- Ensure Azure CLI is installed
- Run `az login`
- Download the script file
- Set execution permissions: `chmod +x MonitoringExtensionUpgradePerSub.sh`
- Execute: `./MonitoringExtensionUpgradePerSub.sh <subscriptionId> 1.0.9.0`
