---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Mounting Azure File Share Using a Specific User and Group_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Mounting%20Azure%20File%20Share%20Using%20a%20Specific%20User%20and%20Group_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-All-Topics

- cw.How-To

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]



#Summary



How to mount an Azure File Share using a specific user and group. 



#Check the existing setup



The azure file share is currently mounted using the root user. 



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Existing-setup-root-user.png)



Current fstab configuration : 



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Checking-the-existing-setup.png)





#Mount it using a different existing user : 



For mounting the same file share using another user account , eg : "Oracle" and group "Oinstall" need to append the UID of the respective user and gid of the group at the end of the fstab and remount the file share again. 



#Command to get the user ID & Group ID : 

For appending the uid and gid in the fstab, need to retrieve the IDs of both the user and the respective group. The same can be retrieved using the below command : 



id Oracle



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Command-to-get-the-user-ID-and-Group-ID.png)



#Command to unmount

Command to unmount the File share. 



umount "name of the file share"



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_umount.png)



Append the uid, gid of the azure file share entry in the /etc/fstab file as below. 



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Appending-the-fstab.png)





#Mount the file share again 



Command to mount the File Shar again : 



mount -av 



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Mount-the-file-share-again.png)



#Verification



Verify if the mounted file share has the new user name and group ID associated with it. 



![](/.attachments/SME-Topics/Azure-Files-All-Topics/Mounting-Azure-File-Share-Using-a-Specific-User-and-Group_Verification.png)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
