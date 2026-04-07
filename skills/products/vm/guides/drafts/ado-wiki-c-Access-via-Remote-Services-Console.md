---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access via Remote Services Console_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20via%20Remote%20Services%20Console_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

If an Azure VM has connectivity within the same VNET, you can attempt to view what are the services that are setup (running/disabled/stopped) from a services.msc instance and make changes if needed.

## Prerequisite

  - TCP ports 135 or 445

## Instructions

1.  Open an instance of **Services.msc** in a machine with private network access to the problem VM.
2.  Right Click on Services (Local)
3.  Select Connect to another computer<br>
    ![49602205-bc6a-b28b-5b92-983510e30f97Services1.png](/.attachments/SME-Topics/Cant-RDP-SSH/49602205-bc6a-b28b-5b92-983510e30f97Services1.png)
4.  Enter the **DIP** of the problem VM<br>
    ![310f7ba6-cfa5-016d-1b07-e208bb472047Services2.png](/.attachments/SME-Topics/Cant-RDP-SSH/310f7ba6-cfa5-016d-1b07-e208bb472047Services2.png)
5.  Survey and make any necessary changes to services


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::