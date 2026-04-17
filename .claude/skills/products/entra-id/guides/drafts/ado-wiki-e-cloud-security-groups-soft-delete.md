---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/SSGM - Self Service Group Management/Cloud Security Groups Soft Deletion and Restoration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FSSGM%20-%20Self%20Service%20Group%20Management%2FCloud%20Security%20Groups%20Soft%20Deletion%20and%20Restoration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cloud Security Groups Soft Deletion and Restoration

Cloud security groups now support soft deletion and restoration in Entra Portal and MS Graph API. Soft-deleted groups can be restored within 30 days. After 30 days, permanently deleted.

## Prerequisites
- Roles: Global Admin, User Admin, Group Admin, Partner Tier1/2 Support, or Group Owner
- API: Group.ReadWrite.All permission (least privileged)

## Audit Log Behavior

| Object type | Activity | Result |
|:--|:--|:--|
| Cloud security group | Delete group | **Soft deleted** |
| Cloud security group | Hard delete group | **Hard deleted** |
| Microsoft 365 Group | Delete group | Soft deleted |
| All other groups | Delete "objectType" | Hard deleted |

> Note: Audit log does NOT distinguish group type. "Delete group" could be soft or hard delete depending on type.

## Properties Maintained in Soft Delete
- Cloud security groups: All properties maintained including ObjectID, group memberships, application assignments

## Restoration

### Via Entra Portal
1. Groups > Deleted groups > Select group > Restore group
2. Group returns to All groups with all configurations, members, owners

### Via Graph API
```
POST https://graph.microsoft.com/v1.0/directory/deletedItems/{id}/restore
```

### List deleted items
```
GET https://graph.microsoft.com/v1.0/directory/deletedItems/microsoft.graph.group
```

### Permanently delete
```
DELETE https://graph.microsoft.com/v1.0/directory/deletedItems/{id}
```

## Known Issue: Intune Device Migration
When a device migrates (Autopilot/Hybrid Join/WPJ), Intune copies group memberships from old to new device object. **Soft-deleted group memberships will NOT be migrated.**

## Escalating for Membership Recovery

If group was hard-deleted (before soft-delete feature), membership recovery is **best effort**.

### ASC Template
Use: **[ID][IDM][GROUPS] - Self-service Group Management**

### ICM Details
- Queue: **IAM Services/SSGM Triage**
- Incident Type: Customer Reported
- Title: "Recover membership for deleted security group"
- Include: TenantID, GroupID, deletion DateTime, CorrelationID of deletion audit event

### Restore Membership from CSV
```powershell
$import = Import-Csv -Path "C:\temp\forwardLinks.csv"
$newgroup = New-MgGroup -Description "New Group" -DisplayName "NewGroup" -MailEnabled:$false -SecurityEnabled:$true -MailNickName "NewGroup"
Foreach($member in $import) {
    New-MgGroupMember -GroupId $newgroup.Id -DirectoryObjectId $member.Target_ObjectId
}
```

## Documentation
- [List deleted items](https://learn.microsoft.com/en-us/graph/api/directory-deleteditems-list)
- [Restore deleted item](https://learn.microsoft.com/en-us/graph/api/directory-deleteditems-restore)
- [Recoverability best practices](https://learn.microsoft.com/en-us/entra/architecture/recoverability-overview)
