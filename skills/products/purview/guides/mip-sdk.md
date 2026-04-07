# Purview MIP SDK 集成 -- Quick Reference

**Entries**: 1 | **21V**: all-applicable | **Confidence**: low
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Office MIP SDK encryption fails, inconsistent behavior across builds/users, or first-time encryption... | Corrupted or stale MIP SDK cache files in local app data directories | Delete contents of %localappdata%Microsoft<APPNAME>MIPSDKmip, %localappdata%MicrosoftOfficeMIPSDK, a... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11834/Learn-Office-MIP-Logging) |

## Quick Troubleshooting Path

1. Delete contents of %localappdata%Microsoft<APPNAME>MIPSDKmip, %localappdata%MicrosoftOfficeMIPSDK, and %LocalAppData%MicrosoftOfficeCLP folders, then ... `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/mip-sdk.md#troubleshooting-workflow)