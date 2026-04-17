# Disk 排查指南索引

| 指南 | 类型 | Kusto | 关键词 | 来源数 | 置信度 |
|------|------|-------|--------|--------|--------|
| [Azure Container Storage (Arc)](acsa.md) | 📋 融合 | 0 | acsa, azure-container-storage-arc, cloud-ingest, configmap, crashloopbackoff | 4 | medium |
| [Azure Disk Encryption (ADE) & BitLocker](ade-bitlocker.md) | 📋 融合 | 0 | 14.04, ade, azure-stack-edge, backup, bdehdcfg | 20 | high |
| [AKS Persistent Volume & Disk](aks-disk.md) | 📊 速查 | 0 | afs, aks, attach, authorizationfailed, availability-zone | 10 | high |
| [Azure Stack Edge: VM & Kubernetes](ase-compute.md) | 📋 融合 | 0 | aks, ap5gc, azure-for-operators, azure-stack-edge, bmc | 6 | high |
| [Azure Stack Edge: Device Management](ase-hardware.md) | 📋 融合 | 0 | 403-error, activation-key, automation, az.stackedge, azure-policy | 4 | medium |
| [Azure Stack Edge: Networking](ase-networking.md) | 📋 融合 | 0 | 403, azure-stack-edge, blobdownloadfailed, bmc, bug | 14 | high |
| [Azure Stack Edge: Storage & Upload](ase-storage.md) | 📊 速查 | 0 | alternate-data-streams, azure-stack-edge, copy-error-665, datadata, error-2998 | 3 | medium |
| [Avere vFXT & HPC Cache](avere-hpc-cache.md) | 📋 融合 | 0 | avere-vfxt, backend, cache-full, cache-policy, core-filer | 9 | high |
| [Azure Files, File Sync & NFS](azure-files-sync.md) | 📋 融合 | 0 | 0x80070032, 21v, agent-v15, azcopy, aznfs | 7 | high |
| [Blob Storage & Transfer Tools](blob-tools.md) | 📋 融合 | 0 | 403, adls, aks, authenticationfailed, azcopy | 5 | high |
| [VM Boot Failures](boot-failure.md) | 📋 融合 | 0 | 0xc00000ba, 0xc0000225, 2tb-limit, active-partition, auditd | 16 | high |
| [CMK & SSE Encryption](cmk-sse-encryption.md) | 📊 速查 | 0 | auto-shutdown, cmk, copy-disk, cross-tenant, customer-managed-key | 5 | high |
| [Data Box Disk: Data Copy & Import](data-box-disk-copy.md) | 📋 融合 | 0 | 409, 5tib, asc, bitlocker, blob | 9 | high |
| [Data Box Disk: Shipping & Mooncake](data-box-disk-logistics.md) | 📊 速查 | 0 | contact, data-box-disk, label, mooncake, phone-unreachable | 2 | medium |
| [Data Box Disk: MARS Offline Backup](data-box-disk-mars.md) | 📊 速查 | 0 | data-box-disk, mars, mmc-crash, offline-backup | 1 | low |
| [Data Box Disk: Unlock & Hardware](data-box-disk-setup.md) | 📋 融合 | 0 | azcopy, bitlocker, blob-upload, compatibility, corrupt | 19 | high |
| [Data Box Disk: DC Upload & Errors](data-box-disk-upload.md) | 📊 速查 | 0 | data-box-disk, delay, icm, logistics, mailbox | 4 | medium |
| [Data Box Disk: Validation & Naming](data-box-disk-validation.md) | 📊 速查 | 0 | 256-chars, azcopy, azure-files, bad-request, blockblob | 18 | high |
| [Data Box Gateway](data-box-gateway.md) | 📋 融合 | 0 | archived-blob, authentication, azure-stack-edge, by-design, copy-failure | 7 | high |
| [Data Box POD: Connectivity & Access](data-box-pod-connectivity.md) | 📋 融合 | 0 | 3rd-party, access, access-denied, account-disabled, account-lockout | 28 | high |
| [Data Box POD: Data Copy & Performance](data-box-pod-copy.md) | 📋 融合 | 0 | 512-byte-aligned, 512-byte-alignment, acl, azcopy, azure-files | 12 | high |
| [Data Box POD: Hardware & Error Codes](data-box-pod-hardware.md) | 📋 融合 | 0 | cable, cables, cluster-resource, connectivity, data-box | 11 | high |
| [Data Box POD: Metadata & ACL](data-box-pod-metadata.md) | 📋 融合 | 0 | acl, azure-files, backup-operator, blob-storage, by-design | 7 | high |
| [Data Box POD: Ordering & Shipping](data-box-pod-ordering.md) | 📋 融合 | 0 | 5-active-orders, 502-error, 5tb-limit, account-lockout, acl | 34 | high |
| [Data Box POD: Prepare to Ship](data-box-pod-prepare.md) | 📋 融合 | 0 | base64, bom, data-box, data-box-pod, download-file-list | 8 | high |
| [Disk Backup, Restore & Snapshots](disk-backup-restore.md) | 📋 融合 | 0 | 403, 500, 60-day-limit, application-consistency, asr | 13 | high |
| [Disk Export, Upload & Access](disk-export-upload.md) | 📊 速查 | 0 | 100-limit, azure-advisor, billing, cleanup, cost | 3 | medium |
| [IaaS Disk Failure (Event 17)](disk-failure-event17.md) | 📋 融合 | 2 | disk-failure, e17, event17, iaasxstorageoutage, rca | 2 | medium |
| [Disk Management (Attach/Detach/Resize)](disk-management.md) | 📋 融合 | 5 | 4tib, attach, attachdiskwhilebeingdetached, blob, blobcache | 13 | high |
| [Disk Performance & Throttling](disk-performance.md) | 📋 融合 | 5 | 30-minutes, 4k, 512e, 512gib, 513gib | 18 | high |
| [Managed Disk Recovery](disk-recovery.md) | 📋 融合 | 1 | asr, backup, blob-recovery, disk-recovery, diskrp | 4 | medium |
| [Azure Import/Export Service](import-export.md) | 📊 速查 | 0 | azure-storage-devices, export-job, import-export, import-job, incorrect-files | 3 | medium |
| [Miscellaneous Disk Issues](misc-disk-issues.md) | 📋 融合 | 0 | access, acquirediskleasefailed, blob, config-hub, coreidentity | 5 | high |
| [Mooncake Operations](mooncake-ops.md) | 📊 速查 | 0 | escort-access, fairfax, geneva-action, mooncake, national-cloud | 1 | low |
| [Azure Shared Disk](shared-disk.md) | 📋 融合 | 0 | aks, azure-files, csv, deallocate, expand | 4 | medium |
| [Storage Account Issues](storage-account.md) | 📋 融合 | 2 | 20000, 404, 409-conflict, 503, access-tier | 14 | high |
| [Storage Spaces & S2D](storage-spaces.md) | 📊 速查 | 0 | nullsessionshares, registry-type-mismatch, smb, sofs | 5 | high |
| [Temporary & Ephemeral OS Disk](temp-ephemeral-disk.md) | 📊 速查 | 0 | cache, d-drive, data-loss, deallocate, deployment-failure | 3 | medium |
| [TLS, Certificates & Security](tls-security.md) | 📊 速查 | 0 | 3des, asc, audit, cipher-suite, client-ip | 5 | high |
| [Ultra Disk, Premium SSD v2 & NVMe](ultra-premium-disk.md) | 📋 融合 | 0 | availability-zone, azure-compute-gallery, completionpercent, cross-region, data-disk-only | 4 | medium |
| [Windows Server Misc KB](windows-misc.md) | 📊 速查 | 0 | print-to-pdf, printer-driver, registry | 12 | high |

最后更新: 2026-04-07
条目总数: 372 | 指南总数: 82 | 融合 topic: 27 | 速查 topic: 14
