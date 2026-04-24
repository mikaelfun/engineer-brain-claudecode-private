# VM Azure Files 性能与限流 — 排查速查

**来源数**: 1 (AW) | **条目**: 7 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure File Share shows high latency and slow performance for metadata-heavy operations (createfile,  | Internal resource limitations on the Azure platform side cause higher latency fo | Mount a VHD on the file share and perform file operations against the VHD. In Di | 🔵 7.5 | AW |
| 2 | Cannot directly convert between standard file share and premium file share in Azure Files | Direct conversion between standard and premium Azure Files tiers is not supporte | Create a new file share in the target tier and manually copy data using Robocopy | 🔵 7.5 | AW |
| 3 | High latency and slow performance on Azure File Share during metadata-heavy operations (createfile,  | Known Azure platform internal resource limitations cause metadata operations to  | Create a VHD on the Azure File Share and mount it from the client. The client-ow | 🔵 7.5 | AW |
| 4 | Azure File Share operations fail with STATUS_QUOTA_EXCEEDED (0xc0000044) / ERROR_NOT_ENOUGH_QUOTA (1 | Exceeding maximum concurrent file handles limit per file/directory (default 2,00 | Query Storage Front End Logs XSMBPerfMetric table for InternalXsError 830a1824/8 | 🔵 7.5 | AW |
| 5 | Customer wants to convert existing standard file share to premium (or vice versa) but no direct conv | Azure Files does not support direct conversion between standard and premium file | Create a new file share in the desired tier, then manually copy data using Roboc | 🔵 6.5 | AW |
| 6 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage; | VM is experiencing a performance spike or virtual memory exhaustion due to appli | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory | 🔵 6.5 | AW |
| 7 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr | Brute force RDP attack over the internet causing CPU/memory performance spike, e | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM  | 🔵 6.5 | AW |

## 快速排查路径

1. **Azure File Share shows high latency and slow performance for metadata-heavy oper**
   - 根因: Internal resource limitations on the Azure platform side cause higher latency for metadata operations compared to read/w
   - 方案: Mount a VHD on the file share and perform file operations against the VHD. In Disk Management create VHD with location set to mapped Azure File Share,
   - `[🔵 7.5 | AW]`

2. **Cannot directly convert between standard file share and premium file share in Az**
   - 根因: Direct conversion between standard and premium Azure Files tiers is not supported. Premium uses FileStorage account kind
   - 方案: Create a new file share in the target tier and manually copy data using Robocopy or AzCopy. Premium requires FileStorage account kind, min 100 GiB. IO
   - `[🔵 7.5 | AW]`

3. **High latency and slow performance on Azure File Share during metadata-heavy oper**
   - 根因: Known Azure platform internal resource limitations cause metadata operations to have higher latency than read/write oper
   - 方案: Create a VHD on the Azure File Share and mount it from the client. The client-owned filesystem makes metadata operations local, offering performance s
   - `[🔵 7.5 | AW]`

4. **Azure File Share operations fail with STATUS_QUOTA_EXCEEDED (0xc0000044) / ERROR**
   - 根因: Exceeding maximum concurrent file handles limit per file/directory (default 2,000; 10,000 with preview). Internal error 
   - 方案: Query Storage Front End Logs XSMBPerfMetric table for InternalXsError 830a1824/830a1825. Investigate client-side handle usage with ProcMon. Consider r
   - `[🔵 7.5 | AW]`

5. **Customer wants to convert existing standard file share to premium (or vice versa**
   - 根因: Azure Files does not support direct conversion between standard and premium file share tiers. They use different storage
   - 方案: Create a new file share in the desired tier, then manually copy data using Robocopy or AzCopy. Note: azcopy is only supported for SMB, not NFS.
   - `[🔵 6.5 | AW]`

