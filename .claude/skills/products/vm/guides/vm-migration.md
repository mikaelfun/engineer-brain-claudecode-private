# VM VM 迁移 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 13 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need ASR Kusto connection endpoints for Mooncake troubleshooting |  | ASR Kusto (Mooncake): asrclusmc.kusto.chinacloudapi.cn:443, mabprodmc.kusto.chin | 🟢 9 | ON |
| 2 | Need Kusto queries for ASR troubleshooting: operation history, job log details by ID, VMM registrati |  | 3 patterns on asrclusmc: (1) Recent ops: SRSOperationEvent where SubscriptionId+ | 🟢 9 | ON |
| 3 | Need to connect to ASR Configuration Server MySQL database directly to remove stale protected items  |  | Root password location: C:\ProgramData\ASR\home\svsystems\etc\amethyst.conf. Con | 🟢 8 | ON |
| 4 | ASR Kusto endpoint permission project 13982 ramweb group migrated to MyAccess |  | Project 13982 (DRS_MDS_ROAccess) migrated from RAMWeb to MyAccess. Go to https:/ | 🟢 8 | ON |
| 5 | ARM-tracked fields of a resource (e.g. Storage Account SKU, tags, or other metadata outside the 'pro | Backend migration or platform update changed resource state in the RP (e.g. ZRS  | Execute ARM Sync (Create mode) via Jarvis: Azure Resource Manager > Resource Syn | 🔵 7.5 | AW |
| 6 | ASR VMware-to-Azure (V2A) replication stuck at 0% after unexpected power off on Configuration Server | Unexpected power off (and recovery) caused duplicate/stale host entries in the C | 1. Find MySQL root password in amethyst.conf on Configuration Server. 2. Backup  | 🔵 7.5 | ON |
| 7 | ASR Configuration Server (deployed from OVF template) MySQL installation fails with HTTP 400 Bad Req | Known bug in the OVF version: .NET Framework defaults to TLS 1.0/SSL 3.0 but the | Option 1 (Registry): Add SchUseStrongCrypto DWORD=1 under HKLM\SOFTWARE\Wow6432N | 🔵 7.5 | ON |
| 8 | ASR VMware-to-Azure: after protecting a UEFI-boot VM and failing it over to Azure, re-protect and fa | By design: ASR does not support failback to on-premises VMware for UEFI (GPT) bo | Expected behavior per support matrix (docs.azure.cn/zh-cn/site-recovery/vmware-p | 🔵 7.5 | ON |
| 9 | ASR V2A UEFI VM failover: on version below 9.30 ASR creates a hydration VM (asr-tempxxx) to convert  | ASR v9.30 (Nov 2019) introduced support for direct Gen2 (UEFI) failover without  | Upgrade ASR to v9.30 or above. Upgrade order: 1. Configuration Server (via Unifi | 🔵 7.5 | ON |
| 10 | ASR Configuration Server shows disconnected in portal; CS logs show AADSTS700027 "Client assertion c | The certificate used by the ASR Configuration Server to authenticate with Azure  | 1. In Azure Portal, navigate to the CS and use Renew Certificate option. 2. Down | 🔵 7.5 | ON |
| 11 | 客户使用 F、Fs、Fsv2、Lsv2、G、Gs、Av2、Amv2 或 B 系列 VM，遇到 Reserved Instance 无法续期，或面临 2028年10月15日退役 | 上述 VM 系列将于 2028-10-15 退役；3年 Reserved Instance 自 2025-10-15 起不可购买或续期；到期合同将以 PAYG  | 建议客户：1) 检查当前 RI 订单及到期日期；2) 对现有预留执行 exchange（换购新 VM 系列 RI）或 trade-in（换 Azure savi | 🔵 6.5 | AW |
| 12 | ASR Hyper-V to Azure replication fails with error ID 18090 / error code 80790033: 'Starting initial  | Generation 2 VM (UEFI boot, GPT partition) has more data volumes than ASR suppor | Combine or reformat the volumes to reduce to 2 or fewer data volumes. Check Hype | 🔵 6.5 | ON |
| 13 | ASR V2A Process Server failover fails with Error ID 559 / Provider Error 31255: 'A request couldn't  | DRA (Data Recovery Agent) version is outdated (e.g., 5.1.3300.0) which has a kno | Upgrade Configuration Server and Process Server to the latest version. Use https | 🔵 6.5 | ON |

## 快速排查路径

1. **Need ASR Kusto connection endpoints for Mooncake troubleshooting**
   - 方案: ASR Kusto (Mooncake): asrclusmc.kusto.chinacloudapi.cn:443, mabprodmc.kusto.chinacloudapi.cn:443. New (Aug 2022): asradxclusmc.chinanorth2.kusto.china
   - `[🟢 9 | ON]`

2. **Need Kusto queries for ASR troubleshooting: operation history, job log details b**
   - 方案: 3 patterns on asrclusmc: (1) Recent ops: SRSOperationEvent where SubscriptionId+ScenarioName|top 20 by TIMESTAMP desc|project TIMESTAMP,ClientRequestI
   - `[🟢 9 | ON]`

3. **Need to connect to ASR Configuration Server MySQL database directly to remove st**
   - 方案: Root password location: C:\ProgramData\ASR\home\svsystems\etc\amethyst.conf. Connect (no space between -p and password): mysql -uroot -p<password> svs
   - `[🟢 8 | ON]`

4. **ASR Kusto endpoint permission project 13982 ramweb group migrated to MyAccess**
   - 方案: Project 13982 (DRS_MDS_ROAccess) migrated from RAMWeb to MyAccess. Go to https://myaccess, search 13982, click Add, submit with justification. Note: 1
   - `[🟢 8 | ON]`

5. **ARM-tracked fields of a resource (e.g. Storage Account SKU, tags, or other metad**
   - 根因: Backend migration or platform update changed resource state in the RP (e.g. ZRS migration changed SKU) without updating 
   - 方案: Execute ARM Sync (Create mode) via Jarvis: Azure Resource Manager > Resource Synchronization > Synchronize resource state for the specific resource. A
   - `[🔵 7.5 | AW]`

