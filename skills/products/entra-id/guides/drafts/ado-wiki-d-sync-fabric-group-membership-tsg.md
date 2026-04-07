---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/Pages with syntax highlighting errors/Troubleshooting AAD Sync Fabric Group Membership Updates"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FPages%20with%20syntax%20highlighting%20errors%2FTroubleshooting%20AAD%20Sync%20Fabric%20Group%20Membership%20Updates"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

Troubleshooting group membership updates with the AAD Sync Fabric engine requires an understanding of how membership is represented in both Entra ID and most other SaaS apps/target directories.

The same membership to a group can be represented in multiple different ways. For example:

**In AD**: A member of a group is represented by having the member's **DistinguishedName** added as a value to the **member** attribute of a group object

**In AAD**: A member of a group is represented by having the member's **ObjectId** added as a value to the **member** attribute of a group object

**In most target directories:** A member of a group is represented by having the member's **targetAnchor** value from the AAD Sync Fabric engine added to an attribute on the group object

**In ServiceNow**: Group memberships are represented with their own object type, **sys\_user\_grmember**, which denotes both the **sys\_id** values of both the group object and the member object

Knowing the above, it then makes sense that to track group membership updates, we need to look at logs for the group object, not the user object. This can be complicated, as the different systems refer to objects in different ways.

## Locating and evaluating logs for group membership changes

Properly locating all of the logs requires multiple steps. First we need to determine:

  - The group's reportableIdentifier, sourceAnchor and targetAnchor
  - The user's sourceAnchor and targetAnchor

To do this, a simple query to find any recent activity logs for each object can be run:

### Basic Object Location Query

```kusto
GlobalIfxAuditEvent
| where runProfileIdentifier == "<runProfileIdentifier>"
| where env_time > ago(7d)
| where reportableIdentifier contains "<group or user displayname/UPN/mail>"
| project env_time, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```

From the results of the above query, identify either the user or group object's required attributes. You'll need to run this query twice, once for the group, once for the member user.

### Group Membership Activity Logs

```kusto
let GroupRepID = "Group Name";
let GroupSA = "Group ObjectID";
let GroupTA = "Group targetAnchor";
let UserSA = "User ObjectID";
let UserTA = "User targetAnchor";
GlobalIfxAuditEvent
| where runProfileIdentifier == "<runProfileIdentifier>"
| where env_time > ago(7d)
| where reportableIdentifier == GroupRepID or sourceAnchor == GroupSA or targetAnchor == GroupTA
| where ['details'] contains UserSA or ['details'] contains UserTA
| project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```

### Understanding the log flow

For a new group being provisioned to a target system (e.g., Box):

| EventName | Description |
|-----------|-------------|
| EntryImportAdd | Received Group change of type (Add) from Azure Active Directory |
| EntryImportObjectNotFound | No matching Group found in target system |
| EntrySynchronizationAdd | Group will be created in target (active and assigned in AAD, but no match found) |
| EntryExportAdd | Group was created in target system |

Following group creation, member imports appear as:

| EventName | Description |
|-----------|-------------|
| EntryImportUpdate | Received Group change of type (Update) from AAD — one per member |

Each member is processed individually using **normalization**, so issues handling one member will not negatively impact other members.

After importing from AAD, the engine queries the target system to confirm current membership state:

| EventName | Description |
|-----------|-------------|
| EntryImport | Retrieved group from target system |

Then outbound requests ensure members are added to the target group:

| EventName | Description |
|-----------|-------------|
| EntryExportUpdate | Group was updated in target — ADD user by targetAnchor |

**Key insight**: Imports identify members via their **sourceAnchor** (AAD ObjectID), but exports use the **targetAnchor** (Primary Key) of the target system.

## Common Group Membership Issues

### Unable to resolve reference

A user can only be added to a group if it is successfully being provisioned from source -> target via AAD Provisioning. The ability to resolve the sourceAnchor into the targetAnchor requires the user to be provisioned through AAD Provisioning so that the links in the Connector Data Store can be referenced. Users that are out of scope or failing to provision due to synchronization or export errors may fail to be added to groups.

### Orphaning of group memberships in target after clear state

Upon clearing state and restarting synchronization, imported changes to a group that would lead to removal of members can be lost and will never be re-evaluated. This leads to members being orphaned in the target system group unless manual cleanup is performed.

**Conditions for this issue:**
- A backlog (read/write gap) exists and group membership removals have already been imported
- The user was added by or observed by the AAD Sync Fabric engine as a member of the group
- Clear state/restart (Graph restart) is performed when the change has been ingested but not yet digested

**Root cause**: The engine handles group memberships conservatively — if it is not confident that it has authority over a given group member, it takes no action. Clearing state when the membership change has been ingested but not digested causes the engine to lose confidence in its authority.

**Important**: This issue only impacts applications where group objects are being provisioned from source -> target. It does NOT impact assignment of users via "Users and Groups" in combination with "Sync assigned users and groups".

**Notes:**
- Groups in the target system can have members added manually
- AAD Sync Fabric cannot manage members it has not added or observed as members in both source and target systems
- This issue is on the PG roadmap to be corrected (no public ETA)
