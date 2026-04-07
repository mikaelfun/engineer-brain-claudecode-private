---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Account Management\Microsoft Entra External ID (CIAM)\Entra External ID Labs\OAuth 2.0 Device Code Flow in Entra External ID tenant"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20External%20ID%20%28CIAM%29/Entra%20External%20ID%20Labs/OAuth%202.0%20Device%20Code%20Flow%20in%20Entra%20External%20ID%20tenant"
importDate: "2026-04-06"
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
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Dev-B2C](/Tags/AAD%2DDev%2DB2C) 

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Overview of OAuth 2.0 Device Code Flow in an Entra External ID tenant (CIAM)

OAuth 2.0 Device Code Flow is an authentication method that allows devices with limited or no browser input (like TVs or CLI tools) to securely obtain access tokens by having the user authorize the device through a separate browser-based verification step.

Below you can find a complete guide to help you run OAuth 2.0 Device Code Flow in a Microsoft Entra External ID tenant, including app and user flow setup, Bruno configuration, and installation steps for Bruno.

This is the external facing documentation for the OAuth 2.0 Device Code Flow overview - [OAuth 2.0 device authorization grant - Microsoft identity platform | Microsoft Learn](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-device-code) (not specific for Azure AD B2C or Entra External ID tenants).


Here you'll be able to find the supported OpenID Connect and OAuth2 flows
 in Entra External ID tenants - [External Tenant Features - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-supported-features-customers#openid-connect-and-oauth2-flows).

### Preview limitations

As of 2nd October 2025, this feature is still in preview as there are a few known limitations/issues at the moment, such as:
- Initial `verification_uri` still points to https://microsoft.com/devicelogin which redirects to https://login.microsoftonline.com/common/oauth2/deviceauth. The login.microsoftonline.com endpoint is not accepted by Entra External ID and thus needs  to be manually changed to https://DomainName.ciamlogin.com/common/oauth2/deviceauth.

-  When trying to sign-in using an external IDP, this results in the error:
    *   ADSTS50132: The session is not valid due the following reasons: password expiration or recent password change, SSO Artifact is invalid or expired, session is not fresh enough for application, or a silent sign-in request was sent but the users session with Azure AD is invalid or has expired.
* * *
#Setting up and testing device code flow in 

## **Prerequisites**


*   A **Microsoft Entra External ID tenant** (CIAM).
*   Admin access to the tenant.
*   A **registered application** in the tenant.
*   Installed **Bruno API Client** (see section 4).
*   Basic understanding of OAuth 2.0 and Entra External ID concepts.

* * *

## 1. **Register an Application**


1.  In the **External tenant**, go to **Microsoft Entra ID >  App registrations**.
2.  Click **New registration**:
    *   **Name**: `DeviceCodeApp`
    *   **Supported account types**: Accounts in this organizational directory only.
    *   **Redirect URI**: Leave blank (Device Code Flow does not need it).
3.  After creation, note:
    *   **Application (client) ID**
    *   **Directory (tenant) ID**
4.  Under **Authentication**:
    *   Enable **Allow public client flows**  **Yes**. (Required for device code flow)
5.  Under **API permissions**:
    *   Add **Microsoft Graph  Delegated  openid, profile, offline_access**.
    *   Click **Grant admin consent**.

* * *

## 2. **Create a User Flow**


1.  Go to **Microsoft Entra ID > External Identities > Self-service sign up > User flows**.
2.  Click **New user flow**.
3.  Configure:
    *   **Name**: Give a name to your user flow
    *   **Identity providers**: Email accounts, either with password or one-time passcode
    *   **Attributes (Optional)**
4.  Save the flow and **link your app**:
    *   Open the flow  **Applications**  **Add application**  Select your app you've just created.

* * *

## 3. **Device Code Flow Endpoints for Entra External ID tenants**


*   **Authorization**:
    
        POST https://TenantName.ciamlogin.com/{onmicrosoft domain name}/oauth2/v2.0/devicecode
        
    
*   **Token**:
    
        POST https://TenantName.ciamlogin.com/{onmicrosoft domain name}/oauth2/v2.0/token
        
    
*   **Scopes**:
    
        openid profile offline_access
        
    

* * *

## 4. **Install and Set Up Bruno**

 
**Q: Why use Bruno instead of Postman?** 


[Postman Security Risks and Remediation](https://microsoft.sharepoint.com/teams/RiskReductionTeamCentralBurndownWikis/SitePages/Security-Migi.aspx?csf=1&web=1&share=EamaCpWUza9NgJTUMzoXdxkBk25-06S3d8EO2p2JRtBSvQ&e=iIP21Y&CID=19d55c54-8701-457c-960e-e8cace912f26) was shared in November 2024 which prohibited the use of Postman due to security risks. Several safe and supported different API clients can be found in this document.


Bruno is an **offline-first, Git-friendly API client** with a very similar UI to Postman which is fairly easy to use for simple test scenarios such as this.
 Download Bruno from [here](https://www.usebruno.com/downloads).
  

**Setup**

  1. Launch Bruno 

2. Create a **Collection** 

![Creating a collection in Bruno app](/.attachments/image-0bbdcce5-0a1d-4875-9277-69f8ba2b7869.png)

3. Give the **Collection** a name and a location folder in your desktop

![Creating a collection in Bruno app step 2](/.attachments/image-7d540ec7-2ca9-4b1b-91f1-99c1d559abf5.png)

* * *

## 5. **Bruno Requests for Device Code Flow**


**Step 1: Get Device Code**

    POST https://TenantName.ciamlogin.com/{onmicrosoft domain name}/oauth2/v2.0/token
    Content-Type: application/x-www-form-urlencoded
    
    client_id={{client_id}}&scope={{scope}}

This is how the above will look in the Bruno app:

1. Add the request URL to the URL bar at the top

2. Select POST in the dropdown selector on the left of the URL bar

3. Select "Body" and change to "Form URL Encoded" as to make it simpler to input your body parameters

4. Add two new Params, one for client_id  and another for scope

5. For client_id, use the App Id of the app you registered before and for scope use regular values such as "openid profile offline_access"

6. Click on the arrow to perform the request

![bruno setup](/.attachments/image-e01f608b-4c4c-456a-8b4e-9af85d788eb6.png)    

**Response**:
*   `device_code`
*   `user_code`
*   `verification_uri` (e.g., https://microsoft.com/devicelogin)

**Step 2: Signing in**

1. Open the `verification_uri` in a browser, and change it from https://login.microsoftonline.com/common/oauth2/deviceauth https://DomainName.ciamlogin.com/common/oauth2/deviceauth

2. Enter `user_code`, and sign in.

**Step 3: Poll for Token**

After the sign in is successful, in normal app day-to-day functioning it is expected that the app is sending the request below repeatedly to check if the sign in was successful. Since this is a controlled test, we'll only run the request below after the sign in is effectively complete.



    POST https://TenantName.ciamlogin.com/{onmicrosoft domain name}/oauth2/v2.0/token
    Content-Type: application/x-www-form-urlencoded
    
    grant_type=urn:ietf:params:oauth:grant-type:device_code
    &client_id={{client_id}}
    &device_code={{device_code}}

Following the same steps as in the previous request that we've setup in Bruno, it should look like this:

![image.png](/.attachments/image-63cc6a38-559e-4bb5-aa65-101e1aeb0446.png)

**Successful Response**:
*   `access_token`
*   `refresh_token`
*   `id_token`

**Expected errors in token polling request**

The device code flow is a polling protocol so errors served to the client must be expected prior to completion of user authentication.

| **Error** | **Description** | **Client Action** |
| --- | --- | --- |
| `authorization_pending` | The user hasn't finished authenticating, but hasn't canceled the flow. | Repeat the request after at least`interval`seconds. |
| `authorization_declined` | The end user denied the authorization request. | Stop polling and revert to an unauthenticated state. |
| `bad_verification_code` | The`device_code`sent to the`/token`endpoint wasn't recognized. | Verify that the client is sending the correct`device_code`in the request. |
| `expired_token` | Value of`expires_in`has been exceeded and authentication is no longer possible with`device_code`. | Stop polling and revert to an unauthenticated state. |

* * *


