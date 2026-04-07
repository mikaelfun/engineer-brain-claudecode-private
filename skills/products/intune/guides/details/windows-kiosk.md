# Intune Windows Kiosk 模式 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: onenote-windows-kiosk-mode-guide.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Windows Kiosk Mode Guide
> 来源: OneNote — [onenote-windows-kiosk-mode-guide.md](../drafts/onenote-windows-kiosk-mode-guide.md)

**Windows Kiosk Mode - Configuration & Troubleshooting Guide**
**Deployment Methods**
**Option 1: Intune Built-in Kiosk Profile**
- Create configuration profile > Kiosk (Preview) > Windows 10 and later
- Add UWP, Windows Store, or Win32 apps
- For multi-app kiosk, import a start menu XML layout
- Only supported on Windows 10+ (Pro/Enterprise/Education) 1803+

**Option 2: Custom OMA-URI**
- OMA-URI: `./Device/Vendor/MSFT/AssignedAccess/Configuration`
- Data Type: String (XML payload)
- More flexibility for customized settings

**Option 3: PowerShell Script**
- Deploy XML via PowerShell for maximum customization
- Can create shortcuts and configure auto-logon for cloud accounts

**Collecting App AUMIDs**
```powershell
```

**User Logon Types (Multi-App Kiosk)**
- **Auto-logon**: System creates a local account automatically
- **Local user**: Must pre-exist on device, else "No Mapping Between Account Names and Security IDs" error
- **Azure AD user**: Must have previously signed in to device

**Start Layout**
- **Default Layout**: System auto-generates icons for allowed apps
- **Alternative Layout (XML)**: Admin specifies .lnk file paths for start menu icons
  - Important: Kiosk user must have read access to .lnk file paths
  - If .lnk is missing at specified path, app silently omitted from start menu

**Common Issues**

**Kiosk auto-logon breaks with password policy**
- Cause: Password policy creates EAS registry at `HKLM\SYSTEM\CurrentControlSet\Control\EAS`
- Fix: Remove password policy from kiosk devices, delete EAS registry, re-enroll

**PowerShell scripts don't execute on kiosk**
- Cause: IME and PowerShell not in allowed apps list
- Fix: Add IME AppUserModelId + PowerShell paths to XML
... (详见原始草稿)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Kiosk profile deployment shows error 'No Mapping Between Account Names and Security IDs was Done'... | The user account specified in the kiosk profile logon type (Local user or Azu... | Ensure the specified kiosk user account exists on the device before deploying the kiosk profile. ... | 🟢 9.0 | OneNote |
| 2 | Specified application does not appear in kiosk mode start menu despite being configured in the ki... | The .lnk shortcut file referenced in the kiosk XML start layout does not exis... | 1) Verify .lnk file exists at exact path in XML (e.g. %ALLUSERSPROFILE%\Microsoft\Windows\Start M... | 🟢 9.0 | OneNote |
| 3 | Windows 10 Kiosk mode with 'Local User Account' logon type fails with error 'No mapping between a... | When 'Local User Account' is selected as kiosk logon type, Windows tries to m... | Use 'Auto-logon' as the Logon type instead of 'Local User Account'. Auto-logon creates a local 'K... | 🟢 9.0 | OneNote |
