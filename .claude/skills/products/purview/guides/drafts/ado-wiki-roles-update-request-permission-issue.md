---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Policy/Policy - Customer Issues/Roles update request and permission issue"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FPolicy%2FPolicy%20-%20Customer%20Issues%2FRoles%20update%20request%20and%20permission%20issue"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Issue
- Incident ticket logged by customer: "401 Error from policystore API in collection/role permissions"
- Incident ticket logged by monitor: "TIP test PolicyStoreTest in <REGION> is failing for multiple times"
- A new request arises for creating/updating Metadata roles / Data roles in the global DB across different regions.
- An IcM ticket should be created to track these requests within the team.

## Triaging steps / Root cause
1. Click on "DGrep: Tip results" to see logs in Jarvis portal.
2. Get the correlation ID or account ID from the logs.
3. Use the Correlation ID and search:
   ```kql
   ProjectBabylonLogEvent
   | where CorrelationId == "<correlation id>"
   ```
4. Search across namespaces: BabylonProd, GatewayProd, PolicyStoreProd
5. Observe logs like:
   - `Account|Scope policy-tips-ae Requested:[Microsoft.Purview/accounts/policy/write] Missing:[Microsoft.Purview/accounts/policy/write]`
   - `Account|Caller <ObjectId> not authorized`
   - Response: `{"error":{"code":"Unauthorized","message":"Not authorized to access account"}}`

## Resolution
1. There are two types of roles in Purview: **Metadata Roles** and **Data Roles**.
   - Whenever a request arises, a PR must be created with the required changes in the Policy Store repo.
2. Roles update is required across 4 environments: Dev, DF, Canary, Prod.
3. Visit **Geneva Actions** → Project Babylon → Babylon Generic Json Resource Operations → **Create or Update Generic JSON Resource**
   - Environment: **Test** for Dev/DF; **Public** for Canary/Prod
4. Fill all fields based on the requirement and click Run.
5. To check actual structure of roles in global DB, use **Get Generic JSON Resource** action specifying the resource name (e.g., collection-administrator, data-curator in PurviewMetadataRole; read, write in PurviewDataRole).

### Notes
- New roles are typically added behind feature flags. Update the `$exposure-control` role entity first (stores mapping of roles and feature flags), then create the actual role.
- Update order: Dev/DF → Canary → Prod. Validate no issues in DF/Canary before updating Prod.
- If in doubt, assign IcM to @pragarwal or @desinghal for resolution.
