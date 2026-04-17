# Monitor Application Insights 数据摄取

**Entries**: 16 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights geolocation mapping (client_City, client_StateOrProvince... | Geolocation lookup chain (Vercara -> Interflow -> Ingestion service) can have... | Investigation flow: 1) Check 3rd-party geo services (Maxmind/iplocation.net) ... | 8.5 | ADO Wiki |
| 2 | Application Insights telemetry name resolution fails with NXDOMAIN errors eve... | A stale or unused Private DNS Zone linked to the VNET intercepts the *.privat... | Option 1: Remove the VNET link between the stale Private DNS Zone and the VNE... | 8.5 | ADO Wiki |
| 3 | Application Insights Requests table client_Ip field shows the proxy/load bala... | X-Forwarded-For header is present and Application Insights by design takes th... | Use TelemetryInitializer to intercept telemetry payload, parse the first (lef... | 8.5 | ADO Wiki |
| 4 | Customer reports data latency query shows telemetry took 2+ days (sometimes 8... | Internal KCM service moves App Insights data between Kusto databases (e.g., f... | No fix available. Inform customer that ingestion_time() was reset by internal... | 8.5 | ADO Wiki |
| 5 | Cloud/App Role Names randomly disappear in Application Insights Performance o... | Application Insights Standard Metrics have a hard limit of 100 unique dimensi... | Reduce the number of unique cloud/app role names emitting telemetry to a sing... | 8.5 | ADO Wiki |
| 6 | No telemetry data appearing in Application Insights. Self-diagnostics logs sh... | DNS resolution failure for the Application Insights ingestion endpoint (e.g.,... | 1) Verify DNS resolution from the application host: nslookup <region>.in.appl... | 8.5 | ADO Wiki |
| 7 | Application Insights ingestion endpoint rejects telemetry items with timestam... | The timestamp in the telemetry payload exceeds the 48-hour ingestion window. ... | Ensure the time field in the telemetry payload is within the last 48 hours (I... | 8.5 | ADO Wiki |
| 8 | Application Insights endpoint resolves to unexpected IP address - nslookup sh... | AMPLS (Azure Monitor Private Link Scope) modifies the DNS CNAME chain: *.priv... | Examine nslookup CNAME chain aliases: without AMPLS, resolution goes through ... | 8.5 | ADO Wiki |
| 9 | App Service web app fails to resolve Application Insights ingestion endpoint ... | Custom DNS server configured via WEBSITE_DNS_SERVER environment variable in A... | Check App Service Environment Variables for WEBSITE_DNS_SERVER setting. If se... | 8.5 | ADO Wiki |
| 10 | GET request to Application Insights ingestion endpoint (e.g. eastus-3.in.appl... | Application Insights ingestion endpoints are designed to accept only HTTP POS... | A 404 response to a GET request against an App Insights ingestion endpoint is... | 8.5 | ADO Wiki |
| 11 | App Service web app stops sending telemetry to Application Insights after con... | The custom DNS server specified in the WEBSITE_DNS_SERVER App Service environ... | 1. Open App Service Console blade → run 'nameresolver <regional-endpoint>.in.... | 8.5 | ADO Wiki |
| 12 | Application fails to send telemetry to Application Insights ingestion endpoin... | Application Insights ingestion endpoints no longer support TLS 1.0, TLS 1.1, ... | Ensure the application uses TLS 1.2 or TLS 1.3. In PowerShell: [System.Net.Se... | 8.5 | ADO Wiki |
| 13 | Intermittent or partial telemetry loss; some telemetry fields appear stripped... | Data Collection Rules (DCRs) with Workspace Transforms configured on the Log ... | Run Telemetry Flow Diagnostic Script to detect active DCRs. Review DCR transf... | 8.5 | ADO Wiki |
| 14 | Application Insights telemetry not flowing from VNET-integrated App Service w... | DNS resolution failure for App Insights endpoints within the VNET — custom DN... | 1. Use AppLens 'VNet Integration DNS Logs' detector to identify which App Ins... | 7.5 | ADO Wiki |
| 15 | Application Insights Breeze ingestion endpoints do not support IPv6 - custome... | By design - Application Insights ingestion endpoints currently only support I... | No workaround available. IPv6 ingestion support is on the product roadmap (ro... | 7.5 | ADO Wiki |
| 16 | Application Insights telemetry appears delayed; IngestionTime field shows lar... | Changing retention settings on a Log Analytics table causes the IngestionTime... | Verify if retention settings were recently changed. If so, the delay is cosme... | 7.5 | ADO Wiki |
