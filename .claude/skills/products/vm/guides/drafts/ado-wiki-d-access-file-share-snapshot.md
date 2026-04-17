---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Access Azure File Share Snapshot_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Access%20Azure%20File%20Share%20Snapshot_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-All-Topics

- cw.How-To

- cw.Reviewed-07-2023

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]



# Summary



This article is describing about the steps to access a File Share Snapshot from a Windows machine.



## Enablement



- [Overview of share snapshots for Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-snapshots-files)



## LabBox

 <https://aka.ms/LabBox>



- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with an Azure File Share mapped on login. The File Share has a deleted file saved in the snapshot. This lab is not to be shared with customers.



  [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox%3Fpath=/SME/Storage/AFSSnapshot.json)



# What is Azure File Share Snapshot



A share snapshot is a point-in-time, read-only copy of your data. You can create, delete, and manage snapshots by using the REST API.

Same capabilities are also available in the client library, Azure CLI, and Azure portal.



# Steps to Access an Azure File Share Snapshot



For accessing the data inside a particular File Share Snapshot, navigate inside the File Share Snapshot from the portal within the File Share.

Select Connect from the File Share Snapshot option.



![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/File-Share-Snapshot-Connection.png)



From the connect script along with the default script that mounts a File Share, Run the Set-Location command that is present as the last line. Below screen shot for reference.



![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/File-Share-Snapshot-connection-script.png)



From the Windows client where the File Share is mounted, the File Share Snapshot can be accessed using two methods - Powershell and File Explorer.



# From Powershell:



Run dir command with the snapshot time frame to navigate into the respective snapshot : "dir T:\@GMT-2022.09.20-05.32.57"



File Share vs File Share Snapshot :



![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/Accessing-A-Particular-FileShare-Snapshot-Using-PS.png)



# From File Explorer:



Navigate the respective Mounted File Share drive.



Right click on the empty space inside the file share and select Properties. Then select "Previous Versions" tab.



In there you can view the list of snapshots corresponding to the File Share.



![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/Previous-Versions.png)



File Share vs File Share Snapshot :



![File Share Storage Account](/.attachments/SME-Topics/Azure-Files-All-Topics/Using-File-Explorer.png)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
