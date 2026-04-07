# AKS 通用排查 — dfm -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | When trying to send or reply to email from DFM (Dynamics 365), receive Access Is... | DFM email permission issue when replying directly with exist... | Before clicking Send, copy all email addresses from the To a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/Support/DfM%20and%20Case%20Buddy/Workaround%20for%20DFM%20outgoing%20email%20Access%20is%20Denied%20error) |
| 2 | DfM fails to retrieve entitlements for TPID; case severity defaults to C and can... | DfM entitlement retrieval failure for the case, potentially ... | Copy subscription ID from case details > click dropdown arro... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Processes/Case%20Management/Fix%20Incorrect%20Case%20Entitlement) |
| 3 | After Microsoft alias change, engineer loses access to previously handled suppor... | ASC and related systems do not automatically update access p... | 1) ASC cases: assign case to a peer then re-assign back to n... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FProcesses%2FInternal%20Operations%2FPost%20Alias%20Change%20Actions) |

## Quick Troubleshooting Path

1. Check: Before clicking Send, copy all email addresses from the To and CC sections, delete them, then re-add `[source: ado-wiki]`
2. Check: Copy subscription ID from case details > click dropdown arrow next to Edit SAP > select Edit Entitle `[source: ado-wiki]`
3. Check: 1) ASC cases: assign case to a peer then re-assign back to new alias `[source: ado-wiki]`
