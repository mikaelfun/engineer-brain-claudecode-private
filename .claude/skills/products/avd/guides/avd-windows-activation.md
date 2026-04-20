# AVD AVD Windows Activation (KMS) - Quick Reference

**Entries**: 1 | **21V**: all applicable
**Keywords**: activation, jarvis, kms, kms-proxy, network, pseudo-vip, windows-activation
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host cannot be activated (Windows activation failure). Windows Appli... | The outbound IP from the AVD session host is not recognized as an Azure IP by th... | 1. Check outbound IP from session host - must be an Azure IP for KMS activation ... | 🔵 7.0 | OneNote |

## Quick Triage Path

1. Check: The outbound IP from the AVD session host is not recognized ... `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-windows-activation.md#troubleshooting-flow)