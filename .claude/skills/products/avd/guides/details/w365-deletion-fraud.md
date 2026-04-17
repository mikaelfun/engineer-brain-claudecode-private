# AVD W365 删除与防欺诈 - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-mount-vhd-after-place-under-review.md, ado-wiki-place-under-review-setup-guide.md, ado-wiki-w365-anti-fraud-abuse-process.md, ado-wiki-windows-365-customer-lockbox-faqs.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| DMS Client command not recognized error (XXXX is not recogni... | DMS Client version is outdated and does not support the requ... | Upgrade DMS client using Update-TorusClient -Version 16.01.2... |
| 403 Permission Insufficient error when running Customer Lock... | The OCE does not have the CLB elevated claim for the target ... | Request CLB elevated claim via DMS client: Set-MyWorkload Wi... |

### Phase 2: Detailed Investigation

#### Mount VHD on Azure VM after placing Cloud PC under review
> Source: [ado-wiki-mount-vhd-after-place-under-review.md](guides/drafts/ado-wiki-mount-vhd-after-place-under-review.md)

After placing a Cloud PC under review, the customer will likely want to find an easy way to access the data inside of the VHD.

#### Place Cloud PC Under Review - Setup Guide
> Source: [ado-wiki-place-under-review-setup-guide.md](guides/drafts/ado-wiki-place-under-review-setup-guide.md)

Set up a Blob Storage account with the correct permissions before using the Place Cloud PC under review feature.

#### Windows 365 Anti Fraud and Abuse Process
> Source: [ado-wiki-w365-anti-fraud-abuse-process.md](guides/drafts/ado-wiki-w365-anti-fraud-abuse-process.md)

## Tenant Score and Provision Lanes

*Contains 2 KQL query template(s)*

#### What is Customer Lockbox
> Source: [ado-wiki-windows-365-customer-lockbox-faqs.md](guides/drafts/ado-wiki-windows-365-customer-lockbox-faqs.md)

Windows 365 Customer Lockbox provides Windows 365 customers with the ability to control what actions are taken on Cloud PCs within their Windows 365 estate.

### Key KQL Queries

**Query 1:**
```kql
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where OtherIdentifiers == "<TenantID>"
| where Col1 startswith "Evaluation: Called usage service, tenantEvaluationResults"
| project env_time, env_cloud_name, env_cloud_environment, Col1, TenantId = OtherIdentifiers
```

**Query 2:**
```kql
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DailyTenantEvaluation_Snapshot
| where TenantId == "<TenantID>"
| project TenantId, EvaluatedAt, TrustLevel, PreviousTrustLevel, HITStatus, SentToHITAt, HITDecisionTime
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | DMS Client command not recognized error (XXXX is not recognized) when running Cu... | DMS Client version is outdated and does not support the required CLB commands | Upgrade DMS client using Update-TorusClient -Version 16.01.2079.008, then re-ope... | 🔵 7.5 | ADO Wiki |
| 2 | 403 Permission Insufficient error when running Customer Lockbox (CLB) OCE operat... | The OCE does not have the CLB elevated claim for the target tenant, or the eleva... | Request CLB elevated claim via DMS client: Set-MyWorkload Windows365, then Reque... | 🔵 7.5 | ADO Wiki |
