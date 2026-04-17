# DEFENDER Sentinel 数据连接器 — Comprehensive Troubleshooting Guide

**Entries**: 80 | **Draft sources**: 27 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-cef-syslog-troubleshooter-deprecated.md, ado-wiki-a-change-dcr-reporting-workspace.md, ado-wiki-a-codeless-connector-framework-ccf-tsg.md, ado-wiki-a-devops-connector-takeover-workflow.md, ado-wiki-a-manually-create-dcr-rule-asa-ama.md, ado-wiki-a-mdc-pipeline-ama.md, ado-wiki-a-msbizapps-connector-tsg.md, ado-wiki-a-purview-information-protection-connector.md, ado-wiki-a-sentinel-data-connector-wizard-tsg.md, ado-wiki-a-syslog-cef-advanced-filtering-rsyslog.md
  ... and 17 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Cef
> Sources: ado-wiki, mslearn, onenote

**1. CEF logs not appearing in CommonSecurityLog table in Sentinel when both AMA and OMS/MMA agents are installed on the log forwarder VM**

- **Root Cause**: AMA CEF connector does not collect CEF logs when both AMA and legacy OMS/MMA agent coexist on the same log forwarder VM. The two agents conflict on syslog collection.
- **Solution**: Remove OMS/MMA agent from the log forwarder VM, keep only AMA agent. Verify port 514 is open with netstat -an | grep 514. Run cef_AMA_troubleshoot.py script to validate AMA CEF pipeline.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. CEF logs received by log forwarder VM but not appearing in CommonSecurityLog - AMA CEF connector requires ProcessName=CEF but some devices (e.g. Palo Alto) produce syslog where syslogtag is not parsed**

- **Root Cause**: AMA CEF connector has strict requirements: ProcessName must equal CEF and SyslogMessage must match CEF format. Some network/security devices embed CEF: in the message body but rsyslog does not parse it as the process name.
- **Solution**: Create custom rsyslog conf file in /etc/rsyslog.d/ (e.g. paloalto.conf) using omfwd template to reformat syslog: set ProcessName to CEF, strip prefix from message body, forward to 127.0.0.1:514 via UDP. Template example: template(name=cefmsg type=string string=<%PRI%> %timegenerated% %HOSTNAME% CEF %msg:5:$%\n)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**3. CEF/Syslog logs not arriving in Sentinel CommonSecurityLog table after AMA connector setup on Linux VM, tcpdump shows logs arriving on port 514 but not forwarded to port 28330**

- **Root Cause**: rsyslog forwarding configuration file /etc/rsyslog.d/10-azuremonitoragent-omfwd.conf missing or misconfigured, preventing log forwarding from rsyslog to AMA agent on port 28330
- **Solution**: Run the installation script from the Sentinel CEF/Syslog AMA connector page to configure rsyslog. Verify config: cat /etc/rsyslog.d/10-azuremonitoragent-omfwd.conf. Check ports: sudo ss -lnp | grep -E '28330|514'. Ensure rsyslog listens on 514 (UDP+TCP) and mdsd on 28330 (TCP). Restart rsyslog after changes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. CEF logs ingested into CommonSecurityLog but fields missing, incorrectly parsed, or values appearing in AdditionalExtensions instead of expected columns**

- **Root Cause**: Source device sending CEF messages with incorrect format: missing mandatory header fields, pipe delimiter not escaped in header values, backslash or equals sign not properly escaped in extensions
- **Solution**: Verify CEF format: all 7 header fields (Version|Vendor|Product|DeviceVersion|EventClassID|Name|Severity) must be present. Pipe in header values must be escaped. In extensions: backslash must be double-escaped, equals must be escaped with backslash. Reference: ArcSight CEF spec and https://learn.microsoft.com/en-us/azure/sentinel/cef-name-mapping
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. CEF/Syslog via AMA: no data in Sentinel after 20+ minutes**

- **Root Cause**: AMA not provisioned, RSyslog not running, ports not listening, forwarding config missing, DCR misconfigured, or firewall blocking
- **Solution**: tcpdump port 514; check AMA extension; verify agent; systemctl status; check ports 514/28330; verify RSyslog and DCR config
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. CEF/Syslog AMA MDSD not listening on port 28330**

- **Root Cause**: AMA MDSD component crashed or not started; config corrupted
- **Solution**: Run AMA troubleshooter; check port 28330; restart agent; check logs; enable trace flags
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. CEF/Syslog AMA: DCR not synced - SECURITY_CEF_BLOB missing from agent config cache**

- **Root Cause**: DCR not associated with log forwarder VM; DCR not synced to agent config; wrong DCR type created
- **Solution**: grep -i -r SECURITY_CEF_BLOB /etc/opt/microsoft/azuremonitoragent/config-cache/configchunks; recreate DCR if missing
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**8. Sentinel CEF/Syslog: data ingestion duplication when same facility used for both syslog and CEF**

- **Root Cause**: Using same syslog facility for both Syslog and CEF causes duplicate ingestion into both tables
- **Solution**: Use different facilities for syslog vs CEF messages; review duplication avoidance guidance
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 2: Devops Security
> Sources: ado-wiki, mslearn

**1. Azure DevOps repos not populating on the DevOps Security page after connector creation**

- **Root Cause**: User who created the connector has Stakeholder access level in Azure DevOps instead of Basic or higher, or lacks Project Collection Administrator permission
- **Solution**: Ensure the user creating the ADO connector has BOTH: (1) Basic access level (not Stakeholder) and (2) Project Collection Administrator permission on the Azure DevOps Organization. Check access level in ADO Organization settings then Users
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Azure DevOps repos not populating on DevOps Security blade even with correct permissions when user has multiple Azure identities**

- **Root Cause**: Incorrect Azure identity is being used to authenticate the DevOps connector application when multiple identities are logged into Azure Portal
- **Solution**: Log out from other Azure identities or use a private browser window to log in, then re-authorize the connector. Validate by selecting Selected existing organizations to check if orgs are listed. Re-select All existing and future organizations before saving
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Error creating Azure DevOps connector: TF400813 The user is not authorized to access this resource / ResourceOperationFailure with Unauthorized**

- **Root Cause**: Third-party application access via OAuth is disabled in the Azure DevOps organization settings
- **Solution**: In Azure DevOps go to Organization Settings then Security then Policies then toggle ON Third-party application access via OAuth, then retry connector deployment
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Cannot create Endor Labs XSPM connector via UI/UX - API call fails**

- **Root Cause**: Invalid API payload: Endpoint URL missing trailing backslash, incorrect Endor key ID/secret, or duplicate connector already exists for the tenant (only one per tenant allowed)
- **Solution**: Check browser dev tools for API request/response. Ensure Endpoint URL has trailing backslash. Verify credentials. Check for existing connector via GET http://connectorsservice-svc:80/connectors?tenantId=<TenantId>
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Error connecting Azure DevOps connector to Defender for Cloud - authorization fails or wrong tenant**

- **Root Cause**: The account used to authorize has same email but different tenant; wrong account/tenant combination selected in popup consent screen
- **Solution**: Check which account is signed in at app.vssps.visualstudio.com/profile/view; ensure correct account/tenant combination is selected; if connector used wrong user, delete connector and recreate with correct account
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Azure DevOps connector organization list is empty in Defender for Cloud UI after onboarding**

- **Root Cause**: Azure DevOps organization is not connected to the Azure tenant that has the user who authenticated the connector
- **Solution**: Ensure ADO organization is connected to the same Azure tenant as the authenticating user; check DevOps troubleshooting guide for connector problems
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Connector
> Sources: ado-wiki

**1. Sentinel Office365/OfficeATP/Dynamics365 connector health shows error 'O365ManagementAPIDisabled' or 'Data fetch failed (The O365 Management API is disabled)'.**

- **Root Cause**: The tenant does not have an active O365 account, so the O365 Management API cannot be enabled.
- **Solution**: Verify the tenant has an active O365 subscription. Follow the setup guide at https://docs.microsoft.com/en-us/azure/sentinel/connect-office-365 to properly configure the connector.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Sentinel Office365 connector health shows error SC20011 'Data fetch failed (Tenant does not exist in the O365 Management API)' or AADTenantNotExist.**

- **Root Cause**: Unified auditing is not enabled for the tenant in O365, or the tenant does not have an O365 account/subscription for the Management API.
- **Solution**: Enable unified auditing in O365: https://docs.microsoft.com/en-us/microsoft-365/compliance/turn-audit-log-search-on-or-off. Verify prerequisites at https://docs.microsoft.com/en-us/azure/sentinel/connect-office-365#prerequisites.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Sentinel AWS CloudTrail connector shows error AWSSTSNotAuthorized/S3B40023 or SCT40301 'Not authorized to query the CloudTrail API'.**

- **Root Cause**: The configured ARN role does not have the required permissions to get a token from AWS STS or query the CloudTrail API.
- **Solution**: 1) Get the ARN Role from ExtendedProperties.AwsRoleArn field in the SentinelHealth record. 2) Review the settings/permissions for that role in AWS. 3) Follow the setup guide at https://docs.microsoft.com/en-us/azure/sentinel/connect-aws to configure proper permissions.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Sentinel AWS S3 connector shows error S3B40012 'Failed to get the credential for the SQS queue' or S3B40015 'The SQS queue does not exist'.**

- **Root Cause**: The configured SQS queue was deleted or does not exist in the user's AWS region.
- **Solution**: For S3B40012: Delete the existing AWS S3 data connector and create a new one. Alternatively, create a new Amazon SQS queue and configure the required SQS policy if only the SQS was deleted. For S3B40015: Verify the SQS queue exists in the correct AWS region.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Sentinel AWS S3 connector shows error S3B40014 'Access to a SQS queue was denied' or S3B40023 'Access Denied exception when downloading S3 object'.**

- **Root Cause**: The ARN role lacks required permissions to read from the SQS queue or download objects from the S3 bucket.
- **Solution**: For SQS access (S3B40014): Add SQS:ChangeMessageVisibility, SQS:DeleteMessage, SQS:ReceiveMessage, SQS:GetQueueUrl permissions to the SQS access policy for the ARN role. For S3 access (S3B40023): Add s3:GetObject permission to the S3 bucket policy. If data is encrypted, also add kms:Decrypt and kms:DescribeKey permissions to the KMS resource policy.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Sentinel GCP connector shows errors GCPB40013/GCPB40030/GCPB40031 related to Workload Identity Pool or Provider misconfiguration.**

- **Root Cause**: The GCP Workload Identity Pool or Provider has been deleted/disabled, or the Issuer URL/Audience settings are incorrect.
- **Solution**: GCPB40013: Re-enable or recreate the Workload Identity Pool in GCP. GCPB40030: Set Provider Issuer URL to https://sts.windows.net/33e01921-4d64-4f8c-a055-5bdaffd5e33d. GCPB40031: Set Audience 1 to https://2041288c-b303-4ca0-9076-9612db3beeb2. Ref: https://learn.microsoft.com/en-us/azure/sentinel/connect-google-cloud-platform
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Data Connector
> Sources: ado-wiki, mslearn

**1. Customer sees Unexpected error in the Microsoft Sentinel data connector blade, sometimes showing 0 connectors as Connected**

- **Root Cause**: Usually related to parser issues in data connectors or solutions using Azure Functions. Common culprit: duplicate KQL functions with the same name in the Log Analytics workspace.
- **Solution**: Capture HAR trace to identify root cause: 1) Open Azure Portal > Sentinel, 2) Press Ctrl+Shift+I to open DevTools > Network tab, enable Preserve log, 3) Navigate to data connector blade to reproduce, 4) Right-click trace > Save all as HAR with content, 5) Filter HAR by batch, check batch?api responses for HTTP 400 status, 6) Expand content/error/innererrors for descriptive error message.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Sentinel data connector blade shows error Detected multiple functions with the same name causing Unexpected error or 0 connectors connected**

- **Root Cause**: Two or more KQL functions exist with the same name in the same Log Analytics workspace, causing a conflict that breaks the data connector blade rendering.
- **Solution**: Go to Log Analytics blade > Functions menu, find and delete the duplicate KQL function(s) (may need to delete multiple times). Once only one version exists, recreate the function to ensure it is up to date.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. GitHub Enterprise Audit Log data connector returns 403 or 404 errors when attempting to connect**

- **Root Cause**: Personal access token (PAT) does not have the correct permissions or is not a fine-grained token scoped to the correct organization. Classic PATs or tokens without read access to Organization Administration and Organization Events will fail.
- **Solution**: Create a fine-grained personal access token: Settings > Developer Settings > Personal access tokens > Fine-grained tokens. Set the organization as Resource Owner. Grant read access to Organization Administration and Organization Events. Copy the token and paste it into the Sentinel data connector page. If no logs appear, verify the organization actually has audit logs enabled under Enterprise settings > Audit log.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Failed to delete Jamf Protect data connector in Microsoft Sentinel. Error: 'Failed to delete Jamf Protect Push Connector data connector'. Delete button remains disabled after failure.**

- **Root Cause**: The Jamf connector has an associated polling connection resource (JamfProtectPushConnectorPollingdXXX) that must be deleted first. The UI does not allow direct deletion of this polling resource, so the delete operation fails leaving the connector in a broken state.
- **Solution**: 1) Click delete on the connector page and note the error. 2) Click 'More Events in Activity log' to find the failed Delete Dataconnector event. 3) Open the full message to find the polling connection name (JamfProtectPushConnectorPollingdXXX). 4) Use the Data Connectors Delete REST API (https://learn.microsoft.com/en-us/rest/api/securityinsights/data-connectors/delete) to delete the polling connection by specifying it as the dataConnectorId. 5) After successful 200 response, the delete button should be re-enabled. 6) Also delete the 3 Jamf-related tables from Log Analytics workspace > Tables.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Sentinel data connectors not ingesting data**

- **Root Cause**: Prerequisites/permissions unmet, schema misalignment, ASIM normalization missing
- **Solution**: Confirm prerequisites; validate schema; verify ASIM; reapply configuration
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Microsoft Sentinel data connectors not working: ingestion stopped, no data arriving in workspace**

- **Root Cause**: Connector prerequisites or permissions not met, schema alignment issues, or ASIM normalization not applied correctly
- **Solution**: 1) Confirm connector prerequisites and permissions; 2) Validate schema alignment with expected tables; 3) Verify ASIM normalization if applicable; 4) Reapply configuration and correct mapping issues
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 5: Syslog
> Sources: ado-wiki

**1. Cannot delete Syslog via Legacy Agent connector from Microsoft Sentinel UI even though it appears as connected and an equivalent DCR-based (AMA) connector is available with data already ingesting**

- **Root Cause**: The delete option for legacy agent-based connectors is hidden by default in the Sentinel UI, even when a DCR-based replacement connector exists and is actively ingesting data
- **Solution**: Use the feature flag URL https://ms.portal.azure.com/?EnableDeleteLegacyAgentConnectors=true to access the Azure portal. This enables the deletion option on legacy connectors that have an equivalent DCR-based (AMA) connector with data already ingested to the table.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. When running the CEF/Syslog data connector installation or troubleshooting script on a Linux forwarder, the error "Python: command not found" occurs, preventing script execution.**

- **Root Cause**: The installation script invokes the "python" command, which is not available on newer Linux distributions (e.g., CentOS 8, RHEL 8, SUSE 15) that only ship with Python 3 and do not create a "python" symlink by default.
- **Solution**: Replace "python" with "python3" in the install/troubleshoot script command. For example: sudo wget -O cef_troubleshoot.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_troubleshoot.py && sudo python3 cef_troubleshoot.py. The CEF connector scripts have been updated to support Python 3 in addition to Python 2.7.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**3. Custom syslog/CEF connector configuration changes on the Linux forwarder machine are unexpectedly reverted or overwritten, causing data ingestion to break or behave incorrectly.**

- **Root Cause**: The Azure portal auto-sync feature periodically overwrites the local syslog configuration on the machine with the configuration defined in the portal (Log Analytics Workspace > Advanced settings > Data > Syslog). This affects machines forwarding both CEF and Syslog messages.
- **Solution**: Run the CEF troubleshooting script (cef_troubleshoot.py) which includes a check to detect auto-sync. If auto-sync is interfering, disable it using the suggested command provided by the script to prevent the portal from overwriting local syslog configuration changes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**4. Cisco FTD syslog logs not parsed/ingested into Microsoft Sentinel via OMS agent - only ASA and CEF logs recognized, FTD events are dropped**

- **Root Cause**: OMS agent security_lib.rb only recognizes %ASA and CEF patterns by default; the %FTD identifier for Cisco Firepower Threat Defense is not handled, causing FTD syslog messages to be silently dropped
- **Solution**: Modify three files on the OMS agent VM: (1) /etc/rsyslog.d/security-config-omsagent.conf - add "%FTD-" to the forwarding rule alongside CEF and %ASA; (2) /etc/opt/microsoft/omsagent/<workspaceId>/conf/omsagent.d/security_events.conf - update regex format to include %FTD pattern; (3) /opt/microsoft/omsagent/plugin/security_lib.rb - add %FTD handling in get_ident() and get_data_type() methods mapping to SECURITY_CISCO_ASA_BLOB. Warning: changes will NOT survive OMS agent upgrades. Also provides a KQL parser for CommonSecurityLog to extract FTD-specific fields (DeviceUUID, SrcIP, DstIP, etc).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**5. Need to ingest Cisco Meraki syslog logs (MX/MR/MS appliance logs) into a custom Log Analytics table via OMS agent - standard CEF/ASA connector does not parse Meraki format**

- **Root Cause**: Cisco Meraki logs use a proprietary syslog format (not CEF or ASA) with epoch timestamps and device-specific log types (urls, flows, events, security_event, airmarshal_events, ids-alerts), requiring a dedicated custom API ingestion path
- **Solution**: Set up custom OMS agent ingestion: (1) Create meraki.conf fluentd config in /etc/opt/microsoft/omsagent/<workspaceId>/conf/omsagent.d/ with TCP port 22033 and tag oms.api.meraki; (2) Create rsyslog filter (e.g. 10-meraki.conf) to forward Meraki-specific traffic patterns (MX84 flows/urls/ids-alerts/events, MR18 events, MS220_8P events) to port 22033; (3) Register KQL parser function "CiscoMeraki" in Log Analytics that extracts Epoch, DeviceName, LogType from meraki_CL table and normalizes into UrlEvents, FlowEvents, AirMarshallEvents, SecurityEvents, IDSAlerts, EventLogs. Data appears in meraki_CL custom table within ~20 minutes of agent restart.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**6. Need to ingest Cisco FirePower FTD logs into a custom Log Analytics table via OMS agent custom API connector (alternative to modifying security_lib.rb)**

- **Root Cause**: Cisco FTD logs require a separate custom API ingestion path when the security_lib.rb modification approach is not desired or when logs need to go to a dedicated custom table instead of CommonSecurityLog
- **Solution**: Create custom OMS agent ingestion: (1) Create ciscoftd.conf fluentd config in omsagent conf directory with TCP port 22034 and tag oms.api.ciscoftd; (2) Create rsyslog filter (e.g. 10-ciscoftd.conf) with rule: if rawmsg contains "FTD" then forward to 127.0.0.1:22034; (3) Register KQL parser function "CiscoFTD" in Log Analytics that extracts ReasonCode, ErrorCode, DeviceUUID, SrcIP, DstIP, SrcPort, DstPort, Protocol, IngressInterface, EgressInterface, zones, Priority, GID, SID from ciscoftd_CL table. Data appears in ciscoftd_CL custom table within ~20 minutes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 6: Ama
> Sources: ado-wiki, mslearn

**1. No security data collected in Defender for Cloud despite AMA (Azure Monitor Agent) being installed on VMs**

- **Root Cause**: AMA only handles sending data to workspace — it does not collect security data itself. Azure Security Agent (ASA) must also be installed to collect security-specific data. Without ASA, AMA has no security data to transmit.
- **Solution**: Ensure both AMA and ASA are installed. Enable MDC auto-provisioning which installs both agents automatically. If AMA was installed manually without ASA, install ASA via REST API or PowerShell. The complete MDC pipeline requires: AMA (transport) + ASA (security data collection) + DCR/DCRA (data routing).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Cannot determine which workspace AMA is reporting to — Azure Portal UI shows incorrect or missing information**

- **Root Cause**: User Interface has a bug that does not correctly display the AMA destination workspace.
- **Solution**: Use PowerShell to query DCR directly: (Get-AzDataCollectionRule -Name <dcr-name> -ResourceGroupName <rg-name>).Destinations.LogAnalytics. Alternatively, use Kusto table HybridOmsHealthMonitoringOE where Category='Azure Monitor Agent' to check Heartbeat data.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. AMA/ASA logs pile up and fill disk on VM; DCR streams toggle between free and P2 tiers intermittently**

- **Root Cause**: Race condition between AMA onboarding Policy and Pricing service. Policy DINE check uses a different MSI (the triggering user's MSI) which may lack permissions to GET DCRs, returning false negative (DCR not found). Policy then recreates DCR with free tier defaults, while Pricing service updates it back to P2 tier — causing a toggle loop. The toggling causes log accumulation on disk.
- **Solution**: Short-term: Uninstall AMA + ASA from the machine, replace with MDE (or Log Analytics agent if specific functionality missing from MDE). Long-term: Microsoft moving to agentless or MDE-based solutions. Contact Product team for specific advice if needed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Double ingestion charges during MMA to AMA migration**

- **Root Cause**: Running both MMA and AMA connectors causes duplicate ingestion
- **Solution**: Limit dual running to benchmarking; set legacy to None; use migration tracker workbook
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Sentinel Full Disk on Linux log forwarder: AMA stops functioning after disk fills from syslog storage**

- **Root Cause**: Rsyslog/syslog-ng stores all logs locally by default; without rotation/filtering disk fills up
- **Solution**: Configure rsyslog/syslog-ng to not store unneeded logs; set up log rotation; monitor disk space
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 7: Endor Labs
> Sources: ado-wiki

**1. Endor Labs connector created but status shows unhealthy with 403 error**

- **Root Cause**: Provided Endor Labs credentials (key ID or secret) are incorrect
- **Solution**: Regenerate and provide correct Endor Labs key ID and key secret in the connector configuration
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Endor Labs connector created but status shows unhealthy with 404 Not Found**

- **Root Cause**: API endpoint namespace is incorrect in connector configuration
- **Solution**: Re-create connector with the correct Endor Labs namespace in the Endpoint URL
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Endor Labs connector is healthy but no data visible in MDC UX portal**

- **Root Cause**: Data pipeline issue: Scuba polling failure, EventHub forwarding problem, or global router/graph builder processing error
- **Solution**: 1) Get scuba rule ID via GET /connectors?tenantId=<id>; 2) Check Scuba logs in Geneva/Jarvis DGrep (ScubaSFASIProd namespace); 3) If scuba OK, escalate to DevOps Security PG for global router/graph builder; 4) Check XSPM team if rule creation incorrect
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Entra Id
> Sources: ado-wiki

**1. Unable to enable the Microsoft Entra ID (AAD) connector in Sentinel with a free Entra ID license. The connector blade does not allow enabling.**

- **Root Cause**: Known issue (IcM 207040556) where the free AAD license cannot activate the connector through the Sentinel connector blade directly.
- **Solution**: Workaround: Go to Entra ID > Diagnostics setting > Add new > Select Send to Log Analytics > Choose subscription and workspace > Select Entra ID Sign-in logs and Entra ID Audit logs > Save. This enables the connector from the Entra ID side and the Sentinel connector blade will reflect the enabled status.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Error ERR: Failed to Load appears when opening the Microsoft Entra ID connector page in Sentinel.**

- **Root Cause**: Known issue tracked by IcM 592639270. The connector page fails to load due to a bug in the Entra ID component.
- **Solution**: Temporary mitigation: Use the feature flag URL to bypass the issue: https://portal.azure.com/?LegacyEntraIdComponent=true#home. This forces the legacy Entra ID component which does not have the loading bug.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Error when trying to create/connect the Entra ID connector in Sentinel. Customer has already met prerequisites (green ticks) but cannot complete the connection.**

- **Root Cause**: Most common cause: Maximum of 5 Diagnostic Settings in Entra ID has been reached. Other causes: Missing P1/P2 license for Sign-in logs, or general prerequisites not fully met.
- **Solution**: 1. Check if prerequisites show green ticks. 2. For Sign-in logs, verify P1/P2 license is provisioned. 3. Check Diagnostic Settings count in Entra ID - max 5 allowed. If 5 exist, delete one before adding new. 4. If no clear error, collect HAR trace from connector opening through error occurrence. 5. Verify Diagnostic Settings in Entra ID > Monitoring > Diagnostic settings.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 9: Aws S3
> Sources: ado-wiki, mslearn

**1. AWS S3 connector not ingesting data into Sentinel (AWSCloudTrail/AWSGuardDuty/AWSVPCFlow tables empty), no logs visible despite connector being configured**

- **Root Cause**: Data not being stored in S3 bucket due to missing AWS service configuration (e.g., GuardDuty not enabled, CloudTrail not configured to export to S3, missing S3 policies)
- **Solution**: Verify data exists in S3 bucket by checking the relevant folder in AWS console. Ensure the AWS service (GuardDuty, CloudTrail, VPC Flow) is enabled and configured to export to S3. Check prerequisites at https://learn.microsoft.com/en-us/azure/sentinel/connect-aws?tabs=s3#prerequisites
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. AWS S3 connector: data exists in S3 bucket but SQS monitoring shows no messages sent, data not flowing to Sentinel**

- **Root Cause**: Missing or incorrect S3 Event Notification configuration for the SQS queue, no event notification with correct prefix/suffix filters defined on the S3 bucket
- **Solution**: In AWS console, go to S3 bucket > Properties > Event notifications section. Verify an Event Notification exists pointing to the correct SQS queue with appropriate prefix/suffix data filters. Also verify SQS queue permissions allow S3 to send messages.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**3. AWS S3 connector: no data in Sentinel after 30+ minutes**

- **Root Cause**: Incorrect IAM permissions, empty S3 bucket, SQS not receiving notifications, or KMS decrypt permissions missing
- **Solution**: Review IAM permissions; check S3 for files; verify SQS monitoring; check event notifications; verify SQS policy; check SentinelHealth
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 10: Dcr
> Sources: mslearn

**1. DCR transformation data loss: ingested data silently dropped when KQL transformation exceeds 20 seconds**

- **Root Cause**: DCR transformations taking >20 seconds cause data loss; no visible error without DCR monitoring enabled
- **Solution**: Enable DCR error logs via diagnostic settings; monitor Logs Transformation Duration and Errors per Min; optimize transformation KQL; create metric alerts
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. DCR ingestion errors not visible: no error logs in DCRLogErrors table despite data not arriving**

- **Root Cause**: DCR error logs not enabled by default; require diagnostic setting on each DCR individually
- **Solution**: Create diagnostic setting on each DCR: select Log Errors category and send to Log Analytics workspace; query DCRLogErrors table
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. DCR transformation on dynamic column not working - operations fail silently**

- **Root Cause**: Known issue: dynamic columns not automatically parsed in DCR transformations
- **Solution**: Explicitly use parse_json() to parse dynamic column data before operations in transformation KQL
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 11: M365 Defender
> Sources: ado-wiki

**1. Email and collaboration alerts from Microsoft 365 Defender not synchronized to Microsoft Sentinel via the M365 Defender connector. Only endpoint and identity alerts appear.**

- **Root Cause**: Customer has M365 E3 license instead of E5. Email and collaboration alerts are part of Office 365 Defender (separate backend) and are NOT included in the M365 Defender connector sync. Only with E5 license does the customer get the complete unified M365 Defender experience with all alert types synchronized.
- **Solution**: Upgrade to Microsoft 365 E5 license to get the complete unified M365 Defender experience including Email and collaboration alerts. With E3, the services under the Email and collaboration menu use separate backends and will not sync through the M365 Defender connector to Sentinel. Alternatively, consider using the Office 365 connector separately if available for E3.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Error 'Categories AdvancedHunting-* are not supported' when enabling a specific table ingestion in the M365 Defender (XDR) connector in Sentinel**

- **Root Cause**: License or workload issue in XDR. The AdvancedHunting table does not exist or is not valid in the customer's MTP/XDR environment, typically due to missing workload license
- **Solution**: Verify the table exists in MTP/XDR Advanced Hunting. Collaborate with the respective table owner (e.g., MDE, MDI, MDO, MDCA team) to check if the table exists and is valid for the customer's license/workload configuration.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 12: Dns
> Sources: ado-wiki

**1. Windows DNS data not flowing to Sentinel via AMA connector; MicrosoftDnsAgent extension not installed after assigning VM to DNS DCR**

- **Root Cause**: DNS extension installation is only triggered when configuring from the Azure portal; directly assigning VM to DCR does not trigger extension installation
- **Solution**: Manually install extensions via REST API (Virtual Machine Extensions - Create Or Update): 1. Install AMA agent (publisher: Microsoft.Azure.Monitor, type: AzureMonitorWindowsAgent, typeHandlerVersion: 1.0). 2. Install DNS agent (publisher: Microsoft.Sentinel.AzureMonitorAgentExtensions, type: MicrosoftDnsAgent, typeHandlerVersion: 1.4). Adjust location to match VM region. For ARC machines, use the ARC-specific API format per Microsoft Learn docs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MicrosoftDnsAgent extension status shows error (not 'Provisioning succeeded') with messages like FailedToConnectToPipe, MissingDnsManifestFile, EventsListenerStopped, or MissingStreamInConfiguration**

- **Root Cause**: Multiple possible causes: FailedToConnectToPipe = AMA connection/bad DCR format; MissingDnsManifestFile = manifest file lost during install; EventsListenerStopped = ETW listener crash; MissingStreamInConfiguration = DCR missing Microsoft-ASimDnsActivityLogs stream
- **Solution**: Check extension status message and act accordingly: FailedToConnectToPipe - fix DCR format and AMA connection. MissingDnsManifestFile - reinstall extension via PUT request (without uninstall first). EventsListenerStopped - restart agent via disableCommand.ps1 then enableCommand.ps1 in C:\Packages\Plugins\...\ManagementScripts. MissingStreamInConfiguration - add Microsoft-ASimDnsActivityLogs stream to DCR. Check logs at C:\WindowsAzure\Logs\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent. Use Kusto query on GuestAgentExtensionEvents (azcore.centralus.kusto.windows.net, db: Fa) to check extension status without customer access.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 13: Windows Ama
> Sources: ado-wiki

**1. Windows AMA agent extension not installed on VM, no SecurityEvent or WindowsEvent data ingested into Sentinel, extension not visible in VM Extensions blade**

- **Root Cause**: No Data Collection Rule (DCR) associated with the VM to trigger automatic AMA agent download, or DCR association (DCRA) not properly linking the DCR to the machine
- **Solution**: Verify a DCR exists pointing to the VM via Azure Portal or REST API. If DCR exists but agent not loaded, create and delete a dummy DCR to retrigger agent download. If still failing, install AMA manually: https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-manage
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Windows Security Events or Forwarded Events data missing or delayed in Sentinel after AMA setup, agent installed but DCR not processed correctly**

- **Root Cause**: Faulty XPath query in DCR causing AMA agent malfunction or DCR processing failure, the invalid XPath prevents the agent from collecting specified event types
- **Solution**: Check agent logs at C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version} for errors. Verify XPath syntax. Test XPath on lab machine. DCR best practices: max 5K EPS per DCR, 8+ CPU cores, 10GB free disk. If persists, follow Workspace Ingestion Investigation TSG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Salesforce
> Sources: ado-wiki

**1. Salesforce Service Cloud data connector fails with 'Token getting failed. Exiting program. access_token' error in Azure Function Monitor logs**

- **Root Cause**: Incorrect Salesforce API credentials (Username, Password, Security Token, Consumer Key, or Consumer Secret) configured in the Azure Function application settings
- **Solution**: Verify all credential values in Azure Function configuration: SalesforceUser, SalesforcePass, SalesforceConsumerKey, SalesforceConsumerSecret, SalesforceSecurityToken. Validate credentials via REST API POST to https://login.salesforce.com/services/oauth2/token with grant_type=password and all credentials. A 200 status confirms valid credentials. Alternatively test via curl in Azure Cloud Shell.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Salesforce Service Cloud data connector fails with INVALID_FIELD error: No such column Interval on entity EventLogFile or NoneType INVALID_TYPE in Azure Function Monitor**

- **Root Cause**: Salesforce EventLogFile API schema mismatch - the Interval column may not be available in the customer Salesforce edition or API version, or customer lacks proper EventLogFile access permissions
- **Solution**: Customer should validate log access using Salesforce WORKBENCH by performing GET request to /services/data/v44.0/query?q=SELECT+Id,EventType,Interval,LogDate,LogFile,LogFileLength+FROM+EventLogFile. If the query fails in Workbench, the issue is on the Salesforce side (edition/permissions). Check that Salesforce Shield or Event Monitoring add-on is enabled if required.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 15: Cisco Umbrella
> Sources: ado-wiki

**1. Cisco Umbrella data connector returns 404 response in function app invocation logs when trying to ingest data to Sentinel**

- **Root Cause**: The S3 bucket configured for Cisco Umbrella is not found or does not exist
- **Solution**: Confirm through the Cisco Umbrella portal that the S3 bucket is present. If using Cisco Managed S3 bucket and it is missing, have the customer re-generate the bucket in the Cisco Umbrella portal. Reference: https://docs.umbrella.com/deployment-umbrella/docs/cisco-managed-s3-bucket
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Cisco Umbrella data connector returns SignatureDoesNotMatch error when calling ListObjects operation in function app invocation logs**

- **Root Cause**: The AWS Secret Access Key configured for the Cisco Umbrella connector is incorrect
- **Solution**: Have the customer verify the AWS Secret Access Key. They can regenerate a new key in the Cisco Umbrella portal. If assistance needed, customer should contact Cisco support
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 16: Cloud Apps
> Sources: mslearn

**1. Defender for Cloud Apps M365 connector error: AF20012 Specified tenant ID is incorrectly configured in the system**

- **Root Cause**: No assigned Microsoft 365 licenses found for the tenant.
- **Solution**: Assign at least one Microsoft 365 license to the tenant, then reconnect the M365 app connector in Defender for Cloud Apps.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

**2. Defender for Cloud Apps connector error: AADSTS70002/AADSTS70008 Error validating credentials - refresh token expired for M365/Box/Google Workspace connectors**

- **Root Cause**: The OAuth authorization code or refresh token used by the app connector has expired.
- **Solution**: Reconnect the affected app to Defender for Cloud Apps. Reset settings if domain/user are invalid.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 17: Storage Blob
> Sources: mslearn

**1. Sentinel Azure Storage Blob connector shows green status but no data visible in workspace for over 30 minutes**

- **Root Cause**: Multiple possible causes: upstream not delivering data to blob container; Event Grid system topic not forwarding events to queue; RBAC or networking blocking access; blob data format mismatch; DCR or DCE misconfiguration
- **Solution**: Systematically check: 1) Verify ADLS Gen2 storage account has data via Metrics; 2) Verify Event Grid system topic and subscription with delivered events; 3) Confirm service principal has Storage Blob Data Reader plus Storage Queue Data Contributor roles; 4) Check SentinelHealth table for errors; 5) Verify DCR immutable ID and stream names match
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Sentinel Storage Blob connector DCR/DCE misconfigured: data read from blob but not ingested to workspace**

- **Root Cause**: DCE not in same region as workspace; DCR immutableId incorrect; streamName mismatch; transformation invalid
- **Solution**: Verify DCE region matches workspace; verify DCR immutableId; match streamName to streamDeclarations; test transformation KQL independently
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 18: Asset Inventory
> Sources: ado-wiki

**1. Customer cannot find a specific resource or entire environments/subscriptions in Defender for Cloud NextGen asset inventory**

- **Root Cause**: MDC NextGen in Defender Portal only supports subscriptions/connectors with at least one enabled paid plan. Free-tier subscriptions are excluded by design. Additionally, some resource types may not yet be modeled in EKG.
- **Solution**: Verify subscription has at least one paid MDC plan enabled. If it does and resource is still missing, open ticket to eng team (ICM: DEFENDERFORCSPM/Defenders-CRIs). If the resource type itself is not supported, raise a feature request. Check supported resource labels at NodeIngestionParametersDefinitions.json in XSPM-Orion-IngestionClientContracts repo.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 19: Data Connector Wizard
> Sources: ado-wiki

**1. Data Connector Wizard blocks progress due to validation errors on fields or schema configuration in Microsoft Sentinel**

- **Root Cause**: Field values exceed supported limits or contain unsupported characters. Sample data used for DCR autogeneration may have issues.
- **Solution**: 1) Review field length and character set guidance shown in the wizard UI. 2) Recheck sample data used for DCR autogeneration. 3) Adjust field definitions to meet supported limits. 4) Retry the wizard step. 5) Report validation gaps or unclear messaging as bugs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 20: Dynamics 365
> Sources: ado-wiki

**1. Missing or delayed Dynamics 365 logs in Microsoft Sentinel after enabling Dynamics 365 data connector. Logs expected within 60-90 minutes but not appearing or significantly delayed.**

- **Root Cause**: Dynamics 365 logs rely on Office Audit logs pipeline. Common causes: (1) M365 E1+ license not assigned to audit users, (2) Microsoft Purview auditing not enabled, (3) D365 production environment audit settings (Start Auditing, Log Access, Read Logs) not enabled in Power Platform Admin Center, (4) Connector used on sandbox environment (not supported, production only), (5) Workspace permission issues.
- **Solution**: Step 1: Check Sentinel workspace health. Step 2: Run diagnostic query on Dynamics365Activity table to measure ingestion latency (datetime_diff between TimeGenerated and ingestion_time). Step 3: Verify M365 E1+ license. Step 4: Check logs in Microsoft Purview compliance portal (Record type=CRM, Activities=All Dynamics 365 activities). Step 5: In Power Platform Admin Center > Environment > Settings > Audit and logs > Audit settings, enable Start Auditing, Log Access, Read Logs. Step 6: If persists, engage Dynamics 365 team (SAP: Dynamics/Dynamics 365 Sales) or Purview team (SAP: Security/Microsoft Purview Compliance/Auditing).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 21: Identity Protection
> Sources: ado-wiki

**1. Identity Protection alerts not appearing in Microsoft Sentinel despite the Identity Protection data connector being enabled and connected.**

- **Root Cause**: The Identity Protection portal has a risk level filter setting (Alert on user risk level at or above) which defaults to high. Events below this threshold are not converted into alerts and will not be sent through the data connector to Sentinel. Events are stored in the SecurityAlert table.
- **Solution**: In the Identity Protection portal, navigate to Notify > Users at risk detected alerts > Alert on user risk level at or above. Lower the setting from high to medium or low to generate alerts for lower severity events. Verify using Request Id from CSV export of Risk Detections and match against VendorOriginalId field in Sentinel Log Analytics workspace.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 22: Aip
> Sources: ado-wiki

**1. Azure Information Protection (AIP) data not visible in Microsoft Sentinel after enabling the data connector, or AIP label changes from web Office (Office Online) not appearing in Sentinel.**

- **Root Cause**: Two issues: (1) If AIP analytics was previously using a different Log Analytics workspace, enabling the Sentinel data connector changes the AIP workspace to the Sentinel workspace, but only NEW data from that point forward is ingested - historical data remains in the original workspace. (2) AIP only logs label changes from desktop versions of Office; web Office (Office Online) label changes are NOT logged by AIP at all.
- **Solution**: For issue 1: Verify the AIP analytics workspace (Azure Portal > Azure Information Protection > Manage > Configure Analytics) matches the Sentinel workspace. Historical data before connector enablement is not migrated. For issue 2: This is a known platform limitation - AIP does not capture label changes from Office web apps. Set customer expectations that only desktop Office label activity flows through this connector.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 23: D365 F&O
> Sources: ado-wiki

**1. ARM deployment fails for D365 Finance & Operations Sentinel data connector due to role assignment error in restricted environments**

- **Root Cause**: Owner rights are required for role assignment to DCR during ARM deployment; restricted environments may not allow this
- **Solution**: Customer needs Owner rights for role assignment to DCR. In restricted environments, manually add the Function App identity to the DCR with the Monitoring Metrics Publisher Role via Azure portal IAM blade.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 24: Power Platform
> Sources: ado-wiki

**1. Power Platform Inventory data not flowing to Sentinel via Azure Function App data connector despite deployment**

- **Root Cause**: Self-Service Analytics feature not configured in Power Platform, or Function App Managed Identity (MSI) missing Storage Blob Data Reader role on storage account, or MSI missing Monitoring Metrics Publisher role on the DCR
- **Solution**: 1. Validate Self-Service Analytics is configured: check storage account for 'powerplatform' container with .json files. 2. Grant Function App MSI 'Storage Blob Data Reader' role on the storage account (IAM blade). 3. Grant MSI 'Monitoring Metrics Publisher' role on Microsoft-Sentinel-PPInventory-DCR. 4. If permissions were just added, wait up to 24 hours for token refresh. 5. Check Function App logs: open Function App > PowerPlatformInventoryDataConnector > Monitoring blade for errors.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 25: Palo Alto
> Sources: ado-wiki

**1. Palo Alto Networks (Firewall) data connector drops CEF log messages from PAN-OS 10.0+ devices. Messages with variable length CEF headers are silently discarded.**

- **Root Cause**: Starting with PAN-OS 10.0, Palo Alto uses variable length CEF headers on some log templates (e.g., GlobalProtect). The Sentinel Palo Alto data connector expects exactly 7 CEF headers and drops any message with fewer headers.
- **Solution**: Add a duplicate header field to the Palo Alto CEF template to ensure 7 headers are always present. Example for GlobalProtect template: duplicate the $subtype header so the template becomes CEF:0|Palo Alto Networks|PAN-OS|$sender_sw_version|$type|$subtype|$subtype|rt=... A feature request for native variable length CEF header support exists (ADO backlog item 13869362).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 26: Threat Intelligence
> Sources: ado-wiki

**1. Connected Threat Intelligence Platforms (TIP) data connector to Sentinel workspace but data never received or stopped flowing via Security Graph API**

- **Root Cause**: Pipeline issue between TIP provider and Sentinel workspace ingestion through Security Graph API
- **Solution**: Step 1: Verify on TIP Data Connectors page that data is flowing (check graph). Step 2: Query Log Analytics: ThreatIntelligenceIndicator | where SourceSystem == 'SecurityGraph'. If data exists, confirm timeframe with customer. If no data in LA for stated timeframe, escalate via ICM to USX Threat Intelligence team with Tenant/Workspace ID, region, connector screenshots, and LA query results.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 27: Scoping
> Sources: ado-wiki

**1. Sentinel scope does not correctly apply to a table after configuring scope tagging via Table Management; newly ingested data does not get scope tags**

- **Root Cause**: Known issue where scope does not correctly apply to a table unless a blank/empty transformation rule (DCR) already exists on the table in Azure. Additionally, scope tags only apply to newly ingested data (historic data is not covered), and it may take up to 1 hour for new rules to take effect.
- **Solution**: 1) Create a blank/empty transformation rule (Data Collection Rule) on the table first in Azure portal. 2) Then configure the scope tag on the table via Table Management in Defender portal. 3) Wait up to 1 hour for the rule to take effect. 4) Note: only tables that support transformations are eligible; XDR tables and custom tables are not supported. Max 100 unique Sentinel scopes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 28: Multi Cloud
> Sources: ado-wiki

**1. Multi-cloud connector not visible in MDC environment settings blade**

- **Root Cause**: Subscription not selected or connector not in Azure Resource Graph (ARG).
- **Solution**: Select resource subscription. Verify in ARG: resources | where type =~ microsoft.security/securityconnectors. If in ARG escalate to PG.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 29: Cloudflare
> Sources: ado-wiki

**1. Cloudflare data connector not ingesting logs into Sentinel, no Cloudflare data visible in Log Analytics workspace**

- **Root Cause**: Function App misconfiguration: AZURE_STORAGE_CONNECTION_STRING or other required parameters (Workspace ID, Shared Key) incorrect or missing in the Function App settings
- **Solution**: Check Storage Account > Container for blob data. If blobs exist but no data in LA: go to Function App > Functions > AzureFunctionCloudFlare > Monitor for errors. Fix config in Function App > Configuration > Advanced edit. Allow up to 10 minutes after config change.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 30: Mcas
> Sources: mslearn

**1. Defender for Cloud Apps SIEM agent shows Connection error (>2h) or Disconnected (>12h) status; Data server send error using Syslog over TCP**

- **Root Cause**: SIEM agent cannot connect to Syslog server - wrong name/port, firewall blocking, or TLS version mismatch
- **Solution**: 1) Verify Syslog server name/port in MCAS settings 2) Check firewall rules 3) Ensure TLS 1.2+ 4) For Invalid token, regenerate token.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 31: Defender For Containers
> Sources: mslearn

**1. Defender for Containers AWS EKS connector shows disconnected status in Azure portal**

- **Root Cause**: CloudFormation stack did not complete successfully, IAM role has incorrect trust policy, or role ARN was entered incorrectly in Azure connector configuration
- **Solution**: Verify CloudFormation stack completed successfully in AWS Console. Check IAM role has correct trust policy allowing Azure to assume the role. Ensure the role ARN entered in Azure matches exactly. Verify last sync time is within 15 minutes and Containers plan shows as On.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 32: Defender For Cloud Apps
> Sources: mslearn

**1. Defender for Cloud Apps SIEM agent connection error**

- **Root Cause**: Cannot connect to Syslog server over TCP; wrong server/port; firewall blocking
- **Solution**: Verify server definition; check connectivity and firewall; JRE 291+ specific steps
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 33: Content Hub
> Sources: mslearn

**1. Sentinel solution Content Hub: data connector shows not connected after installing solution**

- **Root Cause**: Solution installation only deploys content templates; data connector requires separate DCR and agent configuration
- **Solution**: After installing solution, separately configure data connector: create DCR, deploy AMA to target machines, run installation script
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 34: Intellisense
> Sources: mslearn

**1. Sentinel IntelliSense does not recognize new columns added via DCR transformation**

- **Root Cause**: IntelliSense cache takes up to 24 hours to refresh after new columns added
- **Solution**: Wait up to 24 hours for cache update; columns are queryable immediately, only autocomplete is delayed
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | CEF logs not appearing in CommonSecurityLog table in Sentinel when both AMA and OMS/MMA agents ar... | AMA CEF connector does not collect CEF logs when both AMA and legacy OMS/MMA agent coexist on the... | Remove OMS/MMA agent from the log forwarder VM, keep only AMA agent. Verify port 514 is open with... | 🟢 9.0 | OneNote |
| 2 | CEF logs received by log forwarder VM but not appearing in CommonSecurityLog - AMA CEF connector ... | AMA CEF connector has strict requirements: ProcessName must equal CEF and SyslogMessage must matc... | Create custom rsyslog conf file in /etc/rsyslog.d/ (e.g. paloalto.conf) using omfwd template to r... | 🟢 9.0 | OneNote |
| 3 | No security data collected in Defender for Cloud despite AMA (Azure Monitor Agent) being installe... | AMA only handles sending data to workspace — it does not collect security data itself. Azure Secu... | Ensure both AMA and ASA are installed. Enable MDC auto-provisioning which installs both agents au... | 🟢 8.5 | ADO Wiki |
| 4 | Cannot determine which workspace AMA is reporting to — Azure Portal UI shows incorrect or missing... | User Interface has a bug that does not correctly display the AMA destination workspace. | Use PowerShell to query DCR directly: (Get-AzDataCollectionRule -Name <dcr-name> -ResourceGroupNa... | 🟢 8.5 | ADO Wiki |
| 5 | AMA/ASA logs pile up and fill disk on VM; DCR streams toggle between free and P2 tiers intermitte... | Race condition between AMA onboarding Policy and Pricing service. Policy DINE check uses a differ... | Short-term: Uninstall AMA + ASA from the machine, replace with MDE (or Log Analytics agent if spe... | 🟢 8.5 | ADO Wiki |
| 6 | Azure DevOps repos not populating on the DevOps Security page after connector creation | User who created the connector has Stakeholder access level in Azure DevOps instead of Basic or h... | Ensure the user creating the ADO connector has BOTH: (1) Basic access level (not Stakeholder) and... | 🟢 8.5 | ADO Wiki |
| 7 | Azure DevOps repos not populating on DevOps Security blade even with correct permissions when use... | Incorrect Azure identity is being used to authenticate the DevOps connector application when mult... | Log out from other Azure identities or use a private browser window to log in, then re-authorize ... | 🟢 8.5 | ADO Wiki |
| 8 | Error creating Azure DevOps connector: TF400813 The user is not authorized to access this resourc... | Third-party application access via OAuth is disabled in the Azure DevOps organization settings | In Azure DevOps go to Organization Settings then Security then Policies then toggle ON Third-part... | 🟢 8.5 | ADO Wiki |
| 9 | Cannot create Endor Labs XSPM connector via UI/UX - API call fails | Invalid API payload: Endpoint URL missing trailing backslash, incorrect Endor key ID/secret, or d... | Check browser dev tools for API request/response. Ensure Endpoint URL has trailing backslash. Ver... | 🟢 8.5 | ADO Wiki |
| 10 | Endor Labs connector created but status shows unhealthy with 403 error | Provided Endor Labs credentials (key ID or secret) are incorrect | Regenerate and provide correct Endor Labs key ID and key secret in the connector configuration | 🟢 8.5 | ADO Wiki |
| 11 | Endor Labs connector created but status shows unhealthy with 404 Not Found | API endpoint namespace is incorrect in connector configuration | Re-create connector with the correct Endor Labs namespace in the Endpoint URL | 🟢 8.5 | ADO Wiki |
| 12 | Endor Labs connector is healthy but no data visible in MDC UX portal | Data pipeline issue: Scuba polling failure, EventHub forwarding problem, or global router/graph b... | 1) Get scuba rule ID via GET /connectors?tenantId=<id>; 2) Check Scuba logs in Geneva/Jarvis DGre... | 🟢 8.5 | ADO Wiki |
| 13 | Customer cannot find a specific resource or entire environments/subscriptions in Defender for Clo... | MDC NextGen in Defender Portal only supports subscriptions/connectors with at least one enabled p... | Verify subscription has at least one paid MDC plan enabled. If it does and resource is still miss... | 🟢 8.5 | ADO Wiki |
| 14 | Sentinel Office365/OfficeATP/Dynamics365 connector health shows error 'O365ManagementAPIDisabled'... | The tenant does not have an active O365 account, so the O365 Management API cannot be enabled. | Verify the tenant has an active O365 subscription. Follow the setup guide at https://docs.microso... | 🟢 8.5 | ADO Wiki |
| 15 | Sentinel Office365 connector health shows error SC20011 'Data fetch failed (Tenant does not exist... | Unified auditing is not enabled for the tenant in O365, or the tenant does not have an O365 accou... | Enable unified auditing in O365: https://docs.microsoft.com/en-us/microsoft-365/compliance/turn-a... | 🟢 8.5 | ADO Wiki |
| 16 | Sentinel AWS CloudTrail connector shows error AWSSTSNotAuthorized/S3B40023 or SCT40301 'Not autho... | The configured ARN role does not have the required permissions to get a token from AWS STS or que... | 1) Get the ARN Role from ExtendedProperties.AwsRoleArn field in the SentinelHealth record. 2) Rev... | 🟢 8.5 | ADO Wiki |
| 17 | Sentinel AWS S3 connector shows error S3B40012 'Failed to get the credential for the SQS queue' o... | The configured SQS queue was deleted or does not exist in the user's AWS region. | For S3B40012: Delete the existing AWS S3 data connector and create a new one. Alternatively, crea... | 🟢 8.5 | ADO Wiki |
| 18 | Sentinel AWS S3 connector shows error S3B40014 'Access to a SQS queue was denied' or S3B40023 'Ac... | The ARN role lacks required permissions to read from the SQS queue or download objects from the S... | For SQS access (S3B40014): Add SQS:ChangeMessageVisibility, SQS:DeleteMessage, SQS:ReceiveMessage... | 🟢 8.5 | ADO Wiki |
| 19 | Sentinel GCP connector shows errors GCPB40013/GCPB40030/GCPB40031 related to Workload Identity Po... | The GCP Workload Identity Pool or Provider has been deleted/disabled, or the Issuer URL/Audience ... | GCPB40013: Re-enable or recreate the Workload Identity Pool in GCP. GCPB40030: Set Provider Issue... | 🟢 8.5 | ADO Wiki |
| 20 | Customer sees Unexpected error in the Microsoft Sentinel data connector blade, sometimes showing ... | Usually related to parser issues in data connectors or solutions using Azure Functions. Common cu... | Capture HAR trace to identify root cause: 1) Open Azure Portal > Sentinel, 2) Press Ctrl+Shift+I ... | 🟢 8.5 | ADO Wiki |
| 21 | Sentinel data connector blade shows error Detected multiple functions with the same name causing ... | Two or more KQL functions exist with the same name in the same Log Analytics workspace, causing a... | Go to Log Analytics blade > Functions menu, find and delete the duplicate KQL function(s) (may ne... | 🟢 8.5 | ADO Wiki |
| 22 | Data Connector Wizard blocks progress due to validation errors on fields or schema configuration ... | Field values exceed supported limits or contain unsupported characters. Sample data used for DCR ... | 1) Review field length and character set guidance shown in the wizard UI. 2) Recheck sample data ... | 🟢 8.5 | ADO Wiki |
| 23 | Missing or delayed Dynamics 365 logs in Microsoft Sentinel after enabling Dynamics 365 data conne... | Dynamics 365 logs rely on Office Audit logs pipeline. Common causes: (1) M365 E1+ license not ass... | Step 1: Check Sentinel workspace health. Step 2: Run diagnostic query on Dynamics365Activity tabl... | 🟢 8.5 | ADO Wiki |
| 24 | Identity Protection alerts not appearing in Microsoft Sentinel despite the Identity Protection da... | The Identity Protection portal has a risk level filter setting (Alert on user risk level at or ab... | In the Identity Protection portal, navigate to Notify > Users at risk detected alerts > Alert on ... | 🟢 8.5 | ADO Wiki |
| 25 | Azure Information Protection (AIP) data not visible in Microsoft Sentinel after enabling the data... | Two issues: (1) If AIP analytics was previously using a different Log Analytics workspace, enabli... | For issue 1: Verify the AIP analytics workspace (Azure Portal > Azure Information Protection > Ma... | 🟢 8.5 | ADO Wiki |
| 26 | Email and collaboration alerts from Microsoft 365 Defender not synchronized to Microsoft Sentinel... | Customer has M365 E3 license instead of E5. Email and collaboration alerts are part of Office 365... | Upgrade to Microsoft 365 E5 license to get the complete unified M365 Defender experience includin... | 🟢 8.5 | ADO Wiki |
| 27 | Unable to enable the Microsoft Entra ID (AAD) connector in Sentinel with a free Entra ID license.... | Known issue (IcM 207040556) where the free AAD license cannot activate the connector through the ... | Workaround: Go to Entra ID > Diagnostics setting > Add new > Select Send to Log Analytics > Choos... | 🟢 8.5 | ADO Wiki |
| 28 | Error ERR: Failed to Load appears when opening the Microsoft Entra ID connector page in Sentinel. | Known issue tracked by IcM 592639270. The connector page fails to load due to a bug in the Entra ... | Temporary mitigation: Use the feature flag URL to bypass the issue: https://portal.azure.com/?Leg... | 🟢 8.5 | ADO Wiki |
| 29 | Error when trying to create/connect the Entra ID connector in Sentinel. Customer has already met ... | Most common cause: Maximum of 5 Diagnostic Settings in Entra ID has been reached. Other causes: M... | 1. Check if prerequisites show green ticks. 2. For Sign-in logs, verify P1/P2 license is provisio... | 🟢 8.5 | ADO Wiki |
| 30 | ARM deployment fails for D365 Finance & Operations Sentinel data connector due to role assignment... | Owner rights are required for role assignment to DCR during ARM deployment; restricted environmen... | Customer needs Owner rights for role assignment to DCR. In restricted environments, manually add ... | 🟢 8.5 | ADO Wiki |
| 31 | Power Platform Inventory data not flowing to Sentinel via Azure Function App data connector despi... | Self-Service Analytics feature not configured in Power Platform, or Function App Managed Identity... | 1. Validate Self-Service Analytics is configured: check storage account for 'powerplatform' conta... | 🟢 8.5 | ADO Wiki |
| 32 | Windows DNS data not flowing to Sentinel via AMA connector; MicrosoftDnsAgent extension not insta... | DNS extension installation is only triggered when configuring from the Azure portal; directly ass... | Manually install extensions via REST API (Virtual Machine Extensions - Create Or Update): 1. Inst... | 🟢 8.5 | ADO Wiki |
| 33 | MicrosoftDnsAgent extension status shows error (not 'Provisioning succeeded') with messages like ... | Multiple possible causes: FailedToConnectToPipe = AMA connection/bad DCR format; MissingDnsManife... | Check extension status message and act accordingly: FailedToConnectToPipe - fix DCR format and AM... | 🟢 8.5 | ADO Wiki |
| 34 | CEF/Syslog logs not arriving in Sentinel CommonSecurityLog table after AMA connector setup on Lin... | rsyslog forwarding configuration file /etc/rsyslog.d/10-azuremonitoragent-omfwd.conf missing or m... | Run the installation script from the Sentinel CEF/Syslog AMA connector page to configure rsyslog.... | 🟢 8.5 | ADO Wiki |
| 35 | CEF logs ingested into CommonSecurityLog but fields missing, incorrectly parsed, or values appear... | Source device sending CEF messages with incorrect format: missing mandatory header fields, pipe d... | Verify CEF format: all 7 header fields (Version/Vendor/Product/DeviceVersion/EventClassID/Name/Se... | 🟢 8.5 | ADO Wiki |
| 36 | Windows AMA agent extension not installed on VM, no SecurityEvent or WindowsEvent data ingested i... | No Data Collection Rule (DCR) associated with the VM to trigger automatic AMA agent download, or ... | Verify a DCR exists pointing to the VM via Azure Portal or REST API. If DCR exists but agent not ... | 🟢 8.5 | ADO Wiki |
| 37 | Windows Security Events or Forwarded Events data missing or delayed in Sentinel after AMA setup, ... | Faulty XPath query in DCR causing AMA agent malfunction or DCR processing failure, the invalid XP... | Check agent logs at C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent... | 🟢 8.5 | ADO Wiki |
| 38 | Palo Alto Networks (Firewall) data connector drops CEF log messages from PAN-OS 10.0+ devices. Me... | Starting with PAN-OS 10.0, Palo Alto uses variable length CEF headers on some log templates (e.g.... | Add a duplicate header field to the Palo Alto CEF template to ensure 7 headers are always present... | 🟢 8.5 | ADO Wiki |
| 39 | Salesforce Service Cloud data connector fails with 'Token getting failed. Exiting program. access... | Incorrect Salesforce API credentials (Username, Password, Security Token, Consumer Key, or Consum... | Verify all credential values in Azure Function configuration: SalesforceUser, SalesforcePass, Sal... | 🟢 8.5 | ADO Wiki |
| 40 | Salesforce Service Cloud data connector fails with INVALID_FIELD error: No such column Interval o... | Salesforce EventLogFile API schema mismatch - the Interval column may not be available in the cus... | Customer should validate log access using Salesforce WORKBENCH by performing GET request to /serv... | 🟢 8.5 | ADO Wiki |
| 41 | Cannot delete Syslog via Legacy Agent connector from Microsoft Sentinel UI even though it appears... | The delete option for legacy agent-based connectors is hidden by default in the Sentinel UI, even... | Use the feature flag URL https://ms.portal.azure.com/?EnableDeleteLegacyAgentConnectors=true to a... | 🟢 8.5 | ADO Wiki |
| 42 | Cisco Umbrella data connector returns 404 response in function app invocation logs when trying to... | The S3 bucket configured for Cisco Umbrella is not found or does not exist | Confirm through the Cisco Umbrella portal that the S3 bucket is present. If using Cisco Managed S... | 🟢 8.5 | ADO Wiki |
| 43 | Cisco Umbrella data connector returns SignatureDoesNotMatch error when calling ListObjects operat... | The AWS Secret Access Key configured for the Cisco Umbrella connector is incorrect | Have the customer verify the AWS Secret Access Key. They can regenerate a new key in the Cisco Um... | 🟢 8.5 | ADO Wiki |
| 44 | GitHub Enterprise Audit Log data connector returns 403 or 404 errors when attempting to connect | Personal access token (PAT) does not have the correct permissions or is not a fine-grained token ... | Create a fine-grained personal access token: Settings > Developer Settings > Personal access toke... | 🟢 8.5 | ADO Wiki |
| 45 | Failed to delete Jamf Protect data connector in Microsoft Sentinel. Error: 'Failed to delete Jamf... | The Jamf connector has an associated polling connection resource (JamfProtectPushConnectorPolling... | 1) Click delete on the connector page and note the error. 2) Click 'More Events in Activity log' ... | 🟢 8.5 | ADO Wiki |
| 46 | Connected Threat Intelligence Platforms (TIP) data connector to Sentinel workspace but data never... | Pipeline issue between TIP provider and Sentinel workspace ingestion through Security Graph API | Step 1: Verify on TIP Data Connectors page that data is flowing (check graph). Step 2: Query Log ... | 🟢 8.5 | ADO Wiki |
| 47 | Sentinel scope does not correctly apply to a table after configuring scope tagging via Table Mana... | Known issue where scope does not correctly apply to a table unless a blank/empty transformation r... | 1) Create a blank/empty transformation rule (Data Collection Rule) on the table first in Azure po... | 🟢 8.5 | ADO Wiki |
| 48 | When running the CEF/Syslog data connector installation or troubleshooting script on a Linux forw... | The installation script invokes the "python" command, which is not available on newer Linux distr... | Replace "python" with "python3" in the install/troubleshoot script command. For example: sudo wge... | 🔵 7.5 | ADO Wiki |
| 49 | Custom syslog/CEF connector configuration changes on the Linux forwarder machine are unexpectedly... | The Azure portal auto-sync feature periodically overwrites the local syslog configuration on the ... | Run the CEF troubleshooting script (cef_troubleshoot.py) which includes a check to detect auto-sy... | 🔵 7.5 | ADO Wiki |
| 50 | Defender for Cloud Apps M365 connector error: AF20012 Specified tenant ID is incorrectly configur... | No assigned Microsoft 365 licenses found for the tenant. | Assign at least one Microsoft 365 license to the tenant, then reconnect the M365 app connector in... | 🔵 7.5 | MS Learn |
| 51 | Defender for Cloud Apps connector error: AADSTS70002/AADSTS70008 Error validating credentials - r... | The OAuth authorization code or refresh token used by the app connector has expired. | Reconnect the affected app to Defender for Cloud Apps. Reset settings if domain/user are invalid. | 🔵 7.5 | MS Learn |
| 52 ⚠️ | Multi-cloud connector not visible in MDC environment settings blade | Subscription not selected or connector not in Azure Resource Graph (ARG). | Select resource subscription. Verify in ARG: resources / where type =~ microsoft.security/securit... | 🔵 7.0 | ADO Wiki |
| 53 ⚠️ | AWS S3 connector not ingesting data into Sentinel (AWSCloudTrail/AWSGuardDuty/AWSVPCFlow tables e... | Data not being stored in S3 bucket due to missing AWS service configuration (e.g., GuardDuty not ... | Verify data exists in S3 bucket by checking the relevant folder in AWS console. Ensure the AWS se... | 🔵 7.0 | ADO Wiki |
| 54 ⚠️ | AWS S3 connector: data exists in S3 bucket but SQS monitoring shows no messages sent, data not fl... | Missing or incorrect S3 Event Notification configuration for the SQS queue, no event notification... | In AWS console, go to S3 bucket > Properties > Event notifications section. Verify an Event Notif... | 🔵 7.0 | ADO Wiki |
| 55 ⚠️ | Cloudflare data connector not ingesting logs into Sentinel, no Cloudflare data visible in Log Ana... | Function App misconfiguration: AZURE_STORAGE_CONNECTION_STRING or other required parameters (Work... | Check Storage Account > Container for blob data. If blobs exist but no data in LA: go to Function... | 🔵 7.0 | ADO Wiki |
| 56 ⚠️ | Defender for Cloud Apps SIEM agent shows Connection error (>2h) or Disconnected (>12h) status; Da... | SIEM agent cannot connect to Syslog server - wrong name/port, firewall blocking, or TLS version m... | 1) Verify Syslog server name/port in MCAS settings 2) Check firewall rules 3) Ensure TLS 1.2+ 4) ... | 🔵 6.0 | MS Learn |
| 57 ⚠️ | Defender for Containers AWS EKS connector shows disconnected status in Azure portal | CloudFormation stack did not complete successfully, IAM role has incorrect trust policy, or role ... | Verify CloudFormation stack completed successfully in AWS Console. Check IAM role has correct tru... | 🔵 6.0 | MS Learn |
| 58 ⚠️ | Sentinel Azure Storage Blob connector shows green status but no data visible in workspace for ove... | Multiple possible causes: upstream not delivering data to blob container; Event Grid system topic... | Systematically check: 1) Verify ADLS Gen2 storage account has data via Metrics; 2) Verify Event G... | 🔵 6.0 | MS Learn |
| 59 ⚠️ | CEF/Syslog via AMA: no data in Sentinel after 20+ minutes | AMA not provisioned, RSyslog not running, ports not listening, forwarding config missing, DCR mis... | tcpdump port 514; check AMA extension; verify agent; systemctl status; check ports 514/28330; ver... | 🔵 6.0 | MS Learn |
| 60 ⚠️ | AWS S3 connector: no data in Sentinel after 30+ minutes | Incorrect IAM permissions, empty S3 bucket, SQS not receiving notifications, or KMS decrypt permi... | Review IAM permissions; check S3 for files; verify SQS monitoring; check event notifications; ver... | 🔵 6.0 | MS Learn |
| 61 ⚠️ | Double ingestion charges during MMA to AMA migration | Running both MMA and AMA connectors causes duplicate ingestion | Limit dual running to benchmarking; set legacy to None; use migration tracker workbook | 🔵 6.0 | MS Learn |
| 62 ⚠️ | Sentinel data connectors not ingesting data | Prerequisites/permissions unmet, schema misalignment, ASIM normalization missing | Confirm prerequisites; validate schema; verify ASIM; reapply configuration | 🔵 6.0 | MS Learn |
| 63 ⚠️ | Defender for Cloud Apps SIEM agent connection error | Cannot connect to Syslog server over TCP; wrong server/port; firewall blocking | Verify server definition; check connectivity and firewall; JRE 291+ specific steps | 🔵 6.0 | MS Learn |
| 64 ⚠️ | CEF/Syslog AMA MDSD not listening on port 28330 | AMA MDSD component crashed or not started; config corrupted | Run AMA troubleshooter; check port 28330; restart agent; check logs; enable trace flags | 🔵 6.0 | MS Learn |
| 65 ⚠️ | DCR transformation data loss: ingested data silently dropped when KQL transformation exceeds 20 s... | DCR transformations taking >20 seconds cause data loss; no visible error without DCR monitoring e... | Enable DCR error logs via diagnostic settings; monitor Logs Transformation Duration and Errors pe... | 🔵 6.0 | MS Learn |
| 66 ⚠️ | DCR ingestion errors not visible: no error logs in DCRLogErrors table despite data not arriving | DCR error logs not enabled by default; require diagnostic setting on each DCR individually | Create diagnostic setting on each DCR: select Log Errors category and send to Log Analytics works... | 🔵 6.0 | MS Learn |
| 67 ⚠️ | Sentinel Storage Blob connector DCR/DCE misconfigured: data read from blob but not ingested to wo... | DCE not in same region as workspace; DCR immutableId incorrect; streamName mismatch; transformati... | Verify DCE region matches workspace; verify DCR immutableId; match streamName to streamDeclaratio... | 🔵 6.0 | MS Learn |
| 68 ⚠️ | CEF/Syslog AMA: DCR not synced - SECURITY_CEF_BLOB missing from agent config cache | DCR not associated with log forwarder VM; DCR not synced to agent config; wrong DCR type created | grep -i -r SECURITY_CEF_BLOB /etc/opt/microsoft/azuremonitoragent/config-cache/configchunks; recr... | 🔵 6.0 | MS Learn |
| 69 ⚠️ | Sentinel solution Content Hub: data connector shows not connected after installing solution | Solution installation only deploys content templates; data connector requires separate DCR and ag... | After installing solution, separately configure data connector: create DCR, deploy AMA to target ... | 🔵 6.0 | MS Learn |
| 70 ⚠️ | Sentinel IntelliSense does not recognize new columns added via DCR transformation | IntelliSense cache takes up to 24 hours to refresh after new columns added | Wait up to 24 hours for cache update; columns are queryable immediately, only autocomplete is del... | 🔵 6.0 | MS Learn |
| 71 ⚠️ | DCR transformation on dynamic column not working - operations fail silently | Known issue: dynamic columns not automatically parsed in DCR transformations | Explicitly use parse_json() to parse dynamic column data before operations in transformation KQL | 🔵 6.0 | MS Learn |
| 72 ⚠️ | Sentinel CEF/Syslog: data ingestion duplication when same facility used for both syslog and CEF | Using same syslog facility for both Syslog and CEF causes duplicate ingestion into both tables | Use different facilities for syslog vs CEF messages; review duplication avoidance guidance | 🔵 6.0 | MS Learn |
| 73 ⚠️ | Sentinel Full Disk on Linux log forwarder: AMA stops functioning after disk fills from syslog sto... | Rsyslog/syslog-ng stores all logs locally by default; without rotation/filtering disk fills up | Configure rsyslog/syslog-ng to not store unneeded logs; set up log rotation; monitor disk space | 🔵 6.0 | MS Learn |
| 74 ⚠️ | Error connecting Azure DevOps connector to Defender for Cloud - authorization fails or wrong tenant | The account used to authorize has same email but different tenant; wrong account/tenant combinati... | Check which account is signed in at app.vssps.visualstudio.com/profile/view; ensure correct accou... | 🔵 6.0 | MS Learn |
| 75 ⚠️ | Azure DevOps connector organization list is empty in Defender for Cloud UI after onboarding | Azure DevOps organization is not connected to the Azure tenant that has the user who authenticate... | Ensure ADO organization is connected to the same Azure tenant as the authenticating user; check D... | 🔵 6.0 | MS Learn |
| 76 | Cisco FTD syslog logs not parsed/ingested into Microsoft Sentinel via OMS agent - only ASA and CE... | OMS agent security_lib.rb only recognizes %ASA and CEF patterns by default; the %FTD identifier f... | Modify three files on the OMS agent VM: (1) /etc/rsyslog.d/security-config-omsagent.conf - add "%... | 🔵 5.5 | ADO Wiki |
| 77 | Need to ingest Cisco Meraki syslog logs (MX/MR/MS appliance logs) into a custom Log Analytics tab... | Cisco Meraki logs use a proprietary syslog format (not CEF or ASA) with epoch timestamps and devi... | Set up custom OMS agent ingestion: (1) Create meraki.conf fluentd config in /etc/opt/microsoft/om... | 🔵 5.5 | ADO Wiki |
| 78 | Need to ingest Cisco FirePower FTD logs into a custom Log Analytics table via OMS agent custom AP... | Cisco FTD logs require a separate custom API ingestion path when the security_lib.rb modification... | Create custom OMS agent ingestion: (1) Create ciscoftd.conf fluentd config in omsagent conf direc... | 🔵 5.5 | ADO Wiki |
| 79 | Error 'Categories AdvancedHunting-* are not supported' when enabling a specific table ingestion i... | License or workload issue in XDR. The AdvancedHunting table does not exist or is not valid in the... | Verify the table exists in MTP/XDR Advanced Hunting. Collaborate with the respective table owner ... | 🔵 5.5 | ADO Wiki |
| 80 ⚠️ | Microsoft Sentinel data connectors not working: ingestion stopped, no data arriving in workspace | Connector prerequisites or permissions not met, schema alignment issues, or ASIM normalization no... | 1) Confirm connector prerequisites and permissions; 2) Validate schema alignment with expected ta... | 🔵 5.0 | MS Learn |
