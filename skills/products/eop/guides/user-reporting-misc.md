# EOP 用户报告与杂项 NDR - Quick Reference

**Entries**: 2 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | IP added to Client Allow List to bypass spam filtering (SCL:-1), but mail fro... | Client Allow List may not be respected: (1) If email hits... | Use Exchange Transport Rule to set SCL to Bypass Spam Score with condition Se... | 🔵 7 | [ContentIdea KB] |
| 2 📋 | Message moderation for distribution group/DDG: sender receives NDR 550 5.6.0 ... | Approval Agent requires retention tag with IsDefaultModer... | Run in Exchange Online PowerShell: Enable-OrganizationCustomization; New-Rete... | 🔵 7 | [ContentIdea KB] |

## Quick Troubleshooting Path

1. Use Exchange Transport Rule to set SCL to Bypass Spam Score with condition Sender IP address is in t `[ContentIdea KB]`
2. Run in Exchange Online PowerShell: Enable-OrganizationCustomization `[ContentIdea KB]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/user-reporting-misc.md)
