---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Tenant Lockout Eng Instructions/Common Lockout Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FTenant%20Lockout%20Eng%20Instructions%2FCommon%20Lockout%20Scenarios"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.Tenentlockout
- SCIM Identity
- Conditional Access
-  Tenent Lockout
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]

#Common Tenant Lockout Scenarios
A "tenant lockout" can manifest itself in multiple forms.  This could be a "hard block" with a policy explicitly blocking access to a sign-in request or a policy is requiring the admin to pass a technical gate that the admin would not be able to fulfill.  Additionally, a policy could potentially be misconfigured, e.g. incorrect IP range used, which prevents access to the tenant.  In any case, reference to a "tenant lockout" or "lockout" could be referencing a hard block or failure to meet the requirements of a policy.

In any lockout scenario, all policies should be considered when evaluating the lockout.  The bypassing of the policy that is reporting the failure may not be the only policy that is preventing access.  This is why, when the Geneva Action to bypass a tenant lockout is executed, ALL CA/SD/ID Protection policies are bypassed for that single user specified.

In the event that the Global Administrator is also unable to authenticate due to a forgotten password—thus failing first-factor authentication—we will follow the same protocol: instruct the admin to initiate a sign-in attempt, capture the sign-in diagnostics including the correlation ID and timestamp, complete the Data Protection Template (DPT), and send the case to the Data Protection team.

Below is a list of common lockout scenarios and what team primarily restores tenant access (NOTE: Any scenario that Identity can correct, the PG/EEE team can resolve as well).


###Corrected by Data Protection Team
    - Admin has lost their 2FA access
        - This could be due to a lost FIDO2 key, MS Authenticator app reset, lost phone, etc
    - Only admin in the company has left and the credentials to the account are unknown
    - Federation servers are not recoverable and there is no non-federated administrator account to de-federate the tenant's domains
    - Admin is unable to complete legacy Per-User MFA


###Corrected by PG
    - Admin is blocked by User Risk
    - Admin is blocked by Risk evaluation in their home tenant
    - Admin is blocked due to their admin account being flagged as a minor
    - Admin is blocked due to B2B Collaborations being disabledin the Cross-Tenant policy

###Corrected by Identity
    - Policy set to require a credential type that cannot be met as no admin has been provisioned with that credential
    - Impossible to satisfy device requirements
        - Requiring a Compliant device
        - Requiring a HybridAzure AD Joined device
        - Unable to meet conditions set in the policy's Device Filter
        - Admin has required Phishing-Resistenat MFA when no admin has enrolled for the required authentication strength
    - Admin incorrectly scopes the policy to guest users in a B2B scenario (where all admins are external users)
    - Admin incorrectly includes/excludes the wrong scope
        - Users 
        - Roles 
        - Apps in the policy
        - Platform
    - Admin incorrectly configures Named Locations
        - Countries
        - IP ranges
        - Failing to correctly mark a location as Trusted or not
        - Excluded location object is deleted from the tenant
    - Problems with required Custom Controls
        - Custom Control configuration incorrectly set
        - Connectivity to the Custom Control is not available


# Determining a Tenant Lockout
Below are some examples of logging seen in a few tenant lockout scenarios.

###Unable to authenticate due to "Phishing-resistent" auth method being specified

*Case*: Admin has configured CA policy to require Phishing-resistent MFA.  This requires Win Hello for Biz, FIDO2, or Cert Auth to be registered first then performed.

*Logging Example*: 

      "displayName": "Require phishing-resistant multifactor authentication for admins",
      "enforcedGrantControls": [],
      "enforcedSessionControls": [],
      "sessionControlsNotSatisfied": [],
      "result": "failure",

      "authenticationStrength": {
        "displayName": "Phishing-resistant MFA",
        "authenticationStrengthId": "00000000-0000-0000-0000-000000000004",
        "authenticationStrengthResult": "cannotSatisfy"


###Unable to authenticate to due to Risk (Sign-in or User)

*Case*: Admin is signing in to their home tenant, or a resource tenant, but has a Risk score associated with their account.  This Risk score is triggering a policy that blocks the admin or requires a control to be completed that the admin cannot complete. (NOTE: Risk scenarios should be reviewed with additional diligence as our systems have detected something unusual in the process)
   - Sign-in Risk: This risk score is normally calculated based on the sign-in characteristics of the login attempt.
   - User Risk: This score is normally calculated at the user's Home tenant using different risk signals.  User Risk can be self mitigated in most scenarios.  If the user is blocked accessing a resource tenant, the User Risk *must* be remediated in the user's Home tenant. If the admin is unable to remediate the User Risk, this requiest normally needs to be executed by PG.

*Logging Example*: ("Home" tenant could refer to the current tenant or the user's originating tenant)

        "errorCode": 530032,
        "failureReason": "User blocked due to risk on home tenant.",
        "additionalDetails": "If this user is risky in your tenant, learn more here: aka.ms/unblockrisk. If this is a guest user, learn more here: aka.ms/riskyguestuser."

Sign-in Event log

        "riskDetail": "none",
        "riskLevelAggregated": "none",
        "riskLevelDuringSignIn": "none",
        "riskState": "none",

**NOTE: The tenant bypass tool available to MWID and AAD is not expected to bypass UserRisk, only SignInRisk**

If an admin is blocked due to User Risk, and they have SSPR enabled, a successful secure password reset should also clear the Risk state.  The admin can change their password by logging into https://myaccount.microsoft.com and selecting the "Change password" option.

https://support.microsoft.com/en-us/account-billing/register-the-password-reset-verification-method-for-a-work-or-school-account-47a55d4a-05b0-4f67-9a63-f39a43dbe20a

###MFA Challenge not completed

*Case*: The admin is being challenged for MFA.  There could be multiple reasons for the admin being unable to complete the MFA prompt.  Normally, DPT can require the admin to re-register their MFA method to correct the issue.  However, there may be scenarios where this does not correct the issue e.g. MFA re-registration cannot be completed due to sign-in Risk being detected.

*Logging Example*:

      "displayName": "Require MFA for all users",
      "enforcedGrantControls": ["MFA"],
      "enforcedSessionControls": [],
      "sessionControlsNotSatisfied": [],
      "result": "failure",

###Cross-Tenant Access policies

*Case*: Normally B2B (aka Guest Users) user can be identified in a tenant by their UPN.  The UPN value normally includes the characters #EXT#.  Additionally, the User Type will be "Guest" instead of "Member".  Tenant-to-Tenant access settings can be found in ASC under the section "Cross-tenant access settings"  The inbound table will look like this:

|Type|Applies To|Status |Target(s)|
|---|----------|-------|---------|
|B2B Collaboration |	Users And Groups |**Allowed**	|All Users|
|B2B Collaboration	|Applications|	**Allowed**	|All Applications|
|B2B Direct Connect|	Users And Groups|	Blocked	|All Users
|B2B Direct Connect|	Applications	|Blocked	|All Applications
|Trust Settings|	NA|	NA|	-|
|Cross Cloud Meeting Config|	NA|	NA|	-|
|Automatic User Consent Settings|	NA|	NA|	-|
|Protected Content Sharing|	NA|	inboundAllowed, outboundAllowed|	-|
|Tenant Restrictions|	Users And Groups|	Blocked|	All Users|
|Tenant Restrictions|	Applications|	Blocked	|All Applications|

The first two rows should list "Allowed" for normal B2B access to occur.  If these settings are changed to Blocked, then access to the tenant for external users will fail. This scenario needs to be corrected by the PG.

*Logging Example*:

(User logging into home tenant)

    "resourceTenantId": "defbcc3c-####-####-####-############",
    "homeTenantId": "defbcc3c-####-####-####-############",

(User logging into resource tenant)

    "resourceTenantId": "f913974f-####-####-####-############",
    "homeTenantId": "defbcc3c-####-####-####-############",

###Device State

*Case*: A policy will require the device to be in a specific state(s).  This can be done via Device Filters in the CA policy or by defining the device state required in the policy.  A device's state cannot be checked without a Device ID being passed in the sign-in attempt.  If no device ID is passed, then AAD cannot validate its join type or compliance state. Edge will pass the device token naturally but Google Chrome requires a plugin extension.

*Logging example* (no Device ID passed):

    "deviceDetail": {
      "deviceId": "",
      "displayName": "",
      "operatingSystem": "Windows 10",
      "browser": "Chrome 114.0.0",
      "isCompliant": false,
     "isManaged": false,
     "trustType": ""


###Policy Exclusions

A policy may exclude specific roles, users, groups, named locations, applications, etc.  

When viewing the the blocking policy, it can be helpful to identify:
  1. What is excluded in the policy?  Users/Groups/Device types/etc?
  2. Are there location conditions that are excluded?
  3. Of the excluded users/groups, are any of them within an Administrator role?
    (if none of the excluded users are admins, then they could not correct the policy anyways)
  4. Could the policy be passed with an MFA re-registration?


###Specific Authentication Strength

Pre-created CA policy templates and require a specific [authentication strength](https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-strengths#authentication-strengths) to be used when authenticating. An example would require Phishing-Resistent Authentication Methods to be required in the policy.

If the admin logging into the tenant has not setup FIDO2, Win Hello for Business, or AAD Cert-Based Auth then they will be unable to satisfy the auth strength requirement in the policy.  The error message in the ASC sign-in event typically looks like this:

      "authenticationStrength": {
        "displayName": "Phishing-resistant MFA",
        "authenticationStrengthId": "00000000-0000-0000-0000-000000000004",
        "authenticationStrengthResult": "cannotSatisfy"

###MFA Registration Blocked due to Certificates

If the admin of a tenant has enabled AAD Native Cert-Based Auth (CBA), and the user is within scope of the policy, then AAD will assume that the user has a certificate capable of completing the specific auth request.  However, if the admin has not correctly setup the Certificate Authority in AAD , and issued users appropriate certificates, user will nto be able to authenticate.

This scenario can impact MFA registration.  As the MFA registration page (aka.ms/mysecurityinfo) requires 2FA, if the user is within scope for the CBA policy, they will likely be prompted for CBA when trying to access the MFA registration portal.  This can complicate processing the unblock request as DPT can require a user to re-register for MFA (in the example they lost their phone) but AAD will still see the user as within scope for CBA and will try to prompt for a certificate.

As the user is within scope of CBA, but does not have one provisioned, the user will be blocked from re-registering MFA and will require assistance with the Geneva Actions lockout bypass tool executed by AAD or MW ID.

Current guidance on CBA can be found in our public docs:

https://learn.microsoft.com/en-us/azure/active-directory/authentication/how-to-certificate-based-authentication#step-2-enable-cba-on-the-tenant

https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-certificate-based-authentication-limitations

(Using TAP to authenticate if CBA is not available/configured correctly)

https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-temporary-access-pass

#Partner Assistance
Some tenants in a lockout state could have a Microsoft Partner listed on their tenant.  This **does not** mean that the Partner can unblock the tenant.  

For the Partner to be able to remedy a tenant lockout, the Partner must have already requested permission to administrate the tenant (and then approved by the target tenant admin) **prior to the lockout situation**.  If this is not done, then the Partner cannot assist with the unlock process.

Additionally, Partners accessing end-customer tenants via GDAP (most common) may also be blocked due to tenant policies. Please validate if the request was opened by the partner and if the partner has already attempted to remediate the lockout scenario.  Otherwise, please continue with the normal escalation process.


