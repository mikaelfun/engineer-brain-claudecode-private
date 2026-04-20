# AVD AVD Session Host (Part 3) - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Users get repeated/duplicate sessions on the same AVD session host aft... | Registry key fSingleSessionPerUser at HKLM\SYSTEM\CurrentControlSet\Co... | Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server... |
| AVD users get assigned to same session host but a new session is creat... | Registry key fSingleSessionPerUser under HKLM\SYSTEM\CurrentControlSet... | Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server... |
| Cannot add AVD session host using Windows Server 2019 Datacenter from ... | Windows Server 2019 Datacenter marketplace offer not available in cust... | Workaround: Create VM separately then register to host pool manually w... |
| When publishing Edge browser as RemoteApp in AVD, users can access ses... | Browser RemoteApp runs on session host with full file system access. N... | Configure Group Policy URLBlocklist to block file:// URLs. For Edge: M... |
| Error in RemoteDesktopServices event log from Microsoft.RDInfra.Agent.... |  | Follow the Geneva Monitoring Agent Check troubleshooting steps at: htt... |
| Session host health check failure: 'Unable to locate cert RDSAgentPROD... | Geneva monitoring agent certificate is missing or invalid on the AVD s... | Follow the Geneva Monitoring Agent Check troubleshooting guide to reme... |
| AVD session randomly reconnects 1-2 times per hour. Backend log: conne... | Client intermittently loses connectivity to WVD service URLs. AVD hear... | 1) Whitelist all WVD URLs on client firewall. 2) Whitelist Azure IP ra... |
| All AVD session hosts across multiple host pools become unavailable si... | Session hosts lost WebSocket connectivity to RDBroker URL due to netwo... | 1) Reboot affected session hosts. 2) Whitelist all AVD required URLs o... |
| AVD connection failure with error ConnectionFailedAdTrustedRelationshi... | NSG rules blocked network communication between session host VNET and ... | Add service tag VirtualNetwork to NSG inbound/outbound rules to allow ... |
| Azure Monitor workbook deployment for AVD fails with 'Deployment valid... | Azure Monitor configuration workbook passes object-type parameter inst... | If workbook deployment fails, go to Log Analytics workspace > Agents c... |

### Phase 2: Detailed Investigation

#### Entry 1: Users get repeated/duplicate sessions on the same AVD sessio...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r6-005 | Score: 8.0

**Symptom**: Users get repeated/duplicate sessions on the same AVD session host after disconnecting and reconnecting. Portal shows 2 sessions with the same SessionID but qwinsta shows different SessionIDs.

**Root Cause**: Registry key fSingleSessionPerUser at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server is set to 0, allowing unlimited simultaneous remote connections per user on the same session host.

**Solution**: Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\fSingleSessionPerUser to 1. Alternatively, enable GPO: Computer Configuration → Administrative Templates → Windows Components → Remote Desktop Services → Remote Desktop Session Host → Connections → 'Restrict Remote Desktop Services users to a single Remote Desktop Services session'.

> 21V Mooncake: Applicable

#### Entry 2: AVD users get assigned to same session host but a new sessio...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r6-005 | Score: 8.0

**Symptom**: AVD users get assigned to same session host but a new session is created on reconnect. Portal shows 2 sessions with same SessionID but qwinsta shows different SessionIDs for both connections

**Root Cause**: Registry key fSingleSessionPerUser under HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server has been changed to 0, allowing unlimited simultaneous remote connections and preventing session reconnection to existing sessions

**Solution**: Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server [fSingleSessionPerUser] to 1. Alternatively, enable GPO: Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Connections > 'Restrict Remote Desktop Services users to a single Remote Desktop Services session'

> 21V Mooncake: Applicable

#### Entry 3: Cannot add AVD session host using Windows Server 2019 Datace...
> Source: OneNote | ID: avd-onenote-050 | Score: 7.0

**Symptom**: Cannot add AVD session host using Windows Server 2019 Datacenter from marketplace. Error: MarketplacePurchaseEligibilityFailed - offer not available in region

**Root Cause**: Windows Server 2019 Datacenter marketplace offer not available in customer subscription region. Marketplace/region availability issue, not AVD-specific

**Solution**: Workaround: Create VM separately then register to host pool manually with PowerShell registration token. PG fixed the marketplace availability eventually

> 21V Mooncake: Not verified

#### Entry 4: When publishing Edge browser as RemoteApp in AVD, users can ...
> Source: OneNote | ID: avd-onenote-072 | Score: 7.0

**Symptom**: When publishing Edge browser as RemoteApp in AVD, users can access session host local drives and run cmd/PowerShell through the browser address bar (file:// protocol), violating security policies.

**Root Cause**: Browser RemoteApp runs on session host with full file system access. No default restriction prevents browser from navigating to local file paths via file:// protocol.

**Solution**: Configure Group Policy URLBlocklist to block file:// URLs. For Edge: Microsoft.Policies.Edge::URLBlocklist (admx.help). For Chrome: Google.Policies.Chrome::URLBlocklist. For Firefox: Mozilla.Policies.Firefox::B_WebsiteFilter_Block. Apply via GPO to session hosts.

> 21V Mooncake: Applicable

#### Entry 5: Error in RemoteDesktopServices event log from Microsoft.RDIn...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r4-003 | Score: 7.0

**Symptom**: Error in RemoteDesktopServices event log from Microsoft.RDInfra.Agent.Monitoring.GenevaCertificate: Unable to locate cert RDSAgentPROD.geneva.keyvault.RDSAGENT.WVD in store My from LocalMachine.

**Root Cause**: 

**Solution**: Follow the Geneva Monitoring Agent Check troubleshooting steps at: https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-windows-virtual-desktop/internal-documentation/devops/documentation/sessionhost/healthchecks/monitoringagentcheck

> 21V Mooncake: Applicable

#### Entry 6: Session host health check failure: 'Unable to locate cert RD...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r5-002 | Score: 7.0

**Symptom**: Session host health check failure: 'Unable to locate cert RDSAgentPROD.geneva.keyvault.RDSAGENT.WVD in store My from LocalMachine'. Event log source: Microsoft.RDInfra.Agent.Monitoring.GenevaCertificate, Log: RemoteDesktopServices.

**Root Cause**: Geneva monitoring agent certificate is missing or invalid on the AVD session host.

**Solution**: Follow the Geneva Monitoring Agent Check troubleshooting guide to remediate the certificate issue. Reference: https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-windows-virtual-desktop/internal-documentation/devops/documentation/sessionhost/healthchecks/monitoringagentcheck

> 21V Mooncake: Applicable

#### Entry 7: AVD session randomly reconnects 1-2 times per hour. Backend ...
> Source: OneNote | ID: avd-onenote-041 | Score: 6.5

**Symptom**: AVD session randomly reconnects 1-2 times per hour. Backend log: connection closed as client stopped receiving heartbeats from session host.

**Root Cause**: Client intermittently loses connectivity to WVD service URLs. AVD heartbeat: 1 pkt/sec via gateway. 8 missed=warning, 16 missed=disconnect. Azure IP ranges may be blocked by firewall.

**Solution**: 1) Whitelist all WVD URLs on client firewall. 2) Whitelist Azure IP ranges: AzureCloud, WindowsVirtualDesktop, AzureFrontDoor tags. 3) Diagnose with WVDAgentURLTool.exe, netmon, tracert to RDGateway cluster.

> 21V Mooncake: Applicable

#### Entry 8: All AVD session hosts across multiple host pools become unav...
> Source: OneNote | ID: avd-onenote-054 | Score: 6.5

**Symptom**: All AVD session hosts across multiple host pools become unavailable simultaneously. Users get no resource available error. Heartbeat fails: Unable to connect to wss://rdbroker-g-us-r1.wvd.microsoft.com.

**Root Cause**: Session hosts lost WebSocket connectivity to RDBroker URL due to network/firewall (Palo Alto) blocking. Agent upgrade also contributed to transient unavailability.

**Solution**: 1) Reboot affected session hosts. 2) Whitelist all AVD required URLs on firewall. 3) Monitor agent upgrade windows.

> 21V Mooncake: Applicable

#### Entry 9: AVD connection failure with error ConnectionFailedAdTrustedR...
> Source: OneNote | ID: avd-onenote-076 | Score: 6.5

**Symptom**: AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure after applying NSG outbound restrictions on session hosts. Error: session host cannot add user to Remote Desktop Users group because it lacks AD credentials.

**Root Cause**: NSG rules blocked network communication between session host VNET and domain controller VNET (peered VNETs). The WindowsVirtualDesktop service tag only covers AVD service IPs, not intra-VNET traffic needed for AD authentication.

**Solution**: Add service tag VirtualNetwork to NSG inbound/outbound rules to allow traffic between peered VNETs (session host to domain controller). Verify session host can reach DC on required AD ports (LDAP 389, Kerberos 88, etc.).

> 21V Mooncake: Applicable

#### Entry 10: Azure Monitor workbook deployment for AVD fails with 'Deploy...
> Source: OneNote | ID: avd-onenote-065 | Score: 5.5

**Symptom**: Azure Monitor workbook deployment for AVD fails with 'Deployment validation failed: Template parameter JToken type is not valid. Expected String, Uri. Actual Object.'

**Root Cause**: Azure Monitor configuration workbook passes object-type parameter instead of string when setting up session host data (performance counters/event logs).

**Solution**: If workbook deployment fails, go to Log Analytics workspace > Agents configuration to manually configure performance counters and Windows event logs for AVD session hosts.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
