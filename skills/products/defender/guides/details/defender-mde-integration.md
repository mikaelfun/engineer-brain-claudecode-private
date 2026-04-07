# DEFENDER MDE 集成 (Defender for Endpoint) — Comprehensive Troubleshooting Guide

**Entries**: 77 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-mde-test-alert.md, ado-wiki-e-get-mde-investigation-package-playbook.md, ado-wiki-e-isolate-endpoint-mde-playbook.md, mslearn-mde-security-config-mgmt-enrollment.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Macos
> Sources: mslearn

**1. MDE on macOS/Linux: mdatp connectivity test fails with curl error 35 or 60 - certificate pinning rejection, device cannot communicate with Defender cloud services**

- **Root Cause**: SSL/HTTPS inspection or intercepting proxy is stripping/replacing certificates on traffic to Defender endpoints. Authenticated proxies are also not supported.
- **Solution**: Configure an SSL inspection exception for Defender for Endpoint URLs (*.cp.wd.microsoft.com, winatp-gw-*.microsoft.com, *.events.data.microsoft.com). Ensure only PAC/WPAD/static proxy is used. Verify with: curl https://x.cp.wd.microsoft.com/api/report
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE macOS installation fails with An error occurred during installation - install.log shows ERROR Downgrade from X to Y is not permitted**

- **Root Cause**: Version downgrade between MDE macOS versions is not supported
- **Solution**: Check /Library/Logs/Microsoft/mdatp/install.log for the error. Install equal or newer version, or fully uninstall current version before installing older one.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. macOS: Tamper protection reported as disabled in mdatp health output despite being enabled via MDM or portal**

- **Root Cause**: Configuration source mismatch - MDE Attach and MDM Config Profile are mutually exclusive. Or feature_enabled_protection is false (unlicensed device).
- **Solution**: Run mdatp health --details tamper_protection. Check configuration_source matches config method. If MDE Attach used, all MDM profile settings ignored (check managed_by field). Verify feature_enabled_protection=true. Fix config source accordingly.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. macOS: Microsoft Defender configuration settings from MDM profile not applied when MDE Attach is also enabled**

- **Root Cause**: MDE Attach and MDM Configuration Profile are mutually exclusive on macOS. When both are configured, only MDE Attach settings are used and ALL MDM settings are silently ignored
- **Solution**: Run mdatp health --field managed_by to check: MDE = MDE Attach active (MDM ignored), MEM = MDM profile or local config. Use only ONE configuration method. Check /Library/Preferences/com.microsoft.mdeattach.plist for MDE Attach or /Library/Managed Preferences/com.microsoft.wdav.plist for MDM
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. macOS: Microsoft Defender settings are randomly applied or partially ignored when multiple MDM configuration profiles target the same com.microsoft.wdav identifier**

- **Root Cause**: macOS can only properly merge top-level settings from MDM profiles. Having more than one configuration profile for com.microsoft.wdav causes macOS to randomly pick one profile and ignore the rest for nested settings like antivirusEngine
- **Solution**: Consolidate all com.microsoft.wdav settings into a single MDM configuration profile. Use com.microsoft.wdav.ext as a second profile only for additional settings. Never have more than one profile per identifier
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. macOS: Microsoft Defender settings configured in MDM plist are completely ignored despite the plist file being present at /Library/Managed Preferences/**

- **Root Cause**: The plist has incorrect structure - settings wrapped inside Forced > mcx_preference_settings keys instead of being at the top level. Microsoft Defender only reads settings at the top level of the plist
- **Solution**: Verify plist structure with plutil -p /Library/Managed Preferences/com.microsoft.wdav.plist. Settings like antivirusEngine must be at the top level, not nested inside Forced or mcx_preference_settings. Reconfigure MDM profile to output correct plist structure
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. macOS: Microsoft Defender for Endpoint shows No license found error after Intune deployment**

- **Root Cause**: Onboarding has not completed - the onboarding package (WindowsDefenderATPOnboarding.xml) and/or the MDE application deployment steps were not fully completed via Intune
- **Solution**: Ensure the onboarding configuration profile (WindowsDefenderATPOnboarding.xml) is deployed to the device and the Microsoft Defender app is installed via Intune. Verify both show as installed in System Settings > General > Device Management
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**8. macOS: Network connectivity issues after deploying Microsoft Defender for Endpoint via Intune with multiple Network Filter mobileconfig profiles**

- **Root Cause**: Only one .mobileconfig plist for Network Filter is supported on macOS. Deploying multiple Network Filter profiles leads to network connectivity issues (not specific to MDE)
- **Solution**: Ensure only ONE netfilter.mobileconfig profile is deployed. Remove any duplicate Network Filter configuration profiles from Intune. Check System Settings > General > Device Management for duplicate profiles
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**9. macOS Ventura (13+): Microsoft Defender for Endpoint daemon cannot run in background, protection is not active**

- **Root Cause**: macOS 13 Ventura introduced privacy enhancements requiring explicit consent for applications to run background services. Without the background_services.mobileconfig profile, MDE daemon is blocked
- **Solution**: Deploy the background_services.mobileconfig profile via Intune or MDM from GitHub mdatp-xplat repo. If MDE was deployed before macOS 13, update deployment to include this profile
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**10. MDE macOS installation leaves no trace in /Library/Logs/Microsoft/mdatp/install.log - log file missing or not updated**

- **Root Cause**: In rare cases the MDATP installer does not write to its own log file, commonly in MDM deployments
- **Solution**: Query macOS system logs with narrow time window: log show --start ... --end ... --predicate processImagePath CONTAINS install. Also check /var/log/install.log.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 2: Linux
> Sources: mslearn

**1. MDE Linux installation fails with missing dependency errors - mdatp RPM requires glibc >= 2.17; DEBIAN requires libc6 >= 2.23; older versions also need mde-netfilter and pcre/libpcre3**

- **Root Cause**: Package manager cannot resolve prerequisite dependencies for the mdatp package on the target Linux distribution
- **Solution**: Manually download and install prerequisite dependencies. Verify correct package variant matches host distribution (e.g., mdatp-rhel8 for RHEL/CentOS 8.x, mdatp.Linux.x86_64.deb for Debian/Ubuntu). For versions >= 101.25042.0003, uuid-runtime is no longer required.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE Linux mdatp service not running after installation - id mdatp returns no output, service fails to start**

- **Root Cause**: The mdatp system user account was not created during installation
- **Solution**: Create the mdatp user manually: sudo useradd --system --no-create-home --user-group --shell /usr/sbin/nologin mdatp, then restart the service
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. MDE Linux mdatp.service not found when trying to start/restart the service**

- **Root Cause**: The systemd service unit file is missing from the expected system path
- **Solution**: Copy the service file: sudo cp /opt/microsoft/mdatp/conf/mdatp.service to /lib/systemd/system (Ubuntu/Debian) or /usr/lib/systemd/system (RHEL/CentOS/SLES), then restart
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. MDE Linux mdatp service fails to start on systems with SELinux in enforcing mode**

- **Root Cause**: SELinux enforcing mode blocks mdatp daemon processes from executing
- **Solution**: Temporarily set SELinux to permissive (SELINUX=permissive in /etc/selinux/config then reboot) to verify. Revert after testing.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. MDE Linux EICAR test file detection does not work even though Defender service is running**

- **Root Cause**: The test file is on an unsupported file system type. On-access scanning only works on specific supported file systems.
- **Solution**: Check file system type: findmnt -T <path>. Move test file to a supported file system per MDE Linux prerequisites.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. MDE Linux mdatp CLI command returns command not found**

- **Root Cause**: The symlink from /usr/bin/mdatp to wdavdaemonclient binary is missing
- **Solution**: Create symlink: sudo ln -sf /opt/microsoft/mdatp/sbin/wdavdaemonclient /usr/bin/mdatp
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. MDE auto-deployment fails on Linux with fanotify services**

- **Root Cause**: Services using fanotify interfere with automatic MDE sensor deployment
- **Solution**: Manually install MDE sensor; verify with mdatp health; check MDE.Linux extension
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Mde Linux
> Sources: mslearn

**1. MDE Linux kernel hang during upgrade from mdatp 101.75.43 or 101.78.13 to newer versions**

- **Root Cause**: System hang due to blocked tasks in fanotify code (Red Hat known issue); upgrade process triggers kernel deadlock
- **Solution**: Uninstall old mdatp first (sudo apt purge mdatp && sudo apt-get install mdatp), or disable RTP and mdatp before upgrade (sudo mdatp config real-time-protection --value=disabled && sudo systemctl disable mdatp)
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE Linux eBPF mode on RHEL 8.1 with SAP causes kernel panic**

- **Root Cause**: eBPF supplementary subsystem incompatible with specific RHEL 8.1 + SAP kernel configuration
- **Solution**: Use distro version higher than RHEL 8.1, or switch to AuditD mode instead of eBPF
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. MDE Linux eBPF mode on Oracle Linux 8.8 kernel 5.15.0-0.30.20 causes kernel panic**

- **Root Cause**: Specific Oracle Linux UEK kernel versions 5.15.0-0.30.20.el8uek.x86_64 incompatible with eBPF subsystem
- **Solution**: Use higher or lower kernel version on Oracle Linux 8.8 (min RHCK 3.10.0, min UEK 5.4), or switch to AuditD mode
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. MDE Linux eBPF immutable AuditD mode: mdatp audit rules not cleared after switching to eBPF**

- **Root Cause**: AuditD immutable mode freezes rules file; reboot required but rules persist in /etc/audit/rules.d/mdatp.rules
- **Solution**: Switch to eBPF mode; remove /etc/audit/rules.d/mdatp.rules; reboot; verify with sudo auditctl -l
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. MDE Linux installation: wrong package selected for distro causing installation failure**

- **Root Cause**: Wrong mdatp package variant installed (e.g., mdatp-rhel8 on CentOS 7, or .rpm on Debian/Ubuntu)
- **Solution**: Match package to distro: mdatp-rhel8 for RHEL/CentOS 8.x, mdatp.rpm for 7.x, mdatp-sles12/15 for SLES, mdatp.deb for Debian/Ubuntu
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 4: Fim
> Sources: ado-wiki

**1. Duplicate FIM events appearing from both agent-based (MDE) and agentless sources on the same machine**

- **Root Cause**: Known issue: when both MDE-based FIM and agentless FIM are enabled, events are generated by both detection engines, causing duplication.
- **Solution**: Known limitation. To distinguish: agentless events have InitProcVersionInfoProductName=AgentlessFIM. Microsoft plans to provide an aggregation query. No workaround except disabling one detection type.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer enabled FIM over MDE but cannot see any events in Log Analytics workspace**

- **Root Cause**: Multiple causes: (1) MDE agent not healthy/installed. (2) Tenant ConnectToAsc=false. (3) MDC config not applied on VM. (4) GCC M environment not supported. (5) MDE client version too old (requires Windows 10.8760+, Linux 30.124082+).
- **Solution**: 1) Check MDE agent health and extension. 2) Validate ConnectToAsc=true via Kusto TenantsV2. 3) Validate MDC config on VM via HeartbeatLog/ConfigurationLog (should contain mdc in name). 4) Verify not GCC M. 5) Validate MDE events via wcdprod TelemetryLog with FIM RuleId filters. 6) If no events, open collab with MDE Team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer has some FIM MDE events but cannot see all changes in the MDC portal UI dashboard**

- **Root Cause**: The MDC portal UI only displays changes from the past 7 days. Changes older than 7 days will not appear even if they exist in Log Analytics.
- **Solution**: Run Log Analytics query on MDCFileIntegrityMonitoringEvents to verify changes exist. If in LA but not portal, 7-day UI limit applies (by design). If not in LA either, check MDE agent health.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer changed FIM MDE configurations but cannot see any new change events after waiting**

- **Root Cause**: FIM config changes have 15-minute SLA. If events still missing after 2+ hours, may be MDC-side processing issue. Requires minimum MDE client versions: Windows 10.8760, Linux 30.124082.
- **Solution**: 1) Wait 15 min for config. 2) After 2h, test: create file under configured path, rename and rename back, check events within 15 min. 3) If still no events, query mdcprd Guardians.Log for mdeeventsprocessorsystem-mepapp-service with MDE machine ID. 4) Verify MDE client version.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Network Protection
> Sources: mslearn

**1. Network protection causes slow network connections to Domain Controllers and Exchange servers with Event ID 5783 NETLOGON errors**

- **Root Cause**: Network protection protocol parsing components interfere with DC/Exchange traffic
- **Solution**: Switch NP to audit/disabled to confirm. Systematically disable: Datagram Processing, NP Perf Telemetry, FTP/SSH/RDP/HTTP/SMTP/DNS-TCP/DNS/Inbound/TLS parsing to isolate.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Network protection clients unable to reach cloud service - connectivity issues**

- **Root Cause**: Network protection cannot detect OS proxy settings in certain environments
- **Solution**: Configure static proxy: Set-MpPreference -ProxyServer <IP:Port> or Set-MpPreference -ProxyPacUrl <PAC url>. Configurable via PowerShell, ConfigMgr, or GPO.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Legitimate domain/website blocked by MDE Network Protection, users unable to access it**

- **Root Cause**: Network Protection classifying the domain as malicious or covered by web content filtering policy
- **Solution**: Enable troubleshooting mode. Disable Network Protection (Set-MpPreference -EnableNetworkProtection Disabled). Verify domain accessible. Create custom allow indicator for the domain/URL in MDE portal.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 6: Xdr Pipeline
> Sources: ado-wiki

**1. Customer XDR (MDE) data is missing from Log Analytics workspace or data availability is incorrect in LA workspace or Data Lake after enabling XDR connector in Sentinel USX**

- **Root Cause**: Two XDR pipelines exist in production: old legacy shoebox-based (DevDataPlatform team) and new GigLA pipeline (Sentinel XDR Ingestion Pipeline team). Customer may be on wrong pipeline, XDR connector not deployed correctly, or LA workspace not in active state
- **Solution**: Check old pipeline: query azureinsights OdsTelemetry with serviceIdentity TENANT_MICROSOFT.WINDOWSDEFENDERATP. Check new GigLA: query SecurityInsightsProd Span serviceName giglaingestion-queueconsumer. If not in either, XDR connector not setup correctly. Check workspace status via MetadataUpdater telemetry. If on old pipeline redirect to DevDataPlatform
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Duplicated XDR data appearing in customer Log Analytics workspace - same MDE events showing up multiple times**

- **Root Cause**: Customer may have both old shoebox-based and new GigLA XDR pipelines active simultaneously causing duplicate data ingestion
- **Solution**: Determine which pipelines are active by running both old (OdsTelemetry) and new (giglaingestion-queueconsumer) queries. If in both pipelines the old one should be disabled. Before CRI include: main source of problem, regression vs new setup, Lake vs SIEM-only, XDR connector status, selected tables, retention settings
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 7: Defender For Endpoint
> Sources: mslearn

**1. Device Control on macOS does not restrict Android devices connected via File Transfer, USB Tethering, or MIDI modes - only PTP mode is restricted**

- **Root Cause**: Known limitation: Device Control on macOS restricts Android devices connected using PTP mode only. Other connection modes (File Transfer, USB Tethering, MIDI) are not controlled.
- **Solution**: This is a known limitation. For complete Android device control, consider additional MDM/DLP policies. Also note: Device Control on macOS does not prevent software developed on XCode from being transferred to an external device.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. USB device not blocked by MDE device control policy on Windows despite policy being configured - device is a USB device but can still be accessed**

- **Root Cause**: Not all USB devices are removable media devices in Windows. Device must create a disk drive (e.g., E:) to be considered removable media. Also, some physical devices create multiple entries in Device Manager and ALL entries need access controlled.
- **Solution**: Verify the USB device is classified as a removable media device (creates a disk drive in Windows). If the device creates multiple entries in Device Manager, ensure policy covers ALL entries. Consider using device installation restrictions (blocks any device in Device Manager) instead of removable media device control for broader coverage.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 8: Direct Onboarding
> Sources: ado-wiki

**1. Direct Onboarding enablement fails: "The extension [MdeDesignatedSubscription] is already enabled on subscription [X], extension is allowed only on a single subscription per tenant"**

- **Root Cause**: MDE Direct Onboarding allows only one designated subscription per tenant. The MdeDesignatedSubscription extension was already enabled on another subscription.
- **Solution**: Disable MdeDesignatedSubscription on the existing subscription first, then enable on the new one. If "Another update operation is in progress" persists, contact the Pricing team.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. After switching from Azure Arc to MDE Direct Onboarding, machines do not appear in MDC inventory but customer is still billed**

- **Root Cause**: When Azure Arc agent is removed, MDE retains Arc-specific registry tag AzureResourceId at HKLM\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection\DeviceTagging. Machine is misidentified as Azure VM instead of directly onboarded (Arcless) device.
- **Solution**: Migration procedure: 1) Remove MDE.Windows extension from Azure Portal 2) Run azcmagent disconnect 3) Set AzureResourceId registry key to empty string: REG ADD "HKLM\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection\DeviceTagging" /v AzureResourceId /t REG_SZ /d "" /f 4) Re-onboard machine to MDE via security.microsoft.com 5) Enable Direct Onboarding in MDC portal 6) Wait up to 24h. Bug fix in MDE agent July 2025 (PR 13276756) may auto-correct some machines.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 9: Extension
> Sources: ado-wiki

**1. MDE.Windows extension installation fails: "Failed to set crypt provider context while trying to create self-signed certificate". Error in C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Azur**

- **Root Cause**: CNG Key Isolation (KeyIso) service is disabled or stopped. Extension service uses Windows CNG APIs to create self-signed certificate for encrypting extension settings. When CNG service is disabled, certificate creation fails.
- **Solution**: Enable and start CNG Key Isolation service: Get-Service -Name KeyIso; Set-Service -Name KeyIso -StartupType Automatic; Start-Service -Name KeyIso. Also available via services.msc UI. Ref IcM 624986416.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. MDE.Windows extension stuck on Creating status and never succeeds on Azure Arc machines. Error: Failed to download extension - Assignment package size exceeds the download limit (209715200 MB).**

- **Root Cause**: Azure Connected Machine Agent version 1.44 or earlier has 200MB download size limit. April 2025 MDE extension package exceeded this limit. Limitation was increased to 1GB in version 1.44 (July 2024 release).
- **Solution**: Upgrade Azure Connected Machine Agent to latest version (>= 1.44). See https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-release-notes. If issue persists after upgrade, engage Monitoring team via SAP: Azure/Azure Arc enabled servers/Azure features and services/Azure Policy Guest Configuration.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 10: Suppression Rule
> Sources: ado-wiki

**1. MDE alert suppression rule with wildcard path (e.g., E:\\folder\\**) not suppressing matching alerts despite rule being active in M365D portal (security.microsoft.com)**

- **Root Cause**: MDE wildcard * matches only one path segment. Double wildcards (**) at path end do not perform recursive descent. Predicate matching evaluates against detection entity values (FolderPath, Equals operator), not raw file path -- deeply nested paths may not match.
- **Solution**: 1) Use single * at end to match one level. 2) Verify rule via Kusto: cluster('wcdscrubbeduks.uksouth.kusto.windows.net').database('scrubbeddata').MtpSuppressionRules | where OrgId=='<org_id>' -- check predicates/operator/value. 3) Check alert entity values via AlertEvents join DetectionReports. 4) Create separate rules per path level or use Contains operator if needed. 5) Escalate to MDE product team (Cortex.Detection) if code fix required.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. Newly created MDE alert suppression rule takes 2-18 hours before suppressing matching alerts -- alerts continue to appear as active/new after rule creation**

- **Root Cause**: By design: MDE waits for related detections to be merged into a single alert before finalizing it. Suppression rules are evaluated at alert finalization (not at detection level). The merging window can be 2-18 hours depending on alert type.
- **Solution**: Expected behavior -- no fix required. Inform customer suppression takes effect after the merging window closes (2-18 hours by design). The alert will be suppressed automatically once finalization occurs. Related IcMs: 728508604, 713717602 confirm this is by-design.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 11: Portal
> Sources: mslearn

**1. MDE portal shows 'Access is denied due to invalid credentials' server error when accessing Microsoft Defender XDR**

- **Root Cause**: Browser cookie settings are blocking the Defender portal from maintaining the authenticated session
- **Solution**: Configure the browser to allow cookies for *.security.microsoft.com; clear browser cache and retry
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE portal elements or data missing on Microsoft Defender XDR dashboard**

- **Root Cause**: Network proxy is blocking connections to *.security.microsoft.com endpoints required by the portal
- **Solution**: Add *.security.microsoft.com to proxy allow list using HTTPS protocol; verify endpoints are reachable
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 12: Device Discovery
> Sources: mslearn

**1. MDE authenticated network scanner configured but scans are not running**

- **Root Cause**: Organization enforces FIPS compliant algorithms policy; authenticated scanner uses non-FIPS encryption algorithm
- **Solution**: Set registry HKLM\SYSTEM\CurrentControlSet\Control\Lsa\FipsAlgorithmPolicy DWORD Enabled to 0x0 on scanner devices
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE network devices not shown in device inventory after authenticated scan completed**

- **Root Cause**: MdatpNetworkScanService service not running on scanning device; or scan results still pending
- **Solution**: Verify MdatpNetworkScanService is running; perform Run scan in config; if no results after 5 min restart the service
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 13: Performance
> Sources: mslearn

**1. High CPU usage caused by MsMpEng.exe during scheduled antivirus scan on Windows**

- **Root Cause**: Scheduled scan scanning files/folders/processes that cause high I/O; no exclusions configured for known-heavy workloads
- **Solution**: Use Task Manager to confirm MsMpEng.exe is the cause. Run Process Monitor during CPU spike for ~5 min. Enable troubleshooting mode, add exclusions: Set-MpPreference -ExclusionPath, -ExclusionExtension, or -ExclusionProcess based on ProcMon findings.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Application takes significantly longer to perform basic tasks (slow performance) when Defender real-time protection is enabled**

- **Root Cause**: Real-time protection file scanning overhead causing latency on I/O-intensive application operations
- **Solution**: Enable troubleshooting mode. Disable tamper protection first. Then disable real-time protection. Verify if application performance improves. If so, identify specific files/processes to exclude permanently.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 14: Tamper Protection
> Sources: mslearn

**1. Changes to Microsoft Defender Antivirus settings via Group Policy are silently ignored - settings do not take effect**

- **Root Cause**: Tamper protection is enabled and blocks changes to tamper-protected Defender AV settings made through Group Policy
- **Solution**: Use troubleshooting mode to temporarily disable tamper protection and apply changes. Or use Intune/Configuration Manager to manage AV settings (not blocked by tamper protection). Or exclude specific devices from tamper protection.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Microsoft Defender AV exclusions are not tamper-protected despite meeting all requirements (TPExclusions registry value is 0)**

- **Root Cause**: Prerequisites not met: platform below 4.18.2211.5, DisableLocalAdminMerge not enabled, device not managed solely by Intune (ManagedDefenderProductType != 6), or exclusions not managed through Intune
- **Solution**: Verify: (1) Defender platform >= 4.18.2211.5, (2) DisableLocalAdminMerge enabled, (3) ManagedDefenderProductType = 6 (Intune only; value 7 = co-managed = not protected), (4) TPExclusions = 1 under HKLM Features. Do NOT manually change registry values.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 15: Live Response
> Sources: mslearn

**1. Defender for Endpoint live response session: file cannot be accessed, error message when trying to take action on a file**

- **Root Cause**: File is locked or in use by another process on the target device, preventing live response from accessing it directly
- **Solution**: Create a PS1 script that copies the target file to env:TEMP using Copy-Item; upload the script to live response library; run the script with the file path as parameter; perform the desired action on the copied file in TEMP folder
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for Endpoint live response sessions are slow or experience delays during initial connections**

- **Root Cause**: WpnService (Windows Push Notifications System Service) is disabled, or WNS cloud connectivity is blocked via Group Policy or MDM setting (Turn off notifications network usage set to 1)
- **Solution**: Ensure WpnService is enabled and running; verify Turn off notifications network usage GPO/MDM is NOT set to 1; allow WNS traffic through enterprise firewall and proxy per Microsoft documentation
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 16: Mdav
> Sources: mslearn

**1. Microsoft Defender Antivirus will not start after migrating from a non-Microsoft antivirus product**

- **Root Cause**: Policy conflict between multiple management tools (GPO, Intune MDM, SCCM, MDE Attach) configuring MDAV simultaneously with conflicting settings
- **Solution**: Follow 4-step troubleshooting: 1) Understand precedence order (MDE Attach > GPO > SCCM co-mgmt > SCCM standalone > Intune MDM > SCCM tenant attach > PowerShell/WMI); 2) Check registry locations (HKLM\SOFTWARE\Policies\Microsoft\Windows Defender for policy, Policy Manager subkey for MDM, HKLM\SOFTWARE\Microsoft\Windows Defender for local); 3) Run GpResult.exe /h or mdmdiagnosticstool.exe to identify sources; 4) Remove conflicting policies
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. After Feb 2026 platform update (4.18.25110.6+), antivirus exclusion values cannot be read from local device registry when MDE configuration management is enabled**

- **Root Cause**: Microsoft changed how AV settings (like exclusions) are stored - organizations using MDE config management can no longer read exclusion values directly from local registry
- **Solution**: Use supported Microsoft Defender PowerShell cmdlets (such as Get-MpPreference) to retrieve setting configuration instead of reading registry directly
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 17: Mde Macos
> Sources: mslearn

**1. MDE macOS high CPU from wdavdaemon_unprivileged process causing system performance degradation**

- **Root Cause**: Applications or system processes accessing many resources trigger excessive real-time protection file scanning
- **Solution**: Use mdatp diagnostic real-time-protection-statistics --output json with high_cpu_parser.py to identify top scanning processes; add exclusions for high-scan-count processes
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. MDE macOS troubleshooting mode cannot be enabled - mdatp config commands fail or return null results**

- **Root Cause**: App version below 101.23122.0005; device not enrolled/active; tamper protection in block mode prevents config changes
- **Solution**: Verify app version >= 101.23122.0005; check mdatp health edr_machine_id and connectivity; for tamper protection block mode use troubleshooting mode; validate plist profiles
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 18: Mde Integration
> Sources: ado-wiki

**1. MDE integration breaks after moving subscription/workspace to another tenant. AssignOmsWorkspaceAsync fails: Workspace already assigned to another WDATP tenant.**

- **Root Cause**: Subscription moved to new tenant without MDE offboarding. Old tenant holds workspace/subscription assignment.
- **Solution**: 6-step: 1) Uninstall MDE extensions, 2) Offboard VMs from MDE, 3) Move subscription, 4) Re-enable MDC Servers plan, 5) MDE support clears old tenant, 6) Re-onboard servers.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — ADO Wiki]`

**2. MDE extension fails to provision on Azure ARC machines behind proxy in brownfield deployment.**

- **Root Cause**: ARC agent proxy settings not configured for MDE extension in brownfield deployments.
- **Solution**: Configure ARC agent proxy, remove MDE extension (UI or PowerShell at scale), MDE re-provisions within hours. Greenfield: install ARC agent with Proxy connectivity method.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — ADO Wiki]`

### Phase 19: Agentless
> Sources: ado-wiki

**1. Agentless VA scan result processing fails at GetNdrTenantInfoAsync step - MDE Org ID is 00000000-0000-0000-0000-000000000000**

- **Root Cause**: The MDE (Microsoft Defender for Endpoint) license has not been created yet (takes up to 24 hours after enabling Defender for Servers P2 or CSPM plan), or there was an error during MDE license provisioning. Without a valid MDE Org ID, agentless VA results cannot be injected into MDE.
- **Solution**: Wait 24 hours after enabling Defender for Servers P2 or CSPM plan for MDE license to be auto-provisioned. Verify MDE license status in Microsoft 365 Defender portal. If MDE Org ID is still all zeros after 24h, escalate to PG to investigate license creation failure. Use Kusto query on Romelogs/Rome3Prod FabricServiceOE (vaApp) to confirm GetNdrTenantInfoAsync step failure.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

**2. Agentless scanning shows no freshness or updated results after customer removed/offboarded MDE extension from VMs**

- **Root Cause**: When a customer offboards the MDE extension, Microsoft Defender for Endpoint retains the device ID for 30 days. During this retention period, agentless scanning freshness updates are blocked because MDE still holds the stale device record.
- **Solution**: Wait 30 days for MDE to automatically remove the stale device records. For faster resolution, create an IcM to request MDE product group to expedite device removal. After device removal, agentless scanning freshness will resume on the next scan cycle (twice daily).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🟡 4.0/10 — ADO Wiki]`

### Phase 20: Edr
> Sources: ado-wiki

**1. Customer sees 'EDR configuration issues should be resolved on virtual machines' MDC recommendation on VMs that are using a non-MDE EDR solution, or EDR config recommendation appearing unexpectedly**

- **Root Cause**: The 'EDR configuration issues should be resolved on virtual machines' recommendation only applies when Microsoft Defender for Endpoint (MDE) is being used as the EDR solution on those VMs. Other EDR solutions do not trigger EDR configuration issue recommendations. MDC uses agentless scanning (requires Defender for Servers P2 or Defender CSPM) to assess EDR settings.
- **Solution**: 1) Verify which EDR solution is installed on the affected VMs via agentless scan results. 2) If the EDR solution is not MDE, the config issues recommendation should not apply - check if MDE is inadvertently also installed or partially deployed. 3) If MDE is the EDR solution, investigate MDE configuration issues on the affected VMs. 4) Confirm Defender for Servers P2 or CSPM plan is enabled as EDR agentless scanning requires this.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 21: Inventory
> Sources: ado-wiki

**1. Deleted resource still appears in MDC Asset Inventory after more than 24 hours**

- **Root Cause**: Resource may still be sending heartbeat (agent not removed), have active security recommendations, active alerts, or installed applications data (e.g., MDE agent with stale tags pointing to old ResourceId/Subscription)
- **Solution**: Step 1: Check heartbeat via Kusto (RomeLogs.Prod.HybridOmsMachineRawSecurityDataOE, filter by ResourceIdFromHeartbeat). If found -> remove LA agents or delete machine. Step 2: Check active recommendations via Resource Health blade; find assessment key via Kusto (romecore.kusto.windows.net, Prod.ServiceFabricDynamicOE). Step 3: Check active alerts. Step 4: Check installed applications - if MDE agent has stale tags, update AzureResourceId/SecurityWorkspaceId (Linux: mdatp edr tag set; Windows: registry HKLM\Software\Policies\Microsoft\Windows Advanced Threat Protection\DeviceTagging). If none found -> escalate to Rome\Defenders.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 22: Playbook
> Sources: ado-wiki

**1. Unisolate MDE Machine playbook in Microsoft Sentinel fails to release a machine from isolation in Defender for Endpoint**

- **Root Cause**: Managed identity is missing Machine.Isolate app role permission on the WindowsDefenderATP service principal (appId: fc780465-2017-40d4-a0c5-307022471b92) and/or Microsoft Sentinel Responder role
- **Solution**: Grant required permissions to the Logic App managed identity: (1) Use Get-AzureADServicePrincipal to get the MDE service principal (appId fc780465-2017-40d4-a0c5-307022471b92), (2) Assign Machine.Isolate app role via New-AzureAdServiceAppRoleAssignment, (3) Add Microsoft Sentinel Responder role to the managed identity via Azure portal (Identity blade under Settings).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 23: Mdatp
> Sources: ado-wiki

**1. MDE (Microsoft Defender for Endpoint) connector deployment via Bicep/ARM template fails with errors: InvalidLicense / Missing consent and License is invalid.**

- **Root Cause**: The consent mechanism for Sentinel to consume services from Defender for Endpoint is not available through API. Bicep/ARM automated deployment cannot complete the consent step programmatically.
- **Solution**: Manually activate the MDE connector through the Azure Portal (Sentinel > Data connectors > Microsoft Defender for Endpoint > Connect). There is no API/Bicep workaround for the consent step. Microsoft is considering adding dedicated API support for this consent flow in the future (ref: ICM 322943491).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 24: Migration
> Sources: mslearn

**1. MDAV gets uninstalled or disabled on Windows Server during migration to MDE - non-Microsoft AV prevents MDAV from running**

- **Root Cause**: Non-Microsoft AV actively blocks or removes MDAV components on Windows Server.
- **Solution**: 1) Add MDE process exclusions to non-MS AV (MsSense.exe, SenseCncProxy.exe, etc.). 2) Set MDAV to passive mode via registry: HKLM\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection, ForceDefenderPassiveMode=1. Set BEFORE onboarding.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 25: Mde.Linux
> Sources: ado-wiki

**1. MDE.Linux extension fails to install on Azure ARC-enabled RHEL 8.x due to timeout. Yum process runs at 5% CPU, semodule takes ~30min then times out.**

- **Root Cause**: Guest Configuration (GC) parent process limits child processes to 5% CPU. MDE.Linux extension calls semodule which is CPU-intensive but throttled, causing installation timeout on RHEL 8.x. Known issue IcM 439869453.
- **Solution**: Workaround: 1) cd /var/lib/GuestConfig/extension_logs/Microsoft.Azure.AzureDefenderForServers.MDE.Linux-<ver> 2) cat MdeExtensionHandlerLog.log 3) Copy the Pythonrunner command 4) cd /var/lib/waagent/Microsoft.Azure.AzureDefenderForServers.MDE.Linux-<ver> 5) Run Pythonrunner as root (bypasses CPU limit, finishes in 1-2 min).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 26: Error Code 35
> Sources: ado-wiki

**1. MDE extension installation reports error code 35 (ERR_NOT_OFFBOARDED). Script believes SENSE is running and MDE is already onboarded, but MDE is not functioning.**

- **Root Cause**: Customer or process modified HKLM:SYSTEM\CurrentControlSet\Services\Sense\start registry value, which fools the installation script into thinking MDE is already onboarded.
- **Solution**: Restore the default registry value for HKLM:SYSTEM\CurrentControlSet\Services\Sense\start. Retry MDE extension installation after restoring the value.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 27: Error Code 5
> Sources: ado-wiki

**1. MDE installation fails with error code 5 (ERR_CONFLICTING_APPS). Found conflicting apps or services that prevent MDE from installing.**

- **Root Cause**: Applications using Fanotify or other known security services (CrowdStrike, McAfee, etc.) are installed on the machine and conflict with MDE installation.
- **Solution**: Remove conflicting AV/security software (CrowdStrike, McAfee, etc.) from the machine before installing MDE. For Linux, ensure no other application is using Fanotify kernel subsystem.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 28: Error Code 13
> Sources: ado-wiki

**1. MDE installation fails with error code 13 (ERR_INSUFFICIENT_REQUIREMENTS) on Windows. Required KB not present on the machine.**

- **Root Cause**: At least one required KB update or Windows Defender Antivirus (MDAV) platform version is not present on the machine. Common on Windows Server 2012 R2 and 2016 which need updated MDAV platform for unified agent.
- **Solution**: Update Windows Defender platform to the latest version. Install all required KB updates. For Server 2016, ensure MDAV feature is installed and running.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 29: Error Code 51
> Sources: ado-wiki

**1. MDE extension provisioning fails with error code 51 (ERR_PROVISIONING_FAILED) on Linux, or Windows multi-session VDI (SKU 175) is not supported.**

- **Root Cause**: OS is not supported for MDE onboarding via Defender for Cloud. Windows client OS (workstations) and multi-session VDI (SKU 175) are NOT supported. Linux onboarding via MMA path on unsupported OS.
- **Solution**: Use proper server SKU. Multi-session VDI (SKU 175) is not supported for MDE via Defender for Cloud. For supported platforms, see Main MDE Integration TSG section 3.3.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 30: Multi Cloud
> Sources: ado-wiki

**1. Timeout during MDE.Linux extension installation on Linux Arc especially RedHat**

- **Root Cause**: Arc limits MDE.Linux to 5% CPU (extensions.agent.cpulimit) causing timeouts.
- **Solution**: Upgrade Arc agent. Increase CPU limit: sudo azcmagent config set extensions.agent.cpulimit (up to 60). Wait 12h or manual MDE provisioning.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 31: Wcf
> Sources: mslearn

**1. Web content filtering does not block/audit websites when local proxy like Fiddler is running; also fails in Application Guard**

- **Root Cause**: WCF identifies browsers by process name. Local proxy masks the process name. Application Guard isolated sessions not supported.
- **Solution**: Remove/disable local proxy for WCF to work. For third-party browsers, configure for content inspection per NP requirements.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 32: Troubleshooting Mode
> Sources: mslearn

**1. Unable to install application on Windows device - error message that Microsoft Defender Antivirus and tamper protection is blocking the installation**

- **Root Cause**: Defender real-time protection and tamper protection are both enabled, preventing the application installer from making required file/registry changes
- **Solution**: Enable MDE troubleshooting mode via Defender portal. Disable tamper protection (Set-MPPreference -DisableTamperProtection $true). Disable real-time protection (Set-MpPreference -DisableRealtimeMonitoring $true). Install application. Settings auto-revert when troubleshooting mode expires (4h max, 8h/day quota).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 33: Asr
> Sources: mslearn

**1. Microsoft Office plugin not working properly - blocked by ASR rule Block all Office applications from creating child processes**

- **Root Cause**: ASR rule D4F940AB-401B-4EFC-AADC-AD5F3C50688A is set to block mode, preventing Office from spawning child processes required by the plugin
- **Solution**: Enable troubleshooting mode. Run: Set-MpPreference -AttackSurfaceReductionRules_Ids D4F940AB-401B-4EFC-AADC-AD5F3C50688A -AttackSurfaceReductionRules_Actions Disabled. Confirm plugin works. Create permanent exclusion in ASR policy.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 34: Intune
> Sources: mslearn

**1. Devices do not appear in Microsoft Defender portal after deploying Intune EDR onboarding policy**

- **Root Cause**: Device cannot reach required Defender for Endpoint service endpoints (*.securitycenter.windows.com, *.protection.outlook.com), or the MDE service is not running on the device, or EDR policy compliance failed
- **Solution**: 1) Confirm device can reach *.securitycenter.windows.com and *.protection.outlook.com; 2) Check EDR policy compliance in Intune > Endpoint security > EDR; 3) Verify MDE service is running on device; 4) Use EDR Onboarding Status report to identify problematic devices
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 35: Api
> Sources: mslearn

**1. Microsoft Defender for Endpoint API returns 429 TooManyRequests error**

- **Root Cause**: Number of HTTP requests in a given time frame exceeds the allowed rate limit (quota) for the API, either by number of requests or by CPU
- **Solution**: 1) Implement request throttling and delay requests; 2) Use the Retry-After response header to determine wait time before next request; 3) Do not ignore the 429 or retry in shorter intervals as it will continue returning 429
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 36: Xdr
> Sources: mslearn

**1. Defender for Endpoint or XDR API returns InvalidRequestBody or MissingRequiredParameter error despite correct field values**

- **Root Cause**: Body parameters are case-sensitive. A wrong capital or lowercase letter in parameter names causes the API to reject the request or fail to recognize required fields
- **Solution**: Review the API documentation page and ensure submitted parameter names match the exact casing shown in the API reference examples. Check all property names for correct capitalization
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 37: Defender For Servers
> Sources: mslearn

**1. MDE Partial status for Linux on pre-summer-2021 subscriptions**

- **Root Cause**: Subscriptions pre-summer 2021 require manual one-time Linux MDE integration opt-in
- **Solution**: Environment settings > Fix > Linux machines > Enable; one-time action
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 38: Windows Server 2016
> Sources: mslearn

**1. MDE Partial status for Windows Server 2016/2012R2 on pre-spring-2022 subscriptions**

- **Root Cause**: Pre-spring 2022 subscriptions require manual one-time unified solution opt-in
- **Solution**: Environment settings > Fix > Unified solution > Enable; one-time action
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 39: Security Config Management
> Sources: mslearn

**1. MDE Security Config Management conflict: error code 43 - device managed by both SCCM and MDE**

- **Root Cause**: Device managed by both Configuration Manager and MDE; dual control plane causes policy conflicts
- **Solution**: Isolate endpoint security policies to single control plane; disable Manage Security setting using Configuration Manager toggle
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer sees 'EDR configuration issues should be resolved on virtual machines' MDC recommendatio... | The 'EDR configuration issues should be resolved on virtual machines' recommendation only applies... | 1) Verify which EDR solution is installed on the affected VMs via agentless scan results. 2) If t... | 🟢 8.5 | ADO Wiki |
| 2 | Deleted resource still appears in MDC Asset Inventory after more than 24 hours | Resource may still be sending heartbeat (agent not removed), have active security recommendations... | Step 1: Check heartbeat via Kusto (RomeLogs.Prod.HybridOmsMachineRawSecurityDataOE, filter by Res... | 🟢 8.5 | ADO Wiki |
| 3 | Duplicate FIM events appearing from both agent-based (MDE) and agentless sources on the same machine | Known issue: when both MDE-based FIM and agentless FIM are enabled, events are generated by both ... | Known limitation. To distinguish: agentless events have InitProcVersionInfoProductName=AgentlessF... | 🟢 8.5 | ADO Wiki |
| 4 | Customer enabled FIM over MDE but cannot see any events in Log Analytics workspace | Multiple causes: (1) MDE agent not healthy/installed. (2) Tenant ConnectToAsc=false. (3) MDC conf... | 1) Check MDE agent health and extension. 2) Validate ConnectToAsc=true via Kusto TenantsV2. 3) Va... | 🟢 8.5 | ADO Wiki |
| 5 | Customer has some FIM MDE events but cannot see all changes in the MDC portal UI dashboard | The MDC portal UI only displays changes from the past 7 days. Changes older than 7 days will not ... | Run Log Analytics query on MDCFileIntegrityMonitoringEvents to verify changes exist. If in LA but... | 🟢 8.5 | ADO Wiki |
| 6 | Customer changed FIM MDE configurations but cannot see any new change events after waiting | FIM config changes have 15-minute SLA. If events still missing after 2+ hours, may be MDC-side pr... | 1) Wait 15 min for config. 2) After 2h, test: create file under configured path, rename and renam... | 🟢 8.5 | ADO Wiki |
| 7 | Unisolate MDE Machine playbook in Microsoft Sentinel fails to release a machine from isolation in... | Managed identity is missing Machine.Isolate app role permission on the WindowsDefenderATP service... | Grant required permissions to the Logic App managed identity: (1) Use Get-AzureADServicePrincipal... | 🟢 8.5 | ADO Wiki |
| 8 | MDE (Microsoft Defender for Endpoint) connector deployment via Bicep/ARM template fails with erro... | The consent mechanism for Sentinel to consume services from Defender for Endpoint is not availabl... | Manually activate the MDE connector through the Azure Portal (Sentinel > Data connectors > Micros... | 🟢 8.5 | ADO Wiki |
| 9 | Customer XDR (MDE) data is missing from Log Analytics workspace or data availability is incorrect... | Two XDR pipelines exist in production: old legacy shoebox-based (DevDataPlatform team) and new Gi... | Check old pipeline: query azureinsights OdsTelemetry with serviceIdentity TENANT_MICROSOFT.WINDOW... | 🟢 8.5 | ADO Wiki |
| 10 | Duplicated XDR data appearing in customer Log Analytics workspace - same MDE events showing up mu... | Customer may have both old shoebox-based and new GigLA XDR pipelines active simultaneously causin... | Determine which pipelines are active by running both old (OdsTelemetry) and new (giglaingestion-q... | 🔵 7.5 | ADO Wiki |
| 11 | MDAV gets uninstalled or disabled on Windows Server during migration to MDE - non-Microsoft AV pr... | Non-Microsoft AV actively blocks or removes MDAV components on Windows Server. | 1) Add MDE process exclusions to non-MS AV (MsSense.exe, SenseCncProxy.exe, etc.). 2) Set MDAV to... | 🔵 7.5 | MS Learn |
| 12 | Device Control on macOS does not restrict Android devices connected via File Transfer, USB Tether... | Known limitation: Device Control on macOS restricts Android devices connected using PTP mode only... | This is a known limitation. For complete Android device control, consider additional MDM/DLP poli... | 🔵 7.5 | MS Learn |
| 13 | USB device not blocked by MDE device control policy on Windows despite policy being configured - ... | Not all USB devices are removable media devices in Windows. Device must create a disk drive (e.g.... | Verify the USB device is classified as a removable media device (creates a disk drive in Windows)... | 🔵 7.5 | MS Learn |
| 14 ⚠️ | Direct Onboarding enablement fails: "The extension [MdeDesignatedSubscription] is already enabled... | MDE Direct Onboarding allows only one designated subscription per tenant. The MdeDesignatedSubscr... | Disable MdeDesignatedSubscription on the existing subscription first, then enable on the new one.... | 🔵 7.0 | ADO Wiki |
| 15 ⚠️ | After switching from Azure Arc to MDE Direct Onboarding, machines do not appear in MDC inventory ... | When Azure Arc agent is removed, MDE retains Arc-specific registry tag AzureResourceId at HKLM\SO... | Migration procedure: 1) Remove MDE.Windows extension from Azure Portal 2) Run azcmagent disconnec... | 🔵 7.0 | ADO Wiki |
| 16 ⚠️ | MDE.Windows extension installation fails: "Failed to set crypt provider context while trying to c... | CNG Key Isolation (KeyIso) service is disabled or stopped. Extension service uses Windows CNG API... | Enable and start CNG Key Isolation service: Get-Service -Name KeyIso; Set-Service -Name KeyIso -S... | 🔵 7.0 | ADO Wiki |
| 17 ⚠️ | MDE.Linux extension fails to install on Azure ARC-enabled RHEL 8.x due to timeout. Yum process ru... | Guest Configuration (GC) parent process limits child processes to 5% CPU. MDE.Linux extension cal... | Workaround: 1) cd /var/lib/GuestConfig/extension_logs/Microsoft.Azure.AzureDefenderForServers.MDE... | 🔵 7.0 | ADO Wiki |
| 18 ⚠️ | MDE.Windows extension stuck on Creating status and never succeeds on Azure Arc machines. Error: F... | Azure Connected Machine Agent version 1.44 or earlier has 200MB download size limit. April 2025 M... | Upgrade Azure Connected Machine Agent to latest version (>= 1.44). See https://learn.microsoft.co... | 🔵 7.0 | ADO Wiki |
| 19 ⚠️ | MDE extension installation reports error code 35 (ERR_NOT_OFFBOARDED). Script believes SENSE is r... | Customer or process modified HKLM:SYSTEM\CurrentControlSet\Services\Sense\start registry value, w... | Restore the default registry value for HKLM:SYSTEM\CurrentControlSet\Services\Sense\start. Retry ... | 🔵 7.0 | ADO Wiki |
| 20 ⚠️ | MDE installation fails with error code 5 (ERR_CONFLICTING_APPS). Found conflicting apps or servic... | Applications using Fanotify or other known security services (CrowdStrike, McAfee, etc.) are inst... | Remove conflicting AV/security software (CrowdStrike, McAfee, etc.) from the machine before insta... | 🔵 7.0 | ADO Wiki |
| 21 ⚠️ | MDE installation fails with error code 13 (ERR_INSUFFICIENT_REQUIREMENTS) on Windows. Required KB... | At least one required KB update or Windows Defender Antivirus (MDAV) platform version is not pres... | Update Windows Defender platform to the latest version. Install all required KB updates. For Serv... | 🔵 7.0 | ADO Wiki |
| 22 ⚠️ | MDE extension provisioning fails with error code 51 (ERR_PROVISIONING_FAILED) on Linux, or Window... | OS is not supported for MDE onboarding via Defender for Cloud. Windows client OS (workstations) a... | Use proper server SKU. Multi-session VDI (SKU 175) is not supported for MDE via Defender for Clou... | 🔵 7.0 | ADO Wiki |
| 23 ⚠️ | Timeout during MDE.Linux extension installation on Linux Arc especially RedHat | Arc limits MDE.Linux to 5% CPU (extensions.agent.cpulimit) causing timeouts. | Upgrade Arc agent. Increase CPU limit: sudo azcmagent config set extensions.agent.cpulimit (up to... | 🔵 7.0 | ADO Wiki |
| 24 ⚠️ | MDE alert suppression rule with wildcard path (e.g., E:\\folder\\**) not suppressing matching ale... | MDE wildcard * matches only one path segment. Double wildcards (**) at path end do not perform re... | 1) Use single * at end to match one level. 2) Verify rule via Kusto: cluster('wcdscrubbeduks.ukso... | 🔵 7.0 | ADO Wiki |
| 25 ⚠️ | Newly created MDE alert suppression rule takes 2-18 hours before suppressing matching alerts -- a... | By design: MDE waits for related detections to be merged into a single alert before finalizing it... | Expected behavior -- no fix required. Inform customer suppression takes effect after the merging ... | 🔵 7.0 | ADO Wiki |
| 26 ⚠️ | MDE portal shows 'Access is denied due to invalid credentials' server error when accessing Micros... | Browser cookie settings are blocking the Defender portal from maintaining the authenticated session | Configure the browser to allow cookies for *.security.microsoft.com; clear browser cache and retry | 🔵 6.0 | MS Learn |
| 27 ⚠️ | MDE portal elements or data missing on Microsoft Defender XDR dashboard | Network proxy is blocking connections to *.security.microsoft.com endpoints required by the portal | Add *.security.microsoft.com to proxy allow list using HTTPS protocol; verify endpoints are reach... | 🔵 6.0 | MS Learn |
| 28 ⚠️ | MDE authenticated network scanner configured but scans are not running | Organization enforces FIPS compliant algorithms policy; authenticated scanner uses non-FIPS encry... | Set registry HKLM\SYSTEM\CurrentControlSet\Control\Lsa\FipsAlgorithmPolicy DWORD Enabled to 0x0 o... | 🔵 6.0 | MS Learn |
| 29 ⚠️ | MDE network devices not shown in device inventory after authenticated scan completed | MdatpNetworkScanService service not running on scanning device; or scan results still pending | Verify MdatpNetworkScanService is running; perform Run scan in config; if no results after 5 min ... | 🔵 6.0 | MS Learn |
| 30 ⚠️ | MDE on macOS/Linux: mdatp connectivity test fails with curl error 35 or 60 - certificate pinning ... | SSL/HTTPS inspection or intercepting proxy is stripping/replacing certificates on traffic to Defe... | Configure an SSL inspection exception for Defender for Endpoint URLs (*.cp.wd.microsoft.com, wina... | 🔵 6.0 | MS Learn |
| 31 ⚠️ | MDE Linux installation fails with missing dependency errors - mdatp RPM requires glibc >= 2.17; D... | Package manager cannot resolve prerequisite dependencies for the mdatp package on the target Linu... | Manually download and install prerequisite dependencies. Verify correct package variant matches h... | 🔵 6.0 | MS Learn |
| 32 ⚠️ | MDE Linux mdatp service not running after installation - id mdatp returns no output, service fail... | The mdatp system user account was not created during installation | Create the mdatp user manually: sudo useradd --system --no-create-home --user-group --shell /usr/... | 🔵 6.0 | MS Learn |
| 33 ⚠️ | MDE Linux mdatp.service not found when trying to start/restart the service | The systemd service unit file is missing from the expected system path | Copy the service file: sudo cp /opt/microsoft/mdatp/conf/mdatp.service to /lib/systemd/system (Ub... | 🔵 6.0 | MS Learn |
| 34 ⚠️ | MDE Linux mdatp service fails to start on systems with SELinux in enforcing mode | SELinux enforcing mode blocks mdatp daemon processes from executing | Temporarily set SELinux to permissive (SELINUX=permissive in /etc/selinux/config then reboot) to ... | 🔵 6.0 | MS Learn |
| 35 ⚠️ | MDE Linux EICAR test file detection does not work even though Defender service is running | The test file is on an unsupported file system type. On-access scanning only works on specific su... | Check file system type: findmnt -T <path>. Move test file to a supported file system per MDE Linu... | 🔵 6.0 | MS Learn |
| 36 ⚠️ | MDE Linux mdatp CLI command returns command not found | The symlink from /usr/bin/mdatp to wdavdaemonclient binary is missing | Create symlink: sudo ln -sf /opt/microsoft/mdatp/sbin/wdavdaemonclient /usr/bin/mdatp | 🔵 6.0 | MS Learn |
| 37 ⚠️ | MDE macOS installation fails with An error occurred during installation - install.log shows ERROR... | Version downgrade between MDE macOS versions is not supported | Check /Library/Logs/Microsoft/mdatp/install.log for the error. Install equal or newer version, or... | 🔵 6.0 | MS Learn |
| 38 ⚠️ | Network protection causes slow network connections to Domain Controllers and Exchange servers wit... | Network protection protocol parsing components interfere with DC/Exchange traffic | Switch NP to audit/disabled to confirm. Systematically disable: Datagram Processing, NP Perf Tele... | 🔵 6.0 | MS Learn |
| 39 ⚠️ | Network protection clients unable to reach cloud service - connectivity issues | Network protection cannot detect OS proxy settings in certain environments | Configure static proxy: Set-MpPreference -ProxyServer <IP:Port> or Set-MpPreference -ProxyPacUrl ... | 🔵 6.0 | MS Learn |
| 40 ⚠️ | Web content filtering does not block/audit websites when local proxy like Fiddler is running; als... | WCF identifies browsers by process name. Local proxy masks the process name. Application Guard is... | Remove/disable local proxy for WCF to work. For third-party browsers, configure for content inspe... | 🔵 6.0 | MS Learn |
| 41 ⚠️ | Unable to install application on Windows device - error message that Microsoft Defender Antivirus... | Defender real-time protection and tamper protection are both enabled, preventing the application ... | Enable MDE troubleshooting mode via Defender portal. Disable tamper protection (Set-MPPreference ... | 🔵 6.0 | MS Learn |
| 42 ⚠️ | High CPU usage caused by MsMpEng.exe during scheduled antivirus scan on Windows | Scheduled scan scanning files/folders/processes that cause high I/O; no exclusions configured for... | Use Task Manager to confirm MsMpEng.exe is the cause. Run Process Monitor during CPU spike for ~5... | 🔵 6.0 | MS Learn |
| 43 ⚠️ | Application takes significantly longer to perform basic tasks (slow performance) when Defender re... | Real-time protection file scanning overhead causing latency on I/O-intensive application operations | Enable troubleshooting mode. Disable tamper protection first. Then disable real-time protection. ... | 🔵 6.0 | MS Learn |
| 44 ⚠️ | Microsoft Office plugin not working properly - blocked by ASR rule Block all Office applications ... | ASR rule D4F940AB-401B-4EFC-AADC-AD5F3C50688A is set to block mode, preventing Office from spawni... | Enable troubleshooting mode. Run: Set-MpPreference -AttackSurfaceReductionRules_Ids D4F940AB-401B... | 🔵 6.0 | MS Learn |
| 45 ⚠️ | Changes to Microsoft Defender Antivirus settings via Group Policy are silently ignored - settings... | Tamper protection is enabled and blocks changes to tamper-protected Defender AV settings made thr... | Use troubleshooting mode to temporarily disable tamper protection and apply changes. Or use Intun... | 🔵 6.0 | MS Learn |
| 46 ⚠️ | Microsoft Defender AV exclusions are not tamper-protected despite meeting all requirements (TPExc... | Prerequisites not met: platform below 4.18.2211.5, DisableLocalAdminMerge not enabled, device not... | Verify: (1) Defender platform >= 4.18.2211.5, (2) DisableLocalAdminMerge enabled, (3) ManagedDefe... | 🔵 6.0 | MS Learn |
| 47 ⚠️ | macOS: Tamper protection reported as disabled in mdatp health output despite being enabled via MD... | Configuration source mismatch - MDE Attach and MDM Config Profile are mutually exclusive. Or feat... | Run mdatp health --details tamper_protection. Check configuration_source matches config method. I... | 🔵 6.0 | MS Learn |
| 48 ⚠️ | Defender for Endpoint live response session: file cannot be accessed, error message when trying t... | File is locked or in use by another process on the target device, preventing live response from a... | Create a PS1 script that copies the target file to env:TEMP using Copy-Item; upload the script to... | 🔵 6.0 | MS Learn |
| 49 ⚠️ | Defender for Endpoint live response sessions are slow or experience delays during initial connect... | WpnService (Windows Push Notifications System Service) is disabled, or WNS cloud connectivity is ... | Ensure WpnService is enabled and running; verify Turn off notifications network usage GPO/MDM is ... | 🔵 6.0 | MS Learn |
| 50 ⚠️ | Microsoft Defender Antivirus will not start after migrating from a non-Microsoft antivirus product | Policy conflict between multiple management tools (GPO, Intune MDM, SCCM, MDE Attach) configuring... | Follow 4-step troubleshooting: 1) Understand precedence order (MDE Attach > GPO > SCCM co-mgmt > ... | 🔵 6.0 | MS Learn |
| 51 ⚠️ | After Feb 2026 platform update (4.18.25110.6+), antivirus exclusion values cannot be read from lo... | Microsoft changed how AV settings (like exclusions) are stored - organizations using MDE config m... | Use supported Microsoft Defender PowerShell cmdlets (such as Get-MpPreference) to retrieve settin... | 🔵 6.0 | MS Learn |
| 52 ⚠️ | macOS: Microsoft Defender configuration settings from MDM profile not applied when MDE Attach is ... | MDE Attach and MDM Configuration Profile are mutually exclusive on macOS. When both are configure... | Run mdatp health --field managed_by to check: MDE = MDE Attach active (MDM ignored), MEM = MDM pr... | 🔵 6.0 | MS Learn |
| 53 ⚠️ | macOS: Microsoft Defender settings are randomly applied or partially ignored when multiple MDM co... | macOS can only properly merge top-level settings from MDM profiles. Having more than one configur... | Consolidate all com.microsoft.wdav settings into a single MDM configuration profile. Use com.micr... | 🔵 6.0 | MS Learn |
| 54 ⚠️ | macOS: Microsoft Defender settings configured in MDM plist are completely ignored despite the pli... | The plist has incorrect structure - settings wrapped inside Forced > mcx_preference_settings keys... | Verify plist structure with plutil -p /Library/Managed Preferences/com.microsoft.wdav.plist. Sett... | 🔵 6.0 | MS Learn |
| 55 ⚠️ | macOS: Microsoft Defender for Endpoint shows No license found error after Intune deployment | Onboarding has not completed - the onboarding package (WindowsDefenderATPOnboarding.xml) and/or t... | Ensure the onboarding configuration profile (WindowsDefenderATPOnboarding.xml) is deployed to the... | 🔵 6.0 | MS Learn |
| 56 ⚠️ | macOS: Network connectivity issues after deploying Microsoft Defender for Endpoint via Intune wit... | Only one .mobileconfig plist for Network Filter is supported on macOS. Deploying multiple Network... | Ensure only ONE netfilter.mobileconfig profile is deployed. Remove any duplicate Network Filter c... | 🔵 6.0 | MS Learn |
| 57 ⚠️ | macOS Ventura (13+): Microsoft Defender for Endpoint daemon cannot run in background, protection ... | macOS 13 Ventura introduced privacy enhancements requiring explicit consent for applications to r... | Deploy the background_services.mobileconfig profile via Intune or MDM from GitHub mdatp-xplat rep... | 🔵 6.0 | MS Learn |
| 58 ⚠️ | Devices do not appear in Microsoft Defender portal after deploying Intune EDR onboarding policy | Device cannot reach required Defender for Endpoint service endpoints (*.securitycenter.windows.co... | 1) Confirm device can reach *.securitycenter.windows.com and *.protection.outlook.com; 2) Check E... | 🔵 6.0 | MS Learn |
| 59 ⚠️ | Microsoft Defender for Endpoint API returns 429 TooManyRequests error | Number of HTTP requests in a given time frame exceeds the allowed rate limit (quota) for the API,... | 1) Implement request throttling and delay requests; 2) Use the Retry-After response header to det... | 🔵 6.0 | MS Learn |
| 60 ⚠️ | Defender for Endpoint or XDR API returns InvalidRequestBody or MissingRequiredParameter error des... | Body parameters are case-sensitive. A wrong capital or lowercase letter in parameter names causes... | Review the API documentation page and ensure submitted parameter names match the exact casing sho... | 🔵 6.0 | MS Learn |
| 61 ⚠️ | MDE Partial status for Linux on pre-summer-2021 subscriptions | Subscriptions pre-summer 2021 require manual one-time Linux MDE integration opt-in | Environment settings > Fix > Linux machines > Enable; one-time action | 🔵 6.0 | MS Learn |
| 62 ⚠️ | MDE Partial status for Windows Server 2016/2012R2 on pre-spring-2022 subscriptions | Pre-spring 2022 subscriptions require manual one-time unified solution opt-in | Environment settings > Fix > Unified solution > Enable; one-time action | 🔵 6.0 | MS Learn |
| 63 ⚠️ | MDE auto-deployment fails on Linux with fanotify services | Services using fanotify interfere with automatic MDE sensor deployment | Manually install MDE sensor; verify with mdatp health; check MDE.Linux extension | 🔵 6.0 | MS Learn |
| 64 ⚠️ | MDE Linux kernel hang during upgrade from mdatp 101.75.43 or 101.78.13 to newer versions | System hang due to blocked tasks in fanotify code (Red Hat known issue); upgrade process triggers... | Uninstall old mdatp first (sudo apt purge mdatp && sudo apt-get install mdatp), or disable RTP an... | 🔵 6.0 | MS Learn |
| 65 ⚠️ | MDE Linux eBPF mode on RHEL 8.1 with SAP causes kernel panic | eBPF supplementary subsystem incompatible with specific RHEL 8.1 + SAP kernel configuration | Use distro version higher than RHEL 8.1, or switch to AuditD mode instead of eBPF | 🔵 6.0 | MS Learn |
| 66 ⚠️ | MDE Linux eBPF mode on Oracle Linux 8.8 kernel 5.15.0-0.30.20 causes kernel panic | Specific Oracle Linux UEK kernel versions 5.15.0-0.30.20.el8uek.x86_64 incompatible with eBPF sub... | Use higher or lower kernel version on Oracle Linux 8.8 (min RHCK 3.10.0, min UEK 5.4), or switch ... | 🔵 6.0 | MS Learn |
| 67 ⚠️ | MDE Linux eBPF immutable AuditD mode: mdatp audit rules not cleared after switching to eBPF | AuditD immutable mode freezes rules file; reboot required but rules persist in /etc/audit/rules.d... | Switch to eBPF mode; remove /etc/audit/rules.d/mdatp.rules; reboot; verify with sudo auditctl -l | 🔵 6.0 | MS Learn |
| 68 ⚠️ | MDE macOS high CPU from wdavdaemon_unprivileged process causing system performance degradation | Applications or system processes accessing many resources trigger excessive real-time protection ... | Use mdatp diagnostic real-time-protection-statistics --output json with high_cpu_parser.py to ide... | 🔵 6.0 | MS Learn |
| 69 ⚠️ | MDE macOS troubleshooting mode cannot be enabled - mdatp config commands fail or return null results | App version below 101.23122.0005; device not enrolled/active; tamper protection in block mode pre... | Verify app version >= 101.23122.0005; check mdatp health edr_machine_id and connectivity; for tam... | 🔵 6.0 | MS Learn |
| 70 ⚠️ | MDE Security Config Management conflict: error code 43 - device managed by both SCCM and MDE | Device managed by both Configuration Manager and MDE; dual control plane causes policy conflicts | Isolate endpoint security policies to single control plane; disable Manage Security setting using... | 🔵 6.0 | MS Learn |
| 71 ⚠️ | MDE Linux installation: wrong package selected for distro causing installation failure | Wrong mdatp package variant installed (e.g., mdatp-rhel8 on CentOS 7, or .rpm on Debian/Ubuntu) | Match package to distro: mdatp-rhel8 for RHEL/CentOS 8.x, mdatp.rpm for 7.x, mdatp-sles12/15 for ... | 🔵 6.0 | MS Learn |
| 72 ⚠️ | MDE integration breaks after moving subscription/workspace to another tenant. AssignOmsWorkspaceA... | Subscription moved to new tenant without MDE offboarding. Old tenant holds workspace/subscription... | 6-step: 1) Uninstall MDE extensions, 2) Offboard VMs from MDE, 3) Move subscription, 4) Re-enable... | 🔵 5.0 | ADO Wiki |
| 73 ⚠️ | MDE extension fails to provision on Azure ARC machines behind proxy in brownfield deployment. | ARC agent proxy settings not configured for MDE extension in brownfield deployments. | Configure ARC agent proxy, remove MDE extension (UI or PowerShell at scale), MDE re-provisions wi... | 🔵 5.0 | ADO Wiki |
| 74 ⚠️ | MDE macOS installation leaves no trace in /Library/Logs/Microsoft/mdatp/install.log - log file mi... | In rare cases the MDATP installer does not write to its own log file, commonly in MDM deployments | Query macOS system logs with narrow time window: log show --start ... --end ... --predicate proce... | 🔵 5.0 | MS Learn |
| 75 ⚠️ | Legitimate domain/website blocked by MDE Network Protection, users unable to access it | Network Protection classifying the domain as malicious or covered by web content filtering policy | Enable troubleshooting mode. Disable Network Protection (Set-MpPreference -EnableNetworkProtectio... | 🔵 5.0 | MS Learn |
| 76 ⚠️ | Agentless VA scan result processing fails at GetNdrTenantInfoAsync step - MDE Org ID is 00000000-... | The MDE (Microsoft Defender for Endpoint) license has not been created yet (takes up to 24 hours ... | Wait 24 hours after enabling Defender for Servers P2 or CSPM plan for MDE license to be auto-prov... | 🟡 4.0 | ADO Wiki |
| 77 ⚠️ | Agentless scanning shows no freshness or updated results after customer removed/offboarded MDE ex... | When a customer offboards the MDE extension, Microsoft Defender for Endpoint retains the device I... | Wait 30 days for MDE to automatically remove the stale device records. For faster resolution, cre... | 🟡 4.0 | ADO Wiki |
