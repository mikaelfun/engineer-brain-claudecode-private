# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | ado-wiki | Phase 3a: Indexed 162 pages (Dev_ARM: 152, AzureAdaptiveCloud: 10) | Supportability/AzureDev/Dev_ARM + Supportability/AzureAdaptiveCloud |
| 2026-04-05 | ado-wiki | Phase 3b tick-1: Scanned 23/162 pages. 1 Break/Fix (Lighthouse delegation loss on tenant migration), 3 guide drafts (Lighthouse architecture/config/logs). Most pages were process/tools/training/templates. | Dev_ARM: Known issue list → Lighthouse TSGs |
| 2026-04-05 | ado-wiki | Phase 3b tick-2: Scanned 33/162 pages (+10). 0 new issues — all pages were empty templates (Managed Apps Svc Catalog + Management Groups scaffolding, "Start Here" landing pages, "todo" stubs). | Dev_ARM: Managed Apps Svc Catalog + Management Groups |
| 2026-04-05 | 21v-gap | Phase 1: No Feature Gap file found in SERVICES_DIR/DEPLOYMENT. VM PoD Feature Gaps List also has no ARM/Deployment entry. Written empty 21v-gaps.json with noGapDataFound=true. | POD/VMSCIM/4. Services/DEPLOYMENT |
| 2026-04-05 | mslearn | Phase 4c tick-1 (fallback search): 5 searches → 8 pages fetched. Extracted 10 Break/Fix issues covering: RP registration, quota, policy, SKU, throttling 429, resource not found, invalid template, deployment 800-limit, AuthorizationFailed, resource locks. | MS Learn ARM troubleshooting docs |
| 2026-04-05 | contentidea-kb | Phase 5 tick-1: WIQL queried keywords [Resource Manager, Azure Arc] → 43 work items (all from Azure Arc). Scanned 10/43, extracted 10 entries (7 Break/Fix, 3 Informational). Topics: helm charts, Fluentd OOM, Resource Bridge KVAError/timeout, vSphere backslash bug, GKE Autopilot unsupported, ESU cert expiry, Oracle Linux iptable_nat. 0 deduplicated. | ContentIdea Azure Arc KB |
| 2026-04-05 | onenote | Phase 2 tick-1: Scanned 10/108 pages. Extracted 5 Break/Fix (ARM throttling 429, billing API 403 DevTest/Production workload mismatch, SQL DB elasticpools concurrent deployment, ARM template 4MB limit, Linked Template IPv6 firewall 403) + 3 guide drafts (storage account recovery, portal extension analyzer, ARM request tracing). 0 deduplicated. | MCVKB Portal&ARM + Billing API + wiki_migration |

### 2026-04-05 ado-wiki tick 5
- Scanned 5 pages: Management Groups (Support Topics, Training, TSGs) + Azure Policy (Array aliases evaluation, Greenfield vs Brownfield)
- Pages 1-3: template/placeholder pages, no content extracted
- Page 4: Track B guide — Policy array aliases & count operator (guides/drafts/ado-wiki-policy-array-aliases-evaluation.md)
- Page 5: Track B guide — Policy Greenfield vs Brownfield evaluation (guides/drafts/ado-wiki-policy-greenfield-vs-brownfield.md)
- Pre-read 20 pages, cached lengths for future batching
- Total: 38/162 scanned, 2 new entries (arm-ado-wiki-005, 006)

### 2026-04-05 ado-wiki tick (pages 39-48)
- **Source**: ADO Wiki Dev_ARM
- **Pages processed**: 10 (Policy Architecture: control plane effects, manual attestation, 7 RP integrations)
- **Discovered**: 10 guide-draft entries (arm-ado-wiki-007 ~ 016)
- **Deduplicated**: 0
- **Break/Fix**: 0 (all pages are architecture references)
- **Guide drafts**: 10 new drafts in guides/drafts/
- **Remaining**: 114 pages

### 2026-04-05 onenote tick-2 (pages 11-20)
- **Source**: OneNote (MCVKB + Mooncake POD Support Notebook)
- **Pages processed**: 10
- **Discovered**: 5 entries (arm-onenote-009 ~ 013)
  - arm-onenote-009: Automation runbook Az module update via REST API (F12 capture)
  - arm-onenote-010: Python SDK Mooncake endpoint configuration (guide-draft)
  - arm-onenote-011: ARM Kusto armmc tables overview (guide-draft, relatedTo:008)
  - arm-onenote-012: APPGW template export remove principalId/clientId
  - arm-onenote-013: AKS scaling cse-agent extension timeout (ARM->CRP pipeline)
- **Deduplicated**: 2 (SQL DB elasticpools duplicate path, ARM 4MB duplicate path)
- **Skipped**: 3 (2 empty section headers, 1 WebApp Kusto reference with no ARM-specific break/fix)
- **Remaining**: 88 pages

### 2026-04-05 contentidea-kb tick-2 (items 21-30)
- **Source**: ContentIdea Azure Arc KB
- **Items processed**: 10 (IDs: 196807-199031)
- **Discovered**: 10 entries (arm-contentidea-kb-021 ~ 030)
  - 021: vCenter onboard fails — use FQDN instead of IP
  - 022: Cluster Extension install fails — whitelist azureprivatecloud.azurecr.io:443
  - 023: Appliance deploy HTTP2 GOAWAY — enable HTTP 2.0 on firewall/proxy
  - 024: Connected Machine Agent WSUS metadata wrong OS version for Win 2012
  - 025: ARC K8s Workload tab 599 error — proxy blocking URLs
  - 026: AKV Secret Provider OpenSSL 1.1.1 vuln — upgrade to 1.5.6
  - 027: vCenter script keeps asking password — use lowercase 'y'
  - 028-030: Troubleshooting flowcharts (VMware vSphere onboarding, K8s onboarding, K8s extensions)
- **Deduplicated**: 0
- **Remaining**: 13 items

### 2026-04-05 contentidea-kb tick-3 (items 31-43) — EXHAUSTED
- **Source**: ContentIdea Azure Arc KB
- **Items processed**: 13 (IDs: 199286-207012), all remaining
- **Discovered**: 13 entries (arm-contentidea-kb-031 ~ 043)
  - 031: Arc K8s Azure Policy extension install fails — manual azurepolicy namespace fix
  - 032: OpenShift kube-aad-proxy cert error — Arc agent version regression
  - 033: Resource Bridge deployment script error — Python/PS version mismatch
  - 034: Resource Bridge VMware timeout — DNS/proxy issues
  - 035: RKE cluster onboarding fails — cattle-system Rancher webhook blocking
  - 036: Rename Arc Resource Bridge VM in vCenter — yes with caveats
  - 037: Resource Bridge deploy timeout — mgmt machine can't reach appliance
  - 038: Arc Resource Bridge offline — troubleshooting steps
  - 039: PVC custom storage class fails — storage policy mismatch
  - 040: Unable to onboard VMware VMs — permission/role issues
  - 041: Resource Bridge offline but appliance running — cert/token expiry
  - 042: Deleted VM still in portal — stale Azure resource cleanup
  - 043: Connected Machine Agent upgrade fails — manual reinstall
- **Deduplicated**: 0
- **Remaining**: 0 — **contentidea-kb EXHAUSTED**

### 2026-04-05 ado-wiki tick (pages 49-67)
- **Source**: ADO Wiki Dev_ARM — Azure Policy section
- **Pages processed**: 19 (4 batches: 2+7+6+4)
- **Discovered**: 18 entries (arm-ado-wiki-017 ~ 034)
  - **Break/Fix (8)**:
    - 020: Policy definition limit hit per RG → use parameterized definitions
    - 021: Policy mode:Indexed shows 0/0 for proxy resources → use mode:All
    - 027: Missing child alias → workaround with string(field()) on parent
    - 028: Deleted resource in compliance/Resource Not Found → ARM cache sync
    - 029: Non-taggable resources scanned in Indexed → Tags UI gap or routingType bug
    - 030: Policy compliance 0 resources → mode/scope/notScopes/exemption check
    - 031: ARM template Policy deployment fails → escape functions with [[
    - 032: Allowed resource type denied → secondary resource type triggered with different correlationId
    - 033: SQL master DB not scanned → by design (excluded from evaluation)
  - **Guide drafts (9)**: MDC integration, aliases, portal-aware experience, selectors/overrides, glossary, FAQ, support scope, supportability request, service updates
- **Deduplicated**: 0
- **Remaining**: 95 pages

### 2026-04-05 onenote tick-3 (pages 21-30)
- **Source**: OneNote (MCVKB Dev + Mooncake POD: AKS/AVD/RBAC)
- **Pages processed**: 10
- **Discovered**: 6 entries (arm-onenote-014 ~ 019)
  - arm-onenote-014: AKS scale-out slow 30+ min due to AppGW v1 NRP update (relatedTo:013)
  - arm-onenote-015: ARM Kusto end-to-end tracing guide — all tables (guide-draft, relatedTo:008)
  - arm-onenote-016: AVD/WVD deploy fail — subnet PaaS service association conflict
  - arm-onenote-017: ASC TSG for RBAC role assignment investigation (guide-draft)
  - arm-onenote-018: Custom RBAC role for multi-DB access (SQL + DBForMySQL)
  - arm-onenote-019: Scripts to audit RBAC assignments cross-subscription (guide-draft)
- **Deduplicated**: 1 (ARM template 4MB — duplicate of MCVKB/wiki_migration path)
- **Skipped**: 2 (empty pages: Case study index, Readiness link-only)
- **Merged**: 1 (Node RG ARM logs merged into arm-onenote-015 guide-draft)
- **Remaining**: 79 pages

### 2026-04-05 Phase2 onenote-extract tick (pages 31-40)
- **Processed**: 10 pages (Azure Arc Servers: case studies, Kusto endpoints/examples, ongoing issues, extensions, architecture; Bicep/Deployment: concept, Mooncake config, common scenarios)
- **Extracted**: 6 entries (arm-onenote-020~025)
  - Track A (break/fix): 5 entries — Arc CSE provisioning fail, Arc Private Link onboarding fail, AMA HCRP500 in ChinaNorth3, Arc extension stuck updating, Bicep wrong cloud config
  - Track B (guide-draft): 1 entry — Arc Kusto diagnostics guide (hcrpmc cluster, HCRPEvents/HISEvents/HISTraces)
- **Skipped**: 4 pages (3 empty/image-only, 1 too basic)
- **Deduplicated**: 0
- **Remaining**: 68 pages | **Exhausted**: false

### 2026-04-05 ado-wiki tick (Policy SAP pages)
- **Pages scanned**: 10 (Special RP considerations, Start Here, 5x Authoring/Support Topics, 2x Policy behavior, Remediation task)
- **Track A**: 5 break/fix entries (arm-ado-wiki-035~039) — RP-specific Policy limitations (Compute instanceView/osType, Logic scan disabled, NSG dual resource, Web PUT-as-PATCH)
- **Track B**: 7 guide drafts (arm-ado-wiki-040~046) — Policy alias TSG, debugging, writing definition, assignment issues, operation blocked, compliance unexpected, enforcement unexpected
- **Skipped**: 2 pages (Start Here=navigation only, Remediation task=empty)
- **Deduplicated**: 0
- **Progress**: 77/162 scanned, 85 remaining

## 2026-04-05 onenote-extract (arm) tick
- **Batch**: 10 pages scanned (50/108 total)
- **Discovered**: 3 guide-draft entries (arm-onenote-026..028)
  - 026: Kusto PII data unmasking (relatedTo: 008)
  - 027: Mooncake Kusto endpoints reference (relatedTo: 011)
  - 028: Arc Server logs collection guide (relatedTo: 025)
- **Skipped**: 7 pages (3 empty headers, 3 training/readiness plans, 1 process tip)
- **Deduplicated**: 0
- **Remaining**: 59 pages
- **Exhausted**: false

### 2026-04-05 — arm onenote tick (pages 51-60)
- **Scanned**: 10 pages (Arc Enabled Servers: escalation/readiness/self-assessment/support-boundaries/swarming/AMA; Arc K8s: index/agents/siemens/discussion)
- **Extracted**: 4 Track-A entries (arm-onenote-029~032) + 1 Track-B guide-draft (arm-onenote-033)
- **Skipped**: 6 pages (links-only/quiz/empty/images)
- **Deduplicated**: 0
- **Guide draft**: onenote-ama-on-arc-servers.md (AMA deployment + troubleshooting on Arc servers)
- **Remaining**: 49 pages

### 2026-04-05 Phase2 onenote tick (batch 7)
- Pages processed: 10 (Arc K8s: Extension status, Icm template, PM contact, Readiness, Self-assessment, TSG, Tools, kusto&jarvis, logs collection; GA status)
- Discovered: 2 (arm-onenote-034: Arc K8s extensions unavailable in Mooncake; arm-onenote-035: Kusto not available for Arc K8s in Mooncake)
- Deduplicated: 1 (GA status → arm-onenote-029)
- Skipped: 7 (thin content — single links, rosters, or image-only pages)
- Total JSONL: 35 | Scanned: 70/108 | Remaining: 39

## 2026-04-05 Phase2 onenote-extract (tick)
- Scanned 10 pages (Azure Arc resources/contacts, Azure Migrate deprecated)
- 7 pages empty/links-only/contacts → skipped
- 1 page credentials (Lab Info) → skipped for security
- Extracted: 1 break/fix (VMware agentless IR stuck) + 2 guide-drafts (ASR Kusto queries, Migrate network 21v)
- New entries: arm-onenote-036..038
- Deduplicated: 0
- Remaining: 28 pages

## 2026-04-05 OneNote Batch (tick ~9, pages 81-90)

- **Source**: Azure Migrate (Deprecated) section — Readiness, Troubleshooting, Kusto Queries (Onboarding, Discovery VM/SQL/Apps & Dependency), ICM
- **Pages processed**: 10 (5 thin/reference-only, 5 rich Kusto query pages)
- **Entries added**: 7 (arm-onenote-039 to arm-onenote-045)
  - 5 break/fix (Track A): duplicate BIOS UUID, SQL discovery failure, dependency map errors, SQL perf data failure, ICM escalation
  - 2 guide-drafts (Track B): appliance onboarding Kusto queries, discovery Kusto queries
- **Guide drafts created**: `onenote-azure-migrate-appliance-kusto.md`, `onenote-azure-migrate-discovery-kusto.md`
- **Deduplicated**: 0 (all new Azure Migrate content, no overlap with existing entries)
- **Remaining**: 19 pages
| 2026-04-05 | onenote | Phase 2 tick-7 (no-op): Attempted 10 Azure Migrate pages but all already scanned by previous tick. Cleaned up 6 duplicate JSONL entries + 10 duplicate scanned paths. Created 4 new guide-draft files (discovery-apps-dep, discovery-sql, discovery-vm, onboarding-kusto). State: 45 entries, 90/108 scanned, 19 remaining. | Azure Migrate Troubleshooting |

### 2026-04-05 Phase2 onenote-extract tick (pages 91-100)
- **Source**: OneNote — Azure Migrate Logs Collection, Bicep section header, VW/BMW CN3 migration project pages
- **Pages processed**: 10
- **Discovered**: 0
- **Deduplicated**: 0
- **Skipped**: 10 (1 Azure Migrate log reference not ARM-specific, 1 empty Bicep header, 4 VW migration project management, 2 VW case tracking/image-only, 2 BMW migration project management)
- **Reasoning**: All pages contain either project management tracking (contacts/timelines/case lists) or product-specific issues (AKS version, PostgreSQL capacity, DB memory ratio) — no ARM-layer break/fix or guide content
- **Total JSONL**: 45 | **Scanned**: 100/108 | **Remaining**: 9
- **Exhausted**: false

### 2026-04-05 Phase2 onenote-extract FINAL tick (pages 101-109) — EXHAUSTED
- **Source**: OneNote — BMW case review, CN1/CE1 Migration 防坑指南 series (index + 7 sub-pages)
- **Pages processed**: 9 (final batch)
- **Discovered**: 4 entries (arm-onenote-046 ~ 049)
  - **Track A (break/fix): 3**
    - 046: Resource move fails 409 MoveCannotProceedWithResourcesNotInSucceededState — VNet validation blocks when concurrent ops (Databricks VM delete) active, with Kusto investigation pattern
    - 047: RG location property cannot be changed — use PG PowerShell scripts (project-scrub-jay) or wait for backend solution
    - 048: LAW resource move changes Resource ID → breaks Diagnostic Settings, AKS Insights, DCR
  - **Track B (guide-draft): 1**
    - 049: CN1/CE1 Resource Move compatibility matrix (30+ resource types, CSS lab-tested with business interruption assessment) → `guides/drafts/onenote-cn1-ce1-resource-move-matrix.md`
- **Skipped**: 5 (1 BMW case tracking, 1 index page, 1 file not found, 2 service-specific migration guides — CosmosDB failover, SQL geo-replication)
- **Deduplicated**: 0
- **Total JSONL**: 49 entries | **Scanned**: 109/108 (1 extra path from earlier) | **Remaining**: 0
- **Exhausted**: true ✅ — OneNote source complete for ARM product

## 2026-04-05 Phase 2 OneNote Extract (Final Batch)

- **Pages processed**: 9 (final batch — all 108 ARM pages exhausted)
- **New entries**: 13 (arm-onenote-050 to arm-onenote-062)
  - 7 break/fix triples (Track A)
  - 6 guide-draft entries (Track B)
- **Topics**: CN1/CE1 migration series — Resource Mover compatibility (MySQL/ADX/AppGW/ContainerApps), Storage live migration limitations, SQL geo-replication SID sync, CosmosDB failover migration
- **Guide drafts created**: 4 new files in guides/drafts/
  - onenote-cn1-ce1-cosmosdb-migration.md
  - onenote-cn1-ce1-service-migration-plans.md
  - onenote-cn1-ce1-storage-migration-decision.md
  - onenote-cn1-ce1-sql-migration.md
- **Status**: onenote source EXHAUSTED (108/108 pages scanned)
- **Total JSONL entries**: 62

### 2026-04-05 ADO Wiki Tick (Policy TSGs batch)
- **Source**: ado-wiki (Dev_ARM)
- **Pages scanned**: 4 (AINE/DINE checklist, Condition checklist, Confirm alias modifiable, Find right alias)
- **Track A (break/fix)**: 7 entries (arm-ado-wiki-047 to 053)
  - DINE incorrect compliance with matching types (missing name property)
  - AINE/DINE wrong existenceScope for subscription-level resources
  - existenceCondition timeout from full collection GET
  - DINE subscription deployment missing location
  - Policy condition type mismatch (boolean/string/integer)
  - Policy expression split() null access exception
  - Greenfield missing property default value evaluation
- **Track B (guide drafts)**: 2 entries (arm-ado-wiki-054, 055) + 2 draft files
  - ado-wiki-policy-confirm-alias-modifiable.md
  - ado-wiki-policy-find-right-alias.md
- **Deduplicated**: 0
- **Progress**: 81/162 scanned, 81 remaining
- **Total JSONL entries**: 55

## 2026-04-05 ado-wiki batch (pages 82-94)
- Scanned 13 pages: Azure Policy TSGs (Get config, Get logs, Get payload, Identify DP/CP), ARG (GET-LIST API, Support scope, Stale data, Service Updates, Start Here, Support Topics, Tools, TSGs, UI issues placeholder)
- Track A: 3 break/fix entries (DP vs CP, stale data resources, stale data proxy)
- Track B: 4 guide drafts (policy-get-config, policy-get-logs, policy-get-payload, arg-support-scope)
- Skipped: 6 pages (empty/placeholder/informational)
- IDs: arm-ado-wiki-056 to arm-ado-wiki-062
- Progress: 94/162 scanned, 68 remaining

## 2026-04-05 ado-wiki batch (pages 95-97)
- Scanned 3 pages: ARM Architecture — ARM APIs, ARM Kusto clusters, ARM REST APIs
- Track A: 0 break/fix entries — all pages are architectural reference material
- Track B: 3 guide drafts:
  - ado-wiki-arm-apis.md — ARM GET/DELETE API processing flow with sequence diagrams
  - ado-wiki-arm-kusto-clusters.md — Kusto cluster/table/column reference for ARM diagnostics
  - ado-wiki-arm-rest-apis.md — ARM REST API fundamentals (HTTP methods, endpoints per cloud, scope patterns, API versions)
- IDs: arm-ado-wiki-063 to arm-ado-wiki-065
- Pre-read 20 pages for length cache
- Progress: 97/162 scanned, 65 remaining

### 2026-04-05 mslearn fallback-search tick (3 queries)
- **Source**: mslearn (fallback search mode, mslearnTocPaths=[])
- **Queries**: "Azure Resource Manager throttling 429 error", "ARM template what-if deployment validation", "Azure resource provider registration error"
- **New URLs found**: 3 (after dedup against 18 already scanned)
  - Compute RP throttling (troubleshoot/azure/virtual-machines)
  - ARM template what-if (azure-resource-manager/templates/deploy-what-if)
  - Bicep what-if (azure-resource-manager/bicep/deploy-what-if)
- **Track A (break/fix)**: 1 entry (arm-mslearn-020) — Compute RP 429 throttling per-operation-group (relatedTo: arm-mslearn-005)
- **Track B (guide-draft)**: 1 entry (arm-mslearn-021) — ARM/Bicep what-if deployment preview guide
- **Deduplicated**: 1 (Bicep what-if >80% overlap with ARM what-if → merged)
- **Skipped from search results**: ~15 URLs (AKS-specific 429 articles, Service Bus RP errors, CLI reference pages, already-scanned ARM troubleshoot pages, Terraform/CycleCloud/NetApp provider errors)
- **Total mslearn JSONL**: 21 entries | **Total scanned URLs**: 21 | **Search queries**: 14
- **consecutiveEmptyRounds**: 0 (this round produced new content)
- **Exhausted**: false (fallback search mode, new content found)

### 2026-04-05 ADO Wiki batch (ARM Platform Core + Templates Architecture)
- **Source**: Supportability/AzureDev/Dev_ARM — ARM Architecture pages
- **Pages scanned**: 7 (ARM resource scopes, Infrastructure, Jobs, Request handlers, ARM template processing, ARM template schemas, ARM expressions & functions)
- **Track A (Break/Fix)**: 1 entry — guid() UUID v5 namespace mismatch (arm-ado-wiki-066)
- **Track B (Guide-drafts)**: 4 guides — resource-scopes, infrastructure, template-processing, expressions-functions (arm-ado-wiki-067~070)
- **Skipped**: 3 pages (Jobs, Request handlers, Schemas — pure reference, minimal troubleshooting value)
- **Progress**: 104/162 scanned (64%), 58 remaining

## 2026-04-05 — ADO Wiki Batch (Pages 105-114)

**Source**: ADO Wiki (Supportability/AzureDev/Dev_ARM)
**Pages scanned**: 10 (Bicep, Deployment Stacks, Deployment modes, Extensibility Providers, Template Specs, TLS handshake, HTTP traces, Resource moves, Resource routing types, Tags)
**New entries**: 6 (arm-ado-wiki-071 ~ 076)
- arm-ado-wiki-071: Complete mode accidental resource deletion (Track A)
- arm-ado-wiki-072: Azure CLI "dh key too small" TLS error behind proxy (Track A)
- arm-ado-wiki-073: TLS handshake troubleshooting guide reference (Track B)
- arm-ado-wiki-074: Orphan tags causing tag summarization failure (Track A)
- arm-ado-wiki-075: Tags out of sync between ARM cache and RP (Track A)
- arm-ado-wiki-076: Tags architecture troubleshooting guide reference (Track B)
**Guide drafts**: 2 (azure-cli-tls-handshake, tags-architecture-troubleshooting)
**Skipped**: 4 pages (overview/reference only: Bicep, Deployment Stacks, Extensibility Providers, Template Specs) + 2 brief reference pages (HTTP traces, Resource moves, Resource routing types)
**Progress**: 114/162 scanned (70.4%)

### 2026-04-05 16:17 — ADO Wiki Batch (3 pages)

**Pages processed:**
1. `/[ARM]/.../Basic Concepts/JSON & its perks` → **Skipped** (pure JSON tutorial, no troubleshooting value)
2. `/[ARM]/.../Architecture/Private Link for ARM` → **Track A** — 2 entries (077-078): PLA scope limitation, Public Network Access not available
3. `/[ARM]/.../Role-Based Access Control/Introduction to RBAC` → **Track A** — 2 entries (079-080): deny assignment limitations (first-party RP bypass, user cannot create)

**Stats:** 4 discovered, 0 deduplicated | Remaining: 45/162 pages

### 2026-04-05 ADO Wiki Batch (ARM Core: RBAC, Terraform, Throttling, Scenarios)

**Source**: Supportability/AzureDev/Dev_ARM — ARM Architecture + Scenarios pages
**Pages scanned**: 10
- RBAC evaluation on ARM (architecture)
- Terraform Core Functionality (architecture)
- Terraform on Azure (architecture)
- Throttling (architecture)
- Glossary (reference — skipped, no TSG value)
- Support scope and collaboration scenarios (process)
- Determine if a resource is being used (advisory)
- Move resources across tenants (advisory)
- Access denied because of deny assignment (4 causes)
- Tag cannot be deleted (2 causes)

**Track A (Break/Fix)**: 8 entries (arm-ado-wiki-081 ~ 088)
- 081: Determine if resource is being used — no generic method, use Activity logs + lifecycle RGs
- 082: Move resources across tenants — temp subscription + directory change workaround
- 083: Deny assignment from Managed Application — delete app or contact vendor
- 084: Deny assignment from Blueprint — remove assignment or set Don't Lock
- 085: Deny assignment from 1st party RP (Databricks/Synapse/etc.) — remove parent resource
- 086: Deny assignment internal AME — Portal-only, use CLI/PS
- 087: Orphan tag cannot be deleted — Jarvis fix orphan tags
- 088: Tag out of sync — ARM cache sync at resource scope

**Track B (Guide-drafts)**: 5 entries (arm-ado-wiki-089 ~ 093) + 5 guide draft files
- ado-wiki-rbac-evaluation-on-arm.md (RBAC eval flow, linked access checks, caching)
- ado-wiki-terraform-core-functionality.md (providers, modules, state, commands)
- ado-wiki-terraform-on-azure.md (AzureRM vs AzAPI, aztfexport)
- ado-wiki-arm-throttling-architecture.md (sliding window vs token bucket, ARM vs RP throttle)
- ado-wiki-arm-support-scope-process.md (ownership: Bicep/TF/Portal/SDK/Tags/Copilot)

**Skipped**: 1 page (Glossary — definitions only)
**Deduplicated**: 0
**Progress**: 127/162 scanned (78.4%), 35 remaining

## 2026-04-05 ado-wiki batch (pages 128-132)
- **Batch**: 5 pages from AzureDev/Dev_ARM (Refund requests, Service updates, Start Here, Template Specs, Deployments)
- **Track A**: 1 entry (arm-ado-wiki-094: ARM refund requests — no public SLA)
- **Track B**: 2 guide drafts (Start Here overview, Deployments basic troubleshooting)
- **Skipped**: 2 pages (Service updates = changelog only, Template Specs = placeholder [todo])
- **Remaining**: 30 pages

## 2026-04-05 mslearn fallback-search batch (queries 31-34)
- **Queries**: MG hierarchy troubleshoot, subscription transfer, ARM complete mode, API version errors
- **Fetched**: 6 pages (MG troubleshoot, deployment modes, RBAC transfer-subscription, MG billing conflict, billing-subscription-transfer, subscription-transfer hub)
- **Track A**: 11 entries (arm-mslearn-050..061): MG API 15MB limit, Complete mode DeploymentFailedCleanUp, condition=false deletion, Incremental property reset, MG billing conflict, RBAC custom role MG limits x3, billing transfer access denied, Marketplace payment type, Key Vault CMK unrecoverable
- **Track B**: 1 guide draft (subscription Entra directory transfer recovery)
- **Deduplicated**: 0 (all new topics)
- **Status**: 62 total entries, 55 URLs scanned, 34 queries, exhausted=false

## 2026-04-05 ado-wiki batch-a (blast-batch, batchId=a, pages processed in this batch)
- **Source**: ADO Wiki Supportability/AzureDev/Dev_ARM — Azure Policy Scenarios + Special pages
- **Pages scanned**: 10 (batchId=a, from /tmp/next-arm-a.json)
- **Track A (Break/Fix)**: 15 entries (arm-ado-wiki-a-022 ~ arm-ado-wiki-a-037)
  - 022: Deleted resource scanned by Policy / Resource Not Found → ARM cache out of sync → trigger ARM sync
  - 023: Non-taggable resources in Indexed mode (no UI) → tag via All Resources / CLI / PS
  - 024: Non-taggable resources in Indexed mode (routingType=Default bug) → RP fix needed
  - 025: Policy compliance 0 resources: wrong mode (Indexed+proxy) → change to All
  - 026: Policy compliance 0 resources: no matching resources → adjust definition or scope
  - 027: Policy compliance 0 resources: notScopes/exemptions covering all resources → remove exclusions
  - 028: Policy deployment fails: ARM template engine processes policy [[]] functions → escape with [[
  - 029: Resource type denied despite being in allow list → child resource type triggered with different correlationId
  - 030: SQL master DB not scanned by Policy (Audit/Deny) → by design
  - 032: Compute VM diagnosticSettings extension can't be enabled via Portal → use PS/CLI
  - 033: Logic/workflows Policy scan disabled in MS tenants → use non-MS tenant for testing
  - 034: NSG securityRules policy needs dual targeting (parent+child) → add both resource types
  - 035: PowerPlatform logical regions not in allowed-locations strongType → add via CLI/API
  - 036: Web/sites PUT-as-PATCH causes null property evaluation → append+deny pattern
  - 037: Web/sites/config siteConfig always inconsistent on brownfield → target sites/config child resource
- **Track B (Guide-drafts)**: 3 entries (arm-ado-wiki-a-031, 038, 039) + 3 draft files
  - ado-wiki-a-policy-service-updates.md (Azure Policy changelog 2021-2023)
  - ado-wiki-a-policy-start-here.md (Azure Policy support triage index)
  - ado-wiki-a-assistance-with-aliases.md (alias authoring process guide)
- **Deduplicated**: 0 (per-batch isolation)
| 2026-04-06 | ado-wiki | Phase 3b-blast batch-b: Scanned 10/162 pages (AzureAdaptiveCloud disconnected ops). 6 new issues (1 guide-draft + 5 Break/Fix). Pages 1-5,7 were trivial SF app listings (skipped extraction). Page 6 (Billing) informational only. Page 8 → deployment log investigation guide. Pages 9-10 → HCI cluster quorum + Winfield VM TSGs. | AzureAdaptiveCloud.wiki: Azure Local Disconnected Operations |

**Batch b details** (batchId=b, ID prefix=arm-ado-wiki-b-r2):
- **Track A (Break/Fix)**: 5 entries (arm-ado-wiki-b-r2-002 through 006)
  - 002: 2-node HCI cluster fails in disconnected mode (need 3-node for quorum)
  - 003: Infrastructure VM fails to start (resource/network config)
  - 004: Portal not accessible (IP/certificate/DNS)
  - 005: Network connectivity issues (adapter/DNS config)
  - 006: Endpoint verification fails (portal.autonomous.cloud.private)
- **Track B (Guide-drafts)**: 1 entry (arm-ado-wiki-b-r2-001) + 1 draft file
  - ado-wiki-b-appliance-deployment-investigation.md (log analysis guide with PowerShell script)
- **Skipped (trivial)**: 7 pages (SF app listings, billing info, PKI overview)
- **Deduplicated**: 0 (per-batch isolation)
- **IDs**: arm-ado-wiki-a-022 ~ arm-ado-wiki-a-039 (18 total)

### 2026-04-06 ado-wiki blast batch-a round-3 (AzureAdaptiveCloud disconnected ops)
- **Source**: ADO Wiki Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki — Azure Local Disconnected Operations
- **batchId**: a | **ID prefix**: arm-ado-wiki-a-r3
- **Pages scanned**: 10 (Components Layer 3-4: Portal/ARM/Usage/ASZ/Event RP; Customer Scenarios: Billing, PKI, Appliance Deploy, TSG Deploy Reqs, TSG Winfield VM)
- **Skipped (trivial)**: 5 pages (SF app listings only — Azure Portal, ARM, Usage, ASZ RP, Event RP; ≤97 chars each)
- **Track A (Break/Fix)**: 5 entries (arm-ado-wiki-a-r3-004 through 008)
  - 004: 2-node HCI cluster fails in disconnected mode (cloud witness unavailable → use 3-node)
  - 005: Infrastructure VM fails to start (resources/network config)
  - 006: Portal not accessible (IP/cert/DNS)
  - 007: Network connectivity issues (adapter/DNS)
  - 008: Endpoint verification fails (portal.autonomous.cloud.private)
- **Track B (Guide-drafts)**: 3 entries (arm-ado-wiki-a-r3-001 through 003) + 3 draft files
  - ado-wiki-a-aldo-billing-and-usage.md (licensing/pricing reference)
  - ado-wiki-a-aldo-certificates-pki.md (PKI requirements for disconnected ops)
  - ado-wiki-a-aldo-appliance-deployment-investigation.md (deployment log analysis with PS script)
- **Deduplicated**: 0 (per-batch isolation)
- **Note**: Pages 8-10 overlap with batch-b assignment — cross-batch dedup deferred to MERGE
| 2026-04-06 | ado-wiki (blast-b) | +3 guide-draft entries (RDMA Configuration, Fallback Log Collection, Fallback Logging), 7 TBD/empty pages skipped. Batch b: 10 pages processed from AzureAdaptiveCloud wiki (ALDO Deployment/Networking + Diagnostics/Monitoring). | Supportability/AzureAdaptiveCloud |
| 2026-04-06 | ado-wiki (blast-a-r5) | +9 JSONL entries (6 break/fix + 3 guide-draft). Batch a round 5: 10 pages from ALDO Networking/RDMA + Diagnostics/Monitoring. 4 pages had content, 6 were TBD/empty. | Supportability/AzureAdaptiveCloud |

**Batch a-r5 Details**:
- **Track A Break/Fix** (6 entries):
  - arm-ado-wiki-a-r5-001: RDMA Flow Control must be disabled to prevent global pause frames
  - arm-ado-wiki-a-r5-002: VLAN tags required for PFC — without them switches ignore QoS
  - arm-ado-wiki-a-r5-003: DCBX Willing mode must be False to prevent config drift
  - arm-ado-wiki-a-r5-004: RDMA Completion Queue Errors indicate driver/firmware issue
  - arm-ado-wiki-a-r5-005: Fallback logging when IRVM is down (Copy/Send-DiagnosticData)
  - arm-ado-wiki-a-r5-006: Support engineer log upload via DTM when customer can't Send
- **Track B Guide Drafts** (3 entries):
  - ado-wiki-a-rdma-configuration.md (comprehensive RDMA validation/troubleshooting)
  - ado-wiki-a-fallback-log-collection.md (appliance fallback logging procedure, Azure Local 2411.1+)
  - ado-wiki-a-fallback-logging.md (Winfield fallback logging overview + CSS upload process)
- **Empty/TBD pages** (6): Registration, Scaling, Security, Updating, HCI Monitoring, K8s Monitoring
- **Deduplicated**: 0 (per-batch isolation)
| 2026-04-06 | ado-wiki (blast-b) | +8 entries (6 break/fix + 2 guide-draft), 2 guide drafts, 10 pages scanned | ALDO Winfield Diagnostics/Ops/Workloads |
- **Break/Fix (Track A, 6 entries)**:
  - Portal connectivity TSG (4 issues): DNS name resolution, certificate installation, portal access, resource provider registration for Winfield
  - IRVM01 fails to restore with error 0xC000A002 — TPM authentication tag mismatch, mitigate with Stop-VM -Force + Start-VM
  - K8S cluster DNS resolution failure connecting to Winfield — CoreDNS ConfigMap needs Winfield host entries
- **Guide Drafts (Track B, 2 entries)**:
  - ado-wiki-b-on-demand-log-collection.md (3-scenario log collection: direct/indirect/fallback, Azure Local 2411.1+)
  - ado-wiki-b-winfield-health.md (health check commands: Get-WinfieldHealthState, portal ping)
- **Empty/TBD pages** (5): Log Collection (redirect link only), BCDR (stub), Certificate Rotation (TBD), Product Updates (TBD), Arc VM Management (stub with link)
| 2026-04-06 | ado-wiki (blast-a) | +4 entries (2 Track A break/fix, 2 Track B guide-drafts) from ALDO wiki batch a (10 pages) | AzureAdaptiveCloud.wiki |

**Blast Batch a Details** (arm-ado-wiki-a-r7-001..004):
- **Break/Fix (Track A, 2 entries)**:
  - Linux server can't connect to Winfield — Export-WinfieldRootCert exports incompatible cert format; re-export as Base-64 X.509
  - ALDO bootstrap fails on build 2602.2.25259 — CRL check blocks arc initialization; disable via windows.mae.config.json
- **Guide Drafts (Track B, 2 entries)**:
  - ado-wiki-a-microsoft-365-local.md (M365 Local workloads on ALDO: Exchange/SharePoint/Skype, GA status, sovereign cloud)
  - ado-wiki-a-appliance-deployment.md (CSS lab single-node ALDO appliance deployment procedure)
- **Empty/Thin pages** (6): ACR (support boundaries only), AKS Hybrid (support boundaries), Azure Local machines (support boundaries), KeyVault (empty), Sovereign Cloud Knowledge Guide (fetch failed - double space in path), Multi-node labs (tracking table)

### 2026-04-06 10:41 — ado-wiki blast batch-b (ALDO pages)
- **batchId**: b | **pages**: 10 | **discovered**: 2 | **deduplicated**: 0
- Track A: 2 entries (Linux cert TSG, bootstrap CRL fix)
- Track B: 0 guides
- Skipped: 8 pages (support boundaries, empty, lab tracking, fetch failed)
- Files: known-issues-ado-wiki-b.jsonl, scanned-ado-wiki-b.json

### 2026-04-06 ado-wiki blast batch-b round r7
- **batchId**: b | **pages**: 10 | **discovered**: 2 | **deduplicated**: 0
- Track A (break/fix): 2 entries
  - `arm-ado-wiki-b-r7-001`: Linux→Winfield cert incompatible (Export-WinfieldRootCert format issue, re-export as Base-64 X.509)
  - `arm-ado-wiki-b-r7-002`: ALDO bootstrap fails on 2602.2.25259 (CRL check blocks arc init, disable via PowerShell)
- Track B (guides): 0 drafts
- Skipped: 8 pages — 5 thin reference/hub pages (ACR, AKS, Azure Local machines, KeyVault, M365 Local awareness), 1 page 404 (Sovereign Cloud Knowledge Guide), 2 lab pages (multi-node tracking, appliance deployment procedure)

### 2026-04-06 10:51 — ado-wiki blast batch-b (ALDO labs/readiness) [re-run r9]
- **Pages processed**: 10 (all from AzureAdaptiveCloud wiki, ALDO subsection)
- **Track A (break-fix)**: 5 — KeyVault RBAC 30-min delay, menu system error, data disk script mismatch, ALCSS23 deployment blocker, ALM failure troubleshooting
- **Track B (guide-draft)**: 9 — single-node guides (Azure Local Deployment, Node Prep, Baremetal, DC Prep, VM Deployment), multi-node lab reference, training resources, readiness plan, ALM architecture
- **Skipped content**: Page 5 (Post Steps and Cleanup = "TBD"), still marked scanned
- **Deduplicated**: 0 (new batch file, no prior entries to dedup against)
- **JSONL**: .enrich/known-issues-ado-wiki-b.jsonl (14 entries, IDs arm-ado-wiki-b-r9-001..014)
- **Scanned**: .enrich/scanned-ado-wiki-b.json (10 pages)
- **Drafts**: guides/drafts/ado-wiki-b-aldo-*.md (9 files)

### 2026-04-06 ado-wiki blast batch-a round 9
- **batchId**: a | **round**: r9 | **mode**: blast-batch
- **pagesProcessed**: 10 (8 with content, 1 links-only, 1 fetch-failed)
- **discovered**: 8 guide-draft entries (all Track B — troubleshooting guides / reference)
- **deduplicated**: 0
- **IDs**: arm-ado-wiki-a-r9-001 → arm-ado-wiki-a-r9-008
- **Topics**: Azure Local ALDO infrastructure — node-local agents, registration extensions, core clustered services, Arc Resource Bridge troubleshooting, MocARB diagnostic commands, MOC troubleshooting, MOC vs ArcHci modules, IRVM/Winfield appliance
- **Skipped**: "Host virtualization" (links-only page), "ALDO Networking Readiness" (Dev_ARM wiki, fetch failed)

## 2026-04-06 ado-wiki blast batch-b (r10)
- **batchId**: b
- **pages assigned**: 10
- **pages fetched**: 8 (1 not found, 1 minimal/skipped)
- **Track A**: 2 entries (wssdcloudagent false-alarm, ALDO virtual deploy unsupported)
- **Track B**: 8 guide-drafts (Azure Local agents, extensions, clustered services, ARB troubleshooting, MocARB diagnostic commands, MOC troubleshooting, MOC vs ArcHci modules, IRVM/Winfield)
- **deduplicated**: 0
- **Topic**: Azure Local Disconnected Operations (ALDO) infrastructure — agents, services, ARB, MOC, IRVM
- **Skipped**: Page 7 (Host virtualization — only links, no content), Page 9 (ALDO Networking Readiness — WikiPageNotFoundException 404)

---

### 2026-04-06 — ado-wiki blast batch-b (ALDO Infrastructure)

- **Source**: ADO Wiki (Supportability/AzureAdaptiveCloud + AzureDev/Dev_ARM)
- **Batch**: b | ID range: arm-ado-wiki-b-r11-001 ~ arm-ado-wiki-b-r11-011
- **Pages assigned**: 10 | **Pages processed**: 8 | **Skipped**: 2
- **Track A (break/fix)**: 3 entries
  - arm-ado-wiki-b-r11-001: ARB telemetry-manager CrashLoopBackOff diagnosis
  - arm-ado-wiki-b-r11-002: IRVM disconnected fallback logging
  - arm-ado-wiki-b-r11-003: MOC wssdcloudagent/wssdagent troubleshooting
- **Track B (guide-drafts)**: 8 drafts
  - Azure Local Agents, Registration Extensions, Core Clustered Services
  - Arc Resource Bridge TSG, Diagnostic Commands, MOC TSG, MOC vs ArcHci, IRVM
- **Skipped pages**: Host virtualization (links only), ALDO Networking Readiness (404)
- **discovered**: 11 | **deduplicated**: 0

### 2026-04-06 ado-wiki batch-b round r12
- **Pages assigned**: 10 (from blast-assign-b.json)
- **Pages 404**: 1 (Networking optionsat deployment — path not found)
- **Pages processed**: 9 (content read successfully)
- **Track A (break/fix)**: 4 entries (Add Node: 3 issues — ComponentID mismatch, Network ATC failure, Storage Jobs; Kerberos: 1 issue — SPN/NTLM fallback)
- **Track B (guide-draft)**: 7 entries (Repair Node, Draining/Resuming Node, Manage Certs SDN, Secure NC, Update NC Certs, Update SDN Infra Certs, Assign Public IP)
- **Total discovered**: 11 | **deduplicated**: 0
- **IDs**: arm-ado-wiki-b-r12-001 through arm-ado-wiki-b-r12-011
- **Topics**: ALDO Node Management (add/repair/drain/resume), SDN Security (Kerberos, certificates, NC security, public IP)

### 2026-04-06 ado-wiki batch-b round r13
- **Pages assigned**: 10 (same as r12, from blast-assign-b.json)
- **Pages 404**: 1 (Networking optionsat deployment — path still not found)
- **Pages processed**: 9 (content verified, identical to r12)
- **Track A**: 0 new (3 Add Node + 1 Kerberos all dedup >80% vs r12-001..004)
- **Track B**: 0 new (7 guide-drafts all dedup >80% vs r12-005..011)
- **Total discovered**: 0 | **deduplicated**: 11 (full dedup against r12)
- **Note**: Wiki content unchanged since r12; all entries and drafts already exist

### 2026-04-06 — ado-wiki blast batch-a (r13)
- **Source**: ADO Wiki (AzureAdaptiveCloud.wiki — ALDO Readiness)
- **Pages processed**: 10 (SDN trace, ReFS Dedup, Thin Provisioning, Intro ALDO, Fallback Log, Kusto Clusters, On-Demand Log, System Req, Deploy AKS, Monitor AKS)
- **Track A (Break/Fix)**: 4 entries (SDN network trace capture, Fallback log collection, On-demand direct/indirect log collection)
- **Track B (Guide-draft)**: 7 entries (ALDO intro, ReFS dedup, Thin provisioning, Kusto clusters, System requirements, Deploy AKS, Monitor AKS)
- **Deduplicated**: 1 (On-Demand fallback scenario ≈ Fallback Log Collection page)
- **Total discovered**: 11 | **Net written**: 11
- **Isolation**: known-issues-ado-wiki-a.jsonl, scanned-ado-wiki-a.json, ID prefix: arm-ado-wiki-a-r13-*

### 2026-04-06 ado-wiki blast batch-a round r14
- **Source**: ADO Wiki (AzureAdaptiveCloud.wiki — ALDO Workloads: AKS Arc, Arc K8s, Arc VM, ACR, Azure Local VMs)
- **Pages assigned**: 10 | **Pages fetched**: 8 | **Failed**: 2 (Bootstrap Tracking double-space path, Demystifying CLI Modules colon in path)
- **Track A (Break/Fix)**: 2 entries
  - arm-ado-wiki-a-r14-001: AKS nodepool add --os-sku validation error (valid: CBLMariner/Windows2019/Windows2022)
  - arm-ado-wiki-a-r14-002: ACR admin not enabled — credential show/login fails in disconnected env
- **Track B (Guide-draft)**: 6 entries + 6 draft files
  - ado-wiki-a-connect-to-aks-arc.md (get credentials, kubectl, SSH master node)
  - ado-wiki-a-arc-enabled-k8s-clusters.md (Arc K8s vs AKS Arc comparison)
  - ado-wiki-a-azure-arc-vm-management.md (VM management practices comparison table)
  - ado-wiki-a-testing-acr-css-labs.md (connected + disconnected ACR image workflows)
  - ado-wiki-a-azure-local-vms.md (supported OS, limitations, CLI-only provisioning)
  - ado-wiki-a-best-practices-azure-local-vms.md (7-section best practices: infra/security/lifecycle/storage/monitoring/sync/compliance)
- **Deduplicated**: 0 (per-batch isolation)
- **Isolation**: known-issues-ado-wiki-a.jsonl, scanned-ado-wiki-a.json, ID prefix: arm-ado-wiki-a-r14-*

### 2026-04-06 — ado-wiki blast batch-b (r17)
- **Pages processed**: 10 (ALDO Readiness: SDN trace, ReFS Dedup, Thin Provisioning, Intro to ALDO, Fallback Log Collection, Kusto Clusters, On-Demand Log Collection, System Requirements, Deploy AKS CSS Labs, Monitor AKS)
- **Track A (break/fix)**: 2 — SDN network trace capture procedure, Fallback log collection when appliance VM down
- **Track B (guide drafts)**: 8 — ReFS, Thin Provisioning, ALDO intro, Kusto Clusters, On-Demand Log Collection, System Requirements, Deploy AKS, Monitor AKS
- **Discovered**: 10, **Deduplicated**: 0
- **IDs**: arm-ado-wiki-b-r17-001 .. arm-ado-wiki-b-r17-010
- **Files**: .enrich/known-issues-ado-wiki-b.jsonl (10 entries), .enrich/scanned-ado-wiki-b.json (10 pages), 8 draft files in guides/drafts/ado-wiki-b-*.md
| 2026-04-06 | ado-wiki (blast-a r16) | +8 entries from AzureAdaptiveCloud wiki (Nexus Customer Scenarios + ALDO Workloads) | batch-a r16 |
- **Track A (break/fix)**: 3 — NAKS collector script workaround (SSH+scp), Transient TLS handshake errors (retry-first), Counter-based metrics no data (by-design)
- **Track B (guide drafts)**: 5 — AKS CLI modules comparison, Nexus Standard Networking Architecture, BMM Secret Rotation Time, NNF Feature Flags extraction, Nexus Observability diagnostics
- **Pages NOT FOUND**: 2 (Sample Policy double-space path, AON Network Fabric double-space path)
- **Discovered**: 8, **Deduplicated**: 0
- **IDs**: arm-ado-wiki-a-r16-001 .. arm-ado-wiki-a-r16-008
- **Files**: .enrich/known-issues-ado-wiki-a.jsonl (8 entries), .enrich/scanned-ado-wiki-a.json (10 pages), 5 draft files in guides/drafts/ado-wiki-a-*.md
| 2026-04-07 | SYNTHESIZE | 60 topics (39 fusion, 21 compact), 501 entries, 19 Kusto queries fused |

### 2026-04-17T10:12:31Z — contentidea-kb refresh (arm)
- **WIQL**: 43 work items (keywords: Resource Manager, Azure Arc)
- **Already scanned**: 43
- **New unscanned**: 0
- **Result**: exhausted=true, 7-day refresh completed, no new KB articles found
| 2026-04-24 | SYNTHESIZE | Phase 2.5 + §5: 60 topics indexed, _index.search.jsonl generated, _index.md reformatted | incremental |
