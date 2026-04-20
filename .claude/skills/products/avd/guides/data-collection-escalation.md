# AVD 数据收集与升级流程 - Quick Reference

**Entries**: 8 | **21V**: mixed
**Keywords**: aad-join, aad-joined, access-denied, activation, agent-crash, application-crash, asc, avd, compliance, configmgr, contentidea-kb, dump, event-id-1000, iaas-disk, intune
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cloud PC VM fails to boot or stuck on restarting | Azure Host level changes - VMs running in certain Cluster or Host version may hi... | Engage RDOS DRI (OCE) via IcM to capture memory dump. Get NodeId/ContainerId/VMI... | 🟢 8.0 | ADO Wiki |
| 2 📋 | AccessDenied error when performing Inspect IaaS Disk log collection in ASC for W... | VM not pinned to the DfM case in Azure Support Center | Pin the VM to the case using Resource Explorer (Step 6 in ASC workflow) and refr... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Windows 10/11 Enterprise multi-session OS on AVD VM gets downgraded to Enterpris... | The VM gets activated/reactivated by a customer custom KMS server using an activ... | 1) Confirm the customer is using their own KMS server. 2) The only supported fix... | 🟢 8.0 | ADO Wiki |
| 4 📋 | AVD agent process crashing with Event ID 1000 in Application logs. Processes aff... | Agent crashes can be misleading - often caused by underlying INVALID_REGISTRATIO... | 1) Collect MSRD-Collect and check Event ID 1000s. 2) First verify NOT hitting IN... | 🟢 8.0 | ADO Wiki |
| 5 📋 | Application crash or hang inside Cloud PC or AVD session host | Various application-level issues in guest OS | Ask user to collect User-Mode Dump via Windows Error Reporting (WER) or Task Man... | 🟢 8.0 | ADO Wiki |
| 6 📋 | Error SubscriptionNotRegisteredForFeature when creating Public IP Address withou... | Subscription not registered for Microsoft.Network/AllowBringYourOwnPublicIpAddre... | 1. Register subscription for AllowBringYourOwnPublicIpAddress feature via SAW/AM... | 🔵 6.5 | ADO Wiki |
| 7 📋 | Azure AD joined Windows 11 AVD VMs: users get 'The sign-in method you're trying ... | AVD VMs deployed via Intune never got into managed state. Intune compliance show... | Ensure machines are successfully provisioned and managed in Intune. Once machine... | 🔵 6.5 | ContentIdea |
| 8 📋 | Users trying to login to Azure AD VMs get error: "The sign-in method you're tryi... | AVD VMs deployed using Intune had broken settings. Provisioned machines never go... | Engage internal Intune team. Ensure machines are successfully provisioned in Int... | 🔵 6.5 | ContentIdea |

## Quick Triage Path

1. Check: Azure Host level changes - VMs running in certain Cluster or... `[Source: ADO Wiki]`
2. Check: VM not pinned to the DfM case in Azure Support Center `[Source: ADO Wiki]`
3. Check: The VM gets activated/reactivated by a customer custom KMS s... `[Source: ADO Wiki]`
4. Check: Agent crashes can be misleading - often caused by underlying... `[Source: ADO Wiki]`
5. Check: Various application-level issues in guest OS `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/data-collection-escalation.md#troubleshooting-flow)