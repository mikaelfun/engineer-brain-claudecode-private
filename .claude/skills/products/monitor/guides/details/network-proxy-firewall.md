# Monitor 代理与防火墙配置 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 3 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-Firewall-and-network.md, ado-wiki-b-telemetry-proxy-firewall.md, ado-wiki-i-Checking-Relay-Proxy-on-Log-Analytic-Gateway.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Availability test fails with duration of exactly 21 or 42 seconds, indicating TCP connection timeout from test agent to target endpoint

**Solution**: Configure firewall to allow TCP connections from availability test IPs. Use ApplicationInsightsAvailability service tag for Azure NSGs. Download IP ranges from Azure IP Ranges JSON files.

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL Flexible Server with public network access disabled. Managed Private Endpoint does not list MySQL/PostgreSQL as supported...

**Solution**: Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VNET with AzureFirewallSubnet. Create a Route Table associated with the database subnet routing to the firewall. Create a NAT rule in the firewall translating the firewall public IP to the database private IP on the servic...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL Flexible Server with public network access disabled. Managed Private Endpoint does not list MySQL/PostgreSQL as supported...

**Solution**: Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VNET with AzureFirewallSubnet. Create a Route Table associated with the database subnet routing to the firewall. Create a NAT rule in the firewall translating the firewall public IP to the database private IP on the servic...

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: OpenSSL s_client command to Azure Monitor endpoints (e.g., global.handler.control.monitor.azure.com:443) reports "no peer certificate available" - TLS handshake fails with no server certificate rec...

**Solution**: 1) Verify with network trace that Client Hello is sent but Server Hello is not received 2) Check if a firewall/proxy/NSG is intercepting traffic to Azure Monitor endpoints on port 443 3) Add firewall rules to allow outbound connectivity to required Azure Monitor endpoints (*.monitor.azure.com, *....

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Self-managed Prometheus on-premises server cannot establish connection to Azure Monitor Workspace ingestion endpoint. curl to AMW metrics ingestion endpoint fails or times out.

**Solution**: 1) Test connectivity: curl -v https://<amw_metrics_ingestion_endpoint>. 2) If blocked, configure firewall/proxy rules to allow outbound HTTPS to *.ingest.monitor.azure.com. 3) Verify DNS resolution of the endpoint. 4) If using proxy, configure proxy settings in prometheus.yml remote_write section.

`[Source: ADO Wiki, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Availability test fails with duration of exactly 21 or 42 seconds, indicating... | TCP connection timeout from availability test VMs. Firewall, gateway, or edge... | Configure firewall to allow TCP connections from availability test IPs. Use A... | 8.5 | ADO Wiki |
| 2 | Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL F... | MySQL and PostgreSQL Flexible Servers are not supported as direct Managed Pri... | Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VN... | 8.5 | ADO Wiki |
| 3 | Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL F... | MySQL and PostgreSQL Flexible Servers are not supported as direct Managed Pri... | Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VN... | 8.5 | ADO Wiki |
| 4 | OpenSSL s_client command to Azure Monitor endpoints (e.g., global.handler.con... | Firewall or network security device is blocking the TLS connection - the Clie... | 1) Verify with network trace that Client Hello is sent but Server Hello is no... | 8.5 | ADO Wiki |
| 5 | Self-managed Prometheus on-premises server cannot establish connection to Azu... | Network connectivity issue: firewall, proxy, or NSG rules block outbound HTTP... | 1) Test connectivity: curl -v https://<amw_metrics_ingestion_endpoint>. 2) If... | 7.5 | ADO Wiki |
| 6 | PowerShell/Azure CLI commands fail when configuring activity log export behin... | Missing proxy certificates — proxy intercepts HTTPS traffic but the required ... | 1) Verify proxy settings in Network & Internet; 2) Import proxy certificates ... | 6.5 | MS Learn |
