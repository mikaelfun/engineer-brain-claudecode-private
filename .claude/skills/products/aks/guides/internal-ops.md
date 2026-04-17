# AKS 内部运维流程 -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | CustomerNotifyWait error in Jarvis Actions when attempting AKS LockBox CustomerD... | Customer subscription has Customer Lockbox for Microsoft Azu... | Contact customer to approve the pending Lockbox request via ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Processes/Case%20Management/Customer%20Lockbox%20for%20Microsoft%20Azure%20-%20%28JIT%20RequestApproval%20%2B%20Cx%20Approval%29%20required) |
| 2 | JIT access request immediately rejected: "The default JIT policy has been applie... | AME.gbl account is not assigned to the AME\TM-AZCTS-AKS secu... | Join TM-AZCTS-AKS security group: SAW > Edge > https://oneid... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/Support/SAW%20and%20CorpVM/AME%20Account%20Access%20Overview/Common%20Issues/Why%20was%20my%20JIT%20access%20request%20rejected) |
| 3 | JIT access request rejected when requesting AKS JIT via aka.ms/aksjit on SAW mac... | Engineer is not a member of required OneIdentity groups AME\... | 1) Join CoreIdentity entitlement WA CTS-14817 at https://cor... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FInternal%20Operations%2FRequesting%20JIT) |

## Quick Troubleshooting Path

1. Check: Contact customer to approve the pending Lockbox request via Azure Portal > Customer Lockbox > Pendin `[source: ado-wiki]`
2. Check: Join TM-AZCTS-AKS security group: SAW > Edge > https://oneidentity `[source: ado-wiki]`
3. Check: 1) Join CoreIdentity entitlement WA CTS-14817 at https://coreidentity `[source: ado-wiki]`
