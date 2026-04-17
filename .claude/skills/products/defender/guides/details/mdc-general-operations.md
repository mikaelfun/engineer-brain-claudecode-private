# DEFENDER MDC 通用运维 — Comprehensive Troubleshooting Guide

**Entries**: 38 | **Draft sources**: 25 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-behaviors-layer-tsg.md, ado-wiki-a-defender-for-cloud-cli-r2.md, ado-wiki-a-gigla-xdr-pipeline-tsg.md, ado-wiki-a-ignite-releases-fy25.md, ado-wiki-a-legacy-system-updates-tsg.md, ado-wiki-a-mdc-technical-knowledge-miscellaneous.md, ado-wiki-a-okta-federated-domain-cloud-pc-sign-in.md, ado-wiki-a-r3-mdc-feature-request-process.md, ado-wiki-a-vm-encrypt-temp-disks-tsg.md, ado-wiki-b-check-if-standard-has-assessed-resources.md
  ... and 15 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Defender For Iot
> Sources: mslearn

**1. Defender for IoT OT sensor fails to connect to Azure portal - SSL/TLS certificate errors when establishing secure connections**

- **Root Cause**: Sensor time configuration is incorrect or an SSL inspection service (often found in proxies) interferes with the certificate chain, causing the sensor to not trust the certificate
- **Solution**: Correct the sensor time configuration via NTP sync; manage SSL/TLS certificates on the sensor; if using a proxy with SSL inspection, add Defender for IoT endpoints to the SSL inspection bypass list
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for IoT OT sensor cloud connectivity fails with Unreachable DNS server or Name resolution failures**

- **Root Cause**: Sensor cannot reach the configured DNS server, or DNS server is reachable but not properly configured on the sensor to resolve required endpoints
- **Solution**: Verify DNS server reachability from the sensor; update sensor network configuration with correct DNS settings; contact DNS administrator if configuration is correct but resolution still fails
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Defender for IoT OT sensor cloud connectivity fails with proxy authentication errors**

- **Root Cause**: Proxy server demands authentication but no credentials or incorrect credentials are configured on the sensor
- **Solution**: Configure correct proxy credentials on the OT sensor network configuration; verify proxy server accepts the credentials and allows traffic to Defender for IoT endpoints
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Defender for IoT OT sensor shows Time drift detected error, sensor disconnected from Azure portal**

- **Root Cause**: UTC time on the sensor is not synchronized with Defender for IoT in the Azure portal
- **Solution**: Configure a Network Time Protocol (NTP) server on the sensor to synchronize time in UTC; for cloud-managed sensors, configure NTP from the Azure portal under sensor settings
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Defender for IoT OT sensor device map shows only broadcasting devices with no unicast traffic visible**

- **Root Cause**: SPAN port configuration is incorrect - only broadcast/multicast traffic is being mirrored to the sensor, unicast traffic is not captured
- **Solution**: Validate with Data Mining report that only broadcast/multicast traffic appears; contact networking team to fix the SPAN port configuration; alternatively record a PCAP from the switch or use Wireshark to verify
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Defender for IoT OT sensor: ICS devices not shown on device map, internet cloud icon appears instead; multiple internet-related alerts**

- **Root Cause**: ICS devices are configured with external/public IP addresses which the sensor classifies as internet-bound rather than local OT devices
- **Solution**: Export IP addresses from the cloud icon on device map; copy the public ranges that are actually private ICS devices and add them to the sensor subnet list; regenerate data-mining report for internet connections
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. Defender for IoT OT sensor web interface not accessible - cannot connect via browser**

- **Root Cause**: Network misconfiguration on the sensor: management port IP, subnet mask, DNS, or default gateway settings are incorrect; or the laptop/workstation is not on the same network as the management port
- **Solution**: Connect monitor+keyboard to appliance; sign in as admin; run network list to check IP; if misconfigured use network edit-settings to correct IP/subnet/DNS/gateway; verify laptop is on the same subnet as management port (Gb1)
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**8. Defender for IoT OT sensor password failure at initial sign-in to pre-configured sensor**

- **Root Cause**: Pre-configured sensors require password recovery on first sign-in; the initial password is not set until the recovery process is completed through the Azure portal
- **Solution**: On sensor sign-in screen select Password recovery; copy the unique identifier; in Azure portal go to Sites and sensors > More Actions > Recover OT sensor password; upload the downloaded password_recovery.zip to the sensor
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 2: Cloud Pc
> Sources: ado-wiki

**1. VPN client (IKEV2 protocol) in Cloud PC disconnects user session upon connection; reconnecting manually works**

- **Root Cause**: VPN protocols like IKEV2 change the device default route (0.0.0.0), causing Cloud PC RDP session disconnect. Also possible: VPN client app configured to 'End Existing Traffic' (e.g., Checkpoint VPN) terminates the active RDP session.
- **Solution**: Use split tunneling to exempt core RD traffic. Reference: https://techcommunity.microsoft.com/t5/windows-365/optimizing-rdp-connectivity-for-windows-365/m-p/3554327. If VPN client has 'End Existing Traffic' option, disable it.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. VPN client in Cloud PC disconnects user and manual reconnection fails; only reboot restores connectivity**

- **Root Cause**: VPN tunnel is configured to block all non-VPN traffic, preventing the Cloud PC from communicating with the internet and required Windows 365 endpoints.
- **Solution**: Allow required Windows 365 endpoints through the VPN tunnel. Reference: https://learn.microsoft.com/en-us/windows-365/enterprise/requirements-network. Use split tunneling and exempt core RD traffic to avoid sending all traffic through tunnel.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Cloud PC desktop client shows 'The logon attempt failed' from HAADJ/AADJ physical devices; web client works fine; connecting from non-joined devices also works**

- **Root Cause**: The 'P2P Server' first-party service principal in Azure AD has been disabled for user sign-in, causing PKU2U certificate-based authentication to fail. P2P Server issues MS-Organization-P2P-Access certificates needed for RDP auth between Azure AD joined devices.
- **Solution**: Enable the P2P Server service principal: Azure AD portal > search 'P2P Server' > Service Principal > Properties > enable sign-in. Validate via ASC Application search for 'P2P'. Collect ODC logs + Event Viewer AAD Operational Log (Event ID 1081, error AADSTS50001 for resource 'urn:p2p_cert') and Security Log (Event ID 4625, status 0xC000006D) to confirm.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Cloud PC shows 'We couldn't connect because there are currently no available resources'; CPCD shows SessionStatus=Unavailable, VmStatus=PowerState/stopped**

- **Root Cause**: Cloud PCs were encrypted by MBAM/Intune BitLocker policy. A Windows update triggered BitLocker Recovery mode, making the Cloud PCs inaccessible. Windows 365 Cloud PCs do not support BitLocker encryption (see MS docs on encryption of data at rest).
- **Solution**: Disable MBAM/Intune BitLocker configuration for Cloud PCs to prevent further encryption. Unencrypt all currently encrypted Cloud PCs. Restore affected Cloud PCs to a point before they became inaccessible. If restore fails, reprovision the devices. Diagnostic: use ASC IaaS Disk Logs to check if main disk mount (/dev/sda4) is missing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Mdav
> Sources: mslearn

**1. MDAV stuck in passive mode - cannot switch to active mode after removing non-Microsoft AV solution**

- **Root Cause**: ForceDefenderPassiveMode registry key still set to 1 under HKLM\SOFTWARE\Policies\Microsoft\Windows Advanced Threat Protection.
- **Solution**: Registry Editor as admin, set ForceDefenderPassiveMode to 0 or delete the key, reboot the device.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. Cannot re-enable MDAV on Windows Server 2016 after it was disabled or uninstalled by non-Microsoft AV**

- **Root Cause**: Non-Microsoft AV previously disabled or uninstalled MDAV feature on Server 2016.
- **Solution**: If disabled: MpCmdRun.exe -WdEnable from elevated cmd in platform folder. If uninstalled: DISM /Online /Enable-Feature /FeatureName:Windows-Defender-Features, then Windows-Defender, then Windows-Defender-Gui. Reboot after.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**3. MDMWinsOverGP policy CSP setting does not override Group Policy for all Microsoft Defender Antivirus settings, particularly attack surface reduction (ASR) rules**

- **Root Cause**: The MDMWinsOverGP Policy CSP (ControlPolicyConflict) has known limitations and does not apply universally to all Defender settings such as ASR rules in Windows 10
- **Solution**: For ASR rules and other settings where MDMWinsOverGP does not work, remove the conflicting GPO settings directly rather than relying on MDM override; use a single management tool for ASR rules
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 4: Defender For Sql
> Sources: mslearn

**1. Defender for SQL on Machines: Extension not installed on VM/Arc server - 'Defender for SQL extension does not exist'**

- **Root Cause**: Extension blocked by Azure deny policies, or automatic deployment failed. Publisher=Microsoft.Azure.AzureDefenderForSQL, Type=AdvancedThreatProtection.Windows
- **Solution**: Ensure extension not blocked by deny policies. Manually install: Set-AzVMExtension -Publisher Microsoft.Azure.AzureDefenderForSQL -ExtensionType AdvancedThreatProtection.Windows -TypeHandlerVersion 2.0 -EnableAutomaticUpgrade $true.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for SQL on Machines: Protection status shows 'SQL server restart is needed' after extension installation**

- **Root Cause**: SQL Server instance needs restart for Defender for SQL extension to take effect
- **Solution**: Restart the SQL Server instance. Reverify protection status via Azure portal or the recommendation. Note: recommendation updates every 12 hours.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Defender for SQL on Machines: Protection status shows 'Lack of communication' - extension cannot reach backend**

- **Root Cause**: Outbound HTTPS on TCP 443 blocked from VM/Arc server to *.<region>.arcdataservices.com
- **Solution**: Allow outbound HTTPS on TCP 443 using TLS to *.<region>.arcdataservices.com. Check NSGs, firewalls, and proxy settings.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 5: M365D Integration
> Sources: ado-wiki

**1. Microsoft Defender for Cloud alert is missing from Microsoft 365 Defender (M365D) unified portal after MDC-M365D integration is enabled**

- **Root Cause**: MDC as data provider failed to sync the alert to M365D; possible ingestion delay or data pipeline issue
- **Solution**: Query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbeddata').MtpAlerts where AlertId == '{alertId}' to verify whether alert exists in M365D backend. If confirmed missing, escalate to MDC engineering team/PG as the data provider owns its data.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Alert status is not correlated/synchronized between Microsoft Defender for Cloud and Microsoft 365 Defender portals; status shows differently in each portal**

- **Root Cause**: Bi-directional alert status synchronization issue between MDC and M365D; possible sync delay or failure in status update pipeline
- **Solution**: Query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbeddata').MtpAlertStatus where AlertId == '{alertId}' sorted by Timestamp to trace status changes over time and identify where sync broke. Collect AAD tenant ID and AlertId before escalating.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Asset Inventory
> Sources: ado-wiki

**1. A deleted resource still appears in Defender for Cloud asset inventory (NextGen portal)**

- **Root Cause**: It can take up to 3 days for resources to disappear from Inventory, and up to 14 days for some resource types like VMs, due to EKG refresh cycles.
- **Solution**: In asset side panel, click Go hunt to check last refresh timestamp. If timestamp is recent after the expected wait period, open ticket to engineering team (ICM: DEFENDERFORCSPM/Defenders-CRIs). Always compare with EKG-based experience (Advanced Hunting, Security Explorer) as Cloud Infrastructure is built on the map.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Inventory Environment filters and CloudScopes filters are not displaying when entering the NextGen inventory page via direct URL**

- **Root Cause**: Known issue in Defender Portal NextGen inventory experience - filters fail to load when page is accessed via direct URL instead of portal navigation.
- **Solution**: Navigate to the Inventory page through the Defender portal menu instead of using a direct URL. This is a known issue being tracked by the engineering team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: Sql Va
> Sources: mslearn

**1. SQL Vulnerability Assessment baseline not reflected after approval in classic configuration - findings still show as unhealthy**

- **Root Cause**: In classic configuration, baseline approval only takes effect on the next scan run. Unlike express configuration where baseline applies immediately, classic requires a new scan cycle.
- **Solution**: Run another on-demand scan to apply baseline changes in classic configuration. Navigate to SQL Database > Security > Defender for Cloud > View additional findings in Vulnerability Assessment > Scan. Express configuration applies baselines immediately.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. SQL Vulnerability Assessment - access error when opening email notification link to view scan results in classic configuration**

- **Root Cause**: Storage role missing. The user accessing the email link does not have Storage Blob Data Reader role on the storage account that contains the scan results.
- **Solution**: Add Storage Blob Data Reader role assignment for the user on the storage account containing SQL VA scan results. The storage account is configured in the SQL VA classic configuration settings.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 8: Data Sensitivity Discovery
> Sources: ado-wiki

**1. Data Sensitivity Discovery sensitivity scan fails — DenyAssignments error in UpdateStatus operation logs**

- **Root Cause**: A deny assignment policy is blocking the sensitivity scan operation from accessing required resources
- **Solution**: 1) Confirm via Kusto: `MdfcIpServiceLogs | where TIMESTAMP > ago(3d) | where Env == 'PROD' | where * contains 'DenyAssignments' | where OperationName == 'UpdateStatus' | where TenantId == '{TenantId}' | project TIMESTAMP, TenantId, Message`. 2) Ask customer to update/remove the deny assignment policy: https://learn.microsoft.com/en-us/azure/role-based-access-control/deny-assignments. Note: Adaptive Network Hardening alert is Low Severity — may be missed if customer only configured high-severity email alerts.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 9: Defender For Devops
> Sources: ado-wiki

**1. Microsoft Security DevOps 扩展在 Azure DevOps Server（本地部署）上无法正常工作**

- **Root Cause**: Defender for DevOps 不支持 On-Premises DevOps Server，任何版本均不支持，且短期内无计划
- **Solution**: 仅使用 Azure DevOps 云版本（online）；on-prem 不支持且无计划支持
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Servicenow
> Sources: ado-wiki

**1. Error 'Invalid credentials / unauthorized user' when creating MDC ServiceNow integration**

- **Root Cause**: Incorrect username, password, client ID, or client secret for ServiceNow
- **Solution**: Verify all ServiceNow credentials (username, password, client ID, client secret). Refer to MDC documentation for creating/obtaining client ID and client secret.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 11: Defender Cli
> Sources: ado-wiki

**1. Defender for Cloud CLI authentication fails in CI/CD pipeline (no MDC: Authenticated log line)**

- **Root Cause**: Incorrect or missing environment variables: DEFENDER_TENANT_ID, DEFENDER_CLIENT_ID, DEFENDER_CLIENT_SECRET
- **Solution**: Verify and update pipeline secrets with correct values from Azure AD app registration: DEFENDER_TENANT_ID, DEFENDER_CLIENT_ID, DEFENDER_CLIENT_SECRET
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 12: Mdc Copilot
> Sources: ado-wiki

**1. MDC Copilot skills responding with errors or unexpected results in Azure Portal**

- **Solution**: Check if 'Using Copilot for Security' message was shown (if not, MDC skill not selected by orchestrator). Use sessionId to check telemetry on MDC Copilot dashboard (requires TM-ASC-Defenders DataViewers + Copilot4azure group). Limitations: one skill per turn, only on MDC blades, no vulnerability search. Escalate via CRI on 'Defenders CRIs' team with session ID.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 13: Dotnet
> Sources: ado-wiki

**1. .NET vulnerabilities not clearing in Defender for Cloud after installing new .NET versions on VM**

- **Root Cause**: Old vulnerable .NET runtime versions still installed or leftover version folders present in C:/Program Files (x86)/dotnet/shared/Microsoft.NETCore.App.
- **Solution**: Run "dotnet --list-runtimes" to check all installed versions. Remove vulnerable old versions. Clean leftover folders in dotnet shared directory. If removal not possible, disable the QID.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Qid 91393
> Sources: ado-wiki

**1. QID 91393 Microsoft Windows Security Update July 2017 vulnerability still reported after installing security updates for CVE-2017-8563**

- **Root Cause**: After installing security updates, the LdapEnforceChannelBinding registry key must be manually set to enable the fix.
- **Solution**: Set registry: HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\LdapEnforceChannelBinding. See KB4034879.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 15: Suppression Rule
> Sources: ado-wiki

**1. MDC alert suppression rule created but previously triggered alerts (before rule creation) are not being suppressed -- existing alerts still appear active despite matching suppression rule**

- **Root Cause**: MDC suppression rules are NOT retroactive -- they only apply to new alerts generated AFTER the rule is created. Pre-existing alerts already in the system will not be suppressed.
- **Solution**: Verify alert trigger time vs rule creation time -- pre-existing alerts cannot be retroactively suppressed. For past alerts: dismiss manually. For future alerts: suppression rule applies automatically. Confirm via Kusto: cluster('romeeus.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts | extend AutoDismissRuleId = substring(tostring(Metadata['AutoDismiss.DismissingRuleId']),37) | where isnotempty(AutoDismissRuleId) | where effectiveSubscriptionId == '{subscriptionId}'
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 16: Byol
> Sources: ado-wiki

**1. Customer tried to delete a BYOL VA solution with more than 100 protected resources and the operation failed. OR the "Delete solution"/"Link"/"Unlink" buttons are grayed out in the portal.**

- **Root Cause**: Deleting a solution with >100 resources is not supported. Grayed-out buttons mean the solution is busy (currently linking/unlinking resources, or auto-update is running). Solution deletion takes ~3 minutes per VM.
- **Solution**: For >100 resources: manually unlink VMs until fewer than 100 remain, then retry delete. For grayed-out buttons: wait for the current operation to complete. If stuck for extended time, escalate to engineering as a potential bug.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 17: Inventory
> Sources: ado-wiki

**1. MDC Asset Inventory tag filter and export query does not show greenfield (newly tagged) resources**

- **Root Cause**: ARG limitation - the export query is static and only captures resources tagged at query creation time. Multi Join capability in ARG not yet deployed.
- **Solution**: Manually update the ARG query whenever new resources are tagged with the relevant tags to include them in filtered results.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 18: Purview
> Sources: ado-wiki

**1. Purview Insights Dispatcher alert fired: snapshot function failed or updates function of the same kind failed 3 or more times in the last hour.**

- **Root Cause**: Purview Insights Dispatcher function execution failure (snapshot or update type). Can be transient infrastructure issue or code-level failure.
- **Solution**: Open Functions Dashboard or Function Start/Finish Dashboard from IcM link. Find failing invocation ID from Finished With Errors widget. Search logs via Insights Dispatchers - Logs with invocation ID. For snapshot: if next run succeeds and dispatched insights follow weekly trend, no action needed. For updates: deduce reason from logs. Contact Basel or Shai if persistent.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 19: Azure Security Center
> Sources: contentidea-kb

**1. After disabling Windows Error Reporting, WER becomes enabled again after no user action has been taken on systems added to Azure Security Center (Defender for Cloud).**

- **Root Cause**: The Azure Watson Crash Listener component of Azure Security Center re-enables Windows Error Reporting to fulfill Azure Security Center logging and error reporting for added systems.
- **Solution**: Disable the crash collection component of the OMS Agent/Microsoft Monitoring Agent. Create a DWORD value under HKLM\SYSTEM\CurrentControlSet\Services\HealthService\Parameters named "Disable CDR Agent" with a value other than 0. Rely on Geneva Monitoring Agent or Azure Watson Agent for crash collection instead.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — ContentIdea]`

### Phase 20: Defender For Business
> Sources: mslearn

**1. Defender for Business setup fails: Something went wrong - There is an integration issue between Defender for Business and Microsoft Endpoint Manager**

- **Root Cause**: Configuration channel between Defender for Business and Microsoft Intune not established.
- **Solution**: 1) Defender portal Settings Endpoints Advanced features: turn on Microsoft Intune connection. 2) Enforcement scope: turn on Windows Client devices. 3) Intune Endpoint security MDE: set Allow MDE to enforce Endpoint Security Configurations to On.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 21: Devops Security
> Sources: mslearn

**1. Large Azure DevOps organization onboarding causes API throttling and slow discovery in Defender for Cloud**

- **Root Cause**: DevOps API calls count against Azure DevOps Global rate limit; large orgs (500+ projects) exhaust quota especially when concurrent builds or Power Platform users consume API capacity
- **Solution**: Use alternative Azure DevOps identity (Organization Admin service account) to avoid personal account throttling; discovery speed is ~100 projects per hour per connector
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Data Sensitivity Discovery sensitivity scan fails — DenyAssignments error in UpdateStatus operati... | A deny assignment policy is blocking the sensitivity scan operation from accessing required resou... | 1) Confirm via Kusto: `MdfcIpServiceLogs / where TIMESTAMP > ago(3d) / where Env == 'PROD' / wher... | 🟢 8.5 | ADO Wiki |
| 2 | Microsoft Security DevOps 扩展在 Azure DevOps Server（本地部署）上无法正常工作 | Defender for DevOps 不支持 On-Premises DevOps Server，任何版本均不支持，且短期内无计划 | 仅使用 Azure DevOps 云版本（online）；on-prem 不支持且无计划支持 | 🟢 8.5 | ADO Wiki |
| 3 | Error 'Invalid credentials / unauthorized user' when creating MDC ServiceNow integration | Incorrect username, password, client ID, or client secret for ServiceNow | Verify all ServiceNow credentials (username, password, client ID, client secret). Refer to MDC do... | 🟢 8.5 | ADO Wiki |
| 4 | Defender for Cloud CLI authentication fails in CI/CD pipeline (no MDC: Authenticated log line) | Incorrect or missing environment variables: DEFENDER_TENANT_ID, DEFENDER_CLIENT_ID, DEFENDER_CLIE... | Verify and update pipeline secrets with correct values from Azure AD app registration: DEFENDER_T... | 🟢 8.5 | ADO Wiki |
| 5 | MDC Copilot skills responding with errors or unexpected results in Azure Portal |  | Check if 'Using Copilot for Security' message was shown (if not, MDC skill not selected by orches... | 🟢 8.5 | ADO Wiki |
| 6 | Microsoft Defender for Cloud alert is missing from Microsoft 365 Defender (M365D) unified portal ... | MDC as data provider failed to sync the alert to M365D; possible ingestion delay or data pipeline... | Query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbeddata').MtpAlerts where Al... | 🟢 8.5 | ADO Wiki |
| 7 | Alert status is not correlated/synchronized between Microsoft Defender for Cloud and Microsoft 36... | Bi-directional alert status synchronization issue between MDC and M365D; possible sync delay or f... | Query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbeddata').MtpAlertStatus whe... | 🟢 8.5 | ADO Wiki |
| 8 | .NET vulnerabilities not clearing in Defender for Cloud after installing new .NET versions on VM | Old vulnerable .NET runtime versions still installed or leftover version folders present in C:/Pr... | Run "dotnet --list-runtimes" to check all installed versions. Remove vulnerable old versions. Cle... | 🟢 8.5 | ADO Wiki |
| 9 | QID 91393 Microsoft Windows Security Update July 2017 vulnerability still reported after installi... | After installing security updates, the LdapEnforceChannelBinding registry key must be manually se... | Set registry: HKLM\SYSTEM\CurrentControlSet\Services\NTDS\Parameters\LdapEnforceChannelBinding. S... | 🟢 8.5 | ADO Wiki |
| 10 | MDC alert suppression rule created but previously triggered alerts (before rule creation) are not... | MDC suppression rules are NOT retroactive -- they only apply to new alerts generated AFTER the ru... | Verify alert trigger time vs rule creation time -- pre-existing alerts cannot be retroactively su... | 🟢 8.5 | ADO Wiki |
| 11 | Customer tried to delete a BYOL VA solution with more than 100 protected resources and the operat... | Deleting a solution with >100 resources is not supported. Grayed-out buttons mean the solution is... | For >100 resources: manually unlink VMs until fewer than 100 remain, then retry delete. For graye... | 🟢 8.5 | ADO Wiki |
| 12 | A deleted resource still appears in Defender for Cloud asset inventory (NextGen portal) | It can take up to 3 days for resources to disappear from Inventory, and up to 14 days for some re... | In asset side panel, click Go hunt to check last refresh timestamp. If timestamp is recent after ... | 🟢 8.5 | ADO Wiki |
| 13 | Inventory Environment filters and CloudScopes filters are not displaying when entering the NextGe... | Known issue in Defender Portal NextGen inventory experience - filters fail to load when page is a... | Navigate to the Inventory page through the Defender portal menu instead of using a direct URL. Th... | 🟢 8.5 | ADO Wiki |
| 14 | VPN client (IKEV2 protocol) in Cloud PC disconnects user session upon connection; reconnecting ma... | VPN protocols like IKEV2 change the device default route (0.0.0.0), causing Cloud PC RDP session ... | Use split tunneling to exempt core RD traffic. Reference: https://techcommunity.microsoft.com/t5/... | 🟢 8.5 | ADO Wiki |
| 15 | VPN client in Cloud PC disconnects user and manual reconnection fails; only reboot restores conne... | VPN tunnel is configured to block all non-VPN traffic, preventing the Cloud PC from communicating... | Allow required Windows 365 endpoints through the VPN tunnel. Reference: https://learn.microsoft.c... | 🟢 8.5 | ADO Wiki |
| 16 | Cloud PC desktop client shows 'The logon attempt failed' from HAADJ/AADJ physical devices; web cl... | The 'P2P Server' first-party service principal in Azure AD has been disabled for user sign-in, ca... | Enable the P2P Server service principal: Azure AD portal > search 'P2P Server' > Service Principa... | 🟢 8.5 | ADO Wiki |
| 17 | Cloud PC shows 'We couldn't connect because there are currently no available resources'; CPCD sho... | Cloud PCs were encrypted by MBAM/Intune BitLocker policy. A Windows update triggered BitLocker Re... | Disable MBAM/Intune BitLocker configuration for Cloud PCs to prevent further encryption. Unencryp... | 🟢 8.5 | ADO Wiki |
| 18 | MDC Asset Inventory tag filter and export query does not show greenfield (newly tagged) resources | ARG limitation - the export query is static and only captures resources tagged at query creation ... | Manually update the ARG query whenever new resources are tagged with the relevant tags to include... | 🔵 7.5 | ADO Wiki |
| 19 | Purview Insights Dispatcher alert fired: snapshot function failed or updates function of the same... | Purview Insights Dispatcher function execution failure (snapshot or update type). Can be transien... | Open Functions Dashboard or Function Start/Finish Dashboard from IcM link. Find failing invocatio... | 🔵 7.5 | ADO Wiki |
| 20 | MDAV stuck in passive mode - cannot switch to active mode after removing non-Microsoft AV solution | ForceDefenderPassiveMode registry key still set to 1 under HKLM\SOFTWARE\Policies\Microsoft\Windo... | Registry Editor as admin, set ForceDefenderPassiveMode to 0 or delete the key, reboot the device. | 🔵 7.5 | MS Learn |
| 21 | Cannot re-enable MDAV on Windows Server 2016 after it was disabled or uninstalled by non-Microsof... | Non-Microsoft AV previously disabled or uninstalled MDAV feature on Server 2016. | If disabled: MpCmdRun.exe -WdEnable from elevated cmd in platform folder. If uninstalled: DISM /O... | 🔵 7.5 | MS Learn |
| 22 | SQL Vulnerability Assessment baseline not reflected after approval in classic configuration - fin... | In classic configuration, baseline approval only takes effect on the next scan run. Unlike expres... | Run another on-demand scan to apply baseline changes in classic configuration. Navigate to SQL Da... | 🔵 7.5 | MS Learn |
| 23 | SQL Vulnerability Assessment - access error when opening email notification link to view scan res... | Storage role missing. The user accessing the email link does not have Storage Blob Data Reader ro... | Add Storage Blob Data Reader role assignment for the user on the storage account containing SQL V... | 🔵 7.5 | MS Learn |
| 24 | After disabling Windows Error Reporting, WER becomes enabled again after no user action has been ... | The Azure Watson Crash Listener component of Azure Security Center re-enables Windows Error Repor... | Disable the crash collection component of the OMS Agent/Microsoft Monitoring Agent. Create a DWOR... | 🔵 7.0 | ContentIdea |
| 25 ⚠️ | Defender for Business setup fails: Something went wrong - There is an integration issue between D... | Configuration channel between Defender for Business and Microsoft Intune not established. | 1) Defender portal Settings Endpoints Advanced features: turn on Microsoft Intune connection. 2) ... | 🔵 6.0 | MS Learn |
| 26 ⚠️ | Defender for SQL on Machines: Extension not installed on VM/Arc server - 'Defender for SQL extens... | Extension blocked by Azure deny policies, or automatic deployment failed. Publisher=Microsoft.Azu... | Ensure extension not blocked by deny policies. Manually install: Set-AzVMExtension -Publisher Mic... | 🔵 6.0 | MS Learn |
| 27 ⚠️ | Defender for SQL on Machines: Protection status shows 'SQL server restart is needed' after extens... | SQL Server instance needs restart for Defender for SQL extension to take effect | Restart the SQL Server instance. Reverify protection status via Azure portal or the recommendatio... | 🔵 6.0 | MS Learn |
| 28 ⚠️ | Defender for SQL on Machines: Protection status shows 'Lack of communication' - extension cannot ... | Outbound HTTPS on TCP 443 blocked from VM/Arc server to *.<region>.arcdataservices.com | Allow outbound HTTPS on TCP 443 using TLS to *.<region>.arcdataservices.com. Check NSGs, firewall... | 🔵 6.0 | MS Learn |
| 29 ⚠️ | Defender for IoT OT sensor fails to connect to Azure portal - SSL/TLS certificate errors when est... | Sensor time configuration is incorrect or an SSL inspection service (often found in proxies) inte... | Correct the sensor time configuration via NTP sync; manage SSL/TLS certificates on the sensor; if... | 🔵 6.0 | MS Learn |
| 30 ⚠️ | Defender for IoT OT sensor cloud connectivity fails with Unreachable DNS server or Name resolutio... | Sensor cannot reach the configured DNS server, or DNS server is reachable but not properly config... | Verify DNS server reachability from the sensor; update sensor network configuration with correct ... | 🔵 6.0 | MS Learn |
| 31 ⚠️ | Defender for IoT OT sensor cloud connectivity fails with proxy authentication errors | Proxy server demands authentication but no credentials or incorrect credentials are configured on... | Configure correct proxy credentials on the OT sensor network configuration; verify proxy server a... | 🔵 6.0 | MS Learn |
| 32 ⚠️ | Defender for IoT OT sensor shows Time drift detected error, sensor disconnected from Azure portal | UTC time on the sensor is not synchronized with Defender for IoT in the Azure portal | Configure a Network Time Protocol (NTP) server on the sensor to synchronize time in UTC; for clou... | 🔵 6.0 | MS Learn |
| 33 ⚠️ | Defender for IoT OT sensor device map shows only broadcasting devices with no unicast traffic vis... | SPAN port configuration is incorrect - only broadcast/multicast traffic is being mirrored to the ... | Validate with Data Mining report that only broadcast/multicast traffic appears; contact networkin... | 🔵 6.0 | MS Learn |
| 34 ⚠️ | Defender for IoT OT sensor: ICS devices not shown on device map, internet cloud icon appears inst... | ICS devices are configured with external/public IP addresses which the sensor classifies as inter... | Export IP addresses from the cloud icon on device map; copy the public ranges that are actually p... | 🔵 6.0 | MS Learn |
| 35 ⚠️ | Defender for IoT OT sensor web interface not accessible - cannot connect via browser | Network misconfiguration on the sensor: management port IP, subnet mask, DNS, or default gateway ... | Connect monitor+keyboard to appliance; sign in as admin; run network list to check IP; if misconf... | 🔵 6.0 | MS Learn |
| 36 ⚠️ | Defender for IoT OT sensor password failure at initial sign-in to pre-configured sensor | Pre-configured sensors require password recovery on first sign-in; the initial password is not se... | On sensor sign-in screen select Password recovery; copy the unique identifier; in Azure portal go... | 🔵 5.0 | MS Learn |
| 37 ⚠️ | MDMWinsOverGP policy CSP setting does not override Group Policy for all Microsoft Defender Antivi... | The MDMWinsOverGP Policy CSP (ControlPolicyConflict) has known limitations and does not apply uni... | For ASR rules and other settings where MDMWinsOverGP does not work, remove the conflicting GPO se... | 🔵 5.0 | MS Learn |
| 38 ⚠️ | Large Azure DevOps organization onboarding causes API throttling and slow discovery in Defender f... | DevOps API calls count against Azure DevOps Global rate limit; large orgs (500+ projects) exhaust... | Use alternative Azure DevOps identity (Organization Admin service account) to avoid personal acco... | 🔵 5.0 | MS Learn |
