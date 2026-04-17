# Monitor Application Insights 综合问题 - Comprehensive Troubleshooting Guide

**Entries**: 66 | **Drafts fused**: 31 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-asc-component-properties-tab.md, ado-wiki-a-ASC-Get-AAD-Object-Info.md, ado-wiki-a-ASC-Get-AAD-User-Info.md, ado-wiki-a-ASC-Get-ResourceId.md, ado-wiki-a-ASC-Navigate-To-Resource.md, ado-wiki-a-ASC-Open-From-Case-Management.md, ado-wiki-a-ASC-Query-Azure-Resource-Graph.md, ado-wiki-a-asc-query-customer-data-tab.md, ado-wiki-a-asc-webtest-executions-tab.md, ado-wiki-a-asc-webtests-properties-tab.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights in Mooncake can record trace but not request telemetry. Customer manually creates TelemetryClient without proper DI setup.

**Solution**: Use ASP.NET Core dependency injection in Startup.ConfigureServices: 1) Configure QuickPulseTelemetryModule endpoint: https://live.applicationinsights.azure.cn/QuickPulseService.svc 2) Configure ApplicationInsightsApplicationIdProvider: https://dc.applicationinsights.azure.cn/api/profiles/{0}/appI...

`[Source: OneNote, Score: 9.0]`

### Step 2: APIM Self-hosted gateway on AKS in Mooncake cannot send request logs to Application Insights. Same configuration works in Global Azure.

**Solution**: Add logs.applicationinsights.endpoint config to Self-gateway ConfigMap YAML: logs.applicationinsights.endpoint: https://dc.applicationinsights.azure.cn/v2/track. Redeploy Self-gateway on AKS.

`[Source: OneNote, Score: 9.0]`

### Step 3: Application Insights portal blade shows 'Error retrieving data' message

**Solution**: Ensure the user has Reader role RBAC access on the Application Insights resource. Contributor role is NOT sufficient for data retrieval.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Entra ID authentication for Application Insights using Service Principal fails with AADSTS53003 'Access has been blocked by Conditional Access policies' when running from home or remote location (i...

**Solution**: Install, enable and connect to the MSFT-AzVPN-Manual VPN before running the application. Once connected, the SPN token acquisition will succeed. See aka.ms/AzureVPN for setup instructions.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Attempts to create or update tags on Application Insights resources fail with 500 InternalServerError containing AADSTS7000112: Application Insights Configuration Service (AppId 6a0a243c-0886-468a-...

**Solution**: Re-enable the Application Insights Configuration Service enterprise application in Microsoft Entra ID. Guidance: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/disable-user-sign-in-portal

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights in Mooncake can record trace but not request telemetry. ... | In Mooncake, Application Insights requires Code Base approach (Codeless not s... | Use ASP.NET Core dependency injection in Startup.ConfigureServices: 1) Config... | 9.0 | OneNote |
| 2 | APIM Self-hosted gateway on AKS in Mooncake cannot send request logs to Appli... | APIM Self-gateway container uses hardcoded Global telemetry endpoint (https:/... | Add logs.applicationinsights.endpoint config to Self-gateway ConfigMap YAML: ... | 9.0 | OneNote |
| 3 | Application Insights portal blade shows 'Error retrieving data' message | User only has Contributor role but is missing Reader role RBAC access on the ... | Ensure the user has Reader role RBAC access on the Application Insights resou... | 8.5 | ADO Wiki |
| 4 | Entra ID authentication for Application Insights using Service Principal fail... | Microsoft's internal Conditional Access policy blocks Service Principal token... | Install, enable and connect to the MSFT-AzVPN-Manual VPN before running the a... | 8.5 | ADO Wiki |
| 5 | Attempts to create or update tags on Application Insights resources fail with... | The Application Insights Configuration Service first-party app has been disab... | Re-enable the Application Insights Configuration Service enterprise applicati... | 8.5 | ADO Wiki |
| 6 | Need to find Application Insights component details (name, subscription, reso... | - | Use Kusto query against the AI backend cluster: ```kql cluster('aibeftprd.kus... | 8.5 | ADO Wiki |
| 7 | Tagging operations (create/update) on Application Insights resources fail wit... | The Application Insights Configuration Service first-party app (App ID: 6a0a2... | Re-enable the Application Insights Configuration Service in Microsoft Entra I... | 8.5 | ADO Wiki |
| 8 | Permission error when creating or enabling Diagnostic Setting on Classic Appl... | Caller lacks Contributor permissions on the Application Insights resource sco... | Grant the user Contributor role on the Application Insights resource, then re... | 8.5 | ADO Wiki |
| 9 | Manually-added performance counter not collected by Application Insights desp... | Counter name may be incorrect, counter doesn't exist on the system, or the co... | 1) Use Get-Counter PowerShell to validate counter exists and name is correct.... | 8.5 | ADO Wiki |
| 10 | Application Insights resource (component, webtest, alertrule) not visible in ... | ARM cache inconsistency — tracked resources are cached by ARM Frontdoor for p... | 1) Check current ARM cache state: Jarvis → 'Azure Resource Manager > Resource... | 8.5 | ADO Wiki |
| 11 | ARM cache out of sync: resource created but not visible in portal; deleted re... | ARM internal storage (tracked resource cache) is out of sync with the resourc... | Preferred (fastest): Jarvis → 'Azure Resource Manager > Resource Synchronizat... | 8.5 | ADO Wiki |
| 12 | AMPLS - VMs on VNET cannot resolve App Insights / Log Analytics / Azure Monit... | When removing AI/LA from AMPLS, A-Records in Private DNS Zones are deleted bu... | Three options: (1) Delete Virtual Network Links and/or Private DNS Zones (onl... | 8.5 | ADO Wiki |
| 13 | Visual Studio CodeLens method annotations for Application Insights show zero ... | Two issues: 1) The VS extension's KQL queries contain '\r\n' newline characte... | 1) Add both <ApplicationInsightsResourceId> and <ApplicationInsightsAnnotatio... | 8.5 | ADO Wiki |
| 14 | Adding Azure Monitor resource to AMPLS exhausts subnet IPs; provisioning gets... | Subnet too small (e.g. /27) to accommodate all required DNS-to-IP mappings fo... | 1) Remove the resource that caused IP exhaustion; 2) Add a larger subnet (e.g... | 8.5 | ADO Wiki |
| 15 | Adding resource to AMPLS while previous resource still provisioning breaks al... | NRP recreate private endpoints job uses different configuration than current ... | Add or remove any resource from the AMPLS to trigger a 'refresh' that gives t... | 8.5 | ADO Wiki |
| 16 | Duplicated Exception telemetry from API Management service into Application I... | Bug in a gateway component within APIM's infrastructure that duplicates excep... | Known APIM bug. Work item Bug 18434395 exists for APIM team to fix. Reference... | 8.5 | ADO Wiki |
| 17 | PowerShell Update-AzApplicationInsights cmdlet strips existing Tags from Appl... | Bug in Azure PowerShell code: spelling error 'AddtionalProperties' instead of... | Workaround: Retrieve current tags first using Get-AzApplicationInsights, stor... | 8.5 | ADO Wiki |
| 18 | String values in dynamic fields (customDimensions/Properties) automatically c... | By design: Kusto auto-parses string values in dynamic fields that match suppo... | Workaround: break the regex pattern Kusto uses for auto-parsing, e.g., prefix... | 8.5 | ADO Wiki |
| 19 | Slack CloudBot for Azure add-on fails when connecting to Application Insights... | Conflict querying telemetry from backend Log Analytics workspace. Common caus... | Ensure backend LA workspace exists and can accept API key queries. Set Access... | 8.5 | ADO Wiki |
| 20 | Exception telemetry duplicated when API Management (APIM) sends telemetry to ... | Bug in APIM gateway component causes exception telemetry to be recorded twice... | APIM team bug fix pending (Bug 18434395). No customer-side workaround available. | 8.5 | ADO Wiki |
| 21 | Running Update-AzApplicationInsights PowerShell cmdlet clears all existing Ta... | Typo in Azure PowerShell code: AddtionalProperties instead of AdditionalPrope... | Workaround: retrieve current Tags via Get-AzApplicationInsights, build hashta... | 8.5 | ADO Wiki |
| 22 | Unexpected latency (up to 24h, typically 30-90 min) in telemetry arriving at ... | By design. Power Platform Data Export has documented SLA of up to 24h latency... | No fix. Identify source via cloud_RoleName = CDS Data Export. If server-side ... | 8.5 | ADO Wiki |
| 23 | Deployment fails in West Europe region with error 'The selected region is cur... | ARM Region Access System Policy applied to West Europe due to power/capacity ... | Transfer case to SAP: Azure/Service and subscription limits (quotas)/Unable t... | 8.5 | ADO Wiki |
| 24 | Application Insights metric alerts show 'Other Values' aggregation for Cloud ... | Application Insights Standard Metrics enforce a limit of 100 unique values pe... | Replace or supplement metric alerts with log-based alerts (using AppRequests ... | 8.5 | ADO Wiki |
| 25 | Application Insights autoinstrumentation for .NET Core fails silently — missi... | Customer modified hosting startup assembly settings (e.g. set ASPNETCORE_HOST... | Ensure ASPNETCORE_HOSTINGSTARTUPASSEMBLIES includes 'Microsoft.ApplicationIns... | 8.5 | ADO Wiki |
| 26 | Cloud/App Role Names (AppRoleName/cloud_RoleName) randomly disappear in Appli... | Application Insights Standard Metrics enforces a limit of 100 unique dimensio... | Reduce unique cloud/app role names to fewer than 100 per Application Insights... | 8.5 | ADO Wiki |
| 27 | Cloud Role Names aggregating as "Other Values" in Application Insights metric... | Application Insights Standard Metrics limits custom metric dimensions to 100 ... | Replace or supplement metric alerts with log-based alerts, which have access ... | 8.5 | ADO Wiki |
| 28 | Get-AzVMExtension returns ResourceNotFound error (HTTP 404) when checking App... | The -Name parameter passed to Get-AzVMExtension does not match the exact name... | Verify the exact extension name in the VM Extensions + applications blade in ... | 8.5 | ADO Wiki |
| 29 | Get-AzVMExtension returns 'ResourceNotFound' error when checking Application ... | The -Name parameter value passed to Get-AzVMExtension does not match the actu... | Check the actual extension name in the VM's 'Extensions + applications' blade... | 8.5 | ADO Wiki |
| 30 | Java Application Insights SDK starts successfully but no telemetry data recei... | JVM does not have any of the TLS cipher suites supported by the Application I... | Update JVM to a version that supports required TLS cipher suites, or manually... | 8.5 | ADO Wiki |
| 31 | No telemetry data in Application Insights; self-diagnostics log indicates inv... | Instrumentation key or connection string configured in the SDK does not match... | Verify and correct the instrumentation key or connection string in SDK config... | 8.5 | ADO Wiki |
| 32 | End-to-End transaction view shows total operation duration significantly long... | The gap between total operation duration and tracked dependency durations is ... | Check application code for synchronous/blocking calls between dependency oper... | 8.5 | ADO Wiki |
| 33 | End-to-End transaction view shows total request duration significantly longer... | Application code executing in-process between tracked dependency calls (synch... | Review application code for time-consuming in-process operations between depe... | 8.5 | ADO Wiki |
| 34 | Metric Explorer values for Application Insights metrics (e.g., Server request... | Metric Explorer defaults to standard metrics namespace (pre-aggregated MDM wi... | In Metric Explorer select Log-based metrics namespace + Sum aggregation to ma... | 8.5 | ADO Wiki |
| 35 | Visual Studio publish to Azure App Service fails with 'User unauthorized' err... | Internal Azure App Service applications have basic authentication disabled fo... | 1) Update Visual Studio to version 17.5 or newer. 2) If still failing on late... | 8.5 | ADO Wiki |
| 36 | Visual Studio publish to Azure App Service fails with 'User unauthorized' err... | Internal Azure App Service applications have basic authentication disabled fo... | 1) Update Visual Studio to version 17.5 or newer. 2) If still failing on late... | 8.5 | ADO Wiki |
| 37 | Application Insights Availability tests start failing after TLS 1.0/1.1 retir... | The target URL endpoint configured in the Availability test only supports dep... | 1) Verify endpoint TLS support using ssllabs.com/ssltest. 2) Check supported ... | 8.5 | ADO Wiki |
| 38 | Application Insights telemetry shows result code 0, Canceled, or Faulted inst... | Result code 0 = undefined/no response/premature termination. Canceled = reque... | These are application-level dependency call results, not Application Insights... | 8.5 | ADO Wiki |
| 39 | Application Insights shows Result Code 0, Canceled, or Faulted for dependency... | Result Code 0 = undefined/no response (request never completed). Canceled = r... | Investigate the application outbound dependency calls. Code 0 typically means... | 8.5 | ADO Wiki |
| 40 | End-to-end transaction view in Application Insights is missing telemetry or a... | E2E view enforces two limits: max 10,000 telemetry items per operation_Id and... | Use Logs view to query full operation data. Verify limits with KQL: union * /... | 8.5 | ADO Wiki |
| 41 | Application Insights connection string does not contain LiveEndpoint paramete... | QuickPulse (Live Metrics backend) not deployed to every region. If not availa... | Expected behavior. SDKs default to global Live Metrics endpoint (rt.services.... | 8.5 | ADO Wiki |
| 42 | Application Insights availability test limit: cannot create more than 100 ava... | Fixed service limit of 100 availability tests per Application Insights resour... | Create additional Application Insights resources (each allows 100 more tests)... | 8.5 | ADO Wiki |
| 43 | Availability test telemetry shows 'Other values' for test names, locations, o... | Standard metrics cap dimension cardinality at 100 distinct values. Custom Tra... | Ensure client applications emit a fixed set of availability test names and lo... | 8.5 | ADO Wiki |
| 44 | Application Insights data retention period shorter than expected after changi... | Application Insights does not stitch data from a previous LA workspace. Data ... | Data from previous workspace remains accessible only through that workspace. ... | 8.5 | ADO Wiki |
| 45 | Private endpoint for Application Insights AMPLS in failed provisioning state ... | Exhausted subnet IPs or concurrent AMPLS resource additions causing race cond... | Check subnet IP availability, remove and recreate private endpoint. See Known... | 8.5 | ADO Wiki |
| 46 | AMPLS DNS resolves to wrong private IP or no IP address, Application Insights... | Second AMPLS on different network sharing same DNS server overwrote entries, ... | Wrong IP: remove and recreate private endpoint to refresh DNS. No IP: verify ... | 8.5 | ADO Wiki |
| 47 | Need to purge specific telemetry data from Application Insights but no UI opt... | No built-in UI for data purge. Must use Workspace Purge REST API with KQL query | Use Workspace Purge REST API. Test KQL in Logs blade first. Save operation ID... | 8.5 | ADO Wiki |
| 48 | Power BI shows fewer rows than expected from Application Insights query; e.g.... | REST API has dual hard limits: maximum number of rows AND maximum total data ... | Query data in batches to work around API limits. See Azure Monitor Service Li... | 8.5 | ADO Wiki |
| 49 | REST API returns 499 response codes for Application Insights or Log Analytics... | Client times out the request before the draft API returns a response. Caused ... | Extend client-side query timeout. For Grafana, increase default 30-second tim... | 8.5 | ADO Wiki |
| 50 | Application Insights client_IP field shows 0.0.0.0 or blank; no IP address co... | IP collection/unmasking is not enabled by default. Application Insights masks... | Enable IP address collection: https://docs.microsoft.com/azure/azure-monitor/... | 8.5 | ADO Wiki |
| 51 | Custom metrics stop reporting or are dropped in Application Insights; metrics... | Exceeded one of four custom metric limits: 50,000 active time series, 64KB co... | Review metric cardinality and reduce unique dimension value combinations to s... | 8.5 | ADO Wiki |
| 52 | Application Insights Profiler not functioning on containers or IaaS VMs despi... | Environment variable COMPlus_EnableDiagnostics is set to 0, disabling .NET di... | Set environment variable COMPlus_EnableDiagnostics=1 in the container or VM c... | 8.5 | ADO Wiki |
| 53 | Smart detection alert rules accidentally deleted from Application Insights re... | Smart detection alert rules were manually deleted. If the entire resource gro... | 1) Find an existing smart detection alert of the same type (e.g., Failure Ano... | 8.5 | ADO Wiki |
| 54 | Application Map shows unexpected or incorrect application node label (e.g., s... | cloud_RoleName is not set in telemetry. Application Map preferentially uses c... | Configure cloud_RoleName via SDK TelemetryInitializer or WEBSITE_CLOUD_ROLENA... | 8.5 | ADO Wiki |
| 55 | JavaScript SDK telemetry missing or blocked; HAR trace shows track calls with... | CORS blocked by browser (e.g., Edge) due to tracking policy; custom domain no... | Configure Edge browser policy AllowTrackingForUrls to include Application Ins... | 7.5 | ADO Wiki |
| 56 | Cannot find NuGet packages (including Application Insights SDKs) in Visual St... | NuGet package source (nuget.org) not configured in Visual Studio Package Mana... | Add source https://api.nuget.org/v3/index.json in Tools > NuGet Package Manag... | 7.5 | ADO Wiki |
| 57 | App Insights Profiler on Azure Functions fails: COMException Merging of ETL f... | Resource limitations on VM hosting the Function worker, preventing ETL file m... | Workaround: scale App Service plan up/down to move worker to new VM. Check An... | 7.5 | ADO Wiki |
| 58 | Application Insights resource not found or portal shows stale data after ARM ... | ARM cache synchronization delay after control plane operations | Follow ARM cache sync procedure in wiki 'Synchronizing Cache for Caching Issu... | 7.5 | ADO Wiki |
| 59 | 使用 workspace()/app() 跨资源查询时，若参数值使用资源名称（仅名称）或限定名称（subscriptionName/resourceGro... | 资源名称和限定名称两种格式在 cross-workspace 查询中已被废弃，存在歧义（用户有权访问多个同名资源时）和性能问题。公开文档已更新移除这两种推荐方式 | 在 workspace()/app() 函数参数中改用完整 Azure 资源 ID 或 workspace/app ID：推荐使用 workspace I... | 7.0 | ADO Wiki |
| 60 | Deployment fails in West Europe region with error "The selected region is cur... | ARM Region Access System Policy applied at AAD tenant level to manage long-te... | Transfer case to capacity team SAP: Azure/Service and subscription limits (qu... | 6.5 | ADO Wiki |
| 61 | Third-party server rejects App Insights distributed tracing headers breaking ... | Server Access-Control-Allow-Headers missing Request-Id, traceparent, Request-... | Add Request-Id, traceparent, Request-Context to server Access-Control-Allow-H... | 6.5 | MS Learn |
| 62 | Availability test fails with too many redirects: 'This webpage has too many r... | The target URL performs more than 10 redirects. Application Insights availabi... | Reduce the redirect chain to 10 or fewer. Use the direct final URL in the ava... | 6.5 | MS Learn |
| 63 | Availability test fails with 'This URL is not supported' error when testing i... | Availability tests only allow communicating over publicly available IP addres... | Use only public IP addresses in web tests. For internal servers behind firewa... | 6.5 | MS Learn |
| 64 | Application Map incomplete - too many nodes exceeding 10K limit | Too many unique cloud role names or dependency types/targets exceeding Applic... | Set cloud role name properly; use logical dependency targets/types not unique... | 6.5 | MS Learn |
| 65 | Application Map Intelligent View does not load or very slow | Time frame set to more than 6 days, or Update map components selected, or mul... | Set time frame to 6 days or less; do not select Update map components; use si... | 6.5 | MS Learn |
| 66 | Work item creation fails with permission errors in App Insights | Missing Contribute (DevOps) or Write (GitHub) permissions, or PAT missing Wor... | Assign Contribute for DevOps, Write for GitHub; add Work Items read/write sco... | 4.5 | MS Learn |
