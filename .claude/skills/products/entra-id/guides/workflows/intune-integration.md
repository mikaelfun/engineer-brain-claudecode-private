# Entra ID Intune Integration — 排查工作流

**来源草稿**: ado-wiki-b-azure-ad-mobility-mdm-mam.md, ado-wiki-c-Intune-Configure-CA-Policy.md, ado-wiki-e-windows-laps-intune-mdm-log-analysis.md, ado-wiki-intune-identity-support-boundaries.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Azure AD Mobility (MDM and MAM) — Reference & API Guide
> 来源: ado-wiki-b-azure-ad-mobility-mdm-mam.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. New `mobilityManagementPolicy` API does not support creation and deletion of mobility apps.
- 2. Does not allow app-only permissions.
- 1. Login as Global Administrator → Azure Active Directory → Mobility (MDM and MAM)
- 2. Click **Add application** → select vendor from Mobility Apps gallery
- 3. Configure vendor-specific enrollment URLs (Discovery, Compliance, Terms of Use)

---

## Scenario 2: Intune (MDM) FAQ:
> 来源: ado-wiki-e-windows-laps-intune-mdm-log-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **How does Intune (MDM) work? (Layman terms)**
- 2. **How does Intune (MDM) process policy settings?**
- 3. **What is the frequency of the policy refresh? (Just like GPO which applies every 90 minutes)**
- 4. **Can we force refresh Intune settings (Ex: Gpupdate /force) on the client machine?**
- 5. **Like GPResult, do we have a similar HTML-based logging which would show us applied settings?**
- 6. **I manually change a registry key on the client machine. How does Intune know that I have changed it, and will it re-apply the settings back?**
- 1. **Verify if the user has a license and if the device is being managed by Intune**
- 2. **Getting a report of applied settings**
- 1. Download the SyncMLViewer tool from GitHub: [SyncMLViewer](https://github.com/okieselbach/SyncMLViewer)
- 2. Extract the ZIP file and go to the folder where you have extracted the file:

---

## Scenario 3: Intune/Azure Identity Support Boundaries
> 来源: ado-wiki-intune-identity-support-boundaries.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Ensure UPN + password** (or WHfB) authentication — SmartCard won't trigger PRT
- 2. Reboot machine twice with UPN+password
- 3. If still failing:

---
