---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/Learn: AipSerivce/Learn: Document Tracking"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FLearn%3A%20AipSerivce%2FLearn%3A%20Document%20Tracking"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
# Introduction
Manage the Document Track and Revoke (TnR) feature with the AipService PowerShell module.

# Commands
## Manage 
 - Turn the TnR feature on: [Enable-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/enable-aipservicedocumenttrackingfeature?view=azureipps) 
 - Turn the TnR feature off: [Disable-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/disable-aipservicedocumenttrackingfeature?view=azureipps)
 - Check the status of the TnR feature: [Get-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumenttrackingfeature?view=azureipps)
 - Prevent document tracking for members of a group: [Set-AipServiceDoNotTrackUserGroup](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedonottrackusergroup?view=azureipps)
 - Get do not track group configuration: [Get-AipServiceDoNotTrackUserGroup](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedonottrackusergroup?view=azureipps)

## Tracking Information
The following commands display information about tracked content.
 - Get protection information about tracked documents: [Get-AipServiceDocumentLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumentlog?view=azureipps)
 - Get tracking information for documents: [Get-AipServiceTrackingLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicetrackinglog?view=azureipps)

## Revocation
 - Revoke a tracked doucument: [Set-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedocumentrevoked?view=azureipps)
 - Un-revoke a revoked document: [Clear-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/clear-aipservicedocumentrevoked?view=azureipps)


