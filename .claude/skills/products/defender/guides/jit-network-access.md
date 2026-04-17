# DEFENDER JIT 网络访问 — Troubleshooting Quick Reference

**Entries**: 5 | **21V**: all applicable
**Sources**: ado-wiki, onenote | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/jit-network-access.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | JIT access request-access button not showing in VM connect blade even though JIT is configured an... | When JIT is enabled via PowerShell/API with custom policy names (not default), the VM portal conn... | Delete all extra JIT policies in the resource group, keeping only the default policy. Alternative... | 🟢 9.0 | OneNote |
| 2 | JIT VM Access enable or request-access operation fails silently - API returns 202 Accepted but ac... | JIT access requests (initiate) are async, return 202 on queue submission. Backend failure not ref... | Query JitNetworkAccessBLEntryPointOE in Rome3Prod Kusto. For async initiate: join RunStateOE (Sta... | 🔵 7.0 | OneNote |
| 3 | Error 'Just-In-Time Network Access Policy: default contains non-existent virtual machines: <badVM... | Stale/non-existent VM resource IDs remain referenced in the JIT default policy after VMs are dele... | 1) GET the existing default JIT policy using REST API (Jit Network Access Policies - Get). 2) Rem... | 🔵 5.5 | ADO Wiki |
| 4 | Error 'NoRegisteredProviderFound' for location and API version for type 'locations/jitNetworkAcce... | New Azure regions are not automatically registered in the JIT ARM manifest. The region must be ex... | 1) Determine correct JIT backend endpoint by geography (CUS for Americas/APAC/MEA, WEU for Europe... | 🔵 5.5 | ADO Wiki |
| 5 | JIT entry cannot be removed from the JIT blade; no error shown in JIT UI but customer gets a lock... | A delete lock exists on the resource (NSG or resource group), preventing the JIT entry from being... | Check if there are any delete locks on the resource or resource group. Remove the lock, then the ... | 🔵 5.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Delete all extra JIT policies in the resource group, keeping only the default policy. Alternatively, enable JIT through portal UI which always creates the default policy. PG bug fix: workitem 13691... `[Source: OneNote]`
2. Query JitNetworkAccessBLEntryPointOE in Rome3Prod Kusto. For async initiate: join RunStateOE (StateName=JitRequestInitiateStateContext) with TraceEvent (JitBackgroundRole) on RootOperationId. Use P... `[Source: OneNote]`
3. 1) GET the existing default JIT policy using REST API (Jit Network Access Policies - Get). 2) Remove the section with the affected VM resourceID from the response body. 3) PUT the modified body bac... `[Source: ADO Wiki]`
4. 1) Determine correct JIT backend endpoint by geography (CUS for Americas/APAC/MEA, WEU for Europe, WCUS for WestCentralUS/WestUS2). 2) Add the region to all 8 endpoint blocks in both Prod and Canar... `[Source: ADO Wiki]`
5. Check if there are any delete locks on the resource or resource group. Remove the lock, then the customer can delete the JIT entry successfully. `[Source: ADO Wiki]`
