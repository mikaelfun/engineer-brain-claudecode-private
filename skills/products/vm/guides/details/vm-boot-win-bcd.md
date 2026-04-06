# VM Windows BCD / Boot Loader 错误 — 综合排查指南

**条目数**: 14 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [mslearn-bootmgr-missing-troubleshoot.md]
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 错误代码分类与通用准备
> 来源: [MS Learn](多篇) + [MCVKB/4.4, 4.5](onenote)

**通用步骤**: 所有 BCD/Boot Loader 问题的排查都从创建 Repair VM 开始。

**操作前准备**：
1. **创建 Repair VM**（使用 VM Repair Commands steps 1-3）
2. **附加故障 OS 磁盘**到 Repair VM
3. **识别磁盘分区**：
   - **System Reserved / Boot 分区**（~300-500MB，含 `\Boot` 文件夹）→ 记为 **BCD 盘符**
   - **Windows 分区**（含 `\Windows` 目录）→ 记为 **WIN 盘符**
   - Gen2 VM: EFI 分区含 `\EFI\Microsoft\Boot\BCD`

**判断逻辑**：
| 错误信息 / 代码 | 含义 | 后续动作 |
|----------------|------|---------|
| `BOOTMGR is missing` | 引导管理器缺失 | → Phase 2a |
| `0xC000000F` — winload.exe/BCD/driver missing | BCD 引用错误或驱动缺失 | → Phase 2b |
| `0xC000000E` — file missing or contains errors | BCD 设备引用不存在 | → Phase 2b |
| `0xC0000034` — \\Boot\\BCD recovery needed | BCD 损坏需重建 | → Phase 2c |
| `0xC000014C` — registry file missing/errors | 注册表 hive 损坏 | → Phase 2d |
| `0xC0000428` — digital signature verification | SHA-2 签名 / 预览镜像过期 | → Phase 2e |
| `A disk read error occurred` | 磁盘结构损坏 | → Phase 2f |
| `INACCESSIBLE_BOOT_DEVICE` / `Reboot and Select` | BCD 损坏或分区不活动 | → Phase 2f |
| `An operating system wasn't found` | 系统分区未标记 Active | → Phase 2f |
| BitLocker recovery key 提示 | BEK 无法从 Key Vault 获取 | → Phase 2g |
| Registry hive corrupted | 注册表文件损坏 | → Phase 2d |

### Phase 2a: BOOTMGR is missing
> 来源: [mslearn-bootmgr-missing-troubleshoot.md] + [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/os-bootmgr-missing) `[vm-450]`

**可能原因**: (1) 系统分区未标记 Active (2) BCD 缺少 Windows 分区引用 (3) 勒索软件攻击

**修复步骤**：

**Step 1: 验证分区是否 Active（仅 Gen1）**
Gen2 VM 使用 UEFI，无 Active partition 概念。
```cmd
diskpart
list disk
sel disk 1
list partition
sel partition 1
detail partition
active          REM 如果不是 Active
exit
```

**Step 2: 重建 Boot Record**
```cmd
bcdboot <WIN>:\Windows /S <WIN>:
```

**Step 3: 修复 BCD 引用**
```cmd
chkdsk <DRIVE>: /f
```

枚举 BCD：
```cmd
REM Gen1:
bcdedit /store <BCD>:\boot\bcd /enum
REM Gen2:
bcdedit /store <EFI>:\EFI\Microsoft\boot\bcd /enum
```

修复 BCD 条目（Gen1 示例）：
```cmd
bcdedit /store <BCD>:\boot\bcd /set {bootmgr} device partition=<BCD>:
bcdedit /store <BCD>:\boot\bcd /set {bootmgr} integrityservices enable
bcdedit /store <BCD>:\boot\bcd /set {<ID>} device partition=<WIN>:
bcdedit /store <BCD>:\boot\bcd /set {<ID>} integrityservices enable
bcdedit /store <BCD>:\boot\bcd /set {<ID>} recoveryenabled Off
bcdedit /store <BCD>:\boot\bcd /set {<ID>} osdevice partition=<WIN>:
bcdedit /store <BCD>:\boot\bcd /set {<ID>} bootstatuspolicy IgnoreAllFailures
```

> 单分区 VHD 时尝试将 `partition=<drive>:` 替换为 `boot`

**Step 4: 检查勒索软件**
1. Explorer 显示隐藏文件
2. 查找磁盘根目录下的 `.txt` 勒索信息
3. 确认勒索 → 从备份还原或重建 VM

**Step 5: 重建 VM**（VM Repair Commands step 5）

> ✅ 21V 适用 — 所有步骤使用离线磁盘修复，适用于任何云环境

`[结论: 🟢 8/10 — MS Learn 官方文档，草稿融合，步骤完整]`

### Phase 2b: 0xC000000F / 0xC000000E — BCD 引用错误
> 来源: [MS Learn](多篇) + [MCVKB/4.4](onenote) `[vm-043, vm-431, vm-439]`

**通用修复**（适用于所有 BCD 引用类错误）：

1. 附加 OS 磁盘到 Repair VM
2. 识别 System Reserved（Active 分区 = BCD 位置，如 H:）和 OS 分区（如 I:）
3. 枚举 BCD 查看当前配置：
   ```cmd
   bcdedit /store H:\boot\bcd /enum
   ```
4. 修复 `{default}` 条目：
   ```cmd
   bcdedit /store H:\boot\bcd /set {default} device partition=I:
   bcdedit /store H:\boot\bcd /set {default} osdevice partition=I:
   bcdedit /store H:\boot\bcd /set {default} integrityservices enable
   bcdedit /store H:\boot\bcd /set {default} recoveryenabled Off
   bcdedit /store H:\boot\bcd /set {default} bootstatuspolicy IgnoreAllFailures
   bcdedit /store H:\boot\bcd /set {bootmgr} integrityservices enable
   ```
5. 若缺少 driver .sys → `chkdsk /F` 后从 WinSxS 替换

**Gen1 vs Gen2 差异**：
| 项目 | Gen1 (BIOS/MBR) | Gen2 (UEFI/GPT) |
|------|-----------------|------------------|
| BCD 路径 | `<drive>:\boot\bcd` | `<EFI>:\EFI\Microsoft\boot\bcd` |
| Active 分区 | 需要设置 | 不适用 |
| bcdboot 命令 | `bcdboot <WIN>:\Windows /S <WIN>:` | `bcdboot <WIN>:\Windows /S <EFI>: /F UEFI` |

> **关键**: System Reserved 分区 = Active 分区 = BCD 所在位置；OS 分区 = `\Windows` 目录所在。

`[结论: 🟢 9/10 — OneNote 实战 + MS Learn 多篇交叉验证，BCD 修复核心方法论]`

### Phase 2c: 0xC0000034 — BCD 完全损坏需重建
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000034) `[vm-435]`

**症状**: `\Boot\BCD` 需要恢复工具。

**修复**: 使用嵌套虚拟化或附加磁盘，完全重建 BCD：
```cmd
bcdedit /create {bootmgr}
bcdedit /set {bootmgr} description "Windows Boot Manager"
bcdedit /set {bootmgr} locale en-US
bcdedit /set {bootmgr} inherit {globalsettings}
bcdedit /set {bootmgr} displayorder {default}
bcdedit /set {bootmgr} timeout 30
```

`[结论: 🔵 7.5/10 — MS Learn 单源，步骤明确]`

### Phase 2d: 0xC000014C / Registry Hive 损坏
> 来源: [MS Learn](多篇) `[vm-360, vm-434]`

**修复方案 1: 从 regback 还原** `[vm-434]`
```cmd
REM 在 Repair VM 上操作
REM 1. 备份当前 config
copy <drive>:\windows\system32\config\SYSTEM <drive>:\windows\system32\config\SYSTEM.bak
REM 2. 从 regback 还原
copy <drive>:\windows\system32\config\regback\SYSTEM <drive>:\windows\system32\config\SYSTEM
```

**修复方案 2: Load Hive 修复** `[vm-360]`
1. 删除 VM（保留 OS 磁盘）
2. 附加到 Repair VM
3. 导航到 `\Windows\System32\config`，备份所有文件
4. `regedit` → HKEY_USERS → File > Load Hive → 加载 SYSTEM
5. 成功加载 → hive 只是未正常关闭 → Unload 即修复
6. 加载失败 → 联系 Azure Support
7. 分离磁盘并重建 VM

`[结论: 🟢 8/10 — MS Learn 双源验证，两种修复路径]`

### Phase 2e: 0xC0000428 — 数字签名验证失败
> 来源: [MCVKB/4.5](onenote) + [MS Learn] `[vm-044, vm-425]`

**场景 1: Windows Server 2008 R2 SHA-2 补丁问题** `[vm-044]`

**根因**: KB4540688/KB4541500 (December 2019+) 安装后，bootmgr 仍为 SHA-1 签名，winload.exe 升级为 SHA-2 → 签名不匹配。前置补丁 KB4474419 (September 2019) 未安装。

**修复**：
1. 挂载故障 OS 磁盘到 helper VM（推荐嵌套 Hyper-V）
2. Online 磁盘，找到 System Reserved 盘符（如 E:）
3. 临时绕过签名检查：
   ```cmd
   bcdedit /store E:\boot\bcd /set {default} nointegritychecks ON
   ```
4. Offline 磁盘 → 嵌套 Hyper-V 启动（~30 分钟 rollback）
5. 回复签名检查：
   ```cmd
   bcdedit /set {default} nointegritychecks OFF
   ```

**预防**: 先安装 KB4474419 (September 2019)，重启，再安装 December 2019+ 补丁。

> ⚠️ F8 在 2008R2 Azure VM 中**不工作**

**场景 2: 预览/试用镜像过期** `[vm-425]`

**根因**: VM 使用预览镜像，超过有效期（如 180 天）后无法启动。

**解决**: 预览镜像过期**不可恢复**。部署新 VM 使用 RTM 镜像，迁移数据。

`[结论: 🟢 9/10 — OneNote 实战经验(场景1) + MS Learn(场景2)，两种不同根因完整覆盖]`

### Phase 2f: 通用磁盘/分区问题
> 来源: [MS Learn](多篇) `[vm-363, vm-408, vm-442, vm-452]`

所有这些错误的核心排查路径一致：

1. **先尝试**: Stop/deallocate → Start VM
2. **持续故障**: 附加 OS 磁盘到 Repair VM
3. **检查分区 Active 状态**（Gen1）:
   ```cmd
   diskpart
   sel disk 1
   list partition
   sel partition 1
   detail partition
   active           REM 如果不是 Active
   ```
4. **重建 Boot Record**:
   ```cmd
   bcdboot <WIN>:\Windows /S <WIN>:
   ```
5. **修复 BCD**:
   ```cmd
   bcdedit /store <BCD>:\boot\bcd /set {default} device partition=<WIN>:
   bcdedit /store <BCD>:\boot\bcd /set {default} osdevice partition=<WIN>:
   bcdedit /store <BCD>:\boot\bcd /set {default} integrityservices enable
   bcdedit /store <BCD>:\boot\bcd /set {default} bootstatuspolicy IgnoreAllFailures
   ```
6. **磁盘检查**: `chkdsk <drive>: /f`
7. **重建 VM**

> ✅ 21V 适用 — 全部步骤使用离线修复

`[结论: 🟢 8.5/10 — MS Learn 四篇交叉验证，统一修复路径]`

### Phase 2g: BitLocker Recovery Key 问题
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-bitlocker-boot-error) `[vm-411]`

**症状**: Boot diagnostics 提示插入 USB 或输入 BitLocker recovery key。

**排查步骤**：
1. **Stop/deallocate → Start**（强制从 Key Vault 重新获取 BEK）
2. 如失败 → 附加 OS 磁盘到 Recovery VM:
   - 禁用 EncryptionSettingsEnabled
   - PowerShell 从 Key Vault 获取 BEK：`Get-AzKeyVaultSecret`
   - 保存为 `.BEK` 文件
   - 解锁：`manage-bde -unlock F: -RecoveryKey <path>.BEK`
3. KEK 场景 → 先通过 unwrapkey REST API 解密 wrapped BEK

> ⚠️ 21V **不适用**（Azure Disk Encryption 在 Mooncake 的支持有限）

`[结论: 🔵 7.5/10 — MS Learn 单源，BitLocker 场景较复杂]`

---

## BCD 修复命令速查

### bcdedit 标准修复模板（Gen1）
```cmd
REM 假设 BCD 分区=H:, Windows 分区=I:
bcdedit /store H:\boot\bcd /set {bootmgr} device partition=H:
bcdedit /store H:\boot\bcd /set {bootmgr} integrityservices enable
bcdedit /store H:\boot\bcd /set {default} device partition=I:
bcdedit /store H:\boot\bcd /set {default} osdevice partition=I:
bcdedit /store H:\boot\bcd /set {default} integrityservices enable
bcdedit /store H:\boot\bcd /set {default} recoveryenabled Off
bcdedit /store H:\boot\bcd /set {default} bootstatuspolicy IgnoreAllFailures
```

### bcdedit 标准修复模板（Gen2 UEFI）
```cmd
REM 假设 EFI 分区=S:, Windows 分区=I:
bcdedit /store S:\EFI\Microsoft\boot\bcd /set {bootmgr} device partition=S:
bcdedit /store S:\EFI\Microsoft\boot\bcd /set {default} device partition=I:
bcdedit /store S:\EFI\Microsoft\boot\bcd /set {default} osdevice partition=I:
bcdboot I:\Windows /S S: /F UEFI
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | winload.exe not found / BCD boot failure | BCD 分区引用错误 | bcdedit 修复 device/osdevice | 🟢 9 | [MCVKB/4.4](onenote) + [MS Learn] |
| 2 | 0xc0000428 SHA-2 + 2008R2 | bootmgr SHA-1 vs winload SHA-2 | nointegritychecks 临时绕过 + KB4474419 | 🟢 9 | [MCVKB/4.5](onenote) |
| 3 | Registry hive corrupted (boot hang) | 注册表未正常关闭/损坏 | Load Hive 修复或 regback 还原 | 🟢 8 | [MS Learn](多篇) |
| 4 | Gen1 分区未标记 Active | Boot 分区非 Active | diskpart active + bcdboot | 🟢 8 | [MS Learn] |
| 5 | Disk read error | 磁盘结构损坏 | chkdsk + diskpart active + bcdboot | 🟢 8 | [MS Learn] |
| 6 | BitLocker recovery key 提示 | BEK 无法从 Key Vault 获取 | Dealloc/start 或手动解锁 | 🔵 7.5 | [MS Learn] |
| 7 | 0xC0000428 预览镜像过期 | 试用镜像超有效期 | 不可恢复，重建 RTM VM | 🟢 8 | [MS Learn] |
| 8 | 0xC000000F winload/BCD/driver missing | BCD 引用错误或驱动缺失 | bcdedit 修复 + WinSxS 替换 | 🟢 8 | [MS Learn] |
| 9 | 0xC000014C registry missing/errors | 注册表 hive 损坏 | regback 还原 | 🟢 8 | [MS Learn] |
| 10 | 0xC0000034 \\Boot\\BCD recovery | BCD 完全损坏 | 重建 bootmgr | 🔵 7.5 | [MS Learn] |
| 11 | 0xC000000E winload file missing | BCD 设备引用不存在 | bcdedit 修复分区引用 | 🔵 7.5 | [MS Learn] |
| 12 | INACCESSIBLE_BOOT_DEVICE | BCD 损坏或分区不活动 | diskpart + bcdboot + bcdedit | 🔵 7.5 | [MS Learn] |
| 13 📋 | BOOTMGR is missing | 系统分区非 Active/BCD 缺引用/勒索 | 分步修复（含勒索检查） | 🟢 8 | [MS Learn] + 📋 |
| 14 | OS wasn't found | 系统分区未标记 Active | diskpart active + bcdboot | 🟢 8 | [MS Learn] |
