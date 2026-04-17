# DEFENDER JIT 网络访问 — Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-jit-product-knowledge.md, ado-wiki-a-jit-troubleshooting-guide.md, onenote-vm-jit-access-tsg.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Jit
> Sources: ado-wiki, onenote

**1. JIT access request-access button not showing in VM connect blade even though JIT is configured and listed in MDC JIT configured list**

- **Root Cause**: When JIT is enabled via PowerShell/API with custom policy names (not default), the VM portal connect blade only recognizes the policy named default. Multiple JIT policies per resource group cause the UI to not display the request access button. Bug tracked in workitem 13691132.
- **Solution**: Delete all extra JIT policies in the resource group, keeping only the default policy. Alternatively, enable JIT through portal UI which always creates the default policy. PG bug fix: workitem 13691132.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. JIT VM Access enable or request-access operation fails silently - API returns 202 Accepted but access is never granted, no error visible in portal**

- **Root Cause**: JIT access requests (initiate) are async, return 202 on queue submission. Backend failure not reflected in resultType. Also depends on Network RP which can cause indirect failures.
- **Solution**: Query JitNetworkAccessBLEntryPointOE in Rome3Prod Kusto. For async initiate: join RunStateOE (StateName=JitRequestInitiateStateContext) with TraceEvent (JitBackgroundRole) on RootOperationId. Use PowerShell as workaround.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

**3. Error 'Just-In-Time Network Access Policy: default contains non-existent virtual machines: <badVMresourceID>' when managing JIT policies**

- **Root Cause**: Stale/non-existent VM resource IDs remain referenced in the JIT default policy after VMs are deleted or moved
- **Solution**: 1) GET the existing default JIT policy using REST API (Jit Network Access Policies - Get). 2) Remove the section with the affected VM resourceID from the response body. 3) PUT the modified body back using REST API (Jit Network Access Policies - Create Or Update). 4) Verify with another GET request that the bad VM entry was removed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Error 'NoRegisteredProviderFound' for location and API version for type 'locations/jitNetworkAccessPolicies' when enabling JIT on a VM in a new Azure region**

- **Root Cause**: New Azure regions are not automatically registered in the JIT ARM manifest. The region must be explicitly added to the Rome-Arm-Manifest repo (both Prod and Canary MANIFEST.json files) across all 3 JIT resource types and their API version blocks (8 blocks total per file).
- **Solution**: 1) Determine correct JIT backend endpoint by geography (CUS for Americas/APAC/MEA, WEU for Europe, WCUS for WestCentralUS/WestUS2). 2) Add the region to all 8 endpoint blocks in both Prod and Canary MANIFEST.json in the Rome-Arm-Manifest repo. 3) Run validation test (dotnet test CommonApiVersionAcrossLocations). 4) Submit PR and notify erelhteam@microsoft.com. 5) After merge, trigger ManifestCheckIn and Rollout pipelines. Quick mitigation: customer can create NSG rules manually for RDP access.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. JIT entry cannot be removed from the JIT blade; no error shown in JIT UI but customer gets a lock error when trying to remove the NSG entry**

- **Root Cause**: A delete lock exists on the resource (NSG or resource group), preventing the JIT entry from being removed. The JIT blade does not surface this lock error.
- **Solution**: Check if there are any delete locks on the resource or resource group. Remove the lock, then the customer can delete the JIT entry successfully.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | JIT access request-access button not showing in VM connect blade even though JIT is configured an... | When JIT is enabled via PowerShell/API with custom policy names (not default), the VM portal conn... | Delete all extra JIT policies in the resource group, keeping only the default policy. Alternative... | 🟢 9.0 | OneNote |
| 2 | JIT VM Access enable or request-access operation fails silently - API returns 202 Accepted but ac... | JIT access requests (initiate) are async, return 202 on queue submission. Backend failure not ref... | Query JitNetworkAccessBLEntryPointOE in Rome3Prod Kusto. For async initiate: join RunStateOE (Sta... | 🔵 7.0 | OneNote |
| 3 | Error 'Just-In-Time Network Access Policy: default contains non-existent virtual machines: <badVM... | Stale/non-existent VM resource IDs remain referenced in the JIT default policy after VMs are dele... | 1) GET the existing default JIT policy using REST API (Jit Network Access Policies - Get). 2) Rem... | 🔵 5.5 | ADO Wiki |
| 4 | Error 'NoRegisteredProviderFound' for location and API version for type 'locations/jitNetworkAcce... | New Azure regions are not automatically registered in the JIT ARM manifest. The region must be ex... | 1) Determine correct JIT backend endpoint by geography (CUS for Americas/APAC/MEA, WEU for Europe... | 🔵 5.5 | ADO Wiki |
| 5 | JIT entry cannot be removed from the JIT blade; no error shown in JIT UI but customer gets a lock... | A delete lock exists on the resource (NSG or resource group), preventing the JIT entry from being... | Check if there are any delete locks on the resource or resource group. Remove the lock, then the ... | 🔵 5.5 | ADO Wiki |
