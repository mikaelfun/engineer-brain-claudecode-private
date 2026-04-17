# Monitor 监控 DNS 配置 - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 3 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-How-to-Use-nslookup-to-validate-DNS-resolution.md, ado-wiki-b-Understanding-DNS-TCP-TLS-connectivity-Application-Insights.md, ado-wiki-b-Validate-DNS-connectivity-Application-Insights-endpoints.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Intermittent availability test DNS resolution failures (NameResolutionFailure) despite site being accessible; failures persist longer than expected due to negative DNS caching

**Solution**: Check failure ratio vs total tests (e.g., 10/10080 = 0.1%). Review DNS TTL and SOA record settings. Adjust alert location failure threshold (2 to 5). For persistent issues, engage Azure DNS team with exact timestamps and domain name.

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: DNS solution deployed to Log Analytics workspace successfully but DNS tables are not populated

**Solution**: 1) Verify ARM template includes table definition; 2) Check Windows DNS Events via AMA Data Connector is installed and connected; 3) If table not auto-created, manually define it in ARM template

`[Source: MS Learn, Score: 4.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intermittent availability test DNS resolution failures (NameResolutionFailure... | Transient DNS failures from UDP-based resolution across public internet. Fail... | Check failure ratio vs total tests (e.g., 10/10080 = 0.1%). Review DNS TTL an... | 8.5 | ADO Wiki |
| 2 | DNS solution deployed to Log Analytics workspace successfully but DNS tables ... | Table creation is not defined in the ARM template, or Windows DNS Events via ... | 1) Verify ARM template includes table definition; 2) Check Windows DNS Events... | 4.5 | MS Learn |
