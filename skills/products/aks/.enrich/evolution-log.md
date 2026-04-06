# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-06 | ado-wiki (blast-a r8) | +9 break/fix (aks-ado-wiki-a-r8-004~012): blobfuse kernel cache sync, vmssCSE exit codes 50/51/52/25/31, AKSCapacityError constrained region, AgentBaker ConfigVersionError, DiskControllerType NVMe mismatch. +3 guide-drafts: AGIC health-probe, AGIC main-workflow, AGIC SSL. 10 pages (2 empty skipped), 0 dedup. | Containers Wiki AGIC+CRUD TSGs |
| 2026-04-06 | ado-wiki (blast-b) | +6 break/fix (aks-ado-wiki-b-r5-001~009): virtual node UDR subnet error, AGIC 404 path-prefix, AGIC 502 rolling-update, AGIC 504 timeout, AGIC ARM dial-timeout, AGIC RBAC auth-failed. +5 guide-drafts: Istio latency diagnosis, AGIC routing verification, AGIC config-updates check, AGIC pod-not-healthy, AGIC backend-app-issues. 10 pages processed, 0 dedup. | Containers Wiki /AKS/TSG/Network+AGIC |
| 2026-04-05 | onenote | +9 entries (aks-onenote-226~234): control plane deallocation after 30d, CoreDNS upgrade w/o notification, Az CLI Mooncake version gaps, node NotReady DNS resolution, Terraform NSG conflict, system nodepool constraints, pod eviction CPU spike, metrics-server CrashLoopBackOff, cross-product ownership guide-draft. 3 dedup skips (authorized IP, Calico, kubectl-node-shell). Scanned 342/464. | FY20-FY21 PG Sync meeting notes |
| 2026-04-05 | onenote | +4 entries (aks-onenote-109~112): underlay update→API down, etcdserver leader changed, VMStartTimedOut scaling, ephemeral OS disk remediator. 6 pages skipped (empty/link-only headers). 1 dedup (tunnel/OpenVPN ≥80% overlap w/ aks-onenote-001). Scanned 162/464. | FY22 team meeting notes |
| 2026-04-05 | ado-wiki | +5 entries (aks-ado-wiki-335~339): Azure CNI dynamic IP pod subnet exhaustion (2 break/fix), AKS HTTP Proxy walkthrough (2 break/fix + guide-draft) | Containers Wiki |
| 2026-04-05 | ado-wiki | +2 guide-drafts (FluentBit custom logging, Disable env vars on AKS); 1 skipped (links-only page); scanned 527/1541 | Containers Wiki /AKS/How Tos/Monitoring/* |
| 2026-04-02 | case | 排查 AKS PSS/PSA 配置 — 确认 PSA 是 K8s 原生功能在 21v 完全可用；Deployment Safeguards 和 Azure Policy add-on 需额外验证 21v 可用性 | 2604020010000708 |
| 2026-04-04 | 21v-gap-scan | 5 unsupported features, 8 partial/limited features — 写入 21v-gaps.json + known-issues-21v-gap.jsonl (8 entries) | Feature Landing Status + FY25/FY26 PG sync notes |
| 2026-04-04 | onenote-extract | Top 10 high-confidence AKS pages scanned (464 total). 6 Break/Fix entries → known-issues-onenote.jsonl; 4 guides → guides/drafts/. Topics: kubectl tunnel timeout, IP exhaustion, containerd/crictl, Azure Monitor failed state, ARM throttling 429, DNS NIC avset propagation. | MCVKB/Net/8.AKS + MCVKB/VM+SCIM/18.AKS |
| 2026-04-05 | contentidea-kb-scan | Scanned 10/21 ContentIdea KB work items (keyword: Kubernetes). 8 Break/Fix entries → known-issues-contentidea-kb.jsonl; 2 skipped (no structured fields). Topics: Helm chart download, kubectl on Windows, Fluentd OOM, AKS Hybrid PVC, GKE Autopilot Arc onboarding, Oracle Linux iptables, GitOps Flux V2 OpenShift SCC, Kyverno policy blocking Arc. | ContentIdea WIQL query |
| 2026-04-05 | ado-wiki-scan | Batch 3 pages (ACR How Tos). 1 Track A (ACR tasks diagnostics via BuildHostTrace Kusto), 1 Track B guide-draft (BuildKit + secret passing), 1 skipped (feedback forum process doc). Total scanned: 198/1541. | Supportability/AzureContainers wiki |

[2026-04-04] ado-wiki-scan Step 3a: indexed 1541 pages from Supportability/AzureContainers (Containers Wiki). scanned=0, exhausted=false.
[2026-04-05] onenote-extract (aks): +8 discovered, 1 deduped (PID exhaustion overlap with aks-onenote-014), 1 skipped (ARM/CRP page too large). Scanned 10 POD Case Study pages. 412 AKS pages remaining.

[2026-04-05] ado-wiki-scan: +9 entries (7 break/fix, 2 guide-drafts) from 5 ACI pages (Emerging Issues, Known Issues, Vulnerability Q&A, IcM-required list, Product Info). Total: 13 entries in known-issues-ado-wiki.jsonl. 1531 pages remaining.
[2026-04-05] onenote-extract (aks): scanned 10 pages, extracted 5 entries (aks-onenote-041~045), deduped 1 (monitoring addon failed state ~aks-onenote-004), skipped 4 (headers/no-content/questions). Total scanned: 62/464.
[2026-04-05] contentidea-kb-scan: +11 entries (total 19), 0 deduped, 21/21 scanned — exhausted
[2026-04-05] ado-wiki-scan tick: 5 pages scanned (1 empty), 4 new entries (aks-ado-wiki-017~020), 1 guide draft (GPU failures). Track A: 3, Track B: 1. Remaining: 1516 pages.
[2026-04-05] mslearn-scan: +14 entries (12 break/fix, 2 guide-drafts) from 8 URLs. Topics: Node NotReady (network/CSE/certs/intermittent/PID), OOMKilled (system+user pods), Pod scheduler errors, CPU pressure PSI. Remaining: 166 URLs.

## 2026-04-05 ado-wiki tick
- Scanned 1 page (batch limited by 15000 char budget)
- Track B: 1 how-to guide draft (aci-sync-ip-private-dns)
- New JSONL: aks-ado-wiki-021 (guide-draft)
- Progress: 26/1541 scanned
 | ado-wiki | +3 entries (aks-ado-wiki-022~024) | 2 pages: ACI IP→AppGw sync, ACI Quota check | 1 guide-draft
2026-04-05 01:17 | ado-wiki | +3 entries (aks-ado-wiki-022~024) | 2 pages: ACI IP to AppGw sync, ACI Quota check | 1 guide-draft

## 2026-04-05 ado-wiki tick (028-031)
- Pages: 4 (ACI How-To: keepalive, DNS reuse, tcpdump, DNS sync)
- Track A: 2 break/fix entries (connection timeout, IP change DNS stale)
- Track B: 2 guide drafts (dns-label-reuse, tcpdump-network-capture)
- Scanned: 35/1541, remaining: 1506

## 2026-04-05 ado-wiki tick
- **Pages scanned**: 4 (View VNET used by ACI, Atlas Creation Flow, ACI Network Troubleshooting Methodology, ACI Spot Containers)
- **Track A entries**: 3 (aks-ado-wiki-032~034: NetworkProfileIdPlaceholder VNET lookup, Spot container limitations, Spot eviction)
- **Track B guides**: 2 (Atlas Creation Flow, ACI Network Troubleshooting Methodology)
- **Remaining**: 1502 pages

## 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (4 reference/link pages + 6 case study pages)
- **Track A entries**: 7 (aks-onenote-063 to 069) — MI mount, Log Analytics, key rotation, Resource Health, tags
- **Track B guide-drafts**: 1 (AAD RBAC configuration guide)
- **Deduplicated**: 0
- **Total JSONL entries**: 71
- **Scanned**: 102 / 464 pages
- **Exhausted**: false

## 2026-04-05 ado-wiki tick (batch: pages 0-1)
- Scanned: 2 pages (Azure Copilot ACI Handlers, Confidential Containers)
- Copilot Handlers: informational page, no TSG content → skipped
- Confidential Containers: rich TSG with 6 break/fix entries extracted (aks-ado-wiki-037~042)
  - CCE Policy rego compilation errors, invalid command, device hash not found (cached image), framework SVN mismatch, exit code 139 (Ubuntu 22.04), confcom auth for private registries
- Total scanned: 41/1541, remaining: 1500

## 2026-04-05 onenote-extract tick (Phase 2)
- **Pages processed**: 10 (batch from Feature Landing Status, Readiness, LSI sections)
- **Discovered**: 2 new issues (aks-onenote-071: reconcile on unsupported version warning, aks-onenote-072: WIZ aws-sdk-go v1 EOL false positive)
- **Deduplicated**: 2 (ephemeral disk ≥80% overlap aks-onenote-032, cert expired LSI ≥80% overlap aks-onenote-018)
- **Skipped**: 6 pages (training plans, empty headers, feature docs with links only)
- **Total entries**: 72 | **Scanned**: 112/464 | **Remaining**: 352
- **Exhausted**: false

## 2026-04-05 ado-wiki tick
- **scanned**: 3 pages (Container Group restart due to Platform events, Managed Identity Auth Image Pulls, Standby Pools)
- **Track A**: 1 break/fix (aks-ado-wiki-043: ACI restart due to platform events)
- **Track B**: 2 guide drafts (aks-ado-wiki-044: MI image pull, aks-ado-wiki-045: standby pools)
- **discovered**: 3, **deduplicated**: 0
- **progress**: 44/1541 scanned, 1497 remaining

## 2026-04-05 ado-wiki tick (batch)
- **Scanned**: 1 page (6480 chars)
- **Extracted**: 1 Break/Fix entry (aks-ado-wiki-046: ACI subnet/VNet deletion blocked by orphan network profile)
- **Deduplicated**: 0 (1 partial overlap with aks-ado-wiki-006, appended with relatedTo)
- **Remaining**: 1496 pages

## 2026-04-05 Phase 2 onenote-extract (tick)

- **Pages processed**: 10 (Mooncake POD Support Notebook)
- **Track A (Break/Fix)**: 6 new entries (aks-onenote-073 ~ 078)
  - 073: Kyverno MutatingWebhook blocks pod creation during AKS node upgrade
  - 074: UMI lacking Network Contributor causes LB probe failure after VMAS→VMSS upgrade
  - 075: IP conflict (PrivateIPAddressIsAllocated) during reconcile after UMI RBAC fix
  - 076: New node pool defaults to VirtualMachines type (release 2025-07-20 breaking change)
  - 077: AKS Kusto endpoint migration (akscn → mcakshuba), BBM→ManagedClusterSnapshot
  - 078: CSE error codes 50/51 (outbound conn / API server conn failures)
- **Track B (Guide drafts)**: 2 entries (aks-onenote-079 ~ 080)
  - 079: AKS troubleshooting escalation reference (contacts, ICM templates, EOS policy)
  - 080: Autoscaler scale-up/scale-down Kusto diagnostic queries
- **Deduplicated**: 1 (Autoscaler ForceDelete ≈ aks-onenote-068)
- **Skipped**: 1 (ACR CE1 CN1 retirement - not AKS relevant)
- **Total scanned**: 122 / 464
- **Exhausted**: false (342 remaining)

### 2026-04-05 ado-wiki tick
- **Batch**: 2 pages (ACI Spot Containers Evictions, ACI Throttling Managed Identity)
- **Track A**: 1 break/fix (aks-ado-wiki-049: MSI throttling → cache credentials)
- **Track B**: 1 guide draft (aks-ado-wiki-048: Spot eviction investigation Kusto queries)
- **Housekeeping**: Marked 71 previously-processed-but-unrecorded pages as scanned
- **Stats**: discovered=2, deduplicated=0, remaining=1423/1541

### 2026-04-05 ado-wiki tick
- Scanned: 1 page ([TSG] ACI billing related issues)
- Extracted: 1 break/fix entry (aks-ado-wiki-050)
- Topic: ACI billing after stop/deletion due to leaked subscription deployment
- Progress: 120/1541 scanned

### 2026-04-05 ado-wiki tick (chain)
- Scanned: 3 pages (ACI_Docker_RateLimit, AIB ACI Troubleshooting, Cannot delete Vnet/Subnet SAL)
- Extracted: 2 break/fix entries (aks-ado-wiki-051~052)
- Deduplicated: 1 (SAL/subnet deletion overlaps aks-ado-wiki-005)
- Topics: Docker Hub rate limiting post Azure-Docker agreement expiry; AIB mount failure due to NSG/Azure Policy
- Progress: 123/1541 scanned

## 2026-04-05 ado-wiki tick (chain)
- Pages scanned: 3 (Connect to Container BYOVNET, Container Debug Tools, Container Group deployment hangs Waiting)
- Track A: 3 break/fix entries (aks-ado-wiki-053~055)
- Track B: 1 guide draft (aci-container-debug-tools.md) + 1 pointer (aks-ado-wiki-056)
- Total discovered: 4, deduplicated: 0
- Remaining: 1412 / 1541

## 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (LSI_known Issue section)
- **Track A (Break/Fix)**: 10 new entries (aks-onenote-099 ~ 108)
  - 099: Portal sends wrong maintenance window template during AKS creation
  - 100: Konnectivity agent cert expiry → kubectl logs EOF, probe 503
  - 101: Jan 2023 LSI outage (underlay capacity)
  - 102: MCR endpoint change mcr.azk8s.cn → mcr.azure.cn
  - 103: MCR FQDN rename firewall update required
  - 104: Azure File CSI NodeStageVolume missed after node reboot (K8s bug #117513)
  - 105: Platform auto-upgrade N-3→N-2 by-design behavior
  - 106: Legacy AAD integration deprecation
  - 107: Ubuntu kernel 6.2.0-1009-azure outage (TransparentEndpointClient Error)
  - 108: Ingress NGINX retirement Nov 2026, migration paths
- **Track B**: 0 (all pages had clear break/fix or actionable content)
- **Deduplicated**: 0 (MCR entries related to existing aks-onenote-020/023 but different angle)
- **Skipped**: 0 (##MCR support was informational-only but included in scan tracking)
- **Total scanned**: 152 / 464
- **Exhausted**: false (312 remaining)

## 2026-04-05 ado-wiki tick (seq 057-063)

- **Pages scanned**: 4
  - [TSG] Container killing event interruptions unexpected stops → Track A (4 issues: exit code 7147/7148/other, IP change)
  - [TSG] Container taking long time to provision failing → Track B (guide draft)
  - [TSG] DNS Name Reservation → Track A (1 issue: DNS label reservation failure)
  - [TSG] Find app provision deletion flow → Track B (guide draft)
- **Discovered**: 7 entries (5 break/fix + 2 guide-draft)
- **Deduplicated**: 0
- **Progress**: 133/1541 scanned
| 2026-04-05 | ado-wiki-scan | Tick: 7 pages checked (5 empty parent + 2 content). 0 Break/Fix extracted (process docs / index pages with no diagnostic value). Total scanned: 140/1541. | ACI/Emerging Issues, ACI/Emerging and Known Issues |

### 2026-04-05 ado-wiki tick (pages 142-144/1541)
- **Batch**: 3 pages, ~8.2K chars
- **Track A**: 3 entries (aks-ado-wiki-064~066) — Fraud Detected, InaccessibleImage (credentials), InaccessibleImage (ACR firewall)
- **Track B**: 1 guide draft — ado-wiki-aci-find-vm-id-for-cg.md (VM ID lookup via Seabreeze/Kusto)
- **Dedup**: 0 skipped, 1 relatedTo (066→044)
- **Remaining**: ~1397 pages

## 2026-04-05 ado-wiki tick (scanned 150/1541)
- Pages processed: 6 (1 empty skipped)
- Track A (break/fix): 7 entries (aks-ado-wiki-065 to 071) from "List of ACI issues where IcM is required"
- Track B (guide-draft): 4 entries (aks-ado-wiki-064, 072, 073, 074) — ACI vulnerability Q&A, IP sync to Private DNS, IP sync to AppGW, ACI quota check
- Guide drafts created: 4 new files in guides/drafts/
- Remaining: 1391 pages

## 2026-04-05 ado-wiki tick (chain)
- Pages: 2 (Automate Sync ACI IP to AppGw, Check ACI Quota)
- Track B (guide-draft): 2, Track A: 0
- New IDs: aks-ado-wiki-075..076
- Deduplicated: 0
- Scanned: 150/1541 | Remaining: 1391

## 2026-04-05 ado-wiki tick
- Scanned: 1 page (batch by char count: 14072 chars)
- Track B (guide-draft): 1 — ACI TSG Investigate stuck cluster creations
- Track A (break/fix): 0
- New IDs: aks-ado-wiki-077
- Deduplicated: 0
- Progress: 151/1541 scanned (9.8%)

## 2026-04-05 ado-wiki tick
- **source**: ado-wiki
- **pages processed**: 1 (ACR Content Trust Delegation Demo and FAQs)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 1
- **deduplicated**: 0
- **new IDs**: aks-ado-wiki-077
- **exhausted**: false
- **remaining**: ~1389 pages
- **note**: Fixed wiki name from "Azure Kubernetes Service Wiki" to "Containers Wiki" for API calls. Pre-read 20 page lengths cached.
| 2026-04-05 | ado-wiki | ADO Wiki scan tick: 3 pages processed, all deduplicated (already extracted in prior run but missing from scanned list) | Supportability/AzureContainers Wiki |

## 2026-04-05 ado-wiki tick
- Scanned 1 page (SBZ Verifier failures TSG)
- Track B (guide-draft): 1 guide saved
- New entries: aks-ado-wiki-078
- Progress: 156/1541 scanned


## 2026-04-05 ado-wiki tick
- Scanned 14 pages (12 ACI skipped as non-AKS, 2 AKS processed)
- Track B: 1 guide draft (aks-emerging-issues-reporting)
- Track A: 0 break/fix entries (AKS/How Tos was index-only page)
- New IDs: aks-ado-wiki-079
- Progress: 170/1541 scanned (11.0%), 1393 remaining

## 2026-04-05 ado-wiki tick

- **Source**: ado-wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 3 (ACR FailedPullImage NoRouteToHost PE, ACR Image or Repository Recovery, ACR Increase private endpoint limit)
- **Track A (Break/Fix)**: 1 entry (aks-ado-wiki-079)
- **Track B (Guide drafts)**: 2 entries (aks-ado-wiki-080, aks-ado-wiki-081)
- **Deduplicated**: 0
- **Progress**: 173/1541 scanned (11.2%), 1393 remaining

### 2026-04-05 ado-wiki tick
- Pages scanned: 2 (Connected Registry, How Tos)
- Extracted: 3 break/fix entries (aks-ado-wiki-082~084) — ACR Connected Registry Arc extension issues (PVC, bad connection string, ALREADY_ACTIVATED)
- Skipped: How Tos (parent page, no content)
- Progress: 175/1541 scanned

## 2026-04-05 ado-wiki tick (Connected Registry batch)
- **Scanned**: 2 pages (Connected Registry, How Tos parent)
- **Extracted**: 3 Break/Fix entries (aks-ado-wiki-080~082) + 1 guide-draft pointer (083)
- **Guide draft**: `guides/drafts/ado-wiki-acr-connected-registry-troubleshooting.md`
- **Deduplicated**: 0
- **Progress**: 175/1541 scanned, 1391 remaining

### 2026-04-05 ado-wiki tick
- **Scanned**: 4 ACI How-To pages (keep-alive, DNS reuse, tcpdump, IP sync)
- **Track B guide-drafts**: 4 new drafts created
- **JSONL entries**: aks-ado-wiki-085 to aks-ado-wiki-088 (guide-draft pointers)
- **Pre-read cached**: 20 pages (5 ACI parent/empty + 15 ACR/TSG pages)
- **Progress**: 179/1541 scanned (11.6%)

## 2026-04-05 ado-wiki tick
- **Scanned**: 3 pages (ACR API Deprecation Handling, ACR Audit Logs, ACR Behind Firewall)
- **Track A (Break/Fix)**: 1 entry (aks-ado-wiki-087: ACR behind firewall image pull failure)
- **Track B (Guide drafts)**: 2 entries (aks-ado-wiki-085: ACR API deprecation handling, aks-ado-wiki-086: ACR audit logs)
- **Total new entries**: 3 (seq 085-087)
- **Remaining**: 1388 pages

## 2026-04-05 ado-wiki tick (ACR How Tos batch)
- Pages scanned: 3 (ACR API Deprecation Handling, ACR Audit Logs, ACR Behind Firewall)
- Track A (break/fix): 1 entry (aks-ado-wiki-087: ACR image pull fails with vNET firewall)
- Track B (guide-draft): 3 entries (aks-ado-wiki-085/086/088)
- Drafts created/updated: 3 (acr-api-deprecation-handling, acr-audit-logs, acr-behind-firewall)
- Total scanned: 185/1541, remaining: 1356
| 2026-04-05 | ado-wiki | +1 guide-draft (ACR Change Analysis), 5 pages scanned (3 skipped as internal process docs) | Supportability/AzureContainers wiki |

## 2026-04-05 ado-wiki tick (ACR How Tos batch)
- Pages processed: 5 (ACR Case Flow, DevOps template, Change Analysis, Escalation Process, Health-Check)
- Track A: 2 (Change Analysis, Health-Check Background)
- Track B: 2 guide-drafts (Case Flow, Escalation Process)
- Skipped: 1 (DevOps template — pure data collection template)
- New JSONL: aks-ado-wiki-106 ~ 109 (4 entries)
- Scanned: 195/1541, Remaining: 1383

## 2026-04-05 ado-wiki tick (ACR How Tos batch)
- **Pages scanned**: 5 (ACR Case Flow, ACR DevOps Cases Template, ACR Change Analysis, ACR Escalation Process, ACR Health-Check Command)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 5 → `guides/drafts/ado-wiki-acr-*.md`
- **JSONL entries**: aks-ado-wiki-089 ~ 093 (all guide-draft)
- **Deduplicated**: 0
- **Remaining**: 1383 pages

## 2026-04-05 ado-wiki tick
- Scanned 1 page: ACR How to find user of manifest event
- Track B (guide-draft): 1 排查指南
- New ID: aks-ado-wiki-110

## 2026-04-05 ado-wiki tick
- Scanned 1 page: ACR Investigate Bulk Image Tag Deletions (15548 chars)
- Track B (guide-draft): 1 — comprehensive guide for investigating bulk ACR deletions via Kusto/DGREP/ARM/Retention Policy
- New ID: aks-ado-wiki-111
- Progress: 191/1541 scanned, 1382 remaining

| 2026-04-05 | ado-wiki | +1 guide-draft (ACR Private Link setup/DNS config) → aks-ado-wiki-111 | Supportability/AzureContainers wiki |

- **2026-04-05 Phase4b tick**: fetched 8 mslearn URLs (extensions: dapr, eviction-autoscaler, marketplace-offer, key-vault-csi, KEDA, managed-namespaces, network-isolated). Extracted 22 entries (aks-mslearn-187..208). 1 URL skipped (azure-policy-add-on: too thin, just external links). Remaining: 22 URLs.

### 2026-04-05 ado-wiki tick
- **Batch**: 3 pages (14963 chars)
- **Pages**: Build ACR image with Docker BuildKit (Track B → guide-draft), Check ACR tasks and outputs (Track A → 1 entry), Define a great idea to post on ACR feedback forum (skipped, non-TSG)
- **Discovered**: 2 (IDs aks-ado-wiki-112..113)
- **Deduplicated**: 0
- **Scanned**: 195/1541 | Remaining: 1377

## 2026-04-05 — ado-wiki tick (ACR How Tos batch)
- **Scanned**: 5 pages from ACR/How Tos section
- **Track A (Break/Fix)**: 3 entries (aks-ado-wiki-114 ~ 115, 118)
  - ACR locks preventing deletion → multi-level unlock scripts
  - ACR throttling (toomanyrequests) → upgrade tier + Kusto query
  - MCR firewall rules → required FQDNs for mcr.microsoft.com
- **Track B (Guide drafts)**: 2 entries (aks-ado-wiki-116 ~ 117)
  - ACR PG engagement process guide
  - ACR custom domain setup guide
- **Remaining**: 1372 pages unscanned

### 2026-04-05 ado-wiki tick (batch 2)
- **Pages processed**: 3 (ACR How Tos + TSG)
- **Track A (Break/Fix)**: 2 entries (aks-ado-wiki-119 ~ 120)
  - 503 Egress storage throttling on ACR pull
  - ACR authentication failure after disabling ARM-scoped auth
- **Track B (Guide drafts)**: 1 entry (aks-ado-wiki-118)
  - Cross-tenant ACR-AKS pull setup
- **Skipped**: 0
- **Deduplicated**: 0
- **Remaining**: 1335 pages unscanned

### 2026-04-05 ado-wiki tick (batch: ACI How-To/Platform/Tools/TSG)
- **Pages processed**: 10 (5 content pages + 5 empty parent pages)
- **Track A (Break/Fix)**: 0 new entries (all deduplicated against existing aks-ado-wiki-014/015/032)
- **Track B (Guide drafts)**: 0 new (atlas-creation-flow and diagnostic-tools drafts already exist)
- **Skipped**: 1 (ACI Queries — too brief, just a pointer)
- **Deduplicated**: 4 (matched existing JSONL entries ≥80%)
- **Remaining**: 1502 pages unscanned

## 2026-04-05 ado-wiki tick
- Scanned: 1 page (ACR Authorization RBAC-ABAC, 20552 chars)
- Track B (guide-draft): 1 — acr-authorization-rbac-abac.md (multi-scenario RBAC/ABAC/CheckAccess troubleshooting with Kusto queries)
- Track A (break/fix): 0
- New entries: aks-ado-wiki-121 (guide-draft)
- Pre-read cached: 20 page lengths
- Remaining: ~1368 pages

### 2026-04-05 ado-wiki tick
- **Batch**: 4 pages (ACR DNS/Name Reservation, Docker push unauthorized, FailedPullImage NoRouteToHost PE, Image Recovery)
- **Extracted**: 3 new entries (aks-ado-wiki-121~123)
- **Deduplicated**: 2 (NoRouteToHost=aks-ado-wiki-079, Image Recovery=aks-ado-wiki-080)
- **Track A**: 3 break/fix entries
- **Track B**: 0 guides
- **Remaining**: 1364 pages

### 2026-04-05 ado-wiki tick (chain)
- Pages processed: 2 new (ACR DNS Name Reservation, ACR Docker push unauthorized) + 2 skipped (already scanned)
- Track A entries: 3 (aks-ado-wiki-122 ~ 125 excl. 124)
- Track B guide-drafts: 1 (ado-wiki-acr-dns-name-reservation.md)
- Guide-draft pointer: 1 (aks-ado-wiki-124)
- Deduplicated: 2 (pages 3&4 already had entries 079/080)
- Total new JSONL entries: 4 (122-125)
- Scanned: 220/1541, remaining: ~1321

## 2026-04-05 ado-wiki tick
- Scanned 4 pages (ACR TSG: DNS Name Reservation, Docker push unauthorized, FailedPullImage NoRouteToHost PE, Image/Repo Recovery)
- Extracted 5 entries (aks-ado-wiki-122 ~ 126), all Track A Break/Fix
- 0 deduplicated
- Progress: 224/1541 scanned, 1317 remaining

## 2026-04-05 ado-wiki tick
- Scanned 2 pages (ACR Increase PE limit, ACR Move to AAD Tenant)
- Track B: 2 guide drafts created
- JSONL: aks-ado-wiki-126, aks-ado-wiki-127 (guide-draft)
- Remaining: 1362 pages

### 2026-04-05 ado-wiki tick
- **Scanned**: 3 pages (ACR Pull Image 401, ACR Push Failure no content, ACR Replication CRUD TSG)
- **Track A**: 2 entries (aks-ado-wiki-128, aks-ado-wiki-129)
- **Track B**: 1 guide draft (ado-wiki-acr-replication-crud-tsg.md → aks-ado-wiki-130)
- **Deduplicated**: 0
- **Progress**: 225/1541 scanned (14.6%)

## 2026-04-05 ado-wiki tick
- Pages processed: 3 (ACR Pull Image 401 Anonymous Token, ACR Push Failure no content, ACR Replication CRUD TSG)
- All 3 deduplicated (already exist as aks-ado-wiki-128, 129, 130/133)
- Discovered: 0, Deduplicated: 3
- Progress: 229/1541 scanned (1312 remaining excl. already-indexed)
- Fixed wiki name: "Containers Wiki" (was incorrectly using "AzureContainers.wiki")
- Cached 20 page lengths (ACStor TSG + Fleet Manager)

## 2026-04-05 ado-wiki tick
- **Scanned**: 10 pages (14 paths including empty parent pages)
- **Track A (Break/Fix)**: 5 entries (aks-ado-wiki-128 ~ 132)
  - ACR Pull 401 anonymous token (image not found), ACR Push no content (quarantine), ACR Storage 40TiB limit, ACR Tasks free subscription pause, ACR 403 Virtual WAN Hub
- **Track B (Guide)**: 2 entries (aks-ado-wiki-133 ~ 134)
  - ACR Replication CRUD TSG, ACR Tasks Network Bypass Policy
- **Skipped**: 7 empty/parent pages (no content)
- **Deduplicated**: 0
- **Remaining**: 1348 pages

## 2026-04-05 ado-wiki tick
- Scanned 2 pages: ACR Storage Limit Increase, ACR Tasks Network Bypass Policy
- Both deduplicated (already exist as aks-ado-wiki-130, aks-ado-wiki-134)
- discovered: 0, deduplicated: 2
- Progress: 236/1541 scanned

## 2026-04-05 ado-wiki tick (chain)
- Scanned 4 pages: ACR VNet Firewall Cross Subscription, ACR Webhook App Service, ACR Auth AKS MI, ACR Disabled
- All Track A (Break/Fix): extracted 4 entries (aks-ado-wiki-135 to 138)
- discovered: 4, deduplicated: 0
- Progress: 240/1541 scanned

### 2026-04-05 ado-wiki tick
- Pages processed: 3 content + 6 empty (parent/placeholder)
- Track A: 1 (ACI Long Image Pull times)
- Track B: 2 drafts (ACI Network Troubleshooting Methodology [existing], ACI Spot Containers [new])
- New IDs: aks-ado-wiki-139 ~ 141
- Remaining: 1292 / 1541 pages

### 2026-04-05 ado-wiki tick
- Scanned 3 pages (ACR/TSG batch)
- Page 1 (ACR image deletion investigation): skipped — dedup ≥80% with aks-ado-wiki-111
- Page 2 (SC extension not auto-updating): Track A → aks-ado-wiki-142
- Page 3 (ACR pull unknown blob / manifest invalid): Track A → aks-ado-wiki-143
- Stats: discovered=2, deduplicated=1, remaining=1341

## 2026-04-05 ado-wiki tick

- **Pages processed**: 3 (batch by char limit 13620/15000)
- **Track A (Break/Fix)**: 2 entries (aks-ado-wiki-128, aks-ado-wiki-129)
  - SC extension not auto-updating → image pull fail
  - Function App VNet pull → manifest format limitation
- **Track B (Guide)**: 1 draft (aks-ado-wiki-127)
  - ACR image deletion investigation (multi-step Kusto diagnostic)
- **Deduplicated**: 0
- **Progress**: 255/1541 scanned (16.5%), 1341 remaining
- **exhausted**: false

## 2026-04-05 ado-wiki tick
- **Batch**: 3 pages (14769 chars)
- **Pages**: ACR imagepull forbidden serviceendpoint, ACR private link troubleshooting questions, ACR retention policy for untagged manifests
- **Track A**: 2 break/fix entries (aks-ado-wiki-144, aks-ado-wiki-146)
- **Track B**: 1 guide-draft (aks-ado-wiki-145 → guides/drafts/ado-wiki-acr-private-link-troubleshooting-questions.md)
- **Deduplicated**: 0
- **Remaining**: 1338 pages

## 2026-04-05 ado-wiki tick (ACR TSG batch)
- **Source**: ADO Wiki (Supportability/AzureContainers)
- **Pages processed**: 3 (ACR imagepull forbidden serviceendpoint, ACR private link troubleshooting, ACR retention policy)
- **Track A (Break/Fix)**: 2 entries (aks-ado-wiki-144, 146)
- **Track B (Guide)**: 1 draft (ado-wiki-acr-private-link-troubleshooting.md, aks-ado-wiki-145)
- **Deduplicated**: 0
- **Remaining**: ~1338 pages

## 2026-04-05 ado-wiki tick (pages 259-262)
- **Source**: Supportability/AzureContainers/Containers Wiki — ACR/TSG section
- **Pages scanned**: 4 (ACR delete repo, untagged images in Defender, webhook permissions, AKS image pull from ACR)
- **Extracted**: 4 Break/Fix entries (aks-ado-wiki-147 ~ 150)
- **Deduplicated**: 0
- **Track B guides**: 0
- **Running total**: 262/1541 pages scanned, 182 entries in known-issues-ado-wiki.jsonl

## 2026-04-05 ado-wiki tick (aks-ado-wiki-147..150)
- **Pages processed**: 4 (ACR TSG batch)
- **Track A (Break/Fix)**: 4 entries extracted
  - aks-ado-wiki-147: ACR repository delete fails / portal caching
  - aks-ado-wiki-148: Untagged ACR images in Defender
  - aks-ado-wiki-149: ACR webhook creation permission issue
  - aks-ado-wiki-150: AKS nodes fail to pull images from ACR (SP expired/mismatch)
- **Track B (Guide)**: 0
- **Deduplicated**: 0
- **Remaining**: ~1275 pages

## 2026-04-05 ado-wiki tick (ACR/ACStor/Fleet Manager batch)
- **Pages scanned**: 10 (5 empty parent pages + 2 process/index pages skipped + 3 content pages)
- **Track A (Break/Fix)**: 0
- **Track B (Guide drafts)**: 3 entries (aks-ado-wiki-130 ~ 132)
  - Fleet Manager Geneva Actions reference
  - Fleet Manager Kusto Tables reference
  - Fleet Manager Support Tools reference
- **21v**: All 3 marked 21vApplicable=false (Fleet Manager unsupported in Mooncake)
- **Skipped**: ICM process doc (administrative), TSG index page (no content)
- **Pre-read cached**: 20 page lengths
- **Progress**: 276/1541 scanned, 1265 remaining

## 2026-04-05 ado-wiki tick
- **Pages scanned**: 2 (ACR/TSG/AKS is unable to pull ACR images, ACR/TSG/Caching)
- **Track A entries**: 5 (aks-ado-wiki-151 ~ 155)
- **Track B drafts**: 1 (acr-caching-kusto-logging.md → aks-ado-wiki-156)
- **Deduplicated**: 0
- **Remaining**: 1332 / 1541

### 2026-04-05 ado-wiki tick
- Pages: 2 (ACR/TSG/AKS is unable to pull ACR images, ACR/TSG/Caching)
- Discovered: 5 entries (aks-ado-wiki-156..160)
- Deduplicated: 0
- Track A: 5 (all Break/Fix)
- Track B: 0
- Scanned: 280/1541, remaining: 1261

### 2026-04-05 ado-wiki tick
- Pages scanned: 5 (Azure Copilot ACI Handlers, Confidential Containers, Container Group restart, Managed Identity Auth Image Pulls, Private Link DNS)
- New issues: 6 (aks-ado-wiki-157 to 162)
- Deduplicated: 48 duplicate lines removed from JSONL
- Skipped (already extracted): Confidential Containers main issues (037-042), Container Group restart (043), Managed Identity Auth (044)
- Topics: CCE Policy base64/size/stdio/exec/liveness, Private Link NMAgent race condition

## 2026-04-05 ado-wiki tick

- **Scanned**: 3 pages (ACR TSG section)
  - ContainersApps Creation failure due to ACR name too long → Track A (1 entry)
  - Continuous Patching → Track A (2 entries) + Track B (1 guide draft + 1 pointer)
  - Docker pull issues intermittently → Track A (1 entry)
- **Discovered**: 5 entries (aks-ado-wiki-161 ~ 165)
- **Deduplicated**: 0
- **Guide drafts**: 1 (ado-wiki-acr-continuous-patching-workflow.md)
- **Progress**: 287/1541 scanned (18.6%), 1329 remaining

### 2026-04-05 ado-wiki tick
- **Scanned**: 3 pages (ACR/TSG: ContainerApps ACR name too long, Continuous Patching, Docker pull intermittent)
- **Discovered**: 5 entries (aks-ado-wiki-163 ~ 167)
- **Track A**: 4 break/fix entries
- **Track B**: 1 guide draft (ACR Continuous Patching Troubleshooting)
- **Deduplicated**: 0
- **Remaining**: ~1326 pages

## 2026-04-05 ado-wiki tick
- Pages scanned: 3 (ACR TSG: ContainersApps ACR name too long, Continuous Patching, Docker pull intermittent)
- Track A entries: 4 (aks-ado-wiki-163~165, 167)
- Track B guide drafts: 1 (acr-continuous-patching-workflow)
- Guide-draft pointer: 1 (aks-ado-wiki-166)
- Deduplicated: 0
- Remaining: ~1329 pages

## 2026-04-05 ado-wiki tick (aks-ado-wiki-168~171)
- **Scanned**: 4 pages (ACR TSG: Anonymous Pull, 502 errors, Login Kusto, Defender scan)
- **Track A**: 3 break/fix issues extracted (168: Anonymous Pull REST API limitation, 169: Intermittent 502 from Storage, 171: Defender scan fails with auth-as-arm disabled)
- **Track B**: 1 guide draft (170: ACR Kusto login diagnostics → guides/drafts/ado-wiki-acr-kusto-login-issues.md)
- **21v**: aks-ado-wiki-171 marked 21vApplicable=false (Defender for Containers unsupported in 21v)
- **Dedup**: 171 relatedTo aks-ado-wiki-120 (both about authentication-as-arm), no full duplicates
- **Progress**: 294/1541 scanned (19.1%)

## 2026-04-05 ado-wiki tick
- **Scanned**: 4 pages (ACR TSG section)
- **Track A**: 3 entries (aks-ado-wiki-168~171) — ACR anonymous pull limitation, intermittent 502 from storage, Defender auth-as-arm
- **Track B**: 1 guide draft — ACR login issues Kusto diagnostic
- **21V**: aks-ado-wiki-171 marked 21vApplicable:false (Defender not supported in 21V)
- **Deduplicated**: 0
- **Remaining**: 1243 pages

## 2026-04-05 ado-wiki tick (recovery)
- **Batch**: 4 pages (ACR/TSG: Anonymous Pull, Intermittent 502, Login Issues, Defender Scan)
- **Action**: Recovered from partial run — entries 168-171 already in JSONL but scanned list not updated
- **Cleanup**: Deduplicated JSONL from 177 → 159 lines (removed duplicate entries from failed runs)
- **Discovered**: 0 new (all 4 entries already existed from prior partial run)
- **Deduplicated**: 0 (cleanup of file-level duplicates)
- **Total entries**: 171 (IDs aks-ado-wiki-001 to aks-ado-wiki-171, with gaps)
- **Scanned**: 298/1541 pages (19.3%)
- **Remaining**: 1325 pages
- **Exhausted**: false

### 2026-04-05 ado-wiki tick
- **Page**: Notary Image Signing and Verification
- **Track A**: 7 break/fix issues extracted (aks-ado-wiki-172 ~ 178) — ACR Notation signing/verification errors
- **Track B**: 1 guide draft saved (notary-image-signing-and-verification.md) — overview, scenarios, troubleshooting FAQ, Kusto queries
- **Progress**: 299/1541 scanned, 1242 remaining

## 2026-04-05 ado-wiki tick
- Page: /Azure Kubernetes Service Wiki/ACR/TSG/Notary Image Signing and Verification
- Track A: 5 break/fix entries (aks-ado-wiki-172~176) — Notation signing/verification errors
- Batch: 1 page (22812 chars)
- Progress: 294/1541 scanned
| 2026-04-05 | ado-wiki | +2 break/fix (aks-ado-wiki-179: ACI subnet InUseSubnetCannotBeDeleted, 180: SP role assignment Auth denied) +1 guide-draft (181: ACR registry recovery) | Containers Wiki: ACI/TSG, ACR/TSG |

## 2026-04-05 ado-wiki batch (seq 177-178)
- **Pages processed**: 2 (Recovery of Azure Container Registry, Role Assignment Error For Service Principal)
- **Track A entries**: 2 (aks-ado-wiki-177, aks-ado-wiki-178)
- **Track B drafts**: 0
- **Deduplicated**: 0
- **Remaining unscanned**: 1322/1541

### 2026-04-05 ADO Wiki Scan (batch)
- **Source**: ado-wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 4 (1 empty, 1 guide-draft, 2 break-fix)
- **Track A (Break/Fix)**: 2 entries (aks-ado-wiki-182, aks-ado-wiki-183)
  - Subnet/VNet deletion blocked by orphaned network profiles
  - ACI mount error due to firewall/NSG blocking storage access
- **Track B (Guide)**: 1 draft (ado-wiki-aci-standby-pools.md) → aks-ado-wiki-184
- **Deduplicated**: 0
- **Remaining**: ~1460 pages

## 2026-04-05 ado-wiki tick
- Scanned 1 page (batch limited by next page size 12831)
- Track B (guide-draft): 1 — ACR batch list old images shell script
- New IDs: aks-ado-wiki-185
- Progress: 309/1541 scanned

##  — ado-wiki tick
- Pages processed: 3 (all deduplicated)
- [TSG] ACI GPU Deployment Failures → dup of aks-ado-wiki-018
- [TSG] ACI Spot Containers Customer Errors → dup of aks-ado-wiki-019
- [TSG] ACI Spot Containers Quota Errors → dup of aks-ado-wiki-020
- Discovered: 0 | Deduplicated: 3
- Remaining unscanned: 1457


## 2026-04-05 03:55 — ado-wiki tick
- Pages processed: 3 (all deduplicated)
- [TSG] ACI GPU Deployment Failures → dup of aks-ado-wiki-018
- [TSG] ACI Spot Containers Customer Errors → dup of aks-ado-wiki-019
- [TSG] ACI Spot Containers Quota Errors → dup of aks-ado-wiki-020
- Discovered: 0 | Deduplicated: 3
- Remaining unscanned: 1457
| 2026-04-05 | ado-wiki | +2 entries (aks-ado-wiki-185, 186): ephemeral disk resize error (Track A), zone mapping guide (Track B) | Compute/How Tos | Remaining: 1226 |

### 2026-04-05 ado-wiki tick
- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 1 (ACR/TSG/Slow pull and push performance)
- **Track A entries**: 5 (aks-ado-wiki-186 ~ 190) — ACR slow pull/push diagnosis: server-side vs client-side vs blob storage latency
- **Track B guides**: 0
- **Deduplicated**: 0
- **Remaining**: 1320 pages

### 2026-04-05 ado-wiki tick (chain)
- **Page**: `/Azure Kubernetes Service Wiki/ACR/TSG/Soft Delete`
- **Track A**: 7 Break/Fix entries (aks-ado-wiki-191 ~ 197) — ACR Soft Delete 错误信息与解决方案
- **Track B guides**: 0
- **Deduplicated**: 0
- **Remaining**: 1316 pages

### 2026-04-05 ado-wiki tick (ACR/TSG/Soft Delete)
- **Scanned**: 1 page (15531 chars)
- **Track A**: 5 Break/Fix entries (aks-ado-wiki-191..195) — ACR soft-delete push/import/restore errors
- **Track B**: 0 guide drafts (page is feature spec, not TSG guide)
- **Deduplicated**: 0
- **Progress**: 317/1541 scanned (20.6%)

## 2026-04-05 ado-wiki tick
- Scanned: /Azure Kubernetes Service Wiki/ACR/TSG/Soft Delete (15531 chars)
- Extracted: 8 Break/Fix entries (aks-ado-wiki-191 to 198) — ACR Soft Delete error messages
- Track A: 8 items (CLI errors, push/import conflicts, geo-replication incompatibility)
- Track B: 0 items
- Deduplicated: 0

## 2026-04-05 ado-wiki tick
- Scanned 2 pages (ACR/ASI troubleshooting, ACR Jarvis Actions)
- Extracted: 2 guide-drafts, 1 firewall break/fix (relatedTo aks-ado-wiki-144), 1 RegistrySize break/fix (new)
- Deduplicated: 1 (private endpoint issue overlaps aks-ado-wiki-079/145)
- IDs: aks-ado-wiki-199 ~ 202
- Remaining: 1314 pages
| 2026-04-05 | ado-wiki-scan | Batch 2 pages (ACR tooling: ASI + Jarvis). 3 Track A (PE connectivity, firewall IP denied, registry size recalc), 1 Track B guide-draft (ASI troubleshooting). IDs: aks-ado-wiki-199~202. Total scanned: 322/1541. | Supportability/AzureContainers wiki |
| 2026-04-05 | ado-wiki-scan | Batch 1: 1 page (ACStor/Diskpool Create Failure, 13974 chars). Track B guide-draft → guides/drafts/ado-wiki-acstor-diskpool-create-failure.md + 1 guide-draft JSONL entry (aks-ado-wiki-216). 350/1541 scanned, 1299 remaining. | Supportability/AzureContainers/Containers Wiki |

### 2026-04-05 ado-wiki tick
- Scanned 1 page (ACR Technical Advisors Actions, 23698 chars)
- Extracted 4 break/fix entries (aks-ado-wiki-203~206): ACR restore timeout for TB registries, CMK identity deleted (user/system), ACR 20TB storage limit
- Progress: 323/1541 scanned, 1218 remaining

## 2026-04-05 ado-wiki tick (networking batch 1)
- **Pages scanned**: 2 (Azure_Firewall_rules_Windows_containers, BYO CNI with AKS)
- **Track A entries**: 2 (aks-ado-wiki-203: Windows node scale-up fails with Azure Firewall; aks-ado-wiki-204: DNS fails in BYO CNI pods due to missing br_netfilter)
- **Track B drafts**: 1 (ado-wiki-byo-cni-with-aks.md)
- **Deduplicated**: 0
- **Progress**: 325/1541 scanned (21.1%)

## 2026-04-05 ADO Wiki Scan (tick)
- Source: ado-wiki (Supportability/AzureContainers/Containers Wiki)
- Pages scanned this tick: 10 (1 already-extracted + 3 batch1 + 6 batch2)
- Track A entries: 4 (aks-ado-wiki-208 to 211) — ACStor TSGs
- Track B entries: 1 (aks-ado-wiki-207) — ACR Kusto Queries guide
- Skipped: 5 (admin/access pages, links-only pages, already-extracted page)
- Deduplicated: 0
- 21v-unsupported tagged: 4 (all ACStor entries)
- Total scanned: 335/1541 | Remaining: 1206

## 2026-04-05 ado-wiki tick
- Scanned 6 pages (ACStor Geneva Actions/Logs + 4 TSGs)
- Track A: 7 break/fix entries (aks-ado-wiki-207~213) — ACStor PV ReadOnly, PV/Snapshot/StoragePool creation issues
- Track B: 2 guide-draft entries (aks-ado-wiki-214~215) — Geneva Actions/Logs access
- All ACStor entries marked 21vApplicable=false
- Remaining: 1302 pages

### 2026-04-05 ado-wiki tick
- Scanned 2 pages (ACStor/TSG: Data Integrity Failure, Data Integrity Scrubber Failure)
- Extracted 3 entries (aks-ado-wiki-212 ~ 214): ACStor data integrity failure 排查、磁盘 I/O 错误、Scrubber replica 不同步
- Track A: 3, Track B: 0
- Deduplicated: 0
- Remaining: 1300 pages

## 2026-04-05 ado-wiki scan (ACStor batch)
- Pages scanned: 6 (ACStor Geneva Actions, Geneva Logs, PV ReadOnly, PV Create/Delete, Snapshots, StoragePools)
- Track A (break/fix): 7 entries (aks-ado-wiki-210 ~ 216)
- Track B (guide-draft): 2 entries (aks-ado-wiki-208, 209) + 2 draft files
- All ACStor entries marked 21vApplicable:false (ACStor not available in Mooncake)
- Remaining: ~1299 pages

## 2026-04-05 ado-wiki tick
- **Source**: Supportability/AzureContainers/Containers Wiki
- **Page**: /Azure Kubernetes Service Wiki/ACStor/TSG/Diskpool Delete
- **Track A**: 2 entries (aks-ado-wiki-217, 218) — ACStor diskpool deletion failure
- **Batch**: 1 page (15593 chars)

## 2026-04-05 ado-wiki tick
- **Page**: /Azure Kubernetes Service Wiki/ACStor/TSG/Diskpool Delete
- **Track A**: 1 entry (aks-ado-wiki-217) — StoragePool deletion blocked by admission webhook when PVCs still exist
- **Track B**: Guide draft saved (ado-wiki-acstor-diskpool-delete-failure.md)
- **21v**: ACStor unsupported in Mooncake → 21vApplicable=false
- **Stats**: discovered=1, deduplicated=0

## 2026-04-05 ADO Wiki Scan (tick)
- **Source**: ado-wiki (Supportability/AzureContainers/Containers Wiki)
- **Processed**: 1 page (Diskpool Delete - 15593 chars)
- **Track A**: 1 break/fix entry (aks-ado-wiki-217) - storage pool deletion webhook error
- **Track B**: 1 guide draft (ado-wiki-acstor-diskpool-delete-tsg.md) - full 7-component troubleshooting
- **21v**: Both marked 21vApplicable=false (Azure Container Storage unsupported in 21v)
- **Scanned**: 352/1541 pages (1189 remaining)
- **Exhausted**: false

### 2026-04-05 04:23 | ado-wiki tick
- **Batch**: 2 pages ([TSG] ACI Spot Containers Waiting State Due To Evictions, [TSG] ACI Throttling at Managed Identity service)
- **Result**: Both deduplicated (existing aks-ado-wiki-048, aks-ado-wiki-049)
- **Discovered**: 0 new, **Deduplicated**: 2
- **Progress**: 354/1541 scanned

## 2026-04-05 ado-wiki tick (seq 219-222)
- **Scanned**: 4 pages from ACStor/TSG
- **Track A (Break/Fix)**: 2 entries — Etcd Recovery (#221), File System Remounted Read Only (#222, relatedTo #207)
- **Track B (Guide)**: 2 drafts — ACStor Error Codes, ACStor Escalation Steps
- **Remaining**: ~1185 pages

### 2026-04-05 ado-wiki tick (ACStor TSGs)
- **Pages scanned**: 3 (Installation Failures, Mounting/Unmounting PV Issues, Performance/throttling)
- **Discovered**: 7 new entries (aks-ado-wiki-223 ~ 229)
- **Deduplicated**: 0
- **Track A**: 7 triplets (5 installation failures, 1 mount issue, 1 performance)
- **Track B**: 0 guide drafts
- **Remaining**: 1291 pages

### 2026-04-05 ado-wiki tick
- **source**: ado-wiki
- **pages processed**: 1 (`[TSG] ACI billing related issues`)
- **Track A**: 1 break/fix (aks-ado-wiki-223: ACI billing after stop/deletion → leaked deployment)
- **Track B**: 1 guide draft (`ado-wiki-aci-billing-issues.md` — KQL billing investigation)
- **discovered**: 2, **deduplicated**: 0
- **remaining**: 1179 pages

## 2026-04-05 ado-wiki tick (seq 230-232)
- **Scanned**: 4 pages (Provisioning Capacity, Replication, AKS Fleet Manager, Automated Deployments)
- **Track A**: 1 entry (aks-ado-wiki-231: ACStor NVMe replication pod Pending)
- **Track B**: 2 guide drafts (acstor-provisioning-capacity, aks-fleet-manager-overview)
- **Skipped**: 1 (Automated Deployments — redirect only)
- **21v**: All ACStor & Fleet Manager entries marked 21vApplicable:false
- **Progress**: 366/1541 scanned (23.8%)

## 2026-04-05 ado-wiki tick
- **Scanned**: 4 pages (ACStor/TSG/Provisioning Capacity, ACStor/TSG/Replication, AKS Fleet Manager, AKS Fleet Manager/Automated Deployments)
- **Extracted**: 3 entries (aks-ado-wiki-230..232) — 1 Break/Fix, 2 guide-drafts, 1 skipped (pointer page)
- **Deduplicated**: 0
- **21v**: ACStor and Fleet Manager both marked 21v-unsupported
- **Remaining**: ~1454 unscanned pages

## 2026-04-05 ado-wiki tick
- Scanned 4 pages (Provisioning Capacity, Replication, AKS Fleet Manager, Automated Deployments)
- Track A: 1 entry (aks-ado-wiki-231: ACStor NVMe replication insufficient replicas)
- Track B: 1 guide draft (ado-wiki-acstor-provisioning-capacity.md)
- Skipped: 2 pages (Fleet Manager overview, Automated Deployments redirect)
- 21v: Both ACStor entries marked 21vApplicable=false (ACStor not available in Mooncake)
- Remaining: 1287 pages

## 2026-04-05 ado-wiki tick (Fleet Manager batch)
- **Pages scanned**: 4 (FAQ, Geneva Actions, Kusto Tables, Support Tools)
- **Track A (Break/Fix)**: 3 entries (aks-ado-wiki-232~234) — identity change propagation failure, Hub stop error, Hub Pod creation blocked
- **Track B (Guide drafts)**: 4 entries (aks-ado-wiki-235~238) — FAQ guide, Geneva Actions guide, Kusto Tables reference, Support Tools reference
- **21V**: All marked 21vApplicable=false (Fleet Manager is 21V unsupported)
- **Deduplicated**: 0
- **Progress**: 356/1541 pages scanned

## 2026-04-05 ado-wiki tick
- Batch: 3 pages (12187 chars)
- Track A: 1 (Cannot Connect FM → aks-ado-wiki-233)
- Track B: 2 guides (FAQ, Debug Gates/Approvals → aks-ado-wiki-234,235)
- Scanned: 377/1541, remaining: 1281

### 2026-04-05 ado-wiki tick
- **Pages processed**: 6 (4 previously extracted but unmarked + 2 new)
- **New pages extracted**: Cannot Connect FM (Track A), Debug Gates and Approvals (Track A+B)
- **New JSONL entries**: aks-ado-wiki-239 ~ 241 (2 break/fix + 1 guide-draft)
- **Guide drafts**: ado-wiki-aks-fleet-manager-debug-gates-approvals.md (existed)
- **Total scanned**: 379/1541
- **Remaining**: 1281

## 2026-04-05 ado-wiki tick
- **Batch**: 2 pages (Networking/Capture Network trace veth, Capture incoming service traffic)
- **Track B (guide-draft)**: 2 pages → `ado-wiki-capture-network-trace-veth.md`, `ado-wiki-capture-incoming-service-traffic.md`
- **Track A (break/fix)**: 0
- **IDs**: aks-ado-wiki-242 ~ 243
- **Scanned**: 381/1541 (remaining: 1279)

## 2026-04-05 ado-wiki tick (ResourcePlacement)
- **scanned**: /Azure Kubernetes Service Wiki/AKS Fleet Manager/TSG/ResourcePlacement (30173 chars)
- **extracted**: 3 break/fix entries (aks-ado-wiki-242~244) + 1 guide-draft entry (aks-ado-wiki-245)
- **guide draft**: guides/drafts/ado-wiki-resourceplacement-in-aks-fleet.md
- **21v**: all entries marked 21vApplicable=false (Fleet Manager is 21v feature gap)
- **progress**: 382/1541 scanned, 1159 remaining

### 2026-04-05 ado-wiki tick
- Pages scanned: 2 (ACI Docker RateLimit, AIB ACI Troubleshooting)
- Extracted: 2 entries (aks-ado-wiki-246..247)
- Track A: 2, Track B: 0, Deduplicated: 0
- Progress: 384/1541 scanned (24.9%)

## 2026-04-05 ado-wiki tick (ResourcePlacement)
- **source**: ado-wiki
- **pages processed**: 1 (ResourcePlacement TSG, 30173 chars)
- **Track A**: 3 break/fix entries (aks-ado-wiki-244~246)
- **Track B**: 1 guide draft (fleet-resourceplacement-tsg.md)
- **discovered**: 4, **deduplicated**: 0
- **remaining**: ~1156 pages

### 2026-04-05 ado-wiki tick
- **Pages processed**: 3 (2 content + 1 empty)
- **Discovered**: 4 (aks-ado-wiki-246 ~ 249)
- **Deduplicated**: 0
- **Pages**:
  - TargetK8sVersionNotSupported Error → 3 break/fix items (Fleet auto-upgrade version issues)
  - Unable to Remove AKS Cluster from Fleet → 1 break/fix item (Delete Lock conflict)
  - .attachments → empty, skipped
- **21v**: All 4 entries marked 21vApplicable=false (Fleet Manager unsupported in Mooncake)
- **Pre-read cached**: 20 page lengths for next batch
| 2026-04-05 | ado-wiki | Scanned 3 ACI TSG pages (SAL deletion, BYOVNET port 19390, Debug Tools); all deduplicated against existing entries (aks-ado-wiki-005/053/056) | Phase3 tick |

## 2026-04-05 ado-wiki tick
- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages scanned**: 1 (Publish AKS services with Azure Private Link and Front Door)
- **Track A (break/fix)**: 2 entries (aks-ado-wiki-250, 251) — PLS LinkedAuthorizationFailed + PLS LB restrictions
- **Track B (guide)**: 1 draft — publish-aks-services-private-link-front-door.md
- **Deduplicated**: 0
- **Remaining**: 1274 pages

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (Publish AKS services with Azure Private Link and Front Door)
- **Track A**: 2 break/fix entries (aks-ado-wiki-250: LinkedAuthorizationFailed MSI+NSG, aks-ado-wiki-251: PLS+external SLB floating IP)
- **Track B**: 1 guide draft (PLS + Front Door integration how-to)
- **Remaining**: 1274 pages unscanned

## 2026-04-05 ado-wiki tick (chain)
- **scanned**: 1 page (ACI TSG - Container Group deployment hangs in Waiting status)
- **extracted**: 2 Break/Fix entries (aks-ado-wiki-253, aks-ado-wiki-254)
  - NC Leak causing deployment timeout in BYOVNET
  - IP Leak / subnet capacity exceeded in BYOVNET
- **deduplicated**: 0
- **remaining**: 1431 pages

## 2026-04-05 ado-wiki tick
- Batch: 1 page (10169 chars)
- `/AKS/How Tos/Track progress of a fix` → Track B guide-draft (aks-ado-wiki-253)
- Progress: 395/1541 scanned (25.6%)
| 2026-04-05 | ado-wiki | +1 guide-draft (Track B): AKS fix rollout tracking guide (aks-ado-wiki-253) | Containers Wiki: AKS/How Tos/Track progress of a fix |

## 2026-04-05 ado-wiki tick
- **Batch**: 2 pages (13455 chars)
- **Pages**: Azure ARC enabled Kubernetes, ACR connectivity with Token
- **Track B (guide-draft)**: 2 pages → drafts + JSONL pointers (aks-ado-wiki-255, 256)
- **Track A (break/fix)**: 0
- **Scanned**: 397/1541 | Remaining: 1271

## 2026-04-05 ado-wiki tick (dedup cleanup)
- **Batch**: 2 pages (Azure ARC enabled Kubernetes, ACR connectivity with Token) — already processed by prior chain
- **New discoveries**: 0 (entries aks-ado-wiki-255, 256 already existed)
- **Cleanup**: removed 2 duplicate JSONL entries; cached 20 page lengths for future batching
- **Scanned**: 385/1541 unique | Remaining: 1271

### 2026-04-05 ado-wiki tick
- Pages processed: 3 (Fraud Detected, Find VM id for ACI CG, InaccessibleImage Error)
- Track A: 1 entry (aks-ado-wiki-254: ACI fraud detection quota error)
- Track B: 1 guide draft (aci-find-vm-id-for-cg.md)
- Deduplicated: 1 (InaccessibleImage already existed as aks-ado-wiki-065/066)
- Fixed: 4 previously extracted but unmarked pages added to scanned list
- Progress: 406/1541 scanned (26.3%), 1135 remaining

### 2026-04-05 ado-wiki tick
- Scanned 2 pages (Velero backup/restore, Changing Timezone for Pods)
- Track A: 1 entry (aks-ado-wiki-258: pod timezone config via ConfigMap)
- Track B: 1 guide draft (ado-wiki-backup-restore-aks-velero.md)
- Progress: 408/1541 scanned, 1133 remaining

## 2026-04-05 ado-wiki tick
- Scanned 2 pages (Cluster upgrades using ARM, Configuring timezone settings)
- Track B: 1 guide draft (ado-wiki-cluster-upgrades-using-arm.md)
- Track A: 1 break/fix entry (timezone with relatedTo aks-ado-wiki-258)
- New IDs: aks-ado-wiki-259, aks-ado-wiki-260
- Remaining: 1267 pages

## 2026-04-05 — ado-wiki tick
- Pages scanned: 2 (Cluster upgrades using ARM, Configuring timezone settings for a pod)
- Track A: 1 entry (node timezone breaks cluster)
- Track B: 2 guide drafts (ARM upgrade, timezone configuration)
- Deduplicated: 0 (timezone entry related to existing aks-ado-wiki-258)
- IDs: aks-ado-wiki-259 ~ 261
- Progress: 410/1541 pages

## 2026-04-05 ado-wiki tick (chain)
- Pages scanned: Connecting Private Cluster Jumpbox MI, Connecting to AKS nodes with SSH helper pod
- Track A: 4 break/fix entries (aks-ado-wiki-259~262) — CA policy blocking SP login, SSH timeout, deprecated --username flag, kubectl can't reach private API
- Track B: 2 guide drafts — jumpbox MI setup guide, SSH helper pod script
- Total JSONL: 313 entries | Scanned: 412/1541 | Remaining: 1265

## 2026-04-05 ado-wiki tick
- **Scanned**: 2 pages (Connecting Private Cluster Jumpbox MI, Connecting to AKS nodes with SSH helper pod)
- **Track A**: 4 break/fix entries (aks-ado-wiki-262~265) — SSH timeout, MI login --username deprecated, kubectl API server unreachable, CA blocks SP
- **Track B**: 2 guide drafts — jumpbox MI setup guide, SSH helper pod script
- **Total new JSONL**: 6 entries (262-267)
- **Scanned**: 412/1541 | **Remaining**: 1265

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (14072 chars)
- **Track B (guide-draft)**: 1 — ACI stuck cluster creations TSG (Kusto diagnostic query for 10+ failure categories)
- **New entries**: aks-ado-wiki-268
- **Remaining**: 1128 pages

### 2026-04-05 ado-wiki tick
- Pages processed: 4 (Container Instance firewall ACR, ARM template PropertyChangeNotAllowed, namespace stuck terminating, kubenet→CNI Overlay migration)
- Track A (break/fix): 3 entries (aks-ado-wiki-270, 271, 272)
- Track B (guide-draft): 2 entries (aks-ado-wiki-269, 273) + 2 guide files
- Deduplicated: 0
- Progress: 417/1541 scanned (27%)

## 2026-04-05 ado-wiki tick (batch: 8 pages)
- Pages: 4 empty parent pages + 4 content pages (Azure Firewall Windows rules, BYO CNI, TSG index, [TSG] Azure Firewall)
- All 4 content pages deduplicated (already in JSONL as aks-ado-wiki-151/203/204/205)
- Discovered: 0 new, Deduplicated: 4, Scanned: 412→425, Remaining: 1116

## 2026-04-05 ado-wiki tick

- **Scanned**: 4 pages (Cluster Management how-tos)
- **Extracted**: 3 break/fix entries (aks-ado-wiki-275~277) + 1 guide-draft (aks-ado-wiki-274)
- **Topics**: ARM template PropertyChangeNotAllowed, namespace stuck terminating, kubenet→CNI Overlay migration, ACI from firewall ACR
- **Progress**: 429/1541 scanned, 1112 remaining

## 2026-04-05 ado-wiki tick

- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 3 (ACI TSG section: Kusto Helpers, MSITokenRequestFailure, Memory usage mismatch)
- **Track A (break/fix)**: 2 entries (aks-ado-wiki-275: MSI token BadRequest; aks-ado-wiki-277: ACI memory metric mismatch in portal)
- **Track B (guide drafts)**: 2 drafts (aci-kusto-helpers.md, aci-msi-token-request-failure.md) + 2 guide-draft JSONL entries (274, 276)
- **Deduplicated**: 0
- **Scanned**: 436/1541 (remaining: 1105)

## 2026-04-05 ado-wiki tick (chain)
- **Batch**: 6 pages processed (4 dedup-fixed + 2 new)
- **Track A**: 1 new entry (aks-ado-wiki-274: cross-tenant AKS+ACR integration)
- **Track B**: 1 guide draft (KEDA implementation on AKS)
- **Dedup**: 4 pages had existing JSONL entries but missing from scanned list — fixed
- **Progress**: 438/1541 scanned (28.4%), 1259 remaining

## 2026-04-05 ado-wiki tick
- Pages scanned: 2 (Integrating AKS and ACR across tenants, KEDA Implementation with AKS Cluster)
- Track A: 0, Track B: 2 guide drafts created
- New IDs: aks-ado-wiki-278, aks-ado-wiki-279
- Progress: 438/1541 scanned, 1103 remaining

## 2026-04-05 ado-wiki tick (278-280)
- **Scanned**: 3 pages (Cluster Management how-tos)
- **Track A**: 1 break/fix (cluster autoscaler safe-to-evict annotation placement)
- **Track B**: 2 guide drafts (pod dependency probes, VMSS runbook automation)
- **Progress**: 441/1541 scanned (28.6%)

## 2026-04-05 ado-wiki tick (cont.)
- Scanned 3 pages (Cluster Management: Scaling with Surge, Unsupported K8s Versions, Upgrading ingress-nginx)
- Track A: 1 entry (aks-ado-wiki-280: LB port exhaustion during surge scaling)
- Track B: 2 guide drafts (unsupported-k8s-versions-exceptions, upgrading-ingress-nginx-specific-version)
- Deduplicated: 0
- Remaining: ~1253 pages

## 2026-04-05 ado-wiki tick
- **Scanned**: 4 pages (Network Troubleshooting Methodology subtree)
- **Extracted**: 1 break/fix (netplugin signal:killed → Palo Alto), 3 guide-drafts (Resource Exhaustion, Windows HNS, APIServer proxy logs)
- **IDs**: aks-ado-wiki-281 ~ 284
- **Deduplicated**: 0
- **Remaining**: 1249 / 1541 pages

## 2026-04-05 ado-wiki tick

- **Scanned**: 23 pages (20 empty parent pages + 3 content pages)
- **Extracted**: 1 break/fix (aks-ado-wiki-281: LB port exhaustion during surge scaling), 2 guide drafts (aks-ado-wiki-282: unsupported K8s version exceptions, aks-ado-wiki-283: upgrading ingress-nginx)
- **Deduplicated**: 0
- **Remaining**: 1233 pages
- **Exhausted**: false

### 2026-04-05 ado-wiki tick
- **Pages processed**: 3 (Use nsenter to debug pods, Using run command to connect to clusters, Compute [empty])
- **Track A (Break/Fix)**: 0 entries
- **Track B (Guide drafts)**: 2 drafts created
  - `ado-wiki-use-nsenter-to-debug-pods.md` — crictl + nsenter pod debugging
  - `ado-wiki-using-run-command-to-connect-to-clusters.md` — az aks command invoke for private clusters
- **IDs**: aks-ado-wiki-285, aks-ado-wiki-286
- **Scanned**: 467/1541, remaining 1074

### 2026-04-05 ado-wiki tick
- **Batch**: 1 page processed (Enable and create GPU in FDPO subscription)
- **Track B**: 1 guide draft (GPU setup in FDPO subscriptions)
- **New entries**: aks-ado-wiki-287
- **Remaining**: ~1229 unscanned pages

### 2026-04-05 ado-wiki tick
- **scanned**: 3 pages (ACI TSG: Service Unavailable, Subnet Deletion, SubscriptionDeploymentUnhealthy)
- **extracted**: 2 break/fix (aks-ado-wiki-288, aks-ado-wiki-289) + 1 guide-draft (aks-ado-wiki-287)
- **guide-draft**: `guides/drafts/ado-wiki-aci-service-unavailable-error.md`
- **remaining**: 1069 / 1541

### 2026-04-05 ado-wiki tick
- Scanned 1 page (batch limited by 17635 char page)
- Track B (guide-draft): 1 — Kusto query for AKS node info + Geneva VMPerf dashboard links
- New entries: aks-ado-wiki-288
- Remaining: 1228 pages

## 2026-04-05 ado-wiki tick
- Pages scanned: 2 (TSG Troubleshooting Basics, Unable to send ACI logs to LAW)
- Track A (break/fix): 3 entries (aks-ado-wiki-293~295) — ACI LAW log ingestion failures
- Track B (guide-draft): 1 (aci-troubleshooting-basics.md) — Kusto Helper/Atlas reference
- Deduplicated: 0
- Remaining: 1066 pages

## 2026-04-05 ado-wiki tick
- Pages scanned: 10 (+ 1 empty parent page "Windows")
- Track A entries: 7 (aks-ado-wiki-290, 292, 295, 296, 298, 299, 300)
- Track B guide drafts: 8 (aks-ado-wiki-287, 288, 289, 291, 293, 294, 297, 301)
- Topics: GPU setup, Kusto node metrics, node log preservation, OOM kill analysis, allocatable memory calculation, memory dumps, timezone config, hosts file customization, CPU throttling, high memory handling (3 scenarios)
- Remaining: 1056 pages

## 2026-04-05 ado-wiki tick (ACR overview page)
- Page: /Azure Kubernetes Service Wiki/ACR (28946 chars)
- Track A: 7 Break/Fix entries extracted (aks-ado-wiki-302~308)
- Track B: 0 (page is mixed overview + known issues table, no standalone guide needed)
- Deduplicated: 1 (AKS-to-ACR auth failure already covered by existing entries)
- Remaining: 1046 pages

## 2026-04-05 ado-wiki batch (seq 302-303)
- Scanned 5 pages from Containers Wiki (Compute/Linux section)
- 3 deduplicated (allocatable memory, memory dumps, timezone — already existed as 293-295)
- 1 Track A: aks-ado-wiki-302 — custom DNS via DaemonSet /etc/hosts injection
- 1 Track B: aks-ado-wiki-303 — container CPU throttling cadvisor script (guide draft)
- Progress: 495/1541 scanned (32.1%)

## 2026-04-05 ado-wiki tick

- **Pages processed**: 2 (1 content + 1 empty parent)
- **Track B (guide-draft)**: 1 — Time Slicing GPU (aks-ado-wiki-309)
- **Track A (break/fix)**: 0
- **Deduplicated**: 0
- **Remaining**: ~1214 pages

## 2026-04-05 ado-wiki tick
- Processed 1 page: Time Slicing GPU (Track B guide-draft)
- New entries: 1 (aks-ado-wiki-309)
- Remaining: 1040/1541

| 2026-04-05 | ado-wiki-scan | Batch: 4 pages (AGIC/Portal/Blob/CRUD). 1 Break/Fix (blob sync kernel cache) → aks-ado-wiki-312; 2 guides (AGIC wrong backend, Portal tracing) → drafts/; 1 parent page skipped. Progress: 505/1541 scanned. | Supportability/AzureContainers/Containers Wiki || 2026-04-05 | ado-wiki | +1 known-issue (aks-ado-wiki-310): ACR CORS portal error due to large AD group token size | Supportability/AzureContainers: ACR CORS Policy Blocked Portal Issue |

## 2026-04-05 ado-wiki tick (Windows How-Tos batch)
- **Source**: ADO Wiki (Supportability/AzureContainers)
- **Pages processed**: 3 (Collecting procdumps, Installing scoop, Troubleshooting Windows Nodes)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 3 → guides/drafts/
- **IDs**: aks-ado-wiki-310 ~ 312
- **Scanned**: 509/1541 (33%)
- **Remaining**: 1032 pages

### 2026-04-05 ado-wiki scan (tick)
- **Scanned**: 1 page (Windows Host Process Container, ~14K chars)
- **Extracted**: 2 break/fix entries (aks-ado-wiki-313, 314) + 1 guide-draft (315)
  - SMB metadata caching causing stale Azure Files visibility on Windows nodes
  - NanoServer missing SmbShare module for HostProcess containers
  - Guide: Windows HostProcess Containers concepts, patterns, and SMB example
- **Dedup**: 0 (no duplicates found)
- **Remaining**: 1205 pages unscanned
- **Exhausted**: false

## 2026-04-05 ado-wiki tick
- Batch: 4 pages (1 empty skipped), 14761 chars
- Track A: 1 entry (aks-ado-wiki-316: pod logs prior to reboot)
- Track B: 2 guide-drafts (aks-ado-wiki-317: network observability BYO Prometheus, aks-ado-wiki-318: AMPLS setup)
- Scanned: 493/1541, remaining: 1199

## 2026-04-05 ado-wiki tick (batch ~516)
- **Pages processed**: 4 (1 empty skipped)
- **Track A (Break/Fix)**: 1 entry — aks-ado-wiki-318 (collect pod logs prior to reboot)
- **Track B (Guide)**: 2 drafts — network-observability-byo-prometheus-grafana, ampls-how-to-guide
- **Deduplicated**: 0
- **Remaining**: 1025 pages

## 2026-04-05 ado-wiki tick
- **Pages scanned**: 2 (Connected Registry, How Tos)
- **Track A extracted**: 3 issues (aks-ado-wiki-319 ~ 321) — ACR Connected Registry PVC/connection-string/deactivation issues
- **Track B guide**: `guides/drafts/ado-wiki-acr-connected-registry-troubleshooting.md`
- **Skipped**: How Tos (owner page only, no content)
- **Progress**: 518/1541 scanned (33.6%)

## 2026-04-05 ado-wiki tick
- Pages scanned: 2 (ACR/Connected Registry, ACR/How Tos)
- Track A: 1 new entry (aks-ado-wiki-319: PVC stuck issue), 2 deduplicated (ALREADY_ACTIVATED, UNAUTHORIZED already in 082-084)
- Track B: Guide draft already existed for Connected Registry, skipped rewrite
- Page "ACR/How Tos" was index-only, no content extracted
- Remaining: 1389 pages

## 2026-04-05 ado-wiki tick
- **Batch**: 4 pages (3 with content, 1 empty parent)
- **Pages**: AKS State Reporting Issue, AKS start fails due to azfw dnsproxy, InternalServerError certificate signed by unknown authority, Upgrade and Update (empty)
- **Extracted**: 3 Break/Fix entries (aks-ado-wiki-322~324)
- **Deduplicated**: 0
- **Track B drafts**: 0
- **Progress**: 522/1541 scanned (33.9%)

## 2026-04-05 ado-wiki tick (chain)
- **batch**: 1 page (55311 chars, single large page)
- **Track B (guide-draft)**: 1 — "Collect the CPU usage on Node and find the mapping relations" → monitoring/cpu/pod-mapping guide
- **new entries**: aks-ado-wiki-322
- **scanned**: 523/1541 → exhausted: false

## 2026-04-05 ado-wiki tick
- **Scanned**: 3 pages (Monitoring section)
- **Track A (Break/Fix)**: 1 entry (aks-ado-wiki-326: disable env var collection via ConfigMap)
- **Track B (Guide)**: 1 draft (custom-logging-fluentbit.md: FluentBit DaemonSet for custom logging)
- **Skipped**: 1 page (links-only, no content)
- **Progress**: 530/1541 scanned (34.4%), 1191 remaining

## 2026-04-05 ado-wiki tick
- **Scanned**: 3 pages (ACR/How Tos: API Deprecation Handling, Audit Logs, Behind Firewall)
- **Extracted**: 4 entries (aks-ado-wiki-327..330)
  - 2x guide-draft (Track B): API Deprecation CSS guide, Audit Logs how-to
  - 2x break/fix (Track A): ACR behind firewall scenarios
- **Deduplicated**: 0
- **Progress**: 533/1541 scanned (34.6%)

### 2026-04-04T22:07:45 — ado-wiki tick
- **Scanned**: 2 pages (AKS Performance Investigation Flow, AKS Throttling)
- **Extracted**: 2 Track-A entries (aks-ado-wiki-331..332)
- **Deduplicated**: 0
- **Pre-read lengths cached**: 20 pages
- **Remaining**: 1189 unscanned pages

## 2026-04-05 ado-wiki tick
- **scanned**: 2 pages (How to collect container logs, LA query for CPU/Memory alerts)
- **Track B guide-drafts**: 2 (ado-wiki-how-to-collect-container-logs.md, ado-wiki-la-query-aks-node-cpu-memory-alerts.md)
- **Track A break/fix**: 0
- **IDs**: aks-ado-wiki-331 ~ 332
- **progress**: 537/1541 scanned, 1004 remaining

### 2026-04-05 ado-wiki tick
- **Pages scanned**: 3 (Monitoring: Logging AAD Users, Network connection monitor, Querying customer LA)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 3 → aks-ado-wiki-333..335
- **Deduplicated**: 0
- **Progress**: 544/1541 (35.3%)

### 2026-04-05 ado-wiki tick (scan state fix)
- **Action**: Fixed scanned state for 3 pages that had JSONL entries + drafts but were not marked as scanned
- **Pages fixed**: Logging Azure AD Users, Network connection monitor, Querying customer Log Analytics
- **No new entries** — entries aks-ado-wiki-332..335 already existed (duplicates from prior incomplete runs)
- **Progress**: 544/1541 (35.3%)

## 2026-04-05 ado-wiki tick
- Scanned: 1 page (25531 chars)
- Track A: 1 break/fix entry (aks-ado-wiki-336: Pod subnet IP exhaustion in Azure CNI Dynamic IP Allocation)
- Track B: 1 guide draft (CNI Dynamic IP + CNS Prometheus monitoring)
- Guide-draft ref: aks-ado-wiki-337
- Remaining: 1183 pages

### 2026-04-05 ado-wiki tick (batch)
- **Pages scanned**: 1 (Monitoring: Scraping Azure CNS metrics with Prometheus)
- **Track A (break/fix)**: 1 → aks-ado-wiki-336 (pod subnet full / no IPs available)
- **Track B (guide-draft)**: 1 → aks-ado-wiki-337 (CNS metrics monitoring guide)
- **Deduplicated**: 0
- **Progress**: 545/1541 (35.4%)

## 2026-04-05 ado-wiki tick

- **Scanned**: 3 pages (Scraping Azure CNS metrics [dup skip], Testing alerting synthetic load, Viewing events in AKS cluster)
- **Extracted**: 2 Break/Fix entries (aks-ado-wiki-338, aks-ado-wiki-339)
- **Deduplicated**: 1 (CNS metrics page already extracted as aks-ado-wiki-336)
- **Total scanned**: 547/1541
- **Remaining**: 1181 pages

## 2026-04-05 ado-wiki tick (chain)
- **Batch**: 1 page (AKS HTTP Proxy Walkthrough, 9647 chars)
- **Track A**: 1 entry (aks-ado-wiki-340) — HTTP Proxy noProxy config not applied to existing nodes until node image upgrade
- **Track B**: 0 guide drafts
- **Deduplicated**: 0
- **Remaining**: 1180 unscanned pages

## 2026-04-05 ado-wiki tick
- **Pages processed**: 2 (Cluster Management TSGs)
- **Discovered**: 2 (aks-ado-wiki-341, aks-ado-wiki-342)
- **Deduplicated**: 0
- **Pages**:
  - Failed Create Pod SandBox failed to setup network for sandbox → Track A (kernel 6.2 + CNI bug)
  - Free Tier Replica Reduction → Track A (free tier no HA, replicas drop to 0)
- **Exhausted**: false (1178 remaining)

## 2026-04-05 ado-wiki tick (chain)
- **Pages processed**: 2 (AKS Per Node PublicIP Use Examples, AKS Restrict Ingress loadBalancerSourceRanges)
- **Track A entries**: 2 (NSG rules disappearing, Service Tags + loadBalancerSourceRanges conflict)
- **Track B drafts**: 2 (per-node-publicip guide, loadbalancersourceranges guide)
- **Also fixed**: 136 previously processed but untracked pages added to scanned list; 43 malformed scanned entries cleaned
- **IDs**: aks-ado-wiki-341 ~ 343
- **Remaining**: 1173 pages

## 2026-04-05 ado-wiki tick
- Pages scanned: 2
- Track A (break/fix): 2 entries (aks-ado-wiki-345, aks-ado-wiki-346) — NSG rules disappearing for LB services, ServiceTag+loadBalancerSourceRanges conflict
- Track B (guide-draft): 1 entry (aks-ado-wiki-344) — Per Node PublicIP use examples
- Exhausted: false (896→894 remaining)

### 2026-04-05 ado-wiki tick
- **source**: ado-wiki
- **pages processed**: 1 (AKS TCPDump instructions)
- **Track A (break/fix)**: 0
- **Track B (guide-draft)**: 1
- **deduplicated**: 0
- **new IDs**: aks-ado-wiki-344
- **remaining**: 1172 pages
| 2026-04-05 | ado-wiki | +1 guide-draft (aks-ado-wiki-347): AKS Traffic Analytics with NSG Flow Logs | Supportability/AzureContainers Wiki |

## 2026-04-05 ado-wiki tick
- Scanned 1 page: Check whether overlake is enabled on backend host of AKS nodes
- Track A: 1 entry (aks-ado-wiki-348) — Kusto Azurehn permission issue
- Track B: 1 guide draft — overlake status checking how-to
- Progress: 651/1541 scanned

## 2026-04-05 ado-wiki tick

- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages scanned**: 5 (Networking section: overlake check, LB backend pools, custom health probes, session stickiness, CoreDNS/NodeLocalDNS, CoreDNS testing)
- **Entries added**: aks-ado-wiki-345 to aks-ado-wiki-356 (12 entries)
  - Track A (break/fix): 7 entries — LB externalTrafficPolicy, SSL cipher mismatch, node removed from LB, CCM permission error, conntrack DNS drops, CoreDNS OOMKill, session affinity, CoreDNS testing tool
  - Track B (guide-draft): 5 entries — overlake check guide, LB backend pools guide, custom health probes guide, CoreDNS/NodeLocalDNS guide
- **Guide drafts created**: 4 files in guides/drafts/
- **Remaining**: 1168 pages unscanned
- **exhausted**: false
| 2026-04-05 | ado-wiki | +2 break/fix (CNI transparent mode DNS, App Routing HTTP 400) +3 guide-drafts (CNI transparent, public IP lookup, ingress logging). Batch: 3 pages, IDs 351-355. Pre-read 20 pages for length cache. | Containers Wiki |

### 2026-04-05 ado-wiki tick
- Page: Intro to Cilium and AKS (17239 chars)
- Track A: 1 issue (L7 policy not supported on Azure CNI Powered by Cilium)
- Track B: 1 guide draft (Cilium setup + BYOCNI + Hubble)
- IDs: aks-ado-wiki-356..357
- Remaining: 1164/1541 pages

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (Intro to Cilium and AKS)
- **Track B (guide-draft)**: 1 — Cilium setup, BYOCNI, network policies L3/L4/L7, Hubble observability
- **New entries**: aks-ado-wiki-356 (guide-draft)
- **Deduplicated**: 0
- **Remaining**: ~1164 pages

## 2026-04-05 ado-wiki tick
- **Batch**: 1 page (21728 chars)
- **Page**: Multiple Nginx Ingress Controller Setup
- **Track A**: 2 break/fix entries (aks-ado-wiki-357, 358) — health probe AKS 1.24+, admission webhook conflicts
- **Track B**: 1 guide draft — ado-wiki-multiple-nginx-ingress-controller-setup.md
- **Remaining**: 1163 pages
| 2026-04-05 | ado-wiki | +4 entries (IDs 357-360): AGIC private IP workaround (guide), network capture kubectl plugin (guide), ASN 8075 reference (guide), Defender for Cloud alerts routing (break/fix). 3 guide drafts created. | Supportability/AzureContainers wiki |

### 2026-04-05 ado-wiki tick
- **Scanned**: 4 pages (Hubble Relay, Hubble UI, Non-Cilium [empty], Lost Packets)
- **Track A (break/fix)**: 2 entries (aks-ado-wiki-363 Hubble UI unsupported, aks-ado-wiki-364 Retina lost packets)
- **Track B (guide-draft)**: 1 entry (aks-ado-wiki-362 Hubble Relay TSG → guides/drafts/ado-wiki-hubble-relay-pod-tsg.md)
- **Skipped**: 1 empty page (Non-Cilium parent)
- **Deduplicated**: 0
- **Remaining**: ~1149 pages
- **Exhausted**: false

## 2026-04-05 ADO Wiki Scan (tick)
- **Batch**: 2 pages (12727 chars)
- **Track A**: 1 entry (aks-ado-wiki-362: private AKS + custom DNS resolution)
- **Track B**: 1 guide-draft (ado-wiki-tcpdump-windows-nodes.md)
- **Dedup**: 0 skipped
- **Progress**: 679/1541 scanned (862 remaining)

## 2026-04-05 ado-wiki tick (chain)
- **Scanned**: 2 pages (batch 12727 chars)
- **Track A (Break/Fix)**: 1 entry (aks-ado-wiki-362) — private AKS + custom DNS resolution
- **Track B (Guide)**: 1 draft (ado-wiki-tcpdump-on-windows-nodes.md) + guide-draft entry (aks-ado-wiki-363)
- **Progress**: 679/1541 scanned (44%), 862 remaining

## 2026-04-05 ado-wiki scan (681/1541)
- Pages: 2 (TCPDump sidecar, Multiple ingress controllers)
- Track A: 3 entries (AGIC NSG, VNet peering, nginx 404)
- Track B: 2 guide drafts saved
- IDs: aks-ado-wiki-364..368
- Remaining: 860 pages

## 2026-04-05 ado-wiki scan (tick)
- Pages scanned: 2 (TCPDump sidecar, Multiple Ingress Controllers)
- Track A: 0 | Track B: 2 guide drafts
- New IDs: aks-ado-wiki-364..365
- Progress: 681/1541 scanned (44.2%)

### 2026-04-05 ado-wiki tick
- Pages scanned: 3 (Istio Ingress/Egress Gateways, Istio CNI Plugin, Istiod and Envoy)
- Track A (Break/Fix): 3 entries (aks-ado-wiki-365~367) — Istio CNI connection refused, pod eviction race condition, traffic bypass
- Track B (Guide): 2 drafts — istio-ingress-egress-gateways, istiod-envoy-troubleshooting
- Total new JSONL entries: 5 (aks-ado-wiki-365~369)
- Remaining unscanned: 1144 pages

## 2026-04-05 ado-wiki tick
- **Page**: /Azure Kubernetes Service Wiki/AKS/How Tos/Networking/managed gateway api istio
- **Track A**: 3 break/fix entries (aks-ado-wiki-370~372) — Gateway TLS cert ref error, istiod cert warm failure, multiple GatewayClass ConfigMap conflict
- **Track B**: 1 guide-draft (ado-wiki-managed-gateway-api-istio.md)
- **21v**: All entries marked 21vApplicable=false (Istio addon status unknown in Mooncake)
- **Remaining**: 856 pages

### 2026-04-05 ado-wiki tick
- **page**: /Azure Kubernetes Service Wiki/AKS/How Tos/Networking/managed gateway api istio
- **track**: A+B (3 break/fix entries + 1 guide draft)
- **entries**: aks-ado-wiki-370 ~ 372 (TLS cert ref error, istiod 15012 connection refused, ConfigMap per GatewayClass)
- **guide**: guides/drafts/ado-wiki-managed-gateway-api-istio.md
- **remaining**: ~855 pages

## 2026-04-05 ado-wiki tick
- Scanned 1 page (batch by char limit ~13953 chars)
- Track B (guide-draft): AGIC multiple apps single AppGW setup guide
- New: aks-ado-wiki-374 (guide-draft)
- Progress: 687/1541 pages scanned (44.6%)

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (AGIC Multiple Apps: 1 AppGW)
- **Track B (guide-draft)**: 1 — ado-wiki-agic-multiple-apps-one-appgw.md
- **Track A (break/fix)**: 0
- **Deduplicated**: 0
- **Remaining**: 853 pages

## 2026-04-05 ado-wiki tick
- Scanned 1 page (batch by char limit)
- Track B: 1 guide-draft (AGIC multiple apps one AppGW)
- 21v: marked 21vApplicable=false (uses AAD Pod Identity)
- New IDs: aks-ado-wiki-375
- Remaining: 852 pages

## 2026-04-05 ado-wiki tick
- Pages scanned: 1 (Multiple apps: Multiple AppGWs: 1 Cluster)
- Track B (guide-draft): 1 — AGIC multi-AppGW setup guide
- New JSONL entries: 1 (aks-ado-wiki-376, guide-draft)
- Remaining unscanned: 1140

## 2026-04-05 ado-wiki tick
- Scanned 1 page (15555 chars), Track B guide-draft
- Page: Multiple apps/Multiple AppGWs/1 Cluster (AGIC how-to)
- +1 guide-draft entry (aks-ado-wiki-376)
- Remaining: 850 pages

## 2026-04-05 ado-wiki tick (seq 377-378)
- Scanned 2 pages (batch 14818 chars)
- Track B: AKS ADO support boundary → guide-draft (aks-ado-wiki-377)
- Track A: Docker buildx on AKS worker nodes → 1 break/fix entry (aks-ado-wiki-378)
- Remaining: 848 pages

## 2026-04-05 ado-wiki tick
- **Scanned**: 2 pages (AKS ADO support boundary, Docker buildx on AKS nodes)
- **Track A (break/fix)**: 1 entry (aks-ado-wiki-378: docker buildx daemon socket error)
- **Track B (guide-draft)**: 1 entry (aks-ado-wiki-377: ADO/AKS support boundary guide)
- **Deduplicated**: 0
- **Remaining**: ~1137 pages

### 2026-04-05 ado-wiki tick
- **Source**: ado-wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 1
- **Track B (guide-draft)**: 1 — Enable swap memory for AKS nodes
- **Track A (break/fix)**: 0
- **New IDs**: aks-ado-wiki-379
- **Remaining**: 1136 pages

### 2026-04-05 ado-wiki tick
- **Batch**: 1 page (7557 chars)
- **Track B (guide-draft)**: 1 page → `guides/drafts/ado-wiki-aks-enable-swap-memory.md`
- **New entries**: aks-ado-wiki-380 (guide-draft pointer)
- **Remaining**: 1136 unscanned pages

## 2026-04-05 ado-wiki tick

- **Source**: ADO Wiki (Supportability/AzureContainers/Containers Wiki)
- **Pages processed**: 3 (resolv.conf generation, pull private registry images, crictl/ctr operations)
- **Track A entries**: 0
- **Track B guide-drafts**: 3 (aks-ado-wiki-381 ~ 383)
- **Deduplicated**: 0
- **Progress**: 698/1541 scanned (45.3%)

## 2026-04-05 ado-wiki tick (384-388)
- **Pages**: AAD AKS Auth & Authn, AKS ACR MSI BYO Identities, SP vs App Registration
- **Track A**: 4 break/fix entries (kubelogin not found, azure auth plugin removed, cached credential, SP credential expiry)
- **Track B**: 1 guide draft (aks-acr-msi-bring-your-own-identities)
- **Scanned**: 701/1541 (remaining: 840)

## 2026-04-05 ado-wiki tick (scanned 671→706)
- **Batch**: 5 pages (Security/Identity × 3, Storage × 2), ~13792 chars
- **Track A** (1): blobfuse upgrade notice → aks-ado-wiki-389
- **Track B** (4): SSL cert validation, ingress cert renewal (.pfx), SPN deploy with ADO, expand/resize PV → guide drafts + aks-ado-wiki-390~393
- **Remaining**: 1125/1541 pages

## 2026-04-05 ado-wiki tick
- Scanned 1 page: Migrating disks from LRS to ZRS tiers
- Track B (guide-draft): 1 guide saved
- New entries: aks-ado-wiki-394
- Progress: 707/1541 scanned (834 remaining)

### 2026-04-05 ado-wiki tick (chain)
- **Batch**: 2 content pages read (ACR Private Link, ACR feedback forum guide)
- **Track A**: 0 new break/fix entries
- **Track B**: 1 guide-draft pointer (aks-ado-wiki-394, ACR Private Link — draft already existed)
- **Skipped**: 1 page (feedback forum, no troubleshooting value)
- **Bulk reconciled**: 79 pages marked scanned (11 empty/parent, 66 already-extracted-not-tracked, 2 batch)
- **Lengths cached**: 11 pages pre-read (all 0)
- **Stats**: discovered=1, deduplicated=78, exhausted=false, remaining=755

### 2026-04-05 07:46 — ado-wiki tick
- **Scanned**: 1 page (Move persistent volume data from one cluster to another)
- **Track B (guide-draft)**: 1 → `guides/drafts/ado-wiki-move-pv-data-between-clusters.md`
- **Track A (break/fix)**: 0
- **New entries**: aks-ado-wiki-395
- **Deduplicated**: 0
- **Remaining**: ~754 pages

## 2026-04-05 ado-wiki tick (seq 396-399)
- **Batch**: 4 pages, 14440 chars (Storage: Recovering deleted disks, NFS 3.0 non-root, NFS for Pod Storage, NVME hostPath)
- **Track A**: 3 entries (aks-ado-wiki-396..398) — disk recovery via soft-delete, NFS CSI driver for non-root mount permissions, NVME local disk formatting + hostPath
- **Track B**: 1 guide draft (aks-ado-wiki-399) — NFS for Pod Storage setup guide (manual PV/PVC + CSI driver StorageClass)
- **Dedup**: 0 duplicates found

## 2026-04-05 ado-wiki tick (seq 400-402)
- **Batch**: 5 pages, 14475 chars (ACR cross-tenant pull, ACR storage limit increase, ACR Kusto access, ACStor How Tos, ACStor Training)
- **Track A**: 2 entries (aks-ado-wiki-400..401) — cross-tenant ACR pull via multi-tenant AAD app, ACR 40TiB storage limit increase via ICM + purge policies
- **Track B**: 1 guide draft (aks-ado-wiki-402) — ACR Kusto cluster access reference (Public/Fairfax/Mooncake endpoints, MyAccess group)
- **Skipped**: 2 pages (ACStor How Tos = links only, ACStor Training = video link only)
- **Dedup**: 0 duplicates found
- **Scanned**: 791/1541, remaining: 1119

### 2026-04-05 ado-wiki-scan (tick)
- **Page**: AKS ML(Azure Machine Learning) TSG
- **Track**: A (Break/Fix) — 2 items extracted
- **IDs**: aks-ado-wiki-400, aks-ado-wiki-401
- **Items**:
  - 400: ML V1 azureml-fe scaling bug — pods scale to 96 uncontrollably
  - 401: ML extension V2 deployment permission — need provider registration
- **Scanned**: 797/1541 | **Remaining**: 1113 | exhausted: false

### 2026-04-05 07:58 — ado-wiki tick
- Page: /Azure Kubernetes Service Wiki/AKS/TSG/AKS ML(Azure Machine Learning) TSG
- Track A: 2 entries (aks-ado-wiki-403: ML V1 scaling bug, aks-ado-wiki-404: ML extension provider registration)
- Track B: 1 guide draft (ado-wiki-aks-ml-azure-machine-learning-tsg.md) + 1 reference entry (aks-ado-wiki-405)
- Total new: 3 entries, 1 guide draft
- Progress: 797/1541 scanned

## 2026-04-05 ado-wiki tick (seq 403)
- **Batch**: 1 page (77K chars — single large page exceeded 15K threshold)
- **Page**: AKS DNS troubleshooting workflow
- **Classification**: Track B (guide-draft) — comprehensive multi-step DNS troubleshooting methodology with decision trees
- **Output**: `guides/drafts/ado-wiki-aks-dns-troubleshooting-workflow.md` + JSONL pointer `aks-ado-wiki-403`
- **Stats**: discovered=1 (guide), deduplicated=0, scanned=799/1541, remaining=1112
- **exhausted**: false

## 2026-04-05 00:03:00 — ado-wiki tick
- **Pages processed**: 1
- **Track B (guide-draft)**: AKS DNS troubleshooting workflow (77K chars)
- **New entries**: aks-ado-wiki-406 (guide-draft pointer)
- **Remaining**: 1117 pages

### 2026-04-05 ado-wiki tick (seq 407-410)
- Batch-marked 920 empty (length≤1) pages as scanned
- Processed 3 pages (9444 chars): networking baseline template, AcceleratedNetworking vmss, Istio sidecar policy compliance
- Track A: 3 break/fix entries (408-410)
- Track B: 1 guide draft (407 → aks-networking-connectivity-baseline-template)
- Remaining: 189 content pages
| 2026-04-05 | ado-wiki | +1 guide-draft (aks-ado-wiki-411): AKS API Connectivity Start Here TSG — comprehensive decision-tree covering DNS/TCP/TLS/auth-IP/routing/429/secondary-path. Fixed 3 stale paths in scanned list. Remaining: 1113/1541 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)) |

### 2026-04-05 ado-wiki tick (API Connectivity Hands-On Labs)
- **Page**: `[TSG] AKS API Connectivity - Hands-On Labs` (24222 chars)
- **Track A**: 2 break/fix entries extracted
  - `aks-ado-wiki-412`: Public cluster authorized IP ranges mismatch → TCP 443 timeout
  - `aks-ado-wiki-413`: Private cluster NSG deny 443 on peered VNet → TCP 443 timeout
- **Remaining**: 1112 pages

### ado-wiki tick (dedup) — 2026-04-05
- **Attempted**: `TSG: AKS - Troubleshooting Cluster API Connectivity Issues (Start Here Workflow)` (23236 chars)
- **Result**: Page already processed by concurrent agent (aks-ado-wiki-411). Duplicate JSONL entry and guide draft removed.
- **Stats**: discovered=0, deduplicated=1, new_entries=0
- **Remaining**: 187 content pages
- **Note**: Concurrent agent already running chain (wrote 411-413). No continuation spawned to avoid chain duplication.

## 2026-04-05 ado-wiki tick (chain)
- **Batch**: 1 page (16810 chars) — Private cluster API connectivity TSG
- **Track A**: 1 new entry (aks-ado-wiki-414: Private Endpoint Subnet Policy Config routing bypass)
- **Dedup**: 1 (DNS/VNet Link triplet ≥80% overlap with aks-ado-wiki-362)
- **Remaining**: ~1111 pages

## 2026-04-05 ado-wiki tick (seq 415-418)
- **Scanned**: 4 pages (1 empty/TBD skipped, 1 Track A, 2 Track B)
- **Track A**: Tunnel TSG → 2 break/fix entries (aks-ado-wiki-415: tunnel disconnect general, aks-ado-wiki-416: OpenVPN TLS failure)
- **Track B**: AKS Networking Known Scenarios → guide-draft, AKS Networking Troubleshooting Tools → guide-draft
- **Deduplicated**: 0
- **Remaining**: 182 pages (length>1)

## 2026-04-05 ado-wiki tick

- **Batch**: 4 pages (11420 chars), AKS Network Troubleshooting Methodology subtree
- **Track A**: 3 entries (aks-ado-wiki-415~417) — AKS tunnel disconnection, V1 SSH timeout, OpenVPN TLS failure
- **Track B**: 2 guide drafts — AKS Networking Known Scenarios (pre-check checklist), AKS Networking Troubleshooting Tools (tool reference + important IPs)
- **Skipped**: 1 page (TSG How to Create a Supportability Ask — empty/TBD)
- **Discovered**: 5 (3 Track A + 2 Track B)
- **Deduplicated**: 0
- **Remaining**: 1107 pages

## 2026-04-05 onenote-extract tick (FY22 PG sync notes batch)
- Pages scanned: 10 (FY22 weekly PG sync meeting notes: 2021-12 to 2022-06)
- Discovered: 5 new entries (aks-onenote-113 to aks-onenote-117)
- Deduplicated: 5 (cert expired → dup 018, Docker 1.19 upgrade → thin, CSE curl missing → dup 017, CSI out-of-tree → thin, auto-reconcile query → dup 031)
- Topics: scale-up backend bug, kubectl mirror 404 in MC, API server kube-audit throttling analysis, taints/labels behavioral change (2022-04-24), node pool snapshot not available in MC
- Remaining: 292 pages
- Exhausted: false

### 2026-04-05 ado-wiki tick (seq 419)
- **Scanned**: 1 page (10602 chars)
- **Extracted**: 1 break/fix entry (Track A)
  - aks-ado-wiki-419: Intermittent DNS NXDOMAIN due to VNET mixed custom DNS servers (public + Azure DNS) → CoreDNS round-robin → coredns-custom ConfigMap fix
- **Remaining**: 181 pages

### 2026-04-05 ado-wiki tick (seq 420)
- **Scanned**: 1 page (23018 chars)
- **Extracted**: 1 break/fix entry (Track A)
  - aks-ado-wiki-420: Intermittent DNS timeout/SERVFAIL due to node CPU over-commitment (435-642% limits) + CoreDNS CPU throttling → dedicated system pool + proper sizing + Node Local DNS + Prometheus/Grafana monitoring
- **Remaining**: 180 pages

## 2026-04-05 ado-wiki tick (seq 421-422)
- **Scanned**: 1 page (19647 chars)
  - `[TSG] AKS troubleshooting egress issues` → Track A (1 break/fix: service CIDR overlap with peered VNET causes ICMP port-unreachable) + Track B (egress troubleshooting methodology guide)
- **Discovered**: 2 entries (1 raw + 1 guide-draft)
- **Deduplicated**: 0
- **Remaining**: 179 pages

### 2026-04-05 ado-wiki tick (seq 420-422)
- **Scanned**: 2 pages (DNS issues lab 10602 chars, DNS performance lab 23018 chars)
- **Page 1** (DNS issues lab): Break/Fix entry already existed (aks-ado-wiki-419, >=80% overlap, skipped Track A). Added Track B guide-draft (aks-ado-wiki-420) + saved guides/drafts/ado-wiki-aks-troubleshooting-dns-issues-lab.md
- **Page 2** (DNS performance lab): Break/Fix entry already existed (aks-ado-wiki-420 from prior run, >=80% overlap w/ aks-ado-wiki-421). Added Track B guide-draft (aks-ado-wiki-422) + saved guides/drafts/ado-wiki-aks-troubleshooting-dns-performance-lab.md
- **Stats**: discovered=2 guide-drafts, deduplicated=2 (break/fix overlaps), new break/fix=0
- **Remaining**: 1105 pages

## 2026-04-05 onenote-extract tick (FY22-FY23 sync-up notes)

- **Pages processed**: 10 (FY22/2022_06_16, 06_30, FY23 header, FY23/2022-11-17, 07_14, 07_28, 08_11, 08_24, 09_08, 09_22)
- **New entries**: 9 (aks-onenote-118 ~ 126)
- **Deduplicated**: 3 (OMS fluentbit OOM ~040, zone+PV LRS ~037, Ubuntu 18.04 systemd ~085)
- **Skipped**: 1 (FY23 empty header)
- **Key topics**: PVC stuck-attached recovery, workload identity MSI failure in Mooncake, SP reset IsLatestMode, Defender auto-provision, autoscaler 1.24 oscillation, etcd quorum loss, cert rotation iLB concern, mlocate IO spike, kubenet InsufficientPodCidr
- **Scanned**: 182/464 | **Remaining**: 282

### 2026-04-05 ado-wiki tick (seq 423-425)
- **Pages**: 3 processed (AKS Network Troubleshooting Methodology overview + cluster issues + NVA/routing)
- **Track A**: 0 (all pages are guide/reference type)
- **Track B**: 3 guide-drafts created (2 .md files + 1 thin resource-list JSONL entry)
- **IDs**: aks-ado-wiki-423 to aks-ado-wiki-425
- **Remaining**: ~176 unscanned pages with length>1

## 2026-04-05 ado-wiki tick (seq 423)
- **Scanned**: 3 pages from AKS Network Troubleshooting Methodology / [TSG] Aks and Network team common troubleshooting
  - TOC index page (skip, no actionable content)
  - "1 - Troubleshoot AKS cluster issues" (skip, tool reference list only)
  - "10 - Troubleshoot NVA and routing" → Track B guide-draft (aks-ado-wiki-423)
- **Discovered**: 1 (guide-draft)
- **Deduplicated**: 0
- **Remaining**: 176

### 2026-04-05 ado-wiki tick (seq 426-429)
- Pages scanned: 3 (NSG Common Scenarios, DNS Common Scenarios, Common Troubleshoot Steps)
- Extracted: 4 Break/Fix entries (NSG inbound/outbound blocking, TCP connection stalls, service mesh port conflict)
- Skipped: 1 page (DNS Common Scenarios — redirect only, no content)
- Remaining: 173 content pages

### 2026-04-05 ado-wiki tick
- **Pages processed**: 3 (11-NSG Common Scenarios, 12-DNS Common Scenarios [skip-link-only], 13-Common Troubleshoot Steps)
- **Track A entries**: 4 (aks-ado-wiki-425~428: NSG inbound/outbound blocking, TCP 15-min stall, Istio port conflict)
- **Track B drafts**: 2 (ado-wiki-troubleshoot-nsg-common-scenarios.md, ado-wiki-common-troubleshoot-steps.md)
- **Guide pointer**: 1 (aks-ado-wiki-429: pod connectivity testing)
- **Skipped**: 1 (page 12 - link-only redirect to Azure DNS TSG)
- **Deduped**: 0
- **Remaining unscanned**: 173
- **Also recovered**: 2 guide-draft JSONL entries (aks-ado-wiki-423~424) for previously-created drafts missing entries

### 2026-04-05 Phase 2 onenote-extract (tick)
- **Pages processed**: 10 (FY23 PG sync meeting notes: 2022-10~2023-06)
- **Discovered**: 10 new entries (aks-onenote-127~136)
  - 127: AZ upgrade surge zone imbalance → set maxSurge to multiple of 3
  - 128: PSP blocked on K8s 1.25+
  - 129: Calico incompatible with K8s 1.25
  - 130: 0-Ready-node clusters auto-stopped after 30 days
  - 131: Autoscaler ForceDelete causes false Service Health alerts
  - 132: Cgroups v2 on 1.25+ → higher memory, OOM kills (.NET 3.1)
  - 133: Stop/Start on 1.26 → ghost pods on non-existent nodes
  - 134: Dapr extension not available in Mooncake
  - 135: K8s 1.23→1.24 breaks nginx ingress health probes → annotation fix
  - 136: Ubuntu 18.04 EOL for AKS <1.25
- **Deduplicated**: 3 (deprecated labels→095, Docker Bridge CIDR→096, platform auto-upgrade→105)
- **Scanned**: 192/464, **Remaining**: 272
- **Exhausted**: false

### ado-wiki tick (2026-04-05 batch: pages 11/12/13 of network troubleshooting)
- **Pages processed**: 3 (NSG Common Scenarios, DNS Common Scenarios, Common Troubleshoot Steps)
- **Discovered**: 0 new (pages already covered by concurrent agent, entries 426-429 exist)
- **Deduplicated**: 4 (removed duplicate Chinese entries; existing English entries retained)
- **Scanned**: 1754 total, **Remaining**: 173
- **Exhausted**: false

## 2026-04-05 ado-wiki tick
- Scanned 1 page (23236 chars, Track B guide)
- Page: TSG: AKS - Troubleshooting Cluster API Connectivity Issues (Start Here Workflow)
- Saved guide draft: ado-wiki-aks-api-connectivity-start-here.md
- New JSONL entry: aks-ado-wiki-430 (guide-draft)
- Remaining unscanned: 175

## 2026-04-05 onenote-extract tick (137-144)
- Pages: 10 (FY23 2023-4-20, FY24 section header + 8 meeting notes)
- Track A: 8 break/fix entries (SA token 1.24, Canonical nightly, Blob NFS, konnectivity debug KQL, API breaking auto-stop, Mariner OS escalation, cert rotation kubeconfig, kubelogin Mooncake)
- Deduped: 1 (cgroup2 memory >=80% overlap with aks-onenote-084/132)
- Skipped: 2 (FY24 header empty, 2023-12-28 cancelled meeting)
- relatedTo links: 3 (140→100, 141→095, 144→083)
- Scanned: 202/464, remaining: 262

## 2026-04-05 ado-wiki scan (chain tick, IDs 430-440)
- **Pages processed**: 11 (14-Common Troubleshoot tools, 2-Network deployment type, 3-Common issues, 4-Checklists, 5-Connectivity, 6-Performance, 7-Firewall, 8-ExpressRoute, 9-LB Health, Azure DNS, Azure LB)
- **Track A entries**: 9 (aks-ado-wiki-430 to 439)
  - Mellanox IRQ packet drops after VM Freeze
  - LB Basic→Standard upgrade breaks cluster
  - Portal network management flight link
  - BYOCNI support boundary
  - Private cluster + NVA requires SNAT
  - Azure Firewall port reuse connectivity
  - DNS NXDOMAIN/timeout diagnosis
  - SNAT port exhaustion through LB
  - Portal issue workaround
- **Track B guides**: 3 drafts
  - network-troubleshoot-tools.md
  - network-troubleshooting-checklist.md
  - connectivity-troubleshooting.md
- **Remaining**: 162 pages
- **exhausted**: false

## 2026-04-05 ado-wiki tick (chain)
- **Pages**: Data Integrity Failure, Data Integrity Scrubber Failure
- **Extracted**: 2 Track A entries (aks-ado-wiki-436, aks-ado-wiki-437)
- **Topics**: ACStor data integrity failure (WRV-DI checksum), Scrubber replica sync failure
- **Dedup**: 436 related to aks-ado-wiki-222 (filesystem read-only); 437 new
- **21V**: Both marked 21v-unsupported (ACStor not available in Mooncake)
- **Remaining**: 255 pages

### 2026-04-05 09:00 — onenote-extract (aks)
- **pages processed**: 10 (FY24 meeting notes + Feature Landing Status)
- **discovered**: 4 (aks-onenote-145..148)
- **deduplicated**: 0
- **skipped**: 6 (too brief / feature tables / meeting logistics)
- **remaining**: 252
- **topics**: KEDA addon version mismatch on upgrade, managed tags deletion causing LB issues, system-managed identity + UDR limitation, AGIC add-on version control

## 2026-04-05 ado-wiki tick (seq 441-443)
- **Pages**: 3 processed ([TSG] Azure Network Policy Manager, NPM PlaceAzureChainFirst, [TSG] Azure Virtual Network and SubNet)
- **Track A**: 2 entries (NPM retirement aks-ado-wiki-442, NPM PlaceAzureChainFirst breaking change aks-ado-wiki-443)
- **Track B**: 1 guide draft (ado-wiki-azure-network-policy-manager-tsg.md → aks-ado-wiki-441)
- **Skipped**: 1 page (VNet/SubNet — redirect stub, no content)
- **Remaining**: 159 pages

### 2026-04-05 ado-wiki tick (seq 444)
- Pages processed: 1 (Calico TSG)
- Track B (guide-draft): 1 — ado-wiki-calico-tsg.md
- Track A (break/fix): 0
- Deduplicated: 0
- Remaining: 158
- exhausted: false

### 2026-04-05 onenote tick (Feature Landing Status batch 1)
- Scanned: 10 pages (Feature Landing Status section)
- Discovered: 3 (aks-onenote-149..151)
- Deduplicated: 1 (Azure Linux/Mariner → aks-onenote-142)
- Skipped: 6 (thin content: doc links/screenshots only)
- Key finds: Container Storage not in Mooncake, graceful SP update without reboot, LTS Premium tier requirement

### 2026-04-05 — ADO Wiki Scan (aks)
- **Source**: Supportability/AzureContainers/Containers Wiki
- **Page**: [TSG] AKS API Connectivity - Hands-On Labs
- **Track A**: 2 entries (aks-ado-wiki-444, aks-ado-wiki-445)
  - Public cluster: Authorized IP ranges blocking kubectl access
  - Private cluster: NSG DenyOutboundHTTPS blocking TCP 443 across VNet peering
- **Track B**: Guide draft saved → guides/drafts/ado-wiki-aks-api-connectivity-hands-on-labs.md
- **Deduplicated**: 0
- **Remaining**: 160 pages

### 2026-04-05 onenote-extract tick (Feature Landing Status batch)
- **Pages scanned**: 10 (Feature Landing Status section)
- **Track A new**: 1 — aks-onenote-152 (RBAC mode switching: Azure RBAC → K8s RBAC access loss)
- **Track B guide-draft**: 1 — aks-onenote-153 → guides/drafts/onenote-aks-rbac-authorization-modes.md
- **Deduplicated**: 5 (Node OS upgrade=138, deprecated API=095/141, workload identity=046, auto-upgrade=105, syslog=008/014/028)
- **Skipped (thin)**: 3 (OSM, VPA, Workload IP — insufficient content)
- **Remaining**: 232 pages

## 2026-04-05 ado-wiki tick (chain)
- **Pages processed**: 7 (network troubleshooting methodology: collaborations, CoreDNS, IP-masq-agent, identify affected areas, K8s LB Service, NSG, PrivateLink Cluster)
- **Track A entries**: 12 (aks-ado-wiki-446 to aks-ado-wiki-460, excluding guide-draft entries)
- **Track B drafts**: 4 (collaborations, CoreDNS, identify-affected-areas, k8s-loadbalancer-service)
- **Remaining**: 151 pages
- **Next seq**: 461

### 2026-04-05 09:16 — ado-wiki tick
- **Processed**: 20 pages (14 dedup skip, 6 reference-only/link-index pages)
- **Discovered**: 0 new entries
- **Deduplicated**: 14 (already in JSONL from prior runs, scanned list now synced)
- **Remaining**: 1075 unscanned pages

### 2026-04-05 — onenote tick (batch 24)
- **Processed**: 10 pages (Feature Landing Status + Readiness Plan sections)
- **Discovered**: 5 new entries (aks-onenote-154..158)
- **Deduplicated**: 0 (2 entries marked relatedTo existing: aks-onenote-016, aks-onenote-028)
- **Skipped**: 5 pages (thin content / internal training docs)
- **Topics**: VMSS deallocated deletion (API 2021-07-01), stop/start 12-month limit, cert expiry lifecycle, kubectl debug SSH, auto-upgrade + maintenance window
- **Remaining**: 222 unscanned pages

## 2026-04-05 09:24 — ado-wiki scan (chain)
- **Pages processed**: 4 (429 Throttling, CSE Exit Codes, AgentBaker ConfigVersionError, Deployment Recommendations)
- **Track A entries**: 3 (aks-ado-wiki-462..464)
- **Track B guide-drafts**: 2 (vmss-cse-exit-codes, deployment-recommendations) + JSONL pointers (aks-ado-wiki-465..466)
- **Remaining**: 147 pages (exhausted: false)
- **Next seq**: 467

## 2026-04-05 09:30 | Phase 2 onenote-extract (tick)
- Scanned 10 pages from Troubleshooting--MUST READ section
- Track A: 5 break/fix entries (aks-onenote-159 to 163) — Defender profile gap, AzureDefenderFeatureFlagNotEnabled, CRD cleanup bug, Policy addon portal bug, JIT process change
- Track B: 3 guide-drafts (aks-onenote-164 to 166) — workload protection, fault domain Kusto, Kusto queries reference
- Skipped 3 link-only pages (CVE guide, AKS Policy, Emerging Issue) — no extractable content
- Total scanned: 252/464 (212 remaining)
- exhausted: false

## 2026-04-05 ADO Wiki Scan (tick)
- **Source**: Supportability/AzureContainers/Containers Wiki
- **Pages processed**: 9 (Hands-On Labs, Private Cluster, vmssCSE failures [skipped-large], AKSCapacityError, AgentBaker ConfigVersionError, Deployment Recommendations, DiskControllerTypeMismatch, Machine API, NetworkingInternalOperationError)
- **New entries**: 4 (aks-ado-wiki-467 to aks-ado-wiki-470)
  - 467: AKSCapacityError/AKSCapacityHeavyUsage constrained region (relatedTo: aks-mslearn-074)
  - 468: DiskControllerTypeMismatch NVMe vs SCSI for Standard_E112ibds_v5
  - 469: Machine API NotFound errors (agentpool not registered / API version unsupported)
  - 470: NetworkingInternalOperationError on CRUD operations
- **Deduplicated**: 5 (pages 1,2,5,6 fully covered by existing entries)
- **Remaining**: 144 pages
- **Exhausted**: false

### 2026-04-05 ado-wiki tick (vmssCSE exit codes comprehensive TSG)
- **Source**: Supportability/AzureContainers/Containers Wiki
- **Pages processed**: 1 (49374 chars — vmssCSE failures during node provisioning)
- **Discovered**: 15 new entries (aks-ado-wiki-464 to aks-ado-wiki-478)
  - 464: VMAgentStatusCommunicationError — VM cannot reach storage account
  - 465: Multiple VM extensions failed — defective VM, reimage required
  - 466: Exit code 1 Linux vmssCSE — admin username >32 chars (InvalidLinuxAdminName)
  - 467: Exit code 1 AKSLinuxExtension — dpkg locked, old cluster version
  - 468: Exit code 2 Windows — acs-mirror FQDN resolution failure
  - 469: Exit code 5 Windows — API server connection failure
  - 470: Exit code 25 — ZScaler SSL interception blocks packages.microsoft.com
  - 471: Exit code 31 — NVA blocking acs-mirror for K8s binary download
  - 472: Exit code 33/34/35 Windows — download failures (CSE/K8s/CNI packages)
  - 473: Exit code 50 — VNET address overlap with public IP range
  - 474: Exit code 50 — VNET encryption with firewall/NVA
  - 475: Exit code 84 — NVIDIA GPU driver installation failure
  - 476: Exit code 99 — apt-get update timeout
  - 477: Exit code 100 — provision script missing (modified VMSS custom data)
  - 478: Exit code 124 — timeout masking networking errors (50/51/52)
- **Deduplicated**: 0 (existing entries 203/323/461 cover different sub-scenarios)
- **Remaining**: ~148 pages

### 2026-04-05 09:34 — ado-wiki tick (vmssCSE failures during node provisioning)

- **Pages scanned**: 1 (49374 chars — oversized single page)
- **Extracted**: 5 Break/Fix entries (aks-ado-wiki-471, 479-482)
  - 471: Exit code 1 Linux — admin username >32 chars / dpkg lock
  - 479: Exit code 50/124 — outbound connectivity to mcr.microsoft.com blocked
  - 480: Exit code 51/52 — API server connection / DNS lookup failure
  - 481: Exit code 25 — SSL certificate interception by ZScaler/proxy
  - 482: Exit codes 31/41/2/33/34/35 — acs-mirror.azureedge.net download blocked
- **Deduplicated (file-level)**: Cleaned 185 duplicate entries from JSONL (accumulated from prior runs)
- **Remaining**: ~142 pages

## 2026-04-05 ado-wiki tick
- Pages processed: 2 (CSE Exit Codes, NSG deletion fails)
- Track A extracted: 1 (aks-ado-wiki-483: NSG leaked object blocks cluster delete)
- Track B drafts: 0
- Deduplicated: 1 (CSE Exit Codes landing page ≥80% overlap with aks-ado-wiki-461~482)
- Remaining: 1065 unscanned pages

### 2026-04-05 onenote-extract tick (Troubleshooting section)
- Pages processed: 10 (PDB, PM&PG, Storage in AKS, ASI, Blobfuse logs, Blobfuse+Prometheus, Support Policy, Support boundary, Ubuntu Unattended Update, SSH VMSS)
- Track A extracted: 4 (aks-onenote-167: blobfuse+Prometheus volume size, aks-onenote-168: Ubuntu unattended update detail [relatedTo:048], aks-onenote-169: SSH VMSS via VMAccess [relatedTo:028], aks-onenote-170: storage capacity semantics)
- Track B guide-drafts: 2 (aks-onenote-171: blobfuse logging, aks-onenote-172: version support policy)
- Deduplicated: 1 (PDB page ~=aks-onenote-015)
- Skipped (no content): 3 (PM&PG contacts only, ASI link only, Support boundary links only)
- Remaining: 202 unscanned pages

## 2026-04-05 ADO Wiki Batch (seq 485-487)
- Source: ado-wiki (Containers Wiki)
- Pages processed: 3 (AgentPool delete with ignore PDB, FailToDeleteVMSS DiskServiceInternalError, DNCCleanupServiceError)
- Track A (Break/Fix): 3 entries
- Track B (Guide): 0
- Deduplicated: 0
- Remaining: ~137

### 2026-04-05 onenote-extract tick (phase2 chain)
- Scanned 10 pages (Troubleshooting--MUST READ: CCP stats, Jarvis Action, Container Insights series, Disk Pressure)
- Discovered: 4 new entries (aks-onenote-173~176)
  - Track A: 2 (ama-logs OOM configmap tuning, ETCD DB size limits)
  - Track B: 2 guide-drafts (CCP request KQL, Container Insights log collection)
- Deduplicated: 1 (Jarvis Action ≥80% overlap with aks-onenote-029/163)
- Skipped: 5 (too thin — images only / bare links)
- Total scanned: 272/464 | Remaining: 192

[2026-04-05] ado-wiki-scan: +2 guide-drafts (aks-ado-wiki-488~489) from 2 pages (AKS Platform Diagrams reference, Emerging Issues Reporting & Tracking process). Both Track B — architectural reference and internal process docs, no break/fix patterns. Pre-read 20 pages with length cache. Scanned: 308/1318 index. ~1010 remaining.

## 2026-04-05 Phase2 onenote-extract (tick)

- **Pages processed**: 10
- **New entries**: 6 (aks-onenote-177 ~ 182)
  - Track A (break/fix): 2 (MCR proxy whitelist, blobfuse2 static mount RBAC)
  - Track B (guide-draft): 4 (tcpdump, log collection, blobfuse2 CSI setup, Mooncake tools)
- **Deduplicated**: 1 (Kusto RP-CRP tracing ≥80% overlap with aks-onenote-031)
- **Skipped (too minimal)**: 3 (kubectl link, troubleshooting guides index, extension troubleshooting links)
- **Guide drafts created**: onenote-tcpdump-on-aks-pod.md, onenote-aks-node-log-collection.md, onenote-blobfuse2-csi-setup.md, onenote-aks-mooncake-support-tools.md
- **Total scanned**: 282 / ~464 AKS-classified pages
- **Remaining**: ~182

## 2026-04-05 ADO Wiki Batch (seq 490-491)
- Source: ado-wiki (Containers Wiki)
- Pages processed: 6 (Brownbags, Product Info, Kusto Queries, Copilot Handlers, ACI SAL deletion, ACI Fraud)
- Track A (Break/Fix): 2 entries (490: ACI dangling SAL, 491: ACI fraud detection)
- Track B (Guide): 0
- Skipped (no TSG content): 4
- Deduplicated: 0 (490 related to aks-ado-wiki-005)
- Remaining: 28

## 2026-04-05 ado-wiki tick (agent chain)
- **Batch**: 7 pages (ACI section — Brownbags, Product Info, ACI Queries, Copilot Handlers, Private Link/DNS, SAL deletion, Fraud Detected)
- **Skipped**: 4 pages (no extractable content or empty)
- **Track A**: 2 entries (aks-ado-wiki-491: dangling SAL subnet deletion, aks-ado-wiki-492: fraud detection quota block)
- **Track B**: 1 guide draft (azure-copilot-aci-handlers.md, entry aks-ado-wiki-490)
- **Dedup**: aks-ado-wiki-491 relatedTo aks-ado-wiki-005 (50-80% overlap)
- **Reconciled**: pre-marked already-extracted pages as scanned to avoid re-processing after scanned list reset
- **Stats**: scanned 317/1318, remaining ~1008

## 2026-04-05 10:00 — onenote-extract (aks)
- Pages processed: 10 (Case Reviews x6, Training x1, Best Practice x1, ACR AAD x1, CKA x1)
- Track A new: 12 (aks-onenote-183 to aks-onenote-194)
- Track B guide-draft: 2 (aks-onenote-195, aks-onenote-196)
- Deduplicated: 1 (subnet IP exhaustion ~aks-onenote-002)
- RelatedTo links: 2 (aks-onenote-185->150, aks-onenote-187->036)
- Skipped: 1 page (CKA cert info, 0 issues)
- Remaining: 172 pages

### 2026-04-05 ado-wiki tick (chain)
- **Batch**: 3 pages (12266 chars)
- **Track A**: 2 break/fix entries (aks-ado-wiki-494: MSITokenRequestFailure, aks-ado-wiki-495: Memory metrics mismatch)
- **Track B**: 1 guide-draft (aks-ado-wiki-493: Kusto Helpers — draft already existed, JSONL pointer added)
- **Dedup**: 0 skipped
- **Progress**: 320/1318 scanned (24.3%)

## 2026-04-05 ado-wiki tick

- **Source**: ADO Wiki (Supportability/AzureContainers)
- **Pages processed**: 1 — [TSG] Service Unavailable Error
- **Track A entries**: 2 (aks-ado-wiki-504, aks-ado-wiki-505)
- **Track B guides**: 0
- **Deduplicated**: 0
- **Notes**: ACI 409 ServiceUnavailable TSG — extracted 2 break/fix entries covering unsupported region/feature and disabled clusters scenarios. Entry 505 relatedTo aks-ado-wiki-010 (Insufficient Capacity).

[2026-04-05] onenote-extract (aks): scanned 10 FY25 team meeting pages (2024-08 ~ 2025-05). +10 entries (aks-onenote-197~206), 1 deduped (Defender CRD overlap with aks-onenote-161). Key topics: disable SSH on VMAS, provision log security (private key/CA cert/admin user), kubectl labels lost on upgrade, Defender feature flag 21v, ACR token 3h expiry, VMSS direct delete→reconciliation scaling, IP range update triggers scale, StatefulSet endpoint stale after eviction. 162 pages remaining.

## 2026-04-05 10:10 | Phase 2 onenote-extract (tick)
- Scanned 10 pages (FY25 sync-up notes: Aug-Dec 2024, May 2025)
- Extracted 7 new entries (aks-onenote-197..203)
- Deduplicated 3 (AzureDefender->160, CRDs->161, LTS->151)
- Key topics: SSH VMAS, node labels upgrade, ACR token TTL, geo-replication, IP range scaling, StatefulSet endpoint, upgrade drain Cordon
- Remaining: 162 pages

[2026-04-05] onenote-extract (aks): scanned 10 FY25 team meeting note pages. Extracted 4 entries (aks-onenote-197~200): disable SSH on VMAS limitation, kubectl labels lost after node image upgrade, ACR az-acr-login token 3h expiry, apiServer IP range update triggers unexpected scaling. Deduped 2 (AzureDefender feature flag + CRD cleanup ≥80% overlap w/ aks-onenote-160/161). Skipped 4 (empty header, feature notes, minimal content). Total scanned: 302/464. Remaining: 162.

[2026-04-05] ado-wiki-extract (aks): EXHAUSTED — processed final 28 pages (all with length>1). Extracted 25 JSONL entries (aks-ado-wiki-493~517): 10 break/fix (MSI token failure, autoscaler safe-to-evict, conntrack persistent, ACI memory mismatch, nodepool SKU ephemeral disk migration, kubelet direct logs, pod logs pre-reboot, ACI LA workspace logs, ACR image deletion investigation, ACI service unavailable, AKS surge scaling), 13 guide-drafts (procdump windows, linux kernel mapping, scoop install, preserving node logs, troubleshooting windows nodes, managing pod dependencies, linux kernel dump/kdump, ACI troubleshooting basics, ACR private link, ACI kusto helpers, container log collection, track fix progress, kusto node metrics, CPU usage analysis), 2 skipped (contacts-only). Total scanned: 1325/1318. ADO Wiki source fully exhausted.

### 2026-04-05 10:24 — onenote-extract (aks)
- Pages processed: 10 (POD VMSCIM FY25/FY26 meeting notes + MOC Lab)
- Discovered: 6 new entries (aks-onenote-204 ~ 209)
- Deduplicated: 2 (MCR endpoint=aks-onenote-102, VM node pool=aks-onenote-076)
- Skipped: 4 pages (empty/reference-only: ##FY26, Question#, 2025_10_16, 2025_11_13)
- Key topics: app-routing PDB immutable, remediator AADSTS500011, CAS taint race during upgrade, GetVnetError CNI overlay, OIDC irreversible, LTS extended support
- Remaining: 152 pages

### 2026-04-05 10:40 — onenote-extract (aks)
- Batch: 10 pages (MOC Lab 1-4 + Regular Sync up with PG FY19 meetings)
- Discovered: 3 (aks-onenote-210..212)
- Deduplicated: 4 (SP expiry/NSG outbound/PDB upgrade matched existing; addonmanager+OperationsManagement from meeting notes)
- Skipped: 3 (empty section headers/templates)
- New issues: SP expired→LB pending, NSG blocks port 445→Azure Files mount, custom vnet kubenet missing routeTable
- Scanned: 322/464 | Remaining: 142
| 2026-04-05 | onenote-extract (PG sync-up FY19-20) | +13 issues (aks-onenote-213..225) | PG Sync-up meeting notes 20190516-20200220 |

**Batch details (10 pages processed):**
- Pages: PG sync-up meeting notes (FY19: 20190516, 20190530; FY20: 20191031-20200220)
- Discovered: 13 (aks-onenote-213..225)
- Deduplicated: 0
- Skipped: 0
- Key topics: Portal Standard/Basic LB mismatch (product bug), cluster deletion blocked by VM, chmod Azure Files by-design, ARM throttling VMSS mitigation, Azure CLI version incompatibility Mooncake, Terraform kubeDashboard unsupported, HTTP Application Routing Mooncake gap, sysctl by-design, kube-svc-redirect restarts, InsightsMetrics Mooncake gap, dockerhub mirror library/ prefix, OSBA environment config, Log Analytics deletion blocks scaling
- Scanned: 332/464 | Remaining: 132

## 2026-04-05 Phase 2 onenote-extract (PG Sync FY21)
- **Pages processed**: 10 (FY21 PG sync meeting notes: 20200723~20210107)
- **Track A entries**: 13 (aks-onenote-235~247)
- **Track B guide-drafts**: 0
- **Deduplicated**: 0 (2 entries linked as relatedTo existing)
- **Topics**: kubelet config, gcr.io proxy China, auto-repair docker, CoreDNS custom configmap, LB IP slow assignment, TLS handshake timeout, PDB blocks upgrade, nodepool mode mismatch, external-dns migration, SP expired migration, NPM OOM, 5s DNS delay, control plane memory limit
- **Total JSONL entries**: 247
- **Scanned**: 352 / 464 pages
- **Remaining**: 112
- **Exhausted**: false

### 2026-04-05 onenote-extract (PG Sync 2021-04~07)

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-05 | onenote | +3 entries (aks-onenote-281~283): containerd image GC cleanup (crictl rmi --prune), 100.64.0.0/10 shared address space not recommended, Chrony PTP time drift fix. ~17 dedup skips (CSE apt-get, AZ balance, containerd IP leak, cert-rotation, calico, etc). Pages 6&7 identical content. Scanned 382/464. | PG Sync meeting notes Apr-Jul 2021 |

**Stats**:
- **Discovered**: 3
- **Deduplicated**: ~17 (most topics covered by earlier PG sync batches)
- **Pages scanned**: 10 (2021_04_15 ~ 2021_07_01)
- **Total JSONL entries**: 283
- **Scanned**: 382 / 464 pages
- **Remaining**: 82
- **Exhausted**: false

## 2026-04-05 onenote tick (Mooncake POD Support Notebook — PG sync + CRUD Operations)

- **Pages processed**: 10 (4 PG sync meeting notes + 1 header + 5 CRUD operation tracing guides)
- **Track A (break/fix)**: 7 new entries (aks-onenote-284 ~ aks-onenote-290)
  - Fluentd log collection breaks after Docker→containerd (K8s 1.19+)
  - SLB outbound pool empty → nodes NotReady from manual modification
  - Azure Policy breaks after AKS VMSS moved to SIG images
  - GPU nodes (NC4as_T4_v3) fail on ephemeral OS disk
  - Node NotReady intermittent — kubelet lease update failure (go-client TCP bug, fixed K8s 1.20+)
  - Authorized IP ranges blocked by firewall subnet/service CIDR conflict
  - Orphaned CCP scales VMSS when dns-prefix reused
- **Track B (guide-draft)**: 1 guide (aks-onenote-291)
  - AKS CRUD Operations End-to-End Tracing Guide → guides/drafts/onenote-aks-crud-operations-tracing.md
- **Deduplicated**: 1 (systemd 6AM timeout → overlaps ≥80% with aks-onenote-168)
- **Remaining**: 72 pages unprocessed
- **Exhausted**: false
| 2026-04-06 | ado-wiki (batch-b) | +10 entries (aks-ado-wiki-b-001~010): ACR pull no-route-to-host PE disconnected, image/repo recovery via Kusto, PE limit 200→1000 ICM, cross-tenant ACR move, 401 anonymous token misleading error, push silent failure quarantine, replication CRUD stuck ARM+RP logs, storage 40TiB limit increase, Tasks networkRuleBypassAllowedForTasks 403 fix, Tasks free-tier pause. 0 dedup. | Containers Wiki /ACR/TSG/* |

### 2026-04-06 ado-wiki blast batch-b (r2)
- **pages assigned**: 10
- **pages with content**: 9 (1 empty [TBD])
- **deduplicated** (sourceRef exists in main JSONL): 8
- **new entries extracted**: 1 (Track A: ACR CORS Policy)
- **Track B drafts**: 0 (new)
- **IDs**: aks-ado-wiki-b-r2-001
- ACR CORS Policy: users with large Azure AD group memberships → OAuth2 token exceeds 8KB ACR header limit → CORS block → PG deployed portal fix

### 2026-04-06 ado-wiki blast batch-b (r4)
- **pages**: 10 (AKS Network Troubleshooting Methodology subtree)
- **Track A (break/fix)**: 2 entries
  - `aks-ado-wiki-b-r4-001`: NPM PlaceAzureChainFirst=True 1.27+ breaking change blocks LB traffic
  - `aks-ado-wiki-b-r4-002`: Palo Alto Traps/Cortex kills azure-vnet CNI binary → netplugin signal:killed
- **Track B (guide drafts)**: 5 guides
  - `aks-ado-wiki-b-r4-003`: IP-masq-agent TSG (iptables MASQUERADE diagnostics)
  - `aks-ado-wiki-b-r4-004`: NSG TSG (security rules validation for AKS)
  - `aks-ado-wiki-b-r4-005`: PrivateLink Cluster TSG (DNS zone + private endpoint diagnostics)
  - `aks-ado-wiki-b-r4-006`: Component Level Troubleshooting (19-component reference table)
  - `aks-ado-wiki-b-r4-007`: Network Troubleshooting Methodology (scientific method framework)
- **skipped**: 3 pages (Azure Firewall/LB/VNet — link-only reference pages, no extractable content)
- **deduplicated**: 0
- **files**: known-issues-ado-wiki-b.jsonl (7 entries), scanned-ado-wiki-b.json (10 pages), 5 guide drafts
| 2026-04-06 | ado-wiki | Blast batch-a r4: +7 break/fix (aks-ado-wiki-a-r4-001~007) + 2 guide-drafts (008~009). NPM PlaceAzureChainFirst 1.27+ breaking change, ip-masq-agent SNAT/outbound, NSG rules, PrivateLink DNS/timeout, netplugin signal:killed (Palo Alto), component-level reference, network methodology. 3 pages skipped (link-only: Firewall/LB/VNet). 10 pages processed. | Containers Wiki AKS Network TSG |

## 2026-04-06 batch-b round 7

- **source**: ado-wiki (blast-batch b-r7)
- **pages processed**: 10 (AGIC health probe/guide/SSL, images×2 skip, blob sync, vmssCSE, AKSCapacity, AgentBaker, DiskController)
- **Track A (break/fix)**: 7 entries (aks-ado-wiki-b-r7-001 to r7-007)
  - Blob sync between pods using BlobFuse (kernel cache)
  - AKSCapacityError/AKSCapacityHeavyUsage constrained region
  - AgentBaker ConfigVersionError on nodepool operations
  - DiskControllerTypeMismatch for NVMe-only VM sizes
  - vmssCSE exit 50 (outbound connectivity failure)
  - VMAgentStatusCommunicationError (all extensions fail, VM-level issue)
  - vmssCSE exit 1 (Linux admin username > 32 chars)
- **Track B (guides)**: 4 drafts (aks-ado-wiki-b-r7-008 to r7-011)
  - AGIC backend health probe troubleshooting workflow
  - AGIC main troubleshooting guide (entry point)
  - AGIC SSL configuration issues workflow
  - vmssCSE failures comprehensive guide (exit codes, diagnostics)
- **skipped**: 2 pages (images, visio — empty content)

### 2026-04-06 — ado-wiki blast batch-a round 9
- **mode**: blast-batch (batchId=a, round=r9)
- **pages**: 10 (CRUD/Create: 1, CRUD/Delete: 9)
- **extracted**: 12 Track A entries (aks-ado-wiki-a-r9-001..012)
- **Track B drafts**: 0
- **dedup**: 0 (no intra-batch duplicates)
- **21V notes**: entry 012 (Undelegate Subnet) — Jarvis undelegation restricted in China/21V
- **topics covered**:
  - Machine API errors (NotFound, NoRegisteredProviderFound)
  - VMSS delete failures (NetworkingInternalOperationError, DiskServiceInternalError)
  - NSG leaked object blocking cluster delete (Rnm.Contracts.Faults)
  - ARM cache sync issues causing delete failures
  - PDB violations blocking nodepool drain/delete (--ignore-pdb flag)
  - DNC cleanup service errors
  - ResourceGroupDeletionBlocked (non-managed refs + internal CRP/NRP errors)
  - ACI/Virtual Nodes NetworkProfile cleanup failure
  - Subnet delegation SAL not removed after cluster delete
- **deduplicated**: 0

### 2026-04-06 ado-wiki blast-batch b (r10)

- **batchId**: b
- **pagesProcessed**: 10 (1 Create + 9 Delete TSGs)
- **discovered**: 11 (10 Track A break/fix + 1 Track B guide-draft)
- **deduplicated**: 0
- **IDs**: aks-ado-wiki-b-r10-001 ~ aks-ado-wiki-b-r10-011
- **Track B guide**: `guides/drafts/ado-wiki-b-ResourceGroupDeletionBlocked-ResourceGroupDeletionTimeout.md`
- **Topics**: Machine API errors, NetworkingInternalOperationError, NSG leaked objects, ARM cache sync, PDB ignore, DiskServiceInternalError disk lease, DNCCleanupServiceError, ResourceGroupDeletionBlocked/Timeout, NetworkProfileAlreadyInUseWithContainerNics (ACI), subnet undelegation SAL

### 2026-04-06 ado-wiki blast batch-a (r12)
- **pages**: 10 (Scale TSG: autoscaler pending, ControlPlaneAddOnsNotReady x2, GetSurgedVms, workspace key, node registration, pod CIDR, NAP replace, quota/SKU, missing LAW)
- **Track A**: 10 break/fix entries extracted (001-007, 009-011)
- **Track B**: 1 guide draft (008: NAP cant replace cheaper node → guides/drafts/ado-wiki-a-nap-cant-replace-cheaper-node.md)
- **dedup**: 1 (page "ControlPlaneAddOnsNotReady kube system namespace" is duplicate of scenario 2 in the combined page)
- **21v**: 1 entry marked 21vApplicable=false (missing LAW → Defender not supported in 21V)
- **IDs**: aks-ado-wiki-a-r12-001 through aks-ado-wiki-a-r12-011
- **files**: .enrich/known-issues-ado-wiki-a.jsonl, .enrich/scanned-ado-wiki-a.json

| 2026-04-06 | ado-wiki (blast batch-b) | +11 entries from 10 Scale TSG pages (AKS/TSG/CRUD/Scale/*) | batch-b |

**Batch b details (r12)**:
- **Pages**: 10 (Cluster Autoscaler stuck, ControlPlaneAddOnsNotReady x2, GetSurgedVms_CountNotMatch, Invalid workspace key, Node registration fail, NAP subnet full, NAP cheaper node, SKU/Quota issues, Missing LAW)
- **Track A**: 10 break/fix entries (001-007, 009-011)
- **Track B**: 1 guide draft (008: NAP cant replace cheaper node -> guides/drafts/ado-wiki-b-NAP-cant-replace-cheaper-node.md)
- **dedup**: 1 (page 2 Scenario 2 duplicates page 3 content about user pods in kube-system)
- **21v**: All entries 21vApplicable=true (none involve 21v-unsupported features)
- **IDs**: aks-ado-wiki-b-r12-001 through aks-ado-wiki-b-r12-011
- **files**: .enrich/known-issues-ado-wiki-b.jsonl, .enrich/scanned-ado-wiki-b.json

## 2026-04-06 ado-wiki blast batch-b (Scale TSG)

- **batchId**: b | **pagesProcessed**: 10 | **discovered**: 10 | **deduplicated**: 0
- **ID range**: aks-ado-wiki-b-r13-001 ~ 010
- **Track A** (break/fix): 8 entries — autoscaler quota, kube-proxy x509/SSL, user pods in kube-system, upgrade surge race condition, OMS workspace key, vmssCSE missing, NAP pod CIDR exhaustion, missing LAW
- **Track B** (guide-draft): 2 entries — NAP consolidation troubleshooting, node scaling allocation/capacity/quota guide
- **21V check**: entry 010 (LAW/Defender) tagged 21v-partial — Defender not supported in 21V
- **Source**: AKS/TSG/CRUD/Scale/* (10 leaf pages)

### 2026-04-06 batch-a r14 (ado-wiki blast)
- **pages**: 10 (Scale: GetSKUStoreError, InvalidLBPorts, Quota vCPU, QuotaExceeded ManagedCluster, image-not-found, UnsupportedVMExtensions, VM VMSS Allocation, vmssCSE deleted; Start-Stop: State Reporting, azfw dnsproxy)
- **discovered**: 9 (8 Track-A break/fix + 1 Track-B guide-draft)
- **deduplicated**: 1 (Quota vCPU overlaps r11-010)
- **relatedTo**: r14-007 linked to r11-006 (vmssCSE variants)
- **guide-draft**: ado-wiki-a-vm-vmss-allocation-errors.md (allocation routing guide with TA contacts)

### 2026-04-06 ado-wiki batch-b (blast)
- Pages processed: 10 (1 skipped: 404 Force upgradeSettings)
- Discovered: 13 (Track A: 11, Track B guide-draft: 2)
- Deduplicated: 0
- Guide drafts: OverlaymgrReconcileError-troubleshooting, Compilation-Cluster-Failed-State
- Coverage: Start/Stop certificate errors, overlay upgrade failures, cluster failed state compilation (LA/subnet/policy/locks), VNet link, disk size mismatch, EtagMismatch, lost taints, tolerations behavior
- IDs: aks-ado-wiki-b-r16-001..013

| 2026-04-06 | ado-wiki (blast batch-a r20) | +10 entries (6 Track A break/fix + 4 Track B guide-drafts) | ADO Wiki Containers Wiki |

| 2026-04-06 | ado-wiki (blast batch-a r20) | +10 entries (6 Track A break/fix + 4 Track B guide-drafts) | ADO Wiki Containers Wiki |
- Batch ID: a, round: r20, IDs: aks-ado-wiki-a-r20-001..010
- Pages processed: 10 (5 Upgrade/Update TSGs + 5 Cluster Management TSGs)
- Track A: OverlaymgrReconcileError-kyverno, OverlaymgrReconcileError-noisy-neighbor, PDB-drain-failure, Resource-locks-ScopeLocked, Log-Analytics-Workspace-not-found, AKS-API-throttling
- Track B guides: 429-Throttling (ARM/RP investigation), AKS-Performance-Investigation-Flow (disk IO), AKS-Backup-Troubleshooting (extension install), AKS-Cluster-Stuck-On-Starting (multi-cause)
- Deduplicated: 0

| 2026-04-06 | ado-wiki (blast-batch-a, r21) | +10 entries (6 Track A break/fix + 4 Track B guide-drafts), 0 deduplicated. Batch: Upgrade/Update TSGs (OverlaymgrReconcileError-kyverno, noisy-neighbor, PDB, ScopeLocked, LA Workspace 404) + Cluster Management (AKS RP throttling, 429 investigation guide, IO perf guide, backup guide, stuck-starting guide). IDs: aks-ado-wiki-a-r21-001..010 | [blast-assign-a.json] |

## [2026-04-06 12:03] ado-wiki blast batch-a (r22)

- **Pages processed**: 10 (Upgrade/Update: 5, Cluster Management: 5)
- **Track A entries**: 9 (break/fix with symptom+rootCause+solution)
- **Track B guide-drafts**: 3 (pointer entries in JSONL)
- **Total discovered**: 12, deduplicated: 0
- **ID range**: aks-ado-wiki-a-r22-001 ~ aks-ado-wiki-a-r22-012
- **Files**: .enrich/known-issues-ado-wiki-a.jsonl, .enrich/scanned-ado-wiki-a.json
- **Guides**: ado-wiki-a-OverlaymgrReconcileError-noisy-neighbouring.md, ado-wiki-a-429-Throttling.md, ado-wiki-a-AKS-cluster-stuck-on-starting.md
- Topics: OverlaymgrReconcileError (kyverno webhook deadlock, noisy neighbor), PDB drain failures, resource locks, Log Analytics Workspace deletion, disk IO/IOPS throttling, AKS RP token bucket throttling, ARM 429 investigation, Azure Backup extension (MCR connectivity, Azure Policy, vendored SDK), cluster stuck on starting
