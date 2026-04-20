# AVD AVD Session Host (Part 3) - Quick Reference

**Entries**: 10 | **21V**: mixed
**Keywords**: ad trust, agent-upgrade, all-hosts-unavailable, azure-monitor, browser, certificate, connectionfailedadtrustedrelationshipfailure, deployment, deployment-validation, domain controller, duplicate-sessions, edge, file-access, firewall, fsinglesessionperuser
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Users get repeated/duplicate sessions on the same AVD session host after disconn... | Registry key fSingleSessionPerUser at HKLM\SYSTEM\CurrentControlSet\Control\Term... | Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\fSingleSe... | 🟢 8.0 | ADO Wiki |
| 2 📋 | AVD users get assigned to same session host but a new session is created on reco... | Registry key fSingleSessionPerUser under HKLM\SYSTEM\CurrentControlSet\Control\T... | Set registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server [fSingleS... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Cannot add AVD session host using Windows Server 2019 Datacenter from marketplac... | Windows Server 2019 Datacenter marketplace offer not available in customer subsc... | Workaround: Create VM separately then register to host pool manually with PowerS... | 🔵 7.0 | OneNote |
| 4 📋 | When publishing Edge browser as RemoteApp in AVD, users can access session host ... | Browser RemoteApp runs on session host with full file system access. No default ... | Configure Group Policy URLBlocklist to block file:// URLs. For Edge: Microsoft.P... | 🔵 7.0 | OneNote |
| 5 📋 | Error in RemoteDesktopServices event log from Microsoft.RDInfra.Agent.Monitoring... |  | Follow the Geneva Monitoring Agent Check troubleshooting steps at: https://eng.m... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Session host health check failure: 'Unable to locate cert RDSAgentPROD.geneva.ke... | Geneva monitoring agent certificate is missing or invalid on the AVD session hos... | Follow the Geneva Monitoring Agent Check troubleshooting guide to remediate the ... | 🔵 7.0 | ADO Wiki |
| 7 📋 | AVD session randomly reconnects 1-2 times per hour. Backend log: connection clos... | Client intermittently loses connectivity to WVD service URLs. AVD heartbeat: 1 p... | 1) Whitelist all WVD URLs on client firewall. 2) Whitelist Azure IP ranges: Azur... | 🔵 6.5 | OneNote |
| 8 📋 | All AVD session hosts across multiple host pools become unavailable simultaneous... | Session hosts lost WebSocket connectivity to RDBroker URL due to network/firewal... | 1) Reboot affected session hosts. 2) Whitelist all AVD required URLs on firewall... | 🔵 6.5 | OneNote |
| 9 📋 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure a... | NSG rules blocked network communication between session host VNET and domain con... | Add service tag VirtualNetwork to NSG inbound/outbound rules to allow traffic be... | 🔵 6.5 | OneNote |
| 10 📋 | Azure Monitor workbook deployment for AVD fails with 'Deployment validation fail... | Azure Monitor configuration workbook passes object-type parameter instead of str... | If workbook deployment fails, go to Log Analytics workspace > Agents configurati... | 🟡 5.5 | OneNote |

## Quick Triage Path

1. Check: Registry key fSingleSessionPerUser at HKLM\SYSTEM\CurrentCon... `[Source: ADO Wiki]`
2. Check: Registry key fSingleSessionPerUser under HKLM\SYSTEM\Current... `[Source: ADO Wiki]`
3. Check: Windows Server 2019 Datacenter marketplace offer not availab... `[Source: OneNote]`
4. Check: Browser RemoteApp runs on session host with full file system... `[Source: OneNote]`
5. Check:  `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-session-host-3.md#troubleshooting-flow)