---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20%28CIAM%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---
---
Tags:
- cw.Entra
- cw.EntraID
- cw.Entra External ID
- cw.comm-extidmgt
- CIAM
---

[**Tags**](/Tags): [Entra](/Tags/AAD) [EntraID](/Tags/AAD%2DAccount%2DManagement) [Entra External ID](/Tags/AAD%2DDev)
 
[[_TOC_]]

[[_TOSP_]]

# Compliance note
This wiki contains test and/or lab data only.


# Feature overview

Microsoft Entra ID now offers a customer identity access management (CIAM) solution that lets you create secure, customized sign-in experiences for your customer-facing apps and services. With these built-in CIAM features, Entra ID can serve as the identity provider and access management service for your customer scenarios:

- **Microsoft Entra External ID tenant** û Create a tenant specifically for your customer-facing apps and services. Register your customer-facing apps in this tenant, and manage customer identities and access in the dedicated directory.

- **User flows** û Configure sign-up and sign-in user flows that are tailored to your needs. When a customer signs up for your app or service, an account with email + password is created for them in your customer tenant. You can determine the user attributes you want to collect during the sign-up process. User flows determine IDP, credentials formats, etc.  A password credential is only prompted for if the user flow is configured that way, EOTP can be used instead with no password required.


- **Company branding** û Customize the look and feel of your sign-up and sign-in experiences, including both the default experience and the experience for specific browser languages.

# Training Content

| **Name** | **Link**  | **Notes** |
|--|--|--|
| Public Docs | [Public Docs](https://learn.microsoft.com/en-us/entra/external-id/customers/overview-customers-ciam)  |  |
| Public Overview + Demos | [Microsoft Entra External ID CIAM Series - YouTube](https://www.youtube.com/playlist?list=PL3ZTgFEc7Lythpts59O9KOVuEDLWJLLmA)
|CSS Feature Overview | [04159 - Microsoft Entra External ID.mp4](https://microsoft.sharepoint.com/teams/SCIMLearningImprovement/_layouts/15/stream.aspx?id=%2Fteams%2FSCIMLearningImprovement%2FShared%20Documents%2FTraining%2FIdentity%2FDeep%20Dives%2F04159%20%2D%20Microsoft%20Entra%20External%20ID%2F04159%20%2D%20Microsoft%20Entra%20External%20ID%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Eadabec85%2De4d3%2D4dae%2D877e%2D3fe87c67a5a6) |
|CSS CIAM UX Review  | **Deep Dive: 04159 - Microsoft Entra External ID**<br><br>1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.<br>2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.<br>3. Launch the [Deep Dive: 04159 - Microsoft Entra External ID](https://aka.ms/AAl0rxr) course. |  |
| Entra External ID Training Resources | [Entra External ID Training Resources](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1387176/Entra-External-ID-for-Customers-(CIAM)-Training-Resources)


# Case handling

This feature will primarily be supported by the Azure AD Account Management vertical and the [CSS External Identities Community](https://aka.ms/cssextidcommunity) via the following support area paths:


|Scenario  | Supported By | Support Path| PG Escalation |
|--|--|--|--|
| Creating a new CIAM Tenant | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/Tenant Management/Creating a CIAM tenant | CPIM/CIAM-CRI-Triage |
| Deleting a CIAM Tenant | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/Tenant Management/Deleting a CIAM tenant | CPIM/CIAM-CRI-Triage |
| Configuring Company Branding | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/Tenant Management/Custom Branding | CPIM/CIAM-CRI-Triage |
| Setting up User Flows | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/User Flows/User flow setup | CPIM/CIAM-CRI-Triage |
| Configuring User Flow Attributes | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/User Flows/User attributes | CPIM/CIAM-CRI-Triage |
| Configuring User Flow String Customizations | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/User Flows/String customization | CPIM/CIAM-CRI-Triage |
| Integrating existing REST API  via Authentication Extensions for Entra External ID | MSaaS AAD Account Management | Azure/Microsoft Entra External ID/Problem with app or API integration | CPIM/CIAM-CRI-Triage |
| Developing an external REST API to integrate with Entra External ID | 3rd party \ Customer  | n/a | n/a |
| UI-related Issues| ESTS UX | | ESTS/ESTS UX|

<BR>

**NOTE** Entra External Identities (CIAM) tenants use standard MSODS and eSTS core authentication services for everything except external\social identity providers during public preview. So troubleshooting local user authentication and other standard Entra ID features will be supported by the same teams and same support paths that support those features today.  Examples of those scenarios \ support paths are below:

|Scenario  | Supported By | Support Path| PG Escalation |
|--|--|--|--|
| Trouble Authenticating with local credentials | MSaaS AAD Authentication | Azureá/áMicrosoft Entra App Integration and Developmentá/áIssues Signing In to Applicationsá/áMicrosoft applications | ESTS |
| Trouble configuring Application Registrations | MSaaS AAD Applications | Azureá/áMicrosoft Entra App Integration and Developmentá/áApp Registrationsá/áCreating new App registration | |
| Configuring MSAL Applications | MSaaS AAD Developer | Azureá/áMicrosoft Entra App Integration and Developmentá/áDeveloping or Registering apps with Microsoft identity platformá|



Microsoft Entra ID for customers is currently in preview. See [Preview Terms Of Use | Microsoft Azure](https://azure.microsoft.com/support/legal/preview-supplemental-terms) for legal terms that apply to Azure features that are in beta, preview, or otherwise not yet released into general availability.


# Customer communications

Customers may see this and ask about the future of our B2C product. Here is approved messaging we can share:

## Messaging

----

**Start customer messaging:**


AAD B2C Customers û  

You are receiving this notification because you are currently using Azure AD B2C.  We want to provide you with advanced notice that at the upcoming Build Event on May 23rd, we are announcing an early preview of our next generation Microsoft Entra External ID solution. This early preview represents an evolutionary step in unifying secure and engaging experiences across all external identities including partners, customers, citizens, patients and others within a single, integrated platform. 

Please note that there is no action by our current AAD B2C customers required at this time as the next generation platform is currently in early preview only. We remain fully committed to support of your current B2C solution, there are no requirements for B2C customers to migrate at this time and no plans to discontinue the current B2C service.  

 As the next generation platform represents our future for CIAM, we welcome and encourage your participation and feedback during early preview. If youÆre interested in joining early preview, please contact your sales team for details. 

 Lastly, as the next generation platform approaches GA, details will be made available to all our valued B2C customers on available options including migration to the new platform. 

**End customer messaging**

----

## Talking points

- At the upcoming Build Event on May 23rd, we are announcing an early preview of our next generation Microsoft Entra External ID solution. This early preview represents an evolutionary step in unifying secure and engaging experiences across all external identities including partners, customers, citizens, patients and others within a single, integrated platform 

- This early-stage preview enables developers to share important feedback with our product team to shape the new solution prior to GA which is being targeted for early calendar year 2024. 

- There is no action by our current B2C customers required at this time as the next generation platform is currently in early preview only 

  - We remain fully committed to support of your current B2C solution 

  - There are no requirements for customers to migrate at this time and no plans to discontinue our current B2C product 

  - And you can expect continued investment in our B2C solution around resiliency, scale, and security 

- If you are interested in participating in the early preview of our next generation platform, weÆd welcome your participation and feedback and urge you to contact your sales team for more details. 
- As the new solution approaches GA, toward early next year, details will be made available to all our B2C customers on available options including migration to the new platform 

# Licensing

To be determined.


# Risks

Customers are encouraged to test this in a non-production environment during public preview.

# Limitations

## 1. You cannot create a trial if you already have a CIAM tenant

- If you have an existing trial tenant, you must delete it before creating another (see How to delete a trial tenant section above).

-  If you have an existing CIAM tenant linked to an Azure subscription, you can create another CIAM tenant following this documentation: [Create a customer tenant - Microsoft Entra | Microsoft Learn](https://review.learn.microsoft.com/en-us/azure/active-directory/external-identities/customers/how-to-create-customer-tenant-portal?branch=release-preview-ciam)

 

## 2. Max 50 user flows per CIAM tenant

Currently the maximum amount of user flows has been increased from 10 to 50 user flows per CIAM tenant.


## 3. You need to setup security defaults for all tenants including trials

You may see messages like this when you log back into your trial tenant in the Entra admin center or Azure portal:

```tex
Security defaults are enabled to keep your organization secure. Follow the prompts to download and set up the Microsoft Authenticator app to use for multifactor authentication.

```

 This is expected as security defaults are required on all admin accounts, even if they are trials.



## 4. You cannot use your tenant admin account to sign up as a CIAM user

We do not currently prevent this, but in niche cases you can lose admin access to your tenant

[Bug 2470079: Allow discovery of tenant creator during SUSI - Boards (visualstudio.com)](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2470079)

## 5. Identity Protection should not be enabled for EEID tenants 
If customers have an _MFA authentication registration policy_ enabled, users might experience unexpected behavior. For instance, Email/password users may silently be registered for MFA, while Email OTP users will not be able to sign in and will encounter a blank screen.

![image.png](/.attachments/image-fd8eec2e-70d3-4e82-ad00-f810a09d03cc.png)

# Known Issues
##1. Issue with disable sign-up feature
[Epic 2678087](https://dev.azure.com/IdentityDivision/Engineering/_workitems/edit/2678087): As an App Developer, I want to be able to disable sign-up (only allow sign-in) for my application

##2. Disabling of sign-up is not working correctly when home tenant has Alt login id enabled
[Bug 3043172: [ESTS] Local account guest users are redirected to federated login if signup is disabled in userflow and home tenant has Alt login id enabled](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3043172)

IcMs: [511747190](https://portal.microsofticm.com/imp/v5/incidents/details/511747190/summary), [543258106](https://portal.microsofticm.com/imp/v5/incidents/details/543258106/summary), [550148357](https://portal.microsofticm.com/imp/v5/incidents/details/550148357/summary)

##3. Eye icon to show/hide password is only available on Edge browser
Eye icon to show/hide password is available on Edge browser only and supported by native Edge browser. 

Feature: 
[Feature 2812161: Eye icon to hide/show password](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2812161)

## Frequently Asked Questions (FAQ)

You can find the FAQ for the Microsoft Entra External ID feature here - [Entra External ID for Customers (CIAM) - Frequently Asked Questions - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2237331/Entra-External-ID-for-Customers-(CIAM)-Frequently-Asked-Questions)

## Selecting Entra External ID vs. AAD B2C

| **Selecting Entra External ID vs. AAD B2C**                  |                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **What happens to AAD B2C once Entra External ID goes to GA?** | Microsoft does not intend to force a migration or close AAD B2C to new customers in FY24. The resilience and reliability of AAD B2C will continue to be invested in and remain committed to supporting existing AAD B2C customers in production. We expect to begin a formal migration program in **FY25**, with a likely timeframe of 3-5 years. |
| **When should you recommend AAD B2C vs the next generation Microsoft Entra External ID solution?** | **If there is an existing AAD B2C:** <br /><br />Customer has an immediate need to deploy a production ready build customer-facing apps and timing of GA for the next generation platform in early Æ24 doesnÆt work for them. <br /><br />BUT û ensure you inform them that CIAM is coming, so we donÆt lose trust over time.   <br /><br />**If youÆre starting fresh with Entra External ID:** <br /><br />Customer is in earlier stages of product discovery and GA timing for the next generation platform of early Æ24 aligns with their timeline. <br /><br />If a risk of losing to Okta; bring in PM to pitch vision of next gen platform. <br /><br />**OR** <br /><br />They are a strategic customer or have a CxP/GTP human to sponsor them for private preview, and engineering handshakes production-level support prior to GA. |
| **Where will AAD B2C live online post Entra External ID public preview?** | AAD B2C webpage will continue to remain live but delisted in terms of searchability and navigation. This process is to deemphasize starting a new B2C account while highlighting Entra External ID as the new go-to solution. |
| **Why a net new customer would choose Entra External ID over B2C?** | While Microsoft Entra External ID at GA will not have feature parity with competitors or AAD B2C, it has a long term product vision that **addresses and solves** consistent customer pain points from B2C spanning all customer segments (Security, Developer, and Product):  <br /><br />Customer applications are simplified by powerful features like user groups, continuous access evaluation, and conditional access.    <br /><br />All applications benefit from exceptional scale, robustness, and fraud protection built into the authentication platform. <br /> Consistent SDKs, build automation, compliance, and monitoring tools for all B2X applications. <br /><br />Make it simple for architects to design any signup, sign in, or progressive profiling scenario end to end, using the right components from Microsoft Entra / Azure or connecting external components as desired. <br /><br />Continuously reduce the friction for our customersÆ apps to onboard new end-consumers by leveraging latest standards-based innovations in identity, privacy, and authentication.<br /><br />Focus on bottlenecks and drop off points in customersÆ apps so their developers can iterate quickly to reduce end-consumer friction, improve retention/conversion, reduce risk, and improve performance.<br /><br />Surface end-consumer engagement sweet spots so marketers can double down on strengths to increase loyalty and drive growth. |


# How to configure and manage

See [Quickstart - Set up an external tenant free trial - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-trial-setup?branch=release-preview-ciam) for setup instructions.



# Troubleshooting

## ASC Diagnostic Consent

To request access to a customer's External Identity CIAM tenant in ASC, today the customer will need to open a support case from their primary enterprise tenant and follow the same [instructions for how to submit a case with diagnostic consent for an Azure AD B2C Tenant](https://learn.microsoft.com/en-us/azure/active-directory-b2c/find-help-open-support-ticket#how-to-open-a-support-ticket-for-azure-ad-b2c-in-the-azure-portal).  This will be a temporary workaround until customer's can provide diagnostic consent to CIAM tenants directly via External ID support paths.

Work items tracking this request
* [Feature 22546786: Customer Tenants - new support request functionality](https://msazure.visualstudio.com/One/_workitems/edit/22546786)
* [Feature 2632934: [A3] Update Additional detail page during support request creation when opening ticket for CIAM tenant](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2632934)
* [Feature 2641290: [B3] Update ASC "Add Tenant" feature to include CIAM Support Product/SAP ID to allow loading of problematic tenant](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2641290)

## ASC Tenant Explorer \ Tenant Identification

Use ASC Tenant Explorer's Tenant Configuration -> Properties Details that a CIAM tenant has both B2C + **CIAM Enabled = True**

*   ![image.png](/.attachments/image-edc86cc6-97ce-43a5-9d3f-f181180d2110.png =800x)

To verify a CIAM tenant in ASC today you can also use ASC Tenant Explorer's Graph Explorer and a query such as:

```GET /organization?$select=tenantType```


* ![image.png](/.attachments/image-936499f4-1572-4890-bc7b-46f866192668.png =400x)

A CIAM tenant can also be identified by customer providing default sign in URL containing `ciamlogin.com`

## ASC Tenant Graph Explorer Endpoints

   |**Name**| **Graph Endpoint**  | **Screenshot** |
   |--|--|--|
   |[User Flows](https://learn.microsoft.com/en-us/graph/api/identitycontainer-list-authenticationeventsflows?view=graph-rest-beta&tabs=http)  | /identity/authenticationEventsFlows | ![image.png](/.attachments/image-4c634314-2396-4e72-bbdc-b08cf3eb03d4.png =800x) |
   |User Flows Matching Name  |/identity/authenticationEventsFlows?$filter=displayName eq 'MySignUpSignIn' |
   | User Flows Associated to App ID | /identity/authenticationEventsFlows?$filter=microsoft.graph.externalUsersSelfServiceSignUpEventsFlow/conditions/applications/includeApplications/any(appId:appId/appId eq '63856651-13d9-4784-9abf-20758d509e19') | 
   |[Identity Providers](https://learn.microsoft.com/en-us/graph/api/identitycontainer-list-identityproviders?view=graph-rest-beta&tabs=http)  | /identity/identityProviders <br>or <br> /directory/federationConfigurations/graph.samlOrWsFedExternalDomainFederation| ![image.png](/.attachments/image-f3a960a0-c992-4ac7-aca9-6c367e32670c.png =800x)  | 
   | [Application Configured Conditions](https://learn.microsoft.com/en-us/graph/api/authenticationconditionsapplications-list-includeapplications?view=graph-rest-beta&tabs=http) | /identity/authenticationEventsFlows/{authenticationEventsFlow-id}/conditions/applications/includeApplications/ | ![image.png](/.attachments/image-98cb0d00-0cef-4f35-9201-910e8bcb8b13.png =800x) |

## Service Logs

External Identity CIAM tenants use standard MSODS and ESTS services.  To locate authentication logs use [ASC Auth Troubleshooter and ASC Sign In Logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps).   While in public preview, if there is an external\social identity provider involved you will still utilize [CPIM\B2C Kusto Queries](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587764/Azure-AD-B2C-Kusto-Queries) for those specific authentication requests to external identity providers.

### Errors in API calls

- The wizard should display an error and tell you if the error is retriable or not. Non-retriable errors will include a correlation ID that you should include in any bugs.

- Reproduce the issue with browser developer tools open and displaying Fetch/XHR data

- Look for Status = 4xx or 5xx, these are usually highlighted in red.

- Look at the latest $batch requests, these contain multiple API calls, so you will need to expand the response to see all the HTTP status codes (the overall $batch request will have a 2xx status).

### Errors in the login box

- Click the ellipses (à) menu in the bottom right to display debug information to include in bugs

- There is an option to enable flagging which generates more logs if you can reproduce the issue again


## AVA Channel
Assistance with troubleshooting CIAM tenants can be received via [AVA Channel Entra External Identity (CIAM)](https://teams.microsoft.com/l/channel/19%3abd839e956e0347dc8da7bbd05d62873e%40thread.skype/Entra%2520External%2520ID%2520(CIAM)?groupId=56c43627-9135-4509-bfe0-50ebd0e47960&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)


## ICM escalations

All ICMs should be created via Azure Support Center's Escalations feature, and first reviewed by TAs or PTAs. ICM queue: CID TA Triage

If TA/PTA approves and determine that PG engagement is needed, it should be transfer to CPIM/CIAM-CRI-Triage queue. No ICMs should be directly assigned to any other queue.

### For Entra External ID (CIAM) tenant quota increase requests, submit a Sev-3 IcM to CPIM / CIAM-CRI-Triage for approval. 

Provide the mandatory info in the IcM:
*   TenantId
*   New quota limit the customer is requesting
*   Business justification on why additional quota is required

Once it's approved, it will be transferred toá**AAD Distributed Directory Service / QuotaIncreases**.

<hr>


## Known errors and solutions

You can find several errors and solutions described in this wiki page - [Entra External ID Troubleshooting - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2077194/Entra-External-ID-Troubleshooting).


# How to delete a CIAM tenant (Trial)

You can only have one trial tenant per Microsoft Account (MSA), so if you want to test the end-to-end journey more than once, you need to delete the trial tenant first.

1. Go to entra.microsoft.com and you should be on the tenant blade 
2. Click Manage tenants 
3. Select your tenant and click Delete 
4. Work through the checklist and delete your configuration in the tenant 

    a. Delete all users **except your tenant admin** 

    b. Delete all app registrations **including the b2c-extensions-app (found under all applications)**

    Please note it may take several minutes to be displayed due to replication delays. If you don't find it, try portal.azure.com instead.

    c. Get permissions to delete Azure resources (make sure you click save) 

    d. Delete all user flows (**this will never have a green tick** even after you've deleted them all, ignore this) 

5. When everything is deleted, **refresh using the button at the top of the page to enable the Delete button** 
6. Click Delete and wait for the success message 
7. Close the browser (signing out will just get errors) 

# How to delete a CIAM tenant (Production) Error "Get Permission to delete Azure Resources

![image.png](/.attachments/image-5f38ca23-35d6-443a-ba89-cba415d24b6d.png)

**Solution:** 

1. Go to portal.azure.com
2. Locate CIAM resource group under subscription
3. Select Delete

![image.png](/.attachments/image-cb182908-4e1c-4f39-8913-d687dfc2f0f5.png)


# Supportability documentation


## External documentation


Quickstart: Get started with Azure AD for customers (Preview): [Quickstart - Set up an external tenant free trial - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/customers/quickstart-trial-setup?branch=release-preview-ciam)

External trial + guide link: https://aka.ms/ciam-free-trial 

Known issues with Azure Active Directory (Azure AD) for customers: [Known issues in external tenants - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/customers/troubleshooting-known-issues)




## Training sessions and deep dives

[External ID Lab Creation](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2124066/Entra-External-ID-Lab-Creation)

Deep dive: [04159 - Microsoft Entra External ID.mp4](https://microsoft.sharepoint.com/teams/SCIMLearningImprovement/_layouts/15/stream.aspx?id=%2Fteams%2FSCIMLearningImprovement%2FShared%20Documents%2FTraining%2FIdentity%2FDee%20Dives%2F04159%20%2D%20Microsoft%20Entra%20External%20ID%2F04159%20%2D%20Microsoft%20Entra%20External%20ID%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E8feb37b7%2D7ade%2D414f%2Da076%2D753d0cae03a2)

Demo PPT: [CIAM Developer Onboarding Experience - Support Demo.pptx](https://microsoft.sharepoint-df.com/:p:/t/DevExandAppPlatformBU/EULGCVWx9KdGtknOHyMQ4aEBfCZAdd0xGaGgo5gVxGsnGA?e=M0dp9D)

CXP Demos: [Microsoft Entra External ID CIAM Series - YouTube](https://www.youtube.com/playlist?list=PL3ZTgFEc7Lythpts59O9KOVuEDLWJLLmA)

### Deep Dive: 04159 - Microsoft Entra External ID

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 04159 - Microsoft Entra External ID](https://aka.ms/AAl0rxr) course.


