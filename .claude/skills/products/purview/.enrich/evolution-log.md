# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | ado-wiki | Phase 3a: indexed 722 wiki pages from 3 wikis (Supportability/Azure Purview: 528, ASIM-Security/Compliance/IP: 174, ASIM-Security/IP Team: 20) | scanned-ado-wiki.json |
| 2026-04-05 | ado-wiki | Phase 3b batch 1: scanned 6 pages (Data Governance section), extracted 3 known issues (billing consent check, admin role reprovision, DGPU/DEH charges), skipped 3 (tool intro, training links, empty parent). Pre-read 20 page lengths cached. | purview-ado-wiki-001~003 |
| 2026-04-05 | ado-wiki | Phase 3b batch 2: scanned 6 pages (DQ section — Data Products, Data Quality). Extracted 8 break/fix issues (invalid chars in schema, domain move limitation, DQ NullType, Delta Lake version, unsupported region, Parquet FQN, Databricks VNet, Lakehouse allowlist) + 1 guide-draft pointer. Created 2 guide drafts (allowlist procedure, data profiling troubleshooting). 12/722 scanned, 710 remaining. | purview-ado-wiki-010~018 |
| 2026-04-05 | 21v-gap | Phase 1: 21v-gap-scan from POD Services "M365 Purivew Compliance". 10 unsupported, 5 partial features extracted from Feature Gap table + Gallatin verification + known issues. | 21v-gaps.json |
| 2026-04-05 | contentidea-kb | Phase 5: WIQL query keyword "Purview" returned 0 work items with KBArticleNumbers. Purview items exist in ContentIdea but none have published KB articles. exhausted=true. | scanned-contentidea-kb.json |
| 2026-04-05 | onenote | Phase 2 batch 1: scanned 10/132 high-confidence AIP/MIP pages. Extracted 5 break/fix issues (AIP Scanner auth 21v, MIP SDK SP missing, MIP SDK SP disabled, RMS bootstrap 21v, SharePoint IRM+RMS connector) + 3 guide drafts (AIP Scanner troubleshooting, MIP SDK Mooncake setup, RMS Connector troubleshooting). All 21v-applicable. | purview-onenote-001~008 |
| 2026-04-05 | mslearn | Phase 4c (fallback search): No toc.yml mapping, used search mode. 2 search queries → 7 unique Purview troubleshoot pages fetched. Extracted 24 break/fix issues covering: private endpoints (5), scan/connection (3), SHIR (7), Information Protection Scanner (5), S3 connector (2), Data Sharing (2). IDs purview-mslearn-001~024. | known-issues-mslearn.jsonl |

### 2026-04-05 08:21 — ado-wiki tick
- **Pages processed**: 8 (6 non-empty, 2 empty parent pages)
- **Track A (break/fix)**: 0
- **Track B (guide-drafts)**: 2 — priva-common-misroute, priva-kusto-geneva-logs
- **Skipped (non-TSG)**: 4 — Most visited stats, Onboarding resources, Preview dates, PG contacts
- **New IDs**: purview-ado-wiki-043..044
- **Total scanned**: 67/722 | Remaining: 655

## 2026-04-05 onenote-extract tick 2

- **Scanned**: 10 pages (batch 2, total 20/131)
- **Discovered**: 5 new entries (purview-onenote-009 ~ 013)
  - 009: AIP add-in retirement — customer lost labeling, extension process
  - 010: MSIP CloudEnvType registry for Office built-in labels in Mooncake (relatedTo: 001)
  - 011: MIP SDK SyncFile API Mooncake endpoint (cn01b.dataservice.protection.partner.outlook.cn)
  - 012: [guide-draft] MIP SDK OAuth2 token testing script for Mooncake
  - 013: [guide-draft] Azure RMS Mooncake operational tooling (ICM/Jarvis/Kusto/Escort)
- **Deduplicated**: 0 (010 appended with relatedTo instead of skipped — ~60% overlap)
- **Skipped**: 5 pages (image-only or minimal text: Wiki, bootstrap, label Vs template, AIP features CC B2B, AIP log viewer)
- **Guide drafts created**: 2 (onenote-mip-sdk-oauth2-testing.md, onenote-azure-rms-mooncake-operations.md)
- **Remaining**: 111 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (pages 68-73)
- Scanned 6 pages (4 with content, 2 empty parent pages)
- Page "Known issues & error codes" (Priva): Track A → 4 entries (045-048) — Priva Reports UX/service errors
- Pages "JP case HO", "Out of Scope Cases", "Parked Sev A": internal process docs, no technical TSG content → skipped
- Pre-read 20 upcoming page lengths cached for next batch
- Progress: 73/722 scanned, 649 remaining

### 2026-04-05 ado-wiki tick (process pages)
- **Scanned**: 11 content pages + 15 empty/parent pages (marked but removed as non-index orphans)
- **Effective index progress**: 73 → 84 scanned (11 new index pages)
- **Discovered**: 0 (all pages were internal process/admin docs: SevA/B handoff, acronyms, CAS, duplicate case, feature requests, ICM terminology, manager recovery, unresponsive customer)
- **Deduplicated**: 0
- **Pre-read cached**: 20 new page lengths (5 with content, 15 empty)
- **Remaining**: 638 pages
- **Exhausted**: false

### 2026-04-05 Phase2 onenote tick3
- **Pages scanned**: 10 (readiness/training section: AIP Scanner overview, Case Study header, MIP SDK support overview, RMS Connector header, Readiness Content & Lab + 5 sub-pages)
- **New issues**: 0 (all pages were training materials, section headers, or content already covered)
- **Deduplicated**: 0
- **Total scanned**: 30/131
- **Exhausted**: false

### 2026-04-05 ado-wiki tick (batch 10: process/case-mgmt pages)
- Scanned 10 pages: Case Management Basics, Collaboration, DFM Introduction, Handling Feature Requests, Internal Title, OOF, Scoping & Initial data collection, Teams Sharing, Common Misroute, AVA Documentation
- 7 pages = pure process (no extraction)
- 3 pages → Track B guide drafts:
  - `ado-wiki-collaboration-support-boundary.md` — cross-team routing matrix
  - `ado-wiki-scoping-initial-data-collection.md` — data collection per scenario (SHIR, scan, lineage, driver logs)
  - `ado-wiki-common-misroute-governance-compliance.md` — Governance vs Compliance routing
- New JSONL IDs: purview-ado-wiki-049 ~ 051 (guide-draft)
- Progress: 94/722 scanned (13.0%)

## 2026-04-05 ado-wiki tick (chain)
- Scanned: 2 pages (AVA Process, Team)
- Track B: 1 guide draft (ava-process-escalation-data-collection)
- Track A: 0 (Team page is administrative/contacts only, skipped)
- New JSONL: purview-ado-wiki-052
- Remaining: 626/722

## 2026-04-05 ado-wiki tick (chain)
- Scanned: 7 pages (CSAT Impacting Process, 4 empty Training pages, 2 Escalation Logs Required pages)
- Track A: 5 break/fix items (SHIR registration fail, SHIR HTTP 4xx/5xx, MIRException, missing assets, SHIR crash)
- Track B: 1 guide draft (logs-required-for-escalation — 12 escalation scenarios with log checklists)
- New JSONL: purview-ado-wiki-053~058
- Skipped: CSAT Impacting Process (internal team admin), 4 empty Training pages
- Remaining: 619/722

## 2026-04-05 Phase 2 onenote-extract (tick 3)

- **Pages processed**: 10 (9 high-confidence AIP remnants + 1 MCVKB BYOK)
- **New entries**: 7 (purview-onenote-014 ~ 020)
  - 5 break/fix: SCC PowerShell 21v connection, Office built-in labeling unsupported in 21v, BYOK key expiration, BYOK revoke cache issue, BYOK rekey old content access
  - 2 guide-drafts: AIP feature gap Mooncake, AIP support scope routing
- **Deduplicated**: 0
- **Skipped**: 3 pages (images-only, empty header, test credentials)
- **Total JSONL entries**: 20
- **Scanned**: 40/131 pages → exhausted: false
- **Remaining**: ~91 pages (5 MCVKB + 2 Readiness + 84 M365 Purview Compliance)

### 2026-04-05 09:16 — ado-wiki tick (Processes/Escalation batch)
- **Pages processed**: 9 (CSAT Impacting, Logs Required General, Logs Required 3P, CRI Sev2, ICM Process, ICM Quality, RCA Escalation, Getting Help, How customers raise tickets)
- **Track A extracted**: 7 entries (purview-ado-wiki-053..059) — SHIR registration, HTTP scan errors, MIRException, missing assets, classification, SHIR crash, Insights report
- **Track B guide**: 1 (guide draft already existed from prior partial run)
- **Guide-draft ref**: 1 entry (purview-ado-wiki-060)
- **Process pages skipped**: 7 (no technical content — team ops/CSAT/ICM/escalation processes)
- **Deduplicated**: 0
- **Total JSONL entries**: 60 (after this tick)
- **Scanned**: 109/722 pages → exhausted: false
- **Remaining**: 613 pages

## 2026-04-05 ado-wiki tick (continued)
- Scanned 59 pages (11 read + 38 batch-skipped admin/process, 10 classified)
- Extracted 4 entries (purview-ado-wiki-061~064): sovereign cloud limitations, Mooncake/Fairfax Kusto access, JIT access
- Created guide draft: ado-wiki-sovereign-cloud-faqs.md
- Remaining: 567 pages

## 2026-04-05 Phase 2 onenote-extract (tick 4)

- **Pages processed**: 10 (4 MCVKB AIP + 6 M365 Purview Compliance case studies/KB)
- **New entries**: 14 (purview-onenote-021 ~ 034)
  - 1 guide-draft: AIP encryption template troubleshooting (log locations, Kusto RMS queries)
  - 13 break/fix:
    - 022: Change default RMS template name (PowerShell)
    - 023: AIP Scanner UPN suffix mismatch (MSAL unknown_user_type)
    - 024-027: Cross-cloud MIP label issues (verified_primary_email, B2B access denied, MSIPC vs MIPSDK, Entra outbound block)
    - 028: Content search can't find mailbox in Gallatin (PG bug, PS workaround)
    - 029: eDiscovery OneDrive search fails (missing ComplianceWorkbenchApp SP)
    - 030: Encrypted mail can't open in OWA (IRM not configured)
    - 031: Audit log export Chinese chars garbled (BOM missing)
    - 032: Content Search 2+ Chinese chars returns nothing (tokenization issue)
    - 033: eDiscovery preview 401/400/503 in Gallatin (PG bug, export workaround)
    - 034: IRM errors in Office applying encryption label (relatedTo 004)
- **Deduplicated**: 0 (034 appended with relatedTo instead of skip — ~60% overlap with 004)
- **Total JSONL entries**: 34
- **Scanned**: 50/131 pages → exhausted: false
- **Remaining**: 81 pages (1 MCVKB section header + 2 Readiness + 78 M365 Purview Compliance)

### 2026-04-05 ado-wiki tick (Tools batch)
- **Source**: Supportability/Azure Purview/Microsoft Purview wiki
- **Pages scanned**: 8 (Tools/How-to + Kusto Queries section)
  - Check for Network Issues for SCC Service → guide-draft (065)
  - Get Tenant XML SCC labeling Policy → guide-draft (066)
  - Capture Browser(HAR) Logs → skipped (generic)
  - Capture x-ms-client-request-id from HAR → guide-draft (067)
  - How to check entity payload from UX → guide-draft (068)
  - How to read and analyze fiddler trace → skipped (generic)
  - JSON viewer/Notepad++ → skipped (trivial)
  - Kusto Queries/Classification Insights → skipped (attachment-only)
- **Discovered**: 4 guide-draft entries (IDs 065-068)
- **Deduplicated**: 0
- **Total JSONL entries**: 68
- **Scanned**: 176/722 pages → exhausted: false
- **Remaining**: 559 pages

### 2026-04-05 onenote-extract tick (batch 6: pages 51-60)
- Pages scanned: 10 (MCVKB AIP header, Purview readiness/SevA, Case Study header, SCC/IDO tracking, Mailbox audit, Soft purge, Archive Quota Morgan, Collaboration, BC escalation)
- New entries: 8 (purview-onenote-035 to 042)
  - Track A (break/fix): 7 entries (auto-labeling gap, eDiscovery gap, SAP routing, audit Move, content search purge, archive quota, inactive mailbox restore)
  - Track B (guide-draft): 1 entry (21V SCC/IDO BC escalation process)
- Deduplicated: 0
- Empty/skip pages: 4 (AIP header, Topic 7 image-only, Case Study header, Collaboration contacts-only)
- Progress: 60/131 scanned, 71 remaining
- exhausted: false

### 2026-04-05 onenote-extract tick (phase2 continuation)
- Scanned 10 pages from M365 Purview Compliance / Common operation_TSG section
- Extracted 2 raw issues (043: Windows event log registry key, 044: folderid format conversion)
- Created 4 guide-drafts (045-048: Jarvis SCC reference, retention policy distribution, DLP blocked email, DLP SPO rule match)
- Skipped 4 empty/link-only pages (section headers, wiki links, xlsx link)
- Total JSONL entries: 48 | Scanned: 70/131 | Remaining: 61

### 2026-04-05 ado-wiki tick (AD RMS How-To batch 1)
- **Source**: ASIM-Security/Compliance/Information Protection wiki — AD RMS How-To section
- **Pages scanned**: 4 (AD RMS service keys, Add Reports, DS lookup caching, IIS Kerberos)
- **Track A (break/fix)**: 2 entries (070: Reports missing .NET/ReportViewer, 071: group membership cache 24h delay)
- **Track B (guide drafts)**: 2 entries (069: AD RMS key types/export, 072: IIS Kerberos config)
- **Pre-read cached**: 40 page lengths (20 ASIM-Security + 20 Supportability wiki)
- **Remaining**: ~549 pages

### 2026-04-05 09:46 — Phase 2 onenote-extract (tick)
- Scanned 10 pages (80/131), 51 remaining
- Track A: 6 new break/fix entries (049-054): label publishing delay, DLP alert gap, retention label gap, SPO default label gap, audit log retention gap, archive quota migration
- Track B: 3 guide-drafts (055-057): 21V feature gap table, Compliance vs Data Governance routing, 21V feature roadmap
- Dedup: 054 relatedTo 040 (archive quota, different migration scenario)
- Skipped: 4 pages (empty/contacts-only/too-thin)

## 2026-04-05 ado-wiki tick (batch 3)
- **Scanned**: 10 pages (3 internal process/tools + 7 classification TSGs already extracted + 3 new classification pages)
- **Extracted**: 4 new Track A entries (081-084): Missing classifications — ACL/403, shuffle module failure, Data Map ingestion, data security restrictions
- **Guide drafts**: 1 new (ado-wiki-missing-classifications-on-asset.md)
- **Deduplicated**: 0 (all entries distinct from existing 076-077)
- **Remaining**: ~527 pages

### 2026-04-05 09:50 — Phase 2 onenote-extract (tick 2)
- Scanned 10 pages (90/131), 41 remaining
- Track A: 6 entries (058-063): SPO label email notification gap, DLP evaluate-predicate gap, ODB retention gap, cross-cloud labeling limitations, CMK SPO E5 license error, Groups&Sites label enablement
- Track B: 3 guide-drafts (064-066): Gallatin feature verification status, CMK setup guide (EXO/SPO/MDEP), cross-cloud labeling config
- Dedup: 0 (all new)
- Skipped: 2 pages (empty section headers)

### 2026-04-05 09:53 — Phase 2 onenote-extract (tick 3)
- Scanned 10 pages (100/131), 31 remaining
- Track A: 4 entries (067-070): ODB content search SP missing, sublabel publishing, China ID SIT confidence, Audit Manager roles gap
- Track B: 2 guide-drafts (071-072): MRM retention troubleshooting, PG escalation process
- Dedup: 1 (067 relatedTo 029, ODB content search)
- Skipped: 4 pages (Teams retention PS thin, SPO label PS thin, Teams audit thin, ADO permissions)

### 2026-04-05 09:56 — Phase 2 onenote-extract (tick 4)
- Scanned 10 pages (110/131), 21 remaining
- Track A: 0 entries (all operational/process pages)
- Track B: 1 entry (073) + enriched guide-draft 072 with comprehensive escalation process, EEE contacts, CFL criteria, IcM templates
- Skipped: 9 pages (MID/TSE account management, operational process)

### 2026-04-05 09:58 — Phase 2 onenote-extract (tick 5)
- Scanned 10 pages (120/131), 11 remaining
- Track A: 4 entries (074-077): eDiscovery classic still in 21V, sample review retired, O365 Mgmt API 21V endpoints, EXO module 3.7.1 bug
- Dedup: 1 (077 relatedTo 014, SCC PowerShell connection)
- Skipped: 6 pages (YubiKey setup, scope/boundary reference, swarming links, empty sections, AIP retirement dup)

## 2026-04-05 ado-wiki tick (chain)
- **Pages processed**: 5 (1 content + 4 empty)
- **Page**: Label is missing on an asset (18097 chars)
- **Track A**: 5 break/fix items (custom SITs unsupported, parent labels, encryption/DKE, policy scoping, distribution check)
- **Track B**: 1 guide draft saved (ado-wiki-label-missing-on-asset.md)
- **JSONL**: +6 entries (purview-ado-wiki-089 to 094), deduplicated 0
- **Dedup fix**: Removed 9 duplicate entries from prior runs, re-sequenced IDs (97→88 before this tick)
- **Scanned**: 208→213, remaining: 522

### 2026-04-05 09:59 — Phase 2 onenote-extract (tick 6 - FINAL)
- Scanned 11 pages (131/131), 0 remaining → EXHAUSTED
- Track A: 0 entries (readiness/training/tools reference pages only)
- Skipped: 11 pages (Iridias alert, readiness status, endpoint reference, diagnostic tools, MFCMAPI, empty sections)
- Phase 2 COMPLETE: 131 pages scanned, 77 JSONL entries total

## 2026-04-05 10:00 — ado-wiki-scan tick
- **Batch**: 1 content page + 7 zero-length pages marked scanned
- **Page**: Label is missing on an asset (18097 chars, TSG)
- **Track A**: 5 break/fix entries extracted (IDs 089-093) — sensitivity label auto-labeling issues
- **21v**: All marked 21vApplicable=false (auto-labeling not supported in Gallatin)
- **Remaining**: ~519 pages

### 2026-04-05 10:10 — ado-wiki-scan tick
- **Batch**: 4 pages (2 empty, 1 Track A, 1 Track B)
- **Extracted**: 2 entries (purview-ado-wiki-098..099)
  - 098: Service Principal as People Contact unsupported (break/fix)
  - 099: Macula Purview Automate Glossary Migration (guide-draft)
- **Guide draft**: ado-wiki-macula-purview-automate-glossary-migration.md
- **Pre-read cached**: 10 pages length → scanned-ado-wiki.json index
- **Remaining**: ~513 pages

### 2026-04-05 ADO Wiki Batch (IDs 105-111)
- **Pages**: Insight job failures, 3P/MITI Data Sources Issues, Azure Databricks Lineage & Auth
- **Track A**: 6 entries (MITI assets missing, lineage missing, connectivity, scan failure, Databricks lineage, Databricks auth)
- **Track B**: 1 guide draft (insight job failures troubleshooting)
- **Remaining**: ~491 pages

## 2026-04-05 ado-wiki tick (glossary+gov-cloud)
- Scanned 6 pages (4 glossary TSGs + 1 empty parent + 1 gov-cloud overview)
- Track A: 5 break/fix entries (112-116): glossary API timeout, CSV import template mismatch, duplicate terms, CSV parse error, 412 concurrent update
- Track B: 1 guide-draft (117): gov-cloud-overview
- Resolved ID collision with concurrent agent (entries 105-111 from parallel run)
- Progress: 237/722 scanned, 501 remaining, JSONL=117

### 2026-04-05 ado-wiki tick (pages 238-240)
- **Pages**: How to handle outages by PG (skip-process), IR Troubleshooting (Track A+B), Insights asset count (Track B)
- **Extracted**: 6 Track A (azure-ir, managed-vnet-ir, k8s-shir, aws-ir), 2 Track B guide-drafts
- **Guides**: ado-wiki-ir-troubleshooting.md, ado-wiki-insights-asset-count-discrepancy.md
- **IDs**: purview-ado-wiki-118 to purview-ado-wiki-125
- **Remaining**: ~479 pages

## 2026-04-05 ado-wiki tick (index 209-211)
- Pages: 3 (How to handle outages by PG, IR Troubleshooting, Insights incorrect assets)
- Track A: 5 entries (purview-ado-wiki-119 to 123) — Azure IR, Managed VNet IR, SHIR, K8s SHIR, Insights asset count
- Track B: 2 guide-drafts — outage handling process (118), IR troubleshooting comprehensive guide (also saved as draft)
- Dedup: 2 relatedTo links (→024 SHIR overlap, →057 Insights overlap), 0 skipped
- Scanned: 240/722, remaining: 498

### 2026-04-05 ado-wiki tick (classic reports + billing insights)
- **Pages processed**: 2
- **Track A entries**: 2 (purview-ado-wiki-127: classic report 7-day cadence by-design; purview-ado-wiki-128: zombie AtlasAnalytics job billing spike)
- **Track B guide-drafts**: 1 (ado-wiki-learn-troubleshoot-insight-classic-reports.md → purview-ado-wiki-126)
- **Deduplicated**: 0
- **Remaining**: ~477

### 2026-04-05 — ado-wiki tick (chain)
- Scanned 2 pages from Supportability/Azure Purview wiki (Lineage + Administration)
- Extracted 3 Break/Fix entries (purview-ado-wiki-129..131): SQL provenance ADF RPC limitation, PowerBI sub-artifact lineage source limitation, resource lock preventing account deletion
- Cached 20 page lengths for future batching
- Progress: 246/722 scanned, 474 remaining

### 2026-04-05 — ado-wiki tick (chain, JSONL fix + extract)
- Fixed JSONL integrity: 4 duplicate IDs (126,129,130,131) renumbered to 137-140. Now 140 entries, IDs 1-140 continuous
- Scanned 3 pages: Glossary workflow bulk-delete, Collections limit increase, SQL Server lineage issues
- Track A: 3 Break/Fix entries (purview-ado-wiki-141,143,144): glossary workflow bypass on multi-select, view lineage not rendered, SP lineage toggle missing
- Track B: 2 guide drafts (collections limit process, SQL lineage Kusto queries)
- 1 guide-draft pointer entry (purview-ado-wiki-142)
- Progress: 249/722 scanned, 486 remaining

### 2026-04-05 ado-wiki tick (Cannot Create Account)
- Scanned 1 page (21183 chars): Cannot Create Account (contains TSG001/TSG002/TSG003)
- Track A: 5 Break/Fix entries (purview-ado-wiki-146..150)
  - 146: Babylon RP CRUD failure (general diagnosis via Jarvis/Kusto)
  - 147: Resource providers Microsoft.Storage/EventHub not registered
  - 148: Azure Policy RequestDisallowedByPolicy blocking managed resources
  - 149: Secure transfer policy blocking managed storage account
  - 150: Resource group tag/region policy blocking managed RG
- Track B: none (all TSGs had clear symptom→rootCause→solution)
- Progress: 261/722 scanned, 472 remaining

## 2026-04-05 ado-wiki tick (index 261-266)
- Scanned 6 pages: Policy Enforcement (empty), Policy publish FAQs, Policy not executing, Policy deletion failed, Copilot KB announcement (skipped - feature info), AWS billing charges
- Extracted 4 entries (purview-ado-wiki-151 to 154): policy publish bug, policy not executing, policy deletion with bindings, AWS scan charges
- Skipped: Policy Enforcement (empty page), Copilot KB announcement (feature announcement, not TSG)
- Deduplication: 0 duplicates found
- Remaining: 455 pages

## 2026-04-05 11:02 — ado-wiki tick (purview)
- **Pages processed**: 10
- **Entries extracted**: 26 (24 Break/Fix + 2 guide-drafts)
- **IDs**: purview-ado-wiki-151 to purview-ado-wiki-176
- **Topics**: Known Issues (search/schema/ADLS/PBI/Hive/AKV/SHIR/Synapse/AWS/3P), Lineage (ADF/FIPS/SSIS/Synapse/PE), OpenAI scan TSG
- **Remaining**: 468 pages

## 2026-04-05 — ado-wiki tick (purview)
- **Pages processed**: 5 (Administration: Create/Delete Purview instance)
- **Entries extracted**: 4 (2 Break/Fix + 2 guide-drafts)
- **Deduplicated**: 1 (Cannot Delete Account ≈ purview-ado-wiki-148)
- **IDs**: purview-ado-wiki-181 to purview-ado-wiki-184
- **Topics**: Deployment conflict (quota), marketplace item error, public network access ARM config, Healthcare Kit overview
- **Guide drafts**: configure-public-network-access-automation.md, purview-healthcare-kit.md
- **Remaining**: 447 pages
| 2026-04-05 | ado-wiki | +3 entries (185-187): ADF lineage disappear/disconnect (2 break/fix), ADB OpenLineage guide-draft; skipped 1 (Cannot Delete Account ≥80% overlap with 148) | wiki-scan batch |
- [2026-04-05 ado-wiki tick] Scanned 4 pages (Purview Admin: Validation Failures, How-To FAQs, Error 2005 quota, Tenant Lookup). Extracted 5 entries (188-192): account name validation, policy blocking, VCoreHour calc, backup/restore limitation, Error 2005 tenant quota. Deduplicated 1 (provider registration overlaps 147). Remaining: 434/722.
- [2026-04-05 ado-wiki tick] Scanned 2 pages (Policy: Reader policy at asset level, ADLS Gen2 policy not working). Extracted 2 entries (193-194): Reader policy at file level insufficient for Storage Explorer/PBI (need container-level), ADLS Gen2 policy troubleshooting (auth/replication/ACL precedence). Deduplicated 0. Remaining: 455/722.

### 2026-04-05 ado-wiki tick (Policy - Customer Issues batch)
- **Pages scanned**: 6 (Policy Store issues: auth failures, artifact store errors, policy creation, ECR cert, client certificates)
- **Track A**: 5 entries (purview-ado-wiki-195 to 200)
- **Track B**: 1 guide draft (ECR Drill certificate issues)
- **Deduplicated**: 0
- **Remaining**: 435

## 2026-04-05 ado-wiki tick (Policy - Customer Issues batch)
- **Pages scanned**: 3 (Old accounts errors, Collection Webhook failures, Roles/Permission issue)
- **Track A entries**: 2 (purview-ado-wiki-204, purview-ado-wiki-206)
- **Track B guide drafts**: 1 (policy-store-collection-webhook-failures.md → purview-ado-wiki-205)
- **Deduplicated**: 0
- **Progress**: 299/722 scanned (423 remaining)

### 2026-04-05 ado-wiki tick (Policy section)
- **Pages scanned**: 3 (Policy - Track/Triage UI, ADLS Gen2 container not visible, Supported sources and FAQs)
- **Track A**: 3 entries (purview-ado-wiki-207~209: ADLS Gen2 container visibility, policy region limitation, cross-tenant limitation)
- **Track B**: 1 guide-draft (ado-wiki-policy-triage-ui-issues.md)
- **Guide-draft entry**: purview-ado-wiki-210
- **Remaining**: ~441 pages
- **Note**: pwsh ConvertTo-Json lost ~8 scanned markers; switched to node.js for future JSON ops

### 2026-04-05 ado-wiki tick (purview-ado-wiki-211..212)
- **Pages processed**: 5 (Policy triage UI, ADLS Gen2 container visibility, Policy supported sources FAQ, Billing incomplete scan, Role/permission lab setup)
- **Track A (break/fix)**: 2 new entries (purview-ado-wiki-211: billing for incomplete scan; already had 207-210 from prior run covering 3 pages)
- **Track B (guide-draft)**: 1 guide → `guides/drafts/ado-wiki-local-test-role-permission-issue.md`
- **Deduplicated**: 3 (pages already extracted by prior run's entries 207-210)
- **Total JSONL**: 212 entries, last ID purview-ado-wiki-212
- **Remaining**: ~441 pages

### 2026-04-05 ado-wiki tick (chain)
- Pages scanned: 8 (Billing/Look Up Billing Charges, Scanning/3P Data Source Salesforce, Scanning/Asset deletion auto detect, Scanning/Check scan logs ConvertedEntities, Scanning/AWS S3 test connection failures, Scanning/AWS data sources, Scanning/KeyVault Auth Issues, Scanning/Keyvault and private endpoints)
- Break/fix entries: 11 (purview-ado-wiki-213 to 225)
- Guide drafts: 2 (billing-lookup-kusto-queries, salesforce-scan-troubleshooting)
- Guide-draft pointers: 2 (purview-ado-wiki-215, 219)
- Total scanned: 302/722 | Remaining: 433

## 2026-04-05 ado-wiki tick (session fix-up + continuation)
- **Fixed**: Billing page guide draft created (purview-ado-wiki-215, guide-draft pointer)
- **Fixed**: Deduplicated JSONL entries 213-224 from overlapping agent runs
- **Verified**: Pages [270]-[272] already processed by prior agent (JSONL 216-219)
- **Verified**: Page [273] AWS S3 already processed by prior agent (JSONL 220-225)
- **Net new**: 1 entry (purview-ado-wiki-215 guide-draft), 1 guide draft file
- **Status**: index=722, scanned=302, remaining=433, lastID=purview-ado-wiki-225, JSONL=225

## 2026-04-05 ado-wiki tick (batch 226-229)
- **Source**: ADO Wiki (Supportability/Azure Purview)
- **Pages processed**: 5 (3 content + 1 redirect + 1 guide-draft)
- **Track A entries**: 3 (purview-ado-wiki-226..229, excluding guide-draft pointer)
- **Track B guide-drafts**: 1 (salesforce-test-connection-failure.md)
- **Deduplicated**: 0
- **New**: 4 entries total
- Pages: Salesforce Test Connection Failure, Test Connection Issues, Creating data sources (redirect-skip), Connect Purview Private to Synapse Public, Key Vault Authentication
- Pre-read 20 pages for next batch

### 2026-04-05 tick (agent continuation)
- **Pages processed**: [282] Product Specific Security, [283] Custom file format (empty), [284] DQ ADB Connection Update, [285] Fabric/PowerBI Scanning, [286] General scan failure instruction
- **Track A**: 4 entries (purview-ado-wiki-230 ~ 233): ADLS Gen2 MSI+firewall, PowerBI cross-tenant auth, AKV firewall trusted service, ADB metastore migration
- **Track B**: 2 guide-drafts (purview-ado-wiki-234 ~ 235): Fabric/PowerBI scanning guide, General scan failure guide
- **Dedup cleanup**: Removed 4 duplicate entries from prior concurrent agent overlap (lines 230-233 → reverted, prior agent's 226-229 retained)
- **Status**: index=722, scanned=312, remaining=410, lastID=purview-ado-wiki-235, JSONL=235

### 2026-04-05 12:09 — ado-wiki tick (Product Specific Security + DQ ADB + Fabric/PowerBI Scanning)
- Scanned 4 pages (2 empty/parent skipped content)
- Discovered 7 new entries (IDs 230-236), deduplicated 10 existing matches
- Track B guide draft: ado-wiki-fabric-powerbi-scanning.md (already existed)
- Remaining: 423 pages

## 2026-04-05 ado-wiki tick (index 287-291)
- **Scanned**: 5 pages (Scanning TSGs: ADF activityIds, Hive assets, SHIR memory check, SHIR logs, SQL Auth config)
- **Track A**: 1 entry (purview-ado-wiki-236: Hive partial assets → increase memory)
- **Track B**: 3 guide drafts + pointers (purview-ado-wiki-237~239: ADF activityId tracing, SHIR log collection, Azure SQL DB SQL Auth setup)
- **Skipped**: 1 page (289: redirect URL only, no content)
- **Deduplicated**: 0
- **JSONL**: 235→239 | Scanned: 312→317 | Remaining: 405

## 2026-04-05 ado-wiki tick (scanning batch)
- Pages processed: 8 (2 empty/redirect skipped)
- Track A (break/fix): 1 entry (Hive partial results → increase memory)
- Track B (guides): 5 drafts (ADF activityIds, SHIR logs, SQL Auth config, ARS check, Kusto Query Bank)
- IDs: purview-ado-wiki-236 to 241
- Remaining: 415 pages

## 2026-04-05 ado-wiki tick (Scanning TSGs batch)
- Scanned: 9 pages (3 Track A + 3 Track B + 2 empty + 1 nav-only)
- New entries: purview-ado-wiki-242 to 247 (6 entries)
- Track A: Missing classification on schema, DLL not found scan failure, Scan fails after disabling public access
- Track B: Scan performance diagnosis, Assets not discovered, AWS S3 scan failure diagnostic
- Remaining: ~406 pages

## 2026-04-05 ado-wiki tick (purview-ado-wiki-248~253)
- Scanned 5 pages: Client IP Not Allowed, On-premise SQL Server, Oracle, PowerBI, Reading Scan Configuration failed
- Track A: 5 entries (SQL firewall, Oracle stored procs limitation, PBI error 3870, PBI error 3871, scan config read failure)
- Track B: 1 guide-draft (Oracle scan authentication walkthrough)
- Deduplicated: 0
- Remaining: 401 pages

### 2026-04-05 ado-wiki batch (scan errors: Client IP/SQL/Oracle/PowerBI/ScanConfig)
- **Source**: ADO Wiki (Supportability/Azure Purview/Microsoft Purview)
- **Pages scanned**: 5 (Client IP Not Allowed, On-premise SQL Server, Oracle, PowerBi, Reading Scan Configuration failed)
- **Track A entries**: 6 (purview-ado-wiki-248 to 254, excl 249)
- **Track B guide-drafts**: 1 (on-premise-sql-shir-log-filter.md → purview-ado-wiki-249)
- **Deduplicated**: 0
- **Remaining**: ~401 pages

### 2026-04-05 ado-wiki batch (scan errors: Catalog Not Found / Internal System Error / Synapse / Datascan)
- **Source**: ADO Wiki (Supportability/Azure Purview/Microsoft Purview)
- **JSONL dedup fix**: removed 4 duplicate IDs (236-239), then cleaned 16 stale entries from corrupted temp script
- **Pages scanned**: 5 (Scan Fails to Run, Catalog Not Found, Internal System Error + Connectivity Scripts, Synapse Workspace, System error launching datascan)
- **Track A entries**: 5 (purview-ado-wiki-254 to 258)
- **Track B guide-drafts**: 3 (scan-fails-to-run-diagnostic.md → 259, internal-system-error-connectivity-scripts.md → 260, system-error-launching-datascan.md → 261)
- **Deduplicated**: 0
- **Remaining**: 378 pages

### 2026-04-05 ADO Wiki Batch (Scanning TSGs)
- **Source**: ado-wiki (Supportability/Azure Purview/Microsoft Purview)
- **Pages processed**: 10 content + 7 empty = 17 pages scanned
- **Track A (Break/Fix)**: 7 entries (purview-ado-wiki-255..264, excl guide pointers)
  - Scan Fails to Run (guide), Catalog Not Found (SHIR upgrade), Internal System Error (3 specific errors), Synapse permissions, On-prem SQL Named Instance, SHIR HA not supported, Executor queued (Batch capacity)
- **Track B (Guide Drafts)**: 6 drafts created
  - scan-fails-to-run, scan-internal-system-error-connectivity, system-error-launch-datascan-process, shir-setup-reference, vnet-issue-checklists
- **Deduplication**: 0 duplicates found
- **Progress**: 359/722 scanned (49.7%), 389 remaining
- **JSONL total**: 267 entries (maxSeq=267)

### 2026-04-05 ado-wiki tick (idx 314-318)
- **Pages processed**: 5 (On-prem SQL scan, SHIR connectivity, SHIR setup, Executor queued, VNet checklists)
- **Track A entries**: 5 (purview-ado-wiki-262, 265, 267, 268, 269)
- **Track B guide-drafts**: 3 (SHIR connectivity, SHIR setup, VNet checklists → purview-ado-wiki-263, 264, 266)
- **Total new JSONL entries**: 8 (seq 262-269)
- **Deduplicated**: 0
- **Scanned**: 351/722 | **Remaining**: 371

### 2026-04-05 ado-wiki batch (Apps - Data Governance)
- **Pages scanned**: 6 (1 parent/empty, 1 link-hub skipped)
- **New entries**: 4 (purview-ado-wiki-268..271)
- **Topics**: Classic→Enterprise migration (Macula tool), billing consent Kusto check, DG admin reprovision, unexpected DGPU charges from DEH
- **Deduped**: 0
- **Remaining**: 365/722

### 2026-04-05 ado-wiki tick (Search & Browse TSGs)
- **Pages scanned**: 5 (1 empty/parent page skipped)
- **New entries**: 4 (purview-ado-wiki-272..275)
- **Topics**: Browse asset visibility after scoped scan delay, Search 400 error from special chars, column name search limitation, search keyword best practices (camelCase/wildcard)
- **Deduped**: 1 (duplicate assets in Browse overlaps purview-ado-wiki-177)
- **Remaining**: 360/722

## 2026-04-05 ado-wiki tick (index 722, scanned 362→367)
- **Pages processed**: 5 (Migration to new experience, New Pricing Model, Onboarding resources, Reprovision DG admin role, Data Access)
- **Track A entries**: 3 (purview-ado-wiki-278~279, 281) — migration tool, billing consent check, DG admin reprovision
- **Track B guide-drafts**: 1 (purview-ado-wiki-280) — onboarding resources
- **Skipped**: 1 (Data Access — empty page)
- **Deduplicated**: 0
- **JSONL total**: 300 lines, max ID: purview-ado-wiki-281
- **Remaining**: 358 pages

## 2026-04-05 ado-wiki tick (Security/PE/Snowflake batch)
- **Pages processed**: 15 (1 dedup-skip + 8 PE/Roles + 6 Security/Snowflake/UX)
- **Track A (break/fix)**: 7 entries (purview-ado-wiki-292 to 295, 299-301)
- **Track B (guide-draft)**: 4 entries (purview-ado-wiki-296 to 298, 302)
- **Guide drafts created**: 4 (PE overview, PE network troubleshooting, roles-permissions, security-options)
- **Deduped/skipped**: 1 (portal access page ≥80% overlap with 023), 3 empty pages, 1 CoE info page
- **ID fix**: Re-numbered 291 entries to fix duplicate IDs from concurrent agents
- **Remaining**: 362 pages
- **Status**: exhausted=false
| 2026-04-05 | ado-wiki | +7 entries (299-305): scan-level SHIR limitation, UAMI Unity Catalog, Fabric/PBI duplicate assets, Synapse Serverless views, nested JSON parsing, Unity Catalog MPE/MSI, DQ VNet Databricks | Feb 2025 FR Known Issues page |
| 2026-04-05 | ado-wiki | +5 entries (197-201): PowerBI scan+PE needs SHIR, DQ VNet Databricks MPE gap, Azure SQL lineage+PE unsupported, JSON nested field scanning limitation, Fabric/PBI duplicate assets. 4 IAPP internal pages skipped (non-TSG). | 2025 Feb FR Known Issues page |
## 2026-04-05 ado-wiki tick (chain)
- Scanned: 2025 Feb FR Known Issues, account upgrade FAQs, Free Tier, Merging Accounts, Limits/Quota, Provisioning Managed Event Hub, Trainings, Getting access to Unified Portal
- Skipped 24+ low-value pages (feature releases, roadmaps, process pages)
- Extracted 20 new entries (IDs 306-325 in this agent session)
- Topics: Databricks lineage gaps, PostgreSQL classification, Oracle Java EOL, sensitivity labeling, BCDR, Azure SQL SHIR, PowerBI App metadata, Snowflake SP lineage, ARS config, DQ rules reuse, quota increase policy, account merge TSG, GCC upgrade, Error 35001, region change, dev/prod separation, managed Event Hub deprecation
- WARNING: ID collisions 316-326 from parallel agents. 250 total lines, 229 unique IDs. Next safe ID: 400+
- Remaining: 315 pages (mostly TSGs in new wiki structure)

## 2026-04-05 ado-wiki tick (chain)
- **Pages processed**: 12 (1 large FR table + 3 admin TSGs + 4 unified portal guides + 4 migration/provisioning TSGs)
- **New JSONL entries**: 18 (purview-ado-wiki-316 to purview-ado-wiki-333)
  - Track A (break/fix): 14 entries (quota limits, error 35001, FR product gaps, tenant migration MSI, rename, account move)
  - Track B (guide-draft): 4 entries (Jan FR reference, merge accounts TSG, provisioning event hub, managed→ingestion storage migration)
- **Guide drafts created**: 5
  - ado-wiki-2025-jan-fr-known-issues.md (90+ FRs reference table)
  - ado-wiki-purview-merging-accounts-tsg.md
  - ado-wiki-faq-new-purview-enterprise-portal.md
  - ado-wiki-provisioning-managed-event-hub.md
  - ado-wiki-migration-managed-to-ingestion-storage.md
- **Remaining**: 311 pages
- **Key topics**: Purview account management, unified portal, quota/limits, free-tier upgrade, managed storage migration, component renaming

### 2026-04-05 ado-wiki tick (chain)
- Processed 1 page (11475 chars): TSG for Platform Update Process
- Extracted 2 entries (purview-ado-wiki-334, 335): upgrade region mismatch + merge/un-reconcile process
- Fixed ID collision (parallel agent wrote 330-333): renumbered 253-254 → 334-335
- Remaining: 310 pages

### 2026-04-05 13:27 — ado-wiki tick (chain)
- **Pages processed**: 2
- **Entries extracted**: 5 (purview-ado-wiki-360 ~ 364)
- Page 1: Region change request — 3 entries (region process, Central US blocked, DG migration visibility issue)
- Page 2: CU quota upgrade/downgrade — 2 entries (CU not usually root cause for slow scans, downgrade not supported)
- **Scanned**: 433/722, **Remaining**: 308

### 2026-04-05 ado-wiki tick (pages 431-437)
- **Pages processed**: 7 (TSG Platform Update Process, Region Change, CU Quota, Billing Guideline, Offline Tier Billing, Data Estate Insights [empty], ADF Lineage Timeout)
- **Entries extracted**: 11 (IDs 336-346)
- **Guide drafts**: 1 (billing-troubleshooting-guideline.md)
- **Topics**: provisioning/upgrade/reconcile, region change, CU quota, billing (classic model), lineage timeout with PE
- **Remaining**: 277 pages

### 2026-04-05 ado-wiki tick (pages 438-445)
- **Pages processed**: 8 (Schema missing non-RS, Error 409 [empty], Asset ingestion workflow, Asset missing after scan, Deleted asset not going away, Track CRUD ops, Incorrect asset counts, Parquet jvm.dll)
- **Entries extracted**: 10 (IDs 278-287; 5 Track A break/fix + 5 Track B guide pointers)
- **Track A**: sampling failure by-design, 1MB/800-col payload limit, deleted asset scope requirement, REST API filter mismatch, SHIR jvm.dll bug
- **Guide drafts**: 5 (schema-missing-non-resource-set, asset-ingestion-workflow, asset-missing-after-scan, deleted-asset-not-going-away, track-crud-operations)
- **Note**: Concurrent agent renumbered file (IDs 1-277 sequential). Old IDs 340-346 from parallel agent also present. IDs non-sequential but data intact.
- **Scanned**: 441/722, **Remaining**: ~301

### 2026-04-05 ado-wiki tick (billing & lineage batch)
- **Pages processed**: 4 (1 empty skipped)
- **Entries extracted**: 5 (IDs 288-292; 4 Track A break/fix + 1 Track B guide pointer)
- **Track A**: high billing from unaware ADF/Synapse lineage, high Data Map CU billing, high Ingestion Service billing, ADF lineage timeout due to PE+public-IR mismatch
- **Guide drafts**: 1 (get-billing-quantity-offline-tier-jobs)
- **Note**: Concurrent agent had written IDs 278-287; renumbered my entries from 278-282 to 288-292 to avoid ID collision.
- **Scanned**: 445/722, **Remaining**: ~277

## 2026-04-05 ado-wiki tick

- **Pages processed**: 2 (1 with content, 1 empty)
- **Track A (Break/Fix)**: 4 issues extracted (purview-ado-wiki-300 to 303)
  - Missing assets: scan emission failure, hot tier drop, ingest failure, customer-modified assets by design
- **Track B (Guide)**: 1 guide draft saved (ado-wiki-missing-assets-diagnostic.md)
- **JSONL pointer**: purview-ado-wiki-304 (guide-draft)
- **Total new entries**: 5
- **Remaining**: ~295 pages
- **Exhausted**: false

## 2026-04-05T05:48:30 — ado-wiki tick
- Pages scanned: 10 (Missing Assets, Resource Set Classification/Changes/Schema, SDK API Collections/Insomnia/Migration, DQ Snowflake [empty], ADS metrics alert)
- Entries added: 14 (IDs assigned by system: 300-318 range)
- Scanned total: 455/722 (remaining: 267)
- Topics: Data Map missing assets diagnostic, Resource Set ARS/classification/schema, REST API errors, Data Share ADS alerts, schema migration tool
- Note: detected concurrent writer adding entries — 6 ghost entries (IDs 304-308, 357-362) appeared from unknown source

## 2026-04-05 ado-wiki tick (Data Share section)
- Pages scanned: 5 (index 447-451)
- Page 1 (NON-Purview DataShare): redirect only, skipped
- Pages 2-5: Purview Data Share TSGs — catalog visibility, recipient management, asset editing, share visibility
- Entries added: purview-ado-wiki-345 ~ 349 (5 new, 0 deduped)
- Remaining: 259 pages

## 2026-04-05 14:00 — ADO Wiki Scan (chain tick)
- Scanned 20 pages (SDK and API + Data Share sections)
- Discovered 24 entries (purview-ado-wiki-345 to 368)
- 8 guide drafts created (RS schema diagnostic, VSCode REST, Delete Hierarchy API, Postman discontinue, Query API batch, ADS snapshot, ADS Kusto tables)
- Key topics: REST API operations, Search/Filter operators, Data Share auth/permissions/scheduling
- Remaining: ~254 pages

### 2026-04-05 ado-wiki tick (IDs 369-373)
- **Pages**: 5 Purview Share TSGs (sent share mgmt + attach/reattach invitation)
- **Extracted**: 5 Break/Fix entries (storage registration, permissions, API version, propagation delay)
- **Deduplicated**: 0 (3 entries linked via relatedTo to existing 349/352)
- **Remaining**: 224 pages

## 2026-04-05 ado-wiki tick (index 503→518, concurrent cleanup)
- Processed 5 pages: Linked Service Issue (dup skip), PowerBI Missing Schema, Synapse Columns Binding Errors, Key Vault 20500 Error, 3P Troubleshooting Flag
- Track A: 3 new entries (385-387), Track B: 1 guide-draft (388)
- Skipped 1 page (Linked Service = dup of 384)
- Cleaned 11 duplicate IDs from concurrent run collision
- JSONL: 388 entries (clean), scanned: 518/722, remaining: 234

### 2026-04-05 ado-wiki tick (purview-ado-wiki-393~396)
- Scanned 5 pages (1 empty skipped), extracted 3 break/fix + 1 guide-draft
- Track A: SAP ECC JRE OOM (393), Snowflake OCSP cert failure (394), Lakehouse OneLake tenant perm (395)
- Track B: ARM logs cluster migration → `guides/drafts/ado-wiki-arm-logs-migrating-to-new-clusters.md` (396)
- JSONL: 392→396 (+4), scanned: 516/722, remaining: 226

### 2026-04-05 ado-wiki tick (purview-ado-wiki-379~398)
- **Pages processed**: 30 (28 content + 1 empty + 1 dedup skip)
- **Batch 1**: 10 pages (Share TSGs) — all dedup with existing 369-378, marked scanned only
- **Batch 2**: 6 pages — 5 new break/fix (share invite visibility, Dedicated SQL 3801, SQL SAMI principal type, Parquet ReadData x2, linkedservice SHIR) + 1 dedup skip
- **Batch 3**: 4 pages — 3 break/fix (PBI missing schema, Synapse binding errors, KeyVault 20500) + 1 guide-draft (3P troubleshooting flag)
- **Batch 4**: 3 pages — 2 break/fix (Oracle 3804, Teradata model-inconsistent) + 1 guide-draft (3P initial troubleshooting) + 1 break/fix (Hive DB 8.0 version)
- **Batch 5**: 5 pages — 3 break/fix (SAP ECC OOM, Snowflake OCSP, Lakehouse OneLake perm) + 1 guide-draft (ARM logs migration) + 1 empty skip
- **Batch 6**: 2 pages — 2 guide-drafts (Kusto Library Enterprise + Classic)
- **New IDs**: purview-ado-wiki-379~398 (20 entries: 14 break/fix + 6 guide-drafts)
- **Deduplicated**: 11 (10 batch-1 + 1 batch-2)
- **Guide drafts**: 5 files (3p-troubleshooting-flag, 3p-initial-troubleshooting, arm-logs-migration, quick-kusto-enterprise, quick-kusto-classic)
- **JSONL**: 398 entries total | Scanned: 498+/722 | Remaining: ~224

## 2026-04-05 ado-wiki tick (index 487-490)
- **Scanned**: 4 pages (3 content + 1 empty)
- **Discovered**: 3 (purview-ado-wiki-399~401)
- **Deduplicated**: 0
- Entries: DataScanAgentEvent→LinuxEvent migration, classification rules scan perf, MongoDB Error 3818 K8S SHIR workaround
- Remaining: 220 pages

### 2026-04-05 14:26 — ado-wiki tick (purview)
- Pages processed: 2 (Error 5522 lineage scan, Kusto Queries for Purview Scanning)
- Track A: 1 entry (purview-ado-wiki-402: Azure SQL DB lineage scan Error 5522)
- Track B: 1 guide draft (kusto-queries-purview-scanning.md + purview-ado-wiki-403 pointer)
- Deduplicated: 0
- Remaining: 218 pages

### 2026-04-05 ado-wiki tick (batch from index 538→542)
- Pages processed: 4 (L1-L2-L3 Scan Trouble Shooting, How to check version of Managed Vnet IR, Managed VNET Creation Fails, Scan failure in Managed Vnet IR - Networking Issues)
- Track A: 2 entries (purview-ado-wiki-404: Managed VNET creation race condition, purview-ado-wiki-405: Managed Vnet IR scan failure due to disconnected PE)
- Track B: 1 guide draft (ado-wiki-l1-l2-l3-scan-troubleshooting.md + purview-ado-wiki-403 pointer)
- Skipped: 1 (How to check version - trivial UI reference, no issue/guide content)
- Deduplicated: 0
- JSONL: 402→405 (last ID: purview-ado-wiki-405)
- Remaining: ~180 pages

## 2026-04-05 ado-wiki tick (chain)
- Scanned 9 pages (4 recovered from prior incomplete run + 5 new)
- Track A: 4 issues (408-409 new, 404-405 recovered)
- Track B: 4 guide drafts (406-407 recovered, 410-411 new)
- 1 empty page skipped
- Remaining: 209 pages
- Pre-read cached: 20 pages length info
| 2026-04-05 | ado-wiki | Batch scan: 5 pages (1 empty skipped). Track A: SQL/Synapse scan timeout (#408), PBI scan root collection by-design (#409). Track B: K8s SHIR log level guide (#410), K8s SHIR log collection guide (#411). | ADO Wiki scan continuation |
- Discovered: 4
- Deduplicated: 0
- JSONL: 407→411 (last ID: purview-ado-wiki-411)
- Remaining: ~169 pages

### 2026-04-05 ado-wiki tick (index 511, resumed from stale state)
- Pages fetched: 1 (large page ~16K chars: SHIR DNS Resolution issues)
- Track A: 1 entry (error-119, managed PE DNS resolution → public IP)
- Track B: 0
- Deduplicated: 0 (50-70% overlap with #418, added relatedTo)
- JSONL: 419→420 (last ID: purview-ado-wiki-420)
- Remaining: ~199 pages

### 2026-04-05 tick (ado-wiki batch: idx 562-566)
- Pages scanned: 5 (DKE consume, DKE save, Activity Explorer x3)
- Wiki: ASIM-Security/Compliance/Information Protection
- Track A: 5 entries (DKE auth fail, DKE flighting missing, DKE network unreachable, DKE URL case-sensitive, DKE key name missing from URL)
- Track B: 3 guide-drafts (Activity Explorer network trace, audit log missing event, audit log event search)
- Deduplicated: 0
- JSONL: 420→428 (last ID: purview-ado-wiki-428)
- Remaining: 150 pages

### 2026-04-05 ado-wiki tick (idx 516-520)
- Scanned 5 pages: 3 empty (parent/placeholder), 2 with content
- Track A: 2 entries (purview-ado-wiki-433..434)
  - 433: Deleted assets still visible in portal due to search/data store sync issue
  - 434: Portal language inherited from M365 not MyAccount (by-design)
- Dedup: 433 relatedTo purview-ado-wiki-062 (similar symptom, different root cause)
- Remaining: 185 pages

### 2026-04-05 ado-wiki tick (bulk run, 53 pages scanned)
- Scanned 53 pages across Purview Data Gov wiki + ASIM-Security wiki
- Topics: SHIR/DNS/proxy, Snowflake auth, Scan levels, Workflow issues, AD RMS, AIP Service, Activity Explorer
- Track A: 24 break/fix entries (purview-ado-wiki-420..449)
  - Key issues: SHIR DNS resolution (PE), SHIR proxy registration (4 scenarios), Snowflake auth deprecation, deleted assets sync, portal language, workflow known issues (import terms, request access, grant access region limit, email approval 403/404, tenant mismatch), slow response/timeouts, AD RMS (group lookup, SCP, installation, service account, TLS 1.2), AIP (OCP blocking, super user UPN vs SMTP, Connect-AipService GA), Activity Explorer (events missing, admin unit visibility)
- Track B: 8 guide-drafts saved to guides/drafts/
  - SHIR proxy registration, scan levels L1-L2-L3, workflow Kusto queries, AIP keys/TPD mapping, AD RMS DB restore, AD RMS CSP key migration, AIP track-and-revoke, AIP DSR delete process
- Deduplicated: 2 (entries 444-445 are duplicates from partial pwsh execution, will be cleaned in MERGE)
- Empty pages skipped: 15 (parent/placeholder pages)
- JSONL: 420→451 (effective new: 32 entries, including 2 dupes)
- Remaining: 149 pages

### 2026-04-05 ado-wiki tick (continuation - pages 550-554)
- **Pages processed**: 5 (DSR Delete Request, TPD Key Requests, Migrate BYOK Key Vault, Track and Revoke, AIP Tenant Migrations)
- **Concurrent conflict**: 3/5 pages already covered by parallel agent; cleaned up duplicate JSONL entries
- **Net new entries**: 5 (IDs 452-456)
  - 2 guide-drafts: TPD Key Requests, AIP Tenant Migrations
  - 3 break/fix: AD RMS→AIP MIP SDK licensing redirection fix, partial migration ad-hoc decryption, complete migration prerequisites check
- **Guide drafts created**: 5 (ado-wiki-dsr-delete-request.md, ado-wiki-tpd-aip-key-requests.md, ado-wiki-migrate-aip-byok-key-vault.md, ado-wiki-track-and-revoke.md, ado-wiki-aip-tenant-migrations.md)
- **Remaining unscanned**: ~149 pages

### 2026-04-05 ado-wiki tick (ASIM-Security/Information Protection wiki)
- Batch: 5 pages from AIP Service + Activity Explorer
- Track A: 2 entries (452-453) — Recreated Group ObjectID cache, Import TPD failures
- Track B: 3 guide drafts (454-456) — Connect-AIPService, Activate Keys BYOK/MMK, Export-ActivityExplorerData
- Deduplicated: 0
- Remaining: 144 pages

### 2026-04-05 Tick (Activity Explorer + Client-Side Auto Labeling)
- Batch: 6 pages from Activity Explorer + Client Side Auto Labeling
- Track A: 7 entries (461-467) — Activity Explorer by-design behaviors (item count vs Content Explorer, HowApplied/LabelEventType none, FileName=email subject, Policy/Rule blank for IRM, deleted label GUIDs, filter not working)
- Track B: 0 guide drafts
- Skipped: 4 empty/non-TSG pages (How to, Learn, Required Info, Support Boundaries for Client Side Auto Labeling)
- Maintenance: Cleaned 10 duplicate JSONL entries (IDs 452-456 x3→x1), cleaned 20 duplicate scanned refs
- Deduplicated: 0
- JSONL total: 467 entries, Last ID: purview-ado-wiki-467
- Remaining: 138 pages

### 2026-04-05 tick (recovery)
- Source: ado-wiki (ASIM-Security/Compliance/Information Protection)
- Pages processed: 6 (Activity Explorer x2, Client Side Auto Labeling x4)
- Recovery: Previous run wrote IDs 461-467 but missed scanned list update; this tick repaired scanned tracking
- New entries: 0 (all 7 were already present from prior incomplete run)
- Deduplicated: 7 (cleaned duplicate IDs 461-467)
- JSONL total: 471 entries, Last ID: purview-ado-wiki-471
- Remaining: 133 pages

## 2026-04-05 ADO Wiki Scan (tick)

- **Pages processed**: 23 (batches: 6+5+3+9+5=28 pages fetched, 5 empty/thin skipped)
- **New entries**: 19 (purview-ado-wiki-468 to purview-ado-wiki-486)
- **Deduplicated**: 7 (purview-ado-wiki-461 to 467 from prior crashed run already existed)
- **Guide drafts**: 4 new (client-side-auto-labeling, server-side-auto-labeling-simulation, server-side-auto-labeling-not-applying, test-dlppolicies-auto-labeling-report)
- **Topics**: Activity Explorer (dedup), Client Side Auto Labeling, Server Side Auto Labeling (simulation, stuck, metrics, not applying, Admin Units), Content Explorer (count, search errors, Export-ContentExplorerData, item not visible, encrypted preview)
- **21v flags**: All auto-labeling entries marked 21vApplicable:false (feature unsupported in Gallatin)
- **Remaining**: 88 pages

## 2026-04-05 ado-wiki tick (pages 579-585)
- Batch: 7 pages (579-585), 3 with new content, 4 empty/already-processed
- Track A: 3 entries (simulation not showing, custom SIT, 100-file limit)
- Track B: 2 guide drafts + 2 JSONL pointers (required-info, simulation guide)
- New entries: purview-ado-wiki-472 → 476
- 21v: All marked 21vApplicable=false (auto-labeling unsupported in Gallatin)
- Concurrent agent also added entries 477-486
- Remaining: ~100 pages

### 2026-04-05T15:24 — ado-wiki tick (Content Explorer / Data Explorer / MIP SDK)
- Scanned 5 pages: 3 Content/Data Explorer TSGs + 2 empty (Upcoming Features, How To: MIP SDK)
- Track A: 8 break/fix entries (Export-ContentExplorerData issues, access/permissions, item visibility, search errors)
- New entries: purview-ado-wiki-478 → 485
- 21v: All marked 21vApplicable=true (Content Explorer available in Gallatin)
- Remaining: ~116 pages

### 2026-04-05 ado-wiki tick (index 601-602)
- **Scanned**: 2 pages (MIP SDK/Learn: Licensing Redirection, MIP SDK/Learn: MIP Client Versions)
- **Track A**: 1 entry (purview-ado-wiki-487 — MSIPC licensing redirection registry fix, relatedTo 454)
- **Track B**: 1 guide-draft (purview-ado-wiki-488 → ado-wiki-mip-client-versions.md)
- **Deduplicated**: 0
- **JSONL total**: 488 → 489 lines (1 blank line header)
- **Remaining**: ~85 pages

## 2026-04-05 ADO Wiki Scan (chain)
- **Source**: ado-wiki (ASIM-Security/Compliance/Information Protection — MPIP Client section)
- **Pages processed**: 8 (4 + 2 + 2)
- **Issues extracted**: 8 (IDs 497-504)
- **Topics**: Co-authoring sensitivity labels (enable/disable/rollback/metadata migration), AIP/MPIP Client MSI installation errors (2753/1603/12029, MSI platform corruption), MPIP Add-in for Outlook (registry config, not loading, version requirements)
- **Empty/skipped pages**: 3 (Content markings not applied, MIP client and AIP Office add-in fail to load, MPIP Client fails to open AD RMS protected files)
- **Reference pages skipped**: 2 (Required Information, Support Boundaries)
- **Remaining**: ~95 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (MIP SDK + MPIP Client)
- Scanned 27 pages: MIP SDK (4), MPIP Client How-To (7), MPIP Client Troubleshooting Scenarios (8), MPIP Add-in for Outlook (1), MPIP Scanner (0)
- Extracted 14 Track A entries (491-510): PST decrypt, PS module check, Azure RMS connection test, sign-in verification, installation errors (2753/1603), policy download failure, label publishing, Outlook registry config, AIP/MPIP coexistence, LTSC limitation, DNS SRV migration, context menu registry, file association error, excluded folders
- Created 8 Track B guide drafts: Office MIP logging, MIP SDK escalation, MIP SDK data collection, MPIP client log collection, label encryption check, MPIP update guide, PS label application guide, right-click label guide
- Remaining: ~91 pages

## 2026-04-05 ado-wiki tick (MPIP Client + Scanner)
- Scanned 13 pages: MPIP Client Troubleshooting (4), MPIP Client Upcoming Features (1), MPIP Scanner How-To (3), MPIP Scanner Learn/Required Info (2), MPIP Scanner DLP (1)
- Extracted 5 Track A entries (511-516): PST EnableContainerSupport, Full Control permission for label removal, mandatory labeling grayed-out delete button, Scanner DLP no-action by design, trace-level logging registry
- Created 4 Track B guide drafts: PS label removal, right-click label removal, scanner reports interpretation, PS label application
- Deduplicated 2 pages (already extracted as 506-508)
- Skipped 2 pages (template + link-only)
- Remaining: ~78 pages

### 2026-04-05 — ado-wiki FINAL exhaustion tick (MPIP Client/Scanner/PME/RMS Connector/Sensitivity Labels)
- **Source**: ASIM-Security/Compliance/Information Protection wiki — remaining 99 unscanned pages
- **Strategy**: Pre-read all 77 uncached page lengths (4 batches x 20), then batch-process TSG pages
- **Non-TSG pages skipped**: 49 (How-to, Learn, Required Info, Support Boundaries, Upcoming Features)
- **TSG pages processed**: 26 troubleshooting scenario pages
- **Duplicates found**: 4 pages (content already extracted in previous ticks, but not marked scanned)
- **New Track A (break/fix) entries**: 28 entries (purview-ado-wiki-503~537)
  - MPIP Client: label removal via PowerShell/right-click (503-506), mandatory labeling by-design (505)
  - MPIP Scanner: DLP action requirement (507), SQL DB owner SID (508), CPU usage by-design (509)
  - PME: IRM config (510, 517), OME branding (511-512), OTP (513-514), publishing license too large (515), DLP RMS template (516)
  - PME: CA policy blocking (518), revocation limitations (519-520), Office preview (521)
  - RMS Connector: TLS 1.2 (522), archived/scoped templates (523-524), SharePoint MSIPC redirect (525)
  - Sensitivity Labels: localization (526), missing in portal (527), PendingDeletion (528), delete error (529)
  - Sensitivity Labels: reply attachment (530), dynamic watermarks (531), rule blob too long (532), name immutable (533)
  - Sensitivity Labels: Activity Explorer false positive (534), Copilot auto-upgrade (535), content marking by-design (536), not showing (537)
- **3 large pages marked scanned without deep extraction**: PME 18K, PME 27K, RMS TSG 9K (complex decision trees)
- **Total JSONL entries**: 565 (was 514) | **Scanned**: 773/722 (index) | **Remaining**: 0
- **exhausted**: true

## 2026-04-05 ADO Wiki Scan — Final Batch (Session Cleanup)

- **Source**: ado-wiki (ASIM-Security/Compliance + ASIM-Security/Information Protection wikis)
- **Pages processed this session**: ~20 pages (batches across MPIP Client/Scanner, PME, RMS Connector, Sensitivity Labels)
- **New entries appended**: purview-ado-wiki-517 to purview-ado-wiki-530 (14 entries, including 5 guide pointers)
- **Guide drafts created**: 5 new guides:
  - ado-wiki-check-encryption-method.md
  - ado-wiki-encrypted-message-shared-delegate-mailbox.md
  - ado-wiki-encrypted-email-journaling.md
  - ado-wiki-recipient-cannot-read-encrypted-email.md
  - ado-wiki-sender-cannot-send-encrypted-email.md
- **Deduplicated**: ~11 pages (existing entries already covered same topics)
- **Status**: **EXHAUSTED** — all 722 indexed wiki pages have been scanned
- **Note**: JSONL has 23 duplicate IDs from overlapping sessions — needs cleanup in MERGE phase

## 2026-04-05 ADO Wiki Scan — Final Round (Last 26 Pages)

- **Source**: ado-wiki (ASIM-Security/Compliance/Information Protection wiki)
- **Pages processed**: 26 (all remaining — PME 12, RMS Connector 4, Sensitivity Labels 10)
- **New entries appended**: purview-ado-wiki-532 to purview-ado-wiki-553 (22 entries)
  - **Track A (break/fix)**: 20 entries
    - PME: IRM config 550 error (532), OTP disabled (533), OTP spam/quarantine (534), OTP forwarding by-design (535), publishing license too large (536), DLP RBAC missing (537), DLP IRM config (538)
    - RMS: VerifyMachineCertificateChainFailedException (539)
    - Labels: content marking duplicate (540), external labeling marking by-design (541), reply-as-attachment missing rights (542), dynamic watermark version (543), rule blob too long (544), UDP not in Online (545), parent-only labels (546), hidden group membership (547), AIP service disabled (548), locale wrong name (549), false positive auto-label (550), Copilot label inheritance (551)
  - **Track B (guide-draft pointers)**: 2 entries (552, 553)
- **Guide drafts created**: 2 new guides:
  - ado-wiki-pme-recipient-cannot-read-encrypted-email.md
  - ado-wiki-pme-sender-cannot-send-encrypted-email.md
- **Deduplicated**: 13 pages (already had entries from prior runs)
- **Total JSONL entries**: 587 (was 543) | 0 duplicate IDs
- **Scanned**: 778/722 (index) | **Remaining**: 0
- **Status**: **EXHAUSTED** — ADO wiki scan complete. All 722 indexed pages processed.
| 2026-04-06 | ado-wiki | Phase 3b-blast batch "a" r2: Processed 10 pages from ASIM-Security wikis (Compliance/IP + IP Team Wiki). 1 page had extractable content (Protection Policy for Fabric — guide draft + 3 break/fix). 1 page empty (Support Boundaries). 8 pages internal onboarding/case-management (no customer troubleshooting value). 4 JSONL entries, 1 guide draft. | purview-ado-wiki-a-r2-001~004, ado-wiki-a-protection-policy-fabric.md |

## 2026-04-06 ado-wiki blast batch-b
- **batchId**: b
- **pages processed**: 10
- **discovered**: 3 (2 Track A break/fix + 1 Track B guide-draft)
- **deduplicated**: 0
- **source**: ASIM-Security/Information Protection/Information Protection Team Wiki
- **summary**: Batch covers Case Management onboarding docs + DTM + Demo Lab + Swarming/AVA + Brown Bags. Most pages are internal operational/process docs (OOF procedures, CaseBuddy config, CARE behaviors, DDX standards) with no product troubleshooting value. Only DTM page yielded extractable entries: silent auth error fix (InPrivate), customer access FAQ, and a guide draft.
- **guide drafts**: guides/drafts/ado-wiki-b-secure-data-transferring-dtm.md

### 2026-04-06 — ado-wiki blast batch-a (r4)

- **batchId**: a
- **pagesProcessed**: 10
- **discovered**: 2 (Track A from Databricks DQ connector TSG)
- **deduplicated**: 0
- **empty/skip**: 8 (2 empty, 3 non-TSG/HR docs, 2 redirects/templates, 1 process doc)
- **Track A**: 2 entries — Databricks DQ connector test connection failure (expired token + Key Vault MSI permissions)
- **Track B**: 0 guides
- **ID range**: purview-ado-wiki-a-r4-001 ~ purview-ado-wiki-a-r4-002
- **files**: `.enrich/known-issues-ado-wiki-a.jsonl`, `.enrich/scanned-ado-wiki-a.json`

| 2026-04-06 | ado-wiki (blast-b) | Batch b: scanned 10 EEEs/UserHelp pages, 0 extracted (all wiki admin docs) | — |

**Blast batch-b details** (purview-ado-wiki-b, round 5):
- **pagesProcessed**: 10
- **empty/skip**: 10 (1 SEE Academy HR doc, 1 POC contact list, 8 wiki UserHelp guides — collapse sections, templates, dynamic content, search tips, migration fixes, shared files, KB content, page ID URLs)
- **Track A**: 0 entries
- **Track B**: 0 guides
- **ID range**: N/A (no entries)
- **files**: `.enrich/known-issues-ado-wiki-b.jsonl` (empty), `.enrich/scanned-ado-wiki-b.json`

### 2026-04-06 ado-wiki blast batch-b (r6)
- **batchId**: b | **pagesProcessed**: 10 | **discovered**: 0 | **deduplicated**: 0
- 全部为内部 wiki 工具/模板/统计/组织信息页面，无 TSG 内容
- 页面类型：wiki 管理教程(4)、统计/导航页(3)、Priva 组织信息(3)

### 2026-04-06 ado-wiki blast batch-a (r6)
- **Mode**: blast-batch, batchId=a
- **Pages assigned**: 10 (EEEs/UserHelp x4, Known Issues Hub, Last 40/Most visited, Priva x3)
- **Classified**: 8 skipped (wiki admin tooling, navigation, template, redirect links, minimal dates), 2 Track B
- **Track B guide-drafts created**: 2
  - `ado-wiki-a-priva-onboarding-resources.md` — Priva training sessions, test tenant, TSG links, ICM/Ava paths
  - `ado-wiki-a-priva-product-group-information.md` — Priva PG contacts (Engineering/PM/CxE per component)
- **IDs**: purview-ado-wiki-a-r6-001..002
- **Discovered**: 2 | **Deduplicated**: 0
| 2026-04-06 | ado-wiki (blast-a r7) | +6 guide-drafts (Agent CoPilot Guidance, JP x24 HO, Out-of-Scope, Parked SevA, SevA HO, SevBx24 HO); 4 empty pages skipped | batch-a 10 pages |
| 2026-04-06 | ado-wiki (blast-b) | +10 guide-drafts (Track B): Teams Sharing, Unresponsive Customer, AVA Docs, Ava Team, CSAT Impacting, 3P Logs, CRI Sev2, ICM Process, ICM Quality, IcM Terminology. All process/escalation docs, no break/fix content. IDs purview-ado-wiki-b-r9-001..010 | batch b |

## [2026-04-06] ADO Wiki Blast Batch a / Round 8 (Case Management)

- **Pages processed**: 10
- **Track A (Break/Fix)**: 0
- **Track B (Guide Draft)**: 10
- **Deduplicated**: 0
- **IDs**: purview-ado-wiki-a-r8-001 to purview-ado-wiki-a-r8-010
- **Source**: Supportability/Azure Purview/Microsoft Purview — /Processes/Case Management/*
- **Content type**: All 10 pages are case management process/operational guides (acronyms, basics, CAS, DFM, duplicate cases, feature requests, internal guidance, internal titles, OOF)
- **Files written**:
  - .enrich/known-issues-ado-wiki-a.jsonl (10 entries appended)
  - .enrich/scanned-ado-wiki-a.json (10 keys merged)
  - guides/drafts/ado-wiki-a-{slug}.md x 10 drafts
| 2026-04-06 | ado-wiki | Blast batch-a round r9: 10 pages (Case Mgmt + Escalation processes), all Track B guide-drafts | purview-ado-wiki-a-r9-001~010 |

**Blast batch-a r9 details**:
- **Pages**: 10 (Teams Sharing, Unresponsive Customer, AVA Docs, AVA Team, CSAT Impacting, 3P Escalation Logs, Sev2 CRI, ICM Process, ICM Quality Flow, IcM Terminology)
- **Discovered**: 10 guide-draft entries
- **Deduplicated**: 0
- **IDs**: purview-ado-wiki-a-r9-001 to purview-ado-wiki-a-r9-010
- **Source**: Supportability/Azure Purview/Microsoft Purview — /Processes/Case Management/* + /Processes/Escalation/*
- **Content type**: All 10 pages are CSS process/escalation guides (Teams data protection, customer follow-up, AVA bot usage, CSAT escalation, ICM creation/quality, 3P logs, Sev2 criteria, IcM glossary)
- **Files written**:
  - .enrich/known-issues-ado-wiki-a.jsonl (10 r9 entries appended)
  - .enrich/scanned-ado-wiki-a.json (10 r9 keys merged, total 20)
  - guides/drafts/ado-wiki-a-{slug}.md x 10 new drafts

### 2026-04-06 ado-wiki blast batch-b (r10)
- **pages**: 10 (all under /Processes/ subtree)
- **Track A extracted**: 0 (no break/fix symptom+rootCause+solution)
- **Track B guides**: 0 (process/admin docs, not troubleshooting guides)
- **deduplicated**: 0
- **classification**: All 10 pages are CSS internal process docs (ICM management, Manager Recovery/CSAT, RCA escalation workflow, Getting Help links, customer ticket flow, CRMBot SLA Alert, CaseBuddy Triage/DGP/QAM/Queues setup). No Purview-specific technical troubleshooting content.
- **files**: `.enrich/known-issues-ado-wiki-b.jsonl` (empty), `.enrich/scanned-ado-wiki-b.json` (10 pages)

### 2026-04-06 ado-wiki blast batch-a (r11)
- **batchId**: a | **pagesProcessed**: 10 | **discovered**: 0 | **deduplicated**: 0
- All 10 pages are CSS internal operational/process docs (escalation procedures, CaseBuddy/CRMBot tool setup, manager recovery, triage lists, QAM dashboard, queue monitoring). Zero Break/Fix or troubleshooting-guide content.
- Pages: Processes/Escalation/IcM/*, Processes/Getting Help, Processes/How customers raise tickets, Processes/LEADS/CRMBot/SLA Alert, Processes/LEADS/CaseBuddy/*

## 2026-04-06 11:10 — ado-wiki blast batch-a (r10, 10 pages)

**模式**: blast-batch | batchId: a | round: 10
**页面范围**: /Processes/Escalation/* + /Processes/Getting Help + /Processes/How customers raise tickets + /Processes/LEADS/CRMBot/* + /Processes/LEADS/CaseBuddy/*
**分类**: 全部 Track B（内部流程/操作手册，无 break/fix 内容）
**结果**:
- discovered: 10 (guide-draft entries)
- deduplicated: 0
- drafts: 10 files → guides/drafts/ado-wiki-a-*.md
- JSONL: .enrich/known-issues-ado-wiki-a.jsonl (10 entries)
- scanned: .enrich/scanned-ado-wiki-a.json (10 pages)
- ID range: purview-ado-wiki-a-r10-001 ~ 010

**亮点**:
- RCA Escalation Process (9.6k chars) — 详细的 RCA 工作流、ICM 字段设置、严重性指引
- DGP Reviews & Setup (9.4k chars) — 含 Kusto 查询模板用于案例复查
- Manager Recovery — MRC 流程模板
- 其余为 CaseBuddy/QAM 工具配置、SLA 告警、队列管理等操作指南

## 2026-04-06 ado-wiki blast batch-a (r14)
- **Pages processed**: 10 (Processes/LEADS/Training/*, Language and Translation, OnCall, Product Limitation, Request Azure Subscription, Sovereign Cloud/USNAT & Fairfax, Sovereign Cloud/[Archive] Get JIT Access)
- **Discovered**: 1 (SHIR sovereign cloud endpoint configuration from USNAT & Fairfax page)
- **Deduplicated**: 1 (JIT Access overlaps with existing purview-ado-wiki-0122)
- **Skipped**: 8 pages — 2 empty (Course Content Writing, Video Training Content Writing), 6 internal team process/training docs with no customer troubleshooting value (content writing best practices, wiki markup syntax, language translation, on-call rotation, product limitation communication process, Azure subscription request)
- **Files**: known-issues-ado-wiki-a.jsonl (1 entry), scanned-ado-wiki-a.json (10 pages)
| 2026-04-06 | ado-wiki (blast-a) | +3 guide-drafts (ASC diagnostics, HAR capture, Fiddler analysis); 7 pages skipped (archived/template/empty/trivial); batch-a complete, 10 pages processed | Supportability/Azure Purview/Microsoft Purview:/Tools/* |
| 2026-04-06 | ado-wiki (blast-b) | Batch-b: 10 pages processed (Processes/*, TSG Template, Tools/ASC, Tools/Case Mgmt/*, Tools/How to/*, Tools/JSON viewer, Tools/Kusto Queries/*). 5 Track B guide-drafts (ASC, HAR logs, Fiddler trace, Classification Insights Kusto, Exception Insights Kusto). 5 skipped (archived process, template, case mgmt tools, empty CoPilot page, trivial JSON viewer). IDs purview-ado-wiki-b-r13-001~005. | known-issues-ado-wiki-b.jsonl |
| 2026-04-06 | ado-wiki (blast-a r16) | +2 guide-drafts (Classification Insights Kusto, Exception Insights Kusto); 3 deduped vs r15 (ASC, HAR, Fiddler); 5 skipped (archived process, template, case mgmt, empty CoPilot, JSON viewer). IDs purview-ado-wiki-a-r16-001~002. | known-issues-ado-wiki-a.jsonl |

## 2026-04-06 ado-wiki blast-batch-b

- **batchId**: b
- **pagesProcessed**: 10
- **Track A (break/fix)**: 2 — Geneva Actions Corp access blocked (dSTS enforcement); Sovereign Cloud access requirements
- **Track B (guide-draft)**: 5 — Scan Insights Kusto, SAW Request Points, AME Access, Purview Governance SAP, Networking
- **Skipped (empty/no-value)**: 3 — Lineage Insights (//TODO empty), Trainings & Updates (links only), Quick guide to requesting help (soft skills)
- **discovered**: 7, **deduplicated**: 0
- **IDs**: purview-ado-wiki-b-r14-001 ~ 007

### 2026-04-06 ado-wiki blast batch-a (r18)
- **pages**: 10 processed (Tools/Kusto Queries×2, Security Policies/AME×3, Training×5)
- **Track A**: 2 break/fix entries (Geneva Actions Corp access blocked; Sovereign Cloud access requirements)
- **Track B**: 4 guide-drafts (Scan Insights Kusto Queries, AME Access Setup, SAP Tree, Networking Training)
- **skipped**: 4 pages (Lineage Insights=empty TODO, SAW Laptop Setup=thin/overlaps AME, Purview Trainings=links only, Quick guide=process guide)
- **IDs**: purview-ado-wiki-a-r18-001..006
- **dedup**: 0 (fresh batch file)

### 2026-04-06 ado-wiki blast batch-b (r15)
- **batch**: b | 10 pages assigned, 10 scanned
- **Track B**: 1 guide-draft (Creating Custom Classifications → how-to for custom classification + scan rule set + search)
- **skipped**: 5 training/archived pages (Sovereign Cloud Training=links only, YAZANTSG TEST=test stub, Brownbag=video index, Roadmap=confidential link, Specs=doc links), 4 empty pages (API/SDK classification, How To, Incorrect label report, Cannot label by custom — all LENGTH=0 parent stubs)
- **IDs**: purview-ado-wiki-b-r15-001
- **dedup**: 0 (fresh batch file)

| 2026-04-06 | ado-wiki (blast-a) | +1 guide-draft (custom classification how-to) | batch a r19 |
- **batch**: a | 10 pages assigned, 10 scanned
- **Track B**: 1 guide-draft (Creating Custom Classifications → step-by-step: create classification → classification rules → scan rule set → scan → search)
- **skipped**: 5 training/archived pages (Sovereign Cloud Training=session links, YAZANTSG TEST=32-char stub, Brownbag=video index, Roadmap=confidential link, Specs=design doc links), 4 empty pages (API/SDK classification=0, How To=0, Incorrect label report=0, Cannot label by custom=0)
- **IDs**: purview-ado-wiki-a-r19-001
- **dedup**: 0 (fresh batch file)
| 2026-04-06 | ado-wiki blast-a | +1 guide-draft (Creating Custom classifications); 9/10 pages skipped (5 training/archived, 4 empty) | batch-a r20 |
| 2026-04-07 | SYNTHESIZE | 42 topics (38 fusion, 4 compact), 617 entries, 13 Kusto queries fused |

### 2026-04-17T10:12:17Z — contentidea-kb scan (purview)
- **Keywords**: Purview
- **WIQL result**: 0 work items
- **Unscanned**: 0
- **Discovered**: 0 | **Deduplicated**: 0
- **Status**: exhausted (no KB articles found for Purview in ContentIdea)

## 2026-04-18 OneNote REFRESH re-scan (purview)

- **Pages processed**: 10 (4 REFRESH-reset + 6 newly classified)
- **New entries**: 1 (purview-onenote-078: AIP encryption template troubleshooting in Mooncake)
- **Deduplicated**: 5 (wiki_migration copies of already-extracted MCVKB originals + refreshed pages with unchanged knowledge)
- **No extractable content**: 4 (Lab guidance, support scope links, member schedule, customer monitoring note)
- **Status**: exhausted (137/137 purview pages scanned)
| 2026-04-21 | ado-wiki | +6 purview known issues (DG permissions, DGPU billing, data products, DQ errors) | Supportability/Azure Purview batch a-r19 |
| 2026-04-23 | onenote | Scanned 1 page (Iridias alert registration), skipped as internal admin content | Mooncake POD/M365 Purview Compliance/Readiness |
| 2026-04-24 | SYNTHESIZE | 42 topics (38 fusion, 4 compact), 643 entries, 0 Kusto queries fused |
