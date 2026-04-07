---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Passsword Management/Password Writeback/Password Writeback Support Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/pages?pagePath=/Sync%20Provisioning/Cloud%20Sync/Passsword%20Management/Password%20Writeback/Password%20Writeback%20Support%20Overview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Syncronization
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Syncronization](/Tags/AAD%2DSyncronization) 

 
[[_TOC_]]


# Compliance note
This wiki contains test and/or lab data only.

# Feature overview


Azure AD Connect cloud sync is designed to meet and accomplish hybrid identity goals in the cloud. It accomplishes this by using the lightweight Azure AD cloud provisioning agent. 

Password writeback allows password changes in the cloud for users that exist in an on-premises Active Directory Domain Services (AD DS) environment to be written back to an existing on-premises directory in real time. 

The **Password writeback** feature of **Azure AD Connect cloud sync** provides the capability to writeback on-premises user password changes in the cloud to the on-premises directory in real time using the lightweight Azure AD cloud provisioning agent. 


# Case handling

This feature is supported by  [MSaaS AAD - Sync Professional](https://msaas.support.microsoft.com/queue/2325b935-9d09-e711-8122-002dd815174d), [MSaaS AAD - Sync Provisioning Premier](https://msaas.support.microsoft.com/queue/2697b5fc-465c-e711-813c-001dd8b72a16)

# Licensing

This feature requires Azure AD Premium P1 or better.

# Risks

There are no known risks.

# Supported password writeback operations

Passwords are written back in all the following situations:

1. Supported end-user operations

   a.    Any end-user self-service voluntary change password operation.

   b.    Any end-user self-service force change password operation, for example, password expiration.

   c.    Any end-user self-service password reset that originates from the [password reset portal](https://passwordreset.microsoftonline.com/).

2. Supported administrator operations

   a.    Any administrator self-service voluntary change password operation.

   b.    Any administrator self-service force change password operation, for example, password expiration.

   c.    Any administrator self-service password reset that originates from the [password reset portal](https://passwordreset.microsoftonline.com/).

   d.    Any administrator-initiated end-user password reset from the [Azure portal](https://portal.azure.com/).

   e.    Any administrator-initiated end-user password reset from the [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/passwordauthenticationmethod-resetpassword?tabs=http).

# Unsupported password writeback operations

Passwords aren't written back in any of the following situations:

1. Unsupported end-user operations

   a.    Any end user resetting their own password by using PowerShell cmdlets or the Microsoft Graph API.

2. Unsupported administrator operations

   a.    Any administrator-initiated end-user password reset by using PowerShell cmdlets

   b.    Any administrator-initiated end-user password reset from the [Microsoft 365 admin center](https://admin.microsoft.com/).

   c.    Any administrator cannot use password reset tool to reset their own password, or any other Administrator in Azure AD for password writeback.



# Prequisites

1. An Azure AD tenant with at least an Azure AD Premium P1 or trial license enabled. 

   If needed, [create one for free](https://azure.microsoft.com/en-us/free). 

1. An account with global administrator privileges. 

1. Azure AD configured for self-service password reset. 

   If needed, [complete this tutorial to enable Azure AD SSPR](https://docs.microsoft.com/en-us/azure/active-directory/authentication/tutorial-enable-sspr). 

1. An on-premises AD DS environment configured with Azure AD Connect cloud sync version 1.1.587 or later. 

   If needed, [configure Azure AD Connect cloud sync using this tutorial](https://docs.microsoft.com/en-us/azure/active-directory/cloud-sync/tutorial-single-forest). 

1. Enabling password writeback in Azure AD Connect cloud sync requires executing signed PowerShell scripts. 

   - Ensure that the PowerShell execution policy will allow running of scripts. 

   - The recommended execution policy during installation is "RemoteSigned". 

   - For more information on setting the PowerShell execution policy, see [Set-ExecutionPolicy](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy). 


# How to configure and manage


## Configure Azure AD Connect cloud sync service account permissions 

The Azure AD Connect cloud sync group managed service account (gMSA) should have the following permissions set to writeback the passwords by default: 

1. Reset password 
2. Write permissions on lockoutTime 
3. Write permissions on pwdLastSet 

1. Extended rights for "Unexpire Password" on the root object of each domain in that forest, if not already set. 

If these permissions are not set, you can set the PasswordWriteBack permission on the service account by using the Set-AADCloudSyncPermissions cmdlet and on-premises enterprise administrator credentials: 
```powershell
$cred = Get-Credential 

Import-Module 'C:\Program Files\Microsoft Azure AD Connect Provisioning Agent\Microsoft.CloudSync.Powershell.dll' 

Set-AADCloudSyncPermissions -PermissionType PasswordWriteBack -EACredential $cred 
```



After you have updated the permissions, it may take up to an hour or more for these permissions to replicate to all the objects in your directory. 

If you don't assign these permissions, writeback may appear to be configured correctly, but users may encounter errors when they update their on-premises passwords from the cloud. Permissions must be applied to This object and all descendant objects for "Unexpire Password" to appear. 

If passwords for some user accounts aren't written back to the on-premises directory, make sure that inheritance isn't disabled for the account in the on-prem AD DS environment. Write permissions for passwords must be applied to descendant objects for the feature to work correctly. 

Password policies in the on-premises AD DS environment may prevent password resets from being correctly processed. If you are testing this feature and want to reset password for users more than once per day, the group policy for Minimum password age must be set to 0. This setting can be found under Computer Configuration > Policies > Windows Settings > Security Settings > Account Policies within gpmc.msc. 

If you update the group policy, wait for the updated policy to replicate, or use the gpupdate /force command. 

For passwords to be changed immediately, Minimum password age must be set to 0. However, if users adhere to the on-premises policies, and the Minimum password age is set to a value greater than zero, password writeback will not work after the on-premises policies are evaluated. 

For more information on how to validate or set up the appropriate permissions refer to this [link](https://docs.microsoft.com/en-us/azure/active-directory/authentication/tutorial-enable-sspr-writeback#configure-account-permissions-for-azure-ad-connect). 

## Enable password writeback in Azure AD Connect cloud sync 



Enable password writeback in Azure AD Connect cloud sync by using the Set-AADCloudSyncPasswordWritebackConfiguration cmdlet and tenants global administrator credentials: 

```powershell
$aadCred = Get-Credential 

Import-Module 'C:\Program Files\Microsoft Azure AD Connect Provisioning Agent\Microsoft.CloudSync.Powershell.dll' 

Set-AADCloudSyncPasswordWritebackConfiguration -Enable $true -Credential $aadCred 
```

[![Picture1.png](/.attachments/AAD-Synchronization/540975/Picture1.png)](/.attachments/AAD-Synchronization/540975/Picture1.png)

## Enable password writeback for Azure AD self-service password reset 



With password writeback enabled in Azure AD Connect cloud sync, now verify, and configure Azure AD self-service password reset (SSPR) for password writeback. When you enable SSPR to use password writeback, users who change or reset their password have that updated password synchronized back to the on-premises AD DS environment as well. 

To verify and enable password writeback in SSPR, complete the following steps: 

 

1. Sign into the [Azure portal](https://portal.azure.com/) using a global administrator account. 

1. Verify the Azure AD Connect cloud sync agent set up is complete.

[![Picture2.jpg](/.attachments/AAD-Synchronization/540975/Picture2.jpg)](/.attachments/AAD-Synchronization/540975/Picture2.jpg)

4. Set the option for Write back passwords to your on-premises directory? to Yes.
5. Set the option for Allow users to unlock accounts without resetting their password? to Yes.

[![Picture3.png](/.attachments/AAD-Synchronization/540975/Picture3.png)](/.attachments/AAD-Synchronization/540975/Picture3.png)

## Removing SSPR password writeback functionality

If you no longer want to use the SSPR password writeback functionality you have configured as part of this document, complete the following steps:

 

1. Sign into the [Azure portal](https://portal.azure.com/) using a global administrator account.

2. Search for and select Azure Active Directory, select Password reset, then choose On-premises integration.
3. Set the option for Write back passwords to your on-premises directory? to No.
4. Set the option for Allow users to unlock accounts without resetting their password? to No.

Complete the following steps from your Azure AD Connect cloud sync server.

Disable password writeback in Azure AD Connect cloud sync by using the Set-AADCloudSyncPasswordWritebackConfiguration cmdlet and tenants global administrator credentials.

Import-Module C:\\Program Files\\Microsoft Azure AD Connect Provisioning Agent\\Microsoft.CloudSync.Powershell.dll
```powershell
Set-AADCloudSyncPasswordWritebackConfiguration -Enable $false -Credential $(Get-Credential)
```


# Troubleshooting

See [TSG: SSPR Password Writeback with Cloud Sync Agent](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/540560/TSG-SSPR-Password-Writeback-with-Cloud-Sync-Agent) for the latest in TSGs for this feature.


# Supportability documentation

## External documentation


[Install the Azure AD Connect provisioning agent](https://docs.microsoft.com/en-us/azure/active-directory/cloud-sync/how-to-install)

[Using Set-AADCloudSyncPermissions](https://docs.microsoft.com/en-us/azure/active-directory/cloud-sync/how-to-gmsa-cmdlets#using-set-aadcloudsyncpermissions)


[Azure AD Connect cloud sync troubleshooting: Password writeback](https://docs.microsoft.com/en-us/azure/active-directory/cloud-sync/how-to-troubleshoot?anchor=password-writeback) 

[How does self-service password reset writeback work in Azure Active Directory?](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-writeback)

[Tutorial: Enable cloud sync self-service password reset writeback to an on-premises environment (preview)](https://docs.microsoft.com/en-us/azure/active-directory/authentication/tutorial-enable-cloud-sync-sspr-writeback)


See [Blogs and External Documentation](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/540560/TSG-SSPR-Password-Writeback-with-Cloud-Sync-Agent?anchor=blogs-and-external-documentation) on the TSG page for more. 





## Training sessions and brownbags

### Deep Dive: 14511 - Password Writeback Using Azure AD Connect Provisioning Agent

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 14511 - Password Writeback Using Azure AD Connect Provisioning Agent](https://aka.ms/AAe2rbv) course.
