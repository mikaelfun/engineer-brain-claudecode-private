# AVD AVD 域加入 (Part 2) - Quick Reference

**Entries**: 9 | **21V**: all applicable
**Keywords**: 0x5, ad-join, addusertordugroup, azfileshybrid, azure-files, connection-failure, deployment, dns, domain-controller, domain-join, domain-trust, duplicate-computer, ephemeral-ports, error-1789, hardening
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host not accepting new user connections while other hosts in the poo... | Domain trust relationship was corrupted on the affected session host VM, prevent... | Remove the affected session host from the domain and re-join it. Verify domain t... | 🟢 9.5 | OneNote |
| 2 📋 | AVD session host DomainTrustCheck health check fails frequently. Restarting the ... | TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral... | 1. Check Event Logs for Tcpip warning 4231 (ephemeral ports exhausted), Group Po... | 🟢 9.0 | ADO Wiki |
| 3 📋 | Frequent DomainTrustCheck health check failures for AVD session hosts. Restartin... | TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral... | 1) Check Application event logs for Tcpip warning 4231 (all TCP ports in use). 2... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Host pool deployment fails with joindomain error | Incorrect credentials, domain not resolvable, or VNet DNS set to Default | Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs | 🔵 7.0 | MS Learn |
| 5 📋 | Computer account reuse blocked during domain join - KB5020276 hardening | Oct 2022+ Windows updates enforce join hardening; insufficient permissions | Use original creator account, Domain Admin, or apply computer account re-use GPO | 🔵 7.0 | MS Learn |
| 6 📋 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure -... | Session host machine lost trust relationship with Active Directory domain contro... | 1. Diagnose using Kusto DiagActivity+DiagError join to find ConnectionFailedAdTr... | 🔵 7.0 | OneNote |
| 7 📋 | Azure File Share failed to join on-premise AD using AzFilesHybrid module (v0.2.4... | AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain of the ru... | Run Join-AzStorageAccount using an account that belongs to the same sub-domain w... | 🔵 7.0 | OneNote |
| 8 📋 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Duplicate computer objects in on-prem AD with same name. Domain join extension f... | 1) Delete conflicting/stale computer objects in AD. 2) Or change VM naming prefi... | 🔵 6.5 | OneNote |
| 9 📋 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Duplicate computer objects in on-prem AD with same name. Domain join extension f... | 1) Delete conflicting/stale computer objects in AD. 2) Or change VM naming prefi... | 🔵 6.5 | OneNote |

## Quick Triage Path

1. Check: Domain trust relationship was corrupted on the affected sess... `[Source: OneNote]`
2. Check: TCP port exhaustion caused by a process (e.g., OpenLens) occ... `[Source: ADO Wiki]`
3. Check: TCP port exhaustion caused by a process (e.g., OpenLens) occ... `[Source: ADO Wiki]`
4. Check: Incorrect credentials, domain not resolvable, or VNet DNS se... `[Source: MS Learn]`
5. Check: Oct 2022+ Windows updates enforce join hardening; insufficie... `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-domain-join-2.md#troubleshooting-flow)