---
id: vm-onenote-044
title: "Windows 2008 R2 VM No-Boot 0xc0000428 after December 2019+ Updates"
product: vm
quality: known-issue
tags: [no-boot, 0xc0000428, windows-2008r2, KB4474419, sha2, bootmgr, bcdedit]
sourceRef: "MCVKB/VM+SCIM/======= 4. Windows=======/4.5 [Win] NOBOOT Issue(0xc0000428) after Installin.md"
---

## 症状

Windows Server 2008 R2 VM 安装 KB4540688、KB4541500（December 2019+ 累积更新）后重启，出现 NOBOOT 错误：

```
0xc0000428: Windows cannot verify the digital signature for this file
```

注意：只影响部分 VM（如 21 台中 10 台），非全量。

## 根因

- December 2019+ 累积更新将 `winload.exe` 升级为 **SHA-2 签名**版本
- 但 **System Reserved 分区中的 `bootmgr`** 未同步更新（仍为 SHA-1 版本）
- 根本原因：**未提前安装 KB4474419**（SHA-2 代码签名支持，September 2019 版本）

## 恢复步骤

1. 将问题 OS 磁盘挂载到 helper VM（推荐使用 nested Hyper-V）
2. 将问题磁盘上线，确认 System Reserved 分区盘符（如 `E:`）
3. 禁用完整性检查：
   ```cmd
   bcdedit /store E:\boot\bcd /set {default} nointegritychecks ON
   ```
4. 将磁盘下线，在 nested Hyper-V 中启动（约 30 分钟自动回滚补丁）
5. 恢复后重新启用：
   ```cmd
   bcdedit /set {default} nointegritychecks OFF
   ```

> ⚠️ **注意**：2008 R2 Azure VM 中 F8 无效，无法进入安全模式。

## 预防方案

按顺序执行：
1. 安装 **KB4474419（September 2019 版本）** → 升级 bootmgr
2. 重启
3. 再安装 December 2019+ 及以后的累积更新

## 参考

- KB4474419: https://support.microsoft.com/en-us/help/4474419
- SHA-2 支持要求: https://support.microsoft.com/en-us/help/4472027
