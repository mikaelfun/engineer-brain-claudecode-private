# Intune Windows Kiosk 模式 — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 3 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Kiosk profile deployment shows error 'No Mapping Between Account Names and Security IDs was Done'... | The user account specified in the kiosk profile logon type (Local user or Azu... | Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. ... | 🟢 9.0 | OneNote |
| 2 | Specified application does not appear in kiosk mode start menu despite being configured in the ki... | The .lnk shortcut file referenced in the kiosk XML start layout does not exis... | 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start M... | 🟢 9.0 | OneNote |
| 3 | Windows 10 Kiosk mode with 'Local User Account' logon type fails with error 'No mapping between a... | When 'Local User Account' is selected as kiosk logon type, Windows tries to m... | Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'K... | 🟢 9.0 | OneNote |

## 快速排查路径
1. Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. For local user: create the account first. For Azure A `[来源: OneNote]`
2. 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\); 2) Test by navigating to lnk path as  `[来源: OneNote]`
3. Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'Kiosk' account automatically on the device and logs in `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/windows-kiosk.md#排查流程)
