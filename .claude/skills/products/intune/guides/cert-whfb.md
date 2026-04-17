# Intune Windows Hello for Business 与 KDC — 排查速查

**来源数**: 2 | **21V**: 全部适用
**条目数**: 10 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Hybrid Azure AD joined device fails to receive user-based SCEP certificate. SCEP profile is confi... | SCEP certificate profile Key Storage Provider (KSP) is set to Windows Hello f... | Change the SCEP certificate profile KSP setting from 'Windows Hello for Business' to 'Enroll to T... | 🟢 9.0 | OneNote |
| 2 | Windows Hello for Business (WHFB) Identity Protection profile set to Enabled for a user group doe... | Tenant-wide Windows Enrollment WHfB policy is set to Disabled. The Enrollment... | Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Ident... | 🟢 9.0 | OneNote |
| 3 | WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, ShellCore_Oper.evtx sh... | CXH app cache not cleared properly, known bug on OS versions below Nickel (22H2) | WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .back... | 🟢 8.5 | ADO Wiki |
| 4 | WHFB configured but all Sign-in Options grayed out in Settings | AllowSignInOptions registry value set to 0 by Intune policy or GPO | Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check I... | 🟢 8.5 | ADO Wiki |
| 5 | Key Admins and Enterprise Key Admins security group names not displayed after AD 2016 schema upgrade | RID 526/527 friendly name resolution requires Windows Server 2016 DC to hold ... | Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Identity dc2016 -Op... | 🟢 8.5 | ADO Wiki |
| 6 | Biometric data (fingerprint/facial recognition) lost after Windows in-place upgrade | Biometric device had Allow computer to turn off this device to save power che... | Before upgrade, uncheck Allow computer to turn off this device to save power for biometric reader... | 🟢 8.5 | ADO Wiki |
| 7 | WHFB provisioning fails after cross-domain migration with error 0x801C0451 (DSREG_E_USER_TOKEN_SW... | WAM cache contains stale tokens from old domain | 1) certutil -deletehellocontainer 2) dsregcmd /leave + /join if device also migrated 3) Clear WAM... | 🟢 8.5 | ADO Wiki |
| 8 | WHFB Key Trust PIN sign-in fails with That option is temporarily unavailable | Client can only access RODC, msDS-KeyCredentialLink attribute not replicated ... | Ensure client has access to writable Domain Controller (Writable DC), RODC does not support WHFB ... | 🟢 8.5 | ADO Wiki |
| 9 | Endpoint Security support boundary reference — which teams own which security features when setti... |  | Support boundaries: Defender Application Guard → Windows UEX \| Firewall → Windows Networking \| ... | 🟢 8.5 | ADO Wiki |
| 10 | WHFB provisioning fails at ADFS redirect with Error Code: 0X801C044F | ADFS configuration issue causing device registration service authentication f... | Collect ADFS logs and client User Device Registration/Admin event logs, verify ADFS DRS configura... | 🔵 7.5 | ADO Wiki |

## 快速排查路径
1. Change the SCEP certificate profile KSP setting from 'Windows Hello for Business' to 'Enroll to TPM KSP if present, otherwise Software KSP'. `[来源: OneNote]`
2. Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Identity Protection profile to enable WHfB for specific us `[来源: OneNote]`
3. WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .backup 2) Add-AppxPackage -Register to re-register 3) Ren `[来源: ADO Wiki]`
4. Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check Intune/GPO policies `[来源: ADO Wiki]`
5. Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Identity dc2016 -OperationMasterRole PDCEmulator `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/cert-whfb.md#排查流程)
