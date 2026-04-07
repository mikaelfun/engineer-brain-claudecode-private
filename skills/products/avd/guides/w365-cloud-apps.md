# AVD W365 Cloud Apps - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: conditional-access, connectivity, w365-app
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Conditional Access policy not working for Windows 365 App when both W365 and AVD... | W365 App version below 1.0.147.0 does not support CA policy when both W365 and A... | Upgrade to W365 version 1.0.147.0 or newer. With this version, when both W365 an... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Issue: Unable to connect to the AVD session. Web client error: Sign in failed. P... | As user is attempting a authentication method that requires Multi-factor authent... | Hence user can use strong authentication method such as Windows Hello on local s... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: W365 App version below 1.0.147.0 does not support `[Source: ADO Wiki]`
2. Check: As user is attempting a authentication method that `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-cloud-apps.md#troubleshooting-flow)
