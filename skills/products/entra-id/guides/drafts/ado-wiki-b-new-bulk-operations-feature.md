---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra portal (Microsoft_AAD_IAM)/New Bulk Operations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20portal%20(Microsoft_AAD_IAM)/New%20Bulk%20Operations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# New Bulk Operations Feature (Preview)

Rolling out since September 2025. Replacing the old Bulk Operations feature.

## Key Improvements
- **Efficiency**: From 500K records/hour to 1.3M groups in 10 minutes (12x improvement)
- **Success Rate**: From <20% in legacy to 100% with new APIs
- **Infrastructure**: K8s PROD deployment, Fusion storage, MS Graph APIs
- **Resilient**: Retry logic ensures operations complete under transient failures

## Timeline
- Old Bulk Ops planned removal: end of Q2 2026
- New Bulk Ops currently in Preview
- Not all bulk experiences supported yet

## Behavioral Differences from Old Bulk Ops
- Export CSV only contains columns **selected in UX** (old version included unselected columns too)
- HAR: old calls `main.iam.ad.ext.azure.com/api/DocumentProcessorTasks`, new calls `graph.microsoft.com/admin/entra/bulkJobs`
- "Bulk operation results (Preview)" blade lacks "Created by" column by default - must add manually
- Users blade shows both old and new "Bulk operation results" menu items
- Preview link: https://aka.ms/newReactBulkUX

## Permissions
- **Guest users cannot submit bulk jobs** (by design)
- Group bulk ops require group ownership or Groups Administrator role
- Custom roles do NOT currently work with Bulk Member Imports to a group
- Users missing `UserType` property cannot use bulk ops

## Known Issues
See known-issues JSONL entries for: ADSTS50158, hidden membership groups, GDAP scenarios, guest user restrictions.

## Contact
For questions about new bulk ops: Andrew Stobart (astobart)
