---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/ASI/Troubleshooting using ASI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FASI%2FTroubleshooting%20using%20ASI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting using ASI

This page is to bring awareness of an aggregate of resources about ACR within Azure Service Insights (ASI). Check out the [page for ACR within ASI](https://asi.azure.ms/services/Azure%20Container%20Registry/pages/ACR%20Home) and familiarize yourself with the existing troubleshooting resources.

## Getting Started

1. Navigate to the ACR page within ASI
2. Click on "Search for a Registry"
3. Set the time range for analysis
4. Enter the container registry identifier:
   - URI (ie: /subscriptions/<subscription-id>/resourceGroups/rg-name/providers/Microsoft.ContainerRegistry/registries/crname)
   - Login server (example: crname.azurecr.io)
   - Partial registry name (example: crname)
5. Click the Play icon or hit Enter on the Search box to execute the query

## Key Features

- Graphic representation of registry data
- Quick query capabilities
- Hub of resources in a single interface
- Various queries available in the results table (e.g., Private endpoints data)
- Links to documentation and prefilled Jarvis actions

## Important Notes

- ASI imposes a limit of 5000 rows on Kusto results
- Set a good timestamp to avoid missing entries due to an ample analysis period generating more than 5000 rows
- Data availability depends on enabled features and available data

## Owner and Contributors

**Owner:** Walter Lopez <walter.lopez@microsoft.com>
