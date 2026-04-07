---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/How Sync Fabric Works - steps per cycle"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FHow%20Sync%20Fabric%20Works%20-%20steps%20per%20cycle"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How Sync Fabric Works - Steps Per Cycle

Microsoft Entra application provisioning automatically creates user identities and roles in target applications. It also supports provisioning users into on-premises applications without opening firewalls.

## Supported Protocols and Connectors

| Protocol   | Connector                                   |
|------------|---------------------------------------------|
| SCIM       | SCIM - SaaS, Cross Tenant Sync, Cloud Sync  |
|            | SCIM - On-premises / Private network         |
| LDAP       | LDAP                                         |
| SQL        | SQL                                          |
| REST       | Web Services                                 |
| SOAP       | Web Services                                 |
| Flat-file  | PowerShell                                   |
| Custom     | Custom ECMA connectors                       |
|            | Connectors and gateways built by partners    |

## Outbound Provisioning

Azure AD is the *source* system and a third party SaaS application is the *target* system. The majority of Sync Fabric scenarios are outbound provisioning.

## Inbound HR Provisioning

A third-party HR platform (Workday, SuccessFactors) acts as the *source* and synchronizes to AD or Entra ID. Also supports API-driven inbound provisioning for other third-party applications.

## Provisioning Cycles

### Initial Cycle

1. Query all users and groups from source, retrieving all attributes defined in attribute mappings
2. Filter using configured assignments or attribute-based scoping filters
3. For each in-scope user, query target system for a match using specified matching attributes
4. If no match found → **create** user in target, cache target system ID
5. If match found → **update** user with source attributes, cache target system ID
6. Process "reference" attributes (e.g., Manager) to create and link referenced objects
7. Persist a **watermark** for incremental cycles

### Incremental Cycles

1. Query source for users/groups updated since last watermark
2. Filter using assignments or scoping filters
3. Query target for matching users
4. Create or update as needed (same as initial cycle steps 4-5)
5. Process reference attributes
6. If user removed from scope (unassigned) → **disable** in target
7. If user disabled/soft-deleted in source → **disable** in target
8. If user hard-deleted in source → **delete** in target (Entra ID hard-deletes 30 days after soft-delete)
9. Persist new watermark

### Incremental Cycle Behavior

- Runs **indefinitely** at 30-40 min intervals (back-to-back)
- Stops when:
  - Service manually stopped (portal or Graph API)
  - "Restart provisioning" triggered (clears watermark, re-evaluates all objects)
  - Service enters **quarantine** and stays >4 weeks → auto-disabled

## Key References

- [What is app provisioning in Microsoft Entra ID?](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/user-provisioning)
- [How Application Provisioning works in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works)
