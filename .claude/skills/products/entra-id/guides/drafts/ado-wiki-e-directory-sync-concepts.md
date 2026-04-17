---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Directory Sync/Directory Synchronization Concepts"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/M365%20Identity/Directory%20Sync/Directory%20Synchronization%20Concepts"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Directory Synchronization Concepts

## Terminology

### The Connector Space

The connector space is a storage area where object additions, deletions, and modifications are written before they are synchronized with the metaverse or the connected data source. A part of the connector space is dedicated to each management agent.

The connector space does not contain the connected data source object itself, but a shadow copy containing a subset of attributes as defined in the management agent.

Three kinds of objects in connector space:

#### Connector Objects
- **Connector**: Object linked to a metaverse object. All management agent rules apply.
- **Explicit Connector**: Object linked to metaverse, cannot be disconnected by connector filter. Created manually with Joiner, only disconnected by provisioning or Joiner.

#### Disconnector Objects
- **Disconnector**: Object not currently linked to a metaverse object.
- **Explicit Disconnector**: Object not linked to metaverse, can only be joined using Joiner.
- **Filtered Disconnector**: Object prevented from being joined/projected based on connector filter rules. See: [Using Joiner](https://technet.microsoft.com/library/jj590255(v=ws.10).aspx)

#### Placeholder Objects
Placeholder objects represent a single level of the hierarchy of the connected data source. Example: for CN=MikeDan,OU=Users,DC=Microsoft,DC=Com, placeholder objects are created for DC=Com and DC=Microsoft,DC=Com. Placeholder objects do not contain attribute values and cannot be linked to the metaverse.

### The Metaverse

The metaverse is a set of tables in the SQL Server database containing combined identity information. Default object types: computer, domain, group, locality, organization, organizationalUnit, person, printer, role.

Management agents update the metaverse from connected data sources, and in turn update connected data sources from metaverse data.

On Sync: either ALL objects (Full) or only changed (Delta).
Search for matching object in metaverse (based on Join criteria) and join.
If no Join, project one object in metaverse, then join connector space to metaverse object, then run attribute flow with join rules.

## Information Flow

Example: New user created on-premises in synced OU:
1. Import function for Local AD Connector identifies new user, adds to connector space
2. Local Sync job creates user in Metaverse
3. AAD Sync job projects user into AAD connector space
4. Export job creates user in MSODS (Microsoft Online Directory Service)
