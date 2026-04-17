# Intune Windows Update / Update Rings / WUFB — 排查速查

**来源数**: 3 | **21V**: 部分适用
**条目数**: 11 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Update Ring policy only deploys B (Patch Tuesday) releases; C and D preview releases are ... | By design, Windows Update Ring policy in Intune only receives B releases (Pat... | This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary securi... | 🟢 9.0 | OneNote |
| 2 | Quality update rollback via Intune WUfB Ring fails silently; SyncML error 0x80070490 (NotFound) f... | Rollback CSP requires 3 conditions: (1) WUfB Connected, (2) Device in Paused ... | 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpda... | 🟢 9.0 | OneNote |
| 3 | Windows Update scan fails with HTTP 407 Proxy Authentication Required when connecting to fe3cr.de... | Network proxy requires negotiate authentication but Windows Update service (S... | Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or... | 🟢 9.0 | OneNote |
| 4 | Intune Update Ring shows device Failed in End User Update Status but device itself shows Up to da... | Windows Update service regulation blocks download of applicable update; devic... | Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up ... | 🟢 9.0 | OneNote |
| 5 | WUFB Feature Update policy deploys wrong OS version; devices get different version than specified... | Multiple causes: device scanning WSUS instead of Microsoft Update; device enr... | Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUS... | 🟢 9.0 | OneNote |
| 6 | Windows Update Ring configured with Feature update delay of 365 days, expected client to receive ... | The 'Enable Windows 11 latest' toggle was enabled in the update ring, causing... | 1) Disable 'Enable Windows 11 latest' toggle in the update ring; 2) Verify all WU registry keys (... | 🟢 8.0 | OneNote |
| 7 | Intune Windows Feature & Quality Update 策略在 21V 不可用 | 2024.6 Dev team 确认无计划支持；DCR-M365-4825 已提交 | 不支持；改用 Windows Update Ring 或 WSUS 管理 Windows 更新 | 🔵 7.0 | 21V Gap |
| 8 | After configuring and assigning an Update Ring policy to a group of Windows 10 Enterprise compute... | This can occur if Automatic Updates have been disabled on the client. This wi... | To verify when the Windows PC last checked for updates, go to System Settings -> Update & Securit... | 🔵 7.0 | ContentIdea KB |
| 9 |  | **Collecting log filesRequesting the customer to send the Windows Update log ... | Delete | 🔵 7.0 | ContentIdea KB |
| 10 | On computers running Windows 10 build 1709 or later, if they are configured to receive updates fr... | This can occur if the Microsoft Account Sign In Assistant (MSA or wlidsvc) is... | To resolve this issue, reset the MSA service to the default StartType of Manual.In Intune we have... | 🔵 7.0 | ContentIdea KB |
| 11 | Windows Update for Business (WUfB) Feature Update policies and Quality Update rings configured in... | Windows Feature & Quality Update management through Intune is not available i... | Use WSUS (Windows Server Update Services) for all Windows update management in 21v environments. ... | 🔵 7.0 | OneNote |

## 快速排查路径
1. This is expected behavior. Inform customer: (1) B releases (Patch Tuesday) are the primary security updates and are the only regular releases distribu `[来源: OneNote]`
2. 1) Verify all 3 rollback prerequisites; 2) Check MDM event log for CSP errors on PauseQualityUpdates and Rollback/QualityUpdate; 3) Check registry Pol `[来源: OneNote]`
3. Configure proxy to allow unauthenticated access to WU endpoints (*.delivery.mp.microsoft.com); or configure WinHTTP proxy for SYSTEM context `[来源: OneNote]`
4. Kusto IntuneEvent (ComponentName==ProcessWindowsUpdateStatus) to get FailedUpdates GUID; look up in WU Catalog; check WindowsUpdate.log for service re `[来源: OneNote]`
5. Check HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate for WSUS config; verify IsDefaultAUService via PowerShell; ensure single feature update d `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/windows-update.md#排查流程)
