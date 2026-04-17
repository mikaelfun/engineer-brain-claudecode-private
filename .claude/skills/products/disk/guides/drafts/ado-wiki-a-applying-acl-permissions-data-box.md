---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Applying ACL and Permissions at destination and removing source ACLs before data transfer to Data Box"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FApplying%20ACL%20and%20Permissions%20at%20destination%20and%20removing%20source%20ACLs%20before%20data%20transfer%20to%20Data%20Box"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Description
-----------
 This can apply to situations where the customer does NOT want to retain ACL's, or they want their files to inherit permissions from the destination domain. For example, customer is trying to copy source data from their on-premises domain (Domain-A) to an Azure Files - Storage Account, which is linked to a separate hybrid or cloud domain (Domain-B).  

However, they do not want to retain the source Permissions/ACL's, and would like the copied files to inherit the permissions from the destination, in this case Domain-B

Root Cause
----------

By design when using SMB, the databox only sees source ACL's, retains source ACL's, and does not inherit permissions if it already has source ACL's, as this is the most common use-case for the Databox Service.

There are three known options to do this:

* **Option 1:**   Use databox as is, and forward source permissions, inherit everything downwards at destination

    `With this option, once the data is transferred to its destination, customer will be required to inherit permissions from share-root directory to files manually. This can be time-consuming especially with large amounts of data it could take days or weeks; but will work`
    

*  **Option 2:**  Disable ACL Forwarding in DataBox Web UI - Metadata is transferred by default, you can disable this

    `With option 2, by default "ACL's for Azure Files" is enabled. So, you would select the disable option. 
    However, this option includes other Metadata, so you will not only be disabling ACL's from forwarding, but timestamps and file attributes as well.  
    So, the trade-off would be losing file attributes and timestamps along with the source ACL's, in order to inherit permissions at destination. `

    https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin
    
*   **Option 3:** Set your destination permissions in new directory on the DataBox Share (databoxname_AzFile) prior to copying data onto the databox

   ` Create a new directory in the DataBox Share in which you plan to copy to (databoxname_AzFile in this case)  
    Set the "destination permissions" on this root level directory prior to copying data into it. This can be done using either icacls or the windows GUI like so 
    
    Right click folder -> Properties -> Security tab -> Advanced -> Add 
    
    This may require some time up-front to set the "destination permissions" on the shares new directory. 
    However, once Robocopy with the "DAT" option is used to copy into this folder, the permissions will be inherited downwards at the databox. 
    Make sure to copy data onto Databox using Robocopy with "DAT" option. As this will not forward any source permissions 
    If necessary, over SMB, set the "destination permissions" on the root level directory to inherit downwards using icacls or some similar utility. 
    
    The get-acl -Audit <filename> | fl * command can be used in PowerShell to confirm files are inheriting the permissions`
    

Public Documentation
--------------------

> https://docs.microsoft.com/en-us/azure/databox/data-box-local-web-ui-admin

> https://docs.microsoft.com/en-us/azure/databox/data-box-file-acls-preservation

> https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy

> https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/icacls

> https://docs.microsoft.com/en-us/windows/security/identity-protection/access-control/access-control

Author
------

Bahadir (bcanturk)
