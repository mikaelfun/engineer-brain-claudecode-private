---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Unable to mount NFS share of Azure Data Box"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FUnable%20to%20mount%20NFS%20share%20of%20Azure%20Data%20Box"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Description
-----------

This TSG details information on how to troubleshoot issues when the customer can't copy data to the Azure Data Box because they cannot connect on the NFS Shares


In some cases, most of the customers forget to create a folder under the share for the files, so always ask the customer to create a folder and then copy the files to it
    

When trying to copy data to Data Box there could be issues trying to mount the NFS share. If the customer is unable to mount the share they will not be able to copy the data to it

Troubleshooting and Tools
-------------------------

*   In these scenarios ask the customer for screenshots or error messages if there are any
*   If you are using a Linux host/client computer, perform the following steps to configure Data Box to allow access to NFS clients.
*   Make sure you supply the IP addresses of the allowed clients that can access the share.  
 * In the local web UI, go to Connect and copy page. Under NFS settings, click NFS client access.

*   Supply the IP address of the NFS client and click Add. You can configure access for multiple NFS clients by repeating this step. Click OK.
*   Ensure that the Linux host computer has a supported version of NFS client installed. Use the specific version for your Linux distribution.
*   Once the NFS client is configured on Data Box, use the following command to mount the NFS share on your Data Box device:
*   `sudo mount <Data Box IP>:/<share name> <mount point>`

 **Note**: For Mac clients, you will need to add an additional option as follows
    
    sudo mount -t nfs -o sec=sys,resvport 10.161.23.130:/Mystoracct_Blob /home/databoxubuntuhost/databox  
    

*   Always create a folder for the files that you intend to copy under the share and then copy the files to that folder. The folder created under block blob and page blob shares represents a container to which data is uploaded as blobs. You cannot copy files directly to root folder in the storage account

Public Documentation
--------------------

[https://docs.microsoft.com/en-us/azure/databox/data-box-deploy-copy-data-via-nfs](https://docs.microsoft.com/en-us/azure/databox/data-box-deploy-copy-data-via-nfs)
