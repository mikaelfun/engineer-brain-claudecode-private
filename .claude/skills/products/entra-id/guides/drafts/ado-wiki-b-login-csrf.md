---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Login CSRF"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FLogin%20CSRF"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Workflow
- ESTS
- AADSTSerror
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) 


<span style="color:red">**IMPORTANT**</span>: If AG Insurance contacts Customer Support about Login CSRF issues, they should be escalated directly to the Program Manager, Nick Ludwig.

Once deployed, federated sign-ins involving auto-acceleration/smartlinks will provide the user with an opportunity to confirm the tenant in which they're signing in to. In addition, the [Configure sign-in behavior using Home Realm Discovery](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-authentication-for-federated-users-portal?pivots=graph-hrd) document was updated with information about the cookie that is dropped when the domain confirmation dialog is completed, and the impact of clearing cookies.

If the public document is not updated in time, the PG has this document that can be provided as explanation: [Domain Confirmation Dialog overview](https://microsoft.sharepoint.com/:w:/t/ASIMLearningImprovement/ESN2BHtRNuNIoQegRQn2YpQBTM6zsZyFV9MX2M9oDqNeFg?e=cAAlF9)


[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

The [Microsoft Security Response Center](https://www.microsoft.com/en-us/msrc) (MSRC) will introduce a fix that bolsters protections against Login Cross Site Request Forgery (CSRF) attacks.

In a login CSRF attack, the attacker uses the victim's browser to forge a cross-site request to the honest site’s login URL, supplying the attacker's username and password. 

Currently there are no known CSRF vectors, reported, or theorized, that would allow an attacker to get access to a victim's account in Entra ID. In a login CSRF attack, the attacker uses the victim's browser to forge a cross-site request to the honest site’s login URL, supplying the attacker's username and password. These types of attacks give the attacker access to:

- The user's search history during the active session 
- Any files uploaded during the active session

**IMPORTANT**: Since the account being signed in to is owned by the attacker, there is no risk of the attacker taking over a user's account or gaining information about the user's home tenant.

This change will also take place in Fairfax, GCCH, and USGov.

**Note**: The terms speedbump and domain confirmation dialog refer to the same screen. 

___

# How the Fix Works

| :exclamation:  <span style="color:red">**IMPORTANT**</span>: This section is internal **only** and should not be discussed with customers. |
|-----------------------------------------|

The fix that is being proactively introduces CSRF validation into the interactive Sign-in experience by dropping a CSRF double submit cookie at session instantiation. This occurs when the user visits the Azure Active Directory Sign-in page. After completing Sign-in, and upon redirection back to Entra ID, the value of the CSRF double submit cookie attached to the response is checked to verify it matches what is stored in Entra ID. If CSRF validation fails for one of the protected endpoints, there is high certainty that it is the result of a CSRF attack, and a fatal error will be thrown.

Once the federated user clicks **Confirm** to the initial speedbump, a persistent cookie will be dropped on the client to allow future auto-accelerations to be seamless.

This fix allows three potential attributes assigned to be assigned the `/processAuth`, `/kmsi`, `/login.srf` and `/logout.srf` endpoints. Each of these attributes determine how CSRF protection is performed:

- **IgnoreCSRFTokenValidation** – This is assigned to endpoints for which CSRF validation does not need to occur.
- **EnforceCanaryValidation** – Endpoints assigned this attribute will be subject to CSRF enforcement. If validation fails, a fatal error will be thrown.
- **DelayCanaryValidation** – Endpoints assigned this attribute will be subject to CSRF enforcement. If validation fails, an interactive Sign-in speedbump will be shown instead of a fatal error.

**IMPORTANT**: No customer action is required. Sign-ins will continue to work seamlessly in most scenarios. However, there are two scenarios where behavior changes can be expected. See [Impacted Scenarios](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=impacted-scenarios) below for more information.

___

# Impacted Scenarios

## Scenario 1 - Federated Sign-ins using auto-acceleration or SmartLinks

Federated customers using auto-acceleration or SmartLink Sign-in flows will experience a speedbump injected into their previously seamless Sign-in experience. For more information on these Sign-in flows, see [Speedbump Federated Sign-in flows](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=speedbump-federated-sign-in-flows) below. Both Sign-in flows start on their own Sign-in user experience (UX) and then redirect back to Entra ID’s Sign-in experience. These flows deny Entra ID the opportunity of dropping a double submit cookie at session instantiation. Introducing a speedbump allows Microsoft to accurately enforce CSRF protections for the `login.srf`/`logout.srf` endpoints.

**Note**: Auto-acceleration and Smart link authentication flows are commonly used in federated scenarios. Together they account for 7-8% of all federated Sign-ins performed by our customers.

The speedbump that is shown post-authentication accomplishes two things:

1.	It provides the user an opportunity to confirm their Sign-In intention by verifying the tenant domain that appears on the UX speedbump. During a Login CSRF attack the tenant domain would not show a recognizable value and the user would know they did not initiate the flow and the user would click **Cancel**. The domain listed is the domain of the tenant in which the account is homed. 

2.	It also provides Entra ID the opportunity to drop a persistent cookie once the user clicks **Confirm**. This allows future auto-accelerations to be seamless using that client app.

For a legitimate sign-in, the top identifier (kelly@contoso.com) represents the sign-in identifier entered by the individual. Displaying this in Entra ID UX is current behavior and not something being added as part of the introduction of this new dialog. The domain listed in the H1 and H2 represents the domain of the tenant where the account (kelly@contoso.com) is homed. 

![NewSpeedbump](/.attachments/AAD-Authentication/820230/NewSpeedbump.jpg)

In the case of a Login CSRF attack, where the real account is subverted into trying to sign-in to the attacker's account, the top identifier would simply show a different account name than the one the user used to sign-in with while the domains listed in the H1 and H2 would be the attacker's tenant. In this situation the user should click **Cancel**.

**Note**: One caveat to this is when an organization uses Alternate Sign-in ID. While the vast majority of organizations use the user's `userPrincipalName` (UPN) as the account identifier, a small subset or organizations do not. UPNs are in the form of `<name>@<domain>` with the `<domain>` portion matching the actual tenant domain name. With Alternate Sign-in ID users can sign-in using their email address, which is set on the `proxyAddresses` attribute of their user account. Users who sign-in using their email address should see their email address listed in the yellow box, but a different tenant domain name will likely appear in the green box. Users who are unfamiliar with the real tenant domain name may incorrectly click **Cancel**, when it was a legitimate sign-in.

While showing the tenant domain name may cause confusion for users who sign-in using an email address, it is necessary. Assume an attacker is trying to get a user who signs in with their joe@fabrikam.com email address to sign into the attacker's account. The attacker could create a proxy email address containing joe@fabrikam.com on their account to facilitate the process. If the speedbump only showed the account identifier of joe@fabrikam.com, the user would likely confirm the sign-in attempt. Exposing the tenant domain would say something like joe@fabrikam.com as the account identifier, but attackertenant.com as the tenant domain, which would lead to joe cancelling the sign-in attempt.

<span style="color:red">**IMPORTANT**</span>: The only way that customers can self-service disable the domain confirmation dialog is through the creation of [Tenant Restrictions v2](https://learn.microsoft.com/en-us/entra/external-id/tenant-restrictions-v2) (TRv2) policies. That said, we've identified a series of scenarios where we consider it safe to suppress the domain confirmation dialog in places it would otherwise be shown. The list of scenarios where the domain confirmation dialog is suppressed will be covered in the *Scenarios where the domain confirmation dialog is suppressed* section immediately below. 
___

### Speedbump Federated Sign-in flows

- **Auto-acceleration** – Office Home Realm Discovery (HRD) with `login_hint` sends the username to an Office App as a `login_hint` to Entra ID which skips the initial Entra ID Sign-in page. In federated logins, Entra ID auto-accelerates the user to ADFS (Active Directory Federation Services) without any UX, and then comes back to Entra ID. The fact that Entra ID auto-accelerates the user to ADFS without showing any UX prevents Entra ID from being able to drop a CSRF double submit cookie. This also occurs when `domain_hint` is used.
- **SmartLinks** - Smart links (aka: deep links) are saved or bookmarked URL's generated part-way through authentication as a means of simplifying the end user experience. When clicked, these links silently forward the user to their chosen application. Entra ID cannot drop a CSRF double submit cookie because the session was initiated at the application.

#### Scenarios where the domain confirmation dialog is suppressed
1. Show the domain confirmation dialog once per session (sustained indefinitely while session is active via session cookie)
2. Suppress the domain confirmation dialog for native clients using Webview2 (ex: new teams/outlook), Electron (ex: old teams), Android/iOS webview, and Trident (ex: old outlook).
3. Suppress the domain confirmation dialog when SSO is active.
4. Suppress the domain confirmation dialog if there is an active Tenant Restrictions v2 Policy. 

___

## Scenario 2 - Custom apps with Login CSRF dependencies

Given this vulnerability has gone unaddressed for a while, it is believed that a small set of customers have built applications and automated scenarios with dependencies on this Login CSRF behavior – despite this behavior being unsanctioned by Microsoft. These customers are accessing our authentication and authorization endpoints with a custom user experience or, for example, have an automated script which posts their credentials to our login endpoint for the purpose of simplifying the user experience (when instead, they should be relying on the AAD managed sign-in UX). An example of how this could be used is to create a required condition for CSRF protections to succeed where the authentication flow starts and ends on AAD-controlled Sign-in experience.  

The Login CSRF fix that is being implemented will break these applications and automated scenarios but given that this is unsanctioned behavior and insecure for Microsoft to continue to allow it, there is nothing that customers can/should do about this. The expectation is that the applications and automated scenarios that fit into this bucket are limited, but no telemetry exists that allows us to detect the true number.

Customer communication is in progress and will be sent before the fix is deployed.

___

# Public Documentation

Soon, the [Configure sign-in behavior using Home Realm Discovery](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-authentication-for-federated-users-portal?pivots=graph-hrd) document will be updated to include better guidance on when users should choose **Confirm** or **Cancel** in the domain confirmation dialog, information about the cookie that is dropped when the domain confirmation dialog is completed, and the impact of clearing cookies.

Until the public document above is updated, the only public content available is found in an **Important** notice within the [Auto-acceleration sign-in](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-authentication-for-federated-users-portal?pivots=powershell-hrd#auto-acceleration-sign-in) section of the "Configure sign-in behavior using Home Realm Discovery" document. Given this is a security vulnerability, the security team wants to avoid oversharing, and just share when absolutely necessary.

___

# Error codes

## InvalidRequestCanary (165000)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 165000 | InvalidRequestCanary | The server detected a CSRF violation on a request due to missing or invalid attributes | **When the request was missing the canary token or cookie**<br><br>AADSTS165000: Invalid Request: The request did not include the required tokens for the user context. One or more of the user context values (cookies; form fields; headers) were not supplied, every request must include these values and maintain them across a complete single user flow. The request did not return all of the form fields. Failure Reasons:[Token was not provided;]<br><br>**NOTE**: If the request is missing the form canary, then the error message will also include "**The request did not return all of the form fields.**" Otherwise, the error was the cookie was missing. |
|  |  |  | **When the values provided were valid but CSRF validation check failed**<br><br>AADSTS165000: Invalid Request: The request tokens do not match the user context. Do not copy the user context values (cookies; form fields; headers) between different requests or user sessions; always maintain the ALL of the supplied values across a complete single user flow. Failure Reasons:[Token values do not match;]
|  |  |  | **When the values that were provided have expired**<br><br>AADSTS165000: Invalid Request: The request tokens do not match the user context. One or more of the user context values (cookies; form fields; headers) were incorrect or invalid, these values should not be copied between requests or user sessions; always maintain the ALL of the supplied values across a complete single user flow. Failure Reasons:[Token is invalid;] |

### InvalidRequestCanary (165000) - Remediation steps

Ensure no CSRF violations are occurring in the request. This can be achieved by removing custom calls and ensuring Entra ID executes the entire authentication flow. No intermediate or automated calls should be made from a source other than AAD itself.  

This scenario most likely would be the result of an incorrect customer automation and will need to be remediated by the customer itself.

**NOTE**: If the failing scenario is federated, or the customer would need an extended period of time to remediate automation issues on their end, please report to the engineering team for further investigation, as tenant allowlisting could be an option on a case by case basis.

## CanaryExpired (165001)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 165001 | CanaryExpired | The server detected the canary token expired | AADSTS165001: Session Expired: The request tokens have expired and are no longer valid. The current user session / scenario needs to be restarted -- try reloading the page. Failure Reasons:[Token has expired;] |

### CanaryExpired (165001) - Remediation steps

This error is the result of an expired value. Clearing cookies and retrying the scenario from the beginning should be enough to fix this.

## InternalCanaryFailure (165002)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 165002 | InternalCanaryFailure | The server had an internal failure when attempting to make CSRF validations | AADSTS165002: Internal Error: An internal error occurred processing the request tokens. Failure Reasons:[Invalid token value;] |

### InternalCanaryFailure (165002) - Remediation steps

If this error is displayed, report it to the engineering team for further investigation. This would most likely indicate a product regression has occurred.

## SessionContextExpired (165003)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 165003 | SessionContextExpired | The server detected the session context cookie expired | AADSTS165003: Session Expired: The request tokens have expired and are no longer valid. The current user session / scenario needs to be restarted -- try reloading the page. Failure Reasons:[Session has expired;] |

### SessionContextExpired (165003) - Remediation steps

This error is the result of an expired value. Clearing cookies and retrying the scenario from the beginning should be enough to fix this. 

## InvalidApiCanary (165004)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 165004 | InvalidApiCanary | The server detected a CSRF violation on calls made to async API endpoints due to missing or invalid attributes | **When the request was missing the canary token or cookie**<br><br>AADSTS165004: Invalid Request: <error>. One or more of the user context values (cookies; form fields; headers) were not supplied, every request must include these values and maintain them across a complete single user flow. Failure Reasons:[<Failure details>] |
|  |  |  | **When the values provided were valid but CSRF validation check failed**<br><br>AADSTS165004: Invalid Request: <error>. Do not copy the user context values (cookies; form fields; headers) between different requests or user sessions; always maintain the ALL of the supplied values across a complete single user flow. Failure Reasons:[<Failure details>] |
|  |  |  | **When the values that were provided have been corrupted or are invalid**<br><br>AADSTS165004: Invalid Request: <error>. One or more of the user context values (cookies; form fields; headers) were incorrect or invalid, these values should not be copied between requests or user sessions; always maintain the ALL of the supplied values across a complete single user flow. Failure Reasons:[<Failure details>] |

### InvalidApiCanary (165004) - Remediation steps

Ensure no CSRF violations are occurring in the request. This can be achieved by removing custom calls and ensuring AAD executes the entire authentication flow. No intermediate or automated calls should be made from a source other than AAD itself.  

This scenario most likely would be the result of incorrect customer automation and will need to be remediated by the customer itself. 

**NOTE**: If the failing scenario is federated, or the customer needs an extended period of time to remediate automation issues on their end, please report to the engineering team for further investigation, as tenant whitelisting could be an option on a case by case basis.

## CsrfSpeedbumpConfirmationRequired (399218)

| AADSTS Error Code | Description | Error Details | **Scenario**: Message displayed to users |
|-----|-----|-----|-----|
| 399218 | CsrfSpeedbumpConfirmationRequired |  After signing in, our service drops a cookie called "csrfspeedbump" which should mitigate future prompts for the same tenant in that same browser, but if this cookie is not persisted by the customer that could cause for them to see the prompt every time they sign in. <br><br>Remediation: No action required. The user was asked to confirm that this app is the application they intended to sign into. This is a security feature that helps prevent spoofing attacks.| AADSTS399218: For security reasons, user confirmation is required to sign in to this tenant

___

# Error Example in End User Browser

![Sign-in-Error](/.attachments/AAD-Authentication/820230/Sign-in-Error.jpg)

___

# Troubleshooting

1. First, identify the error code (AADSTS<ErrorCode>)
2. Refer to the then refer to the [Error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) section of this wiki to identify the reason why this failed as well as what to communicate to the user/admin.
3. Request the customer provide the **Troubleshooting details** of the sign-in failure dialog. At a minimum, ask for the *correlation ID* and *timestamp* of the error
to investigate further in LogsMiner.
4. If an ICM is required, the engineering team will need the logsminer logs and/or fiddler traces to continue investigating. 

___

## Azure Support Center (ASC)

### Authentication Diagnostics

**Issue the query**

1. In Tenant Explorer, navigate to **Sign-Ins** on the left-hand panel.
2. Select the **Diagnostics** tab.
3. Click the *Go to the new sign-in troubleshooting experience for this tenant* link to launch the Authentication Diagnostics wizard.
4. Click on the tile titled, **Search by Correlation ID or Request ID**.
- Under **Do you have?** select either **Correlation Id* or *Request Id*, depending on which one was obtained from the customer.
- Populate **What is the Id?** enter the **Correlation Id* or the *Request Id*.
- Set the **Date** and **Time** in (UTC)
- From the **What was the result of the sign-in?** drop-down, select **Show all Activity**.
- Click **Next**

**Interpret the results**

| :exclamation:  <span style="color:red">**IMPORTANT**</span>: Do not share the internal detailed failure reasons with customers. Please refer to remediation steps sections from every [error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) to identify what should be communicated to customers. |
|-----------------------------------------|

1. Under **Authentication Summary**, click on the frame that has an error code matching one in the [Error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) section of this wiki.

This view should show the CSRF **ErrorNumber** and **ErrorCode** as shown in this example.

![ASCAuthDiagSummary](/.attachments/AAD-Authentication/820230/ASCAuthDiagSummary.jpg)

2. Click **Expert view**

3. CSRF evaluation results are found in the *PerRequestLogs* table on the bottom-left by typing `Csrf` in the search to filter.

- **CsrfCanaryState** – Indicates if evaluation was successful or not. 

- **CsrfEnforceState** – Indicates if validation is required. Should be “Enabled” in error cases. 

- **CsrfErrorNo** – Error code with a bitmask. Actual error code can be obtained from error code name mapping provided in the [Error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) section of this wiki. 

- **CsrfFailureReasons** – Detailed breakdown of all errors that happened during validation. 

- **CsrfHasFormCanary** – If the CSRF canary token was provided. 

- **CsrfSessionState** – State of the cookie. 

- **CsrfValidationType** – Indicates the endpoint type.

![ASCAuthDiagExpertPerRequest](/.attachments/AAD-Authentication/820230/ASCAuthDiagExpertPerRequest.jpg)
___
**NOTE:** The value _‘Request’_ in the _CSRFValidationType_ field along with the errors codes described in this article above may indicate that the issue that customer is **unexpectedly** experiencing is related to the changes in the code that were made to mitigate CSRF login and an IcM should be opened for further investigation by PG.

The value ‘API token’ in the CSRFValidationType field, even if along with an error code, is not caused by the changes made to mitigate CSRF Login. In this case, further troubleshooting needs to be done to determine next steps.
___

3. In the *Diagnostic Logs* section on the bottom right there will be a message called **Process pipeline error**. This contains a stack trace of the failure, which engineering teams find useful when investigating further on escalations.

![ASCAuthDiagExpertDiagTrace](/.attachments/AAD-Authentication/820230/ASCAuthDiagExpertDiagTrace.jpg)

___

### Sign-in logs

There is no sign-in event recorded for these failures.

___

## Logsminer

| :exclamation:  <span style="color:red">**IMPORTANT**</span>: Do not share the internal detailed failure reasons with customers. Please refer to remediation steps sections from every [error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) to identify what should be communicated to customers. |
|-----------------------------------------|

![Logsminer](/.attachments/AAD-Authentication/820230/Logsminer.jpg)

1. Identify the *error code name* from the **Error Code** column at the top of logsmner. The example shown in the image shows **InvalidRequestCanary**.

2. CSRF evaluation results are found in the *PerRequestIfx* table on the bottom-left. Type `Csrf` in the search to filter on these properties and their values: 

- **CsrfCanaryState** – Indicates if evaluation was successful or not. 

- **CsrfEnforceState** – Indicates if validation is required. Should be “Enabled” in error cases. 

- **CsrfErrorNo** – Error code with a bitmask. Actual error code can be obtained from error code name mapping provided in the [Error code](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=820230&anchor=error-codes) section of this wiki. 

- **CsrfFailureReasons** – Detailed breakdown of all errors that happened during validation. 

- **CsrfHasFormCanary** – If the CSRF canary token was provided. 

- **CsrfSessionState** – State of the cookie. 

- **CsrfValidationType** – Indicates the endpoint type. 

3. In the *DiagnosticTracesIfx* section on the bottom right there will be a message called **Process pipeline error**. This contains a stack trace of the failure. This is useful for engineering teams to investigate further if escalation is required.

___

## Identify double submit cookie pattern

___

# Talking points

| :exclamation:  <span style="color:red">**IMPORTANT**</span>: Please adhere to the following talking points when possible. If you have questions, reach out to Nick Ludwig (ludwignick). |
|-----------------------------------------|

Given this is a security related fix, the information in this Wiki is sensitive. As such, it's important not to overshare specific details regarding this vulnerability with customers. Once the changes covered in this Wiki have been rolled out to all customers, we plan on releasing a Blog post to explain the changes as well as the motivation behind the changes in better detail. Until then, no specifics about Login CSRF should be mentioned to customers. These changes should instead be referred to as "security hardening changes". 
- **On specifics regarding why we've implemented these changes**.  
  - Microsoft is committed to constantly hardening the security surrounding our authentication and authorization experience. These changes reflect that commitment. Given these changes are in the process of being applied to customers, we cannot share specifics past this at the current moment.

- **On whether any customer data was affected** - (Note: this should only be discussed if explicitly asked). 
   - No customer data has been affected. 

___

#FAQ
In addition to the talking points above, here are some anticipated FAQ's from customers. We will continue to build out this list as the rollout progresses.

- **"Am I affected by these changes?"**
   - There are two scenarios where customers may be affected.
       - If the customer uses auto-acceleration or smartlinks for federated sign-in purposes (primarily to bypass the username entry page), then they will be subject to the UX speedbump we're introducing as part of this work. 
       - If the customer modifies any requests/responses from `login.microsoftonline.com` to, for example, enable a custom sign-in UI, or perform automations such as running a script that posts credentials to our login endpoint for expedience purposes, they can expect to have these scenarios broken by the introduction of these changes. This is behavior that's unsanctioned my Microsoft, and all customers should rely on AAD to manage the sign-in experience E2E.

- **"How can I take action?"** 
   - In terms of the UX speedbump, there is no action that needs to be taken. This is a change that is being made to all scenarios involving auto-acceleration and smartlinks. It is only a behavior change and is not expected to break any customers. 
   - In terms of managed scenarios impact, you will need to entirely remove the behavior causing the failure (i.e., modifying requests/responses from `login.microsoftonline.com`, or, for example, a script which posts credentials to our login endpoint). The way to achieve compliance with these changes is to rely on AAD to manage the sign-in experience E2E. 

- **"When will I be mitigated?"**
   - No mitigation should be needed in the UX speedbump scenarios. _(Customer escalations are possible (and likely), given the speedbump is a change in underlying behavior. In the case of a customer escalation surrounding the introduction of a UX speedbump, if the provided talking points/content in this Wiki aren't enough to address the customer's concerns, escalation of the case to ESTS will be required)_
   - In managed scenarios, we are not in charge of the mitigation. Customers need to remove the behavior causing the failure, and rely on AAD to manage the sign-in experience E2E.

- **"Is there any public documentation explaining these changes?"**
   - Soon, the [Configure sign-in behavior using Home Realm Discovery](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-authentication-for-federated-users-portal?pivots=graph-hrd) document will be updated to include better guidance on when users should choose **Confirm** or **Cancel** in the domain confirmation dialog, information about the cookie that is dropped when the domain confirmation dialog is completed, and the impact of clearing cookies.

   - Until the document above it updated, the only public content available is found in an **Important** notice within the [Auto-acceleration sign-in](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-authentication-for-federated-users-portal?pivots=powershell-hrd#auto-acceleration-sign-in) section of the "Configure sign-in behavior using Home Realm Discovery" document. Given this is a security vulnerability, the security team wants to avoid oversharing, and just share when absolutely necessary. 

- **"Can I disable the domain confirmation dialog?"**
   - Given this change bolsters the security posture of our customers, we're not providing any way to disable the domain confirmation dialog. That being said, a [Tenant Restrictions v2 Policy](https://learn.microsoft.com/en-us/entra/external-id/tenant-restrictions-v2) (TRv2) carries the same security posture as the domain confirmation dialog thus enabling us to suppress the speedbump whenever a TRv2 policy is present. 
___

# ICM Path

Customers who have business critical custom applications or automated scenarios with dependencies on this Login CSRF behavior must fix their application or automated process. To get temporary relief while development work is performed on their application or automated process, customers can request their tenant be added to an allow list.

Support engineers can create an ICM by setting the Support Topic to `Azure\Azure Active Directory Sign-In and Multi-Factor Authentication\Passwords\Stay Signed In (Keep Me Signed In - KMSI)`, then click **Escalate case** in ASC.

If  **Escalate case** is not working in ASC, support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B) to create an ICM.

Technical Admins can redirect the ICM to the product group under:

- **Owning Service**: ESTS
- **Owning Team**: ESTS UX

___

# Training

## Deep Dive 04240 - Behavior Change - Upcoming MSRC fix for Login CSRF [Phase 1]

Identity PM, Nick Ludwig discusses the first phase of a Behavior Change that the Microsoft Security Response Center (MSRC) is introducing which will protect our customers from Login Cross Site Request Forgery (CSRF) attacks. The first phase will protect the interactive Sign-In experience of managed accounts.

**Title**: Deep Dive 04240 - Behavior Change - Upcoming MSRC fix for Login CSRF [Phase 1]

**Format**: Self-paced eLearning

**Duration**: 35 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752),  [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Microsoft Confidential** – Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability**: Feb 21, 2023

**Training Completion**: Feb 21, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAjmw66)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

## Deep Dive 04240 - Behavior Change - Upcoming MSRC fix for Login CSRF [Phase 2]

Identity PM, Nick Ludwig discusses the first phase of a Behavior Change that the Microsoft Security Response Center (MSRC) is introducing which will protect federated customers from Login Cross Site Request Forgery (CSRF) attacks. The second phase introduces a UX speedbump to the auto-acceleration and smartlinks sign in flows for federated sign-ins. The speedbump requires the user to click **Confirm**, indicating it is their account they are signing into. Otherwise, they should click **Cancel** to prevent signing into an attacker's account.

**Title**: Deep Dive 04240 - Behavior Change - Upcoming MSRC fix for Login CSRF [Phase 2]

**Format**: Self-paced eLearning

**Duration**: 24 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752),  [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Microsoft Confidential** – Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability**: April 3, 2023

**Training Completion**: April 3, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAjxdtw)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

