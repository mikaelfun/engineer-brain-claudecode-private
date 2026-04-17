---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/Azure AD B2B TSG : AADSTS Error Codes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-extidmgt
- B2B collaboration
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
<table style="margin-left">
    <tr style="background:#efffff;color:black">
    <td>
      <small>&#128210; <b>Compliance Note</b>: All data in this wiki including videos, screenshots, logs, GUIDs, email addresses, usernames and troubleshooting steps have been obtained from lab test environments and should not be considered confidential or personal data during compliance reviews.</small>
    </td>    
    </tr>
  </table>

[[_TOC_]]


# Error Code List

|**Code**|**Name**|**Error Message** |**Remediation**
|--|--|--|--|
|AADSTS16003  |SsoUserAccountNotFoundInResourceTenant  |The user account does not exist in the directory or the user hasn't been explicitly added to the tenant. To sign into this application, the account must be added to the directory.  | Invite the user to the tenant, or ignore this error if the user isn't supposed to be a member of the tenant. This can be the case when someone is sent to a login URL for your tenant without being a member, or picks the wrong user account.<br><br>See [Troubleshooting user does not exist errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=troubleshooting-user-does-not-exist-errors)
|AADSTS50020  |UserUnauthorized  |User account '{_email}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{appId}'({appName}) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.  | A user was sent to a tenanted endpoint, and signed into an AAD account that doesn't exist in your tenant. If this user should be a member of the tenant, they should be invited via the B2B system. See here for details: [Add and manage B2B collaboration users in the Microsoft Entra admin center](https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator) <br><br>See [Troubleshooting user does not exist errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=troubleshooting-user-does-not-exist-errors)<br>and [Troubleshooting AADSTS50020](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/error-code-aadsts50020-user-account-identity-provider-does-not-exist)
|AADSTS500211  |SshUserUnauthorized  |User account '{_email}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{appId}'({appName}) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.  | A user was sent to a tenanted endpoint, and signed into an AAD account that doesn't exist in your tenant. If this user should be a member of the tenant, they should be invited via the B2B system. See here for details: [Add and manage B2B collaboration users in the Microsoft Entra admin center](https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator) <br><br>See [Troubleshooting user does not exist errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=troubleshooting-user-does-not-exist-errors)
|AADSTS50034  |UserAccountNotFound  |The user account {_identifier} does not exist in the {tenant} directory. To sign into this application, the account must be added to the directory.  | The user that attempted to sign in doesn't exist in this tenant. This can occur because the user mis-typed their username, or isn't in the tenant. An application may have chosen the wrong tenant to sign into, and the currently logged in user was prevented from doing so since they did not exist in your tenant. If this user should be able to log in, add them as a guest. See docs here: [Add and manage B2B collaboration users in the Microsoft Entra admin center](https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator)<br><br>See [Troubleshooting user does not exist errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=troubleshooting-user-does-not-exist-errors) 
|AADSTS50177  |ExternalChallengeNotSupportedForPassthroughUsers  |User account '{_user}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{appId}'({appName}) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account. | Passthrough User authentication does not support certain types of Conditional Access policies.  This includes [Terms of Use policies](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/terms-of-use) see [FAQ](https://learn.microsoft.com/en-us/partner-center/gdap-faq#can-gdap-or-dap-access-a-customer-account-with-a-conditional-access-policy) and ICM example [237932379](https://portal.microsofticm.com/imp/v3/incidents/details/237932379/home) and [Session Controls](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/concept-conditional-access-session) and ICM example [311806301](https://portal.microsofticm.com/imp/v3/incidents/details/311806301/home)<br><br>If a Terms of Use policy is blocking CSP admin from logging in the customer facing error may indicate an error such as `AADSTS50177: User account cspadmin@cspdomain.com from identity provider X does not exist in tenant Y and cannot access application Z in that tenant. The account needs to be added as n external user in the tenant first.` If you grab correlation ID and run through ASC Auth Troubleshooter, the expert diagnostic logs will mention the true error which is `ExternalChallengeNotSupportedForPassthroughUsers` .  The end customer must exclude this application or External User Type = Service Provider from Terms of Use policy as Terms of Use policies are not supported for CSP authentication.
|AADSTS50178  |SessionControlNotSupportedForPassthroughUsers  |User account '{_user}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{appId}'({appName}) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.  |Passthrough User authentication does not support certain types of Conditional Access policies.  This includes [Terms of Use policies](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/terms-of-use) see [FAQ](https://learn.microsoft.com/en-us/partner-center/gdap-faq#can-gdap-or-dap-access-a-customer-account-with-a-conditional-access-policy) and ICM example [237932379](https://portal.microsofticm.com/imp/v3/incidents/details/237932379/home) and [Session Controls](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/concept-conditional-access-session) and ICM example [311806301](https://portal.microsofticm.com/imp/v3/incidents/details/311806301/home)<br><br>If a Session Control policy is blocking is blocking CSP admin from logging in the customer facing error may indicate an error such as `AADSTS50178: User account {EmailHidden} from identity provider X does not exist in tenant Y and cannot access the application Z (Azure Portal) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account.`  If you grab correlation ID and run through ASC Auth Troubleshooter, the expert diagnostic logs will mention the true error which is `SessionControlNotSupportedForPassthroughUsers` .  The end customer must exclude this user, application , or User Type = External Service Provider from the conditional access policy enforcing Session Control.
|AADSTS51004  |UserAccountNotInDirectory  |The user account {_identifier} does not exist in the {tenant} directory. To sign into this application, the account must be added to the directory.  | An application likely chose the wrong tenant to sign into, and the currently logged in user was prevented from doing so since they did not exist in your tenant. If this user should be able to log in, add them as a guest. See docs here: [Add and manage B2B collaboration users in the Microsoft Entra admin center](https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator) <br><br>See [Troubleshooting user does not exist errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=troubleshooting-user-does-not-exist-errors)
|AADSTS90072  |PassThroughUserMfaError  |User account '{_user}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{application}'({appName}) in that tenant. The account needs to be added as an external user in the tenant first. Sign out and sign in again with a different Azure Active Directory user account  |AADSTS90072 means PassThroughUserMfaError error.  Meaning the guest user was signed in at home tenant, but when accessing resource tenant could not complete the MFA requirement of the resource tenant.<br><br>Investigate correlation ID with [ASC auth troubleshooter's CA Diagnostic](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps)
|AADSTS500021 |NotAllowedTenantRestrictedTenant| Please contact your IT department.|See [Tenant Restrictions V1 Policy Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183985/Azure-AD-Tenant-Restrictions-V1)
|AADSTS5000211 |NotAllowedTenantRestrictionsV2Tenant|A tenant restrictions policy added to this request by a device or network administrator does not allow access to '{tenant}'.|The administrator of the tenant that owns this tenant restrictions policy does not allow this access. If this is not expected, that administrator should allow access by editing their cross tenant access policy.<br><br>See [Tenant Restrictions V2 Policy Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/669951/Azure-AD-Tenant-Restrictions-V2)
|AADSTS500212|NotAllowedByOutboundPolicyTenant|The user's administrator has set an outbound access policy that does not allow access to the resource tenant.|The user's administrator must update their cross-tenant access policy to allow access to the resource tenant.<br><br>See [XTAP Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/527944/Azure-AD-B2B-Cross-Tenant-Access-Policy-(XTAP)?anchor=troubleshooting)
|AADSTS500213|NotAllowedByInboundPolicyTenant|The resource tenant's cross-tenant access policy does not allow this user to access this tenant.|This block occurred due to the resource tenant's cross-tenant access policy. Contact that tenant's administrator to ensure that these users are allowed access.<br><br>See [XTAP Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/527944/Azure-AD-B2B-Cross-Tenant-Access-Policy-(XTAP)?anchor=troubleshooting)
| AADSTS50058 | UserInformationNotProvided | This means that a user is not signed in. This is a common error that's expected when a user is unauthenticated and has not yet signed in. If this error is encountered in an SSO context where the user has previously signed in, this means that the SSO session was either not found or invalid. This error may be returned to the application if prompt=none is specified. <br><br><li><b>"We couldn't find an account with that username"</b> = The username typed in could not be found in ANY tenant. Meaning the user's upn domain suffix was not found as verified on a managed tenant nor was a work\school or MSA account found.<li><b>"This username may be incorrect. Make sure you typed it correctly. Otherwise, contact your admin."</b> = The username's domain suffix was found as a verified domain on a managed tenant, but no matching user was found in that tenant with mathcing user principal name| This error comes with two user facing error strings which may point to B2B redemption error related to no user signed in.<br><br><li><b>"We couldn't find an account with that username"</b> = The username typed in could not be found in ANY tenant. Meaning the user's upn domain suffix was not found as verified on a managed tenant nor was a work\school or MSA account found.<li><b>"This username may be incorrect. Make sure you typed it correctly. Otherwise, contact your admin."</b> = The username's domain suffix was found as a verified domain on a managed tenant, but no matching user was found in that tenant with mathcing user principal name




                

# Understanding B2B Authentication Flow

To understand `User account '{_email}' from identity provider '{idp}' does not exist in tenant '{tenant}' and cannot access the application '{appId}'({appName}) in that tenant` errors, it is helpful to know the general authentication flow for B2B external users.

Review our public doc sections first for
1. [Authentication flow for external Microsoft Entra users](https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access#authentication-flow-for-external-microsoft-entra-users)
2. [Authentication flow for non-Azure AD external users](https://learn.microsoft.com/en-us/entra/external-id/authentication-conditional-access#authentication-flow-for-non-azure-ad-external-users)
3. [Invitation redemption flow](https://learn.microsoft.com/en-us/entra/external-id/redemption-experience#invitation-redemption-flow)

The general flow example is
1. An external user `user@contoso.com` is directed to the Entra authorization endpoint for a resource tenant Example: `https://login.microsoftonline.com/resourcetenant.onmicrosoft.com/oauth2/v2.0/authorize` 
2. If the user is already signed into their own identity provider, SSO may occur.  If the user is not already signed in, the Entra login UX is displayed and username is entered.
3. Entra GetCredentialType API `https://login.microsoftonline.com/common/GetCredentialType?mkt=en-US` with the username entered and looks up if the entered username has any valid Entra or Microsoft Personal (MSA) home account.  The response will contain `IfExistsStatus=0` if an account is found and `IfExistsStatus=1` if account is NOT found.  If a Microsoft Account is found `IfExistsStatus=5`

    The result of this step will be one of the following

   * If Entra located a valid user account in the user's home tenant, a password dialog will be displayed to authenticate the user against their home tenant.
   * If the username's domain suffix is found to be verified in a valid Entra tenant but no username matching that alias is found in that tenant the error `This username may be incorrect. Make sure you typed it correctly. Otherwise, contact your admin.`  This means no work\school account with matching UPN `user@contoso.com` was found in the Entra tenant that `contoso.com` is verified on.
   * The user's browser is redirected to `https://login.live.com` and password is requested.  Meaning `user@contoso.com` was found in the Microsoft Personal Account directory and will need to be redirected there.
   * The resource tenant's redemption order + authenticationMethod policies are reviewed and user is redirected to any matching SAML/WS-Fed External Identity Providers to authenticate.
   * The resource tenant's redemption order + authenticationMethod policies are reviewed and user is redirected to Email OTP flow to authenticate.
   * If the username's domain suffix was not found on any Entra tenant, the error `We couldn't find an account with that username.` .  Meaning `contoso.com` was not found


4. Once a valid home user is found, and user authenticates against their identity provider the response is sent to the login endpoint of the resource tenant `https://login.microsoftonline.com/resourcetenant.onmicrosoft.com/login`

5. At this point eSTS will have the home user's identity provider and sub\PUID claims and will query resource tenant for the following

   * Users with [AlternativeSecurityID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183938/Azure-AD-B2B?anchor=alternative-security-id-(altsecid)-reference) matching the home user's incoming sub\PUID , indicating the user has already redeemed the invite (UserState = Accepted) and doesn't need to consent again so authentication to resource tenant is successful and requested token is returned after evaluating any Cross Tenant Access Policies in home and resource tenant + Conditional Access Policies in resource tenant.

   * If no matching user is found off AltSecID\Incoming PUID, the resource tenant will be queried for unredeemed (UserState = PendingAcceptance) external user objects where InviteTicket = incoming user's home object ID.  If found user will be shown invite acceptance \ consent screen to redeem the pending invite.  NOTE: InviteTicket is an internal only property that can only be found in DS Explorer today.

   * If no matching user found based off AltSecID\Incoming PUID or InviteTicket = incoming user ObjectID, the resource tenant will be queried for unredeemed (UserState = PendingAcceptance) external user objects w/matching proxyAddress .  If found user will be shown invite acceptance \ consent screen to redeem the pending invite.

   * If no matching user found based off AltSecID\Incoming PUID, or InviteTicket, or proxyAddress, the resource tenant will be queried for unredeemed (UserState = PendingAcceptance) external user objects w/matching invitedAs attribute.  If found user will be shown invite acceptance \ consent screen to redeem the pending invite.

   * If no matching user is found in resource tenant based off AltSecID\Incoming PUID, or InviteTicket, or proxyAddress, or invitedAs attributes then the error `AADSTS50020: User account 'user@contoso.com' from identity provider 'https://sts.windows.net/resourcetenant.onmicrosoft.com/' does not exist in tenant 'RESOURCE TENANT FRIENDLYNAME' and cannot access the application XYZ`

6. If customer is trying to perform guest invite redemption using JIT\direct link\tenanted endpoint https://learn.microsoft.com/en-us/entra/external-id/redemption-experience#redemption-process-through-a-direct-link and the user is not being identified properly, it should be suggested that customer try the invite email's "Accept Invite" link method instead.  See (https://learn.microsoft.com/en-us/entra/external-id/redemption-experience#redemption-process-through-the-invitation-email) .  As this link contains a direct ticket to help eSTS locate invited guest user. If needed generate a new accept invite link via portal using the "Resend invitation" function (https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator#external-user-invitations) on the guest user object

## B2B Auth Troubleshooter Analysis

10. To further diagnose any "User account X from identity provider Y does not exist in tenant Z" errors, obtain a Fiddler or HAR trace of a repro or ask for the error's correlation ID , request ID, and timestamp and query in [ASC Auth Troubleshooter](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps).   It is generally recommended to ask customer to repro from incognito mode so the entire request is captured including the GetCredentialType call (where user interactively types in their username and eSTS searches for matching users).

11.  Review the Expert View -> Diagnostic logs tab for the failure.  Then use the "filter by name or value" search to filter for the following values

  * `UserQuery(UserData):` this will contain details such as USER: AcceptedOn:{06/18/2024 12:28:39}   AccountType:1   AltSecID:"5::100320012EE7ABC123" for any guest user objects found in resource tenant 
    
   * `AuthQuery(UserData)` this value will return the query of the resource tenant as well as the user's home tenant and you should find the following sub value result examples in this log frame 

      * `USER: AcceptedOn:{08/06/2024 00:50:02}   AccountType:0   AltSecID:"5::PUIDVALUE"`  (USER: is the query returning the user object found in the resource tenant matching the home user that is trying to sign in.  If `USER: ` is not found in the results of the AuthQuery(UserData) frame, then it means no user was found in the resource tenant matching the signed in user's proxyAddress .  If a user is found, details about the resource tenant guest object will be shown such as when the found user in resource tenant was created, if\when the guest user object accepted the invite, and any AltSecIDs containing the type of user and home PUID of the user who accepted the invite.

      * `HOME USER: AccountType:0` (HOME USER: value in AuthQuery(UserData) results indicate the signed in user's home account and parameters like the home account's PUID, CreatedOn date etc.  This is useful for verifying if the home user PUID matches any existing Guest object who already redeemed invite and has a matching AltSecID

   * XTAP Tab : This tab will list the resource and home tenant XTAP policies

        * Resource tenant XTAP

           * ToMyTenancy \  IDPs parameter = [B2B Redemption Order](https://learn.microsoft.com/en-us/entra/external-id/cross-tenant-access-overview#configurable-redemption)

               *  0 = AAD , 1 = SAML WS-Fed Direct , 2 = Email OTP, 3 = MSA , 4 = Social



* Other parameters to reference when debugging via ASC Auth Troubleshooter \ Fiddler or HAR traces

   ## GetCredentialType Response
     * **IfExistsResult** ( 0 = UserExists, 1 = UserDoesNotExist, 2 = Throttled, 3 = ? , 4 = Error, 5 = ExistsInOtherMicrosoftIdp, 6 =  ExistsInBothIDPs, 7 =  ExistsBothPhones)
     * **DomainType** (1 = Unknown, 2 = Consumer, 3 = Managed, 4 = Federated, 5 = CloudFederated)
     * **PrefCredential** (  0.  None 1.  Password 2.  RemoteNGC 3.  OneTimeCode  4.  Federation 5.  CloudFederation 6.OtherMicrosoftIDPFederation 7.  Fido 8.  Github 9.  PublicIdentifiercode 10.  LinkedIn 11.  RemoteLogin 12.  Google 13.  AccessPass 14.  Facebook 15.  Certificate 16.  ExtId 17.  ExternalAuth 18.  QRCodePin 19.  VerifiableCredentials 20.  Apple)

   ## AuthQuery(UserData) Response
     * **AccountType** (0 = Member, 1 = Guest, 2 = Federated, 3 = CloudFederated, 4 = Unknown)
     * **CreationType** (1 = Invitation, 2 = NameCoexistence, 3 = EmailVerified, 4 = FederatedAuthenticaiton, 5 = SelfServiceSSignup)
     * **AltSecId** types (1 = Live\MSA\Personal , 2 = Device, 3 =  CertificateSubjectNameAndIssuertype, 4 = CertificateThumbprintIdentifier, 5 = OrgID \ Entra Work School, 6 = Custom, 7 = AADGroupIdentifier, 8 = CrossCloudGuestUserType)
     * **PUID** (starting with 0 = MSA\Personal, starting with 1 = Entra work\school)

12. As an example of ASC Auth Troubleshooter Diagnostic Logs showing the calls \ responses \ filter when a successful invite redemption occurs you can see this in the below screenshot.  Note: Filtering by "UserData" shows eSTS identified both the home user and the invited user in resource tenant and the home user's object ID matches the resource tenant's InviteTicket ID so the next call of the correlation ID is the user being redirected to consent to guest invite redemption.

    ![image.png](/.attachments/image-94db9022-8a4d-43e4-b21b-b920b8a3bb95.png)

# Troubleshooting User Does Not Exist Errors

In all of the above "user does not exist" [AAD STS errors](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1175374/Azure-AD-B2B-TSG-AADSTS-Error-Codes?anchor=error-code-list) an external user has tried to sign into a resource tenant but no guest account could be found matching that user name via proxy address lookup.  

To troubleshoot these issues 

1. Using ASC in resource tenant, verify that a user object exists in the resource tenant matching the user name from the error message and note whether Invitation State = `Pending Acceptance` or `Accepted` .  If invite is already Accepted, go to step 8.
2. Verify that on the Guest user object found in the resource tenant, that the username from the error message exists as a ProxyAddress `smtp:user@contoso.com`
3. If no user is found in resource tenant, the the user must [be invited](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/add-users-administrator) first
4. If a user is found, but they have no ProxyAddress attribute matching the invited guest, then when the user was invited there may have been a duplicate proxyAddress error. See the following public docs on scenario

   * [Redemption process limitation with conflicting Contact object](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/redemption-experience#redemption-process-limitation-with-conflicting-contact-object) 
   * [External user has a proxyAddress that conflicts with an existing local user](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/troubleshoot#external-user-has-a-proxyaddress-that-conflicts-with-a-proxyaddress-of-an-existing-local-user)
   * [Guest user object doesn't have a proxyAddress](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/troubleshoot#the-guest-user-object-doesnt-have-a-proxyaddress)
   * [Guest user was invited succesfully but the email attribute isnt populating](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/troubleshoot#a-guest-user-was-invited-successfully-but-the-email-attribute-isnt-populating)


     Example:

     ![Screenshot of user profile in Entra ID pointing to missing proxy address in guest user](/.attachments/image-1f186a62-209d-430e-b325-2ad7a5e39051.png)

5. To locate the duplicate proxyAddress in the directory, the admin can query the tenant using Graph

   Example cmdlets:

   ``` powershell
    # Define the proxyAddress to search for
    $proxyAddress = "user@contoso.com"
    
    # Get all users and contacts from the Microsoft Graph API
    Get-MgUser -Filter "proxyAddresses/any(p:startswith(p,`'smtp:$proxyAddress`'))"
    Get-MgContact -Filter "proxyAddresses/any(p:startswith(p,`'smtp:$proxyAddress`'))"
    ```

    Example Portal:

    ![Screenshot of user profile in Entra ID showing no proxy address together with result from running powershell query above.](/.attachments/image-c467ec35-f23f-42cf-91b1-14be5b4b3a1d.png)

6. Once the object holding the user's proxyAddress is located, the administrator can delete this user and then reinvite the Guest user to populate the proxyAddress

   ![Screenshot of user profile in Entra ID showing how to resend invitation.](/.attachments/image-d76fe2c1-207f-434b-9c88-cc48acb22770.png)

7. Alternatively, the administrator can send the user a direct redemption link via the Resend invitation or asking user to click the Accept invitation link found in invitation email.  These links (starting with `https://login.microsoftonline.com/redeem` ) are [direct invite redemption links](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/redemption-experience#redemption-process-through-the-invitation-email) and will not require lookup of proxyAddress in resource tenant.

   ![Screenshot of copying the redemption URL upon resending the invitation](/.attachments/image-91a02d18-3512-4532-806e-58ada25c7f52.png)

   ![Screenshot of invitation e-mail](/.attachments/image-2d401719-536c-4636-9521-1a5449c9ef06.png)

8. To locate all Invited users in tenant whose proxyAddresses is missing the invited email address you can use a cmd such as

   :warning:The following script is for example purposes only, it should not be used in production environments without proper testing by admin :warning:

   ```powershell
   #Query all invited users who do not have a proxyAddress matching invited mail attribute
   $impactedusers = Get-MgUser -Filter "CreationType eq 'Invitation'" -Property UserPrincipalName, CreationType, proxyAddresses, mail, Id | select Id, UserPrincipalName, CreationType, proxyAddresses, mail | ? {$_.ProxyAddresses -notcontains "SMTP:"+$_.mail}


   #If admin wished to fix missing proxyAddress on all the users found, they could then patch the mail attribute with existing mail attribute to trigger proxyAddress recalculation

   foreach($user in $impactedusers){
    Update-MgUser -UserId $user.Id -Mail $user.Mail
   }
   ```

8. If the guest user does exist AND has a matching proxyAddress but the error still persists, then the guest invitation may have already been accepted (Invite state = `Accepted`) by a user whose home account PUID \ ObjectID has since changed.  Or the user who is signed in does not match the user who accepted the invite. 
 Usually the user's home object ID has changed after being recreated since originally accepting invite.  Or they accepted the invite via a different method like OTP mail redemption and they are now signing in with an AAD user account.

   In this scenario, resource tenant admin will need to [reset redemption state](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/reset-redemption-status) on the guest user so the external user can accept the invite again. See [Check whether guest alternative security id differs from the home tenants net ID](https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/error-code-aadsts50020-user-account-identity-provider-does-not-exist#verification-option-2-check-whether-the-resource-tenants-guest-alternative-security-id-differs-from-the-home-tenants-user-net-id)

