---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Windows LAPS (Cloud LAPS)"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FWindows%20LAPS%20%28Cloud%20LAPS%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---


[[_TOC_]]


# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

Windows Local Administrator Password Solution (Windows LAPS) V2 is the new built-into-Windows successor of the [legacy\standalone version of LAPS](https://www.microsoft.com/en-us/download/details.aspx?id=46899). This Windows Client and Windows Server feature automatically manages and backs up the local built-in administrator account password of Hybrid Azure AD Joined devices and traditional Domain joined devices to Windows Server Active Directory.

Azure AD Local Administrator Password Solution (Azure AD LAPS) is an extension of Azure Device Registration Service which allows Windows LAPS running on Windows Client and Windows Server to automatically manage and back up the local built-in administrator account password of both Azure AD Joined (AADJ) and Hybrid Azure AD Joined (HAADJ) devices to Azure Active Directory.

Management is performed using Group Policy (GPO) or mobile device management (MDM). By default, the built-in local administrator account using a relative identifier (RID) of -500 is backed up, but a different local admin account can be backed-up if specified in GPO or MDM policy.

**Note**: Devices that are hybrid-joined (joined to both Azure Active Directory and Windows Server Active Directory) can back up their administrator passwords to either Azure Active Directory or to Windows Server Active Directory, but not both at the same time.

Azure AD supports backing of the last three passwords per Windows device on a first-in-first-out (FIFO basis).

___

# Public Documents

- [What is Windows LAPS?](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)

- [LAPS CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/laps-csp)

- [Windows LAPS Group Policy](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-management-policy-settings#windows-laps-group-policy)

- [Legacy Microsoft LAPS](https://www.microsoft.com/en-us/download/details.aspx?id=46899)

___

# Requirements

## Operating Systems

- Windows LAPS currently supported on Windows 11 Insider Preview Build 25145+ and Windows Server and Windows Server Core Insider builds.

By General Availability, Azure AD LAPS will be supported will be extended to Windows 11 and Windows Server and Windows Server Core Insider builds.

Windows LAPS will be backported to the following OS platforms, with Server Core editions being updated at the same time as their respective desktop Server editions:

- Windows 10 20H2 and later (3rd Tuesday in March - Optional)
- Windows 11 21H2 and later (last Tuesday in March - Optional)
- Windows Server 2019 and later (2nd Tuesday in April)

**NOTE**: One or two weeks after April 11, 2023 all in-market clients no longer be optional and will have the backport.

___

## Roles

### Read LAPS metadata stored in Azure AD

These roles use the `deviceLocalCredentials.ReadBasic.All` Microsoft Graph API Permission.

Global Administrator, Cloud Device Administrator, Intune Service Administrator, Helpdesk Administrator, Security Reader, Security Administrator and Global Reader.

### Recover LAPS passwords stored in Azure AD

These roles use the `deviceLocalCredentials.Read.All` Microsoft Graph API Permission.

Global Administrator, Cloud Device Administrator, and Intune Service Administrator

### Custom Azure AD RBAC roles

These permissions are now available for AADP1+ customers using LAPS: 

| Azure AD RBAC Permission | Description | Microsoft Graph API Permission |
|-----|-----|
| `microsoft.directory/deviceLocalCredentials/standard/read` | reading LAPS metadata without the password | deviceLocalCredentials.ReadBasic.All |
| `microsoft.directory/deviceLocalCredentials/password/read` | reading LAPS passwords | deviceLocalCredentials.Read.All |

___

## Licensing

- Windows license (Pro, OEM, etc - Enterprise or E3 not required)

- Microsoft Intune license (if managing device using Intune)

- Azure AD license 

    - Free for baseline features (enabling LAPS, storing encrypted password, password retrieval, audit logs)

    - Premium when using capabilities like Conditional Access (require MFA when accessing password), Administrative Units (who can retrieve password on which set of devices)

**Note**: For AADJ devices it is recommended to have an MDM (e.g. Intune) license for managing LAPS policies on the device. Very small organizations can manually configure the registry on the device, or use local group policy editor (gpedit.msc) to enable LAPS and other settings. However, they wont have a choice to manually rotate the password unless they the devices are MDM managed.
___

# Limitations

- Windows LAPS does not support Azure Active Directory workplace-joined clients.
- Hybrid-joined devices (joined to both Azure Active Directory and Windows Server Active Directory) can't back up passwords to both Azure Active Directory and Windows Server Active Directory at the same time.
- By default, LAPS only manages the password of the local built-in administrator account which ends with a Relative Identifier (RID) of -500. However, this can target a different local administrator account using MDM, Domain or Local policy. 

___

# Support Boundaries

| Scenario | Owning Team | Support Area Path |
|-----|-----|-----|
| Issues related to Win LAPS not able to Create/update the Managed Account Password when MDM managed | Directory Services | Security \ Windows Local Admin Password Solution (LAPS) \ Management and Troubleshooting \ Manage clients |
| Issues related to Win LAPS not able to Create/update the Managed Account Password when managed via GPO | Directory Services | Security \ Windows Local Admin Password Solution (LAPS) \ Management and Troubleshooting \ Manage clients |
| Issues related to Post Authentication, Password Updates actions issues during (Password Update, taking actions if an Admin Signs-In to the machine) | Directory Services | Security \ Windows Local Admin Password Solution (LAPS) \ Management and Troubleshooting \ Manage clients |
| Issues related to GPO Settings not taking Effect or Not working as expected on Client | Directory Services | Security \ Windows Local Admin Password Solution (LAPS) \ Management and Troubleshooting \ Manage clients |
| Issues related to Crash, Leak of Win LAPS DLL's | Directory Services | Routing Windows V3\Active Directory\LSASS Process Crashes |
| Issues related to Password not working when used via Win LAPS | Directory Services | Routing Win LAPS\Management and Troubleshooting\Client-side errors and issues |
| Tenant Discovery from PRT fails (Collect traceId and Date from Event ID: 10030) | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Errors from Azure AD Device Registration Service during LAPS password update (Collect client-request-id and Date from Event ID: 10030) | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Global Administrator, Intune Administrator, or Cloud Device Administrator have issues managing Windows Local Admin Passwords on AADJ or HAADJ devices using the portal, Graph API or PowerShell | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Azure AD Roles and Administrators\Problem with assigning group to an Azure AD Role |
| Issues Managing Azure AD LAPS on Device Settings from the Portal, Graph API or PowerShell | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Issues Retrieving Passwords from Device Settings, Graph API or PowerShell | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Issues regarding Azure AD Auditing of "Reveal local administrator password" or "Update local administrator password" in Azure AD Audit logs. | Identity | Route to Azure\Azure Active Directory Governance, Compliance and Reporting\Audit Logs |
| Issues regarding the Microsoft Graph beta/deviceLocalCredentials API. | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Issues related to cmdlets in Microsoft.Graph and AzureAD PowerShell modules. | Identity | Route to Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD |
| Issues related to Intune (MDM) Settings Configuration/Settings on Management Portal for AzureAD LAPS | Intune | As Intune is currently using Rave as their CRM tool, collaborations and transfers would be processed as documented in the following internal articles: [Informational: Collaboration and transfer cheat sheet (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/54c17374-0727-f96d-a73b-6d571a581aaa), [Collab: DfM to RAVE - Overview (azure.com)](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/239/Collab-DfM-to-RAVE) and [Procedure: Collaboration (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/856f1b0d-3ea3-a113-06a1-dd2fde04102d#bkmk_2) |
| Issues related to Intune (MDM) Settings not getting Applied / Enforced on AADJ or HAADJ Devices | Intune | As Intune is currently using Rave as their CRM tool, collaborations and transfers would be processed as documented in the following internal articles: [Informational: Collaboration and transfer cheat sheet (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/54c17374-0727-f96d-a73b-6d571a581aaa), [Collab: DfM to RAVE - Overview (azure.com)](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/239/Collab-DfM-to-RAVE) and [Procedure: Collaboration (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/856f1b0d-3ea3-a113-06a1-dd2fde04102d#bkmk_2) |
| Issues related to Password Management in Intune Portal | Intune | As Intune is currently using Rave as their CRM tool, collaborations and transfers would be processed as documented in the following internal articles: [Informational: Collaboration and transfer cheat sheet (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/54c17374-0727-f96d-a73b-6d571a581aaa), [Collab: DfM to RAVE - Overview (azure.com)](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/239/Collab-DfM-to-RAVE) and [Procedure: Collaboration (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/856f1b0d-3ea3-a113-06a1-dd2fde04102d#bkmk_2) |

___

# FAQ

## Is Windows LAPS supported on non Windows platforms?

No.

___

## Is Windows LAPS backup to Azure AD supported for Azure AD registered (aka Workplace Join) devices?

No, Windows LAPS backup to Azure AD only works with Windows Azure AD join or hybrid Azure AD join devices.

___

## Which Windows OS platforms is Windows LAPS supported on?

Windows LAPS will be supported on: 

- Windows 10 20H2 and later with 2303C patch.

- Windows 11 21H2 and later with 2303D patch.

- Windows Server 2019 and later with 2304B patch.

___

## Is Windows LAPS management configuration supported using GPO?

Yes, for hybrid Azure AD join devices.

___

## Is Windows LAPS management configuration supported using MDM?

Yes, for Azure AD join/ hybrid Azure AD join (co-managed) devices. Customers can use Microsoft Intune or any other 3P MDM of their choice.

___

## Is there a tenant wide setting for LAPS?

Yes, Azure AD device settings portal will allow customers to enable LAPS for their tenant. If LAPS is not enabled for tenant, all attempts to rotate and backup LAPS password to Azure AD will fail. Additionally, just tenant wide configuration of LAPS is not sufficient and customers need to enable LAPS on devices via client side policy targeting.

___

## Does Windows LAPS create local admin account (when not present) based on the administrator account name configured using LAPS policy? 

No, Windows LAPS expects the configured administrator account to be present in the SAM account database of the Windows computer and in enabled state before it can rotate and start backing password to Azure AD.

___

## Does Windows LAPS rotate and backup password for a device that is disabled in Azure AD?

No, Windows LAPS expects the device to be in enabled state before password rotation and backup operations can be honored.

___

## What happens when a device is deleted in Azure AD?

When a device is deleted in Azure AD, LAPS credentials tied to that device will be lost. Unless customers have their own workflow to retrieve LAPS password and store it externally, there is currently no way in Azure AD to recover LAPS password for a deleted device.

___

## What roles are needed to recover LAPS password?

We support following built in roles  Global Administrator, Cloud Device Administrator and Intune Service Administrator with `deviceLocalCredentials.Read.All` permissions to recover LAPS password.

___

## What roles are needed to read LAPS metadata?

We support following built in roles  Global Administrator, Cloud Device Administrator, Intune Service Administrator, Helpdesk Administrator, Security Reader, Security Admin and Global Reader with `deviceLocalCredentials.ReadBasic.All` permissions to read metadata about LAPS i.e. device name, last password rotation, next password rotation.

___

## Are Custom Roles supported?

Yes, customers will be able to create custom roles (will require Azure AD premium license) and give it RBAC permissions:

- `microsoft.directory/deviceLocalCredentials/standard/read` for reading LAPS metadata

- `microsoft.directory/deviceLocalCredentials/password/read` for reading LAPS password

___

## Are Administrative Units supported?

Yes, customers will be able to create administrative units for devices (requires Azure AD premium license) using Cloud Device Admin as the assigned role. This will support scenario where a user can be assigned Cloud Device Admin role within the scope of AU and based on that they can only recover password for devices that are in AU scope.

___

## Is Conditional Access supported?

Yes, customers can configure CA (requires Azure AD premium license) policy on directory roles, which will apply when those roles try to recover LAPS password. Adding Protected actions support using CA for LAPS recovery password will be planned for post GA.

___

## What are license requirements for using Windows LAPS?

These are licensing requirements

- Windows license (Pro, OEM, etc - Enterprise Or E3 not required).

- Microsoft Intune license (if managing device using Intune).

- Azure AD Free for baseline features (enabling LAPS, storing encrypted password, password retrieval, audit logs).

- Azure AD Premium when you use capabilities like Conditional Access (require MFA when recovering password), Custom Roles, Administrative Units (who can recover password on which set of devices).

___

## Can LAPS password for a device be backed up to both AD and Azure AD?

With Windows LAPS you can backup local admin password for a device to either AD or Azure AD and not both.

___

## Can legacy LAPS and Windows LAPS be enabled on the same device?

No, you can either use legacy LAPS or Windows LAPS and not both. Legacy LAPS does not work for Azure AD join devices and hence customers are recommended to start using Windows LAPS and preferably backing up password to Azure AD.

## How do customers migrate from legacy LAPS to Windows LAPS?

When customers configure Windows LAPS, it will take precedence and ignore legacy LAPS if present on the same device. This is preferred when customers want to backup password to Azure AD to have a consistent experience for both Azure AD join and hybrid Azure AD join (domain join) devices. If customers want to migrate from legacy LAPS to Windows LAPS for domain joined devices and continue to backup password in AD, they have a choice to run Windows LAPS in legacy LAPS emulation mode, but this comes with pre-requisite configuration or just switch to Windows LAPS configuration which will take precedence and ignore legacy LAPS. Before doing that customers should be aware that any workflows, processes, reporting that relies on legacy LAPS schema be updated to use new Windows LAPS schema.

___

# Known Issues

## Issue 1: Passwords not Updated in Azure AD

The most common cause for this will likely be the **Enable Azure AD Local Administrator Password Solution (LAPS)** option is not set to **Yes** in the [Device settings](https://portal.azure.com/#view/Microsoft_AAD_Devices/DevicesMenuBlade/~/DeviceSettings/menuId~/null) blade of the Azure AD tenant.

**Log Name**:      Microsoft-Windows-LAPS-Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          12/30/2022 1:06:59 PM

**Event ID**:      10059

**Task Category**: None

**Level**:         Error

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
{"code":"invalid_request","subcode":"error_fail","operation":"POST","message":"Local admin password solution is not enabled for this tenant.","requestId":"4e8f3cbd-fe42-425f-9237-7a436f895142","time":"2023-04-04T06:10:25.3372369Z"}
```

Solution for the "Local admin password solution is not enabled for this tenant." message. Have the customer navigate to the [Device settings](https://portal.azure.com/#view/Microsoft_AAD_Devices/DevicesMenuBlade/~/DeviceSettings/menuId~/null) blade in the Azure AD tenant and toggle the **Enable Azure AD Local Administrator Password Solution (LAPS)** to **Yes**. This is set to **No** by default.

Users issuing Reset-LapsPassword will see this error:

```powershell
PS C:\> Reset-LapsPassword
Reset-LapsPassword : 2147942800 failed with hr:0x80070190
At line:1 char:1
+ Reset-LapsPassword
+ ~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [Reset-LapsPassword], LapsPowershellException
    + FullyQualifiedErrorId : 2147942800 failed with hr:0x80070190,Microsoft.Windows.LAPS.ResetLapsPassword
```

In addition to the 10059 event there will also be an Event ID: 10028 recorded stating, "LAPS failed to update Azure Active Directory with the new password.".

Error code 0x80070190 translates to ERROR_THREAD_MODE_ALREADY_BACKGROUND or `The thread is already in background processing mode.`

```code
Azure returned a failure code.
 
 HTTP status code: 400
 
 Response text:
 {"code":"invalid_request","subcode":"error_missing_device","operation":"POST","message":"The device 625203d3-####-####-####-############ in 7dd2219b-####-####-####-############ could not be found.","requestId":"4ab91df6-f53d-4503-bc45-96a85a225917","time":"2023-03-20T21:27:59.5729273Z"}
```

Solution for HTTP error code 400 with a "message" of "The device 625203d3-####-####-####-############ in 7dd2219b-####-####-####-############ could not be found." It could be the device was removed from the tenant. Check `dsregcmd /status`.

```code
Azure returned a failure code.
 
 HTTP status code: 403
 
 Response text:
 {"code":"authorization_error","subcode":"error_authorization_request_denied","operation":"POST","message":"The specified request is not allowed for tenant (5933138b-####-####-####-############)","requestId":"53beba5a-5099-4198-ad52-ca9c307afc5c","time":"2022-12-30T13:06:59.1616401Z"}
```

Solution for HTTP error code 400 with a "message" of "The specified request is not allowed for tenant ({TenantID})". It could be the device has been disabled.

___

### Solution 1: Passwords not Updated in Azure AD

The **Enable Azure AD Local Administrator Password Solution (LAPS)** option is set to **No** and preventing the LAPS client from updating passwords in Azure AD.  Change this setting to **Yes**.

___

# Manage Azure AD LAPS Service

For organizations to use Azure AD Local Administrator Password Solution (LAPS) they must first enable the feature in Azure Device Registration Service.

___

## Azure AD Portal

1. A Global Administrator, Cloud Device Administrator or Intune Service Administrator just navigate to **Azure Active Directory** > **Devices**.
2. Under **Device settings** toggle **Enable Azure AD Local Administrator Password Solution (LAPS)** to **Yes**.

![EnableLAPSPolicy](/.attachments/AAD-Authentication/880009/EnableLAPSPolicy.jpg)
___

## Microsoft Graph API

### Grant Permission to Modify Device Settings Policy

1. A Global Administrator, Cloud Device Administrator or Intune Service Administrator can sign-in to [Microsoft Graph Explorer](https://aka.ms/ge).
2. Click **Modify Permissions** and *Open the permissions panel* if prompted.
3. Depending on the access needed, grant **Consent** to the *DeviceLocalCredential.ReadBasic.All* and/or the *DeviceLocalCredential.Read.All* permissions.

| Permission | Description|
|-----|-----|
| DeviceLocalCredential.ReadBasic.All | Shows the metadata without the password. |
| DeviceLocalCredential.Read.All | Shows the password (base64 encoded) |

### Enable Azure AD Local Administrator Password Solution in AD RS

- **Action**: `PUT`

- **URI**: `https://graph.microsoft.com/beta/policies/deviceRegistrationPolicy`

  **Request Body**:

```json
  {
      "localAdminPassword": {
          "isEnabled": true
      }
  }
```
___

# Manage Password Rotation

## Group Policy (GPO)

This feature can be enabled and password management settings can be enforced using local group policy editor (gpedit.msc) pr domain based group policy (gpmc.msc) for AADJ and HAADJ devices. These settings are located under **Computer Configuration** > **Administrative Templates** > **System** > **LAPS**. For more information, see [Configure Windows LAPS policy settings](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-management-policy-settings).

**NOTE**: The Windows LAPS CSP and Windows LAPS Group Policy object both manage the same settings, but only a subset of these settings apply to Windows LAPS in Azure AD mode.

The following table specifies which settings apply to devices that have the specified join state:

| Policy name | Registry Setting | Applies to Windows LAPS in Azure mode | Value and definition | AADJ | HAADJ | Domain Joined |
|-----|-----|-----|-----|-----|-----|-----|
| Configure authorized password decryptors | `ADPasswordEncryptionPrincipal` | No | Use this setting to configure the name or security identifier (SID) of a user or group that can decrypt the password that's stored in Active Directory.<br><br>**This setting is ignored if the password currently is stored in Azure AD.**  | No | Yes | Yes |
| Configure password backup directory | `BackupDirectory` | Yes | 0 = Disabled (default) password won't be backed up<br>1 = Back up to Azure AD only<br>2 = Back up to Windows Server Active Directory only | Yes | Yes | Yes |
| Configure size of encrypted password history | `ADEncryptedPasswordHistorySize` | No | Use this setting to configure how many previous encrypted passwords are remembered in on-premises Active Directory. Supported values are: Minimum : 0 passwords up to Maximum: 12 passwords. If not specified, this setting defaults to 0 passwords (disabled).<br><br>The maximum number of passwords stored in Azure AD is 3. | No | Yes | Yes |
| Do not allow password expiration time longer than required by policy | `PasswordExpirationProtectionEnabled` | No | This setting configures enforcement of maximum password age for the managed local administrator account. Supported values are either 1 (True) or 0 (False). If not specified, this setting defaults to 1 (True). When enabled, planned password expiration longer then the password age dictated by the "Password Settings" policy is NOT allowed. When such expiration is detected, the password is changed immediately and password expiration is set according to policy. | No | Yes | Yes |
| Enable password backup for DSRM accounts | `ADBackupDSRMPassword` | No | This setting controls whether LAPS will manage the built-in DSRM admin account when running on a domain controller.  A separate explicit setting is required for this mode so that there are no "accidents" or ambiguity when managing the DSRM account. Setting DSRM mode will only take effect when ADPasswordEncryptionEnabled is enabled and the WS2016 Domain Functional Level (DFL) requirement is satisfied. The ADPasswordEncryptionHistorySize setting is also honored if set. The AdministratorAccountName and ADPasswordEncryptionPrincipal settings are ignored for DSRM mode on DCs. Only the built-in -500 DSRM admin account can be managed, and the resultant passwords will always be encrypted for <currentdomain>\DomainAdmins as a security measure. | No | No | Yes |
| Enable password encryption | `ADPasswordEncryptionEnabled` | No | 0 = Disabled - Do not use password encryption <br/><br/>1 = Enable - Use password encryption. The client will KDS-encrypt the clear-text password before storing it in the ms-LapsEncryptedPassword attribute. The authorized decryptor will be controlled by the ADPasswordEncryptionPrincipal setting | No | Yes | Yes |
| Name of administrator account to manage | `AdministratorAccountName` | Yes | This setting can be used to configure the name of the managed local administrator account. If not specified, this setting defaults to managing the built-in local administrator account. | Yes | Yes | Yes | 
| Password Settings<br><br>\Password Complexity | `PasswordComplexity` | Yes | 1 = Large letters<br>2 = Large + small letters<br>3 = Large + small letters + numbers<br>4 = Large letters + small letters + numbers + special characters (default if not specified). | Yes | Yes | Yes | 
| Password Settings<br><br>\Password Length | `PasswordLength` | Yes | 8 - 64 characters (default 14 when not specified) | Yes | Yes | Yes | 
| Password Settings<br><br>\Password Age (Days) | `PasswordAgeDays` | Yes | 1 - 365<br>Default is 30 days when not specified.<br>Minimum is 1 for Windows Server Active Directory and 7 for Azure AD. | Yes | Yes | Yes | 
| Post-authentication actions<br><br>\Actions | `PostAuthenticationActions` | Yes | This setting specifies the actions to take upon expiration of the configured grace period (see `PostAuthenticationResetDelay`). This setting can have one of the following values:<br>0 - Disabled - take no actions<br>1 - Reset password<br>2 - Reset password and sign out<br>3 - Reset password and reboot | Yes | Yes | Yes |
| Post-authentication actions<br><br>\Grace period (hours) | `PostAuthenticationResetDelay` | Yes | This setting specifies the amount of time (in hours) to wait after an authentication before executing the specified post-authentication actions (see `PostAuthenticationActions`). Supported values are:<br>Minimum: 0 hours (setting this value to 0 disables all post-authentication actions)<br>Maximum: 24 hours<br>If not specified, this setting defaults to 24 hours. | Yes | Yes | Yes |

___

## MDM (Intune)

The preferred option for managing Azure AD Joined devices is to use [Microsoft Intune](https://learn.microsoft.com/en-us/mem/endpoint-manager-overview) with the [Windows LAPS configuration service provider (CSP)](https://learn.microsoft.com/en-us/windows/client-management/mdm/laps-csp).

**Note**: Windows LAPS CSP supports two settings that aren't in the GPO table: `ResetPassword` and `ResetPasswordStatus`. Also, Windows LAPS CSP doesn't support the `ADBackupDSRMPassword` setting (domain controllers are never managed via CSP).

| CSP Setting | Value and definition | Device | User | Supported OS SKUs |
|-----|-----|-----|-----|-----|
| `ResetPassword` | This setting tells the CSP to immediately generate and store a new password for the managed local administrator account. This action invokes an immediate reset of the local administrator account password, ignoring the normal constraints such as `PasswordLengthDays`, etc. | Yes | No | Pro<br>Enterprise<br>Education<br>Windows SE |
| `ResetPasswordStatus` | This setting queries the status of the last submitted `ResetPassword` execute action. The value returned is an HRESULT code:<br>- `S_OK (0x0)`: The last submitted `ResetPassword` action succeeded.<br>- `E_PENDING (0x8000000)`: The last submitted ResetPassword action is still executing.<br>- `Other`: The last submitted `ResetPassword` action encountered the returned error. | Yes | No | Pro<br>Enterprise<br>Education<br>Windows SE |

___

## Manually Initiated

Password rotation of LAPS protected admin accounts can be manually triggered in two ways:

1. Microsoft Endpoint Protection (Intune) will support a `ResetPassword` action from their portal.
2. Local computer administrators can force an immediate password reset by issuing this command on a device that is managed by LAPS policy.

```powershell
Reset-LapsPassword
```
___

# View LAPS metadata on Windows devices in Azure AD

## Azure Portal

There is a new **Local administrator password recovery** blade on Windows devices in Azure AD.

Windows devices that are configured to store their local administrator passwords in Azure AD will show up to three stored passwords for the account being backed up.

Global Administrators, Cloud Device Administrators, and Intune Service Administrators that click the *Show local admin password* link on the **Local admin account** column will see the most recently backed up local administrator password, and the option to show the previous two passwords.  Clicking this link generates an [Recover device local administrator password](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=880009&anchor=recover-device-local-administrator-password) Azure AD Audit event.

Users who lack sufficient permissions to click the link are not audited.

![LAPSRecovery](/.attachments/AAD-Authentication/880009/LAPSRecovery.jpg)

- **Account name**: This is the displayName of local administrator account that is being backed up. This can be something other than Administrator if a different local admin account is defined in group policy or MDM. It can also be a different name with a RID of -500 if the built-in account is renamed.

- **Security ID**: The is the Security Identifier (SID) of the local account that is being backed up. SIDs are a unique combination of the computer's identifier authority value and a relative identifier (RID) value (i.e <ComputerID><RID>). The RID is is the right-most portion of the SID and is unique. The SID of the built-in administrator account always ends with a RID of -500. If the RID is different than then -500, a different local admin account must be defined in group policy or MDM.

- **Local admin password**:  The password is masked as a string of asterisks (i.e. ****** ) until the admin clicks the *Show* link.

    - Clicking *Show* translates the Base64 encoded password into clear text. This is returned in Microsoft Graph API as a Base64 encoded value only.

    - Clicking the *Copy* icon to the right of the *Show* link copies the password in clear text.

**NOTE**: When the password is within 24 hours of expiration a banner will appear on this page indicating such.

- **Last password rotation**: This is the last time that the Windows Local Administrator Password agent on the device reset the specified administrator's password.

- **Next password rotation**: This is the next time that the Windows Local Administrator Password agent on the device is scheduled to reset the specified administrator's password.

Finally, when present, clicking the chevron (i.e. ^) to the left of **Password 2** or **Password 3** exposes the same information as the first password and provides a *Show* link and a *Copy* icon to the right of the *Show* link.

___

## Microsoft Graph API

### Grant Permission to View LAPS Metadata

1. A Global Administrator, Cloud Device Administrator or Intune Service Administrator can sign-in to [Microsoft Graph Explorer](https://aka.ms/ge).
2. Click **Modify Permissions** and *Open the permissions panel*.
3. Search for *DeviceLocalCredential* and grant **Consent** to the *DeviceLocalCredential.Read.All* and *DeviceLocalCredential.ReadBasic.All* permissions.

___

### Show local admin password metadata for all devices

This call lists the metadata for all local administrator account passwords on a Windows devices.

- **Action**: `GET`

- **URI**: `https://graph.microsoft.com/beta/deviceLocalCredentials`

**Result**:

```json
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#deviceLocalCredentials",
    "value": [
        {
            "id": "4fe09aa6-####-####-####-############",
            "deviceName": "LAPSAAD",
            "lastBackupDateTime": "2023-01-03T15:54:43.0136478Z",
            "refreshDateTime": "2023-01-14T15:54:43.0136478Z"
        },
        {
            "id": "378b8742-####-####-####-############",
            "deviceName": "SOMEAZUREMACHINE",
            "lastBackupDateTime": "2022-12-22T12:30:30.3568833Z",
            "refreshDateTime": "2022-12-29T12:30:30.3568833Z"
        },
        {
            "id": "06a63014-####-####-####-############",
            "deviceName": "AZUREADCLIENT1",
            "lastBackupDateTime": "2022-12-27T07:52:00.0524244Z",
            "refreshDateTime": "2023-01-03T07:52:00.0524244Z"
        },
        {
            "id": "b1f72da5-####-####-####-############",
            "deviceName": "LAPCLIENT",
            "lastBackupDateTime": "2022-12-05T15:02:19.6153076Z",
            "refreshDateTime": "2023-01-04T15:02:19.6153076Z"
        }
    ]
}
```

___

### Show local admin password metadata for one device

This call lists the metadata for a local administrator account password on a specific Windows device.

- **Action**: `GET`

- **URI**: `https://graph.microsoft.com/beta/deviceLocalCredentials/{deviceId}`

**Result**:

```json
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#deviceLocalCredentials/$entity",
    "id": "b1f72da5-####-####-####-############",
    "deviceName": "LAPCLIENT",
    "lastBackupDateTime": "2022-12-05T15:02:19.6153076Z",
    "refreshDateTime": "2023-01-04T15:02:19.6153076Z"
}
```

___

### Show Base64 Encoded local admin password

This call returns the local administrator account password of a specific Windows device in Base64 encoded. Use a base64 decoder to view passwords in clear text.

**NOTE**: Global Administrators, Cloud Device Administrators, and Intune Service Administrators issuing this call will generate an [Recover device local administrator password](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=880009&anchor=recover-device-local-administrator-password) Azure AD Audit event.

- **Action**: `GET`

- **URI**: `https://graph.microsoft.com/beta/deviceLocalCredentials/{deviceId}?$select=credentials`

**Result**:

```json
{
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#deviceLocalCredentials(credentials)/$entity",
    "id": "b1f72da5-####-####-####-############",
    "deviceName": "LAPCLIENT",
    "lastBackupDateTime": "2022-12-05T15:02:19.6153076Z",
    "refreshDateTime": "2023-01-04T15:02:19.6153076Z",
    "credentials": [
        {
            "accountName": "admin",
            "accountSid": "S-1-5-21-##########-##########-##########-1001",
            "backupDateTime": "2022-12-05T15:02:19.6153076Z",
            "passwordBase64": "RXhhbXBsZVBhc3N3b3JkMw=="
        },
        {
            "accountName": "admin",
            "accountSid": "S-1-5-21-##########-##########-##########-1001",
            "backupDateTime": "2022-12-05T14:54:24.9057699Z",
            "passwordBase64": "RXhhbXBsZVBhc3N3b3JkMg=="
        },
        {
            "accountName": "Administrator",
            "accountSid": "S-1-5-21-##########-##########-##########-500",
            "backupDateTime": "2022-12-05T14:53:52.310283Z",
            "passwordBase64": "RXhhbXBsZVBhc3N3b3JkMQ=="
        }
    ]
}
```

___

### Microsoft Graph PowerShell

#### Install the Microsoft Graph API PowerShell module

The `v1.0` module should be installed for generally available releases.

```powershell
Install-Module Microsoft.Graph -AllowPrerelease
```

When testing a feature before it is available in `v1.0`, install the `beta` version of the module. This still requires the profile be set to `beta`.

**Note**: The `v1.0` and `beta` modules will use different prefixes in their cmdlets.  For example, `Get-MgUser` is included in the `v1.0` module while `	Get-MgBetaUser` is in the `beta1 module.

```powershell
Install-Module Microsoft.Graph.Beta -AllowPrerelease
Select-MgProfile beta
```

___

#### Sign-in to the MgGraph endpoint

To view the newly rotated password, sign in as a Global Administrator, Cloud Device Administrator, and Intune Service Administrator using this command.

```powershell
Connect-MgGraph Device.Read.All,DeviceLocalCredential.Read.All,DeviceLocalCredential.ReadBasic.All,Directory.Read.All,Directory.ReadWrite.All,User.Read,User.Read.All,User.ReadWrite.All
```
___

#### Get LAPS Azure AD Password Info

This command requires the Microsoft Graph PowerShell SDK to be installed.

Issue this command with `-IncludePasswords` to view the current local administrator password for the specified Windows device in Azure AD. Pass `-IncludeHistory` in the call to also see the previous two passwords and `-AsPlainText` to have the base64 encoded passwords decrypted to clear text.

**NOTE**: Global Administrators, Cloud Device Administrators, and Intune Service Administrators issuing this call will generate an [Recover device local administrator password](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=880009&anchor=recover-device-local-administrator-password) Azure AD Audit event.

```powershell
Get-LapsAADPassword -DeviceIds cef0c5c8-####-####-####-############ -IncludePasswords -IncludeHistory -AsPlainText
```
___

# Azure AD Audit Log

## Recover device local administrator password

An Azure AD Audit event with these properties is recorded when a Global Administrator, Cloud Device Administrator, or Intune Service Administrator clicks the *Show local admin password link* on the Local admin account column in the portal. This is also recorded if a GET call for `https://graph.microsoft.com/beta/deviceLocalCredentials/{deviceId}?$select=credentials` is made by one of these admins:

- **Service**: *Device Registration Service*
- **Category**: *Device*
- **Activity**: Recover device local administrator password
- **Status**: Success
- **Target**: \<Windows device name>
- **Initiated by (actor)**: \<UPN of the admin who clicked the link>

## Update device local administrator password

This event is is recorded when the LAPS client on a Windows device update the local administrator password in Azure AD.

- **Service**: *Device Registration Service*
- **Category**: *Device*
- **Activity**: Update device local administrator password
- **Status**: Success
- **Target**: \<Windows device name>
- **Initiated by (actor)**: \<UPN of the admin who clicked the link>
___

# Policy Enforcement Flow

When the GPO or MDM based policy specifies that the password should be backed up to Azure AD, the logical processing flow looks like this: 

1. Admin-initiated password expiry is not based on client polling 

Rather than having millions of Windows clients poll Azure AD on an hourly or daily basis, each client will remember the scheduled expiration time of the the last-stored-password and will automatically set a new password when that time comes.   

2. Admin-initiated password expiry can be initiated via Intune management portal

The LAPS CSP for Intune managed devices will support a "ResetPassword" action which administrators can invoke at will for individual devices or scheduled in bulk when necessary.

When a Windows client detects it is time to regularly roll the password, or in response to an admin-initiated "ResetPassword" request: 

- A discovery call is sent to Azure Device registration Service (ADRS) to determine the correct ADRS device management endpoint for the current cloud. 
- Authentication to ADRS occurs using the locally persisted device credential.
- A new random password is generated for the designated local administrator account, or the -500 built-in Admin account if no specific account has been designated. `PasswordLength` and `PasswordComplexity` controls are honored. 
- Validate that the new password meets the local password policy requirements. 
- Send a password update message to ADRS. 
- If the Azure password update succeeds, set the new password on the local account. 

**Note**: AD-specific controls from domain policies which are related to password encryption and history size are ignored for local admin accounts of Active Directory domain joined machines (HAADJ) when running in Azure mode. The local policy or Intune will be honored.

___

# Troubleshooting

If the LAPS client is failing to update passwords try the following:

1. Verify the device registration endpoint can be accessed from the client using this curl call in an administrative command prompt. If this fails, network support is required.

`curl https://enterpriseregistration.windows.net/ -D -`

2. Issue a password reset call from PowerShell on the client.

```powershell
Reset-LapsPassword -Verbose -Debug
```
3. Observe the LAPS Operational events in Event Viewer.

___

## Customer Facing

### Azure AD Auditing

Clicking the *Show local admin password* is audited if the user has access. Users without access will be shown a blade indicating they do not have access when they click the link.

Filter options include:

- **Service** is *Device Registration Service*

- **Category** is *Device*

- **Activity** has two actions which are audited:
  - **Reveal local administrator password**
  - **Update local administrator password**

#### Reveal local administrator password

| **Activity** |  |  |
|-----|-----|-----|
| | Date | MM/DD/YYYY, HH:MM AM/PM |
| | Activity Type | Reveal local administrator password |
| | Correlation ID | 4fb82e8b-2697-406b-93cc-e0d4b18719bd |
| | Category | Device |
| | Status | success |
| | **Status reason** |  |
| | User Agent |Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.25255; en-US) PowerShell/5.1.25255.1000 Invoke-MgGraphRequest|
| | **Initiated by (actor)** |  |
| | Type | User |
| | Display Name |  |
| | Object ID | Contains the *objectId* of the user that clicked *Show local admin password* and viewed the password metadata. |
| | IP address | Contains the *Internet facing IP* of the device that the user was on when they clicked *Show local admin password* and viewed the password metadata. |
| | User Principal Name | Contains the *UPN* of the user that clicked *Show local admin password* and viewed the password metadata. |
| | **Additional Details** |  |
| | AdditionalInfo | Successfully fetched local credential by device id |
|  | Device Id | Contains the *deviceId* of the device that the user clicked *Show local admin password* on and viewed the password metadata. |
|  |  ||
| **Targets** |  |  |
| | Type | Device |
| | Id | Contains the *objectId* of the device that the user clicked *Show local admin password* on and viewed the password metadata. |
| | Display Name | Contains the *device name*. |
| | User Principal Name |  |
| | ||
| **Modified Properties** |  |  |
| | | |

#### Update local administrator password

| **Activity** |  |  |
|-----|-----|-----|
| | Date | MM/DD/YYYY, HH:MM AM/PM |
| | Activity Type | Reveal local administrator password |
| | Correlation ID | 4fb82e8b-2697-406b-93cc-e0d4b18719bd |
| | Category | Device |
| | Status | success |
| | **Status reason** |  |
| | User Agent | Windows LAPS |
| | **Additional Details** | |
| | AdditionalInfo | Successfully updated password on the device |
| | Device Id | Contains the *deviceId* of the device that the local administrator account password was backed up for. |
|  |  |  |
| **Targets** |  |  |
|  | Type | Device |
|  |Id | Contains the *objectId* of the device that the local administrator account password was backed up for. |
| | User Principal Name | |
| | ||
| **Modified Properties** |  |  |
| | | |

___

### Event Viewer Logs (LAPS)

LAPS client events are in Event Viewer under **Applications and Services** \ **Microsoft** \ **Windows** \ **LAPS** \ **Operational**.

The events below are generated by the LAPS client, beginning with client startup, policy check, password update in AAD and password update of local account in SAM until a stable state is reached.

Please review Windows LAPS troubleshooting guidance here:
[Troubleshooting using Windows LAPS Events](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/windows-laps-troubleshooting-guidance#troubleshooting-windows-laps-using-windows-events).

___

#### Event ID: 10004 - Done Processing Password Update

This event is recorded to indicate a stable state has been reached.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:35 PM

**Event ID**:      10004

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS policy processing succeeded.
```

___

#### Event ID: 10010 - LAPS Backup Location Conformed

This event confirms the configured location for password backup.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:34 PM

**Event ID**:      10010

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS is configured to backup passwords to Azure Active Directory.
```

___

#### Event ID: 10015 - Password Update Required and Why

This event is recorded when LAPS client. In this situation the local account being managed by LAPS has changes and the local state is missing or inconsistent with the directory state.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:35 PM

**Event ID**:      10015

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
The managed account password needs to be updated due to one or more reasons (0x14):

 The local account being managed has changed
Local state is missing and/or inconsistent with directory state
```

___

#### Event ID: 10020 - Local Account Updated with New Password

This event indicate the name of the local administrator account that had its password changed and backed up.

- The Account RID is in hexadecimal and can be converted to decimal using Windows calculator in Programmer mode.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:35 PM

**Event ID**:      10020

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS successfully updated the local admin account with the new password.

 Account name: joeuser
 Account RID: 0x3EA
```

___

#### Event ID: 10022 - LAPS Client Reads Policy

Policy configuration has been defined using GPO or MDM.

- **Policy source** of GPO can be local or domain GPO. MDM will shows as CSP.
- **Backup directory** shows as Azure Active Directory.
- **Local administrator account name** of Null indicates the built-in administrator account is being managed because a different account was not specified in policy.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:34 PM

**Event ID**:      10022

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
The current LAPS policy is configured as follows:

 Policy source: CSP
 Backup directory: Azure Active Directory
 Local administrator account name: <admin-account-name>
 Password age in days: 7
 Password complexity: 4
 Password length: 8
 Post authentication grace period (hours): 1
 Post authentication actions: 0x1
```

___

#### Event ID: 10025 - Tenant Discovery Failure

When the AADJ or HAADJ Machine is configured to store its Managed Password in Azure AD, the Windows LAPS client needs to connect to AzureAD Endpoint. The Endpoint is https://enterpriseregistration.windows.net. Ensure that you have Connectivity to the Azure Endpoint by running this command from a command prompt on the client. `curl https://enterpriseregistration.windows.net/ -D -`

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/20/2023 4:18:01 PM

**Event ID**:      10025

**Task Category**: None

**Level**:         Error

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**: 
```code
Azure discovery failed.

Error code: 0x80072EE7

```

**NOTE**: Error code 0x80072EE7 translates to ERROR_ADAL_INTERNET_NAME_NOT_RESOLVED or "The server name could not be resolved."

___

#### Event ID: 10028 - Tenant Discovery

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/20/2023 4:27:59 PM

**Event ID**:      10028

**Task Category**: None

**Level**:         Error

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS failed to update Azure Active Directory with the new password.
 
 Error code: 0x80070190
```

**NOTE**: Error code 0x80070190 translates to "ERROR_THREAD_MODE_ALREADY_BACKGROUND or "The thread is already in background processing mode."

___

#### Event ID: 10029 - LAPS Confirms Password Backed Up

This event indicates the local admin password has been successfully backed up to the targeted directory.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:35 PM

**Event ID**:      10029

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS successfully updated Azure Active Directory with the new password.
```

___

#### Event ID: 10030 - Tenant Discovery Success

At boot time, when the LAPS client wakes up, this discovery event is recorded where it uses the tenant ID discovered from the PRT. This appears once per boot cycle. This is where the client learns of all the end points it needs to communicate with.

- The URL has `/discover` embedded in the URL.
- The `traceid` value and `Date` can be used to examine AD RS trace activity.
- The first guid, from left to right, in the URL is the Tenant ID

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:33 PM

**Event ID**:      10030

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**: 
```code
LAPS is sending a message to the following endpoint.

 https://enterpriseregistration.windows.net/7dd2219b-####-####-####-############**/discover**?api-version=1.6&traceid={9A2A4547-502B-4856-9BF1-AD2FC9EC2ACA}&managed=true
```

___

#### Event ID: 10030 - Lapsdevicepasswordupdate Notification

In this event the LAPS client is updating the password in AD RS.  To understand this one must parse the details of the event URL to determine what is taking place in this event. 

- lapsdevicepasswordupdate indicates the primary method on the AD RS service by which new passwords are sent to Azure AD.
- First guid from left to right is the tenantID.
- Second guid is the AAD Device ID.
- Client-Request-ID is what is found in the AD RS logs.

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/6/2023 3:35:35 PM

**Event ID**:      10030

**Task Category**: None

**Level**:         Information

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
LAPS is sending a message to the following endpoint.

 https://enterpriseregistration.windows.net/manage/7dd2219b-####-####-####-############/**lapsdevicepasswordupdate**/cef0c5c8-####-####-####-############?api-version=1.0&client-request-id={29F56885-5F8D-4EBD-A4DB-0567D1E7DB9A}&return-client-request-id={29F56885-5F8D-4EBD-A4DB-0567D1E7DB9A}
```

___

#### Event ID: 10032 - LAPS fails to authenticate to Azure using device identity

___

#### Event ID: 10058 - PasswordAgeDays Warning

Warning Event ID 10058 may be common. This event is by design because there are two different minimum values for PasswordAgeDays between AD DS and Azure AD. AD DS supports a value as low as 1 while Azure AD supports a minimum value of 7. When a value lower than 7 is set and backup to Azure AD is configured the system will default to 7 instead and generate this warning.

___

#### Event ID: 10059 - Azure returned a failure code

**Log Name**:      Microsoft-Windows-LAPS/Operational

**Source**:        Microsoft-Windows-LAPS

**Date**:          3/20/2023 4:27:59 PM

**Event ID**:      10059

**Task Category**: None

**Level**:         Error

**Keywords**:      

**User**:          SYSTEM

**Computer**:      <Fully Qualified Domain Name>

**Description**:
```code
{"code":"invalid_request","subcode":"error_fail","operation":"POST","message":"Local admin password solution is not enabled for this tenant.","requestId":"4e8f3cbd-fe42-425f-9237-7a436f895142","time":"2023-04-04T06:10:25.3372369Z"}
```

Solution for the "Local admin password solution is not enabled for this tenant." message. Have the customer navigate to the [Device settings](https://portal.azure.com/#view/Microsoft_AAD_Devices/DevicesMenuBlade/~/DeviceSettings/menuId~/null) blade in the Azure AD tenant and toggle the **Enable Azure AD Local Administrator Password Solution (LAPS)** to **Yes**. This is set to **No** by default.

```code
Azure returned a failure code.
 
 HTTP status code: 400
 
 Response text:
 {"code":"invalid_request","subcode":"error_missing_device","operation":"POST","message":"The device 625203d3-####-####-####-############ in 7dd2219b-####-####-####-############ could not be found.","requestId":"4ab91df6-f53d-4503-bc45-96a85a225917","time":"2023-03-20T21:27:59.5729273Z"}
```

Solution for HTTP error code 400 with a "message" of "The device 625203d3-####-####-####-############ in 7dd2219b-####-####-####-############ could not be found." It could be the device was removed from the tenant. Check `dsregcmd /status`.

```code
Azure returned a failure code.
 
 HTTP status code: 403
 
 Response text:
 {"code":"authorization_error","subcode":"error_authorization_request_denied","operation":"POST","message":"The specified request is not allowed for tenant (5933138b-####-####-####-############)","requestId":"53beba5a-5099-4198-ad52-ca9c307afc5c","time":"2022-12-30T13:06:59.1616401Z"}
```

Solution for HTTP error code 400 with a "message" of "The specified request is not allowed for tenant ({TenantID})". It could be the device has been disabled.


___

## Internal

### Audit Logs (ASC)

In Azure Support Center (ASC) under Tenant explorer, select **Audit Logs** from the panel on the left.

Filter options:

- **Service** is *Device Registration Service*

- **Category** is *Device*

- **Activity** has two actions which are audited:
  - **Reveal local administrator password**
  - **Update local administrator password**

___

### Devices (ASC)

- The Device Policy is currently exposed on the **Settings** blade under **Devices** in ASC. Soon this will show the new **Azure AD Local Administrator Password (LAPS)** policy setting. Until this is available, use ASC's Graph Explorer to [Show Azure AD Local Administrator Password (LAPS) policy setting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PAgeID=880009&anchor=show-azure-ad-local-administrator-password-(laps)-policy-setting)

### Local Administrator Password (ASC)

Soon, Devices in ASC will have a new tab called **Local Administrator Password (LAPS)** that  will list all Windows clients that have Windows LAPS backing up to Azure AD. The table will show the *Device ID*, *Name* of the device, *Last backup date* and *Next Backup date*.

Searching by a device ID will show the *Device ID*, *Name* of the device, *Last backup date*, *Next Backup date*, as well as information about the last 3 passwords that were backed up, which includes *Account name*, *Account SID*, and *Backup Date*.

___

### Kusto Web UX (ASC)

1. Click **Kusto Web UX** in the left-hand nav bar.
2. Click the *ASC Kusto Web UX* link to launch the KustoWebUX
3. Click the dropdown to the right of **Select cluster to add** and choose either `idsharedwus` or `idsharedweu`

**NOTE**: ADRS trace logs are split between these 2 kusto clusters. Lookup trace activity against each cluster one at a time.

4. Once the cluster is loaded, expand the **ADRS** database.
5. Select the **AdrsTraceEvent** table.
6. Obtain the <timestamp> and <correlationId> from Event ID: 10030 in the Windows Event Log under LAPS/Operational.

**NOTE**: The <correlationId> is the value captured as `client-request-id` in the URL.

```json
let t = datetime("<timestamp>");
let delta = 1min;
let ids = dynamic(["<correlationId>"]);
AdrsTraceEvent
| where env_time between ((t - delta) .. (t + delta))
| where correlationId in (ids)
| project env_time, message
```

Example:

```json
let t = datetime("2023-03-06T16:17:42Z");
let delta = 1min;
let ids = dynamic(["F31E6C1D-B056-4F69-8BD2-D5CEEF6709C2"]);
AdrsTraceEvent
| where env_time between ((t - delta) .. (t + delta))
| where correlationId in (ids)
| project env_time, message
```

___

### Microsoft Graph (ASC)

#### Show Azure AD Local Administrator Password policy setting

This returns the `"localAdminPassword"` section of the Device settings policy blade indicating if ADRS is allowing LAPS passwords to be stored in Azure AD or not.

- **Query Url**: `/policies/deviceRegistrationPolicy`
- **Version**: `beta`

___

#### Show local admin password metadata for all devices

This returns a list of all Windows devices registered in Azure AD that have LAPS passwords stored on them. The results for each machine include the deviceId, deviceName, lastBackupDateTime and refreshDateTime when the password is next due to be updated by the client.

- **Query Url**: `/deviceLocalCredentials`
- **Version**: `beta`

#### Show local admin password metadata for one Device

This returns the deviceId, deviceName, lastBackupDateTime and refreshDateTime when the password is next due to be updated by the client for a specific registered Windows device.

- **Query Url**: `/deviceLocalCredentials/{deviceId}`
- **Version**: `beta`

___

#### Show local admin password (Base64 encoded)

This returns the deviceId, deviceName, lastBackupDateTime and refreshDateTime when the password is next due to be updated by the client for a specific registered Windows device. It also returns, when present, the last three password backups. This includes the accountName, accountSid, backupDateTime and passwordBase64, which exposes a base64 encrypted password. 

- **Query Url**: `/deviceLocalCredentials/{deviceId}?$select=credentials`
- **Version**: `beta`

___

### Kusto Explorer

Support can use this query to troubleshoot Password update issues from the service-side.

- **Cluster**: `idsharedwus`
- **Database**: `ADRS`
- **Table**: `FindTraceLogs`

```json
let t = datetime("<timestamp>");
let delta = 10m;
let ids = dynamic (["<correlationId"])
cluster("idsharedwus.kusto.windows.net").database('ADRS').FindTraceLogs(t, delta, ids)
```

# Collaboration email alias

The **CSS Collab-LAPS: Intune, AAD and Windows** (aka: `intunewindowsaadlaps@microsoft.com`) email alias has been created to promote cross-team collaboration between Windows Platforms Directory Services, Intune and Azure Device Registration Services Technical Admins and Subject Matter Experts.

# ICM Path

Set the support topic of the case to **Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Windows Local Administrator Policy in Azure AD** and click **Escalate Case** to create an ICM from ASC.

Technical Admins can redirect the ICM to the PG under these paths:

Service-side issues with storage Windows local administrator passwords on devices in Azure AD route to.

- **Owning service**: ADRS
- **Owning team**: ADRS

Issues with Enable Azure AD Local Administrator Password Solution on the Device Settings blade route to.

- **Owning service**: ADRS
- **Owning team**: Triage

___

# Training

**Title**: Deep Dive 04322 - Windows Local Administrator Password Solution Backed up to Azure AD

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 62 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752), [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072) 

**Tool Availability**: April 11, 2023

**Training Completion**: April 21, 2023

**Region**: All regions

**Course Location**: [Cloud Academy](https://aka.ms/AAk7sgw)


