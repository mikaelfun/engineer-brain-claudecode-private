---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/SDK and API/Delete Hierarchy Operation"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FDelete%20Hierarchy%20Operation"
importDate: "2026-04-05"
type: api-reference
---

# Delete Hierarchy REST API

Entity Delete Hierarchy — async operation to cascade-delete an entity and all its descendants.

## Trigger Delete Hierarchy

- **URI**: `/api/entity/deleteHierarchy`
- **Method**: DELETE
- **Params**: `guid=<entity-guid>` (can specify multiple)
- **Response**: 202 (Accepted)

Response body contains:
- `id`: operation ID (for tracking)
- `status`: `INIT` → `Succeeded` / `Failed` / `Aborted`
- `properties.entitiesToDeleteHierarchy`: JSON array of entities being deleted (guid, qualifiedName, typeName, path)

## Check Progress

- **URI**: `/api/entity/deleteHierarchy/operation/{operationId}`
- **Method**: GET
- **Response**: 200 with current `status` (`INIT`, `Succeeded`, `Failed`, `Aborted`)

## Cancel Operation

- **URI**: `/api/entity/deleteHierarchy/operation/{operationId}/cancel`
- **Method**: POST
- **Response**: 200 with `status: Aborted`
