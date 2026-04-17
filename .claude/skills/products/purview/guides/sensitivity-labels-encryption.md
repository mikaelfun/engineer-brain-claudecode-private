# Purview 敏感度标签加密与权限 -- Quick Reference

**Entries**: 7 | **21V**: all-applicable | **Confidence**: high
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Cross-cloud B2B user gets access denied when opening MIP-labeled content from api.aadrm.cn | MIP label permissions do not include B2B email domain, specific B2B user, or Aut... | Edit sensitivity label encryption settings to include B2B partner email domain, or add specific B2B ... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 2 📋 | IRM errors in Word/Excel/PowerPoint when applying sensitivity label with encryption in Mooncake | IRM client downloads from global cloud address which fails in Mooncake. Missing ... | Add registry: HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\EnterpriseCertification (default)=https:... | 🔵 7.5 | MCVKB/Information rights management errors..md |
| 3 📋 | Register-SPODataEncryptionPolicy (CMK for SPO/ODB) fails with error 'Please ensure that every user i... | CMK for SharePoint and OneDrive requires ALL users in the tenant to have E5 lice... | Ensure all users have E5 license. For internal testing only: PG can bypass via SPO Escorts by runnin... | 🔵 7.5 | MCVKB/SharePoint and OneDrive.md |
| 4 📋 | Protected email replies become attachments instead of inline in message thread when using Sensitivit... | Too few rights granted in label protection settings. Edit and Save rights are no... | Add Edit and Save rights to the label encryption settings. This does not allow the user to remove pr... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Troubleshooting%20Scenarios%3A%20Sensitivity%20Labels/Scenario%3A%20Sensitivity%20Label%20encryption%20is%20not%20giving%20access%20as%20expected) |
| 5 📋 | Cannot access document with Dynamic Watermark enabled; access denied on unsupported Office client ve... | Client Office version does not support Dynamic Watermarks. Unsupported versions ... | Upgrade to a supported Office client version. Check supported versions at Microsoft docs (sensitivit... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Troubleshooting%20Scenarios%3A%20Sensitivity%20Labels/Scenario%3A%20Sensitivity%20Label%20encryption%20is%20not%20giving%20access%20as%20expected) |
| 6 📋 | Users in a group that was deleted and recreated with the same email/UPN cannot open encrypted or pro... | AIP service maintains a 30-day cache mapping email address to AAD ObjectID. When... | Option 1: Wait 30 days for the ObjectID cache to expire naturally. Option 2 (urgent): Create an ICM ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Recreated%20Group%20in%20Entra%20with%20Same%20Email%20Unable%20to%20Access%20Encrypted%20Items) |
| 7 📋 | eDiscovery cannot preview, review, or export files encrypted with Microsoft encryption technologies ... | The eDiscovery manager account does not have the RMS Decrypt role assigned, whic... | Assign the RMS Decrypt role. In Purview portal this role is assigned by default to eDiscovery Manage... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/edisc-decryption) |

## Quick Troubleshooting Path

1. Edit sensitivity label encryption settings to include B2B partner email domain, or add specific B2B users, or add AuthenticatedUsers group. Verify via... `[source: onenote]`
2. Add registry: HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\EnterpriseCertification (default)=https://{tenantId}.rms.aadrm.cn/_wmcs/Certification; Ent... `[source: onenote]`
3. Ensure all users have E5 license. For internal testing only: PG can bypass via SPO Escorts by running Set-TenantBringYourOwnKeyReady -Tenant $t -Enabl... `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/sensitivity-labels-encryption.md#troubleshooting-workflow)