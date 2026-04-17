# AVD AVD 域加入 (Part 2) - Quick Reference

**Entries**: 7 | **21V**: all applicable
**Keywords**: 0x5, ad, ad-join, addusertordugroup, azfileshybrid, azure-files, computer-object, connection-failure
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host not accepting new user connections while other hosts in the poo... | Domain trust relationship was corrupted on the affected session host VM, prevent... | Remove the affected session host from the domain and re-join it. Verify domain t... | 🟢 8.0 | OneNote |
| 2 📋 | Host pool deployment fails with joindomain error | Incorrect credentials, domain not resolvable, or VNet DNS set to Default | Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs | 🔵 7.0 | MS Learn |
| 3 📋 | Computer account reuse blocked during domain join - KB5020276 hardening | Oct 2022+ Windows updates enforce join hardening; insufficient permissions | Use original creator account, Domain Admin, or apply computer account re-use GPO | 🔵 6.5 | MS Learn |
| 4 📋 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure -... | Session host machine lost trust relationship with Active Directory domain contro... | 1. Diagnose using Kusto DiagActivity+DiagError join to find ConnectionFailedAdTr... | 🔵 6.5 | OneNote |
| 5 📋 | Azure File Share failed to join on-premise AD using AzFilesHybrid module (v0.2.4... | AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain of the ru... | Run Join-AzStorageAccount using an account that belongs to the same sub-domain w... | 🔵 6.5 | OneNote |
| 6 📋 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Stale/conflicting computer objects with the same name already exist in Active Di... | 1) Delete conflicting stale computer objects from AD. 2) Or change the AVD VM na... | 🔵 6.0 | OneNote |
| 7 📋 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Stale/conflicting computer objects with the same name already exist in Active Di... | 1) Delete conflicting stale computer objects from AD. 2) Or change the AVD VM na... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: Domain trust relationship was corrupted on the aff `[Source: OneNote]`
2. Check: Incorrect credentials, domain not resolvable, or V `[Source: MS Learn]`
3. Check: Oct 2022+ Windows updates enforce join hardening; `[Source: MS Learn]`
4. Check: Session host machine lost trust relationship with `[Source: OneNote]`
5. Check: AzFilesHybrid module Get-ADDomainInternal extracts `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-domain-join-2.md#troubleshooting-flow)
