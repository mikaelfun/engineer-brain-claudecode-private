# AAD Connect Architecture

> Source: OneNote — Mooncake POD Support Notebook / Sync / AAD Connect / Concept & Document / Architecture
> Ref: https://learn.microsoft.com/en-us/azure/active-directory/hybrid/concept-azure-ad-connect-sync-architecture

## Overview

AAD Connect syncs data between on-premises AD and Azure AD through a three-step cycle: Import → Synchronization → Export.

## Key Terminology

| Term | Description |
|------|-------------|
| **Connector** | Module used by AAD Connect to connect (read/write) to a data repository (AD, SQL Server, etc.) |
| **Connected Data Source (CD)** | Data repository being synchronized |
| **Connector Space (CS)** | Staging area storing objects from a connected data source. Separate CS per data source |
| **Metaverse (MV)** | Global storage for combined/integrated representation of objects from different connector spaces |
| **Source Anchor** | Unique attribute identifying a staging object in CS. For AD: `objectGUID` |
| **Pending Import** | Object flagged for processing during inbound sync (CS → MV) |
| **Pending Export** | Object flagged for pushing updates to connected data source |
| **Joined Object** | CS object linked to a MV object. One MV object can link to multiple CS objects (not vice versa) |
| **Disjoined Object** | CS object not linked to any MV object |

## Sync Cycle (3 Steps)

1. **Import**: Brings updates from connected data source → Connector Space. Creates/updates pending import staging objects. Uses source anchor for matching.

2. **Synchronization**:
   - *Inbound*: Processes pending import objects → updates linked MV objects
   - *Outbound*: Processes MV object changes → updates linked CS objects, creates pending export objects

3. **Export**: Pushes pending export objects' changes → connected data source

## FAQ

- **What creates a pending import object?** — Import process, when processing incoming changes from CD.
- **What creates a pending export object?** — Outbound synchronization, when comparing MV objects to their linked CS counterparts.
