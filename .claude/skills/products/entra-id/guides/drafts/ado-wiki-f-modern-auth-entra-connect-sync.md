---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Wizard and ADSync service/Modern Authentication For Entra Connect Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FWizard%20and%20ADSync%20service%2FModern%20Authentication%20For%20Entra%20Connect%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
- cw.Entra-Connect
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect) [Entra-Connect](/Tags/Entra%2DConnect)

[[_TOC_]]

# Description: 

As part of our Microsoft SFI, we are updating Microsoft Entra Connect to authenticate with Microsoft Entra using app-based certificate authentication instead of username and password. 
This update will roll out as part of Entra Connect Sync updates that will be released near the end of April 2025. As part of a larger change in Microsoft Entra and a new Entra Connect Service Principal that is now active called: Microsoft Entra AD Synchronization Service that will handle all authentication from newer versions of Entra Connect Sync, moving forward.

# Certificate Management Options: 

There are two options for managing certificates for use with Entra Connect Sync, **Managed by Microsoft Entra Connect (Recommended)** and **Bring Your Own Certificate (BYOC)**. An advantage of using Managed by Microsoft Entra Connect, is automatic rollover of the certificate when the certificate expires. This is not possible with **Bring You Own Certificate (BYOC)** scenarios. Customers will have to manage the certificate rollover if they are providing their own certificate.  

# Microsoft Entra Connect Sync Prerequisites:

- Minimum Microsoft Entra Connect version: *   [Microsoft Entra Connect](https://www.microsoft.com/download/details.aspx?id=47594)version[2.5.3.0](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=/Sync%20Provisioning/Connect%20Sync/Wizard%20and%20ADSync%20service/reference%20connect%20version%20history&anchor=2530)or greater for manual onboarding.
*   Microsoft Entra Connect version[2.5.76.0](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=/Sync%20Provisioning/Connect%20Sync/Wizard%20and%20ADSync%20service/reference%20connect%20version%20history&anchor=25760)or greater for automatic onboarding
- You have the administrative rights in Entra to make authentication changes. You can use the Global Administrator (GA) or the Hybrid Identity Administrator (HIA) role. HIA role is recommended

## Managed by Microsoft Entra Connect 

**Prerequisites:**

- TPM 2.0 is present and ready to use is recommended, but will not be a requirement at public preview.
- Maintenance is enabled and the scheduler is not suspended.

Confirm that the system is TPM enabled:

To confirm if TPM is present and enabled, run the following command in an elevated PowerShell session:

```
Get-TPM
```

**Results:**
 - **TPMPresent**  If True then TPM is present on the Machine
 - **TPMReady**  If this is True then TPM is provisioned and active 


![Get-TPM Output](.attachments\AAD-Synchronization\2016767\Get-TPM-Output.png)

**Hyper-V**
If the server OS / Hardware is not capable of supporting TPM, Hyper-V Gen 2 VMs can be used to support TPM. The VMs must be set to Gen 2 during creation. A Gen 1 VM cannot be converted to a Gen 2 VM. To enable TPM on a Gen 2 Hyper-V VM, use the following steps: 
1. Launch Hyper-V Manager
2. Ensure that the VM that will host Entra Connect Sync is not running. 
3. Right click on the VM that will host Entra Connect Sync, choose Settings, and then select Security from the Settings page. 
4. Enable Enable Trusted Platform Module and apply the settings. TPM will now be enabled in this specific VM.  

**Note: TPM just needs to be enabled on the server that will run Entra Connect Sync. It is not required to be enabled on other servers for the new authentication to work.**


![Hyper-V Gen 2 VM TPM Setting](.attachments\AAD-Synchronization\2016767\Hyper-V-Gen-2-TPM-Setting.png)

**Third Party VM:**
Customers will have to consult with the VM vendor for steps to enable TPM on any third party VM solutions. 

## Bring Your Own Certificate (BYOC)

Prerequisites:

A certificate is created in HSM using CNG provider and the private key is marked as non-exportable. The following certificate configurations are supported:
- KeyLength: 2048
- KeyAlgorithm: RSA
- KeyHashAlgorithm: SHA256

# Setup Flow:

![Setup Flow Diagram](.attachments\AAD-Synchronization\2016767\Setup-Flow-Diagram.png)


## Prerequisites

The following prerequisites are required to implement authentication by using application identity.

>[!IMPORTANT]
> New Microsoft Entra Connect Sync versions are available only via the Microsoft Entra admin center.
>
> Following up on the [What's New](../../../fundamentals/whats-new-archive.md#general-availability---download-microsoft-entra-connect-sync-on-the-microsoft-entra-admin-center) communication, new versions of Microsoft Entra Connect Sync are available only on the[Microsoft Entra Connect pane](https://entra.microsoft.com/#view/Microsoft_AAD_Connect_Provisioning/AADConnectMenuBlade/%7E/GetStarted) within the Microsoft Entra admin center and will no longer be released to the [Microsoft Download Center](https://www.microsoft.com/en-us/download/details.aspx?id=47594).

- [Microsoft Entra Connect](https://www.microsoft.com/download/details.aspx?id=47594) version [2.5.3.0](reference-connect-version-history.md#2530) or greater for manual onboarding.
- Microsoft Entra Connect version [2.5.76.0](reference-connect-version-history.md#25760) or greater for automatic onboarding
- Microsoft Entra account with at least a [Hybrid Identity Administrator](../../role-based-access-control/permissions-reference.md#hybrid-identity-administrator) role.
- Optional: TPM 2.0 present and ready to use (highly recommended for security).

The following extra requirements are needed for BYOA and BYOC certificate management option:

- A certificate is created in an HSM or TPM by using a Cryptography API: Next Generation provider. The private key is marked as NonExportable. A warning event 1014 is emitted if TPM isn't used. The following certificate configurations are supported:
   - `KeyUsage`: DigitalSignature
   - `KeyLength`: 2048
   - `KeyAlgorithm`: RSA
   - `KeyHashAlgorithm`: SHA256
- The created certificate is stored in the `LOCAL_MACHINE` store.
- Grant the Microsoft Entra Connect Sync account permission to perform signing by using the private key.

The following extra requirements are needed for the BYOA application management option:

- The customer creates a certificate as instructed in the preceding BYOC prerequisites.
- The customer registers an application in Microsoft Entra ID and creates a service principal. The necessary permissions are granted to the application.
- The customer registers the certificate with the application.

## View the current authentication configuration

To view the current authentication configuration, run the Wizard and go to **Tasks**, and then select **View or export current configuration**. 

If the server is configured to use application-based authentication, you should be able to see the application (client) ID as shown in the following screenshot.

![authentication-client-id.png](.attachments\AAD-Synchronization\2016767\authentication-client-id.png)


 Scroll down to the certificate details. The following table provides information about the certificate.
 
|Property|Description|
|-----|-----|
|**Certificate managed by**|Whether Microsoft Entra Connect Sync or BYOC manages the certificate|
|**Automatic rotation enabled**|Whether automatic rotation or manual rotation is enabled|
|**Certificate thumbprint**|Unique identifier for the certificate|
|**Certificate SHA256 hash**|A fingerprint for the certificate generated by using the SHA-256 hashing algorithm|
|**Subject name**|Identifies the entity associated with the certificate|
|**Issued by**|Who is the issuer of the certificate|
|**Serial number**|Uniquely identifies the certificate among certificates by the same issuer|
|**Not valid before**|The first date that the certificate is valid|
|**Not valid after**|The last date that the certificate is valid|

 ![auth-7.png](.attachments\AAD-Synchronization\2016767\auth-7.png)

If the server is using username and password, you should be able to see the account name as shown in the following screenshot.

![authentication-account-name.png](.attachments\AAD-Synchronization\2016767\authentication-account-name.png)

## Installation and upgrade (managed by Microsoft Entra Connect)

The Microsoft Entra Connect Sync managed application and credential is automatically set up during initial installation or manual interactive upgrades. To confirm that Microsoft Entra Connect is using the application identity, you can view the [current authentication configuration](#view-the-current-authentication-configuration).

## Onboard to application-based authentication

### Automatic onboarding

Starting with version 2.5.76.0 or higher, the service will automatically configure application authentication within a six-hour window if the service is using username and password to authenticate to Microsoft Entra ID.

### Manual onboarding

If application authentication wasn't automatically configured, you can switch to application-based authentication manually.

If you want to configure application-based authentication using the default option (Managed by Microsoft Entra Connect), you can use the wizard. However, if you want to configure application-based authentication using BYOC or BYOA, you must use PowerShell.

#### [Default application](#tab/default-application)

Step 1.	Start the Microsoft Entra Connect wizard

Step 2.	Go to **Additional tasks** > **Configure application-based authentication to Microsoft Entra ID** and then follow the prompts.

![auth-4.png](.attachments\AAD-Synchronization\2016767\auth-4.png)

#### [BYOC with default application](#tab/byoc-default-application)

> [!NOTE]
> Ensure that you're on the Microsoft Entra Connect server and that the Microsoft Entra Connect Sync (ADSync) PowerShell module is installed.

Use the [current authentication configuration wizard view](#view-the-current-authentication-configuration) to confirm that Microsoft Entra Connect is using the application identity, or use PowerShell command to verify the current authentication method.

``` powershell
Get-ADSyncEntraConnectorCredential
```

This command returns the `ConnectorIdentityType` value currently in use. The value can be `ServiceAccount` or `Application`. If the authentication is using `ServiceAccount` then proceed with the following steps to switch from `ServiceAccount` to `Application`. If the authentication is using `Application`, then skip to **Change Application certificate to your own certificate** steps.

##### Switch from ServiceAccount to Application

Step 1. Start the Microsoft Entra Connect wizard.

Step 2.	Go to **Additional tasks** > **Configure application-based authentication to Microsoft Entra ID** and then follow the prompts.

![auth-4.png](.attachments\AAD-Synchronization\2016767\auth-4.png)

##### Change application certificate to your own certificate

1. Export the certificate (.cer) file to upload it to Microsoft Entra app registration using one of the following options:

**Option 1**: Using mmc console to export a certificate from the Windows certificate stores:

Option 1. 1.	Open the certificate management console for the local computer by running the following command. Some methods of running this command are from the Start menu, the Windows Run prompt, PowerShell prompt, or command prompt.

``` powershell
certlm.msc
```

Option 1. 2.	In the console tree, navigate to the certificate you want to export.

Option 1. 3.	Right-click the certificate, select **All Tasks**, and then select **Export**.

Option 1. 4.	On the screen, select **Welcome to the Certificate Export Wizard**, select **Next**.

Option 1. 5.	If prompted to export the private key, select **No, do not export the private key**, then select **Next**.

Option 1. 6.	For the file format, select **DER encoded binary X.509 (.CER)**, then select **Next**.

Option 1. 7.	Enter or browse to the file path, then select **Next**.

Option 1. 8.	Review the summary, then select **Finish**.

**Option 2**: Use PowerShell to export the certificate:

``` powershell
$cerFile  = "C:\Temp\MyBYOC.cer"
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  
Export-Certificate -Cert $cert -FilePath $cerFile
```

Step 2. In the [Microsoft Entra Admin Center](https://entra.microsoft.com) navigate to **Entra ID** **App Registration**, and select the application that was created during the installation, configuration or the upgrade of Connect Sync. To confirm which application is used by Connect Sync you can run the `Get-ADSyncEntraConnectorCredential` command to retrieve the application (client) ID. The username format is `{AppID}@tenantName.onmicrosoft.com`. Under **Certificate & secrets** select **Upload certificate** and upload the exported .cer file and select **Add**:

 ![app-registration-certificate.png](.attachments\AAD-Synchronization\2016767\app-registration-certificate.png)

Step 3. Get the certificate Hash using the following PowerShell commands

``` powershell
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  

# Get raw data from X509Certificate cert
$certRawDataString = $cert.GetRawCertData()
 
# Compute SHA256Hash of certificate 
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($certRawDataString)
```

If you are using **PowerShell version 7**, use the following command:

``` powershell
$certHash = [System.Convert]::ToHexString($hashBytes)
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use the following command:

``` powershell
$certHash = ($hashBytes|ForEach-Object ToString X2) -join ''
```
Step 4. Grant Connect Sync (ADSync) service account permissions to retrieve the certificate private key:
``` powershell
$rsaCert = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
```

If the certificate was **issued by a Certificate Authority (CA)** use the following `$path` variable:
```powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\RSA\MachineKeys\$($rsaCert.key.UniqueName)"
```

If you are using a **self-signed** certificate, use the following `$path` variable:
``` powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\Keys\$($rsaCert.key.UniqueName)"
```

Then proceed to run the following commands to grant the permission:

``` powershell
$permissions = Get-Acl -Path $path
$serviceAccount = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\ADSync -Name ObjectName).ObjectName
$rule = New-Object Security.Accesscontrol.FileSystemAccessRule "$serviceAccount", "read", allow
$permissions.AddAccessRule($rule)
Set-Acl -Path $path -AclObject $permissions
 
# Verify permissions
$permissions = Get-Acl -Path $path
$permissions.Access
```

Step 5. Disable the sync scheduler 
```powershell
Set-ADSyncScheduler -SyncCycleEnabled $false
```

Step 6. Import ADSync module:
If you are using **PowerShell version 7**, use the following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync" -UseWindowsPowerShell
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync"
```

Step 7. Update the application certificate using the certificate rotation command
``` powershell
Invoke-ADSyncApplicationCredentialRotation -CertificateSHA256Hash $certHash 
```

Step 8. Use the [current authentication configuration](#view-the-current-authentication-configuration) wizard view to confirm that Microsoft Entra Connect is using your new certificate.

Step 9. Enable the sync scheduler
``` powershell
Set-ADSyncScheduler -SyncCycleEnabled $true
```

Step 10. [Remove the Directory Synchronization Account (DSA) from Microsoft Entra ID (recommended)](#remove-a-legacy-service-account).

#### [BYOA with BYOC](#tab/byoa-with-byoc)
Creating the application using PowerShell:

Step 1. Connect to your tenant
``` powershell
Connect-MgGraph -scopes "Application.ReadWrite.All", "AppRoleAssignment.ReadWrite.All"
```

Step 2. Create and initialize BYOA application
``` powershell
$BYOApp = New-MgApplication -DisplayName "My BYOA For Connect Sync serverName"
```

Step 3. Create and initialize BYOA service principal name
``` powershell
$BYOA_ServicePrincipal = New-MgServicePrincipal -AppId $BYOApp.AppId
```

Step 4. Initialize `ConnectSyncAppId` and `ConnectSyncSPId` variables:
``` powershell
$ConnectSyncAppId = $BYOApp.AppId
$ConnectSyncSPId = $BYOA_ServicePrincipal.Id
```

Step 5. Initialize `SynchronizationServiceAppId` variable that represents the application (client) ID for **Microsoft Entra AD Synchronization Service**. The value is `6bf85cfa-ac8a-4be5-b5de-425a0d0dc016` for **all clouds**:

``` powershell
$SynchronizationServiceAppId = "6bf85cfa-ac8a-4be5-b5de-425a0d0dc016"
```

Step 6. Initialize `SynchronizationServiceSPId` variable:
```powershell
$SynchronizationServiceSPId = (Get-MgServicePrincipal -Filter "appId eq '$SynchronizationServiceAppId'").Id
```

Step 7. Initialize `SynchronizationServiceAppRoleId` variable:
```powershell
$SynchronizationServiceAppRoleId =  (Get-MgServicePrincipal -Filter "appId eq '$SynchronizationServiceAppId'").AppRoles | Where-Object {$_.Value -eq "ADSynchronization.ReadWrite.All"} | Select-Object -ExpandProperty Id
```
> [!NOTE]
> If you are using **Password Writeback** feature then proceed with the following steps, otherwise you can skip to step 11.

Step 8. Initialize `PasswordResetServiceAppId` variable:
For **all clouds** except Arlington use:
```powershell
$PasswordResetServiceAppId = "93625bc8-bfe2-437a-97e0-3d0060024faa"
```

For **Arlington** cloud use:
```powershell
$PasswordResetServiceAppId = "2e5ecfc8-ea79-48bd-8140-c19324acb278"
```

Step 9. Initialize `PasswordResetServiceSPId` variable:
```powershell
$PasswordResetServiceSPId = (Get-MgServicePrincipal -Filter "appId eq '$PasswordResetServiceAppId'").Id
```

Step 10. Initialize Password Reset AppRoles variables:
```powershell
$PasswordResetServiceServiceOffboardClientAppRoleId = (Get-MgServicePrincipal -Filter "appId eq '$PasswordResetServiceAppId'").AppRoles | Where-Object {$_.Value -eq "PasswordWriteback.OffboardClient.All"} | Select-Object -ExpandProperty Id
$PasswordResetServiceServiceRegisterClientAppRoleId = (Get-MgServicePrincipal -Filter "appId eq '$PasswordResetServiceAppId'").AppRoles | Where-Object {$_.Value -eq "PasswordWriteback.RegisterClientVersion.All"} | Select-Object -ExpandProperty Id
$PasswordResetServiceServiceRefreshClientAppRoleId = (Get-MgServicePrincipal -Filter "appId eq '$PasswordResetServiceAppId'").AppRoles | Where-Object {$_.Value -eq "PasswordWriteback.RefreshClient.All"} | Select-Object -ExpandProperty Id
```

Step 11. Initialize `RequiredResourceAccess` variable to configure required permissions for Microsoft Entra AD Synchronization Service and Microsoft password reset service:
If you **dont use Password writeback**, then use:
```powershell
$RequiredResourceAccess = @(
    @{
        ResourceAppId = $SynchronizationServiceAppId
        ResourceAccess = @(
            @{
                Id = $SynchronizationServiceAppRoleId
                Type = "Role"
            }
        )
    }
)
```
If you **use Password writeback**, then use:
```powershell
$RequiredResourceAccess = @(
    @{
        ResourceAppId = $SynchronizationServiceAppId
        ResourceAccess = @(
            @{
                Id = $SynchronizationServiceAppRoleId
                Type = "Role"
            }
        )
    },
    @{
        ResourceAppId = $PasswordResetServiceAppId
        ResourceAccess = @(
            @{
                Id = $PasswordResetServiceServiceOffboardClientAppRoleId
                Type = "Role"
            },
            @{
                Id = $PasswordResetServiceServiceRegisterClientAppRoleId
                Type = "Role"
            },
            @{
                Id = $PasswordResetServiceServiceRefreshClientAppRoleId
                Type = "Role"
            }
        )
    }
)
```

Step 12. Update the application with the required permissions:
``` powershell
Update-MgApplication -ApplicationId $BYOApp.Id -RequiredResourceAccess $RequiredResourceAccess
```

Step 13. Create app role assignment for Synchronization Service:
``` powershell
$SyncAppRoleAssignment = New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $BYOA_ServicePrincipal.Id -PrincipalId $BYOA_ServicePrincipal.Id -ResourceId $SynchronizationServiceSPId -AppRoleId $SynchronizationServiceAppRoleId
```
> [!NOTE]
>If you are using **Password Writeback** feature then proceed with following steps, otherwise you can skip to step 15.

Step 14. Create app role assignment for Password Writeback feature:
``` powershell
$OffboardAppRoleAssignment = New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $BYOA_ServicePrincipal.Id -PrincipalId $BYOA_ServicePrincipal.Id -ResourceId $PasswordResetServiceSPId -AppRoleId $PasswordResetServiceServiceOffboardClientAppRoleId
 
$RegisterAppRoleAssignment = New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $BYOA_ServicePrincipal.Id -PrincipalId $BYOA_ServicePrincipal.Id -ResourceId $PasswordResetServiceSPId -AppRoleId $PasswordResetServiceServiceRegisterClientAppRoleId
 
$RefreshAppRoleAssignment = New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $BYOA_ServicePrincipal.Id -PrincipalId $BYOA_ServicePrincipal.Id -ResourceId $PasswordResetServiceSPId -AppRoleId $PasswordResetServiceServiceRefreshClientAppRoleId
```

Step 15. Export the certificate (.cer) file to upload it to Microsoft Entra app registration using one of the following options:

**Option 1**: Using mmc console to export a certificate from the Windows certificate stores:
Option 1.1.	Open the certificate management console for the local computer by running the following command. Some methods of running this command are from the Start menu, the Windows Run prompt, PowerShell prompt, or command prompt.

``` powershell
certlm.msc
```
Option 1.2.	In the console tree, navigate to the certificate you want to export.
Option 1.3.	Right-click the certificate, select **All Tasks**, and then select **Export**.
Option 1.4.	On the **Welcome to the Certificate Export Wizard** screen, select **Next**.
Option 1.5.	If prompted to export the private key, select **No, do not export the private key**, then select **Next**.
Option 1.6.	For the file format, select **DER encoded binary X.509 (.CER)**, then select **Next**.
Option 1.7.	Enter or browse to the file path, then select **Next**.
Option 1.8.	Review the summary, then select **Finish**.

**Option 2**: Use PowerShell to export the certificate:

``` powershell
$cerFile  = "C:\Temp\MyBYOC.cer"
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  
Export-Certificate -Cert $cert -FilePath $cerFile
```

Step 16. In the [Microsoft Entra admin center](https://entra.microsoft.com), navigate to **Entra ID** > **App Registration**, and select the application that was created in step 2. Under **Certificate & secrets**, select  **Upload certificate** and upload the exported .cer file and select **Add**:

![app-registration-certificate-bring-your-application.png](.attachments\AAD-Synchronization\2016767\app-registration-certificate-bring-your-application.png)

Step 17. Get the certificate Hash using the following PowerShell commands

``` powershell
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  

# Get raw data from X509Certificate cert
$certRawDataString = $cert.GetRawCertData()
 
# Compute SHA256Hash of certificate 
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($certRawDataString)
```

If you are using **PowerShell version 7**, use the following command:

``` powershell
$certHash = [System.Convert]::ToHexString($hashBytes)
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use the following command:

``` powershell
$certHash = ($hashBytes|ForEach-Object ToString X2) -join ''
```
Step 18. Grant Connect Sync (ADSync) service account permissions to retrieve the certificate private key:
``` powershell
$rsaCert = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
```

If the certificate was **issued by a Certificate Authority (CA)** use the following `$path` variable:
```powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\RSA\MachineKeys\$($rsaCert.key.UniqueName)"
```

If you are using a **self-signed** certificate, use the following `$path` variable:
``` powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\Keys\$($rsaCert.key.UniqueName)"
```

Then proceed to run the following commands to grant the permission:

``` powershell
$permissions = Get-Acl -Path $path
$serviceAccount = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\ADSync -Name ObjectName).ObjectName
$rule = New-Object Security.Accesscontrol.FileSystemAccessRule "$serviceAccount", "read", allow
$permissions.AddAccessRule($rule)
Set-Acl -Path $path -AclObject $permissions
 
# Verify permissions
$permissions = Get-Acl -Path $path
$permissions.Access
```

Step 19. Disable the sync scheduler 
```powershell
Set-ADSyncScheduler -SyncCycleEnabled $false
```

Step 20. Import ADSync module:
If you are using **PowerShell version 7**, use the following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync" -UseWindowsPowerShell
```

Step 21. Switch to using your new application for authentication
``` powershell
Add-ADSyncApplicationRegistration -CertificateSHA256Hash $certHash ApplicationAppId $ConnectSyncAppId 
```

Step 22. Use the [current authentication configuration](#view-the-current-authentication-configuration) wizard view to confirm that Microsoft Entra Connect is using the application identity, or use PowerShell command to verify the current authentication method.

``` powershell
Get-ADSyncEntraConnectorCredential
```


Step 23. Enable the sync scheduler
``` powershell
Set-ADSyncScheduler -SyncCycleEnabled $true
```

Step 24. [Remove the Directory Synchronization Account (DSA) from Microsoft Entra ID (recommended)](#remove-a-legacy-service-account).

---

## Remove a legacy service account

After you transition to application-based authentication and Microsoft Entra Connect Sync is working as expected, we strongly recommend that you remove the legacy DSA username and password service account by using PowerShell. If you use a custom account that can't be removed, deprivilege it and remove the DSA role from it.

Follow these steps to remove the legacy service account.

1. Add the service account username and password.

     ``` powershell 
     $HACredential = Get-Credential
     ```

 2. You're prompted to enter the Microsoft Entra administrator `UserPrincipalName` value and the password. Enter the username and password.

 3. Next, remove the service account.

     ``` powershell
     Remove-ADSyncAADServiceAccount -AADCredential $HACredential -Name <$serviceAccountName>
     ```

    The `ServiceAccountName` value is the first part of the `UserPrincipalName` value of the service account used in Microsoft Entra ID. You can find this user in the list of users in the Microsoft Entra admin center. If the UPN is `Sync_Server_id@tenant.onmicrosoft.com`, use `Sync_Server_id` as the `ServiceAccountName` value.

## Roll back to a legacy service account by using PowerShell

If you want to go back to the legacy service account, you can use PowerShell to revert to using the service account to promptly mitigate the issue. Use the following steps to roll back to the service account.

As part of the rollback, we'll be re-creating the DSA account. This new account might take up to 15 minutes to take effect, so you might get an "Access Denied" error when you reenable the sync cycle.

1. Disable the scheduler to ensure that no sync cycles run until this change is completed.

     ``` powershell
     Set-ADSyncScheduler -SyncCycleEnabled $false
     ```

1. Add the service account. You're prompted to enter the Microsoft Entra administrator `UserPrincipalName` value and the password. Enter the credentials.

     ``` powershell
    Add-ADSyncAADServiceAccount
     ```

1. Get the current authentication mechanism and confirm that the `ConnectorIdentityType` value is back to `ServiceAccount`.

     ``` powershell
    Get-ADSyncEntraConnectorCredential
     ```

1. Reenable the scheduler to begin the synchronization service.

     ``` powershell
     Set-ADSyncScheduler -SyncCycleEnabled $true
     ```

## Certificate rotation

Microsoft Entra Connect warns if the certificate rotation is due. That is, if expiration is less than or equal to 150 days. It emits an error if the certificate is already expired. You can find these warnings (Event ID 1011) and errors (Event ID 1012) in the Application event log.

This message is emitted at the scheduler frequency if the scheduler isn't suspended. Run `Get-ADSyncScheduler` to see if the scheduler is suspended.

### Automatic

If Microsoft Entra Connect manages the certificate, *no action* is required from you unless the scheduler is suspended, Microsoft Entra Connect Sync adds the new certificate credential to the application, and tries to remove the old certificate credential. 

If it fails to remove the old certificate credential, an error event appears in the application logs in the **Event Viewer**.

If you see this error, run the following cmdlet in PowerShell to clean up the old certificate credential from Microsoft Entra ID. The cmdlet takes the `CertificateId` value of the certificate that must be removed, which you can obtain from the log or the Microsoft Entra admin center.

 ``` powershell
Remove-EntraApplicationKey -CertificateId <certificateId>
 ```

### Manual

If your configuration isn't eligible for automatic certificate rotation, you can rotate the certificate at any point in time, even if the current certificate is still not due for rotation or the current certificate expired.

#### [Default Application](#tab/default-cert-renewal)

1. Start the **Microsoft Entra Connect wizard**
1. Go to **Additional tasks** > **Rotate application certificate** and then follow the prompts.


![auth-6.png](.attachments\AAD-Synchronization\2016767\auth-6.png)

#### [BYOC with Default Application](#tab/byoc-cert-renewal)

When you get a warning from Microsoft Entra Connect Sync, we *highly recommend that you generate a new key and certificate and rotate the certificate* that Microsoft Entra Connect Sync uses.


Step 1. Export the certificate (.cer) file to upload it to Microsoft Entra app registration using one of the following options:

**Option 1**: Using mmc console to export a certificate from the Windows certificate stores:

Option 1.1.	Open the certificate management console for the local computer by running the following command. Some methods of running this command are from the Start menu, the Windows Run prompt, PowerShell prompt, or command prompt.

``` powershell
certlm.msc
```

Option 1.2.	In the console tree, navigate to the certificate you want to export.

Option 1.3.	Right-click the certificate, select **All Tasks**, and then select **Export**.

Option 1.4.	On the screen **Welcome to the Certificate Export Wizard**, select **Next**.

Option 1.5.	If prompted to export the private key, select **No, do not export the private key**, then select **Next**.

Option 1.6.	For the file format, select **DER encoded binary X.509 (.CER)**, then select **Next**.

Option 1.7.	Enter or browse to the file path, then select **Next**.

Option 1.8.	Review the summary, then select **Finish**.

**Option 2**: Use PowerShell to export the certificate:

``` powershell
$cerFile  = "C:\Temp\MyBYOC.cer"
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  
Export-Certificate -Cert $cert -FilePath $cerFile
```

Step 2. In the [Microsoft Entra admin center](https://entra.microsoft.com) navigate to **App Registration**, and select the application that was created during the installation, configuration or the upgrade of Connect Sync. To confirm which application used by Connect Sync you can run the `Get-ADSyncEntraConnectorCredential` command to retrieve the application (client) ID. The username format is `{AppID}@tenantName.onmicrosoft.com`. Under **Certificate & secrets**, select **Upload certificate** and upload the exported .cer file and select **Add**:

![app-registration-certificate.png](.attachments\AAD-Synchronization\2016767\app-registration-certificate.png)

Step 3. Get the certificate Hash using the following PowerShell commands

``` powershell
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  

# Get raw data from X509Certificate cert
$certRawDataString = $cert.GetRawCertData()
 
# Compute SHA256Hash of certificate 
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($certRawDataString)
```

If you are using **PowerShell version 7**, use the following command:

``` powershell
$certHash = [System.Convert]::ToHexString($hashBytes)
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use following command:

``` powershell
$certHash = ($hashBytes|ForEach-Object ToString X2) -join ''
```
Step 4. Grant Connect Sync (ADSync) service account permissions to retrieve the certificate private key:
``` powershell
$rsaCert = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
```

If the certificate was **issued by a Certificate Authority (CA)** use following `$path` variable:
```powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\RSA\MachineKeys\$($rsaCert.key.UniqueName)"
```

If you are using a **self-signed** certificate, use the following `$path` variable:
``` powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\Keys\$($rsaCert.key.UniqueName)"
```

Then proceed to run the following commands to grant the permission:

``` powershell
$permissions = Get-Acl -Path $path
$serviceAccount = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\ADSync -Name ObjectName).ObjectName
$rule = New-Object Security.Accesscontrol.FileSystemAccessRule "$serviceAccount", "read", allow
$permissions.AddAccessRule($rule)
Set-Acl -Path $path -AclObject $permissions
 
# Verify permissions
$permissions = Get-Acl -Path $path
$permissions.Access
```

Step 5. Disable the sync scheduler 
```powershell
Set-ADSyncScheduler -SyncCycleEnabled $false
```

Step 6. Import ADSync module:
If you are using **PowerShell version 7**, use following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync" -UseWindowsPowerShell
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync"
```

Step 7. Update the application certificate using the certificate rotation command
``` powershell
Invoke-ADSyncApplicationCredentialRotation -CertificateSHA256Hash $certHash 
```

Step 8. Use the [current authentication configuration](#view-the-current-authentication-configuration) wizard view to confirm that Microsoft Entra Connect is using your new certificate.

Step 9. Enable the sync scheduler
``` powershell
Set-ADSyncScheduler -SyncCycleEnabled $true
```

Step 10. Remove the old certificate from the LOCAL_MACHINE store.


#### [BYOA with BYOC](#tab/byoa-with-byoc-cert-renewal)

When you get a warning from Microsoft Entra Connect Sync, we *highly recommend that you generate a new key and certificate and rotate the certificate* that Microsoft Entra Connect Sync uses.

Step 1. Export the certificate (.cer) file to upload it to the Microsoft Entra app registration using one of the following options:
**Option 1**: Using mmc console to export a certificate from the Windows certificate stores:
Option 1.1.	Open the certificate management console for the local computer by running the following command. Some methods of running this command are from the Start menu, the Windows Run prompt, PowerShell prompt, or command prompt.

``` powershell
certlm.msc
```

Option 1.2.	In the console tree, navigate to the certificate you want to export.

Option 1.3.	Right-click the certificate, select **All Tasks**, and then select **Export**.

Option 1.4.	On the screen **Welcome to the Certificate Export Wizard**, select **Next**.

Option 1.5.	If prompted to export the private key, select **No, do not export the private key**, then select **Next**.

Option 1.6.	For the file format, select **DER encoded binary X.509 (.CER)**, then select **Next**.

Option 1.7.	Enter or browse to the file path, then select **Next**.

Option 1.8.	Review the summary, then select **Finish**.

**Option 2**: Use PowerShell to export the certificate:

``` powershell
$cerFile  = "C:\Temp\MyBYOC.cer"
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  
Export-Certificate -Cert $cert -FilePath $cerFile
```

Step 2. In the [Microsoft Entra admin center](https://entra.microsoft.com), navigate to **App Registration**, and select the application that was created during the installation, configuration or the upgrade of Connect Sync. To confirm which application is used by Connect Sync you can run the `Get-ADSyncEntraConnectorCredential` command to retrieve the application (client) ID. The username format is `{AppID}@tenantName.onmicrosoft.com`. Under **Certificate & secrets**, select **Upload certificate** and upload the exported .cer file and select **Add**:

![app-registration-certificate-bring-your-application.png](.attachments\AAD-Synchronization\2016767\app-registration-certificate-bring-your-application.png)


Step 3. Get the certificate Hash using following PowerShell commands

``` powershell
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object {$_.Subject -eq 'CN=YOUR_CERTIFICATE_SUBJECT'}  

# Get raw data from X509Certificate cert
$certRawDataString = $cert.GetRawCertData()
 
# Compute SHA256Hash of certificate 
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash($certRawDataString)
```

If you are using **PowerShell version 7**, use the following command:

``` powershell
$certHash = [System.Convert]::ToHexString($hashBytes)
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use the following command:

``` powershell
$certHash = ($hashBytes|ForEach-Object ToString X2) -join ''
```
Step 4. Grant Connect Sync (ADSync) service account permissions to retrieve the certificate private key:
``` powershell
$rsaCert = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
```

If the certificate was **issued by a Certificate Authority (CA)** use the following `$path` variable:
```powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\RSA\MachineKeys\$($rsaCert.key.UniqueName)"
```

If you are using a **self-signed** certificate, use the following `$path` variable:
``` powershell
$path = "$env:ALLUSERSPROFILE\Microsoft\Crypto\Keys\$($rsaCert.key.UniqueName)"
```

Then proceed to run the following commands to grant the permission:

``` powershell
$permissions = Get-Acl -Path $path
$serviceAccount = (Get-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\ADSync -Name ObjectName).ObjectName
$rule = New-Object Security.Accesscontrol.FileSystemAccessRule "$serviceAccount", "read", allow
$permissions.AddAccessRule($rule)
Set-Acl -Path $path -AclObject $permissions
 
# Verify permissions
$permissions = Get-Acl -Path $path
$permissions.Access
```

Step 5. Disable the sync scheduler 
```powershell
Set-ADSyncScheduler -SyncCycleEnabled $false
```

Step 6. Import ADSync module:
If you are using **PowerShell version 7**, use the following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync" -UseWindowsPowerShell
```

If you are using **older PowerShell versions** or **PowerShell ISE**, use the following command to import ADSync module:
``` powershell
Import-Module -Name "C:\Program Files\Microsoft Azure AD Sync\Bin\ADSync"
```

Step 7. Update the application certificate using the certificate rotation command
``` powershell
Invoke-ADSyncApplicationCredentialRotation -CertificateSHA256Hash $certHash 
```

Step 8. Use the [current authentication configuration](#view-the-current-authentication-configuration) wizard view to confirm that Microsoft Entra Connect is using your new certificate.

Step 9. Enable the sync scheduler

``` powershell
Set-ADSyncScheduler -SyncCycleEnabled $true
```

Step 10. Remove the old certificate from the LOCAL_MACHINE store.

---

## Certificate revocation process

For self-signed certificates, either Microsoft Entra Managed or BYOC, an administrator must perform manual revocation by removing the `keyCredential` value from Microsoft Entra ID. An on-demand rotation of the certificate is also an option.

For BYOC certificates issued by a Certificate Authority registered with Microsoft Entra ID, the administrator can follow the [certificate revocation process](../../authentication/concept-certificate-based-authentication-certificate-revocation-list.md#enforce-crl-validation-for-cas).





# Escalation Path:

Owning Service

Owning Team: 

# Deep Dive: 

Title: Deep Dive: 225396 - Modern Authentication for Entra Connect Sync

Format: Self-paced eLearning

Duration:  62 minutes

Audience: Azure Identity

Tool Availability: TBD

Training Completion: 3/28/2025

Region: All regions

Course Location: 
- Video: [Deep Dive: 225396 - Modern Authentication for Entra Connect Sync](https://aka.ms/AAvabau)
- PPT: [Modern Authentication for Entra Connect Sync PPT](https://aka.ms/AAva3iq)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.