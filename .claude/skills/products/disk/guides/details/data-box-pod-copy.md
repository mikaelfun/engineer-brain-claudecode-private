# Disk Data Box POD: Data Copy & Performance — 综合排查指南

**条目数**: 12 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-data-box-copy-not-yet-started.md, ado-wiki-a-data-copy-slow-data-box.md, onenote-databox-pod-requirements-limits.md, onenote-databox-pod-support-package-analysis.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ado Wiki A Data Box Copy Not Yet Started
> 来源: ADO Wiki (ado-wiki-a-data-box-copy-not-yet-started.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Data Copy to Azure/Data Box copy not yet started"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FData%20Copy%20to%20Azure%2FData%20Box%20copy%20not%20yet%20started"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. Description / Overview
6. When Microsoft receives and scans the device, order status is updated to Received. The device then undergoes physical verification for damage or signs of tampering.
7. After the verification is complete, the Data Box is connected to the network in the Azure datacenter. The data copy starts automatically. Depending upon the data size, the copy operation may take a few hours to days to complete. However, some scenari
8. *   Due to shipping delay, the device has not yet reached Azure DC
9. *   Delay at Azure DC in moving the job to next state.
10. *   Device hardware issue

### Phase 2: Ado Wiki A Data Copy Slow Data Box
> 来源: ADO Wiki (ado-wiki-a-data-copy-slow-data-box.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Data Copy very slow when copying to Data Box"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FData%20Copy%20very%20slow%20when%20copying%20to%20Data%20Box"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. This TSG on how to troubleshoot some performance (slow transfers) issues from the Host/Client machine to the Azure Data Box
6. There are millions of very small sized files
7. Troubleshooting Steps
8. *   While troubleshooting the issue of slow data copy to the Data Box start with asking customers the below questions.
9. *   How much time it takes to copy a file which is of size 10 GB vs multiple files of size 10 GB.
10. *   Is it taking the same time to copy the files to a different machine over the network and to the Data Box device.

### Phase 3: Data Box POD Requirements and Limits Reference
> 来源: OneNote (onenote-databox-pod-requirements-limits.md)

1. | OS | Versions | Notes |
2. | Windows Server | 2016 RS1+, 2019 RS5+ | Earlier editions: RoboCopy `/B` mode can't copy ADS/EA ACL files |
3. | Windows | 7, 8, 10 | — |
4. | Protocol | Versions | Notes |
5. | SMB | 3.0, 2.0 | — |
6. | NFS | Up to 4.1 | AIX host with IBM DB2 Export tool NOT supported |
7. | Account Type | Block Blob | Page Blob | Azure Files | Access Tiers |
8. |---|---|---|---|---|
9. | Classic Standard | ✅ | ✅ | ✅ | — |
10. | GPv1 Standard | ✅ | ✅ | ✅ | Hot, Cool |

### Phase 4: Data Box POD Support Package Analysis Guide
> 来源: OneNote (onenote-databox-pod-support-package-analysis.md)

1. 1. In the local web UI, go to **Contact Support**
2. 2. Optionally select **Include memory dumps** (only if Support requests it - takes long time and contains sensitive data)
3. 3. Click **Create Support package**
4. 4. After creation, click **Download** and provide customer with DTM link workspace to upload
5. | # | Log File | Location | What to Check |
6. |---|----------|----------|---------------|
7. | 1 | `DiagnosticsTestResults.json` | Top-level of support package | Check test status (passed/failed). **Start here if any test failed.** |
8. | 2 | `Get-HcsApplianceInfo.txt` | `<Device_Logs>/SupportPackage/<Device_Name>/<Device_Serial>/cmdlets/PodCmdLets` | Device software version. If expected ≠ actual → update issue occurred. |
9. | 3 | `Get-HcsTimeSettings.txt` | Same as above | Time zone. If discrepancy → update via local WebUI → retry operation. |
10. | 4 | `Get-HcsNetInterface.txt` | Same as above | Port 'State'. Blank = not connected (OK). Non-'Up' on connected port → troubleshoot. |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box POD managed disk import fails: VHD file not 512-byte aligned, uploaded as page blob instead of managed disk | VHD files must be 512-byte aligned for managed disk import. Non-aligned files are rejected and logge | Ensure VHD is 512-byte aligned before copying. Remove non-aligned file and re-copy a properly aligned VHD. Check copy lo | 🟢 10 | [MCVKB] |
| 2 | Data Box POD data copy to Azure has slowed or stalled completely at datacenter | Datacenter-side hardware or software issue affecting data copy process. | 1) Check Lens or ASC (Azure Support Center) for relevant auto-generated IcMs. 2) If no IcMs exist for the Data Box job,  | 🟢 10 | [MCVKB] |
| 3 | Data Copy Service fails with error 'Could not complete the copy job' when source storage is Dell Isilon OS and target is | Dell Isilon OS does not support System Access Control Lists (SACLs). Data Copy Service attempts to c | 1) Change target storage from Azure File Storage to Block Blob in Data Copy Service. 2) Alternatively, mount SMB share o | 🟢 9.5 | [ADO Wiki] |
| 4 | Data Box POD managed disk import: VHD copied outside precreated folders uploaded as page blobs instead of managed disks | Data Box creates specific share folders (ResourceGroup_MDisk/PremiumSSD\|StandardHDD\|StandardSSD).  | Always copy VHDs into the precreated tier folders (Premium SSD, Standard HDD, Standard SSD) under the correct resource g | 🟢 9 | [MCVKB] |
| 5 | Data Box copy job stuck/not progressing; hcsdpservice logs show Directory open failed with err: 5 and Enumeration of end | Windows blocks reads by local users over the network due to UAC (User Access Control) restrictions | Either (1) manually grant user permissions on the source folder via Properties > Security > Edit > Add user, or (2) lowe | 🟢 8.5 | [ADO Wiki] |
| 6 | Slow data copy to Data Box when copying millions of small files (especially <512KB); copy takes much longer than expecte | Small files incur overhead for per-file metadata verification during transfer, making throughput sig | Use Robocopy with 2 sessions and 16 threads per session for small files <512KB to maximize throughput | 🟢 8.5 | [ADO Wiki] |
| 7 | ACLs not transferred during Data Box data copy over NFS protocol | By design, NFS protocol does not transfer Windows-style ACLs | This is by-design behavior; use SMB protocol instead of NFS if ACL preservation is required | 🟢 8.5 | [ADO Wiki] |
| 8 | ACLs not transferred when using Data Box Data Copy service for file transfer | Data Copy service does not preserve ACLs during data transfer | Use Robocopy or other copy tool instead of the built-in Data Copy service to preserve ACLs | 🟢 8.5 | [ADO Wiki] |
| 9 | Files copied to wrong share on Data Box (e.g. _AzFiles instead of _BlockBlob); moving via File Explorer triggers slow co | User selected wrong data copy destination share on Data Box device; File Explorer cross-share move i | Use PowerShell Move-Item (Windows) or mv command (Linux) to move files between shares on the Data Box device, which is f | 🟢 8.5 | [ADO Wiki] |
| 10 | ERROR_BLOB_OR_FILE_SIZE_ALIGNMENT when copying data to Data Box page blob share or managed disk folder | Files copied to the page blob share are not 512-byte aligned. Only VHD/VHDX files (512-byte aligned) | Remove non-VHD/VHDX data from page blob share. Use block blob or Azure Files shares for generic data. For managed disks, | 🟢 8.5 | [MS Learn] |
| 11 | Slow data copy to Data Box; host machine itself has performance issues affecting all copy operations | Source host machine has underlying performance problems not specific to Data Box | Isolate by copying same files to local volume or different machine; if host is confirmed slow, collect PerfMon trace and | 🟢 8.0 | [ADO Wiki] |
| 12 | SSL/TLS certificate verification fails (CERTIFICATE_VERIFY_FAILED) when copying data to Data Box via AzCopy or Python SD | Data Box uses a self-signed TLS certificate that is not trusted by the client certificate store. | Download the certificate from Azure portal, then import into system certificate store. For Python, set REQUESTS_CA_BUNDL | 🔵 7.5 | [MS Learn] |
