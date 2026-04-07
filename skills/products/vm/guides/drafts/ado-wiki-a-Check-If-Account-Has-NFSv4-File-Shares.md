---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Network File System (NFS)/Check If Account Has NFSv4 File Shares_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Network%20File%20System%20%28NFS%29/Check%20If%20Account%20Has%20NFSv4%20File%20Shares_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-08-23
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

# Overview
This article will detail how to check if a Storage Account has NFS version 4.1 Azure File Shares.

# Prerequisites
1. Storage Account must be ***FileStorage*** type.
2. SAW/SAVM access required.

# How To Check
0. Make sure [Prerequisites](#Prerequisites) are met.
1. Open <u>XDS</u> ([How to Access XDS](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1136338/XDS_Tool?anchor=accessing-xds)).
2. Navigate to <u>XTable</u> --> <u>Tables</u> sections.
3. Locate and Select table <u>FileContainers</u> then click <u>View Rows</u>.
4. Select on <u>Filter by Key</u>.
    1. On <u>Key Low</u> input the ***StorageAccountName*** and click on the autocompleted value which should like like  ```storageaccountname01D6A3007DA7005```
    2. On <u>Key High</u> unput the ***StorageAccountName*** plus the "~" character which should look like ```storageaccountname~```
    3. Click <u>Ok</u> to apply the filtering conditions.
5. Review the results.
    1. If table show no results, then Storage Account doesn't have any File Shares (SMB nor NFS).
    2. If table shows results, review each File Share <u>Service Metadata</u> and look for the ***XFileContainerProtocol***.
        1. If  ***XFileContainerProtocol*** equals <u>SMB</u>, File Share is SMB.
        2. If ***XFileContainerProtocol*** equals <u>NFS</u>, File Share is NFS 4.1.
<br>![XDS XTable XFileContainers Example](/.attachments/SME-Topics/Storage-Monitoring/STORAGE-XDS-XTABLE-XFileContainers-SMB-NFS-Shares-Example.png)        
6. If there is <u>at least one</u> File Share with NFS, the Storage Account has NFS 4.1 shares.

# Future Plans
[Livesite: XNFS - add flag at account level to indicate NFS4 shares present on the account](https://msazure.visualstudio.com/One/_workitems/edit/24578254)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
