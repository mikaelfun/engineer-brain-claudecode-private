# VM Windows 启动修复参考（BCD/系统文件/离线修复） — 综合排查指南

**条目数**: 2 | **草稿融合数**: 0 (2 个草稿文件不存在) | **Kusto 查询融合**: 0
**来源草稿**: [mslearn-repair-boot-configuration-data.md] (未找到), [mslearn-repair-replace-system-binary.md] (未找到)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

> ⚠️ 本 topic 的 2 个 draft 文件尚未创建。当前内容基于三元组条目和 MS Learn 源 URL 生成。
> 后续 draft 文件就绪后应重新融合。

---

## 排查流程

### Phase 1: 确定启动修复类型
> 来源: [MS Learn](vm-361, vm-362)

Windows VM 无法启动时，若错误指向 BCD 损坏或系统二进制文件缺失/损坏，按以下路径修复：

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| BCD 损坏/缺失引起的启动失败 | Boot Configuration Data 问题 | → Phase 2a |
| .sys 文件缺失/损坏引起的启动失败 | 系统二进制文件问题 | → Phase 2b |

### Phase 2a: BCD 离线修复
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-boot-configuration-data) `[vm-361]`

**适用场景**: Windows VM 因 BCD store 损坏或缺失而无法启动。

**标准修复流程**：

1. **创建 Repair VM** 并附加故障 OS 磁盘
2. **识别分区**：
   - Boot 分区（含 `\Boot\BCD` 或 `\EFI\Microsoft\Boot\BCD`）
   - Windows 分区（含 `\Windows`）
3. **枚举当前 BCD**：
   ```cmd
   REM Gen1:
   bcdedit /store <Boot>:\boot\bcd /enum
   REM Gen2:
   bcdedit /store <EFI>:\EFI\Microsoft\boot\bcd /enum
   ```
4. **修复 BCD 条目**：
   ```cmd
   REM 修复 bootmgr
   bcdedit /store <BCD>:\boot\bcd /set {bootmgr} device partition=<BCD>:
   bcdedit /store <BCD>:\boot\bcd /set {bootmgr} integrityservices enable

   REM 修复 Windows Boot Loader
   bcdedit /store <BCD>:\boot\bcd /set {default} device partition=<WIN>:
   bcdedit /store <BCD>:\boot\bcd /set {default} osdevice partition=<WIN>:
   bcdedit /store <BCD>:\boot\bcd /set {default} integrityservices enable
   bcdedit /store <BCD>:\boot\bcd /set {default} recoveryenabled Off
   bcdedit /store <BCD>:\boot\bcd /set {default} bootstatuspolicy IgnoreAllFailures
   ```
5. **重建 Boot Record**：
   ```cmd
   bcdboot <WIN>:\Windows /S <BCD>:
   ```
6. **分离磁盘** → 重建 VM

> ✅ 21V 适用 — 离线修复，适用于任何云环境

> 📌 **完整步骤参考**: [MS Learn — Repair boot configuration data](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-boot-configuration-data)

`[结论: 🔵 6.5/10 — MS Learn 单源，draft 未创建，步骤基于三元组推断]`

### Phase 2b: 系统二进制文件（.sys）替换修复
> 来源: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-replace-system-binary-file) `[vm-362]`

**适用场景**: Windows VM 因 `.sys` 驱动文件缺失或损坏而无法启动。

**标准修复流程**：

1. **创建 Repair VM** 并附加故障 OS 磁盘
2. **磁盘检查**：
   ```cmd
   chkdsk <drive>: /f
   ```
3. **定位损坏文件**：根据 boot diagnostics 错误信息确认具体 `.sys` 文件名
4. **从 WinSxS 备份替换**：
   ```cmd
   REM 在 Repair VM 上操作
   REM 查找备份版本
   dir <drive>:\Windows\WinSxS\*<filename>* /s
   REM 替换损坏文件
   copy <drive>:\Windows\WinSxS\<path>\<file>.sys <drive>:\Windows\System32\drivers\<file>.sys
   ```
5. **若 WinSxS 中也无该文件**：
   - 从同版本 Windows 的正常 VM 复制
   - 或使用安装介质提取
6. **分离磁盘** → 重建 VM

> ✅ 21V 适用 — 离线修复

> 📌 **完整步骤参考**: [MS Learn — Repair/replace system binary file](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-replace-system-binary-file)

`[结论: 🔵 6.5/10 — MS Learn 单源，draft 未创建，步骤基于三元组推断]`

---

## 通用离线修复工具速查

| 工具 | 用途 | 命令示例 |
|------|------|---------|
| `bcdedit` | BCD store 查看/修改 | `bcdedit /store <path> /enum` |
| `bcdboot` | 重建 boot record | `bcdboot <WIN>:\Windows /S <BCD>:` |
| `diskpart` | 分区管理（Active 标记） | `sel partition 1` → `active` |
| `chkdsk` | 磁盘检查修复 | `chkdsk <drive>: /f` |
| `sfc` | 系统文件检查（需在线） | `sfc /scannow /offbootdir= /offwindir=` |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | BCD store 损坏/缺失导致无法启动 | Boot Configuration Data 问题 | bcdedit 修复 + bcdboot 重建 | 🔵 6.5 | [MS Learn] |
| 2 | .sys 系统文件缺失/损坏导致无法启动 | 驱动二进制文件问题 | chkdsk + WinSxS 替换 | 🔵 6.5 | [MS Learn] |
