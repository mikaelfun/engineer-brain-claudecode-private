# AVD AVD Session Host (Part 3) - Quick Reference

**Entries**: 6 | **21V**: partial
**Keywords**: ad trust, arm-template, azure-monitor, broker, browser, configuration-workbook, connectionfailedadtrustedrelationshipfailure, deployment
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cannot add AVD session host using Windows Server 2019 Datacenter from marketplac... | Windows Server 2019 Datacenter marketplace offer not available in customer subsc... | Workaround: Create VM separately then register to host pool manually with PowerS... | 🔵 6.5 | OneNote |
| 2 📋 | When publishing Edge browser as RemoteApp in AVD, users can access session host ... | Browser RemoteApp runs on session host with full file system access. No default ... | Configure Group Policy URLBlocklist to block file:// URLs. For Edge: Microsoft.P... | 🔵 6.5 | OneNote |
| 3 📋 | AVD session randomly reconnects 1-2 times per hour. Backend log: connection clos... | Client intermittently loses connectivity to WVD service URLs. AVD heartbeat: 1 p... | 1) Whitelist all WVD URLs on client firewall. 2) Whitelist Azure IP ranges: Azur... | 🔵 6.0 | OneNote |
| 4 📋 | Multiple AVD session hosts become unhealthy simultaneously across several host p... | Network connectivity disruption between session hosts and AVD RDBroker WebSocket... | 1) Reboot affected session hosts to recover immediately. 2) Ensure firewall/prox... | 🔵 6.0 | OneNote |
| 5 📋 | Azure Monitor configuration workbook for AVD fails with 'Deployment template val... | The Azure Monitor configuration workbook for AVD may pass incorrect parameter ty... | Instead of using the configuration workbook, manually configure performance coun... | 🔵 6.0 | OneNote |
| 6 📋 | AVD connection failure with error ConnectionFailedAdTrustedRelationshipFailure a... | NSG rules blocked network communication between session host VNET and domain con... | Add service tag VirtualNetwork to NSG inbound/outbound rules to allow traffic be... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: Windows Server 2019 Datacenter marketplace offer n `[Source: OneNote]`
2. Check: Browser RemoteApp runs on session host with full f `[Source: OneNote]`
3. Check: Client intermittently loses connectivity to WVD se `[Source: OneNote]`
4. Check: Network connectivity disruption between session ho `[Source: OneNote]`
5. Check: The Azure Monitor configuration workbook for AVD m `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-session-host-3.md#troubleshooting-flow)
