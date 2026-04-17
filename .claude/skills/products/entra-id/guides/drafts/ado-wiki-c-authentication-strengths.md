---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Authentication Strengths"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Authentication%20Strengths"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.Authstrengths
- SCIM Identity
- Conditional Access
-  Authentication Strengths
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) [Passwordless](/Tags/Passwordless) [comm-strauth](/Tags/comm%2Dstrauth)                                                                         



[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

Authentication Strengths are a new grant control in Conditional Access which allow admins to configure which combinations of authentication methods are required when users sign in.

Today, in Azure AD, an admin can require MFA for users when accessing a resource by creating a Conditional Access policy. Users can satisfy this MFA requirement by using a variety of authentication methods (for example, password + SMS or FIDO2 both satisfy the MFA requirements). Authentication Strengths allow admins to differentiate between the different authentication methods that can be used based on the application the user is accessing, the user's risk or any of the additional rich contexts that Conditional Access offers.

___

# Authentication Strengths for external identities

Currently, authentication strength policies can only be applied to external users who authenticate with Azure AD. For email one-time passcode, SAML/WS-Fed, and Google federation users, use the MFA grant control to require MFA.

When an authentication strength policy is applied to an external Azure AD user, the policy works together with [MFA trust settings](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/cross-tenant-access-settings-b2b-collaboration#to-change-inbound-trust-settings-for-mfa-and-device-claims) in the cross-tenant access settings of the resource tenant to determine where and how the external users must perform MFA. An Azure AD user first authenticates using their own account in their home Azure AD tenant. Then when this user tries to access your resource, Azure AD applies the authentication strength Conditional Access policy and checks to see if MFA trust has been enabled in your tenant. 

In external user scenarios, the authentication methods that are acceptable for fulfilling authentication strength vary, depending on whether the user is completing MFA in their home tenant or the resource tenant. The table below identifies acceptable methods for each tenant. If a resource tenant has opted to trust claims from external Azure AD organizations, only those claims listed in the **Home tenant** column below will be accepted by the resource tenant for MFA fulfillment. If the resource tenant has disabled MFA trust, the external user must complete MFA in the resource tenant using one of the methods listed in the **Resource tenant** column.

| Authentication method | Home tenant | Resource tenant |
|------|------|------| 
| SMS as second factor |  |  | 
| Voice call |  |  | 
| Microsoft Authenticator push notification |  |  | 
| Microsoft Authenticator phone sign-in |  |  | 
| OATH software token |  |  | 
| OATH hardware token |  |  |
| FIDO2 security key |  |  |
| Windows Hello for Business |  |  |

___

# Updates

**January 2024**: An enhancements has been added to the CBA authentication strengths configuration.  Administrators can now specify specific certificate issues for the auth strength policy.  The issuer is identified via the **Policy OID** or the **Issuer** of the certificate.  For more information please see: [Authentication Strengths Conditional Access CBA Advanced Options](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=1256163).
___

# Updates between public preview and GA

Authentication strength will reach General Availability at the end of March 2023.

When GA is announced the list of items in this section will occur, and it will coincide with a Public Preview of new auth strength combinations for Certificate Based Authentication.

- Authentication strength will be deployed in all US Gov clouds, including Air-gapped. Not in Mooncake.

- Authentication strength APIs will be in "v1.0" (aka: Generally Available)

- The following Authentication strength API changes will be backported to "beta" where they will co-exist with new auth strength combinations for Certificate Based Authentication. The beta functionality that does not move to "v1.0" will be deprecated in 36 months. These items are:

	- Update combination 
	- Search by auth method

- Conditional Access dashboard will get a new filter which allows admins to filter sign-ins by Authentication strength.
- Sign-in logs will have more details about the authentication strength result:  
	- The Conditional Access policy details blade now includes additional information about the result (under the grant control details).
	- In the Sign-in logs API, we now have a new property called `"authenticationStrengthResult"` which will contain these values:

  | Name | Value | Description |
  |-----|-----|-----|
  | notSet | 0 | There is no authentication strength in the CA policy |
  | skippedForProofUp | 1 | Authentication strength was skipped because the user is registering a new method |
  | satisfied | 2 | The authentication strength is satisfied |
  | singleChallengeRequired | 3 | The authentication strength required a single challege |
  | multipleChallengesRequired | 4 | The authentication strength required multiple challeges |
  | singleRegistrationRequired | 5 | The authentication strength required a single registration |
  | multipleRegistrationsRequired | 6 | The authentication strength required multiple registrations |
  | cannotSatisfyDueToCombinationConfiguration | 7 | The authentication strength could not be satisfied due to a combination configuration |
  | cannotSatisfy | 8 | The authentication strength could not be satisfied |
  | unknownFutureValue | 9 | Unknown future value. | 

- Conditional Access UX will provide hints that will prevent customers from creating a policy that could block them out, as a result of authentication strength. For example: The methods in the strength are not enabled in the tenant. 

- Some methods are not supported in the 2nd factor list (i.e. password). As a result, if the user needs to use these, ESTS is not able to prompt them and they are blocked. An improved error message will indicate to the user they should restart their session and what method they should select. 

- Preventing registration of an authentication method based on authentication strength requirement if there is a risk in the session. This will matching the MFA registration behavior. 

- What-if tool will provide additional details on the user's ability to satisfy the authentication strength requirement. For example, it will show the user is enabled by the authentication method policy + registered the method.  

- Authentication strength blade will be linked under the Conditional Access menu. 

- Sign-in frequency will work with authentication strength. When the user's session-in frequency time has expired, their session has expired. They will need to reauthenticate with the required method as determined by authentication strength. Any previously used method is no longer considered when deciding if the user should be prompted or not.  

- Security Info shows better error messages for users on methods they need to registered but cannot be registered from the Security Info  wizard mode.

- Improved logic around authentication strength policy for Security info:

Previously customers could have 2 policies: 

  - Policy 1 targeting all apps, requires authentication strength of FIDO2. 

  - Policy 2 targeting security info, requires authentication strength of TAP or FIDO2.
  
  Conditional Access requires all the set of conditions from all the policies that applied on the sign-in. This resulted in the user being required to satisfy both policies. Meaning, in order to register a FIDO2 key they had to have a FIDO2 key registered. When there are multiple Conditional Access policies that apply on a sign-in to the Security Info page, with multiple authentication strength requirements, ESTS only requires the user to satisfy the authentication strength requirement for Security info. Any other grant control is not overridden and requirements from multiple policies still apply.   

- Conditional Access templates has a new template for **Require phishing-resistant authentication for admins**. 

- Items that will have been Fixed: 

  - Hardware OATH is a supported method for authentication strength. 

  - Bugs with Windows Integrated Authentication (WIA) authentication mapping to the "federated single factor" authentication method mode. 

  - It will now be possible to create a Conditional Access policy that contains Authentication Strength grant control with the OR (any other grant control). 

  - Loop issue for users who need to register the Authenticator app Phone Sign-in (PSI). User will now get an error message indicating they need to register the method. **Note**: The registration of PSI is currently not supported in the Security Info  wizard mode.

  - Sign-in logs **Details** tab > **Requirement** column will now show all authentication strengths policies that were applied on the sign-in. 

One bug will be fixed shortly after GA: 

- In some cases, where FIDO2 restrictions are applied, the key the user has used is not carried in the token and as a result the user get prompted again to use the same key. 

## New Authentication Strength Combinations

Two new Authentication strength combinations appear in the list of Multifactor authentication strengths.

![<!--alt text start -->Your alternate text description<!--alt text end -->](/.attachments/AAD-Authentication/712194/NewCBAStrengths.jpg =1063x500)
![NewCBAStrengths](/.attachments/AAD-Authentication/712194/NewCBAStrengths.jpg =1063x500)

### Password + Certificate-based authentication (single factor)

Customers that want to enforce more than one single factor can use this. To complete a sign-in the user must present their password and a certificate. 

**Possible scenarios**:

-	Assume a device is stolen, an attacker would still need to know the user's password to sign-in.

-	Assume an attacker knows a user's password, but the attacker doesn't have the device where the user has a certificate and can't complete sign-in.

-	On Mobile and macOS there is no way to secure the certificate on the device with a PIN. Having more than one factor helps to make sure its pure MFA.

### Password + Certificate-based authentication (multi-factor) 

A user must sign-in using their password first and then supply a certificate which would result in their getting an "mfa" claim.

After the user supplies their password, they will see a prompt to Use a certificate or smart card.

![CertPrompt](/.attachments/AAD-Authentication/712194/CertPrompt.jpg)

Once the user clicks the prompt they will receive another prompt showing their certificate store. 

![CertStore](/.attachments/AAD-Authentication/712194/CertStore.jpg)

After selecting the correct certificate from their store and clicking **OK** the sign-in should complete.

### AAD Sign-in logs

This sign-in generates three sign-in events.

The first is a Single-factor authentication sign-in event that shows a **Status** of *Interrupted*. The **Authentication Details** tab of this event will show **X.509 Certificate** under the *Authentication method* column.

Next is a Multifactor authentication sign-in event that immediately follows. It shows a **Status** of *Interrupted*. The Authentication Details tab of this event will show **Password**, **X.509 Certificate** and **Other** under the *Authentication method* column, with the **Requirement** column listing the combination of methods enforced by the authentication strength.

![AuthDetailsCBA2FA](/.attachments/AAD-Authentication/712194/AuthDetailsCBA2FA.jpg)

Finally, a Multifactor authentication sign-in event shows a **Status** of *Success*.

### Known Issues

#### Issue 1: Sign-in fails using a certificate as first factor

Supplying the certificate instead of a password for the first factor causes sign-in to fail with this error:

| Text | Image|
|-----|-----|
| username@contoso.com<br><br>**Let's try something else**<br><br>Another sign-in method is required to access this<br>resource. Close your browser and try again, but<br>choose another way to sign-in.<br><br>- Use my password.<br><br>Sign out and sign in with a different account<br>More details | ![TrySomethingElse](/.attachments/AAD-Authentication/712194/TrySomethingElse.jpg) |

#### Issue 2: Certificate validation failed

If a new user has no certificate and Authentication strength has either Password + Certificate-based authentication (single factor) or Password + Certificate-based authentication (multi-factor) defined, the user will see this error when they are not able to supply a certificate.

**Note**: This is the same error the user will see if no cert even with CBA as first factor.

| Text | Image|
|-----|-----|
| Certificate validation failed<br><br>Try again by doing the following:<br><br>1. Close the current browser<br>2. Open a new browser to sign in<br>3. Select the certificate<br><br>If you are using a smart card, make sure it is inserted<br>correctly.<br><br>Sign out and sign in with a different account<br>More details | ![CertValidationFail](/.attachments/AAD-Authentication/712194/CertValidationFail.jpg) |

___

# Requirements

- Azure AD Premium 1 or higher
- Combined registration must be enabled for the user signing-in for the **Require authentication strength** grant control to work correctly. Microsoft strongly recommends admins navigate to [User features](https://portal.azure.com/#view/Microsoft_AAD_IAM/FeatureSettingsBlade) and set **Users can use the combined security information registration experience** to **All users** rather than just a **Selected** group.

___

# Limitations

- A maximum of 15 custom authentication strength policy objects can be created, in addition to the three that are built-in.
![LimitAuthNumbers](/.attachments/AAD-Authentication/712194/LimitAuthNumbers.png)
___

# Azure AD Role Requirements

- Conditional Access Administrators can perform CRUD operations on Authentication strength policy objects.
- Global Reader and Security Reader can read the authentication strength policy objects.

___

# Supported Scenarios

The following scenarios are supported using Microsoft Graph API and the Azure Portal:

- Create Conditional Access Policy with Built-in Authentication Strength
- Create Custom Authentication Strength
- Create Conditional Access Policy with Custom Authentication Strength
- Enforce Authentication Strengths across tenants (B2B)

___

## Supported External User Scenarios

- B2B invited guests 
- B2B self-service sign up 
- B2B direct connect

___

# Common Use Scenarios

* An organization's sensitive apps must comply with regulated authentication requirements.
* An organization requires a specific MFA method be used when a user is performing a sensitive action
  within an application.
* Users in an organization must use a specific MFA method when accessing sensitive apps
  outside of the corporate network.
* The organization requires single factor and multi-factor certificate based authentication be used to access sensitive applications, or the organization requires gated access, only if the users performs multi-factor cert-based authentication.
* The organization requires stronger authentication methods when the user is in high risk.
* The organization wants to enforce Authenticator App for accessing specific SaaS app (e.g. Salesforce).

___

# Limitations of Conditional Access policies

Conditional access policies are only evaluated <u>after</u> the initial authentication. This means that authentication strengths will not restrict the authentication method used for the user's first factor. For example, if the admin uses a phishing-resistant built-in strength, it will not prevent a user from typing 
in their password. Instead, they will be required to use a FIDO2 key before they can continue.

___

# Known Issues

When associating one of the following authentication methods to an authentication strength, this authentication strength will not appear on the CA authentication strength dropdown field:

1. CBA Single Factor
2. SMS
3. Password
4. Federated Single Factor
![ATList](/.attachments/AAD-Authentication/712194/atlist.png)
![ATnotappearing](/.attachments/AAD-Authentication/712194/ATnotappearing.png)

___

# User Experience

This describes what the end-user will see if authentication strength is required:

**NOTE**: In this scenario the Authentication strength that is defined in CA policy is **Phishing-resistant MFA**, which has a Grant control requiring WHfB or FIDO2 or CBA MFA to be satisfied.

1. The user will be required to enter their password first (complete first factor authentication).
2. If the user has previously completed this authentication strength and the accept MFA trust setting is turned on, they will not be prompted. 
3. If the user is registered for an applicable MFA method (e.g., they already have a FIDO2 key), then they will be challenged to complete MFA using one of their applicable methods if the accept MFA trust setting is turned on. 
4. If the user is not registered for an applicable MFA method (e.g. a FIDO2 key), then they will encounter a second factor challenge, followed by this prompt:

| Text | Image |
| :-----: | :-----: |
| **Keep your account secure**<br><br>Your organization requires you to setup the following methods of proving who you are.<br><br>Additional authentication is required to complete this sign-in. [Learn how to setup a security key (FIDO2)](https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless), then go to https://aka.ms/mysecurityinfo to add the authentication method to your account.  | ![KeepSecure](/.attachments/AAD-Authentication/712194/KeepSecure.jpg) |

  - At this time, there is only support for registering additional information in registration wizard (support Authenticator push, SMS, Voice, Software OTP), and show error message for the rest of methods. 
  - Turing on cross tenant access settings to accept MFA claims will trigger registration flows in the home tenant. These users will never MFA in the resource tenant.

5. If the user is not allowed to use, nor register, for any of the authentication methods required by the authentication strength, the user will be blocked. 

___

# Types of Authentication Strengths

## 1) Built-in Strengths

Microsoft has already three combinations of authentication methods. These combinations are always available and cannot be modified. This chart shows which methods/combinations are included in each of the built-in Authentication Strengths. End users only need to satisfy one of these methods when the strength enforced by a Conditional Access policy.

| Authentication Method Combination | Multi-factor authentication strength | Passwordless authentication strength | Phishing resistant authentication strength |
|-----|-----|-----|-----|
| Windows Hello for Business | |  |  |
| FIDO2 security key | |  |  |
| x509 Certificate (multi-factor) |  |  |  |
| Passwordless sign-in with the Microsoft Authenticator App |  |  |  |
| Temporary Access Pass (single or multi-use) |  |  |  |
| Password + Something you have note |  |  |  |
| Federated multi-factor authentication |  |  |  |
| Federated single-factor authentication+ Something you have note |  |  |  |
| x509 Certificate (single-factor) |  |  |  |
| SMS sign-in |  |  |  |
| Password |  |  |  |
| Federated single-factor authentication |  |  |  |
| Email One-time pass (Guest) |  |  |  |

**Note**: Something you have refers to one of the following methods: SMS, Voice, Push notification, Software or Hardware-based OATH token

The following API call can be used to list definitions of all the built-in Authentication Strength by calling this API endpoint:

**Action**: `GET`

**URI**:`https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies?$filter=policyType eq 'builtIn'`

### Built-in Authentication Strengths Policy Objects

| Display Name | Description | ObjectID | Allowed Combinations |
|------|-----|-----|-----|
| Multi-factor authentication | Combinations of methods that satisfy strong authentication, such as a password + SMS" | 00000000-0000-0000-0000-000000000002 | "windowsHelloForBusiness"<br>"fido2"<br>"x509CertificateMultiFactor"<br>"x509CertificateMultiFactor"<br>"deviceBasedPush"<br>"temporaryAccessPassOneTime"<br>"temporaryAccessPassMultiUse"<br>"password<br>microsoftAuthenticatorPush"<br>"password<br>softwareOath"<br>"password<br>hardwareOath"<br>"password<br>sms"<br>"password<br>voice"<br>"federatedMultiFactor"<br>"microsoftAuthenticatorPush<br>federatedSingleFactor"<br>"softwareOath<br>federatedSingleFactor"<br>"hardwareOath<br>federatedSingleFactor"<br>"sms<br>federatedSingleFactor"<br>"voice<br>federatedSingleFactor" |
| Passwordless MFA | Passwordless methods that satisfy strong authentication, such as Passwordless sign-in with the Microsoft Authenticator | 00000000-0000-0000-0000-000000000003 | "windowsHelloForBusiness"<br>"fido2"<br>"x509CertificateMultiFactor"<br>"deviceBasedPush" |
| Phishing resistant MFA | Phishing-resistant, Passwordless methods for the strongest authentication, such as a FIDO2 security key | 00000000-0000-0000-0000-000000000004 |  | "windowsHelloForBusiness"<br>"fido2"<br>"x509CertificateMultiFactor" |

## 2) Custom Authentication Strengths

In addition to the three built-in authentication strengths, admins can create their own custom authentication strengths to exactly suit their requirements. Custom strengths can contain any of the combinations in the above table. Custom authentication strengths can be created in the Azure Portal or via the MS Graph API. Custom authentication strengths van be added to any Conditional Access policy.

___

# Manage Authentication Strengths

1. Sign-in to the Azure AD Portal as a *Conditional Access Administrator* or *Authentication Policy Administrator* and navigate to the [Security](https://portal.azure.com/#view/Microsoft_AAD_IAM/SecurityMenuBlade/~/GettingStarted) blade.
2. Select **Authentication Methods**
3. Select the new **Authentication strengths** blade.

![AuthStrengthBlade](/.attachments/AAD-Authentication/712194/AuthStrengthBlade.jpg)

4. The **Authentication strengths** blade currently exposes three *Built-in* Authentication strengths and any *Custom* authentication strength policy objects created in the organization. The **Conditional access policies** column shows which conditional access polices are using that authentication strength.

![AuthStrengthMgmt](/.attachments/AAD-Authentication/712194/AuthStrengthMgmt.jpg)

___

## Microsoft Graph API (List & Get)

### List all

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies`

### List Built-in

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies?$filter=policyType eq 'builtIn'`

### List Custom

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies?$filter=policyType eq 'custom'`

### Get a specific authentication strength policy object

**Action**: `GET`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies/{authentication-strength-id}`

___

## Azure Portal (Create)

1. Click **New authentication strength** to launch the *New authentication strength* wizard.
2. Select one more more authentication strengths to include.

**NOTE**: FIDO2 Security Key provides an **Advanced option** which supports a list of Authenticator Attestation GUIDs (AAGUIDs) that can be used to satisfy this authentication strength. Security keys with AAGUIDs not in this list will not be usable to satisfy this authentication strength.

Different hardware vendors will have public documentation on the Authenticator Attestation GUIDs (AAGUID) they support. 

- [YubiKey Hardware FIDO2 AAGUIDs](https://support.yubico.com/hc/en-us/articles/360016648959-YubiKey-Hardware-FIDO2-AAGUIDs)

3. (optional) Click **Allowed FIDO2 Keys** to add individual AAGUID values. Click the **+** sign to add additional AAGUIDs to the list.
4. Click **Save**.

___

## Microsoft Graph API (Create)

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies`

**Request body**:

```json
{
    "displayName": "Custom auth strength",
    "allowedCombinations": [
        "fido2",
        "password, sms",
        "x509CertificateMultifactor"
    ]
}
```

___

## Azure Portal (Update)

![Update](/.attachments/AAD-Authentication/712194/Update.jpg)

___

## Microsoft Graph API (Update)

### Update existing custom authentication strengths policy objects

**Action**: `PATCH`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies/{authentication-strength-id}`

**Request body**:

```json
{
 "displayName": "Secret app authentication level",
 "description": "Authentication level allowed to our secret apps"
}
```

___

### Update combinations for existing custom authentication strength policy objects

This method uses the `/updateAllowedCombinations` action.

**Action**: `POST`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies/{authentication-strength-id}`

**Request body**:

```json
{
  
 "allowedCombinations": [
 "password, microsoftAuthenticatorPush",
 "password, hardwareOath",
 "password, sms",
 "password" 
}
```

___

## Azure Portal (Delete)

![Delete](/.attachments/AAD-Authentication/712194/Delete.jpg)

___

## Microsoft Graph API (Delete)

Delete an existing custom authentication strength policy object.

**Action**: `DELETE`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/authenticationStrengths/policies/{authentication-strength-id}`

___

# Configure Cross tenant access inbound trust MFA settings

This is only needed if inbound MFA claims are to be trusted from B2B partner organizations.

If cross-tenant access settings for B2B collaboration have already been defined, configure the global cross-tenant access setting to trust *inbound MFA claims* by default in your tenant, or configure this policy setting for a specific Azure AD organization that your organization collaborate with.

**NOTE**: If cross-tenant access settings for B2B collaboration have not been configured, refer to the [Configure B2B collaboration cross-tenant access](https://docs.microsoft.com/en-us/azure/active-directory/external-identities/cross-tenant-access-settings-b2b-collaboration) public document to configure this.

___

## Global Inbound Access Settings

Setting this will trust inbound MFA claims from all organizations that your organization collaborates with.

1. Navigate to Azure Active Directory portal and select [External Identities](https://portal.azure.com/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/ExternalIdentitiesGettingStarted).
2. Select the **Cross-tenant access settings** blade.
3. Select the **Default Settings** tab. Under the **Inbound access settings** section click **Edit inbound defaults**.

![GlobalXTPolicy](/.attachments/AAD-Authentication/712194/GlobalXTPolicy.jpg)

4. From the *Inbound access settings - Default settings* wizard, select the **Trust settings** tab.
5. Place a check next to the **Trust multifactor authentication from Azure AD Tenants** option.
6. Click **Save**.

![GlobalXTPolicyIn](/.attachments/AAD-Authentication/712194/GlobalXTPolicyIn.jpg)

___

## Tenant Specific Inbound Access Settings

Setting this will trust inbound MFA claims from one specific organization that your organization collaborates with.

1. Navigate to Azure Active Directory portal and select [External Identities](https://portal.azure.com/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/ExternalIdentitiesGettingStarted).
2. Select the **Cross-tenant access settings** blade.
3. Select the **Organizational settings** tab.
4. Under the **Inbound access** column, select the *Configured* link to the right of the external organization that your organization will trust inbound MFA claims from.
5. From the *Inbound access settings - {tenantname}* wizard, select the **Trust settings** tab.
6. Place a check next to the **Trust multifactor authentication from Azure AD Tenants** option.
7. Click **Save**.

![TSXTPolicy](/.attachments/AAD-Authentication/712194/TSXTPolicy.jpg)

8. From the **Default Settings** tab click **Edit inbound defaults**. 

___

# Enforce Authentication Strengths in CA Policy

**IMPORTANT**: Microsoft discourages applying authentication strengths to **All cloud apps** in Conditional Access. When an authentication strength applies to all applications and the user is not registered for any of its methods, the user will get stuck in a loop if they access any application.

## Azure Portal

1. Create a conditional access policy.
2. Select the **Grant** control and select **Require authentication strength**.
3. Select the drop-down to the right of **Require authentication strength** and select the desired authentication strength, then **Save** the policy.

**NOTE**: The **Require multifactor authentication** control will be disabled and cannot be used. 

![CAAuthStrenth](/.attachments/AAD-Authentication/712194/CAAuthStrenth.jpg)

___

## Microsoft Graph API

Update an existing CA policy to add an authentication strength. The `"authenticationStrength"` setting in the request body should contain the `'id'` of the authentication strength policy object.

**Action**: `PATCH`

**URI**: `https://graph.microsoft.com/beta/identity/conditionalAccess/policies/{ca-policy-id}`

**Request body**:

```json
{
 "grantControls": {
 "builtInControls": [],
 "authenticationStrength": {"id": "00000000-0000-0000-0000-000000000004"}
 }
}
```
___

## Cross-Tenant Enforcement

1. Create a conditional access policy.
2. Select the **Users or workload identities** blade in the conditional access policy wizard.
3. Under *Include* choose **Select users and groups**, then place a check next to **Guest or external users**. 

From the drop-down, select **B2B collaboration guest users**.

- Under *Specify external Azure AD organizations* chose **All** if the global *Cross tenant access inbound trust settings* were used.
- If *Tenant Specific Inbound Access Settings* were defined, chose the **Select** radio button.
- In the *Select Azure AD organization* wizard, either type the full tenant name or enter the tenant ID, then click **Select**.

4. Select the **Grant** control and select **Require authentication strength**.
5. Select the drop-down to the right of **Require authentication strength** and select the desired authentication strength, then **Save** the policy.

![GuestCAPolicy](/.attachments/AAD-Authentication/712194/GuestCAPolicy.jpg)

___

# Audit events

Azure AD Audit events are coming for management of Authentication strengths.

___

# Sign-in Logs

![AuthDetails](/.attachments/AAD-Authentication/712194/AuthDetails.jpg)

___

# Troubleshooting

## Authentication Strengths (ASC)

Currently, **Authentication Strengths** is a tab that was wrongly placed under **Sign-ins**\\**Authentication Methods**.

![ASAuthStrengths](/.attachments/AAD-Authentication/712194/ASAuthStrengths.jpg)

[Work Item 3112555](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3112555) was submitted requesting the **Authentication Strengths** tab be moved from **Sign-ins**\\**Authentication Methods** to **Conditional Access** as a top-level tab. This request also corrects an issue where the **Conditional Access Policies** cell of each authentication strength fails to show the CA policies that are linked to the authentication strength.

___

## Conditional Access Policy (ASC)

Updates to ASC are coming that will allow Conditional Access Policies that contain authentication strengths as a Grant control to be viewed: 

- **Controls** is being updated to include the "authenticationStrength" section of the string.

-	**Policy Details Json** is also being updated to expose the "authenticationStrength" section of the JSON string.

**Note**: Until this update is live in ASC, use ASC's [Graph Explorer](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=712194&anchor=graph-explorer) to view these conditional access policies that are assigned to authentication strengths.

![ASCCAPolicyUpdate](/.attachments/AAD-Authentication/712194/ASCCAPolicyUpdate.jpg)

___

## Sign-ins (ASC)

1. From Tenant Explorer in ASC, locate a sign-in event of interest under **Sign-ins** on the left hand navigation.
2. Select a sign-in event that has Conditional Access as *Success* or *Failure*.

The sign-in event **detail** for that event has an `"authenticationDetails"` section. 

- `"authenticationMethod"` shows the Primary Authentication method supplied by the user with `"succeeded"` being either *true* or *false*.
- `"authenticationStepResultDetail"` shows the second factor method that was supplied by the user with `"succeeded"` being either *true* or *false*.
- `"authenticationStepRequirement"` is the reason for the second factor step-up.

```json
  "authenticationDetails": [
    {
      "authenticationStepDateTime": "2022-09-13T19:41:43Z",
      "authenticationMethod": "Password",
      "authenticationMethodDetail": "Password in the cloud",
      "succeeded": true,
      "authenticationStepResultDetail": "Correct password",
      "authenticationStepRequirement": "Phishing resistant MFA"
    },
    {
      "authenticationStepDateTime": "2022-09-13T19:41:43Z",
      "authenticationMethod": "FIDO2 security key",
      "authenticationMethodDetail": "My Security Key - ee882879-721c-4913-9775-3dfcce97072a",
      "succeeded": true,
      "authenticationStepResultDetail": null,
      "authenticationStepRequirement": "Phishing resistant MFA"
    },
    {
      "authenticationStepDateTime": "2022-09-13T19:41:43Z",
      "authenticationMethod": "Other",
      "authenticationMethodDetail": null,
      "succeeded": true,
      "authenticationStepResultDetail": "MFA requirement satisfied by multi-factor device",
      "authenticationStepRequirement": "Phishing resistant MFA"
    }
  ],
  "authenticationRequirementPolicies": [
    {
      "requirementProvider": "multiConditionalAccess",
      "detail": "Conditional Access"
    },
    {
      "requirementProvider": "authenticationStrengths",
      "detail": "Authentication Strength(s)"
    }
  ],
```

The sign-in event **Details** for the selected event also has an `"authenticationStrength"` section that lists the `"displayName"` and the `"authenticationStrengthId"` of the authentication strength policy object that was enforced.

```json
  "appliedConditionalAccessPolicies": [
    {
      "id": "8f8d2cd6-15c2-463e-996c-71c0f6be095a",
      "displayName": "CA Admin Auth Strength Test",
      "enforcedGrantControls": [],
      "enforcedSessionControls": [],
      "sessionControlsNotSatisfied": [],
      "result": "success",
      "conditionsSatisfied": "application,users",
      "conditionsNotSatisfied": "none",
      "includeRulesSatisfied": [
        {
          "conditionalAccessCondition": "application",
          "ruleSatisfied": "appId"
        },
        {
          "conditionalAccessCondition": "users",
          "ruleSatisfied": "userId"
        }
      ],
      "excludeRulesSatisfied": [],
      "authenticationStrength": {
        "displayName": "Phishing resistant MFA",
        "authenticationStrengthId": "00000000-0000-0000-0000-000000000004"
      }
    },
```

___

## Authentication Diagnostics (ASC)

1. In ASC **Sign-ins** click the *Troubleshoot this sign-in* link to the right of the event to launch ASC's **Authentication Diagnostic**, which is a wrapper for Logsminer.
2. Select the **Login:login** Call.
3. Click **Expert view**.
4. Select the **CA Diagnostic (New)** tab.

![CADiagnostic](/.attachments/AAD-Authentication/712194/CADiagnostic.jpg)

___

#### PerRequestLogs

**IMPORTANT**: The most definitive way to decode the information needed to determine primary and secondary authentication methods, and the method that satisfied authentication strength in a readable format, is to use the **CA Diagnostic tab (New)**.

This is not confirmed, but there is an attribute called `AioDebugInfo` that includes a setting called `AuthenticationMethodsUsed`. The value for `AuthenticationMethodsUsed` appears to be a combined decimal bitmask of the primary and secondary factors.  When the primary factor contains an MFA claim that is accounted for, even if the authentication strength still needs to be satisfied. 

Examples: 

- A *Password* sign-in for primary auth (1 dec) does not have an MFA Claim. This is added to the *FIDO2* secondary auth (65536 dec). The result in `AuthenticationMethodsUsed` is a decimal bitmask = 65537.

- A user supplies a certificate that satisfies for both primary and second factor and the Native Certificate Based Authentication policy is configured for multi-factor. The certificate used for first factor maps to *X509* (2 dec) and possesses an MFA claim because the Native CBA policy is configured for multi-factor. The MFA claim present in the first factor is + *MultiFactor* (8 dec). Finally, the authentication strength for second factor was satisfied using the same certificate which is + *X509CertificateMultiFactor* (262144 dec). The total in `AuthenticationMethodsUsed` is a decimal bitmask = 262154.

- A TAP Sign-in was for Primary authentication (32768 dec). Since TAP contains an MFA claim there is a + *MultiFactor* (8 dec). To satisfy the authentication strength there is a + of *FIDO* (65536 dec). The result in `AuthenticationMethodsUsed` is a decimal bitmask = 98304.

| AuthenticationMethodsUsed (Hex) | AuthenticationMethodsUsed (Dec) | Method type | Description |
|-----|-----|-----|-----|
| 0x0 hex | 0 dec | None |  |
| 0x1 hex | 1 dec | Password | Authentication by using a password |
| 0x2 hex | 2 dec | X509 | Authentication on a key authenticated using an X.509 PKI certificate |
| 0x4 hex | 4 dec | WindowsIntegrated | Windows integrated authentication | 
| 0x8 hex | 8 dec | MultiFactor | Multiple factor authentication |
| 0x10 hex | 16 dec | WindowsIntegratedOrMultiFactor | If the HTTP GET of the wsignin1.0 request message contains an X-MS-Proxy HTTP header, then Windows integrated authentication; otherwise, multiple factor authentication. |
| 0x20 hex | 32 dec | Unspecified | Authentication by unspecified means |
| 0x40 hex | 64 dec | ProtectedTransport | This is a special case. It's not a real authentication method. It indicates that the transport layer is secure only. To get authentication method PasswordProtectedTransport, users can do something like: AuthMethodsUsed.Password | AuthMethodsUsed.ProtectedTransport to indicate the union of both. |
| 0x80 hex | 128 dec | NgcMfa | This is a special case - it's not a real authentication method. The flag indicates that request specified 'ngcmfa' value for 'amr_values' parameter when redeeming refresh token |
| 0x100 hex | 256 dec | InternetProtocolPassword | Authentication by Internet protocol password. |
| 0x200 hex | 512 dec | SecureRemotePassword | Authentication by secure remote password. |
| 0x400 hex | 1024 dec | KnownNonPasswordMethod | Known Non-Password method |
| 0x1000 hex | 4096 dec | OneTimePasscode | One time passcode method |
| 0x2000 hex | 8192 dec | X509Federated | Explicit indication that X509 auth method was provided by federated IdP. |
| 0x4000 hex | 16384 dec | MultiFactorFederated | Explicit indication that MFA auth method was provided by federated IdP. |
| 0x8000 hex | 32768 dec | TemporaryAccessPass | Authentication by using a Temporary Access Pass. |
| 0x10000 hex | 65536 dec | Fido | Authentication by using a Fido. |
| 0x20000 hex | 131072 dec | X509CertificateSingleFactor | Authentication by using an X.509 PKI that is valid as Single Factor as part of certificate based authentication.<br>This should only be used for Native Certificate Based Authentication|
| 0x40000 hex | 262144 dec | X509CertificateMultiFactor | Authentication by using an X.509 PKI that is valid as Multi Factor as part of certificate based authentication.<br>This should only be used for Native Certificate Based Authentication |
| 0x80000 hex | 524288 dec | PasswordFederated | Federated password was used to authenticate. |
| 0x100000 hex | 1048576 dec | WindowsHelloForBusinessFederated | Windows hello for business was used via ADFS. |

___

## Graph Explorer (ASC)

Until data explorers are completed in ASC, use Microsoft Graph Calls to retrieve Authentication Method policy objects and CA Policy settings.

___

### Authentication Strengths

List all Authentication Strengths policy objects

**URI**: `identity/conditionalAccess/authenticationStrengths/policies`

**Version**: `beta`

Get a specific policy with Authentication Strengths policy object.

- For this to work. `{policy-id}` in the query below must be replaced with the `"id"` of a specific uthentication Strengths policy object. 

**URI**: `identity/conditionalAccess/authenticationStrengths/policies/{policy-id}`

**Version**: `beta`

### Conditional Access Policy

Discover CA Policies that use a specific Authentication Strengths policy object as a grant control.

- For this to work, `{authStrengthobjectId}` in the query below must be replaced with the `"id"` of a specific authentication strengths policy object. 

**URI**: `identity/conditionalAccess/policies/?$filter=grantControls/authenticationStrength/id eq '{authStrengthobjectId}'&$select=id,displayName,state`

**Version**: `beta`

___

# ICM Paths

Management and enforcement of CA policy with Auth strengths in the Portal route to the Conditional Access UX team:

**Owning Service**: Conditional Access UX
**Owning Team**: Triage

Management and enforcement of CA policy with Auth strengths using Microsoft Graph API route to the Conditional Access team

**Owning Service**: Conditional Access
**Owning Team**: Triage

Management of Authentication strengths, authentication methods policy and authentication methods route to the Credential Configuration Endpoint (CCE) team:

**Owning Service**: Azure MFA
**Owning Team**: MFA On-call Engineers (MFA Support requests) 

___

# Training

Identity PMs, Inbar Cizer Kobrinsky and Namrata Kedia present on Authentication Strengths as Conditional Access Grant Controls.  CCurrently, Admins can require MFA for users when accessing a resource in Azure AD by creating a CA policy, and those users can satisfy the MFA requirement using a variety of authentication methods, like password + SMS or FIDO2. Authentication Strengths allow admins to specify <u>which</u> authentication methods can be used to satisfy MFA. 	For example, admins can now specifically require FIDO2 or Passwordless phone sign-in for a specific application.

**Title**: Deep Dive 07586 - Authentication Strengths

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 48 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752), [MSaaS AAD - Applications Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Training Date**: October 12, 2022

**Course Location**: [QA](https://aka.ms/AAi4cpd)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
