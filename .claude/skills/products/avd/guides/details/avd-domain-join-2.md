# AVD AVD 域加入 (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD session host not accepting new user connections while other hosts ... | Domain trust relationship was corrupted on the affected session host V... | Remove the affected session host from the domain and re-join it. Verif... |
| AVD session host DomainTrustCheck health check fails frequently. Resta... | TCP port exhaustion caused by a process (e.g., OpenLens) occupying all... | 1. Check Event Logs for Tcpip warning 4231 (ephemeral ports exhausted)... |
| Frequent DomainTrustCheck health check failures for AVD session hosts.... | TCP port exhaustion caused by a process (e.g., OpenLens) occupying all... | 1) Check Application event logs for Tcpip warning 4231 (all TCP ports ... |
| Host pool deployment fails with joindomain error | Incorrect credentials, domain not resolvable, or VNet DNS set to Defau... | Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs |
| Computer account reuse blocked during domain join - KB5020276 hardenin... | Oct 2022+ Windows updates enforce join hardening; insufficient permiss... | Use original creator account, Domain Admin, or apply computer account ... |
| AVD connection failure with error ConnectionFailedAdTrustedRelationshi... | Session host machine lost trust relationship with Active Directory dom... | 1. Diagnose using Kusto DiagActivity+DiagError join to find Connection... |
| Azure File Share failed to join on-premise AD using AzFilesHybrid modu... | AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain... | Run Join-AzStorageAccount using an account that belongs to the same su... |
| AVD session host domain join fails via domainjoin extension with VMExt... | Duplicate computer objects in on-prem AD with same name. Domain join e... | 1) Delete conflicting/stale computer objects in AD. 2) Or change VM na... |
| AVD session host domain join fails via domainjoin extension with VMExt... | Duplicate computer objects in on-prem AD with same name. Domain join e... | 1) Delete conflicting/stale computer objects in AD. 2) Or change VM na... |

### Phase 2: Detailed Investigation

#### Entry 1: AVD session host not accepting new user connections while ot...
> Source: OneNote | ID: avd-onenote-043 | Score: 9.5

**Symptom**: AVD session host not accepting new user connections while other hosts in the pool work fine. Users get no resource available or connection fails to specific host

**Root Cause**: Domain trust relationship was corrupted on the affected session host VM, preventing Kerberos authentication for new RDP sessions

**Solution**: Remove the affected session host from the domain and re-join it. Verify domain trust with Test-ComputerSecureChannel -Verbose. For Hybrid AD-joined VMs, also verify AAD sync status after domain re-join

> 21V Mooncake: Applicable

#### Entry 2: AVD session host DomainTrustCheck health check fails frequen...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r4-002 | Score: 9.0

**Symptom**: AVD session host DomainTrustCheck health check fails frequently. Restarting the VM temporarily resolves the issue but it recurs.

**Root Cause**: TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral TCP ports and not releasing them, preventing the machine from communicating with the domain controller.

**Solution**: 1. Check Event Logs for Tcpip warning 4231 (ephemeral ports exhausted), Group Policy event 1054, and Netlogon event 5719. 2. Open Task Manager > Details > add Handles column to identify processes with abnormally high handle count. 3. Kill the culprit process to restore domain trust without rebooting. 4. If third-party software, contact the vendor for a fix/update. If Microsoft process, transfer to the relevant team.

> 21V Mooncake: Applicable

#### Entry 3: Frequent DomainTrustCheck health check failures for AVD sess...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r4-005 | Score: 8.0

**Symptom**: Frequent DomainTrustCheck health check failures for AVD session hosts. Restarting the VM temporarily resolves the issue. Only specific hosts in the host pool are affected.

**Root Cause**: TCP port exhaustion caused by a process (e.g., OpenLens) occupying all ephemeral TCP ports without releasing them. This prevents the VM from communicating with the domain controller, causing domain trust checks to fail.

**Solution**: 1) Check Application event logs for Tcpip warning 4231 (all TCP ports in use). 2) Check for Group Policy processing failures (event 1054) and Netlogon events 5719 (RPC server unavailable). 3) Open Task Manager Details tab, add Handles column, identify processes with thousands of handles. 4) Kill the culprit process to restore connectivity. 5) If Microsoft process - collab/transfer to relevant team; if third-party - customer contacts vendor.

> 21V Mooncake: Applicable

#### Entry 4: Host pool deployment fails with joindomain error
> Source: MS Learn | ID: avd-mslearn-042 | Score: 7.0

**Symptom**: Host pool deployment fails with joindomain error

**Root Cause**: Incorrect credentials, domain not resolvable, or VNet DNS set to Default

**Solution**: Verify credentials; peer VNets; set DNS to Custom pointing to DC IPs

> 21V Mooncake: Applicable

#### Entry 5: Computer account reuse blocked during domain join - KB502027...
> Source: MS Learn | ID: avd-mslearn-057 | Score: 7.0

**Symptom**: Computer account reuse blocked during domain join - KB5020276 hardening

**Root Cause**: Oct 2022+ Windows updates enforce join hardening; insufficient permissions

**Solution**: Use original creator account, Domain Admin, or apply computer account re-use GPO

> 21V Mooncake: Applicable

#### Entry 6: AVD connection failure with error ConnectionFailedAdTrustedR...
> Source: OneNote | ID: avd-onenote-085 | Score: 7.0

**Symptom**: AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure - session host lost trust relationship with domain controller. Adding domain user to Remote Desktop Users group via net localgroup or PsExec under SYSTEM context fails with: The trust relationship between this workstation and the primary domain failed. High latency (~500-600ms) observed between session host and on-premise AD.

**Root Cause**: Session host machine lost trust relationship with Active Directory domain controller. The machine account password or secure channel between the session host and DC became invalid. High network latency to DC may have contributed to the issue.

**Solution**: 1. Diagnose using Kusto DiagActivity+DiagError join to find ConnectionFailedAdTrustedRelationshipFailure errors. 2. Follow TSG: check if domain user can be added to RDU group manually (via Computer Management). 3. Test with PsExec -s (SYSTEM context): net localgroup "Remote Desktop Users" <user> /add. 4. If trust relationship is broken (error 1789), the resolution is to remove the session host from the domain and rejoin it. 5. Check AD connectivity: nltest /dsgetdc: /force and nltest /sc_verify:<domain>.

> 21V Mooncake: Applicable

#### Entry 7: Azure File Share failed to join on-premise AD using AzFilesH...
> Source: OneNote | ID: avd-onenote-084 | Score: 7.0

**Symptom**: Azure File Share failed to join on-premise AD using AzFilesHybrid module (v0.2.4). Join-AzStorageAccount command fails with error: Cannot find an object with name in domain. Storage account was joined to sub-domain but script runs in root domain context.

**Root Cause**: AzFilesHybrid module Get-ADDomainInternal extracts the DNS root domain of the running account. When the storage account computer object is created in a sub-domain (e.g., sccn.swirecocacola.com) but Join-AzStorageAccount is executed with a root domain account (swirecocacola.com), the Get-AzStorageAccountADObject command searches the wrong domain and cannot find the object.

**Solution**: Run Join-AzStorageAccount using an account that belongs to the same sub-domain where the storage account computer object should be created. In this case, use a sccn.swirecocacola.com domain account instead of the root domain swirecocacola.com account.

> 21V Mooncake: Applicable

#### Entry 8: AVD session host domain join fails via domainjoin extension ...
> Source: OneNote | ID: avd-onenote-058 | Score: 6.5

**Symptom**: AVD session host domain join fails via domainjoin extension with VMExtensionProvisioningError. Netsetup log shows INSUFF_ACCESS_RIGHTS (0x5) when setting computer attributes.

**Root Cause**: Duplicate computer objects in on-prem AD with same name. Domain join extension fails with 0x5 because computer account already exists and join account lacks permission to modify it.

**Solution**: 1) Delete conflicting/stale computer objects in AD. 2) Or change VM naming prefix. 3) Grant appropriate permissions on target OU.

> 21V Mooncake: Applicable

#### Entry 9: AVD session host domain join fails via domainjoin extension ...
> Source: OneNote | ID: avd-onenote-058 | Score: 6.5

**Symptom**: AVD session host domain join fails via domainjoin extension with VMExtensionProvisioningError. Netsetup log shows INSUFF_ACCESS_RIGHTS (0x5) when setting computer attributes.

**Root Cause**: Duplicate computer objects in on-prem AD with same name. Domain join extension fails with 0x5 because computer account already exists and join account lacks permission to modify it.

**Solution**: 1) Delete conflicting/stale computer objects in AD. 2) Or change VM naming prefix. 3) Grant appropriate permissions on target OU.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
