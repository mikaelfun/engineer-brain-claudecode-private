---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Kusto clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Kusto%20clusters"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction
ARM logs are stored in Kusto. These logs stored diagnostic information we can use for troubleshooting.

## Kusto clusters
Since Azure has independent clouds, we have independent clusters for troubleshooting.

### Public cloud
For public cloud ARM has 3 regional clusters, details about the region to cluster mapping can be found on [[ARM Wiki] ARM Prod Logs v2 Clusters - Regional cluster mapping](https://armwiki.azurewebsites.net/data/kusto%20v2/overview_prod.html#regional-cluster-mapping).

In addition to the regional clusters, ARM offers a global cluster that acts as a proxy to the regional clusters. It does not contain data, but lets users query data across the regional clusters in a single operation. For CSS, we will mostly use the global cluster.

#### Regional clusters
##### ARMPRODEUS
https://armprodeus.eastus.kusto.windows.net/
##### ARMPRODWEU
https://armprodweu.westeurope.kusto.windows.net/
##### ARMPRODSEA
https://armprodsea.southeastasia.kusto.windows.net/

#### ARMPRODGBL (Global cluster)
https://armprodgbl.eastus.kusto.windows.net

To query on the global cluster, users must call the `Unionizer` function with the following syntax.
```csharp
Unionizer("<DatabaseName>","<TableName>")
| where <condition>
```

### Fairfax (Azure US gov cloud)
https://armff.kusto.usgovcloudapi.net

> Please do note some authentication settings are different.

### Mooncake (Azure China cloud)
https://armmc.kusto.chinacloudapi.cn

> Please do note some authentication settings are different.

## Database and table structure
| Table | Description | Database - Public cloud | Database - Fairfax | Database - Mooncake |
| - | - | - | - | - |
| HttpIncomingRequests | All API calls (REST API, Powershell, CLI, Portal, Template deployment, etc) incoming to ARM front door layer. This will show HTTP response codes (ie. HTTP 200, HTTP 429, etc) being returned to the client. This table also provides useful information about the context of where the call was made and who made the call. | Requests | ARMprod | ARMprod |
| HttpOutgoingRequests | All outgoing API calls made from ARM (in most cases to the back-end resource providers). If a failure (i.e., HTTP 429 or HTTP 500) is being returned from a resource provider then the root cause of the issue will be with that resource, such as a customer making an invalid API call or template deployment or the resource provider itself having an issue. | Requests | ARMprod | ARMprod |
| EventServiceEntries | Summary of operations and errors. This will show the high-level activities for a correlation ID and the verbatim error returned to customers for failures. This is usually the first place to start troubleshooting an ARM failure. | Requests | ARMprod | ARMprod |
| Deployments | One entry per template deployed to ARM. This will log an entry for every Microsoft.Resources/deployments resource created on ARM. It contains useful information about the deployment like the execution status, duration, number of deployed resources, deployment mode, etc. | Deployments | ARMprod | ARMprod |
| DeploymentOperations | Details about operations inside a deployment job. | Deployments | ARMprod | ARMprod |
| PreflightEvents | Details about deployment validation calls. | Deployments | ARMprod | ARMprod |
| Errors | Internal ARM errors. Useful if the failure is in the ARM layer rather than in a resource provider. Will often provide a callstack. If there is ever an entry here for a correlation ID then it is probably relevant. | Traces | ARMprod | ARMprod |
| Traces | Internal operation flow for ARM sync processing. Includes items such as RBAC and Policy evaluations. | Traces | ARMprod | ARMprod |

For the full reference of public cloud database to table mapping structure, visit [[ARM Wiki] ARM Prod Logs v2 Clusters - Databases and Tables Structure](https://armwiki.azurewebsites.net/data/kusto%20v2/overview_prod.html#databases-and-tables-structure)

## Common columns
These are columns that exists across many of the tables above, and can be used to follow the flow of a specific operation across ARM.

### CorrelationId
As the name suggests, this field is used to correlate operations, both across table and across context. It is expected that operations related to each other same the correlation id, such as API calls from the same deployment or a call that is consequence of another call.

### ActivityId
Within a correlation id, there can be one or more activities. Each one of those activities has a unique activity id, this activity id can be used to narrow down the investigation to one specific failure or operation (as other operations in the same correlation id might be successful and not related to the problem in any way).
