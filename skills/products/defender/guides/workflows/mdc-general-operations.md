# Defender MDC 通用运维 — 排查工作流

**来源草稿**: ado-wiki-a-behaviors-layer-tsg.md, ado-wiki-a-defender-for-cloud-cli-r2.md, ado-wiki-a-gigla-xdr-pipeline-tsg.md, ado-wiki-a-ignite-releases-fy25.md, ado-wiki-a-legacy-system-updates-tsg.md, ado-wiki-a-mdc-technical-knowledge-miscellaneous.md, ado-wiki-a-okta-federated-domain-cloud-pc-sign-in.md, ado-wiki-a-r3-mdc-feature-request-process.md, ado-wiki-a-vm-encrypt-temp-disks-tsg.md, ado-wiki-b-check-if-standard-has-assessed-resources.md, ado-wiki-b-known-issues-tracker.md, ado-wiki-b-malware-submission-process.md, ado-wiki-b-mdc-css-canned-responses.md, ado-wiki-b-tsg-posture-for-ai-resources.md, ado-wiki-b-upstream-filtering-tsg.md, ado-wiki-c-cisco-meraki-custom-api-config.md, ado-wiki-c-cloud-scopes-tsg.md, ado-wiki-c-training-push-image-for-va.md, ado-wiki-c-tsg-agent-not-installed-in-cluster.md, ado-wiki-c-tsg-map-exporter-failure.md, ado-wiki-c-tsg-phoenix-oci-message-processing-takes-too-long.md, ado-wiki-c-tsg-phoenix-oci-no-successful-message-processing.md, ado-wiki-c-watchlist-how-to-recover.md, onenote-jarvis-kusto-reference.md, onenote-security-common-talking-points.md
**场景数**: 25
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Guide for Sentinel Behaviors Layer
> 来源: ado-wiki-a-behaviors-layer-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Microsoft Sentinel workspace set up and ingesting supported data sources.
2. Permissions to enable: Global admin or security admin (same as existing UEBA capabilities).
3. Onboarding to the Microsoft 365 Defender portal (required for this feature to work).
4. Supported data sources actively ingesting to the Analytics tier.
5. No additional license required beyond existing Sentinel licensing.
6. Existing UEBA capabilities are NOT a prerequisite for enabling Behaviors.
7. Important Environment Constraints:
8. If workspace is not onboarded to Defender portal, complete onboarding first
9. If data sources are not supported or not ingesting to Analytics tier, configure appropriate connectors
10. If sufficient time has passed (30+ minutes) and prerequisites are met, escalate to Product Group with tenant ID, workspace ID, and confirmation of prerequisites.
11. If raw logs have incorrect schema or missing fields, correct the connector configuration or custom parsing logic
12. If raw logs are correct but entity mapping or MITRE is wrong, document the specific BehaviorId, timestamp, description of expected vs. actual entity roles, and escalate to Product Group
13. As a temporary workaround, analysts can rely on the behavior Description field and raw events for investigation rather than trusting entity roles.

### Portal 导航路径
- Microsoft Sentinel > Configuration > Settings > User and Entity Behavior Analytics and verify the data source is connected3
- Microsoft Sentinel > Configuration > Settings > User and Entity Behavior Analytics in the Microsoft 365 Defender portal

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Troubleshooting Guide
> 来源: ado-wiki-a-defender-for-cloud-cli-r2.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Vulnerability Detection: Trivy scans for vulnerabilities within software packages, container images, and other artifacts. It identifies security issues and provides detailed information about the severity, affected versions, and potential fixes
2. Comprehensive Scanning: Trivy not only scans for vulnerabilities but also detects misconfigurations, hard-coded secrets, and license compliance issues.
3. SBOM Generation: Trivy can generate Software Bill of Materials (SBOM), providing a detailed inventory of all components used in software, including open-source and third-party libraries
4. Reliability and Speed: Trivy is reliable and fast, making it suitable for use in various environments, including CI/CD pipelines
5. Wide Range of Vulnerability Databases: Trivy accesses multiple vulnerability databases, ensuring comprehensive coverage of potential security issues
6. Automatic Database Updates: Trivy updates its vulnerability database every six hours, ensuring that users always have the latest information without manual intervention
7. Detailed Reporting: Trivy provides detailed reports on vulnerabilities, including severity levels, affected versions, and remediation suggestions
8. Resource Intensive: Trivy can be resource-intensive, especially when scanning large container images or complex environments
9. Limited In-Cluster Detection: The Trivy CLI cannot detect changes in in-cluster, running resources. For this reason, the Trivy operator is often recommended for more comprehensive cluster scanning
10. Potential for Too Many Requests: Users may encounter issues with too many requests when using Trivy, which can impact the scanning process
11. Dependency on External Databases: Trivy relies on external vulnerability databases, which means that any issues with these databases can affect the accuracy and completeness of the scans

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: GigLA XDR Pipeline TSG
> 来源: ado-wiki-a-gigla-xdr-pipeline-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('azureinsights.kusto.windows.net').database('Insights').OdsTelemetry
| where TIMESTAMP > ago(1d)
| where serviceIdentity == "TENANT_MICROSOFT.WINDOWSDEFENDERATP"
| where customerFirstTagId == "<tenantId>"
| where category == "<table>"
```

**查询 2:**
```kusto
Span
| where serviceName == "giglaingestion-queueconsumer"
| where env_time > ago(24h)
| project TenantId = tostring(tenantId), WorkspaceId = tostring(env_properties["workspaceId"])
| where isnotempty(WorkspaceId)
| distinct TenantId, WorkspaceId
```

**查询 3:**
```kusto
let wsids = dynamic(["<wsId>"]);
Span
| where env_time > ago(7d)
| where name == "MetadataUpdater.CustomerMetadata.Observer.Updater.CustomerMetadataUpdater.UpdateIfNeeded"
| where env_properties has_any (wsids)
| extend customData = parse_json(env_properties)
| evaluate bag_unpack(customData, "props_")
| project env_time, WorkspaceStatus = props_WorkspaceStatus, WorkspaceStatusChangeTime = props_WorkspaceStatusChangeTime, WorkspaceId
| summarize arg_max(env_time, WorkspaceStatus, WorkspaceStatusChangeTime) by WorkspaceId
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: Ignite Releases FY25 — Feature Reference
> 来源: ado-wiki-a-ignite-releases-fy25.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 5: TSG: Legacy System Updates (MMA/OMS-based)
> 来源: ado-wiki-a-legacy-system-updates-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Any row with `UpdateState == "Needed"` → **Not Healthy**
2. All rows have `UpdateState == "Installed"` → **Healthy**
3. No rows matching the query → **N/A** (MDC cannot determine health)
4. Go to Security Center → Inventory → Select VM → System Updates under Virtual machine information
5. Check `UpdateSummary` in Log Analytics workspace:

### Portal 导航路径
- Security Center → Inventory → Select VM → System Updates under Virtual machine information

### Kusto 诊断查询
**查询 1:**
```kusto
Update
| where TimeGenerated>ago(5h) and OSType=="Linux" | where Computer contains "{VMName}"
| summarize hint.strategy=partitioned arg_max(TimeGenerated, UpdateState, Classification, BulletinUrl, BulletinID) by Computer, SourceComputerId, Product, ProductArch
| where UpdateState=~"Needed"
```

**查询 2:**
```kusto
Update
| where OSType != "Linux"
| where iff(isnotnull(toint(Optional)), Optional == false, Optional == "false") == true and
    iff(isnotnull(toint(Approved)), Approved != false, Approved != "false") == true
| where Classification in ("Critical Updates", "Security Updates")
| where ResourceType !has 'virtualMachineScaleSets'
```

**查询 3:**
```kusto
// Assessment for a specific resource
securityresources
| where type=="microsoft.security/assessments"
| where name=="4ab6e3c5-74dd-8b35-9ab9-f61b30875b27"
```

**查询 4:**
```kusto
// Sub-assessments
securityresources
| where type=="microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(".*assessments/(.+?)/.*",1,id), severity=tostring(properties.status.severity)
| where assessmentKey=="4ab6e3c5-74dd-8b35-9ab9-f61b30875b27"
```

**查询 5:**
```kusto
UpdateSummary
   | where Computer contains "{VM name}"
```

### 脚本命令
```powershell
sudo apt-get upgrade -s | grep ^Inst | grep Security
```

---

## Scenario 6: Kusto Telemetry
> 来源: ado-wiki-a-mdc-technical-knowledge-miscellaneous.md | 适用: Mooncake ✅

### 排查步骤
1. Reproduce the issue
2. Press and hold Ctrl + Alt + D
3. Reproduce the issue
4. Click Help icon → "Show diagnostic" → Save PortalDiagnostic.json

---

## Scenario 7: ado-wiki-a-okta-federated-domain-cloud-pc-sign-in.md
> 来源: ado-wiki-a-okta-federated-domain-cloud-pc-sign-in.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- a support ticket with Okta as soon as you identify that the domain is federated with Okta
- ASC and open the tenant for the organization
- a support ticket with Okta for further assistance
- with Windows 365 and collaborate with Okta if necessary

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 8: Microsoft Defender for Cloud (MDC) Feature Request Process (also known as Design Change Request)
> 来源: ado-wiki-a-r3-mdc-feature-request-process.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to Submit MTP DCR Request�� Employee Self-Service Portal.
2. Log in with your Microsoft credentials.
3. Complete the **Customer Details** section. In the product field, open the lookup window and select the appropriate product. You may select **Microsoft Defender for Cloud**.
4. In the Customer field, search for your customer.
5. In the field _Search in our rich repository of features_, you can search for existing Feature Requests (please do so before submitting a new Feature Request), so that you can easily do a �+1�.
6. If you are not able to find an existing Feature Request, select *Yes* under *Unable to find feature in CRM*.
7. Provide a title that describes your Feature Request in the *Feature Name* field.
8. Under *Feature Category*, select the best matching category.
9. Now complete the **Use Case** Section.
10. Describe the customer use case and the change they are requesting?
11. What is the role of your customer?
12. Desired Outcome
13. Then Complete the **Impact** Section to help us prioritize your customer�s Feature Request by completing the below
14. Select one of the following for Blocking:
15. Select one of the following for Priority:
16. Does this fall into any of the categories below?
17. How many user(s) and/or device(s) are impacted?
18. How long has the customer been impacted by the absence of this feature?
19. How frequently is the customer been impacted by the absence of this feature?
20. Describe the impact to end users / administrators due to the absence of this feature?

### Portal 导航路径
- [Submit MTP DCR Request�� Employee Self-Service Portal](https://m365crm
- the lookup window and select the appropriate product
- the FR Dashboard Tracker

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: TSG: Virtual Machines Should Encrypt Temp Disks, Caches, and Data Flows
> 来源: ado-wiki-a-vm-encrypt-temp-disks-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('Romelogs.kusto.windows.net').database('Prod').FindAdeDataByPartialVmId('<VMname or ResourceId>')
```

**查询 2:**
```kusto
cluster('romelogs.kusto.windows.net').database('Prod').FindAdeDataByPartialVmId('{subscriptionId}')
| summarize arg_max(env_time, *) by vmId
```

**查询 3:**
```kusto
cluster("Romelogs").database("Prod").DynamicWithSubscriptionOE
| where env_time > ago(1d)
| where operationName == "GetEncryptionData"
| where customData has "{subscriptionId}"
| extend customObject = parse_json(customData)
| project customObject, env_time
| evaluate bag_unpack(customObject)
| evaluate bag_unpack(encryptionSupport)
| summarize arg_max(env_time, *) by vmId
```

### 脚本命令
```powershell
$vm = Get-AzVM -ResourceGroupName "{ResourceGroup}" -Name "{VirtualMachineName}"
  $vm.SecurityProfile.EncryptionatHost
```

---

## Scenario 10: Check if Standard Has Assessed Resources
> 来源: ado-wiki-b-check-if-standard-has-assessed-resources.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type == "microsoft.security/assessments"
| where subscriptionId == '<Your subscription ID>'
| extend statusPerInitiative = properties.statusPerInitiative
| mv-expand initiativeStatus = statusPerInitiative
| where initiativeStatus.policyInitiativeName == '<Your standard name>'
| count
```

**查询 2:**
```kusto
cluster("https://romelogs.kusto.windows.net").database('Prod').DynamicWithSubscriptionOE
| where env_time between (ago(3d) .. ago(0h))
| where operationName has "RunRegulatoryComplianceDiscoveryAsync"
| where SubscriptionId has '<Your subscription ID>'
| extend customData = parse_json(customData)
| extend standardWithoutAssessedResources = customData.standardsWithoutAssessmentsNames
| project env_time, env_cv, SubscriptionId, standardWithoutAssessedResources
| order by env_time desc
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 11: Microsoft Defender for Cloud Known Issues Tracker
> 来源: ado-wiki-b-known-issues-tracker.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 12: Malware Submission Process - Defender for Storage
> 来源: ado-wiki-b-malware-submission-process.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Direct customer to public documentation
2. Customer submits file following the guidance
3. Customer receives response from Windows Defender Security Intelligence (WDSI) team
4. If false positive confirmed, team will update signatures accordingly
5. Go to WDSI and log in with internal Microsoft corporate account
6. Select **Submit a file** under "Submit a file internally"
7. As Microsoft security product, select **Microsoft Defender for Storage** from the dropdown
8. Specify submission priority as **High** to speed up the process
9. Get the **submission ID** from the customer
10. Reach out to Microsoft Defender Response Team: **response@microsoft.com**
11. Reference: How do I track or view past sample submissions?
12. Go to https://www.microsoft.com/en-us/wdsi/escalate
13. Login with Microsoft corporate account (@microsoft.com)
14. Populate form and click **Escalate** button

### Portal 导航路径
- [WDSI](https://www
- https://www

---

## Scenario 13: MDC CSS: Canned responses for common scenarios
> 来源: ado-wiki-b-mdc-css-canned-responses.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- discussion with Databricks team to improve the security coverage where applicable), while other scenarios should be covering databricks resources (like network-based detections)

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 14: Defender for AI — Posture for AI Resources
> 来源: ado-wiki-b-tsg-posture-for-ai-resources.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Presence of AI libraries running on the resource
2. Access to AI-specific resources on the compute
3. [Low confidence] Resource accessible from AI Application
4. [High confidence] Grounding resources detected via threat protection mechanism
5. [High confidence] ML connection — data stores connected to Azure ML
6. [High confidence] AWS OpenSearch connected to AWS Bedrock Knowledge base

---

## Scenario 15: Background (Upstream Filtering Tsg)
> 来源: ado-wiki-b-upstream-filtering-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Requesting from `Defenders Pricing (core) API` all subscriptions that have specific pricing bundles enabled on them.
2. Getting from Scuba the currently stored `RoutingRules`.
3. Calculating the diff between Pricing data and Scuba's `RoutingRules`.
4. Sending request to add/delete `RoutingRules` form scuba based on the diff calculated.

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where ingestion_time() > ago(4h)
| where env_name == "Microsoft.Azure.Security.Detection.UpstreamFilteringService"
| where name == "UpstreamFilteringTaskSender.SendUpstreamFilteringTasksAsync"
| where OperationResult == "Failure"
| summarize arg_max(env_time, resultDescription)
| take 1
```

**查询 2:**
```kusto
let traceId = "<replace trace id>";
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where ingestion_time() > ago(4d)
| where env_name == "Microsoft.Azure.Security.Detection.UpstreamFilteringService"
| where env_dt_traceId == traceId
| project env_time, name, OperationResult, resultDescription, customData
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 16: CiscoMeraki Workbook
> 来源: ado-wiki-c-cisco-meraki-custom-api-config.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Open Log Analytics/Azure Sentinel Logs blade. Copy the query below and paste into the Logs query window.
2. In the query window, on the second line of the query, enter the hostname(s) of your Cisco Meraki device(s) and any other unique identifiers for the logstream.
3. Click the Save button above the query. A pane will appear on the right, select "as Function" from the drop down. Enter a Function Name.
4. Kusto Functions can typically take up to 15 minutes to activate. You can then use Function Alias for other queries.

### Portal 导航路径
- Log Analytics/Azure Sentinel Logs blade

### Kusto 诊断查询
**查询 1:**
```kusto
let LogHeader = meraki_CL
| extend Parser = extract_all(@"(\d+.\d+)\s([\w\-\_]+)\s([\w\-\_]+)\s([\S\s]+)$",dynamic([1,2,3,4]),Message)
| mv-expand Parser
| extend Epoch = tostring(Parser[0]),
        DeviceName = tostring(Parser[1]),
        LogType = tostring(Parser[2]),
        Substring = tostring(Parser[3])
| extend EpochTimestamp = split(Epoch,".")
| extend EventTimestamp = unixtime_seconds_todatetime(tolong(EpochTimestamp[0]))
| project-away EpochTimestamp, Parser,Message;
let UrlEvents = LogHeader
| where LogType == "urls"
| extend SrcIpAddr = extract(@"src=([0-9\.]+)\:",1,Substring),
        SrcPortNumber = toint(extract(@"src=([0-9\.]+)\:(\d+)\s",2,Substring)),
        DstIpAddr = extract(@"dst=([0-9\.]+)\:",1,Substring),
        DstPortNumber = toint(extract(@"dst=([0-9\.]+)\:(\d+)\s",2,Substring)),
        HttpRequestMethod = extract(@"request: (\w+)\s",1,Substring),
        Url = extract(@"request: (\w+)\s(\S+)",2,Substring)
| project-away Substring;
let FlowEvents = LogHeader
| where LogType contains "flow"
| extend SrcIpAddr = extract(@"src=([0-9\.]+)\s",1,Substring),
        SrcPortNumber = toint(extract(@"sport=(\S+)",1,Substring)),
        SrcMacAddr = tostring(extract(@"mac=(\S+)\s",1,Substring)),
        DstIpAddr = extract(@"dst=([0-9\.]+)\s",1,Substring),
        NetworkProtocol = extract(@"protocol=(\w+)\s",1,Substring),
        DstPortNumber = toint(extract(@"dport=(\S+)",1,Substring)),
        Pattern = extract(@"pattern\: ([\S\s]+)",1,Substring)
| project-away Substring;
let AirMarshallEvents = LogHeader
| where LogType == "airmarshal_events"
| extend EventType = tostring(extract(@"type=(\S+)",1,Substring)),
        Ssid = tostring(extract(@"ssid=\'(\S+)\'",1,Substring)),
        Vap = toint(extract(@"vap=\'(\S+)\'\s",1,Substring)),
        Bssid = tostring(extract(@"bssid=\'(\S+)\'",1,Substring)),
        SrcMacAddr = tostring(extract(@"src=\'(\S+)\'",1,Substring)),
        DstMacAddr = tostring(extract(@"dst=\'(\S+)\'",1,Substring)),
        WiredMacAddr = tostring(extract(@"wired_mac=\'(\S+)\'",1,Substring)),
        Channel = toint(extract(@"channel=\'(\d+)\'",1,Substring)),
        VlanId = toint(extract(@"vlan_id=\'(\d+)\'",1,Substring)),
        Rssi = toint(extract(@"rssi=\'(\d+)\'",1,Substring)),
        FcType = toint(extract(@"fc_type=\'(\S+)\'",1,Substring)),
        FcSubType = toint(extract(@"fc_subtype=\'(\S+)\'",1,Substring))
| project-away Substring;
let SecurityEvents = LogHeader
| where LogType == "security_event"
| extend EventType = tostring(extract(@"^(\S+)\s\w+\:",1,Substring)),
        Signature = tostring(extract(@"signature=(\S+)\s",1,Substring)),
        Url = tostring(extract(@"url=(\S+)\s",1,Substring)),
        Priority = toint(extract(@"priority=(\d+)\s",1,Substring)),
        EventEpoch = tostring(extract(@"timestamp=(\S+)\s",1,Substring)),
        SrcMacAddr = tostring(extract(@"shost=(\S+)\s",1,Substring)),
        DstMacAddr = tostring(extract(@"dhost=(\S+)\s",1,Substring)),
        NetworkDirection = tostring(extract(@"direction=(\S+)",1,Substring)),
        SrcIpAddr = extract(@"src=([0-9\.]+)\:",1,Substring),
        SrcPortNumber = toint(extract(@"src=([0-9\.]+)\:(\d+)",2,Substring)),
        DstIpAddr = extract(@"dst=([0-9\.]+)\:",1,Substring),
        DstPortNumber = toint(extract(@"dst=([0-9\.]+)\:(\d+)",2,Substring)),
        NetworkProtocol = tostring(extract(@"protocol=(\w+)\s",1,Substring)),
        Action = tostring(extract(@"action=(\w+)",1,Substring)),
        Disposition = tostring(extract(@"disposition=(\w+)",1,Substring)),
        Message = tostring(extract(@"message: ([\w\.\-\+\,\s]+)(\s\w+\=)?",1,Substring)),
        Sha256 = tostring(extract(@"sha256(\S+)?",1,Substring))
| extend EventEpochTimestamp = split(EventEpoch,".")
| extend LogTimestamp = unixtime_seconds_todatetime(tolong(EventEpochTimestamp[0]))
| project-away EventEpochTimestamp, Substring;
let IDSAlerts = LogHeader
| where LogType == "ids-alerts"
| extend Signature = tostring(extract(@"signature=(\S+)\s",1,Substring)),
        Priority = toint(extract(@"priority=(\d+)\s",1,Substring)),
        EventEpoch = tostring(extract(@"timestamp=(\S+)\s",1,Substring)),
        NetworkDirection = tostring(extract(@"direction=(\S+)",1,Substring)),
        NetworkProtocol = tostring(extract(@"protocol=(\w+)\s",1,Substring)),
        SrcIpAddr = extract(@"src=([0-9\.]+)\:",1,Substring),
        SrcPortNumber = toint(extract(@"src=([0-9\.]+)\:(\d+)",2,Substring))
| extend EventEpochTimestamp = split(EventEpoch,".")
| extend LogTimestamp = unixtime_seconds_todatetime(tolong(EventEpochTimestamp[0]))
| project-away EventEpochTimestamp, Substring;
let EventLogs = LogHeader
| where LogType == "events"
| extend EventType = tostring(extract(@"type=(\S+)",1,Substring)),
        VpnType = tostring(extract(@"vpn_type=\'(\S+)\'",1,Substring)),
        SrcIpAddr = extract(@"(peer_contact|ip_src)=\'([0-9\.]+)\:",2,Substring),
        SrcPortNumber = toint(extract(@"(peer_contact|ip_src)=\'([0-9\.]+)\:(\d+)\'",3,Substring)),
        PeerIdentity = tostring(extract(@"peer_ident=\'(\S+)\'",1,Substring)),
        Radio = toint(extract(@"radio=\'(\d+)\'",1,Substring)),
        Vap = toint(extract(@"vap=\'(\S+)\'\s",1,Substring)),
        Group = toint(extract(@"group=\'(\S+)?\'",1,Substring)),
        Attribute = toint(extract(@"attr=\'(\S+)?\'",1,Substring)),
        ClientMacAddr = tostring(extract(@"client_mac=\'(\S+)\'",1,Substring)),
        Channel = toint(extract(@"channel=\'(\S+)\'",1,Substring)),
        Reason = toint(extract(@"reason=\'(\S+)\'",1,Substring)),
        AppleDaReason = toint(extract(@"apple_da_reason=\'(\S+)\'",1,Substring)),
        Instigator = toint(extract(@"instigator=\'(\S+)\'",1,Substring)),
        Duration = tostring(extract(@"duration=\'(\S+)\'",1,Substring)),
        FullConn = tostring(extract(@"full_conn=\'(\S+)\'",1,Substring)),
        IpResp = tostring(extract(@"ip_resp=\'(\S+)\'\s",1,Substring)),
        HttpResp = tostring(extract(@"http_resp=\'(\S+)\'",1,Substring)),
        ArpResp = tostring(extract(@"arp_resp=\'(\S+)\'",1,Substring)),
        ArpSrcIpAddr = tostring(extract(@"arp_src=\'(\S+)\'",1,Substring)),
        Connectivity = tostring(extract(@"connectivity=\'(\S+)\'",1,Substring)),
        Rtt = tostring(extract(@"rtt=\'([\w+\.\s]+)\'",1,Substring)),
        UserName = tostring(extract(@"identity=\'(\S+)\'",1,Substring)),
        Aid = tostring(extract(@"aid=\'(\S+)\'",1,Substring)),
        Spi = tostring(extract(@"spi=(\S+)$",1,Substring)),
        DvcMacAddr = tostring(extract(@"device=\'(\S+)\'",1,Substring)),
        State = tostring(extract(@"state=\'(\S+)\'",1,Substring)),
        AlarmId = toint(extract(@"alarm_id=\'(\S+)\'",1,Substring)),
        DosCount = tostring(extract(@"dos_count=\'(\S+)\'",1,Substring)),
        InterArrival = tostring(extract(@"inter_arrival=\'(\S+)\'",1,Substring))
| extend IpAddr = tostring(extract(@"dhcp lease of ip ([\d\.]+)", 1, Substring)),
        ServerMacAddr = tostring(extract(@"server mac ([\w\:]+)", 1, Substring)),
        ClientMacAddr = iif(isempty(ClientMacAddr), tostring(extract(@"client mac ([\w\:]+)", 1, Substring)), ClientMacAddr),
        RouterIpAddr = tostring(extract(@"router ([\d\.]+)", 1, Substring)),
        Subnet = tostring(extract(@"subnet ([\d\.]+)", 1, Substring)),
        Dns = split(extract(@"dns ([\d\.\,\:\s]+)", 1, Substring), ", "),
        SrcPortNumber = iif(isempty(SrcPortNumber), toint(extract(@"port=\'(\S+)\'",1,Substring)), SrcPortNumber)
| extend Dns = iif(Dns[0] == "", "", Dns)
| project-away Substring,RawData, Computer;
let AllOtherLogs = LogHeader
| where LogType !in ("urls", "airmarshal_events","security_event","ids-alerts", "events") and LogType !contains "flow";
union UrlEvents, FlowEvents, AirMarshallEvents, SecurityEvents, IDSAlerts, EventLogs, AllOtherLogs
```

### API 端点
```
GET https://..."
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 17: Cloud Scopes
> 来源: ado-wiki-c-cloud-scopes-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster("https://ascentitystoreprdus.centralus.kusto.windows.net").database("MDCGlobalData").GetCurrentNativeEnvironmentToCloudScopeMapping
| where MdcTenantId in ("{TenantId}")
| where NativeEnvironmentScopeType in ("AzureSubscription", "AwsMasterAccount", "GitHubOrganization", "AwsAccount", "AzureDevOpsOrganization", "GcpProject", "DockersHubOrganization", "GitLabGroup", "JFrogArtifactory", "GcpOrganization")
| project CloudScopeId, DisplayName, NativeEnvironmentScopeId, NativeEnvironmentScopeType
```

---

## Scenario 18: Push Container Image to ACR for VA Results (Lab Setup)
> 来源: ado-wiki-c-training-push-image-for-va.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Create ACR**: Use Azure portal quickstart
2. **Install Docker** on Linux VM:
3. **Login to ACR** (Admin account method):
4. **Pull image** from Docker Hub:
5. **Tag image** for ACR:
6. **Push image** to ACR:
7. **Verify**: Azure Portal > ACR > Services > Repositories > "samples/nginx"

### 脚本命令
```powershell
sudo apt install docker.io
```

```powershell
sudo docker login <ACR_NAME>.azurecr.io
```

```powershell
sudo docker pull nginx
```

---

## Scenario 19: ado-wiki-c-tsg-agent-not-installed-in-cluster.md
> 来源: ado-wiki-c-tsg-agent-not-installed-in-cluster.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. The user enables all SecurityGating toggles as described in the sanity check page (parent page of this section).
2. Once enabled, the Pricing service assign to the customer's subscription the _Managed Identity Federated Identity Credential Contributor_ role alongside the _Kubernetes Agent Operator_ role.
3. Up to 6 hours from the enablement in the dashboard, the agent should be installed. Let's move directly to the end of the flow and look at the Provisioning Service logs:

### Portal 导航路径
- the customer's subscription, on the left pane, choose _Access control (IAM)_ and make sure the role above are assigned (use the filters)

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span  
| where ingestion_time() > ago(3d)  
| where k8s_deployment_name contains "mcagentprovision"  
| where * contains "SubscriptionId"  
| where * contains "ClusterName"  
| project env_time, env_dt_traceId, name, success, OperationResult, customData, resultDescription, k8s_deployment_name
```

---

## Scenario 20: TSG: Map Exporter Failure (DCSPM K8s Agentless Attack Paths)
> 来源: ado-wiki-c-tsg-map-exporter-failure.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- CRI** for engineering team
- CRI if customer disagrees
- CRI if customer disagrees
- CRI for Rome/Defenders team**

### Kusto 诊断查询
**查询 1:**
```kusto
let _azureResourceId = "<Cluster's Azure resource id>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
),
(
    cluster('https://weuornatpkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
)
| count
| project ["Cluster has Components in Map"] = Count > 0
```

**查询 2:**
```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetInsights()
        | where ComponentDefinitionKey == "1f24d55a-df0f-4772-9090-4629c2d6bfff" // exposed to the internet
        | project-rename Insight = Label
    ) on $left.ComponentId == $right.SubjectComponentId
),
(
    cluster('https://weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | join kind=leftouter (
        cluster('https://weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetInsights()
        | where ComponentDefinitionKey == "1f24d55a-df0f-4772-9090-4629c2d6bfff" // exposed to the internet
        | project-rename Insight = Label
    ) on $left.ComponentId == $right.SubjectComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = Name, Insight
```

**查询 3:**
```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | project-rename PodComponentId = ComponentId, PodName = Name
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | where ComponentDefinitionKey == "582c14e9-48c1-4b25-ab93-91bdeaf9120c" // routes traffic to
        | project-rename SourceServiceComponentId = SourceNodeComponentId, TargetPodComponentId = TargetNodeComponentId
    ) on $left.PodComponentId == $right.TargetPodComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "K8s-service"
        | extend ServiceType = tostring(EntityIdentifiers.subKind)
        | project-rename ServiceComponentId = ComponentId, ServiceName = Name
    ) on $left.SourceServiceComponentId == $right.ServiceComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | where ComponentDefinitionKey == "582c14e9-48c1-4b25-ab93-91bdeaf9120c"
        | project-rename SourceIngressComponentId = SourceNodeComponentId, TargetServiceComponentId = TargetNodeComponentId
    ) on $left.ServiceComponentId == $right.TargetServiceComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "K8s-ingress"
        | project-rename IngressComponentId = ComponentId, IngressName = Name
    ) on $left.SourceIngressComponentId == $right.IngressComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = PodName, ["Routing Service Type"] = ServiceType, 
    ["Routing Service Name"] = ServiceName, ["Routing Ingress Name"] = IngressName
```

**查询 4:**
```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | project-rename PodComponentId = ComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | project-rename SourcePodComponentId = SourceNodeComponentId, TargetContainerComponentId = TargetNodeComponentId
    ) on $left.PodComponentId == $right.SourcePodComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "container"
        | project-rename ContainerComponentId = ComponentId, ContainerName=Name
    ) on $left.TargetContainerComponentId == $right.ContainerComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | project-rename SourceContainerComponentId = SourceNodeComponentId, TargetImageComponentId = TargetNodeComponentId
    ) on $left.ContainerComponentId == $right.SourceContainerComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "container-image"
        | extend ImageName = tostring(EntityIdentifiers.imageId)
        | project-rename ImageComponentId = ComponentId
    ) on $left.TargetImageComponentId == $right.ImageComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetInsights()
        | where
            ComponentDefinitionKey == "19fa13e9-1909-4745-b494-0e7a36bdd17d"      // has high severity vulnerabilities
            or ComponentDefinitionKey == "e3de1cc0-f4dd-3b34-e496-8b5381ba2d70"   // vulnerable to remote code execution
        | project-rename Insight = Label
    ) on $left.ImageComponentId == $right.SubjectComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = Name, ["Container Name"] = ContainerName, ["Image Name"] = ImageName, Insight
```

---

## Scenario 21: ado-wiki-c-tsg-phoenix-oci-message-processing-takes-too-long.md
> 来源: ado-wiki-c-tsg-phoenix-oci-message-processing-takes-too-long.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Check the CPU load, Deployed pod count and Message processing time graphs in the Grafana dashboard. Are any changes noticable?
2. Query Kusto to identify operations that take noticably long times, that can give a hint for the long times:

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
| where (k8s_pod_name startswith "ociartifactpublisher") and TIMESTAMP > ago(1hr)
| summarize P50 = percentile(durationMs, 50), P95 = percentile(durationMs, 95) by name
| order by P50
```

---

## Scenario 22: ado-wiki-c-tsg-phoenix-oci-no-successful-message-processing.md
> 来源: ado-wiki-c-tsg-phoenix-oci-no-successful-message-processing.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Consume messages from the _publish-topic/registry-publisher-subscription_ ServiceBus subscription. The messages are generated by Phoenix Assessor component.
2. Read assessments from Azure storage.
3. Obtain registry access token through Pricing Identity service.
4. Push the assessment to registry.
5. Generate assessment signature using the ESRP system.
6. If no messages arrive, investigate why.
7. If all message processing fails, check Grafana dashboard for hint on error reasons. Also, check error logs as below:

### Kusto 诊断查询
**查询 1:**
```kusto
(cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents | extend Geo = "US")
     | union (cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents | extend Geo = "EU")
     | where GeneratedTimestamp > ago(1h) and Component == "Assessor" and LifeCycleEvent == 'SentToPublishStep'
     | take 100
```

**查询 2:**
```kusto
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
     | where (k8s_pod_name startswith "ociartifactpublisher") and TIMESTAMP > ago(1hr) and success == False
     | summarize count() by name
```

**查询 3:**
```kusto
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span
     | where (k8s_pod_name startswith "ociartifactpublisher") and TIMESTAMP > ago(1hr)
     | where success == False and name == "InstrumentedServiceBusProcessor.ProcessMessageWrapper"
     | take 100
```

---

## Scenario 23: Recovering Watchlist
> 来源: ado-wiki-c-watchlist-how-to-recover.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Get Watchlist's alias.
2. Get the user object id that deleted the Watchlist.
3. Use query below
4. Export the result to CSV.
5. Advise customer, Using LastUpdatedTimeUTC remove old and unrequired columns.
6. Create new CSV with WatchlistItems only.
7. Create new Watchlist using CSV file you just created.

---

## Scenario 24: MDC Jarvis & Kusto Access Reference
> 来源: onenote-jarvis-kusto-reference.md | 适用: Mooncake ✅

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 25: Security Incident Handling — Common Talking Points
> 来源: onenote-security-common-talking-points.md | 适用: Mooncake ✅

### 排查步骤
1. Investigation and analysis of malware on an environment
2. Investigation and analysis of alerts and events reported by security products
3. Investigation on Determined Human Adversary (DHA) compromises
4. Security Bulletins (SSIRPs), Vulnerability Events

### Portal 导航路径
- direct internet access to VM

### Kusto 诊断查询
**查询 1:**
```kusto
// SSH brute force detection
Syslog
| where Computer =~ '<VM_name>' and TimeGenerated > ago(60d)
| where SyslogMessage contains "Failed password for"
| where ProcessName =~ "sshd"
| parse kind=relaxed SyslogMessage with * "Failed password for " user " from " ip " port" port " ssh2"
| summarize PerHourCount = count() by ip, bin(TimeGenerated, 1h), user, Computer
| where PerHourCount > 10
```

---
