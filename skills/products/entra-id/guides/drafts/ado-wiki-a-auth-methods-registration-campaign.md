---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/Authentication Methods Registration Campaign"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20MFA%2FAuthentication%20Methods%20Registration%20Campaign"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.MFARegistration
- cw.AzureMFA
- cw.MFAMethods
- SCIM Identity
-  MFA Registration
-  Authentication Methods
-  Entra ID MFA 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-MFA](/Tags/AAD%2DMFA) [AzureAD](/Tags/AzureAD)                   

 
[[_TOC_]]

# Summary

Starting in March 2026, Microsoft Entra ID introduces **passkey profiles** and **synced passkeys** to General Availability (GA). This update modernizes how passkeys (FIDO2) are configured and how users are prompted to register authentication methods.

For tenants that already have **Passkeys (FIDO2)** enabled, authentication method configurations are migrated into a **Default passkey profile**. A new **passkeyType** property controls whether device-bound passkeys, synced passkeys, or both are allowed.

This change also impacts the **Authentication Methods Registration Campaign** when it is set to **Microsoft managed**, as registration prompts are now driven by passkey configuration instead of Microsoft Authenticator alone.

Its important to understand the difference between **Enabled** and **Microsoft managed** states for the Authentication Methods Registration Campaign.

- **Microsoft managed** uses Microsoft-defined defaults that may change over time as new authentication methods are introduced.
- **Enabled** allows administrators to explicitly control which authentication method is targeted and which users are included.

Starting in 2026, Microsoft-managed behavior may target **passkeys (FIDO2)** instead of Microsoft Authenticator, depending on tenant configuration.

Administrators can initiate adoption campaigns by making a change to the *Default User Credential Policy* object. During the initial phase of Public Preview this can be managed by ~70 early adopter customers using a new Microsoft Graph API that has been introduced into the `beta` tree (without public documentation). A few weeks later the Public Preview will be broadly announced and API documentation will be released. Around General Availability (GA) this will be manageable from the **Authentication Methods** portal UI on a new **Advanced** settings blade. Once this is available the plan is to enable this campaign on all tenants.

# Require users to register modern authentication methods (Passkeys)

This release impacts Entra tenants that use MFA and have **Passkeys (FIDO2)** enabled.  

For tenants where the **Authentication Methods Registration Campaign** is set to **Microsoft managed**, the targeted authentication method and registration behavior are now driven by **passkey profile configuration**, rather than Microsoft Authenticator alone.

Beginning in 2023, Microsoft-managed registration campaigns prompted users with only voice or SMS methods to register the Microsoft Authenticator app.

**Starting in 2026**, after passkey profile migration completes, Microsoft-managed registration campaigns may instead prompt users to **register passkeys (FIDO2)**, depending on tenant configuration.

These registration prompts appear when the user is in scope of the Microsoft Authenticator policy, and they are in the process of performing a second factor authentication. 

Prior to passkey profile migration, administrators could configure snooze duration and enforce a limited number of snoozes for registration campaigns.

When the **Authentication Methods Registration Campaign** is set to **Microsoft managed** and passkey profile migration is complete:
- **Days allowed to snooze** is set to **1 day**
- **Limited number of snoozes** is set to **Disabled**
- These settings are **no longer configurable**

![new](/.attachments/AAD-Authentication/442914/new.png)

Users may continue to snooze registration prompts, but will receive **passkey registration nudges once per day** during eligible sign-in flows.

**Note**: Starting with the date of enforcement, users will be allowed 3 snooze attempts. This means that any users who have snoozed previous prompts hundreds of times will be required to register on the fourth prompt.

Enforcement for paid customers began rolling out in September 2023 and should compete by October 2023. This rollout give all tenants the ability to control if users have a limited number of snoozes or not. This is controlled by setting the new **Limited number of snoozes** setting to Enabled or Disabled. This deployment also updated the sign-in experience to show users how many snooze attempts remain.

![SnoozeRemainder](/.attachments/AAD-Authentication/442914/SnoozeRemainder.jpg)

Organizations that want a different behavior than Microsoft-managed defaults should take action **before** their tenants automatic passkey profile migration window:

- Opt in to **passkey profiles** early and configure the **Default passkey profile** passkeyType values explicitly.
- Review the **Authentication Methods Registration Campaign** configuration.

If you do not want the registration campaign to target passkeys:
- Set the campaign **State** to **Enabled** and explicitly target **Microsoft Authenticator**, or
- Set the campaign **State** to **Disabled**.

# Timeline

## Passkey profiles and synced passkeys GA
- Public cloud Worldwide: Early March 2026 through late March 2026
- GCC, GCC High, DoD: Early April 2026 through late April 2026

## Automatic migration for Passkeys (FIDO2) enabled tenants
- Public cloud Worldwide: Early April 2026 through late May 2026
- GCC, GCC High, DoD: Early June 2026 through late June 2026

## Microsoft-managed registration campaign updates
- Public cloud Worldwide: Early April 2026 through late May 2026


## What organizations can do to prepare

If you want a configuration different from Microsoft-managed defaults:

- Opt in to **passkey profiles** before your tenants automatic migration window
- Configure the **Default passkey profile** passkeyType values explicitly
- Review the Authentication Methods Registration Campaign state

If you do not want the registration campaign to target passkeys:
- Set the campaign state to **Enabled** and explicitly target Microsoft Authenticator
- Or set the campaign state to **Disabled**

Update internal runbooks and help desk documentation to reflect passkey availability and new registration behavio

## Public Documentation

- [Protecting authentication methods in Azure Active Directory](https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-default-enablement)

- [How to run a registration campaign to set up Microsoft Authenticator](https://learn.microsoft.com/en-us/azure/active-directory/authentication/how-to-mfa-registration-campaign)

- [Get authenticationMethodsPolicy](https://learn.microsoft.com/en-us/graph/api/authenticationmethodspolicy-get?view=graph-rest-1.0&tabs=http)

- authenticationMethodsRegistrationCampaign resource type API Documentation is found in the [Policies available to push users to set up authentication methods](https://learn.microsoft.com/en-us/graph/api/resources/authenticationmethodspolicies-overview?view=graph-rest-beta&preserve-view=true#policies-available-to-push-users-to-set-up-authentication-methods) document.


# Licensing

This is available in all tenants.

# Requirements

*Privileged Authentication Admins* and members of the new *Authentication Policy administrator* roles can configure a tenant level policy to enable Authenticator app registration campaigns.

# Limitations

Registration campaign prompts only appear during interactive sign-in flows where the user completes MFA.

The targeted authentication method depends on the **Authentication Methods Registration Campaign** configuration and, when **Microsoft managed**, on **passkey profile settings**.

**NOTE**: At this time the API documentation does not provide examples of how to issue a Get, Update or Delete for this setting. That information can be found in the Public Preview announcement page.

# Known Issues

### Issue 0: Users Who Close the Browser Are Not Prompted

Users who accept the prompt and begin the registration process, but close the browser before actually registering the Authenticator app will not receive the nudge until the number of days specified in snoozeDurationInDays at the time of that login passes. The same is true if the user closes the browser at the login screen that says **Not now**.

## Issue 1: Campaign Prompt Skipped

When making changes to snoozeDurationInDays, allow 5 minutes for the change to replicate across all data centers. After that, every MFA attempted by users included in the policy who have not already registered the Authenticator app will receive the prompt.

This is normal replication delay across all of Azure AD.

## Issue 2: Campaign Prompt Skipped when ExternalSecurityChallenge (ToU control) is Required, but Not Present 

When there is a CA Policy applied that requires ToU (Terms of Use) and such control is not present on the token, after MFA gets completed, nudge will be skipped and instead we'll see a requirement for ToU/ExternalSecurityChallenge (AADSTS50158).  

This is being evaluated under the ADO item https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2536394.

## Issue 3: Days allowed to snooze Ignored

Around June 15, 2023, all tenants not licensed for Azure AD Premium 1 or higher, who have the Microsoft Authenticator Registration campaign set to **Microsoft Managed**, and have the Microsoft Authenticator policy enabled, began prompting users who are only registered for Voice and/or SMS to install and register the Microsoft authenticator app. These registration prompts appear when the user is in scope of the Microsoft Authenticator policy, and they are in the process of performing a second factor authentication.

Starting with the date of enforcement, users will be allowed 3 snooze attempts. This means that any users who have snoozed previous prompts hundreds of times will be required to register on the fourth prompt.

Enforcement for Azure AD Premium 1 or higher customers will begin on August 7, 2023, and complete on October 30, 2023.

### Solution 3: Days allowed to snooze Ignored

Organizations that wish to avoid Nudges prompting users to install the Microsoft Authenticator app can implement one of two options prior to or after enforcement: 

1. Change the registration campaign from **Microsoft Managed** to **Disabled**. 

2. Create a group containing users that should not see the prompt and add the group to the **Excluded users and groups** section of the registration campaign. 

### Issue 4: Administrators who avoided registering Authenticator are blocked by Security defaults

Administrators may contact Support stating they wish to avoid registering the Microsoft Authenticator app, but they are blocked from signing in until they complete registration.

On July 10, 2023, all free and trial tenants, who have the Microsoft Authenticator [Registration campaign](https://portal.azure.com/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/RegistrationCampaign) set to **Microsoft Managed** began prompting users who are only registered for Voice and/or SMS to install and register the Microsoft authenticator app.

Free and trial tenants have Security Defaults enabled by default. This requires all users perform MFA to sign-in. After successfully performing MFA all users are prompted to register the authenticator app. Assuming the registration campaign still has default settings, the global administrator that is blocked from signing in will have snoozed thee previous registration prompts once per day. On the fourth day they are required to register the Microsoft Authenticator app. Their sign-in will appear like this.

![DevModeSignin](/.attachments/AAD-Authentication/442914/DevModeSignin.jpg =350x301)

#### Solution 4: Administrators who avoided registering Authenticator are blocked by Security defaults

Administrators that are unwilling to register the authenticator app, and are blocked from completing sign-in can do the following to gain access to the Azure portal where they can change the registration campaign:

1. Open an inprivate window in Microsoft Edge or Chrome browser.
2. Press Ctrl + Shift + I to open developer tools.
3. Use device emulation mode in Microsoft Edge or the device toggle toolbar in Chrome.

| Microsoft Edge | Chrome |
|-----|-----|
| Depending on the version of edge, click **OK** at the top of the browser or click the *Toggle device toolbar* icon on the ribbon at the top left.<br><br>![EdgeDevMode](/.attachments/AAD-Authentication/442914/EdgeDevMode.jpg) | Click the *Toggle device toolbar* icon on the ribbon at the top left.<br><br>![ChromeDevMode](/.attachments/AAD-Authentication/442914/ChromeDevMode.jpg) |

4. After device emulation mode is toggled on in the browser, the UX will change to emulate being in mobile device.
5. Now, type https://portal.azure.com in the address bar to open the portal.

**IMPORTANT**: Steps 1 to 4 <u>must</u> be complete before loading the Azure portal. Sign-in will be blocked if the portal is loaded prior to toggling device emulation mode on.

6. Provide Global Administrator credentials to login.

7. The administrator will be prompted to perform second factor authentication. Once the Admin is authenticated they will land in the Azure portal without being prompted to register the Microsoft authenticator app. Their sign-in will appear like this, no longer prompt for registration.

8. Direct the admin to **Azure Active Directory** -> **Security** -> **Authentication Methods** -> [**Registration campaign**](https://portal.azure.com/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/RegistrationCampaign). It is recommended that they click **Edit** and then click **Excluded users and groups** to exclude their Global Administrator account, or a group that it belongs to, from the registration campaign. Alternatively, the can set the the **State** to *Disabled*.

This issue is being tracked in [ICM 415054731](https://portal.microsofticm.com/imp/v3/incidents/details/415054731/home).

For more information about propelling users to register the Microsoft Authenticator app, see [Require users to register modern auth method](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=442914&anchor=require-users-to-register-modern-auth-method) below.

### Issue 5: Unexpected rollout to some US Gov tenants

While the rollout of Propel to premium tenants was underway it was discovered that Propel was released to US Gov tenants in Ring 1 to 4 without sending the appropriate communication ahead of time.

**Impact**: In a 24 hour period, 20k users across 1123 US Gov tenants saw a Propel interrupt.

**Next steps**:

- even though there were no customer escalations, this change is being rolled back for all US Gov tenants.
- This rollback is expected to complete by October 13, 2023.
- A M365 Message Center post will be sent to the 1123 tenants and their CSAMs will be notified.
- The plan is to deploy these changes to US Gov tenants in Early 2024 after the appropriate communications have been sent.

The list of impacted tenants is known. If you have a customer wanting to know if this change impacted them, contact the Vertical Lead for the [Identity Security and Protection](https://dev.azure.com/IdentityCommunities/Community%20Guide/_wiki/wikis/Community-Guide/526/Community-Definitions) community.

# User Experience

A user who has registered required security information on their account may not have registered the authentication method currently targeted by the registration campaign (for example, Microsoft Authenticator or passkeys). If the policy is Enabled and the user is listed under **includeTargets** in the policy, and not also listed under **excludeTargets**, they will see this flow the next time they sign-in and perform MFA validation.

- The user enters their UPN and after realm discovery takes place they enter their password.

![UsernamePassword](/.attachments/AAD-Authentication/442914/UsernamePassword.jpg =305x291)

- Next, the user is prompted to perform MFA validation.

![MFAvalidation](/.attachments/AAD-Authentication/442914/MFAvalidation.jpg =305x352)

- Once MFA validation is successfully completed, a user that satisfies the policy conditions stated above will receive a prompt to register the Microsoft Authenticator app.

    - If the user doesn't wish to register the Authenticator app at that time they can choose **Not now**. This action gets saved to the our Activity Store which ESTS uses to track when the user should be prompted next based off the `snoozeDurationInDays`. If they choose **Not now** they will receive the KMSI prompt.

    **Note**: Starting around June 15, 2023, all tenants not licensed for Azure AD Premium 1 or higher, who have the Microsoft Authenticator Registration campaign set to Microsoft Managed will begin prompting users who are only registered for Voice and/or SMS to install and register the Microsoft authenticator app. These registration prompts appear when the user is in scope of the Microsoft Authenticator policy, and they are in the process of performing a second factor authentication. Enforcement for Azure AD Premium 1 or higher customers will begin on August 7, 2023, and complete on October 30, 2023. Beginning with the date of enforcement, users will be allowed 3 snooze attempts. This means that any users who have snoozed previous prompts hundreds of times will be required to register on the fourth prompt. For more information, see [Require users to register modern auth method](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=442914&anchor=require-users-to-register-modern-auth-method).

    - If the user clicks **Next** they are taken into the credential registration flow where they register the Microsoft Authenticator app as an authentication method.

The September 2023 deployment where Propel was enabled for all Microsoft Managed tenants introduced an an updated propel prompt that informs the user of how many snoozes remaine before they are required to register the Authenticator app.

| New Nudge | Old Nudge |
|-----|-----|
| ![AdoptionNudge](/.attachments/AAD-Authentication/442914/AdoptionNudge.jpg =305x281) | ![SnoozeCount](/.attachments/AAD-Authentication/442914/SnoozeCount.jpg) |

- The first credential registration screen informs the user to download and install the Microsoft Authenticator app. This must be done because they will be taken to a Scan QR code screen that assumes the user performed this step.

![image.png](/.attachments/image-40acf6a7-96dd-42bf-9aa5-47f4e15873b9.png =489x235)

- If the user has the Microsoft Authenticator app installed they can use the camera on the device to scan th QR code that appears on screen, which adds their account to the app.

![ScanQRCode](/.attachments/AAD-Authentication/442914/ScanQRCode.jpg =493x354)

- Finally, once the user has registered the Authenticator app, they receive the Keep me Signed In (KMSI) prompt.

![KMSIcomplete](/.attachments/AAD-Authentication/442914/KMSIcomplete.jpg =306x277)

- At this point the user is signed into the resource that they needed to perform MFA validation for, and they have registered the Microsoft Authenticator app as their default authentication method.

# Objects and Attributes

## MSODS

This setting is configured on the **Default User Credential Policy** where all passwordless authentication policies are configured. This policy has a **policyType** of **UserCredentialPolicy** and a **policyTypeInt** of **24**.

Attributes and their Values that support this feature in the **policyDetail** JSON string:

> **Note**: The `"targetedAuthenticationMethod"` can be either `"passkeysFido2"` or `"microsoftAuthenticator"`.

```
    "registrationEnforcement": {
        "authenticationMethodsRegistrationCampaign": {
            "snoozeDurationInDays": 0,
            "state": "enabled",
            "excludeTargets": [
                {
                    "id": "d9f1ac41-####-####-####-############",
                    "targetType": "group"
                },
                {
                    "id": "6f6514b7-####-####-####-############",
                    "targetType": "user"
                }
            ],
            "includeTargets": [
                {
                    "id": "680860e0-####-####-####-############",
                    "targetType": "group",
                    "targetedAuthenticationMethod": "microsoftAuthenticator"
                },
                {
                    "id": "f94fded8-####-####-####-############",
                    "targetType": "user",
                    "targetedAuthenticationMethod": "microsoftAuthenticator"
                }
            ]
        }
    },
```

| Attribute | Value | Description |
|-----|-----|-----|
| <b>authenticationMethodsRegistrationCampaign</b> | N/A | The Graph object model that defines settings related to Authenticator app campaigns that prompt users to register a specific authentication method. |
| <b>snoozeDurationInDays</b> | 0 - 14 | Specifies the duration in days that a user can snooze the registration campaign after which they see the prompt to register the authentication method again. A value of 0 causes the user to be prompted for the registration campaign each time the perform MFA validation.<br><br>**Note**: Starting around June 15, 2023, all tenants not licensed for Azure AD Premium 1 or higher, who have the Microsoft Authenticator Registration campaign set to Microsoft Managed will begin prompting users who are only registered for Voice and/or SMS to install and register the Microsoft authenticator app. These registration prompts appear when the user is in scope of the Microsoft Authenticator policy, and they are in the process of performing a second factor authentication. Enforcement for Azure AD Premium 1 or higher customers will begin on August 7, 2023, and complete on October 30, 2023. When the Authentication Methods Registration Campaign is set to **Microsoft managed** and passkey profile migration is complete:<br><br>- **Days allowed to snooze** is set to **1 day**<br>- **Limited number of snoozes** is set to **Disabled**<br>- These settings are **no longer configurable**<br><br>Users may continue to snooze registration prompts, but will receive passkey registration nudges once per day during eligible sign-in flows. For more information, see [Force users to register modern auth method](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=442914&anchor=force-users-to-register-modern-auth-method). |
| <b>state</b> | Enabled or Disabled | Determines if the registration campaign is enabled or disabled. |
| <b>excludeTargets</b> |  | This section of the JSON contains an array of users and groups that are excluded from being targets of authentication method registration campaigns. |
| <b>includeTargets</b> |  | This section of the JSON contains an array of users and groups that are included as targets of authentication method registration campaigns. |
| <b>id</b> | ObjectID of a user or group | N/A | This contains one objectID of a user or group, depending on the <b>targetType</b> that belongs to it. |
| <b>targetType</b> | either user or group | Determines if the <b>id</b> specified is a user or a group. |
| <b>targetedAuthenticationMethod</b> |  | Specifies the targeted authentication method for the includeTargets. Currently, this only supports microsoftAuthenticator and is set by default. |

## ESTS

There's an Activity Store in EvoSTS that tracks registration campaign interrupt activity.

Depending on configuration, this may represent Microsoft Authenticator or passkey (FIDO2) registration prompts.

| Call | Value | description |
|-----|-----|-----|
| Unspecified | 0 | null |
| InterruptShown | 0x1 | Interrupt was shown. |
| UserRegisteredApp | 0x2 | User saw interrupt and went to MySecurityInfo and successfully registered authenticator app. |
| UserSkipped | 0x4 | User saw interrupt and clicked cancel. |
| IsNotInteractive | 0x8 | Skip interrupt since request is not interactive. |
| AppNotAllowedByCompanyPolicy | 0x10 | Skip interrupt since authenticator app is not allowed by company policy. |
| AppAlreadyRegistered | 0x20 | Skip interrupt since authenticator app is already registered. |
| RecentProofUp | 0x40 | Skip interrupt since user recently proofed up. This is used if the User just completed proof up that includes a round trip to MySecurityInfo |
| NoRegisterSecurityInfoAcr | 0x80 | Skip interrupt since RegisterSecurityInfo Access Control Record (ACR) is not satisfied. |
| Snoozed | 0x100 | Skip interrupt due to user selecting snooze (aka: <b>Note now</b>). |
| MaxSnooze | 0x200 | Interrupt shown because elapsed time is greater than max allowed snooze time. |

# Management

This policy will support the following options:

| Option | Choices | Description |
|-----|-----|-----|
| <b>State</b> | <b>Microsoft Managed (default)</b><br><br><b>Enabled</b><br><br><b>Disabled</b> | **Microsoft Managed** Select Microsoft managed 
apply Microsoft-defined defaults for registration targeting and enforcement. The targeted authentication method and user scope may change as new authentication methods (such as passkeys) are introduced Microsoft Managed is the default setting and allows Microsoft to begin and end enforcement of the feature.<br><br>Disabled can be used to stop Microsoft enforcement.<br><br>Select Enabled to enable the registration campaign for all users. Enabled turns the feature on independent of Microsoft enforcing it within ESTS. | 
| <b>Target</b> | <b>All users</b> or <b>Select users and groups</b> | Scopes the policy to all users in the tenant or to selected individual users and groups. |
| <b>Days allowed to snooze</b> | A range of 0 - 14 days to choose from. | Lets the administrator specify the number of days a user can snooze the registration promotion should they opt to not configure at that moment.<br><br>**Note**: Starting around June 15, 2023, all tenants not licensed for Azure AD Premium 1 or higher, who have the Microsoft Authenticator Registration campaign set to Microsoft Managed will begin prompting users who are only registered for Voice and/or SMS to install and register the Microsoft authenticator app. These registration prompts appear when the user is in scope of the Microsoft Authenticator policy, and they are in the process of performing a second factor authentication. Enforcement for Azure AD Premium 1 or higher customers will begin on August 7, 2023, and complete on October 30, 2023. Beginning with the date of enforcement, users will be allowed 3 snooze attempts. This means that any users who have snoozed previous prompts hundreds of times will be required to register on the fourth prompt. For more information, see [Force users to register modern auth method](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=442914&anchor=force-users-to-register-modern-auth-method). |
| <b>Authentication methods</b> | A multiple-choice list of authentication methods | drop-down containing a list of authentication methods with checkboxes that the administrator can choose from. Initially, this will contain just the *Authenticator app*. |

## Azure AD Portal

Have a global administrator navigate to the [Registration campaign](https://portal.azure.com/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/RegistrationCampaign) blade which is located in Azure AD Portal under **Security** \ **Authentication Methods**.

In September 2023 Propel was rolled out to all Production tenants, with the rollout for paid customers completing in October 2023. This caused users of all Microsoft Managed tenants to begin receiving prompts to register the Authenticator app. Administrators of all tenants now have the ability tp configure how snoozes are enforced using one of two options: 

1.	Users will have 3 snoozes before registration is required on 4th prompt
-or-
2.	Users can snooze indefinitely.

This is managed in the portal with a new **Limit number of snoozes** option, or by setting `EnforceRegistrationAfterAllowedSnoozes` with [Microsoft Graph API](https://learn.microsoft.com/en-us/azure/active-directory/authentication/how-to-mfa-registration-campaign#enable-the-registration-campaign-policy-using-graph-explorer). A setting of `True` requires the user register on the 4th prompt. `False` allows users to snooze registration indefinitely.

- **Entra ID Portal**

![LimitSnooze](/.attachments/AAD-Authentication/442914/LimitSnooze.jpg)

## Microsoft Graph API

### Permissions

Consent needs to be granted to the **Policy.ReadWrite.AuthenticationMethod** permission to read and update the Authentication methods policy.

### Update Policy (API)

**Action**: `PATCH`

**URI**: `https://graph.microsoft.com/beta/policies/authenticationmethodspolicy`

**Request Body**: 

> **Note**: The `"targetedAuthenticationMethod"` can be either `"passkeysFido2"` or `"microsoftAuthenticator"`.

```
{
	"registrationEnforcement": {
		"authenticationMethodsRegistrationCampaign": {
			"state": "enabled",
			"snoozeDurationInDays": 7,
			"includeTargets": [
				{
					"targetType": "group",
					"id": "680860e0-####-####-####-############",
					"targetedAuthenticationMethod": "microsoftAuthenticator"
				},
				{
					"targetType": "user",
					"id": "f94fded8-####-####-####-############",
					"targetedAuthenticationMethod": "microsoftAuthenticator"
				}
			],
			"excludeTargets": [
				{
					"targetType": "group",
					"id": "d9f1ac41-####-####-####-############"
				},
				{
					"targetType": "user",
					"id": "6f6514b7-####-####-####-############"
				}
			]
		}
	}
}
```

#### Enable/Disable Limited Number of Snoozes

**Action**: `PATCH`

**URI**: `https://graph.microsoft.com/beta/policies/authenticationmethodspolicy`

```json
{
    "registrationEnforcement": {
        "enforceRegistrationAfterAllowedSnoozes": false
    }
}
```

### View Policy (API)

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/policies/authenticationmethodspolicy`

**Result**: 

> **Note**: The `"targetedAuthenticationMethod"` can be either `"passkeysFido2"` or `"microsoftAuthenticator"`.

```
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#authenticationMethodsPolicy",
    "id": "authenticationMethodsPolicy",
    "displayName": "Authentication Methods Policy",
    "description": "The tenant-wide policy that controls which authentication methods are allowed in the tenant, authentication method registration requirements, and self-service password reset settings",
    "lastModifiedDateTime": "2021-01-29T22:26:39.0892048Z",
    "policyVersion": "1.4",
    "registrationEnforcement": {
        "authenticationMethodsRegistrationCampaign": {
            "snoozeDurationInDays": 7,
            "state": "enabled",
            "excludeTargets": [
                {
                    "id": "d9f1ac41-####-####-####-############",
                    "targetType": "group"
                },
                {
                    "id": "6f6514b7-####-####-####-############",
                    "targetType": "user"
                }
            ],
            "includeTargets": [
                {
                    "id": "680860e0-####-####-####-############",
                    "targetType": "group",
                    "targetedAuthenticationMethod": "microsoftAuthenticator"
                },
                {
                    "id": "f94fded8-####-####-####-############",
                    "targetType": "user",
                    "targetedAuthenticationMethod": "microsoftAuthenticator"
                }
            ]
        }
    },
```

### Disable the Registration Campaign (API)

**Action**: `PATCH`

**URI**: `https://graph.microsoft.com/beta/policies/authenticationmethodspolicy`

```json
{
    "registrationEnforcement": {
        "authenticationMethodsRegistrationCampaign": {
            "state": "disabled"
        }
    }
}
```

## Microsoft Graph PowerShell

### Update the Registration Campaign (POSH)

```powershell
Connect-MgGraph -Scope Policy.Read.All,Policy.ReadWrite.AuthenticationMethod

$params = @{
	registrationEnforcement = @{
		authenticationMethodsRegistrationCampaign = @{
			snoozeDurationInDays = 7
			state = "enabled"
			excludeTargets = @(
				@{
					id = "d9f1ac41-####-####-####-############"
					targetType = "group"
				}
				@{
					id = "6f6514b7-####-####-####-############"
					targetType = "user"
				}
			)
			includeTargets = @(
				@{
					id = "680860e0-####-####-####-############"
					targetType = "group"
					targetedAuthenticationMethod = "microsoftAuthenticator"
				}
				@{
					id = "f94fded8-####-####-####-############"
					targetType = "user"
					targetedAuthenticationMethod = "microsoftAuthenticator"
				}
			)
		}
	}
}

Update-MgBetaPolicyAuthenticationMethodPolicy -BodyParameter $params
```

### Disable the Registration Campaign (POSH)

**Note**: If this command was used to set the campaign state to `"disabled"`, it leaves the users and groups intact. To set the state to **Microsoft Managed**, which is the default and is now enabled on the service side, specify `"default"` as the state. To change the state to Enabled, specify `"enabled"`.

```powershell
Connect-MgGraph -Scope Policy.Read.All,Policy.ReadWrite.AuthenticationMethod

$registrationEnforcement = (Get-MgPolicyAuthenticationMethodPolicy).RegistrationEnforcement

$registrationEnforcement.AuthenticationMethodsRegistrationCampaign.State = "disabled"

Update-MgPolicyAuthenticationMethodPolicy -RegistrationEnforcement $registrationEnforcement
```

# Troubleshooting
  
To determine which users are not accepting the campaign prompt in an environment where all users are in the path of the policy, identify users who have registered an authenticator, the rest are those who are ignoring the prompt.

As soon as ESTS shows the Authenticator App Registration interrupt an `InterruptShown` timestamp is written to the Activity Store indicating "Interrupt Seen". At this point ESTS would not prompt until after snoozeDurationInDays expires.

## Troubleshooting

### Sign-in Logs

There is an active bug to extend the Sign-in event where multi-factor auth is performed to record if the user bypasses registration because they snoozed the registration prompt. It will shows as **Additional details**: `User has snoozed a registration campaign notification. User has 2 notifications left.`

### Azure Support Center (ASC)

#### Audit logs

From **Audit logs** filter for these things:

- **Service**: Authentication Methods
- **Category**: PolicyManagement
- **Activity**: Authentication Methods Policy Update OR Authentication Methods Policy Reset

An examination of **Modified Properties** shows the following:

| Target | Property Name | Old Value | New Value |
|-----|-----|-----|-----|
|  | AuthenticationMethodsPolicy | \<SNIP>"registrationEnforcement\":{\"authenticationMethodsRegistrationCampaign\":{\"excludeTargets\":[{\"id\":\"64d95700-ae53-4c81-a61b-7b37bd51a796\",\"targetType\":1},{\"id\":\"f117bb18-83e0-4fa9-b1d6-259ac2177970\",\"targetType\":0}],\"includeTargets\":[{\"id\":\"dd22991e-6e3d-43c6-b712-0d835a983cf4\",\"targetType\":1,\"targetedAuthenticationMethod\":\"microsoftAuthenticator\"},{\"id\":\"906e64b5-ad41-47c6-8d42-d66c2e638ead\",\"targetType\":0,\"targetedAuthenticationMethod\":\"microsoftAuthenticator\"}],\"**snoozeDurationInDays\":2**,\"enforceRegistrationAfterAllowedSnoozes\":true,\"state\":0}},\</SNIP> | \<SNIP>\"registrationEnforcement\":{\"authenticationMethodsRegistrationCampaign\":{\"excludeTargets\":[{\"id\":\"64d95700-ae53-4c81-a61b-7b37bd51a796\",\"targetType\":1},{\"id\":\"f117bb18-83e0-4fa9-b1d6-259ac2177970\",\"targetType\":0}],\"includeTargets\":[{\"id\":\"dd22991e-6e3d-43c6-b712-0d835a983cf4\",\"targetType\":1,\"targetedAuthenticationMethod\":\"microsoftAuthenticator\"},{\"id\":\"906e64b5-ad41-47c6-8d42-d66c2e638ead\",\"targetType\":0,\"targetedAuthenticationMethod\":\"microsoftAuthenticator\"}],\"**snoozeDurationInDays\":1**,\"enforceRegistrationAfterAllowedSnoozes\":true,\"state\":0}},\</SNIP> |

> **Note**: This behavior depends on what was changed. Updates to authentication methodspecific settings now record only the properties that were modified in **Modified Properties**. However, **policywide changes**, such as **Registration Campaigns** and **Systempreferred MFA**, continue to log the full Authentication Methods policy payload, even though they use the same **Authentication Methods Policy Update** or **Authentication Methods Policy Reset** audit activity.

## Graph Explorer

1. From the **Graph Explorer** node in the left hand pane of Tenant Explorer, enter this query:

- **Query URL**: `/policies/authenticationmethodspolicy`
- **Version**: `beta`

2. Select the **Msgraph Response - As Json** to format the results and locate the `registrationEnforcement` section of the authenticationMethodsPolicy object.

> **Note**: The `"targetedAuthenticationMethod"` can be either `"passkeysFido2"` or `"microsoftAuthenticator"`.

```json
    "registrationEnforcement": {
      "authenticationMethodsRegistrationCampaign": {
        "snoozeDurationInDays": 7,
        "state": "enabled",
        "excludeTargets": [
          {
            "id": "d9f1ac41-###-####-####-############",
            "targetType": "group"
          },
          {
            "id": "6f6514b7-###-####-####-############",
            "targetType": "user"
          }
        ],
        "includeTargets": [
          {
            "id": "680860e0-###-####-####-############",
            "targetType": "group",
            "targetedAuthenticationMethod": "microsoftAuthenticator"
          },
          {
            "id": "f94fded8-###-####-####-############",
            "targetType": "user",
            "targetedAuthenticationMethod": "microsoftAuthenticator"
          }
        ]
      }
    },
```

#### Policy Object

For a raw view of the policy, search for the **Default User Credential Policy** policy under the **Directory object** node using the **Policy** tab and examine the  **policyDetail** JSON string for the values mentioned in the [Objects and Attributes](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageID=404395&anchor=objects-and-attributes) table.

#### Authentication Methods

Select the **Microsoft Authenticator passwordless** tab under **Sign-ins** | **Authentication Methods**.  The policy settings should be exposed on the **Settings** tab.

#### Authentication Diagnostics (ASC)

When examining a user's sign-in where the Authenticator app evaluation takes place, look for this activity in ASC under **Sign-ins** | **Diagnostics* using the CorrelationID or User's UPN and the Date/Time of the sign-in.

How to determine how many registration attempts user has snoozed since enforcement of 3 snoozes started in ESTS.

1. Find a sign-in event where second factor authentication was performed.
2. Click Authentication diagnostic
3. Select the **Call** `SAS:ProcessAuth` with an **ErrorCode** of `AuthenticatorAppRegistrationRequiredInterrupt` and ErrorNumber is `50203`
4. Click **Expert View** and then select the **Diagnostic logs** tab.
5. Locate the snooze count by filtering for *Registration*.

User who have snoozed three previous registration prompts and is performing a second factor validation will be required to register. 

```json
Execute Policies    UCP RegistrationCampaignEvaluationResult state:Enabled DoesUserHaveOnlyTelecomMethodsRegisteredAndUsable:True.
Execute Policies    RegistrationInterruptCount:3 is over the threshold. We will not allow user to skip registration.
```

User who snoozed two previous registration prompts and is performing a second factor validation.

```json
Execute Policies    UCP RegistrationCampaignEvaluationResult state:Enabled DoesUserHaveOnlyTelecomMethodsRegisteredAndUsable:True.
Execute Policies    Setting RegistrationInterruptCount to 2 in activityStore.
```

# PG and Support Collaboration

Collaboration with the PG is available from the [Multi-Factor Authentication](https://teams.microsoft.com/l/channel/19%3a6e6465cd694246e38ed66cdfdf7f272d%40thread.skype/Multi-Factor%2520Authentication?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) teams channel under **Cloud Identity - Authentication** via Ava.

# Root Cause Tree

When closing a support incident for the Authenticator app registration campaign, make sure the Support Topic is set to either **Azure Active Directory Sign-In and Multi-Factor Authentication** \ **Multi-Factor Authentication** \ **MFA Registration** or **Azure Active Directory Sign-In and Multi-Factor Authentication** \ **Multi-Factor Authentication** \ **Authentication methods - Authenticator App**.  Once the support topic is set, use the Root Cause Tree of **CID Sign In and MFA** \ **MFA** \ **Configuring Azure MFA Settings** \ **Configuring verification methods**.

# ICM Path

## Policy Configuration

Set the Support Topic of the case to one of these and file an ICM:

- **Azure Active Directory Sign-In and Multi-Factor Authentication** \ **Multi-Factor Authentication** \ **MFA Registration**

-OR-

- **Azure Active Directory Sign-In and Multi-Factor Authentication** \ **Multi-Factor Authentication** \ **Authentication methods - Authenticator App**

Alternatively, support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=f3W1F2) to file an ICM.

TAs should route these ICMs here:

**Owning Service**: Azure MFA
**Owning Team**: MFA On-call Engineers (MFA Support requests)

## ESTS Fails to Honor the Policy

Set the Support Topic of the case to one of these and file an ICM:

- **Azure Active Directory Sign-In and Multi-Factor Authentication** \ **Multi-Factor Authentication** \ **Unable to sign-in to an application due to MFA**

Alternatively, support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=83L3k1) to file an ICM.

TAs should route these ICMs here:

**Owning Service**: ESTS
**Owning Team**: Incident Triage

# Training

## Deep Dive 04410 - Require users to register modern auth method

This more recent training session covers two features:

1. Changes to the Microsoft Authenticator Registration Campaign, which will require users to register Microsoft Authenticator as a modern authentication method.  Once the SAS service starts treating **Microsoft Managed** as enabled for free tenants, on or around July 10, 2023, users will be able to snooze registration of the Microsoft Authenticator 3 times before they will be required to register it.

2. A change in behavior to the Phone Authentication method which presents the user with a sign-in option of **Call or Text +X XXXXXXXX92** and the backend SAS service decides which one is more cost effective to send to the user.  If voice, the user will hear a 6-digit code read to them which they must enter to complete the sign-in. This will not impact NPS Extension which will continue to use traditional voice where the user only has to press pound "#".

**Title**: Deep Dive 04410 - Require users to register modern auth method

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 22 minutes

**Audience**:Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)

**Training Completion**: July 10, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAl6w22)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

# Support Routing

| Queue Names | Support Area Paths |
|-----|-----|
| [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) | <b>Path:</b> Azure\Azure Active Directory Sign-In and Multi-Factor Authentication\Multi-Factor Authentication (MFA)\MFA Registration <br><br>-OR-<br><br> <b>Path:</b> Azure\Azure Active Directory Sign-In and Multi-Factor Authentication\Multi-Factor Authentication (MFA)\Authentication methods - Authenticator App |

## Deep Dive Authenticator app Registration Campaign for tenants

This was the original training session for Registration Campaign.

**Title:**Deep Dive Authenticator app Registration Campaign for tenants

**Course ID**: S9207742

**Format:**Self-paced eLearning

**Duration:**51 minutes

**Audience:**Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752),  [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751), [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072) and [MSaaS Mooncake BC Escalation](https://msaas.support.microsoft.com/queue/7f624f7a-6a9a-e711-812f-002dd8151753).

**Microsoft Confidential** Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability:** March 29, 2021

**Training Completion:**March 29, 2021

**Region**: All regions

**Course Location:**[SuccessFactors](https://aka.ms/AAbkalx)

**Title:**Deep Dive Passkey Registration Campaign for Microsoft-managed campaigns
  
**Course Location:** [Deep Dive Session](https://aka.ms/AA107cja)
