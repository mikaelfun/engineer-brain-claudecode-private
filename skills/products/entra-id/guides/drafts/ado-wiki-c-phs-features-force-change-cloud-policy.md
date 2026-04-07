---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Features/Password Hash Synchronization (PHS)/Password Hash Sync Features"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FFeatures%2FPassword%20Hash%20Synchronization%20(PHS)%2FPassword%20Hash%20Sync%20Features"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
- cw.AAD-PHS
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   



[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect) [AAD-PHS](/Tags/AAD%2DPHS) 


[[_TOC_]]

# Force Password Change on Next Logon


## How enable �Force Password Change on Next Logon" feature

By default, the flag �User must change password at next logon� in AD doesn�t work with hybrid identities using PHS as sign-in method. When you check the flag in AD, PHS won�t sync the temporary password to AAD, so when you try to log-in, the system will return an error.
However, there�s a feature that you can enable to have this possibility.

Customers can enable �Force Password Change on Next Logon" feature by running the following commands using the Graph PowerShell module::

``` ps
$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features.UserForcePasswordChangeOnLogonEnabled = $true

Update-MgDirectoryOnPremiseSynchronization 
-OnPremisesDirectorySynchronizationId $OnPremSync.Id 
-Features $OnPremSync.Features
```

With this feature enabled, if you reset a user's password in AD with �Force Password Change on Next Logon" option, PHS will sync this temporary password to Azure AD and the user will be able set a new password in Azure AD on the next sign-in.
Does this mean that all the passwords will be reset when you enable this feature? No, it won�t reset and the users won�t be asked to change their passwords. 
This feature only takes effect if you reset the password for the user with �User must change password at next logon� option in AD. If you check the box without resetting the user�s password, it won�t work. This is because there is no actual password update, so PHS doesn't have any update to sync to AAD, hence no way to send the ForcePasswordChangeOnLogOn flag to AAD.


## Convenient example for better understanding

1.	You enabled the feature in your tenant by running the command from above: 

``` ps
$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features.UserForcePasswordChangeOnLogonEnabled = $true

Update-MgDirectoryOnPremiseSynchronization 
-OnPremisesDirectorySynchronizationId $OnPremSync.Id 
-Features $OnPremSync.Features
```

2.	Then you perform a password reset in AD for the chosen account and you check the �User must change password at next logon� option during the procedure:

![01](.attachments/AAD-Synchronization/567144/01.jpg)

![02](.attachments/AAD-Synchronization/567144/02.jpg)

  
3.  You can confirm if the user was successfully updated running the following command:

Get-MgUser -UserId <user-object-ID> -Property PasswordProfile | Select-Object -ExpandProperty PasswordProfile

![==image_0==.png](/.attachments/==image_0==-35e90aea-786f-4e99-9bbb-1be77125ec9a.png) 

4.	And the user will be asked for changing its password in the next sign-in:

![04](.attachments/AAD-Synchronization/567144/04.jpg)

NOTE: If you just check this box in AD without changing the password, the ForcePasswordChangeOnLogOn flag won�t be populated:

![05](.attachments/AAD-Synchronization/567144/05.png)


## FAQ

### Once you enable the feature, is the policy affecting all the existing users? 
Answer: NO

It will affect only the user in which you check the �User must change password at next logon� box in AD while doing a password reset as explained in the example above.


###Can I force a user to force password change at next logon from PowerShell?
Answer: YES

  
You can use the following command to force a user to change password at next logon:

    
``` ps
Update-MgUser -UserId <user-object-ID> -PasswordProfile @{forceChangePasswordNextSignIn=$true}
```

But this requires you to set a new password for the user.

### Is there a way to force password change at next logon without resetting it? 
Answer: YES

Yes, you can do it through PowerShell with the following commands:
    
``` ps
  
Update-MgUser -UserId <user-object-ID> -PasswordProfile @{forceChangePasswordNextSignIn=$true; password=$null}
```

This will force the user to change its current password in the cloud in the next sign-in and the �update your password� dialog will be shown after enter the current credentials.



# Cloud password policy for password synced users


## How PHS feature �EnforceCloudPasswordPolicyForPasswordSyncedUsers� works

By default, password hashes synchronized by AAD Connect do not expire in Azure AD because the PHS agent enforces the user's password policy to never expire. However, on-premises AD usually has a password policy setting to set a maximum password age. Due to this AD behavior, this may cause the user�s on-premises password to expire based on AD Domain�s password policy. However, it stays valid in Azure AD because the user-level password policy in Azure AD is set to never expire. 

Companies with users that primarily sign-in to Azure AD (e.g. do not login on a domain-joined device), might not prefer this behavior. Therefore, Microsoft introduced a new feature called **EnforceCloudPasswordPolicyForPasswordSyncedUsers** which prevents the PHS agent from setting the user-level password policy (never expire). This in turn lets the user inherit Azure AD domain�s password policy. 

Please note that there is no password policy synchronization between on-premises AD and Azure AD. With the EnforceCloudPasswordPolicyForPasswordSyncedUsers feature enabled, customers can configure in Azure AD the same password policy that is present in local AD (regarding password age). This allows to have the passwords expire both, in on-premises and cloud, at similar times.


## How enable "EnforceCloudPasswordPolicyForPasswordSyncedUsers� feature

Customers can enable the EnforceCloudPasswordPolicyForPasswordSyncedUsers by running the following commands using the Graph PowerShell module::

``` ps
$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features.CloudPasswordPolicyForPasswordSyncedUsersEnabled = $true

Update-MgDirectoryOnPremiseSynchronization 
-OnPremisesDirectorySynchronizationId $OnPremSync.Id 
-Features $OnPremSync.Features
```

When enabling this feature it's recommended that the Customer "aligns� the same password age policy in both, on-premises AD (i.e. �Default Domain Policy�) and Azure AD (i.e. Update-MgDomain), otherwise this will cause confusing situations for users when the password expires on-premises AD but not in Azure AD or vise-versa. 

After enabling the feature will the passwords for all the users expire? The answer is NO. User's password policy will remain as "never expire" until you reset/change the password next time. After _EnforceCloudPasswordPolicyForPasswordSyncedUsers_ is enabled, only new users created after the feature was enabled or new user�s password updates are affected.

First time that you enable this feature, PHS sets the attribute _PasswordPolicies_ with value _DisablePasswordExpiration_ for all existing users.
This means that their password is not affected by the policy.

The next time PHS agent updates user�s password hash, the PasswordPolicies attribute of the Azure AD user is set to _None_.

For newly provisioned users however, the PasswordPolicies attribute, will be empty (null).
But whether Empty or "None" the result is exactly the same, in both cases the password policy set in the Azure AD domain takes precedence since there�s no user-level password policy present. 


## Example

1.	Enable _EnforceCloudPasswordPolicyForPasswordSyncedUsers_ by using the command:
    
``` ps
$OnPremSync = Get-MgDirectoryOnPremiseSynchronization
$OnPremSync.Features.CloudPasswordPolicyForPasswordSyncedUsersEnabled = $true

Update-MgDirectoryOnPremiseSynchronization 
-OnPremisesDirectorySynchronizationId $OnPremSync.Id 
-Features $OnPremSync.Features
```

2.	Confirm that the user has �never expire� password policy set in Azure AD (I.e. _PasswordPolicies == DisablePasswordExpiration_):

``` ps
Connect-MgGraph -Scopes 'User.Read.All'
Get-MgUser -UserId 
```

![06](.attachments/AAD-Synchronization/567144/06.jpg)

3.	Perform a password reset in local AD for that user: 

![07](.attachments/AAD-Synchronization/567144/07.jpg)

4.	Wait for the PHS sync cycle (~2 minutes), and check the attribute again: 

![08](.attachments/AAD-Synchronization/567144/08.jpg)

5.	Since the user-level password policy is �None� the password policy in the cloud will take effect,, hence �EnforceCloudPasswordPolicyForPasswordSyncedUsers� . By default Azure AD domain password policy is 90 days.
Note: For more information on how to set a Azure AD domain password policy visit https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.identity.directorymanagement/update-mgdomain?view=graph-powershell-1.0

6.	To check what is the current Azure AD Domain Password Policy you can use the following command: 

``` ps
Connect-Entra -Scopes 'Domain.Read.All'
Get-EntraPasswordPolicy -DomainName 'contoso.com'
```

![08](.attachments/AAD-Synchronization/567144/10.png)

7. If after configuring password expiration policy, a user is still signing in without being prompted to change their password.  Verify via ASC tenant explorer -> User lookup, that their Credentials section shows PasswordPolicies = Blank\None and that their "Last password change timestamp" shows > # of days found in ValidityPeriod setting for domain in previous step.



## FAQ

### Once you enable the feature, is the policy affecting all the existing users?
Answer: NO

All existing users will be tagged as _DisablePasswordExpiration_ the policy won�t affect them until you change the password at least once since the feature was enabled.
New users created after the policy has been enabled, will be affected by the policy since creation.

### Is there a way to set a password to expire without changing it?
Answer: YES

This is documented here: [Set a password to expire](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-policy#set-a-password-to-expire)

``` ps
Update-MgUser -UserId <user ID> -PasswordPolicies None
```

If you change the PasswordPolicies to None, any passwords that are older than 90 days will require the user to change it on the next sign in.

### Is there a way to set a password to never expire?
Answer: YES

This is documented here: [Set a password to never expire](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-policy#set-a-password-to-never-expire)

``` ps
Update-MgUser -UserId <user ID> -PasswordPolicies DisablePasswordExpiration
```

However, there�s is caveat here. With �EnforceCloudPasswordPolicyForPasswordSyncedUsers� feature, the next time a user or admin updates the on-premises AD password, AADConnect�s PHS agent will sync the password and set the user�s policy to �None�, so as noted in our official documentation, the password policy must be manually set again to never expire. 

### Why are users with expired passwords not being prompted to change their password?
Password expiration is only evaluated during interactive password based sign ins.  If the user signed in via  session cookie, the password expiration is not evaluated.

Request a sign in HAR\Fiddler or sign in log correlation ID and timestamp and check [ASC Auth Troubleshooter](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/757718/TSG-General-ASC-Auth-Troubleshooter-Steps) for that sign in.  Once the correlation ID is loaded in auth troubleshooter, check the following

1. Browse to Auth Troubleshooter's "Expert View"
2. Check the "Credentials" tab and check the "Credential Type"
3. If the Credential Type says "Session Token" this is not an interactive username\password authentication and thus the password expiration would not be evaluated, and user would not be prompted to change their expired password
4. This can also be seen on the "PerRequestLogs" tab -> Filter by parameter "EventData" -> Review for "IT:Session" parameter which would indicate a session based cookie sign in.
5. Other useful values from Auth Troubleshooter's Diagnostic Log tab, filter and CTRL+F for or review the "User Account" tab

   * EnforceChangePasswordPolicy = Whether or not eSTS enforced password change on the sign in
   * ForceChangePassword, If True, then passwordProfile\forceChangePasswordNextSignIn is enabled on user.
   * PasswordNeverExpires = Whether or not eSTS determined user's password is configured to never expire.  If False, then DisablePasswordExpiration is not enabled in User's PasswordPolicies
   * LastPasswordChangeTimestamp = Timestamp eSTS determined user's password was last changed
   * LastAuthenticatedTimestamp = Timestamp eSTS determined user last authenticated interactively
   * DnsDomainName = User's managed DNS Domain Name (check if the domain has a custom PasswordValidityPeriodDays, otherwise it defaults to 90 days).  This can also be checked in ASC Tenant Explorer -> Domains tab -> Add column "Password Validity Days".  If N/A then default 90 days is used and to customize customer must run `Update-MgDomain -DomainId "contoso.com" -PasswordValidityPeriodInDays 120` for example.


7. Simple test.  If they think the password is expired in cloud.  Open incognito browser ->
https://portal.azure.com -> sign in with interactive username\password.  Are they prompted to change password or not?  If not, get Fiddler of that and evaluate with ASC Auth troubleshooter using above steps. Otherwise, it isn't an interactive sign in and password expiration is not evaluated unless it is interactive sign in.

8. If app is doing SSO with any type of session cookie.  Then password expiration isn't evaluated. Admin needs to revoke all refresh tokens for user and force them to sign in again interactively. ie. [Revoke-MgUserSignInSession](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access#microsoft-entra-environment) . Review [Token Revocation](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens#token-revocation) for when certain tokens are expired\revoked


--------------------------
16/12/2021 - V1

29/03/2022 - V2 (Reviewed by nualex)





