# AVD W365 Provisioning 配置 (Part 4) - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: ad-ds, adds, dns, domain-join, error-1355, host-pool, msix, provisioning
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host domain join fails with error code 1355 during provisioning. Err... | Error 1355 (ERROR_NO_SUCH_DOMAIN) indicates the specified domain cannot be conta... | Verify DNS settings point to domain controller, check VNet DNS configuration, en... | 🔵 7.5 | OneNote |
| 2 📋 | AVD session host provisioning fails to join domain with error 1355 when deployin... | Domain join failure error 1355 (ERROR_NO_SUCH_DOMAIN) typically indicates DNS re... | Manually join the VM to the domain as workaround. Verify DNS resolution to DC, n... | 🔵 5.5 | OneNote |

## Quick Triage Path

1. Check: Error 1355 (ERROR_NO_SUCH_DOMAIN) indicates the sp `[Source: OneNote]`
2. Check: Domain join failure error 1355 (ERROR_NO_SUCH_DOMA `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-provisioning-4.md#troubleshooting-flow)
