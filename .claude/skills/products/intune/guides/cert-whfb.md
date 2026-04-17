# INTUNE Windows Hello for Business 与 KDC — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 12 | **最后更新**: 2026-04-17

## 快速排查路径

1. **Windows Hello for Business (WHFB) Identity Protection profile set to Enabled for a user group does not take effect; users not prompted to set up PIN during sign-in**
   → Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Identity Protection profile to enable WHfB for specific user groups. Alternative: use OMA-URI custom prof... `[onenote, 🟢 9.5]`

2. **WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, ShellCore_Oper.evtx shows ClearTemporaryWebDataAsyncFailed**
   → WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .backup 2) Add-AppxPackage -Register to re-register 3) Rename HKCU\Software\Microsoft\IdentityCRL\TokenBr... `[ado-wiki, 🟢 9.0]`

3. **WHFB PIN sign-in fails with The request is not supported, DC System log Event ID 19/29 KDC cannot find suitable certificate**
   → 1) Verify 2016 DC has Kerberos Auth EKU cert 2) Import new cert to AD DS store and restart DC if multiple certs exist 3) certutil -verify -urlfetch to validate 4) Verify issuing CA in NTAuth store `[ado-wiki, 🟢 9.0]`

4. **WHFB PIN sign-in fails with KDC certificate could not be validated, System Event ID 9 Kerberos**
   → 1) Export DC cert as .cer 2) certutil -verify -urlfetch 3) Fix PKI CRL/root cert issues 4) Verify CA in NTAuth store 5) Enable CAPI2 logs `[ado-wiki, 🟢 9.0]`

5. **WHFB configured but all Sign-in Options grayed out in Settings**
   → Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check Intune/GPO policies `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Hello for Business (WHFB) Identity Protection profile set to Enabled for a user group doe... | Tenant-wide Windows Enrollment WHfB policy is set to Disabled. The Enrollment disable setting tak... | Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Ident... | 🟢 9.5 | onenote: Mooncake POD Support Notebook/POD/VMS... |
| 2 | WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, ShellCore_Oper.evtx sh... | CXH app cache not cleared properly, known bug on OS versions below Nickel (22H2) | WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .back... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 3 | WHFB PIN sign-in fails with The request is not supported, DC System log Event ID 19/29 KDC cannot... | DC missing certificate with Kerberos Authentication EKU, or old certificate selected by lsass | 1) Verify 2016 DC has Kerberos Auth EKU cert 2) Import new cert to AD DS store and restart DC if ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 4 | WHFB PIN sign-in fails with KDC certificate could not be validated, System Event ID 9 Kerberos | DC certificate chain validation failure (CRL revocation check or root trust issue) | 1) Export DC cert as .cer 2) certutil -verify -urlfetch 3) Fix PKI CRL/root cert issues 4) Verify... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 5 | WHFB configured but all Sign-in Options grayed out in Settings | AllowSignInOptions registry value set to 0 by Intune policy or GPO | Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check I... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 6 | Key Admins and Enterprise Key Admins security group names not displayed after AD 2016 schema upgrade | RID 526/527 friendly name resolution requires Windows Server 2016 DC to hold PDC FSMO role | Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Identity dc2016 -Op... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 7 | Biometric data (fingerprint/facial recognition) lost after Windows in-place upgrade | Biometric device had Allow computer to turn off this device to save power checked before upgrade | Before upgrade, uncheck Allow computer to turn off this device to save power for biometric reader... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 8 | WHFB provisioning fails after cross-domain migration with error 0x801C0451 (DSREG_E_USER_TOKEN_SW... | WAM cache contains stale tokens from old domain | 1) certutil -deletehellocontainer 2) dsregcmd /leave + /join if device also migrated 3) Clear WAM... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 9 | WHFB Key Trust PIN sign-in fails with That option is temporarily unavailable | Client can only access RODC, msDS-KeyCredentialLink attribute not replicated to RODC | Ensure client has access to writable Domain Controller (Writable DC), RODC does not support WHFB ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 10 | WHFB provisioning fails at ADFS redirect with Error Code: 0X801C044F | ADFS configuration issue causing device registration service authentication failure | Collect ADFS logs and client User Device Registration/Admin event logs, verify ADFS DRS configura... | 🟢 8.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FWindows%20Hello%20for%20Business) |
| 11 | Cloud PC with Windows 365      Enterprise license fails to provision with the following error: Co... | As the error message states, this will happen if the sync between AD to AAD is taking too long or... | To resolve this, follow the provisioning flow of the affected Cloud PC: 1. Check the OPNC and ide... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4649928) |
| 12 | First of all,&nbsp;Windows 10 devices are being deployed using same profile ,apps, policies, etc.... | the issue is caused by a configuration profile caused via the CIS Level 1 security policy for har... | cx was able to resolve the issue by disabling 'Windows Hello' tenant wide and configuring a custo... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5042465) |

> 本 topic 有排查工作流 → [排查工作流](workflows/cert-whfb.md)
> → [已知问题详情](details/cert-whfb.md)
