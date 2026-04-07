---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Reporting Change History"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Reporting%20Change%20History"
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
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

# April 2025  
##Classifying FIDO Sign-Ins: On-Behalf-Of (OBO) and Interactive  
FIDO-related calls that are performed On-Behalf-Of (OBO) will be recorded as non-interactive sign-ins, whereas FIDO calls that involve direct user interaction will be recorded as interactive sign-ins.

# May 2024
## Authentication Details in a Sign-In event will now show Passkey instead of FIDO2 security key
This is due to a change that was made on the ESTS side.

![image.png](/.attachments/image-7bfd472c-a8cd-4202-922d-f710d3ee7064.png)

- Related CRI: https://portal.microsofticm.com/imp/v3/incidents/incident/506448233/summary
- Feature: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2698955

---

#April 2024
##Service principal sign-ins publishing logs for 3P apps authenticating to 1P resources
After some learnings from a security incident, the Reporting team decided to start publishing logs for 3P apps authenticating to 1P resources. Due to the fact that these 1P applications can issue tokens to customer's tenant, they believe customers would appreciate and benefit from this effort to increase transparency and visibility. The team conducted analysis that analyzed the change in log volume, which they concluded was not very substantial for the average tenant. 

A few customers noticed service principal sign-in logs for _Bot Framework_ resource in these ICMs:
- https://portal.microsofticm.com/imp/v3/incidents/incident/490728355/summary
- https://portal.microsofticm.com/imp/v3/incidents/incident/504180323/summary

##PIM Audit Logs
The operationTypes for PIM audit logs have been updated as follows: <br>
- _RequestApprovalRoleActivation_ and _ActivateRole_ are now categorized under the _Update_ operationType. <br>
- _CreateRequestRoleActivation_ is now categorized under the _Create_ operationType.

![image.png](/.attachments/image-26eb0f7c-71ee-4904-92cf-10dfe92984b1.png)

_IcM_: https://portal.microsofticm.com/imp/v5/incidents/details/506108801/summary

---
#July 2023
##Authentication methods reporting API is now GA!

The auth methods reporting API provides information about the authentication methods registered by each user in the tenant. This API powers the authentication methods reporting UX that helps customers understand the adoption of Multi-Factor Authentication (MFA), self-service password reset (SSPR) and Passwordless authentication in their organization.

Sample request and response:

```
GET https://graph.microsoft.com/v1.0/reports/authenticationMethods/userRegistrationDetails

{
    "@odata.context": https://graph.microsoft.com/v1.0/$metadata#reports/authenticationMethods/userRegistrationDetails,
    "value": [
        {
            "id": "f7ca74b0-8562-4083-b66c-0476f942cfd0",
            "userPrincipalName": jdoe@contoso.com,
            "userDisplayName": "John Doe",
            "userType": "member",
            "isAdmin": true,
            "isSsprRegistered": true,
            "isSsprEnabled": true,
            "isSsprCapable": true,
            "isMfaRegistered": true,
            "isMfaCapable": true,
            "isPasswordlessCapable": false,
            "methodsRegistered": [
                "microsoftAuthenticatorPasswordless",
                "microsoftAuthenticatorPush",
                "softwareOneTimePasscode"
            ],
            "isSystemPreferredAuthenticationMethodEnabled": false,
            "systemPreferredAuthenticationMethods": [],
            "userPreferredMethodForSecondaryAuthentication": "push",
            "lastUpdatedDateTime": "2023-07-11T23:30:07.8776754Z"
        }
    ]
}
```

###Other enhancements to the authentication methods reports:

Based on customer feedback, we have also made the following enhancements to the authentication methods reports:
-	Added the �Last updated by� field to indicate the latest sync time for each user�s registered methods
-	Added the �Failure reason� column on the registration and reset events blade to indicate why an authentication method registration attempt failed
-	Performance and throttling improvements

**Figure 1 User registration details UX**
![image.png](/.attachments/image-73390de4-b51e-400e-9e16-e49f010295ab.png)

**Figure 2 Registration and reset events UX**
![image.png](/.attachments/image-c3c33690-3a47-4ee4-9e40-a45738590f54.png)

## CA Overusage dashboard for Entra ID/Azure AD

This dashboard allows customers to see how many Azure AD P1 licenses they have, as well as how many P1 licenses they are consuming through CA configuration. This view is an early step toward helping customers understand their license count and license usage, as well as helping them resolve overusage issues that arise in their tenants. 

The Engineering team started this dashboard project with CA usage because CA is almost always the most used Azure AD P1 feature�if a customer has enough licenses for their CA usage, it�s a directional indication that their license levels for Azure AD P1 are aligned with their consumption. To see the dashboard in a test tenant, visit this link: https://ms.portal.azure.com/?Microsoft_AAD_IAM_licenseUtilizationEnabled=true%2F#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/License%20Utilization

![image.png](/.attachments/image-c12efed3-c3dc-4e9c-ada1-c94a5bf53a73.png)

In future iterations, the Engineering team will add more features and more license types to give customers a better view of their usage and potential overusage. 

---

# April 2023
##SignInActivity is now in GA!
Customers can now use signInActivity (also known as �last sign in time�) in GA! It is now in GA in both public and US Gov.

There may be the need to generate a report of the last sign in date of all users, if so you can use the following scenario. 
**Last Sign In Date and Time for All Users**: In this scenario, you request a list of all users, and the last lastSignInDateTime for each respective user: `https://graph.microsoft.com/v1.0/users?$select=displayName,signInActivity`. 

_Public documentation_: [How to detect inactive user accounts](https://learn.microsoft.com/en-us/azure/active-directory/reports-monitoring/howto-manage-inactive-user-accounts#how-to-detect-inactive-user-accounts)

---
# March 2023

## Microsoft Graph Activity Logs

[Microsoft Graph Activity Logs public preview](https://learn.microsoft.com/en-us/graph/microsoft-graph-activity-logs-overview) is slated to begin on October 13, 2023, with the rollout completing on October 20, 2023. 

Until now, administrators for Microsoft Entra, Azure, and M365 have not been able to view data requests that are processed by the Microsoft Graph platform for their tenants. This lack of insight left organizations exposed to potential attacks from applications, data leaks, and other governance weaknesses.

**Microsoft Graph Activity Logs** is a new data pipeline that enables administrators to configure a collection of Microsoft Graph HTTP logs requests just as they may do today for Microsoft Entra ID `AuditLogs` and `SignInLogs.

The `MicrosoftGraphActivityLogs` diagnostic setting category allows customers to query for security anomalies and diagnose or investigate Microsoft Graph API issues occurring within their tenant using the Log Analytics experience. Microsoft Graph Activity Logs leverages Azure Monitor integration for export data to Azure Monitor Logs, EventHubs to 3P SIEM (security information and event management) tools, or Azure Storage for long-term archiving.

**Configure Microsoft Graph Activity Logs**

1. Navigate to [Diagnostic Settings](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/DiagnosticSettings) in the Microsoft Entra ID portal.
2. Click the **+ Add diagnostic setting** link.
3. Enter a **Diagnostic setting name**. 
4. Place a check next to **MicrosoftGraphActivityLogs**
5. Under **Destination details** configure one of the following locations to store the logs:

- **Send to Log Analytics workspace**
- **Archive to a storage account**
- **Stream to an event hub**
- **Send to partner solution**

6. Click **Save**.

![ConfigGraphDiag](/.attachments/AAD-Account-Management/468524/ConfigGraphDiag.jpg)

**Query MicrosoftGraphActivityLogs**

This is a short list of some investigative scenarios that can be performed by querying the new MicrosoftGraphActivityLog diagnostic setting category with [Log Analytics](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Logs):

- Use behavioral analytics, anomaly detection, or other query-based analysis to identify potential threats or suspicious activity
- Investigate blast radius of a known incident, or forensically investigate activity in cases of known compromise
- Audit usage of permissions by an application

![QueryUserActivity](/.attachments/AAD-Account-Management/468524/QueryUserActivity.jpg)

```
MicrosoftGraphActivityLogs
| where TimeGenerated > ago(3d)
| where RequestUri contains "/user"
| where isnotempty(ServicePrincipalId)
| project TimeGenerated, AppId, IpAddress, ServicePrincipalId, RequestMethod, RequestUri, ResponseStatusCode, Roles, Scopes
```

### Known Issues

#### Issue 1: Graph logs don't join with SignInLogs

A popular use case for the Graph Activity Log is to join it with the SignInLog table. This allows organizations to cross reference the token issued with the Graph activity that has been conducted. This can be done using the following query:

```json
MicrosoftGraphActivityLogs
| where TimeGenerated > ago(8d)
| extend ObjectId = iff(isempty( UserId),ServicePrincipalId, UserId)
| extend ObjectType = iff(isempty( UserId),"ServicePrincipalId", "UserId")
| summarize by ObjectType, ObjectId, SignInActivityId
| join kind=leftouter (union SigninLogs, AADNonInteractiveUserSignInLogs, AADServicePrincipalSignInLogs, AADManagedIdentitySignInLogs, ADFSSignInLogs
    | where TimeGenerated > ago(15d)
    | summarize arg_max(TimeGenerated, *) by UniqueTokenIdentifier
    )
    on $left.SignInActivityId == $right.UniqueTokenIdentifier
| project-reorder ObjectType, UserPrincipalName,ObjectId, SignInActivityId, Category
```

However, there is a known issue where a lot of the Graph Activity Logs don't have matching entries in any of the sign in tables. The missing entries are due to ESTS being dropped because they are from 1P app traffic.

This is by design, not a bug. ESTS does not drop these logs, ALP does (so IDFire, etc. still gets these). Microsoft does not share 1P app-only logs (not delegated) to customers. This is based on feedback from our private preview and public preview from customers, they did NOT want to pay to have these logs in their Azure Monitor. It additionally has caused a lot of confusion for customers to see what 1st Party applications are calling to do internal things, that we really do not want to create confusion over. 

___

# January 2023

##The [signInActivity](https://docs.microsoft.com/en-us/graph/api/resources/signinactivity?view=graph-rest-beta&preserve-view=true) Graph API endpoint ****graph.microsoft.us**/**beta**/users?$filter=signInActivity/lastSignInDateTime** is now available in US Gov environment.  

SignInActivity is only available in beta in both public and US Gov.

___

# March 2022

Customer-facing SLA performance doc coming soon!

We�re ready to publish an update to the public docs ready that shows our Azure AD SLA performance for all tenants for the last year: [Azure Active Directory SLA performance](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Freview.docs.microsoft.com%2Fen-us%2Fazure%2Factive-directory%2Freports-monitoring%2Freference-azure-ad-sla-performance-new%3Fbranch%3Dpr-en-us-192065&data=04%7C01%7Cbernaw%40microsoft.com%7Cc4cd36fff7654d99cdaf08da11049757%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637841008679639518%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000&sdata=YbAG5xSWex9WgIFST5TOzOWlNRlBAy7SHuQqSstG7K4%3D&reserved=0). Ben Siler covers some commonly asked questions in the details below, but please let him or Corissa Koopmans know if you need more info!

The actual performance numbers are below:

## Why not publish more details about when the SLA telemetry, calculation, etc.? 

We had the initial inclination to publish a detailed description for months (such as March) when we have to supplement our telemetry with historical comparisons to provide a better estimate of impact. This description would have gone deep into the SLA calculation, SLA telemetry, and what went wrong in any given instance. However, conversations with customer admins pointed out that they prioritize a simple view with no annotations they can use with stakeholders who know little about Azure AD or identity in general. 

-	Motorola: �Please keep it simple. I only want to see a number that represents the effects on my environment.�
-	Morgan Stanley: �I did not want to risk the validity of all the numbers [when I shared with stakeholders] based on a question mark around March [�] I would say option 2b [adding a note explaining issues with telemetry] is not viable.�
-	Metlife: �Publish best available data and update if needed as more refined data points become available.� 

___

## What happens if SLA telemetry doesn't accurate capture customer impact?

-	The observability v team will identify months with likely issues by monitoring ESTS and GW incidents 
-	When an incident occurs that is not accurately reflected in SLA telemetry, we will use historical data to estimate the impact on �missing� user authentications. This is the same approach we use today to estimate impact of events without telemetry
-	We will publish the estimate number without annotations to the global page to reflect our best understanding of SLA attainment

___

# February 2022

##We have a new passwordless feature that will turn on later this month. When that happens, customers will start seeing User IDs in the username field much more often as part of these passwordless sign-ins. This is as expected. To check if the sign-in is due to this feature, the _authenticationDetail_ will say _passwordless_.

___

# November 2021

##We are no longer publishing sign-in logs with the following error codes because they're pre-authentication events (before ESTS has authenticated the user, and sometimes before the user is even associated with the correct tenant). These logs confused customers, who thought of them as sign-in events. If a user continues on and signs in after these pre-authn events, the user sign-in will show up in the logs. Customers can't search these error codes any longer via the API either if they are within the last month. 

| **Error code** | **Failure reason** |
|--|--|
| 50058  |Session information is not sufficient for single-sign-on.  |
| 16000 | Either multiple user identities are available for the current request or selected account is not supported for the scenario. |
| 500581 | Rendering JavaScript. Fetching sessions for single-sign-on on V2 with prompt=none requires javascript to verify if any MSA accounts are signed in. |
| 81012 | The user trying to sign in to Azure AD is different from the user signed into the device.|

___

# October 2021

## New throttling limit for Azure AD reporting APIs

Beginning **Oct 11, 2021**, the Azure AD reporting APIs will throttle requests if a tenant/app/API triad exceeds 60 requests per minute (RPM). In other words, if a customer tenant has an app that calls a single Azure AD reporting API more than 60 times per minute, that app will be throttled for that tenant. Going forward, the Azure AD engineering team will continue to adjust our API limits to ensure that customers get low latency, consistent responses when querying our API. These throttling adjustments will ensure that Azure Portal UX, customer apps, and customer scripts run quickly and with few retried queries. 

We expect that more than 99% of Azure AD customers will not notice any change due to this policy; even the largest organizations rarely have apps that call Azure AD reporting APIs more than 60 times per minute. 

###Timeline and additional changes
The Azure AD engineering team expects to make additional changes to our throttling limits to protect customer experience. We plan to make incremental changes to the API limit for tenant/app/API triads weekly. Proceeding slowly with incremental changes will help ensure that we do not affect customer experience. 

###Affected ISVs and tenants
Only the apps that make many requests to Azure AD will be affected by this change. The majority of customers, even large customers, do not have apps that make enough calls to Azure AD reporting APIs to be affected by this change. 

The list of tenants and apps that we expect to be affected is [here](https://nam06.safelinks.protection.outlook.com/ap/x-59584e83/?url=https%3A%2F%2Fmicrosoft.sharepoint.com%2F%3Ax%3A%2Ft%2FIDXCOGS%2FEaIi3GzD4mRHnkFtF3RIiLgBRWCHl0SicBF0fkrtvW4LtA%3Fe%3DpDZk7n&data=04%7C01%7Cbernaw%40microsoft.com%7Cf91e08a865054997349008d98a93f251%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C637693190924964661%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=TsHQA45E78S%2FvWopCa0eZCWBPa5UgZz%2BgZqjSB4CN%2BI%3D&reserved=0   ).

___

# September 2021

##IP addresses for CSP (Partner) sign-ins in the resource tenant and for sign-ins ending in error codes 16000 or 50058 will be redacted to protect home tenant PII. 

For example:

![ActivityDetailsSI](/.attachments/AAD-Account-Management/468524/ActivityDetailsSI.png)

**Note:** These signIns have a lot of the PII masked besides IP - the userPrincipalName is "homeTenantName technician" instead of the real UPN, etc. 

_Public documentation_: https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/reports-faq#i-see--xxx-in-part-of-the-ip-address-from-a-user-in-my-sign-in-logs--why-is-that-happening-


___

# April 2021

##Properties that are added to Sign-ins from the last couple quarters

-  UserType
- AuthenticationRequirementPolicies
- flaggedForReview
- homeTenantId
- Network Named Locations for ESTS signIns
- include and exclude match rules in appliedConditionalAccessPolicies
- New risk type "Azure AD Threat Intel"
 
___

# March 2021

##For guest user sign-ins, the device ID and display Name have been removed from resource tenant due to privacy implications.

![PIIRemoved](/.attachments/AAD-Account-Management/468524/PIIRemoved.png)
