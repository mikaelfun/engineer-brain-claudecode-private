# AVD AVD Agent 与 SxS Stack (Part 2) - Quick Reference

**Entries**: 10 | **21V**: all applicable
**Keywords**: agent, agent-install, bitsadmin, broker, deployment, disableregistrytools, disk-space, downloadmsiexception
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host deployment completed but no session host appears in host pool. ... | Outbound network restricted - AVD agent cannot reach broker. Or PS DSC extension... | Check: 1) ARM deployment status for errors. 2) Application event logs for WVD-Ag... | 🟢 8.0 | OneNote |
| 2 📋 | AVD agent cannot connect to broker through proxy. Session host shows unavailable... | Proxy is configured for user accounts but not for the LocalSystem/NetworkService... | Configure proxy for LocalSystem and NetworkService using bitsadmin: 'bitsadmin /... | 🟢 8.0 | OneNote |
| 3 📋 | AVD session host marked as unhealthy/unavailable. Agent heartbeat mechanism: age... | Agent heartbeat: If broker misses multiple heartbeats, VM is marked unhealthy an... | Check agent heartbeat via Kusto (RDInfraTrace table, Category contains 'Heartbea... | 🟢 8.0 | OneNote |
| 4 📋 | AVD VMs not joining host pool after provisioning. VMs created successfully but f... | Transient network issue between session host VNet and AVD control plane. RD Agen... | 1. Verify connectivity with WVDAgentURLTool.exe. 2. Check required URL list. 3. ... | 🔵 7.5 | OneNote |
| 5 📋 | Session host fails MonitoringAgentCheck - Geneva Agent not functioning | Remote Desktop Services Infrastructure Geneva Agent not installed, has multiple ... | Verify Geneva Agent installed (check Apps & Features); uninstall older versions ... | 🔵 7.0 | MS Learn |
| 6 📋 | Stack listener not working on Windows 10 2004 - rdp-tcp/rdp-sxs not in Listen st... | Registry keys fReverseConnectMode or fEnableWinStation not set to 1 under HKLM\S... | Set fReverseConnectMode=1 and fEnableWinStation=1 in registry for matching stack... | 🔵 6.5 | MS Learn |
| 7 📋 | O_REVERSE_CONNECT_STACK_FAILURE error - SxS stack not installed | Side-by-side stack not installed on session host VM | RDP as local admin and reinstall SxS stack via host pool registration | 🔵 6.5 | MS Learn |
| 8 📋 | NAME_ALREADY_REGISTERED error when registering session host | Session host VM name is a duplicate of an existing registration | Remove session host from host pool, create new VM with unique name, re-register | 🔵 6.0 | MS Learn |
| 9 📋 | DownloadMsiException - agent fails to download/install | Insufficient disk space on session host VM for RDAgent installation | Free up disk space by deleting unused files or increase storage capacity of sess... | 🔵 6.0 | MS Learn |
| 10 📋 | DisableRegistryTools registry key prevents agent from installing SxS stack - ins... | DisableRegistryTools=1 set in HKU\DEFAULT, HKU\S-1-5-18, or HKCU policies preven... | Remove DisableRegistryTools key from all three locations, uninstall affected SxS... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Outbound network restricted - AVD agent cannot rea `[Source: OneNote]`
2. Check: Proxy is configured for user accounts but not for `[Source: OneNote]`
3. Check: Agent heartbeat: If broker misses multiple heartbe `[Source: OneNote]`
4. Check: Transient network issue between session host VNet `[Source: OneNote]`
5. Check: Remote Desktop Services Infrastructure Geneva Agen `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-agent-sxs-2.md#troubleshooting-flow)
