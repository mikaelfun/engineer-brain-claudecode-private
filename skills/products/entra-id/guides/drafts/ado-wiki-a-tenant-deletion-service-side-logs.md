---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Tenant Deletion - Service Side Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Deletion - Service Side Logs

## Jarvis/Geneva Logs
Filter ContextID = Tenant ID, find 'Tenant deletion validation failed with restriction'.
Note CorrelationID for detailed log query.

## Kusto: Find Deletion Attempt
Cluster: idsharedwus / ADIbizaUXWUS
Filter: requestUri has '/api/Directories/DeletionRestrictions'

## Kusto: Find Blockers (MSODS)
Cluster: msodsuseast / MSODS
Key tagIds: 0bik, 0bpy, 0xv0, 038o, 9lp3, 9lp2, 0imu, 0r32

## Common Blockers
- Service Principals: provide name+objectId to customer
- Subscriptions: cancel Azure/M365 subs via portal
