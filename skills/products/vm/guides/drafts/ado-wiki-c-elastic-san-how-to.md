---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Elastic SAN/How Tos/Elastic SAN How To_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/pages/SME%20Topics/Azure%20Elastic%20SAN/How%20Tos/Elastic%20SAN%20How%20To_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Elastic SAN How To

## ASC - List all Elastic SANs

In Azure Support Center (ASC), navigate to Resource Explorer to view Elastic SAN resources:
- **Elastic SAN Properties**: View SAN-level configuration
- **Volume Groups**: Search and view multiple volume groups and their properties
- **Volumes**: Search volumes at the volume group level and view properties (including App Service attached volumes)

## Elastic SAN Perf Dashboard

The [Elastic SAN Dashboard](https://portal.microsoftgeneva.com/dashboard/ElasticSan/PerfMetrics) provides:
1. **Perf Metrics**: Gateway availability, failures, TPS, Latency, Memory, CPU
2. **Background Task Metrics**: Number of tasks executed, average execution time, failed tasks, execution time per task type
3. **ElasticSan Metrics**: CPU per node, Memory per Node
4. **SRP/XFE Interactions**: StorageAccount Create time, PutBlob latency, XFE Create Container, DeleteBlob Latency

## Elastic SAN RBAC Roles

ElasticSanRP supports 4 RBAC roles:
- **Elastic SAN Owner**: Full access to all resources including changing network security policies
- **Elastic SAN Reader**: Control path read access
- **Elastic SAN Volume Group Owner**: Full access to a volume group including network security policies
- **Elastic SAN Network Admin**: Create Private Endpoints and read SAN resources

Role definitions: [AD-RBAC-RoleDefinitions](https://dev.azure.com/msazure/One/_git/AD-RBAC-RoleDefinitions?path=/MICROSOFT.ELASTICSAN/PROD)

## View RBAC Roles via Portal

1. Login to Azure portal
2. Go to Subscriptions > select subscription
3. Go to Access Control > Role assignments tab
