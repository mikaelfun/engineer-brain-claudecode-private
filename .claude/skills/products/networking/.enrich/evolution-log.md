# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|

## 2026-04-05 — ADO Wiki Index Built
- Source: ado-wiki
- AzureNetworking/Wiki: 2537 leaf pages
- WindowsNetworking/WindowsNetworking: 1614 leaf pages
- Total indexed: 4151 pages
- Status: index only (no content extracted this tick)

## 2026-04-05 ado-wiki batch 1
- Pages scanned: 3/4151
- Track A (break/fix): 4 issues from WAF page (JS Challenge unsupported, OWASP CRS 3.x → 500 error, deletion failure with child security policies, transient WAF gap on hierarchy change)
- Track B (guide-drafts): 3 drafts (AGC Ingress Annotations, CNI Overlay Support, WAF Support)
- JSONL entries: 7 (4 raw + 3 guide-draft)
- Remaining: 4148 pages

## 2026-04-05 — ADO Wiki Scan (tick 2, pages 4-7)
- **Source**: Supportability/AzureNetworking Wiki
- **Pages scanned**: 4 (AGC How-To section)
- **Track A (Break/Fix)**: 3 entries extracted
  - networking-ado-wiki-008: BYO vs ManagedBy mixing breaks AGC frontend
  - networking-ado-wiki-009: WAF not working in BYO mode without security policy
  - networking-ado-wiki-010: Cross-namespace HTTPRoute requires ReferenceGrant
- **Track B (Guide)**: 1 guide-draft created
  - networking-ado-wiki-011: AGC WSL lab setup automation guide
- **Deduplicated**: 0
- **Exhausted**: false (7/4151 scanned)

### 2026-04-05 ado-wiki tick (batch 3)
- **Pages processed**: 6 (4 content + 2 skipped: 1 template, 1 lab deployment)
- **Track A (Break/Fix)**: 4 entries (networking-ado-wiki-012~015)
  - FIPS enablement process (feature flag via ICM)
  - Limiting AGC clients to Front Door (HTTPRoute header matching)
  - AGC limits not documented (advise load testing)
  - AKV CSI driver not working with AGC certificates
- **Track B (Guide)**: 1 draft (ssl-certificates-aks-agc.md, entry 016)
- **Skipped**: LabBox Scenarios (template), [LabBox] AGC (lab deployment, not TSG)
- **Deduplicated**: 0
- **Remaining**: ~4131 pages

## 2026-04-05 ado-wiki tick 3
- Scanned 2 pages (Log sources for AGC, Training 00 Prerequisites)
- Track B: 1 guide draft (ado-wiki-agc-log-sources.md)
- Track A: 0 break/fix entries (Training prereqs page had no troubleshooting content)
- New entries: networking-ado-wiki-017
- Total scanned: 15/4151, remaining: 4136

### 2026-04-05 ado-wiki tick (chain)
- Scanned 2 pages (AGC Training Lab 01-02)
- Track B: 2 guide-drafts (terraform deployment, AKS app deployment)
- IDs: networking-ado-wiki-018..019
- Total scanned: 17/4151, remaining: 4134
| 2026-04-05 | contentidea-kb | +1 JSONL (ILB/VPN ADFS MTU issue #64141); scanned 10/19 work items, 9 had no structured fields | ContentIdea#64141 KB4033315 |

### 2026-04-05 ado-wiki tick (batch 5)
- **Pages processed**: 7 (4 AppGW + 2 AGC TSG + 1 skipped template)
- **Track A (Break/Fix)**: 4 entries (networking-ado-wiki-020~024)
  - 020: AppGW 400 error when URL exceeds 32KB limit
  - 021: Nmap user-agent in access logs (known bug, platform fix Q2 2026)
  - 022: CPU spike from Qualys security scan (expected, max 5%)
  - 024: Backend pool duplicate address PUT failure (known bug, single-op fix)
- **Track B (Guide)**: 2 drafts (networking-ado-wiki-023, 025)
  - 023: TSG Diagnosing ALB Controller installation (error code ranges)
  - 025: TSG Diagnosing Control Plane (Brain) - Jarvis logs
- **Skipped**: Case Note Best Practice template (no TSG content)
- **Deduplicated**: 0
- **Total scanned**: 24/4151, remaining: 4127

### 2026-04-05 ado-wiki tick (batch 6)
- **Pages processed**: 2 (AGC Training Lab 03-04)
- **Track B (Guide)**: 2 guide-drafts
  - 026: ALB deployment + SSL cert PFX conversion (3DES vs AES256)
  - 027: Gateway/HTTPRoute deployment + ReferenceGrant
- **Track A**: 0 (cross-namespace 500→ReferenceGrant duplicates 010, ≥80% overlap)
- **Deduplicated**: 1 (skipped)
- **Total scanned**: 26/4151, remaining: 4125

## 2026-04-05 — 21v-gap-scan
- Source: 21v-gap
- podServicesDir: null (networking has no POD Services directory)
- Grep fallback: searched POD notebook for networking/VNet/VPN/ExpressRoute + "not support|gap" — 3 incidental hits in VM/AKS pages, none networking-specific
- Result: 0 unsupported, 0 partial features
- Written: 21v-gaps.json (noGapDataFound: true)

## 2026-04-05 contentidea-kb batch 2 (final)
- Source: contentidea-kb
- Keywords: Virtual Network, Load Balancer, VPN Gateway
- Total work items found: 19 (across 3 keywords, deduped)
- Previously scanned: 10, this batch: 9
- Extractable (has structured fields): 1 (ContentIdea#125221 — VPN/AOVPN SSO cached credential issue)
- Skipped (no structured fields): 8 (KB2Docs migrations, docs issues, VA dialogs, migration batches)
- New JSONL entries: 1 (networking-contentidea-kb-002)
- Deduplicated: 0
- **Status: EXHAUSTED** — all 19 work items scanned

## 2026-04-05 onenote-extract batch 1
- Source: onenote (MCVKB/Net section)
- Pages scanned: 10 (AppGateway 1.3~1.11, ExpressRoute 2.4~2.5)
- Track A (break/fix): 7 entries (networking-onenote-001~007)
  - 001: AppGW NSG missing GatewayManager service tag
  - 002: ARM template deploy fails (principalId/clientId in identity)
  - 003: AppGW V2 nginx memory leak → 100% → outage
  - 004: AppGW V2 redirect drops non-standard HTTPS port
  - 005: AppGW VNET peering VMSS backend (Portal limitation, CLI workaround)
  - 006: WAF 403 false positive (URL-encoded JSON matches CRS SQL injection rules)
  - 007: BFD not working on old ExpressRoute circuits (pre-Aug 2018)
- Track B (guide-draft): 1 entry (networking-onenote-008)
  - AppGW V2 instance check via ASC/Jarvis
- Skipped: 1.9 duplicate of 1.8, 2.4 image-only attachment
- Deduplicated: 0
- Total networking pages: 150, scanned: 10, remaining: 140
- Exhausted: false

### 2026-04-05 onenote-extract tick 2
- Pages processed: 10 (1.9, 2.4, 3.3, 3.6, 3.7, 3.11, 3.12, 3.13, 4.3, 5.2)
- Track A entries: 6 (009-014) — NAT GW VFP, cross-tenant peering, DDoS traffic drop, LB hash uneven, P2S Error 798, VPN PFS
- Track B guide-drafts: 3 (015-017) — VIP lifecycle, AccelNet diagnostics, NMAgent version
- Skipped: 1.9 (duplicate of 004), 2.4 (no content)
- Deduplicated: 1
- Total networking pages: 150, scanned: 18, remaining: 132
- Exhausted: false

### 2026-04-05 ADO Wiki Batch (scanned 26→28)
- Pages read: 2 (AGC Training Lab 05 - Initial Troubleshooting, Training - AGC for Containers overview)
- Track A break/fix: 0
- Track B guide-drafts: 1 (028) — AGC initial troubleshooting kubectl commands + example YAML
- Skipped: 1 (Training overview page — no extractable technical content)
- Deduplicated: 0
- Total networking ADO wiki pages: 4151, scanned: 28, remaining: 4123
- Exhausted: false

### 2026-04-05 onenote-extract tick 3
- Pages processed: 10 (DNS 7.1~7.3, Other 9.1, TrafficMgr 6.1, vNet 3.10+DHCP, VPN 5.3, Tools 10.11+10.13)
- Track A entries: 7 (018-022, 024) — iDNS hostname collision, DNS forwarder throttling, ICP 403 blocking, Traffic Manager NODATA, IKEv2 SA lifetime, NSG Flow Log tool
- Track B guide-drafts: 4 (023, 025-027) — DNS query procedure, DHCP workflow, pingmesh latency, Everflow TOR capture
- Deduplicated: 0
- Total networking pages: 150, scanned: 28, remaining: 122
- Exhausted: false

## 2026-04-05 — ADO Wiki Batch (AGC TSGs)
- **Source**: Supportability/AzureNetworking Wiki
- **Pages scanned**: 2 (Start Here: Environment Info Gathering, ALB Error Codes)
- **Track A (Break/Fix)**: 5 entries (networking-ado-wiki-030~034) — ALB error codes E1xxx-E5xxx grouped by category
- **Track B (Guide)**: 1 draft (ado-wiki-agc-env-info-gathering.md) + 1 pointer entry (networking-ado-wiki-029)
- **Total entries added**: 6 (029-034)
- **Progress**: 30/4151 pages scanned

## 2026-04-05 ADO Wiki Batch (pages 31-32)

- **Source**: Supportability/AzureNetworking Wiki
- **Pages processed**: 2
  - TSG: CRUD Troubleshooting flow for AGC → Track B (guide-draft)
  - TSG: Configuration Troubleshooting flow for AGC → Track A (2 break/fix entries)
- **New entries**: networking-ado-wiki-035 ~ 037 (1 guide-draft + 2 break/fix)
- **Guide drafts**: ado-wiki-tsg-crud-troubleshooting-agc.md
- **Cumulative**: 37 entries, 32/4151 pages scanned

### 2026-04-05 onenote-extract tick 4
- Pages processed: 10 (9.2 team mapping, 9.3 IP range, Catalog, 7.11 Vxlan/VFP decode, 2.4 SF Cluster NSG, 3.8 netsh trace, 6.2 FuncApp ILB ASE, 6.5 FuncApp slot+VNET, 8.1 Container App 21V DNS, 1.10 AppGW peering dup)
- Track A entries: 6 (028, 030-034) — ICM team mapping Kusto ref, SF Cluster NSG missing, netsh trace no-install, FuncApp ILB ASE DNS+CORS, FuncApp slot missing FileShare, Container App ICP default URL
- Track B guide-drafts: 1 (029) — Vxlan/VFP/Vmswitch trace decoding in Netmon
- Skipped: 2 (9.3 Public IP Range: download link only; Catalog: index page only)
- Deduplicated: 1 (1.10 AppGW VNET peering = existing networking-onenote-005)
- Total networking pages: 150, scanned: 38, remaining: 112
- Exhausted: false

## 2026-04-05 ADO Wiki Batch (pages 33-34)

- **Source**: Supportability/AzureNetworking Wiki
- **Pages processed**: 2
  - TSG: Data plane and Performance Troubleshooting flow for AGC → Track A (4 break/fix entries)
  - TSG: Troubleshooting CNI overlay in AGC → Track B (guide-draft)
- **Track A entries**: 4 (networking-ado-wiki-038~041)
  - 038: AGC 500 from invalid backend entries (InvalidKind/BackendNotFound/RefNotPermitted)
  - 039: AGC 500 from no endpoints for all backends
  - 040: AGC 503 from backend unreachable/unhealthy (subnet mismatch, health probe fail)
  - 041: AGC 404 from no matching HTTPRoute
- **Track B guide-drafts**: 1 (ado-wiki-tsg-cni-overlay-agc.md, entry 042)
  - CNI overlay diagnostic: ALB version, NmAgent version, overlay extension config, custom resource
- **Deduplicated**: 0
- **Cumulative**: 42 entries, 34/4151 pages scanned
- **Exhausted**: false

### 2026-04-05 onenote-extract tick (batch 4: Tools + ControlPlane)
- **Source**: onenote (MCVKB/Net/10.Tools + AppGateway + vNet/DHCP)
- **Pages processed**: 10 (10.23 TLS decrypt, 10.1 AccelNet OUT stats, 1.1 AppGW VIP query, 10.14 Pcap2Kusto, 10.18 AZFW capture, 10.15 Traceroute/WAN, 10.16 VNet Escort JIT, 10.17 Inbound process tuple, 10.19 ELK flow logs, DHCP control plane)
- **Track A entries**: 3 (035-037: TLS decrypt, AccelNet vNIC stats, AppGW VIP query)
  - TLS/SSL: SSLKEYLOGFILE env var + Wireshark TLS config; DH cipher caveat
  - AccelNet: GFT namespace replaces vmswitch for OUT stats (relatedTo: 016)
  - AppGW VIP: Kusto ApplicationGatewaysExtendedHistory (deprecated)
- **Track B guide-drafts**: 7 (038-044)
  - onenote-pcap-to-kusto.md: pcap2kusto.ps1 + free ADX cluster + KQL sample
  - onenote-azfw-packet-capture.md: AZFW/VPN/ER/VWAN capture via Escort JIT + Jarvis
  - onenote-traceroute-wan-flow.md: WAN Edge LookingGlass + NetCapPlan IPFIX + BestTrace
  - onenote-vnet-get-escort-jit.md: JIT portal + Shadow RDP + CME Jarvis login
  - onenote-inbound-process-tuple.md: ASC+Jarvis or Kusto for inbound path test
  - onenote-elk-flow-logs-core-routes.md: ELK on 21v infra for everflow/netflow analysis
  - onenote-network-control-plane.md: NRP/RNM/NSM/NMAgent/SLBM/Mux/SLBHP architecture
- **Deduplicated**: 0
- **Cumulative**: 44 entries (known-issues-onenote.jsonl), 48/150 pages scanned
- **Exhausted**: false

### 2026-04-05 ado-wiki blast-batch c (AppGW Features & 499 TSG)
- **Source**: Supportability/AzureNetworking Wiki (blast-batch c)
- **Pages processed**: 10 (9 content + 1 empty template)
- **Track A (Break/Fix)**: 4 entries (networking-ado-wiki-c-001~004)
  - c-001: Session affinity cookie domain mismatch when AppGW overrides hostname
  - c-002: Session affinity cookie Domain includes port (violates cookie spec)
  - c-003: Private-Only GW backend health erroneous NSG/UDR error message
  - c-004: L4 TLS proxy incompatible with MySQL protocol handshake
- **Track B (Guide)**: 7 drafts (networking-ado-wiki-c-005~011)
  - c-005: FIPS mode for AppGW v2
  - c-006: Deploy v1 on v2 hardware (allow-listing)
  - c-007: L4 AppGW overview
  - c-008: Private-Only Gateway capabilities & known issues
  - c-009: WAF rate limiting rules
  - c-010: WAF per-rule exclusions
  - c-011: 499 response troubleshooting guide (comprehensive)
- **Skipped**: Copilot for Security WAF (template reference only, no content)
- **Deduplicated**: 0
- **Batch output**: known-issues-ado-wiki-c.jsonl (11 entries), scanned-ado-wiki-c.json (10 paths)

### 2026-04-05 ado-wiki blast-batch e (AppGW How To)
- **Source**: Supportability/AzureNetworking Wiki (blast-batch e)
- **Pages processed**: 10 (3 content + 7 not found/deleted)
- **Track A (Break/Fix)**: 2 entries (networking-ado-wiki-e-001~002)
  - e-001: Self-signed cert without proper chain rejected by AppGW v2
  - e-002: Diagnostic Settings conflict when same Log category goes to same LAW
- **Track B (Guide)**: 3 drafts (networking-ado-wiki-e-003~005)
  - e-003: Self-signed cert creation guide (openssl + PowerShell methods)
  - e-004: Customer-facing KQL queries for AppGW diagnostic logs
  - e-005: PowerShell script to audit V2 AppGW resource counts/limits
- **Not found (deleted/renamed)**: 7 pages (Decrypt Wireshark, disable cipher, HTTP→HTTPS redirect, 502 errors, HTTPS to backend, IP/FQDN backend pool, migrate SSL V1→V2)
- **Deduplicated**: 0
- **Batch output**: known-issues-ado-wiki-e.jsonl (5 entries), scanned-ado-wiki-e.json (10 paths)

## 2026-04-05 — ADO Wiki Blast Batch D (AppGW L4 Proxy + WAF + Migration)
- Source: ado-wiki (blast-batch batchId=d)
- **Pages processed**: 10 batch paths (3 with content, 3 remapped to actual paths, 4 not found/deleted)
- **Track A (Break/Fix)**: 5 entries (networking-ado-wiki-d-001~005)
  - d-001: WAF 403 false positive — anomaly scoring + exclusion creation workflow
  - d-002: WAF 413 Request Entity Too Large — Content-Type determines body vs file upload limit
  - d-003: WAF rules 200002/200004/0 blocking file uploads — parsing and multipart boundary issues
  - d-004: Portal OWASP 3.2→DRS 2.1 upgrade resets all customizations — use PowerShell script
  - d-005: L4 TLS proxy backend cert errors — SNI mismatch and Root CA trust issues
- **Track B (Guide)**: 2 drafts (networking-ado-wiki-d-006~007)
  - d-006: L4 TLS/TCP proxy troubleshooting (AFEC checks, KQL queries, metrics, unsupported features)
  - d-007: WAF comprehensive TSG (anomaly scoring, exclusions, regex analysis, body limits, mandatory rules)
- **Not found (wiki restructured)**: 5 pages (AGW v2 WAF block list, Validating WAF rules via Log Analytics, zone-redundant migration, v1→v2 migration guide, v1→v2 common issues)
- **Remapped pages**: Troubleshoot L4→Troubleshooting Guide; WAF TSG→WAF for AppGW/Troubleshooting; WAF DRS→Upgrade Script OWASP 3.2 to DRS 2.1
- **Deduplicated**: 0
- **Batch output**: known-issues-ado-wiki-d.jsonl (7 entries), scanned-ado-wiki-d.json (13 paths), 2 guide drafts

## 2026-04-06 — ADO Wiki Batch b (3b-blast)
- Source: ado-wiki | batchId: b
- Pages: 10 (AzureNetworking/Wiki — AppGw How To section)
- Track A extracted: 5 (HTTP 404 hostname mismatch, WebApp URL redirect exposure, SNAT exhaustion 504/502, Key Vault secret SSL portal limitation, New-AzApplicationGateway -Identity + -FirewallPolicy PS bug)
- Track B drafts: 5 (FIPS v1, PER-URI WAF policy, WAF trigger section identification, set-cookie rewrite, cert details from Public Certificate Data)
- Total JSONL entries: 10 → known-issues-ado-wiki-b.jsonl
- Deduplication: 0 (new batch, no prior b-batch entries)

## 2026-04-06 — ADO Wiki Batch b (3b-blast, run 2: AppGW Known Issues + LabBox + References)
- Source: ado-wiki | batchId: b | _pages_b.json (10 pages)
- Pages processed: 10 (AzureNetworking/Wiki — AppGw Known Issues, LabBox Scenarios, Log Sources, Cleanup, DNS Cache, SDP, Backend Health Errors, Rewrite Rules)
- **Track A (Break/Fix)**: 9 entries (networking-ado-wiki-b-001~009)
  - b-001: ODHP probe failure with intermediate certs in chain (bug #7258041, fix Q4 2025)
  - b-002: AppGW DNS cache staleness — stale backend IPs after FQDN DNS change (Nginx startup-only resolution prior behavior)
  - b-003: Backend health CN mismatch (V2 SNI hostname ≠ cert CN)
  - b-004: Backend health — leaf cert not topmost in chain
  - b-005: Backend health — leaf certificate missing from chain
  - b-006: Backend health — intermediate certificate missing (incl. self-signed non-CA)
  - b-007: Backend health — server cert not from well-known CA
  - b-008: Backend health — intermediate not from well-known CA
  - b-009: Backend health — trusted root cert mismatch (no Root CA in chain)
- **Track B (Guide-Drafts)**: 7 drafts (networking-ado-wiki-b-010~016)
  - b-010: LabBox TLS Proxy (V2 with self-signed CA, E2E SSL)
  - b-011: LabBox V1 E2E HTTPS (fabrikam.com, private DNS zone)
  - b-012: LabBox V2 E2E HTTPS (fabrikam.com, hosts file)
  - b-013: Log Sources for AppGW (Jarvis/Kusto reference: ReqResp, BackendHealth, WAF, CRUD, AGIC, KV)
  - b-014: RDFE V1 Cleanup Guide (ASM PowerShell, List/Remove-AzureApplicationGateway)
  - b-015: Region-wise SDP release process (Canary→Pilot→Medium→Heavy→Broad phases)
  - b-016: Rewrite Rules (7 scenarios: path rewrite, content-type, redirect logic, header manipulation)
- **Deduplicated**: 0
- **Output**: known-issues-ado-wiki-b.jsonl (16 entries), scanned-ado-wiki-b.json (10 paths), 7 guide drafts

## 2026-04-06 — ADO Wiki Blast Batch b (ExpressRoute Advanced Troubleshooting)
- Source: ado-wiki (Supportability/AzureNetworking/Wiki)
- batchId: b
- Pages processed: 10 (ExpressRoute Advanced Troubleshooting section)
- Track A (Break/Fix): 10 entries (networking-ado-wiki-b-001 to b-007, b-009, b-012, b-013)
  - ARP failures (STAG/CTAG), CSES→VMSS migration errors (4 types), gateway transit not supported, port capacity upgrade failure, BGP route flapping (re-advertisement loop), BGP No-Export blocking, DropLocalSubnets drop
- Track B (Guide drafts): 5 drafts → 5 JSONL pointer entries (b-008, b-010, b-011, b-014, b-015)
  - Arista/Cisco/Juniper MSEE Commands (internal-only), AS Path Prepend diagnostic guide, Connection Monitor TSG
- Deduplication: 0 deduplicated (new batch file)
- Output: known-issues-ado-wiki-b.jsonl (15 entries), scanned-ado-wiki-b.json (10 paths)
| 2026-04-07 | SYNTHESIZE | 22 topics (18 fusion, 4 compact), 386 entries, 14 Kusto queries fused |

## 2026-04-17 18:14 — onenote tick (networking)
- Pages scanned: 10 (wiki_migration/Net batch)
- Discovered (Track A): 0
- Deduplicated: 10 (all wiki_migration copies of already-processed Net/ pages)
  - 1.11 WAF → dup of networking-onenote-006
  - 1.3 NSG AppGW → dup of networking-onenote-001
  - 1.5 APPGW template → dup of networking-onenote-002
  - 1.6 AppGW V2 instances → dup of existing guide draft
  - 1.7 AppGW V2 memory → dup of networking-onenote-003
  - 1.8 AppGW redirect → dup of networking-onenote-004
  - 1.9 AppGW redirect URL → dup of networking-onenote-004 (identical content to 1.8)
  - 10.11 Pingmesh → dup of existing guide draft
  - 10.13 Everflow → dup of already-scanned Net/10.13
  - 10.13/JIT Jumpbox → sub-page dup of Everflow parent
- Guide drafts created: 0 (already exist from Net/ originals)
- Exhausted: false (58/159 scanned)

## 2026-04-17 18:21 — ado-wiki scan (ExpressRoute Features batch)

- **Pages scanned**: 10 (ExpressRoute Direct, LOA, Fastpath, GW Maintenance, PE Traffic, Global Reach, IPv6, Metro, Monitor, Guided Portal)
- **Track A (JSONL)**: 14 new break/fix entries (networking-ado-wiki-505 to 518)
- **Track B (Drafts)**: 9 troubleshooting guide drafts written
- **Skip**: 1 (Guided Portal Experience - product FAQ)
- **Dedup**: 0
- **Scanned total**: 394/2728

### 2026-04-18 17:08 — mslearn batch (VNet troubleshoot pages)
- Scanned 8 URLs: sdp-landing(skip), create-ptr(dedup), diagnose-traffic-filter, troubleshoot-nva, nsg-manage-log, test-latency, bandwidth-testing, troubleshoot-vm-connectivity
- Track A: +2 entries (networking-mslearn-066: NVA Standard SKU NSG, networking-mslearn-067: NIC failed state)
- Track B: +2 guide drafts (mslearn-troubleshoot-nva-checklist.md, mslearn-troubleshoot-vm-connectivity.md)
- Dedup: 1 (create-ptr ≥80% overlap with mslearn-001)
- Progress: 28/39 scanned, 11 remaining

## 2026-04-18 — Phase 4b mslearn batch 5 (8 pages)

**Pages processed:**
1. troubleshoot-outbound-smtp-connectivity (VNet) → Track A: 1 entry
2. virtual-network-troubleshoot-peering-issues (VNet) → Track A: 3 entries
3. virtual-network-troubleshoot-peering-sync-route-issues (VNet) → Track A: 3 entries
4. virtual-network-troubleshoot-connectivity-problem-between-vms (VNet) → Track B: guide draft
5. virtual-network-troubleshoot-cannot-delete-vnet (VNet) → Track A: 1 entry
6. virtual-network-troubleshoot-cannot-delete-modify-subnet (VNet) → Track A: 1 entry
7. vpn-gateway-troubleshoot-bgp (VPN Gateway) → Track A: 3 entries
8. front-door/refstring (Front Door) → Track B: guide draft

**Stats:** +12 JSONL entries (068-079), +2 guide drafts, 0 deduplicated
**Coverage:** VNet peering (Disconnected/overlapping/sync/DNS/P2S), VNet/subnet deletion blockers, VPN BGP (peer/flapping/advertisement), SMTP port 25 blocking, Front Door RefString
**Remaining:** 3 URLs (Front Door troubleshoot-compression, troubleshoot-issues, troubleshoot-performance-issues)

### 2026-04-18 Phase 4b mslearn (Final Batch — Front Door)
- **Fetched**: 3 URLs (troubleshoot-compression, troubleshoot-issues, troubleshoot-performance-issues)
- **Track A**: 7 entries (networking-mslearn-080 ~ 086) — Front Door compression, 503/504 timeout, 503 HTTPS/SSL, 400 custom domain, 411 RFC compliance, 429 rate limit, IP origin SNI
- **Track B**: 1 guide draft (mslearn-front-door-performance-troubleshoot.md) — 3-scenario performance diagnosis
- **Deduplicated**: 0
- **Status**: mslearn source EXHAUSTED (39/39 indexed URLs scanned)

### 2026-04-18T12:32:37Z — contentidea-kb scan (networking)
- WIQL returned 19 work items (keywords: Virtual Network, Load Balancer, VPN Gateway)
- All 19 already scanned → 0 new, 0 dedup
- exhausted: true (no new KB articles since last scan)
- lastRefreshed updated

## 2026-04-18 OneNote Scan (Batch 4)
- Pages scanned: 10 (TOR capture, AKS tcpdump, NRP/NSM logs, AVD RDP shortpath/Private Link/Service tag/VNet peering/Network issue, AKS security)
- Track A entries: 2 (networking-onenote-038: RDP Shortpath config, networking-onenote-039: Service tag CLI workaround)
- Track B guides: 4 (TOR capture topology, AKS pod tcpdump, NRP Kusto logs, NSM/NM Agent logs)
- Skipped (too short): 4 pages (AKS security, AVD Private Link, AVD VNet peering lab, AVD Network issue)
- Remaining: 91/159 pages

## 2026-04-18 20:43 — OneNote Scan (batch)

- **Pages scanned**: 10
- **Track A entries**: 4 (networking-onenote-040 ~ 043)
  - 040: AVD proxy config for system accounts (bitsadmin)
  - 041: ExpressRoute bandwidth monitoring via Kusto KQL
  - 042: ExpressRoute traffic check via Jarvis dashboard (relatedTo 041)
  - 043: AppGW backend pool load distribution verification
- **Track B drafts**: 1
  - `guides/drafts/onenote-pcap-to-kusto-analysis.md` — pcap to Kusto analysis workflow
- **Skipped**: 5 pages (3 empty section headers, 1 link-only, 1 deprecated link-only)
- **Deduplicated**: 0
- **Remaining**: 81 pages
- 2026-04-18 12:49 UTC | ado-wiki scan | 1 page processed (ExpressRoute Resiliency Validation) | 5 Track A entries (networking-ado-wiki-527~531) + 1 Track B draft | scanned: 397/2728

## 2026-04-18 OneNote Scan Round (batch 044-050)

- **Pages processed**: 10
- **New entries**: 7 (networking-onenote-044 to 050)
- **Deduplicated**: 1 (3.4 AccelNet OUT stats = networking-onenote-036)
- **Skipped**: 2 (section header page, raw NRP logs)
- **Topics**: ExpressRoute public peering deprecation, Global VNet peering (ILB constraint, gateway transit), SMTP port 25 blocking, VFP/NMAgent health check, host packet capture parsing, DHCP failure (SwitchPortNotPresent)
- **Remaining**: 71 pages
- **Exhausted**: false

## 2026-04-18 OneNote Scan (batch 5)
- Pages scanned: 10 (3 section headers with no content, 7 with extractable knowledge)
- New entries: 7 (networking-onenote-051 to 057)
- Deduplicated: 0
- Topics: Standard ILB PA address, ILB health probe Jarvis, VPN GatewayV3 ETL parsing, PingMesh latency verification, AP XTS host logs, Everflow JIT Jumpbox procedure, TOR capture Kusto queries
- Remaining: 61 pages
- Exhausted: False

## 2026-04-18 21:03 — ADO Wiki Scan (standard batch)
- Product: networking
- Pages scanned: 10 (ExpressRoute Features & Functions)
- Track A entries: 11 (IDs 532-542)
- Track B drafts: 3 (MACsec, MSEE architecture, Route Filter)
- Skipped: 2 (Standby Support template, Skytap overview)
- Topics: ErGwScale, subscription ops, Traffic Collector errors, Traffic Block Y-pattern, Route Filter auth

## 2026-04-18 21:04 — OneNote Scan (Batch: Tools 10.x)

**Pages processed**: 10
**Track A (JSONL)**: 4 entries (networking-onenote-058 to 061)
  - 058: MC JIT Jumpbox manual approval policy change
  - 059: VIP lifecycle check via Kusto ResourceLifeCycleEvent
  - 060: VFP stateful flow table inspection via FcShell
  - 061: TOR/NodeId lookup by ContainerId via Kusto (relatedTo: 057)

**Track B (Drafts)**: 2 guides
  - onenote-host-packet-capture-escort.md (from 10.21 + Psaw+CME)
  - onenote-azure-db-containerid-nodeid-lookup.md (from 10.22)

**0 output**: 4 pages (10.20 too short, 10.5 too short, 10.2 deprecated/overlapping, Psaw+CME merged into 10.21)
**Deduplicated**: 0 (061 has ~60% overlap with 057, added with relatedTo)
**Remaining**: 51 pages
**Exhausted**: false

### 2026-04-18 OneNote Scan (Round 12)
**Scanned**: 10 pages
**New entries**: 7 (networking-onenote-062 to networking-onenote-068)
- 062: VNet packet loss check via netvma tool, redeploy VM to healthy node
- 063: List all VMs under specific TOR switch via Kusto aznwcosmos query
- 064: Blob access failure troubleshooting flow (ASC transactions, PE, SAS, permissions)
- 065: Cross-region Global-Mooncake connectivity via WAN edge traceroute and GFW analysis
- 066: Decode Vxlan payload and VFP trace in Netmon/Wireshark (port 65330, custom NPL files)
- 067: ASR PE DNS failure in Mooncake - use privatelink address format in /etc/hosts
- 068: SDOStdPolicyNetwork blocks public IP on corpnet ER subscriptions (MSIT ISRM policy)
**0 output**: 3 pages (10.9 pingmesh duplicate with 054, 7.DNS section header empty, 6.29 AppGW+Storage stub incomplete)
**Deduplicated**: 0
**Remaining**: 41 pages
**Exhausted**: false

## 2026-04-18 13:18 UTC — ado-wiki scan (standard batch)
- Pages scanned: 10 (ExpressRoute How To)
- Track A (break/fix): 5 entries (IDs 543-547) — circuit deletion stale connections, BGP down RCA (BFD/holdtimer/maxprefix/interface flap)
- Track B (guides): 8 drafts — BGP route propagation, gateway migration, auto-ICMs, S2S VPN config, debug ACL, classic deprovisioning, topology discovery, BFD troubleshooting
- Skip: 0
- Remaining unscanned: ~2311
| 2026-04-24 | SYNTHESIZE | 22 topics, 386 entries, Phase 2.5 index + _index.md §5 format |
