# AVD ContentIdea KB Legacy (Part 1) - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: lmcompatibilitylevel, ntlmv2, organization-laptop
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | WVD login behavior changed after client version .127. Client keeps prompting for... | Issue with WVD client version released after .127 | Resolved with new WVD client version .605. | 🔵 6.5 | KB |
| 2 | RDClient Subscribe error: Something went wrong, could not authenticate. AAD.Brok... | UAC Admin Approval Mode disabled for Built-in Administrator. | Enable UAC Admin Approval Mode, gpupdate /force, re-login. | 🔵 6.5 | KB |
| 3 | WVD Fall 2019 Release: selecting Power as Usage Profile shows NaN instead of VM ... | Known issue in Marketplace, fixed in next WVD Marketplace release. | Workaround: select Custom option and manually enter number of VMs. Power option ... | 🔵 6.5 | KB |
| 4 | Need to restrict one-way clipboard redirection: allow paste TO remote desktop bu... | Clipboard redirection only works bidirectionally by design. | Not possible with RDP or WVD. Clipboard redirection is either enabled or disable... | 🔵 6.5 | KB |
| 5 | Unable to deploy Azure Monitor for RDS and WVD with CSP subscription. Error: Thi... | Azure Monitor for RDS and WVD is not available in CSP subscriptions. | Not available in CSP. Not all Azure Marketplace items are available in Azure CSP... | 🔵 6.5 | KB |
| 6 | Issue - RDP property changes through Azure portal under HostPool is not working ... | The Hostpool .RDP under RDClientwpf Folder is not getting updated with the lates... | Rename the Hostpool GUID folder under C:\Users\<username>\AppData\Local\rdclient... | 🔵 6.5 | KB |
| 7 | AAD joined AVD machine: Admin Users get error We could not connect to the remote... | Azure AD Security Default Settings is enabled, requiring administrators to do MF... | Disable Security Defaults: Azure portal -> Azure AD -> Properties -> Manage secu... | 🔵 6.5 | KB |
| 8 | AVD users launching remote app for first time have 5 min wait on Preparing Windo... | RunOnce key for OneDrive causes rdpinit.exe to wait 5 min (hardcoded timeout) on... | Remove OneDrive key from RunOnce in default user profile hive. | 🔵 6.5 | KB |
| 9 | Windows 10 AVD: Terminal service crash 0xC0000409 subcode 0xA in termsrv!CRemote... | Bug: CRemoteConnectionManager members pfnUalStart/pfnUalStop/pfnUalInstrument no... | Fixed in Windows 11. Apply latest Windows updates. | 🔵 6.5 | KB |
| 10 | In AVD or RDP: The number of connections to this computer is limited and all con... | GPO policy Limit number of connections restricting connections. | Check MaxInstanceCount registry and set to not configured (ffffffff). | 🔵 6.5 | KB |
| 11 | Unable to sign to AVD desktop with the error &quot;Sign in failed. Please check ... | na | We removed the AVD VM from the AAD using dsregcmd /leave We uninstalled the AADL... | 🔵 6.5 | KB |
| 12 | Issues configuring application groups. Receiving error: &quot;No more role assig... | We observed that customer organization had reached the limit of 4000 role assign... | The recommendation from Microsoft is to reduce the number of role assignments on... | 🔵 6.5 | KB |
| 13 | After upgrading an Azure VM from Windows 10 to Windows 11 multi-session OS, the ... | Windows 11 multi-session OS introduced a security enhancement requiring UAC for ... | On Windows 11 multi-session OS and Server OS with RDSH role, ISO mounting by sta... | 🔵 6.5 | KB |
| 14 | Abstract Several screen issues happen on the desktop on AVD (Azure Virtual Deskt... | In many cases, the issue is with the display driver.However, sometimes the cause... | Firstly, you should confirm whether the display driver is the latest version on ... | 🔵 6.5 | KB |
| 15 | Unable to access WVD VM via desktop client only from organization laptops. Works... | Organization machine settings do not support NTLMv2 authentication. NTLM auth fa... | Create registry DWORD lmcompatibilitylevel=5 at HKLM\System\CurrentControlSet\Co... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: Issue with WVD client version released after .127 `[Source: KB]`
2. Check: UAC Admin Approval Mode disabled for Built-in Admi `[Source: KB]`
3. Check: Known issue in Marketplace, fixed in next WVD Mark `[Source: KB]`
4. Check: Clipboard redirection only works bidirectionally b `[Source: KB]`
5. Check: Azure Monitor for RDS and WVD is not available in `[Source: KB]`
