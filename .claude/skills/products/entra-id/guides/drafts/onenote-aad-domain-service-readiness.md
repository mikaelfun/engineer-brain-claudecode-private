---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Readiness path/Readiness by topics/AAD Domain Service.md"
sourceUrl: null
importDate: "2026-04-23"
type: guide-draft
---

# AAD Domain Service (Entra Domain Services) Readiness Guide

## Overview
Azure AD Domain Services (AADDS) provides managed domain services — domain join, group policy, LDAP, Kerberos/NTLM authentication — without deploying/managing domain controllers.

## Key Concepts
- AADDS vs on-prem AD vs AAD Join: different identity models for different scenarios
- AADDS managed domain is one-way sync from Azure AD; cannot install AAD Connect to sync back
- Domain, tree, forest hierarchy; operation masters (per-domain and per-forest)
- Trust relationships: forest trust is NOT transitively extended to a third forest
- Kerberos authentication and fallback behavior when it fails

## LDAPS
- ldp.exe usage for querying AADDS users
- Certificate requirements for LDAPS: subject name / wildcard considerations
- Troubleshooting LDAPS connection failures

## Common Troubleshooting Areas
1. User unable to log onto VM joined to managed domain
2. User not synced to AADDS (cloud user vs synced user behavior differs)
3. Retrieving event logs from AADDS DCs
4. ASC tool information for AADDS issues
5. Account lockout — analyzing lockout logs in Jarvis
6. Password complexity management in AADDS managed domain
7. Backup & restore of AADDS
8. Domain name cannot be changed after creation
9. Cloud user can join VM to AADDS directly after enabling
10. Synced user needs password hash sync before joining VM to AADDS

## Lab Environment
- AADDS in subscription POD VM, resource group: azureaadds
- Lab covers: VNet peering, domain join, ADDS tools, custom OU, group policy, LDAPS, ldp.exe, account lockout log analysis

## References
- [AADDS Overview](https://learn.microsoft.com/en-us/entra/identity/domain-services/overview)
- [Create Instance Tutorial](https://learn.microsoft.com/en-us/entra/identity/domain-services/tutorial-create-instance)
- [Administration Concepts](https://learn.microsoft.com/en-us/entra/identity/domain-services/administration-concepts)
- [FAQs](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-faqs)
- Support Wiki: Azure AD Domain Services - Overview (Supportability/AzureAD wiki)
