# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-06 | ado-wiki (batch-c) | +1 break/fix (GME/AME account disabled after 90d inactivity) +8 guide-drafts (OOFBuddy, AME/GME guide, SAW guide, Known Issue process, check subscription by outage, LSI SIE Playbook, On-Call Engagement, Outage Alerts), 0 deduplicated. 10 pages processed (2 empty/parent skipped) | Supportability/AzureIaaSVM:/Processes/Case Handling/* |
| 2026-04-05 | mslearn | +9 break/fix, +2 guide-drafts (kernel panic, GRUB rescue), 0 deduplicated. Topics: ext4/xfs fs corruption, fstab errors, Hyper-V drivers, 3.10 kernel panic, device name changes, Switch Root | linux boot/fs troubleshoot articles |
| 2026-04-05 | ado-wiki | +1 break/fix (DCesv6/ECesv6 Linux time drift) +1 guide-draft, 3 deduped vs DCesv5 entries | Supportability/AzureIaaSVM:/Announcements/DCesv6 and ECesv6 VM Series_Announcements |
| 2026-04-04 | 21v-gap-scan | 21v-gap-scan: 5 unsupported, 1 partial features | POD/VMSCIM/4. Services/VM |
| 2026-04-04 | onenote-extract | onenote-extract tick 1: 10 pages scanned, 10 entries written (7 Track A + 3 Track B guide-drafts), 0 deduplicated | MCVKB/VM+SCIM sections: Process, Backup |
[2026-04-04] ado-wiki-scan (Phase 3a): indexed 3529 pages from Supportability/AzureIaaSVM wiki — index built, no content extracted yet
[2026-04-04] onenote-extract tick 2: scanned 10 pages (batch 11-20), discovered 6 entries (vm-onenote-011~016), 0 deduplicated. 4 Track-A break/fix + 2 Track-B guide-drafts. Topics: ASR mobility version, Kusto PII unmasking, VM ContainerID query, ASR V2A duplicate CS MySQL.
[2026-04-04] ado-wiki-scan tick 1: scanned 10 pages (/Announcements/), extracted 5 entries (4 Track-A + 1 Track-B guide-draft), 0 deduplicated. Remaining: 3519/3529 pages.
[2026-04-04] onenote-extract (vm): scanned 10 pages (ASR 12.10-12.19), discovered 11 entries (vm-onenote-017~027), 0 deduplicated. Total scanned: 30/337 vm pages, 7 new Track A entries + 4 guide drafts.
[2026-04-05] onenote-extract (vm): scanned 10 pages, +8 entries (4 Track-A break/fix, 4 Track-B guide-drafts, 2 skipped: 1 generic use-case, 1 retired process)
[2026-04-05] mslearn-scan batch 1: 8 URLs scanned, 1 break/fix (vm-mslearn-001: >64 vCPU resize), 3 guide drafts (iaas-logs, server-software-support, win11-support), 4 skipped (low value/outdated/out-of-scope)
[2026-04-05] ado-wiki-scan(vm): 1 page scanned (DCasv5/DCadsv5 CVM), 4 break/fix + 1 guide-draft = 5 entries
[2026-04-05] onenote-extract(vm): tick processed 10 pages (1 empty section header, 1 file-not-found skipped). +5 JSONL entries (3 break/fix + 1 SQL IOPS case + 1 guide-draft ref). 1 guide draft created (storage-perf-throttling). 2 pages were Track B reference docs (CRP/VMA Kusto logs) but too internally-focused for guide drafts. Remaining: 275 pages.
[2026-04-05] contentidea-kb-scan(vm): WIQL query "Virtual Machine" → 178 work items, 48 with structured fields, 130 empty (old data). 45 JSONL entries written (3 skipped: "See attached" placeholders). Covers SCVMM, Azure VM boot/provisioning, Linux agent, Hyper-V topics. Source exhausted.
[2026-04-05] ado-wiki-scan: +4 entries (3 break/fix + 1 guide-draft) from DCasv6/ECasv6 CVM Series page. Total: 19 entries, 17/3529 pages scanned.
[2026-04-05] mslearn-scan: 8 pages fetched, 3 Track-A entries (in-place-upgrade, 32bit-memory, windows-update-corruption), 5 Track-B guide-drafts (client-eos, server-eos, os-upgrade-tool, ipu-tool, wu-reset-tool). Total vm-mslearn: 12 entries.

## 2026-04-05 ado-wiki tick (DCesv5/ECesv5)
- **Source**: ADO Wiki — `/Announcements/DCesv5 and ECesv5 VM Series_Announcements`
- **Track A**: 3 Break/Fix entries (vm-ado-wiki-020~022): DES type mismatch, auto-key rotation not allowed, OS type required for CVM disks
- **Track B**: 1 guide draft `ado-wiki-DCesv5-ECesv5-CVM-Series.md` — Intel TDX CVM sizing, error table, Kusto queries, HCL troubleshooting
- **Dedup**: 020 related to 014 (CVM disk/DES errors); 023 related to 015 (CVM guide series)
- **Scanned**: 18/3529

## 2026-04-05 Phase 2 onenote-extract (tick)

- **Pages processed**: 10 (MCVKB VM+SCIM section 2: VM & VMSS, items 2.16-2.24)
- **Track A (break/fix)**: 4 entries (vm-onenote-084 ~ 087)
  - 084: Standard disk cache restricted to 4 disks → filesystem corruption
  - 085: Cloud-init provisioning timeout due to unicode VM tags (JSONDecodeError)
  - 086: Temp disk requirement for VM provisioning (D: drive)
  - 087: VMSS creation failure - misleading capacity error, actual: invalid cert URL
- **Track B (guide-draft)**: 5 entries (vm-onenote-088 ~ 092)
  - 088: NodeFault 10007 PXE boot timeout TSG
  - 089: Guest OS dump capture process (Mooncake)
  - 090: Hyper-Threading disable/enable procedure
  - 091: Container & node diagnostics Kusto queries
  - 092: Classic VM recreate / swap OS disk
- **Deduplicated**: 1 (2.21 is exact duplicate of 2.24)
- **Progress**: 102/357 vm pages scanned (28.6%), exhausted=false

## 2026-04-05 ado-wiki tick (chain)
- Scanned: /Announcements/DCsv3 and DCdsv3 VM Series_Announcements (9593 chars)
- Extracted: 3 break/fix items (vm-ado-wiki-039~041) — Gen2-only, AN limitation, Live Migration
- Batch: 1 page (next page DV4 EV4 at 16542 chars exceeded 15000 limit alone with current)
- Progress: 30/3529 scanned, 3499 remaining

### 2026-04-05 onenote-extract tick (vm-onenote-093~101)
- Pages processed: 10 (2.25, 2.26, 2.29.1, 2.29.2, 2.29.3, 2.3, 2.30, 2.31, 2.33, 2.34)
- Track A (break/fix): 5 entries — WireServer routing, NIC-not-found deletion, guest agent missing, offer restriction quota, container image deprecated
- Track B (guide-draft): 4 entries — SAW console access (new+old merged), premier console workflow, XTS VMPHU freeze time, maintenance notification node list
- Deduplicated: 0
- Progress: 114/357 scanned, 243 remaining

## 2026-04-05 ado-wiki tick (Announcements batch 3)
- Scanned 10 pages: Dv5/Ev5 specs, EastAsia AZ, CVE-2021-44228 Log4j, SLES 12 EoS, FX Series, FXmsv2/FXmdsv2, Germany AZ, HBE Pv2+Ultra TSG, India Central AZ, Intel MMIO
- Track A: 5 new entries (vm-ado-wiki-042~046) — Log4j CVE, SLES 12 EoS, FX limitations, FXmsv2 limitations, Intel MMIO
- Track B: 1 guide draft (vm-ado-wiki-047) — HBE Pv2+Ultra Disk TSG
- Skipped 4 pure announcements (Dv5/Ev5 specs, EastAsia AZ, Germany AZ, India Central AZ)
- Total: 40/3529 scanned, 47 JSONL entries
| 2026-04-05 | onenote-extract | tick: 10 pages scanned, 10 entries (vm-onenote-102~111: 4 Track A + 6 Track B guide-drafts), 0 deduplicated. 235 remaining. | MCVKB/VM+SCIM/2. VM & VMSS (2.35-2.42, 2.4, 2.5) |
| 2026-04-05 | ado-wiki | tick: 10 pages scanned, 0 new entries, 5 deduplicated (DV4/EV4 issues already in 028-032). 9 pure announcements (region launches, AZ). Total: 50/3529 scanned, 47 JSONL entries. |
| 2026-04-05 | onenote-extract | tick: 10 pages scanned (2.6-2.9, 2.27-2.28, 3.x4), 13 entries (vm-onenote-112~124: 7 Track A + 6 Track B guide-drafts), 0 deduplicated. Pages: VM password reset, OOM Killer, serial console Hyper-V, VMSS scaling errors, Redhat licensing, perf dashboard, ARM template, Kusto queries, ClamAV. 223 remaining. |

## 2026-04-05 ado-wiki tick (vm-ado-wiki-048..049)
- Scanned 12 pages (3 SME Topics + 9 empty Announcements)
- Track B: 2 guide drafts (Automatic Extension Upgrade, Decrypt Protected Settings)
- Track A: 0 break/fix entries
- Remaining: 3467/3529 pages

## 2026-04-05 ado-wiki tick (vm-ado-wiki-050~053)
- **scanned**: 6 pages (4 Announcements + 2 SME Topics AGEX)
- **extracted**: 4 entries (050: default outbound retirement, 051: Docker Hub rate limiting, 052: CRP cert accumulation, 053: Linux GA callstack guide-draft)
- **guide-drafts**: 1 (capture-linux-ga-callstack.md)
- **deduplicated**: 0
- **remaining**: 3461 / 3529

| 2026-04-05 | onenote-extract | tick: 10 pages scanned (Linux+Fabric), 8 entries (1 Track A: SUSE PAYG reg, 7 Track B guide-drafts: slow network, perf cmds, VMDash, maintenance check, host logs, service healing, state transitions), 0 dedup, 2 skipped (vi usage, empty section header). 205 remaining | MCVKB/VM+SCIM sections: 3.Linux, 5.Fabric |
## 2026-04-05 ado-wiki tick
- Scanned 10 pages (2 with content, 8 empty/parent)
- Page 1 (China Region AZ Announcement): pure informational, no extractable issues
- Page 2 (D/Ds/Dv2/Dsv2/Ls Migration Guide): already covered by vm-ado-wiki-008 and vm-ado-wiki-010 (≥80% overlap, deduplicated)
- 8 empty "Launching X New Region" pages: 0 content
- discovered: 0, deduplicated: 1, remaining: 3509

## [2026-04-05] ado-wiki tick (vm-ado-wiki-054)
- Scanned: /Announcements/Ebdsv5 and Ebsev5 VM Series_Announcement
- Extracted: 1 break/fix issue (Standard SSD/HDD not supported on Ebv5 series)
- Total scanned: 79/3529

## [2026-04-05] mslearn tick (vm-mslearn-098~105)
- Scanned: 8 Windows boot error pages (0xC000000F, 0xC00000BA, 0xC0000011, 0xC000014C, 0xC0000034, 0xC0000098, 0xC0000102, 0xC0000359)
- Track A: 8 break/fix entries — all boot errors with clear symptom/rootCause/solution
- Track B: 0 guide-drafts
- Deduplicated: 0
- Total: 112/289 mslearn scanned, 105 JSONL entries. 177 remaining.


## 2026-04-05 vm onenote-extract tick

- **Pages processed**: 10 (batch: 6.14, 7.4, 7.6, 7.7, 7.8, 7.9, 9.section, 9.1, 9.2, 9.3)
- **Track A (break/fix)**: 6 entries (vm-onenote-143 to 148)
  - Storage I/O throttling with P60 disks + Oracle ASM (Owait 20%)
  - Device registration WinHTTP 0x80072efd (blocked endpoint)
  - Linux CSE Transitioning (reboot in script)
  - Linux password reset failure (/etc/shadow +i immutable)
  - Set-AzVMCustomScriptExtension wrong publisher on Linux
  - CSE Transitioning during WALinuxAgent upgrade
- **Track B (guide-drafts)**: 3 entries (vm-onenote-149 to 151)
  - Host Analyzer CLI guide
  - Host monitoring agent log collection
  - Fiddler trace for mobile devices
- **Skipped**: 1 (smartcard application - non-technical)
- **Empty sections**: 1 (9. Extension header)
- **Deduplicated**: 0
- **Remaining**: 195 pages
- **Exhausted**: false
| 2026-04-05 | onenote (phase2) | +13 entries (vm-onenote-152~164): extension seq number, COMSPEC, SSL cert, wrong CSE type, noexec /var, VMAccess errors, WinGA MSI issues (sc.exe/Kaspersky/stuck), WireServer 503, machine.config proxy, LM Defrag reboot | 10 pages processed, 185 remaining |

### 2026-04-05 Phase 2 onenote-extract (tick)
- **Processed**: 10 pages (Mooncake POD Support Notebook - Readiness/Archive + Process sections)
- **Extracted**: 4 break/fix entries (vm-onenote-172~175), 2 guide-drafts (vm-onenote-176~177)
- **Skipped**: 4 pages (readiness link collections, screenshot-only page)
- **Guide drafts created**: onenote-penetration-testing-mooncake.md, onenote-sap-on-azure-support-process.md
- **Progress**: 192/357 VM pages scanned (54%), exhausted=false
| 2026-04-05 | onenote | +3 Track A (vm-onenote-178~180: gen/spec mismatch, AllocationFailed) +2 Track B guide-drafts (SUSE collaboration, WS2008/2012 EOS-ESU policy). 10 pages scanned, 155 remaining. | page-classification.jsonl filtered for vm |
| 2026-04-05 | onenote | 10 wiki_migration pages scanned — ALL 10 deduplicated (content already extracted from original MCVKB/VM+SCIM paths in prior batches). 0 new entries. Progress: 214/357 (60%), exhausted=false, 145 remaining. | page-classification.jsonl filtered for vm |

## 2026-04-05 onenote-extract (batch: DEPLOYMENT tools)

- **Pages processed**: 10 (Mooncake POD DEPLOYMENT section)
- **Track A entries**: 1 (vm-onenote-183: DiskRP lifecycle Kusto queries)
- **Track B guide-drafts**: 3 (vm-onenote-184/185/186: DiskRP Kusto ref, ASC CRP ops, Jarvis hung deployment)
- **Skipped**: 6 pages (empty/image-only: TSG & Case Sharing, Training matrix, Troubleshooting Flow, Troubleshooting Tools, Jarvis index, client IP check, ADH with VMSS)
- **Deduplicated**: 0
- **Scanned total**: 224/357, remaining: 135

## 2026-04-05 onenote-extract (tick)

- **scanned**: 10 pages (Mooncake POD: ADH/VMSS notes, VM feature landing, VM Process docs)
- **discovered**: 4 entries (1 Track A + 3 Track B guide-drafts)
  - vm-onenote-187: RHUI support scope/ICM template for Azure China (Track A, relatedTo vm-onenote-119)
  - vm-onenote-188: 3rd Party OS Support Boundaries (guide-draft)
  - vm-onenote-189: Linux Escalation Team Engagement Process (guide-draft)
  - vm-onenote-190: VM/Compute EEE→PG ICM Transfer Destinations (guide-draft)
- **skipped**: 6 pages (empty/images-only: Bruce 11.18, March 2021, New feature landing, Config&Setup dashboard, Process index, RedHat account link)
- **deduplicated**: 0
- **remaining**: 125 pages
- **exhausted**: false

## 2026-04-05 onenote-extract tick (Mooncake POD SME Topics batch)
- Scanned 10 pages from Mooncake POD Support Notebook/VMSCIM/4. Services/VM/SME Topics
- 6 pages image-only (no extractable text): SME Topics, Agents & Extensions, separators
- 4 new entries: vm-onenote-191..194
  - 191: Terraform plan block causes 500 in Mooncake (storeapi.azure.com unreachable)
  - 192: ToR maintenance investigation guide (guide-draft, relatedTo vm-onenote-100)
  - 193: SSD drive failure → VhdDiskPrt E16 → VMs down (Mooncake Anvil gap)
  - 194: VM unexpected reboot RCA template (host OS crash, relatedTo vm-onenote-067)
- 0 deduplicated, 1 guide-draft created
- Progress: 244/357 scanned (115 remaining)

## 2026-04-05 04:47 — vm onenote-extract (Phase 2)
- Pages processed: 10 (5 with content, 5 empty/stub)
- Track A (break/fix): 3 entries (vm-onenote-195..198)
- Track B (guide-draft): 2 entries (vm-onenote-197, vm-onenote-199)
- Deduplicated: 0
- Skipped (empty/link-only): 5
- Total scanned: 254/357, remaining: 105
- Exhausted: false

## 2026-04-05 04:58 — Phase 2 onenote-extract (vm) tick

- **Pages processed**: 10
- **New entries**: 5 (vm-onenote-200 to vm-onenote-204)
- **Deduplicated**: 0 (2 entries added with relatedTo links to existing vm-onenote-067, vm-onenote-037)
- **Guide drafts**: 1 (onenote-scheduled-maintenance-troubleshooting.md)
- **Skipped (sparse)**: 5 pages (E17 Known issue, JIT Access, VM Activation, VM Unavailable Flow, Azure Dedicated Host section header)
- **Remaining**: 95 pages
- **Exhausted**: false

### 2026-04-05 Phase 2 tick (onenote batch 28)
- **Pages processed**: 10 (Dedicated Host section headers + Linux on Azure topics)
- **New entries**: 5 (vm-onenote-205 to vm-onenote-209)
  - 205: Mooncake RHEL ADE false positive (LVM /dev/mapper)
  - 206: Linux boot failure - missing initramfs, fix via chroot + GRUB
  - 207: SAP NFS GlusterFS cluster reboot during platform maintenance
  - 208: CUDA on NV series Linux (guide-draft, relatedTo vm-onenote-128)
  - 209: SUSE upgrade failure handling process (guide-draft)
- **Deduplicated**: 0
- **Guide drafts**: 2 (onenote-enable-cuda-on-nv-series-linux.md, onenote-suse-upgrade-failure-handling.md)
- **Skipped (sparse/image-only)**: 5 pages (section headers, image-only case notes)
- **Remaining**: 85 pages
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (Mooncake POD / Linux on Azure batch)
- **Pages processed**: 10
- **New entries**: 4 (vm-onenote-210 to vm-onenote-213)
  - Track A: 2 (password reset via recovery VM, provision timeout with Chinese tags/cloud-init Python 2.7)
  - Track B: 2 guide-drafts (SAR monitoring, Linux connection limits tuning)
- **Deduplicated**: 2 (console access → vm-onenote-131, clamav → vm-onenote-124)
- **Skipped (sparse/image-only)**: 4 pages (CVE link-only, section separator images, TSG index images)
- **Guide drafts created**: onenote-sar-linux-performance-monitoring.md, onenote-linux-connection-limits-tuning.md
- **Remaining**: 75 pages
- **Exhausted**: false

### 2026-04-05 mslearn-scan tick (Phase 4b)
- Fetched 8 URLs (Linux: redeploy, perf-bottlenecks, collect-metrics, vm-perf, OOM, CPU-perf, memory-perf, kernel-boot)
- Track A (Break/Fix): 6 entries (vm-mslearn-226~231) — OOM variants (3), kernel boot failures (3)
- Track B (Guide drafts): 6 entries (vm-mslearn-232~237) + 6 guide drafts created
- Deduplicated: 0
- Progress: 232/289 scanned, 73 remaining

## 2026-04-05 Phase 2 OneNote Tick (batch 30)
- Pages processed: 10
- New entries: 1 (vm-onenote-225: VMSS failed instances cannot be deleted)
- Deduplicated: 2 (RDP Citrix license=vm-onenote-215, VMSS SF creation=vm-onenote-087)
- Skipped (empty/stub): 7
- Total scanned: 304/357
- Remaining: 56 (not exhausted)

## 2026-04-05 onenote-extract (batch: Fabric + Serial Console sections)
- **Scanned**: 10 pages (7. Fabric section: 5 pages, 8. Azure Serial Console section: 5 pages)
- **Extracted**: 2 entries (vm-onenote-226: AAD MSAL repeated discovery calls in Mooncake; vm-onenote-227: Serial Console escalation guide-draft)
- **Skipped**: 8 pages (section headers, dividers, stubs with images only, no extractable text)
- **Guide drafts**: 1 (onenote-serial-console-escalation.md)
- **Deduplicated**: 0
- **Remaining**: 46 pages
- **Status**: NOT exhausted

### 2026-04-05 — OneNote Phase 2 (batch: POD VM SME Topics + Tools/Kusto)

- **Pages processed**: 10
- **Track A (break/fix)**: 1 (vm-onenote-228: Palo Alto VM managed disk conversion failure)
- **Track B (guide-drafts)**: 4 (vm-onenote-229~232: Procmon Serial Console, ARM-CRP-Fabric Topology, ARM Kusto Reference, CRP Kusto Reference)
- **Skipped (image-only)**: 3 (Tools, ASC, 2. Kusto — no text content)
- **Deduplicated**: 2 (Maintenance notification → vm-onenote-100; DiskRP Logs → vm-onenote-184)
- **Remaining**: 33 pages

## 2026-04-05 Phase2 onenote-extract (batch: POD Tools/Kusto+MDM+HostAnalyzer)
- **Processed**: 10 pages (Tools/2.Kusto, Tools/3.MDM_Jarvis, Tools/4.Host Analyzer)
- **Track A (break/fix)**: 0 entries
- **Track B (guide-draft)**: 4 entries (vm-onenote-233~236)
  - Fabric Logs (compute manager) — 6 core Kusto tables for allocation/service-healing/migration
  - PIR Logs — PirCasApiQosEvent/PirCasContextActivityEvent, ID mapping
  - RDFE Logs — RdfeQosEventEtwTable/DeploymentContextActivityEtwTable
  - VMA Logs — VMA availability events + WindowsEventTable host events
- **Skipped**: 6 pages (image-only/link-only: Kusto Endpoints, MDM/Jarvis, VMDash, MDM Tool, Host Analyzer, Host Analyzer Training)
- **Deduplicated**: 0
- **Remaining**: 26 pages | **Exhausted**: false

## 2026-04-05 onenote-extract tick

- **Pages processed**: 10 (Host Analyzer VM Metrics/Host Metrics/Timeline/Others, VM Size Mapping, Azure Service Insights, Acronyms, XTS Autopilot, Kernel Debugger, Untitled)
- **Guide drafts created**: 5 (host-analyzer-vm-metrics, host-analyzer-host-metrics, host-analyzer-timeline, vm-size-portal-fabric-mapping, attach-kernel-debugger-azure-vm)
- **JSONL entries**: 5 (vm-onenote-237 ~ vm-onenote-241, all quality: guide-draft)
- **Skipped**: 4 pages (empty/minimal content: Others, ASI link, Acronyms link, Untitled)
- **Deduplicated**: 0
- **Remaining**: 16 pages (wiki_migration deprecated + Training & Brownbags + OPPO case)
- **exhausted**: false

## 2026-04-05 onenote-extract (batch 35→36)
- Processed: 10 pages (wiki_migration deprecated pages + Training & Brownbags)
- Discovered: 6 new entries (vm-onenote-242 ~ vm-onenote-247)
  - 3 high-confidence: storage/disk recovery processes (deleted storage resources, soft-delete managed disk, hard-delete managed disk)
  - 3 low-confidence: GPU TSG references from brownbag index (NVv3 GRID 17.x, RDSH GPU, NVs_v3 Code 43)
- Deduplicated: 0
- Skipped: 4 pages (empty headers, training video links only)
- Remaining: 6 pages
- exhausted: false

## 2026-04-05 onenote-extract (tick)

- **Processed**: 10 pages (Training & Brownbags section)
- **Track A (break/fix)**: 2 new entries (vm-onenote-242, 243) — VMSS stuck on MR-enabled SF, Fabric Failover scale-in
- **Track B (guide-draft)**: 4 drafts — GPU extension TSG index, EEE brownbag scenarios, Agent & Extensions SME ramp, VM deployment workflows
- **Deduplicated**: 0 (no full duplicates; 2 Track A entries linked via relatedTo to existing 087/225)
- **Skipped**: 4 pages (pure images/links with no extractable content)
- **Remaining**: 3 unprocessed pages
- **Exhausted**: false

## 2026-04-05 Phase 2 onenote-extract (final tick)
- **Pages processed**: 3 (final batch — all remaining)
- **Discovered**: 2 new entries (vm-onenote-248, vm-onenote-249)
- **Deduplicated**: 1 (turbo boost page → already vm-onenote-198)
- **Skipped**: 1 page (Perf Brownbag — training links only, no break/fix content)
- **Status**: ✅ **exhausted** — all 357 VM pages from page-classification.jsonl processed
- Total known-issues-onenote.jsonl entries: 249

### 2026-04-05 ADO Wiki Scan (tick)
- **Source**: Supportability/AzureIaaSVM wiki
- **Pages processed**: 1 (AAD Auth for Managed Disk Import Export_Announcement)
- **Track A entries**: 2 (vm-ado-wiki-058, 059 — FeatureNotSupported + ActiveSAS errors)
- **Track B drafts**: 0
- **Deduplicated**: 0
- **Scanned total**: 80/3587, remaining: 3507
- **Status**: ❌ not exhausted — continuing

## 2026-04-05 ado-wiki tick (continuation)
- **Scanned**: 10 pages (Ebdsv6, Lsv3, Lsv4, Mbsv3, Mdsv3, Mseries, Mv3, ND_MI300X, NVIDIA Omniverse, NVMe Disk Controller)
- **Discovered**: 3 entries (vm-ado-wiki-060~062)
  - 060: Lsv3/Lasv3 disk format error from bad cluster settings
  - 061: Lsv3/Lasv3/Lsv2 Premium disk caching provisioning failure
  - 062: NVMe Disk Controller guide-draft (DiskControllerType, Kusto queries, ASAP VMs)
- **Deduplicated**: 0
- **Also normalized**: scanned-ado-wiki.json format (removed full-key duplicates, unified to path-only)
- **Remaining**: 3456 pages

## 2026-04-05 ado-wiki-scan (tick continuation → EXHAUSTED)
- **Source**: ADO Wiki — Supportability/AzureIaaSVM
- **Pages scanned this session**: 3529 total (3417 empty/stub + 112 with content)
- **New entries**: vm-ado-wiki-063 → vm-ado-wiki-077 (15 entries)
- **Total JSONL entries**: 82 (known-issues-ado-wiki.jsonl)
- **Guide drafts created**: 4 new (Extensions-on-Arc-VMs, How-to-Install-CSE, How-to-Install-Run-Command-Extension, Automatic-Extension-Upgrade-Not-Happening)
- **Total guide drafts**: 17
- **Key topics**: Nested Confidential VMs, ADE retirement, Qatar 3+0 geo, AGEX extensions (Arc, CSE, RunCommand), 90-min extension timeout, AKS CSE exit codes, PerfInsights SSL/FIPS errors, Guest Agent MSI conflict, forked Linux GA, WireServer troubleshooting
- **Status**: **EXHAUSTED** — all 3529 pages in index scanned

## 2026-04-05 ado-wiki-scan tick (FINAL)
- **Pages processed**: 21 (11 announcements/extensions + 10 GA pages)
- **Track A entries**: 10 new (vm-ado-wiki-070 to vm-ado-wiki-080)
  - 070: Linux ext install fails - DHCP disabled
  - 071: Extension minor version not auto-upgrading - need PUT
  - 072: Kaspersky extension forcibly removed
  - 073: CSE broken/unresponsive - manual reinstall
  - 075: "Another version already installed" MSI error 1638
  - 076: Forked (3rd-party) Linux Guest Agent
  - 077: VM Agent not auto-upgrading on custom images
  - 078: "Failed to copy ovf-env" - missing provisioned file
  - 079: Too many files in waagent/events
  - 080: 90-minute extension timeout blocking operations
- **Track B guide-drafts**: 5 new
  - ado-wiki-Uninstall-Extension.md
  - ado-wiki-Collect-WireServer-Logs.md
  - ado-wiki-Guest-Agent-FastTrack.md
  - ado-wiki-Guest-Agent-Installation.md
  - ado-wiki-Debug-CDB-Windbg.md
- **Guide-draft pointers**: 5 (vm-ado-wiki-074, 081-084)
- **Deduplicated**: 1 (ADE Retirement ≈ vm-ado-wiki-066)
- **Status**: EXHAUSTED — all 3529 wiki pages scanned
- **Total JSONL entries**: 84 (vm-ado-wiki-001 to vm-ado-wiki-084)

### 2026-04-05 ado-wiki tick (final)
- Batch: 4 pages (GA/How Tos), 2 already extracted (dedup), 2 new guide-drafts
- New entries: vm-ado-wiki-078 (Collect WireServer Logs), vm-ado-wiki-079 (Debug CDB/Windbg)
- Total JSONL entries: 81
- **exhausted: true** — all 3529 indexed wiki pages scanned
| 2026-04-05 | ado-wiki batch-b | 扫描10页(StorageConnectivity TSGs/Trainings/Workflows, StorageDataMigration) — 全为landing/empty页，discovered=0 | blast-batch-b |

## 2026-04-06 — ado-wiki batch-c blast (3b-blast)
- batchId: c
- pagesProcessed: 10 (/Processes/Swarming/*)
- Track A: 0 (无 break/fix 三元组)
- Track B: 9 drafts (guide-draft)
- JSONL entries: vm-ado-wiki-c-001 ~ vm-ado-wiki-c-009
- 草稿文件: guides/drafts/ado-wiki-c-{Creating-a-collaboration-case-Process...Engage-Windows-Networking-Team-Process}.md
- 全部为 Swarming 流程指南（协作任务路由/团队上报流程）

## 2026-04-06 — ado-wiki batch-b blast (3b-blast)
- batchId: b
- pagesProcessed: 10 (AGEX/How Tos/Extension/*)
- Track A: 4 break/fix entries (vm-ado-wiki-b-r3-001 ~ 004)
  - 001: AzureSecurityLinuxAgent exit code 55 (missing --settings)
  - 002: CSE Managed Identity Not Found (metadata 400)
  - 003: CSE Managed Identity no blob access (404)
  - 004: VMWatch EventHub provisioning fail (illegal base64)
- Track B: 5 guide-drafts (vm-ado-wiki-b-r3-005 ~ 009)
  - 005: Install AzureSecurityLinuxAgent
  - 006: Managed Identity CSE configuration
  - 007: Manually Reinstall CSE
  - 008: Manually Remove Extension (last resort)
  - 009: VM Watch EventHub Integration
- 3 empty/landing pages skipped (AGEX Home, How Tos, Extension index)
- 2 low-value pages skipped (VMExtensionPublishers internal process, BGInfo trivial install)
- Deduplicated: 0
- 草稿文件: guides/drafts/ado-wiki-b-{Install-AzureSecurityLinuxAgent...VMWatch-EventHub}.md


### 2026-04-06 ado-wiki blast batch-a (r4)
- **batchId**: a
- **pages**: 10 (AGEX Extensions subtree)
- **Track A (break/fix)**: 4 entries — AzSecLinuxAgent exit code 55, CSE Managed Identity 400, CSE clean reinstall, stuck extension manual removal
- **Track B (guide-draft)**: 2 entries — BGInfo install/uninstall, VM Watch EventHub Integration
- **skipped**: 4 pages (AGEX Home landing, How Tos placeholder, Extension placeholder, VMExtensionPublishers internal process)
- **IDs**: vm-ado-wiki-a-r4-001 ~ vm-ado-wiki-a-r4-006
- **dedup**: 0 (no prior entries in batch-a JSONL)

### 2026-04-06 — ado-wiki blast batch-b (AGEX Extensions TSGs)

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-06 | ado-wiki (blast-b) | +14 entries (12 Track A + 2 Track B guides), 10 pages processed | batch-b r7 |

- **batch**: b, round r7
- **pages**: 10 AGEX Extension TSGs (CSE storage failures, Debian ext, PS/Shell debug, Diag ext SA, Domain join, VMAccess password/sshd, Azure Policy, FixEmulatedIO)
- **Track A** (12 break/fix): CSE storage key/name/MSI failures (5), Debian extensions disabled (1), Diagnostic ext SA firewall (1), Domain join shutdown failure (1), VMAccess password policy (1), VMAccess sshd by-design (1), Azure Policy blocking (1), FixEmulatedIO removal (1)
- **Track B** (2 guide-drafts): Debugging PS Scripts via CSE/RC, Debugging Shell Scripts via CSE/RC
- **IDs**: vm-ado-wiki-b-r7-001 ~ vm-ado-wiki-b-r7-014
- **dedup**: 0 (fresh batch-b JSONL)
[2026-04-06] ado-wiki-scan blast batch-a r10: re-scanned 10 AGEX/Extension TSG pages. +4 new entries (r10-001~004: JsonADDomainExtension error 1323/2202 + extension scope behaviors: unjoin misconception, OU placement). 12 entries deduplicated vs r9. Total batch-a JSONL: 16 entries.
[2026-04-06] ado-wiki-scan blast batch-a r15: 10 Guest Agent TSG pages (AGEX/GA). Track A: 8 break/fix entries (BadImageFormat, .NET missing, zip.baseline, WCF crash, WireServer blocked, DHCP disabled, cloud-init Unicode, crypto keyset). Track B: 2 guide-drafts (CommonAgentConfig reference, Crypto/Certificate troubleshooting). +1 by-design info (BFEToolWin8).
- **pages**: 10 (all AGEX/GA subtree)
- **IDs**: vm-ado-wiki-a-r15-001 ~ vm-ado-wiki-a-r15-010
- **dedup**: 0 (no prior r15 entries in batch-a)
- **drafts**: ado-wiki-a-CommonAgentConfig_AGEX.md, ado-wiki-a-WireServer-blocked-Linux.md, ado-wiki-a-Crypto-Certificate-Errors-GA.md
| 2026-04-06 | ado-wiki (blast-a) | +11 entries (9 break/fix + 2 guide-drafts) from 10 AGEX/GA TSG pages: BadImageFormat, .NET missing, BFEToolWin8, CommonAgentConfig, WireServer iptables/nftables, zip.baseline, WCF crash, Crypto/Cert ACL, DHCP, cloud-init Unicode | batch-a r16 |

## [2026-04-06 11:27] ado-wiki blast batch-b (r13)
- **batchId**: b
- **pagesProcessed**: 10
- **discovered**: 10 (all Track A break/fix)
- **deduplicated**: 0
- **ID range**: vm-ado-wiki-b-r13-001 ~ vm-ado-wiki-b-r13-010
- **Topics**: Guest Agent TSGs - deprecated GA versions, Dynatrace DLL injection, EaserSoft/TortoiseSvn MSI interference, GoalState XML missing, NoneType status reporting, aggregate status null message, registry key loss after reboot, ACL IdentityNotMappedException, firewall blocking WireServer, NullReferenceException from 3rd party software
- **Files**: .enrich/known-issues-ado-wiki-b.jsonl, .enrich/scanned-ado-wiki-b.json

## 2026-04-06 — batch-a (blast-batch r1)
- batchId: a | pages: 10 | discovered: 10 | deduplicated: 0
- Track A (5): TSG174-AFS-diagnostics, ImageValidation, IsolatedBuilds, InternalSubscription, CustomizationLog
- Track B guides (5): AFS-Missing-Telemetry, AFS-Delete-ESE-DB, AFS-Workflow-Overview, AIB-Home, Create-AIB-Template
- JSONL: known-issues-ado-wiki-a.jsonl | scanned: scanned-ado-wiki-a.json

| 2026-04-07 | SYNTHESIZE | 66 topics (50 fusion, 16 compact), 1559 entries, 5 Kusto queries fused |

## 2026-04-17 10:13 UTC — contentidea-kb scan (7-day refresh)
- Product: vm | Keywords: Virtual Machine
- WIQL returned: 226 IDs | Already scanned: 178 | Unscanned: 48
- Processed: 10 work items (batch)
- Discovered: 2 new entries (vm-contentidea-kb-046, vm-contentidea-kb-047)
- Skipped: 8 (empty structured fields)
- Deduplicated: 0
- Total scanned: 188/226 | Remaining: 38
- exhausted: false

## 2026-04-17 10:18 UTC — contentidea-kb scan (batch 2/2, final)
- **Product**: vm
- **Source**: contentidea-kb
- **Processed**: 38 work items (IDs 146301–207176)
- **New entries**: 36 (vm-contentidea-kb-048 to vm-contentidea-kb-083)
- **Skipped**: 2 (empty fields), 0 (dedup)
- **Total JSONL**: 83 entries
- **Total scanned**: 226/226 — **EXHAUSTED**
