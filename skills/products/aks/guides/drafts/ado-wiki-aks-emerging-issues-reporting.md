---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Emerging and Known Issues/Emerging Issues Reporting and Tracking"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FEmerging%20and%20Known%20Issues%2FEmerging%20Issues%20Reporting%20and%20Tracking"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Emerging Issues (EI)

## What are emerging issues

Bugs, regressions, LSIs which are being actively identified and worked on that could impact the support volume. You can count outages as well but they are more well known, better communicated and reported.

## How to track an emerging issue?

You can track emerging issues through following sources. For detailed review, you can go to the work item embedded within them.

* [Dedicated Teams Channel](https://teams.microsoft.com/l/channel/19%3a5dbf71f1240c41699bf8d89aa9f62062%40thread.skype/Emerging%2520Issues?groupId=074e4c99-14b9-4454-98ae-9eff23b77872&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
* [Emerging Issues Wiki](/Azure-Kubernetes-Service-Wiki/Emerging-and-Known-Issues#emerging-issues)
* AKS PG updates emerging issues per SIG in real time at [AKS Emerging Issues](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/242218/Ongoing-Issues)

## How to report an Emerging Issue?

Please note that at this time, only TA/EEE are tasked to report an emerging issue.

1. Identify: TA or EEE identify the Emerging Issue in their respective areas.
2. Report: TA/EEE can report emerging issue by sending an email formulated with following details. Once reported, this email will trigger updates to Teams channel and wiki listing.

   * Email To: actemergingissue@microsoft.com
   * Email Subject line: **#emergingissue #aks** _<provide brief issue title here>_

   Insert only the following table in Email body:

   | Field | Value |
   |--|--|
   | **Issue/symptoms** |  |
   | **Error message** |  |
   | **Cause** |  |
   | **How to diagnose / Identify** |  |
   | **Mitigation** |  |
   | **Tracking IcM** (Validate and link your case to this IcM in DFM. Check with TA if case needs new IcM.) | |
   | **Reference ICMs** |  |
   | **Status** |  |

## Process lifecycle and Triggers from reporting emerging issues email

1. EEE/TA/PG will identify and report an Emerging Issue.
2. _Automated_ An Emerging Issue work item is created in ADO.
3. _Automated_ A message is posted in the Emerging Issue Teams channel.
4. _Automated_ The emerging issues list on the AKS wiki will be updated.
5. _Automated_ An email will go out to the broader team with the details.
6. Assigned AKS CSS engineer will act as an anchor and coordinate updates.

Select the Work Item Type = "Emerging Issue" and enter the item number to link it in IcM.
