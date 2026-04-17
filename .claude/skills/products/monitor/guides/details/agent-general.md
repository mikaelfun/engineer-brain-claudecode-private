# Monitor 监控代理综合问题 - Comprehensive Troubleshooting Guide

**Entries**: 50 | **Drafts fused**: 28 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-agent-data-types-reaching-ods.md, ado-wiki-a-ama-ht-confirm-agent-rollout-status.md, ado-wiki-a-Cmdlets-and-API-reference-for-Application-Insights-Agent.md, ado-wiki-a-CTI-V2-Windows-Kusto-Agent-Log.md, ado-wiki-a-Linux-Agent-Basics.md, ado-wiki-a-OS-Hardening-Customizations-Linux-Agent.md, ado-wiki-a-restart-Azure-Guest-Agent-Windows.md, ado-wiki-b-agent-version-type-finder.md, ado-wiki-b-AMA-HT-Check-Latest-Agent-Version.md, ado-wiki-b-ci-agent-log-locations.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Host metrics showing dotted line on Azure portal. PG requests monitoring agent logs from host node for investigation/escalation.

**Solution**: Method 1 (Jarvis - preferred): Browse Jarvis link (jarvis-west.dc.ad.msft.net/881A73F6), filter by host node IP (obtainable from ASC), download MaMetricsExtensionEtw*.tsf from C:\Resources\MonitoringStore\Tables\. Then enable diagnostics on a Windows VM, copy table2csv.exe from C:\Packages\Plugin...

`[Source: OneNote, Score: 9.0]`

### Step 2: Java application with Application Insights Java Agent experiences high CPU usage caused by Reactor and Reactor Netty instrumentations

**Solution**: Disable Reactor/Reactor Netty instrumentations by setting environment variables OTEL_INSTRUMENTATION_REACTOR_ENABLED=false and OTEL_INSTRUMENTATION_REACTOR_NETTY_ENABLED=false, or use JVM system properties -Dotel.instrumentation.reactor.enabled=false and -Dotel.instrumentation.reactor.netty.enabl...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: AMA Linux extension installation fails or stucks in transitioning state on SUSE/SLES 15; insserv-compat package missing error in extension logs

**Solution**: 1. Configure official SUSE repo on the machine. 2. Consult Linux Ninjas via collab or swarming channel. PG work item: https://msazure.visualstudio.com/One/_workitems/edit/12416349

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: AMA/OMS Linux extension fails with [ExtensionOperationError] Non-zero exit code: 126, Permission denied on shim.sh; unable to install, uninstall or disable any extensions

**Solution**: Remove noexec flag from /etc/fstab for /var/ and remount: `mount -o remount /var` or `systemctl daemon-reload`. Verify: `findmnt -T /var | grep noexec`. AMA supports CIS lvl1/2 but noexec on /var is not standard Azure marketplace config

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: AMA Linux extension fails to uninstall via Portal/PowerShell/CLI with error 'Non-zero exit code: 5' and 'Unit azuremonitoragentmgr.service could not be found'. Extension status shows Transitioning....

**Solution**: Run shim.sh -install then shim.sh -enable from /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>/ to restore agent services, then retry uninstall via portal. Ignore 'already installed' errors during shim.sh execution.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Host metrics showing dotted line on Azure portal. PG requests monitoring agen... | Host monitoring agent logs (MaMetricsExtensionEtw*.tsf files) are stored at C... | Method 1 (Jarvis - preferred): Browse Jarvis link (jarvis-west.dc.ad.msft.net... | 9.0 | OneNote |
| 2 | Java application with Application Insights Java Agent experiences high CPU us... | The Reactor and Reactor Netty instrumentations applied by the Java Agent can ... | Disable Reactor/Reactor Netty instrumentations by setting environment variabl... | 8.5 | ADO Wiki |
| 3 | AMA Linux extension installation fails or stucks in transitioning state on SU... | Starting from AMA 1.14.5, AMA Linux Extension requires insserv-compat package... | 1. Configure official SUSE repo on the machine. 2. Consult Linux Ninjas via c... | 8.5 | ADO Wiki |
| 4 | AMA/OMS Linux extension fails with [ExtensionOperationError] Non-zero exit co... | /var/ partition mounted with noexec flag prevents execution of extension scri... | Remove noexec flag from /etc/fstab for /var/ and remount: `mount -o remount /... | 8.5 | ADO Wiki |
| 5 | AMA Linux extension fails to uninstall via Portal/PowerShell/CLI with error '... | The azuremonitoragentmgr systemd service was removed or corrupted, preventing... | Run shim.sh -install then shim.sh -enable from /var/lib/waagent/Microsoft.Azu... | 8.5 | ADO Wiki |
| 6 | With AMA for Linux 1.10.7 only, mdsd process fails to start after a system re... | AMA 1.10.7 creates /run/azuremonitoragent at install time for SQL Insights br... | Upgrade to AMA 1.10.9+ which contains the hotfix. Workaround: sudo mkdir /run... | 8.5 | ADO Wiki |
| 7 | Windows AMA does not collect Event Log events near timeframe of reboot/shutdo... | Non-graceful shutdown corrupts AMA cache files at C:\ProgramData\Azure Monito... | Ensure reboots/shutdowns are graceful. Do not force restart (e.g. holding pow... | 8.5 | ADO Wiki |
| 8 | After AMA installation on Azure-based Microsoft Failover Clusters (Windows), ... | Microsoft Failover Cluster uses subnet 169.254.0.0/16 for internal cluster co... | Add persistent static route on each cluster node: 'route -p add 169.254.169.2... | 8.5 | ADO Wiki |
| 9 | AMA Linux extension shows Failed/Transitioning status and cannot be uninstall... | Extension stuck in bad provisioning state preventing normal uninstallation fl... | Manual removal: 1) Stop all agent processes (mdsd, mdsdmgr, telegraf, metrics... | 8.5 | ADO Wiki |
| 10 | No telemetry data visible in Application Insights — ASC Ingestion tab shows n... | Data is not reaching the ingestion endpoint at all. Most likely causes: (1) n... | Check network connectivity from the app host to the Application Insights inge... | 8.5 | ADO Wiki |
| 11 | Application Insights component shows 'Ingestion Mode: Disabled' in the ASC Pr... | Three possible causes: (1) The underlying Log Analytics workspace has been de... | (1) If workspace deleted: re-link the Application Insights component to an ex... | 8.5 | ADO Wiki |
| 12 | Azure Monitor OpenTelemetry Java agent fails to instrument Quarkus native app... | Azure Monitor OpenTelemetry Java agent is not compatible with Quarkus native ... | Use community package quarkus-opentelemetry-exporter-azure instead of standar... | 8.5 | ADO Wiki |
| 13 | Cannot add custom HOST or User-Agent HTTP header to Application Insights avai... | HOST and User-Agent headers are reserved by the availability test client and ... | Use TrackAvailability() custom test to pass custom HOST or User-Agent header ... | 8.5 | ADO Wiki |
| 14 | Unexpected or unidentified HTTP requests arriving at web server from Applicat... | An availability test resource (microsoft.insights/webtests) is configured to ... | Check User-Agent header for 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.... | 8.5 | ADO Wiki |
| 15 | Syslog messages collected by OMS Agent for Linux appear truncated at 2048 byt... | The fluentd syslog input plugin used by OMS Agent has a default message_lengt... | 1) Edit /etc/opt/microsoft/omsagent/<WORKSPACE_ID>/conf/omsagent.d/syslog.con... | 8.5 | ADO Wiki |
| 16 | OMS Agent for Linux loses data or cannot sustain high event ingestion rates (... | By default the agent or rsyslog may use UDP protocol for localhost forwarding... | 1) Switch to TCP protocol for rsyslog-to-agent forwarding (even on localhost)... | 8.5 | ADO Wiki |
| 17 | OMSAgentForLinux extension removed via Portal/CLI keeps reappearing automatic... | Security Center auto provisioning is enabled for the subscription, which auto... | Disable Auto Provisioning in Microsoft Defender for Cloud: 1) Navigate to Def... | 8.5 | ADO Wiki |
| 18 | Cloned Linux VMs with OMS Agent all have the same SourceComputerId (Agent ID)... | Cloning a VM with OMS Agent for Linux installed and configured copies the Sou... | 1) Offboard agent: sudo /opt/microsoft/omsagent/bin/omsadmin.sh -X 2) If 'No ... | 8.5 | ADO Wiki |
| 19 | OMS agent process running but no data collected and no logs output to omsagen... | OMI agent process hangs (root cause unknown). OMS agent queries OMI for perf ... | Restart OMI: 'sudo /opt/omi/bin/service_control restart'. No permanent fix pl... | 8.5 | ADO Wiki |
| 20 | Large amount of syslogs missing from workspace. High Recv-Q on port 25224. Er... | Known omsagent limitation: DNS resolution failures cause syslog messages to b... | Migrate to AMA which has planned DNS failure handling. Workaround (non-produc... | 8.5 | ADO Wiki |
| 21 | OMS agent error: 'ThreadError: can't create Thread: Resource temporarily unav... | Security limits.conf sets omsagent hard nproc too low (e.g., 75). OMS agent n... | Increase nproc in /etc/security/limits.conf: 'omsagent hard nproc 200'. | 8.5 | ADO Wiki |
| 22 | Only Heartbeat collected, Perf/Syslog missing. /var/log/cron: 'crond: (omsage... | access.conf denies all access ('- : ALL : ALL') except root/admin, blocking c... | Add rule in /etc/security/access.conf before deny-all: '+ : omsagent : ALL'. | 8.5 | ADO Wiki |
| 23 | OMS agent Ruby crashes or fails to load gems when RVM (Ruby Version Manager) ... | RVM sets GEM_HOME/GEM_PATH env vars pointing to /usr/local/rvm/gems/ which ov... | Remove RVM from PATH: 'mv /etc/profile.d/rvm.sh /etc/profile.d/rvm.sh.bak' an... | 8.5 | ADO Wiki |
| 24 | OMS agent error: 'libssl.so.1.1: cannot open shared object file - openssl.so ... | Custom OpenSSL installed in non-standard path set in system PATH. OMS Ruby lo... | Ensure system OpenSSL libraries are at standard paths or fix LD_LIBRARY_PATH.... | 8.5 | ADO Wiki |
| 25 | Fluent-bit on AMA Linux reports Too many open files error in debug log (errno... | Root user open file descriptor soft limit (ulimit -Sn) is too low for the num... | 1) Check current open files count: lsof -u root / wc -l. 2) Check current lim... | 8.5 | ADO Wiki |
| 26 | CT&I v2 Linux extension uninstall fails with error 'Driver’s ServiceManager c... | The cxp.service removal is blocked by the OS, possibly due to service depende... | 1) Check detailed error message after the ServiceManager error for clues 2) F... | 8.5 | ADO Wiki |
| 27 | CT&I v2 Linux extension uninstall fails with error 'Driver’s PacakageManager ... | The change-tracking-retail package removal is blocked by the OS package manag... | 1) Check detailed error message after the PacakageManager error for clues 2) ... | 8.5 | ADO Wiki |
| 28 | CT&I v2 Linux extension install fails with 'Package to be installed not found... | Corrupted extension package - no agent package found under /var/lib/waagent/M... | Uninstall and reinstall the CT&I extension from Azure Portal. VM Agent will r... | 8.5 | ADO Wiki |
| 29 | CT&I v2 Linux extension install fails with 'Driver’s PackageManager could not... | Linux PackageManager (rpm/dpkg) failed to install the change-tracking-retail ... | 1) Try manually installing the package per How To: Manually Onboard CT&I Linu... | 8.5 | ADO Wiki |
| 30 | CT&I v2 Linux extension install fails with 'Driver’s ServiceManager could not... | Linux systemd failed to install cxp.service, possibly due to existing corrupt... | 1) Try manually installing the service per How To: Manually Onboard CT&I Linu... | 8.5 | ADO Wiki |
| 31 | CT&I v2 Linux cxp.service shows failed status after successful extension inst... | cxp.service crashed or failed to start after installation, possibly due to co... | 1) Try manually restarting per How To: Manually Restart CT&I Linux Agent 2) I... | 8.5 | ADO Wiki |
| 32 | Service or Resource Health events not appearing in Activity Logs at all, desp... | Health event was not emitted by the service team due to monitoring agent issu... | 1) Verify event existence via Azure Support Center Activity Log view 2) Check... | 8.5 | ADO Wiki |
| 33 | AMA Linux extension stuck in Failed or Transitioning state; cannot uninstall ... | Extension processes not properly stopping during uninstall; various causes in... | 1. Stop all AMA processes: mdsd, mdsdmgr, telegraf, metrics-extension, fluent... | 7.5 | ADO Wiki |
| 34 | CT&I V2 Linux: Customer application conflicts with Change Tracking extension ... | Change Tracking extension uses port 18080 by default (configured in applicati... | Modify the CT extension port: 1) cd /var/lib/waagent/Microsoft.Azure.ChangeTr... | 7.5 | ADO Wiki |
| 35 | Linux agent heartbeats missing — SSL connection errors | Problems with VM SSL setup: invalid root CA certificates or broken SSL connec... | Download Ruby SSL test script (`wget https://raw.githubusercontent.com/ruby/o... | 6.5 | MS Learn |
| 36 | Linux agent generates heartbeats but 'failed to flush the buffer' / 'Net::Ope... | Network connectivity issues preventing heartbeat transmission to *.ods.opinsi... | Run `/opt/microsoft/omsagent/bin/troubleshooter` option 2; verify endpoint co... | 6.5 | MS Learn |
| 37 | No Linux heartbeats in workspace — KQL query `Heartbeat / where OSType == 'Li... | General Log Analytics ingestion issues or Azure service outage affecting the ... | Check Azure service health for outage notifications; verify ingestion latency... | 6.5 | MS Learn |
| 38 | Linux performance counters missing in Log Analytics workspace despite heartbe... | Agent not receiving current workspace configuration for performance counter c... | Force config pull: `sudo -u omsagent python /opt/microsoft/omsconfig/Scripts/... | 6.5 | MS Learn |
| 39 | Surface Hub devices fail to communicate with Log Analytics. Operations Manage... | Unknown root cause. The digital signature verification failure prevents the M... | Collect Surface Hub logs (Settings > Update and Security > Recovery > Collect... | 6.0 | ADO Wiki |
| 40 | OMS Agent for Linux fails to install or connect when using OpenSSL 1.1.0 on n... | OpenSSL 1.1.0 is only supported on x86_x64 platforms (64-bit). OpenSSL versio... | Verify the Linux system uses a supported OpenSSL version (1.x or later). If u... | 6.0 | ADO Wiki |
| 41 | OMS Linux Agent fails to connect through a proxy server that does not require... | The Linux agent implementation requires proxy credentials to be configured ev... | Configure a pseudo/dummy username and password (any arbitrary values) in the ... | 6.0 | ADO Wiki |
| 42 | OMS Linux Agent proxy connection fails with a proxy connection error when the... | Special characters in the proxy password (e.g., '@') are parsed incorrectly b... | URL-encode the proxy password before configuring it. For example, encode '@' ... | 6.0 | ADO Wiki |
| 43 | Azure Monitor Agent (AMA) on hardened Linux systems fails to function properl... | Hardened Linux systems restrict default directory permissions. AMA requires t... | Set required directory permissions: /etc/opt/microsoft/azuremonitoragent (751... | 6.0 | ADO Wiki |
| 44 | Microsoft Monitoring Agent (MMA) or Windows Telemetry client fails to upload ... | Customer's proxy or firewall is performing SSL/HTTPS inspection, intercepting... | Configure the proxy/firewall to bypass SSL inspection for all Microsoft monit... | 6.0 | ADO Wiki |
| 45 | AMA Linux extension stuck in transitioning state and cannot be reinstalled th... | Residual or corrupted AMA agent components, cached configurations, or metadat... | Perform a complete AMA purge: (1) Stop all azuremonitoragent services (azurem... | 6.0 | ADO Wiki |
| 46 | AMA Linux mdsd.warn shows 'Throttling ingestion for <facility>.<severity>' an... | Incoming syslog event rate exceeds the mdsd LocalSink burst limit of 20000 EP... | Throttling alone does not imply data loss due to upstream buffering (TCP/UDP ... | 6.0 | ADO Wiki |
| 47 | AMA Linux mdsd.warn shows '[GC] Disk usage exceeds disk quota' and '[GC] Drop... | Agent's local cache files exceed the MaxDiskQuotaInMB limit (default 10 GB). ... | Increase MaxDiskQuotaInMB via agent configuration parameter (see 'Supported P... | 6.0 | ADO Wiki |
| 48 | TLS/SSL handshake failure when Azure Monitor Agent (AMA) or other Windows ser... | Required TLS cipher suites not present in the client's offered cipher suite l... | 1) Check configured cipher suites: Get-TlsCipherSuite or inspect registry key... | 6.0 | ADO Wiki |
| 49 | Azure Monitor Agent (AMA) Windows extension stuck in transitioning state and ... | Residual AMA components (running processes, plugin folders, registry keys) fr... | Perform full AMA purge (last resort): 1) Remove AMA extension from VM via Azu... | 6.0 | ADO Wiki |
| 50 | Azure Monitor Agent (AMA) fails normal operations on Azure VM; AMA incorrectl... | Azure Arc Connected Machine Agent (azcmagent) installed on an Azure VM create... | 1) Remove all Arc extensions first. 2) Uninstall Arc agent per docs: https://... | 6.0 | ADO Wiki |
