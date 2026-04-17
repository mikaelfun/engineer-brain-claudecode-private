# AVD AVD RDP Shortpath - Quick Reference

**Entries**: 8 | **21V**: partial
**Keywords**: azure-stack-hci, client, gpo, heartbeat, kusto, networking, rdp-shortpath, rdpcoretseventlog
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD on Azure Stack HCI: RDP Shortpath not working | VM has multiple IP addresses and the service selects an incorrect one for RDP Sh... | If customer reports this issue, create an ICM for the product group to investiga... | 🟢 8.0 | ADO Wiki |
| 2 📋 | RDP Shortpath (UDP transport) fails to establish for client connections; AVD fal... | Client machine GPO policy is blocking UDP traffic, preventing RDP Shortpath from... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net').database('WVD').RD... | 🔵 7.5 | ADO Wiki |
| 3 📋 | RDP Shortpath (UDP transport) fails to establish from session host VM side; UDP ... | Session host VM GPO policy is blocking UDP traffic, preventing RDP Shortpath fro... | Run Kusto query: cluster('rdsprod.eastus2.kusto.windows.net').database('WVD').RD... | 🔵 7.5 | ADO Wiki |
| 4 📋 | The RDP short path value for the hostpool changes from &quot;DISABLED&quot; to &... | RDP shortpath value set to NOT DEFINED in the Azure portal by scaling plan. Know... | The Azure Virtual Desktop (AVD) Product Group team has acknowledged this as a kn... | 🔵 6.5 | KB |
| 5 📋 | The customer is experiencing issues with the configuration of RDP Shortpath for ... | Group      Policy Limitations:&nbsp;The GPO settings can disable RDP Shortpath  ... | Host      Pool Network Properties:      Use       the settings on the Host pool ... | 🔵 6.5 | KB |
| 6 📋 | The customer is facing issues with configuring UDP ShortPath for Azure Virtual D... | The issue arises due to the way the ICE/STUN protocol evaluates multiple routes ... | To resolve the UDP ShortPath over ER issue, follow these steps: Verify VPN Conne... | 🔵 6.5 | KB |
| 7 📋 | ShortpathTransportNetworkDrop error in Log Analytics - UDP connection drops | UDP has no RST mechanism; loss detected only by timeout | Use avdnettest.exe to verify STUN/TURN connectivity and NAT type | 🟡 4.5 | MS Learn |
| 8 📋 | ConnectionBrokenMissedHeartbeatThresholdExceeded - RDP timeout before UDP timeou... | RDP heartbeat timeout misconfiguration | Review RDP heartbeat timeout settings | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: VM has multiple IP addresses and the service selec `[Source: ADO Wiki]`
2. Check: Client machine GPO policy is blocking UDP traffic, `[Source: ADO Wiki]`
3. Check: Session host VM GPO policy is blocking UDP traffic `[Source: ADO Wiki]`
4. Check: RDP shortpath value set to NOT DEFINED in the Azur `[Source: KB]`
5. Check: Group      Policy Limitations:&nbsp;The GPO settin `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-rdp-shortpath.md#troubleshooting-flow)
