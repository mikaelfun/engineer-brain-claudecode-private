---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Understanding the AAD Provisioning Engine"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FUnderstanding%20the%20AAD%20Provisioning%20Engine"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Understanding the AAD Provisioning Engine

## Sync Steps

### 1. Import
- **Initial sync**: imports all data for all users/groups in tenant
- **Delta sync**: uses Azure AD Graph API Differential Query for changed objects only
- Also imports data from target system for comparison
- Changes in target system do NOT trigger re-evaluation

### 2. Scope
- "Sync all" vs "Sync only assigned users and groups"
- Scoping filters applied after import

### 3. Normalization
- Breaks complex actions into individual requests target systems understand
- Example: "Create group with 5 members" -> 1x create group + 5x add member
- Some target systems do not support bulk operations

### 4. Transform
- **Direct Mapping**: source attribute -> target attribute
- **Constant**: fixed value for all in-scope objects
- **Expression**: script-like logic for data transformation

### 5. Reference Resolution
- Resolves referential attributes (manager, department, location)
- Validates values accepted by target system
- Translates values to target system identifiers
- Reference -> Reference (e.g., manager ObjectId)
- String -> Reference (e.g., companyName -> Department list)

### 6. Export
- HTTPS web requests to target system (SCIM, SOAP, or app-specific API)
- Failed exports are escrowed for retry

## Internal Databases (CosmosDB)

### Schema Store
- Stores custom schemas per runProfileId
- Query: `SELECT * FROM c WHERE c.ProfileId = @ProfileId`
- ItemCount: 1 = custom schema, ItemCount: 0 = default schema

### Connector Data Store (CDS)
- Links sourceAnchor <-> targetAnchor (immutable IDs)
- **New user**: export -> target returns targetAnchor -> CDS creates link
- **Update user**: CDS queried for targetAnchor -> used for update requests

### Group Membership Store (GMS)
- Memory of members added to groups in target system
- Compares current group members with GMS to determine add/remove actions

## Error Handling

### Escrow
- Failed exports saved and retried with exponential backoff
- Avoids retrying likely-to-fail actions every execution

### Quarantine
- Global sync failure triggers quarantine (reduced execution frequency)
- Thresholds: 5000 rawEscrows, 15000 referenceEscrows
- Slice C apps: quarantined at 60% error rate
- Causes: invalid schema, invalid credentials, high escrow count

### EntryLevelError
- Appears on Provisioning blade when objects are in error state
- Check audit logs for specific failed objects
