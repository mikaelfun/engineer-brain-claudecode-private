# AVD W365 Cloud Apps - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Drafts fused**: 5 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-cloud-app-from-file-path-setup.md, ado-wiki-cloud-apps-escalation-paths.md, ado-wiki-cloud-apps-kusto-troubleshooting.md, ado-wiki-cloud-apps-support-boundaries.md, ado-wiki-w365-cloudapps-technical-specs.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Conditional Access policy not working for Windows 365 App wh... | W365 App version below 1.0.147.0 does not support CA policy ... | Upgrade to W365 version 1.0.147.0 or newer. With this versio... |
| Issue: Unable to connect to the AVD session. Web client erro... | As user is attempting a authentication method that requires ... | Hence user can use strong authentication method such as Wind... |

### Phase 2: Detailed Investigation

#### Cloud App from File Path — Setup Guide
> Source: [ado-wiki-cloud-app-from-file-path-setup.md](guides/drafts/ado-wiki-cloud-app-from-file-path-setup.md)

## Step-by-step (Admin perspective)

#### Windows 365 Cloud Apps - Support Boundaries and Dev Teams
> Source: [ado-wiki-cloud-apps-escalation-paths.md](guides/drafts/ado-wiki-cloud-apps-escalation-paths.md)

Windows 365 Cloud Apps = Windows 365 Frontline Shared + AVD RAIL.

#### Cloud Apps Kusto and CPCD Troubleshooting
> Source: [ado-wiki-cloud-apps-kusto-troubleshooting.md](guides/drafts/ado-wiki-cloud-apps-kusto-troubleshooting.md)

Use the [CPCD Dashboard](https://aka.ms/cpcd) which contains a dedicated page for Cloud Apps troubleshooting.

#### Support Boundaries - Windows 365 Cloud Apps
> Source: [ado-wiki-cloud-apps-support-boundaries.md](guides/drafts/ado-wiki-cloud-apps-support-boundaries.md)

## 1. Environment & Configuration

#### Windows 365 CloudApps Technical Specs
> Source: [ado-wiki-w365-cloudapps-technical-specs.md](guides/drafts/ado-wiki-w365-cloudapps-technical-specs.md)

**SAAF Only - Engineering Document:**

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Conditional Access policy not working for Windows 365 App when both W365 and AVD... | W365 App version below 1.0.147.0 does not support CA policy when both W365 and A... | Upgrade to W365 version 1.0.147.0 or newer. With this version, when both W365 an... | 🟢 8.0 | ADO Wiki |
| 2 | Issue: Unable to connect to the AVD session. Web client error: Sign in failed. P... | As user is attempting a authentication method that requires Multi-factor authent... | Hence user can use strong authentication method such as Windows Hello on local s... | 🔵 6.5 | KB |
