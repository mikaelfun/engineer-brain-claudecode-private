---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/SSPR - Self Service Password Reset/SSPR - Reporting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/SSPR%20-%20Self%20Service%20Password%20Reset/SSPR%20-%20Reporting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.Azure-AD
- cw.AAD-Account-Management
- cw.Azure-AD-SSPR
- cw.AAD-Password
- Password Reset
- SSPR
- Reporting
- Usage and Insights
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [Azure-AD](/Tags/Azure%2DAD) [Azure-AD-SSPR](/Tags/Azure%2DAD%2DSSPR) [AAD-Password](/Tags/AAD%2DPassword)  


[[_TOC_]]

# Feature Overview

Administrators can now get insights into how their organization is using Self Service Password Reset (SSPR) and Multi-Factor Authentication (MFA.) In the Registration section of this report, they can see how many of the users are registered for MFA and SSPR. They can also see how many users have been enabled to use SSPR and how many users can reset their own passwords because they are both enabled to use SSPR and registered for SSPR. This data is calculated by looking at each user to see which methods they�ve registered and whether they are enabled for SSPR. Finally, admins can drill down and see the status of each user by clicking on one of the tiles.�

In addition to the overall registration numbers, admins can also see the success and failure of registration per authentication method. This allows them to understand which authentication methods users most commonly registered and which ones are easy for them to register. This data is calculated using the last 30 days of audit logs from the [combined security info registration](https://aka.ms/securityinfodocs) and [SSPR registration](https://docs.microsoft.com/azure/active-directory/user-help/active-directory-passwords-reset-register) experiences. Admins can drill down and see the latest registration audit information for each user by clicking on the chart.��

# Scoping

This feature is supported by�[Queue - AAD - Account Management Professional](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Professional&QueueNameFilter=sspr&SearchFlag=True)�and�[Queue - AAD - Account Management Premier](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Premier&QueueNameFilter=sspr&SearchFlag=True).

## Prerequisites

  - You must have SSPR and MFA enabled in your tenant.
  - You must have at minimum Azure AD Basic licensing for cloud users and Azure AD P1 or P2 for hybrid users using password writeback.

## Roles and Licensing

The following roles can access SSPR and MFA Usage and Insights:

  - Company Administrator
  - Security Reader
  - Security Administrator
  - Reports Reader

The SSPR licensing requirements are described here: <https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-licensing> . If you do not have the appropriate licensing, users will not be able to reset their passwords and you will not see password reset data in the reports.

## Known Issues

  - The data shown in these reports will be delayed. We will be adding a �Last updated� field to the report so that you know how recent your data is.
  - The registration failure data shown in the **Registrations** chart may be inaccurate. We will address this issue before public preview.
  - The ability to download the details for registration and reset is not yet available. This will be available in public preview.
  - The **PhoneAppNotification** or **PhoneAppOTP** methods that a user might have configured are not displayed in the dashboard on **Microsoft Entra authentication methods - Policies**.

## Concept

### SSPR usage and insights

SSPR usage & insights provides two types of data:

  - **Registration data**: This data shows exactly which methods a user (or an admin on behalf of the user) has registered for SSPR. This data does not change based on the Date filter selected.
  - **Audit data**: This data shows the latest details on success and failures in registration and reset. This data is available for the last 24 hour, 7 days, and 30 days.

#### Insights and charts

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![2019-06-07 9-45-45a.png](/.attachments/5abfe6d2-ca00-dac2-1151-e647e6eef87f600px-2019-06-07_9-45-45a.png)](/.attachments/5abfe6d2-ca00-dac2-1151-e647e6eef87f600px-2019-06-07_9-45-45a.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

### Registration Details

The **users capable of multifactor authentication, passwordless authentication, and self-service password reset,** tiles show the following registration data for your users:

  - **Users capable of Azure multifactor authenticationt** shows the breakdown of users who are both:
    - Registered for a strong authentication method
    - Enabled by policy to use that method for MFA

     This number doesn't reflect users registered for MFA outside of Microsoft Entra ID.

  - **Users capable of passwordless authentication** shows the breakdown of users who are registered to sign in without a password by using FIDO2, Windows Hello for Business, or passwordless Phone sign-in with the Microsoft Authenticator app.

  - **Users capable of self-service password resets** shows the breakdown of users who can reset their passwords. Users can reset their password if they're both:
    - Registered for enough methods to satisfy their organization's policy for self-service password reset
    - Enabled to reset their password


### Usage Details

The Usage report shows which authentication methods are used to sign-in and reset passwords.

{Picture}

**Sign-ins by authentication requirement** shows the number of successful user interactive sign-ins that were required for single-factor versus multifactor authentication in Microsoft Entra ID. Sign-ins where MFA was enforced by a third-party MFA provider are not included.

{Picture}

**Sign-ins by authentication method** shows the number of user interactive sign-ins (success and failure) by authentication method used. It doesn't include sign-ins where the authentication requirement was satisfied by a claim in the token.

**Number of password resets and account** unlocks shows the number of successful password changes and password resets (self-service and by admin) over time.

**Password resets by authentication method** shows the number of successful and failed authentications during the password reset flow by authentication method.

### User registration details

Using the controls at the top of the list, we can search for a user and filter the list of users based on the columns shown.

 **Note:**
 User accounts that were recently deleted, also known as soft-deleted users, are not listed in user registration details.

 The registration details report shows the following information for each user:

   - User principal name

   - Name

   - MFA Capable (Capable, Not Capable)

   - Passwordless Capable (Capable, Not Capable)

   - SSPR Registered (Registered, Not Registered)

   - SSPR Enabled (Enabled, Not Enabled)

   - SSPR Capable (Capable, Not Capable)
   
   - Methods registered (Alternate Mobile Phone, Certificate-based authentication, Email, FIDO2 security key, Hardware OATH token, Microsoft Authenticator app, Microsoft Passwordless phone sign-in, Mobile phone, Office phone, Security questions, Software OATH token, Temporary Access Pass, Windows Hello for Business)
   
   - Last Updated Time (The date and time when the report most recently updated. This value is not related the user's authentication method registration.)

### Registration and reset events

Registration and reset events shows registration and reset events from the last 24 hours, last seven days, or last 30 days including:

  - Date

  - User name

  - User

  - Feature (Registration, Reset)

  - Method used (App notification, App code, Phone Call, Office Call, Alternate Mobile Call, SMS, Email, Security questions)

  - Status (Success, Failure)

  - Reason for failure (explanation)


## Concept

### SSPR Audit Logging
As of Dec, 2024 additional audit logging has been introduced capturing Admin instantiated policy changes. 
Note, high-level customer facing audit logging details can be found here: https://learn.microsoft.com/entra/identity/authentication/howto-sspr-reporting

####Policy Change events

![==image_0==.png](/.attachments/==image_0==-fc78af04-8cbf-4e79-b7d7-9d46d5e592cb.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>EnablementForUsers�<br><br><br><br><br><br><br> | <br><br>Self service password reset enabled�<br><br><br><br><br><br><br> | <br><br>None, Selected or All.�<br><br><br><br><br><br><br> |

Authentication methods�

![==image_1==.png](/.attachments/==image_1==-21ce72b6-7704-4999-85c1-3b833757cbf0.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>NumberOfRequiredContactMethodsForUsers�<br><br><br><br><br><br><br> | <br><br>Number of methods required to reset�<br><br><br><br><br><br><br> | <br><br>Integer Values (1 or 2).�<br><br><br><br><br><br><br> |
| <br><br>SelectedContactMethodsForUsers�<br><br><br><br><br><br><br> | <br><br>Methods available to users�<br><br><br><br><br><br><br> | <br><br>None, Email, MobileSMS, MobileCall, OfficeCall, AlternateEmail, SecurityQuestions, MobileAppNotification or MobileAppCode.�<br><br><br><br><br><br><br> |

Registration�

![==image_2==.png](/.attachments/==image_2==-1b8b6716-c603-4ce2-ba32-1551aea47869.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>EnforcedRegistrationEnablementForUsers�<br><br><br><br><br><br><br> | <br><br>Require users to register when signing in?�<br><br><br><br><br><br><br> | <br><br>Yes or No.�<br><br><br><br><br><br><br> |
| <br><br>EnforcedRegistrationIntervalInDaysForUsers�<br><br><br><br><br><br><br> | <br><br>Number of days before users are asked to re-confirm their authentication information�<br><br><br><br><br><br><br> | <br><br>Integer value.�<br><br><br><br><br><br><br> |

Notifications�

![==image_3==.png](/.attachments/==image_3==-2dcc1ab4-0ade-4738-be60-f5f31fc51b39.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>NotifyUsersOfReset�<br><br><br><br><br><br><br> | <br><br>Notify users on password resets?�<br><br><br><br><br><br><br> | <br><br>True or False.�<br><br><br><br><br><br><br> |
| <br><br>NotifyTenantAdminOfReset�<br><br><br><br><br><br><br> | <br><br>Notify all admins when other admins reset their password?�<br><br><br><br><br><br><br> | <br><br>True or False.�<br><br><br><br><br><br><br> |

Customization�

![==image_4==.png](/.attachments/==image_4==-5a4356e5-4c01-470d-94c1-2c5fb90cbb80.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>CustomizeContactAdminLink�<br><br><br><br><br><br><br> | <br><br>Customize helpdesk link�<br><br><br><br><br><br><br> | <br><br>True or False.�<br><br><br><br><br><br><br> |
| <br><br>CustomContactAdminLink�<br><br><br><br><br><br> | <br><br>Custom helpdesk email or URL�<br><br><br><br><br><br> | <br><br>String (URL value).�<br><br><br><br><br><br><br> |

On-premises integration�

![==image_5==.png](/.attachments/==image_5==-6bd53776-1d6c-4bc7-831e-27ce8a0d3344.png) �

| <br><br>Settings Name in Audit logs�<br><br><br><br><br><br><br> | <br><br>Description�<br><br><br><br><br><br><br> | <br><br>Expected Values�<br><br><br><br><br><br><br> |
| --- | --- | --- |
| <br><br>EnableAccountUnlock�<br><br><br><br><br><br><br> | <br><br>Allow users to unlock accounts without resetting their passwor?�<br><br><br><br><br><br><br> | <br><br>Null*, True or False.�*Null value means that value is unchanged.�<br><br><br><br><br><br><br> |

Example log:�

If the user changes the �Self service password reset enabled� to �All� from �None�:�

![==image_6==.png](/.attachments/==image_6==-34dc1b1d-2e59-4d22-b3cb-c4341d84e541.png) �

Then an Audit entry will be created in Audit logs from the Self-service Password Management with Category as PolicyManagement and Activity as Update SSPR Settings as shown below:�

th![==image_7==.png](/.attachments/==image_7==-cf29762e-6477-46cb-a639-4f05fff831d8.png) �

Clicking on the audit entry will show the details of the changes made:�

![==image_8==.png](/.attachments/==image_8==-9cae83b6-ef37-4a5b-861b-2d5c6b7b3729.png) �

The Modified Properties tab will show which settings were changed with old value and the new value listed:�

![==image_9==.png](/.attachments/==image_9==-d3a4260e-7329-4e04-a731-9f2f5df3c29b.png) �

In the example above as the �Self service password reset enabled� was changed to �All� from �None�, we see the old value as �None� and new value as �All� for �EnablementForUsers� setting.�



# How To

To check out Authentication Methods Usage & Insights, do the following:

1.  Sign into the Azure portal as a Security Reader, a Security Administrator, or a Reports Reader.
2.  Browse to **Usage & insights** \> **Authentication methods activity**.�

# TSG Scenarios

## TSG - Issues with Registration Status Count

**Issue:** The last updated time is out of date and is old. Your update time is highlighted in the following image:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Registration Status Count.png](/.attachments/289d7f4d-f4ba-d9cd-9406-cc57b60b4f16600px-TSG_-_Issues_with_Registration_Status_Count.png)](/.attachments/289d7f4d-f4ba-d9cd-9406-cc57b60b4f16600px-TSG_-_Issues_with_Registration_Status_Count.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose?**

Execute the below Kusto function to find the source which served the data.

<https://idsharedwus.kusto.windows.net/AXMPROD?query=H4sIAAAAAAAEAAsJdo8PSk3PLC4pSizJzM8LLkksKS3WKEnNS8wr8UyxVVLSKS5JLCqxTUksSS3JzE3VUFLS1EnNS0ER0OTiAgAwobiqSQAAAA%3d%3d&web=0>

TSG\_RegistrationStatus(tenantId="",start=datetime(""),end=datetime(""))

If its databricks

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/D7499BDF>
  - If the job had failed then check the current status of the Job from the same dashboard
  - If it had succeeded then its an transient issue and can be safely ignored.
  - If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

## TSG - Issues with Count in Registration Status

**Issue:** If the Issue is with the counts that are shown as part of the Registration as highlighted below:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Count in Registration Status.png](/.attachments/63cc55f6-7acb-9de4-1300-415f70baf2f9600px-TSG_-_Issues_with_Count_in_Registration_Status.png)](/.attachments/63cc55f6-7acb-9de4-1300-415f70baf2f9600px-TSG_-_Issues_with_Count_in_Registration_Status.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose:**

Execute the below Kusto function to find the source which served the data.

[https://idsharedwus.kusto.windows.net/AXMPROD?query=H4sIAAAAAAAEAAsJdo8PSk3PLC4pSizJzM8LLkksKS3WKEnNS8wr8UyxVVLSKS5JLCqxTUksSS3JzE3VUFLS1EnNS0ER0OTiAgAwobiqSQAAAA%3D%3D\&web=0](https://idsharedwus.kusto.windows.net/AXMPROD?query=H4sIAAAAAAAEAAsJdo8PSk3PLC4pSizJzM8LLkksKS3WKEnNS8wr8UyxVVLSKS5JLCqxTUksSS3JzE3VUFLS1EnNS0ER0OTiAgAwobiqSQAAAA%3d%3d&web=0)

TSG\_RegistrationStatus(tenantId="",start=datetime(""),end=datetime(""))

If its databricks

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/D7499BDF>
  - If the job had failed during the time period that the customer had checked then check the current status of the Job from the same dashboard.
  - Check if the Job had succeeded anytime after that. if yes, then its an transient issue and can be safely ignored.
  - However, we need to communicate with the customer to refresh and check once.

If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

If the Job is succeeding and the data is still incorrect, it might point to some internal issue that needs a deeper investigation with MSODS and Tenant Crawler so raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

## TSG - Issues with Registration by Authentication Method

**This can either be the update time is old or the actual reported count is suspected to be inaccurate.**

**Issue:** The last updated time is out of date and is old. Your update time is highlighted in the following image:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Registration by Authentication Method.png](/.attachments/ef6b5df0-1f40-5e40-bfef-a210c6e5ea03600px-TSG_-_Issues_with_Registration_by_Authentication_Method.png)](/.attachments/ef6b5df0-1f40-5e40-bfef-a210c6e5ea03600px-TSG_-_Issues_with_Registration_by_Authentication_Method.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose?**

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/CFA1A237>
  - If the job had failed then check the current status of the Job from the same dashboard
  - If it had succeeded then its an transient issue and can be safely ignored.
  - If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

**Issue:** The count is inaccurate

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Registration Status Count2.png](/.attachments/b96024c5-311a-c48b-0243-b4ed40cfc70d600px-TSG_-_Issues_with_Registration_Status_Count2.png)](/.attachments/b96024c5-311a-c48b-0243-b4ed40cfc70d600px-TSG_-_Issues_with_Registration_Status_Count2.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose?**

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/CFA1A237>
  - If the job had failed then check the current status of the Job from the same dashboard
  - If it had succeeded then its an transient issue and can be safely ignored. And we should get this verified with the Customer to Double check.
  - If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.
  - If the Job is succeeding and still the counts do not match. Then there is a deeper issue that needs investigation into Audit Event Service: But for this we would need additional information from the customer:
  - What is the Auth method did they exercise and and what time.
  - What is the status that they saw in the SSPR UX.

Please add this additional information and raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

## TSG - Issues with Resets and Account Unlocks

If the issue is with the last updated date time as highlighted below:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Resets and Account Unlocks.png](/.attachments/e647429b-ec01-5217-fc88-af24f6e8052a600px-TSG_-_Issues_with_Resets_and_Account_Unlocks.png)](/.attachments/e647429b-ec01-5217-fc88-af24f6e8052a600px-TSG_-_Issues_with_Resets_and_Account_Unlocks.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose?**

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/CFA1A237>
  - If the job had failed then check the current status of the Job from the same dashboard
  - If it had succeeded then its an transient issue and can be safely ignored.
  - If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

**Issue:** If the Issue is with the counts (see the following image):

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with Resets and Account Unlocks2.png](/.attachments/7a2dd3a1-b14c-50b6-ad1e-7f5f7c48873a600px-TSG_-_Issues_with_Resets_and_Account_Unlocks2.png)](/.attachments/7a2dd3a1-b14c-50b6-ad1e-7f5f7c48873a600px-TSG_-_Issues_with_Resets_and_Account_Unlocks2.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The time they checked the report in UTC format

**How do we diagnose?**

  - Find the Geography of the tenant
  - Check the dashboard of Databricks job execution for the region <https://jarvis-west.dc.ad.msft.net/dashboard/share/CFA1A237>
  - If the job had failed then check the current status of the Job from the same dashboard
  - If it had succeeded then its an transient issue and can be safely ignored. And we should get this verified with the Customer to Double check.
  - If any failures are identified during that time, then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

If the Job is succeeding and still the counts do not match. Then there is a deeper issue that needs investigation into Audit Event Service:

But for this we would need additional information from the customer:

  - What is the Auth method did they exercise and and what time.
  - What is the status that they saw in the SSPR UX.

Please add this additional information and raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

## TSG - Issues with a particular user's registration status

**Issue:** If any user experiences inaccuracies in their registration status like below:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Issues with a particular user's registration status.png](/.attachments/3d5c282f-af3a-7356-c264-ac2dcefb7871600px-TSG_-_Issues_with_a_particular_user%2527s_registration_status.png)](/.attachments/3d5c282f-af3a-7356-c264-ac2dcefb7871600px-TSG_-_Issues_with_a_particular_user%2527s_registration_status.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Data collection:**

What information we need from the customer?

  - The TenantId
  - The userID
  - The time they checked the report in UTC format

**How do we diagnose?**

  - First thing we need check is the Queue Size for the Incremental processing around the time at which the issue was reported <https://jarvis-west.dc.ad.msft.net/dashboard/share/996F729B> .
  - If the QueueSize is decreasing, we can just ask the Customer to re- check and if the issue persists then raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

## TSG - Something went Wrong

**Issue:** If any user experiences the below in any of the blades:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TSG - Something went Wrong.png](/.attachments/67f4c31d-e909-e5d7-7c49-d1aed2e8bab5600px-TSG_-_Something_went_Wrong.png)](/.attachments/67f4c31d-e909-e5d7-7c49-d1aed2e8bab5600px-TSG_-_Something_went_Wrong.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

This could in most cases, be resolved by retrying. The reason for that is it usually points to throttled resources in our backend.

But if we it does not we need the PG involved.

What information we need from the customer?

  - The TenantId
  - The UTC time at which they checked the report

How do we diagnose?

  - Raise a Incident with the following ICM routing "IDX" & "Reporting and Audit Insights" team.

# Training

Public documentation: Coming soon

Brownbag: <https://performancemanager8.successfactors.com/sf/learning?destUrl=https%3a%2f%2fmicrosoft%2eplateau%2ecom%2flearning%2fuser%2fdeeplink%5fredirect%2ejsp%3flinkId%3dITEM%5fDETAILS%26componentID%3dS4257076%26componentTypeID%3dONLINE%2dCOURSE%26revisionDate%3d1560792240000%26fromSF%3dY&company=microsof01P2>
