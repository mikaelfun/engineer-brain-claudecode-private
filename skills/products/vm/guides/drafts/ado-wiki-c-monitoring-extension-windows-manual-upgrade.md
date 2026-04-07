---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/TSGs/Monitoring TSGs/Monitoring Extension Windows manual upgrade_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20%28ACSS%29%2FTSGs%2FMonitoring%20TSGs%2FMonitoring%20Extension%20Windows%20manual%20upgrade_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Monitoring Extension Windows Manual Upgrade

In situations where a manual upgrade is needed for Windows VMs registered with ACSS using an out of date extension, this TSG covers 2 methods: Azure Cloud Shell or Local execution.

## Using Bash via Azure Cloud Shell

1. Download "MonitoringExtensionUpgradePerSub-windows.sh"

2. Open Azure Cloud Shell

3. Click on "Upload/Download files"

4. Set execution permissions on the file:
```bash
chmod +x MonitoringExtensionUpgradePerSub-windows.sh
```

5. Execute the script by providing `{subscriptionId}` and `{monitoringExtensionVersion}` as input:
```bash
./MonitoringExtensionUpgradePerSub-windows.sh {subscriptionId} {monitoringExtensionVersion}
```

### Sample Output

Will get a "running" prompt when the install is in progress.

```json
[
  {
    "autoUpgradeMinorVersion": true,
    "enableAutomaticUpgrade": true,
    "forceUpdateTag": "d3f2b931-92a6-4982-be0b-8d031e09372a",
    "id": "/subscriptions/{SubscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{VMName}/extensions/MonitoringExtensionWindows",
    "provisioningState": "Succeeded",
    "publisher": "Microsoft.Azure.Workloads",
    "typePropertiesType": "MonitoringExtensionWindows"
  }
]
```

## Upgrading Locally

- Ensure Azure CLI is installed
- Run `az login`
- Download the script file
- Set execution permissions: `chmod +x MonitoringExtensionUpgradePerSub-windows.sh`
- Execute: `./MonitoringExtensionUpgradePerSub-windows.sh {subscriptionId} 1.0.20.0`
