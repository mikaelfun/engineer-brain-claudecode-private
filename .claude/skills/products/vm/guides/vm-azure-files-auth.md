# VM Azure Files AD 身份认证 — 排查速查

**来源数**: 2 (AW, ML) | **条目**: 18 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate system shutdown'. VM re | (1) The SYSTEM account does not have the 'Shut down the system' privilege (remov | 1) Verify SYSTEM account has 'Shut down the system' privilege: Computer Configur | 🔵 7.5 | AW |
| 2 | Domain join extension (JsonADDomainExtension) fails with error 'Failed to initiate system shutdown'. | 1) The SYSTEM account does not have the required 'Shut down the system' privileg | 1) Verify SYSTEM account has 'Shut down the system' privilege in Local Policy >  | 🔵 7.5 | AW |
| 3 | Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate system shutdown' error. | 1. The SYSTEM account does not have the required Shut down the system privilege. | 1. Verify SYSTEM account has Shut down the system privilege in Local Policies >  | 🔵 7.5 | AW |
| 4 | JsonADDomainExtension domain join fails with error code 1332: 'No mapping between account names and  | The 'Options' parameter value used for domain join is incorrect. Using option 1  | Use Options value 3 (NetSetupJoinDomain + NetSetupAcctCreate) instead of 1 in th | 🔵 7.5 | AW |
| 5 | JsonADDomainExtension domain join fails with error code 1355: 'The specified domain either does not  | Wrong domain name provided, or VM cannot resolve domain DNS because domain contr | Verify the domain name is correct. Ensure VNET DNS servers point to domain contr | 🔵 7.5 | AW |
| 6 | System error 5 'Access is denied' when accessing Azure File Share - on-prem SID does not match Azure | On-premises user SID does not match the corresponding Azure AD onPremisesSecurit | Compare on-prem SID (whoami /user) with Azure AD SID (Get-AzureADUser -objectid  | 🔵 7.5 | AW |
| 7 | JsonADDomainExtension fails to join domain with error code 1355: 'The specified domain either does n | The domain name is wrong, or the VM cannot resolve the DC DNS name because the D | 1) Verify the domain name is correct. 2) Configure VNET DNS servers to point to  | 🔵 7.5 | AW |
| 8 | Black screen after RDP on domain-joined VMs; boot diagnostic shows spinning circle; dwm.exe crashes  | Desktop Window Manager (dwm.exe) fails to start with error 0xc0000142 on domain- | Check Group Policy applied to the VMs for settings affecting DWM or desktop comp | 🔵 7.5 | AW |
| 9 | Setting DataAccessAuthorizationMode on managed disk fails with error: dataAccessAuthorizationMode is | AFEC (Azure Feature Exposure Control) flag for DataAccessAuthMode is not enabled | Register the AFEC flag for the subscription. See https://aka.ms/afec for the fea | 🔵 6.5 | AW |
| 10 | JsonADDomainExtension domain join fails with error code 2732: 'An account with the same name exists  | A computer account with the same name already exists in Active Directory, and th | Ask the customer's AD team to remove the existing computer name from the Active  | 🔵 6.5 | AW |
| 11 | JsonADDomainExtension domain join fails with error code 1323: 'Unable to update the password. The va | The password provided for the domain join account is incorrect or has expired. | Verify the password for the domain join account is correct and has not expired.  | 🔵 6.5 | AW |
| 12 | Customer reinstalls or reapplies JsonADDomainExtension with a different OU path, but the VM's comput | OU placement is evaluated only during the initial domain join operation. The ext | Use Active Directory Users and Computers (ADUC) or PowerShell Move-ADObject to m | 🔵 6.5 | AW |
| 13 | JsonADDomainExtension fails to join domain with error code 1332: 'No mapping between account names a | The domain join option parameter is incorrect. Option 1 (NetSetupJoinDomain only | Use join option 3 instead of 1 in the Set-AzureRmVMExtension or ARM template Set | 🔵 6.5 | AW |
| 14 | JsonADDomainExtension fails to join domain with error code 1323: 'Unable to update the password. The | The password provided for the domain join user account is incorrect | Verify and correct the password in the ProtectedSettings of the extension config | 🔵 6.5 | AW |
| 15 | JsonADDomainExtension fails to join domain with error code 2202: 'The specified username is invalid' | The username provided for domain join does not exist in the target domain | Verify the domain join username exists in Active Directory and is correctly form | 🔵 6.5 | AW |
| 16 | JsonADDomainExtension fails to join domain with error code 2732: 'An account with the same name exis | A computer account with the same name already exists in Active Directory, and th | Ask the customer's AD admin to remove the existing computer name from Active Dir | 🔵 6.5 | AW |
| 17 | RDP to Windows VM returns 'Access is denied' when user belongs to many AD groups and nested AD group | Kerberos token size not big enough to hold all permissions. Happens when user be | Increase Kerberos MaxTokenSize: Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentCont | 🔵 6.5 | AW |
| 18 | RDP login fails with Access is denied. Can connect via mstsc /admin but normal RDP denied. | Certificate registry key permission missing for Remote Desktop Users; user profi | Grant Read on certificate key. Set IgnoreRegUserConfigErrors=1. Set MaxTokenSize | 🔵 6.5 | ML |

## 快速排查路径

1. **Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate sys**
   - 根因: (1) The SYSTEM account does not have the 'Shut down the system' privilege (removed from Local Policy > User Rights Assig
   - 方案: 1) Verify SYSTEM account has 'Shut down the system' privilege: Computer Configuration > Windows Settings > Security Settings > Local Policies > User R
   - `[🔵 7.5 | AW]`

2. **Domain join extension (JsonADDomainExtension) fails with error 'Failed to initia**
   - 根因: 1) The SYSTEM account does not have the required 'Shut down the system' privilege. 2) Another script, extension, or sche
   - 方案: 1) Verify SYSTEM account has 'Shut down the system' privilege in Local Policy > User Rights Assignment. 2) Review System event logs to identify any ex
   - `[🔵 7.5 | AW]`

3. **Domain join extension (JsonADDomainExtension) fails with 'Failed to initiate sys**
   - 根因: 1. The SYSTEM account does not have the required Shut down the system privilege. 2. Another script/extension/scheduled t
   - 方案: 1. Verify SYSTEM account has Shut down the system privilege in Local Policies > User Rights Assignment. 2. Review System event logs for any restart op
   - `[🔵 7.5 | AW]`

4. **JsonADDomainExtension domain join fails with error code 1332: 'No mapping betwee**
   - 根因: The 'Options' parameter value used for domain join is incorrect. Using option 1 (NetSetupJoinDomain only) can lead to fa
   - 方案: Use Options value 3 (NetSetupJoinDomain + NetSetupAcctCreate) instead of 1 in the Set-AzureRmVMExtension -Settings parameter. For error codes referenc
   - `[🔵 7.5 | AW]`

5. **JsonADDomainExtension domain join fails with error code 1355: 'The specified dom**
   - 根因: Wrong domain name provided, or VM cannot resolve domain DNS because domain controller IP is not configured in the VNET D
   - 方案: Verify the domain name is correct. Ensure VNET DNS servers point to domain controller IPs. Check that no firewall/NSG rules block communication betwee
   - `[🔵 7.5 | AW]`

