---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How To: Key & DSR Cases/TPD - AIP Key Requests"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Key%20%26%20DSR%20Cases%2FTPD%20-%20AIP%20Key%20Requests"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Do not disclose the details provided in this document to the customer. 

[[_TOC_]]

##Introduction


Customers may contact CSS torequestof several transactions with their Azure RMS TPD (see [Operations for your Azure Information Protection tenant key](https://learn.microsoft.com/en-us/azure/information-protection/deploy-use/operations-tenant-key#BKMK_MSExport)). The most common request is to export their Microsoft managed AIP service key [Export your tenant key](https://learn.microsoft.com/en-us/azure/information-protection/operations-microsoft-managed-tenant-key#export-your-tenant-key). The following process is required. 

Customers may request 
 - exporting the original Microsoft-managed tenant key, or 
 - to delete other keys/key references. 

Generally the process is the same for either type of request.

With TPD export requests always use a DTM workspace with which to
 - provide the customer the AadrmTpd.exe tool, 
 - get their public key they generate, and 
 - send them the export file from the Ops team.
 
For issues, unnecessary delays, or other feedback, you may contact Security Supportability PMs by email: secspm@microsoft.com

## Overview

1. Customer opens case with CSS to request their TPD transaction.
2. Customer provides tenant information.
3. CSS initiates the verification process.
4. If a TPD export request, after verification CSS provides the AadrmTpd.exe tool to customer.
 - Customer generates a public and private key pair.
 - Customer sends CSS the public key.
5. CSS engages the RMS Ops teamfor thekey request.
6. In export cases Ops provides exported TPD to CSS and CSS sends customer the TPD.

## Details

### Tenant Information
1. Customer provides the following information about the tenant from which the key is to be exported.
 - The FQDN of the *.onmicrosoft.com tenant.
 - Output of the Azure RMS PowerShell command `Get-AipServiceConfiguration` & `Get-AipServiceKeys` run against the tenant.
 
### Sample steps to retrieve tenant data
1. Install the AIP Service PowerShell module (https://aka.ms/azipps).
2. Open an administrative PowerShell prompt.
3. Run the following commands.
 - `Start-Transcript`
 - `Connect-AIPService`
 - `Get-AIPServiceConfiguration`
 - `Get-AIPServiceKeys`
 - `Stop-Transcript`
4. Gather the transcript created in the previous steps. 

Please specify what is being requested for each key in the Get-AipServiceKeys output. Please use the KeyIdentifier values when describing what is to be done to a specific key. For each key in the output we need to know is it being deleted, archived, etc. The customer needs to specifically state what key they want to act upon, and what action they to do. 

For instance, if the Get-AipServiceKeys output is as below, and the customer wants to export the first key in the list, they need to explicitly state that in email. For example:

 - ![image.png](/.attachments/image-bcdaf36f-a3ae-4355-9048-c8daf5078054.png)

What to have the customer state in email.
```
Please export for the following key.
KeyIdentifier  : 4c700641-b16f-438e-adb0-fc9ac7992e75
```



## Verification
Generally, this process is as follows.
 - Get a list of the tenant administrators. In Azure AD, this is the Global Administrator role. In Azure Support Center (ASC) this is now the Global Administrator role as well. 
 - This is a bit trickier than it used to be. In the olden days tenants used to have a good number of actual user accounts as the Global Administrator. We could just email them via the process and go from there. Now, some customers only have a few service accounts as the full time Global Administrators. The rest are using privilege access management so that users request the Global Administrator role as needed, for limited time. We must take this into account for our verification process.
 - Generate the emails to applicable parties.

## TPD export process
Two steps are required for this process. One set of email notifications are sent to all the global tenant administrators. A second email is sent to the requestor. If the requestor is a tenant administrator they do not receive the first notification email.
1. The global administrators each get an email telling them of the request for the Azure RMS key.
 - Each administrator has five (5) business days from the date of the emails are sent to respond.
 - Any administrator may reply to cancel the request.
 - Administrators are not required to reply to approve the request.
 - After the five days, if no email responses return cancelling the request, the TPD export process continues.
2. The requesting user receives a separate email
 - Send an email telling the customer how to download the tool from their DTM. See below when sending the requestor an email for details  using the AadrmTpd.exe tool that will be provided.
 - See [this document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EfEAN7QKyPNFmBreVQTc--MBn99qyswDiohGUqDke3YGTg?e=gdIFwU) for details on obtaining and using the AadrmTpd.exe tool.

###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.
There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. <i>Method 1</i>: Use [Azure Support Center](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. <i>Method 2</i>: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - [Email template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdIIdNKNODZOmCKEYJTXIJMB-jSlnlhA2iYyWgCKTe7Ibg?e=KcZc4k)
3. Only global administrators are notified of the request. <b><i>Do not send the requestor this notification email if they are a global administrator</i>.</b>

###Create the emails for the global administrators.
These are just to the global administrators, not the requestor!
1. **Send one email to each administrator.** One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the tpdexportnotify@microsoft.com address.
4. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
5. Use the following [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/Ed7UswUu8dJEmqwR-njeNL8B22Ms-UtIWBwLG1R5Giy8Bw?e=tbfWer) for the body of the email.
6. **NOTE**: If a global administrator notification bounces (e.g. invalid email address) the customer must fix the issue. Either the user needs to be removed from global administrators or the reason for the bounce to be fixed. Then the verification process for the said administrators must be resubmitted. We do not tell the customer which account(s) have issues. They are capable of obtaining a list of global administrators and addressing the issue.
7. *PRO TIP*: In a blank email, do steps 2,3,4, and e above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.

###Create the email to the requestor.
1. Cc the appropriate case mail email address.
2. Cc the tpdexportnotify@microsoft.com address.
3. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
4. Use the following [template](https://microsoft.sharepoint.com/:w:/t/CSSSecurity2/Eesl3ntYaV9Mt-9n02oWI3gBEsQ6GFmT45f0ZgA0rLrtOQ?e=7k01uz) for the body of the email.



##Key deletion process
###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.
There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. _Method 1_: Use [Azure Support Center](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. _Method 2_: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - [Email template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdIIdNKNODZOmCKEYJTXIJMB-jSlnlhA2iYyWgCKTe7Ibg?e=KcZc4k)

###Create the emails for the global administrators.
1. **Send one email to each administrator.** One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the tpdexportnotify@microsoft.com address.
4. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
5. Use the following[template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EaID8ZOhSqtBvzLzxY061_gBO0m18QOD8mLPiimKlda_EA?e=hQ6mpo)for the body of the email.
6. *PRO TIP*: In a blank email, do steps 2,3,4, and e above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.

## Engage Ops to export the TPD
Azure Support Center (ASC) should be used to create the ICM.
1. Open an ICM using ASC. See this [document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdR6O1ujwkdHpttopdzJDrwBz-MOj8I0xZSTXz2Mno_OPw?e=vwZ1Fr) for details.
2. When asked, provide the public key the customer generated to the Ops team.

**If a TPD export request**

Provide the exported TPD to the customer

Note: It is not an actual TPD yet. The customer uses the AadrmTpd.exe tool to merge the private key generated with the file Ops exports from Azure RMS.
1. Provide the customer with the file exported by the Ops team.
2. The customer uses AadrmTpd.exe to generate the TPD from their private key and the file provided by the Ops team.
3. Use the following [template](https://microsoft.sharepoint.com/:w:/r/teams/Security-InformationProtection/Shared%20Documents/General/Process/TPD%20Process/FinalAadrmTpdSteps.docx?d=w8af161e4ccaa44329fc4fc6e5e2e12aa&csf=1&web=1&e=cWfYaw) in an email to the customer to ensure they complete the key process.
  
   The customer MUST use the [AadrmTpd.exe tool to merge the key material](https://learn.microsoft.com/en-us/azure/information-protection/operations-microsoft-managed-tenant-key#step-3-receive-key-instructions-from-css:~:text=Respond%20to%20the,file%20from%20CSS.) we send them with the private key they generated.


