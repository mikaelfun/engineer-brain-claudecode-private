# Monitor AMPLS 与 Private Link - Comprehensive Troubleshooting Guide

**Entries**: 32 | **Drafts fused**: 21 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-use-ampls-wiki.md, ado-wiki-ampls-dns-not-resolving.md, ado-wiki-b-ampls-support-boundaries.md, ado-wiki-b-ampls-test-private-link-connection.md, ado-wiki-b-Private-Link-Support-Boundary.md, ado-wiki-c-ampls-errors-running-queries.md, ado-wiki-c-ampls-issues-with-permissions.md, ado-wiki-c-ampls-known-issues.md, ado-wiki-c-ampls-managing-ampls-from-azure-portal.md, ado-wiki-c-ampls-managing-ampls-powershell-cli-rest-api-arm-bicep.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Client resolves Azure Monitor endpoint FQDN to incorrect private IP address when using AMPLS (Azure Monitor Private Link Scope)

**Solution**: 1) Check for other AMPLS resources in subscription via ASC Properties > Private Links 2) Validate expected IP from PE DNS zone records matches nslookup result 3) If mismatch, look for competing AMPLS in peered VNETs or other subscriptions 4) Involve Azure Networking team if source of incorrect IP...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Stale Private DNS Zone preventing proper name resolutions for Application Insights with AMPLS - telemetry ingestion fails due to DNS resolution failure

**Solution**: 1) Validate DNS connectivity for Application Insights endpoints 2) Check Private DNS Zone records for stale entries 3) Update or recreate Private DNS Zone records to match current Private Endpoint IPs 4) Verify resolution with nslookup after cleanup

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: No telemetry data flowing to Application Insights after configuring AMPLS - ingestion endpoint resolves to public IP instead of private IP

**Solution**: 1) Ensure web app/function is on at least a private network with VNET support 2) Upgrade from App Service free tier to a plan that supports VNET Integration (Basic or higher) 3) Configure VNET Integration for the App Service 4) Verify DNS resolution returns private IP after VNET integration

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Resource resolves Azure Monitor endpoint FQDN to a public IP address instead of the expected private IP address within a private-link-enabled VNet

**Solution**: Ensure AMPLS is tied to a Private Endpoint on the same VNet as the client. During PE creation, confirm 'Integrate with private DNS zone' = Yes to auto-register private DNS zones. Run nslookup on the client to confirm the FQDN resolves to the private IP shown in the PE's DNS record sets.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Resource resolves Azure Monitor endpoint FQDN to a private IP but not the expected one (IP mismatch between nslookup result and AMPLS-defined IP)

**Solution**: Follow guiding principle 'Avoid DNS overrides by using a single AMPLS'. In ASC, check App Insights component Properties > Private Links to identify all associated AMPLS resources. Remove the conflicting AMPLS so only one AMPLS covers each VNet. Reference: https://learn.microsoft.com/azure/azure-m...

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Client resolves Azure Monitor endpoint FQDN to incorrect private IP address w... | Multiple AMPLS resources exist on the same VNET or peered VNETs, violating th... | 1) Check for other AMPLS resources in subscription via ASC Properties > Priva... | 8.5 | ADO Wiki |
| 2 | Stale Private DNS Zone preventing proper name resolutions for Application Ins... | Private DNS Zone records become stale/outdated, causing Azure Monitor endpoin... | 1) Validate DNS connectivity for Application Insights endpoints 2) Check Priv... | 8.5 | ADO Wiki |
| 3 | No telemetry data flowing to Application Insights after configuring AMPLS - i... | Web app/function hosted on App Service without VNET support (e.g., free tier)... | 1) Ensure web app/function is on at least a private network with VNET support... | 8.5 | ADO Wiki |
| 4 | Resource resolves Azure Monitor endpoint FQDN to a public IP address instead ... | The VNet is not using the Private DNS zones established by AMPLS and the Priv... | Ensure AMPLS is tied to a Private Endpoint on the same VNet as the client. Du... | 8.5 | ADO Wiki |
| 5 | Resource resolves Azure Monitor endpoint FQDN to a private IP but not the exp... | Another AMPLS resource was added to the same VNet or a peered VNet, creating ... | Follow guiding principle 'Avoid DNS overrides by using a single AMPLS'. In AS... | 8.5 | ADO Wiki |
| 6 | Azure Monitor data ingestion fails; nslookup on the Azure Monitor endpoint re... | A second AMPLS resource was added to the VNet or a peered VNet. AMPLS only al... | 1. In ASC, find the Azure Monitor resource > Properties > Private Links to ge... | 8.5 | ADO Wiki |
| 7 | App/resource on VNet resolves AMPLS-monitored Azure Monitor endpoint FQDN (e.... | Resource not using Private DNS zones within the VNet; AMPLS Private Endpoint ... | Verify AMPLS Private Endpoint is attached to the same VNet as the client reso... | 8.5 | ADO Wiki |
| 8 | nslookup returns a private IP for an Azure Monitor endpoint but not the expec... | Multiple AMPLS resources exist on the same VNet or peered VNets, causing DNS ... | Identify the conflicting AMPLS resource: in ASC check all privateLinkScopes i... | 8.5 | ADO Wiki |
| 9 | AMPLS Hub-Spoke 配置完成后，从 Web App SSH Console 执行 nslookup 发现 App Insights Inges... | AMPLS Private Endpoint 关联的 Private DNS Zone（privatelink.monitor.azure.com）未链接... | 在 AMPLS → Private Endpoint → DNS configuration → privatelink.monitor.azure.co... | 8.5 | ADO Wiki |
| 10 | nslookup / nameresolver.exe returns public IP for Azure Monitor ingestion end... | The App Service or Function App is not using the Private DNS zones within the... | 1. Run nameresolver.exe (Windows App Service/Function App Kudu → Debug Consol... | 8.5 | ADO Wiki |
| 11 | Adding Azure Monitor resource to AMPLS exhausts subnet IPs, all connected res... | Bug in control plane code between AMPLS, CDS and NRP teams. Subnet IP exhaust... | 1) Remove the resource that caused IP exhaustion. 2) Add a larger subnet (e.g... | 8.5 | ADO Wiki |
| 12 | Adding resource to AMPLS while a previous resource is still provisioning brea... | Timing bug: NRP recreates Private Endpoint with a different configuration tha... | Add or remove any resource from the AMPLS to trigger a 'refresh' that re-runs... | 8.5 | ADO Wiki |
| 13 | Creating Private Endpoint for Log Analytics workspace or Application Insights... | Users are trying to directly associate a Private Endpoint to an Azure Monitor... | Create an Azure Monitor Private Link Scope (AMPLS) resource and associate the... | 8.5 | ADO Wiki |
| 14 | No telemetry data in Application Insights; self-diagnostics log shows ingesti... | Application Insights ingestion endpoint cannot be resolved from the applicati... | Verify DNS resolution for ingestion endpoints (*.in.applicationinsights.azure... | 8.5 | ADO Wiki |
| 15 | Unable to connect Azure Managed Grafana to external data source (Prometheus, ... | Grafana outbound IP is dynamic by default and cannot be whitelisted in the de... | Enable the Deterministic Outbound IP feature on the Azure Managed Grafana ins... | 8.5 | ADO Wiki |
| 16 | When creating a new Azure Managed Grafana private endpoint, the SSO private D... | The SSO endpoint (e.g. sso.weu.privatelink.grafana.azure.com) is a global/reg... | No action needed for the overwrite itself - SSO traffic works regardless of w... | 8.5 | ADO Wiki |
| 17 | After deleting a Managed Grafana private endpoint, other Grafana instances sh... | When a private endpoint with DNS integration is deleted, Azure automatically ... | Manually re-add the sso.<region> A record in the private DNS zone pointing to... | 8.5 | ADO Wiki |
| 18 | Microsoft Entra Team Sync settings operation for Azure Managed Grafana fails.... | Public access is disabled on the Grafana instance and the user is accessing t... | 1) If PE exists and public access is disabled: access Portal from a machine w... | 8.5 | ADO Wiki |
| 19 | Under Azure Monitor Private Link Scope (AMPLS), connected Azure Monitor Resou... | Known bug on private endpoint connection causing provisioning state to get st... | Navigate to the Private Endpoint resource associated with the AMPLS (via 'Pri... | 8.5 | ADO Wiki |
| 20 | Under Azure Monitor Private Link Scope (AMPLS), after connecting target compo... | Known bug in private endpoint connection for AMPLS. The private endpoint conn... | Navigate to the Private Endpoint resource associated with the AMPLS (via Priv... | 8.5 | ADO Wiki |
| 21 | Under Azure Monitor Private Link Scope (AMPLS), Azure Monitor Resources shows... | Known bug on private endpoint connection causing scoped resources to get stuc... | 1) Navigate to the Private Endpoint resource associated with the AMPLS (via '... | 8.5 | ADO Wiki |
| 22 | HTTP Data Collector API returns 403 Forbidden when workspace is scoped to Azu... | The workspace has public data ingestion set to Disabled in AMPLS configuratio... | Ensure the request is routed through the VNet associated with AMPLS, or enabl... | 8.5 | ADO Wiki |
| 23 | Data is not flowing or queryable from VNET after configuring Azure Monitor Pr... | DNS not correctly configured for Private Link: Private DNS zone created witho... | 1) Verify VNET has required Private DNS zones attached with no NSGs/firewalls... | 8.5 | ADO Wiki |
| 24 | Cannot send telemetry data from on-premises applications through Azure Monito... | DNS forwarder not configured to forward DNS resolution requests from on-premi... | Configure DNS forwarder per Azure Private Endpoint DNS documentation so that ... | 8.5 | ADO Wiki |
| 25 | Log queries fail with Access to resource is only permitted through an attache... | Network Isolation setting Allow public network access for queries is disabled... | 1) Check Network Isolation settings in ASC or Azure Portal 2) Either configur... | 8.5 | ADO Wiki |
| 26 | Queries from ADX cluster to Azure Monitor workspace via ADX Proxy fail when P... | ADX Proxy queries originate from the ADX cluster which is outside the AMPLS p... | 1) Add the ADX cluster into the customers VNET to enable private access 2) Al... | 8.5 | ADO Wiki |
| 27 | AMA Linux fails to get MSI token; extension stuck in transitioning or data mi... | IMDS endpoint (169.254.169.254) not reachable from the VM due to missing rout... | 1. Test IMDS: curl -s -H Metadata:true --noproxy '*' http://169.254.169.254/m... | 8.5 | ADO Wiki |
| 28 | AMA Linux cannot get MSI token because IMDS (169.254.169.254) unreachable. Be... | No network route to IMDS IP 169.254.169.254, or network configuration (firewa... | Step 1: Test IMDS with curl -s -H Metadata:true --noproxy '*' 'http://169.254... | 8.5 | ADO Wiki |
| 29 | Live Metrics shows 'Not Available: could not connect to your application' dem... | Multiple causes: app not running, SDK/language not supporting Live Metrics, m... | Diagnostic steps: (1) Confirm app running, (2) Check SDK support per docs, (3... | 8.5 | ADO Wiki |
| 30 | AMPLS Private Link 配置完成后，Web App / Function App 中对 Application Insights 端点（dc... | 以下一个或多个配置缺失：(1) Private DNS Zone 中未为 Spoke VNET 添加 Virtual Network Link；(2) S... | 1) 检查 AMPLs → PE → Private DNS Zone 中是否存在针对 Spoke VNET 的 Virtual Network Link... | 7.5 | ADO Wiki |
| 31 | Under Azure Monitor Private Link Scope (AMPLS), connected resources show 'Fai... | Known bug in private endpoint connection causing provisioning state to get st... | Navigate to the Private Endpoint resource associated with the AMPLS (via 'Pri... | 6.0 | ADO Wiki |
| 32 | Under Azure Monitor Private Link Scope (AMPLS), connected resources in Azure ... | Known bug on private endpoint connection causing provisioning state to not up... | Navigate to the Private Endpoint resource associated with the AMPLS (via "Pri... | 6.0 | ADO Wiki |
