---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Data Collector files and explanation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Data%20Collector%20files%20and%20explanation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Data Collector Files and Explanation

Data Collector script version: v33

Compressed File Name Format: `_COMPUTERNAME__MEAP_traces__YEAR_-_MONTH_-_DAY_HOUR_-_MINUTE_.zip`

File suffixes:
- **BEFORE** - Data generated before the repro data collection
- **AFTER** - Data generated right after the user finished the repro

## Key Files Reference

| Name | Description | Troubleshooting tip |
|------|-------------|---------------------|
| AppProxylog.etl | WapWrapper.dll log (`%WinDir%\debug\AppProxylog.etl`) | Shows how the connector processes backend request/response. Buffer: 500 MB circular. Convert with InsightClient |
| _COMPUTERNAME_-HTTP-network.cab | Network trace cab | Troubleshooting advanced network issues |
| _COMPUTERNAME_-ApplicationProxyConnectorService.exe.config | Connector service config | Proxy configuration for outbound traffic |
| _COMPUTERNAME_-ApplicationProxyConnectorUpdaterService.exe.config | Updater service config | Proxy configuration for outbound traffic |
| _COMPUTERNAME_-dcloc_krb.etl | DC locator/Kerberos trace | Convert with InsightClient |
| _COMPUTERNAME_-schannel.etl | Schannel (TLS/SSL) trace | Convert with InsightClient |
| _COMPUTERNAME_-Application.evtx | Application event log | Standard Application Log |
| _COMPUTERNAME_-Security.evtx | Security event log | Standard Security Log |
| _COMPUTERNAME_-System.evtx | System event log | Standard System Log |
| _COMPUTERNAME_-AadApplicationProxy-Connector-Admin.evtx | Connector Service Admin log | Connector event logs |
| _COMPUTERNAME_-AadApplicationProxy-Connector-Session.evtx | Connector Service Session log | Connector event logs |
| _COMPUTERNAME_-AadApplicationProxy-Updater-Admin.evtx | Updater Admin log | Connector event logs |
| _COMPUTERNAME_-AadApplicationProxy-Updater-Session.evtx | Updater Session log | Connector event logs |
| _COMPUTERNAME_-Microsoft-AzureADConnect-AgentUpdater-Admin.evtx | Connector Updater Service log | Connector event logs |
| _COMPUTERNAME_-Microsoft-Windows-CAPI2-Operational.evtx | CAPI2 log | Certificate operations |
| _COMPUTERNAME_-HTTP-network.etl | Network + WebIO + WinHTTP logs | 800 MB circular. Open in Network Monitor 3.4 or convert with InsightClient |
| _COMPUTERNAME_-GPReport.html | Group Policies | Applied Group Policies |
| _COMPUTERNAME_-WindowsPatches.htm | Windows patches | Installed Windows patches |
| _COMPUTERNAME_-msinfo32-AFTER.nfo | System info | OS, hardware, drivers, services |
| _COMPUTERNAME_-ConnectorVersion.txt | Connector version | Version of the connector |
| _COMPUTERNAME_-hosts.txt | HOSTS file | Hard-coded DNS entries |
| _COMPUTERNAME_-ipconfig-all-AFTER.txt | IP configuration | IP, DNS, DHCP of all network adapters |
| _COMPUTERNAME_-netlogon.log | NETLOGON log | Authentication, DC locator, account lockout |
| _COMPUTERNAME_-netstat-nao-*.txt | NETSTAT output | Network connections |
| _COMPUTERNAME_-NET-version.txt | .NET Framework version | From registry |
| _COMPUTERNAME_-reg-schannel.txt | SCHANNEL registry keys | TLS configuration |
| _COMPUTERNAME_-winhttp-proxy.txt | WinHTTP proxy config | `Netsh WinHttp Show Proxy` |
| _COMPUTERNAME_-AD-Attributes.txt | AD attributes of connector computer object (since v17) | KCD troubleshooting - check msds-allowedtodelegateto, useraccountcontrol (must be 16781312) |
| _COMPUTERNAME_-http-Binding.txt | HTTP.SYS SSL bindings (since v17) | `netsh http show ssl` |
| _COMPUTERNAME_-AADAPPerf.blg | Perfmon log (since v17, -Perfmon switch) | App Proxy connector, Disk, Memory, Process, CPU, TCP, Network counters every 5s |
| _COMPUTERNAME_-secpolicy.inf | Security policy (since v17.1) | SecEdit security configuration |
| _COMPUTERNAME_-connectorID.txt | Connector ID | Connector identifier |
| _COMPUTERNAME_-sysinfo.txt | Quick system overview | OS type, hardware, domain, network, patch status |
| Debug\Config\TrustSettings.xml | Connector TLS client certificate config | Trust certificate verification |
| Debug\Traces\AadAppProxyConnector_*.log | Connector trace log | Callstack of handled exceptions, network issues |
| Debug\Traces\AadAppProxyConnectorUpdater_*.log | Updater trace log | Callstack of handled exceptions |

## Certificate Files

| Name | Description |
|------|-------------|
| _COMPUTERNAME_-certutil-v-store-ca.txt | CA certificate store |
| _COMPUTERNAME_-certutil-v-store-my.txt | Personal certificate store |
| _COMPUTERNAME_-certutil-v-store-root.txt | Root certificate store |
| _COMPUTERNAME_-cerutil-v-store-enterprise-ntauth.txt | Enterprise NTAuth store |
| _COMPUTERNAME_-PS-Certs-LocalMachine-*.txt | PowerShell certificate store exports |

## DNS Cache Files

| Name | Description |
|------|-------------|
| _COMPUTERNAME_-ClientDnsCache-before.txt | DNS cache before repro (then flushed) |
| _COMPUTERNAME_-ClientDnsCache-After.txt | DNS cache during repro |

## Registry Files

| Name | Description |
|------|-------------|
| _COMPUTERNAME_-reg-AADConfig.txt | AAD configuration |
| _COMPUTERNAME_-reg-AADConServConfig.txt | AAD connector service config |
| _COMPUTERNAME_-reg-AADUpConfig.txt | AAD updater config |
| _COMPUTERNAME_-reg-cipher-Suit.txt | Cipher suite configuration |
| _COMPUTERNAME_-reg-MSDOTNet4.txt | .NET 4 configuration |
| _COMPUTERNAME_-reg-NETLOGON-port-and-other-params.txt | Netlogon parameters |
| _COMPUTERNAME_-reg-RPC-ports-and-general-config.txt | RPC port configuration |
| _COMPUTERNAME_-WinHTTPRegistry.txt | WinHTTP registry settings |
