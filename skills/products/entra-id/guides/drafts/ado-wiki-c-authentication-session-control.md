---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Authentication Session Control"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Authentication%20Session%20Control"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.SessionControl
- SCIM Identity
- Conditional Access
-  Session Control
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD Authentication](/Tags/AAD-Authentication) [AAD User Sign-in](/Tags/AAD-User-Sign%2Din) [AAD Workflow](/Tags/AAD-Workflow) [AzureAD](/Tags/AzureAD) [Conditional-Access](/Tags/Conditional%2DAccess) 


<span style="color:red">**IMPORTANT**</span>: The announcement was sent to CSS stating **Every time** will no longer be limited to the three scenarios of **Microsoft Intune Enrollment**, **Risky users** and **Sign-in Risk** before February 2024. However, go live date has changed to sometime before March 31, 2024.

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Feature Overview

Adaptive Session Lifetime Policy (ASLP) provides two Sessions controls in Conditional Access Policy that manage the authentication session. The first is **Sign-in frequency** (SIF) which defines how frequently a user needs to re-authentication, and **Persistent browser session** to manage how long a user remains signed in after closing and reopening their browser window.

The default period before a user is asked to sign-in again when attempting to access a resource is 90 days. This means a user will be asked to re-authenticate on their first attempt to access a resource, if they have not accessed the resource for 90 days or longer.

Some organizations may have a business need to alter this default authentication period. This can be done using the two authentication Sessions controls which are available in Conditional Access Policy.

## Persistent browser session

This setting manages how long a user remains signed in after closing and reopening their browser window. When **All cloud apps** is selected in the policy two settings are exposed which control how Entra ID assigns SSO session cookies:

- **Always persistent**: This creates a persistent session cookie the user's browser without showing the **Stay signed in?** (aka: Keep Me Signed In - KMSI) dialog to the user. This prevents users having to re-enter in their credentials when they close and reopen the browser.

- **Never persistent**: This forces users to reauthenticate after closing and reopening a browser or after 24 hours.

![PersistentBrowser](/.attachments/AAD-Authentication/184071/PersistentBrowser.jpg)

A persistent browser session allows users to remain signed in after closing and reopening their browser window. Never persistent prevents the user from selecting Keep me signed in.

This setting requires "**All cloud apps**" to be selected in the conditional access policy. This requirement is because the SSO session token is not bound to a specific resource/client application. Without this requirement, users accessing multiple apps from the same browser would be automatically signed into apps not targeted by the conditional access policy. SSO sign-in tokens have their validity checked every time they are used. SSO session cookie can be revoked. Clicking "**Revoke sessions**" under the user's "**Authentication methods**" blade does not revoke these cookies because that setting is for MFA session cookies.

- Always persistent stores a persistent session cookie into the browser's cookie jar. This cookie is called ESTSAUTHPERSISTENT that remains even after the browser is closed. This is equivalent to the user selecting the **Keep Me Signed In (KMSI)** check box during authentication. When this happens a Persistent session token is stored and the user no longer needs to type in their credentials.
- Never persist stored a non-persistent session token in the browser's cookie jar. This cookie is also called ESTSAUTHPERSISTENT, but it gets destroyed when the browser is closed.

If browser persistence is configured by the ADFS administrator (see Persistent SSO in [this article](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fwindows-server%2Fidentity%2Fad-fs%2Foperations%2Fad-fs-single-sign-on-settings%23enable-psso-for-office-365-users-to-access-sharepoint-online&data=04%7C01%7Cannaba%40microsoft.com%7Cd9a400bc9b1147e2a26508d6a892b452%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C636881745377541378%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C-1&sdata=nnSsDYudgqbKnpmOYEYgQxfovHp%2BHAOEefqDPPefre8%3D&reserved=0)), ESTS will honer with that policy and persist the Azure AD session as well.

This setting overrides the global the "**Show option to remain signed in**" setting on the **Company Branding** pane in Azure AD Portal.

Sign-In frequency using Periodic reauthentication only checks single factor auth timestamp. If the session is due for a new authentication prompt, a first factor prompt occurs. This process will invalidate the MFA claim, except if the MFA claim can be re-hydrated from the PRT.

___

## Sign-in frequency (SIF)

This is the replacement for [Configurable Token Lifetime](https://learn.microsoft.com/en-us/entra/identity-platform/configurable-token-lifetimes), which remains in Public Preview and will be deprecated. This session control works with apps that have implemented OAuth2 or OIDC protocols according to the standards and third-party SAML applications, as long as they don't drop their own cookies and are redirected back to Microsoft Entra ID for authentication on regular basis.

This control forces full reauthentication (primary and secondary authentication) without impacting Primary Refresh Tokens (PRTs) or [Access token lifetime jittering](https://learn.microsoft.com/en-us/entra/identity-platform/configurable-token-lifetimes#access-tokens) between 60 and 90 minutes.

If the client app (under activity details) is a browser, we defer sign in frequency enforcement of events/policies on background services until the next user interaction. On confidential clients, sign-in frequency enforcement on non-interactive sign-ins is deferred until the next interactive sign-in. The information can be found in the ASC troubleshooter: Expert view -> Diagnostic Logs.

![image.png](/.attachments/image-89bee059-0a17-4f66-bec1-d2acabdd3965.png)

### **Periodic reauthentication**

This bypasses Entra ID's default posture of not prompting for credentials if the session has not changed, by forcing reauthentication after the specified period of time.

___

### **Every time**

Require full reauthentication on every sign-in attempt to the resource in scope. Currently, **Every time** is only supported for three scenarios:

![RadioButtons](/.attachments/AAD-Authentication/184071/SIF-RadioButtons.jpg)

___

#### Release status and capabilities

In February 2022, SIF was extended from its original behavior of **Periodic reauthentication** in hours or days, to also allow enforcement of full reauthentication **Every time**, but only for these thee scenarios:

  1.	**Microsoft Intune Enrollment** with **Require multifactor authentication** grant control: This requires multifactor authentication (MFA) when Intune enrollment is performed, even if the device already has a PRT with an MFA claim. This must target the **Microsoft Intune Enrollment** cloud application.

  2. **Risky users** with the **Require password change** grant control: This allows administrators to enforce interactive MFA authentication while forcing a password change on risky users. The policy must target **All cloud apps**.

  3. **Sign-in Risk** with the **Require multifactor authentication** grant control: This requires multifactor authentication (MFA) for users with Sign-in Risk, even if the device already has a PRT with an MFA claim. The policy must target **All cloud apps**.

Sometime before March 31, 2024 **Every time** will no longer be limited to the three scenarios described above. Support will be expanded to cover every application, user action and authentication context. When this change occurs the **Sign-in frequency – Every time** session control, which is already General Available, will have its capabilities expanded. This public preview will allow organizations to require their end-users to reauthenticate for *any application* (SAML / OIDC), *Authentication Contexts* or *User actions*.

**Common use cases** for **Sign-in frequency – Every time**

- My organization's sensitive applications

- Protecting apps behind Private Access / VPN / zScaler  

- Privileged role elevation in Privileged Identity Management (PIM) 

- When user sign-ins to a machine on Azure virtual Desktop (AVD) 

- Risky users and Risky sign-ins

- Sensitive actions such as Intune enrollment

___

#### When will 'Every time' prompt users?

- The reauthentication policy applies when Conditional Access is evaluating the sign-in to the application. This occurs every time the client is requesting a token for the resource.   

- As a general rule, on browser sessions, this typically happens once every hour, or based on the session lifetime setting of the app itself (as available in some VPNs).  Sign-in frequency **Every time** does not change the token lifetime issued to the resource.  

**5 Minutes clock skew**

EvoSTS factors in five minutes of clock skew. This is to prevent prompting users more often than once every five minutes. If the user has completed MFA in the last 5 minutes, and they access a resource protected by the Conditional Access policy that requires reauthentication, the user will not be prompted. Over-promoting users for reauthentication can impact their productivity and increase the risk of users approving MFA requests they didn’t initiate. It is recommended that **Sign-in frequency – every time** only be used for specific business needs. 

The diagram below explains when users will be prompted for reauthentication: 

![FlowDiagram](/.attachments/AAD-Authentication/184071/FlowDiagram.jpg)

___

#### Authentication context Scenario

To have granular authentication requirement within an application, customers can target Authentication contexts as the resource. For example, PIM allows customers to define the authentication context requirements for each role elevation. In Conditional Access, the customer defines the authentication requirements needed to perform role activation. 

In first time a user is elevating to a privileged role that requires authentication context called `AC1`, the client will need to request a token from Entra ID. Conditional Access will apply, and the user will be prompted for reauthentication. Once completed, a token will be issued and can be used to access the resource before it expires (the TTL is usually 1h). During this period of time, user will not be redirected to Entra ID to get a new token.

**Note**: If the user performs any additional role elevation that requires the same authentication context `AC1` during this 1 hour period, the user will not be prompted again.

___

#### Recommendations for Every time

In general, Microsoft's recommendation is to not prompt users too often. Over prompting can cause MFA fatigue and make the user more susceptible for phishing. The recommendation is to limit the number of applications in scope of **Sign-in frequency - Every time** to critical use cases such as sensitive actions or applications or when the users are at risk. 

**Sign-in frequency - Every time** works well when the resource has the logic of when the client should get a new token. For example, VPNs often have session lifetime and redirect the user back to Entra ID only once the session has expired.  
 
Sign-frequency is less disruptive when used for web applications (confidential clients). Public clients (e.g., Outlook app) can be very "chatty" when requesting tokens and as a result, users will be prompted more frequently.

For Office 365 apps, the recommendation is to use **Sign-in frequency – periodic reauthentication** for a better end user experience.

___

#### 15 Minute Minimum for Azure Virtual Desktop

A minimum of 15 minute re-auth is applied on these Azure Virtual Desktop (AVD) apps:

The 15 minute minimum reauth minimum was chosen based on how brokers handle token cache and refreshes. Any thing lower than 15 would not work and would not be stable from broker provider.

| AppID | App Name |
|-----|-----|
| a4a365df-50f1-4397-bc59-1a1564b8bb9c | Microsoft Remote Desktop | 
| 9cdead84-a844-4324-93f2-b2e6bb768d07 | Azure Virtual Desktop |
| 270efc09-cd0d-444b-a71f-39af4910ec45 | Windows Cloud Login |

___

# Public Documentation

- [Prompt users for reauthentication on sensitive apps and high-risk actions with Conditional Access](https://techcommunity.microsoft.com/t5/microsoft-entra-blog/prompt-users-for-reauthentication-on-sensitive-apps-and-high/ba-p/4062703)

- [Configure authentication session management with Conditional Access](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime)

___

# Licenses

Entra ID P1 and above

___

# Token Expiration/Renewal

Session control in its current form only managed primary authentication, as shown in the example below. However, changes are coming soon for **Sign-in frequency** when Refresh Token and Session Token in Configurable Token Lifetime policy is deprecated.

Azure AD uses the *Auth Instant* to determine the expiration date of a token, NOT the *Issuance Time*.  There are several scenarios where Azure AD issues a new credential based on the previous credential. When this happens the new credential will have the same *Auth Instant* as the previous credential.  All that changes is the *Issuance Time*.  See the example below where *Issuance Time* Is 17 minutes later than the *Auth Instant*.

![Re-hydratedSessionToken](/.attachments/AAD-Authentication/184071/Re-hydratedSessionToken.jpg)

**NOTE**:  Because the *Auth Instant* value in presented, the SessionToken is evaluated by Azure AD Conditional Access policy during sign in. The Sign-in frequency works with applications that have implemented OAuth2, OIDC and SAML protocol. 

___

# Access token lifetime jittering

On June 1, 2021 the default access token (AT) lifetime of 60 minutes will become a variable time between 60 and 90 minutes. This means the default AT lifetime will increase from 60 minutes to a median of 75 minutes. This change is taking place to improve service resilience by spreading access token demand over a period of 60 to 90 minutes, which will prevent hourly spikes in traffic to Azure AD. Customers were first informed of this change in Message center announcement [MC249774](https://admin.microsoft.com/AdminPortal/Home#/MessageCenter/:/messages/MC249774) on Friday April 9, 2021. When this change occurs it will go directly to General availability. 

**NOTE**: This Message center announcement was only sent to Premium customers who pay for their Azure AD Premium licensing. This is why Customer Support does not see the announcement in Message center. 

Tenants that don't use Conditional Access, will have a default AT lifetime of 2-hours for clients like Teams and Office.

Customers that wish to avoid access token randomness can override this by using PowerShell to configure [Configurable Token Lifetime](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-configurable-token-lifetimes#:~:text=Refresh%20and%20session%20token%20lifetime%20policy%20properties%20,%20%20Until-revoked%20%201%20more%20rows%20) (CTL) policies.

Organizations that use Conditional Access [Sign in frequency](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime#user-sign-in-frequency) (SIF) to enforce how frequent sign-ins occur will not be able to override the change to default access token (AT) lifetime. Consider an organization that sets Sign-In Frequency to occur every hour...

**Without jittering**:

The actual sign in interval could range from 1 hour to 2 hours. This can occur if a user performs an interactive Sign-In at 59 minutes while the AT was still valid. No credential prompt occurs because Sign in frequency has not been exceeded and a new 1 hour AT gets issued.

**With jittering**:

The actual sign in interval will occur anywhere between 1 hour to 2.5 hours. Jittering can issue an AT lifetime that is valid from 60-90 minutes. 

If a user with a valid 1 hour AT performs an interactive Sign-In at 59 minutes, just prior to Sign-In frequency being exceeded, there is no credential prompt as the sign in is below the SIF threshold.

If a new AT with a lifetime of 90 minutes is issued, the user would not see a credential prompt for an additional hour and a half.  When a silent renewal attempted of the 90 minute AT is made, Azure AD will require a credential prompt because the total session length has exceeded the Sign-In frequency setting of 1 hour. 

In this scenario, the time frame between credential prompts due to the SIF interval and token jitter, would be 2.5 hours.

Finally, default AT Jittering will be applied to organizations that have Continuous Access Evaluation (CAE) enabled, regardless if CTL is configured. The result will be the default AT for longer token lifetime will range from 20 to 28 hours.
___

## Experiences

- User is initially prompted for Password and MFA at separate times

1. User signs in to Windows at time 0 using their Username and Password.
2. After 30 minutes the user opens a browser gets an MFA claim.
3. A Conditional Access policy configured with the Sign-in frequency Session control set to 1 hour.
4. After the user has been signed in for 1 hour they are prompted for Primary authentication, and Secondary authentication, as MFA is only valid if the Primary authentication time is still valid. This happens even though the *MFA Auth instant* is below the session control expiration.

**NOTE**: The user will only be prompted for MFA if the Primary authentication is below the Session control limit but the Secondary authentication exceeds the Session control limit.

- User is prompted for Password and MFA at the same time

1. The user signs into Windows using strong authentication, such as Windows Hello for Business (WHfB) or FIDO2.
2. If *Auth instant* and the *MFA Auth instant* are greater than sign-in frequency then the user is prompted for both Primary auth and Secondary auth.

___

## Token Expiration/Renewal Flow

![TokenRenewalFlow](/.attachments/AAD-Authentication/184071/TokenRenewalFlow.jpg)

___

# Configure Session Control Settings

## Sign-in Frequency - Periodic reauthentication

This can be defined for Hours or Days with the supported range of hours being 1-23 and Days being 1-365.

**Note**: For best user experience, it is strongly recommend that an equivalent authentication prompt frequency be configured for key Microsoft Office applications, such as Exchange Online and SharePoint Online.

### Entra ID Portal

1. Sign-in to the [Microsoft Entra portal](https://entra.microsoft.com/) as *Conditional Access Administrator* role or higher.

2. Expand **Protection** in the left-hand navigation.

3. Select **Conditional Access**, then select **Policies**.

4. Click **New Policies**

   - At a minimum, enter a policy **Name**.
   - Under **Users or workload identities**, select the **Select users and groups** radio button and place a check next to **Users and groups** then select the user that will have the policy enforced.
   - Under **Target resources**, select **Select apps** and from the **Select** pane choose the application resource that will be protected by the CA policy.
   - Under **Session**, place a check next to **Sign-in frequency**, then select the **Periodic reauthentication** radio button and click **Select** to save the change.

5. Under Enable policy, select **Enable**, then click **Create**.

   ![RadioButtons](/.attachments/AAD-Authentication/184071/PeriodicReauth.jpg)

___

### Microsoft Graph API

This is covered in the [signInFrequencySessionControl resource type](https://learn.microsoft.com/en-us/graph/api/resources/signInFrequencySessionControl?view=graph-rest-beta) API documentation.

#### Permissions

| Permission type                    | Permissions (from least to most privileged)                  |
| ---------------------------------- | ------------------------------------------------------------ |
| Delegated (work or school account) | Policy.Read.All, Policy.ReadWrite.ConditionalAccess and Application.Read.All |
| Application                        | Policy.Read.All, Policy.ReadWrite.ConditionalAccess and Application.Read.All |

___

#### Properties

| Property             | Type                                | Description                                                  |
| -------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `authenticationType` | `signInFrequencyAuthenticationType` | This property was updated to only support `primaryAndSecondaryAuthentication`. This now prompts the user for all auth methods that were supplied as part of the initial authentication; primary and/or secondary credentials.<br/>The public preview value of `secondaryAuthentication`<br/>was deprecated. |
| `frequencyInterval`  | `signInFrequencyInterval`           | The possible values are `timeBased`, `everyTime`, `unknownFutureValue`. |
| `isEnabled`          | Boolean `true` or `false`           | Specifies whether the session control is enabled.            |
| `type`               | `signinFrequencyType`               | Possible values are: `days`, `hours`, or `null` if `frequencyInterval` is `everyTime`. |
| `value`              | Int32                               | The number of `days` or `hours`.                             |

The `signInFrequencySessionControl` API has two properties to distinguish between periodic refresh of credentials and every time.

- **`signInFrequencyInterval`**: This supports values of `timeBased` or `everyTime`, with `timeBased` being the default indicating the current Sign-In Frequency experience of periodic refresh.
- **`authenticationType`**: This was updated to only support `primaryAndSecondaryAuthentication` which prompts the user for all auth methods that were supplied as part of the initial authentication; primary and/or secondary credentials.  The public preview value `secondaryAuthentication` for `"authenticationType"` was deprecated.

___

#### Create Policy - Periodic reauthentication

- The `frequencyInterval` of `timeBased` is the default and provides periodic refresh .
- The `value` property supports a numeric value.
- The `type` property supports `hours` or `days`.
- The `isEnabled` property supports Boolean values of `true` or `false`.
- The `authenticationType` property was updated to only support `primaryAndSecondaryAuthentication`. This now prompts the user for all auth methods that were supplied as part of the initial authentication; primary and/or secondary credentials. The public preview value of `secondaryAuthentication` was deprecated.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/v1.0//identity/conditionalAccess/policies`

**Request Body**:

```json
{
    "displayName": "SIF - Periodically (4 hours) for AADClaimsXRay",
    "state": "enabled",
    "conditions": {
        "clientAppTypes": [
            "mobileAppsAndDesktopClients",
            "browser"
        ],
        "applications": {
            "includeApplications": [
                "3ad94f41-49d8-46b3-a0f1-d7e85a82d771"
            ]
        },
        "users": {
            "includeUsers": [
                "aad49556-####-####-####-############"
            ]
        },
        "locations": {
            "includeLocations": [
                "All"
            ],
            "excludeLocations": [
                "AllTrusted"
            ]
        }
    },
    "grantControls": {
        "operator": "OR",
        "builtInControls": [
            "mfa"
        ]
    },
    "sessionControls": {
        "signInFrequency": {
            "value": 4,
            "type": "hours",
            "authenticationType": "primaryAndSecondaryAuthentication",
            "frequencyInterval": "timeBased",
            "isEnabled": true
        }
    }
}
```
___

## Sign-in Frequency - Every time

### Entra ID Portal

1. Sign-in to the [Microsoft Entra portal](https://entra.microsoft.com/) as *Conditional Access Administrator* role or higher.

2. Expand **Protection** in the left-hand navigation.

3. Select **Conditional Access**, then select **Policies**.

4. Click **New Policies**
   - At a minimum, enter a policy **Name**.
   - Under **Users or workload identities**, select the **Select users and groups** radio button and place a check next to **Users and groups** then select the user that will have the policy enforced.
   - Under **Target resources**, select **Select apps** and from the **Select** pane choose the application resource that will be protected by the CA policy.
   - Under **Session**, place a check next to **Sign-in frequency**, then select the **Every time** radio button and click **Select** to save the change.
   
5. Under Enable policy, select **Enable**, then click **Create**.

   ![RadioButtons](/.attachments/AAD-Authentication/184071/SIF-RadioButtons.jpg)

___

### Microsoft Graph API

This is covered in the [signInFrequencySessionControl resource type](https://learn.microsoft.com/en-us/graph/api/resources/signInFrequencySessionControl?view=graph-rest-beta) API documentation.

See the link above for permissions and properties.

___

#### Create Policy - Every time

This policy will work once **Every Time** is expanded to support all cloud apps, user actions and authentication contexts. Until that is publicly available, use the examples below for the three supported scenarios. 

- The `frequencyInterval` is set to `everyTime` which provides forced reauthentication every time the user signs into the application.
- The `value` property supports a numeric value, but will be `null` when `everyTime` is used.
- The `type` property supports `hours` or `days`, but will be `null` when `everyTime` is used.
- The `isEnabled` property supports Boolean values of `true` or `false`.
- The `authenticationType` property was updated to only support `primaryAndSecondaryAuthentication`. This now prompts the user for all auth methods that were supplied as part of the initial authentication; primary and/or secondary credentials. The private preview value of `secondaryAuthentication` was deprecated.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/v1.0//identity/conditionalAccess/policies`

**Request Body**:

```json
{
    "displayName": "SIF - Everytime for AADClaimsXRay",
    "state": "enabled",
    "conditions": {
        "clientAppTypes": [
            "mobileAppsAndDesktopClients",
            "browser"
        ],
        "applications": {
            "includeApplications": [
                "3ad94f41-49d8-46b3-a0f1-d7e85a82d771"
            ]
        },
        "users": {
            "includeUsers": [
                "aad49556-####-####-####-############"
            ]
        },
        "locations": {
            "includeLocations": [
                "All"
            ],
            "excludeLocations": [
                "AllTrusted"
            ]
        }
    },
    "grantControls": {
        "operator": "OR",
        "builtInControls": [
            "mfa"
        ]
    },
    "sessionControls": {
        "signInFrequency": {
            "value": null,
            "type": null,
            "authenticationType": "primaryAndSecondaryAuthentication",
            "frequencyInterval": "everyTime",
            "isEnabled": true
        }
    }
}
```

___

##### Create Policy - Every time - Intune Enrollment Policy

- `"includeApplications"` includes the Application ID of `d4ebce55-015a-49b5-a083-c84d1797ae8c` for the **Microsoft Intune Enrollment**.
- The `frequencyInterval` is set to `everyTime`, which forces reauthentication every time the user signs into the application.
- The `authenticationType` supports `primaryAndSecondaryAuthentication`, which prompts the user for first and second factor credentials when required.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/policies`

**Request body**:

```json
{
    "displayName": "Intune enrollment",
    "state": "enabled",
    "grantControls": null,
    "conditions": {
        "clientAppTypes": [
            "all"
        ],
        "applications": {
            "includeApplications": [
                "d4ebce55-015a-49b5-a083-c84d1797ae8c"
            ],
            "excludeApplications": [],
            "includeUserActions": []
        },
        "users": {
            "includeUsers": [
                "3b8bea0d-####-####-####-############"
            ]
        }
    },
    "sessionControls": {
        "signInFrequency": {
            "frequencyInterval": "everyTime",
            "authenticationType": "primaryAndSecondaryAuthentication",
            "isEnabled": true
        }
    }
}
```

___

##### Create Policy - Every time - User Risk Policy

This policy forces the user to reset their password after having performed MFA validation.

- This policy must set to **All cloud apps**.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/policies`

**Request body**:

```json
{
    "displayName": "Require Reauth for Risky User Sign-in",
    "state": "enabled",
    "conditions": {
        "userRiskLevels": [
            "high"
        ],
        "signInRiskLevels": [],
        "clientAppTypes": [
            "all"
        ],
        "applications": {
            "includeApplications": [
                "All"
            ]
        },
        "users": {
            "includeUsers": [
                "1982f81a-####-####-####-############"
            ]
        }
    },
    "grantControls": {
        "operator": "OR",
        "builtInControls": [
            "mfa",
            "passwordChange"
        ]
    },
    "sessionControls": {
        "signInFrequency": {
            "frequencyInterval": "everyTime",
            "authenticationType": "primaryAndSecondaryAuthentication",
            "isEnabled": true
        }
    }
}
```

___

##### Create Policy - Every time - Sign-in Risk Policy

This policy forces a user with Sign-in risk to perform MFA validation.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/policies`

**Request body**:

```json
{
    "displayName": "Sign-in risk requires MFA EveryTime",
    "state": "enabled",
    "conditions": {
        "userRiskLevels": [],
        "signInRiskLevels": [
            "high",
            "medium",
            "low"
        ],
        "clientAppTypes": [
            "all"
        ],
        "applications": {
            "includeApplications": [
                "797f4846-####-####-####-############"
            ]
        },
        "users": {
            "includeUsers": [
                "287ae8de-####-####-####-############",
                "d377c8df-####-####-####-############",
                "2bf1cd6e-####-####-####-############",
                "ad381167-####-####-####-############",
                "b9ed079c-####-####-####-############"
            ]
        }
    },
    "grantControls": {
        "operator": "OR",
        "builtInControls": [
            "mfa"
        ]
    },
    "sessionControls": {
        "signInFrequency": {
            "value": null,
            "type": null,
            "authenticationType": "secondaryAuthentication",
            "frequencyInterval": "everyTime",
            "isEnabled": true
        }
    }
}
```

___

##  Persistent Browser Session

This setting can only be configured when "**All cloud apps**" is selected.

- This does not affect token lifetimes or the sign-in frequency setting.
- This will override the **Show option to stay signed in** policy defined in Company Branding.
- **Never persistent** will override any persistent SSO claims passed in from federated authentication services.
- **Never persistent** will prevent SSO on mobile devices across applications and between applications and the user's mobile browser.

### Entra ID Portal

1. Sign-in to the [Microsoft Entra portal](https://entra.microsoft.com/) as *Conditional Access Administrator* role or higher.

2. Expand **Protection** in the left-hand navigation.

3. Select **Conditional Access**, then select **Policies**.

4. Click **New Policies**
   - At a minimum, enter a policy **Name**.
   
   - Under **Users or workload identities**, select the **Select users and groups** radio button and place a check next to **Users and groups** then select the user that will have the policy enforced.
   
   - Under **Target resources**, select **Select apps** and from the **Select** pane choose **All cloud apps**.
   
   - Under **Session**, place a check next to **Persistent browser session**, and chose either *Always persistent* or *Never persistent* from the drop-down before clicking **Select** to save the change.
   
     **Note**: If **All cloud apps** is not selected, the administrator is directed to uncheck this option, or change their cloud app selection. Once **All cloud apps** is selected the **Persistent browser session** drop-down activates and the administrator is allowed to chose between *Always persistent* or *Never persistent*.
   
5. Under Enable policy, select **Enable**, then click **Create**.

   ![PersistentBrowser](/.attachments/AAD-Authentication/184071/PersistentBrowser.jpg)

___

### Microsoft Graph API

This is covered in the [persistentBrowserSessionControl resource type](https://learn.microsoft.com/en-us/graph/api/resources/persistentBrowserSessionControl?view=graph-rest-beta) API documentation.

See the link above for permissions and properties.

#### Create Policy - Persistent Browser Session

**Action**: `POST`

**URI**: `https://graph.microsoft.com/v1.0//identity/conditionalAccess/policies`

**Request Body**:

```json
{
    "displayName": "SIF - Persistent browser session for AADClaimsXRay",
    "state": "enabled",
    "conditions": {
        "clientAppTypes": [
            "mobileAppsAndDesktopClients",
            "browser"
        ],
        "applications": {
            "includeApplications": [
                "all"
            ]
        },
        "users": {
            "includeUsers": [
                "c635856c-c2cb-444d-8e41-69c03f80fe80"
            ]
        },
        "locations": {
            "includeLocations": [
                "All"
            ],
            "excludeLocations": [
                "AllTrusted"
            ]
        }
    },
    "grantControls": {
        "operator": "OR",
        "builtInControls": [
            "mfa"
        ]
    },
    "sessionControls": {
        "persistentBrowser": {
            "mode": "never",
            "isEnabled": true
        }
    }
}
```
___

# Scenarios

| Scenario | Policy | OS config | App/Browser | Expected Outcome |
|-----|-----|-----|-----|-----|
| 1 | Set Sign-in frequency to 8 hr | Win 7/Win 10 unjoined | App (e.g. Outlook) | User is prompted in 8 hr |
| 2 | Set Sign-in frequency to 8 hr | Win 7/Win 10 unjoined | Teams/Azure portal in Chrome/Edge/IE | User is prompted in 8 hr |
| 3 | Set Sign-in frequency to 8 hr | Win 7/Win 10 domain joined but NOT hybrid joined | App (e.g. Outlook) | User is prompted in 8 hr |
| 4 | Set Sign-in frequency to 8 hr | Win 7/Win 10 domain joined but NOT hybrid joined | Teams/Azure portal in Chrome/Edge/IE | User is prompted in 8 hr |
| 5 | Set Sign-in frequency to 8 hr | Win 10 AADJ/hybrid joined | App (e.g. Outlook) | User is prompted in 8 hr because user authenticated when signed in to the device. The user can lock and unlock the device. |
| 6 | Set Sign-in frequency to 8 hr | Win 10 AADJ/hybrid joined | Teams/Azure portal in Chrome/Edge/IE | User is prompted in 8 hr because user authenticated when signed in to the device. The user can lock and unlock the device. |
| 7 | Set Sign-in frequency to 8 hr | iOS | App (e.g. Outlook) | User is prompted in 8 hr |
| 8 | Set Sign-in frequency to 8 hr | Android | App (e.g. Outlook) | User is prompted in 8 hr |
| 9 | Set Persistent browser to never persist | Any | any web app | KMSI is not shown User has to re-authenticate after closing and reopening the browser |
| 10 | Set Persistent browser to never persist | Any | any web app | KMSI is not shown User has to re-authenticate after closing and reopening the browser |
| 11 | Set Sign-in frequency to 8 hr | Android with Authenticator app | app | User is prompted in 8 hr |
| 12 | Set Sign-in frequency to 8 hr | iOS with Authenticator app | app | User is prompted in 8 hr |
| 13 | Set Sign-in frequency to 8 hr Grant control MFA | Android without Authenticator app | Browser (e.g.portal.azure.com) | User is prompted for password followed by MFA after 8hr |
| 14 | Set Sign-in frequency to 8 hr Grant control MFA | iOS without Authenticator app | Browser (e.g.portal.azure.com) | User is prompted for password followed by MFA after 8hr |
| 15 | Set Sign-in frequency to 8 hr for Exchange and 7 days for SPO | Windows not AAD registered/Mac | Browser | User opens both tabs in his browser at the same time | User is prompted in 8 hr |
| 16 | Set Sign-in frequency to 8 hr for Exchange and 7 days for SPO | Windows not AAD registered /Mac | Browser | User opens both tabs in his browser at the same time | User is prompted in 8 hr |
| 17 | Set Sign-in frequency to 8 hr for Exchange and 7 days for SPO | Windows not AAD registered /Mac | Browser | User opens SPO tab first and then OWA tab after 1 hr. User is prompted in 8 hr after opening OWA tab |
| 18 | Policy is set on Sharepoint to require signin frequency of 8 hours.<br>Policy is set on Exchange Online to require MFA. | Windows not AAD registered /Mac | Browser | 1. User logins to EXO, at T1, using password and solving the MFA challenge.<br>2. After 8 hours, user opens a new tab and tries to login to Office portal.<br>&nbsp;&nbsp;&nbsp;1. No prompt is needed because Office Portal doesn't have any policy.<br>&nbsp;&nbsp;&nbsp;2. Token acquired contains MFA claim.<br>3. User opens a Sharepoint tab, there is a prompt to re-login because 8 hours have passed. User DOES NOT TAKE ANY ACTION here.<br>4. Without any user action yet, user opens a new tab, this time to login to MS Stream.<br>&nbsp;&nbsp;&nbsp;1. Even when the user saw a prompt in the SPO tab, we won't prompt in MS Stream because there is no policy. The cookie is still good because the user didn t take any action in the SPO tab.<br>&nbsp;&nbsp;&nbsp;2. Token acquired contains MFA claim.<br>5. User goes back to the Sharepoint tab, and enters its password.<br>&nbsp;&nbsp;&nbsp;1. Here, we re-create the cookie: we drop the MFA claim, it contains only password.<br>&nbsp;&nbsp;&nbsp;2. DeviceId is kept if it exists.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. This is to help with win10 and not break conditional access policies.<br>User goes back to EXO tab, and they need to solve MFA again. |

___

# Actions that Qualify as Sign-in Activity

When a user signs in or unlocks an Entra ID Joined or Hybrid Entra ID Joined Windows device, that is considered a sign-in.

For example, a CA policy targeting **Office apps** with a **Sign in frequency** session control of **Periodic reauthentication** set to 24 hours will not prompt the user to sign-in to Outlook if the Outlook client is opened 10 minutes after sign-in. The same is true if the user leaves Outlook client open, locks their desktop and comes back a to work after taking the weekend off. When they unlock their desktop that counts as a sign-in.

## AADJ and HAADJ devices

In order for a PRT to satisfy SIF on AADJ and HAADJ devices, and grant access to a PRT where there is an existing MFA claim, the time allotted in SIF policy must be within the period of the `last refresh timestamp`  and the `current timestamp`.

Unlocking a device, or signing in interactively will only refresh the Primary Refresh Token (PRT) every 4 hours on AADJ and HAADJ devices. The `last refresh timestamp` recorded for the PRT compared with the `current timestamp` must be within the time allotted in SIF policy.

**Note**: A timestamp captured from user log-in is not necessarily the same as the last recorded timestamp of PRT refresh because of the 4-hour refresh cycle. This happens when a PRT has expired and a user log-in refreshes it for 4 hours.

___

## Registered devices

On Registered (aka: WPJ) devices, unlock and sign-in will not satisfy the SIF policy. The Microsoft Entra WAM plugin is responsible for refreshing the PRT during native application authentication.

___

# Known Issues

## Issue 0: Users on Azure AD registered devices are not prompted for credentials when they open Office apps

Customer has Sign-in frequency configured for an app. User logs in to an Azure AD registered device using Azure AD creds.  

**Explanation**: On Azure AD registered Windows devices sign in to the device is considered a prompt. For example, if you have configured the Sign in frequency to 24 hours for Office apps, users on Azure AD registered Windows devices will satisfy the Sign in frequency policy by signing in to the device and will be not prompted again when opening Office apps.
___

## Solution 0: Users on Azure AD registered devices are not prompted for credentials when they open Office apps

This is by design  

___

## Issue 1: Never persist policy is not enforced

Admin configured session persistence to **Never persist** . User has existing persistent session. The session will continue being persistent until next time user is redirected to AAD.

**Explanation**: ESTS cannot enforce persistence until the cookie is updated.

___

## Solution 1: Never persist policy is not enforced

This is by design

___

## Issue 2: Inconsistent prompts for Office apps

Customer configured different sign-in frequency for different O365 resources. For example, Sign in frequency for SPO is 8 hours and Sign in frequency for OWA is 24 hours. User has both tabs open in the same browser window. User is working in OWA. SPO sign-in frequency expired. User will be prompted.

**Explanation**: both tabs share the same cookie and sign -in frequency conflict results in the strictest policy winning.

___

## Solution 2: Inconsistent prompts for Office apps

Configure the same values for Sign in frequency for all O365 applications.

___

## Issue 3: A Token lifetime that is stricter than CA Policy is enforced

Customer has both Sign-In Frequency and Configurable Token Lifetime configured which can result in policy conflicts. If CTL is configured for 1 hr and Sign-in frequency is configured for 8 hr, they will see a credential prompt every one hour.

___

## Solution 3: A Token lifetime that is stricter than CA Policy is enforced

Disable CTL for this user/app combination.

___

## Issue 4: The refresh token has expired due to maximum lifetime

In browser flows, a user receives a notification titled **Experiencing authentication issues** citing AADSTS error code 70043 when their refresh token has expired. The error message states how many *seconds* the refresh token is good for.

| Error Text | Error Image |
|-----|-----|
| <b>Experiencing authentication issues</b><br>The portal is having issues getting an authentication token. The operation rendered may be degraded.<br><br>Additional information from the call to get a token:<br>Extension: microsoft_aad_iam<br>Resource: self<br>Details: AADSTS70043: The refresh token has expired due to maximum lifetime. The token was issued on YYYY-MM-DDTHH:MM:SSZ and the maximum allowed lifetime for this application is 3600.<br>Trace ID: 37ea78f3-####-####-####-############<br>Correlation ID: c29a53c8-####-####-####-############<br>Timestamp: YYYY.MM.DD HH:MM:SSZ. | ![UseExpiredRT.jpg](.attachments/AAD-Authentication/184071/UseExpiredRT.jpg) |

___

## Solution 4: The refresh token has expired due to maximum lifetime

Verify the number of seconds identified as the maximum allowed lifetime in the error message aligns to the SignInFrequencyTimeSpan. The SignInFrequencyTimeSpan is found in the JSON string of the Conditional Access policy in ASC. Session Control will be extended in ASC to show the SignInFrequencyTimeSpan in easy to ready Hours and Days. Simply convert that to seconds.

The number of seconds for a refresh token can also be determined by searching the DiagnosticTracesIfX section of Logsminer or Kusto for Messages containing AADSTS70043.

___

## Issue 5: You will need to sign in again to access your resources

When Sign-In Frequency is set to **Every time** for a resource that the user signed into with a browser, the user may get this prompt when they navigate around in a tab where they previously performed MFA if they return to the resource that is protected by the SIF Every time policy.

| Image|
|-----|
| ![BrowserEveryTime](/.attachments/AAD-Authentication/184071/BrowserEveryTime.jpg) |

If the user selects **Click here to copy details** they will find the sign-in Error code of `AADSTS50078`, as shown here.

```json
{
  "sessionId": "d897912a87bf4322adb950abac12f6bf",
  "missingClaims": "{\"claims\":\"{\\\"access_token\\\":{\\\"capolids\\\":{\\\"essential\\\":true,\\\"values\\\":[\\\"639bf19c-f083-4860-b052-a7d79c9c66c4\\\",\\\"efe28f62-7b7f-472b-b063-dadaad6ea90a\\\"]}}}\"}",
  "resourceName": "graph",
  "errorMessage": "AADSTS50078: Presented multi-factor authentication has expired due to policies configured by your administrator, you must refresh your multi-factor authentication to access '00000002-0000-0000-c000-000000000000'.\r\nTrace ID: ad086cea-f0f2-4381-8210-3ff46bf31300\r\nCorrelation ID: 1ba8f0c8-c6fc-4b4b-8a78-03b145c45f9c\r\nTimestamp: 2022-01-23 22:49:45Z"
}
```

___

## Solution 5: You will need to sign in again to access your resources

To proceed the user must click **Sign in again** and present the credentials configured in the SIF policy.

___

## Issue 6: Office apps banner asks the user to sign-in

Using Sign-in Frequency **Every time** with the **Risky sign-ins** option of **No risk** allows first party applications like Office to continue to be used without prompting users for sign-in, but it presents the user with a warning asking them to sign in again. The Azure AD Sign-in logs show Non-interactive sign-in Failures.

___

## Solution 6: Office apps banner asks the user to sign-in

Using Sign-in Frequency Every time with the **Risky sign-ins** option of **No risk** causes applications to behave adversely and is not recommended. There are two work item to disable the **No risk** option and this limitation will be cited in the [Require reauthentication every time](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime#require-reauthentication-every-time) section of the "Configure authentication session management with Conditional Access" public document.

- API bug [1963401](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/1963401) 

- UX bug [1963403](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/1963403)

___

## Issue 7: Sign-in frequency is not evaluated in Sign-in events originating from offline confidential clients

In sign-events originating from offline confidential clients, sign-in frequency is not evaluated even though the session control should have been enforced based on the matching conditions of the event. e.g., A sign-in event for Exchange Online during which a policy with sign-in frequency is evaluated would normally receive the session control for a client like Outlook, but in Mozilla Thunderbird (a confidential client), the enforcement does not occur as expected.
___

## Solution 7: Office apps banner asks the user to sign-in

This is expected. On confidential clients, sign-in frequency enforcement on non-interactive sign-ins is deferred until the next interactive sign-in. You can verify if this what is occurring by reviewing Diagnostic Logs in ASC Troubleshooter (under Expert View). A line will specify that "Sign in frequency was not enforced due to offline confidential client".
___

## Issue 8: ncgMFA claim not always setting correct TTL

We have noticed an incorrect behavior with the ncgMFA claim.  When this claim is present, a user’s successful MFA claim should expire after 10 minutes, and the user should then be re-prompted to complete MFA.  It was discovered that occasionally the claim did not have the correct TTL and would not expire at 10 minutes, but 60 minutes.  We will begin rolling out a correction to this behavior starting on **October 13, 2025**, and expect to complete by mid-November.

Customers may have become used to the incorrect behavior.  As this change is rolled out, they may notice more frequent and/or unexpected MFA prompts.   Please use the following when explaining this change to a customer:

>We recently deployed a security update that changes how long certain sign-in sessions last. Specifically, when a login requires a fresh multi-factor authentication (MFA), the system will now correctly limit the session to 10 minutes instead of the previous 1 hour. This fix ensures the session timeout behaves as originally intended for enhanced security.
>
>What this means for you: You might notice you’re asked to verify with MFA more frequently than before (about every 10 minutes in these specific cases). This is expected and is part of keeping your account secure. If you’re prompted to sign in again, simply follow the MFA prompt and continue. No other action is needed.
>
>Should you encounter any unusual issues persisting beyond the MFA prompts, please reach out to our support team for assistance.

___

# Sign-In logs

The **Authentication Details** tab of individual Sign-in events now contains a **Session Lifetime Policies Applied** column. This provides indicators on how the session lifetime is influenced.

| Session Lifetime Policies Applied |  | Description |
|-----|-----|-----|
| null | null | (Do not display "Session lifetime policies applied" in the UX) |
| Remember MFA | rememberMultifactorAuthenticationonTrustedDevices | Remember Multi-factor Authentication on trusted devices |
| Configurable token lifetimes - tenant policy | TenantTokenLifetimePolicy | Tenant Token Lifetime Policy |
| Configurable token lifetimes - application policy | AudienceTokenLifetimePolicy | Audience Token Lifetime Policy |
| Sign-in frequency (periodic re-authentication) | signInFrequencyPeriodicReauthentication | Sign-In Frequency Periodic Reauthentication |
| Register passwordless authentication methods | NgcMfa | Next Generation Credential for Multi-factor Authentication |
| Sign-in frequency (every time) | SignInFrequencyEveryTime | Sign-In Frequency Every time |

The configuration of Sign-in frequency can be determined by examining events with a **Status** if *Interrupted*:

___

## Periodic reauthentication

This is the original control where the Sign-In Frequency (SIF) session control is enforced after a specified number of Days or Hours. This causes the user to perform Primary, and when required, Secondary re-authentication when the specified time period has expired by expiring their existing claims.  This appears in the **Authentication Details** tab of a sign-in event as **Sign-in frequency (periodic re-authentication)** as shown here.

![Sign-inPriAndSecPeriodic](/.attachments/AAD-Authentication/184071/Sign-inPriAndSecPeriodic.jpg)

___

## Every time

The **Sign-in frequency** session control is configured for **Every time** in the conditional access policy. The **Result detail** column under the **Authentication Details** tab shows the primary and secondary factor (when 2FA is required to complete sign-in) were both invalidated. The result of the challenge for both is recorded as shown here.

**NOTE**: Using **Every time** option prompts the user for all auth methods that were supplied as part of the initial authentication; primary and/or secondary credentials.

![Sign-inPriAndSec](/.attachments/AAD-Authentication/184071/Sign-inPriAndSec.jpg)

___

# Troubleshooting

## User not prompted when expected

Example: The user closed the application and opened it again.

- **Option 1**: The client has a valid token. 

Check [When will 'Every time' prompt users?](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=184071&anchor=when-will-%27every-time%27-prompt-users%3F) above for more info. 

The client likely has a valid token and continues to make requests with it for the resource. 

While the token is still valid, the client does not reach Entra ID to request another token, which prevents the user from getting an authentication prompt. Since there is no authentication request, there will be no event in the sign in logs. 

- **Option 2**: The client recently completed interactive authentication 

The sign-in request will show under the `non-interactive` sign-ins. 

The `interactive` sign-ins will show a sign-in that was completed within the 5 minutes prior to the `non-interactive` sign-in.

1. If the user was prompted for credentials, this event appears as an Interactive sign-in.

2. Under the **Authentication details** tab of the event, it will state **Session Lifetime Policies Applied** and **Sign-in frequency (every time)** appears just below.

![SIF-ET](/.attachments/AAD-Authentication/184071/SIF-ET.jpg)

3. Under the **Conditional Access** tab, the policy that was enforced appears at the top.

![SIF-ET-CA](/.attachments/AAD-Authentication/184071/SIF-ET-CA.jpg)

4. Click on the policy that was enforced to expose the *Conditional Access Policy details* blade to check if the Conditional Access policy requiring re-authentication was evaluated and enforced.

![SIF-CA-TSG](/.attachments/AAD-Authentication/184071/SIF-CA-TSG.jpg)

## User prompted when not expected 

In some cases, one resource will ask for a token on behalf of the user to another resource. For example, Teams might request a token for Exchange Online (EXO) to present the user their calendar. If EXO is in scope for a **Sign-in frequency - Every time** policy, the user might be getting prompted for reauthentication while using Teams. 

1. Determine if there a Non-interactive sign-in event is recorded for the application.   

- If there is no Non-interactive sign-in, it means the client already has a valid token and did not come back to Entra ID to request another token. This indicates the Conditional Access policy did not apply.  

- If a Non-interactive sign-in is present, check to see what Conditional Access policies were applied. It is possible that the last authentication timestamp was less than 5 minutes ago, which means the **Sign-in frequency – every time** session control would not be enforced.   

## Azure Support Center (ASC)

### Conditional Access Policy Object

1. In ASC's Tenant Explorer, select **Conditional Access** from the left nav pane.

2. Select the policy that was enforced at user sign-in, or should have been.

3. Observe the json string to the right of **Session Controls** that is contains this section.

- **Sign-In Frequency - Periodic refresh** is enforced every 1 hour.

```json
<SNIP>"SignInFrequency":{"Value":1,"Type":"hours","AuthenticationType":"primaryAndSecondaryAuthentication","IsEnabled":true,"FrequencyInterval":"timeBased"}<SNIP>
```

- **Sign-In Frequency - Every time** is enforced.

```json
<SNIP>"SignInFrequency":{"Value":null,"Type":null,"AuthenticationType":"primaryAndSecondaryAuthentication","IsEnabled":true,"FrequencyInterval":"everyTime"}<SNIP>
```

- **Persistent browser session** session control is enabled and set to `Never`.

```json
<SNIP>"PersistentBrowser":{"Mode":"never","IsEnabled":true}<SNIP>
```
___

### Sign-in Activity - Periodic refresh

1. In ASC's Tenant Explorer, select **Sign-ins** from the left nav pane.

2. Using the date/time stamp and Correlation ID or Request ID supplied by the customer, search for the sign-in event where the **SignInFrequency** session control was applied, or should have been.

3. Expand the result where the **Status** column is *Interrupt* and the **Conditional Access** column shows *Success* or *Failure*.

4. In the **Details** section, locate the section that starts with *appliedConditionalAccessPolicies*. When a SIF Periodic refresh policy applies the event detail will contain the following:

```json
  "appliedConditionalAccessPolicies": [
    {
      "id": "3ae071af-448c-4d80-8ef6-a33c7eae33bc",
      "displayName": "WinFed SIF - Refresh OWA 1 Hour",
      "enforcedGrantControls": [],
      "enforcedSessionControls": [
        "SignInFrequency"
      ],
```

5. Further down in the event details there will be this entry under the`"authenticationContextClassReferences"` section indicating the type of ` "sessionLifetimePolicies"` that was enforced.

```json
  "sessionLifetimePolicies": [
    {
      "expirationRequirement": "rememberMultifactorAuthenticationOnTrustedDevices",
      "detail": "Remember MFA"
    },
    {
      "expirationRequirement": "signInFrequencyPeriodicReauthentication",
      "detail": "Sign-in frequency (periodic re-authentication)"
    }
  ],
```

___

### Sign-in Activity - Every time

1. In ASC's Tenant Explorer, select **Sign-ins** from the left nav pane.

2. Using the date/time stamp and Correlation ID or Request ID supplied by the customer, search for the sign-in event where the **SignInFrequency** session control was applied, or should have been.

3. Expand the result where the **Status** column is *Interrupt* and the **Conditional Access** column shows *Success* or *Failure*.

4. In the **Details** section, locate the section that starts with *appliedConditionalAccessPolicies*. When a SIF Every time policy applies the event detail will contain the following:

```json
  "appliedConditionalAccessPolicies": [
    {
      "id": "5b58ccc7-8f2b-446c-a4d5-33dd736b1849",
      "displayName": "SIF - ET - 1st & 2dn Factor",
      "enforcedGrantControls": [
        "Mfa"
      ],
      "enforcedSessionControls": [
        "SignInFrequency"
      ],
```

5. Further down in the event details there will be this entry under the`"authenticationContextClassReferences"` section indicating the type of ` "sessionLifetimePolicies"` that was enforced.

```json
  "sessionLifetimePolicies": [
    {
      "expirationRequirement": "rememberMultifactorAuthenticationOnTrustedDevices",
      "detail": "Remember MFA"
    },
    {
      "expirationRequirement": "signInFrequencyEveryTime",
      "detail": "Sign-in frequency (every time)"
    }
  ],
```

___
### Sign-in Activity - Persistent Browser

2.  In ASC's Tenant Explorer, select **Sign-ins** from the left nav pane.
2.  Using the date/time stamp and Correlation ID or Request ID supplied by the customer, search for the sign-in event where the **SignInFrequency** session control was applied, or should have been.
3.  Expand the result where the **Status** column is *Success* and the **Conditional Access** column shows *Success* or *Failure*.
4.  In the **Details** section, locate the section that starts with *appliedConditionalAccessPolicies*. When Persistent browser session is enforced it will contain the following:

```json
  "appliedConditionalAccessPolicies": [
    {
      "id": "ea04d228-ce39-4748-8608-26e09e440c8d",
      "displayName": "sif using dynamic app filter and persistent browser",
      "enforcedGrantControls": [],
      "enforcedSessionControls": [
        "PersistentBrowserSessionMode"
      ],
```

5. Further down in the event details there will be this entry under the`"authenticationContextClassReferences"` section indicating the type of ` "sessionLifetimePolicies"` that was enforced.

```json
  "sessionLifetimePolicies": [
    {
      "expirationRequirement": "rememberMultifactorAuthenticationOnTrustedDevices",
      "detail": "Remember MFA"
    }
  ],
```
___

### Authentication Diagnostics

1. From the sign-in event discovered in ASC, click the *Troubleshoot this sign-in* link to launch the Authentication Diagnostic.

   Alternatively, click the **Diagnostics** tab under **Sign-ins** and enter the Correlation ID or Request ID along with the date and time.

2. Select the call with an **ErrorCode** of `KmsiInterrupt`.

3. Scroll down to **Basic details** and expand **CA Diagnostics**.

- This example shows user was prompted for credentials because the CA Policy Expired the MFA Claim Due To Sign In Frequency due to SignInFrequency.

```json
WinFed SIF - Refresh OWA 1 Hour (3ae071af-448c-4d80-8ef6-A33c7eae33bc)
All Of The Policy's Conditions Were Satisfied:
- The User Requested A Token For Office 365 Exchange Online (00000002-0000-0ff1-Ce00-000000000000)
  As A Result, We Evaluated Conditional Access For 1 Resource (00000002-0000-0ff1-Ce00-000000000000)
  This Office 365 Resource Was Included And Not Excluded By The Policy's Application Condition.
- The User (347e6da2-####-####-####-############) Was Included And Not Excluded By The Policy's User Condition.
The Following Session Controls Applied To This Request:
- The User Did Not Present Any Credentials Which Authenticated Them, So The Sign-In Frequency Control Had No Effect.
  At Least One CA Policy Expired The MFA Claim Due To Sign In Frequency. All Sources: CompanyStrongAuthenticationDetails, SignInFrequency
```

- To find out if this is due to SIF Periodic refresh or Every time click **Expert view**.
- Select **Diagnostic logs**
- Filter the view for `Multi CA Policy evaluation log` and observe that Sign-in frequency has a 1 hour limit.

![ASCExpert](/.attachments/AAD-Authentication/184071/ASCExpert.jpg)

___

# Root Cause Tree

Two new root cause tree paths have been created:

- **Root Cause - CID Sign In and MFA/MFA\Unexpected MFA Prompt\Reauthenticaiton\Sign-in every time**

- **Root Cause - CID Sign In and MFA/MFA\Unexpected MFA Prompt\Reauthenticaiton\Periodically**

___

# ICM Path

## Conditional Access Policy (ESTS)

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service.  This is the token issuance portion of Azure Active Directory. Please make sure you have reviewed the support workflows on csssupportwiki.com and consult an Cloud Identity TA prior to submitting.

## Support Engineer Instructions
Create IcM from ASC tool, by using Escalate Case button and searching for IcM template with Code [ID][AUTH][CA] - CA policy investigation and Id: F2N2ox  

**Support Topic**: **Azure Active Directory Sign-In and Multi-factor Authentication** \ **Multi-factor Authentication (MFA)** \ **Unexpected MFA prompt**


___

### Target ICM Team (TA use)

  - **Owning Service**: ESTS
  - **Owning Team**: Conditional Access

___

# Training

## Deep Dive 166348 - Sign-in frequency every time - additional support

**Course Title**: Deep Dive 166348 - Sign-in frequency every time - additional support

**Course ID**: TBD

**Format**: Self-paced eLearning

**Audience**: Identity Security and Protection vertical

**Duration**: 47 Minutes

**Tool Availability**: January 10, 2024

**Training Completion**: February 24, 2024

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAojcmy)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

___

## Deep Dive 22749 - Require reauthentication (Every time)

**Course Title**: Deep Dive 22749 - Require reauthentication (Every time)

**Course ID**: TBD

**Format**: Self-paced eLearning

**Audience**: Identity Security and Protection Support Engineers in [MSaaS AAD - Authorization Premier](https://msaas.support.microsoft.com/queue/f82fcb6a-5f8e-4cc4-9117-92f2b3bb7730)

**Duration**: 47 Minutes

**Tool Availability**: February 28, 2022

**Training Completion**: February 28, 2022

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAfkaxm)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

___

## Deep Dive for Conditional Access Authentication Session Management (ASLP)

**Course Title**: Azure AD Adaptive Session Lifetime Policy Session Control for Conditional Access

**Course ID**: S3320077

**Format**: Self-paced eLearning

**Audience**: Cloud Identity Support Engineers (Authentication Vertical)

**Tool Availability**: April 15, 2019

**Duration**: 47 Minutes

**Training Completion**: April 24, 2019

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAu2ptu)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
