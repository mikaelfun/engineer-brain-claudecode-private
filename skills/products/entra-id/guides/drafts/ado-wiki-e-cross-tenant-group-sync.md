---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cross Tenant Group Synchronization"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FCross%20Tenant%20Group%20Synchronization"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cross-Tenant Group Synchronization

## Feature Overview

Cross-tenant synchronization supports synchronizing **security groups** across tenants (in addition to users).

- Creates security groups in target tenant
- Keeps memberships in sync for groups created by cross-tenant sync
- Does NOT update existing groups created outside of cross-tenant sync
- Groups in target get `originTenantId` attribute (read-only)
- Matching is based on `originTenantID/originId` property (fixed, cannot be changed)

## Supported Group Types

| Direction | Supported | Not Supported |
|-----------|-----------|---------------|
| Source | Security group (static/dynamic), M365 group | Mail-enabled security groups, shared mailbox, dynamic distribution, distribution groups |
| Target | Security group (static only) | M365 group, mail-enabled security groups, all others |

## Licensing

Requires **Entra ID Governance** or **Microsoft Entra Suite** licenses. Each user in scope must be licensed in the **source** tenant.

## Limitations

- Nested groups not supported
- Dynamic groups in source become static in target
- Sync scope must be "Sync assigned users and groups" (not "Sync all")
- Cross-cloud group sync not supported
- Cannot sync Groups only; must also sync users
- Provision on Demand limited to 5 members per group
- Scoping groups also sync as groups to target
- Cannot sync users from two source tenants into same target group

## Configuration Steps

1. **Target Tenant**: Enable both "Allow user synchronization" AND "Allow group synchronization" in inbound access settings
2. **Source Tenant**: Set "Provision Microsoft Entra ID Groups" to **enabled** in sync config Mappings
3. **Users and Groups**: All members of selected groups will also sync

## Troubleshooting

### Check Group Sync Status via ASC
1. Open source tenant in ASC > AAD Provisioning
2. Select sync config > Sync Settings tab
3. Check "Group Sync Enabled" value

### Check via Graph Explorer
Query: `/servicePrincipals/{spId}/synchronization/jobs/{jobId}/schema`
Look for `objectMappings` named "Provision Microsoft Entra ID Groups" and check `enabled` attribute.

### Kusto: Get Run Schema
```kusto
let correlationIdentifier = "";
GlobalIfxUsageEvent
| where runProfileTag == "Azure2Azure"
| where correlationId == correlationIdentifier
| where usageType == "Schema"
| project internalCorrelationId, message, env_seqNum
| extend is_pii_split = message startswith "%%pii_## SPLIT"
| parse message with "%%pii_" pii_message "%%"
| extend message = iff(is_pii_split, pii_message, message)
| parse message with "## SPLIT " split_num " #" split_index " of" * "##\\n " split_text " ###"
| extend split_num = iff(split_num == "", tostring(new_guid()),split_num)
| order by env_seqNum
| summarize make_set(split_text),take_any(internalCorrelationId) by split_num
| extend schema = strcat_array(set_split_text, "")
| project internalCorrelationId, schema
```

### ICM Escalations
- Service: **UMTE**
- Team: **Customer Escalations - Cross Tenant Sync**
- Alias: crossTenantSync@microsoft.com
- JobId must start with "Azure2Azure"
