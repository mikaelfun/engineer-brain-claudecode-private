---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Azure AD Audit Signon (Last Signon Reports)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Azure%20AD%20Audit%20Signon%20%28Last%20Signon%20Reports%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Workflow
- Sign-Ins
- cw.comm-orgmgt-tsg
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
This powershell script will create a report for a user/users/members/guests (enabled or disabled) last signon to a single, multiple or all apps based on the time frame entered.
You will be prompted to save the csv file, and if wanted open the new CSV in Excel.

Note: the present guide relies on Sign in logs, in cases where the last sign in goes beyond the log retention period you can also try: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/597998/Get-Azure-AD-users-Last-Sign-On-metadata-values

This can be used for customers wanting to know if users are signing into applications they should not be (Azure Powershell/Azure Portal) or if they are not using licenses (not signing into O365) in the last 30/60/90 days where they can then remove that license not being used.

This script helps where the portal reports all signins for a user and makes it difficult to discover the one piece of information they want, when did they last sign in.

(the script may be updated to report all signins for an app, however the portal does this now and can be exported)

To run this powershell script it does need to have the powershell AzureAD or AzureADPreview module installed.

You will need the Powershell AzureAD or AzureADPreview Module (most of us probably already do) 
If not Open a new powershell window in admin mode:
Install-module -name AzureAD -Force or 
Install-module -name AzureADPreview -Force

If you get any errors about install nuget because of TLS run this: Typically we don’t have that issue: customers may. 
PS C:\Users\Administrator>[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 
PS C:\Users\Administrator> install-module powershellget -force

To start this from powershell command prompt you will need to put an **&**<space> “ & ".\LastAzureADAuditSigninReportV2.ps1" or it will not start because of the UI interface added. 

From Explorer, ISE or Visual Studio it will run without needing the &

Run the application from powershell
Attached to this document
**PS C:\users\me\downloads> & ".\LastAzureADAuditSigninReportv2.ps1"**

Login and enter your tenant credentials

You will be asked to search before a date(LT) after a date(GT) or a Date Range (After a Date and Before a Date ) ex: (GT 2021-06-01 and LT 2021-06-20) will get all signins between 06-01-2021 and 06-20-2021)

**Date Search**

![image.png](/.attachments/image-56e330ad-2b4a-438a-99ff-9208a72bb0e0.png)
 
**Enter the date to search** If this is using the date range you will be prompted for the starting and end date to search

![image.png](/.attachments/image-40b69321-ba7f-42dc-8e5e-09e21ee5d782.png)

(Date Range Entry)
Enter starting Date

![image.png](/.attachments/image-dc18be92-5995-47f0-9f19-daa5dfe641af.png)

Enter End Date

![image.png](/.attachments/image-7b5c8be5-78d0-4541-b509-e02e23ef78b8.png)

You can pick by the users **Display Name** (you can put just 1 letter to search if you are not sure of the display name)
ObjectID(have to pull from portal or powershell)

**All Accounts, enabled or disabled**

If you just want Members or Guests, all members or guests that are only enabled or disabled you have that option

**All Members, enabled or disabled**

**All Guests, enabled or disabled**

![image.png](/.attachments/image-2d226bb1-bf58-45ec-9f43-bad16ee9af88.png)

**Enter the search** (users display name, start small)

![image.png](/.attachments/image-acf20dc0-9a96-40d9-b7ae-6e8ae6aeaf19.png)  

You can select just that one account or multiselect

![image.png](/.attachments/image-14b415e5-93fc-4c59-968e-dac36081aa29.png) 

Select **All apps last signon** that are discovered in the signin logs (this will search ONLY apps that have been used during the time period)  If a date is entered and that app has not been signed into, it will not report on it.

**Select App Name**(find the app you want to search on) Same as above, if the app is not signed into in the time period it will not be listed.

![image.png](/.attachments/image-cff72dc8-0fe3-4f04-934a-1faf4e225d69.png) 

Select the app you want to find a signon for (or multiple)

![image.png](/.attachments/image-29abe0bd-6661-4588-8a0d-e5f5a6a0e9ce.png) 

It will then ask to save the csv file prefilled out w report/date/or you can enter your own name

![image.png](/.attachments/image-4f6efd0e-9485-4e6b-b6f0-f62031bfe728.png) 

Then asks if you want to open excel to view the file 

(click OK to open the new report in Excel or Cancel if you want to review later)
 
![image.png](/.attachments/image-2af5a992-5f53-41bc-856f-9b275ca02c19.png)


Example of all accounts (guests/members) and all applications 
Note: if no one signed into an app and is not in the signin logs – there is no record
All of the reports will show an output of which app/user and if there is a signon to that application

![image.png](/.attachments/image-71c9ea91-95e8-4e31-afd6-76fdf55ceb12.png)

**Download the file here:**

** [LastAzureADAuditSigninReportV2.ps1](/.attachments/LastAzureADAuditSigninReportV2-226cf38b-8b1c-44b4-be12-19bea5cb4fa3.ps1)**
