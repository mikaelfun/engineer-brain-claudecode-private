# VM Cloud Tiering 与数据召回 — 排查速查

**来源数**: 1 (AW) | **条目**: 9 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure File Sync tiered files show grey X icon in Windows Explorer | Expected behavior: Windows Explorer displays grey X for any files with the offli | No action needed - this is by design. The grey X appears because tiered files ha | 🔵 7.5 | AW |
| 2 | Need to determine why a specific file was tiered by Azure File Sync cloud tiering | Files can be tiered for multiple reasons: VolumePolicy (free space threshold), D | Run Get-StorageSyncHeatStoreInformation -FilePath <path> to check GhostingReason | 🔵 7.5 | AW |
| 3 | Azure File Sync cloud tiering date policy not tiering files as expected because background processes | Heat tracking counts file access from all processes including background service | Set registry to exclude process names from heat tracking. Agent v11-v12: HeatTra | 🔵 7.5 | AW |
| 4 | Azure File Sync heatstore corruption detected - cloud tiering not working, Event ID 9013 shows Heats | ESE database (heatstore) corruption on the server volume | Query Event 9013 via Kusto: cluster(Xfiles).database(xsynctelemetrysf).ServerTel | 🔵 7.5 | AW |
| 5 | Recalling Azure File Sync tiered files on macOS via SMB takes much longer than the identical copy on | macOS Finder bug (rdar://97728008): Finder reads SF_DATALESS (tiered) files with | No Apple workaround available. For AFS agent v15.0+ partial mitigation: enable c | 🔵 7.5 | AW |
| 6 | Azure File Sync recall results in partial content download. Event 1110 shows RecallToDiskType No (Fi | OS-level memory constraint. By default AFS reserves 10% of physical memory for r | Increase memory allocation via registry: BottomlessFilterSharedMemSizePercentage | 🔵 7.5 | AW |
| 7 | Azure File Sync tiered multimedia files show partial content download when recalled - file not fully | Expected behavior (by design). Azure File Sync only recalls the requested data r | No action needed - by design for multimedia files. AFS efficiently recalls only  | 🔵 7.5 | AW |
| 8 | Azure File Sync v16 agent enters Low Disk Space mode and aggressively tiers files even though disk i | Regression in v16 agent: low disk mode uses percentage of volume free space with | Set registry value to disable low disk space mode: reg add HKLM\SOFTWARE\Microso | 🔵 6.5 | AW |
| 9 | AFS server endpoint cannot recall files from cloud endpoint with error 0x80072f8f (-2147012721), net | Firewall proxy or gateway blocks access to PKI/OCSP URLs required for SSL certif | Ensure server can access PKI URLs: microsoft.com/pki/mscorp/cps, crl.microsoft.c | 🔵 6.5 | AW |

## 快速排查路径

1. **Azure File Sync tiered files show grey X icon in Windows Explorer**
   - 根因: Expected behavior: Windows Explorer displays grey X for any files with the offline attribute set. Tiered files have the 
   - 方案: No action needed - this is by design. The grey X appears because tiered files have the offline attribute. Over SMB the X is visible; on the local serv
   - `[🔵 7.5 | AW]`

2. **Need to determine why a specific file was tiered by Azure File Sync cloud tierin**
   - 根因: Files can be tiered for multiple reasons: VolumePolicy (free space threshold), DatePolicy (file age), CloudTieringCmdlet
   - 方案: Run Get-StorageSyncHeatStoreInformation -FilePath <path> to check GhostingReason field. VolumePolicy/DatePolicy = background tiering (check 9016 event
   - `[🔵 7.5 | AW]`

3. **Azure File Sync cloud tiering date policy not tiering files as expected because **
   - 根因: Heat tracking counts file access from all processes including background services. Dedup optimization (fsdmhost.exe) or 
   - 方案: Set registry to exclude process names from heat tracking. Agent v11-v12: HeatTrackingProcessNameExclusionList (REG_MULTI_SZ). Agent v13+: HeatTracking
   - `[🔵 7.5 | AW]`

4. **Azure File Sync heatstore corruption detected - cloud tiering not working, Event**
   - 根因: ESE database (heatstore) corruption on the server volume
   - 方案: Query Event 9013 via Kusto: cluster(Xfiles).database(xsynctelemetrysf).ServerTelemetryEvents where ServerEventId == 9013. If corruption confirmed, del
   - `[🔵 7.5 | AW]`

5. **Recalling Azure File Sync tiered files on macOS via SMB takes much longer than t**
   - 根因: macOS Finder bug (rdar://97728008): Finder reads SF_DATALESS (tiered) files with 4KB IO request size causing extremely s
   - 方案: No Apple workaround available. For AFS agent v15.0+ partial mitigation: enable cache manager reads via registry HfsKmDisableCCReadAhead=0 under HKLM S
   - `[🔵 7.5 | AW]`

