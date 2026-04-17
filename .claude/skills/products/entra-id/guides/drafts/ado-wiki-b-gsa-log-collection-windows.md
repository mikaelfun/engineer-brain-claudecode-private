---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/GSA Private Access - CSS TSGs/GSA Client Advanced Log Collection Files for Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FInternal%20Docs%2FGSA%20Private%20Access%20-%20CSS%20TSGs%2FGSA%20Client%20Advanced%20Log%20Collection%20Files%20for%20Windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Client Advanced Log Collection Files for Windows

Detailed information about files collected by Advanced log collection integrated in the Global Secure Access client (Windows).

Based on version: 2.24.117.0

Logs are compressed into: `GlobalSecureAccessLogsArchive_HH-MM-SS__DD-MM-YYYY_GUID`

Data collection is performed using an elevated user account that is a member of the local Administrators group. This account may differ from the user currently signed in to the GSA client.

## Log Files Reference

### ETL Trace Files (convert with InsightClient)

| File name | Purpose |
|-----------|---------|
| DNSClient.etl | DNS client trace (generated via netsh trace) |
| GlobalSecureAccess-Boot-Trace.etl | Boot-time GSA trace |
| GlobalSecureAccess-LTR-Trace.etl | Long-term running GSA trace |
| GlobalSecureAccess-Trace.etl | Main GSA trace file |
| GlobalSecureAccess-Trace_YYYYMMDD_HHMMSS.etl | Timestamped GSA trace |
| InternetDebug.etl | Internet Access trace |
| NetworkTrace.etl | Network capture (taken by pktmon.exe, read with Network Monitor 3.4) |
| wfpdiag.etl | Windows Filtering Platform diagnostic |

Convert ETL files with [InsightClient](https://cesdiagtools.blob.core.windows.net/crossproduct/insightclient64/insider/InsightClient.application)

### Event Log Files (.evtx)

| File name | Purpose |
|-----------|---------|
| Application-Crash.evtx | Application crash events |
| Microsoft-Windows-AAD-Operational.evtx | AAD operational events |
| Microsoft-Windows-Global Secure Access Client-Kernel.evtx | GSA kernel driver events |
| Microsoft-Windows-Global Secure Access Client-Operational.evtx | GSA client operational events |
| Microsoft-Windows-NetworkProfile-Operational.evtx | Network profile events |
| Microsoft-Windows-UserDeviceRegistration-Admin.evtx | Device registration admin events |
| Microsoft-Windows-UserDeviceRegistration-Debug.evtx | Device registration debug events |
| System_Microsoft-Windows-Kernel-Power.evtx | Kernel power events |

### Configuration and State Files

| File name | Format | Purpose | Troubleshooting tip |
|-----------|--------|---------|---------------------|
| hosts | TEXT | Hosts file | Check for hardcoded DNS records causing unexpected name resolution |
| ForwardingProfile.json | JSON | Dump of profiles, segments, Private DNS etc. | audienceScope GUID is the App ID of the Network Policy App |
| wfpfilters.xml | XML | WFP filters (netsh wfp show filters) | Review firewall/filter rules |
| wfpstate.xml | XML | WFP state (netsh wfp show state) | Review WFP state |

### Registry Exports

| File name | Purpose |
|-----------|---------|
| HKEY_CURRENT_USER_SOFTWARE_Microsoft_Global Secure Access Client.reg | Per-user GSA settings |
| HKLM_SOFTWARE_Microsoft_Global Secure Access Client Volatile Shared.reg | Volatile shared settings |
| HKLM_SOFTWARE_Microsoft_Global Secure Access Client.reg | Machine-level GSA settings |
| HKLM_SYSTEM_CurrentControlSet_Control_Lsa_Kerberos_Parameters.reg | Kerberos parameters |
| HKLM_SYSTEM_CurrentControlSet_Services_Dnscache_Parameters_DnsPolicyConfig.reg | DNS policy config |
| HKLM_SYSTEM_CurrentControlSet_Services_GlobalSecureAccessDriver.reg | GSA driver service |
| HKLM_SYSTEM_CurrentControlSet_Services_GlobalSecureAccessEngineService.reg | GSA engine service |
| HKLM_SYSTEM_CurrentControlSet_Services_GlobalSecureAccessForwardingProfileService.reg | GSA forwarding profile service |
| HKLM_SYSTEM_CurrentControlSet_Services_GlobalSecureAccessTunnelingService.reg | GSA tunneling service |
| HKLM_SYSTEM_CurrentControlSet_Services_Tcpip_Parameters.reg | TCP/IP parameters |
| HKLM_SYSTEM_CurrentControlSet_Services_WinSock2_Parameters_NameSpace_Catalog5_Catalog_Entries.reg | WinSock namespace catalog |

### Diagnostic Text Files

| File name | Purpose | Troubleshooting tip |
|-----------|---------|---------------------|
| ClientChecker.txt | Health check details | See [GSA Client Health Check](https://learn.microsoft.com/en-us/entra/global-secure-access/troubleshoot-global-secure-access-client-diagnostics-health-check) |
| DeviceInformation.txt | OS information | Basic system info |
| dsregcmd.txt | Device registration, domain membership | See [Troubleshooting Device Registration](https://learn.microsoft.com/en-us/entra/identity/devices/troubleshoot-device-dsregcmd). Ensure device is Entra or Hybrid Joined and user has PRT. **Note**: command runs in context of user who started Advanced diagnostics - output may be misleading |
| installedPrograms.txt | Installed programs | Check for conflicting VPN/proxy software |
| kerberos_info.txt | Kerberos cache (klist; klist tgt; klist cloud_debug) | Verify Kerberos tickets |
| NetworkConnectivity.txt | Network connectivity status | Check reachability |
| NetworkDrivers.txt | Network drivers | Check for outdated/conflicting drivers |
| NetworkInterfaces.txt | Network interface configuration | Verify interfaces |
| NetworkProtection.txt | Windows Defender and firewall settings | Verify exclusions or bypasses for GSA client processes |
| NetworkTrace.txt | Converted from NetworkTrace.etl via etl2txt.exe | Quick text view, not for deep analysis |
| RunningProcesses.txt | Running processes (name, version, session ID) | Check for conflicting processes |
| systeminfo.txt | Detailed system info (systeminfo.exe) | Hardware/software details |
| systemWideProxy.txt | System-wide proxy settings | Check proxy conflicts |
| userConfiguredProxy.txt | User-configured proxy | Check proxy conflicts |
| userSessions.txt | User sessions (query session) | [Multi Sessions](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-install-windows-client#multi-session) are NOT supported |

### Other Files

| File name | Format | Purpose |
|-----------|--------|---------|
| ClientCert.cer | CER | mTLS client certificate (stored in certlm.msc local machine store) |
| wfpdiag.cab | CAB | WFP diagnostic cabinet |
| NetworkTrace.pcap | PCAP | Network capture (use [Wireshark](https://www.wireshark.org/)) |

## Key Troubleshooting Workflow

1. Check `ClientChecker.txt` for overall health status
2. Check `dsregcmd.txt` - ensure device is Entra/Hybrid Joined with valid PRT
3. Check `ForwardingProfile.json` - verify policy/segments loaded
4. Check `hosts` file - no conflicting DNS entries
5. Check registry exports for service configuration
6. Convert ETL files with InsightClient for detailed trace analysis
7. Check `userSessions.txt` - multi-session is NOT supported
8. Use NetworkTrace.pcap in Wireshark for packet-level analysis

## Teams Channel

[Cloud Identity - Authentication | Global Secure Access (ZTNA)](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
