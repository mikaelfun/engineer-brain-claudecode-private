# Intune 条件访问 — 排查速查

**来源数**: 4 | **21V**: 全部适用
**条目数**: 22 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SharePoint site can be accessed via web browser but user cannot download/print/sync with error: '... | SharePoint admin enabled 'Allow limited, web-only access' for unmanaged devic... | 1. Verify SharePoint admin center > Access control > Unmanaged devices setting. 2. If 'Allow limi... | 🟢 9.0 | OneNote |
| 2 | Conditional Access policy requiring device compliance shows 'failure' in sign-in logs during init... | Expected behavior. During OOBE, device registration (DRS) and Intune MDM enro... | No action needed. Do NOT exclude Microsoft Intune Enrollment from compliance CA policy. The CA fa... | 🟢 9.0 | OneNote |
| 3 | Intune AD Connector (ODJ) 新版配置向导中管理员无法通过 Conditional Access 的 Require Hybrid Join Device 检查，登录失败 | 连接器配置向导使用 iFrame 方式登录，无法传递设备 ID，因此 Hybrid Join 设备检查必定失败（by design limitation） | 临时将安装连接器的服务器从该 Conditional Access 策略中排除，完成连接器配置后恢复策略 | 🟢 8.5 | ADO Wiki |
| 4 | Device Enrollment Manager (DEM) admin user blocked by Conditional Access even though the enrolled... | DEM users are not supported for device-based Conditional Access by design. Th... | Use a non-DEM user account to sign in. For Windows MDM-enrolled and Azure AD-joined devices, a no... | 🟢 8.5 | ADO Wiki |
| 5 | Windows PC is noncompliant but user is not blocked from accessing email/O365; CA policy appears i... | On Windows PCs, Conditional Access only blocks native email app, Office 2013 ... | Configure AAD Device Registration and AD FS to block earlier Outlook versions or all mail apps on... | 🟢 8.5 | ADO Wiki |
| 6 | 设备 Retire 后用户仍能登录 Office 应用 | Retire 操作不会吊销 access tokens，用户可继续使用现有令牌访问 Office 应用 | 使用 Conditional Access 策略限制设备访问，确保非合规/非注册设备被阻止；也可通过 Azure AD 中吊销用户 refresh tokens | 🟢 8.5 | ADO Wiki |
| 7 | 无法向 Windows 10 桌面设备发送 Device Lock 操作 | Windows 10 桌面设备不支持远程锁定功能，这是平台限制 | 这是预期行为，Windows 10 桌面设备不支持 Remote Lock；可考虑使用 Conditional Access 或 Azure AD 中禁用账户来限制访问 | 🟢 8.5 | ADO Wiki |
| 8 | Windows Backup 备份或还原时用户收到 You don't have access to this 或 You can't get there from here 错误 | 租户的 Conditional Access 策略干扰了 Windows Backup 的身份验证流程 | 参考 Microsoft 文档排查 Conditional Access 策略干扰: https://learn.microsoft.com/en-us/windows/configuratio... | 🟢 8.5 | ADO Wiki |
| 9 | macOS Platform SSO password sync fails with 'window shake' error during registration when Per-Use... | Per-User MFA blocks the Platform SSO registration flow. This does not occur w... | Disable Per-User MFA and use Conditional Access MFA instead, which suppresses MFA during enrollme... | 🟢 8.5 | ADO Wiki |
| 10 | Microsoft Intune Enrollment cloud app (AppId d4ebce55-015a-49b5-a083-c84d1797ae8c) not available ... | The Microsoft Intune Enrollment service principal is not created automaticall... | Run PowerShell: Connect-AzureAD; New-AzureADServicePrincipal -AppId d4ebce55-015a-49b5-a083-c84d1... | 🟢 8.5 | ADO Wiki |
| 11 | Android Teams devices periodically signed out - device requires re-authentication unexpectedly | CA policy enforcing sign-in frequency causes periodic sign-out. Expected beha... | Review CA policies for sign-in frequency settings. Known issue: https://learn.microsoft.com/micro... | 🟢 8.5 | ADO Wiki |
| 12 | iOS Teams login blocked by Conditional Access with error ProtectionPolicyRequired (53005). Teams ... | Teams MAM refresh token expired/revoked (due to password reset, prolonged ina... | 1) Uninstall and reinstall Teams to force fresh MAM enrollment. 2) If persists, check if password... | 🟢 8.5 | OneNote |
| 13 | When attempting to launch the Skype for Business client app, after you enter valid credentials an... | This is by design. Conditional Access policies are not supported for Skype fo... | Here are three potential workarounds to this problem:1. Disable the Azure AD and/or Intune Condit... | 🔵 7.0 | ContentIdea KB |
| 14 | Customer has created a shared mailbox (configured as a user account) and targeted it with a condi... | By design - Intune can only push an email profile for the directly enrolled u... | You can only have one mailbox managed through Intune on a device. The shared mailbox account does... | 🔵 7.0 | ContentIdea KB |
| 15 | After your tenant is migrated from the Classic portal to the Azure Intune portal, you need to rec... | This can occur if you configure Device platforms when creating the conditiona... | To resolve this problem, make sure that Device platforms is not configured when creating a condit... | 🔵 7.0 | ContentIdea KB |
| 16 | Customer has configured Intune on-premise Exchange conditional access.    The customer has some u... | This issue can occur if the user has configured Exchange active sync device r... | To find the users that are having are bypassing the Intune on-premise Exchange Conditional access... | 🔵 7.0 | ContentIdea KB |
| 17 | When using Intune on premise Exchange conditional access when you try to use a device access rule... | This is because Intune on premise Exchange conditional access does not suppor... | If you have users that need to use the Outlook App you can not target them for conditional access... | 🔵 7.0 | ContentIdea KB |
| 18 | To test if Jamf is communicating with Microsoft Intune, do the following: 1. In Jamf Pro, navigat... | N/A | If connection test fails, the customer should contact Jamf support to troubleshoot. | 🔵 7.0 | ContentIdea KB |
| 19 | To test if Jamf is communicating with Microsoft Intune, do the following: 1. In Jamf Pro, navigat... | N/A | If connection test fails, the customer should contact Jamf support to troubleshoot. | 🔵 7.0 | ContentIdea KB |
| 20 | When trying to register with Intune, the following error is seen on Mac devices enrolled into Jam... | This can occur if the you upgrade from Jamf Pro 10.7 to 10.7.1 and do not rea... | To reaffirm consent, in Jamf Pro an Azure global administrator must navigate to Settings > Global... | 🔵 7.0 | ContentIdea KB |
| 21 | Users cannot log on to Entra-joined Windows 10/11 with multi-app kiosk profile assigned. Sign-in ... | Conditional access policies requiring user interaction (MFA or TOU) conflict ... | Exclude kiosk users from conditional access policies that require user interaction (MFA, TOU). Di... | 🔵 6.5 | MS Learn |
| 22 | Enrollment Status Page (ESP) times out before sign-in screen loads when tracking Microsoft Store ... | Conflict between ESP tracking Store for Business apps and CA policy requiring... | Target Intune compliance policies to devices (not users) so compliance can be determined before l... | 🔵 6.5 | MS Learn |

## 快速排查路径
1. 1. Verify SharePoint admin center > Access control > Unmanaged devices setting. 2. If 'Allow limited, web-only access' is set, two auto-created CA pol `[来源: OneNote]`
2. No action needed. Do NOT exclude Microsoft Intune Enrollment from compliance CA policy. The CA failure log during initial enrollment is informational  `[来源: OneNote]`
3. 临时将安装连接器的服务器从该 Conditional Access 策略中排除，完成连接器配置后恢复策略 `[来源: ADO Wiki]`
4. Use a non-DEM user account to sign in. For Windows MDM-enrolled and Azure AD-joined devices, a non-DEM user can sign into the device and will be grant `[来源: ADO Wiki]`
5. Configure AAD Device Registration and AD FS to block earlier Outlook versions or all mail apps on Windows PCs. See Microsoft docs on setting up ShareP `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/conditional-access.md#排查流程)
