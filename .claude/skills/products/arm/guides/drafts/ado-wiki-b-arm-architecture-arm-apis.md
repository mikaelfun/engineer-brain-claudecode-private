---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM APIs"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20APIs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## GET
### /subscriptions/{subscriptionId}/providers/{resourceNamespace}/{resourceType}
This API returns the full body for resources of a specific resource type on a subscription scope.

:::mermaid
sequenceDiagram
  autonumber
  actor User
  participant A as ARM (incoming request region)
  participant B as ARM (other regions)
  participant C as Resource Provider
  User->>A: GET /subscriptions/{subscriptionId}/providers/{resourceNamespace}/{resourceType}
  A->>A: Check RG locations
  A->>B: Read ARM cache for resources that match the resource type from RG locations
  B-->>A: Resources data
  A->>A: Determine resource locations
  alt Resource locations > 0
    A->>C: GET /subscriptions/{subscriptionId}/providers/{resourceNamespace}/{resourceType} (on each resource region)
    C-->>A: Resources payload
    A->>A: Aggregate data from RP locations
    opt Result > Page size
      alt Resource locations > 1
        A->>A: Create aggregated token as continuation token
      else Resource locations == 1
        A->>A: Use RP continuation token
      end
      A->>A: Truncate data to first page and append continuation token
    end
    A-->>User: Return array with aggregated data (and continuation token if available)
  else Resource locations == 0
    A-->>User: Return empty array
  end
:::

### /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceNamespace}/{resourceType}
This API returns the full body for resources of a specific resource type on a resource group scope.

:::mermaid
sequenceDiagram
  autonumber
  actor User
  participant A as ARM (incoming request region)
  participant B as ARM (RG location)
  participant C as Resource Provider
  User->>A: GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceNamespace}/{resourceType}
  A->>B: Read ARM cache for resources that match the resource type from RG location
  B-->>A: Resources data
  A->>A: Determine resource locations
  alt Resource locations > 0
    A->>C: GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceNamespace}/{resourceType} (on each resource region)
    C-->>A: Resources payload
    A->>A: Aggregate data from RP locations
    opt Result > Page size
      alt Resource locations > 1
        A->>A: Create aggregated token as continuation token
      else Resource locations == 1
        A->>A: Use RP continuation token
      end
      A->>A: Truncate data to first page and append continuation token
    end
    A-->>User: Return array with aggregated data (and continuation token if available)
  else Resource locations == 0
    A-->>User: Return empty array
  end
:::

## DELETE
### /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}
:::mermaid
sequenceDiagram
  autonumber
  actor User
  participant A as ARM web role (incoming request region)
  participant B as ARM RG deletion job 
  participant C as ARM storage (RG location)
  participant D as ARM Resource Deletion Sequencer job
  participant E as ARM Resource Deletion jobs
  participant F as Resource Provider
  User->>A: DELETE {resourceGroupId}
  A->>B: Create RG deletion job
  activate B
  B->>C: Read ARM cache for resources in the resource group
  C-->>B: Resources data
  B->>F: Send linked notifications for RPs
  B->>D: Create resource deletion sequencer job
  activate D
  D->>E: Create resource deletion jobs (One per resource)
  E->>A: DELETE {resourceId}
  A->>F: DELETE {resourceId}
  F-->>A: Operation result
  A-->>E: Operation result
  E->>E: Write to ResourceDeletions table
  E-->>D: Job result
  D-->>B: Job result
  opt All resources deleted
    B->>B: Delete RG
  end
  B->>B: Write to ResourceGroupDeletions table
  B-->>User: Operation result
:::
