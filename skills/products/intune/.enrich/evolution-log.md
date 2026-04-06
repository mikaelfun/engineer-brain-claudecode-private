# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-04 | OneNote: China Intune Feature gaps | 21v-gap-scan: 21 unsupported + 3 partial features extracted to 21v-gaps.json | auto-enrich Phase 1 |
| 2026-04-04 | OneNote: MCVKB/Intune (onenote-scan) | 6 known-issues extracted from 10 pages (Win32 deploy, AutoPilot ETW, WNS push, TattooRemoval, Available app, GlobalProtect China). 3 duplicate files, 2 thin-content skipped. | auto-enrich onenote-scan |
| 2026-04-04 | MS Learn: mem/intune toc.yml | 46 known-issues extracted from 27 URLs. Topics: app-install errors, enrollment, BitLocker, SCEP/PKCS, conditional access, APP data transfer. 8 guide drafts created. | auto-enrich mslearn-scan |
| 2026-04-04 | ADO Wiki: Supportability/Intune | 311 pages indexed, 10 scanned. 9 entries + 4 guide drafts (autopilot-hybrid, co-management, device-actions, EPM). JSONL partially lost to concurrent write. | auto-enrich ado-wiki-scan |
| 2026-04-05 | ContentIdea KB: keyword "Intune" | 1000 work items found via WIQL. 37 scanned this tick, 8 entries extracted (MAM/PDF, enrollment admin, MDM 0x8018002b, WebClip, Exchange connector ×2, SCEP cert, firewall compliance). 29 skipped (empty/deleted/archived). 963 remaining. | auto-enrich contentidea-kb-scan |
| 2026-04-04 | SYNTHESIZE | 8 guides generated from 60 entries: app-deployment(16), app-protection(12), certificates(13), device-enrollment(7), bitlocker(6), platform-specific(3), policy-sync(2), conditional-access(2). 12 drafts preserved. | product-learn synthesize |
| 2026-04-04 | 21v-gap-scan (re-run) | cache valid (0 days old); 24 entries written to known-issues-21v-gap.jsonl from existing 21v-gaps.json (21 unsupported + 3 partial). scanned-21v-gap.json created. | auto-enrich Phase 1 |
| 2026-04-04 | onenote-extract (v3 parallel) | 9 entries written to known-issues-onenote.jsonl from 11 pages scanned (0 deduplicated). 5 Track A (AVD enrollment 21v gap, dual-fed MAM iOS, Android SafetyNet compliance, Android LOB cellular download, Android broker auth). 4 Track B guide drafts (AAD PRT log, Android app store China, WHFB Kerberos lab, App SDK comparison). 611 pages remaining. | auto-enrich Phase 2 |
| 2026-04-04 | ADO Wiki: Supportability/Intune (v3 re-index) | ado-wiki-scan Step 3a: 311 pages indexed into scanned-ado-wiki.json. known-issues-ado-wiki.jsonl created (empty). ado-wiki source set to scanning. | auto-enrich Phase 3 |

[2026-04-04] ado-wiki-scan (batch 1): scanned 10 pages, discovered 8 Break/Fix entries + 5 guide-draft entries = 13 total. Pages: /AdminUI, /AdminUI/Consolidated Admin Task List, /AdminUI/Device Inventory, /AdminUI/Multiple Device Query, /AdminUI/SupportAssistant, /AdminUI/Troubleshooting with Browser DevTools, /AdminUI/Web Company Portal, /App Config Profiles, /App Management, /App Management/Android. Guides created: AdminUI-Troubleshooting, Browser-DevTools-Troubleshooting, Device-Inventory, Multiple-Device-Query, Android-App-Deployment

[2026-04-04] onenote-extract tick #3: scanned 10 pages (32/643 total intune pages); discovered +11 entries (018-028: 7 Track-A + 4 Track-B guide-drafts); 1 deduplicated (Outlook MDM UPN Mismatch duplicate); highlights: China 21v feature gaps table (019-025), iOS app config delay (018), log collection guides (026-028)
[2026-04-05] ado-wiki-scan (intune): +8 entries (7 break/fix + 1 guide-draft) from /App Management/Windows/Office; 296 pages remaining
[2026-04-05] onenote-extract (intune): scanned 10 pages, +3 break/fix entries (050-052), +5 guide-drafts (053-057), 3 empty/TOC pages skipped. 551 pages remaining.
[2026-04-05] mslearn-scan batch 1: 8 URLs scanned, 10 break/fix + 4 guide-drafts extracted (14 total entries)
[2026-04-05] onenote-extract (intune): +5 entries (3 Track A break/fix, 2 Track B guide-draft), 1 dedup skip, 4 skipped (empty/too-short). Pages 73-82/632. Scanned: 82/632.
[2026-04-05] ado-wiki-scan intune: scanned /App Management/Windows/Win32 (35970 chars). Track A: 4 break/fix items (detection failure, download failure, enforcement error, S-mode block). Track B: 1 guide draft (Win32-App-Deployment.md). Pre-read 20 page lengths cached.
[2026-04-05] mslearn-scan tick: +8 discovered (intune-mslearn-015~022), 0 deduped, 0 guide-drafts. Topics: iOS app uninstall, OneDrive iMessage data leakage, ampersand config error, APP image save limitation, macOS LOB deployment (3 articles), M365 macOS restart. 122 URLs remaining.

[2026-04-05] contentidea-kb-scan: +1 discovered (59618 DEP enrollment), 9 skipped (empty/informational). Total scanned: 57/1000.

### 2026-04-05 ado-wiki tick (iOS/iPadOS App Deployment)
- **Source**: Supportability/Intune wiki — `/App Management/Apple/iOS and iPadOS`
- **Track A**: 7 break/fix items (intune-ado-wiki-029~034)
  - VPP token Duplicate state
  - VPP license revoke/delete failure
  - In-App Purchase Disabled on VPP apps
  - VPP sToken revoked (error 9625)
  - iOS LOB/IPA install failure (cert/export issues)
  - VPP "Could not retrieve license" error
- **Track B**: 1 guide draft → `guides/drafts/ado-wiki-iOS-iPadOS-App-Deployment.md`
  - Comprehensive iOS/iPadOS app deployment TSG with VPP v2 Kusto queries, scoping questions, Bruno simulation, error code reference
- **Scanned**: 17/311 pages (294 remaining)

### 2026-04-05 01:33 — ado-wiki scan (tick)
- Page: /App Protection/Android (20323 chars)
- Track A: 7 break/fix entries (intune-ado-wiki-045..051) — Known Issues: phone number click, Save As PDF bypass, Google Maps data transfer, rooted device DB bypass, MAM-WE root detection bypass, SafetyNet Google Play dependency (21v), Teams Android devices
- Track B: 1 guide-draft pointer (intune-ado-wiki-052) → guides/drafts/ado-wiki-App-Protection-Android.md (already existed)
- 21v flags: intune-ado-wiki-047 (Google Maps → N/A), intune-ado-wiki-050 (SafetyNet → 21vApplicable=false, tag 21v-unsupported)
- Progress: 21/311 scanned, 290 remaining

## 2026-04-05 onenote tick (batch 076-080)

- **Pages processed**: 10 (5 with content, 5 empty/image-only)
- **Track A (Break/Fix)**: 2 entries
  - intune-onenote-076: LOB app update behavior (iOS vs Android, Available vs Required)
  - intune-onenote-077: Mac re-enrollment commands (sudo profiles renew + killall IntuneMdmDaemon)
- **Track B (Guide-draft)**: 3 entries
  - intune-onenote-078: Kusto Windows Enrollment queries (DeviceLifecycle, EnrollmentSoapProvider, IntuneEvent)
  - intune-onenote-079: Kusto Feature Update Policy analysis (relatedTo: intune-onenote-022)
  - intune-onenote-080: Kusto iOS Enrollment queries (DeviceLifecycle, IOSEnrollmentService)
- **Skipped**: 5 pages (empty or image-only: MDM vendor, Mac, ADE Enroll, BYOD enroll process, check ADE enrollment profile)
- **Deduplicated**: 0
- **Remaining**: 512 pages

### 2026-04-05 onenote-extract tick (124/632)
- Processed: 10 pages (Customer Profile batch: Bridgewater, EY, Global Top 18, Muji, Volkswagen, Xiaohongshu×3, Yict, 中美联泰)
- Discovered: 4 new entries (081-084)
  - 081: Wrong tenant enrollment due to SCP in dual-fed VDI (EY)
  - 082: WiFi drops during PEAP→EAP-TLS auth switch on same SSID after SCEP deployment
  - 083: ABM enrollment 404 error (low confidence, limited info)
  - 084: Guide-draft — iPad Kiosk/AppLock mode migration with Kusto queries
- Deduplicated: 0
- Skipped: 6 pages (empty/contact-only/customer-list/process-doc)
- Exhausted: false (508 remaining)

## 2026-04-05 ado-wiki tick (chain)
- **Source**: ADO Wiki (Supportability/Intune)
- **Pages processed**: 2 (1 parent page skipped + /App Protection/WIP)
- **Fixed scanned records**: 8 previously processed but unmarked pages
- **Track A extracted**: 4 break/fix issues (intune-ado-wiki-053~056)
  - WIP + Direct Access conflict (0x807C0003)
  - EFS/DRA certificate file encryption failure
  - DFS namespace not recognized as corporate
  - AppCompat blocking for Firefox/Chrome/WhatsApp
- **Track B guide**: ado-wiki-WIP-App-Protection.md (intune-ado-wiki-057)
- **Deduplicated**: 0
- **Remaining**: 289 pages
- **Exhausted**: false

### 2026-04-05 ado-wiki tick (App Protection/WIP)
- **Pages processed**: 1 (/App Protection/WIP - 43390 chars)
- **Track A**: 1 new entry (intune-ado-wiki-060: WIP WE port 444), 2 skipped as duplicates of existing 053-057
- **Track B**: Guide draft already existed (ado-wiki-WIP-App-Protection.md)
- **Discovered**: 1
- **Deduplicated**: 2
- **Remaining**: 289 pages
- **Exhausted**: false

## 2026-04-05 — Phase 2 onenote-extract (batch: macOS + NDES/SCEP)

- **Source**: OneNote (MCVKB/Intune/Mac/*, MCVKB/Intune/NDES/*)
- **Pages processed**: 10 (1 empty page skipped: NDES.md)
- **Track A**: 7 new entries (intune-onenote-085 to 091)
  - 085: macOS FileVault not enabled after profile install
  - 086: FileVault enabled by user, Intune can't manage recovery key
  - 087: macOS LOB app install status incorrect (multi-pkg detection)
  - 088: NDES stops after KB5014702 (DCOM auth level mismatch)
  - 089: NDES 500 error from expired root CA CRL
  - 090: Hybrid AADJ SCEP failure (WHfB KSP conflict)
  - 091: SCEP external URL BadGateway (App Proxy misconfigured)
- **Track B**: 3 guide drafts (intune-onenote-092 to 094)
  - onenote-macos-extension-management.md
  - onenote-macos-shell-script-ts.md
  - onenote-scep-ndes-troubleshooting.md
- **Discovered**: 10
- **Deduplicated**: 0
- **Total scanned**: 140/632
- **Remaining**: 492 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick

- **Pages processed**: 3 (/Archived Pages, /Autopilot/Amazon Workspaces, /Autopilot/AP-DPP for Windows 365)
- **Discovered**: 2 guide-draft entries (intune-ado-wiki-061, 062)
- **Deduplicated**: 0
- **Skipped**: 1 (Archived Pages - administrative notice, no TSG content)
- **Track A**: 0 | **Track B**: 2
- **Remaining**: 286 pages
- **Exhausted**: false

### 2026-04-05 ado-wiki tick (Windows MAM)
- **Source**: ADO Wiki `/App Protection/Windows MAM` (23349 chars)
- **Track A**: 6 Break/Fix entries (intune-ado-wiki-062~067) — device registration delay, permanent MAM block from pre-existing account, health check bypass, DLP flags persistence, GCC-H/Mooncake unsupported, BingChat blocked
- **Track B**: 1 guide draft `ado-wiki-Windows-MAM.md` — comprehensive troubleshooting guide with support boundaries, log paths, diagnostic URLs, escalation path
- **21v**: All entries marked `21vApplicable: false` (Windows MAM depends on Edge sign-in which is unsupported in 21v; GCC-H/Mooncake explicitly unsupported)
- **Progress**: 26/311 scanned, 285 remaining

## 2026-04-05 onenote-extract tick

- **Pages processed**: 10 (MCVKB/Intune/NDES/*, Not Supported Scenario, Partner Compliance, Remote Action, SCCM client deploy, SEtoSEE)
- **Track A (break/fix)**: 3 entries (intune-onenote-099~101) — NDES proxy format, SCEP password expired/RPC, TLS 1.2
- **Track B (guide-draft)**: 2 entries (intune-onenote-102~103) + 2 guide drafts (ndes-scep-configuration-guide, partner-compliance-kusto)
- **Skipped**: 4 pages (images-only: 2, thin content: 1, internal process: 1)
- **Deduplicated**: 0 (no overlap with existing entries; intune-onenote-101 marked relatedTo intune-onenote-051)
- **Scanned total**: 164/632
| 2026-04-05 | ContentIdea KB (contentidea-kb-scan) | 9 entries extracted (intune-contentidea-kb-057~065) from 10 work items. 1 skipped (no content: #61659). 1 dedup pair (61288↔61290, RSS Feed). Topics: Company Portal sign-in, iOS config profiles, device enrollment errors, DEP supervision, ADFS device writeback, app deployment advisory. | auto-enrich Phase 5 |
- **Exhausted**: false

## 2026-04-05 ado-wiki tick
- Page: /App Protection/iOS (20067 chars)
- Track A: 10 break/fix items extracted (intune-ado-wiki-069 ~ 078)
- Track B: 1 guide draft saved (ado-wiki-App-Protection-iOS.md)
- Track B ref: 1 guide-draft JSONL entry (intune-ado-wiki-079)
- Topics: iOS APP known issues (data leakage, iMessage, jailbreak, screenshot, Open-In, misconfiguration alert, email attachments)
- Remaining: 284/311 pages

### 2026-04-05 onenote-extract tick
- **Scanned**: 10 pages (MCVKB/Intune: VPP Token, Enrollment Program Token, SharePoint download blocked, Support Ability feedback, Available app deploy x2, UI portal trace, PBI reporting, Windows index, 3rd party MDM Xenmobile)
- **Track A**: 2 issues extracted (intune-onenote-104~105)
  - SharePoint download blocked by unmanaged device CA policy
  - Available app not appearing in Company Portal due to effective group replication delay
- **Track B**: 1 guide draft (intune-onenote-106 → onenote-pbi-intune-data-warehouse.md)
- **Skipped**: 7 pages (screenshots only / empty / internal feedback / duplicate / single link)
- **Deduplicated**: 1 (Available app deploy duplicate page)
- **Progress**: 170/632 scanned, 462 remaining

## 2026-04-05 ado-wiki tick
- **Page**: /Autopilot (42218 chars)
- **Track A**: 4 break/fix entries (intune-ado-wiki-080~083)
  - TPM attestation failure (NTZ chips pre-Aug 2022)
  - HAADJ domain not reachable 80070774 timeout
  - Self-Deploy/Pre-Provision enrollment block after first use
  - HAADJ ESP User Setup timeout due to missing PRT
- **Track B**: 1 guide-draft (ado-wiki-Autopilot.md) - comprehensive Autopilot deployment guide
- **Remaining**: 283/311 pages

## 2026-04-05 ado-wiki tick
- Scanned: /Autopilot/Autopilot v2 Device Preparation (AP-DP)
- Extracted: 3 break/fix entries (080-082) + 1 guide-draft pointer (083)
- Guide: ado-wiki-Autopilot-Device-Preparation.md
- Remaining: 282 pages

## 2026-04-05 ado-wiki tick (AP-DP v2)
- **Scanned**: `/Autopilot/Autopilot v2 Device Preparation (AP-DP)` (14730 chars)
- **Track A**: 3 break/fix entries (intune-ado-wiki-085~087) — OOBE stuck at 100%, SP display name mismatch, provisioning skipped due to local admin conflict
- **Track B**: 1 guide draft — `ado-wiki-Autopilot-v2-Device-Preparation.md` (comprehensive TSG with Kusto queries, scoping questions, support boundaries)
- **Remaining**: 282 / 311 pages

## 2026-04-05 onenote-extract (tick)
- **Pages processed**: 10 (MC775341, MC777834, Surface Management Portal, ## How To, ## Android, Wrap Android apk, ## Windows, Audit registry key, Configure Policy to Auto-enroll, Deploy Printer Driver via Intune)
- **Track A (break/fix)**: 3 entries (intune-onenote-114~116)
- **Track B (guide-draft)**: 3 entries (intune-onenote-117~119) + 3 guide drafts created
- **Skipped**: 4 pages (empty section headers or minimal content)
- **Deduplicated**: 0
- **Cumulative**: 119 entries in known-issues-onenote.jsonl, 184 unique pages scanned / 632 total
- **Exhausted**: false (443 remaining)

## 2026-04-05 ado-wiki tick
- **Page**: /Autopilot/CSS Autopilot Case Wins (19466 chars)
- **Track A**: 9 break/fix entries extracted (intune-ado-wiki-089 ~ 097)
- **Topics**: Get-WindowsAutopilotInfo redirect URI, OS Edition Upgrade timeout, Pre-Prov unjoin behavior, LOB/Win32 mixing, Office/Bing regression, BitLocker bitness, OMADMClient crash (×2), Co-Management DeviceSetup timeout
- **Deduplicated**: 0
- **Remaining**: 281 pages

## 2026-04-05 ado-wiki tick
- **Page**: /Autopilot/User-Driven Hybrid Join (26821 chars)
- **Track**: A (Break/Fix) — 5 items extracted
- **IDs**: intune-ado-wiki-098 ~ 102
- **Topics**: Deployment Profile 冲突、OU 路径/语法错误、计算机名 >15 chars、Fix your Account (non-Federated)、ODJ Connector WebView2 权限
- **Dedup**: skipped domain-reachable (covered by 081) and LOB/Win32 mixing (covered by 092)
- **Remaining**: 280 pages unscanned
| 2026-04-05 | ado-wiki | +7 break/fix (intune-ado-wiki-102~108) +1 guide-draft (109): Legacy ODJ Connector Deprecation - CA check, 0x8007202F, proxy, WebView2, MSA not found, deprecation, multi-connector | Supportability/Intune wiki |

## 2026-04-05 ado-wiki tick (Autopilot HAADJ User-Driven)
- **Scanned**: /Autopilot/User-Driven Hybrid Join (26821 chars)
- **Track A**: 9 break/fix entries (intune-ado-wiki-110 to 118) — deployment profile conflicts, nltest DC connectivity, OU path syntax, NetBIOS name limit, Fix your Account on non-Federated, ODJ WebView2 permission, ESP timeout, LOB/Win32 mix, error 80070774
- **Track B**: 1 guide draft (ado-wiki-Autopilot-HAADJ-User-Driven.md)
- **Fixed scanned list**: added 4 previously-processed-but-unmarked pages (Windows MAM, Autopilot, AP-DP v2, Legacy ODJ Connector)
- **Stats**: discovered=10, deduplicated=0, total_scanned=32/311, remaining=279
| 2026-04-05 | ado-wiki | +8 break/fix (120-127) + 1 guide-draft (128): Conditional Access App-based/Device-based TSG - licensing, DEM, iOS email profile, Android encryption/certs/quarantine, Exchange cache, Windows CA scope | Supportability/Intune/Intune:/Conditional Access |

## 2026-04-05 ado-wiki tick (Copilot agents batch)
- **Scanned**: 3 pages (Copilot In Intune, Change Review Agent, Device Offboarding Agent)
- **Track A**: 4 break/fix entries (intune-ado-wiki-129~132) — RAI content filtering, RBAC permissions, Autopilot CRI, deprecation talking points
- **Track B**: 3 guide drafts (Copilot overview, Change Review Agent, Device Offboarding Agent)
- **Progress**: 36/311 pages scanned, 275 remaining
- **JSONL**: 149 lines total (7 new)

## 2026-04-05 ado-wiki tick (page 37/311)
- **Scanned**: /Copilot In Intune/Policy Configuration Agent (2596 chars)
- **Extracted**: 3 Break/Fix entries (IDs 148-150) — content filter failure, SCU insufficient, persistent banner error
- **Track**: A (Break/Fix)
- **21v**: all marked false (Security Copilot dependency)
- **JSONL**: 164 lines total | **Remaining**: 274 pages

### 2026-04-05 ado-wiki tick (page 45/311)
- **Page**: /Develop and Customize/App SDK for iOS (45428 chars)
- **Track A**: 6 break/fix items (intune-ado-wiki-154~159) — MSAL token failure, keychain errors, restart loop, policy not applied, wrong account ID, selective wipe
- **Track B**: 1 guide draft (intune-ado-wiki-160) → `guides/drafts/ado-wiki-App-SDK-for-iOS.md`
- **Deduplicated**: 0
- **Remaining**: 266 pages
| 2026-04-05 | contentidea-kb | +10 entries (intune-contentidea-kb-106~115), scanned WI#64281,64299,64301,64336,64341,64353,64370,64378,64383,64471. Topics: Apple Watch restrictions, Lookout MTP sync, Delve Android, iOS logs, Teams MAM, compliance check hang, AE app deploy, DEP network, shared mailbox, DEP sync | Phase5 tick |

## 2026-04-05 ado-wiki batch (Enterprise App Mgmt, Windows, GCC-H CP, Office)
- Pages scanned: 4 (App Management subtree)
- Track A entries: 9 (intune-ado-wiki-161 ~ 169)
- Track B guides: 1 new (Windows-App-Deployment)
- Deduplicated: 1 (Company Portal GCC-H already covered by 015)
- Office C2R: added missing error codes (0x80070005, 0x80070643, 0x80070bc9, channel mismatch, 17002, 17006, 997 stuck)
- Enterprise App Management: licensing + catalog request support boundaries
- Running total: 184 JSONL entries, 37/311 pages scanned

### 2026-04-05 03:40 — contentidea-kb tick (Phase 5)
- Scanned: 10 IDs (65946,65947,65986,66059,66069,66100,66215,66274,66288,66304)
- Discovered: 0 new (all 4 valid items already existed from prior partial run)
- Deduplicated: 4 (65946,65986,66100,66215 matched existing entries)
- Skipped: 6 (3 empty/weekly-flash, 1 duplicate-marker, 1 deleted, 1 informational)
- Running total: 189 JSONL entries, 317/1000 scanned

## 2026-04-05 ado-wiki tick (pages 62-67/311)
- Scanned 6 pages: MTG Support Boundaries, NDES/SCEP Overview, Adding SANs, Additional troubleshooting, How to Setup NDES, SCEP Troubleshooting + Procmon
- Extracted 18 entries (intune-ado-wiki-247 to intune-ado-wiki-264)
- 3 guide drafts created: MTG-Support-Boundaries-Escalation, NDES-SCEP-Overview, NDES-Setup-Guide
- Key findings: iOS SAN limitations for SCEP, PKCS SAN behavior (all platforms), connector cert renewal fix, Procmon-based third-party DLL interference diagnosis
- Remaining: 243/311 pages

## 2026-04-05 contentidea-kb tick
- scanned: 72282,72298,72411,72414,72415,72429,72441,72497,72506,72508
- discovered: 9, deduplicated: 0, skipped: 1 (empty fields)
- JSONL: 278-286 (maxSeq=286), scanned: 437/1000, remaining: 563

### 2026-04-05 — contentidea-kb tick (Phase 5)
- Scanned: 10 IDs (74677,74678,74679,74680,74684,74685,74688,74689,74825,74832)
- Discovered: 9 new (intune-contentidea-kb-274 to 282)
- Deduplicated: 1 (74684 matched existing entry)
- Skipped: 0
- Topics: Windows enrollment errors (80180014, 801c0003, 80180026), WCD bulk token, Home edition, NDES/SCEP 500 error, pre-contact checklist, Company Portal Android auto-update
- Running total: 282 JSONL entries, 507/1000 scanned, 493 remaining

## 2026-04-05 contentidea-kb tick
- **batch**: 74889,74895,74897,74898,74915,74916,74918,74934,74942,74977
- **discovered**: 8 (intune-contentidea-kb-274 ~ 281)
- **deduplicated**: 0
- **skipped**: 2 (74889 deleted article, 74977 duplicate KB)
- **scanned**: 517/1000, remaining: 483

## 2026-04-05 contentidea-kb tick
- scanned: 10 work items (76327,76338,76460,76583,76620,76673,76697,76840,76926,77013)
- discovered: 8 new entries (intune-contentidea-kb-274~281)
- deduplicated: 0, skippedEmpty: 2
- total scanned (unique): 576, remaining: ~424
- exhausted: false
| 2026-04-05 | contentidea-kb | +9 entries (274-282), 1 skipped empty, 0 dedup. Batch: 77121,77246,77257,77258,77264,77313,77317,77807,77941,77962. Scanned 586/1000. | ContentIdea WIQL |
| 2026-04-05 | contentidea-kb | +7 entries (intune-contentidea-kb-274~280), 3 skipped (empty fields), 0 dedup. Scanned IDs: 78004,78016,78356,78358,78442,78597,78735,78838,78873,78894. Remaining ~404. | ContentIdea WIQL |
| 2026-04-05 | contentidea-kb | +8 entries (intune-contentidea-kb-274~281), 2 deduped. WIs: 80571,80573,80669,80735-80739,80779. Topics: compliance status, Graph API, DEP enrollment, MDM enrollment, AfW binding, email profiles, NDES connector, service connectivity. Scanned 626/1000. | ContentIdea WIQL |

### 2026-04-05 contentidea-kb tick
- Scanned: 84296, 84297, 84298, 84299, 84302, 84303, 84403, 84478, 84513, 84522
- Discovered: 1 (84478: Intune Read-Only Operator role Forbidden error)
- Deduplicated: 6 (84296-84303: same SCCM/ConfigMgr symptom as existing #397/#398)
- Skipped (empty): 3 (84403 Weekly Flash, 84513/84522 no structured fields)
- Total scanned(unique): 696/1000, remaining: ~304

### 2026-04-05 contentidea-kb tick
- Scanned: 10 work items (85654,85663,85710,85752,85884,85914,85918,85995,86103,86136)
- Discovered: 7 new entries (intune-contentidea-kb-274 ~ 280)
- Skipped (empty): 3 (85654,85663,85995 - no structured fields)
- Deduplicated: 0
- Total scanned unique: 716/1000 | Remaining: 284

## 2026-04-05 ado-wiki scan — FINAL batch (exhausted)
- **Pages processed**: 12 (4 with content, 8 empty/parent pages)
- **New entries**: 4 guide-draft entries (intune-ado-wiki-458 ~ 461)
- **Content pages**: Intune Ongoing Issues, Intune SideCar (IME), Intune Undocumented By Design Issues, MEMCM overview
- **Empty/skipped**: Manage Software Updates (2), Driver Updates/Troubleshooting, Teams Devices, Third Party Integration, Welcome, Kusto Query Repository, Tags
- **Deduplicated**: 0
- **Status**: exhausted=true — all 311/311 pages scanned
- **Total JSONL**: 475 lines, last ID intune-ado-wiki-461
| 2026-04-05 | contentidea-kb | +9 entries (intune-contentidea-kb-552~560): Jamf/Intune integration issues (Graph API token, keychain signing, mobile account login, Autopilot delete, Jamf license expired), GCC High info, MDM for O365 permissions | ContentIdea#91910~91951 |
| 2026-04-05 | contentidea-kb | +9 entries (seq 552-560): JAMF/Intune integration (Graph API token, keychain, mobile account, connection test, license), Autopilot device deletion DDS fix, MDM Office 365 permissions, GCC High info | ContentIdea#91910-91951 |

### 2026-04-05 ado-wiki tick
- **Source**: ADO Wiki (Supportability/Intune)
- **Pages processed**: 1 (Tenant Attach)
- **Track B (guide-draft)**: 1 (ado-wiki-Tenant-Attach.md)
- **Track A (break/fix)**: 0
- **Discovered**: 1
- **Deduplicated**: 0
- **21v-unsupported**: 1 (Tenant Attach)
- **Progress**: 206/311 scanned, 124 remaining

### 2026-04-05 contentidea-kb tick (batch 2 start — IDs > 97642)
- Scanned: 10 work items (97643,97649,97674,97675,97729,97730,97731,97736,97737,97747)
- Discovered: 1 new entry (intune-contentidea-kb-717: Azure Support Center access request guide)
- Skipped archived: 5 (97643,97649,97675,97729,97736 — "Archived" symptom only)
- Skipped empty: 3 (97730,97731,97747 — no structured fields)
- Deduplicated: 1 (97737: MSSolve case reassignment overlaps 82% with intune-contentidea-kb-111)
- Total scanned unique: 1040 (1000 from batch 1 + 10 from batch 2 + 30 from prior runs)
- WIQL batch 2 returned 1000 more IDs (>97642), ~990 remaining
- Exhausted: false

### 2026-04-05 Phase 2 onenote-extract (tick)
- Source: onenote
- Pages processed: 10 (Kusto Query sub-section: EGM 4 sub-pages, noncompliance notification, DeviceLifecycle, General Query, EnrollmentType, MAM wipe, Jarvis)
- New entries: 9 (intune-onenote-131 to 139)
  - Track A (break/fix): 6 entries (131,133,134,135,137,138)
  - Track B (guide-draft): 3 entries (132,136,139) → 3 guide drafts created
- Guide drafts: onenote-intune-egm-troubleshooting.md, onenote-intune-device-lifecycle-reference.md, onenote-intune-jarvis-workaround.md
- Deduplicated: 1 (General Query ≥80% overlap with intune-onenote-124 Kusto table reference)
- Scanned total: 214/623 intune pages
- Exhausted: false

### 2026-04-05 onenote tick (continuation)
- Pages processed: 10 (Kusto Query section: Permission collect, Policy type/platform, MAM Applied, Reset Passcode, Intune→AAD, VPP Kusto, Windows Enrollment, Windows Update Ring, Windows Update, ADE enrollment profile)
- Track A entries: 3 (intune-onenote-127: MAM 21v Kusto function gap, 128: VPP sync 0 apps, 129: Update Ring B-only releases)
- Track B guide-drafts: 2 (intune-onenote-130: Policy Type/Platform mapping, 131: MAM Applied Kusto queries + UnenrollReason codes)
- Deduplicated: 1 (Reset Passcode POD version ≥80% overlap with intune-onenote-058)
- Skipped: 4 (Permission collect: internal tracking; Intune→AAD: too brief; Windows Update/Enrollment: single queries, covered by existing drafts)
- Scanned total: 224/632 intune pages
- Exhausted: false

## 2026-04-05 Phase2 onenote-extract (batch: MISC/Kusto Query)
- **Scanned**: 10 pages (iOS Enrollment Kusto, MISC (2), MISC, 21V Escalation Template, Tips for ICM escalation, App deployment structure, Collect Intune logs from macOS, Intune Commerce, Feature release & RCA, Support Boundaries)
- **Extracted**: 6 entries (intune-onenote-140 ~ 145)
- **Deduplicated**: 1 (App deployment structure → dup with intune-onenote-034)
- **Skipped**: 3 (empty/title-only pages: MISC (2), MISC, 21V Escalation Template)
- **Guide drafts**: 2 (onenote-macos-log-collection.md, onenote-intune-support-boundaries.md)
- **Progress**: 244/632 scanned, 393 remaining
- **Exhausted**: false

## 2026-04-05 onenote-extract (Windows TSG batch)
- **Scanned**: 10 pages (Windows TSG: Remote Action, USB Block, Win32/IME/PS Script TSG subtree)
- **Track A (break/fix)**: 4 entries (intune-onenote-146~149) — USB StorageCardDisabled persistence, Managed Installer registry.pol 0-byte, gpt.ini broken GUIDs, remediation script result not re-sent
- **Track B (guide-drafts)**: 7 drafts — ESP OOBE deep-dive, Remote Action comparison, Win32/IME/PS TSG, deploy PS as Win32, set PS execution policy, PS/Remediation FAQ, Petri's IME tool
- **Deduplicated**: 0
- **Progress**: 254/632 scanned (40.2%)

### 2026-04-05 OneNote Batch (Win32/IME/PS, BitLocker, Enrollment Errors)

- **Scanned**: 10 pages (Windows TSG: Win32 IME sample logs, IME troubleshooting, PS retry logic, enrollment errors 0x80180023/0x80070002, BitLocker rotation/DHA/MBAM migration/recovery key logic, auto-enrollment 0x80010106, Company Portal deployment)
- **Track A (break/fix)**: 12 entries (intune-onenote-157~168) — IME CDN latency China Telecom, IME not on AAD registered devices, IME retry reset, PS script retry DownloadCount reset, enrollment 0x80180023 dmwappushservice missing, BitLocker key not escrowed to AAD, Win10 vs Win11 old key behavior, BitLocker rotation config, DHA compliance reboot requirement, Autopilot BitLocker non-compliant, 0x80010106 CFCA UKEY COM conflict, Company Portal Required via LOB
- **Track B (guide-drafts)**: 2 drafts — Win32 IME sample log analysis, MBAM to MEM BitLocker migration
- **Deduplicated**: 0 (intune-onenote-167 marked relatedTo intune-onenote-044, 50-80% overlap)
- **Progress**: 259/632 scanned (41.0%)

### 2026-04-05 Phase 2 onenote-extract (batch 28)
- **Scanned**: 10 pages (Windows: WNS Push+TattooRemoval, TattooRemoval standalone, MS Store, MSI LOB workflow, Policy CSP, SyncML status codes, SyncML Viewer tool, Windows Compliance TSG, WUfB rollback, AutoPilot L100/200)
- **Track A (break/fix)**: 10 entries (intune-onenote-171~180) -- TattooRemoval hold-off, WNS dependency services 0x80070426, MSI LOB download BITS, MSI LOB silent install, Secure Boot DHA/PCR7, compliance Unknown DEM, WUfB rollback 0x80070490/0x82AA0002, AutoPilot branding, AutoPilot 801C0003, AutoPilot 80180018
- **Track B (guide-drafts)**: 2 drafts (intune-onenote-181~182) -- SyncML status code reference, SyncML Viewer internal tool
- **Deduplicated**: 1 (page TattooRemoval standalone is duplicate of WNS+TattooRemoval page content)
- **Skipped**: 2 pages (MS Store=images only, Policy CSP=too brief)
- **Progress**: 284/632 scanned (44.9%)

### 2026-04-05 onenote-extract tick (seq 181-185)
- Processed 10 pages: Windows TSG → Defender Firewall, Tamper Protection, Edge policy, Windows Enrollment (×6), GP enrollment TSG
- Track A: 3 break/fix entries (firewall rule visibility, tamper protection 21v deadlock, SCHED_E_UNKNOWN enrollment failure)
- Track B: 2 guide drafts (MDM enrollment error codes, GP auto-enrollment TSG)
- Skipped: 5 pages (images-only, empty, duplicate, link-only)
- Remaining: ~353 pages

## 2026-04-05 onenote-extract (batch: intune-onenote-186~195)

- Processed 10 pages: Windows TSG → Unenroll/re-enroll, OOBE+CAP enrollment, WHFB policy conflict (x2 scenarios), Kiosk mode (multi-app, kiosk settings, auto-logon), LAPS Kusto/support boundaries
- Track A: 7 break/fix entries (sync-error re-enrollment, WHFB policy conflict x2, kiosk PS script failure, kiosk lnk icon, kiosk SID mapping, kiosk EAS auto-logon)
- Track B: 3 guide drafts (OOBE enrollment with CAP, LAPS Kusto queries, LAPS support boundaries/SAP routing)
- Deduplicated: 0 (related-to linked: intune-onenote-008 for WHFB entries)
- Remaining: ~343 pages

## 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (9 readable + 1 file-not-found due to encoding)
- **Break/fix entries**: 8 (intune-onenote-196 to 203)
  - LAPS: 3 entries (Event 10025 DNS, Event 10059 HTTP 403/400)
  - WUFB: 5 entries (0x87c52200 SSL inspect, HTTP 407 proxy, Update Ring false-Failed, wrong Feature Update version, TargetReleaseVersion vs DSS)
- **Guide drafts**: 3 (LAPS event log, WUFB log collection, confirm Intune policy)
- **Deduplicated**: 2 (rollback/uninstallation overlaps 177, Windows Update ring B-release overlaps 129)
- **Scanned**: 294/632, remaining ~333
- **Exhausted**: false

### 2026-04-05 Phase 2 Tick (iOS TSG batch)
- **Source**: OneNote — `## iOS TSG/` section (10 pages)
- **Track A** (break/fix): 2 entries
  - intune-onenote-207: iOS AppLock policy replacement fails (relatedTo: 084) — PG-confirmed root cause: single-instance payload cannot be overwritten
  - intune-onenote-208: Quick Start restore → unlock token error (MCKeybagErrorDomain 37002)
- **Track B** (guide-drafts): 4 entries + draft files
  - intune-onenote-209: iOS/macOS MDM response codes reference table
  - intune-onenote-210: Apple MDM Protocol & APNs reference
  - intune-onenote-211: Company Portal iOS enrollment log analysis
  - intune-onenote-212: Apple Configurator enrollment procedure
- **Skipped** (no extractable text): ACME MDM cert (images only), Building iOS app (outdated tutorial), VPP Licenses (thin), Swift function (dev snippet)
- **Deduplicated**: 0 (207 partial overlap with 084, added relatedTo)
- **Scanned**: 304/632, remaining ~323
- **Exhausted**: false

## 2026-04-05 onenote-extract tick (pages 315-324)
- Processed 10 pages: iOS TSG (VPP REST client, VPP licensing, app prompts, app types, device config, error codes, enrollment errors, ADE sync, XPC_TYPE_ERROR, enrollment errors sub)
- Track A: 11 break/fix entries (intune-onenote-231 to 241) — iOS enrollment errors, ADE sync token issues, VPP license revocation via REST API
- Track B: 3 guide drafts (242-244) — iOS app install prompts, app types/deployment, MDM error codes reference
- Dedup: 2 pages (Sync token / iPadOS enrollment errors) were subsets of parent page — no duplicate entries created
- 2 pages sparse (VPP licensing, Device Config) — scanned but minimal extraction
- Scanned: 334/632, remaining: ~298

## 2026-04-05 onenote-extract tick
- **Processed**: 10 pages (##Test Device and Environment batch + 3rd party integration batch)
- **Discovered**: 1 new entry (intune-onenote-240: 3rd party compliance partner Kusto troubleshooting)
- **Deduplicated**: 5 (Kiosk content already extracted in intune-onenote-188~194)
- **Skipped**: 4 pages (empty/link-only/lab-credentials)
- **Scanned**: 334 → 344 | **Remaining**: 293
- **Exhausted**: false

## 2026-04-05 onenote-extract tick

- **Pages processed**: 10 (3rd party MDM Xenmobile, MTD Kusto compliance, Android logs x4, Co-management x3, PRT Log)
- **Track A entries**: 4 (intune-onenote-245..248)
  - 245: MTD compliance check via Kusto CalculationQueueLibrary (relatedTo: 003)
  - 246: Android battery optimization/launch restrictions blocking CP/Outlook (relatedTo: 005)
  - 247: Co-management auto-enrollment failure + retry behavior
  - 248: ConfigMgr AAD auto-join WMI verification for Path 1
- **Track B guide drafts**: 2
  - onenote-android-log-collection-guide.md (CP logs, debug log, ADB, Samsung, offline)
  - onenote-co-management-fundamentals.md (enrollment paths, workloads, verbose logging)
- **Skipped**: 4 pages (3 image-only/empty, 1 PRT Log dedup with intune-onenote-006)
- **Deduplicated**: 1 (PRT Log ≥80% overlap)
- **Scanned**: 354/632 | **Remaining**: 283

### 2026-04-05 Phase2 onenote-extract (tick)
- Pages processed: 10 (3rd party MDM Xenmobile, MTD Kusto compliance, Android logs×3, Offline mobile log, Co-management×3, PRT Log)
- Track A (break/fix): 3 entries (intune-onenote-245..247) — MTD compliance Kusto, co-management enrollment retry, PRT log collection
- Track B (guide-draft): 3 entries (intune-onenote-248..250) — Android debug log guide, offline mobile log guide, co-management fundamentals guide
- Skipped: 4 pages (3rd party MDM=images only, Android logs=empty, Log collect=dedup with 030, SCCM console status=too thin)
- Deduplicated: 1 (Log collect & Android device pre-request ≥80% overlap with intune-onenote-030)
- Scanned total: 349/632, remaining: 283, exhausted: false
| 2026-04-05 10:18 | onenote | +2 Track A (253-254: Android Outlook SSL cert chain, Win32 IME enrollment type), +4 Track B guides (255-258: TPM attestation, Autopilot ETW, Win32 deployment TSG, IME log interpreter), 3 dedup skipped (USB/146, enrollment-0x80180023/161+174), 3 thin-content skipped | phase2 batch |

### 2026-04-05 tick (onenote batch: intune-onenote-259..264)
- **Processed**: 10 pages (MCVKB/Intune/Windows/*, iOS/*, Wrap Android apk)
- **Discovered**: 6 new entries (3 guide-drafts, 3 break/fix)
- **Deduplicated**: 4 (0x80010106 CFCA_UKEY dup→044/167, Firewall dup→181, Update Ring dup→129/205, Wrap Android dup→117) + 2 empty/image-only pages skipped
- **Highlights**:
  - intune-onenote-261: GEC20203.dll (Haitaifangyuan) crash during enrollment (relatedTo 044)
  - intune-onenote-263/264: iOS B2B SSO failures — Edge PG confirmed bugs
  - Guide drafts: AutoPilot branding config, VPN custom OMA-URI, iOS SSO broker architecture
- **Remaining**: ~263 pages

### 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (MCVKB/Intune/Windows + iOS batch)
- **Discovered**: 7 new entries (intune-onenote-259 ~ 265)
  - 3 break/fix (GEC20203 enrollment crash, iOS SSO Prompt=login, iOS B2B Edge compliance bug)
  - 4 guide-drafts (iOS SSO debug, Autopilot branding, Update Ring logs, VPN OMA-URI)
- **Deduplicated**: 4 (0x80010106→167, Firewall→181, Update Ring B/C/D→129, Wrap APK→117)
- **Skipped**: 2 (empty/images-only pages)
- **Progress**: 369/632 scanned (58.4%), exhausted=false

## 2026-04-05 10:30 — onenote-extract tick (iOS batch)

- **Processed**: 10 pages (MCVKB/Intune/iOS/*)
- **New entries**: 6 (intune-onenote-266 ~ 271)
  - Track A: 1 (App Config case sensitivity, relatedTo intune-onenote-032)
  - Track B guide-drafts: 5 (Fiddler iOS, iOS SDK build, iExplorer log, VPP licenses, CP enrollment log analysis)
- **Deduplicated/skipped**: 4 (Response Code dup→209, MDM Protocol dup→210, Backup restore dup→208, Enroll failure too thin)
- **Scanned total**: 424 / 632 | **Remaining**: 253 → ~25 ticks

### 2026-04-05 onenote-extract batch (IDs 266-273)
- Pages processed: 10 (iOS subfolder batch)
- Track A (break/fix): 2 entries
  - intune-onenote-266: App Configuration case-sensitivity (key names must exact match)
  - intune-onenote-267: Backup/restore unlock token failure (passcode set before MDM)
- Track B (guide-drafts): 6 entries
  - intune-onenote-268: Fiddler trace capture on iOS
  - intune-onenote-269: iOS app deploy response codes reference
  - intune-onenote-270: Apple MDM protocol reference
  - intune-onenote-271: iExplorer log collection
  - intune-onenote-272: VPP license collection
  - intune-onenote-273: Company Portal enrollment log analysis
- Skipped: 2 pages (Building iOS app - dev tutorial, Enroll failure - just a link)
- Deduplicated: 0
- Scanned: 374/632 → remaining: 253
### 2026-04-05 10:34 tick (onenote-extract, chain)
- Pages processed: 10
- New entries: 0
- Deduplicated: 8 (content overlap >=80% with existing entries from other source paths)
- Skipped: 2 (1 code-only Swift snippet, 1 image-only page)
- Dedup details: Outlook MDM UPN Mismatch→014, VPP invite/9632/9616/LicenseNotFound/userless/exhausted→216-221, GlobalProtect China→224, Supervise without data loss→215, ICM log collection→026, SCEP renew VPN→228, VPP sync TSG→229, VPP Kusto→(ref queries already captured)
- Scanned: 434/632 | Remaining: 243 | exhausted: false

### 2026-04-05 Tick (onenote, chain)
- Pages processed: 10 (MCVKB/Intune/iOS: VPP REST, VPP licensing, app install prompts, Bundle ID, iOS Device Config, iOS Error codes, Intune pricing, China CP+Outlook MAM; POD: WeChat Win32, AllowLocalLogon)
- New entries: 4 (intune-onenote-272 to 275)
  - 272: Deploy WeChat/China EXE apps via Win32 (guide draft: onenote-deploy-wechat-win32.md)
  - 273: Restrict local logon via AllowLocalLogOn OMA-URI
  - 274: AAD group + AllowLocalLogOn two-profile workaround
  - 275: AllowLocalLogOn tattoo setting - cannot revert by unassigning
- Deduplicated: 6 (VPP REST→231/241, VPP licensing→219, prompts→232/242, Bundle ID→226, iOS errors→238/244, China CP→068)
- Skipped: 0 (thin: iOS Device Config mostly images, Intune pricing just link - counted as dedup/no-value)
- Scanned: 444/632 | Remaining: 233 | exhausted: false

## 2026-04-05 OneNote Extract Tick (intune)
- **Pages processed**: 10
- **New entries**: 5 (IDs 274-278)
  - 274: VPP REST client license management guide-draft
  - 275: VPP user vs device licensing (Apple ID prompt behavior)
  - 276: WeChat Win32 app deployment guide-draft
  - 277: AllowLocalLogOn restriction via OMA-URI custom profile
  - 278: AllowLocalLogOn CSP is tattooed/irreversible (known issue)
- **Deduplicated (skipped)**: 4 pages
  - iOS prompts → already covered by intune-onenote-242
  - iOS Bundle ID → already covered by intune-onenote-226
  - iOS Error codes → already covered by intune-onenote-238/244
  - 国内Company Portal → already covered by intune-onenote-068
- **Skipped (thin content)**: 2 pages (iOS Device Config, Intune pricing)
- **Guide drafts created**: 2
  - onenote-vpp-rest-client-license-management.md
  - onenote-deploy-wechat-win32-app.md
- **Remaining**: ~233 pages
- **Exhausted**: false

### 2026-04-05 Tick (intune-onenote-279~282)
- Processed: 10 pages (## How To/## Windows batch + ## iOS)
- Discovered: 4 new entries (1 guide-draft AppLocker Managed Installer, 1 Autopilot deregistration, 1 guide-draft Chrome ADMX, 1 WDAC/AppLocker all-apps-blocked)
- Deduplicated: 6 (USB write access dup, LAPS config dup, Win32 images-only, GPO auto-enroll dup, AutoPilot branding dup, iOS empty)
- Guide drafts created: onenote-applocker-managed-installer-whitelist.md, onenote-chrome-homepage-admx-omauri.md
- Scanned total: 454 paths | Remaining: ~223

## 2026-04-05 Phase 2 OneNote (batch ~tick N+1)

- **Pages processed**: 10 (How To / Windows + iOS section)
- **Discovered**: 5 new entries (intune-onenote-279 ~ 283)
  - Track A: 2 (Autopilot deregistration, AppLocker blocks all apps)
  - Track B guide-drafts: 3 (LAPS config, AppLocker Managed Installer, Chrome homepage ADMX)
- **Deduplicated**: 2 (GPO auto enroll ~= 111/119, Autopilot branding ~= 259/263)
- **Skipped**: 3 (file not found, images-only, empty section)
- **Remaining**: ~223 pages
- **Status**: NOT exhausted

### 2026-04-05 tick (onenote batch ~428/632)
- **Pages processed**: 10
- **New entries**: 11 (intune-onenote-290 to intune-onenote-300)
  - Track A: 11 (iOS defer upgrade, App Proxy redirection, APN cert renewal, Graph API policy query, Company Portal ESTS realm, Android WPJ dual-domain, macOS auto-update PG bug, macOS shell script report mismatch, Wi-Fi profile report mismatch, 302 redirect LSI, license removal by-design)
  - Track B guide-drafts: 0
- **Deduplicated**: 1 (AI formatted = duplicate of iOS defer page)
- **Skipped**: 4 (screenshots-only Apple Enrollment Token, empty Untitled page, ICM Process template links, Work-Item reference link)
- **Remaining**: ~203 pages
- **Status**: NOT exhausted

## 2026-04-05 onenote tick (intune-onenote-290..301)
- **Pages processed**: 10 (How To × 7, ICM Process × 3)
- **Track A entries**: 9 (iOS defer upgrade, APN renewal, Company Portal login error, Android WPJ dual-domain, macOS prevent auto-update bug, macOS wired-network bug, 302 redirect LSI, cert 0x86000031, policy without license by-design)
- **Track B guide-drafts**: 3 (App Proxy redirection, PowerShell/Graph API, Apple Enrollment Token)
- **Skipped**: 2 (empty page, AI-reformatted duplicate of #1)
- **Deduplicated**: 1 (AI formated = duplicate of iOS defer page)
- **Total scanned**: 428 → 438 | **Remaining**: 203

### 2026-04-05 tick (onenote batch ~438/632)
- **Pages processed**: 10
- **New entries**: 5 (intune-onenote-301 to intune-onenote-305)
  - Track A: 3 (NDES IIS binding cert, NDES SAN dual-DNS, CA certutil EditFlags)
  - Track B guide-drafts: 2 (IcM follow-up escalation process, NDES/SCEP lab setup end-to-end)
- **Deduplicated**: 1 (LOB app update ≥80% match with intune-onenote-076)
- **Skipped**: 4 (DCR template, SEtoSEE/TGP process, public doc edit link, Untitled)
- **Remaining**: ~193 pages
- **Status**: NOT exhausted

### 2026-04-05 tick (scanned 449→458)
- Pages processed: 10 (NDES lab substeps, MDM vendor, Not Supported, Partner Compliance, Publishing Articles, SharePoint CA, TSG DeviceServiceSLA)
- Discovered: 3 (intune-onenote-306..308)
- Deduplicated: 2 (Partner Compliance→102/240, SharePoint→104)
- Skipped: 5 (image-only: MDM vendor, Not Supported; too thin: NDES profile/success/lab steps; meta-process: Publishing Articles)
- Guide-draft: onenote-deviceservicesla-incident-response.md
- Remaining: 183
| 2026-04-05 | onenote | Phase2 tick: 10 pages (ICM Process refs + MISC/LOB + NDES Lab 5-part series) | — |
- Track A (4): LOB update prompt behavior (302), NDES cert warning (303), Connector prereq fail (304), GetCACaps error (305)
- Track B (3): DCR submission process (306), IcM IET escalation (307), NDES/SCEP Lab Guide (308)
- Skipped: 3 (too thin: SEtoSEE-TGP; link-only: modify public doc; pages absorbed into combined NDES guide)
- Guide-drafts: onenote-DCR-Feature-Request-Process.md, onenote-IcM-IET-Followup-Escalation.md, onenote-NDES-SCEP-Lab-Setup.md
- Remaining: ~183

### 2026-04-05 onenote-extract tick (478/632)
- Processed 10 pages (macOS TSG section: pricing, MacOS TSG index, ADE Enroll, BYOD enroll, Mac re-enroll, App deployment overview, LOB TS guidelines, multiple app install, Sidecar workflow, Shell TS)
- Skipped 4 (empty/minimal: pricing link, TSG index link, ADE Enroll empty, BYOD images-only)
- Deduplicated 2 (Mac re-enroll →077, multiple app install →087)
- Discovered 6 new entries (309-314): 3 Track A (LOB install failure/unsigned pkg, malformed URL/spaces, app update/version), 3 Track B guide-drafts (app deployment overview, Sidecar workflow, shell script TS)
- Created 3 guide drafts: onenote-macos-app-deployment-overview.md, onenote-macos-sidecar-agent-workflow.md, onenote-macos-shell-script-troubleshooting.md
- Remaining: 173 pages, exhausted: false

### 2026-04-05 Phase2 tick (scanned 479→488)
- Pages processed: 10 (macOS TSG batch: pricing, MacOS TSG index, ADE Enroll, BYOD enroll, Mac re-enroll, app deployment overview, LOB troubleshooting, multiple app install, SideCar workflow, Shell TS)
- Skipped (no content): 4 (pricing link, TSG index, empty ADE, images-only BYOD)
- Deduplicated (≥80%): 2 (Mac re-enroll → 077, Shell TS → 093)
- New entries: 6 (intune-onenote-309..314)
  - Track A: 309 (LOB pkg not distribution archive), 310 (LOB update version detection), 311 (malformed URL from spaces), 313 (multi-component pkg detection)
  - Track B: 312 (macOS app deployment overview), 314 (SideCar agent workflow)
- Guide drafts: onenote-macos-app-deployment-overview.md, onenote-macos-sidecar-agent-workflow.md
- Remaining: 173 | exhausted: false

### 2026-04-05 Phase 2 tick (scanned 489→498, IDs 315-319)
- **Batch**: 10 pages (macOS TSG: LOB status, FileVault, Update, Extension, Preference, Config Policy TSG, Defender pref deployment, SCEP renew, Mooncake Case Study, 0x80190190)
- **Discovered**: 5 new entries (2 Track A, 3 guide-drafts)
- **Deduplicated**: 4 (LOB status→087, FileVault→085/086, Update→062, Extension→092)
- **Skipped**: 1 empty page (Mooncake Case Study title-only)
- **New Track A**: SCEP manual delete→re-enroll (318), 0x80190190 MmpcEnrollmentFlag bug (319)
- **New guide-drafts**: preference domain names (315), macOS config policy TSG (316), Defender pref deployment methods (317)
- **Remaining**: ~163 pages

### 2026-04-05 Phase2 onenote-extract (tick)
- **Batch**: 10 pages from `## Mooncake Case Study/` (118112726006109..2308150040000958)
- **Track A** (3): kiosk Auto-logon fix (#320, relatedTo #192), GPO blocking MDM enrollment (#321), 0x86000031 user/device cert conflict (#322, relatedTo #297)
- **Track B** (4): printer deployment guide (#323), O365 ProPlus TSG (#324), macOS SW update monitoring (#325), macOS enrollment renewal Kusto (#326)
- **Dedup** (2): Device Check-in/InvalidDeviceCredentials ≥80% overlap #046/#128; TattooRemoval ≥80% overlap #171
- **Skip** (1): page 2308150040000958 title-only, no content
- JSONL: 409 → 416 lines | Scanned: 478 unique | Remaining: ~153

| 2026-04-05 | onenote (Phase 2) | +10 entries (intune-onenote-315..324), 6 guide drafts, fixed 21 broken JSONL escapes | tick ~488→468 scanned, ~163 remaining |

**Tick detail (315-324):**
- **Track A** (4): FileVault user-enabled recovery-key escrow (#315), FileVault payload-installed-not-enabled (#316), SCEP manual-delete requires re-enrollment (#323), 0x80190190 co-management MmpcEnrollmentFlag bug (#324)
- **Track B** (6): FileVault TSG w/ error codes (#317), macOS SW update Kusto+events (#318), system extension deployment (#319), preference domain reference (#320), macOS config policy TSG (#321), Defender 3-method preference push (#322)
- **Dedup** (1): macOS LOB multi-pkg status ≥80% overlap #313
- **Skip** (1): Mooncake Case Study index page (empty)
- **Fix**: 21 broken JSONL entries repaired (unescaped backslashes)
- JSONL: 426 lines | Scanned: 468→478 | Remaining: ~163

### 2026-04-05 Phase2 onenote tick (batch ~508)
- Scanned: 10 pages (Mooncake Case Study batch)
- Discovered: 6 new entries (intune-onenote-327..332)
  - Track A: 4 (GPO blocks MDM enrollment, MDM authority Unknown, printer driver KB5005652, 0x86000031 user/device scope conflict)
  - Track B: 2 guide-drafts (device check-in routing Kusto, macOS SCEP renewal Kusto)
- Deduplicated: 4 (kiosk mode ≥80% overlap, O365 ProPlus TSG ≥80%, macOS update ≥80%, TattooRemoval ≥80%)
- Skipped: 1 (empty page: enrollment type unexpected)
- Total scanned: 508/632 | Remaining: 153

### 2026-04-05 onenote-extract tick (pages 519-528)
- Pages processed: 10 (Mooncake Case Study batch: VPP deploy/TSG, Win32 install, macOS update, Android LOB, Kiosk, app status, inventory, PKCS cert, sync error)
- New entries: 14 (intune-onenote-327 ~ intune-onenote-340)
  - Track A (break/fix): 13 entries
  - Track B (guide-draft): 1 entry (onenote-intune-ios-vpp-app-deployment.md)
- Deduplicated: 2 (VPP invite not accepted ≥80% overlap with intune-onenote-216; PKCS cert renewal ≥80% overlap with intune-onenote-074)
- Related links: intune-onenote-338 → relatedTo intune-onenote-087; intune-onenote-340 → relatedTo intune-onenote-319
- Total scanned: 528/632 | Remaining: 104

### 2026-04-05 onenote-extract tick (pages 529-538)
- Pages processed: 10 (Mooncake Case Study batch: VPP deploy, VPP TSG, Win32 app install, macOS update, Android LOB, Kiosk mode, app status inconsistent, device inventory, PKCS cert, sync error)
- New entries: 12 (intune-onenote-333 ~ intune-onenote-344)
  - Track A (break/fix): 12 entries
  - Page 1 (VPP deploy): skipped - too thin for guide draft (5 screenshot steps only)
  - Page 9 (PKCS cert renew): skipped - deduplicated with intune-onenote-074
- Deduplicated: 3 (VPP invite dup of 216, VPP 9632 dup of 217, PKCS cert renewal dup of 074)
- Related links: intune-onenote-342 relatedTo intune-onenote-313
- Total scanned: 538/632 | Remaining: 143

| 2026-04-05 | onenote | +11 entries (333-343): VPP deploy/TSG guides, VPP invite/userless/auto-update, Win32 filename mismatch, macOS Install Later 12008, Android LOB China firewall, macOS pkg install-location, inventory platform bug, 0x80190190 multi-user license. Deduped 5 (VPP 9632/9616/LicenseNotFound, PKCS renew, Kiosk EAS). Cleaned 124 historic dups. 2 guide-drafts created. | pages 479-488 |
### 2026-04-05 03:38 UTC — onenote-extract tick
- Processed 10 pages (Mooncake Case Study batch: 2401-2407)
- Track A: 7 new triplets (intune-onenote-345..351)
- Track B: 2 guide-draft refs (352, 353) — drafts already existed
- Skipped: 1 page (insufficient content)
- Deduplicated: 0 (2 entries marked relatedTo existing)
- Remaining: 133 pages | exhausted: false

### 2026-04-05 — onenote tick (pages 529-538)
- Track A: 9 new triplets (intune-onenote-362..370)
  - Security Baseline report timing (by-design)
  - WU Ring feature update delay + SoftwareDistribution cache
  - Enrollment: GPO not delivered, missing license, SCCM legacy EnrollmentState=2
  - NDES/SCEP: IIS stopped, Root CA CRL expired
  - Autopilot v2 filter delay (Entra Strong Consistency on national cloud)
  - Chrome stub installer + IMECache UnauthorizedAccessException
- Track B: 2 guide-draft refs (intune-onenote-371, 372)
  - Graph API report pagination (21v)
  - LAPS automatic account management
- Skipped: 2 pages (page1=dup of 082 WiFi PEAP/EAP-TLS, page3=thin+covered by 182 Tamper Protection)
- Deduplicated: 0
- Remaining: 123 pages | exhausted: false

| 2026-04-05 | onenote | +11 entries (intune-onenote-373~383), 1 dedup skip, 1 guide-draft | Phase 2 tick |

**Tick detail (10 pages → 11 entries + 1 skip):**
- Track A: 9 break/fix entries
  - 373: Company Portal LOB version detection failure (21v, store-signed auto-update)
  - 374: Teams not found after Autopilot on Win 24H2 China (CN region missing)
  - 375: iOS Teams stale OID → MAM login fail (SDK version mismatch)
  - 376: Edge Enterprise Mode conflict with SCCM CCM client
  - 377: MDM enrollment blocked by SetManagedExternally=1 (0x80180026)
  - 378: BitLocker policy error from FixedDrivesRecoveryOptions "Not Configured"
  - 380: Co-management WMI MDM_ConfigSetting class missing
  - 381: CMG question mark in SCCM (boundary/cert/content config)
  - 382: iOS Teams ProtectionPolicyRequired 53005 (expired MAM token, multi-tenant pattern)
- Track B: 2 guide-draft refs (intune-onenote-379, 383)
  - iOS device check-in troubleshooting (Kusto + power saving analysis)
  - Deploy SCCM client via Intune CMG (LOB vs Win32)
- Skipped: 1 page (AllowLocalLogOn ≥80% dup with intune-onenote-267/271/272)
- Deduplicated: 1
- Remaining: 113 pages | exhausted: false

### 2026-04-05 Tick — NDES/SCEP/PFX TSG batch (pages 519-528)
- Scanned: 10 pages (NDES/SCEP/PFX TSG section)
- Track A: 4 new issues (intune-onenote-381~384)
  - 381: NDES connector cert expired → 0x80070057/403 Forbidden
  - 382: iOS SCEP fails due to old root CA from backup/restore (CRL conflict)
  - 383: Certificate Connector v6.2510.3.2002 China login routes to Global endpoint (ICM-953660)
  - 384: NDES connector service account missing "Log on as a service" right
- Track B: 4 guide-drafts (intune-onenote-385~388)
  - NDES validation script overview
  - PFX/PKCS end-to-end configuration & troubleshooting
  - NDES SCEP/RA certificate renewal (merged 2 pages)
  - SCEP/NDES architecture workflow
- Deduplicated: 2 (KB5014702 DCOM = intune-onenote-086; NDES SCEP cert renewal merged into RA cert guide)
- Remaining: 104 pages | exhausted: false

### 2026-04-05 Phase2 onenote-extract tick
- **Pages processed**: 10 (NDES/SCEP/PFX TSG section)
- **Track A (break/fix)**: 4 entries (intune-onenote-384..387)
  - 384: NDES connector cert expired → 0x80070057/403
  - 385: iOS SCEP fails due to old root CA from backup
  - 386: Connector 6.2510.3.2002 routes 21v login to global Entra
  - 387: NDES services fail - service account lacks Log on as service
- **Track B (guide-draft)**: 4 entries (intune-onenote-388..391) + 4 draft files
  - 388: NDES diagnostic script guide
  - 389: PFX/PKCS configuration & troubleshooting guide
  - 390: Renewing NDES SCEP/RA certificates guide
  - 391: SCEP/NDES workflow guide
- **Deduplicated**: 1 (KB5014702 → matches intune-onenote-086)
- **Remaining**: ~103 pages
- **exhausted**: false

### 2026-04-05 Tick — NDES/SCEP/PFX TSG batch 2 (pages 529-538)
- Scanned: 10 pages (NDES/SCEP/PFX TSG section continued)
- Track A: 2 new issues (intune-onenote-389~390)
  - 389: PFX Legacy Connector service stopped (expired cert, relatedTo 381)
  - 390: SCEP deploy fail 0x800706ba RPC unavailable (service account password expired + gMSA not supported)
- Track B: 3 guide-drafts (intune-onenote-391~393)
  - SCEP troubleshooting workflow (log template, event IDs, Kusto)
  - SCEP/PFX lab deployment (MyWorkspace automated setup)
  - NDES SCEP end-to-end configuration (incl. 21v App Proxy command)
- Deduplicated: 3 (proxy scheme=097, TLS 1.2 common algorithm=099, challenge password=098)
- Skipped: 2 (New NDES connector=images only, Wired profile=empty)
- Remaining: 94 pages | exhausted: false

### 2026-04-05 Tick — Tools & Readiness batch (pages 539-548)
- Scanned: 10 pages (Other Tools + Readiness sections)
- Track A: 0 (all reference/tooling pages)
- Track B: 2 guide-drafts (intune-onenote-394~395)
  - SyncML diagnostic tools (Viewer + status codes + wbemtest, merged 4 pages)
  - Apple VPP REST API license management (Postman alternatives)
- Skipped: 5 (empty/images-only: Other Tools header, ConfigMgr Toolbox, Jarvis, Readiness, Bootcamp 2021)
- Deduplicated: 0
- Remaining: 84 pages | exhausted: false

### 2026-04-05 12:12 — onenote-extract tick (intune)
- Pages processed: 10 (Readiness section + Technical Menu + Windows TSG index)
- New entries: 2 (intune-onenote-396..397)
- Deduplicated: 0
- Skipped (no extractable content): 8 (admin/personnel tracking, training links, channel links, empty pages)
- Total scanned: 559 / 632
- Remaining: 73
- Key extractions: iOS User Enrollment 21v feature gap, SCEP+trusted cert assignment mismatch

### 2026-04-05 12:13 — onenote-extract tick (Readiness/Wiki/Technical pages)
- Pages processed: 10 (Readiness section: Check Point Status, Readiness checklist, Wave 1, Wave 2, Permission Request, Sharing Session, Swarming Channel, Wiki, Technical Menu, Windows TSG)
- Discovered: 5 (intune-onenote-396..400)
- Deduplicated: 0
- Skipped (no technical content): 5 (Check Point Status, Sharing Session, Swarming Channel, Wiki, Windows TSG empty)
- Topics: iOS User Enrollment 21v gap, BitLocker v-TPM on Azure VM, NDES/CA server separation, Certificate Connector admin elevation, Kusto Mooncake permission
- Total JSONL: 389 | Scanned: 558/632 | Remaining: 73
| 2026-04-05 | onenote | +14 entries (intune-onenote-401..414): 9 break-fix + 5 guide-draft | Phase 2 batch |

**Batch details (tick @ 2026-04-05):**
- Pages processed: 10 (Windows TSG section: ADMX backed policy, App protection policy Edge MAM, App Control for Business WDAC, Autopilot V2 TSG, 21v APv2 network URLs, APv2 Kusto, ESP 0x800705b4, ESP phases, Setup Autopilot V2, Setup Corporate Identifier)
- Discovered: 14 (intune-onenote-401..414)
- Deduplicated: 0
- Break/Fix: 9 — ADMX edition fail, WDAC error 65000, Edge MAM flags persist, CA enrollment ID mismatch, mamlog token, 21v APv2 URLs, ESP IME timeout, ESP Win32 download, APv2 error 80180014
- Guide-draft: 5 — ADMX deployment, Edge MAM architecture, APv2 TSG, ESP phases, APv2 setup 21v (existing drafts found, JSONL pointers only)
- Skipped content extraction: 1 (Setup Corporate Identifier — mostly images)
- Total JSONL: 403 | Scanned: 568/632 | Remaining: 63
| 2026-04-05 | onenote | Phase2 tick: 10 pages processed (APv2 troubleshooting, Autopilot V1 level 100-400, ESP slow HAADJ, Intune Enrollment SP, Firewall rules, INF driver, WNS Push, TattooRemoval). +1 new entry (intune-onenote-420: TattooRemoval Kusto+disabled-user). 9 deduped (overlaps with entries 105/107/108/169/170/177/178 + entries 415-419 from prior tick). 53 remaining. |  |

| 2026-04-05 | onenote | Phase2 tick: 10 pages (ICM logs, MS Store, Remote Action, Co-mgmt Admin/SCCM-log/Duplicate/Workloads/Autoenroll/AgentState/FeatureGap). +8 new (intune-onenote-421..428): 4 break-fix (duplicate-device CoMgmtReportForceSend, EP tattooed exclusions cleanup, ConfigMgr agent state ClientHealthStatus, UPN .local blocks AzureAdPrt) + 4 guide-drafts (comanagement-admin-guide, sccm-verbose-log, workload-flags, autoenrollment-process). 2 deduped (ICM logs=025, Remote Action=101). 2 skipped (images-only, empty). Fixed parallel-agent ID collision (re-numbered 421-428, removed dup lines). Scanned: 588/632, Remaining: 44. |  || 2026-04-05 | onenote | Phase2 tick: 10 pages (Co-mgmt Q1-Q5, SCCM Wiki, Workloads/Capabilities, iOS logs, MAM 3rd-party logs, Portal device status). +7 new (intune-onenote-429..435): 5 break-fix (Client Apps pre-release feature hidden, SCCM+Intune dual app deploy, See ConfigMgr compliance, DeviceConfig auto-moves RA/EP, GPO vs timer enrollment delay) + 2 guide-drafts (deploy-cm-client-from-intune, ios-log-collection). 0 deduped (2 relatedTo: 156, 428). 2 skipped (images-only, link-only). Fixed ID collision with parallel agent (deduped 16 dup entries, 20 dup paths). Scanned: 598/632, Remaining: 33. |  |

## 2026-04-05 tick (onenote batch 608/632)
- Scanned 10 pages (iOS logs subsection + Intune TSG Flow + Linux)
- Skipped 4: Apple Logs (empty link), Gather Console log (dup 434), TCPdump (dup 434), Linux (empty)
- Added 6 guide-draft entries: intune-onenote-436..441
  - 436: iOS Fiddler proxy HTTPS capture
  - 437: iOS sysdiagnose via AssistiveTouch
  - 438: Offline mobile log (iOS Outlook + Android CP)
  - 439: iOS app crash log location
  - 440: Intune TSG flow decision tree
  - 441: MS Tunnel VPN per-user network trace
- Created 5 draft files in guides/drafts/ (1 already existed)
- Stats: 608 scanned, 23 remaining, 431 JSONL entries

### 2026-04-05 tick (Phase 2 onenote, ~13 remaining)
- Processed 10 pages (2 empty: "Mac logs", "Windows logs")
- +8 guide-draft entries (intune-onenote-442..449): MS Tunnel access/verbose log, macOS CP/Console/ODC logs, Windows IME/MDM Diagnostics/Autopilot cab logs
- 3 entries relatedTo intune-onenote-027 (MDM Logs overview)
- Scanned: 618/632 | JSONL: 438 entries | Remaining: 13

### 2026-04-05 onenote tick (442-449)
- Scanned 10 pages (2 empty: Mac logs index, Windows logs index)
- +8 guide-draft entries: MS Tunnel access/verbose logs, macOS CP/Console/ODC logs, IME logs, MDM Diagnostics report, Autopilot cab log
- 2 entries with relatedTo (intune-onenote-245): MDM diagnostics + Autopilot cab overlap existing entry
- 0 deduplicated
- Progress: 618/632 scanned, 13 remaining

### 2026-04-05 tick (Phase 2 onenote, FINAL)
- Processed 13 pages in 2 sub-ticks (10+3)
- +21 guide-draft entries (intune-onenote-442..462): all log-collection guides
- 2 empty pages skipped (Mac logs, Windows logs containers)
- Scanned: 651/632 (superset due to multi-product pages) | JSONL: 451 entries total
- **EXHAUSTED = true** — all 632 intune-classified OneNote pages processed

### 2026-04-05 onenote cleanup (concurrent agent conflict resolution)
- Detected 5 duplicate IDs (443-447) from concurrent agents writing simultaneously
- Removed 5 duplicate entries (lines 451-455)
- Fixed malformed JSON on line 450 (invalid \escape in .\start-auth.ps1)
- Added missing Bitlocker entry (intune-onenote-456)
- Final state: 451 valid entries, 0 parse errors, 0 remaining pages
- **EXHAUSTED = TRUE** — all 632 intune pages from classification scanned
[2026-04-05] SYNTHESIZE: 85 guides generated, 1476 entries kept, 50 discarded
[2026-04-05] ado-wiki-scan blast-batch-a (10 pages): discovered 14 entries (028-041). Track A: 4 Break/Fix (AADSTS5000224 tenant deprovisioned, test-tenant expired licenses, Cloud Academy 404 auth error, Readiness Tool video playback). Track B: 10 guide-drafts (ICM-Case-Handling-Best-Practices, ICM-Data-Handling, LSI-Handling-Procedure, Language-Line-Interpreter, Service-Notifications, Template-Requesting-Help-Teams, Test-Tenant-Management, Time-Zone-Mismatch-End-of-Shift, Using-Ava, Readiness-Tools). 0 deduplicated.

### 2026-04-06 ado-wiki blast batch-a (r2)
- **batchId**: a
- **pages assigned**: 10
- **pages with content**: 2 (MDE, Security Tasks)
- **empty/stub pages**: 8 (App Control, Engineer Reference, 6x Delivery Partners subpages)
- **Track A entries**: 1 (endpoint security support boundaries / case routing)
- **Track B guide drafts**: 2 (ado-wiki-a-Microsoft-Defender-for-Endpoint.md, ado-wiki-a-Security-Tasks.md)
- **total JSONL entries**: 3 (2 guide-draft + 1 raw)
- **deduplicated**: 0
- **ID range**: intune-ado-wiki-a-r2-001 ~ intune-ado-wiki-a-r2-003

### 2026-04-06 ado-wiki blast batch-a (r4)
- **batchId**: a
- **pages assigned**: 10
- **pages with content**: 4 (SAW Team Onboarding, Teams Devices, Teams Devices/Android Based/Assorted Information, Teams Devices/Windows Based)
- **empty/stub pages**: 6 (Driver Updates, Driver Updates/Troubleshooting, Expedite Updates, Hotpatch, SAW Team Member Reference [access notice only], Third Party Integration [parent stub])
- **Track A entries**: 0
- **Track B guide drafts**: 4 (ado-wiki-a-saw-team-onboarding.md, ado-wiki-a-teams-devices-overview.md, ado-wiki-a-teams-devices-android-assorted.md, ado-wiki-a-teams-devices-windows-based.md)
- **total JSONL entries**: 4 (all guide-draft)
- **deduplicated**: 0
- **ID range**: intune-ado-wiki-a-r4-001 ~ intune-ado-wiki-a-r4-004

## 2026-04-06 ado-wiki blast batch-a

- **batchId**: a
- **pagesProcessed**: 10
- **discovered**: 2 (Track B guide-drafts)
- **deduplicated**: 0
- **pages**:
  - ✅ Welcome (6 pages) — meta/wiki-authoring, skipped
  - ✅ Kusto Query Repository — empty parent, skipped
  - ✅ Tags — empty, skipped
  - 📘 Kusto Query Repository/Intune Global cluster queries → guide-draft (snapshot cluster KQL)
  - 📘 Kusto Query Repository/Intune Kusto Cluster Reference → guide-draft (66 KQL queries)
- **IDs**: intune-ado-wiki-a-r5-001 ~ 002
- **files**: known-issues-ado-wiki-a.jsonl, scanned-ado-wiki-a.json, 2 guide drafts
