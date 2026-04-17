# AAD Connect Sync Engine Architecture Concepts

## Core Components

### Connectors
- A **Connector** is a module AAD Connect uses to connect (read/write) to a data repository
- Different connectors exist for different data sources: AD, SQL Server, Azure AD, etc.

### Connected Data Source (CD)
- The data repository being synchronized by AAD Connect
- Each connector connects to one CD (e.g. an AD forest, or Azure AD tenant)

## Namespace / Storage Areas

### Connector Space (CS)
- Storage area for **staging objects** from a connected data source
- A separate CS exists for each connected data source
- Objects here are representations of what exists in the CD
- Search results in Synchronization Service Manager under "Connectors" tab

### Metaverse (MV)
- Storage area for **synchronized objects** - the combined/integrated/global representation
- Objects from different connector spaces are joined here
- Search via "Metaverse Search" in Synchronization Service Manager

## Key Concepts

| Term | Definition |
|------|-----------|
| **Source Anchor** | Unique attribute assigned to each staging object in CS. Uniquely identifies the object in the CD (e.g. objectGUID for AD) |
| **Pending Import Object** | Staging object flagged as having updates (add/update/delete) to process during inbound sync (CS -> MV) |
| **Pending Export Object** | Object flagged as having updates to push to CD during export. Created by outbound sync (MV -> CS) |
| **Joined Object** | Staging object in CS linked to a MV object. One MV object can link to multiple CS objects (not vice versa) |
| **Disjoined Object** | Staging object in CS not linked to any MV object |

## Sync Flow
```
Connected Data Source -> [Import] -> Connector Space -> [Inbound Sync] -> Metaverse -> [Outbound Sync] -> Connector Space -> [Export] -> Connected Data Source
```

## Source
- OneNote: AAD Connect Concept / Document
- Ref ID: entra-id-onenote-320
