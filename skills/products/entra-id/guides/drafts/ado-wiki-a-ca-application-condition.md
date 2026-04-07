---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/AAD Conditional Access Application Condition"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAAD%20Conditional%20Access%20Application%20Condition"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.Enterpriseapp
- SCIM Identity
- Conditional Access
-  App Selection 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [Application Condition](/Tags/Application-Condition) [Conditional-Access](/Tags/Conditional%2DAccess)

[[_TOC_]]

## Introduction
Conditional Access (CA) is generally about protecting resources and any of the dependent resources. When a client application sends a request to acquire a token to access a specific resource, CA will evaluate all the policies on that tenant and decide whether to issue the token or challenge the user. 

For example, when Outlook client needs access to emails, it will ask for access token from Exchange Online (EXO), which is a resource at the backend.  A conditional access policy that includes EXO in the policys application condition will apply to this request and control user access, e.g., to require MFA.

In some cases, the CA policys application condition is not satisfied and as a result, the policy is not enforced.  Some common causes are: 
- Attempting to include a native client app
- Resource scopes
- Apps which are not a part of the Office 365 app group
- Apps which are not available in the CA app picker
 
## Native Client app
Native apps, like desktop Outlook or the Outlook mobile app, request a token for specific Azure resources such as Microsoft Graph or Exchange Online. In this case, the application condition of CA policy is evaluated against the Azure resources that the application is accessing, not the application itself.  

Therefore, it is by design that CA policy with application condition in the format of **"include / exclude <selected cloud apps>"** will not be applied to token request with scope **User.Read**. More discussion and recommendations can be found in Resource Scopes section of this document.

On the other hand, there are times where the customer's intention is to protect the client application and not the resource. For example, some web apps will request an id_token as opposed to an access_token. In this case, CA only protects clients that are confidential clients and request an id_token. 

The evaluation of application condition of a conditional access policy will include the client application and each of the token audiences. Thus, a conditional access policys condition **include / exclude <selected cloud apps>** will be satisfied because the app id of confidential app is correlated to one of the selected client applications.
 
### Scenario 1 - **include / exclude <selected cloud apps>** condition not working as expected

Customer has a conditional access policy to block access from a native application, but users access via the application is not blocked and the policy does not work as expected.   

In ASC Auth Troubleshooter, CA Diagnostic (New) tab shows the following:

```
Policy Block XYZApp Access (7e014835-c872-4bcc-a919-8b2b0b3b9d6c) 
The user requested a token for Windows Azure Active Directory (00000002-0000-0000-c000-000000000000)
As a result, we evaluated Conditional Access for 1 resource (00000002-0000-0000-c000-000000000000)
This resource was not included in the policy's application condition.
```
 ![CAAppCond-1.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-1.jpg)

### Troubleshooting
If customer selected a native app from the CA app picker instead of the resources the native app calls, conditional access policy with condition **include / exclude <selected cloud apps>** will NOT be satisfied, this is by design.   The request came from a native client, the CA evaluation will be on the resource, i.e., AAD Graph. 

To find out whether the type of a client app is **native** or **confidential**:
1. In ASC Auth Troubleshooter, expand **Expert view**
2. Under **PerRequestLogs**, filter by "**client**"
3. It is a native app if the value of attribute **ClientTypeForConditionalAccess** is "**Native**"

![CAAppCond-2.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-2.jpg)

4. For a confidential app the value of attribute **ClientTypeForConditionalAccess** is **Browser** and the value of attribute **IsConfidentialClient** is **1**
 
![CAAppCond-3.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-3.jpg)


## Resource Scopes
In some cases, the client app in question is not one of the selected apps in the application condition of conditional access policy, in the format of **include all cloud apps and exclude <selected cloud apps>**, thus whether the client type of the app is native or confidential becomes irrelevant.   

The explicitly selected app could make request to MSGraph with scopes, for example, **User.ReadWrite**, **Files.ReadWrite**, and / or **MailboxSettings.Read** on EXO resource.

Conditional access policy was not applied because the request (by the client app) to a resource (for example MS Graph) for basic user information (for example, using scope **User.Read**) is not subject to Conditional Access, meaning that the CA policy in question will not be applied. For example, displaying users own name on a calculator app while running the calculator is not subject to security concerns on resource protection thus CA policy will not apply.  On the contrary, for example, CA policy would apply if token request with scope **Mail.Read** on EXO resource. 

If a customer still wants to invoke CA policy on an explicitly selected app on MS Graph, for example, they could use scope **ServicePrincipalEndpoint.Read.All** to read service principal endpoints which is the least amount of privilege and risk but will force CA to apply. 

Other scenario related to resource scopes is, a V1 endpoint request where the resource is set to Windows Azure Active Directory (00000002-0000-0000-c000-000000000000) for example, a request containing: "/common/oauth2/authorize?resource=00000002-0000-0000-c000-000000000000" . When V1 endpoint request is used with no resource or resource set to Windows Azure Active Directory (00000002-0000-0000-c000-000000000000), only CA policies that explicitly include "All Apps" without any application exclusion will be applied.

The reason for this is because without a proper resource, we do not know for what the OAuth2 Auth Code will be used for. Under such conditions, for a CA to be applicable, customers can:

 1) Create a CA policy to include "All Apps" without any App exclusions. Note that this will potentially affect all access to all apps.

 2) OR Include on the request the id_token on the response_type. E.g.: /common/oauth2/authorize?resource=00000002-0000-0000-c000-000000000000&**response_type=code+id_token**&...
This way, not only the Windows Azure Active Directory (00000002-0000-0000-c000-000000000000) will be included as audience, as well as the Client App ID, so, any CA policy that includes such Client App ID will be applicable. Note that when id_token is used, nonce parameter must also be present, as explained [here](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc#send-the-sign-in-request).
This approach can only be used when the Customer owns the App code and can perform the changes accordingly.

 3) OR Migrate the App's code to use V2 Endpoint and scopes that can be used to apply CA policies that do not need to target "All Apps" without App exclusions. This approach can only be used when the Customer owns the App code and can perform the changes accordingly.

For more reading on troubleshooting MS Graph scopes, see [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/449101/Azure-AD-Conditional-Access-MS-Graph-Scopes)

For more information on scopes, refer to Microsoft public document [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#scopes-and-permissions)

### Scenario 2 - **include all cloud apps and exclude <selected cloud apps>** condition not working as expected

In this case, the client app in question was not one of the selected apps in CA policys application condition, thus the expected behavior is that the client app should be blocked, but its not working as expected because the CA policy was not applied.  

### Troubleshooting
In ASC Auth Troubleshooter, under **CA Diagnostic (New)** as shown below, the CA policy in question was not applied even though the client app requested a token for resource **Windows Azure Active Directory** (00000002-0000-0000-c000-000000000000), but the resource was excluded by the CA policys application condition.
 
![CAAppCond-4.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-4.jpg)

Under **PerRequestLogs** as shown below, a request to AAD Graph for user related AAD Graph scope **User.Read** is excluded from the CA policy in question.
To find out scope information of a request:
1.	In ASC Auth Troubleshooter, expand **Expert view**
2.	Under **PerRequestLogs**, filter by **scope**
 
![CAAppCond-5.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-5.jpg)

In Logsminer:
 
![CAAppCond-6.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-6.jpg)
 
## Office 365 App Group
Many Office 365 applications, like Microsoft Teams, have dependencies on other Office 365 applications. These dependencies cause organizations to struggle with policy enforcement. For example, a user signing into Microsoft Teams may find their sign-in is impacted by a conditional access policy that specifically targets SharePoint Online.

Office 365 application group consists of all Office 365 applications in a single application group, which appears in the Conditional Access application picker as Office 365. Customers can target all Office 365 applications in a single conditional access policy.
For more reading on Office 365 app group, see [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/219000/Azure-AD-Conditional-Access-Office-365-app-group)

### Scenario 3 - **include all cloud apps and exclude Office365** condition not working as expected
 
Outlook mail app is included in Office 365 app group. The issue is that although CA application condition excludes Office 365 app group, the CA policy was still applied to a client request from Outlook mail app unexpectedly. 

### Troubleshooting
In ASC Auth Troubleshooter, under **CA Diagnostic (New)** as shown below, the CA policy in question was applied because the users request via Outlook mail app was asking for a token from **Cortana Runtime Service** (81473081-50b9-469a-b9d8-303109583ecb), and **Cortana Runtime Service** is not included in Office 365 applications group.  Thus, this CA policy is working by design.  

![CAAppCond-7.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-7.jpg)

This would be out-of-scope for AAD support. The recommended approach is to engage the OL mail app team. The OL team would then need to work with their PG to determine why Cortana is called and if Cortana needs to be incorporated in to the O365 app group since it would be a dependency of this scenario. 	 

For a complete list of Office 365 applications in Office 365 app group, refer to [here](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/reference-office-365-application-contents)

## On-Behalf-Of (OBO) Flow
Microsoft Azure Active Directory supports an [OAuth2 protocol extension](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-oapx/6bd31cd1-1ebf-4eef-9a12-5e3165522c3e) called the On-Behalf-Of flow (OBO flow).  For more information, refer to [Microsoft identity platform and OAuth2.0 On-Behalf-Of flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow). 

The OBO flow is used in the following scenario where both Web API 1 and Web API 2 are protected by Azure AD.

**Figure** 4 ![OBO Flow Diagram.png](/.attachments/AAD-Authentication/619316/OBO%20Flow%20Diagram.png)

1. A client application (could be a SPA, a front-end Web Application, or a native application) signs a user into Azure AD and requests a delegated access token for Web API 1
2. The client application then calls Web API 1 with the issued access token
3. Web API 1 in turn needs to call a downstream Web API 2, so it will use the user's access token (from step 2) to request an access token for Web API 2. This involves Web API 1 using the **On-Behalf-Of flow** to exchange the user's access token for access to another resource, "on behalf of" the user. The new token is still issued for the original user, but it has delegated permissions.
4. Web API 1 uses the new access token to call Web API 2
5. Potentially repeat steps 3 and 4 for additional downstream resources (Web API 3, etc)

### Use case 1

End user navigating within Office Portal (Web API 1) which in turn needs to call Azure Resource Management (Web API 2)

### Use case 2

Customer tenant administrator trying to load Azure Workbook in the Azure Portal 

### Scenario 4  "Conditional access policy applied unexpectedly due to OBO flow execution"

As shown in Figure 4, at Step 3, if an error occurred when Web API 1 uses the OBO flow to exchange its access token for another resources access token (e.g., Web API 2), Web API 1 will then send a request to the client to get a new token, and at this time to run CA with extra parameters as the following, for example: 

```
"claims":"{\"access_token\":{\"polids\":{\"essential\":true,\"values\":[\"9ab03e19-ed42-4168-b6b7-7001fb3e933a\"]}}}"
```

These parameters will force CA to ignore applications condition because we need to run policies which apply to Web App 2 which will come in the future OBO call from Web App 1. 

The detailed flow is shown in Figure 5 below. During the call from Web API 1 to Web API 2, an error can occur due to Conditional Access policies that request MFA or block access to Web API 2. In this case, Entra ID returns a CA error that contains the claims parameter above. As the error occurred during a service to service call, there is no way for Entra ID to show an UX to the user at this time. The client app then sends a new authorize (interactive) request to Entra ID starting the entire process with the given claims parameter. This time, CA evaluates the claims parameter during the interactive sign-in. CA intentionally ignores application condition here with the given claims parameter. This results in the sign-in failure or MFA prompt, and an appropriate message is shown to the user. Ignoring the application condition is needed to show the UX to the user. Otherwise, the client application and user have no idea why backend call to Web API 2 failed and falls into a loop.

**Figure** 5 ![OBO-Flow-Diagram-WithMFARequirement.png](/.attachments/AAD-Authentication/619316/OBO-Flow-Diagram-WithMFARequirement.png)

For use case 2, Azure portal Workbooks calls some middle tier service, which surfaced an error indicating it needs those policies satisfied, which triggers evaluation of some CA policies explicitly requested via the OBO flow. By design, the application condition (included or excluded) will be ignored for those policies, since Azure portal Workbooks needs to satisfy them for the middle tier call to succeed.

### Troubleshooting

1.	Check STS logs (via ASC Authenticator Troubleshooter or Logsminer), under **CA Diagnostic (New)** tab, the following verbiage stated that the application condition is ignored due to OBO flow and thus the CA policy applied.

![TSG4_1.png](/.attachments/AAD-Authentication/619316/TSG4_1.png)

2.	Under **Logs** tab (of Logsminer) or under **Diagnostic Logs** tab of Auth Troubleshooter, search for **claims** as below for example, the enforced policy with id shows the CA policy ID that is required to be applied.

![TSG4_2.png](/.attachments/AAD-Authentication/619316/TSG4_2.png)

3.	We can also see what the Web API 2 was by expanding the timeframe for the authentication for the user in logs miner by 15 mins and looking for the call which failed. 

![TSG4_3.png](/.attachments/AAD-Authentication/619316/TSG4_3.png)

After verified the above steps, it usually means Conditional Access is working by design. 

If the question is about the user being blocked, the likely cause is Web API 1 not communicating both the error and "claims" it received from AAD error message back to client app to start a new authentication request. Further investigation should start with the owner team of Web API 1 and/or the client app in question.


## Conditional Access App Picker
Conditional access app picker (as shown below) is a tool within conditional access policy builder that administrator can select cloud apps to construct application condition on Azure portal.  Most of cloud apps in the app picker are first-party apps to which a client application will request for access_token.

![CAAppCond-8.jpg](/.attachments/AAD-Authentication/619316/CAAppCond-8.jpg)

Utilizing the CA policy builder and the app picker is one common approach to build and manage CA policies manually on the Azure portal. 

There are other ways to build and manage CA policies such as programmatically using the Microsoft Graph APIs.   For more information, see [here](https://docs.microsoft.com/en-us/graph/api/resources/conditionalaccesspolicy?view=graph-rest-1.0)

>Since Conditional Access policy sets the requirements for accessing a service you are not able to apply it to a client (public/native) application. That is why client (public/native) applications are not available for selection in the Cloud Apps picker and Conditional Access option is not available in the application settings for the client (public/native) application registered in your tenant.

### Checking if a given App Registration is a Public Client
This is expected if the application is a Public/Native Client application. We can confirm this by checking the Platforms being used in the [App Registration's Authentication blade](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app#configure-platform-settings):

![App Registration page](/.attachments/AAD-Authentication/619316/AppRegPage.png) 

- App registrations with _Mobile/Desktop application_ redirect URIs  or _Single-page application_ redirect URIs are considered Public Clients and will not show up in the CA App Picker
- In order for the app to be displayed in the CA Picker, it needs to have a Redirect URI of type _Web_ - when this redirect URI is used, the application is considered a _Confidential Client_.

>**Disclaimer**:
>Please take into consideration that the guidance provided above is an internal guidance and shouldn't be shared in its entirety with the customer.
>Also consider that the customer could have different understanding/comprehension on the terms used. So, do not advise customers to make any changes on their App (at any level) in order to allow the App to be available in the CA picker. On the customer scenario, if the applications were developed and designed to be Public/Native or Confidential Client, there must have been a reason and suggesting changes to the app can lead to other issues and concerns.

Alternatively, we can check this using ASC's Graph Explorer, by running the following query:

> /applications(appid='{appId}')

![ASC Graph Explorer](/.attachments/AAD-Authentication/619316/GraphExplorer.png)

- Check the "web" object. If the redirectUris property is empty, the application does not have a Web App redirect URI configured and will not show up in the app picker. 

  
### Checklist for app onboarding to AAD Conditional Access 

Previously, to have a First Party (1P) application onboarded on Conditional Access (CA) for it to be available in the CA apps picker, it was needed to fill a form to request the onboarding. However, as part of [Epic 2618021 [SFI] As an IT admin, I want to exclude any 1p app from my conditional access policy](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2618021), we are moving away from the previous onboarding process that we used to have for 1P apps.

What does that mean?
1.  Customers will be able to target (include/exclude) any 1P app that is provisioned in the tenant in their CA policies (i.e. the service principal for that app must exist). Notable exception: MS Graph.

2.  Manual onboarding (which is what the form was for) wouldnt be needed anymore.

Public documentation will highlight the following:

1.  Administrators can assign a Conditional Access policy to cloud apps from Microsoft as long as the service principal appears in their tenant. Some apps like [Office 365](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#office-365) and [Windows Azure Service Management API](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps#windows-azure-service-management-api) include multiple related child apps or services. When new supported Microsoft cloud applications are created, they appear in the app picker list.

2.  Some applications don't appear in the picker at all. The only way to include these applications in a Conditional Access policy is to include**All resources (formerly 'All cloud apps')** or add the missing service principal using the [New-MgServicePrincipal](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgserviceprincipal) PowerShell cmdlet.

## Conditional Access Policy Failure Due to Scope Format
### Issue Summary
A customer encountered Conditional Access (CA) policy failures when requesting tokens using scopes formatted as either:
- `api://<app id>/.default`
- `spn:<app id>/.default`
```code
e.g.. api://0ab44538-2f18-44f1-a3bf-e69e129ec68c/.default profile openid offline_access
```
These formats caused the CA engine to fail in resolving the correct service principal (SP), resulting in a fallback to a null GUID (`00000000-0000-0000-0000-000000000000`) in the CA audience. This led to unintended policy enforcement and access blocks.

ICM opened [682472879](https://portal.microsofticm.com/imp/v5/incidents/details/682472879/summary)
### Resolution
The issue was resolved by switching to a **GUID-based scope format**:
```
<app id>/.default
```

This format allowed the CA engine to correctly identify the SP and apply policies as expected. 

### Key Findings 
- The `api://` and `spn:` prefixes interfered with CA evaluation logic. 
- Using the raw GUID (`<app id>/.default`) bypassed the fallback behavior and resolved the null SP issue. 
- This fix was validated through successful sign-in attempts and CA policy evaluations. 

### Recommendation 
When configuring scopes for token requests in environments with Conditional Access policies, prefer using the **GUID-based scope format** (`<app id>/.default`) to ensure proper SP resolution and policy application.
