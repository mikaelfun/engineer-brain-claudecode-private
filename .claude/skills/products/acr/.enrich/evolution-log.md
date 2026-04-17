# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | ado-wiki | Indexed 85 ACR pages from Supportability/AzureContainers/Containers Wiki (46 TSG + 21 How Tos + 18 other) | Phase 3a init |
| 2026-04-05 | ado-wiki | Phase 3b batch 1: extracted 5 break/fix issues from 2 pages (Connected Registry: PVC/connection-string/activation; API Deprecation: PolicyScan false-positive + migration) | 2/85 scanned |

## 2026-04-05 ado-wiki tick 2
- **Scanned**: 4 pages (ACR Audit Logs, ACR Behind Firewall, ACR Case Flow template, ACR Change Analysis)
- **Track A**: 1 break/fix entry (acr-ado-wiki-006: firewall/data-proxy pull failure)
- **Track B**: 2 guide-drafts (acr-ado-wiki-007: audit logs, acr-ado-wiki-008: change analysis)
- **Skipped**: ACR Case Flow template (internal process, no diagnostic value)
- **Progress**: 6/83 pages scanned, 77 remaining

## 2026-04-05 ado-wiki tick (Content Trust Delegation)
- **Scanned**: 1 page (ACR Content Trust Delegation Demo and FAQs — 26252 chars)
- **Extracted**: 2 Break/Fix (acr-ado-wiki-009..010) + 1 guide-draft (acr-ado-wiki-011)
- **Guide draft**: `guides/drafts/ado-wiki-acr-content-trust-delegation.md`
- **Topics**: Content Trust admin account signer restriction, docker trust sign unsigned image behavior, TUF key delegation workflow, CI/CD automation
- **Progress**: 7/80 pages scanned

## 2026-04-05 ado-wiki tick 4
- **Scanned**: 3 pages (ACR Escalation Process, ACR Health-Check Command Background, ACR How to find user of manifest event)
- **Track A**: 1 break/fix (acr-ado-wiki-015: unknown app ID + Microsoft IP = ACR task/run)
- **Track B**: 3 guide-drafts (acr-ado-wiki-012: escalation process, acr-ado-wiki-013: health-check, acr-ado-wiki-014: find manifest event user)
- **Pre-read**: cached lengths for 20 unscanned TSG pages
- **Progress**: 10/85 pages scanned, 75 remaining

## 2026-04-05 mslearn tick 1
- **Phase 4a**: Built index from toc.yml — 13 troubleshoot URLs discovered
- **Phase 4b**: Fetched 8/13 pages
- **Track A**: 13 break/fix entries (acr-mslearn-001..012, 014) — authentication errors (5), private endpoint DNS (3), delete operations (4), context deadline exceeded (1)
- **Track B**: 1 guide-draft (acr-mslearn-013: vulnerability scanning)
- **Deduplicated**: 2 pages (authentication-required ≥80% overlap with 003, client-ip-not-allowed ≥80% overlap with 005)
- **Cross-source**: acr-mslearn-005 relatedTo acr-ado-wiki-006 (firewall/IP restriction)
- **Progress**: 8/13 mslearn pages scanned, 5 remaining

## 2026-04-05 mslearn tick 2
- **Scanned**: 5 remaining pages (I/O timeout, manifest-tag-not-found, Web App pull, request-canceled, push errors)
- **Track A**: 7 break/fix entries (acr-mslearn-015..021) — I/O timeout storage (2), manifest tag not found (1), Web App pull auth+IP (2), request canceled login server (1), push disallowed+storage limit (1)
- **Deduplicated**: 3 (Web App manifest error dup of 017, push request-canceled dup of 020, push IP-denied dup of 005)
- **Cross-references**: 018→003, 019→005, 021→012
- **Progress**: 13/13 mslearn pages scanned — EXHAUSTED

## 2026-04-05 contentidea-kb tick 1
- **WIQL**: keyword "Container Registry" → 3 work items found
- **Scanned**: 3/3 work items (64116, 64728, 99927)
- **Track A**: 1 entry (acr-contentidea-kb-001: Docker on Windows base image/swarm advisory Q&A, KB4033167)
- **Skipped**: 2 items — WI 64728 (support scope policy, no structured fields), WI 99927 (ACS→AKS naming update, no structured fields)
- **Progress**: 3/3 scanned — EXHAUSTED

## 2026-04-05 21v-gap-scan
- **Source**: POD Services/ACR/Feature Gap.md
- **Unsupported**: 1 feature (ACR Task Agent Pools — not supported in Mooncake, no ETA)
- **Partial**: 0 features
- **Written**: .claude/skills/products/acr/21v-gaps.json

## 2026-04-05 ado-wiki tick (batch 3)
- Scanned: ACR Investigate Bulk Image Tag Deletions
- Track B (guide-draft): 1 — comprehensive 8-step investigation guide for bulk image/tag deletions (Kusto + DGREP + ARM correlation + retention policy)
- New entries: acr-ado-wiki-016
- Remaining: 74 pages

## 2026-04-05 onenote tick 1
- **Scanned**: 10 pages from page-classification.jsonl (2 MCVKB + 8 Mooncake POD)
- **Track A**: 6 break/fix entries (acr-onenote-001..006)
  - 001: Recover deleted ACR/images (ICM to PG, no SLA)
  - 002: ACR Task in network-restricted ACR (system MI + trusted service)
  - 003: az acr build blocked by firewall (AzureContainerRegistry service tag IPs)
  - 004: ACR CE1/CN1 region retirement migration
  - 005: Repository-scoped tokens (scope-map + fine-grained permissions)
  - 006: ACR Task agent pools not supported in Mooncake (feature gap)
- **Track B**: 2 guide-drafts (acr-onenote-007..008)
  - 007: Container registry proxy troubleshooting guide (architecture, investigation steps)
  - 008: ACR Kusto query reference (20+ KQL queries for diagnostics)
- **Skipped**: 2 pages too thin (====Troubleshooting===== = category headers only, 2024_01_09 cert outage = ICM link only)
- **Failed**: 1 page unreadable (Docker DCT 退役 — filename encoding issue)
- **Progress**: 10/27 onenote pages scanned, 17 remaining

## 2026-04-05 ado-wiki tick (batch: pages 12-13 of 85)

- **Source**: ADO Wiki (Containers Wiki)
- **Pages scanned**: 2 (ACR Private Link, Build ACR image with Docker BuildKit)
- **Track B (guide-drafts)**: 2
  - 017: ACR Private Link setup + DNS configuration guide
  - 018: ACR Tasks BuildKit + secrets (file/KeyVault/git-lfs) guide
- **Track A (break-fix)**: 0
- **Deduplicated**: 0
- **Progress**: 13/85 ado-wiki pages scanned, 72 remaining

## 2026-04-05 onenote tick 2+3 (final)
- **Scanned**: 19 remaining pages (10 in tick 2, 9 in tick 3)
- **Track A**: 6 break/fix entries (acr-onenote-009..014)
  - 009: Docker Content Trust (DCT) deprecation — migrate to Notary Project by 2028-03-31
  - 010: Import container images from blob storage via ACR Task (SAS + MI variants)
  - 011: Find operator IP — Kusto RegistryActivity + Jarvis correlation technique
  - 012: RBAC custom role wildcard (*) permissions silently ignored by ACR
  - 013: MCR proxy blocked by security appliance (Zscaler) — whitelist via AKS PG
  - 014: ACR cannot specify different AAD tenant (design limitation, use Lighthouse/guest)
- **Skipped**: 12 pages — 5 empty/section headers, 4 reference-only (contacts/ICM/Jarvis/wiki links), 3 readiness/training materials
- **Deduplicated**: 1 (Feature Gap.md ≥80% overlap with acr-onenote-006)
- **Progress**: 29/29 onenote pages scanned — **EXHAUSTED**

### 2026-04-05 ado-wiki tick (batch 14-16)
- **Pages processed**: 3 (Check ACR tasks and outputs, Define a great idea..., Enable image/repo deletion with ACR locks)
- **Extracted**: 2 entries (acr-ado-wiki-019~020)
- **Skipped**: 1 page (feedback forum = process doc, no TSG)
- **Track A**: 2 (ACR task Kusto diagnostics, multi-level lock deletion issue)
- **Track B**: 0
- **Prereaded lengths**: 20 pages cached for future batches
- **Progress**: 16/85 scanned, 69 remaining

### 2026-04-05 ado-wiki tick (batch 17-22)
- **Pages processed**: 6 (Throttling errors, PG Teams Channel, Custom domain, MCR Firewall, AKS cross-tenant, 503 Egress)
- **Extracted**: 5 entries (acr-ado-wiki-021~025)
- **Track A**: 3 (021: throttling/rate-limit, 022: MCR firewall FQDNs, 023: 503 storage egress)
- **Track B**: 2 guide-drafts (024: custom domain setup, 025: AKS-ACR cross-tenant)
- **Skipped**: 1 page (PG Teams Channel = process doc, no diagnostic value)
- **Pre-read cached**: 5 pages without lengths (tail of index)
- **Progress**: 22/85 scanned, 63 remaining

### 2026-04-05 ado-wiki batch 3 (TSG pages 22-31)
- **Source**: ADO Wiki TSG pages (ACR Auth ARM, RBAC-ABAC, DNS/NRS, Docker Desktop, PE NoRouteToHost, Image Recovery, PE Limit, Move Tenant, 401 Anonymous, Push No Content)
- **Discovered**: 12 entries (acr-ado-wiki-026 ~ 037), 10 break/fix + 2 guide-drafts
- **Deduplicated**: 0
- **Guide drafts**: ado-wiki-acr-authorization-rbac-abac.md, ado-wiki-acr-move-to-different-aad-tenant.md
- **Total JSONL**: 37 entries | **Scanned**: 32/81 pages | **Remaining**: 49

- **2026-04-05 ado-wiki batch**: Scanned 2 pages (ACR Replication CRUD TSG, ACR Storage Limit Increase). Extracted 3 issues (acr-ado-wiki-038..040): replication stuck in creating/deleting, 40TiB storage limit disallowed operation, geo-replication sync delay push failures.

### 2026-04-05 ado-wiki batch (seq 044-048)
- **Scanned**: 5 pages (VirtualWAN+PE 403, cross-sub VNET firewall, webhook→AppService, AKS MI auth, ACR disabled)
- **Discovered**: 5 new entries
- **Deduplicated**: 0 (2 marked relatedTo: 034, 039)
- **Progress**: 41/85 scanned, 44 remaining

## 2026-04-05 ado-wiki tick (acr-ado-wiki-049~051)
- **Scanned**: 3 pages (ACR image deletion investigation, SC extension not auto-updating, unknown blob/VNET pull)
- **Extracted**: 3 Track A entries
  - 049: Image tags disappearing — retention vs automation diagnosis (Kusto RegistryManifestEvent WithTag check)
  - 050: Service Connector extension pinned to removed ACR tag → delete & recreate connection
  - 051: Function App VNET pull fails — OCI manifest not supported, only Docker v2
- **Deduplicated**: 0 (049 related to 016 but different focus)
- **Remaining**: 41 pages

### 2026-04-05 ado-wiki tick (acr-ado-wiki-052~054)
- **Scanned**: 3 pages (ACR imagepull forbidden serviceendpoint, ACR private link troubleshooting questions, ACR retention policy untagged manifests)
- **Extracted**: 3 entries (IDs corrected from 049-051 → 052-054 due to parallel write collision)
  - 052: Service Endpoint on AKS subnet conflicts with ACR selected-networks → 403 Forbidden (Track A)
  - 053: Private link diagnostic checklist — service endpoints, firewall, DNS, geo-rep, client config (Track B guide-draft)
  - 054: Retention policy skips MediaType v1 / OCI index manifests — az acr import pushes unsupported type (Track A)
- **Deduplicated**: 0 (053 relatedTo acr-ado-wiki-017 ~50% overlap)
- **Progress**: 47/85 scanned, 38 remaining

## 2026-04-05 ado-wiki-scan (final batch)

- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages scanned this session**: 38 (completing full index of 85 pages)
- **New entries**: acr-ado-wiki-055 to acr-ado-wiki-085 (31 entries)
- **Deduplicated**: 0 (all new)
- **Status**: EXHAUSTED — all 85 indexed wiki pages scanned
- **Key topics covered**:
  - Delete repository caching issues, untagged images in Defender
  - Webhook RBAC, AKS SP credential expiry, firewall/proxy blocking
  - ACR Caching errors (naming, upstream, Key Vault, quota)
  - Container Apps name length bug, Continuous Patching (CSSC) failures
  - Docker pull intermittent (Cloudflare CDN), Anonymous Pull REST API limitation
  - Intermittent 502 from Azure Storage, ACR login troubleshooting
  - Defender scanning with authentication-as-arm disabled
  - Notation/Notary signing (auth, AKV permissions, trust policy)
  - ACR recovery, role assignment SP issues
  - Slow pull/push performance guide, Soft Delete errors
  - CORS portal issue (large AAD groups), private ACR via proxy

| 2026-04-07 | SYNTHESIZE | 20 topics (15 fusion, 5 compact), 108 entries, 10 Kusto queries fused |

### 2026-04-17 10:12 UTC — contentidea-kb refresh scan
- **Product**: acr
- **Keywords**: Container Registry
- **WIQL total**: 3 work items
- **Already scanned**: 3
- **New to scan**: 0
- **Discovered**: 0
- **Deduplicated**: 0
- **Exhausted**: true (all ContentIdea KB articles scanned; lastRefreshed updated)
