# AVD 域加入 (Part 2) — Troubleshooting Workflow

**Scenario Count**: 9
**Generated**: 2026-04-18

---

## Scenario 1: AVD session host not accepting new user connections while ot...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Remove the affected session host from the domain and re-join it. Verify domain trust with Test-ComputerSecureChannel -Verbose. For Hybrid AD-joined VMs, also verify AAD sync status after domain re-join

**Root Cause**: Domain trust relationship was corrupted on the affected session host VM, preventing Kerberos authentication for new RDP sessions

## Scenario 2: AVD session host DomainTrustCheck health check fails frequen...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1
- Check Event Logs for Tcpip warning 4231 (ephemeral ports exhausted), Group Policy event 1054, and Netlogon event 5719
- 2
- Open Task Manager > Details > add Handles column to identify processes with abnormally high handle count
- 3
- Kill the culprit process to restore domain trust without rebooting
- 4
- If third-party software, contact the vendor for a fix/update
- If Microsoft process, transfer to the relevant team.

**Root Cause**: TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral TCP ports and not releasing them, preventing the machine from communicating with the domain controller.

## Scenario 3: Frequent DomainTrustCheck health check failures for AVD sess...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Check Application event logs for Tcpip warning 4231 (all TCP ports in use)
- 2) Check for Group Policy processing failures (event 1054) and Netlogon events 5719 (RPC server unavailable)
- 3) Open Task Manager Details tab, add Handles column, identify processes with thousands of handles
- 4) Kill the culprit process to restore connectivity
- 5) If Microsoft process - collab/transfer to relevant team; if third-party - customer contacts vendor.

**Root Cause**: TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral TCP ports without releasing them. This prevents the VM from communicating with the domain controller, causing domain trust checks to fail.

## Scenario 4: Host pool deployment fails with joindomain error
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs

**Root Cause**: Incorrect credentials, domain not resolvable, or VNet DNS set to Default

## Scenario 5: Computer account reuse blocked during domain join - KB502027...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Use original creator account, Domain Admin, or apply computer account re-use GPO

**Root Cause**: Oct 2022+ Windows updates enforce join hardening; insufficient permissions

## Scenario 6: AVD connection failure with error ConnectionFailedAdTrustedR...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Diagnose using Kusto DiagActivity+DiagError join to find ConnectionFailedAdTrustedRelationshipFailure errors
- 2
- Follow TSG: check if domain user can be added to RDU group manually (via Computer Management)
- 3
- Test with PsExec -s (SYSTEM context): net localgroup "Remote Desktop Users" <user> /add
- 4
- If trust relationship is broken (error 1789), the resolution is to remove the session host from the domain and rejoin it
- 5
- Check AD connectivity: nltest /dsgetdc: /force and nltest /sc_verify:<domain>.

**Root Cause**: Session host machine lost trust relationship with Active Directory domain controller. The machine account password or secure channel between the session host and DC became invalid. High network latency to DC may have contributed to the issue.

## Scenario 7: Azure File Share failed to join on-premise AD using AzFilesH...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Run Join-AzStorageAccount using an account that belongs to the same sub-domain where the storage account computer object should be created. In this case, use a sccn.swirecocacola.com domain account instead of the root domain swirecocacola.com account.

**Root Cause**: AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain of the running account. When the storage account computer object is created in a sub-domain (e.g., sccn.swirecocacola.com) but Join-AzStorageAccount is executed with a root domain account (swirecocacola.com), the Get-AzStorageAccountADObject command searches the wrong domain and cannot find the object.

## Scenario 8: AVD session host domain join fails via domainjoin extension ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Delete conflicting/stale computer objects in AD
- 2) Or change VM naming prefix
- 3) Grant appropriate permissions on target OU.

**Root Cause**: Duplicate computer objects in on-prem AD with same name. Domain join extension fails with 0x5 because computer account already exists and join account lacks permission to modify it.

## Scenario 9: AVD session host domain join fails via domainjoin extension ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Delete conflicting/stale computer objects in AD
- 2) Or change VM naming prefix
- 3) Grant appropriate permissions on target OU.

**Root Cause**: Duplicate computer objects in on-prem AD with same name. Domain join extension fails with 0x5 because computer account already exists and join account lacks permission to modify it.
