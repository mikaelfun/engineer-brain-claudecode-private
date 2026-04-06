# VM Windows BSOD / Stop Error — 排查速查

**来源数**: 13 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 通用 BSOD: "Your PC ran into a problem and needs to restart" | 驱动/系统文件损坏/内存/应用访问禁区 | 挂载到 repair VM → 收集 Memory.dmp → 启用 CrashDumpEnabled+NMICrashDump → 提交 dump | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-common-blue-screen-error) |
| 2 | DC BSOD 0xC00002E1/0xC00002E2: STATUS_DS_CANT_START/INIT_FAILURE | LSASS 无法访问本地 AD 数据库(NTDS.DIT)：磁盘满/文件丢失/SAN policy | DSRM 启动 → 释放空间 → 修复 SAN policy → 移除 safeboot | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-directory-service-initialization-failure) |
| 3 | 卡在 "Applying security policy to the system" | 安全策略处理挂起，需 dump 分析 | VM Repair Commands → 启用 Serial Console+dump → 收集分析 | 🔵 5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unresponsive-vm-apply-security-policy) |
| 4 | 0x00000074 BAD_SYSTEM_CONFIG_INFO | SYSTEM 注册表 hive 损坏 | 挂载 → Load Hive 测试 → 正常加载=未正确关闭(unload 修复) → 加载失败=联系支持 | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-stop-error-bad-system-config-info) |
| 5 | "Hardware Malfunction - The system has halted" (Win 2008) | Guest OS 配置不当，NMI 触发未捕获异常 | 重启 → 设置 NMICrashDump=1 → 启用 Serial Console → 离线修复 | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-stop-error-hardware-malfunction) |
| 6 | 0xC0000017 Status No Memory | OS 磁盘满/碎片化/pagefile 位置错误 | 扩展磁盘 → 清理/碎片整理 → bcdedit 清除 badmemory → 恢复 pagefile 位置 | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-windows-stop-error) |
| 7 | 0xC000021A STATUS_SYSTEM_PROCESS_TERMINATED | Winlogon/CSRSS 崩溃：系统文件不匹配/更新失败/第三方软件 | 从备份恢复 / 挂载收集 Memory.dmp 提交支持 | 🔵 5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-stop-error-system-process-terminated) |
| 8 | 0x0000007E SYSTEM_THREAD_EXCEPTION_NOT_HANDLED | 系统线程产生未捕获异常 | 从备份恢复 / 挂载收集 Memory.dmp 提交支持 | 🔵 5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-stop-error-system-thread-exception-not-handled) |
| 9 | IRQL_NOT_LESS_OR_EQUAL (0x0000000A) | OS 不支持 >64 vCPU (如 Win 2012 R2) 但配置了更多 | 减少 vCPU ≤64 或升级 OS 到 Win 2016+ | 🔵 6 — MS Learn+实证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/interrupt-request-line-not-less-equal) |
| 10 | BAD_POOL_HEADER (0x00000019) | 内存池损坏 | 收集 Memory.dmp 提交支持分析 | 🟡 4 — MS Learn 单源+无具体方案 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/bad-pool-header) |
| 11 | MEMORY_MANAGEMENT (0x0000001A) | 服务器内存管理错误 | 收集 Memory.dmp 提交支持分析 | 🟡 4 — MS Learn 单源+无具体方案 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/bug-check-memory-management) |
| 12 | KMODE_EXCEPTION_NOT_HANDLED (0x0000001E) | 内核态程序异常未捕获 | 收集 Memory.dmp 提交支持分析 | 🟡 4 — MS Learn 单源+无具体方案 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/kernel-mode-exception-not-handled) |
| 13 | 0x1E KMODE + STATUS_PRIVILEGED_INSTRUCTION (rdmsr/wrmsr) 启动 <1s 崩溃 | Spectre/Meltdown 缓解相关问题(2018 内核) | 挂载 → 改 FeatureSettingOverride 从 8 到 3 → 换盘启动 → Windows Update | 🔵 6.5 — ContentIdea KB+实证+21V | [KB4487661](https://support.microsoft.com/kb/4487661) |

## 快速排查路径
1. **收集 Memory.dmp** → 挂载到 repair VM → `\\Windows\\Memory.dmp` → 没有则启用 CrashDumpEnabled+NMICrashDump `[来源: MS Learn]`
2. **有明确 Stop Code** → 按表格定位具体根因和方案 `[来源: MS Learn]`
3. **DC 相关** → 检查 NTDS.DIT 可访问性、磁盘空间、SAN policy `[来源: MS Learn]`
4. **vCPU 限制** → 确认 OS 版本对应 vCPU 上限(2012R2=64) `[来源: MS Learn]`
5. **Spectre/Meltdown** → 检查 FeatureSettingOverride 注册表值 `[来源: ContentIdea KB]`
6. **通用兜底** → 收集 dump 提交 Azure Support `[来源: MS Learn]`
