# Intune 设备操作（擦除/锁定/重置等） — 综合排查指南

**条目数**: 16 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-Device-Actions-Troubleshooting.md, ado-wiki-Device-Actions.md, onenote-remote-action-windows.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (9 条)

- **solution_conflict** (high): intune-ado-wiki-126 vs intune-contentidea-kb-530 — version_superseded: Entry intune-ado-wiki-126 contains deprecated/EOL language
- **solution_conflict** (high): intune-ado-wiki-198 vs intune-contentidea-kb-197 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-530 vs intune-mslearn-141 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-194 vs intune-contentidea-kb-530 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-142 vs intune-mslearn-140 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Device Actions Troubleshooting
> 来源: ADO Wiki — [ado-wiki-Device-Actions-Troubleshooting.md](../drafts/ado-wiki-Device-Actions-Troubleshooting.md)

**Device Actions Troubleshooting — Detailed Kusto Guide**
**Step 1 - Confirm the Graph call was made**
```kusto
```
**Step 2 - Track the timing and result of the action being issued**
```kusto
```
- Col2: `Microsoft.Intune/RemoteTasks/RebootNow`
- Col3: `Issuing action RebootNow agaist class: Device_Reboot method: RebootNow`
- EventUniqueName: `RebootNow` or `InvokeActionAsync_deviceIntuneDeviceId_RebootNow`
- Col2: `4` (Done)

**Step 3 - See transactional communication and result**
```kusto
```

**Alternative Starting Point (when device/action/timestamp unknown)**
```kusto
```

**Device Action API Enumerations**

**ActionName Enum**

**ActionState Enum**

### Phase 2: Device Actions
> 来源: ADO Wiki — [ado-wiki-Device-Actions.md](../drafts/ado-wiki-Device-Actions.md)

**Device Actions Troubleshooting Guide**
**Available Actions by Platform**
- Remote Lock, Reset Passcode, Restart, Rename, Retire, Wipe, Delete, Sync
- Windows-only: Autopilot Reset, BitLocker Key Rotation, Collect Diagnostics, Fresh Start, Full/Quick Scan, Pause Config Refresh, PIN Reset, LAPS Rotate
- iOS/macOS: Disable Activation Lock, Lost Mode, FileVault, Recovery Lock Rotate
- Android/iOS: Send Custom Notifications

**How Device Actions Work**

**Troubleshooting Flow**
1. Confirm device is online and syncing with Intune
2. Verify action was issued via Kusto:
```kusto
```
3. Confirm action reached device:
```kusto
```

**Common Issues**

**Wipe Pending Indefinitely**

**Reset Passcode Not Supported (Android 8.0+ Work Profile)**

**Reset Passcode Greyed Out (Android Device Admin)**

**Can't Restart After Wipe (Windows)**

**Activation Lock Code Not Showing (iOS)**

**Apps Not Removed After Retire**

**Sign Back Into Office After Retire**

**Wipe Greyed Out (Android Work Profile)**

**Recovery Lock (macOS)**
- Requires macOS 11.5+ with Apple Silicon (not Intel)
- Settings Catalog: EnableRecoveryLockPassword + RecoveryLockPasswordRotationSchedule
- View/rotate password: Devices > device > Monitor > Passwords and keys
- Kusto validation queries available for policy application and command delivery

**W365 vs Intune Ownership**

**Scoping Questions**
1. Bulk or single device? 2. Platform? 3. Which action? 4. Followed MS troubleshooting? 5. Device name/ID? 6. UPN? 7. Audit log access? 8. Time action sent? 9. Screenshot of status?

**Support Boundaries**
- Wipe: If device bricked after successful wipe → contact OEM or Windows D&D team
- TeamViewer: License/app issues → TeamViewer Support
- Fresh Start: Stuck or not removing OEM apps → Windows team

### Phase 3: Remote Action Windows
> 来源: OneNote — [onenote-remote-action-windows.md](../drafts/onenote-remote-action-windows.md)

**Remote Action for Windows - Comparison Guide**
**Action Comparison Table**
**Key Differences**
- **Autopilot Reset**: Full device reset while preserving AAD join and MDM enrollment. Ideal for re-provisioning devices without re-enrollment.
- **Wipe**: Most destructive - removes everything but gives options to retain AAD join and MDM enrollment. Retains OEM apps.
- **Fresh Start**: Similar to Wipe but also updates the OS and retains Windows Store apps instead of OEM apps.
- **Retire**: Lightest touch - only removes company data/apps. Does NOT retain AAD join or MDM enrollment. Used when a device leaves management.

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Device unexpectedly disappears from Intune device list. Customer did not manually retire or wipe ... | Intune device cleanup rule (configured in Intune > Devices > Device cleanup r... | Confirm auto-removal in Kusto: `IntuneEvent \| where ComponentName == "StatelessDeviceOverflowSer... | 🟢 9.0 | OneNote |
| 2 | Device Wipe 操作在 Intune 门户显示 Pending 状态持续不变，但设备实际已被擦除 | 设备在重置开始前未能将状态报告回 Intune 服务，这是预期行为（时序问题） | 确认设备已成功擦除后，从 Intune 服务中手动删除该设备记录 | 🟢 8.5 | ADO Wiki |
| 3 | Android Device Admin 注册设备的 Reset Passcode 操作灰显不可用 | Google 在 Android 7.0+ 的 Device Admin API 中移除了密码重置功能（防勒索软件措施） | 这是 Google 的平台限制，Android 7.0+ Device Admin 设备无法通过 MDM 重置密码；建议迁移到 Android Enterprise 管理模式 | 🟢 8.5 | ADO Wiki |
| 4 | iOS/iPadOS 设备 Disable Activation Lock 代码不显示或操作灰显 | (1) 代码已过期被服务清除（有效期 15 天）；(2) 设备未通过 Device Restriction Policy 设为 Supervised 模式... | 1. 确保设备为 Supervised 模式且启用了 Activation Lock 限制策略；2. 通过 Graph API 检查代码：GET /beta/deviceManagement/m... | 🟢 8.5 | ADO Wiki |
| 5 | 点击 Disable Activation Lock 操作后设备上没有任何变化 | 这是预期行为——点击该操作后 Intune 向 Apple 请求更新的绕过代码，管理员需手动在设备 Activation Lock 屏幕输入该代码 | 1. 点击 Disable Activation Lock 后复制绕过代码；2. 在设备 Activation Lock 界面的密码字段手动输入代码；3. 代码有效期 15 天，需在 Wipe ... | 🟢 8.5 | ADO Wiki |
| 6 | Android Enterprise Work Profile 设备的 Wipe 操作灰显不可用 | Google 不允许 MDM Provider 对 Work Profile 设备执行 Factory Reset，这是平台限制 | 这是 Google 的预期限制，Work Profile 设备无法通过 Intune 执行 Wipe；如需完整擦除建议使用 Fully Managed 管理模式 | 🟢 8.5 | ADO Wiki |
| 7 | 对离线设备发起 Retire/Wipe 后设备一直处于 Pending 状态 | 设备离线无法接收 MDM 命令，需等待设备重新联网并与 Intune 服务同步 | 设备在 MDM 证书过期前上线即会执行操作；MDM 证书有效期 1 年（自动续期）；若设备在证书过期前未上线则无法同步；证书过期 180 天后设备会自动从 Azure 门户移除 | 🟢 8.5 | ADO Wiki |
| 8 | When attempting to enroll an iOS device in Microsoft Intune, the enrollment process fails with th... | This can occur if the device had been previously enrolled by another user and... | To resolve this problem, you first need to find the previous device ID assigned to the device and... | 🔵 7.0 | ContentIdea KB |
| 9 | When iOS Device is unassigned from DEP Portal but after DEP Sync, Delete action for device is gre... | This is a code fault where if the table &quot;MDMCorpOwnedDevices&quot; has b... | There are two options for a work around on this problem for the customer while they wait for the ... | 🔵 7.0 | ContentIdea KB |
| 10 | After configuring an iOS device in DEP to be supervised and to allow Activation Lock Bypass, when... | This is a known issue per 117062093452694, 117021415317116, 117030315402861 a... | To resolve this problem, upgrade your Configuration Manager environment to the latest release, th... | 🔵 7.0 | ContentIdea KB |
| 11 | When viewing the status of Device Actions in the Azure Intune portal, some actions show a UPN in ... | This can occur if the Azure user account used to initiated the device action ... | Once this is done you can�t go back and fix it, because even if you add a license to that user yo... | 🔵 7.0 | ContentIdea KB |
| 12 | When viewing the Audit Logs under Devices Actions in the Azure Intune portal, the INITIATED BY (A... | This can occur if the Azure user account used to initiated the device action ... | Once this is done you can�t go back and fix it, because even if you add a license to that user yo... | 🔵 7.0 | ContentIdea KB |
| 13 | When attempting to launch Outlook on iOS devices, the following message is displayed:Warning You ... | This can occur if the certificate is nearing expiration. Typically, these cer... | Normally, once the CP app is opened, the certificate will renew and the user will then be able to... | 🔵 7.0 | ContentIdea KB |
| 14 | When sending a remote lock to MAC OS X devices enrolled into Intune, the expectation is that the ... | This is a known issue with the current release of Intune. | To work around this issue, look up the affected device ID in Rave or Graph, then retrieve the PIN... | 🔵 7.0 | ContentIdea KB |
| 15 | Reset Passcode action greyed out on Android Device Admin enrolled device | Google removed passcode reset from Device Admin API for Android 7.0+ as ranso... | Platform limitation by Google. Consider migrating to Android Enterprise management. | 🔵 6.5 | MS Learn |
| 16 | Wipe or Retire action shows as Pending indefinitely in Intune console | Devices do not always report status back to Intune before reset/removal starts | Verify action succeeded on device then manually delete device record from Intune. | 🔵 5.5 | MS Learn |
