---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/Pages with syntax highlighting errors/Understanding and Troubleshooting AAD Sync Fabric Performance Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FPages%20with%20syntax%20highlighting%20errors%2FUnderstanding%20and%20Troubleshooting%20AAD%20Sync%20Fabric%20Performance%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

This guide covers:
- What factors commonly cause performance issues in AAD Sync Fabric
- How to identify if a runProfile is having performance issues
- How to troubleshoot and mitigate performance issues
- Considerations when configuring a runProfile to avoid/mitigate performance issues

## Primary performance factors for AAD Sync Fabric

The primary factors that can lead to performance issues for an AAD Sync Fabric runProfile are:

- Overall size of the tenant (# of objects)
- Amount of churn in the tenant (# of changes in a set period)
- Is the customer using "Sync all users/groups" or "Sync assigned users/groups"?
- Is the customer using large dynamic groups with "Sync assigned users/groups"?
- Is there a restriction on requests per second that can be made to the target system's API?

### Overall size of the tenant

Sync Fabric leverages Azure AD Graph API to query data from customer tenants and ingest it into the provisioning engine. On an initial/full sync, we request all objects that are in scope. During an incremental/delta sync, we request only objects that have changed since the last import. The larger a customer's tenant is, the more objects there are that can be returned. Every object that is returned needs to be evaluated.

### Amount of churn in the tenant

During incremental/delta sync cycles, Sync Fabric uses AAD Graph API's Differential Query (DQ) feature to return only objects that have changed. DQ does not allow for scoping by what attribute has changed, so all objects that have had **any** change in MSODS will be returned. High amounts of churn can create a backlog where changes do not get processed for hours, or in extreme cases, days.

### Sync all users/groups vs Sync assigned users/groups

**Sync all users/groups**: All objects in the tenant are brought in for processing. With scoping filters, this can be very inefficient if only a small % of objects are in scope (e.g., processing 100K objects to find 1K in scope = 1% efficiency).

**Sync assigned users/groups**: Query is filtered based on assignment to the Enterprise Application's Users and Groups blade. Only assigned objects are returned (e.g., 1K objects from an assigned group = much smaller dataset).

**Combined**: Sync assigned + scoping filter narrows further but still processes all assigned objects first.

### Large dynamic groups with Sync assigned users/groups

Dynamic groups present a problem: when a member changes, AAD Graph indicates "something changed in the group" but doesn't specify which member. This forces re-evaluation of ALL members in the group. Mitigations:
- Use "Sync all users/groups" with scoping filters instead
- Break large groups into smaller groups (<10K members each)

### API rate limiting (429 errors)

Sync Fabric normalizes group membership changes into individual web requests (e.g., 10 new members = 10 requests). Some target APIs limit inbound requests per second (e.g., Slack = 20 req/s). If Sync Fabric sends 100 req/s and the API only accepts 20, requests 21-100 get 429'd and escrowed. High 429 rates can trigger quarantine.

**Key**: Exponential backoff makes "waiting it out" a very slow strategy for high 429 rates. The correct approach is to adjust the target API's rate limit. For gallery apps, raise an IcM so PG can adjust the outbound request rate. For BYOA SCIM, the change must be made on the target system's API.

## How to identify performance issues (read/write gap)

Evaluate when a customer expects changes through Sync Fabric that are not showing after at least 3 hours.

### Kusto query for gap analysis

```kusto
// Cluster: https://idsharedwus.kusto.windows.net/AADSFprod
// Sync progress with read/write gap
GlobalIfxRunProfileStatisticsEvent
| where env_time > ago(30d)
| where runProfileIdentifier contains "<runProfileIdentifier>"
| project env_time,
    Gap = ((countUnitsIngested - countUnitsDigested)*50),
    ReadCursor = (countUnitsIngested*50),
    WriteCursor = (countUnitsDigested*50)
| summarize max(Gap), max(ReadCursor), max(WriteCursor) by env_time
| render timechart
```

### Understanding Jarvis Cursor State dashboard

**WriteCursor (Ingestion)**: Total pages of data ingested from AAD Graph into the engine

**ReadCursor (Digestion)**: Current location of the cursor — how many pages have been digested/processed

**Gap**: Difference between ingested and digested pages — how many remain to be processed

A page can contain data on tens of small objects, or partial data on one large object (e.g., a segment of a large group's member list).

**Key behaviors**:
- When a gap exists, Sync Fabric enters "Catch-up mode" and stops importing new changes until the backlog is processed
- When gap reaches 0, both cursors reset to 0 — this is called **steady state**

## How to troubleshoot and mitigate

### Mitigation (short term)

1. Check "Churn factors" section of Jarvis dashboard, sort by ImportChanges
2. If specific objects have very high change counts, determine what happened to those objects
3. If churn is evenly spread (e.g., from an unrelated migration project), a **clear state/restart** from the portal may help:
   - Throws out all pending imported changes
   - Does initial sync with single current representation of each object

**WARNING**: Clear state/restart is a BAD choice if the application provisions group objects (has user + group mapping types). Reason: A behavioral defect in Sync Fabric means group membership removals that have been ingested but not digested will be lost, orphaning members in the target system. The engine only knows the "after" state of group membership, not "before and after", so it cannot determine authority to remove members after a restart.

**If groups are involved**: "Wait it out" to ensure membership removals are processed correctly.

### Troubleshooting (root cause)

1. Review primary performance factors against customer's configuration
2. Engage TA or post on AAD Provisioning Service MS Teams channel
3. If still stuck, file IcM to engage PG

## Configuration recommendations

| Scenario | Recommended approach |
|----------|---------------------|
| Small % in scope (<30%) | Sync Assigned Users/Groups |
| Large % in scope (>30%) | Sync All Users/Groups |
| Smaller tenants | Either method works |
| Large groups (10K+ members) with Sync Assigned | Break into smaller groups (<10K members each) |
