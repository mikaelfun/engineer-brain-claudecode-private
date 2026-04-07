# Monitor AMA Windows 代理排查

**Entries**: 15 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Monitor Agent (AMA) installed on Windows client device (non-Azure VM) f... | Incorrect MSI parameter name used during installation. The parameter 'clouden... | Uninstall existing AMA via Control Panel. Reinstall using correct command: ms... | 9.0 | OneNote |
| 2 | AMA Windows not collecting IIS logs. MAEventTable shows 'Could not open direc... | IIS log directory doesn't exist at the expected path or has incorrect permiss... | Validate IIS log files exist locally. Check IIS Manager for the actual log fi... | 8.5 | ADO Wiki |
| 3 | AMA Windows performance counters missing in Perf table. MAEventTable shows PD... | Counter name in DCR doesn't match the actual counter name available on the OS... | Run 'typeperf -q' to list available counters on the system. Compare with coun... | 8.5 | ADO Wiki |
| 4 | AMA Windows IIS logs - Could not open directory error | IIS log dir missing or wrong permissions | Validate IIS log path in IIS Manager | 8.5 | ADO Wiki |
| 5 | AMA Windows perf counters missing - PDH API errors | Counter name mismatch between DCR and OS (locale-dependent) | typeperf -q to list; update DCR with exact names | 8.5 | ADO Wiki |
| 6 | AMA agent cannot upload data to ODS endpoint; network trace shows TLS handsha... | Required TLS cipher suite TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 is disabled o... | Capture network trace (netsh trace start capture=yes, wait 5 min, netsh trace... | 8.5 | ADO Wiki |
| 7 | AMA agent fails to connect to ODS endpoint; TLS Server Hello shows certificat... | Network firewall or proxy is performing HTTPS/SSL/packet inspection, intercep... | Configure the network firewall/proxy to bypass SSL inspection for Azure Monit... | 8.5 | ADO Wiki |
| 8 | AMA Windows agent on Azure VM installed successfully but agent processes not ... | IMDS endpoint (169.254.169.254) is unreachable from the VM due to missing net... | 1) Test IMDS connectivity: Invoke-RestMethod -Headers @{Metadata=true} -Metho... | 8.5 | ADO Wiki |
| 9 | Azure VM or Arc server extension auto-upgrade (enableAutomaticUpgrade=true) k... | Latest extension version has an issue causing upgrade failure, triggering aut... | 1) Check extension upgrade logs (Arc: gc_ext.log, Azure VM: CommandExecution.... | 8.5 | ADO Wiki |
| 10 | AMA agent on Windows is not sending heartbeats to Log Analytics Workspace. Er... | Group Policy 'Turn off Automatic Root Certificates Update' is enabled (regist... | 1) Check registry key HKLM\Software\Policies\Microsoft\SystemCertificates\Aut... | 8.5 | ADO Wiki |
| 11 | AMA agent on Windows not sending heartbeats with SSL errors WINHTTP_CALLBACK_... | Machine is unable to reach Certificate Revocation List (CRL) endpoints requir... | Verify network connectivity to CRL endpoints documented at https://learn.micr... | 8.5 | ADO Wiki |
| 12 | Windows performance counters not uploading to Log Analytics workspace via MMA... | The perf counter is not producing values locally on the affected machine (cor... | 1) Validate counter locally using Perfmon (add counter and check values) 2) V... | 8.5 | ADO Wiki |
| 13 | Log Analytics performance counters are logged in a non-English locale languag... | Administrator changed the login/new user account regional settings and applie... | 1) Open Windows Settings > Region > Language > Administrative language settin... | 8.5 | ADO Wiki |
| 14 | Vulnerability scanner reports CVE-2025-12969, CVE-2025-12970, CVE-2025-12972,... | AMA Windows versions prior to 1.39.0 contain vulnerable dependencies affected... | Upgrade AMA Windows extension to version 1.41 or later which contains fixes f... | 8.5 | ADO Wiki |
| 15 | AMA Windows data upload fails. MAQosEvent.csv shows Success=FALSE. MAEventTab... | Network connectivity issue preventing AMA from reaching required endpoints. C... | 1) Verify DNS resolution: nslookup global.handler.control.monitor.azure.com, ... | 6.0 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/agent-ama-windows.md)
