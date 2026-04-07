# Intune Windows 注册与 Auto-Enrollment — 排查速查

**来源数**: 3 | **21V**: 部分适用
**条目数**: 11 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Microsoft Intune Enrollment service principal (AppId d4ebce55-015a-49b5-a083-c84d1797ae8c) missin... | The 'Microsoft Intune Enrollment' enterprise application was accidentally del... | 1) Go to Azure portal > Azure Active Directory > MDM > select 'Microsoft Intune Enrollment' > Del... | 🟢 9.0 | OneNote |
| 2 | Windows enrollment fails with error 8018000a The device is already enrolled. Another user has alr... | A different user account has already enrolled the device in Intune or joined ... | Sign in with the other account that enrolled/joined the device. Go to Settings > Accounts > Work ... | 🔵 7.5 | MS Learn |
| 3 | Auto MDM Enroll: Failed with error 0x8018002b via Group Policy. Event ID 76 logged in DeviceManag... | UPN contains unverified or non-routable domain suffix (e.g., .local), or MDM ... | For UPN issue: change user UPN suffix to a valid verified domain in AD Users and Computers, then ... | 🔵 7.5 | MS Learn |
| 4 | Windows 10 GP-based auto-enrollment fails with 0x80180002b. dsregcmd /status shows AzureAdPrt=NO ... | Device previously joined to different Entra tenant without proper unjoin. Sta... | dsregcmd /leave, delete device in Entra, unjoin from AD, delete device from DC, rejoin AD, delta ... | 🔵 7.5 | MS Learn |
| 5 | After configuring OOBE enrollment for a Surface Hub device, enrollment appears to succeed althoug... | Surface Hubs cannot be managed via Auto Enrollment/Azure AD joins. The proces... | To resolve this problem, be sure the Surface Hub users are not being targeted for being managed b... | 🔵 7.0 | ContentIdea KB |
| 6 | When attempting to join a Windows 10 PC to Azure Active Directory, the join fails with error: Som... | This can occur if both of the following conditions exist: MDM auto-enrollment... | Either disable MDM auto-enrollment in Azure, or uninstall the PC agent or SCCM client agent. Once... | 🔵 7.0 | ContentIdea KB |
| 7 | After configuring hybrid Azure AD per https://docs.microsoft.com/en-us/azure/active-directory/dev... | This can occur for two reasons:1. The GPO for auto enrollment per https://doc... | To work around this problem, either upgrade the client PCs to Windows 10 build 1709 and implement... | 🔵 7.0 | ContentIdea KB |
| 8 | When attempting to enroll a Windows 10 device into hybrid mobile device management with SCCM and ... | This error will occur if Windows enrollment has been disabled for the organiz... | To resolve this problem, enable Windows enrollment as detailed below:    In your SCCM console, go... | 🔵 7.0 | ContentIdea KB |
| 9 | After configuring a Device Restriction policy that sets "Manual Unenrollment" to "Block" per the ... | This can occur if the Windows computer is Azure AD joined and MDM auto-enroll... | If you wish you use this policy setting, you will need to either disable auto-enrollment and/or m... | 🔵 7.0 | ContentIdea KB |
| 10 | GPO-based auto-enrollment into Intune fails for co-managed hybrid AAD joined devices; dsregcmd /s... | User UPN suffix in Active Directory is non-routable (e.g., .local domain), pr... | In Active Directory Users and Computers open user properties Account tab, modify UPN suffix from ... | 🔵 7.0 | OneNote |
| 11 | Co-management: Device sync fails after auto-enrollment. Error 0xcaa2000c interaction_required. | MFA or CA policies requiring MFA applied to all cloud apps block user token. | Disable per-user MFA, use Trusted IPs, or exclude Intune app from CA policies requiring MFA. | 🔵 6.5 | MS Learn |

## 快速排查路径
1. 1) Go to Azure portal > Azure Active Directory > MDM > select 'Microsoft Intune Enrollment' > Delete. 2) Open admin PowerShell: Connect-AzureAD, then  `[来源: OneNote]`
2. Sign in with the other account that enrolled/joined the device. Go to Settings > Accounts > Work Access and remove the work or school connection. Sign `[来源: MS Learn]`
3. For UPN issue: change user UPN suffix to a valid verified domain in AD Users and Computers, then force delta sync (Start-ADSyncSyncCycle -PolicyType D `[来源: MS Learn]`
4. dsregcmd /leave, delete device in Entra, unjoin from AD, delete device from DC, rejoin AD, delta sync, verify AzureAdJoined/DomainJoined/AzureAdPrt=YE `[来源: MS Learn]`
5. To resolve this problem, be sure the Surface Hub users are not being targeted for being managed by Intune under Windows Azure -> Microsoft Intune -> C `[来源: ContentIdea KB]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/enrollment-windows.md#排查流程)
