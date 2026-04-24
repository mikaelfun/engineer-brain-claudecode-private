---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/ACI Troubleshooting with ASI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting ACI with Azure Service Insights (ASI)

## Accessing ASI
Open Azure Service Insights (https://azureserviceinsights.trafficmanager.net/) and select ACI service.

## Searching for a Resource
- Main data source is Kusto; allow 15 min for data ingestion
- Main search table: SubscriptionDeployments (120-day retention)
- Search by full Resource Id or CG name (FQDN for public CGs)

## Resource Types
### Container Group (CG)
- ARM representation of ACI resource (similar to ASC info)
- Search with full Resource Id or CG name
- Shows Container Group Deployments section

### Key Features
- Overview: Resource metadata and features
- Issue detector: Preformatted queries for known issues
- Common Kusto query output: Tabular results
- DB icon: Inspect/run Kusto queries
- Feedback icon: Submit feedback to service owners
