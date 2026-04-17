---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Jarvis/ACR Jarvis Actions New"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Jarvis Actions for ACR

Recently we have been provided with the ability to view ACR Private endpoints and the "Master Entity" for ACR using Jarvis, this allows us to see the details of the private endpoints that a customer has configured on their ACR and also any Firewall rules they have created on their ACR.

**JIT access to these actions are provided through the security group "TM-Krater-CSS-JITAccess" (https://oneidentity.core.windows.net/), if you are not a member of this group you can check with your TA.**

## ACR Private endpoints

To view the Private endpoints created on an ACR:
1. Get a SAVM up and running
2. Navigate to the main Jarvis/Geneva Actions website (aka.ms/jarvis)
3. Click on actions, authenticate with AME credentials/yubikey
4. Use the "Filter" to find the registry actions, or use short link: https://portal.microsoftgeneva.com/98B4AA38
5. Expand "Azure Container Registry" > "User Registry Management" > "Get Registry Private endpoints"
6. Fill in the Login Server of the ACR and click "Get Access" to initiate JIT

**JIT Configuration for ACR:**
- Scope: ACRSupport
- Access Level: PlatformServiceOperator
- Work-item id: any ICM or JIT ICM

**Key output**: Look for the "NRP PE ID" property — provides the resourceID of the private endpoint to find which VNET it is connected to.

### Private Endpoint Use Example

If a customer cannot connect to or pull images from ACR with errors like:
- `Could not connect to the registry login server 'registry.azurecr.io'`
- `dial tcp 12.0.0.5:443: i/o timeout`

This could happen if ACR has private endpoints enabled, client is not on a VNET where the private endpoint is connected, and public access is disabled.

## ACR Firewall rules

Use "Get Registry Master Entity" action in Jarvis to see IP Rules when "Selected Networks" is enabled on ACR.

### Firewall Use Example

If a customer gets errors like:
- `denied: client with IP 'x.x.x.x' is not allowed access`
- `403 Forbidden` when pulling images

This could happen if ACR has Selected Networks/Firewall enabled and the client public IP is not allowlisted. Check "IP rules" in the output.

## Recalculate registry size and update registry size entry

The 'RegistrySize' table is updated by the indexing service. If the registry experiences an issue where RegistrySize entry could not be updated, use this action to verify/update correct storage usage.

Location: Azure Container Registry > User Registry Management > Recalculate registry size and update registry size entry

**Parameters:**
- Registry Login Server URI: the login server URL
- Region: for geo-replicated registries, operation runs for specified region only
- Confirm: if false, only shows recalculated size without updating

**Limitation:** Currently only recalculates storage for acr.docker (docker container images, Helm V3 charts). acr.artifact (Helm V2 chart files) not yet supported.

**Note:** Due to possible data race, operation may fail with `Encountered conflict when updating RegistrySize table. Please retry the operation.` — safe to retry.

## Owner and Contributors

**Owner:** Hanno Terblanche <hanter@microsoft.com>
