# VM 托管标识 — 排查速查

**来源数**: 1 (AW) | **条目**: 4 | **21V**: 1/4
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer in Qatar Central region asks about GRS, region pairing, or cross-region replication for dis | Qatar Central is a 3+0 Geo (single region with 3 Availability Zones, no paired r | Advise customer: (1) Use zone-to-zone DR via ASR/Backup within Qatar Central's 3 | 🔵 6.5 | AW |
| 2 | Standard Load Balancer in Canada Central Availability Zones cannot fully redistribute traffic when a | During Canada Central AZ Managed Access period, SLB service capabilities were no | Known platform limitation during Managed Access phase only; issue was expected t | 🔵 6.5 | AW |
| 3 | Support engineer's GME/AME (*ME) account is not found, disabled, or cannot be located | *ME accounts that are inactive for more than 90 days are automatically disabled, | Recreate the *ME account following steps at https://dev.azure.com/msazure/AzureW | 🔵 6.5 | AW |
| 4 | Customer unable to create new subscriptions or access resources in Korea South or West India regions | Korea South and West India satellite regions have been restricted for new custom | New customers must request access via Azure region access request process: https | 🔵 5.5 | AW |

## 快速排查路径

1. **Customer in Qatar Central region asks about GRS, region pairing, or cross-region**
   - 根因: Qatar Central is a 3+0 Geo (single region with 3 Availability Zones, no paired region). Only LRS and ZRS storage redunda
   - 方案: Advise customer: (1) Use zone-to-zone DR via ASR/Backup within Qatar Central's 3 AZs for HA. (2) For full BCDR requiring GRS, data must leave the Qata
   - `[🔵 6.5 | AW]`

2. **Standard Load Balancer in Canada Central Availability Zones cannot fully redistr**
   - 根因: During Canada Central AZ Managed Access period, SLB service capabilities were not fully built out; in a full-AZ outage s
   - 方案: Known platform limitation during Managed Access phase only; issue was expected to be mitigated at Unrestricted Access. For production critical workloa
   - `[🔵 6.5 | AW]`

3. **Support engineer's GME/AME (*ME) account is not found, disabled, or cannot be lo**
   - 根因: *ME accounts that are inactive for more than 90 days are automatically disabled, and deleted 15 days after being disable
   - 方案: Recreate the *ME account following steps at https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/644686/Create-User-Account
   - `[🔵 6.5 | AW]`

4. **Customer unable to create new subscriptions or access resources in Korea South o**
   - 根因: Korea South and West India satellite regions have been restricted for new customers (effective Nov 2, 2021 and Dec 7, 20
   - 方案: New customers must request access via Azure region access request process: https://docs.microsoft.com/en-us/troubleshoot/azure/general/region-access-r
   - `[🔵 5.5 | AW]`

