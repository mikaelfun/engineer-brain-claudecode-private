# VM Windows BCD / Boot Loader 错误 — 排查速查

**来源数**: 14 | **21V**: 部分
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | winload.exe not found / BCD boot failure | BCD 分区引用错误(device/osdevice 指向错误分区) | 挂载 → bcdedit /store 修复 {default} device/osdevice partition → 重建 VM | 🟢 8 — OneNote+实证+21V | [MCVKB/4.4](MCVKB/VM+SCIM/======= 4. Windows=======/4.4 [Win]A sample to fix windows no boot issue (wi.md) |
| 2 | Win 2008 R2 BSOD 0xc0000428 数字签名验证失败 (KB4540688 后) | bootmgr 未更新(SHA-1)但 winload 已升级(SHA-2)，缺少 KB4474419 前置 | nointegritychecks ON → 嵌套 Hyper-V 回滚 → 先装 KB4474419 再更新 | 🟢 8.5 — OneNote+实证+21V | [MCVKB/4.5](MCVKB/VM+SCIM/======= 4. Windows=======/4.5 [Win] NOBOOT Issue(0xc0000428) after Installin.md) |
| 3 | 注册表 hive 损坏导致无法启动 | SYSTEM 注册表文件未正确关闭或损坏 | 挂载 → Load Hive 测试 → unload 修复 / regback 恢复 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-fix-corrupted-hive) |
| 4 | Gen1 VM 启动分区未标记为 Active | 启动分区未设 Active 标志(Gen1 MBR 必须) | diskpart → set partition active → bcdboot 重建引导记录 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/verify-windows-partition-is-active) |
| 5 | "A disk read error occurred" 无法启动 | 磁盘结构损坏 / Gen1 分区未 Active | diskpart 设 Active → bcdboot → chkdsk /f → Serial Console | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-disk-read-error-occurred) |
| 6 | BitLocker recovery key 提示 | VM 无法从 Key Vault 获取 BEK 文件解密 OS 磁盘 | Stop/Start VM(强制 BEK 获取)；失败则挂载 → PowerShell 取 BEK → manage-bde 解锁 | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-bitlocker-boot-error) |
| 7 | 0xC0000428 preview/trial 镜像过期 | 预览镜像超过试用期(如 180 天)无法恢复 | 不可恢复。部署 RTM 镜像新 VM + 迁移数据 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-boot-error-invalid-image-hash) |
| 8 | 0xC000000F: required file missing (winload/BCD/driver) | BCD 损坏 / 引用设备不存在 / driver 文件损坏 | bcdedit 修复 device/osdevice；driver 缺失则 chkdsk + WinSxS 替换 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc000000f) |
| 9 | 0xC000014C: system registry file missing or contains errors | 系统注册表 hive 损坏 | 从 \\config\\regback 恢复注册表文件 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc000014c) |
| 10 | 0xC0000034 on \\Boot\\BCD | BCD 损坏无法定位 Windows | bcdedit /create {bootmgr} 重建完整 BCD | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000034) |
| 11 | 0xc000000e: winload.exe 无法加载 OS | BCD device/osdevice 引用错误分区 | bcdedit /store 修复分区引用 + integrityservices + bootstatuspolicy | 🔵 5.5 — MS Learn 单源+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-code-0xc000000e) |
| 12 | INACCESSIBLE_BOOT_DEVICE / "Reboot and Select proper Boot device" | BCD 损坏 / 分区未 Active | Stop/Start → diskpart Active → bcdboot → bcdedit 修复(Gen1 vs Gen2 不同步骤) | 🔵 5.5 — MS Learn 单源+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-boot-failure) |
| 13 📋 | "BOOTMGR is missing" | 系统分区未 Active / BCD 引用缺失 / 勒索软件 | diskpart 设 Active → bcdboot → 修复 BCD → 检查勒索软件 | 🔵 5.5 — MS Learn+含融合指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/os-bootmgr-missing) |
| 14 | "An operating system wasn't found" | 系统分区未 Active / 磁盘损坏 / 存储不可达 | Stop/Start → diskpart Active → bcdboot + bcdedit 修复 | 🔵 6 — MS Learn+实证+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/os-not-found) |

## 快速排查路径
1. **确认 Gen1 vs Gen2** → Gen1: 检查 MBR 分区 Active 标志；Gen2: 检查 EFI 分区 `[来源: MS Learn]`
2. **BCD 错误(0xC000000F/0xC0000034/0xc000000e)** → 挂载 → bcdedit /store 修复 device/osdevice `[来源: OneNote+MS Learn]`
3. **分区未 Active** → diskpart → select partition → active → bcdboot 重建 `[来源: MS Learn]`
4. **Win 2008 R2 + SHA-2** → 确认 KB4474419 已装；未装则 nointegritychecks 恢复 `[来源: OneNote]`
5. **注册表损坏** → \\config\\regback 恢复 / regedit Load Hive 测试 `[来源: MS Learn]`
6. **BitLocker** → Stop/Start 强制 BEK 获取 → 失败则 PowerShell 取密钥手动解锁 `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-boot-win-bcd.md#排查流程)
