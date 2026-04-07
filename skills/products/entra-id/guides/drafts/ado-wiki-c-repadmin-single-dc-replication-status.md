---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Verify | Determine Replication Health and Status/Determine Replication Status of a Single Domain Controller"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20%20Verify%20%7C%20Determine%20Replication%20Health%20and%20Status/Determine%20Replication%20Status%20of%20a%20Single%20Domain%20Controller"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423393&Instance=423393&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423393&Instance=423393&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed guide on how to determine the replication status of a single domain controller using the `repadmin` command. It includes an example command and the output, explaining the replication status for various partitions and inbound replication partners.

### Determining replication status of a single domain controller

The easiest way to determine the replication status of a single domain controller is to use the `repadmin` command.

The command `repadmin /showrepl` will show the replication status of the domain controller you are currently logged into.

**Example:**

````
C:\>repadmin /showrepl
````

This command will show the inbound replication status for, in this case, DC1. It lists the status for every partition. In this case, we are replicating six different partitions:

- DC=child,DC=contoso,DC=com
- DC=DomainDnsZones,DC=contoso,DC=com
- DC=ForestDnsZones,DC=contoso,DC=com
- CN=Schema,CN=Configuration,DC=contoso,DC=com
- CN=Configuration,DC=contoso,DC=com
- DC=contoso,DC=com

The domain controller (DC) has three inbound replication partners:
- DC1
- DC1-CHILD
- DC2-CHILD

In this case, we are actually only succeeding to replicate from DC2:
- DC1-CHILD is failing with error 1908.
- DC2-CHILD is failing with error 1722.

Here is the output of the actual command:

````
Repadmin: running command /showrepl against full DC localhost
Atlanta\DC1
DSA Options: IS_GC
Site Options: (none)
DSA object GUID: d0e4112d-0dfe-445f-b46c-652c6c4666c0
DSA invocationID: 089c1883-32b2-4460-af7b-328c15e92d6f

==== INBOUND NEIGHBORS ======================================

DC=contoso,DC=com
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:47:01 was successful.

CN=Configuration,DC=contoso,DC=com
    Atlanta\DC1-CHILD via RPC
        DSA object GUID: b5b4abf7-49f8-4776-bbf6-aa7edf06ff5c
        Last attempt @ 2020-06-08 13:35:57 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        247 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:35:57 was successful.
    Dallas\DC2-CHILD via RPC
        DSA object GUID: 258e18e7-8d86-4b4c-82d8-35c963884a03
        Last attempt @ 2020-06-08 13:35:57 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        487 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.

CN=Schema,CN=Configuration,DC=contoso,DC=com
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:35:57 was successful.
    Atlanta\DC1-CHILD via RPC
        DSA object GUID: b5b4abf7-49f8-4776-bbf6-aa7edf06ff5c
        Last attempt @ 2020-06-08 13:35:57 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        240 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.
    Dallas\DC2-CHILD via RPC
        DSA object GUID: 258e18e7-8d86-4b4c-82d8-35c963884a03
        Last attempt @ 2020-06-08 13:35:57 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        240 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.

DC=ForestDnsZones,DC=contoso,DC=com
    Dallas\DC2-CHILD via RPC
        DSA object GUID: 258e18e7-8d86-4b4c-82d8-35c963884a03
        Last attempt @ 2020-06-08 13:35:57 failed, result 1256 (0x4e8):
            The remote system is not available. For information about network troubleshooting, see Windows Help.
        241 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:35:57 was successful.
    Atlanta\DC1-CHILD via RPC
        DSA object GUID: b5b4abf7-49f8-4776-bbf6-aa7edf06ff5c
        Last attempt @ 2020-06-08 13:35:58 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        241 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.

DC=DomainDnsZones,DC=contoso,DC=com
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:35:58 was successful.

DC=child,DC=contoso,DC=com
    Dallas\DC2-CHILD via RPC
        DSA object GUID: 258e18e7-8d86-4b4c-82d8-35c963884a03
        Last attempt @ 2020-06-08 13:35:57 failed, result 1256 (0x4e8):
            The remote system is not available. For information about network troubleshooting, see Windows Help.
        248 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.
    Atlanta\DC2 via RPC
        DSA object GUID: 9a082782-b8c5-4c8a-948d-0c6ebe737785
        Last attempt @ 2020-06-08 13:35:58 was successful.

    Atlanta\DC1-CHILD via RPC
        DSA object GUID: b5b4abf7-49f8-4776-bbf6-aa7edf06ff5c
        Last attempt @ 2020-06-08 13:35:58 failed, result 1908 (0x774):
            Could not find the domain controller for this domain.
        306 consecutive failure(s).
        Last success @ 2020-06-06 01:50:57.

Source: Dallas\DC2-CHILD
******* 487 CONSECUTIVE FAILURES since 2020-06-06 01:50:57
Last error: 1256 (0x4e8):
            The remote system is not available. For information about network troubleshooting, see Windows Help.

Source: Atlanta\DC1-CHILD
******* 293 CONSECUTIVE FAILURES since 2020-06-05 12:41:04
Last error: 1722 (0x6ba):
            The RPC server is unavailable.
````

We can use repadmin to check the status of a remote domain controller. We would run repadmin /showrepl dcname

Example: **repadmin /showrepl dc2**