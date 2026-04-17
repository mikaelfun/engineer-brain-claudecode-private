# Disk Data Box POD: Data Copy & Performance — 排查速查

**来源数**: 12 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 512-byte-aligned, 512-byte-alignment, acl, azcopy, azure-files, by-design, certificate, certificate_verify_failed, copy-job, data-box

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box POD managed disk import fails: VHD file not 512-byte aligned, uploaded as page blob instead of managed disk | VHD files must be 512-byte aligned for managed disk import. Non-aligned files are rejected and logge | Ensure VHD is 512-byte aligned before copying. Remove non-aligned file and re-copy a properly aligned VHD. Check copy lo | 🟢 10 | [MCVKB] |
| 2 📋 | Data Box POD data copy to Azure has slowed or stalled completely at datacenter | Datacenter-side hardware or software issue affecting data copy process. | 1) Check Lens or ASC (Azure Support Center) for relevant auto-generated IcMs. 2) If no IcMs exist for the Data Box job,  | 🟢 10 | [MCVKB] |
| 3 📋 | Data Copy Service fails with error 'Could not complete the copy job' when source storage is Dell Isilon OS and target is | Dell Isilon OS does not support System Access Control Lists (SACLs). Data Copy Service attempts to c | 1) Change target storage from Azure File Storage to Block Blob in Data Copy Service. 2) Alternatively, mount SMB share o | 🟢 9.5 | [ADO Wiki] |
| 4 📋 | Data Box POD managed disk import: VHD copied outside precreated folders uploaded as page blobs instead of managed disks | Data Box creates specific share folders (ResourceGroup_MDisk/PremiumSSD\|StandardHDD\|StandardSSD).  | Always copy VHDs into the precreated tier folders (Premium SSD, Standard HDD, Standard SSD) under the correct resource g | 🟢 9 | [MCVKB] |
| 5 📋 | Data Box copy job stuck/not progressing; hcsdpservice logs show Directory open failed with err: 5 and Enumeration of end | Windows blocks reads by local users over the network due to UAC (User Access Control) restrictions | Either (1) manually grant user permissions on the source folder via Properties > Security > Edit > Add user, or (2) lowe | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Slow data copy to Data Box when copying millions of small files (especially <512KB); copy takes much longer than expecte | Small files incur overhead for per-file metadata verification during transfer, making throughput sig | Use Robocopy with 2 sessions and 16 threads per session for small files <512KB to maximize throughput | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | ACLs not transferred during Data Box data copy over NFS protocol | By design, NFS protocol does not transfer Windows-style ACLs | This is by-design behavior; use SMB protocol instead of NFS if ACL preservation is required | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | ACLs not transferred when using Data Box Data Copy service for file transfer | Data Copy service does not preserve ACLs during data transfer | Use Robocopy or other copy tool instead of the built-in Data Copy service to preserve ACLs | 🟢 8.5 | [ADO Wiki] |
| 9 📋 | Files copied to wrong share on Data Box (e.g. _AzFiles instead of _BlockBlob); moving via File Explorer triggers slow co | User selected wrong data copy destination share on Data Box device; File Explorer cross-share move i | Use PowerShell Move-Item (Windows) or mv command (Linux) to move files between shares on the Data Box device, which is f | 🟢 8.5 | [ADO Wiki] |
| 10 📋 | ERROR_BLOB_OR_FILE_SIZE_ALIGNMENT when copying data to Data Box page blob share or managed disk folder | Files copied to the page blob share are not 512-byte aligned. Only VHD/VHDX files (512-byte aligned) | Remove non-VHD/VHDX data from page blob share. Use block blob or Azure Files shares for generic data. For managed disks, | 🟢 8.5 | [MS Learn] |
| 11 📋 | Slow data copy to Data Box; host machine itself has performance issues affecting all copy operations | Source host machine has underlying performance problems not specific to Data Box | Isolate by copying same files to local volume or different machine; if host is confirmed slow, collect PerfMon trace and | 🟢 8.0 | [ADO Wiki] |
| 12 📋 | SSL/TLS certificate verification fails (CERTIFICATE_VERIFY_FAILED) when copying data to Data Box via AzCopy or Python SD | Data Box uses a self-signed TLS certificate that is not trusted by the client certificate store. | Download the certificate from Azure portal, then import into system certificate store. For Python, set REQUESTS_CA_BUNDL | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Data Box POD managed disk import fails: VHD file not 512-byte aligned, uploaded  → Ensure VHD is 512-byte aligned before copying `[来源: onenote]`
2. Data Box POD data copy to Azure has slowed or stalled completely at datacenter → 1) Check Lens or ASC (Azure Support Center) for relevant auto-generated IcMs `[来源: onenote]`
3. Data Copy Service fails with error 'Could not complete the copy job' when source → 1) Change target storage from Azure File Storage to Block Blob in Data Copy Service `[来源: ado-wiki]`
4. Data Box POD managed disk import: VHD copied outside precreated folders uploaded → Always copy VHDs into the precreated tier folders (Premium SSD, Standard HDD, Standard SSD) under th `[来源: onenote]`
5. Data Box copy job stuck/not progressing; hcsdpservice logs show Directory open f → Either (1) manually grant user permissions on the source folder via Properties > Security > Edit > A `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-pod-copy.md#排查流程)
