---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/StepbyStep_ADDS_and_Hybrid_Storage_from_AADJ_and_HAADJ"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Azure%20Files%20Identity/StepbyStep_ADDS_and_Hybrid_Storage_from_AADJ_and_HAADJ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.How-To

- cw.Azure-Files-All-Topics

- cw.Reviewed-12-2022

---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]



# Purpose

To access AD DS Storage accounts and AAD Hybrid storage accounts from AADJ and HAADJ VMs.



#Pre-requisite: 

- AADJ VM which has a line of sight to AD DS, make sure the VM created is in same VNET as that of the on prem DC server to ensure line of sight.  

- HAADJ VM which is AD DS Domain joined and Enable Hybrid Join in the Active Directory (on-prem DC)



#Part 1: How to access these following Storage Accounts over public network



- For AD DS joined storage account to be accessed over public network follow: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable 

- To enable AAD Hybrid on a storage account (from portal) and to get admin consent follow: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal 



## Scenarios



    1. In AADJ machine- Access AD DS Joined & AAD Hybrid Joined storage accounts.

    2. In HAADJ machine- Access AD DS Joined & AAD Hybrid Joined storage accounts.



# Scenario 1: In AADJ machine- How to access AD DS Joined & AAD Hybrid Joined storage accounts

- Scenario 1.1: AD DS Joined Storage account



        a.	Create a AADJ VM following.

        b.	Create an on-prem DC or use an existing one.

        c.	Login to on-prem Domain Controller

        d.	Create a storage account in azure portal and join it to the domain using Join-AzStorageAccount  cmdlet from AZ hybridfile follow this link https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-ad-ds-enable

        e.	Set second SPN using following powershell cmdlet

                $spnvalue = "cifs/siemens1.ad001.azurefilesidentity.net"

                Set-ADComputer -Identity $StorageAccountName -ServicePrincipalNames @{Add=$spnValue} -ErrorAction Stop 

        f.	Run the following cmdlet

                Get-ADComputer -identity <Storage account name> -Properties ServiceprincipalName, The result will show the added SPN as below.

        g.	Add a CNAME entry using Active Directory DNS Manager and follow the steps below for each storage account in the domain that the storage account is joined to

            - Go to Server manager -> Go to DNS -> right click on selected server and Select DNS Manager. 

            - Under your Doman, Go to Forward Looking Zones.

            - Go to your domain and right click, Select New Alias (CNAME)

            - For the alias name, enter your storage account name.

            - For the fully qualified domain name (FQDN), enter <storage-account-name>.<domain-name>, such as mystorageaccount.onpremad1.com.

            - For the target host FQDN, enter <storage-account-name>.file.core.windows.net

 

 

        h.	Login to AADJ VM- for each user and try to login (using user@Domain credentials) to it. Then run below command in elevated window. And restart the VM 

            - Follow the following steps to edit your RDP file to add user credentials to it to Run the VM as a specified user.

            - **	Edit your RDP file to end with the following lines**

                    username:s:.\AzureAD\KerbUser01@aadintcanaryoutlook.onmicrosoft.com

                    enablecredsspsupport:i:0

                    authentication level:i:2

                **Note** Why are we adding the rdp property in the text editor. Details here https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/rdp-files 

        i.	Once you login as a specified user run the following command to add reg key.

                    reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1 <--(this is not relevant to access AD DS joined SA but good to have it to show that the sa can be accessed after setting this reg key.)

        j.	Now try to mount to the file share created under the AD DS joined storage account.





- Scenario 1.2: AAD Hybrid joined Storage account



        a.	Using same on-prem DC server

        b.	Using same AADJ VM

        c.	Create a storage account and follow this link to enable AAD Kerberos via portal https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal 

        d.	Login to AADJ VM. (if logged in as local admin user)

        e.	Add Reg key

            reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1 

        f.	If you login as **Local admin** user- Open cmd prompt and run the below cmd-

            - Runas /user:Domain\user cmd

            - New window will open: mount the file share using following command:

                Net use X: \\Storageaccount.file.core.windows.net\Fileshare

        g.	If you log as AD Admin user, open cmd prompt and try to mount it should work.



# Scenario 2: In HAADJ machine- how to access AD DS Joined & AAD Hybrid Joined storage accounts



- Scenario 2.1: AD DS Joined Storage account



        a.	Follow the same steps as mentioned above for AADJ VM.



- Scenario 2.2: AAD Hybrid joined Storage account



        a.	Create a Storage account and Follow this link to enable AAD kerberos via portal. https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-hybrid-identities-enable?tabs=azure-portal 

        b.	Login to HAADJ VM (local admin) or as admin user , add the reg key and Try to Mount

        c.	If you login as Local admin user- Open cmd prompt and run the below command:

            - Runas /user:Domain\user cmd

        d.	New window will open: mount the file share:

            - Net use X: \\Storageaccount.file.core.windows.net\Fileshare

        e.	If you log as AD Admin user, open cmd prompt and try to mount it should work.



**Notes**: 

If mount does't work or if you are not able to get kerberos ticket, you would need to debug using fiddler and wireshark. Once done with debugging- please cleanup (its important) 



**Important note**: 

AADJ and HAADJ to have CloudKerberosTicketRetrievalEnabled Regkey enabled which allows access to AAD Hybrid Storage account



```cmd

reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Kerberos\Parameters /v CloudKerberosTicketRetrievalEnabled /t REG_DWORD /d 1

```



## Troubleshoot mounting/connection issues with Azure File Shares



  - [Azure/Storage/Azure Files Connectivity Workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496116/)

  - [Azure/Storage/TSG/Problem mapping a drive when Storage Account key has a forward slash](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496191 "Azure_Storage_TSG_Problem mapping a drive when Storage Account key has a forward slash")

  - [Azure/Storage/TSG/Problem accessing Azure Files Drive mapped under a different user](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496189 "Azure_Storage_TSG_Problem accessing Azure Files Drive mapped under a different user")

  - [Azure/Storage/TSG/System Error 53 when connecting to an Azure Files share](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496230 "Azure_Storage_TSG_System Error 53 when connecting to an Azure Files share")



## References



  - [Get started with Azure File storage on Windows](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-quick-create-use-windows)

  - [Introducing Microsoft Azure File Service](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction)

  

::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
