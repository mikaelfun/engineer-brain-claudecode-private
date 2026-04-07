# AVD ContentIdea KB Legacy (Part 1) - Issue Details

**Entries**: 15 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. WVD login behavior changed after client version .127. Client keeps prompting for credentials.
- **ID**: `avd-contentidea-kb-008`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Issue with WVD client version released after .127
- **Solution**: Resolved with new WVD client version .605.
- **Tags**: Break/Fix, contentidea-kb

### 2. RDClient Subscribe error: Something went wrong, could not authenticate. AAD.BrokerPlugin activation ...
- **ID**: `avd-contentidea-kb-012`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: UAC Admin Approval Mode disabled for Built-in Administrator.
- **Solution**: Enable UAC Admin Approval Mode, gpupdate /force, re-login.
- **Tags**: Break/Fix, contentidea-kb

### 3. WVD Fall 2019 Release: selecting Power as Usage Profile shows NaN instead of VM count. Validation pa...
- **ID**: `avd-contentidea-kb-015`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Known issue in Marketplace, fixed in next WVD Marketplace release.
- **Solution**: Workaround: select Custom option and manually enter number of VMs. Power option calculates VMs assuming each user needs 1 vCPU.
- **Tags**: Content Idea Request, contentidea-kb

### 4. Need to restrict one-way clipboard redirection: allow paste TO remote desktop but prevent copy FROM ...
- **ID**: `avd-contentidea-kb-016`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Clipboard redirection only works bidirectionally by design.
- **Solution**: Not possible with RDP or WVD. Clipboard redirection is either enabled or disabled both ways. Controlled via GPO: Do not allow Clipboard redirection set to Enabled.
- **Tags**: Content Idea Request, contentidea-kb

### 5. Unable to deploy Azure Monitor for RDS and WVD with CSP subscription. Error: This offer is not avail...
- **ID**: `avd-contentidea-kb-019`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Azure Monitor for RDS and WVD is not available in CSP subscriptions.
- **Solution**: Not available in CSP. Not all Azure Marketplace items are available in Azure CSP subscriptions.
- **Tags**: Content Idea Request, contentidea-kb

### 6. Issue - RDP property changes through Azure portal under HostPool is not working while accessing the ...
- **ID**: `avd-contentidea-kb-035`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: The Hostpool .RDP under RDClientwpf Folder is not getting updated with the latest RDP properties which we are changing through Azure Portal.
- **Solution**: Rename the Hostpool GUID folder under C:\Users\<username>\AppData\Local\rdclientwpf. This will force the WVD client to download the RDP files again with the latest properties.
- **Tags**: Break/Fix, contentidea-kb

### 7. AAD joined AVD machine: Admin Users get error We could not connect to the remote PC because of a sec...
- **ID**: `avd-contentidea-kb-044`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Azure AD Security Default Settings is enabled, requiring administrators to do MFA.
- **Solution**: Disable Security Defaults: Azure portal -> Azure AD -> Properties -> Manage security defaults -> Set to No.
- **Tags**: Break/Fix, contentidea-kb

### 8. AVD users launching remote app for first time have 5 min wait on Preparing Windows until successful ...
- **ID**: `avd-contentidea-kb-047`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: RunOnce key for OneDrive causes rdpinit.exe to wait 5 min (hardcoded timeout) on runonce.exe.
- **Solution**: Remove OneDrive key from RunOnce in default user profile hive.
- **Tags**: contentidea-kb

### 9. Windows 10 AVD: Terminal service crash 0xC0000409 subcode 0xA in termsrv!CRemoteConnectionManager::U...
- **ID**: `avd-contentidea-kb-048`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Bug: CRemoteConnectionManager members pfnUalStart/pfnUalStop/pfnUalInstrument not properly initialized.
- **Solution**: Fixed in Windows 11. Apply latest Windows updates.
- **Tags**: contentidea-kb

### 10. In AVD or RDP: The number of connections to this computer is limited and all connections are in use....
- **ID**: `avd-contentidea-kb-049`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: GPO policy Limit number of connections restricting connections.
- **Solution**: Check MaxInstanceCount registry and set to not configured (ffffffff).
- **Tags**: contentidea-kb

### 11. Unable to sign to AVD desktop with the error &quot;Sign in failed. Please check your username and pa...
- **ID**: `avd-contentidea-kb-102`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: na
- **Solution**: We removed the AVD VM from the AAD using dsregcmd /leave We uninstalled the AADLoginfor Windows extension using&nbsp; az vm extension delete -g MyResourceGroup --vm-name MyVm -n MyExtensionName We reinstalled the extension from the AVD portal with Azure CLI and the user where then able to connect.
- **Tags**: contentidea-kb

### 12. Issues configuring application groups. Receiving error: &quot;No more role assignments can be create...
- **ID**: `avd-contentidea-kb-108`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: We observed that customer organization had reached the limit of 4000 role assignments per subscription. This limit is considered a hard limit and cannot be increased on a per customer basis.
- **Solution**: The recommendation from Microsoft is to reduce the number of role assignments on the subscription. The following documentation which outlines this limit and offers a handful of solutions that you can implement in order to reduce the number of role assignments.Troubleshoot
Azure RBAC limits - Azure RBAC | Microsoft Learn Understanding the RBAC Role Assignment Limit Azure has a hard limit of 4,000 role assignments per subscription, which includes all assignments made at various scopes (subscription, resource group, or resource level). How the Limit Works: Each role assignment counts toward the 4,000 limit, regardless of whether it's assigned to a single user, service principal, or group.  Assigning a role to one user counts as one assignment.  Assigning a role to a group�even if that group has 50 or more members�still counts as just one assignment.   This means that assigning roles directly to individual users can quickly consume the available quota. For example: Assigning a role to 100 users individually = 100 role assignments.  Assigning the same role to a single group with 100 users = 1 role assignment.   Recommendation: As highlighted in Microsoft documentation, the top recommendation for managing this limitation is to: Use group-based role assignments instead of assigning roles directly to individual users.   This not only helps avoid hitting the assignment limit but also simplifies access management and improves scalability.
- **Tags**: contentidea-kb

### 13. After upgrading an Azure VM from Windows 10 to Windows 11 multi-session OS, the ability to mount ISO...
- **ID**: `avd-contentidea-kb-127`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Windows 11 multi-session OS introduced a security enhancement requiring UAC for ISO mounting operations.In Windows 10 multi-session OS, this behavior could be controlled via the following registry setting, which is no longer supported in Windows 11 multi-session OS or in Windows Server OS with RDSH role (Windows Server 2022 or later) Registry Key: HKLM\System\CurrentControlSet\Services\FsDepends\Parameters\AccessControlValue: ISOMountAllowNormalUserType: REG_DWORDData:0 : Restrict ISO mounting for standard users1 : Allow ISO mounting for standard usersBy default, ISOMountAllowNormalUser is set to 0 on Server OS and 1 on Client OS Chart of OS and registry combination for Normal Users. 

 
 
  &nbsp; 
  Behaviour of
  ISOMountAllowNormalUser=0 
  Behaviour of
  ISOMountAllowNormalUser=1 
 
 
  Windows 10 multi-session OS
  on AVD All supported version of Windows Server without RDSH role   
  Cannot mount the .iso file
  and a UAC prompt appears. 
  &nbsp;Can mount the .iso file
  without a UAC prompt. 
 
 
  Windows 11 multi-session
  OS Windows Server 2022 or later with RDSH role   
  Cannot mount the .iso file
  and a UAC prompt appears. 
  Cannot mount the .iso file
  and a UAC prompt appears.
- **Solution**: On Windows 11 multi-session OS and Server OS with RDSH role, ISO mounting by standard users cannot be enabled through registry settings. UAC is mandatory.Workaround: Perform the mount operation using File Explorer with administrative privileges.
- **Tags**: contentidea-kb

### 14. Abstract Several screen issues happen on the desktop on AVD (Azure Virtual Desktop) or Windows 365. ...
- **ID**: `avd-contentidea-kb-128`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: In many cases, the issue is with the display driver.However, sometimes the cause lies with the MPO (multiplane overlay). In this case, disabling the MPO might solve the issue. MPO Support - Windows drivers | Microsoft Learn
- **Solution**: Firstly, you should confirm whether the display driver is the latest version on the client machine&nbsp;on the client machine that is the device you are connecting from.If&nbsp;the display driver is *not* the latest version, please update to the latest version. If your issue isn't still fixed even though&nbsp;the latest version of&nbsp;the display driver, please set the registry below follow these steps on the client machine&nbsp;on the client machine that is the device you are connecting from. *Don't set the registry&nbsp;on the AVD or Windows 365 virtual machine. Open the registry editor (regedit.exe) Moe to&nbsp;HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\Dwm Click [Edit] menu. Select [New] -&gt; [DWORD (32-bit) Value] Rename the value name from [New Value #1] to [OverlayTestMode] Double-Click&nbsp;[OverlayTestMode] Set the value data to &quot;5&quot; Push [OK] button Close&nbsp;the registry editor (regedit.exe) Reboot the client machine.
- **Tags**: contentidea-kb

### 15. Unable to access WVD VM via desktop client only from organization laptops. Works from personal lapto...
- **ID**: `avd-contentidea-kb-029`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: Organization machine settings do not support NTLMv2 authentication. NTLM auth fails with 0xC000006A.
- **Solution**: Create registry DWORD lmcompatibilitylevel=5 at HKLM\System\CurrentControlSet\Control\Lsa and reboot client.
- **Tags**: NTLMv2, organization-laptop, lmcompatibilitylevel, contentidea-kb
