# EOP 用户报告与杂项 NDR - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-User-Reporting-Submissions.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Client Allow List may not
> Source: contentidea-kb

**Symptom**: IP added to Client Allow List to bypass spam filtering (SCL:-1), but mail from that IP still subjected to spam filtering despite correct connecting IP.
**Root Cause**: Client Allow List may not be respected: (1) If email hits EOP Front Door where connecting IP is in an On-Premises IP-based receive connector of ANY tenant in same forest, IPV:CAL visible but SCL:-1...

1. Use Exchange Transport Rule to set SCL to Bypass Spam Score with condition Sender IP address is in the range.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7/10 - [ContentIdea KB]]`

### Phase 2: Approval Agent requires retention tag
> Source: contentidea-kb

**Symptom**: Message moderation for distribution group/DDG: sender receives NDR 550 5.6.0 APPROVAL.InvalidExpiry; Cannot read expiry policy [Agent: Approval Processing Agent].
**Root Cause**: Approval Agent requires retention tag with IsDefaultModeratedRecipientsPolicyTag set and assigned to retention policy.

1. Run in Exchange Online PowerShell: Enable-OrganizationCustomization
2. New-RetentionPolicyTag -IsDefaultModeratedRecipientsPolicyTag -Name TagforModeration -AgeLimitForRetention 90.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7/10 - [ContentIdea KB]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| IP added to Client Allow List to bypass spam filtering (S... | Client Allow List may not | -> Phase 1 |
| Message moderation for distribution group/DDG: sender rec... | Approval Agent requires retention tag | -> Phase 2 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | IP added to Client Allow List to bypass spam filtering (SCL:-1), but mail fro... | Client Allow List may not be respected: (1) If email hits... | Use Exchange Transport Rule to set SCL to Bypass Spam Score with condition Se... | 🔵 7 | [ContentIdea KB] |
| 2 | Message moderation for distribution group/DDG: sender receives NDR 550 5.6.0 ... | Approval Agent requires retention tag with IsDefaultModer... | Run in Exchange Online PowerShell: Enable-OrganizationCustomization; New-Rete... | 🔵 7 | [ContentIdea KB] |
