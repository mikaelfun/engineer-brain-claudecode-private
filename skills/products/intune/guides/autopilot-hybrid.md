# Intune Autopilot Hybrid AADJ 与域加入 — 排查速查

**来源数**: 4 | **21V**: 部分适用
**条目数**: 22 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Hybrid AADJ Autopilot provisioning delays 3-4 hours; device stuck at ESP Account Setup phase wait... | The Automatic-Device-Join scheduled task under \Microsoft\Windows\Workplace J... | Workaround: Deploy Intune PowerShell script during WhiteGlove to run 'Enable-ScheduledTask -TaskP... | 🟢 9.0 | OneNote |
| 2 | BitLocker key rotation initiated from Intune portal fails with error | Missing 'Save BitLocker recovery information to Azure Active Directory' setti... | Configure Endpoint Protection profile: enable BitLocker encryption, set 'Client-driven recovery p... | 🟢 9.0 | OneNote |
| 3 | Autopilot HAADJ 部署中 ESP User Setup 阶段超时，用户无法完成 Account Setup | AD Connect 尚未将设备同步到 Azure AD 为 Hybrid Azure AD Join 状态，导致用户登录后无法获取 Azure PRT（... | 1. 确认 AD Connect 已同步设备为 Hybrid Azure AD Joined 状态；2. 等待 AD Connect 同步周期完成后再让用户登录；3. 如 ESP User Se... | 🟢 8.5 | ADO Wiki |
| 4 | Autopilot HAADJ 部署失败，设备收到错误的 Deployment Profile（如收到 Azure AD only profile 而非 Hybrid profile） | 租户中同时存在 Azure AD Join 和 Hybrid Azure AD Join 两种 Autopilot Deployment Profile，... | 1. 确保只有一个 Deployment Profile 显示 Assigned=Yes；2. 不同 join type 的 profile 不能分配给同一个 Dynamic Device Gr... | 🟢 8.5 | ADO Wiki |
| 5 | Autopilot HAADJ 部署失败，计算机名称验证错误，设备无法完成 domain join | Domain Join profile 中的计算机命名模板使用了 %SERIAL% 变量或名称超过 15 个字符（NetBIOS 限制） | 1. 移除命名模板中的 %SERIAL%；2. 确保计算机名称模板生成的名称 ≤15 个字符；3. 注意 HAADJ 的设备命名由 Domain Join device-configuratio... | 🟢 8.5 | ADO Wiki |
| 6 | 新版 Intune AD Connector 点击 Configure managed service account 时报错 0x8007202F: A constraint violatio... | 当前用户权限不足，无法在指定 OU 中创建 Managed Service Account 计算机对象，或 OU 路径中存在权限约束 | 参考 Configure New ODJ connector without Domain/Enterprise Admin account login (internal.evergreen)... | 🟢 8.5 | ADO Wiki |
| 7 | ODJ Connector enrollment 失败，报错 Element Not Found 或 CN=Managed Service Account Not Found，MSA 创建过程中出错 | Active Directory 中无法找到或创建 Managed Service Account，可能是 AD schema/权限/OU 配置问题 | 参考 internal.evergreen 文章 ca114a1e-f981-fa7e-58bb-a8bf4c21f3ed; 建议由 Directory Services 团队协助完成 AD 相... | 🟢 8.5 | ADO Wiki |
| 8 | Hybrid Autopilot 注册突然失败，客户此前正常运行的 legacy ODJ connector 停止工作（2025年7月起） | Intune 产品团队从 2025 年 7 月 1 日起分阶段禁用低于 6.2501.2000.5 版本的 legacy Intune AD (ODJ) ... | 1. 手动卸载旧版连接器，下载安装新版 (>=6.2501.2000.5); 2. 用 Kusto WindowsAutopilot_GetTenantInformationFromEither... | 🟢 8.5 | ADO Wiki |
| 9 | 同一域中存在多个 ODJ Connector（新旧版本混用），Hybrid Autopilot Join 间歇性失败 | 同一域有多个 connector 时无法控制请求路由到哪台服务器; 如果 legacy connector 被禁用而请求路由到该服务器则会失败 | 确保同一域中所有 connector 都升级到新版 (>=6.2501.2000.5)，卸载所有 legacy connector; 可先在不同服务器安装新版，禁用旧版 ODJ 服务后等待 3-... | 🟢 8.5 | ADO Wiki |
| 10 | Autopilot Hybrid AADJ deployment fails when both AzureAD-only and Hybrid deployment profiles are ... | Multiple conflicting Autopilot deployment profiles targeting the same device ... | Ensure only ONE profile is Assigned=Yes per device group. Remove conflicting profiles. | 🟢 8.5 | ADO Wiki |
| 11 | Autopilot HAADJ fails during ODJ join phase; domain join times out | Device cannot reach DC for the domain in Domain Join profile. nltest /dsgetdc... | Verify nltest /dsgetdc:{domain} works. Ensure domain name matches exactly. Check DNS and firewall. | 🟢 8.5 | ADO Wiki |
| 12 | Domain Join profile OU path invalid causing Autopilot HAADJ domain join errors | OU path uses CN= instead of OU= and DC=, or path does not match AD structure | Use OU= and DC= syntax. Verify OU path from AD Users and Computers. Ensure delegate rights on OU. | 🟢 8.5 | ADO Wiki |
| 13 | Autopilot HAADJ computer name template fails: exceeds 15 chars or uses %SERIAL% | NetBIOS 15-char limit. %SERIAL% may produce names exceeding limit. | Remove %SERIAL% and ensure names are 15 chars or fewer. | 🟢 8.5 | ADO Wiki |
| 14 | After Autopilot HAADJ with SkipUSEResp on non-Federated tenant, user sees Fix your Account message | Non-Federated tenants rely on AAD Connect sync (30-40 min) to sync device fro... | Wait 30-40 min for auto-resolution or have user re-auth. Federated tenants unaffected. | 🟢 8.5 | ADO Wiki |
| 15 | Updated ODJ Connector install fails with WebView2 permission error | Current user lacks RW permission on ODJConnectorEnrollmentWizard.exe.webview2... | Grant RW permission to the webview2 folder. Ensure WebView2 runtime is installed. | 🟢 8.5 | ADO Wiki |
| 16 | Single-app/Multi-app Kiosk profile 在 Hybrid Azure AD Joined 设备上部署失败，报 AssignedAccessConfiguration... | Kiosk profile 在 Hybrid Azure AD Joined 设备上存在已知兼容性问题 | 参考内部文档: https://internal.evergreen.microsoft.com/en-us/topic/bdacb094-82fa-f990-dbcb-5d0c0075efeb | 🟢 8.5 | ADO Wiki |
| 17 | Hybrid AADJ device user cannot get PRT (AzureAdPrt: NO), WHFB/CA/SSO all fail | User UPN prefix changed after device registration, CloudAP plugin uses cached... | Fixed in Windows 10 RS4 (1803) - CloudAP uses login credentials instead of cache. For older versi... | 🟢 8.5 | ADO Wiki |
| 18 | AP-DP: User reaches desktop without required applications installed during Autopilot Device Prepa... | Conflict between AP-DP User account type set to Standard user and Entra ID lo... | Workaround 1: If Entra ID local admin = Selected/None, set AP-DP User account type to Administrat... | 🔵 7.5 | ADO Wiki |
| 19 | Autopilot HAADJ fails with error 80070774 when Assigned User feature is used | Assigned User feature causes HAADJ failure with error 80070774 | See KB https://internal.evergreen.microsoft.com/en-us/help/4469771. Avoid Assigned User for HAADJ. | 🔵 7.5 | ADO Wiki |
| 20 | Autopilot error 80070774 in Hybrid Entra join scenario. Device times out during initial sign-in s... | Assign user feature is configured in the Autopilot profile for a Hybrid Entra... | Unassign user from the Autopilot device in Intune admin center. Or check ODJ Connector Service lo... | 🔵 7.5 | MS Learn |
| 21 | Hybrid AADJ Windows 10 device will not auto-enroll with the Intune service.The GPO for auto-mdm e... | In this specific case, the computer in question had the ConfigMgrEnrollment r... | Backed up the registry and deleted the enrollment key (under "\HKEY_LOCAL_MACHINE\SOFTWARE\Micros... | 🔵 7.0 | ContentIdea KB |
| 22 | Windows HAADJ device shows Intune sync error 0x80190190 for all logon users. dsregcmd shows valid... | Non-primary logon users on the device do not have Intune licenses assigned. W... | Assign Intune licenses to all users who log on to the device, then trigger sync again. Use Kusto ... | 🔵 6.5 | OneNote |

## 快速排查路径
1. Workaround: Deploy Intune PowerShell script during WhiteGlove to run 'Enable-ScheduledTask -TaskPath "\Microsoft\Windows\Workplace Join" -TaskName "Au `[来源: OneNote]`
2. Configure Endpoint Protection profile: enable BitLocker encryption, set 'Client-driven recovery password rotation', ensure 'Save BitLocker recovery in `[来源: OneNote]`
3. 1. 确认 AD Connect 已同步设备为 Hybrid Azure AD Joined 状态；2. 等待 AD Connect 同步周期完成后再让用户登录；3. 如 ESP User Setup 中 Account Setup 已启用，确保同步时间窗口足够；4. 用户需使用 domain\us `[来源: ADO Wiki]`
4. 1. 确保只有一个 Deployment Profile 显示 Assigned=Yes；2. 不同 join type 的 profile 不能分配给同一个 Dynamic Device Group；3. 删除或取消分配多余的 profile `[来源: ADO Wiki]`
5. 1. 移除命名模板中的 %SERIAL%；2. 确保计算机名称模板生成的名称 ≤15 个字符；3. 注意 HAADJ 的设备命名由 Domain Join device-configuration profile 控制（非 Deployment Profile 中的 Apply device nam `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/autopilot-hybrid.md#排查流程)
