# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | ado-wiki | Phase 3a: Indexed 198 wiki pages from ASIM-Security/Messaging Protection Wiki | — |
| 2026-04-05 | ado-wiki | Phase 3b batch 1: Scanned 6 pages (TSG + Case Misroutes). 1 Track A (missing antispam header) + 2 Track B guides (header reference, spam samples). 4 process docs skipped. | eop-ado-wiki-001~003 |
| 2026-04-05 | ado-wiki | Phase 3b batch 2: Scanned 3 "Contribute to this Wiki" meta-pages. 0 issues (wiki contribution guides, not EOP content). 189 remaining. | — |
| 2026-04-05 | 21v-gap | Phase 1: 14 unsupported, 4 partial features extracted from Feature Gaps.md + Feature Bugs.md | — |
| 2026-04-05 | contentidea-kb | Phase 5 batch 1: WIQL found 56 EOP work items (keyword: "Exchange Online Protection"). Scanned 10 (IDs 614-52511). All 2015-2016 era, no structured HelpArticle fields → 0 issues extracted. 46 remaining. | — |
| 2026-04-05 | mslearn | Phase 4c (fallback search): 6 search queries → 8 pages fetched. 10 Track A issues (NDR codes, auth failures, false pos/neg, connectors). 2 Track B guide drafts (anti-spam filtering, email auth). | eop-mslearn-001~010 |

### 2026-04-05 ado-wiki tick (batch 3)
- **Scanned**: 7 pages (5 wiki-housekeeping skipped, 2 EOP-relevant extracted)
- **Track A**: eop-ado-wiki-004 — ZAP/reverse ZAP delays & duplicate delivery (21v-unsupported)
- **Track B**: eop-ado-wiki-005 — Automatic image download in Outlook (guide draft)
- **Progress**: 16/198 pages scanned, 182 remaining

### 2026-04-05 onenote tick (batch 1)
- **Scanned**: 10 pages (NDR scope docs + escalation guides + FN/FP tracking)
- **Track A**: eop-onenote-001~010 — NDR codes (5.7.750, 5.4.1, 4.7.500, 5.1.8, 5.1.90, 5.7.705, 5.0.350), Spamhaus IP block, China URL FP, domain blocklist FP
- **Track B**: eop-onenote-011~012 — EOP escalation path guide + FN/FP escalation process guide (2 drafts)
- **Progress**: 10/51 pages scanned, 41 remaining

### 2026-04-05 onenote tick (batch 2)
- **Scanned**: 10 pages (index/readiness pages + case study + triage meeting)
- **Track A**: eop-onenote-013 — new IP throttling after batch resend (relatedTo:003); eop-onenote-014 — Spamhaus HELO/DNS misalignment (relatedTo:007); eop-onenote-015 — 4.7.500 without AS code = transport back pressure; eop-onenote-016 — Assist 365 not available for 21v
- **Track B**: eop-onenote-017 — 21v EOP readiness & portal URLs guide; eop-onenote-018 — case triage best practices guide
- **Skipped**: 4 empty/index pages (## Process and Scope, ## Readiness, EEE sharing links, Readiness status Track)
- **Progress**: 20/51 pages scanned, 31 remaining

### 2026-04-05 ado-wiki tick 4 (pages 17-20)
- **Scanned**: 4 pages (Collaboration MDO/EXO, GetRCA empty, SEV B 24x7, Graph API for MDO)
- **Track A**: 0 entries
- **Track B**: eop-ado-wiki-006 — MDO/EXO collaboration & case routing guide; eop-ado-wiki-007 — SEV B 24x7 escalation guidelines; eop-ado-wiki-008 — Graph API (OAuth/permissions) for MDO reference
- **Skipped**: 1 empty page (GetRCA Process - no content)
- **Progress**: 20/198 pages scanned, 178 remaining

### 2026-04-05 ado-wiki tick 5 (pages 21-22)
- **Scanned**: 2 pages (Handling 3rd party cases, TABL FAQ)
- **Track A (7)**: eop-ado-wiki-010 — ZAP ignores TABL sender allow for HCP; 011 — TABL RBAC permissions; 012 — TABL URL wildcard syntax; 013 — spoof entries not saving (multiple HostedConnectionFilterPolicy); 014 — spoof pair needs PTR org domain; 015 — TABL not for IntraOrg; 016 — TABL IPv4 unsupported
- **Track B (2)**: eop-ado-wiki-009 — 3rd party/consumer case handling guide; eop-ado-wiki-017 — TABL FAQ comprehensive guide
- **Progress**: 22/198 pages scanned, 176 remaining

### 2026-04-05 contentidea-kb tick 2 (final, IDs 53291-125973)
- **Scanned**: 46 work items (all remaining). Total: 56/56 scanned = **exhausted**
- **Track A (11)**: eop-contentidea-kb-001~011
  - 001: Hybrid Wizard 550 5.7.64 ATTR36 (KB4019940)
  - 002: ATP Dynamic Delivery bind failure 4.7.721 (KB4532889, symptom only)
  - 003: 451 4.4.397 / 421 4.3.2 decommissioned server (KB2986948)
  - 004: Client Allow List not bypassing Content Filter / IPV:CAL (KB4052852)
  - 005: ATTR35 451 4.4.4 wrong DNS routing (KB4057301)
  - 006: ATTR46 451 4.4.5 cross-domain bifurcation (KB2986948)
  - 007: SPF fail + MarkAsSpamSpfRecordHardFail quarantine (KB4131510)
  - 008: 550 5.7.750 unregistered domains / safe tenant (KB4131509)
  - 009: 550 5.6.0 APPROVAL.InvalidExpiry moderation (KB4492048)
  - 010: DDG 550 5.4.1 Azure AD sync gap (KB4494242)
  - 011: ATTR5 451 4.4.4 expired subscription (KB4505860)
- **Deduplicated**: 12 items (duplicate ContentIdea work items for same KB articles)
- **Skipped**: 23 items (empty structured fields — old-era work items with no HelpArticle data)

### 2026-04-05 onenote tick (batch 3)
- **Scanned**: 10 pages (case studies + readiness + feature gaps/bugs + index pages)
- **Track A (7)**: eop-onenote-019 — Enhanced Filtering multi-hop relay SPOOF fix; 020 — SPF PermError from APAC DNS timeout; 021 — auto-forward DMARC reject (ARC gap in 21v); 022 — URL FP long-term whitelisting via Safe Links MustNotBrowse (relatedTo:008); 024 — recurring Spamhaus macro+PTR (relatedTo:007); 025 — microsoft.com to 21v SPF fail via relay (relatedTo:019); 027 — user reported settings bug in 21v SCC
- **Track B (2)**: eop-onenote-023 — EOP Sev A readiness curriculum guide; eop-onenote-026 — 21v EOP feature gaps comprehensive reference
- **Skipped**: 2 empty/index pages (##reference, TSG & Tips)
- **Progress**: 30/51 pages scanned, 21 remaining

### 2026-04-05 ado-wiki tick 6-8 (pages 23-29)
- **Scanned**: 7 pages (VDM Contingency [skip], Delist IPs, MDO Escalation Prerequisites, MDO Pre-breach escalations, Anti-malware SPO/ODB)
- **Track A (4)**: eop-ado-wiki-018 — outbound IP on DNSBL blocklist; 022 — MSAV vs ATP detection naming; 023 — SPO/ODB malware FP submission; 024 — file blocked in SPO but not in quarantine (30d retention)
- **Track B (5)**: 019 — IP delist process guide; 020 — MDO escalation prerequisites checklist; 021 — MDO pre-breach EEE severity matrix; 025 — SPO/ODB anti-malware guide; 009 — 3rd party case handling
- **Skipped**: VDM Contingency (DRAFT-DO NOT USE)
- **Progress**: 29/198 pages scanned, 169 remaining

### 2026-04-05 ado-wiki tick 9 (pages 30-31)
- **Scanned**: 2 pages (PCMS Lifecycle Workflow, Feedback Template — both process/admin, skipped)
- **Deduplicated**: Fixed 9 duplicate entries from background task overlap (34→25 entries)
- **Progress**: 31/198 pages scanned, 167 remaining

### 2026-04-05 Phase2 onenote tick (batch 4)
- Scanned 10 pages (40/51 total)
- Track A: 3 entries (eop-onenote-028 to 030) — 21V MessageTrace API, quarantine notification preset policy override, backscatter NDR false positive
- Track B: 2 guide-drafts (eop-onenote-031, 032) — EOP diagnostic script, SPAM agent data decoder
- Skipped 5 pages (empty/links-only: Global Learning material, RAW Readiness, EOP architecture, TSG links, Tools and Swarming index)
- Remaining: 11 pages (Tools and Swarming subsections)
- exhausted: false

| 2026-04-05 | ado-wiki | Scanned 10 pages (process/admin): Delivery Partners Contacts, APAC Processes, 4x10 Schedule, ATZ MDO OOF, OOF Case Reassignment, AVA Swarming, Callingbeforecasearchival, Case Notes, Customer follow-up, ICM update templates. All internal team processes, 0 issues extracted. | scanned=50, remaining=148 |
| 2026-04-05 | onenote | **EXHAUSTED** — Scanned final 11 pages (Tools and Swarming): Exchange Online SMTP Sender, Gallatin PG docs, Jarvis (main+3 sub-pages), PowerShell, SPAM Engine Infra, SPAM verdict analytics, Swarming contacts, SME tools. Extracted 1 Track A (21v Assist365 limitation) + 8 Track B guide-drafts (Jarvis log queries, SPAM engine architecture, verdict analysis, tools reference). 3 pages skipped (thin links/contacts only). Total: 41 entries (eop-onenote-001~041), 51/51 pages scanned. | exhausted=true |

## 2026-04-05 ado-wiki tick (batch 5)
- **Pages scanned**: 8 (5 TSG Case Misroutes + 1 Safe Senders + 2 empty/placeholder + 1 tiny)
- **Track A (Break/Fix)**: 2 entries (eop-ado-wiki-031: fake Teams voicemail phishing detection, eop-ado-wiki-032: Report Message button missing routing)
- **Track B (Guide drafts)**: 4 entries (Infrastructure Solutions routing, Teams vs MDO scope, Purview vs MDO scope, Outlook Safe Senders export)
- **21v marking**: eop-ado-wiki-032 marked 21vApplicable=false (Client-side report phishing unsupported in 21V)
- **Deduplicated**: 0
- **Progress**: 58/198 scanned, 159 remaining

## 2026-04-05 ado-wiki tick (continuation batch 6)
- **Pages processed**: 148 (massive bulk: 99 process/meta/empty pages + 49 technical pages with content)
  - Process/meta/0-length pages marked scanned without extraction (CPE Handbook, ATZ/EMEA processes, Contribute to Wiki, etc.)
  - Technical TSG pages extracted
- **Track A (Break/Fix)**: 13 entries (eop-ado-wiki-037~049)
  - 037: MDA malware tag not syncing back from MDO (by design)
  - 038: mcasproxy.cdn.mcas.ms URL rewriting ≠ Safe Links (MDA scope)
  - 039: Post-delivery junk movement: dest:I header = EXO scope
  - 040: NDR scope mapping (MDO: 5.1.8/5.7.703/5.7.705/5.7.709/4.7.500 vs EXO)
  - 042: Advanced Delivery phish sim override failures (complex routing, IP+domain match)
  - 043: Phish sim URLs still wrapped despite override (Safe Links vs Advanced Delivery)
  - 044: IntraOrg email quarantined despite SecOps config (DIR:INT, fix pending)
  - 045: ASF features causing FPs — SPF Hard Fail discouraged
  - 046: Transport rule count reduction in Mailflow report (by design MC698146)
  - 047: Bulk email BCL threshold tuning (MarkAsSpamBulkMail, Strict=5)
  - 048: Gmail deliverability — domain/IP reputation + Postmaster Tools
  - 049: GoDaddy 5.7.705 special handling (alternate tenant diagnostics)
- **Track B (Guide drafts)**: 1 entry (eop-ado-wiki-041: CIRT scope/engagement guide)
- **21v marking**: 042/043/044 marked 21vApplicable=false (Advanced Delivery/Safe Links); 038 marked false (Safe Links)
- **Deduplicated**: 0
- **Progress**: 197/198 indexed + Drafts/Known Issues/misc remaining, ~49 TSG pages left
| 2026-04-05 | mslearn | Phase 4c round 16: Searched 3 new queries, fetched 6 new pages (NDR 5.7.64/5.7.57/4.4.7, SMTP AUTH throttling, printers/scanners/LOB troubleshoot, SPF configuration). Extracted 10 break/fix entries (eop-mslearn-156~165). Topics: TenantAttribution cert chain, SMTP AUTH errors, continuous error throttling 5.2.25x, message expired, authentication failures, TLS 1.2, federated STS, SPF permerror, 21V SPF. | eop-mslearn-156~165 |

## 2026-04-05 ado-wiki blast-batch b (pages 1-10 of batch)
- **batchId**: b | **Pages processed**: 10 (TSG pages from /Troubleshooting Guides/)
- **Track A (Break/Fix)**: 5 entries (eop-ado-wiki-b-010~014)
  - 010: Phishing simulation not bypassed — P1Sender/DKIM domain or sending IP missing from Advanced Delivery policy
  - 011: Advanced Delivery DKIM domain configured but DKIM validation fails → simulation still filtered
  - 012: Admin sees reduced transport rule blocked count in Mailflow report (behavior change, MC698146)
  - 013: 3rd party simulation messages blocked by MDO → redirect to Advanced Delivery (not AST scope)
  - 014: AST simulation emails not received → minimum log collection guide for escalation
- **Track B (Guide drafts)**: 8 entries (eop-ado-wiki-b-015~022)
  - 015: Advanced Spam Filtering (ASF/SPF Hard Fail/X-CustomSpam reference)
  - 016: Anti-malware in SPO and ODB (full FP troubleshooting + case routing table)
  - 017: Attack Simulation Training FAQ (escalation log requirements + Q&A)
  - 018: Bulk Confidence Level (BCL ratings, threshold tuning, Advanced Hunting query)
  - 019: Case Misroutes — Advanced Hunting Determining Scope
  - 020: Case Misroutes — Alerts Determining Scope
  - 021: Case Misroutes — Azure Permissions
  - 022: Case Misroutes — CIRT Determining Scope
- **Deduplicated (per-batch)**: 0
- **Files**: `.enrich/known-issues-ado-wiki-b.jsonl`, `.enrich/scanned-ado-wiki-b.json` (created)

## 2026-04-06 ado-wiki blast-batch a round 2 (pages from blast-assign-a.json)
- **batchId**: a | **Round**: r2 | **Pages processed**: 10 (Email Auth TSGs + Gmail + GoDaddy + HAR + Consumer Mailflow)
- **Track A (Break/Fix)**: 9 entries (eop-ado-wiki-a-r2-001~009)
  - 001: Auth timeout/temperror from low DNS TTLs (<3600s) — fix TTLs, check sub-entries
  - 002: SPF fail from sub-entry timeout in complex nested SPF includes — simplify record
  - 003: Auto-forwarded email fails DMARC — SRS breaks SPF + 3rd party breaks DKIM → fix DKIM signing with P2 domain (21v-partial: TABL/ARC limited)
  - 004: SPF fail when MX not pointing to EOP — enable Enhanced Filtering for Connectors
  - 005: DKIM body hash fail — message body modified after signing (21v-partial: ARC sealers unavailable)
  - 006: DKIM signature did not verify — signed header modified (Subject [EXTERNAL])
  - 007: SPF permerror — syntax error or >10 DNS lookups
  - 008: Gmail deliverability 550 5.7.1 / 421 4.7.28 — auth + reputation + Postmaster Tools
  - 009: GoDaddy 5.7.705 Tenant Exceeded Threshold — special handling (alternate tenant diagnostics, EMAIL only)
- **Track B (Guide drafts)**: 5 entries (eop-ado-wiki-a-r2-010~014)
  - 010: When To Collab and When To Transfer (case routing scope)
  - 011: Email Authentication SPF DKIM DMARC (comprehensive reference)
  - 012: Quantifying auth results with Advanced Hunting (KQL scripts)
  - 013: HAR Browser Trace Playbook (collection + Fiddler + MS HAR Analyzer + split script)
  - 014: Consumer Mailflow Issues (MDO scope + handoff to consumer support + EDFS escalation)
- **Deduplicated (per-batch)**: 0
- **Files**: `.enrich/known-issues-ado-wiki-a.jsonl`, `.enrich/scanned-ado-wiki-a.json` (created)

| 2026-04-06 | ado-wiki (blast-batch-a r4) | +16 entries (9 break/fix + 7 guide-drafts) from 10 Messaging Protection Wiki pages | Batch a round 4 |
- **Pages processed**: MDO Permissions (SecurityPermissionsChecker + TSG), MDO Protection For Teams, Mailbox Allowed/Blocked Senders and Limits, Malware TSG, Alerts 400/403, Detonation tree, Advanced Hunting, ICM Remediation Details, SecOps Best Practices
- **Track A Break/Fix** (9 items):
  - 001: Blocked sender SFV:BLK action depends on anti-spam policy (Junk vs Quarantine)
  - 002: Domain-based Allowed Senders not honored by Exchange Online (by design)
  - 003: Junk mail hash size limits (3072/2048/500) causing stale allow/block behavior
  - 004: Outlook 510KB junk mail rule size limit error
  - 005: Common Attachment Filter .COM false positive from nested message subject
  - 006: NDR 550 5.0.350 for nested attachments depth >= 20
  - 007: Defender Alerts page 400/403 error due to P1/E3 license (use /viewAlerts)
  - 008: Detonation tree not showing data (static verdict / no Safe Links / by design)
  - 009: Take Action missing in Advanced Hunting (URBAC permissions required)
- **Track B Guide-drafts** (7 items):
  - 010: SecurityPermissionsChecker tool reference
  - 011: MDO Permissions TSG (Legacy RBAC vs URBAC, HAR analysis)
  - 012: MDO Protection For Teams (license matrix, config validation, protection flows)
  - 013: Malware TSG (Common Attachment Filter, true-type detection, FP/FN handling)
  - 014: MDO Advanced Hunting (table ownership, permissions, community queries)
  - 015: ICM Remediation Details (Approval ID, Remediation ID, required traces)
  - 016: SecOps Best Practices (NIST framework, resource links)
- **21v tagging**: Items 008, 009, 012, 014 marked 21vApplicable=false (Safe Links/Attachments/Advanced Hunting features)
- **Deduplicated (per-batch)**: 0
- **Files**: `.enrich/known-issues-ado-wiki-a.jsonl` (16 entries), `.enrich/scanned-ado-wiki-a.json` (10 pages), 7 guide-draft files in `guides/drafts/`

| 2026-04-06 | ado-wiki | **Blast batch-a (r6)**: 10 TSG pages processed. 14 Track A break/fix + 6 Track B guide drafts = 20 entries total, 0 deduplicated. | eop-ado-wiki-a-r6-001~020 |

**Blast batch-a r6 details** (batchId=a, pagesProcessed=10):
- **Track A break/fix (14 entries)**:
  - 001–003: Enhanced Filtering for Connectors (private IP skip listing, EFUsers hybrid, connector attribution)
  - 004–007: Junk email validation errors (hash limit, property validation, 1024 limit, domain @ format)
  - 008: Direct Send Spoofing (CompAuth=451/905, MX not pointing to M365)
  - 009: Outbound spam BCC sample collection (Sent Items lack headers)
  - 010: Inbox rules false positive (SFV:NSPM, ucf:1)
  - 011: Mail Bombing detection FP (21vApplicable=false, TABL required)
  - 012–013: Quarantine missing messages + notification issues
  - 014: Recipient Rate Limit SendAs policy mismatch
- **Track B guide drafts (6 entries)**:
  - 015: FP/FN comprehensive TSG → ado-wiki-a-Troubleshooting-FP-FN.md
  - 016: Mail Bombing guide → ado-wiki-a-Troubleshooting-Mail-Bombing.md
  - 017: Quarantine Operations → ado-wiki-a-Quarantine-Operations.md
  - 018: Recipient Rate Limit → ado-wiki-a-Recipient-Rate-Limit.md
  - 019: User Reporting & Submissions → ado-wiki-a-User-Reporting-Submissions.md
  - 020: Safety Tips reference → ado-wiki-a-Safety-Tips.md
- **21v tagging**: Item 011 marked 21vApplicable=false (TABL Sender Allow required for mitigation)
- **Deduplicated (per-batch)**: 0
- **Files**: `.enrich/known-issues-ado-wiki-a.jsonl` (20 entries), `.enrich/scanned-ado-wiki-a.json` (10 pages), 6 new guide-draft files

## 2026-04-06 eop ado-wiki batch-a
- Pages processed: 10 (2 not found: /Announcements, /Drafts/DRAFT - GetRCA Process Customer Talking Points)
- Pages with content: 8 (all /Contribute to this Wiki/* - wiki meta/admin guides)
- Extracted entries: 0 (no EOP/MDO troubleshooting content in any page)
- Classification: all pages are wiki contribution management guides (how to create/edit/delete pages, PR workflows, analytics)
- Deduplication: N/A (no entries)
- Output: known-issues-ado-wiki-a.jsonl (empty), scanned-ado-wiki-a.json (10 pages)

## 2026-04-06 ado-wiki batch-a (blast-batch)
- Pages processed: 10 (ASIM-Security/Messaging Protection Wiki - CPE Handbook + Case Assignment)
- Track A entries: 1 (eop-ado-wiki-a-005, RED flags for low CPE)
- Track B guide-drafts: 9 (CPE Scenarios 7/8/9, DDX Guidelines, References, CARE, Top Indicators x2, Case Assignment)
- Deduped: 0 (no overlap with main JSONL - all CPE process content)
- Note: batch-a-pages.json had corrupted paths (em-dashes/apostrophes stripped); resolved via wiki tree enumeration
| 2026-04-07 | SYNTHESIZE | 37 topics (30 fusion, 7 compact), 261 entries, 0 Kusto queries fused |
