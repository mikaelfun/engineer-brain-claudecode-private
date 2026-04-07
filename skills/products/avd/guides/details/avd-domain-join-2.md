# AVD AVD 域加入 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-domain-join-failure.md, ado-wiki-create-w365-enterprise-haadj-lab.md, ado-wiki-secure-channel-domain-trust-failed.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD session host not accepting new user connections while ot... | Domain trust relationship was corrupted on the affected sess... | Remove the affected session host from the domain and re-join... |
| Host pool deployment fails with joindomain error | Incorrect credentials, domain not resolvable, or VNet DNS se... | Verify credentials; peer VNets; set DNS to Custom pointing t... |
| Computer account reuse blocked during domain join - KB502027... | Oct 2022+ Windows updates enforce join hardening; insufficie... | Use original creator account, Domain Admin, or apply compute... |
| AVD connection failure with error ConnectionFailedAdTrustedR... | Session host machine lost trust relationship with Active Dir... | 1. Diagnose using Kusto DiagActivity+DiagError join to find ... |
| Azure File Share failed to join on-premise AD using AzFilesH... | AzFilesHybrid module Get-ADDomainInternal extracts the DNS r... | Run Join-AzStorageAccount using an account that belongs to t... |
| AVD session host domain join fails via domainjoin extension ... | Stale/conflicting computer objects with the same name alread... | 1) Delete conflicting stale computer objects from AD. 2) Or ... |
| AVD session host domain join fails via domainjoin extension ... | Stale/conflicting computer objects with the same name alread... | 1) Delete conflicting stale computer objects from AD. 2) Or ... |

### Phase 2: Detailed Investigation

#### Most common reasons for domain join failures
> Source: [ado-wiki-b-domain-join-failure.md](guides/drafts/ado-wiki-b-domain-join-failure.md)

- Account does not have permissions to join domain

#### Create Windows 365 Enterprise HAADJ Lab Environment
> Source: [ado-wiki-create-w365-enterprise-haadj-lab.md](guides/drafts/ado-wiki-create-w365-enterprise-haadj-lab.md)

Step-by-step guide for setting up a Hybrid Azure AD Joined (HAADJ) Windows 365 Enterprise lab.

#### Secure Channel Issues - Windows 365
> Source: [ado-wiki-secure-channel-domain-trust-failed.md](guides/drafts/ado-wiki-secure-channel-domain-trust-failed.md)

Windows secure channels enable encrypted communication between Cloud PCs and domain controllers. These channels are established by the NetLogon service when a device joins a domain, creating a machine

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD session host not accepting new user connections while other hosts in the poo... | Domain trust relationship was corrupted on the affected session host VM, prevent... | Remove the affected session host from the domain and re-join it. Verify domain t... | 🟢 8.0 | OneNote |
| 2 | Host pool deployment fails with joindomain error | Incorrect credentials, domain not resolvable, or VNet DNS set to Default | Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs | 🔵 7.0 | MS Learn |
| 3 | Computer account reuse blocked during domain join - KB5020276 hardening | Oct 2022+ Windows updates enforce join hardening; insufficient permissions | Use original creator account, Domain Admin, or apply computer account re-use GPO | 🔵 6.5 | MS Learn |
| 4 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure -... | Session host machine lost trust relationship with Active Directory domain contro... | 1. Diagnose using Kusto DiagActivity+DiagError join to find ConnectionFailedAdTr... | 🔵 6.5 | OneNote |
| 5 | Azure File Share failed to join on-premise AD using AzFilesHybrid module (v0.2.4... | AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain of the ru... | Run Join-AzStorageAccount using an account that belongs to the same sub-domain w... | 🔵 6.5 | OneNote |
| 6 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Stale/conflicting computer objects with the same name already exist in Active Di... | 1) Delete conflicting stale computer objects from AD. 2) Or change the AVD VM na... | 🔵 6.0 | OneNote |
| 7 | AVD session host domain join fails via domainjoin extension with VMExtensionProv... | Stale/conflicting computer objects with the same name already exist in Active Di... | 1) Delete conflicting stale computer objects from AD. 2) Or change the AVD VM na... | 🔵 6.0 | OneNote |
