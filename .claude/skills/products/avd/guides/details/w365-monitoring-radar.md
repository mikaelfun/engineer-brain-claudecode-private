# AVD W365 Monitoring & Radar - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-w365-monitoring-radar-function-use.md, ado-wiki-w365-monitoring-radar-scoping-questions.md, ado-wiki-w365-scope-tags-intunegeosync.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| W365 Monitoring (Radar) shows OS build version as Windows 10... | Known display issue in Radar monitoring configuration page | Known issue to be addressed in future update. Actual OS is c... |
| W365 Monitoring (Radar) filters lost when switching tabs, ti... | Known UI issue - filters and data series not persisted acros... | Known issue. Workaround: re-apply filters after switching ta... |

### Phase 2: Detailed Investigation

#### W365 Monitoring (Radar) - Function and Use
> Source: [ado-wiki-w365-monitoring-radar-function-use.md](guides/drafts/ado-wiki-w365-monitoring-radar-function-use.md)

Windows 365 reporting and monitoring has been substantially improved with an entirely new experience that provides:

#### W365 Monitoring (Radar) - Scoping Questions
> Source: [ado-wiki-w365-monitoring-radar-scoping-questions.md](guides/drafts/ado-wiki-w365-monitoring-radar-scoping-questions.md)

## 1. Environment & Configuration

#### Windows 365 Scope Tags — IntuneGeoSync Service
> Source: [ado-wiki-w365-scope-tags-intunegeosync.md](guides/drafts/ado-wiki-w365-scope-tags-intunegeosync.md)

> ⚠️ This information is primarily for WCX PMs and SaaF teams. Steps may not apply to CSS directly.

*Contains 1 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
//ScopeTag Sync Check
let CheckScopeTags = (CompanyID:string, Day1:timespan, Day2:timespan)
{
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where env_cloud_environment == "PROD"
| where env_time between (ago(2d)..ago(0d))
| where ComponentName != 'Instrumentation'
| where ComponentName != "MetricsMiddleware"
| where AccountId has CompanyID and Col
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | W365 Monitoring (Radar) shows OS build version as Windows 10 instead of Windows ... | Known display issue in Radar monitoring configuration page | Known issue to be addressed in future update. Actual OS is correct, display-only... | 🔵 7.5 | ADO Wiki |
| 2 | W365 Monitoring (Radar) filters lost when switching tabs, time range change rese... | Known UI issue - filters and data series not persisted across tab navigation | Known issue. Workaround: re-apply filters after switching tabs. | 🔵 7.5 | ADO Wiki |
