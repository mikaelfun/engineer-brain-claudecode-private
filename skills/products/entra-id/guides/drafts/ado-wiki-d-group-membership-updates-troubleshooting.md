---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Troubleshooting Identity Provisioning issues/Group Membership Updates - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FTroubleshooting%20Identity%20Provisioning%20issues%2FGroup%20Membership%20Updates%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

Troubleshooting group membership updates with the Sync Fabric engine requires understanding how membership is represented in both Azure AD and target directories.

Membership representation varies by system:
- **AD**: Member's DistinguishedName added to group's `member` attribute
- **Entra ID**: Member's ObjectId added to group's `member` attribute
- **Most target directories**: Member's targetAnchor value from Sync Fabric added to group attribute
- **ServiceNow**: Separate object type `sys_user_grmember` linking group and member `sys_id` values

## Locating and evaluating logs for group membership changes

### Step 1: Find object identifiers

Query to locate group or user object attributes:

```kusto
GlobalIfxAuditEvent
| where runProfileIdentifier == "RunProfileId"
| where env_time > ago(7d)
| where reportableIdentifier contains "XYZ" // group or user name/UPN/mail
| project env_time, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```

Run twice - once for group, once for member user.

### Step 2: Query membership activity

```kusto
let GroupRepID = "Group Name";
let GroupSA = "Group ObjectID";
let GroupTA = "Group targetAnchor";
let UserSA = "User ObjectID";
let UserTA = "User targetAnchor";
GlobalIfxAuditEvent
| where runProfileIdentifier == "RunProfileId"
| where env_time > ago(7d)
| where reportableIdentifier == GroupRepID or sourceAnchor == GroupSA or targetAnchor == GroupTA
| where ['details'] contains UserSA or ['details'] contains UserTA
| project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```

### Understanding the log flow

1. **EntryImportAdd** - Group imported from Entra ID
2. **EntryImportObjectNotFound** - No matching group in target
3. **EntrySynchronizationAdd** - Engine decides to create group in target
4. **EntryExportAdd** - Group created in target
5. **EntryImportUpdate** (repeated per member) - Each member imported individually via normalization
6. **EntryImport** - Current state of target group retrieved
7. **EntryExportUpdate** (repeated per member) - Members added to target group

Key: Imports use sourceAnchor (Entra ID ObjectId), exports use targetAnchor (target system primary key).

## Common Group Membership Issues

### Unable to resolve reference
A user can only be added to a group if it is successfully being provisioned via Entra ID Provisioning. Users out of scope or failing to provision due to sync/export errors cannot have their sourceAnchor resolved to targetAnchor.

### Orphaning of group memberships after clear state
When clear state/restart is performed while:
- A read/write gap (backlog) exists
- Group membership removals have been ingested but not yet digested
- The user was managed by the Sync Fabric engine

The engine loses confidence in its authority and takes conservative action (does nothing), leading to orphaned members in target.

**Only impacts**: Apps where group objects are provisioned source-to-target. Does NOT impact "Sync assigned users and groups" mode.

**Resolution**: Manual cleanup in target system. Check for read/write gap before performing clear state. Product group has fix on roadmap (no public ETA).
