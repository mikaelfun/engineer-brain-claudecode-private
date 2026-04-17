# Monitor AMA Linux 代理排查

**Entries**: 19 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to collect Azure Monitor Agent (AMA) logs on Linux VM for troubleshootin... | - | Collect AMA logs from: extension /var/log/azure/Microsoft.Azure.Monitor.Azure... | 9.0 | OneNote |
| 2 | AMA fails to parse syslog messages. mdsd.info shows 'Invalid field APPNAME' e... | Source application generates syslog messages with non-RFC3164-compliant APPNA... | 1) Update the source application to generate RFC 3164 compliant syslog messag... | 8.5 | ADO Wiki |
| 3 | AMA not collecting syslog on Linux. Syslog daemon config file for AMA forward... | AMA only creates the forwarding config when BOTH conditions are met: 1) A DCR... | Verify: 1) DCR has a valid syslog data source configured and is associated to... | 8.5 | ADO Wiki |
| 4 | AMA syslog parsing fails - Invalid APPNAME in mdsd.info | Non-RFC3164-compliant APPNAME with special chars | Update app for RFC 3164 compliance; update DCR facility | 8.5 | ADO Wiki |
| 5 | AMA not collecting syslog - forwarding config missing | AMA needs BOTH: DCR with syslog source AND daemon installed | Verify DCR + daemon package; restart AMA | 8.5 | ADO Wiki |
| 6 | In Linux network trace, cannot distinguish whether HIMDS (localhost:40342) ca... | Both AMA and ARC agent use the HIMDS service on localhost:40342 for metadata ... | Inspect the User-Agent field in HTTP GET requests to localhost:40342. AMA use... | 8.5 | ADO Wiki |
| 7 | AMA agent on Linux not collecting data; mdsd.err log shows 'boost::filesystem... | Incorrect file system permissions on AMA config-cache directories. The config... | Fix ownership: sudo chown -R syslog:syslog /etc/opt/microsoft/azuremonitorage... | 8.5 | ADO Wiki |
| 8 | Need to downgrade Azure Monitor Agent (AMA) extension to a previous version d... | Azure portal UI does not provide a built-in option to install a specific olde... | 1) Uninstall current extension from VM > Extensions blade 2) Wait 2 minutes 3... | 8.5 | ADO Wiki |
| 9 | Linux agent (OMS/AMA) logs or OpenSSL/curl command output shows error "unable... | SSL certificate chain on the Azure Monitor endpoint is not fully trusted by t... | 1) Identify which certificate in the chain is missing by examining the openss... | 8.5 | ADO Wiki |
| 10 | AMA Linux fails to upload data to Azure Monitor endpoints using default cppre... | The default cpprestsdk HTTP client used by AMA Linux has known issues causing... | Switch AMA HTTP client to libcurl: add 'export ENABLE_CURL_UPLOAD="true"' to ... | 8.5 | ADO Wiki |
| 11 | AMA Linux cannot connect to IMDS (169.254.169.254) - curl returns connection ... | Firewall iptables rule filters outbound traffic to IMDS by user ID (e.g., onl... | Check iptables OUTPUT rules: 'iptables -L OUTPUT -v -n --line-numbers'. Remov... | 8.5 | ADO Wiki |
| 12 | AMA Linux TLS handshake fails when connecting to Azure Monitor endpoints (glo... | Client system is using TLS 1.0 to establish the TLS session, which is depreca... | 1) Verify TLS handshake: 'curl -v -s -S -k https://global.handler.control.mon... | 8.5 | ADO Wiki |
| 13 | AMA Linux heartbeat missing from Log Analytics Workspace - extension installe... | mdsd process is running but not actively logging heartbeats (zombie process s... | Follow 5-step TSG: 1) Verify heartbeat is actually missing in LAW. 2) Check a... | 8.5 | ADO Wiki |
| 14 | Computer and FilePath columns are missing from Custom Log table (e.g. MSRepro... | The Custom Log table schema does not include Computer and FilePath columns, a... | 1) Go to LAW > Tables > find Custom Log table > Edit Schema > Add Column "Com... | 8.5 | ADO Wiki |
| 15 | AMA extension appears to be missing from Azure VM or Arc Machine when verifyi... | Extension name is customizable by the user during installation, making it an ... | Verify AMA extension presence using publisher and type instead of name: Windo... | 8.5 | ADO Wiki |
| 16 | AMA Linux custom text log collection misses log entries or re-ingests duplica... | Fluent Bit (used by AMA for text log collection on Linux) tracks file positio... | 1) Configure logrotate to use rename rotation instead of copytruncate 2) Use ... | 8.5 | ADO Wiki |
| 17 | AMA Linux ignores Arc proxy bypass list - AMA traffic still routes through Ar... | Bug in AMA versions 1.34-1.35: the proxy bypass list pattern matching logic n... | 1) Upgrade AMA to version 1.36 or later which contains the fix 2) Workaround:... | 8.5 | ADO Wiki |
| 18 | Vulnerability scanner (MDE/Tenable) reports CVE-2025-12969, CVE-2025-12970, C... | AMA Linux versions prior to 1.39.0 contain vulnerable dependencies affected b... | Upgrade AMA Linux extension to version 1.40 or later which contains fixes for... | 8.5 | ADO Wiki |
| 19 | Performance data (metrics) missing in Azure Monitor when both AMA and LAD ext... | AMA and LAD share a common telegraf setup for metrics collection. This coexis... | Remove the LAD extension and restart AMA agent: 'systemctl restart azuremonit... | 6.0 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/agent-ama-linux.md)
