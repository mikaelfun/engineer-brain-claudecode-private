# AVD Session Host (Part 3) — Troubleshooting Workflow

**Scenario Count**: 10
**Generated**: 2026-04-18

---

## Scenario 1: Users get repeated/duplicate sessions on the same AVD sessio...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\fSingleSessionPerUser to 1. Alternatively, enable GPO: Computer Configuration → Administrative Templates → Windows Components → Remote Desktop Services → Remote Desktop Session Host → Connections → 'Restrict Remote Desktop Services users to a single Remote Desktop Services session'.

**Root Cause**: Registry key fSingleSessionPerUser at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server is set to 0, allowing unlimited simultaneous remote connections per user on the same session host.

## Scenario 2: AVD users get assigned to same session host but a new sessio...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server [fSingleSessionPerUser] to 1. Alternatively, enable GPO: Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Connections > 'Restrict Remote Desktop Services users to a single Remote Desktop Services session'

**Root Cause**: Registry key fSingleSessionPerUser under HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server has been changed to 0, allowing unlimited simultaneous remote connections and preventing session reconnection to existing sessions

## Scenario 3: Cannot add AVD session host using Windows Server 2019 Datace...
> Source: OneNote | Applicable: ❓

### Troubleshooting Steps
- Workaround: Create VM separately then register to host pool manually with PowerShell registration token. PG fixed the marketplace availability eventually

**Root Cause**: Windows Server 2019 Datacenter marketplace offer not available in customer subscription region. Marketplace/region availability issue, not AVD-specific

## Scenario 4: When publishing Edge browser as RemoteApp in AVD, users can ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Configure Group Policy URLBlocklist to block file:// URLs. For Edge: Microsoft.Policies.Edge::URLBlocklist (admx.help). For Chrome: Google.Policies.Chrome::URLBlocklist. For Firefox: Mozilla.Policies.Firefox::B_WebsiteFilter_Block. Apply via GPO to session hosts.

**Root Cause**: Browser RemoteApp runs on session host with full file system access. No default restriction prevents browser from navigating to local file paths via file:// protocol.

## Scenario 5: Error in RemoteDesktopServices event log from Microsoft.RDIn...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Follow the Geneva Monitoring Agent Check troubleshooting steps at: https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-windows-virtual-desktop/internal-documentation/devops/documentation/sessionhost/healthchecks/monitoringagentcheck

**Root Cause**: None

## Scenario 6: Session host health check failure: 'Unable to locate cert RD...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Follow the Geneva Monitoring Agent Check troubleshooting guide to remediate the certificate issue. Reference: https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-windows-virtual-desktop/internal-documentation/devops/documentation/sessionhost/healthchecks/monitoringagentcheck

**Root Cause**: Geneva monitoring agent certificate is missing or invalid on the AVD session host.

## Scenario 7: AVD session randomly reconnects 1-2 times per hour. Backend ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Whitelist all WVD URLs on client firewall
- 2) Whitelist Azure IP ranges: AzureCloud, WindowsVirtualDesktop, AzureFrontDoor tags
- 3) Diagnose with WVDAgentURLTool.exe, netmon, tracert to RDGateway cluster.

**Root Cause**: Client intermittently loses connectivity to WVD service URLs. AVD heartbeat: 1 pkt/sec via gateway. 8 missed=warning, 16 missed=disconnect. Azure IP ranges may be blocked by firewall.

## Scenario 8: All AVD session hosts across multiple host pools become unav...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Reboot affected session hosts
- 2) Whitelist all AVD required URLs on firewall
- 3) Monitor agent upgrade windows.

**Root Cause**: Session hosts lost WebSocket connectivity to RDBroker URL due to network/firewall (Palo Alto) blocking. Agent upgrade also contributed to transient unavailability.

## Scenario 9: AVD connection failure with error ConnectionFailedAdTrustedR...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Add service tag VirtualNetwork to NSG inbound/outbound rules to allow traffic between peered VNETs (session host to domain controller). Verify session host can reach DC on required AD ports (LDAP 389, Kerberos 88, etc.).

**Root Cause**: NSG rules blocked network communication between session host VNET and domain controller VNET (peered VNETs). The WindowsVirtualDesktop service tag only covers AVD service IPs, not intra-VNET traffic needed for AD authentication.

## Scenario 10: Azure Monitor workbook deployment for AVD fails with 'Deploy...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- If workbook deployment fails, go to Log Analytics workspace > Agents configuration to manually configure performance counters and Windows event logs for AVD session hosts.

**Root Cause**: Azure Monitor configuration workbook passes object-type parameter instead of string when setting up session host data (performance counters/event logs).
