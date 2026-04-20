# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | contentidea-kb | Phase 5: scanned 20 WIs (keywords: Managed Disk, Storage), extracted 2 entries (FC SAN port, TCP port exhaustion), 18 skipped (no structured fields) | ContentIdea#68968, #71576 |
| 2026-04-05 | contentidea-kb | Phase 5 tick 2: scanned 10 WIs (#77787-#92343), extracted 8 entries (ASR/Essentials, dedup BSOD, bad password double-count, drive mapping script, cluster node auth, LDAPS SNI, PKI SSL interception, MPIO shutdown hang), skipped 2 (no fields) | ContentIdea#77787-#92343 |
| 2026-04-05 | contentidea-kb | Phase 5 tick 3: scanned 10 WIs (#100083-#102245), extracted 9 entries (WinHTTP hang, DNSSEC zone scope, BSOD 0x7E, Event 1230 flood, ISE domain join, W32Time start fail x2, Runas access denied, mount point permissions), skipped 1 (no symptom). Total: 26 entries, 50 scanned, 105 remaining | ContentIdea#100083-#102245 |

## 2026-04-05 contentidea-kb batch 6
- Scanned 10 work items (92477-98492), 1 skipped (empty fields), 9 extracted
- New entries: disk-contentidea-kb-027 to disk-contentidea-kb-035
- Topics: NT Kernel Logger conflict, nmap TLS/NLA, cluster validation MPIO, rdbss bugcheck 27, Symantec logon hang, NETIO RSC hang, Azure VM Spectre bugcheck, PS Invoke-Command deserialization, S2D Multi-Resilient resize
- Total scanned: 60/155, remaining: 95

### 2026-04-05 contentidea-kb tick (batch 7)
- **Source**: ContentIdea KB (keywords: Managed Disk, Storage)
- **Scanned**: 10 work items (99523, 102323, 102782, 102984, 104220, 104443, 104888, 104912, 105875, 108178)
- **Discovered**: 8 new entries (disk-contentidea-kb-036..043)
- **Deduplicated**: 1 (102323 had only "NA" content)
- **Skipped**: 1 (108178 had no structured fields)
- **Topics**: LDAP memberof DIR_ERROR, smartcard crypto perf, unknown TCP connections, Cloud Witness TLS 1.2, WebDAV 403.14, DFSR backlog, NTFS mount points limit, boot failure after KB install
- **Exhausted**: false (85 remaining)

| 2026-04-05 | 21v-gap-scan | Phase 1: No Feature Gap files found in POD Services/Azure Shared Disks. Grep fallback also found no disk-specific 21v gap data. Wrote empty 21v-gaps.json with noGapDataFound=true. 0 unsupported, 0 partial features | SERVICES_DIR/Azure Shared Disks |

### 2026-04-05 mslearn tick 1 (fallback search)
- **Source**: Microsoft Learn (fallback search mode, no toc.yml mapping)
- **Searches**: 6 queries (troubleshoot, error codes, attach/detach, performance, encryption, resize)
- **Pages fetched**: 8 (error-messages, deployment-detached, slow-attach-aks, fulldisk-boot, vm-perf, mbr-to-gpt, disk-encryption, expand-disks)
- **Discovered**: 10 new entries (disk-mslearn-001..010)
- **Deduplicated**: 0
- **Topics**: AttachDiskWhileBeingDetached, slow AKS disk ops (in-tree→CSI), auditd HALT on full disk, cloud-init Errno28 after resize, MBR 2TB partition limit, VM/disk IOPS throttling, storage account 20K IOPS limit, CMK key disabled auto-shutdown, disk resize deallocate requirement, blob lease conflicts
- **Exhausted**: false (more search queries possible)

### 2026-04-05 ado-wiki Phase 3a (index build)
- **Source**: ADO Wiki (Supportability/AzureStorageDevices/AzureStorageDevices.wiki)
- **Indexed**: 157 leaf pages
- **Categories**: Avere FXT/vFXT (15), HPC Cache (7), Azure Container Storage Arc (6), Data Box Disk (18), Data Box Gateway (7), Data Box (46), Import-Export (3), Azure Root Cause Tree (2), Azure Stack Edge (33), ASD Wiki meta (4), WebApps training (3), Misc (13)
- **Discovered**: 0 (index-only tick)
- **Exhausted**: false (157 pages pending extraction)

### 2026-04-05 onenote Phase 2 tick 1
- **Source**: OneNote (MCVKB/VM+SCIM Storage section + wiki_migration)
- **Scanned**: 10 pages (8 high confidence, 2 medium; 1 page had no content)
- **Discovered**: 11 new entries (disk-onenote-001..011)
- **Deduplicated**: 0
- **Topics**: ADE error 2147942487, soft-delete disk recovery, hard-delete disk recovery, IaaS Disk Failure E17, TRIM/billing thin-provisioning, TRIM dynamic disk workaround, temp disk data loss prevention, blob/unmanaged disk recovery, VM-level cached throttling, sync IO latency limitation, disk benchmark guide
- **Track A (break/fix)**: 10 triples
- **Track B (guide-draft)**: 1 (disk benchmark testing)
- **Exhausted**: false (many more pages from Data Box, AKS storage, STORAGE section in Mooncake notebook)

### 2026-04-05 contentidea-kb tick (batch 8)
- **Source**: ContentIdea KB (keywords: Managed Disk, Storage)
- **Scanned**: 10 work items (115208, 115265, 115839, 116175, 116332, 116664, 116780, 116793, 117254, 117642)
- **Discovered**: 9 new entries (disk-contentidea-kb-050..058)
- **Deduplicated**: 0
- **Skipped**: 1 (115839 - Azure File Sync Agent release note, no symptom)
- **Topics**: Storage pool virtual disk offline (Event 150), Get-PhysicalDisk empty output, DirectAccess LB clients unable to connect x2, Folder Redirection GPO on RDS, ghost redirected printers, Storage Spaces virtual disk offline after unexpected reboot, DNS dynamic forwarding internals, S2D pool down after physical relocation
- **Exhausted**: false (65 remaining)

### 2026-04-05 onenote Phase 2 tick 2
- **Source**: OneNote (Mooncake POD: AKS storage, STORAGE Case Study)
- **Scanned**: 10 pages (7 high confidence, 3 had minimal/no extractable content)
- **Discovered**: 7 new entries (disk-onenote-012..018)
- **Deduplicated**: 0
- **Topics**: AKS LRS disk cross-AZ pod failure, blobfuse volume size vs temp disk cache, Premium SSD VM-level throughput throttling, blobfuse logging guide, blobfuse2 CSI setup guide, blobfuse2 static mount with MSI guide, DiskRP Kusto log tracing guide
- **Track A (break/fix)**: 3 triples
- **Track B (guide-draft)**: 4 drafts written to guides/drafts/
- **Exhausted**: false (223 remaining from 243 total disk pages)

## 2026-04-05 ado-wiki tick-1
- **Batch**: pages 0-9 (Avere vFXT: Quick Ref, Main Links, Scoping Qs, CLI cmdlets + 3 empty)
- **Track A**: 4 break/fix items (slot exhaustion, cache full, revocation stuck, swap pressure)
- **Track B**: 2 guide drafts (avere-vfxt-quick-reference-sheet, avere-cli-cmdlets)
- **Skipped**: 4 pages (links page, 3 empty parent pages)
- **JSONL entries**: disk-ado-wiki-001 ~ 006
- **Remaining**: 147/157 pages

### 2026-04-05 ContentIdea KB Scan (batch continuation)
- **Source**: ContentIdea KB (keywords: Managed Disk, Storage)
- **Batch**: 10 work items scanned (IDs: 119883, 120626, 120628, 120657, 120993, 121094, 121161, 124289, 125358, 126005)
- **Discovered**: 9 new entries (1 skipped: empty fields - Azure File Sync release note)
- **Deduplicated**: 0
- **JSONL entries**: disk-contentidea-kb-059 ~ 067
- **Highlights**: Azure Files Kerberos >16K ticket failure, VM Storage resiliency out-of-sync, WCIFS.sys bugcheck with Symantec
- **Total scanned**: 100/155, Remaining: 55
- **JSONL fix**: Repaired concatenated JSON lines and invalid escape sequences in existing JSONL (58 entries pre-batch)

### 2026-04-05 — ado-wiki batch (chain, pages 16-18/157)
- Scanned: HPC Quick Reference Sheet, Kusto queries, Support Operations - Collect Traces
- Track A: 3 break/fix entries (013-015: HPC Cache throughput immutability, slot exhaustion, backend latency)
- Track B: 3 guide drafts (016-018: hpc-quick-reference-sheet, kusto-queries, collect-traces)
- Deduped: 2 (policy mismatch ~85% overlap 001, cache fullness ~85% overlap 002)
- Remaining: 139 pages

### 2026-04-05 onenote tick (pages 31-40)
- **Batch**: Data Box Disk understanding + Data Box POD management pages
- **Pages scanned**: 10 (4 Data Box Disk overview, 6 Data Box POD management)
- **Discovered**: 6 new break/fix entries (disk-onenote-028 to 033)
- **Skipped**: 4 pages too thin (feature overviews, image-only, lab page)
- **Deduplicated**: 0 (no overlap with existing entries)
- **Coverage**: 40/243 pages scanned
- **Topics**: Data Box POD order creation issues (region/address/prerequisites/limit), managed disk import via Data Box POD (VHD alignment, folder structure)

## 2026-04-05 ado-wiki tick (batch 4)
- Pages scanned: 6 (Get Cache Plus, Reboot Cache, Restart Services, Top Customer Scenarios, ACSA LAB [empty], Common errors Kubernetes)
- Track A entries: 3 (disk-ado-wiki-023 CrashLoopBackOff, 024 PendingPods, 025 CreateContainerConfigError)
- Track B guide drafts: 5 (019 get-cache-plus, 020 reboot-cache, 021 restart-services, 022 top-customer-scenarios, 026 common-errors-kubernetes)
- Total scanned: 24/157, remaining: 133

## 2026-04-05 onenote tick 5 (batch 5)
- Pages scanned: 10 (Data Box POD: Ordering, Resetting, Prepare to Ship, NFS/SMB/REST shares, Data Copy Service, Verifying import, Troubleshooting index, Support packages)
- Track A entries: 7 (disk-onenote-034 Prepare-to-Ship errors, 035 Completed-with-errors, 036 slow/stalled copy, 037 version mismatch, 038 time zone, 039 network port, 040 cluster resource)
- Track B guide drafts: 1 (disk-onenote-041 support package analysis)
- Skipped pages: 6 (generic operational guides with no break/fix content)
- Total scanned: 50/243, remaining: 193

## 2026-04-05 contentidea-kb tick (scanned 110/155)
- **Scanned**: 10 work items (126375, 126391, 142128, 142140, 150419, 151198, 151532, 153607, 155848, 156011)
- **Discovered**: 7 new entries (disk-contentidea-kb-068 ~ 074)
- **Skipped**: 3 (142128 retirement notice, 142140 empty, 156011 tool guide no rootCause/solution)
- **Deduplicated**: 0
- Topics: DHCP failover events, Print to PDF driver, boot hang SxS, NPCAP BSOD, SOFS SMB registry type mismatch, DHCP option deletion, perfmon counters disabled

### 2026-04-05 ado-wiki batch 4 (pages 31-40)
- Scanned 10 pages (6 with content, 4 empty)
- Track A: 5 break/fix entries (032-036) — Data Box Disk: Oracle Linux mount, security locked, copy stuck, wrong label, subfolder validation
- Track B: 1 guide draft (037) — Data Box Disk Internal Error in Portal
- Deduplication: 0 skipped
- Progress: 40/157 scanned, 117 remaining

### 2026-04-05 ado-wiki tick (batch: Data Box Disk pages 2/N)
- **Pages processed**: 10 (8 with content, 2 empty/skipped)
- **Track A (Break/Fix)**: 5 entries (disk-ado-wiki-032 to 036)
  - Oracle Linux 7.9 unsupported OS mount failure
  - Security Locked state (unrecoverable after power drops)
  - Copy to Azure stuck (DriveCopyTimeout / DNS failure)
  - Customer returned with wrong shipping label (order not linked)
  - Subfolders disappear during validation (hidden/permission)
- **Track B (Guide)**: 1 entry (disk-ado-wiki-037) — Internal Error in portal troubleshooting
- **Empty/parent pages skipped**: 4
- **Remaining**: ~117 pages

### 2026-04-05 onenote tick 6 (batch 6)
- Pages scanned: 10 (Data Box POD: hardware, Prepare-to-Ship perf, copy tool, SMB/NFS, REST API, data upload, data export, WebUI, Understanding, Lab activities)
- Track A entries: 8 (disk-onenote-042 hardware/power-on, 043 PtS slow/stuck, 044 copy job stalled, 045 SMB/NFS share access, 046 slow NFS Linux, 047 REST API auth, 048 export data verification, 049 WebUI access)
- Track B guide drafts: 0
- Skipped pages: 2 (Lab activities empty, Understanding Data Box POD informational only)
- Deduplicated: 0 (043 marked relatedTo disk-onenote-034 at ~55% overlap)
- Total scanned: 60/243, remaining: 183

### 2026-04-05 contentidea-kb tick (scanned 120/155)
- **Scanned**: 10 work items (156626, 157563, 158769, 159943, 159948, 162215, 162790, 163418, 167678, 168564)
- **Discovered**: 10 new entries (disk-contentidea-kb-075 ~ 084)
- **Skipped**: 0
- **Deduplicated**: 0
- Topics: AD cert services storage, Azure Fileshare group membership, Remote EFS encryption, DNS PTR registration, RODC DNS blocking, AdminSDHolder nested group, Storage Server 2012 R2 file server, SQL AG cluster MPIO, website authentication failure, second logon black screen timeout

### 2026-04-05 ado-wiki batch (tick ~6, seq 038-044)
- **Pages processed**: 7 (5 with content, 2 empty parents)
- **Track A (break/fix)**: 6 entries (write-protected, RHEL passkey, undetected disk, unlock failure, storage account change, country availability)
- **Track B (guide-draft)**: 1 entry (expand data disk on Data Box Gateway)
- **Remaining**: ~109 pages

## 2026-04-05 onenote-extract tick (pages 61-70)

- **Pages processed**: 10 (Data Box POD Understanding x5, Readiness/Storage x2, Azure Shared Disks x3)
- **New entries**: 6 (disk-onenote-050 ~ 055)
  - Track A: 5 break/fix (cross-region FAQ, fee model, shared disk ICM, multi-writer, archive export)
  - Track B: 1 guide-draft (databox-pod-requirements-limits.md)
- **Deduplicated**: 0
- **Skipped**: 4 pages (thin content: features overview, device specs, use cases, PM contact)
- **Remaining**: 173 / 243
- **Exhausted**: false

### ADO Wiki Scan — Chain (Data Box Gateway batch)

- **Source**: ado-wiki (Supportability/AzureStorageDevices)
- **Pages processed**: 6 (Data Box Gateway/Connectivity & Performance: upload failure, 0x8007003A, local cache, DBG share updating, readonly datadata, error 2003)
- **New entries**: 8 (disk-ado-wiki-043 ~ 050, after dedup/renumber from concurrent overlap)
  - Track A: 8 break/fix (DBG archived blob upload, 0x8007003A archived blob, slow file cache, upload error 2003, undetected disk, unlock failure, storage account change, country dropdown)
  - Concurrent overlap fixed: removed 3 true duplicates, renumbered 043-050
- **Deduplicated**: 3 (write-protected dup, RHEL passkey dup, expand disk dup)
- **Skipped**: 2 pages (empty: DBG share updating, readonly datadata)
- **Remaining**: 104 / 157
- **Exhausted**: false

### 2026-04-05 ado-wiki batch (pages 55-59)
- Scanned 5 pages (1 empty): Data Box Connect & Copy section (ACL/Permissions, Copy Job stuck, Slow copy, SMB lockout, Metadata preservation)
- Extracted 12 entries (disk-ado-wiki-051 to 062): ACL handling, UAC blocking, small file perf, filter drivers, metadata/NFS limitations, Backup Operator, timestamps
- 0 deduplicated, 99 pages remaining

| 2026-04-05 | contentidea-kb | +10 entries (disk-contentidea-kb-085~094): PKI web enrolment, FSLogix VHDs/DFS, servicing errors (ESU/LSASS crash), Azure Files capacity query, Storage Server ESU activation | ContentIdea#171035-190496 |
### 2026-04-05 — ado-wiki tick (63-66)
- Scanned 4 pages: Data Box Connect & Copy (move files, error 1909 lockout, NFS permission, MARS NFS detection)
- Extracted 4 break/fix entries (all Track A)
- 0 deduplicated, 0 guide-drafts
- Progress: 68/157 scanned, 89 remaining
| 2026-04-05 | onenote | +11 entries (disk-onenote-056~066): Data Box Disk process flow (mailbox/erasure/label/re-unlock/AzureFile root/validation perf/MARS MMC crash/folder name), Shared Disk Kusto query, +2 guide drafts (process-flow, data-preparation) | Mooncake POD - Data Box Disk process test, Shared Disks |

- [2026-04-05 09:28] Phase 5 contentidea-kb tick: +10 extracted (095-104), 0 dedup, 15 remaining. IDs: 190625,190998,192362,193583,193618,193894,193911,193927,194273,194291

## 2026-04-05 contentidea-kb scan (final batch)
- Source: ContentIdea KB (keywords: Disk, Storage)
- Processed: 15 work items (IDs 194341–206066)
- New entries: 15 (disk-contentidea-kb-105 → 119)
- Deduplicated: 0
- Total scanned: 155, Total JSONL entries: 119
- Status: **EXHAUSTED** — all ContentIdea KB items for disk/storage processed

- [2026-04-05] ado-wiki tick: scanned 4 pages (Data Box Connect&Copy), +5 entries (disk-ado-wiki-072~076): SMB/NFS network connectivity, share permission denied, Storage Explorer container creation, file/folder deletion robocopy, NFS mount config. 0 dedup, 0 guides. Progress: 72/157 scanned, 85 remaining.

## 2026-04-05 Phase2 onenote-extract (batch: Data Box Disk Self-Managed Shipment process test)

- **Pages scanned**: 10 (Data Box Disk process test - MS-Managed return/upload/MARS + Self-Managed order/prep/pickup/copy/dropoff)
- **New entries**: 3 (disk-onenote-067~069)
  - 067: Uppercase container/share names → InvalidShareContainerFormat (relatedTo: 021)
  - 068: Data Box Disk re-unlock required after host reboot
  - 069: USB drive ejection during high-thread Robocopy (relatedTo: 024)
- **Deduplicated**: 1 (hidden folders after Robocopy = disk-onenote-019)
- **Skipped (no extractable content)**: 6 pages (process screenshots only, no break/fix triplets)
- **Progress**: 90/243 pages scanned (37%)
| 2026-04-05 | onenote | Phase 2 tick (continued): scanned 10 pages (Data Box Disk process test + Managing Data Box Disk section), extracted 10 entries (disk-onenote-070 to 079). Topics: invalid PageBlob redirect, duplicate folder merge, Mooncake prep SLA, self-managed security delay, unreachable return phone, DC data copy delay, user-created folder upload failure, dynamic VHD not supported, long path validation, Split Copy restriction. 4 pages skipped (images-only or pure doc references). 100/243 scanned, 143 remaining. | Data Box Disk process test, Managing Data Box Disk |

### 2026-04-05 onenote-extract tick (scanned 101→110)
- **Pages processed**: 10 (Data Box Disk managing/troubleshooting + Azure File Sync)
- **Track A (break/fix)**: 2 new entries (disk-onenote-080, 081)
  - 080: FileNotFound after validate+move files
  - 081: Portal "Copy Completed" but logs have errors (no validation)
- **Track B (guide-draft)**: 2 pointer entries (082, 083) → `guides/drafts/onenote-azure-file-sync-troubleshooting.md`
  - AFS initial sync stages, Jarvis queries, diagnostic cmdlets, performance benchmarks
- **Deduplicated**: 2 (InvalidPageBlobUploadAsBlockBlob ≈ 070, MovedToDefaultAzureShare ≈ 060)
- **Skipped (no content)**: 6 (procedure pages, FAQ index, empty lab page, process flow image)
- **Remaining**: 133 pages

### 2026-04-05 ado-wiki batch (103-105)
- Pages: 3 (all Track B guide-drafts)
- Connecting to Support Session on Data Box, Refund/Waiver Process, Create IcM for Data Box
- Discovered: 3, Deduplicated: 0
- Remaining: 55 pages

### 2026-04-05 Phase2 onenote tick (续跑)
- Scanned: 10 pages (Azure File Sync performance sub-pages + Azure Storage architecture)
- Discovered: 4 new entries (disk-onenote-084~087)
  - 084: AFS StorageFileLogs operation mapping (relatedTo: 082)
  - 085: Robocopy initial delay (no files for 2+ hours) (relatedTo: 083)
  - 086: Robocopy /MT thread recommendation for Azure Files (relatedTo: 083)
  - 087: [Guide-draft] Azure Storage architecture (FE/Partition/Stream layers)
- Deduplicated: 6 (Azcopy round 1/2 ≥80% overlap w/ 083, File to blob empty, Summarize ≥80% w/ 083, Jarvis Logs ≥80% w/ 082, Storage Basic Understanding empty)
- Total scanned: 120/243, remaining: 123

| 2026-04-05 | onenote | +9 entries (088-096): Blobfuse2 rm-rf, SA exclusive lock, 404 stamp migration, firewall IP mismatch, stamp throttling, partition merge latency, CMK MSI None, premium access tier bug, 21v feature gap guide | Phase 2 batch |
  - 088: [Guide-draft] Storage feature gap Global vs 21v
  - 089: Blobfuse2 rm -rf fails without HNS
  - 090: SA exclusive lock 409 - engage PG to release
  - 091: 404 after stamp migration - stale DNS/hosts
  - 092: Firewall IP mismatch - multiple outbound IPs
  - 093: ServerBusy 503 stamp-level throttling
  - 094: GetBlob 24s latency - partition merge transient
  - 095: InternalError - CMK with MSI None
  - 096: Premium SA shows access tier - Portal/SRP bug
  - Skipped: 2 (Training links-only, Case Study index-only)
  - Deduplicated: 0
  - Total scanned: 130/243, remaining: 113

| 2026-04-05 | onenote | +1 entry (097): guide-draft latency troubleshooting methodology + created guides/drafts/onenote-storage-latency-troubleshooting.md | Phase 2 chain (dedup cleanup of overlapping run) |
  - 097: [Guide-draft] Storage account latency troubleshooting methodology
  - Note: Previous run already extracted 088-096 from same batch; this run added 097 and cleaned 9 duplicate entries
  - Total JSONL: 97, scanned: 130/243, remaining: 113

| 2026-04-05 | onenote | +9 entries (098-106): 6 break/fix + 3 guide-drafts from STORAGE/Case Study pages | Phase 2 chain |
  - 098: SRP not registered → CheckNameAvailability 404
  - 099: AFS recall error 0x80070032 unsupported characters
  - 100: AFS agent v15 high CPU (TieringStatusBootstrapMaxThreadCount=0)
  - 101: Blob SDK AuthenticationFailed 403 (clock drift / stale auth)
  - 102: Blob LCM policy rule not executing (xstore cluster config bug)
  - 103: Disk perf CE vs CE2 (RDSSD AllDisksInStripe vs AllDisksAbc)
  - 104: [Guide-draft] AFS enumeration ETA + Jarvis queries
  - 105: [Guide-draft] Blob capacity calculation methods
  - 106: [Guide-draft] Azure Files AD DS cross-forest auth
  - 1 page skipped (file not found): AzureFileSync 0x800B0109
  - Total JSONL: 106, scanned: 140/243, remaining: 103
| 2026-04-05 | onenote | +1 entry (107): NFS mount failure AKS troubleshooting guide-draft + created 2 guide drafts (azure-files-ad-ds-cross-forest, nfs-mount-failure-aks). Dedup cleanup: removed 9 duplicate JSONL entries + 10 duplicate scanned paths from concurrent run overlap. | Phase 2 chain |
  - 107: [Guide-draft] AKS node NFS mount failure (strace, tcpdump, kubectl-enter, Jarvis)
  - New guide drafts: onenote-azure-files-ad-ds-cross-forest.md, onenote-nfs-mount-failure-aks.md
  - Total JSONL: 107, scanned: 141/243, remaining: 102
| 2026-04-05 | ado-wiki | Phase 3 exhaustive scan COMPLETED: 48 new entries (disk-ado-wiki-113 to 160) from AzureStorageDevices wiki. Topics: Data Box ordering/shipping/prepare-to-ship, Import-Export journal files/managed disks, ASE activation/certificates/hardware/K8s/VMs/networking/web proxy. 12 guide drafts created. 0 deduplicated. Exhausted=true (157/157 scanned). | Supportability/AzureStorageDevices |

### 2026-04-05 onenote-extract tick (pages 142-151)
- **Pages processed**: 10 (NFS EiT aznfs, cert workaround, azcopy cert, customer tools, azcopy ref, azcopy susan, customer migration solutions, blobfuse, storage explorer, feature readiness)
- **Discovered**: 4 break/fix entries (disk-onenote-108~111) + 2 guide-drafts (112~113)
- **Deduplicated**: 0 (1 marked relatedTo: disk-onenote-083)
- **Skipped**: 4 pages (empty/image-only: Customer Tools, Azcopy Susan, Storage Explorer, Feature Readiness)
- **Guide drafts created**: onenote-nfs41-encryption-in-transit-aznfs.md, onenote-azcopy-support-reference.md
- **Key themes**: DigiCert G1→G2 cert migration impact on NFS EiT in Mooncake, azcopy cert trust failures, large-scale file migration tool selection
- **Remaining**: 92 pages

### 2026-04-05 onenote-extract tick (batch ~114-118)
- **Processed**: 10 pages from Feature Readiness section (Ultra Disk, copy operations, IPv6, AAD Kerberos, Blob NFSv3, Azure Data Transfer, Blobfuse config, Deprecated Features, TLS retirement, GPv1 migration)
- **Discovered**: 5 new entries (disk-onenote-114 to 118)
  - Ultra Disk feature readiness (guide-draft)
  - Blob NFSv3 setup guide (guide-draft)
  - Blobfuse config priority order (raw)
  - TLS 1.0/1.1 retirement handling (raw)
  - Legacy Blob/GPv1 account migration (raw)
- **Skipped**: 5 pages (empty/images-only: copy operations, IPv6, AAD Kerberos, Azure Data Transfer, Deprecated Features index)
- **Deduplicated**: 0
- **Remaining**: ~82

## 2026-04-05 10:50 — disk onenote-extract (tick)

- **Batch**: 10 pages (scanned 171→181 of 243)
- **Discovered**: 3 new entries (disk-onenote-119 to disk-onenote-121)
  - 119: Storage billing latency for large accounts
  - 120: AKS+AFS crash after storage migration (Linux kernel DNS bug)
  - 121: Vulnerability scan TLS false positive on storage with private endpoint
- **Deduplicated**: 0
- **Skipped**: 7 pages (empty/deprecated/link-only/duplicate guide)
- **Remaining**: 72 pages
- **Exhausted**: false

### 2026-04-05 Phase 2 tick (onenote) — batch 20
- **Scanned**: 10 pages (STORAGE/MISC + Case triage 4/18/2019)
- **New entries**: 2 (disk-onenote-122..123)
  - 122: Standard disk IOPS 500 limit hit due to consistent hash load imbalance (open-falcon)
  - 123: Managed disk snapshot rate limit exceeded (Commvault + ASR A2A concurrent snapshots)
- **Deduplicated**: 1 (VM Storage Throttling Demystified ≥80% overlap with 009/010)
- **Skipped**: 7 pages (Geneva Action internal ops, deprecated links, Blob MD5, blog archive, case index, image-only)
- **Remaining**: 62 pages
- **Exhausted**: false

## 2026-04-05 onenote-extract (final batch)

- **Source**: onenote
- **Pages processed**: 92 (all remaining)
- **New entries**: 15 (disk-onenote-119 to disk-onenote-133)
- **Deduplicated**: 5 (duplicate IDs removed during batch processing)
- **Guide drafts**: 1 (onenote-databox-import-export-case-handling-china.md)
- **Status**: **exhausted** (243/243 disk pages scanned)
- Key topics: Chrome Local Network Access, AKS kernel bug, TLS vulnerability scan false positive, SRP API throttling, SSE disable, AccountPendingMigrationToSrp, snapshot rate limit, Geneva Action RBAC, E17 VhdDiskPrt, IPv6 mapping

### 2026-04-05 Phase 2 tick (onenote) — batch 21 (continuation)
- **Scanned**: 10 pages (STORAGE/MISC, PG Connection section)
- **New entries**: 1 guide-draft (disk-onenote-134: NFS 4.1 vs SMB protocol comparison)
- **Deduplicated**: 2 (Blob Unicode special char ≥80% overlap with 132; ZRS migration ≥80% overlap with 131)
- **Skipped**: 7 pages (empty section headers, training links, contacts, meeting process notes)
- **Guide drafts**: 1 (onenote-nfs41-vs-smb-protocol-comparison.md)
- **Remaining**: 0 pages (previous batch already processed remaining pages)

### 2026-04-05 — mslearn-scan fallback round (3 new queries)

- **Queries**: "Azure disk performance troubleshoot bursting", "Azure Ultra Disk SSD troubleshoot", "Azure disk encryption BitLocker error"
- **Fetched**: 8 new pages (BitLocker boot error, ADE extension 2.2, ADE troubleshooting guide, Disk FAQ, Ultra Disk usage, Disk metrics, On-demand bursting, Instant access snapshots)
- **Extracted**: 11 Break/Fix entries (disk-mslearn-027 to disk-mslearn-037)
  - 027: BitLocker boot error — VM can't locate BEK file
  - 028: ADE extension version 2.2 not supported
  - 029: ADE "Failed to send DiskEncryptionData" error
  - 030: ADE fails behind firewall/proxy/NSG
  - 031: ADE fails on Server Core — bdehdcfg missing
  - 032: ADE encryption status mismatch after manual manage-bde
  - 033: Ultra Disk IOPS limited by VM-level throttle (relatedTo: 006)
  - 034: Cannot shrink managed disks
  - 035: Host caching not supported for disks >= 4096 GiB
  - 036: On-demand bursting constraints (relatedTo: 017)
  - 037: Ultra Disk instant access snapshot cross-region limitations
- **Guide draft**: 1 (mslearn-disk-performance-metrics-reference.md)
- **Deduplicated**: 0 (all 11 are net new)
- **Total mslearn entries**: 37
- **Exhausted**: false (more search queries possible)

### 2026-04-05 — mslearn-scan fallback round (3 new queries, tick 3)

- **Queries**: "Azure shared disk troubleshoot SCSI reservation failover", "Azure disk snapshot error restore failure", "Windows VM disk offline missing drive letter"
- **Fetched**: 8 new pages (restore-point-troubleshooting, unlock-encrypted-disk-offline, backup-azure-vms-troubleshoot, change-drive-letter, troubleshoot-disk-management, cant-take-disk-offline-ws2022, disks-shared-enable, restore-managed-disks)
- **Extracted**: 17 Break/Fix entries (disk-mslearn-038 to disk-mslearn-054)
  - 038-042: VM restore point errors (SAS lock, disk allocation, KeyVault, VSS, snapshot limit)
  - 043: ADE encrypted disk offline unlock (high confidence)
  - 044-047: Backup failures (BitLocker VSS, fsfreeze, snapshot limit, IOPS timeout)
  - 048: Disk offline/missing in Disk Management (SAN policy, initialization)
  - 049: WS2022 can't take disk offline (VM hang)
  - 050-051: Shared disk limitations (resize while attached, ADE not supported)
  - 052-053: Disk backup restore RBAC/naming errors
  - 054: Post-restore disk offline / Linux UUID mount issue
- **Guide drafts**: 3 (mslearn-unlock-encrypted-disk-offline.md, mslearn-vm-restore-point-troubleshooting.md, mslearn-shared-disk-limitations-reference.md)
- **Deduplicated**: 0 (all 17 are net new)
- **Total mslearn entries**: 54
- **Exhausted**: false (more search queries possible, but diminishing returns)

### 2026-04-05 mslearn-scan (batch 9 — fallback-search)

- **Queries**: NVMe troubleshoot, CMK encryption errors, RBAC disk access, VM disk offline repair
- **Fetched**: 8 new URLs (NVMe FAQ, CMK portal, secure upload/download, unlock encrypted disk, kernel boot issues, dracut emergency, VFAT boot, NVMe overview)
- **Track A (break/fix)**: 7 entries (disk-mslearn-092 ~ 098) — NVMe image support, CMK DES identity delay, CMK cross-tenant failure, CMK incremental snapshot lock-in, Entra ID Data Operator RBAC, SAS 60-day limit, VFAT disabled boot failure
- **Track B (guide-draft)**: 3 entries (disk-mslearn-099 ~ 101) + 3 draft files — ADE disk unlock offline, kernel boot issues, dracut emergency shell
- **Deduplicated**: 0 (all new topics)
- **Total entries**: 101 (91 prior + 10 new)
- **Scanned URLs**: 83, Search queries: 40
- **Exhausted**: false (more search queries possible, but diminishing returns)

| 2026-04-06 | ado-wiki (blast-a) | +12 entries from 10 ADO Wiki pages (batch a, round 4) | AzureStorageDevices.wiki |

**Batch a, Round 4 — ADO Wiki Blast**:
- **Pages processed**: 10 (6× Data Box/Prepare to Ship, 2× Import-Export Service, 2× Root Cause Tree)
- **Track A (break/fix)**: 12 entries (disk-ado-wiki-a-r4-001 ~ 012)
  - Prepare to Ship: scan errors (4 sub-entries), stuck at 86%/BOM, SE_METADATA_NOT_FOUND, 502 WebUI, LFS >5TB, shipping label
  - Import-Export: incorrect export files, journal file issues (incomplete + 2MB limit)
- **Track B (guide-draft)**: 0
- **Skipped**: 2 pages (Root Cause Classification = non-TSG reference table; Config Hub = permission request guide)
- **Deduplicated**: 0 within batch (entry 009 marked relatedTo 002: same ERROR_CONTAINER_OR_SHARE_CAPACITY_EXCEEDED, different detail level)
- **Isolation**: JSONL→.enrich/known-issues-ado-wiki-a.jsonl, scanned→.enrich/scanned-ado-wiki-a.json

| 2026-04-06 | ado-wiki (blast-a) | +5 entries from 10 ADO Wiki pages (batch a, round 7) | AzureStorageDevices.wiki |

**Batch a, Round 7 — ADO Wiki Blast**:
- **Pages processed**: 10 (3× ASE/Virtual Machines, 2× ASE/Web Proxy, 5× meta/training pages)
- **Track A (break/fix)**: 5 entries (disk-ado-wiki-a-r7-001 ~ 005)
  - ASE VM: ProvisioningTimeOut (IP conflict with K8s hosts), boot failure 0xC0000098 after resize, trial license 180-day auto-shutdown (wlms.exe)
  - ASE Web Proxy: NTLM auth removed from Local UI (use PowerShell Set-HcsWebProxy), proxy URL validation fail (whitelist msftconnecttest.com)
- **Track B (guide-draft)**: 0
- **Skipped**: 5 pages (ASD Training Manual = link only, Common Misroutes = internal SAP routing, Getting Started/Wiki Tips = wiki meta, WebApps Data capturing = unrelated product)
- **Deduplicated**: 0 within batch
- **Isolation**: JSONL→.enrich/known-issues-ado-wiki-a.jsonl, scanned→.enrich/scanned-ado-wiki-a.json
| 2026-04-07 | SYNTHESIZE | 41 topics (27 fusion, 14 compact), 372 entries, 15 Kusto queries fused |

### 2026-04-17 10:12 UTC — contentidea-kb refresh (disk)
- **WIQL 返回**: 155 条（keywords: Managed Disk, Storage）
- **已扫描**: 155 条（全部覆盖）
- **新发现**: 0 条
- **结果**: exhausted=true, lastRefreshed 已更新
- **触发**: 7 天刷新重扫（lastRefreshed was null）

### 2026-04-18 09:06 UTC — Phase 4b mslearn batch
- Fetched 8 URLs from index (fallback-search mode)
- 7/8 off-topic (AKS/AppGW/Dynamics365/IIS) — no disk-relevant content
- 1/8 disk-relevant: AKS disk I/O latency troubleshooting (Track B → draft guide)
- New JSONL entries: 0 (guide-only content)
- New draft: `guides/drafts/mslearn-troubleshoot-high-disk-io-latency-aks.md`
- Remaining unscanned: 108 of 116 index URLs

## 2026-04-18 17:15 — mslearn Phase 4b (batch)
- URLs fetched: 8
- All 8 irrelevant to Azure Disk (App Service, Application Gateway, AGIC topics)
- Discovered: 0 | Deduplicated: 0
- Remaining unscanned: 100
- Exhausted: false
- Note: fallback-search index contains significant noise from non-disk topics
| 2026-04-20 | mslearn | Built toc.yml index: 28 URLs (14 blobs + 14 files), 28 pending | azure/azure-storage/blobs, azure/azure-storage/files |
| 2026-04-20 | ado-wiki | disk: indexed 157 wiki pages (102 pre-scanned from existing JSONL, 55 unscanned) | Supportability/AzureStorageDevices |
| 2026-04-20 | contentidea-kb | +4 disk entries (37 scanned, 33 empty/no symptom), source exhausted | WIQL: Managed Disk, Storage |
