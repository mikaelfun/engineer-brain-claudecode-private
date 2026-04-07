---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Network File System (NFS)/Migrate NFS Data from LRS to ZRS_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Network%20File%20System%20%28NFS%29/Migrate%20NFS%20Data%20from%20LRS%20to%20ZRS_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-All-Topics

- cw.How-To

- cw.Reviewed-10-23

---



[[_TOC_]]



# Overview



When it comes to copying data from one storage solution to another, it's essential to have a well-thought-out plan, especially if you're migrating data from an NFS share in LRS (Locally Redundant Storage) to ZRS (Zone-Redundant Storage). In this article, we'll discuss the steps and best practices for achieving this migration seamlessly.



The process of copying data from an NFS share in LRS storage to ZRS storage involves a few steps, but it can be achieved efficiently. Here's a step-by-step guide on how to do it:

#Prerequisites



NFS protocol is supported only on Premium storage account







#Resolution



**Create a ZRS Storage Account:**



   The first step is to create a new Azure Storage Account with Zone-Redundant Storage (ZRS) redundancy. This ensures that your data is distributed across multiple Availability Zones for high availability and durability. To create a ZRS Storage Account, follow these steps:



   a. Log in to the Azure Portal (https://portal.azure.com).



   b. Click on "Create a resource" and search for "Storage Account."



   c. Choose "Storage account - fileshare" from the list of available resources.



   d. Select the redundancy as ZRS Storage Account.



 **Mount Both Storage Accounts in a Linux Machine:**



   After creating the ZRS Storage Account, you will need to mount both the LRS and ZRS Storage Accounts to a Linux machine where you intend to perform the data copy. This is typically done using NFS (Network File System) mounts. Here are the general steps:



   a. Ensure you have a Linux machine ready with the necessary tools and permissions to mount NFS shares.



   b. Mount the NFS share from the LRS Storage Account onto a directory on your Linux machine using a command like:

   

  ```

  sudo mount -t nfs -o nolock LRS_STORAGE_ACCOUNT_NAME.blob.core.windows.net:/SHARE_NAME /mnt/lrs (#Source Storage Account)

  ```

   

   c. Mount the ZRS Storage Account similarly to another directory on your Linux machine:



  ```

  sudo mount -t nfs -o nolock ZRS_STORAGE_ACCOUNT_NAME.blob.core.windows.net:/SHARE_NAME /mnt/zrs (#Destination Storage Account)

  ```



 **Copy Data Using rsync or cp**



   With both NFS shares mounted on your Linux machine, you can use standard Linux file copying tools like `rsync` or `cp` to transfer data from the LRS storage to the ZRS storage. For example, using `rsync` and `cp`:



   ```

   rsync -av /mnt/lrs/ /mnt/zrs/

   ```



   ```

   cp -r /mnt/lrs/* /mnt/zrs/

   ```



   This command will recursively copy the contents from the LRS-mounted directory to the ZRS-mounted directory, preserving file permissions and metadata.



 # Verify Data Integrity



   After the data transfer is complete, it's essential to verify the data integrity in the ZRS storage to ensure that no data loss occurred during the migration. You can use checksums and compare file counts to ensure everything has been successfully copied.



By following these steps, you can seamlessly copy data from NFS in LRS storage to ZRS storage. Remember to plan and execute the migration during a maintenance window to minimize any potential service disruptions or data access issues.



Data migration between different Azure storage accounts requires careful planning and execution. By creating a ZRS Storage Account, mounting both the source and destination accounts on a Linux machine, and using reliable tools like `rsync` or `cp`, you can ensure a smooth and secure transition of your data.



**Note: As of now azcopy is only supported for SMB.**



---

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::



:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::
