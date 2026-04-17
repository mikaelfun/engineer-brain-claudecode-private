# Purview MIP SDK 集成 -- Comprehensive Troubleshooting Guide

**Entries**: 1 | **Drafts fused**: 6 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-licensing-redirection.md](..\guides/drafts/ado-wiki-a-licensing-redirection.md), [ado-wiki-a-mip-sdk-escalating-to-engineering.md](..\guides/drafts/ado-wiki-a-mip-sdk-escalating-to-engineering.md), [ado-wiki-a-office-mip-logging.md](..\guides/drafts/ado-wiki-a-office-mip-logging.md), [ado-wiki-a-required-information-mip-sdk.md](..\guides/drafts/ado-wiki-a-required-information-mip-sdk.md), [ado-wiki-mip-client-versions.md](..\guides/drafts/ado-wiki-mip-client-versions.md), [onenote-mip-sdk-oauth2-testing.md](..\guides/drafts/onenote-mip-sdk-oauth2-testing.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-licensing-redirection.md

1. Introduction `[source: ado-wiki-a-licensing-redirection.md]`
2. AD RMS keys and URLs `[source: ado-wiki-a-licensing-redirection.md]`
3. AD RMS Keys `[source: ado-wiki-a-licensing-redirection.md]`
4. Licensing URLs `[source: ado-wiki-a-licensing-redirection.md]`
5. Imported AD RMS keys `[source: ado-wiki-a-licensing-redirection.md]`
6. Protected Content `[source: ado-wiki-a-licensing-redirection.md]`
7. Publishing License `[source: ado-wiki-a-licensing-redirection.md]`
8. Redirection - the SDK way `[source: ado-wiki-a-licensing-redirection.md]`
9. The MIP SDK connects to `https://api.aadrm.com`. `[source: ado-wiki-a-licensing-redirection.md]`
10. The [AD RMS] licensing URL is presented and a lookup is performed. `[source: ado-wiki-a-licensing-redirection.md]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Office MIP SDK encryption fails, inconsistent behavior across builds/users, or first-time encryption... | Corrupted or stale MIP SDK cache files in local app data directories | Delete contents of %localappdata%Microsoft<APPNAME>MIPSDKmip, %localappdata%MicrosoftOfficeMIPSDK, a... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11834/Learn-Office-MIP-Logging) |