---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Audit File Share_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/Audit%20File%20Share_Storage"
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



## Summary



This article is describing the available options to access an existing Azure File share from a Windows machine (Azure VM or on premises), using Command Prompt or Windows PowerShell.



## What is Azure File?



Azure File storage is a service that offers file shares in the cloud using the standard Server Message Block (SMB) Protocol. Both SMB 2.1 and SMB 3.0 are supported. With Azure File storage, you can migrate legacy applications that rely on file shares to Azure quickly and without costly rewrites. Applications running in Azure virtual machines or cloud services or from on-premises clients can mount a file share in the cloud, just as a desktop application mounts a typical SMB share. Any number of application components can then mount and access the File storage share simultaneously.



Since a File storage share is a standard SMB file share, applications running in Azure can access data in the share via file sytem I/O APIs. Developers can therefore leverage their existing code and skills to migrate existing applications. IT Pros can use PowerShell cmdlets to create, mount, and manage File storage shares as part of the administration of Azure applications.



You can create Azure file shares using Azure Portal, the Azure Storage PowerShell cmdlets, the Azure Storage client libraries, or the Azure Storage REST API. Additionally, because these file shares are SMB shares, you can access them via standard and familiar file system APIs.



## How to audit different Azure File Share to find the user who changed the permissions in on-premises AD:





Demo:



- <b>Step 1.</b> 

Follow the steps from below article to configure the log analytics for Azure File Share:

https://learn.microsoft.com/en-us/azure/storage/common/storage-analytics-logging



a. Enable the diagnostics settings for Azure File 



![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/diagnosticssettings1.png)



b. Check all the options including Transactions and send it to Log Analytics workspace:



![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/checkallboxesm1.png)



c. Give it a name and save it.



- <b>Step 2.</b> 



a. Go to Storage Account > Logs > And run the below query



<span�class="small">



```

StorageFileLogs

| where AccountName contains "yourstorageaccountname"

| where SmbCommandMinor contains "SetSecurityInformation"

| project TimeGenerated, Category, SmbCommandMajor,SmbCommandMinor,SmbPrimarySID, SmbMessageID, OperationName, AuthenticationType, 

```

</span>



![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/loganalyticsquerym1.png)



b. Grab the last 4 digits of the SID and run the below query on the on prem machine

<span�class="small">



```

Get-ADUser -Filter * | Select-Object -Property SID,Name | Where-Object -Property SID -like "*-xxxx"

```

</span>



![image.png](/.attachments/SME-Topics/Azure-Files-All-Topics/last4digitsquerysidtousername.png)





::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md

:::
