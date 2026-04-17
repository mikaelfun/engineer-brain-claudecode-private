# Monitor Application Insights 可用性测试 - Comprehensive Troubleshooting Guide

**Entries**: 25 | **Drafts fused**: 9 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-ASC-Features-for-Availability-Tests.md, ado-wiki-a-Availability-Test-Architecture.md, ado-wiki-a-Availability-Test-creation-process.md, ado-wiki-a-Availability-Test-Location-Recommendation.md, ado-wiki-a-validate-availability-test-alerts.md, ado-wiki-b-find-metricalert-associated-with-availability-test.md, ado-wiki-d-custom-availability-tests-azure-functions.md, ado-wiki-e-use-component-web-tests-tab.md, onenote-app-insights-custom-availability-test.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights availability test failing with 'The remote name could not be resolved' error

**Solution**: Check DNS registration using resolve-dnsname (PowerShell), nslookup, or mxtoolbox.com. Ensure the DNS record is publicly discoverable. If DNS server issues found, investigate the DNS server associated with the domain.

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Application Insights availability test failing with 'This url is not supported' error

**Solution**: Ensure hostname resolves to a public IP, not private IP ranges. Customer must allowlist Azure Monitor availability test IPs (see 'IP addresses used by Azure Monitor' doc). For connection timeout errors, test with another known URL to isolate service-side vs customer-side issues.

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Cannot use standard Application Insights Availability Tests because the target URL is not publicly accessible on the internet

**Solution**: Use custom availability tests: (1) Azure Function with TrackAvailability() API for endpoints in Azure VNETs — link the Function App to the same subnet; (2) For on-prem scenarios without Private Link, use a PowerShell 7 script with the Application Insights SDK (Microsoft.ApplicationInsights.dll) c...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Starting, stopping, or creating an Availability Test in Application Insights can take several minutes to take effect. Stopping a test may still result in one or more additional test runs before the...

**Solution**: No workaround. This is by-design behavior. Set customer expectation that status changes may take several minutes to propagate to all test regions.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: After renaming or moving an Application Insights resource, ARM operations to update Availability web test metric-based alerts fail because the alert still references the old component resource URI

**Solution**: Manually update the metric-based alert ARM template to reference the new component resource URI (update the components_externalid parameter from the old name to the new name)

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights availability test failing with 'The remote name could no... | The URL used in the availability test has a DNS name that is not publicly reg... | Check DNS registration using resolve-dnsname (PowerShell), nslookup, or mxtoo... | 8.5 | ADO Wiki |
| 2 | Application Insights availability test failing with 'This url is not supporte... | The hostname resolves to a private IP address (RFC 1918 range). Availability ... | Ensure hostname resolves to a public IP, not private IP ranges. Customer must... | 8.5 | ADO Wiki |
| 3 | Cannot use standard Application Insights Availability Tests because the targe... | Standard Availability Tests require public internet access to the monitored e... | Use custom availability tests: (1) Azure Function with TrackAvailability() AP... | 8.5 | ADO Wiki |
| 4 | Starting, stopping, or creating an Availability Test in Application Insights ... | By Design. There is a queueing mechanism to notify the backend instances runn... | No workaround. This is by-design behavior. Set customer expectation that stat... | 8.5 | ADO Wiki |
| 5 | After renaming or moving an Application Insights resource, ARM operations to ... | Rename/move operations change the Application Insights resource URI, but the ... | Manually update the metric-based alert ARM template to reference the new comp... | 8.5 | ADO Wiki |
| 6 | Application Insights Availability web tests suddenly fail in a specific regio... | FedRAMP-mandated TLS 1.3 migration on Availability Test service infrastructur... | Fix TLS 1.3 configuration on the target web server per RFC 8446. Temporary mi... | 8.5 | ADO Wiki |
| 7 | ASC WebTest Results tab returns 'System.ArgumentNullException: Value cannot b... | The 'Is this a failed result?' checkbox is not checked when querying a failed... | Check the 'Is this a failed result?' checkbox in the WebTest Results tab when... | 8.5 | ADO Wiki |
| 8 | Application Insights Availability Ping or Standard Tests return failures (e.g... | Some web servers (notably NGINX) reject requests whose User-Agent is 'Mozilla... | Customers must configure their web server to allow requests with the Availabi... | 8.5 | ADO Wiki |
| 9 | Customer receives an Availability Test alert notification but all monitored s... | All Availability Standard Tests include a proactive SSL certificate lifetime ... | 1. Validate alert cause via webtest Results tab in the portal. 2. Query avail... | 8.5 | ADO Wiki |
| 10 | Application Insights availability test reports failure for a URL that appears... | The URL configured in the availability test is not accessible from the public... | 1) Ensure the URL's DNS is publicly resolvable (any machine on the public int... | 8.5 | ADO Wiki |
| 11 | Application Insights availability test consistently or sporadically fails fro... | Three common causes: (1) The Azure VMs running availability tests in that reg... | 1) Verify the site is accessible from the affected regions (test from outside... | 8.5 | ADO Wiki |
| 12 | Application Insights availability test alerts firing frequently with false po... | Too few test locations configured (less than the recommended minimum of 5). W... | 1) Configure at least 5 test locations (minimum recommendation). 2) Set alert... | 8.5 | ADO Wiki |
| 13 | Noisy synthetic request telemetry from Availability Tests inflating ingestion... | No telemetry processor configured to filter out synthetic source requests gen... | Create ITelemetryProcessor (SyntheticRequestFilter) checking RequestTelemetry... | 8.5 | ADO Wiki |
| 14 | Application Insights Availability test starts failing for a URL endpoint afte... | Azure is retiring TLS 1.0, 1.1, and legacy TLS 1.2 cipher suites/elliptical c... | 1) Verify endpoint TLS support using ssllabs.com/ssltest/. 2) Ensure endpoint... | 8.5 | ADO Wiki |
| 15 | Not receiving email notifications from Application Insights Availability Test... | Multiple possible causes: 1) Alert rule conditions not actually met (threshol... | 1) Validate alert conditions: check if the alert actually fired using Alert H... | 8.5 | ADO Wiki |
| 16 | Classic URL ping test retirement notice - need to migrate availability tests ... | Classic URL ping tests retiring September 30, 2026. No automated migration co... | Follow MS Learn availability-test-migration. Check pricing changes. Use Power... | 8.5 | ADO Wiki |
| 17 | Application Insights availability test (URL ping, multi-step test) not availa... | Availability test feature is not supported in Mooncake (Azure China). Only Co... | Implement custom availability test using TimerTrigger Azure Function with App... | 8.0 | OneNote |
| 18 | Availability Test starts failing consistently in one region with ~21000ms TCP... | Cause unclear; indications suggest an Azure-side issue with the availability ... | No permanent resolution available. Mitigation: Remove the failing region from... | 7.5 | ADO Wiki |
| 19 | Application Insights availability tests reporting failures; customer unsure w... | Underlying App Service resource experiencing downtime, restarts, high CPU, or... | Review AppLens detectors for the customer's App Service resource to correlate... | 6.5 | ADO Wiki |
| 20 | Availability test fails with DNS resolution error: The remote name could not ... | Misconfigured DNS records or temporary DNS server failures | Verify DNS records for the target URL; check for transient DNS outages; ensur... | 6.5 | MS Learn |
| 21 | Availability test fails at connection establishment: connected party did not ... | Server firewall blocking test agents; server not responding to HTTP requests | Add the Availability service tag to firewall/NSG rules to allow test agent IPs | 6.5 | MS Learn |
| 22 | Availability test fails at TLS transport: client and server cannot communicat... | Endpoint uses unsupported TLS version (only TLS 1.2 and 1.3 supported); SSL n... | Ensure endpoint supports TLS 1.2 or 1.3; check TLS 1.3 regional restrictions ... | 6.5 | MS Learn |
| 23 | Availability test content validation fails: required text did not appear in t... | Content match is case-sensitive and exact; fails if response body exceeds 1MB... | Use exact case-sensitive match string; keep response under 1MB; update match ... | 6.5 | MS Learn |
| 24 | Application Insights availability test intermittently fails with protocol vio... | Malformed HTTP response headers not using CRLF line endings; caused by load b... | Inspect response headers for CRLF violations; fix server/load balancer/CDN he... | 6.5 | MS Learn |
| 25 | Cannot run Application Insights availability tests on internal server behind ... | Firewall blocks incoming requests from availability test agent IP addresses | Option 1: Whitelist web test agent IPs in firewall. Option 2: Use TrackAvaila... | 6.5 | MS Learn |
