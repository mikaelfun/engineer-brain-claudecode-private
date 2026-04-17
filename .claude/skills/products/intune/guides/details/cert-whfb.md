# INTUNE Windows Hello for Business 与 KDC — 已知问题详情

**条目数**: 12 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Windows Hello for Business (WHFB) Identity Protection profile set to Enabled for a user group does not take effect; users not prompted to set up PI...
**Solution**: Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Identity Protection profile to enable WHfB for specific user groups. Alternative: use OMA-URI custom profile with ./User/Vendor/MSFT/PassportForWork/<TenantId>/Policies/UsePassportForWork = True assigned to target user groups.
`[Source: onenote, Score: 9.5]`

### Step 2: WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, ShellCore_Oper.evtx shows ClearTemporaryWebDataAsyncFailed
**Solution**: WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .backup 2) Add-AppxPackage -Register to re-register 3) Rename HKCU\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount to _backup 4) Reboot
`[Source: ado-wiki, Score: 9.0]`

### Step 3: WHFB PIN sign-in fails with The request is not supported, DC System log Event ID 19/29 KDC cannot find suitable certificate
**Solution**: 1) Verify 2016 DC has Kerberos Auth EKU cert 2) Import new cert to AD DS store and restart DC if multiple certs exist 3) certutil -verify -urlfetch to validate 4) Verify issuing CA in NTAuth store
`[Source: ado-wiki, Score: 9.0]`

### Step 4: WHFB PIN sign-in fails with KDC certificate could not be validated, System Event ID 9 Kerberos
**Solution**: 1) Export DC cert as .cer 2) certutil -verify -urlfetch 3) Fix PKI CRL/root cert issues 4) Verify CA in NTAuth store 5) Enable CAPI2 logs
`[Source: ado-wiki, Score: 9.0]`

### Step 5: WHFB configured but all Sign-in Options grayed out in Settings
**Solution**: Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check Intune/GPO policies
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Key Admins and Enterprise Key Admins security group names not displayed after AD 2016 schema upgrade
**Solution**: Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Identity dc2016 -OperationMasterRole PDCEmulator
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Biometric data (fingerprint/facial recognition) lost after Windows in-place upgrade
**Solution**: Before upgrade, uncheck Allow computer to turn off this device to save power for biometric reader and camera devices
`[Source: ado-wiki, Score: 9.0]`

### Step 8: WHFB provisioning fails after cross-domain migration with error 0x801C0451 (DSREG_E_USER_TOKEN_SWITCH_ACCOUNT)
**Solution**: 1) certutil -deletehellocontainer 2) dsregcmd /leave + /join if device also migrated 3) Clear WAM cache: delete files in %LOCALAPPDATA%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts\ 4) Reboot and re-enroll WHFB
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Windows Hello for Business (WHFB) Identity Protection profile set to Enabled ... | Tenant-wide Windows Enrollment WHfB policy is set to Disabled. The Enrollment... | Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disab... | 9.5 | onenote |
| 2 | WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, Sh... | CXH app cache not cleared properly, known bug on OS versions below Nickel (22H2) | WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw... | 9.0 | ado-wiki |
| 3 | WHFB PIN sign-in fails with The request is not supported, DC System log Event... | DC missing certificate with Kerberos Authentication EKU, or old certificate s... | 1) Verify 2016 DC has Kerberos Auth EKU cert 2) Import new cert to AD DS stor... | 9.0 | ado-wiki |
| 4 | WHFB PIN sign-in fails with KDC certificate could not be validated, System Ev... | DC certificate chain validation failure (CRL revocation check or root trust i... | 1) Export DC cert as .cer 2) certutil -verify -urlfetch 3) Fix PKI CRL/root c... | 9.0 | ado-wiki |
| 5 | WHFB configured but all Sign-in Options grayed out in Settings | AllowSignInOptions registry value set to 0 by Intune policy or GPO | Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions... | 9.0 | ado-wiki |
| 6 | Key Admins and Enterprise Key Admins security group names not displayed after... | RID 526/527 friendly name resolution requires Windows Server 2016 DC to hold ... | Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole ... | 9.0 | ado-wiki |
| 7 | Biometric data (fingerprint/facial recognition) lost after Windows in-place u... | Biometric device had Allow computer to turn off this device to save power che... | Before upgrade, uncheck Allow computer to turn off this device to save power ... | 9.0 | ado-wiki |
| 8 | WHFB provisioning fails after cross-domain migration with error 0x801C0451 (D... | WAM cache contains stale tokens from old domain | 1) certutil -deletehellocontainer 2) dsregcmd /leave + /join if device also m... | 9.0 | ado-wiki |
| 9 | WHFB Key Trust PIN sign-in fails with That option is temporarily unavailable | Client can only access RODC, msDS-KeyCredentialLink attribute not replicated ... | Ensure client has access to writable Domain Controller (Writable DC), RODC do... | 9.0 | ado-wiki |
| 10 | WHFB provisioning fails at ADFS redirect with Error Code: 0X801C044F | ADFS configuration issue causing device registration service authentication f... | Collect ADFS logs and client User Device Registration/Admin event logs, verif... | 8.0 | ado-wiki |
| 11 | Cloud PC with Windows 365      Enterprise license fails to provision with the... | As the error message states, this will happen if the sync between AD to AAD i... | To resolve this, follow the provisioning flow of the affected Cloud PC: 1. Ch... | 7.5 | contentidea-kb |
| 12 | First of all,&nbsp;Windows 10 devices are being deployed using same profile ,... | the issue is caused by a configuration profile caused via the CIS Level 1 sec... | cx was able to resolve the issue by disabling 'Windows Hello' tenant wide and... | 7.5 | contentidea-kb |
