# Purview Data Map API 与资产操作 — 排查工作流

**来源草稿**: `ado-wiki-a-rest-api-unified-catalog-training.md`, `ado-wiki-configure-vscode-for-rest-api.md`, `ado-wiki-delete-hierarchy-api.md`, `ado-wiki-new-experience-endpoint.md`, `ado-wiki-query-api-asset-details-batch.md`
**Kusto 引用**: 无
**场景数**: 33
**生成日期**: 2026-04-07

---

## Scenario 1: CSS Training: Purview Unified Catalog REST APIs (Oct 21, 2025)
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
Meeting Recording: [Recap: CSS Training: Purview Unified Catalog APIs Tuesday, October 21](https://teams.microsoft.com/l/meetingrecap?driveId=b%211ei1YSLbVESF3_q1llKAcYqap04xb7ZGjqa45aaFO_w5L0eK1hNEQruK1ybCejNF&driveItemId=013JNAJWBHLAMKQORIDVHYUIKIQKQZY7OG)

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 2: Overview
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
Anil Kumar (PG) provided a walkthrough of the Unified Catalog APIs. Six main API categories:

1. **Objectives**
2. **Business Domains**
3. **Critical Data Elements (CDE)**
4. **Data Products**
5. **Terms**
6. **Data Access Policies**

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 3: Authentication
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- Create a **Service Principal** in Azure Portal (obtain client ID + client secret)
- Exchange credentials for a token → use token in API calls
- Required role: **Data Governance Administrator** (for creating domains, accessing certain APIs)

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 4: API Testing Tool
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- Use **Insomnia** for local API testing (Postman is noncompliant)
- PG can share a pre-configured JSON collection for import into Insomnia

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 5: Domain Management
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- `GET /businessDomains` — list domains for tenant
- `POST /businessDomains` — create new domain (requires Data Governance Administrator)
- `PUT /businessDomains/{id}` — update domain
- `DELETE /businessDomains/{id}` — delete domain

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 6: Policy Management
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- `GET /policies` — returns up to 100 policies per call; paginate via skip tokens
- `PUT /policies` — update domain access policies (specify object IDs, assign reader/owner roles)

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 7: Data Assets, Terms, Relationships
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- GET/POST APIs for data assets (specify domain ID for proper association)
- Terms support parent-child hierarchical structure
- Query relationships between data assets and data products

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 8: Known Limitations
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
| Limit | Value |
|-------|-------|
| Max business domains per region | 200 |
| API timeout | 90 seconds (408 error if exceeded) |

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 9: Known Issues
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- **Policy updates not reflecting in UI**: `PUT /policies` returns 200 but changes not visible in portal or backend — PG investigating with FTS team.

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 10: ICM Case Handling
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- Catalog-related cases should be filed under the **catalog** category (no DQ or DH APIs involved)

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 11: Follow-up Tasks from Training
> 来源: ado-wiki-a-rest-api-unified-catalog-training.md | 适用: 未标注

### 排查步骤
- Share documented limits for domains, terms, assets (Sita)
- Confirm API log access for troubleshooting with FTS team (Anil Kumar)
- Resolve policy update not reflecting issue (Anil Kumar)
- Share Insomnia JSON configuration collection (Anil Kumar)

`[来源: ado-wiki-a-rest-api-unified-catalog-training.md]`

---

## Scenario 12: Configure VSCode for REST API and Setup Tips
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
Guide for using VSCode REST Client extension to test and troubleshoot REST connections to Purview.

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 13: Step 1: Create a Service Principal
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
1. In Azure Portal → search "Microsoft Entra ID"
2. Copy the **Tenant ID** from the Overview page
3. Go to **Manage → App registrations → New registration**
4. Name the app, select "Accounts in any organizational directory (Multitenant)", click Register
5. Copy the **Application (client) ID**
6. Go to **Certificates & secrets** → create a new client secret → copy the **Value**
7. In Purview → assign the app to the appropriate collection roles (Collection admin, Data source admin, Data curator, etc.) depending on the REST operations needed

Reference: https://learn.microsoft.com/en-us/purview/tutorial-using-rest-apis

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 14: Step 2: Download and Configure VSCode
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
1. Download VSCode
2. Install the **REST Client** extension (by Huachao Mao)
3. Create a new file with `.rest` extension

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 15: Step 3: Obtain Authentication Token
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
Write the following in the `.rest` file:

```

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 16: @name getToken
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
POST https://login.microsoftonline.com/{tenant_id}/oauth2/token
Content-Type: "application/x-www-form-urlencoded"

client_id={client_id}
&client_secret={client_secret}
&grant_type=client_credentials
&resource=https://purview.azure.net
```

Click "Send Request" above the POST line. A 200 response returns the `access_token`.

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 17: Token Variable (avoid copy-paste)
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
Add these lines at the top of the `.rest` file to cache the token:

```
@token = {{getToken.response.body.access_token}}
@authentication = Bearer {{token}}
```

Now use `{{authentication}}` in the Authorization header of subsequent requests.

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 18: Common Errors
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
- **401 Unauthorized / invalid_client**: The client secret is incorrect. Re-check the secret VALUE (not the secret ID).

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 19: Step 4: Run Purview REST Calls
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
Use the `@authentication` variable in subsequent REST calls:

```

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 20: Example: Get Entity
> 来源: ado-wiki-configure-vscode-for-rest-api.md | 适用: 未标注

### 排查步骤
GET https://{purview-account}.purview.azure.com/catalog/api/atlas/v2/entity/guid/{guid}
Authorization: {{authentication}}
```

`[来源: ado-wiki-configure-vscode-for-rest-api.md]`

---

## Scenario 21: Delete Hierarchy REST API
> 来源: ado-wiki-delete-hierarchy-api.md | 适用: 未标注

### 排查步骤
Entity Delete Hierarchy — async operation to cascade-delete an entity and all its descendants.

`[来源: ado-wiki-delete-hierarchy-api.md]`

---

## Scenario 22: Trigger Delete Hierarchy
> 来源: ado-wiki-delete-hierarchy-api.md | 适用: 未标注

### 排查步骤
- **URI**: `/api/entity/deleteHierarchy`
- **Method**: DELETE
- **Params**: `guid=<entity-guid>` (can specify multiple)
- **Response**: 202 (Accepted)

Response body contains:
- `id`: operation ID (for tracking)
- `status`: `INIT` → `Succeeded` / `Failed` / `Aborted`
- `properties.entitiesToDeleteHierarchy`: JSON array of entities being deleted (guid, qualifiedName, typeName, path)

`[来源: ado-wiki-delete-hierarchy-api.md]`

---

## Scenario 23: Check Progress
> 来源: ado-wiki-delete-hierarchy-api.md | 适用: 未标注

### 排查步骤
- **URI**: `/api/entity/deleteHierarchy/operation/{operationId}`
- **Method**: GET
- **Response**: 200 with current `status` (`INIT`, `Succeeded`, `Failed`, `Aborted`)

`[来源: ado-wiki-delete-hierarchy-api.md]`

---

## Scenario 24: Cancel Operation
> 来源: ado-wiki-delete-hierarchy-api.md | 适用: 未标注

### 排查步骤
- **URI**: `/api/entity/deleteHierarchy/operation/{operationId}/cancel`
- **Method**: POST
- **Response**: 200 with `status: Aborted`

`[来源: ado-wiki-delete-hierarchy-api.md]`

---

## Scenario 25: Overview
> 来源: ado-wiki-new-experience-endpoint.md | 适用: 未标注

### 排查步骤
The new experience Microsoft Purview uses a different endpoint for REST API. Existing (Classic) Purview accounts continue using the old API endpoint.

`[来源: ado-wiki-new-experience-endpoint.md]`

---

## Scenario 26: Endpoint Reference
> 来源: ado-wiki-new-experience-endpoint.md | 适用: 未标注

### 排查步骤
| Experience | Endpoint Format |
|-----------|----------------|
| Classic | `https://{your_purview_account_name}.purview.azure.com` |
| Enterprise (New Portal) | `https://api.purview-service.microsoft.com` |

`[来源: ado-wiki-new-experience-endpoint.md]`

---

## Scenario 27: Notes
> 来源: ado-wiki-new-experience-endpoint.md | 适用: 未标注

### 排查步骤
- Most REST API docs still reference the original (Classic) endpoints
- Some docs have been updated with the new endpoint but the new experience is not yet available to everyone
- Example: [Create Assets REST API tutorial](https://learn.microsoft.com/en-us/purview/create-entities) uses the new endpoint

`[来源: ado-wiki-new-experience-endpoint.md]`

---

## Scenario 28: Reference
> 来源: ado-wiki-new-experience-endpoint.md | 适用: 未标注

### 排查步骤
- [Create assets using REST API](https://learn.microsoft.com/en-us/purview/create-entities?tabs=classic-portal)

`[来源: ado-wiki-new-experience-endpoint.md]`

---

## Scenario 29: Background
> 来源: ado-wiki-query-api-asset-details-batch.md | 适用: 未标注

### 排查步骤
Query API returns brief asset info but not full details (attributes, schema, etc.). Need secondary calls to fetch asset details by GUIDs.

`[来源: ado-wiki-query-api-asset-details-batch.md]`

---

## Scenario 30: Limitations
> 来源: ado-wiki-query-api-asset-details-batch.md | 适用: 未标注

### 排查步骤
- Maximum offset is 100,000 assets (not practical for large datasets)
- Asset changes during pagination may cause missing/duplicate results
- Use proper filters/keywords to limit result count

`[来源: ado-wiki-query-api-asset-details-batch.md]`

---

## Scenario 31: Detail Steps
> 来源: ado-wiki-query-api-asset-details-batch.md | 适用: 未标注

### 排查步骤
1. Prepare REST API environment
2. Send Query API with filters:
   ```json
   POST https://{endpoint}/catalog/api/search/query?api-version={apiVersion}
   {
     "keywords": "<keywords>",
     "filter": {"and": [{"collectionId": "testCollection"}, {"entityType": "azure_blob_path"}]},
     "offset": 0,
     "limit": 20,
     "orderby": ["id"]
   }
   ```
3. Extract GUIDs from response `value[].id`
4. Call **List by GUIDs API** with the GUIDs to get full details
5. Increment offset by limit, repeat steps 2-4 until `offset + limit > @search.count`

`[来源: ado-wiki-query-api-asset-details-batch.md]`

---

## Scenario 32: Batch Update Pattern
> 来源: ado-wiki-query-api-asset-details-batch.md | 适用: 未标注

### 排查步骤
- Always query with offset=0
- Use `"not": {"term": "TargetTerm"}` filter to exclude already-updated assets
- Query → Update → repeat until results = 0

`[来源: ado-wiki-query-api-asset-details-batch.md]`

---

## Scenario 33: Batch Delete Pattern
> 来源: ado-wiki-query-api-asset-details-batch.md | 适用: 未标注

### 排查步骤
- Always query with offset=0 (deleted assets won't appear in next query)
- Query → Delete by GUIDs API → repeat until results = 0
- **Important**: Delete by GUIDs API requires header `Content-Type: application/json`

`[来源: ado-wiki-query-api-asset-details-batch.md]`

---
