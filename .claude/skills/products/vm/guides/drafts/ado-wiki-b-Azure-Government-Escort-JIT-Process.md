---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Sovereign Cloud/Azure Government Escort JIT_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Sovereign%20Cloud/Azure%20Government%20Escort%20JIT_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Summary

Please check here for latest information: [Fairfax Escort-JIT Process](http://sharepoint/sites/CIS/waps/WAPO/Escort-JIT.aspx).

DO NOT USE MSSOLVE FOR JIT IcMs — use the template listed in the Create IcM section.

We will need to request JIT access for some functions in ACIS that access customer data.

- **Why is this change being made?**
  - Compliance requirement to remove persistent access, and alignment with public Trust Center statements.
  - Azure Support Center is **not supported** for Azure Government.

## Impacted Operations

**RDFE**
- Get Serial Console Output Logs - Linux
- Get VM Screenshot
- Get VM Screenshot From Fabric
- Inspect IaaS Disk

**CRP**
- Get VMScaleSet VM Console Screenshot
- Get VMScaleSet VM Console Serial Logs
- Inspect IaaS Disk

**Brooklyn**
- Gateway diagnostics

## Step 1 — Create IcM

1. Login to [ICM Portal](https://portal.microsofticm.com/)
2. Use appropriate POD IcM template:
   - VM Availability POD: http://aka.ms/vmaacisjit
   - IaaS Platform POD: http://aka.ms/iaasacisjit
   - Networking POD: http://aka.ms/anpacisjit
   - PaaS POD: http://aka.ms/paasacisjit
   - ABRS POD: http://aka.ms/abrsacisjit
   - Linux POD: http://aka.ms/linuxacisjit
   - ASMS: http://aka.ms/asmsacisjit
3. Fill in SR#, Subscription ID, and Region → Submit
4. **Acknowledge the IcM after creation. Resolve it when the case closes.**

## Step 2 — Request JIT

Go to [Fairfax JIT Portal](https://jitaccess-validation.security.core.usgovcloudapi.net/)

- WorkItem Source: IcM
- WorkItem Id: \<IcM # here\>

| ACIS Operation | JIT Request Fields |
|---|---|
| CRP Inspect IaaS Disk | Scope: CRP, Access Level: **PlatformServiceOperator** |
| RDFE Inspect IaaS Disk | Scope: RDFE, Access Level: **PlatformServiceOperator** |
| AzLinux Inspect IaaS Disk | Scope: CRP, Access Level: **PlatformServiceOperator** |
| RDFE VM Screenshot | Scope: RDFE, Access Level: **PlatformServiceOperator** |
| Linux Serial Logs | Scope: CRP, Access Level: **PlatformServiceOperator** |
| Brooklyn Diagnostics | Scope: Brooklyn, Access Level: **CustomerServiceOperator** |

> ⚠️ Use **PlatformServiceOperator** (not CustomerServiceViewer shown in screenshots) for the request to be successful.

## Step 3 — Escort Assignment

Once submitted, status shows "Waiting For An Escort". After escort assigned:
- SRE bot with escort will contact via IM with instructions to launch escort session
- If VPN is required: must be on corpnet/VPN to connect to jumpbox
- If outside corpnet: connect via VPN before launching RDP to jumpbox

## Step 4 — Escort Session JIT

Once in RDP session on jumpbox, request JIT access again **through the escort**:
- Escort logs into [Fairfax JIT](https://jitaccess-validation.security.core.usgovcloudapi.net/) with USME credentials on the jumpbox
- Enter **same information** as the original JIT request

## Specific Processes

### Brooklyn Diagnostics
- Copy resulting URL from Brooklyn Diagnostics to download traces
- Delete traces from local computer after reviewing
- Can upload to DTM Internal folder (auto-purged per policy)

## Other Resources

- [Azure Government ACIS Portal Authorization Details](https://acis.engineering.core.usgovcloudapi.net/authinfo.aspx)
- [Fairfax Escort-JIT Process](http://sharepoint/sites/CIS/waps/WAPO/Escort-JIT.aspx)
