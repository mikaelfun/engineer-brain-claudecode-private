---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Device Management/Device registration_Troubleshooting Device Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FDevice%20Management%2FDevice%20registration_Troubleshooting%20Device%20Management"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## About (learn more about Azure AD devices)

- [Azure AD Devices](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183949)

## Multiple Device Records

Multiple device records are common in these scenarios:
- When a device has been re-imaged/recycled with the same name without un-enrolling/un-registering first
- When non-Windows 10 devices (down-level windows devices) are registered, the same device name will appear for each user that does a login on the device

### Scenario #1: Customer (admin) sees multiple entries with the same device name for a user

**For Mobile devices (e.g. IOS, Android)**
- User has reset their device without actually un-enrolling or removing the account in Authenticator (unregister)
- User has acquired a new device and has used the same name on the device

**For Windows 7/8.1 users with Automatic registration & customers using add/work school account (aka WPJ)**
- User has re-imaged the machine with the same machine name
- User has upgraded their machine to the next OS and re-added their add/work school account
- Admin has created a kiosk machine which deleted the profile every time they logout (creates new record next login)

### Scenario #2: Customer (admin) sees multiple entries with the same device name for Windows 10 users

**For domain joined Windows 10 devices with automatic registration**
- Device are not visible in the portal but are through devices list

### Scenario #3: Customer (admin) see the same device name across multiple users

- For non-Windows 10 or Windows Server 2016, devices are registered for each user.
- Windows 10 add work account (BYOD) will create a device record for each user.
- Each device ID is unique for each user

### Scenario #4: Customer (user) sees multiple devices under their profile

- Users navigate to https://myapps.microsoft.com and select Profile from the User card
- Issues: Cannot determine which device to remove in duplicates; Status details not available yet

## Missing devices in the portal

- Azure portal only displays devices registered as a user
- AD domain-joined Windows 10 and Server 2016 devices that are automatically registered have machine context and no username
- Use `Get-MgDevice` PowerShell to find all devices
- **Get-EntraDevice -All** will list all devices

## Windows 10 registration dual state

If Windows 10 domain joined devices are already Azure AD registered to your tenant, remove that state before enabling Hybrid Azure AD join.

From Windows 10 1809:
- Existing Azure AD registered state is automatically removed after Hybrid Azure AD join
- Prevent with registry key: `HKLM\SOFTWARE\Policies\Microsoft\Windows\WorkplaceJoin`, `BlockAADWorkplaceJoin=dword:00000001`

For Windows 10 1803: install KB [4489894](https://support.microsoft.com/en-us/help/4489894).

## Accessing BitLocker Keys

- Available for Windows 10 Azure AD joined devices ONLY
- Only visible to Domain Administrators
- Navigate to: Users and Groups > User > Devices > Windows Device

## PowerShell CMDlets

### Get-EntraDevice
- `Get-EntraDevice -all` - displays all devices (no RegisteredOwner)
- To get registered owner, iterate through each device by DeviceID or ObjectID
- **Note**: RegisteredOwner may not be listed for domain-joined auto-registered machines

### Get-EntraDeviceRegisteredOwner
Lists same devices visible through portal for the User

### Set-EntraDevice -AccountEnabled
- `Set-EntraDevice -AccountEnabled:$false` - block device authentication (use for compromised devices)
- `Set-EntraDevice -AccountEnabled:$true` - re-enable
- Takes up to 1 hour for access to be blocked

### Remove-EntraDevice
- Use when user reports lost/wiped/re-installed device
- For Intune-managed devices: use Retire/Wipe first (handles both Azure and remote cleanup)

## Device Quota issues

- Default quota: 20 devices per user per tenant
- Quota does NOT apply to Windows 10 AD domain-joined auto-registered devices
- Common in kiosk/shared computer scenarios

**Resolution:**
1. Delete stale/unused devices
2. Increase quota: Portal > AD > Users and groups > Device Settings > Maximum number of devices per user

## Manage devices using PowerShell - Security Note

`IsCompliant` and `IsManaged` can be modified via Set-EntraDevice for Windows devices but is blocked for 3rd party devices. Going forward blocked for ALL devices.

**Security risk**: Modifying IsCompliant/IsManaged via PowerShell compromises Conditional Access policies requiring compliant devices.

**MSRC 65198**: An architectural design change now ensures ADRS sets isCompliant=false during registrations involving device id reuse or HAADJ. This means isCompliant for HAADJ devices not managed by MDM may change from N/A to false. IsCompliant and IsManaged should only be updated by Intune or approved MDM apps.
