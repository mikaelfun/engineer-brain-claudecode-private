---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.18 [V2A] Multiple Issues.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# ASR V2A 常见多重问题排查指南

## Issue 1：VM 初始复制卡在 0%

1. 检查 Portal 错误详情 + Infrastructure View
2. 检查每个磁盘的 Data Sync：Process Server 列显示 "8GB" → 发生了 Throttling
3. 确认 PS 和源机 IP 正确
4. 收集日志：
   - 源机：`C:\Program Files (x86)\Microsoft Azure Site Recovery\agent\S2_curr_xx`
   - 源机：`...\agent\vxlogs\resync\{xxx}\1\C\xxx\xxx\dataprotection`
   - CS/PS：`C:\Program Files\Microsoft Azure Recovery Services Agent\Temp\CBEngine_curr`
   - CS/PS：`...\home\svsystems\var\volsync`
   - CS：`...\home\svsystems\var\Asrapi_reporting.log`
   - PS：`...\home\svsystems\transport\log\cxps_xxx`
5. 参考：https://docs.microsoft.com/en-us/azure/site-recovery/vmware-physical-azure-troubleshoot-process-server

## Issue 2：Configuration Server 显示未连接

排查顺序：
1. 在 Portal 刷新 CS Server
2. 检查关键服务是否运行
3. 检查证书是否过期（见 Issue 3）
4. 网络检查：
   - CS 需要 TCP 443；PS 需要 TCP 9443
   - `Test-NetConnection asrlandray.blob.core.chinacloudapi.cn -Port 443`
   - 检查代理设置（系统账户 IE / Backup proxy）
   - 抓包分析：重启服务后重试

## Issue 3：证书过期（AADSTS700027 错误）

**错误日志特征：**
```
AADSTS700027: Client assertion contains an invalid signature.
[Reason - The key used is expired., Thumbprint of key used by client: 'D9A7EBC6A3BC33277E...',
Found key 'Start=01/22/2018 09:13:33, End=01/23/2021 09:13:33']
```

**解决步骤：**
1. 在 Azure Portal 中为 CS 续签证书
2. 下载注册密钥
3. 在 CS 上运行：`%ProgramData%\ASR\home\svsystems\bin\cspsconfigtool.exe` 重新注册
4. 删除旧证书
5. 如有 Scale-out PS，在 PS 上运行：`cdpcli.exe --registermt`

## Issue 4：RPO 显示异常

**"Latest Recovery Point" 比 "Current RPO" 新很多** → 收集以下日志给 PG：
- CS：`C:\Program Files (x86)\Microsoft Azure Site Recovery\home\svsystems\var\asrapi_reporting.log`
- 源机：运行 `cdpcli.exe –showreplicationpairs > pairs.txt` 提供输出
- Portal Network Trace：F12 → 开启 Network Trace → 重进 Overview 页面 → 保存 .har 文件

**"Latest Recovery Point" 比 "Current RPO" 旧很多** → 在源机上手动触发 crash consistent recovery point：
```cmd
"C:\Program Files (x86)\Microsoft Azure Site Recovery\agent\vacp" -systemlevel -cc
```
提供命令输出截图 + `svagents*.log`。
