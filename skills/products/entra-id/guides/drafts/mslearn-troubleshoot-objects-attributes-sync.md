# End-to-End Troubleshooting: Entra Connect Objects & Attributes Sync

Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/troubleshoot-aad-connect-objects-attributes

## Overview

Methodology for troubleshooting when objects/attributes fail to sync but no errors appear in sync engine, Application event viewer, or Entra logs.

## Key Principle

Steps progress from on-premises AD → Entra ID (most common sync direction). Same principles apply for writeback (inverse).

## Prerequisites Reading

- Entra Connect: Accounts and permissions
- Troubleshoot an object that isn't syncing with Entra ID
- Troubleshoot object synchronization with Entra Connect Sync

## Anti-Patterns (DO NOT DO)

**Never disable DirSync at tenant level for troubleshooting!**
- Triggers complex backend operation converting all objects from synced → cloud-only
- Can take 72+ hours depending on tenant size
- Cannot re-enable until fully complete
- Only supported for: decommissioning sync server, converting to cloud-only, or changing SourceAnchor

## Troubleshooting Flow

1. **On-premises AD**: Verify object exists with correct attributes
2. **AD Connector Space**: Check object imported correctly
3. **Metaverse**: Verify join/projection rules applied
4. **Entra Connector Space**: Check export pending
5. **Entra ID**: Verify final object state

## Key Concepts

- **onPremisesSyncEnabled**: Controls whether tenant accepts sync from on-prem
- **Source of Authority (SoA)**: Determines which directory is authoritative
- **Connectors and Lineage**: Track data flow through sync engine
- **Shadow Properties**: ShadowUserPrincipalName, ShadowProxyAddresses synced from on-prem
