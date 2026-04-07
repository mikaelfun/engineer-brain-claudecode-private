# AAD Connect Sync Architecture Concepts

> Source: OneNote — Mooncake POD Support Notebook / AAD Connect / Concept & Document
> Status: draft

## Core Components

### Connectors & Connected Data Sources
- **Connector**: Module that AAD Connect uses to read/write to a data repository. Different connectors exist for AD, SQL Server, Azure AD, etc.
- **Connected Data Source (CD)**: The data repository being synchronized (e.g., on-prem AD, Azure AD).

### Namespace: Connector Space & Metaverse
- **Connector Space (CS)**: Staging area for objects from a connected data source. A separate CS exists for each connected data source. Search results from CS show objects from the specific connected source (e.g., Windows ADDS).
- **Metaverse (MV)**: Central storage for synchronized objects — combined, integrated, global representation of objects from different connector spaces.

### Key Object Concepts
- **Source Anchor**: Unique attribute assigned to each staging object in CS. For AD, this is typically `objectGUID`.
- **Pending Import Object**: Staging object flagged for processing during inbound synchronization (CS → MV). Indicates updates (add/update/delete) detected.
- **Pending Export Object**: Object flagged with updates to push to connected data source during export. Outbound sync (MV → CS) creates or flags these.
- **Joined Object**: CS staging object linked to a MV object. One MV object can link to multiple CS objects, but not vice versa.
- **Disjoined Object**: CS staging object not linked to any MV object.

## Data Flow Summary

```
On-Prem AD ←→ [AD Connector Space] ←→ [Metaverse] ←→ [AAD Connector Space] ←→ Azure AD
                   Import/Export            Sync Rules           Import/Export
```

## References
- [Azure AD Connect sync: Understanding the architecture](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/concept-azure-ad-connect-sync-architecture)
