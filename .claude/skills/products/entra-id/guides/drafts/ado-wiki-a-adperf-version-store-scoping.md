---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Version Store issues/Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20Version%20Store%20issues%2FScoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ADPERF: Version Store Scoping Questions

1. How many Domain Controllers (DCs) are experiencing this issue?
1. Are all these DCs in the Same Site or Different Site?
1. What is the Operating System (OS) of these DCs?
1. What is the number of processors and RAM on the DCs? (for Windows Server 2016 and older, the size of the Version Store is based upon the number of CPUs, for Windows Server 2019 and newer it is based on RAM)
1. Can we reproduce the Version Store issue on the DC by running some Tasks? (Script or a Specific Job on an Application)
1. Does the issue occur at a specific time of the Day or Week?
1. Does the customer have any Applications which is in the Known Issues Section of Version Store issues?
1. During the time of the issue are there any changes to a Security Group with a lot of Group Memberships?
1. If they have a Security Group with lot of Group Memberships are they Legacy Groups

https://blogs.technet.microsoft.com/heyscriptingguy/2014/04/22/remediate-active-directory-members-that-dont-support-lvr/

Before Troubleshooting or Log Collection Ensure that you Increase the Version Store. For the Amount of Objects, Group Membership Links etc

Its a best practice that we increase the size of the Version Store on Domain Controllers to about 850 MB.

https://blogs.technet.microsoft.com/askds/2016/06/14/the-version-store-called-and-theyre-all-out-of-buckets/

Active Directory ESE Version Store Changes in Server 2019
https://internal.evergreen.microsoft.com/en-us/topic/17ebff7a-9d30-1802-7a0a-5778f63a5036
