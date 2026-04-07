# Product Skill Evolution Log

> 知识演进审计日志。每次从案例、OneNote、ADO Wiki、手动输入学到的新知识都记录在此。

| Date | Source | Change | Case/Link |
|------|--------|--------|-----------|
| 2026-04-01 | case | 新增 known-issue monitor-001: scheduledqueryrules/write RBAC 403 → 授予 Monitoring Contributor | 2603310010001969 |
| 2026-04-01 | case | 新增 known-issue monitor-002: Logs Ingestion API 403 → 需 Monitoring Metrics Publisher 数据平面角色 | 2603300010000578 |
| 2026-04-01 | case | 新增 known-issue monitor-003: workspace() Resource ID 缺前导 / → 报错 resource not available | 2603300010000578 |
| 2026-04-01 | case | 新增 known-issue monitor-004: 参考表 TG 固定旧值 → join 时被时间过滤排除 → 内表不加 TG 过滤 | 2603300010000578 |
| 2026-04-05 | 21v-gap-scan | 5 unsupported, 2 partial features (Custom metrics, Storage Account logs, Service Map, SCOM integration, VM Insights 不支持; Change Tracking/Diagnostics Settings 部分支持) | POD Services/MONITOR/Feature Gap |
| 2026-04-05 | onenote-extract | +5 known-issues from 10 pages (Update Mgmt Dashboard/Linux, Python SDK alert rules, OMS Agent AzSecID/Current.mof, Alert targetResource visibility, Metric alert time granularity). 5 pages skipped (reference/guide/images only). | MCVKB Monitor section |
[2026-04-05] mslearn-scan: 8 articles scanned (activity-logs/config-export), 6 break/fix entries + 2 guide drafts extracted
[2026-04-05] ado-wiki-scan batch 1: scanned 8 pages (5 empty/meta, 2 guides, 1 break-fix), 3 JSONL entries (1 Track A + 2 Track B guide-drafts), 2 guide drafts written. AMPLS Private Link topic. Remaining: 2969/2977
[2026-04-05] onenote-extract (monitor): +9 entries (6 break/fix, 3 guide-drafts), 1 deduped (3.4=3.1). Scanned 10 pages (total 20/114). Track A: alert aggregate-on, LAW retention timeout, Policy diagnostic Mooncake, JS SDK audience, App Insights endpoints, Function log level. Track B: host metrics logs, query best practice, custom availability test.

[2026-04-05] contentidea-kb-scan: 5 entries extracted from 8 work items (keywords: Monitor, Log Analytics). 3 skipped (no structured fields). Topics: LA billing data, OMS agent reinstall, App Insights workspace unlinking, MMA troubleshooting script, Linux agent heartbeat missing.

## 2026-04-05 ado-wiki tick
- **Source**: ADO Wiki (Supportability/AzureMonitor)
- **Pages scanned**: 3 (AMPLS Training/Lab: Add VNet Link, Configure AMPLS+PE, Create Hub VNET)
- **Extracted**: 0 (all training course materials — step-by-step lab setup, no TSG/break-fix content)
- **Progress**: 14/2977 scanned

[2026-04-05] onenote-extract tick 3 (monitor): +8 entries (7 break/fix, 1 guide-draft), 0 deduped, 1 skipped (18.27 percentile - educational). Scanned 10 pages (total 30/114). Track A: Function 2.x App Insights Mooncake, APIM Self-gateway endpoint, Service Health advisory incidentType, AAD Diagnostic EventHub VNet, LSA v1 value display, orphaned diagnostic settings, Jarvis get-events deprecated. Track B: CEF Sentinel troubleshooting guide.
| 2026-04-05 | onenote | 新增 monitor-onenote-023: AppInsights 可用性测试 Mooncake 不可用 → Azure Function 自定义实现 workaround | MCVKB/Web/3.2 |
| 2026-04-05 | onenote | 新增 monitor-onenote-024: Host metrics 虚线 → 收集 host 监控 agent 日志方法 (Jarvis/Escort) | MCVKB/wiki_migration/7.6 |
| 2026-04-05 | onenote | 新增 monitor-onenote-025: 通过 Jarvis Get Resource 查询 action group 配置详情 | POD/MONITOR/Alert |
| 2026-04-05 | onenote | 新增 monitor-onenote-026: 通过 Jarvis 搜索 alert trigger 历史记录 | POD/MONITOR/Alert |
| 2026-04-05 | onenote | 去重跳过 2 页 (3.1/3.4 与 monitor-onenote-012 重复), 跳过 4 页空/培训内容 | batch3 |

## 2026-04-05 ado-wiki tick (AMPLS Hub-Spoke setup + Support Boundaries)
- Scanned 6 pages (batch 3), 3 new guide-drafts (006-008)
- Pages: Create Spoke VNET, Create VNET Peering, Enable VNET Integration → Track B (setup guides)
- Test Private Link Connection / What is Hub and Spoke → deduplicated (already in JSONL 004/005)
- Support Boundaries → empty placeholder, skipped
- Remaining: 2957 pages

## 2026-04-05 ado-wiki tick (batch 4)
- Scanned 3 AMPLS Support Topics pages (permissions, portal mgmt, programmatic mgmt)
- All Track B guide-drafts (template-based TSG workflow pages with data collection checklists)
- Added IDs monitor-ado-wiki-009 to 011
- Remaining: 2954 pages

## 2026-04-05 onenote tick (batch 5)
- Scanned 10 pages: AVD Monitor lab, AVD LogA queries, Log Analytics sample queries, export via runbook, training, troubleshooting overview, ASC gaps, IcM process, Jarvis diagnostics, Kusto ARM queries
- Track A: 3 entries (032-034): AVD ARM template error, metric measurement AggregatedValue requirement, Mooncake ASC feature gaps
- Track B: 5 guide-drafts (035-039): AVD KQL queries, LA export via alert+runbook, IcM escalation, Jarvis ingestion diagnostics, Kusto ARM/Activity Log
- Skipped 2 pages (empty/training links only)
- IDs: monitor-onenote-032 to 039
- Remaining: 54 pages

## 2026-04-05 ado-wiki tick (AMPLS Support Topics)
- **Scanned**: 3 pages (AMPLS DNS not resolving, Errors running queries, No data in LA/Metrics/AI)
- **Track A**: 2 break/fix entries (monitor-ado-wiki-012: stale DNS zone, 013: free tier no VNET)
- **Track B**: 3 guide drafts (014-016: DNS workflow, query errors workflow, no data workflow)
- **Deduplicated**: 0
- **Progress**: 26/2977 scanned

## 2026-04-05 onenote-extract tick (scanned 70/114)
- **Processed**: 10 pages (Log Analytics Troubleshooting: Linux Agent, Log A data ingestion flow, Log Ingestion Issue, Wiki & TSG, Windows Agent, What's New; Metrics section + Microsoft.Insights; Monitor overview + Advanced Training)
- **Track A (break/fix)**: 5 new entries (monitor-onenote-040 to 044)
  - 040: Daily cap data drop
  - 041: Custom fields limit exceeded
  - 042: Data missing in InMem/ODS pipeline
  - 043: Ingestion latency troubleshooting
  - 044: Microsoft.Insights resource provider not registered
- **Track B (guide-draft)**: 2 drafts (045-046)
  - onenote-oms-linux-agent-troubleshooting.md
  - onenote-log-analytics-ingestion-flow.md
- **Skipped**: 5 pages (links-only or empty: Wiki & TSG, Windows Agent, What's New, Metrics empty, Monitor overview, Advanced Training)
- **Deduplicated**: 0
- **Remaining**: 44 pages
- **Fixed**: Repaired broken JSON escaping in line 24 (monitor-onenote-024)

## 2026-04-05 ado-wiki tick (pages 27-28/2977)
- Built-In Azure Monitor Alerts → 1 Break/Fix (Action Group limitation) + 1 guide-draft (support boundary)
- Log Alerts optimization flow → 1 Break/Fix (sliding window for late data)
- New entries: monitor-ado-wiki-017 ~ 019
- Remaining: 2949 pages

### 2026-04-05 onenote-extract (tick 8)
- **Pages processed**: 10 (CSS Wiki, Learning Path, Mon RP Jarvis/Kusto, Readiness Content, Swarming Channel, Troubleshooting, Readiness resources from Global, Service Health, ICM Paths for Service Health, Resource Health)
- **Skipped**: 7 pages (link-only, empty, or training reference material)
- **New entries**: 3 guide-drafts (monitor-onenote-047~049)
  - 047: Monitor RP Jarvis/Kusto diagnostics (incoming/outgoing request tracing, azureinsightsmc cluster)
  - 048: Service Health ICM escalation paths (Communication Manager h3G1Xn, Supportability 42M1Op)
  - 049: Resource Health diagnostics (Jarvis queries for health events, false alerts, notification verification)
- **Deduplicated**: 0
- **Remaining**: 34 pages | **Exhausted**: false

## 2026-04-05 ado-wiki tick (pages 29/2977)
- Scanned: `/Alerts/Concepts/Log Data Access for Log Search Alert Rules` (9899 chars)
- Extracted: 5 break/fix entries (monitor-ado-wiki-020 ~ 024)
- Topics: LSA cross-tenant deprecation, NSP 403 errors, linked storage MI requirements, hidden data with workspace permissions, cross-service ADX/ARG identity
- Deduplicated: 0

### 2026-04-05 01:57 | ado-wiki tick
- Page: /Alerts/Concepts/Resource Health for Log Search Alerts
- Track A (Break/Fix): 8 entries extracted (monitor-ado-wiki-025 ~ 032)
- Topics: Resource Health events for Log Search Alerts - false positives, query errors, throttling, limits, NSP
- Remaining: 2947 pages

### 2026-04-05 Phase2 onenote tick (pages 81-90)
- **Scanned**: 10 pages (Tips/SmallLearnings, 10.4 custom logs, 10.7 LogA ARM, 10.8 Host Metrics, 10.2 diagnostic log integration, 19.1 Advisor Cost Optimization, metric rule traces, log search alert flow, AMA header, AMA Windows client)
- **Discovered**: 4 new entries (monitor-onenote-050~053)
  - 050: Diagnostic log integration guide (guide-draft)
  - 051: Azure Advisor Cost Optimization P95 mechanism (raw)
  - 052: Jarvis metric rule traces (guide-draft)
  - 053: AMA Windows client CLOUDENV parameter bug (raw)
- **Deduplicated**: 2 (10.7→007, 10.8→008/024)
- **Skipped**: 4 (3 empty pages, 1 images-only)
- **Progress**: 90/114 scanned, 24 remaining

## 2026-04-05 ado-wiki tick (monitor-ado-wiki-033~035)
- **Scanned**: 2 pages (VM Alerts Made Easy, Validate Logic App Action)
- **Track A (Break/Fix)**: 2 entries — Logic App connector missing connection; Logic App callback URI mismatch causing 404
- **Track B (Guide)**: 1 draft — `ado-wiki-vm-alerts-made-easy.md` (VM alert setup options: Recommended Alerts, Ready Signals, VM Insights queries, Guest Metrics)
- **21v**: VM Alerts guide marked `21vApplicable: false` (uses VM Insights + Custom Metrics, both unsupported in 21v)
- **Deduplicated**: 0
- **Remaining**: 2945/2977

### 2026-04-05 ado-wiki tick (Action Groups & Notifications)
- **Scanned**: 4 pages (How-To/Action Groups and Notifications section)
- **Track A (Break/Fix)**: 1 entry — Email Resource Manager Role behavior change May 2024 (group membership inheritance)
- **Track B (Guide Drafts)**: 4 drafts — ARM role checking, Action Group change events Kusto query, Action Group details from ASC, Notification history from ASC
- **New entries**: monitor-ado-wiki-036 to monitor-ado-wiki-040
- **Deduplicated**: 0
- **Remaining**: 2941 pages
| 2026-04-05 | onenote | +9 entries (054-062): AMA log collection, AMA-to-Storage deprecation, LA REST API auth (RBAC vs API perm), hidden setbypolicy diag settings, MMA→AMA migration guide, Container Insights DNS/firewall, metric alert state corruption, ADX↔LA Mooncake endpoint, duplicate custom logs known issue | Phase 2 tick |

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (batch limited by 15k char budget)
- **Track B (guide-draft)**: 1 — `notification-history-action-group-kusto.md` (how-to query AzNSTransmissions_All for Action Group notification history)
- **Track A (break/fix)**: 0
- **Deduplicated**: 0
- **New IDs**: monitor-ado-wiki-041
- **Remaining**: 2940 pages

### 2026-04-05 ado-wiki tick (pages 38-47)
- **Pages scanned**: 10 (Alerts/Action Groups and Notifications + Activity Log Alerts)
- **Track A (break/fix)**: 6
  - `monitor-ado-wiki-043`: Azure Notification delivery status check via AzNS Kusto
  - `monitor-ado-wiki-044`: Service Health Notification status check via AzNS Kusto
  - `monitor-ado-wiki-045`: MEO email trace logs for email delivery issues
  - `monitor-ado-wiki-046`: Rate limiting detection (Need Notify = False)
  - `monitor-ado-wiki-049`: Legacy vs V2 runbook identification in Action Groups
  - `monitor-ado-wiki-051`: Activity Log Alert evaluation in sovereign clouds (Mooncake/Fairfax Kusto)
- **Track B (guide-draft)**: 4
  - `alert-payload-customize-email-logic-app.md` (Logic App for custom email notifications)
  - `trace-notification-asc.md` (ASC notification diagnostic logs)
  - `trace-notification-jarvis.md` (Jarvis tracing with cloud-specific endpoints)
  - `activity-log-alert-evaluation-asc.md` (ASC execution history analysis)
- **Deduplicated**: 0
- **New IDs**: monitor-ado-wiki-042 through monitor-ado-wiki-051
- **21v-relevant**: monitor-ado-wiki-051 (sovereign clouds Kusto query for Mooncake)
- **Remaining**: 2930 pages

### 2026-04-05 — Phase 2: onenote-extract (batch 11)

- **Source**: OneNote (page-classification.jsonl → monitor)
- **Pages processed**: 10 (3 empty/link-only skipped)
- **Track A (break/fix triplets)**: 4 new entries
  - `monitor-onenote-063`: AKS billable data query by service (KQL with find operator)
  - `monitor-onenote-064`: Custom metrics Sinks NOT available in Mooncake (21v gap)
  - `monitor-onenote-065`: HTTP 529 throttling analysis in Monitor Metrics API
  - `monitor-onenote-066`: Metrics export to Log Analytics not supported in Mooncake (IcM 119118816)
- **Track B (guide-drafts)**: 4 new guides
  - `onenote-monitor-feature-gap-mooncake.md` (comprehensive Global vs Mooncake feature gap table)
  - `onenote-log-analytics-mooncake-features.md` (LA-specific feature support matrix)
  - `onenote-mma-deprecation-mooncake-timeline.md` (MMA deprecation timeline and MDfC impact)
  - `onenote-custom-metric-vmss-deployment.md` (WAD/LAD deployment on VM/VMSS)
- **Deduplicated**: 0
- **New IDs**: monitor-onenote-063 through monitor-onenote-070
- **21v-relevant**: 064 (custom metrics), 066 (metrics export), 067+068 (feature gaps)
- **Remaining**: 4 pages

### 2026-04-05 — Phase 2: onenote-extract (batch 12 - final)

- **Source**: OneNote (remaining 4 pages)
- **Pages processed**: 4 (2 contact/link-only skipped)
- **Track A (break/fix triplets)**: 2 new entries
  - `monitor-onenote-071`: OMS agent Linux segfault with docker-ce 25.x (libcontainer.so incompatible)
  - `monitor-onenote-072`: Windows MMA SHA-1 code signing deprecation
- **Deduplicated**: 0
- **New IDs**: monitor-onenote-071, monitor-onenote-072
- **Remaining**: 0 — **onenote source EXHAUSTED**

## 2026-04-05 ado-wiki tick (continuation)
- Scanned 5 Activity Log Alerts How-To pages (evaluation engine, triggered alert details, alert changes specific/all, alert details from ASC)
- All 5 classified as Track B (guide-draft): operational ASC/Kusto procedures
- Added monitor-ado-wiki-052..056 (5 guide-draft entries)
- Progress: 52/2977 scanned, 2925 remaining

## 2026-04-05 ado-wiki tick (chain)
- Scanned: 2 pages (Activity Log Alert CRUD Kusto, Service Health Alerts invalid service names)
- Extracted: 1 guide-draft (057), 1 break/fix (058)
- Deduplicated: 0
- Remaining: 2923

## 2026-04-05 ADO Wiki Scan (tick 20)
- Pages scanned: 3 (Activity Log Alerts: test SH alert; Alerts Management: APR filter migration, APR eval logs Kusto)
- Track A (break/fix): 1 entry (monitor-ado-wiki-060: alert processing rule filter breaking change)
- Track B (guide drafts): 2 entries (monitor-ado-wiki-059: test service health alert; monitor-ado-wiki-061: APR eval logs Kusto)
- Deduplicated: 0
- Total scanned: 57/2977, remaining: 2920

## 2026-04-05 ado-wiki tick (Alerts How-To batch)
- **Pages scanned**: 5 (Alerts/How-To: ARG query, alert config Kusto, alert details ASC, fired history Kusto, fired history ASC)
- **Track A entries**: 3 (monitor-ado-wiki-062..063, 065) — ARG programmatic query, deleted alert recovery via Kusto, fired alert history Kusto
- **Track B guide-drafts**: 2 (monitor-ado-wiki-064, 066) — alert details ASC, fired history ASC
- **Guide draft files**: 4 created (alert-rule-details-all-types-asc, fired-alert-history-asc, alert-rule-config-kusto, fired-alert-history-kusto)
- **Deduplicated**: 0
- **Progress**: 62/2977 scanned (2.1%)
| 2026-04-05 | ado-wiki | +16 entries (monitor-ado-wiki-067~082): 6 Track A (ITSM failures x5, alert delay retry), 10 Track B guides (ARG query, alert rule config Kusto, classic migration, ITSM traces, LA Draft identity, MI ADX/ARG, stateful check, CRUD events, LA workspaces, mute actions) | AzureMonitor wiki - Alerts section |

## 2026-04-05 ado-wiki tick
- **Scanned**: 1 page (Log Alerts/How to get fired alert details from a log alert evaluation)
- **Track B**: 1 guide draft (ado-wiki-log-alert-fired-details-evaluation.md) — comprehensive Kusto query joining LSA→AMP→APR→AzNS for log alert evaluation details
- **JSONL**: +1 entry (monitor-ado-wiki-083, guide-draft, relatedTo: 065)
- **21v**: false (uses azalertsprodweu + aznscluster Kusto clusters)
- **Progress**: 73/2977 scanned (2.5%)

## 2026-04-05 ado-wiki tick (80-82)
- **scanned**: 10 pages (3 content + 7 empty/length=1)
- **discovered**: 3 guide-drafts (IDs 080-082)
- **Track B guides**: log-alert-evaluations-kusto, log-alert-extended-properties-asc, metric-measurements-log-alert-query-results
- **empty skipped**: 7 Metric Alerts How-To pages (length=1)
- **progress**: 85/2977 scanned, 2892 remaining

## 2026-04-05 ado-wiki tick (84-98)
- **Scanned**: 10 pages (6 Log Alerts How-To + 4 Metric Alerts How-To)
- **Discovered**: 15 entries (IDs monitor-ado-wiki-084~098)
- **Track A (break/fix)**: 9 entries
  - 087-091: Log alert evaluation failure messages (403 permissions, NSP, column resolution, workspace deleted, managed identity)
  - 093-094: False/missed log alerts (ingestion delay + bin→bin_at discrepancy)
  - 096: Metric alert Red-Black mismatch (Geneva Metrics stamp inconsistency)
  - 098: Metric alert false alert due to late arriving metric data (>3min delay)
- **Track B (guide-drafts)**: 6 entries + draft files
  - 084: Stateful log alert state change history (PlotAlertStateChanges)
  - 085: Draft request ID for Log Alert evaluation
  - 086: Identify Simple Log Alert (EventLogAlert alertKind)
  - 092: Unzip compressed troubleshooting query (gzip_decompress)
  - 095: Platform metric definition lookup
  - 097: Metric alert state change history from icmbrain cluster
- **Deduplicated**: 0
- **Fixed**: Corrected cached length=1 for 4 Metric Alerts pages (actual: 2240~6425 chars)
- **Progress**: 95/2977 scanned (3.2%), remaining: 2882

## 2026-04-05 09:37 — ado-wiki-scan tick

- **Pages processed**: 5 (Prometheus alerts How-To × 4 + Resource health × 1)
- **Track A entries**: 1 (monitor-ado-wiki-099: Prometheus rule group updates not processed)
- **Track B guide-drafts**: 4 (monitor-ado-wiki-100~103)
- **Scanned total**: 100 / 2979
- **Remaining**: 2879
- **Exhausted**: false

### 2026-04-05 — ado-wiki tick (pages 101-103)

- **Scanned**: 3 pages (Alerts/How-To/Resource health, Alerts/How-To/Smart detection, Alerts/Known Issues/Resource Recoverability)
- **Track A**: 1 entry (monitor-ado-wiki-106: resource recoverability after deletion)
- **Track B**: 2 guide drafts (resource/service health event delay investigation, smart detection config from ASC)
- **Deduplicated**: 0
- **Progress**: 103/2977 scanned

## 2026-04-05 ado-wiki tick (pages 104-110)
- Batch: 7 pages (Alerts/SAPs — alert resolution, notifications, unexpected content)
- Pages 1,2 empty; Pages 3,4,6,7 template-only (no real content)
- Page 5 (unexpected content): 4 Break/Fix items extracted (IDs 107-110)
  - Log alert search results removed in API 2021-08-01
  - MetricValue null in resolved stateful log alerts (by-design)
  - Dimensions empty when query returns 0 rows (by-design)
  - Custom properties only for actions, not notifications (by-design)
- Dedup: 1 weak overlap (monitor-ado-wiki-042), added relatedTo
- Scanned: 110/2977, remaining: 2867
| 2026-04-05 | ado-wiki | +1 guide-draft (expected-email-not-received-alerts); 4 pages skipped (empty/template) | Supportability/AzureMonitor:Alerts/SAPs/Action or notification |

## 2026-04-05 10:06 — ado-wiki tick (Alerts SAP pages)

- **Scanned**: 6 pages (Alerts/Support Area Paths — log/metric alert not resolving, availability/activity/log alert fired unexpectedly, test action)
- **Extracted**: 3 entries (monitor-ado-wiki-112~114)
  - 112: Log search alert doesn't resolve (stateful/autoMitigate)
  - 113: Metric alert doesn't resolve (3-consecutive-evaluations/autoMitigate)
  - 114: Availability test alert false positive (aggregation/dimension mismatch)
- **Skipped**: 3 pages (template-only or duplicate of existing entries)
- **Deduplicated**: 0 (new entries related to existing 084/097/098 but sufficiently distinct)
- **Remaining**: 2862 pages

| 2026-04-05 | ado-wiki | Batch scan: Alerts TSG + Support Boundaries (14 pages scanned, 10 new entries) | AzureMonitor wiki |

**Details (monitor-ado-wiki-115 to 124):**
- **Track A (6 break/fix entries)**:
  - 115-119: Activity log alert delay pipeline — 5 escalation patterns (RP delay, OBO ingestion, LA ingestion, evaluation engine, AMP delay)
  - 120: Event Hub action failure — target Event Hub does not exist
- **Track B (4 guide drafts)**:
  - 121: Dynamic threshold log search alert (TSID + baseline Kusto queries)
  - 122: Activity log alert delay pipeline timeline analysis
  - 123: Event Hub actions not received (notification trace diagnostics)
  - 124: Alerts support boundaries (ARG, Built-In, Security, Cost Management, Service Notifications)
- **Skipped**: 10 pages (7 empty due to path encoding, 3 generic SAP templates)
- **Deduplicated**: 0
- **Remaining**: 2844 pages

## 2026-04-05 ADO Wiki Scan (batch)

- Product: monitor
- Source: ado-wiki (Supportability/AzureMonitor)
- Pages processed: 23 (10+10 SAP templates skipped, 3 content pages extracted)
- JSONL entries added: 5 (IDs 125-129)
  - 3 guide-draft references (Track B): Activity log alert missed, Failure Anomalies missed, Failure Anomalies false
  - 2 break/fix entries (Track A): Failure Anomalies minimum ratio rejection, 3-Sigma rejection
- Guide drafts created: 3
- Key finding: length=1 cache values are inaccurate — actual pages have 4000-9500 chars of real content
- Remaining: 2821 pages
- Exhausted: false
| 2026-04-05 | ado-wiki | 修复 3 个 orphan guide draft (monitor-ado-wiki-130~132): Activity log alert missed, Failure Anomalies missed/false | ADO Wiki scan recovery |
| 2026-04-05 | ado-wiki | 新增 monitor-ado-wiki-133~135: AIOps Investigation 3 个 break/fix (permissions/no-findings/OpenAI failure) | /Alerts/TSG/Issues and Investigation |
| 2026-04-05 | ado-wiki | 新增 guide-draft + monitor-ado-wiki-136: Log Search Alert evaluation failures 综合排查指南 (syntax/throttling/NSP/access/ARG) | /Alerts/TSG/Log Search Alert eval failures |

### 2026-04-05 17:19 — ado-wiki scan (batch)
- Pages processed: 1
- Track B (guide-draft): ado-wiki-troubleshoot-log-search-alert-missed.md
- New entries: monitor-ado-wiki-137
- Progress: 162/2977 scanned

### 2026-04-05 ado-wiki tick
- **Page**: `/Alerts/Troubleshooting Guides/Troubleshooting Log Search alert fired when it shouldn't have (False Alert)` (18527 chars)
- **Classification**: Track B (troubleshooting guide / decision tree) + 2 Track A break/fix extractions
- **Track A entries**:
  - `monitor-ado-wiki-138`: Managed identity missing permissions for adx()/arg() cross-resource log alert → false alert
  - `monitor-ado-wiki-139`: Customer query re-run shows different results due to now()/ago()/bin() timestamp conversion mismatch
- **Track B**: Saved full 5-step TSG as `guides/drafts/ado-wiki-troubleshooting-log-search-alert-false-alert.md`
  - `monitor-ado-wiki-140`: Guide-draft reference entry
- **Deduplicated**: 0 (entry 019 covers ingestion delay broadly but <50% overlap with these specific entries)
- **Exhausted**: false (2822→2821 remaining)

## 2026-04-05 ado-wiki blast-batch (batchId: a, ASC How-To + Codeless Monitoring)
- **Pages assigned**: 10 (Azure Support Center How-To × 9, Agent-based Monitoring overview × 1)
- **Pages with content**: 2
  - Use Access Control → Track B (guide-draft, RBAC role inspection via ASC)
  - Use Azure Monitor Metrics → Track B (guide-draft, MDM metrics validation via ASC)
- **Pages not found**: 8 (deleted/moved wiki pages — stale index entries)
- **New entries**: monitor-ado-wiki-a-001, monitor-ado-wiki-a-002 (both guide-draft)
- **Guide drafts**: 2 (ado-wiki-a-use-access-control-asc.md, ado-wiki-a-use-azure-monitor-metrics-asc.md)
- **Deduplicated**: 0
- **Batch isolation**: JSONL→known-issues-ado-wiki-a.jsonl, scan→scanned-ado-wiki-a.json
| 2026-04-05 | ado-wiki (batch-h) | Blast batch h: 10 pages assigned, 2 found, 8 not found (deleted/moved). Track A: 1 (iKey/component lookup Kusto query). Track B: 1 (Kusto Explorer setup guide-draft). | AzureMonitor.wiki:/Application Insights/How-To/Kusto/* |
- **Pages processed**: 10 (2 with content, 8 not found in wiki)
- **New entries**: monitor-ado-wiki-h-001 (Track A: iKey lookup), monitor-ado-wiki-h-002 (Track B: guide-draft)
- **Guide drafts**: 1 (ado-wiki-h-add-kusto-clusters-to-kusto-explorer.md)
- **Deduplicated**: 0
- **Batch isolation**: JSONL→known-issues-ado-wiki-h.jsonl, scan→scanned-ado-wiki-h.json

## 2026-04-05 ado-wiki blast-batch (batchId: b, Sampling/Smart Detection/Support Topics/Performance)
- **Pages assigned**: 10 (Sampling × 3, Smart Detection × 2, Support Topics × 3, Performance × 2)
- **Pages with content**: 2
  - Build a simple load test to validate Sampling → Track B (guide-draft, console app load testing tool)
  - Troubleshooting performance impact involving Java agent → Track A (1 break/fix: Reactor/Netty high CPU) + Track B (comprehensive Java agent performance TSG)
- **Pages not found**: 8 (deleted/moved wiki pages — Smart Detection/Support Topics directories removed, .Net SDK page removed, Sampling Overview/Confirm pages renamed)
- **New entries**: monitor-ado-wiki-b-001 (Track A: Reactor/Netty CPU), monitor-ado-wiki-b-002 (Track B: load test guide), monitor-ado-wiki-b-003 (Track B: Java agent perf guide)
- **Guide drafts**: 2 (ado-wiki-b-build-simple-load-test-validate-sampling.md, ado-wiki-b-troubleshooting-performance-java-agent.md)
- **Deduplicated**: 0
- **Batch isolation**: JSONL→known-issues-ado-wiki-b.jsonl, scan→scanned-ado-wiki-b.json

### 2026-04-05 ado-wiki batch-f
- **batchId**: f
- **pagesProcessed**: 10
- **discovered**: 0 (all pages returned 404 — stale index entries)
- **deduplicated**: 0
- **note**: All 10 Autoinstrumentation pages under /Application Insights/Learning Resources/Training/Course Materials/ are stale paths. Wiki restructured — actual pages use different naming (e.g. "Azure Function .Net Core Out of Process" vs "Out of Proc (isolated)"). Pages marked as scanned to avoid re-processing.

### 2026-04-05 batch-e (ado-wiki blast)
- **Pages scanned**: 10 (Training/Course Materials: Classic SDK × 5, OTel SDK × 4, Profiler × 1)
- **Content**: 9 empty parent pages, 1 training lab template (JavaScript SDK, 1666 chars)
- **Discovered**: 0 | **Deduplicated**: 0
- **Reason**: All pages are course material scaffolding/index pages with no break/fix issues or troubleshooting content
| 2026-04-05 | ado-wiki (batch-b) | 0 new issues — all 10 pages used invalid path prefix "Azure Monitor (Common)" (not found in wiki) | wiki:AzureMonitor.wiki |

### Batch b — ADO Wiki Blast (2026-04-05)
- **Pages attempted**: 10 (AMA Linux/Windows troubleshooting, Syslog overview/troubleshooting/dataflow, Custom Log scenarios, MMA Data Collection overview, AMA custom log troubleshooting, Custom Logs MMA troubleshooting, IIS logs troubleshooting)
- **Content**: All 10 pages returned "page not found" — path prefix `/Azure Monitor (Common)/` does not exist in AzureMonitor.wiki
- **Discovered**: 0 | **Deduplicated**: 0
- **Reason**: The pagesToProcess entries reference a non-existent wiki section. Real equivalents exist under `/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux|Windows/` and `/Log Analytics/`

## 2026-04-05 13:17 — ado-wiki batch-d (blast)
- **batchId**: d
- **pagesProcessed**: 10 (all not found)
- **discovered**: 0
- **deduplicated**: 0
- **note**: All 10 pages under Azure Monitor (Common)/How-To/Azure Monitor agent/ no longer exist. Wiki restructured — content moved to /Monitor Agents/ subtree. Pages marked as scanned-not-found.

### 2026-04-05 — ado-wiki batch-f (blast)
- **Pages assigned**: 10
- **Pages fetched**: 0 (all 10 pages are stale/deleted from wiki)
- **Discovered**: 0 | **Deduplicated**: 0
- **Stale paths**: 8× `/Azure Monitor (Common)/How-To/Log Analytics/...` (parent path removed from wiki), 2× `/Log Analytics/Common Concepts/...` (subpages deleted/reorganized)
- **Note**: Wiki has been reorganized — `/Azure Monitor (Common)` no longer exists. Equivalent content likely moved to `/Log Analytics/Troubleshooting Guides/`, `/Log Analytics/Support Boundaries/`, `/Log Analytics/Learning Resources/`

### 2026-04-05 — ado-wiki batch-e (blast, Log Analytics/Common Concepts)
- **batchId**: e
- **pagesRequested**: 10 (all from `/Log Analytics/Common Concepts/`)
- **requestedPagesStatus**: All 10 not found (stale index — pages deleted/restructured)
- **actualPagesProcessed**: 8 (fetched real existing pages under Common Concepts)
  - Custom logs management (11788 chars) → 4 Track A + 1 guide-draft
  - Ingestion-time Transformation (5387 chars) → 1 Track A + 1 guide-draft
  - TimeGenerated adjustments on Data Export (2943 chars) → 1 Track A
  - Query-Related Plugin Limitations (1391 chars) → 1 Track A
  - Query Packs (1879 chars) → 1 Track A
  - Query limits (5252 chars) → 1 guide-draft
  - Reproducing Basic Portal issues (1533 chars) → skipped (short guide, saved as draft)
  - Resource scope queries (6797 chars) → 3 Track A + 1 guide-draft
- **Track A (break/fix)**: 11 entries (monitor-ado-wiki-e-001 ~ 011)
  - Custom log re-creation, retention charges, V1→V2 migration, DCR naming validation
  - parse 10-column limit, TimeGenerated export discrepancy, disabled KQL plugins
  - Query pack 5-limit, resource scope 400, cross-tenant blocked, custom log unsupported scope
- **Track B (guide-drafts)**: 4 entries (monitor-ado-wiki-e-012 ~ 015) + 5 draft files
- **Deduplicated**: 0
- **21v**: All entries 21vApplicable=true (no 21v-unsupported features involved)

### 2026-04-05 ado-wiki batch-h
- **Batch**: h | **Pages**: 10 | **Discovered**: 0 | **Deduplicated**: 0
- All 10 pages returned NOT FOUND (wiki restructured/deleted):
  - 3x Learning Resources (Kusto Reference, Log Analytics General, Log Analytics Onboarding)
  - 2x Support Boundaries (Log Analytics Support Boundaries, Log Analytics Support Topics)
  - 4x Troubleshooting Guides (Heartbeat, Data Collection, No Data, Queries)
  - 1x AMA Linux (Collect AMA Linux logs for troubleshooting)
- These appear to be stale index entries from old wiki structure
| 2026-04-05 | ado-wiki blast-batch-b | 新增 8 条 App Insights 知识 (IDs 034-041): webtest ASC checkbox fix, React PageView duration=0, Spring Boot dual instrumentation conflict, Java SDK 2.x deprecated→migrate, Python OpenCensus deprecated→migrate, billing/refund guide, Python customize telemetry guide, autoinstrumentation investigation guide | batch-b |
| 2026-04-05 | ado-wiki blast-batch-c | 新增 10 条知识 (IDs c-015~c-024): Track A: Stale Private DNS Zone → NXDOMAIN (ID 015), TLS 1.0/1.1 mismatch → telemetry not ingested (ID 016). Track B: Node.js/Python sampling guides, AKS OTLP TSG, curl/PS telemetry send guides, AI endpoint connectivity guides, AMPLS validation, TCP validation | batch-c |
| 2026-04-06 | ado-wiki | blast-batch a: 10 pages AMPLS section processed; 3 Track-A entries (wrong/public IP resolution, multiple AMPLS DNS override); 2 Track-B guide-draft pointers | known-issues-ado-wiki-a.jsonl |
| 2026-04-06 | ado-wiki | blast-batch a-r1: 10 pages App Insights How-To+Known Issues; 5 Track A (50100 4xx failures/AlwaysOn, 50424 missing telemetry/invalid LAW, 50460 VS CodeLens broken, 52029 limited telemetry types/Profiler SDK, 54136 Node.js __Empty response); 5 skipped (templates/internal process docs) | known-issues-ado-wiki-a.jsonl |
| 2026-04-06 | ado-wiki | blast-batch a-r5: 10 pages App Insights Known Issues + Learning Resources; Track A: 5 entries (r5-001 Status Monitor V1 retirement, r5-002 AllowPrivateEndpoints/AMPLS, r5-003 classic AI deploy failure post-April 2025, r5-004 TLS availability test alert, r5-005 .NET Core autoinstrumentation fails/ASPNETCORE_HOSTINGSTARTUPASSEMBLIES); Track B: 2 guide-drafts (r5-006 Code-less Explained .NET, r5-007 PowerShell cmdlets reference); 3 skipped (Academy/Brown bags/Advanced Training - no TSG value) | known-issues-ado-wiki-a.jsonl |

### 2026-04-06 ado-wiki blast batch-a (r15)
- **Pages**: 10 (App Insights Training: Networking 2, Portal Experiences 7, Profiler 1)
- **Track A**: 2 break/fix (r15-001: TLS 1.0/1.1 rejected by ingestion endpoint; r15-002: E2E transaction duration mismatch due to in-process code)
- **Track B**: 6 guide-drafts (r15-003~008: Overview blade metric mapping, Application Map topology, Performance blade KQL, Users blade HLL count, Live Metrics QuickPulse architecture, Log-based vs Standard metrics)
- **Skipped**: 2 (Network Infrastructures empty template, Profiler & Snapshot Debugger empty)
- **Discovered**: 8 | **Deduplicated**: 0
- **Guide drafts**: 6 new files in guides/drafts/ado-wiki-a-*

| 2026-04-06 | ado-wiki | blast-batch b: 10 pages App Insights autoinstrumentation training (Java+Python); 8 Track A break/fix (Java: startup-cmd conflict, JAVA_OPTS conflict, preview config props; Python: Windows unsupported, version 3.8-3.11 only, duplicate telemetry, container unsupported, AppLens misleading Profiler/SnapshotDebugger); 5 Track B guide drafts (Java/Python AppLens validation, Kudu validation, Portal+ASC telemetry verification) | known-issues-ado-wiki-b.jsonl |
### 2026-04-06 ado-wiki blast batch-a r8
- **pages**: 10 (App Insights Autoinstrumentation training: Java 5 + Python 5)
- **discovered**: 6 (Track A break/fix items)
- **deduplicated**: 0
- **new items**: r8-001 Startup Command 2.X agent conflict, r8-002 preview config properties, r8-003 Python version 3.8-3.11 requirement, r8-004 sdkVersion prefix decoding, r8-005 Java version mismatch, r8-006 Enabled≠Succeeded distinction
- **guides**: 0 new (r7 already created 3 guide-drafts for validation pages)
- **note**: Same 10 pages as r7; r8 extracted 6 additional Break/Fix items not captured in r7

### 2026-04-06 — ado-wiki blast batch-b (r8)
| 2026-04-06 | ado-wiki (blast-b) | +4 break/fix, +2 guide-drafts from 10 AppInsights training pages | batch-b |
- **pagesProcessed**: 10 (Autoinstrumentation: Python/VM Extension/Functions + Availability Tests)
- **discovered**: 6 (4 Track A break/fix + 2 Track B guide-drafts)
- **deduplicated**: 0
- **new items**: r8-001 Python Kudu status misleading, r8-002 Get-AzVMExtension ResourceNotFound name mismatch, r8-003 Extension unhealthy but monitoring works, r8-004 Out-of-proc Function dual SDK versions
- **guides**: 2 new drafts (post-install-considerations-appinsights-vm-extension, asc-features-availability-tests)

### 2026-04-06 ado-wiki blast batch b (r9)
- **pages**: 10 (Application Insights training materials: Availability Tests, Self-Diagnostics, Application Framework, Control/Data Plane, Daily Cap)
- **Track A**: 9 break/fix entries (regional availability test failures, 5 self-diagnostics error patterns, Quarkus incompatibility, daily cap global endpoint issue, daily cap overage by design)
- **Track B**: 6 guide drafts (availability test architecture, creation process, self-diagnostics how/what/when, control & data plane troubleshooting)
- **discovered**: 15
- **deduplicated**: 0
- **new items**: r9-001 availability test regional failure, r9-002 Java cipher suite, r9-003 Entra ID token failure, r9-004 DNS resolution, r9-005 invalid iKey, r9-006 daily cap hit, r9-007 Quarkus native, r9-008 daily cap global endpoint, r9-009 daily cap overage by design
- **guides**: 6 new drafts (availability-test-architecture, availability-test-creation-process, self-diagnostics-how/what/when, control-data-plane-troubleshooting)
- **note**: Training materials under Course Materials/Autoinstrumentation and Availability; 4 pages skipped (pure how-to/concepts with no break/fix or TSG value)

### 2026-04-06 ado-wiki blast batch b (r10)
- **pages**: 10 (Classic SDK/Node.js, OTel Java/NetCore/Node.js/Python, Networking/NetMon, Network Connectivity DNS-TCP-TLS/nslookup/Validate-DNS/Validate-TCP)
- **Track A**: 4 break/fix entries (network connectivity troubleshooting stages, AMPLS DNS resolution mismatch, WEBSITE_DNS_SERVER misconfiguration, 48-hour timestamp rejection)
- **Track B**: 4 guide drafts (DNS-TCP-TLS connectivity overview, nslookup CNAME/AMPLS analysis, DNS validation in App Services, TCP/curl validation with sample payload)
- **discovered**: 8
- **deduplicated**: 0
- **skipped**: 6 (4 empty parent pages with no content, 2 TBD placeholder pages)
- **new items**: r10-001 network connectivity 3-stage diagnosis, r10-002 AMPLS private DNS resolution, r10-003 App Service WEBSITE_DNS_SERVER failure, r10-004 ingestion 48h timestamp rejection
- **guides**: 4 new drafts (Understanding-DNS-TCP-TLS, Understanding-nslookup, Validate-DNS, Validate-TCP)

### [2026-04-06 r18] ado-wiki blast batch-a (Training/Pre-reqs)
- **pagesProcessed**: 10
- **pages**: Create App Insights Component, Create Azure Windows Server VM, Deploy VS to IIS, Eclipse Deploy, Maven Deploy, VS to App Services Container, VS to Azure App Services, SSH on App Service Container, Install Tomcat, Install Azure CLI
- **Track A extracted**: 2 candidates (VS auth failure + Python publish limitation) -> both deduplicated (>80%% match with r17-001/r17-002)
- **Track B extracted**: 1 guide draft (SSH access for container diagnostics)
- **Training tutorials skipped**: 8 pages (pure setup tutorials with no troubleshooting value)
- **discovered**: 1, **deduplicated**: 2

### 2026-04-06 ado-wiki blast batch-a r19
- **batchId**: a | **pagesProcessed**: 10 | **discovered**: 3 | **deduplicated**: 0
- Pages 1-5: Training pre-req install guides (Docker/Eclipse/Java/Maven/VS IDE) — no Azure Monitor troubleshooting content, skipped
- Page 6: VS Code install — empty content, skipped
- Pages 7-9: Training templates (Lab/Objective/Pre-req) — placeholder text, skipped
- Page 10: TLS 1.0/1.1 deprecation TSG — **3 Track A entries extracted** (availability test TLS failure, ingestion global endpoint TLS retirement, post-migration TLS negotiation failure)
- IDs: monitor-ado-wiki-a-r19-001 ~ 003

| 2026-04-07 | MERGE | Merged 4 per-source JSONL files → 1209 entries (0 cross-source dedup, 81 21V补标). Sources: onenote=51, ado-wiki=1080, mslearn=73, contentidea-kb=5. IDs renumbered monitor-001 to monitor-1209. | known-issues.jsonl |
| 2026-04-07 | SYNTHESIZE | Full synthesis: 50 topics (35 fusion, 15 compact), 1206 entries retained, 3 discarded. 86 guide files generated (50 quick-ref + 35 detail + 1 index). 5 Kusto query files mapped to 4 topics. 0 cross-source conflicts detected. | guides/_index.md |
