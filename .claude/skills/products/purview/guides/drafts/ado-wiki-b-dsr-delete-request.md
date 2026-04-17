---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How To: Key & DSR Cases/DSR Delete Request"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Key%20%26%20DSR%20Cases%2FDSR%20Delete%20Request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Do not disclose the details provided in this document to the customer.

[[_TOC_]] 
## Introduction
 
Customers may contact CSS to request one of several DSR delete [requests](https://docs.microsoft.com/en-us/azure/information-protection/manage-personal-data#deleting-personal-data). The below process is required. 

Customers may request deleting entries from their AIP Service Admin Logs, AIP Service User Logs, and the AIP Service Tracking Portal. The process is the same for any types of request.

For issues, unnecessary delays, or other feedback, you may contact your TA.

## Overview	
1. Customer opens case with CSS to request a DSR delete.
2. Customer provides tenant information.
3. CSS initiates the verification process.
4. After completing the verification process CSS engages the AIP Ops team for the DSR delete request.

From [To delete personal data with Microsoft Support](https://docs.microsoft.com/en-us/azure/information-protection/manage-personal-data#to-delete-personal-data-with-microsoft-support)

## Details
### Tenant Information
1. Customer provides the following information about the tenant from which the data is to be deleted.
2. The FQDN of the *.onmicrosoft.com tenant.
3. Output of the AIP Service PowerShell command `Get-AipServiceConfiguration`
 
Please specify what is being requested for the DSR delete request. This includes the target log (Admin/User/Tracking) for the delete and the date range to be deleted. In the case of a tracking portal delete request the target email address is request as well as the date range.
 - To delete the administration log (_Get-AipServiceAdminLog_), provide the end date. All admin logs until that end date will be deleted.
 - To delete the usage logs (_Get-AipServiceUserLog_), provide the end date. All usage logs until that end date will be deleted.
 - To delete the document tracking logs, provide the end date and UserEmail. All document tracking information relating to the UserEmail until that end date will be deleted. Regular expression (Perl format) for UserEmail is supported.
 

###Verification
This process is as follows.
 - Get a list of the tenant administrators. In Azure AD, this is the Global Administrator role. In Azure Support Center this is the Global Administrator role. 
 - This is a bit trickier than it used to be. In the olden days tenants used to have a good number of actual user accounts as the Global Administrator. We could just email them via the process and go from there. Now, some customers only have a few service accounts as the full time Global Administrators. The rest are using privilege access management so that users request the Global Administrator role as needed, for limited time. We have to take this into account for our verification process.
 - Generate the emails to applicable parties.
 
##DSR Delete process
###Notifications
One step is required for this process. A set of email notifications are sent to all the global tenant administrators. 
1. The global administrators each get an email telling them of the request for the AIP DSR delete request.
 - Each administrator has five (5) business days from the date of the emails are sent to respond.
 - Any administrator may reply to cancel the request.
 - Administrators are not required to reply to approve the request.
 - After the five days, if no email responses return cancelling the request, the DSR request process continues.

###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.

There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. _Method 1_: Use [Azure Support Center](https://microsoft.sharepoint.com/%3Aw%3A/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. _Method 2_: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/%3Aw%3A/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - Email [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXHQiOG_qJNEumgzcObBwu4BFnSc77UUOx-gYRZ1Kiniwg?e=bx2YrS)

Only global administrators are notified of the request. ** Do not send the requestor this notification email if they are a global administrator.**

###Create the emails for the global administrators.
1. Send one email to each administrator. One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the AipDsrDeleteNotify@microsoft.com address.
4. The subject line should read as follows: AIP DSR delete request (SR#).
5. Use one of the following template for the body of the email.
 - AipService Admin Log delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EYI4mMrEichJg0ZdM5AxPOcBedAY9Rc3mSXXOXAKTca7Sg?e=X3zJO5)
 - AipService User Log delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EWhG9bwzy_RLlAb26twjmvQB0Lsa5yBjP2DQd8hYhyn66Q?e=wCkgce)
 - AIP Tracking Portal delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/Edq7jLDqd2JOlfmSdJx-tXQBqH3IKr6pbn9iLM30fEcJBg?e=JKd2iE)
6. **NOTE**: If a global administrator notification bounces (e.g. invalid email address) the customer must fix the issue. Either the user needs to be removed from global administrators or the reason for the bounce to be fixed. Then the verification process for the said administrators must be resubmitted. We do not tell the customer which account(s) have issues. They are capable of obtaining a list of global administrators and addressing the issue.
7. _PRO TIP_: In a blank email, do steps 2,3,4, and 5 above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.
 
###Engage Ops to do the requested deletion
Azure Support Center (ASC) should be used to create the ICM.
1.	Open an incident using ASC to generate the ICM.  See this [document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EU5HMKxq23JJgfaAjnPuIg4Bu9zr5LIg3zpZakYJIWKp2Q?e=SkRHgK) for details.
2. Make sure to use requested delete time frame using either US date structure (MM/DD/YYYY) or write it as verbal date (example: May 12th until May 15th)

