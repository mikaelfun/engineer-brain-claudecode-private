---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Kusto Query Repository/Intune Global cluster queries"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FKusto%20Query%20Repository%2FIntune%20Global%20cluster%20queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

### Queries here are run against Intune Global Cluster.

- Intune Kusto clusters can be found here.
[Intune Kusto Clusters](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1345257/Kusto)

#### Get effective group of user or device


- Get effective group of a device
```kusto
EffectiveGroupMembershipV2_Snapshot_AMSUA0102 //Tenant's ASU
| where AccountId == "" //Tenant's AccountId
| where TargetId == "" //Intune Device Id
| project TIMESTAMP, TargetId, EffectiveGroupId, AccountId
| take 200
```

- Gets effective group of a user
```kusto
EffectiveGroupMembershipUserService_Snapshot_AMSUA0102 //Tenant's ASU
| where AccountId == "" //Tenant's AccountId
| where TargetId == "" //User's object id
| take 20
```

- Gets mapping between effective group and Entra Security group

```kusto
SgEgMapping_Snapshot_AMSUA0102 //Tenant's ASU
| where AccountId == ""
| parse  EffectiveGroupIds with '["' EGID '"]'
| where EGID has "" //Effective group Id
| project SecurityGroupId, EGID
| take 200
```

#### Queries to check Entra group, Effective group assignment

- Check if policy/app is assigned to the effective group

```kusto
//Action == 0 means Included //Action == 1 means Excluded
DeploymentStatus_Snapshot_AMSUA0102 //Tenant's ASU
| where AccountId == "" // Intune Account Id
| where EffectiveGroupId  == "" //Intune device's EGID
| where PayloadId == "" //PayloadId (Could be policyId, applicationId)
| project TIMESTAMP, PayloadId, EffectiveGroupId, IsDeleted, Action
| take 500
```
- Check Entra groups assigned to policy or app
```kusto
Deployment_Snapshot_AMSUA0101 //Tenant's ASU
| where PayloadId == " " //PolicyId or AppId
| summarize by GroupId, PayloadId, Intent, Action, LastModifiedTime
```

- Get Entra Group Id based that is assigned to a device based on Effective Group Id
```kusto
Deployment_Snapshot_AMSUA0101 //Tenant's ASU
| where PayloadId =="" //Policy EGID
| join kind=inner (EffectiveGroup_Snapshot_AMSUA0101| where EffectiveGroupId =="" //Device EGID
| extend groups=split(GroupsAsString,",")
| mv-expand groups
|extend GroupId=tostring(groups)) on $left.GroupId == $right.GroupId
| project EffectiveGroupId, PayloadId, GroupId, Intent, Action, TIMESTAMP
```

#### Get tenant information

```kusto
Account_Snapshot
//| where AccountId == "" //Intune AccountID
| where ContextId == "" //Context ID 
| project ScaleUnitName, AccountId, ContextId, Name
```
