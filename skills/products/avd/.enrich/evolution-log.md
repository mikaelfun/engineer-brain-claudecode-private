# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b r6: processed 10 pages (4 Deployment Failures, 6 Host/AVD Agent). 3 thin redirect pages (docs-only links) included with low confidence. Track A: 8 entries — 5 high-confidence break/fix (Storage Blob deploy fail, INVALID_REGISTRATION_TOKEN, NAME_ALREADY_REGISTERED, Process Crashing triage, Repeated Sessions fSingleSessionPerUser) + 3 low-confidence doc-refs (InvalidResourceReference, Admin Username, Unauthorized). Track B: 2 guide-drafts (Determine custom vs gallery image via ASC, Reinstall AVD Applications step-by-step). 10 discovered, 0 deduplicated. Content fetched via Git Blob API (tree→objectId→blob) due to codeWiki REST path emoji prefix issue (🔄Workflows). IDs: avd-ado-wiki-b-r6-001~010. | WindowsVirtualDesktop wiki — Deployment Failures, Host or AVD Agent |
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-a r5: processed 10 pages (4 Deployment Failures, 6 Health Check SxSStack/URLCheck). 4 thin pages skipped (docs-only links). Track A: 4 break/fix (Storage Blob missing ARM templates, Agent upgrade .NET 4.7 method-not-found, DisableRegistryTools blocks SxS, SxSStackListenerCheck unsupported OS). Track B: 3 guide-drafts (AVD Services Check, SxS manual reinstall, Agent-Broker connectivity). 7 discovered, 0 deduplicated. IDs: avd-ado-wiki-a-r5-001~007. | WindowsVirtualDesktop wiki — Deployment Failures, SxSStack, URLCheck |
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b r3: processed 10 pages (4 Deployment Failures, 5 Device Redirection, 1 FirewallPolicy). 3 thin redirect pages skipped. Track A: 4 break/fix entries (Storage Blob deploy fail, Web Client Virtual Drive x2 bugs, FirewallPolicy registry bloat). Track B: 4 guide-drafts (Printer/RemoteFX/USB Drive/USB Redirection). 8 discovered, 0 deduplicated. codeWiki emoji prefix workaround via Git Items API. | WindowsVirtualDesktop wiki — Deployment Failures, Device Redirection, FirewallPolicy |
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b r5: processed 10 pages (4 Deployment Failures, 6 Health Check Geneva/IMDS/SxSStack). 4 thin pages skipped (docs-only links to MS Learn or eng.ms). Track A: 3 break/fix (Storage Blob missing ARM templates, Geneva cert missing, Agent upgrade .NET 4.7 Method-not-found). Track B: 3 guide-drafts (AVD Listener Check, AVD Services Check, Agent Upgrade Failure Check with Kusto queries). 6 discovered, 0 deduplicated. Content fetched via Git Blob API (tree object traversal) due to codeWiki REST API 404 issue. IDs: avd-ado-wiki-b-r5-001~006. | WindowsVirtualDesktop wiki — Deployment Failures, Health Check Failures |
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-a r2: processed 10 pages, 9 WikiPageNotFound (deleted/moved), 1 sandbox draft (screenshots only, no extractable content). 0 discovered, 0 deduplicated. | WindowsVirtualDesktop wiki — Sandbox/AAD Auth Errors, Deployment Failures, Device Redirection |
| 2026-04-05 | onenote | Phase 2 tick 2: scanned 10 pages (Common Issues + Feature Gap + Feature Verification). Extracted 5 break/fix (006-010,014) + 5 guide-drafts (008,011-013,015). 157 remaining. | Mooncake POD Support Notebook AVD section |
| 2026-04-05 | ado-wiki | Phase 3a: indexed 1075 pages (533 WVD + 542 W365), filtered DEPRECATED/Archived/Sandbox | Supportability/WindowsVirtualDesktop + Windows365 |
| 2026-04-05 | mslearn | Phase 4a+4b: indexed 19 articles, scanned 8, extracted 30 issues + 3 guide drafts | support/azure/virtual-desktop toc.yml |
| 2026-04-05 | ado-wiki | Phase 3b tick 1: scanned 561/1075 pages (WVD wiki all template-based/empty, W365 wiki has content). Extracted 4 new issues (014-017) + 1 guide draft (split-screen-multimon). Deduplicated 3 pages already in JSONL. | Windows365 Support Wiki |
| 2026-04-05 | contentidea-kb | Phase 5 tick 2: scanned 10 work items (112711-118649), extracted 8 new issues (006-013), skipped 2 empty (Informational/no fields). 148 remaining. | ContentIdea Virtual Desktop KB |
| 2026-04-05 | contentidea-kb | Phase 5 tick 3: scanned 10 work items (118815-120706), extracted 8 new issues (014-021), skipped 1 (onboarding guide), deduplicated 1 (joindomain ~= dscextension). 138 remaining. | ContentIdea Virtual Desktop KB |
| 2026-04-05 | contentidea-kb | Phase 5 tick 4: scanned 10 work items (120706-125410), extracted 4 new issues (022-025), skipped 2 empty, deduplicated 4. 128 remaining. | ContentIdea Virtual Desktop KB |
| 2026-04-05 | contentidea-kb | Phase 5 tick 5: scanned 10 work items (126369-150087), extracted 9 new issues (026-034), deduplicated 1 (150087~024). Topics: Citrix/WAM, load-balancing, CredSSP, NTLMv2, MSIX App Attach, Excel multi-session, ECC cipher, connection-bar. 118 remaining. | ContentIdea Virtual Desktop KB |
| 2026-04-05 | onenote | Phase 2 tick 3: scanned 10 MCVKB pages (20.x AVD KB articles). Extracted 6 break/fix (023-028) + 4 guide-drafts (029-032). Deduplicated 1 (c20.2 MSIX ~= avd-onenote-020). 135 remaining. | MCVKB/VM+SCIM/=======20. AVD======= |

## 2026-04-05 OneNote Scan - Tick 3 (MCVKB KB Articles)
- **Source**: MCVKB/VM+SCIM/=======20. AVD======= (11 KB articles)
- **Track A (6 break/fix)**:
  - 023: Teams slow → high input delay diagnosis (Perfmon/Procmon/Host Analyzer)
  - 024: FSLogix 00000002/80070002 → refcount stuck, upgrade to v2201 hotfix 2
  - 025: AAD DS NTLMv2-only → wrong password error, fix LmCompatibilityLevel=5
  - 026: Legacy per-user MFA → AADJ desktop logon failure, use CA policy instead
  - 027: RD client Subscribe → hits Global instead of Mooncake, set DefaultFeedUrl registry
  - 028: Cannot unassign personal desktop user → use PowerShell Remove-AzWvdSessionHost
- **Track B (4 guide-drafts)**:
  - 029: Dual-federation workaround for 21v AVD (AAD Connect custom sync)
  - 030: AAD DS integration TS guide (Jarvis/LogA queries, object sync verification)
  - 031: AVD self-service reboot via Automation webhook
  - 032: Restrict login location via CA policy
- **Deduplicated**: c20.2 MSIX app attach (~85% overlap with avd-onenote-020)
- **20.1 ADFS SSO**: content overlaps with existing avd-onenote-011, scanned but no new entry

## 2026-04-05 MS Learn Scan - Tick 1 (Phase 4a+4b)
- **Source**: MS Learn Troubleshoot docs (support/azure/virtual-desktop toc.yml)
- **Phase 4a**: Indexed 19 troubleshoot articles from toc.yml
- **Phase 4b**: Fetched first 8 articles, extracted 30 break/fix issues (Track A) + 3 guide drafts (Track B)
- **Track A**: Agent issues (15), management errors (3), Azure Files auth (2), PowerShell errors (3), Entra join auth (4), health checks (3)
- **Track B**: connection-quality guide, app-attach guide, insights guide
- **Remaining**: 11 articles unscanned
- **21v Note**: Entra-join issues marked 21vApplicable=false (Entra join not available in 21V)

## 2026-04-05 ADO Wiki Scan - Tick 1
- **Source**: Supportability/WindowsVirtualDesktop wiki
- **Batch**: 10 pages (indices 0-9)
- **Result**: All empty/meta pages (Welcome=overview, rest=parent pages with no content)
- **Discovered**: 0 issues
- **Remaining**: 1065 pages
- **Note**: Cached lengths were all=1 (incorrect), corrected for first 20 pages

## 2026-04-05 ado-wiki batch (ANC + Cloud PC Actions)
- Scanned 9 W365 wiki pages (3 ANC, 3 Custom Images, 2 Provisioning, 1 Inspect Connection)
- Extracted 6 issues (avd-ado-wiki-008 to avd-ado-wiki-013)
  - Track A (break/fix): 5 — ANC endpoint DNS/firewall, orphaned NICs/resource lock, custom image managed disk, Windows Backup crash
  - Track B (guide): 1 — secure channel ErrorDomainTrustFailed comprehensive TSG
- 2 empty pages, 1 stub (just link), 1 log path only → skipped
- Cached 29 page lengths for future batches

## 2026-04-05 ado-wiki batch (Client Apps + DR + Custom Images)
- Scanned 5 W365 wiki pages: Web Portal connection flow, macOS/iOS client trace, W365 reconnect, Cross region DR, custom image creation
- Extracted 5 entries (avd-ado-wiki-015 to avd-ado-wiki-019)
  - Track A (break/fix): 1 — W365 Cloud PC reconnect fails after 1hr (CA token expiry, by design)
  - Track B (guide): 4 — Web Portal connection flow, macOS client trace/logging, cross-region DR activation scenarios, custom image creation steps
- Pre-read 20 page lengths, updated cache
- Remaining: 509/1075 pages

## 2026-04-05 ado-wiki batch (agent chain)
- Scanned 2 pages: DR Plus Scoping Questions, DR Plus Setup Guide
- Both Track B (guide-drafts): avd-ado-wiki-020, avd-ado-wiki-021
- 2 new guide drafts created in guides/drafts/
- Progress: 568/1075 scanned, 507 remaining

## 2026-04-05 contentidea-kb scan tick 1
- WIQL query: keyword "Virtual Desktop" → 168 work items with KB numbers
- Scanned 10/168 work items (IDs: 82228–112710)
- Skipped 5: 2 reference pages (contacts/library), 2 product-info-only (no cause/resolution), 1 duplicate KB
- Extracted 5 entries (avd-contentidea-kb-001 to avd-contentidea-kb-005)
  - Bugcheck 0x1E Spectre/Meltdown (KB4487661)
  - Azure AD DS login failure with synced users (KB4521301)
  - RD licensing notification on multi-session (KB4525207, symptom-only)
  - SxSStacklistenerNotready on custom image (KB4536220)
  - Gateway error after Host Pool deploy (KB4537455)
- Remaining: 158/168 work items

### 2026-04-05 ado-wiki tick (batch 39)
- Pages scanned: 5 (1 empty skipped)
- Track A (break/fix): 2 entries (avd-ado-wiki-023: W365 Business grace period blocks provisioning; avd-ado-wiki-025: GBL resize → grace period → reprovisioning)
- Track B (guide-draft): 2 entries (avd-ado-wiki-022: DR Plus troubleshooting Kusto queries; avd-ado-wiki-024: Enterprise grace period CPCD check)
- Total JSONL: 28 entries | Scanned: 573/1075 | Remaining: 504
- Deduplicated: 0

### 2026-04-05 ado-wiki tick (batch 12)
- Pages scanned: 3
- Track A (break/fix): 1 entry (avd-ado-wiki-026: Move fails ResetComputerPassword_deploymentTimeout — DNS pointing to decommissioned server)
- Track B (guide-draft): 2 entries (avd-ado-wiki-027: Mount VHD after place under review; avd-ado-wiki-028: Place under review setup guide)
- Total JSONL: 31 entries | Scanned: 576/1075 | Remaining: 499
- Deduplicated: 0

## 2026-04-05 ado-wiki batch (pages 577-578)
- Processed 2 pages: Autopilot DPP for W365, Azure AD Device Object stale at deprovisioning
- Track A: 2 break/fix entries (avd-ado-wiki-029, avd-ado-wiki-031)
- Track B: 1 guide draft (ado-wiki-autopilot-dpp-w365-setup-guide.md)
- Deduplicated: 0
- Remaining: 499 pages

## 2026-04-05 ado-wiki batch (pages 579-584)
- **Scanned**: 6 pages (W365 Provisioning section)
- **Content pages**: 4 (2 empty/parent pages skipped)
- **Track A (break/fix)**: 4 entries (avd-ado-wiki-032 to 036)
  - WDAC Constrained Language Mode provisioning failure
  - Cloud PCs provisioned twice (group timing)
  - Half disk size (CMD Agent endpoint blocked)
  - Deprovisioning AD unjoin failure (proxy blocking)
- **Track B (guide)**: 1 draft (cpc-wdac-provisioning-troubleshooting)
- **Deduplicated**: 0 (avd-ado-wiki-036 related to 031 but distinct root cause)
- **Remaining**: ~493 pages

### 2026-04-05 02:52 — ado-wiki batch (chain)
- Scanned 2 pages (batch chars: ~12677)
- Track A: 1 entry (avd-ado-wiki-037: resize disk not expanding due to WinRE partition)
- Track B: 1 guide draft (post-provisioning advanced kusto checks - error code reference table)
- Progress: 586/1075 scanned, 489 remaining

### 2026-04-05 ado-wiki batch (tick)
- Pages processed: 4 (2 empty, 2 with content)
- Track A: 4 entries (avd-ado-wiki-039~042)
  - 039: M365 license not released after user removal - improper Entra ID deletion
  - 040: Provisioning warnings from firewall blocking LP endpoints (Palo Alto App Categories)
  - 041: Keyboard language bar not visible - language list needs user-context config
  - 042: LP install fails due to WinRM GPO set to Disabled causing DSC conflict
- Track B: 0 guide drafts
- Deduplicated: 0
- Progress: 590/1075 scanned, 488 remaining

## 2026-04-05 ado-wiki tick (batch ~13)
- **Scanned**: 9 pages (6 with content, 3 empty)
- **Track A**: 2 break/fix entries (avd-ado-wiki-043..044)
  - CreateVM_managedServiceIdentityNotFound (CMK/DES MSI binding failure)
  - Computer name changes after resize/restore/move (by design)
- **Track B**: 4 guide drafts (avd-ado-wiki-045..048)
  - Provisioning overview (state machine, grace periods)
  - Reservation error list for failed VM investigation
  - Reboot 1074 event message types
  - Wvchelper reboot source identification (Kusto)
- **Progress**: 599/1075 scanned, 479 remaining
- **JSONL total**: 51 entries

## 2026-04-05 ado-wiki scan (batch)
- Pages processed: 7 (1 large + 6 standard)
- Track A (break/fix): 5 entries (avd-ado-wiki-049 to 053)
  - Hybrid Join SCP misconfigured (0x801c001d)
  - Hybrid Join DRS discovery failure (0x801c0021) - proxy/network
  - Resize precheck "feature not supported" - Gen1/TrustedLaunch null
  - Resize VM Agent unavailable - WireServer connectivity
  - Restore RegisterRDAgent powershell not recognized - missing PATH vars
- Track B (guide-drafts): 2 entries (avd-ado-wiki-054 to 055)
  - Resize Frontline Dedicated Mode scoping questions
  - Resize Frontline Dedicated Mode setup guide
- Skipped: 1 (Troubleshooting page too thin, just references)
- Progress: 606/1075 scanned (56.4%), 472 remaining
- JSONL total: 58 entries

## 2026-04-05 ado-wiki batch (pages 607-608)
- **Scanned**: 2 pages (Unhealthy Restore Point, Maintenance Window)
- **Track A**: 1 entry (avd-ado-wiki-056 — Unhealthy snapshot restore point)
- **Track B**: 1 guide draft (ado-wiki-maintenance-window.md)
- **Deduplicated**: 0
- **Total scanned**: 608/1075 | Remaining: 467

## 2026-04-05 03:20 — ado-wiki batch (Citrix HDX Plus)
- Scanned 6 pages from Windows365 wiki (Partner Connectors/Citrix HDX Plus section)
- Track A: 1 entry (avd-ado-wiki-058: Citrix connector removal grace period)
- Track B: 3 guide drafts (FLD integration, connectivity check, support collaboration)
- Skipped: 2 pages (architecture overview too brief, resources page links-only)
- JSONL total: 64, Guides drafts total: 34, Remaining: 461 pages

## 2026-04-05 ado-wiki batch (Citrix HDX Plus)
- Pages scanned: 4 (Troubleshooting Tools, DeviceLock Known Issue, License Status Check, Provision Status Check)
- Track A: 1 entry (avd-ado-wiki-062: DeviceLock policy broken with Citrix VDA registry fix)
- Track B: 3 guide drafts (troubleshooting-tools, license-status-check, provision-status-check)
- Total JSONL: 68 entries (avd-ado-wiki-062 to avd-ado-wiki-065)
- Total drafts: 37
- Remaining: 457 pages

## 2026-04-05 ado-wiki batch (pages 623-628)
- **Scanned**: 6 pages (Citrix HDX connector/tenant onboard, HP Anyware connectivity/tools/resources/support-boundaries)
- **Discovered**: 6 entries (avd-ado-wiki-066 to 071), 1 Track A (HP Anyware agent retry fix), 5 Track B guides
- **Deduplicated**: 0
- **Skipped**: 1 page (Resources - links only, no actionable content)
- **Drafts created**: 5 new guide drafts
- **Remaining**: 447 pages

## 2026-04-05 03:30 — ado-wiki batch (Partner Connectors: Citrix/HP Anyware)
- Pages scanned: 6 (Citrix Connector Status Check, Citrix Tenant Onboard, HP Anyware Connectivity/Tools/Resources/Support Boundaries)
- New entries: 0 (6 already existed from previous incomplete run, fixed scanned tracking)
- Guide drafts: 5 refreshed (ado-wiki-citrix-connector-status-check, citrix-tenant-onboard-offboard-check, hp-anyware-connectivity-check, hp-anyware-troubleshooting-tools, hp-anyware-support-boundaries)
- Total JSONL: 79 entries (max ID: avd-ado-wiki-071), Total drafts: 46
- Remaining: 447 pages

## 2026-04-05 ado-wiki batch (pages 629-636)
- Scanned 8 pages (W365 Partner Connectors: HP Anyware provisioning/tenant-onboard, VMware Blast connectivity/tools/collaboration/provisioning)
- Track A: 1 break/fix (BLAST enablement retry procedure)
- Track B: 6 guide-drafts (HP Anyware provision/tenant-onboard, VMware Blast connectivity/tools/collaboration/provisioning)
- Skipped: 2 pages (Resources=links only, Tenant Onboard=empty)
- JSONL: avd-ado-wiki-072 ~ avd-ado-wiki-078 (7 entries)
- Remaining: 446 pages

## 2026-04-05 ado-wiki batch (partner connectors: HP Anyware + VMware Blast) — dedup cleanup
- Processed 8 pages (7 with content, 1 empty parent)
- Cleaned up JSONL: removed 21 duplicate entries across file (93 → 72 unique)
- Track A: 1 break/fix (avd-ado-wiki-075: BLAST enablement retry)
- Track B: 6 guide-drafts (avd-ado-wiki-072~074, 076~078)
- Page 5 (Resources): links-only, no extraction
- Page 8 (VMWare Blast/Tenant Onboard): empty parent, skipped
- Scanned: 636/1075 | Remaining: 439

## 2026-04-05 ado-wiki batch (pages 637-642)
- Scanned 6 pages from Windows365 Support Wiki (Features/Reporting + Security + Settings Framework)
- Track A: 3 break/fix entries (avd-ado-wiki-079 to 081) — reporting endpoint issues, Azure Arc conflict
- Track B: 2 guide drafts — W365 Frontline Concurrency Report, AI-enabled Cloud PCs Scoping Questions
- Skipped: 1 page (Cloud IO Protection — redirect only, no content)
- Total: 5 new entries, 0 deduplicated

## 2026-04-05 ado-wiki scan (batch: Settings Framework)
- Scanned 5 pages: AI-enabled Cloud PCs Setup Guide, AI-enabled Cloud PCs Troubleshooting, Settings Framework FAQ, Settings Framework Setup Guide, Settings Framework Troubleshooting WIP
- Also fixed 6 previously-processed pages missing from scanned list (Connection Quality report, Performance Blade, W365 reports, Frontline Concurrency, Cloud IO Protection, AI-enabled Scoping Questions)
- Extracted: 4 break/fix issues (avd-ado-wiki-085 to 088) + 5 guide-drafts (avd-ado-wiki-084, 089-092)
- New drafts: ai-enabled-cloud-pcs-setup-guide.md, ai-enabled-cloud-pcs-troubleshooting.md, settings-framework-faq.md, settings-framework-setup-guide.md, settings-framework-troubleshooting.md
- Key topics: Copilot+ Kusto diagnostics, SemanticIndexingStatus error codes, nested virtualization conflict, Settings Framework architecture
- Total JSONL: 95 entries | Scanned: 643/1075 | Remaining: 435

### 2026-04-05 03:47 — ado-wiki tick
- **Pages processed**: 3 (User Settings Local Admin, Boot Guided Scenario, Dedicated PC mode)
- **Track A**: 1 (local admin not applied — CustomScriptExtension failure)
- **Track B**: 2 guide drafts (Boot Guided Scenario, Dedicated PC mode)
- **New IDs**: avd-ado-wiki-093 ~ 095
- **Scanned**: 646/1075 (429 remaining)
- **Exhausted**: false

## 2026-04-05 ado-wiki batch (Windows365 Boot)
- **Pages processed**: 3 (Known issues, Return to Local, Setup Guide)
- **Track A (break/fix)**: 5 entries (avd-ado-wiki-096 to 100) — black screen, camera, auth prompts, idle disconnect, re-enrollment error
- **Track B (guide-draft)**: 2 drafts (Return to Local config, Boot Setup Guide)
- **Deduplicated**: 0
- **Remaining**: 429 pages

## 2026-04-05 ado-wiki batch (Boot features)
- **Pages scanned**: 3 (Known issues, Return to Local, Setup Guide) from Windows365 Support Wiki
- **Track A**: 6 break/fix entries (avd-ado-wiki-096 ~ 101) — Boot black screen, camera, auth prompts, idle disconnect, connection error, re-enrollment error
- **Track B**: 2 guide drafts (avd-ado-wiki-102 ~ 103) — Return to Local config guide, Boot Setup Guide
- **Total JSONL**: 97 entries | **Scanned**: 649/1075 | **Remaining**: 426

## 2026-04-05 ado-wiki scan (tick)
- Scanned 1 page: Windows 365 Boot Case Studies
- Extracted 4 break/fix issues (avd-ado-wiki-104 to 107): transition screen timeout, CURLcode:56 HTTP error, silent app crash, invalid subscription
- Total: 108 entries in known-issues-ado-wiki.jsonl
- Progress: 650/1075 pages scanned (425 remaining)

## 2026-04-05 ado-wiki batch (pages 651-653)
- Scanned 3 pages from Windows365 Support Wiki (Frontline Dedicated + Business)
- Page 1 (RMM Integration): Track B → guide draft (partner integration + support boundaries)
- Page 2 (CPC Optimization): Mixed → 2x Track A (device action failures, tenant exclusion) + Track B guide draft (COGS optimization TSG with FAQ)
- Page 3 (FrontLine Examples DRAFT): Skipped (empty, image-only)
- Pre-read cached 7 additional page lengths
- +4 JSONL entries (avd-ado-wiki-108 to 111), 0 deduplicated
- Remaining: ~423 pages unscanned

## 2026-04-05 ado-wiki batch (tick)
- Scanned 4 pages from Windows365 wiki (Boot Case Studies, CPC Optimization, FrontLine Examples, Frontline logoff)
- Extracted 7 entries (avd-ado-wiki-104 to 110): 6 Break/Fix + 1 guide-draft
- New guide draft: ado-wiki-cpc-optimization-cogs-troubleshooting.md
- Topics: Boot-to-Cloud failures (timeout/HTTP/crash/license), COGS optimization, Cylance causing logoff
- Remaining: 420 pages

## 2026-04-05 ado-wiki scan (batch 651-658)
- Pages: 8 (W365 RMM Integration, CPC Optimization, FLW Examples, Frontline logoff, Concurrency Report, Intelligent pre-start, Known Issues, Not available error)
- Track A: 6 break/fix entries (avd-ado-wiki-108 to 112, 114, 115)
- Track B: 3 guide drafts (RMM integration, COGS optimization TSG, Intelligent pre-start)
- Guide-draft pointers: 2 (avd-ado-wiki-110, 113)
- Skipped: 1 (FLW Examples - image only)
- Total JSONL: 116 entries
- Remaining: ~420 pages

## 2026-04-05 ado-wiki batch (scanned 656→668)
- Processed 10 pages: 1 content (/Welcome=6310 chars, architecture overview → guide-draft), 9 empty parent pages
- +1 guide-draft: `ado-wiki-avd-welcome-architecture-overview.md`
- +1 JSONL entry (avd-ado-wiki-116, quality: guide-draft)
- Remaining: 407 pages

## 2026-04-05 ado-wiki scan (chain)
- Scanned: 1 page (Windows365 FLW TSG)
- Track A: 1 entry (avd-ado-wiki-117: NoLicensesAvailable error)
- Track B: 1 guide draft (ado-wiki-windows365-flw-tsg.md)
- Remaining: ~419 pages

| 2026-04-05 | ado-wiki | +1 guide-draft (FLW TSG), +3 break/fix (DPP FLS: Win10 unsupported, Win32 apps skipped, User Driven mode) | avd-ado-wiki-113~116 |
## 2026-04-05 ado-wiki batch (pages 671-675)
- **Scanned**: 5 pages (Cloud Apps DPP-FLS Setup/Troubleshooting, FLS Known Issues, UES FAQ, UES Setup Guide)
- **Track A**: 3 break/fix entries (avd-ado-wiki-117~119): Cloud Apps stuck preparing, apps not discovered (MSIX/AppX unsupported), FLS 10k user limit
- **Track B**: 3 guide drafts (avd-ado-wiki-120~122): Cloud Apps DPP-FLS setup, UES FAQ, UES setup guide
- **Deduplicated**: 0
- **Progress**: 675/1075 scanned (400 remaining)

---
### 2026-04-05 04:19 | ado-wiki batch
- Pages scanned: 1 (Frontline UE Sync Troubleshooting, 12021 chars)
- Track A: 2 break/fix entries (avd-ado-wiki-123, avd-ado-wiki-124)
- Track B: 1 guide draft (ue-sync-troubleshooting-kusto.md) + guide-draft entry (avd-ado-wiki-125)
- Deduplicated: 0
- Total JSONL: 124 | Remaining pages: 399

## 2026-04-05 ado-wiki batch (W365 Cloud Apps + Frontline Shared)
- Scanned 5 pages from Windows365 Support Wiki (Frontline Shared / Cloud Apps section)
- Track A: 4 known issues extracted (FLS reprovision bug, user-reset prereqs, Intune license requirement, SSO consent prompt)
- Track B: 5 guide drafts created (Cloud Apps support boundaries, support ownership, technical specs, Kusto troubleshooting queries, FLS overview)
- JSONL: 115→124 entries (avd-ado-wiki-127 to avd-ado-wiki-135) — Note: 9 entries total (4 break/fix + 5 guide-draft)
- Drafts: 79→84 files
- Scanned: 686→691 / 1075 pages (407 remaining)

### 2026-04-05 ado-wiki batch (Windows365 Wiki - Cloud Apps & Frontline Shared)
- Scanned: 5 pages (14768 chars total)
- Track A: 2 new entries (avd-ado-wiki-126, 127) — FLS user-targeted workload drift, FLS unsupported features
- Track A deduplicated: 3 (reprovision button, MDM enrollment, SSO consent → overlap with 120-122)
- Track B: 4 guide drafts — Cloud Apps support boundaries, escalation paths, technical specs, Kusto troubleshooting
- Pre-read cached: 20 page lengths for Windows365 wiki
- Remaining: 407 pages

## 2026-04-05 ado-wiki scan (batch)
- **Pages processed**: 8 (1 CloudProfile troubleshooting + 7 Government section)
- **Track A**: 2 break/fix items (GCCH 3P cookies #128, Gov Dev Box unsupported #129)
- **Track B**: 2 guide drafts (cloudprofile-agent-troubleshooting, w365-government-identify-tenant-type)
- **Skipped**: 4 pages (internal process/soft skills, empty page, already-extracted FedRAMP #125)
- **Pre-read cached**: 20 page lengths for future batches
- **Remaining**: 386 pages unscanned

## 2026-04-05 ado-wiki batch (W365 Government)
- Pages scanned: 6 (5 with content, 1 empty)
- Track A (break/fix): 1 — GCCH 3P cookie blocking web client sessions (avd-ado-wiki-127)
- Track B (guide-drafts): 4 — GCC→FedRAMP migration, identify gov tenant type, gov support rules, PME account setup (avd-ado-wiki-128~131)
- Skipped: 1 empty page ("Intune enrollment failed" GCC-H Case)
- Total JSONL: 131 entries | Scanned: 690/1075 | Remaining: 399
- exhausted: false

## 2026-04-05 ado-wiki batch (pages 682-687)
- Scanned 6 pages from Windows365 Government section
- Track A (break/fix): 1 entry — GCCH web client/Safari 3P cookie connection failure (avd-ado-wiki-134)
- Track B (guide-drafts): 4 entries — GCC-to-FedRAMP transition, identify gov tenant type, gov support guidelines, PME account setup
- 1 empty page skipped (Intune enrollment failed GCC-H)
- JSONL: 132 → 137 entries
- Remaining: ~399 pages

## 2026-04-05 ado-wiki tick (Government/Setup & Guidelines)
- **Scanned**: 6 pages (W365 Government: SAW GCCH setup, Enterprise for GCC, DTM log sharing, Gov offerings/support, Restricted data, Gov offerings image)
- **Discovered**: 5 entries (1 Track A: Autopatch/MMD error for GCC; 4 Track B guides: SAW GCCH setup, Enterprise for GCC overview, DTM log sharing, restricted data rules)
- **Deduplicated**: 0
- **Skipped**: 2 (image-only pages)
- **Progress**: 702/1075 scanned, 393 remaining
- **IDs**: avd-ado-wiki-136 ~ avd-ado-wiki-140

## 2026-04-05 ado-wiki batch (W365 Government)
- Scanned 6 pages from Windows365 Support Wiki (Government section)
- Track A: 1 break/fix issue (Autopatch/MMD error for GCC provisioning policy)
- Track B: 4 guide drafts (SAW setup, W365 Enterprise GCC overview, DTM log sharing, restricted data handling)
- 2 pages skipped (image-only: Government Offerings and Support, W365 Gov offerings)
- JSONL: avd-ado-wiki-141 to avd-ado-wiki-145 (5 new entries)
- Remaining: 392 pages

## 2026-04-05 ado-wiki batch (tick)
- **Scanned**: 3 pages (Windows 365 Government Offerings, W365 Link CA MFA failure, W365 Link Kerberos SSO)
- **Discovered**: 3 (1 guide-draft + 2 break/fix)
- **Deduplicated**: 0
- **New IDs**: avd-ado-wiki-141 ~ 143
- **Drafts**: +1 (ado-wiki-w365-government-offerings.md)
- **Progress**: 711/1075 scanned (390 remaining)
- **Pre-read**: cached lengths for 20 W365 Link pages

### 2026-04-05 ado-wiki tick (cleanup + batch)
- **Cleanup**: Renumbered orphan entries (avd-ado-wiki-136..140 → 101..105), removed 5 duplicate entries (106..110)
- **Scanned**: 3 pages (W365 Offerings, CA MFA device registration, Kerberos SSO Link)
- **Track A**: +2 entries (avd-ado-wiki-106: W365 Link CA MFA registration failure, avd-ado-wiki-107: Kerberos SSO requirement for Link)
- **Dedup**: 1 page skipped (W365 Offerings ~80% overlap with entries 98/99/103)
- **JSONL**: 107 entries total
- **Progress**: 711/1075 scanned (390 remaining)

## 2026-04-05 ado-wiki batch (scanned 712→720)
- **Scanned**: 10 pages (2 empty, 4 Track A, 2 Track B, 2 skipped/thin)
- **Discovered**: 6 entries (avd-ado-wiki-141 ~ 146)
- **Deduplicated**: 0
- **Track A**: W365 Link CA MFA registration failure, 4B multiple reboots, WinRE reset stuck, device enrollment restriction
- **Track B**: W365 Link hardware escalation guide, screen timeout Intune config
- **Remaining**: 383 pages

## 2026-04-05 04:41 — ado-wiki batch (W365 Link Components)
- Scanned 5 pages: SSO Consent Prompt Failure, Hardware Issues, Peripherals, Screen Timeout, Enrollment Restriction
- 3 pages already in JSONL (dedup from parallel agent): IDs 144-146
- Added 2 new entries: avd-ado-wiki-147 (SSO Consent - Track A), avd-ado-wiki-148 (Peripherals - Track B)
- 1 new guide draft: ado-wiki-w365-link-peripherals.md
- Progress: 709/1075 scanned, 115 JSONL entries, 382 remaining

### 2026-04-05 ado-wiki batch (pages 712-715)
- **Scanned**: 4 pages (W365 Link: Time Zone, NFC Readers, Update Behavior, New Display Feature)
- **Extracted**: 3 break/fix entries (IDs 149, 151, 153) + 2 guide-draft entries (IDs 150, 152)
- **Drafts created**: `ado-wiki-w365-link-nfc-readers.md`, `ado-wiki-w365-link-update-behavior.md`
- **Deduplicated**: 0
- **Progress**: 715/1075 scanned, 362 remaining

## 2026-04-05 ado-wiki batch (Windows365 Support Wiki)

- **Pages processed**: 4 (Enable Link Time Zone, NFC Readers, Update Behavior, New Display Feature)
- **Track A (Break/Fix)**: 2 entries (avd-ado-wiki-149: timezone PST default, avd-ado-wiki-152: display settings missing)
- **Track B (Guide)**: 2 entries (avd-ado-wiki-150: NFC readers guide, avd-ado-wiki-151: update behavior guide) — drafts already existed
- **Deduplicated**: 0
- **Remaining**: 378 pages

## 2026-04-05 ado-wiki scan (batch)
- Processed 10 pages (4 content + 6 empty)
- Track A: 1 (WinRE USB failure after KB5066835)
- Track B: 3 guides (escalation/case handling, setup guide, bugs process)
- IDs: avd-ado-wiki-149 ~ 152
- Scanned: 727/1075 (348 remaining)

## 2026-04-05 ado-wiki batch (pages 728-735)
- Scanned 8 Windows 365 Link pages (Troubleshooting Guide section)
- Track A: 7 break/fix entries (avd-ado-wiki-158 to 164) — auth errors, keyboard language bug, OS update failures, preview device issues, clock error
- Track B: 3 guide drafts (avd-ado-wiki-165 to 167) — collaboration routing, manual updates, log collection
- Total JSONL: 142 entries, Drafts: 121, Scanned: 735/1075

| 2026-04-05 | ado-wiki | +8 break/fix (seq 158-165: W365 Link auth error, manual updates, keyboard language, OS update failure, preview device bugs x3, clock behind) +2 guide-drafts (seq 166-167: collaboration routing, log collection) | Windows365 Support Wiki |
## 2026-04-05 ado-wiki tick (W365 Switch/Link batch)
- Pre-read 40 pages → all empty (length=0), cached
- Marked 50 empty pages as scanned (bulk skip)
- Processed 5 non-zero pages:
  - Track A: 7 entries (avd-ado-wiki-158~164) — pagefile policy, Switch known issues (stale CPC, bluetooth, reconnect, disconnect, sign-in, missing local PC)
  - Track B: 3 guide drafts — W365 Link release details, Switch setup guide, Switch troubleshooting guide (logs/telemetry)
- Scanned: 786/1075 | Remaining: 305 (mostly unknown length)

## 2026-04-05 ado-wiki batch (deprecated content 1/N)
- Scanned 5 pages from Sandbox/Archived/Deprecated Content
- Track A: 1 issue (avd-ado-wiki-168: Win7 api-ms-win-core-winrt DLL missing)
- Track B: 1 guide draft (App Group Limit Increase)
- Skipped: 3 pages (deprecation notice, link-only pages)
- Remaining: ~501 unscanned pages

## 2026-04-05 ado-wiki batch (scanned 682-686)
- Pages processed: 5 (DEPRECATED: Deployment Guides, Domain Trust, FSLogix Escalation, FSLogix v2210, Future App Group Limit)
- Discovered: 5 entries (avd-ado-wiki-170~174)
- Deduplicated: 1 (App Group Limit overlaps avd-ado-wiki-169)
- Skipped: 2 pages (link-only page, process flowchart)
- Key topics: domain trust health check, FSLogix v2210 bug fixes (differencing disk, Cloud Cache lock, OneDrive permissions, disk compaction temp profile)

### 2026-04-04 21:18 UTC — ado-wiki batch (repair)
- Fixed scanned-ado-wiki.json: 5 pages were processed by prior agent but not recorded as scanned
- Pages: DEPRECATED_Deployment Guides, Domain Trust, FSLogix Escalation, FSLogix v2210, Future App Group Limit
- Discovered: 0 new (all 4 attempted entries were duplicates of existing 170-174)
- Deduplicated: 4
- Cached lengths for 5 unknown-length pages
- Status: 686 scanned / 1181 total, 496 remaining

## 2026-04-05 ado-wiki batch (pages 696-699)
- Scanned 4 pages: DEPRECATED_Mobius/Data Collection, Notes, Setup Guides, Switching to Unified Client
- All deprecated Mobius (pre-Windows App) content
- 1 guide draft: data collection procedures (Activity ID + logs for Windows App, Web Client, macOS)
- 3 pages skipped (internal notes/setup/transition info, no troubleshooting value)
- discovered: 1, deduplicated: 0
- Remaining: 482 pages

## 2026-04-05 ado-wiki scan (batch)

- **Pages processed**: 10 (DEPRECATED_Known Issues, DEPRECATED_Kusto Queries for NON-FTEs, 5x DEPRECATED_Mobius/*, DEPRECATED_Unified Web Portal, DEPRECATED_Unified Windows App, DEPRECATED_Ongoing or Known Issues)
- **Track A (break/fix)**: 7 entries (avd-ado-wiki-175 to 178: MSIX App Attach issues; 183-185: TermService memory leak, HCI conflict, macOS SSO)
- **Track B (guide drafts)**: 4 drafts (Kusto queries, Windows App data collection, Unified Web Client errors, Windows App logging)
- **Guide-draft JSONL entries**: 4 (avd-ado-wiki-179 to 182)
- **Total new JSONL entries**: 11
- **Scanned**: 703/1181 (remaining: 479)
- **Note**: All pages in this batch were deprecated Sandbox content

## 2026-04-05 ado-wiki scan (batch)
- Pages processed: 2
  - DEPRECATED_Virtual SAW (SAVM) → skipped (internal tool setup, no TSG value)
  - DEPRECATED_Windows 365 Store App → Track B guide-draft (support boundaries, .avd file architecture, file locations)
- New JSONL entries: 1 (avd-ado-wiki-188, guide-draft)
- New drafts: 1 (ado-wiki-deprecated-windows-365-store-app.md)
- Deduplication: 0
- Remaining unscanned: 231

## 2026-04-05 05:34 — ado-wiki tick (avd)
- Pages scanned: 4 (Context Based Redirection/Support Boundaries, Context Based Redirection/Troubleshooting, EPIC on AVD, AMA/Deployment Issues)
- New entries: 4 (avd-ado-wiki-191 to 194)
- Deduplicated: 0
- Drafts: 0 new (existing drafts already covered these pages)
- Key findings: Context-based redirection mid-session unsupported, allow-based CA policies unsupported, Linux thin client low-level device redirection not supported, TWAIN scanner high-level redirection incompatible
- Remaining: 226 pages

| 2026-04-05 | ado-wiki | +3 guide-drafts (avd-ado-wiki-196~198): Azure Firewall health check, AAD auth simulated errors, AVD vs MSTSC connection flows | Sandbox/In-Development Content |
## 2026-04-05 ado-wiki batch (960→963/1181)
- Scanned 3 pages from Sandbox/In-Development Content
- All 3 → Track B (guide-draft): AzFw health check, AAD auth simulated errors, AVD vs MSTSC connection flows
- Added avd-ado-wiki-196..198 (guide-draft entries)
- Remaining: 223 pages

## 2026-04-05 ado-wiki batch (pages 967-969)
- Scanned 3 pages: AzFw (skipped, in-dev/unrelated), AAD Auth Errors (6 issues extracted), AVD vs MSTSC Connection Flows (guide-draft)
- Track A: 6 new entries (avd-ado-wiki-196 to 201) — AAD Auth RDP errors: FQDN vs hostname, SSL/TLS issues, P2P cert issues, WAM service
- Track B: 1 guide-draft pointer (avd-ado-wiki-202) — connection flow comparison
- Deduplicated: 0
- Remaining: 223 pages

### 2026-04-05 ado-wiki batch (959→972 scanned)
- Pages: AzFw (skipped, not AVD-specific), AAD Auth Simulated Errors, AVD vs MSTSC Connection Flows
- Track A: 4 entries (avd-ado-wiki-197~200) — AAD auth errors: FQDN, SSL/TLS, P2P cert, WAM
- Track B: 2 guide-draft pointers (avd-ado-wiki-201~202) — AAD error catalog + connection flow reference
- Deduplicated: 0
- Remaining: 223 pages

## 2026-04-05 ado-wiki tick
- Scanned 2 pages (batch limited by 15000 char budget)
- 0 break/fix entries, 2 guide drafts created
- Guides: rds-aad-auth-connection-flow, azure-ad-sso-rdp-overview
- JSONL: avd-ado-wiki-203..204 (guide-draft pointers)
- Progress: 974/1181 scanned, 221 remaining

## 2026-04-05 ado-wiki batch (tick)
- Scanned 2 pages (Connection Flow, Landing Page - Azure AD RDP auth)
- Track B: 2 guide drafts saved
- JSONL: avd-ado-wiki-203..204 (2 guide-draft entries)
- Remaining: 221 pages

## 2026-04-05 ado-wiki batch (pages 970-974)
- Scanned 5 pages from Sandbox/In-Development Content
- Track A: 2 break/fix entries (avd-ado-wiki-203, 204) - AADJ VM unavailable + security error
- Track B: 3 guide drafts - RDP AAD Auth connection flow, RDS AAD Auth overview, no resources decision tree
- 1 page skipped (images only)
- JSONL total: 197, drafts total: 147, remaining: 218

## 2026-04-05 ado-wiki batch (tick)
- Pages scanned: 10 (7 WVD + 3 W365)
- Empty/image-only pages: 7 (Acronyms, W365 Business, W365 Enterprise, W365 Frontline, Connection images-only, FAQ product-info, Scoping Questions)
- ASC Training: already extracted (203-204), marked scanned
- Track A: 1 entry (avd-ado-wiki-205: ANC health check failure on MCAPS subscription)
- Track B: 1 guide draft (avd-ado-wiki-206: connection failed no resources decision tree)
- Total discovered: 2, deduplicated: 0
- Remaining unscanned: 211

## 2026-04-05 05:47 — ado-wiki batch (deprecated content)
- Processed 5 pages from Sandbox/Archived/Deprecated Content
- 1 new guide draft (data-collection), 2 deduplicated (already in JSONL), 2 skipped (no content)
- JSONL: 202 entries, last ID: avd-ado-wiki-208
- Scanned: 999/1181, remaining: 182

## 2026-04-05 ado-wiki batch (W365 intro pages)
- Scanned 5 pages: Acronyms (empty/images), W365 Business, Enterprise, Frontline overviews, Reserve FAQ
- Track B: 4 guide-drafts created (reference/overview content)
- Track A: 0 break/fix entries (all intro/reference material)
- IDs: avd-ado-wiki-208 to 211
- Remaining: 210 pages

## 2026-04-05 ado-wiki batch (tick)
- **Scanned**: 8 pages (W365 Reserve: Acronyms, Business, Enterprise, Frontline, FAQ, Scoping Questions, Setup Guide, Troubleshooting)
- **Discovered**: 7 entries (4 break/fix + 3 guide-drafts)
- **Deduplicated**: 0
- **Guide drafts created**: 3 (w365-reserve-scoping-questions, w365-reserve-setup-guide, w365-reserve-troubleshooting)
- **Progress**: 1000/1181 scanned (84.7%), 209 remaining
- **JSONL**: 207 entries (max ID: avd-ado-wiki-214)

## 2026-04-05 ado-wiki scan (batch: pages 1001-1003)
- Scanned 3 pages (W365 Trial Subscription internal docs)
- Discovered: 1 (subscription lifecycle/deprovisioning break-fix)
- Deduplicated: 0
- Skipped: 2 (internal SaaF process docs, not TSG-relevant)
- New entry: avd-ado-wiki-215
- Remaining: ~186 pages

## 2026-04-05 ado-wiki tick (batch)
- Scanned 10 pages (Learning Resources + Training + Deprecated)
- All Track B (setup guides, architecture refs, process templates)
- Added 9 guide-draft entries (avd-ado-wiki-215 ~ 223), 9 drafts written
- 1 page (Error Codes) was external link only, skipped extraction
- Remaining: 174 pages

## 2026-04-05 ado-wiki batch (Sandbox/Archived + In-Development)
- Scanned 10 pages (mostly Sandbox/Archived/Deprecated Content from W365 wiki)
- Track A: 1 entry (avd-ado-wiki-222) — SSO "user account restriction" error in Hybrid env due to incorrect AzureADKerberos attributes
- Track B: 1 draft (w365-link-prerequisites) — W365 Link deployment prerequisites guide
- 8 pages skipped (internal process docs, empty pages, link collections, image-only)
- Remaining: ~165 pages

## 2026-04-05 05:58 — ado-wiki batch (Sandbox pages)
- Scanned 10 pages (W365 Sandbox/Archived + In-Development)
- 1 new guide-draft (ANC IP Availability Setup)
- 1 dedup (User account restriction = avd-ado-wiki-218)
- 1 dedup (Prerequisites = avd-ado-wiki-126/130)
- 7 skipped (empty/operational/image-only pages)
- Remaining: 119 pages

## 2026-04-05 ado-wiki batch
- Scanned 10 pages (1 CDP architecture + 9 deprecated/archived)
- Track A: 5 break/fix entries from W365 Link Prerequisites (device join, Intune enrollment, personally-owned block, SSO, MFA)
- Track B: 5 guide-drafts (CDP architecture, Teams template, support coverage, triage form, OOBE flow)
- Skipped: 4 empty/image-only pages (Troubleshooting Flow, What's new, Link Resources, Link Deep Dive)
- Total JSONL: 223 entries | Scanned: 1062/1181 | Remaining: 164

## 2026-04-05 ado-wiki batch (pages 1065→1069 of 1181)
- Scanned 4 pages from Windows365 Support Wiki (In-Development Content)
- Track A: 1 entry (avd-ado-wiki-225: ANC subnet IP exhaustion → provisioning failure)
- Track B: 3 guide-drafts (ANC IP availability setup, Admin Highlights scoping questions, Admin Highlights setup)
- New IDs: avd-ado-wiki-224 to avd-ado-wiki-227
- Remaining: 161 pages

### 2026-04-05 ado-wiki tick (chain)
- Pages scanned: 12 (11 empty, 1 with content)
- Extracted: 2 Track A (avd-ado-wiki-226, 227) + 1 Track B guide draft (avd-ado-wiki-228)
- Topic: Context Based Redirection overview - drive/USB redirection limitations
- Remaining: 161 unscanned pages

## 2026-04-05 ado-wiki batch (ANC IP + Admin Highlights)
- **Pages scanned**: 4 (ANC IP Availability Setup/Troubleshooting, Admin Highlights Scoping/Setup)
- **Track A**: 2 items (avd-ado-wiki-230, 231) — ANC IP availability not updating, provisioning fails insufficient IPs
- **Track B**: 3 drafts — ANC IP setup guide, Admin Highlights scoping questions, Admin Insights setup guide
- **JSONL entries**: 5 (230-234), 0 deduplicated
- **Remaining**: ~161 pages

## 2026-04-05 ado-wiki batch (tick)
- **Scanned**: 5 pages (ANC IP Troubleshooting, ANC IP Setup, Admin Highlights Scoping, Admin Highlights Setup, Context Based Redirection)
- **Discovered**: 8 entries (avd-ado-wiki-226 ~ 233) after dedup cleanup
  - 4 raw (break/fix): ANC IP not updating, ANC provisioning fails, drive redirection CBR, USB redirection CBR
  - 4 guide-draft: ANC IP setup, admin highlights scoping, admin insights setup, CBR overview
- **Deduplicated**: 8 duplicate entries removed (from parallel agent collision)
- **Remaining**: ~161 pages

### 2026-04-05 ado-wiki batch (tick)
- Pages processed: 4 (Admin Highlights Troubleshooting, Advanced Diagnostics Tool, Cloud App File Path Setup, Context Based Redirection W365 ref)
- Track A entries: 5 (avd-ado-wiki-236~239, 242)
- Track B guides: 3 (admin-highlights-troubleshooting, advanced-diagnostics-tool, cloud-app-file-path-setup)
- Guide-draft pointers: 3 (avd-ado-wiki-240, 241, 243)
- Context Based Redirection (W365): reference link only, skipped
- Remaining: 157 pages

## 2026-04-05 ado-wiki batch (chain)
- **Scanned**: 4 pages (Admin Highlights/Troubleshooting, Advanced Diagnostics Tool, Cloud App from File Path/Setup Guide, Context Based Redirection)
- **Discovered**: 7 entries (avd-ado-wiki-236 ~ 242)
  - Track A (break/fix): 5 entries — W365 Admin Insights error codes, auth failures, timeouts, subcategory issues
  - Track B (guide-draft): 2 entries — Advanced Diagnostics Tool, Cloud App from File Path Setup
- **Deduplicated**: 0
- **Remaining**: 157 pages

## 2026-04-05 ado-wiki batch (Admin Highlights Troubleshooting + Advanced Diagnostics + Cloud App + CBR ref)
- Pages scanned: 4 (W365 wiki In-Development Content)
- Track A entries: 5 (avd-ado-wiki-236~240) — Admin Insights error codes, auth failures, timeouts, stale data
- Track B guides: 3 drafts — admin-highlights-troubleshooting, advanced-diagnostics-tool, cloud-app-from-file-path-setup
- Track B JSONL refs: 2 (avd-ado-wiki-241~242)
- Skipped: Context Based Redirection (W365) — only a link reference to WVD wiki version
- Remaining: 85 pages

## 2026-04-05 06:07 — ado-wiki batch (4 pages)
- Scanned: Admin Highlights/Troubleshooting, Advanced Diagnostics Tool, Cloud App from File Path/Setup Guide, Context Based Redirection
- Track A: 3 break/fix entries (avd-ado-wiki-236..238) — Admin Insights error codes, Service Health API failures, stale data
- Track B: 3 guide-drafts (avd-ado-wiki-239..241) — Admin Insights troubleshooting reference, Advanced Diagnostics Tool, Cloud App from File Path
- 2 new draft files created, 1 existing draft reused, 1 page skipped (link only)
- Remaining: 157 pages

## 2026-04-05 ado-wiki batch
- Scanned 4 pages (W365 Support Wiki - Sandbox/In-Development Content)
- Track A: 5 Break/Fix entries (avd-ado-wiki-237 to 241) — Admin Highlights error codes & scenarios
- Track B: 3 guide drafts — Admin Highlights Troubleshooting, Advanced Diagnostics Tool, Cloud App from File Path Setup
- Skipped: Context Based Redirection (only a reference link, no content)
- Remaining: 157 pages

## 2026-04-05 ado-wiki batch (pages 1089-1091/1181)
- Scanned 3 pages from Windows365 Support Wiki (Sandbox/In-Development)
- Track A: 3 break/fix entries (avd-ado-wiki-244~246) — W365 fraud/abuse provisioning failures
- Track B: 2 guide drafts (avd-ado-wiki-247~248) — FLS auto-reset scoping & setup
- Discovered: 5, Deduplicated: 0
- Remaining: 154 pages

## 2026-04-05 ado-wiki batch (tick)
- Scanned 10 pages (3 empty WVD + 4 already-processed W365 + 3 new W365)
- Track A: 2 new (fraud/abuse provisioning failures, provisioning throttle)
- Track B: 4 new drafts (context-based-redirection-architecture, anti-fraud-abuse-process, fls-devices-reset-scoping, fls-devices-reset-setup)
- JSONL: avd-ado-wiki-236 to avd-ado-wiki-241 (6 entries)
- Remaining: 154 pages

## 2026-04-05 ado-wiki batch (pages 1089-1091)
- Scanned 3 pages from Windows365 Support Wiki (Sandbox/In-Development Content)
- Page 1: Anti-fraud and Abuse Process → 2 Track A entries (fraud/abuse deprovisioning + throttling) + 1 guide draft
- Page 2: FLS Devices Reset Scoping Questions → guide draft
- Page 3: FLS Devices Reset Setup Guide → guide draft
- Discovered: 5 entries (IDs avd-ado-wiki-242 to 246), Deduplicated: 0
- Remaining unscanned: 154 pages

## 2026-04-05 ado-wiki batch (agent tick)
- Scanned: 3 pages (W365 Anti-fraud/Abuse Process, FLS Devices auto-reset Scoping + Setup)
- Extracted: 3 break/fix issues (avd-ado-wiki-244~246) from fraud/abuse process
- Guide draft: 1 (w365-anti-fraud-abuse-process.md)
- Guide pointer: 1 (avd-ado-wiki-247, FLS scoping questions)
- Page 2 (FLS Scoping Questions): scoping template, saved as guide-draft JSONL pointer
- Page 3 (FLS Setup Guide): short setup steps, no issues, marked scanned
- Remaining: 154 pages

## 2026-04-05 ado-wiki tick (avd-ado-wiki-249~254)
- **Scanned**: 3 pages (FLS Troubleshooting, Power Platform Connector Support Boundaries & Troubleshooting)
- **Track A**: 4 break/fix entries (Power Platform Connector HTTP 401/403-Action/403-Trigger/5xx)
- **Track B**: 2 guide drafts (FLS reset troubleshooting, Power Platform support boundaries)
- **Remaining**: 151 pages

## 2026-04-05 06:12 — ado-wiki batch (3 pages)
- Scanned: FLS Devices reset/Troubleshooting, Power Platform Connector/Support Boundaries, Power Platform Connector/Troubleshooting
- Track A: 4 break/fix entries (HTTP 401/403/5xx for W365 connector)
- Track B: 3 guide drafts
- IDs: avd-ado-wiki-242 to avd-ado-wiki-248 (7 entries)
- Remaining: ~151 pages

## 2026-04-05 06:12 — ado-wiki batch
- Scanned 3 pages (FLS reset troubleshooting, Power Platform Connector boundaries & troubleshooting)
- Discovered 6 entries (2 guide-drafts + 4 break/fix), 0 deduplicated
- JSONL now 254 lines, scanned 1105/1181, remaining 151

## 2026-04-05 ado-wiki scan (batch)
- Pages processed: 3 (Reserve User Provisioning: Scoping Questions, Setup, Troubleshooting)
- Track A (break/fix): 2 entries (avd-ado-wiki-249, avd-ado-wiki-250)
- Track B (guide-drafts): 3 drafts + 3 JSONL pointers (avd-ado-wiki-251..253)
- Total JSONL: 286 entries (was 281)
- Remaining unscanned: 148

### 2026-04-05 ado-wiki batch (Reserve User Provisioning)
- **Pages scanned**: 3 (Scoping Questions, Setup, Troubleshooting)
- **Track A (break/fix)**: 2 entries (avd-ado-wiki-257, 258)
- **Track B (guide-draft)**: 3 drafts + pointer entries (avd-ado-wiki-255, 256, 259)
- **Deduplicated**: 0
- **Remaining**: 148 pages (all Windows365 wiki)

## 2026-04-05 ado-wiki batch (Reserve User Provisioning)
- Scanned 3 pages from W365 Sandbox/In-Development Content/Reserve - User Provisioning
- Track A: 2 break/fix items (provisioning option not visible, unexpected Cloud PC removal)
- Track B: 3 guide drafts (scoping questions, setup guide, troubleshooting guide)
- JSONL entries: avd-ado-wiki-255 to avd-ado-wiki-259
- Remaining unscanned: 148 pages

## 2026-04-05 ado-wiki batch (Reserve User Provisioning)
- **Pages processed**: 6 (3 already-extracted + 3 new)
  - FLS Devices Troubleshooting (dedup - already extracted)
  - Power Platform Connector Support Boundaries (dedup)
  - Power Platform Connector Troubleshooting (dedup)
  - Reserve - User Provisioning / Scoping Questions (Track B → guide draft)
  - Reserve - User Provisioning / Setup (Track B → guide draft)
  - Reserve - User Provisioning / Troubleshooting (Track A+B → 2 break/fix + guide draft)
- **Discovered**: 5 (2 Track A + 3 Track B guide-drafts)
- **Deduplicated**: 3 (already in JSONL from prior run)
- **IDs**: avd-ado-wiki-255 to avd-ado-wiki-259
- **Remaining**: 148 pages

## 2026-04-05 06:17 — ado-wiki batch (FLS reset + Power Platform Connector)
- Scanned 3 pages from Windows365 Support Wiki (Sandbox/In-Development Content)
- Track A: 6 break/fix entries (avd-ado-wiki-255~256, 259~262)
- Track B: 2 guide drafts (FLS auto reset TSG, Power Platform Connector boundaries)
- Deduped JSONL: 289→258 lines (cleaned pre-existing duplicates)
- Remaining: ~148 unscanned pages

## 2026-04-05 ado-wiki tick (Session State Retention FLD + Surface Mouse iOS)
- Scanned 5 pages (all Track B guide-drafts)
- Pages: Session State Retention FLD (Scoping/Setup/Troubleshooting), Surface Mouse on iOS (Scoping/Setup)
- Added IDs avd-ado-wiki-260 to avd-ado-wiki-264
- Remaining unscanned: 137

## 2026-04-05 ado-wiki batch (tick)
- Scanned 10 pages (7 new, 3 already scanned)
- 7 pages too thin/administrative (no extraction)
- 3 guide-drafts created (portal data collection, endpoint analytics scoping, UES cleanup FAQ)
- IDs: avd-ado-wiki-275 to avd-ado-wiki-277
- Remaining: 98 pages

### 2026-04-05 06:21 — ado-wiki batch (Resize V2 + Screenshot Capture macOS)
- Scanned 6 pages from Windows365 wiki (In-Development Content)
- Track A: 1 new break/fix entry (avd-ado-wiki-278: Resize V2 downsize not supported)
- Track B: 4 guide drafts created (resize-v2-scoping, resize-v2-setup, screenshot-capture-scoping, screenshot-capture-setup)
- Note: Concurrent agent covered same pages with IDs 267-277; this batch added 1 unique finding + 4 draft files
- Remaining: ~137 unscanned pages

## 2026-04-05 ado-wiki scan (batch)
- Scanned 11 pages (6 empty from WindowsVirtualDesktop Sandbox + 5 from Windows365 Sandbox)
- 5 guide-draft entries added (avd-ado-wiki-263 to 267): Session State Retention FLD (3), Surface Mouse iOS (2)
- All Track B (scoping questions, setup guides, troubleshooting flows)
- Total JSONL: 263 entries, scanned: 1083/1181, remaining: 127

## 2026-04-05 ado-wiki batch (Session State Retention FLD + Surface Mouse iOS)
- **Pages scanned**: 5 (all Track B guide-drafts)
- **Discovered**: 5 guide-draft entries (avd-ado-wiki-263 ~ 267)
- **Deduplicated**: 0
- **Topics**: W365 Frontline Session State Retention (scoping/setup/troubleshooting), Surface Mouse on iOS (scoping/setup)
- **Remaining**: ~127 unscanned pages

## 2026-04-05 06:23 — ado-wiki batch (Session State Retention FLD + Surface Mouse iOS)
- Scanned 5 pages from Windows365 Support Wiki (Sandbox/In-Development)
- 5 guide drafts created (all Track B - scoping/setup/troubleshooting templates)
- JSONL entries: avd-ado-wiki-275 to avd-ado-wiki-279
- Topics: Session State Retention for Frontline Dedicated Mode, Surface Mouse on iOS
- Remaining unscanned: ~127 pages

## 2026-04-05 ado-wiki tick (chain)
- Scanned 7 new pages (Session State Retention FLD x3, Surface Mouse iOS x4)
- Also marked 9 previously-processed-but-unscanned pages as scanned (Reserve User Provisioning x3, Resize V2 x3, Screenshot Capture x3)
- Discovered: 12 entries (5 guide-draft pointers + 5 break/fix + 2 guide-drafts)
- Deduplicated: 0
- JSONL now 283 lines, scanned 1095/1181, remaining 86
- exhausted: false

## 2026-04-05 ado-wiki tick (Session State Retention FLD + Surface Mouse iOS)
- **Pages processed**: 5 (all from Windows365 Support Wiki - Sandbox/In-Development Content)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 5 drafts created
  - Session State Retention FLD: Scoping Questions, Setup Guides, Troubleshooting
  - Surface Mouse Support on iOS: Scoping Questions, Setup Guides
- **IDs**: avd-ado-wiki-263 to avd-ado-wiki-267
- **Remaining unscanned**: ~127 pages
- **Note**: ConvertTo-Json truncated ~33 scanned entries during update; those pages may be re-scanned. Future ticks should use node.js for JSON manipulation.
- **Note**: Concurrent agent detected - some ID collisions (268-274 duplicated). MERGE phase will handle dedup.

## 2026-04-05 ADO Wiki Scan (chain continued)
- Source: ado-wiki (Supportability/Windows365)
- Pages processed: 2 (Surface Mouse iOS: Support Boundaries + Troubleshooting)
- Track A: 4 break/fix entries (avd-ado-wiki-280 to 283)
  - Mouse not detected on iOS, BT auth issue, click/scroll failure, random disconnect
- Track B: 2 guide-drafts (avd-ado-wiki-284, 285)
  - Support Boundaries routing guide, Troubleshooting overview
- Also fixed scanned array corruption from PowerShell JSON handling, rebuilt from JSONL sourceRefs
- Remaining: 125 pages unscanned

### 2026-04-05 ado-wiki tick (Surface Mouse iOS)
- Scanned 2 pages: Surface Mouse iOS Support Boundaries + Troubleshooting
- Track B: 1 guide-draft (support-boundaries routing guide)
- Track A: 4 break/fix items (mouse detection, BT auth, clicks/scroll, disconnects)
- IDs: avd-ado-wiki-284~288, remaining: 125 pages

## 2026-04-05 ADO Wiki Batch (UES Cleanup + Disks Expansion)
- Scanned 7 pages from Windows365 Support Wiki (Sandbox/In-Development Content)
- Track A: 4 break/fix entries (avd-ado-wiki-286~289): UES cleanup missing storage, cleanup not running, disk not expanding, disk full before expansion
- Track B: 5 guide-draft entries (avd-ado-wiki-290~294): scoping questions and setup guides for UES cleanup and disk expansion
- 5 new guide drafts saved to guides/drafts/
- Remaining unscanned: 118 pages

## 2026-04-05 ado-wiki tick (UES Cleanup + Disks Expand)
- Scanned: 9 pages (2 already-processed Surface Mouse pages marked scanned + 7 new UES pages)
- Track A (break/fix): 5 entries (avd-ado-wiki-289, 290, 293, 294, 295)
- Track B (guide-draft): 5 entries (avd-ado-wiki-291, 292, 296, 297, 298)
- Topics: UES Automatic Cleanup (scoping/setup/troubleshooting), UES Disks Auto Expand (FAQ/scoping/setup/troubleshooting)
- Remaining: 118 pages
- JSONL total: 281 lines

## 2026-04-05 06:29 — ADO Wiki Scan (batch)
- Processed 10 pages (3 with content, 7 empty)
- 2 guide-drafts created: AMA deployment issues, AzFw health diagnostics
- 1 page skipped (screenshots only, no text)
- Fixed scanned key mismatches from prior runs
- IDs: avd-ado-wiki-299 to avd-ado-wiki-300
- Remaining: 118 pages

### 2026-04-05 ado-wiki batch (W365 UES Cleanup + Disk Expansion)
- **Pages scanned**: 7 (UES Automatic Cleanup: Scoping/Setup/Troubleshooting; UES Disks Expand: FAQ/Scoping/Setup/Troubleshooting)
- **Track A (break/fix)**: 6 entries (avd-ado-wiki-289 ~ 294) — cleanup missing storage, cleanup not running, disk full before expansion, disk shrink unsupported, expansion failure, partial expansion
- **Track B (guide-draft)**: 4 entries (avd-ado-wiki-295 ~ 298) — scoping & setup guides for both features
- **Deduplicated**: 0
- **Remaining**: 118 pages

### 2026-04-05 06:30 — ado-wiki batch (W365 Business Revamp & Hibernation)
- Pages: 3 (Scoping Questions, Setup Guide, Troubleshooting)
- Extracted: 1 break/fix (hibernation resume failure) + 2 guide-drafts
- IDs: avd-ado-wiki-301..303
- Remaining: ~97 pages

### 2026-04-05 ado-wiki tick (chain — dedup pass)
- **Batch**: 7 pages (UES Automatic Cleanup + UES Disks Expand — Scoping/Setup/Troubleshooting/FAQ)
- **Result**: All 7 pages already processed by concurrent agent — 0 new items, 7 deduplicated
- **Remaining**: ~118 pages

## 2026-04-05 ado-wiki tick (batch ~1085→1084+10)
- Recovered 18 pages (already in JSONL but not marked scanned)
- Processed 10 new pages from WindowsVirtualDesktop wiki (Outdated/In-Development section)
- 4 guide drafts: AMA deployment issues, AzFw diagnostics, Host Pool Update design, AAD auth context setup
- 6 skipped (empty/images-only/meta-template)
- IDs: avd-ado-wiki-299 to avd-ado-wiki-302
- Remaining: 115 pages

### 2026-04-04T22:32:55 — ado-wiki tick
- Scanned: 1 page (W365 Monitoring Radar/Function and Use)
- Extracted: 0 break/fix, 1 guide-draft (avd-ado-wiki-304)
- Pre-read: 20 page lengths cached
- Remaining: 114 pages
- exhausted: false

### 2026-04-05 06:33 — ado-wiki tick
- Processed 1 page (W365 Monitoring Radar - Function and Use)
- Track B: 1 guide draft (monitoring dashboard reference)
- JSONL: 333 entries (seq 304), remaining: 114 pages

## 2026-04-05 06:33 — ado-wiki scan (batch)
- Processed 1 page (W365 Monitoring Radar - Function and Use)
- Track B guide draft: 1, Track A break/fix: 0
- Total JSONL entries: 333, Remaining pages: 114

## 2026-04-05 ado-wiki tick (main agent)
- Scanned: 3 pages (W365 Monitoring Radar: Function and Use [already processed], Scoping Questions, Troubleshooting)
- Track A: 0 new break/fix entries
- Track B: 2 new guide drafts (scoping-questions, troubleshooting)
- JSONL: avd-ado-wiki-304, avd-ado-wiki-305
- Remaining: 112 pages

## 2026-04-05 06:35 — ado-wiki batch
- Scanned 3 pages (W365 Monitoring Radar: Function/Use, Scoping Questions, Troubleshooting)
- All Track B (guide drafts): 3 drafts written, 3 JSONL guide-draft entries (avd-ado-wiki-303~305)
- Remaining: 112 pages

### 2026-04-05 ado-wiki tick
- Scanned 2 pages: W365 Monitoring (Radar) Scoping Questions + Troubleshooting
- Extracted 9 entries (avd-ado-wiki-305 to avd-ado-wiki-313)
  - 2 guide-draft (scoping questions + troubleshooting workflow)
  - 7 break/fix known issues (chart alignment, filter persistence, device health snapshots, negative network values, UPN-only search, OS version display bug, data delay/no-data)
- Progress: 1088/1181 scanned, 108 remaining
- JSONL: 330 lines total

## 2026-04-05 ado-wiki batch (Radar Scoping+Troubleshooting)
- Pages: 2 (W365 Monitoring Radar - Scoping Questions, Troubleshooting)
- Track A: 4 entries (avd-ado-wiki-306~309, Radar UI known issues)
- Track B: 2 guide drafts (avd-ado-wiki-305, 310)
- Total new: 6 entries (305-310)
- Remaining: 108 pages

### 2026-04-05 ado-wiki batch (pages 1083-1085)
- Scanned 3 pages: AVD PG Links (skipped, links-only), ICM Routing Issue-to-Team Mapping (Track B guide), Bulk Token Deletion Process (Track A)
- Discovered: 2 new entries (avd-ado-wiki-308, 309)
- Deduplicated: 0
- Remaining: 105 pages
## 2026-04-05 06:39 | ado-wiki batch
- Pages processed: 3 (AVD PG Links [skipped-migrated], ICM Routing [guide-draft], Bulk Token Deletion [break-fix])
- Entries added: avd-ado-wiki-311 (guide-draft), avd-ado-wiki-312 (break-fix)
- Remaining: 105 pages


## 2026-04-05 ado-wiki tick (batch ~continues)
- Scanned 3 pages from Windows365 wiki (WCX Specific Content)
- Track A: 1 entry (Bulk Token Deletion Process - W365 Business BPRT account recovery)
- Track B: 2 guide drafts (AVD PG Links reference, ICM Routing team mapping)
- JSONL: avd-ado-wiki-311 ~ 313 (324 total lines)
- Remaining: 105 unscanned pages

### 2026-04-05 ado-wiki tick
- Pages processed: 3 (AVD PG Links, ICM Routing Issue-to-Team Mapping, Bulk Token Deletion Process)
- Track A (break/fix): 1 (Bulk Token Deletion - W365 Business BPRT account deletion)
- Track B (guides): 2 (AVD PG Links reference, ICM Routing reference)
- JSONL entries added: 3 (avd-ado-wiki-316 to 318)
- Remaining unscanned: ~105
- Also marked 3 previously-processed Radar pages as scanned

## 2026-04-05 ado-wiki tick (Windows365 OCE APIs batch)
- **Scanned**: 11 pages (7 small batch-skipped + 4 OCE API content pages)
- **Track A**: 2 entries (avd-ado-wiki-314: Cloud PC recovery from license expiration, avd-ado-wiki-315: CloudPC redeploying for persistent RDP failures)
- **Track B**: 4 guide drafts (Change ANC limit, CloudPC Restart, CloudPC Recovery Legacy, CloudPC Redeploying)
- **JSONL**: 6 entries appended (IDs 314-319)
- **Remaining**: 94 unscanned pages in Windows365 Support Wiki
- **Exhausted**: false

## 2026-04-05 ado-wiki scan (batch ~cont)
- Scanned: 4 pages (OCE APIs: Change ANC Limitation, Cloud PC Recovery Legacy, CloudPC Restart, CloudPC Redeploying)
- Track A: 2 entries (avd-ado-wiki-314: license expiration recovery, avd-ado-wiki-317: redeploy for RDP issues)
- Track B: 2 guide drafts (change-anc-limitation, cloudpc-restart-oce)
- Total new entries: 4 (avd-ado-wiki-314 to 317)
- Remaining: 94 pages

## 2026-04-05 ado-wiki scan (batch)
- Scanned 4 pages (Windows365 OCE APIs section)
- Track A: 2 entries (avd-ado-wiki-314: OPNC limit, avd-ado-wiki-315: CloudPC redeploy)
- Track B: 2 guide drafts (avd-ado-wiki-316: license expiration recovery, avd-ado-wiki-317: CloudPC restart)
- All marked 21vApplicable: false (internal OCE API procedures)
- Remaining: ~101 pages

## 2026-04-05 ado-wiki batch (tick)
- Pages: CloudPC Retargeting, Group-based License Resize, Rename CloudPC, W365 Front Line OCE API
- Track A: 1 (retargeting break/fix), Track B: 3 (operational guides)
- IDs: avd-ado-wiki-320 ~ 323
- Remaining: 63 pages

## 2026-04-05 ado-wiki scan (batch ~1095→1106)
- Scanned 4 pages: CloudPC Retargeting, Group-based License Resize, Rename CloudPC, W365 Front Line OCE API
- Track A: 1 break/fix (retargeting for session host/RD agent issues)
- Track B: 4 guide drafts (OCE API operational procedures)
- JSONL entries: avd-ado-wiki-320 to avd-ado-wiki-324
- Remaining: 90 pages unscanned

## 2026-04-05 06:46 — ADO Wiki Scan (batch)
- Pages processed: 4 (CloudPC Retargeting, Group-based License Resize, Rename CloudPC, W365 Front Line OCE API)
- Track A: 0, Track B: 4 guide drafts
- JSONL entries added: 4 (avd-ado-wiki-319 to 322)
- Total JSONL: 321 lines, Remaining: 90 pages

## 2026-04-05 ado-wiki batch (tick)
- Scanned 2 pages: Customer Lockbox FAQs, SaaF CRI Review Process
- Track B (guide-draft): 2 pages → guides/drafts/
- JSONL: avd-ado-wiki-325..326 (2 new entries)
- Remaining: 73 unscanned pages, exhausted=false

## 2026-04-05 ado-wiki scan (batch)
- **Pages processed**: 4 (CloudPC Retargeting, Group-based License Resize, Rename CloudPC, W365 Front Line OCE API)
- **Track A**: 1 (avd-ado-wiki-318: CloudPC retargeting for session host/RD agent issues)
- **Track B**: 3 guide drafts (group-based-license-resize, rename-cloudpc, w365-frontline-oce-api)
- **Discovered**: 4, **Deduplicated**: 0
- **Remaining**: ~88 pages

## 2026-04-05 ado-wiki batch (scanned 1128→1130)
- Scanned 2 pages (Customer Lockbox FAQs, SaaF CRI Review Process)
- +1 guide-draft (avd-ado-wiki-323: W365 Customer Lockbox)
- SaaF CRI Review Process: internal team process, no extraction
- Remaining: 88 pages

## 2026-04-05 ado-wiki batch (chain)
- Scanned 2 pages (batch char budget: 13563/15000)
- Page 0 (Customer Lockbox FAQs): Track B guide-draft → avd-ado-wiki-327
- Page 1 (SaaF CRI Review Process): Skipped — internal team process/metrics, no troubleshooting value
- discovered: 1, deduplicated: 0
- Remaining: 88 pages

## 2026-04-05 ado-wiki scan (batch)
- **Scanned**: 2 pages from Windows365 Support Wiki
  - `/Sandbox/WCX Specific Content/OCE APIs/Windows 365 Customer Lockbox FAQs` → Track B (guide-draft)
  - `/Sandbox/WCX Specific Content/SaaF CRI Review Process` → Track B (guide-draft)
- **Discovered**: 0 (break/fix), 2 (guide-drafts)
- **Deduplicated**: 0
- **IDs**: avd-ado-wiki-327, avd-ado-wiki-328
- **Remaining**: 51 pages
- 2026-04-04T22:49:34Z | ado-wiki batch | +4 guide-drafts (IDs 329-332): CloudPC Retargeting, Group-based License Resize, Rename CloudPC, W365 Frontline CAS OCE APIs | remaining: 88 pages

## 2026-04-05 06:50 — ado-wiki batch (2 pages)
- **Scanned**: Windows 365 Customer Lockbox FAQs, SaaF CRI Review Process
- **Track B (guide-drafts)**: 2 guides saved
- **JSONL**: avd-ado-wiki-327..328 (guide-draft pointers)
- **Remaining**: 88 unscanned pages
- **21v**: Both marked 21vApplicable=false (SaaF internal processes)
| 2026-04-05 | ado-wiki | +4 entries (avd-ado-wiki-327~330): 1 Track A (W365 capacity AllocationFailed errors), 3 Track B guide drafts (client traces, Geneva agent troubleshooter, ASC connectivity troubleshooting). 6 SaaF-internal pages skipped (no CSS content). | Windows365 wiki scan batch |

## 2026-04-05 ADO Wiki Batch (tick)
- Pages scanned: 4 (SaaF Livesite Rotation, SAW Onboarding, Pegasus, SaaF Torus)
- Track A (break/fix): 0
- Track B (guide): 1 (Pegasus AI diagnostic tool)
- Skipped (internal process): 3 (not CSS-applicable)
- New IDs: avd-ado-wiki-333
- Remaining: 80 pages

## 2026-04-05 ado-wiki tick (batch from idx 40+)
- Scanned 2 pages: Authentication & Identity, Dump Cloud PC
- Extracted 3 break/fix issues + 2 guide-draft pointers (IDs 334-338)
- 4 guide drafts written (+ 2 from collision: lockbox, cri-review)
- Note: first 4 attempted pages (OCE APIs) already scanned by concurrent agent
- Remaining: 78 unscanned pages

## 2026-04-05 06:52 — ado-wiki batch
- Scanned 4 pages (W365 Support Wiki: Livesite Rotation, SAW Onboarding, Pegasus, Torus)
- Track A: 0 entries (all pages were internal processes or tool guides)
- Track B: 1 guide draft (Pegasus AI diagnostic tool)
- Skipped: 3 pages (internal SaaF/WCX process, not CSS-relevant)
- Remaining: 78 unscanned pages

### 2026-04-04T22:52:44 — ado-wiki batch
- Pages processed: 4 (SaaF Livesite Rotation, SAW Onboarding, Pegasus, Torus SAW Process)
- Discovered: 1 (Pegasus diagnostic tool guide)
- Deduplicated: 0
- Skipped: 3 (internal SaaF process pages, not applicable to CSS)
- Remaining: 78

## 2026-04-05 ado-wiki batch (tick)
- Scanned 4 pages (batch ~12,296 chars)
- 3 pages skipped (internal process/deprecated: Livesite Rotation, SAW Onboarding, Torus on SAW)
- 1 guide draft: Pegasus diagnostic tool (avd-ado-wiki-333)
- Discovered: 1, Deduplicated: 0, Remaining: 75

## 2026-04-05 ado-wiki tick
- Scanned 10 pages (batch from Sandbox/WCX + Support Processes)
- 9 pages skipped (internal SaaF/WCX processes, not CSS-applicable)
- 1 guide-draft: Common Collaborations case routing (avd-ado-wiki-329)
- Remaining: ~75 pages

## 2026-04-05 06:55 — ado-wiki scan (batch)
- Scanned 10 pages (Windows365 Support Wiki — Sandbox/WCX content + Case Handling)
- 7 pages skipped (internal SaaF/WCX processes, not CSS-relevant)
- 1 page already extracted (Pegasus)
- 2 new guide drafts: w365-scope-tags-sync, w365-common-collaborations
- 2 new JSONL entries (avd-ado-wiki-329, avd-ado-wiki-330)
- Remaining unscanned: ~72 pages

## 2026-04-05 07:10 — ado-wiki scan (batch)
- Scanned 10 pages (Windows365 Support Wiki — Sandbox/WCX + Case Handling)
- 9 pages skipped (internal SaaF/WCX processes: livesite rotation, SAW onboarding, Torus, Zebra AI, CWL program, on-call, scope tags, wiki admin JIT, common collaborations)
- 1 new guide draft: ado-wiki-pegasus.md (Pegasus AVD/W365 diagnostic tool)
- 1 new JSONL entry (avd-ado-wiki-339, guide-draft)
- Remaining unscanned: 72 pages

### 2026-04-05 ado-wiki batch (scope-tags, jit, collaborations, collab-form)
- **Scanned**: 4 pages (2 content-bearing, 2 skipped as internal process)
- **Track A**: 1 entry (avd-ado-wiki-340: scope tag sync Kusto diagnostic)
- **Track B**: 1 guide-draft (avd-ado-wiki-341: common collaborations routing)
- **Remaining**: 71 unscanned pages

## 2026-04-05 06:56 — ado-wiki tick (avd)
- Scanned 4 pages from Windows365 Support Wiki (WCX Scope Tags, JIT Process, Common Collaborations, Collaboration Form)
- Track B guide-drafts: 2 (scope-tags-intunegeosync, common-collaborations-routing)
- Track A entries: 0 (pages were process/reference docs)
- Skipped: 2 (internal admin/process with no troubleshooting value)
- JSONL: +2 guide-draft entries (avd-ado-wiki-342, avd-ado-wiki-343)
- Remaining: 71 pages


## 2026-04-05 ADO Wiki Scan (batch ~1111-1121)
- Pages processed: 11 (3 batches)
- Discovered: 6 new entries (avd-ado-wiki-331 to 336)
- Guide drafts created: 3 (common-collaborations, cogs-hibernation, basic-scoping)
- Deduplicated: 0
- Remaining: 69 pages
- Notable: Scope Tags page had useful Kusto query; COGS/hibernation guidance important for customer comms; Basic Scoping checklist useful for case intake

## 2026-04-05 ado-wiki batch (scanned 1121→1141)
- Processed 8 pages (2 batches): 4 internal SaaF process pages (livesite rotation, SAW onboarding, Pegasus [already extracted], Torus) + 4 more (scope tags, wiki admin JIT, common collaborations, collaboration form)
- Track B guides created: w365-scope-tags-sync (Kusto queries), w365-common-collaborations (SAP routing), w365-collaboration-form (Ava bot)
- Discovered: 3 new entries (IDs 340-342), Deduplicated: 0 (skipped already-extracted pages)
- Remaining: 69 pages

## 2026-04-05 — ado-wiki tick
- Scanned 9 pages (W365 Sandbox/WCX section)
- 7 pages CSS-irrelevant (internal SaaF process) → marked scanned only
- 2 new guide-drafts: Zebra AI (case analysis tool), SaaF On-Call (escalation process)
- 2 new JSONL entries (avd-ado-wiki-346, 347)
- Remaining: ~71 pages
- [2026-04-05] ado-wiki scan: processed 'Delivery Strategy - Session Connectivity Issues' (W365). Track A: 1 break/fix (ConnectionFailedUserHasValidSessionButRDSHIsUnHealthy). Track B: 1 guide draft (session connectivity delivery strategy). IDs: avd-ado-wiki-348~349. Remaining: 68 pages.

## 2026-04-05 06:59 — ado-wiki tick
- Pages scanned: 2 (Customer comms COGS Operations, Basic Scoping)
- Discovered: 2 (1 break/fix: RPA/automation hibernation license; 1 guide-draft: basic scoping checklist)
- Deduplicated: 0
- Remaining: 69 pages
- Note: ID collision with parallel agent (336-337 duplicated), safe for MERGE dedup

## 2026-04-05 ado-wiki batch (collaboration/COGS/scoping)
- Scanned 3 pages, discovered 4 entries (1 Track A + 3 Track B guide-drafts)
- Track A: RPA/automation + unattended license requirement (avd-ado-wiki-342)
- Track B guides: collaboration form, COGS customer comms, basic scoping
- Remaining: 68 pages

## 2026-04-05 ado-wiki tick (session connectivity delivery strategy)
- Scanned 1 page (21K chars): Delivery Strategy - Session Connectivity Issues
- Track A: 1 entry (ConnectionFailedUserHasValidSessionButRDSHIsUnHealthy → RDAgentBootLoader not running)
- Track B: 1 guide draft (delivery-strategy-session-connectivity-issues.md)
- JSONL total: 342 entries, 68 pages remaining

## 2026-04-05 ado-wiki batch (chain)
- Scanned 6 pages (3 deduped from prior runs, 3 new Track B guides)
- New entries: avd-ado-wiki-350 to 352 (guide-drafts: scenario scoping, scope template, support area paths)
- Remaining: 65 pages

## 2026-04-05 ado-wiki batch (chain)
- Scanned 3 pages: ANC Limit Increase, Cloud PC active deletion review, Cloud PC recovery scoping questions
- Track A: 2 entries (avd-ado-wiki-355, 356) — Cloud PC deletion/grace period and unexpected reprovisioning
- Track B: 2 guide-drafts (avd-ado-wiki-354, 357) — ANC limit increase process, passive deletion scoping
- Remaining: ~65 unscanned pages

### 2026-04-05 ado-wiki scan tick
- **Pages processed**: 10 (batch of 5 + 5)
- **Track A extracted**: 2 (ConnectionFailedUserHasValidSessionButRDSHIsUnHealthy, Cloud PC active deletion)
- **Track B guide drafts**: 5 (session connectivity delivery strategy, scenario scoping, ANC limit increase, active deletion review, recovery scoping questions)
- **Skipped (internal process)**: 3 (Scope Template, Support Area Paths, DCRs and Feature Requests, GDPR DSRs, Data Sharing with PG)
- **JSONL entries added**: 7 (IDs avd-ado-wiki-343 to avd-ado-wiki-349)
- **Remaining unscanned**: 59

## 2026-04-05 ado-wiki tick (parallel agent)
- **Scanned**: 7 pages (Session Connectivity Delivery Strategy, Scenario Scoping, Scope Template, Support Area Paths, ANC Limit Increase, Cloud PC Active Deletion Review, Cloud PC Recovery Scoping)
- **Discovered**: 5 entries (2 Track A break/fix + 3 Track B guide-draft pointers)
- **Deduplicated**: 0
- **Guide drafts**: 3 new (delivery-strategy-session-connectivity, scenario-based-scoping, cloud-pc-active-deletion-review)
- **Remaining**: ~59 pages
- **Note**: Pages already scanned by parallel agent; extractions still added unique content

## 2026-04-05 ado-wiki batch (ANC limit + Cloud PC deletion)
- Scanned 3 pages from Windows365 Support Wiki (Support Processes section)
- Track A: 1 entry (Cloud PC active deletion review - CPCD diagnostics)
- Track B: 2 guide drafts (ANC limit increase process, passive deletion scoping questions)
- IDs: avd-ado-wiki-352 ~ 354
- Remaining: 58 pages

## 2026-04-05 ado-wiki tick (Windows365 wiki batch)
- Scanned: 8 pages (6 previously-processed but untracked + 2 new)
- New pages processed: VM Disk Recovery Process, DCRs and Feature Requests
- Track A: 1 (VM Disk Recovery - soft/hard delete recovery with Kusto queries)
- Track B: 2 guides (VM Disk Recovery detailed guide, DCRs process guide)
- JSONL entries added: 3 (avd-ado-wiki-353 to 355)
- Remaining unscanned: 58 pages
- exhausted: false

## 2026-04-05 07:07 — ado-wiki batch
- Processed 2 pages: VM Disk Recovery Process (already had entries, marked scanned), SFI Compliance (1 guide-draft entry)
- Discovered: 1, Deduplicated: 0, Remaining: 43

### 2026-04-05 07:07 — ado-wiki tick (cleanup + 2 pages)
- Cleaned up duplicate JSONL entries from previous incomplete runs (deduped IDs 354-378)
- Processed 2 new pages: SFI Compliance, CSS-SaaF-CAT Collaboration
- Both Track B (process guides) → saved as drafts
- Discovered: 2 (guide-drafts), Deduplicated: 0
- Remaining unscanned: 43 pages


## 2026-04-05 07:08 — ado-wiki tick
- Processed 2 pages (SFI Compliance, CSS-SaaF-CAT Collaboration)
- Track A: 1 (SubscriptionNotRegisteredForFeature for SFI IP tagging)
- Track B: 2 guide drafts
- JSONL: 3 entries appended (avd-ado-wiki-381..383)
- Remaining: 46 unscanned pages


## 2026-04-05 ado-wiki tick (agent B)
- Scanned 2 pages (SFI Compliance, CSS-SaaF-CAT Collaboration)
- Track A: 1 (SubscriptionNotRegisteredForFeature error)
- Track B: 2 guide drafts (sfi-compliance, css-saaf-cat-collaboration)
- Deduplication: cleaned 10 duplicate entries from parallel agent overlap
- Remaining: 43 unscanned pages

## 2026-04-05 ado-wiki tick (pages 1184-1185 of 1229)
- Scanned: 2 pages (TSG: Customer Requests for VHDs, Anti Fraud and Abuse Process)
- Track A: 3 break/fix entries (avd-ado-wiki-382~384: slow lane provisioning, suspicious tenant deallocation, fraud deprovisioning)
- Track B: 2 guide drafts (VHD access policy, anti-fraud process with Kusto queries)
- JSONL entries: 5 (avd-ado-wiki-381~385)
- Remaining: 39 pages

## 2026-04-05 07:10 — ado-wiki batch (2 pages)
- Pages: VHD Access TSG, Anti Fraud/Abuse Process
- Extracted: 5 entries (IDs 381-385): 1 guide-draft (VHD policy), 3 break/fix (slow lane/suspicious/fraud), 1 guide-draft (fraud process)
- Guide drafts: ado-wiki-customer-vhd-access-policy.md, ado-wiki-w365-anti-fraud-abuse-process.md
- Remaining: 39 pages

## 2026-04-05 ado-wiki tick (batch)
- Pages processed: 10 (SFI Compliance, CSS-SaaF-CAT, Escalation Workflow, TSG VHD Access, Anti Fraud, Support Resources, Brazil South, Restricted Region, West Europe Capacity, MSRD-Collect)
- New JSONL entries: 5 (avd-ado-wiki-384 to avd-ado-wiki-388)
  - 384: Anti-fraud Kusto queries (relatedTo avd-ado-wiki-245)
  - 385: Brazil South restricted region provisioning
  - 386: Restricted region exception (ANC vs MHN)
  - 387: West Europe capacity restrictions + provisioning error
  - 388: MSRD-Collect tool guide pointer
- Deduplicated: 1 (SFI Compliance already in JSONL)
- Guide drafts: 1 new (ado-wiki-msrd-collect.md), 1 existing (ado-wiki-customer-requests-vhd-access.md)
- Skipped: 4 pages (process/contact docs with no technical content)
- Remaining: 4 pages (Frontline DPP Kusto queries + scripts)

## 2026-04-05 — ado-wiki scan COMPLETE (final batch)
- Scanned 6 pages (2+4), extracted 3 break/fix entries + 6 guide drafts
- IDs: avd-ado-wiki-384 to avd-ado-wiki-392
- Topics: VHD access policy, anti-fraud/tenant score, Graph API scripts, Frontline Shared DPP (Autopilot V2), provisioning policy details
- **ADO Wiki scan exhausted** — all 1181 indexed pages scanned

## 2026-04-05 ADO Wiki Final Batch (4 pages)
- Scanned last 4 remaining pages from Windows365 Support Wiki
- Track A: 1 break-fix (DPP DppNotEnabled error)
- Track B: 4 guide drafts (scripts, DPP successful flow, DPP troubleshooting, provisioning policy details)
- New IDs: avd-ado-wiki-393 to avd-ado-wiki-397
- **ADO Wiki scan EXHAUSTED** — all 1181 indexed pages processed

## 2026-04-05 ado-wiki scan (chain agent)
- **Source**: ado-wiki (Windows365, WindowsVirtualDesktop wikis)
- **Result**: All 1181 indexed pages confirmed scanned (scanned=1272 unique, superset of index)
- **Discovered**: 0 new (all pages already processed by prior agents)
- **Deduplicated**: 0
- **Status**: ✅ EXHAUSTED — ado-wiki source fully scanned
- **Note**: jq array subtraction gave false positives (4 phantom unscanned pages); verified with file-based comm -23 = 0 diff. JSONL has 417 lines, last ID avd-ado-wiki-365 (with some duplicate entries from concurrent agent writes)

## 2026-04-05 ado-wiki batch (final)
- Pages processed: 5 (2 + 3)
- Track A entries: 3 (avd-ado-wiki-385 slow lane, 386 fraud deprovisioning, 390 DppNotEnabled)
- Track B guide drafts: 5 (VHD access, anti-fraud process, scripts, DPP successful event, DPP troubleshooting)
- JSONL pointer entries: 5 (384, 387, 388, 389, 391)
- Deduplicated: 2 (385→relatedTo:246, 386→relatedTo:245)
- Total new entries: 8 (384-391)
- **exhausted: true** — all 1181 indexed pages scanned

## 2026-04-05 ado-wiki scan (final batch)
- Processed 5 pages (1 Customer Lockbox + 4 FLS/DPP/Scripts)
- Track A: 3 break/fix items (DMS not recognized, CLB 403, DPP not enabled)
- Track B: 5 guide drafts (CLB operations, extra scripts, DPP successful, DPP troubleshooting, provisioning policy)
- IDs: avd-ado-wiki-386 to avd-ado-wiki-393
- **EXHAUSTED: true** — all 1181 indexed pages scanned


## 2026-04-05 ADO Wiki Final Batch (Chain Completion)

- **Source**: ado-wiki (Supportability/Windows365)
- **Pages processed**: 4 new + 35 cross-wiki duplicates marked
- **Track A**: 1 break/fix entry (FLS DPP profile not assigned → DppNotEnabled error)
- **Track B**: 4 guide drafts (scripts reference, DPP successful event Kusto, DPP troubleshooting, provisioning policy details Kusto)
- **New JSONL entries**: avd-ado-wiki-398 through avd-ado-wiki-402 (5 entries)
- **Total JSONL**: 435 lines
- **Status**: **EXHAUSTED** — all 1181 indexed pages fully scanned
- **Guide drafts total**: 343

### 2026-04-05 ado-wiki final batch (4 pages, EXHAUSTED)
- Pages: W365 FLS scripts, DPP successful event, DPP troubleshooting, provisioning policy details
- Track A: 1 break/fix (avd-ado-wiki-388: DPP not assigned → DppNotEnabled error)
- Track B: 4 guide-drafts (avd-ado-wiki-389~392)
- Total: 5 entries (IDs 388-392)
- **ADO Wiki scan EXHAUSTED** — all 1181 indexed pages scanned (1321 scanned entries incl. duplicates)

## 2026-04-05 ado-wiki tick
- **Pages processed**: 3 (Extra Goodies scripts, FLS DPP Successful Event, FLS DPP Troubleshooting)
- **Track A**: 1 break/fix entry (avd-ado-wiki-391: DPP not enabled error for Frontline Shared)
- **Track B**: 3 guide drafts saved
- **JSONL entries**: 4 (IDs 389-392)
- **Remaining**: 36 pages unscanned
- **Note**: Fixed scanned-ado-wiki.json after ConvertTo-Json round-trip caused false scanned entries
| 2026-04-05 | ado-wiki | Phase 3 FINAL: scanned last 43 pages (W365 wiki: tools, Kusto queries, processes, TSGs). Extracted 9 new issues (393-401): 5 break/fix (ASC errors, custom image/Sophos, GCCH Kusto auth, persistent disconnections) + 4 guide drafts (intermittent disconnection TSG, DPP troubleshooting, EvoSTS, MSODS). 24 Kusto-reference/tool pages marked scanned without JSONL (no extractable symptoms). All 1181 indexed pages now exhausted. | Windows365 Support Wiki |

| 2026-04-05 | 21v-gap-scan | Scanned AVD Feature Gap: 8 unsupported features (Android/iOS/macOS/Store/Thin clients, Autoscale, Stack HCI, Windows App), 2 partial features (App attach, Intune enrollment). Source updated 2026-01-16. | POD Services/AVD/Feature Gap || 2026-04-05 | onenote | Phase 2 batch 1: extracted 3 break/fix triples (AAD DS FSLogix auth, ASR licenseType billing, MSIX multi-entry app) + 2 guide drafts (licensing reference, support scope). 10 pages scanned, 5 too thin/link-only. | page-classification.jsonl → avd-onenote-001~005 |

## 2026-04-05 onenote-extract tick (pages 21-30)
- **Pages scanned**: 10 (FSLogix registry ref, MSIX app attach, [Lab]MSIX+AADDS, [Lab]MSIX+ADDS, Multimedia Redirection, Private Link, RDP shortpath, Remote App Streaming, USB Redirection, Windows App replacement)
- **Track A (break/fix)**: 4 new entries (avd-onenote-016 to 019)
  - MSIX app attach incompatible with Azure AD DS
  - Domain join error 1355
  - Windows App dual federation workaround for Mooncake
  - Remote Desktop client retirement timeline for Mooncake
- **Track B (guide-draft)**: 3 new guides (avd-onenote-020 to 022)
  - MSIX app attach setup guide
  - RDP Shortpath setup and connection flow
  - Windows App migration guide for Mooncake
- **Skipped (thin content)**: 5 pages (link-only: FSLogix registry ref, Multimedia Redirection, Private Link, Remote App Streaming, USB Redirection)
- **Deduplicated**: 0
- **Progress**: 30/177 scanned, 147 remaining

### 2026-04-05 09:02 contentidea-kb tick
- Scanned: 157646,158410,159753,160264,160365,160931,160932,161069,162297,162556
- Discovered: 9, Deduplicated: 1 (162297 dup of 161069 Intel BT bugcheck)
- New IDs: avd-contentidea-kb-045..053
- Topics: token refresh/network, MSIX CIM format, RunOnce 5min wait, termsrv crash UAL, connection limit GPO, Start VM on Connect RBAC (x2), Intel BT bugcheck USB redir, AD trust RPC ports
- Remaining: 98

### 2026-04-05 contentidea-kb tick (054-063)
- **Source**: ContentIdea KB (WIQL: "Virtual Desktop")
- **Scanned**: 162568, 168523, 168533, 169257, 169258, 169261, 169616, 169618, 169665, 171126
- **Discovered**: 10 (avd-contentidea-kb-054 ~ 063)
- **Deduplicated**: 0
- **Topics**: HTML client targetisaadjoined, hostpool migration delete, RDAgentBootLoader registry, printing Dell Wyse, personal hostpool VM assignment, black screen netprofm.dll, taskbar overlapping, scaling plan alert logs, FSLogix app crash 0x80000003, hostpool add VM Windows Update corruption
- **Remaining**: ~88 unscanned

## 2026-04-05 onenote-extract tick (avd-onenote-006~015)

- **Scanned**: 10 pages (Week 1 case studies + Week 2 case studies)
- **Track A**: 8 break/fix triples (slow logon, domain trust, WHfB/KDC, sysprep image, upgrading state, host pool join, marketplace, RemoteApp re-auth)
- **Track B**: 2 guide-drafts (session-host-unavailable-diagnostics, session-limit-management)
- **Deduplicated**: 0 (no overlap with existing 5 entries)
- **Total scanned**: 62/177, **Remaining**: 115
- **Exhausted**: false
| 2026-04-05 | onenote | Phase 2 tick 4: fixed 10 dup IDs (042-051), scanned 10 new pages (Week 2-3 case studies). Extracted 8 break/fix (052-059). 105 remaining. | Global Case Study Week 2-3 |

**Tick 4 details (2026-04-05):**
- **ID Fix**: Previous tick left 10 entries with duplicate IDs (006-015 reused). Renumbered to 042-051.
- **Track A**: 8 break/fix triples:
  - 052: China proxy blocking auth URLs (aafcdn.msftauth.net)
  - 053: Subnet PaaS integration blocking VM deployment
  - 054: All hosts unavailable - broker heartbeat failed (firewall)
  - 055: CA sign-in frequency + Seamless SSO URL blocked
  - 056: RemoteApp auth failure with CA sign-in frequency
  - 057: FSLogix DeleteLocalProfileWhenVHDShouldApply causing profile loss
  - 058: Domain join 0x5 - duplicate computer objects in AD
  - 059: Session force logoff (LogoffReason 12) - NLA/VM issue
- **Skipped**: 2 pages (Week 3 header empty, Add VM to host pool screenshots-only)
- **Deduplicated**: 0 (no overlap with existing entries)
- **Total scanned**: 72/177, **Remaining**: 105
- **Exhausted**: false

## 2026-04-05 contentidea-kb scan (tick — chain resume)
- **Scanned**: 10 work items (171127-180337)
- **Skipped (dup)**: 5 — #171127 (~063), #172400 (~064), #175220 (~065), #177288 (~066), #179607 (~062)
- **New entries**: 5 (avd-contentidea-kb-069 to 073)
  - 069: AVD Classic PowerShell "User not authorized" → grant RDS Owner role (related to 055)
  - 070: KMS activation 0xC004F074 → new Azure KMS IPs blocked by firewall
  - 071: System hang deadlock in RdpCoreCDV.dll → PG rolled back RDP-SXS stack
  - 072: AAD joined login failure → duplicate UPN in on-prem AD (related to 067)
  - 073: AAD joined "sign-in method not allowed" → Intune compliance broken (related to 068)
- **Fixed**: 1 line with unescaped backslash in existing JSONL (line 66)
- **Total JSONL**: 73 entries | **Scanned**: 100/168 | **Remaining**: 68
- **Exhausted**: false

### 2026-04-05 — onenote-extract tick (pages 63-72)

- **Scanned**: 10 pages (Week 2-3 Global Case Study)
- **Discovered**: 8 new entries (avd-onenote-052 to avd-onenote-059)
  - 052: China proxy blocks auth endpoints (aadcdn.msftauth.net)
  - 053: Subnet PaaS delegation blocks AVD VM deployment
  - 054: Multi-host unhealthy - heartbeat failure to broker (related to 046)
  - 055: Guide-draft: manually add VM to host pool (AADDS)
  - 056: CA sign-in frequency + Seamless SSO blocked (error 70044)
  - 057: FSLogix DeleteLocalProfileWhenVHDShouldApply=1 causes profile loss
  - 058: Domain join 0x5 INSUFF_ACCESS_RIGHTS - stale computer objects
  - 059: NLA corruption causes immediate session logoff (LogoffReason=12)
- **Deduplicated**: 1 ([Icy] remote app auth overlaps avd-onenote-051)
- **Skipped**: 2 (Week 3 header=no content, [Bruce] domain join=insufficient info)
- **Total JSONL**: 65 entries | **Scanned**: 72/177 | **Remaining**: 105
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (82/177 scanned)
- Processed 10 pages (Week 3 & Week 4 Case Studies)
- Extracted 5 new entries (avd-onenote-060 ~ 064): FSLogix GPO profile attach failure, FSLogix corrupt VHDX/missing NTUSER.DAT, TLS cipher mismatch (Schannel 36874), domain join error 1355, language pack FoD missing from ISO
- Deduplicated 1 (Lab2 MSIX+AADDS ≥80% overlap with avd-onenote-016)
- Skipped 4 empty/header-only pages
- Remaining: 95 pages

### 2026-04-05 Phase2 onenote batch (scanned 73→82)
- Processed 10 pages (Week 3 tail + Week 4 start of Global Case Study)
- **3 new entries** (avd-onenote-060~062): FSLogix GPO conflict (DisablePersonalDirChange), FSLogix corrupt NTUSER.DAT, TLS cipher mismatch (Schannel 36874)
- **2 deduplicated** (Lab2 MSIX+AADDS → avd-onenote-016, Lab3 MSIX+ADDS → avd-onenote-017)
- **5 skipped** (empty/insufficient: Rika, Wei, Week4 header, Bruce lang packs, Icy MSIX link)
- Remaining: 95 pages

## 2026-04-05 onenote-extract tick (Week 4 labs + How To)

- **Scanned**: 10 pages (Week 4 lab verifications + How To section)
- **Extracted**: 4 new entries (avd-onenote-065 to avd-onenote-068)
  - 065: Azure Monitor workbook deployment validation error
  - 066: Auto scaling script token acquisition error
  - 067: Auto scaling ODS endpoint DNS resolution failure
  - 068: ADFS SSO limitations (AADDS not supported, federated only, Windows client only)
- **Skipped**: 6 pages (empty section headers, link-only pages, screenshot-heavy lab verifications with no extractable break/fix)
- **Deduplicated**: 0 (068 has relatedTo: avd-onenote-011 at ~60% overlap)
- **Progress**: 92/177 scanned, 85 remaining

## 2026-04-05 Phase 2 onenote-extract (tick)

- **Processed**: 10 pages (Week 4 lab verifications + How To section)
- **Track A (break/fix)**: 3 entries (avd-onenote-065..067)
  - 065: Azure Monitor workbook deployment validation error (JToken type mismatch)
  - 066: ODS endpoint DNS failure in Mooncake for auto scaling script
  - 067: ADFS SSO cookie expiration — session host login prompt when ADFS cookie expired but AAD cookie valid
- **Track B (guide-drafts)**: 3 entries (avd-onenote-068..070) + 3 draft files
  - diagnostics-log-analytics, mfa-conditional-access, start-vm-on-connect
- **Skipped (no content)**: 4 pages (link-only or section headers)
- **Deduplicated**: 0 (no overlaps found)
- **Remaining**: 85 pages
- **Exhausted**: false

### 2026-04-05 Phase 2 tick (onenote-extract continuation)
- **Pages processed**: 10 (How To guides + Mooncake Case Study batch)
- **New entries**: 5 (avd-onenote-071 to avd-onenote-075)
  - 071: FSLogix VHD shrinking (Invoke-FslShrinkDisk, don't use frx.exe)
  - 072: Restrict Edge RemoteApp local drive access (GPO URLBlocklist)
  - 073: Sysprep error after language pack install (must Windows Update before sysprep)
  - 074: AVD connection failure 0x80072F7D rdgateway + VPN interference
  - 075: WindowsVirtualDesktop service tag for NSG/Route Table (guide-draft)
- **Deduplicated**: 2 (Subscribe→027, dual-federation→029)
- **Skipped (no content)**: 3 (net peering lab guide, Post-Update thin page, empty header)
- **Remaining**: 75 pages
- **Exhausted**: false

## 2026-04-05 onenote-extract batch (avd)
- Pages processed: 10
- Track A (break/fix): 3 new entries (avd-onenote-076..078)
  - 076: NSG blocks session host to DC, ConnectionFailedAdTrustedRelationshipFailure
  - 077: Custom image CD-ROM disabled, OOBE stuck on unattend.xml
  - 078: Pagefile on D: with no temp disk (v4 VM), OOBE error
- Track B (guide-draft): 2 drafts
  - FSLogix profile roaming FAQ
  - AVD user reboot via webhook+automation
- Deduplicated: 2 (AAD Join MFA=avd-onenote-026, Teams slow=avd-onenote-023)
- Skipped (empty/insufficient): 3
- Remaining: 65 pages

## 2026-04-05 09:46 — onenote-extract (avd) tick
- Pages processed: 10 (4 MCVKB/wiki_migration + 6 Mooncake case studies)
- Entries extracted: 7 (avd-onenote-081 to 087)
- Deduplicated: 3 (MCVKB wiki_migration duplicates of existing MCVKB/VM+SCIM entries)
- Key topics: FSLogix hive corruption 00000002/80070002, FSLogix permission cross-user access, Windows activation KMS proxy, AzFilesHybrid sub-domain join, trust relationship broken (rejoin domain), SSL injection blocking RD client subscribe, MSIX portal bug + VHD corruption
- Remaining: 55 pages

## 2026-04-05 — onenote-extract (avd) final sweep
- Pages processed: 55 (remaining from prior runs) across multiple ticks
- New entries this session: 4 (avd-onenote-089: MSIX start menu, 104: scaling plan guide, 105: slow logon data collection guide, 106: AVD API deprecation PKYM-DVG)
- Guide-drafts created: 2 (onenote-avd-scaling-plan-reference.md, onenote-avd-slow-logon-data-collection.md)
- Deduplicated: ~51 pages already extracted in prior runs (scanned list desynced with JSONL)
- Fixed: scanned-onenote.json deduplication (had 10 duplicate entries)
- **EXHAUSTED**: All 177 AVD pages in page-classification.jsonl now scanned. Total JSONL entries: 120.

| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b: 10 pages assigned, 9 returned 404 (deleted/moved wiki pages, length=0 in index), 1 page with content (AAD Login Issues, sandbox/draft quality, 2012 chars). Extracted 5 low-confidence break/fix entries (avd-ado-wiki-b-r2-001 to 005) covering AAD auth errors: FQDN vs hostname, SSL/TLS mismatch, auth loop, P2P cert, WAM service. | Supportability/WindowsVirtualDesktop wiki |
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b r4: 10 pages processed (all fetched successfully after fixing emoji-prefix path + colon URL encoding). Track A: 5 break/fix entries (avd-ado-wiki-b-r4-001 to 005) — Storage Blob download failure, EXPIRED_MACHINE_TOKEN, multi-session OS downgrade (2 scenarios: custom KMS + WinPA backend bug), DomainTrustCheck TCP port exhaustion. Track B: 3 guide drafts (Guided Troubleshooters reference, GPU VM perf troubleshooting, Geneva Monitoring Agent Check) + 3 JSONL pointer entries (avd-ado-wiki-b-r4-006 to 008). Pages 0,1,3 were thin pointer pages (just links to MS docs). Dedup: 0 (new batch file). | Supportability/WindowsVirtualDesktop wiki |

### 2026-04-06 ado-wiki blast batch-a (r4)
- **Pages processed**: 10 (Deployment Failures × 4, Health Check Failures × 6)
- **Track A (break/fix)**: 4 entries
  - avd-ado-wiki-a-r4-001: Storage Blob InvalidContentLink (ICM required)
  - avd-ado-wiki-a-r4-002: DomainTrustCheck TCP port exhaustion
  - avd-ado-wiki-a-r4-003: Geneva cert RDSAgentPROD missing
  - avd-ado-wiki-a-r4-004: AVD SxS Stack listener not showing
- **Track B (guide)**: 1 draft
  - avd-ado-wiki-a-r4-005: Geneva Monitoring Agent Check → guides/drafts/ado-wiki-a-Geneva-Monitoring-Agent-Check.md
- **Skipped (pointer-only)**: 5 pages (just links to MS Docs/eng.ms, no extractable content)
- **Deduplicated**: 0
- **Note**: codeWiki repo paths have 🔄 emoji prefix on Workflows dir; required Git Items API fallback

---

### 2026-04-06 ado-wiki blast batch-a round 6

**Batch**: a | **Pages processed**: 10 | **ID range**: avd-ado-wiki-a-r6-001 ~ r6-007

**Track A (break/fix) — 5 entries:**
1. `r6-001` Storage Blob download failure during AVD deployment (InvalidContentLink → ICM to PG)
2. `r6-002` INVALID_REGISTRATION_TOKEN — expired/invalid token → regenerate + restart BootLoader
3. `r6-003` NAME_ALREADY_REGISTERED — custom image with pre-registered agent → remove & re-register
4. `r6-004` Agent process crashing — rule out token/name issues first, else procdump + ICM
5. `r6-005` Repeated/duplicate sessions — fSingleSessionPerUser=0 → set to 1 or GPO

**Track B (guide-draft) — 2 entries:**
6. `r6-006` Custom vs Gallery image detection via ASC → `guides/drafts/ado-wiki-a-custom-vs-gallery-image.md`
7. `r6-007` Reinstall AVD Applications (last-resort procedure) → `guides/drafts/ado-wiki-a-reinstall-avd-applications.md`

**Skipped (pointer-only)**: 3 pages (DeploymentFailed-InvalidResourceReference, Admin-Username, Unauthorized — just links to MS Docs)
**Deduplicated**: 0

## 2026-04-06 - phase3-ado-wiki blast-batch batchId=b

- mode: blast-batch
- pagesProcessed: 10 (9 with content, 1 empty: SSL Inspection Troubleshooting)
- discovered: 14 (11 Track A + 3 Track B guide-drafts)
- deduplicated: 0
- wiki path issue resolved: W365 wiki uses emoji path /Features/🤝Dependencies/ (not /Features/Dependencies/)
- Track A entries: avd-ado-wiki-b-r1-001 to avd-ado-wiki-b-r1-011
- Track B drafts: ado-wiki-b-avd-media-optimization-troubleshooting.md, ado-wiki-b-custom-shortpath-gpo-setting.md, ado-wiki-b-outbound-connection-cloud-pc.md
- files: .enrich/known-issues-ado-wiki-b.jsonl, .enrich/scanned-ado-wiki-b.json
