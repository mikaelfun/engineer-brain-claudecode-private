---
title: Enable Serial Console and Memory Dump Collection
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-serial-console-memory-dump-collection
product: vm
21vApplicable: true
date: 2026-04-18
---

# Enable Serial Console and Memory Dump Collection

## 概述
在 Azure Windows VM 上启用 Serial Console 和内存转储收集的操作步骤。常用于 VM 启动故障排查的前置准备。

## 步骤

### 1. 启用 Serial Console
```cmd
bcdedit /store <volume-letter>:ootcd /ems {<boot-loader-id>} ON
bcdedit /store <volume-letter>:ootcd /emssettings EMSPORT:1 EMSBAUDRATE:115200
```

### 2. 启用内存转储
- 确保 OS 盘空闲空间 > VM 内存大小
- 空间不足时可将转储文件指向 data disk（替换 %SystemRoot% 为数据盘盘符如 F:）

```cmd
# 加载 broken OS 盘注册表
reg load HKLM\<broken-system> <volume>:\windows\system32\config\SYSTEM

# ControlSet001
reg add "HKLM\<broken-system>\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
reg add "HKLM\<broken-system>\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
reg add "HKLM\<broken-system>\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

# ControlSet002
reg add "HKLM\<broken-system>\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
reg add "HKLM\<broken-system>\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
reg add "HKLM\<broken-system>\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

# 卸载
reg unload HKLM\<broken-system>
```

## 适用场景
- VM 启动故障排查前的准备步骤
- 需要收集 BSOD memory dump 进行分析
- 需要通过 Serial Console 远程操作 VM
