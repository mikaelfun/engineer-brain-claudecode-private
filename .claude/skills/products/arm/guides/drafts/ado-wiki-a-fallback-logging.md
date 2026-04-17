---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Diagnostics and Monitoring/Fallback Logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FDiagnostics%20and%20Monitoring%2FFallback%20Logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Fallback Logging (Winfield) - Overview

When the Winfield appliance VM (IRVM01) is disconnected, offline due to failure, or otherwise not able to upload diagnostic data directly, there is a fallback logging process.

## Winfield Fallback Logging Cmdlets

The Winfield module contains three cmdlets for fallback logging:

1. **Get-ObservabilityStampId** - Retrieve the observability stamp ID
2. **Copy-WinfieldDiagnosticData** - Export diagnostic logs locally
3. **Send-WinfieldDiagnosticData** - Upload logs to Azure (Kusto/Geneva workspace)

Fallback logging relies on the Winfield module being imported.

## Diagnostic Upload by Support Engineers

If a customer can export logs with `Copy-WinfieldDiagnosticData` but cannot upload them with `Send-WinfieldDiagnosticData`:

1. Customer provides logs via approved **DTM File Transfer** process
2. Support engineer runs `Send-WinfieldDiagnosticData` on the customer's behalf

> **Important**: `Send-WinfieldDiagnosticData` downloads and runs the standalone observability pipeline and **Arc-enables the host machine**. CSS Support Engineers should **NOT** run this on their primary work device.

The Beta team is evaluating:
- What to use as the client machine for this step
- What parameters are needed to upload to the correct workspace
- Whether support engineers need a separate Azure Subscription/Tenant

## Additional References

- [Winfield Fallback Logging (eng.ms)](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-edge/azure-stack-hub/arc-autonomous/arca-observability/onboardingguide/winfieldfallbacklogging)
- [Fallback Logging (Winfield) - azssaturn wiki](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki/1693/Fallback-Logging-%28Winfield%29)
- [ArcA Fallback Logging Video](https://microsoft-my.sharepoint.com/:v:/p/adgrieco/ERIiYEuxVdBCrciEKR4DYTIBSXjqg_wdTb_H0loGdFCPdw)
