# AVD AVD Agent 与 SxS Stack (Part 2) - Quick Reference

**Entries**: 22 | **21V**: all applicable
**Keywords**: agent, agent-crash, agent-install, agent-registration, agent-upgrade, bitsadmin, broker, connectivity, contentidea-kb, deadlock, deployment, disableregistrytools, disk-space, dotnet-framework, downloadmsiexception
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD session host deployment completed but no session host appears in host pool. ... | Outbound network restricted - AVD agent cannot reach broker. Or PS DSC extension... | Check: 1) ARM deployment status for errors. 2) Application event logs for WVD-Ag... | 🟢 9.5 | OneNote |
| 2 📋 | AVD session host is unavailable. Application event log shows Event ID 3277 from ... | VM was left off/deallocated for more than 90 days. The AVD agent token certifica... | Generate a new registration key in Azure Portal (Host pool > Registration key > ... | 🟢 9.0 | ADO Wiki |
| 3 📋 | AVD rdp-sxs (WVD listener) not showing in qwinsta output on session host, indica... | Required WVD components (Remote Desktop Agent Boot Loader, RD Services Infrastru... | 1. Run qwinsta (admin cmd) to check if rdp-sxs listener is present. 2. Verify in... | 🟢 9.0 | ADO Wiki |
| 4 📋 | AVD agent cannot connect to broker through proxy. Session host shows unavailable... | Proxy is configured for user accounts but not for the LocalSystem/NetworkService... | Configure proxy for LocalSystem and NetworkService using bitsadmin: 'bitsadmin /... | 🟢 8.5 | OneNote |
| 5 📋 | AVD session host marked as unhealthy/unavailable. Agent heartbeat mechanism: age... | Agent heartbeat: If broker misses multiple heartbeats, VM is marked unhealthy an... | Check agent heartbeat via Kusto (RDInfraTrace table, Category contains 'Heartbea... | 🟢 8.5 | OneNote |
| 6 📋 | AVD VM not available due to 'SxSStackListenerCheck' failed error. Remote Desktop... | DisableRegistryTools registry key on VMs prevents system account from editing re... | Use PsExec to launch regedit in system context (psexec.exe -s -i regedit.exe). D... | 🟢 8.5 | ContentIdea |
| 7 📋 | Stack listener not working on Windows 10 2004 - rdp-tcp/rdp-sxs not in Listen st... | Registry keys fReverseConnectMode or fEnableWinStation not set to 1 under HKLM\S... | Set fReverseConnectMode=1 and fEnableWinStation=1 in registry for matching stack... | 🟢 8.0 | MS Learn |
| 8 📋 | DisableRegistryTools registry key prevents agent from installing SxS stack - ins... | DisableRegistryTools=1 set in HKU\DEFAULT, HKU\S-1-5-18, or HKCU policies preven... | Remove DisableRegistryTools key from all three locations, uninstall affected SxS... | 🟢 8.0 | MS Learn |
| 9 📋 | AVD session host shows as Unavailable. Application event log shows Event ID 3277... | VM was left off/deallocated for more than 90 days. The agent registration token ... | 1) Generate a new registration key from Azure Portal (Host pool > Registration k... | 🟢 8.0 | ADO Wiki |
| 10 📋 | SxSStackListenerCheck health check fails. Users get An error occurred while acce... | VM is running an unsupported OS SKU. AVD only supports client Enterprise SKUs an... | Deploy a supported OS per AVD prerequisites: https://learn.microsoft.com/en-us/a... | 🟢 8.0 | ADO Wiki |
| 11 📋 | WVD Agent upgrade fails with 'Method not found' exception in Application event l... | .NET Framework version on the session host is below 4.7.2 (e.g., .NET 4.7), caus... | Upgrade .NET Framework to version 4.7.2 or later: https://support.microsoft.com/... | 🟢 8.0 | ADO Wiki |
| 12 📋 | AVD session host fails to register with error INVALID_REGISTRATION_TOKEN. Event ... | The registration token used by the RD Agent has expired or is invalid. | 1) Generate a new registration token from Azure Portal (Host Pool → Registration... | 🟢 8.0 | ADO Wiki |
| 13 📋 | AVD session host fails to register with INVALID_REGISTRATION_TOKEN error. Event ... | Registration token is invalid, expired, or corrupted. The RDAgent cannot authent... | 1) Generate new registration key: Azure Portal > Host Pool > Registration key > ... | 🟢 8.0 | ADO Wiki |
| 14 📋 | Cannot connect CPC; OS changed Enterprise to Professional; SxS stack not listeni... | Intune script changed OS to Professional via OEM key | Exclude offending Intune script for Cloud PCs | 🟢 8.0 | ADO Wiki |
| 15 📋 | AVD VMs not joining host pool after provisioning. VMs created successfully but f... | Transient network issue between session host VNet and AVD control plane. RD Agen... | 1. Verify connectivity with WVDAgentURLTool.exe. 2. Check required URL list. 3. ... | 🔵 7.5 | OneNote |
| 16 📋 | AVD session host shows Unavailable. Event log: Unable to retrieve DefaultAgent f... | RDAgentBootLoader service failed to read DefaultAgent registry key under HKLM SO... | 1) Restart: net stop RDAgentBootLoader then net start RDAgentBootLoader. 2) If p... | 🔵 7.5 | OneNote |
| 17 📋 | O_REVERSE_CONNECT_STACK_FAILURE error - SxS stack not installed | Side-by-side stack not installed on session host VM | RDP as local admin and reinstall SxS stack via host pool registration | 🔵 7.0 | MS Learn |
| 18 📋 | AVD agent process crashes on session host, Event ID 1000 in Application logs. Pr... | Agent crash can be caused by underlying INVALID_REGISTRATION_TOKEN or NAME_ALREA... | 1) Collect MSRD-Collect and check Event ID 1000s. 2) First verify the crash is n... | 🔵 7.0 | ADO Wiki |
| 19 📋 | WVD/AVD session hosts become unresponsive, users unable to logon. Server hang, s... | RDPCoreCDV.dll regression in latest RDP SXS stack caused a two-thread deadlock v... | AVD Product Group rolled back RDP-SXS stack from rdp-sxs230307400 (faulty) to rd... | 🔵 6.5 | ContentIdea |
| 20 📋 | NAME_ALREADY_REGISTERED error when registering session host | Session host VM name is a duplicate of an existing registration | Remove session host from host pool, create new VM with unique name, re-register | 🔵 6.0 | MS Learn |
| 21 📋 | DownloadMsiException - agent fails to download/install | Insufficient disk space on session host VM for RDAgent installation | Free up disk space by deleting unused files or increase storage capacity of sess... | 🔵 6.0 | MS Learn |
| 22 📋 | Session host fails MonitoringAgentCheck - Geneva Agent not functioning | Remote Desktop Services Infrastructure Geneva Agent not installed, has multiple ... | Verify Geneva Agent installed (check Apps & Features); uninstall older versions ... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Outbound network restricted - AVD agent cannot reach broker.... `[Source: OneNote]`
2. Check: VM was left off/deallocated for more than 90 days. The AVD a... `[Source: ADO Wiki]`
3. Check: Required WVD components (Remote Desktop Agent Boot Loader, R... `[Source: ADO Wiki]`
4. Check: Proxy is configured for user accounts but not for the LocalS... `[Source: OneNote]`
5. Check: Agent heartbeat: If broker misses multiple heartbeats, VM is... `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-agent-sxs-2.md#troubleshooting-flow)