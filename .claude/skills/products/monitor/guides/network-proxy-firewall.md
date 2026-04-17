# Monitor 代理与防火墙配置

**Entries**: 6 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Availability test fails with duration of exactly 21 or 42 seconds, indicating... | TCP connection timeout from availability test VMs. Firewall, gateway, or edge... | Configure firewall to allow TCP connections from availability test IPs. Use A... | 8.5 | ADO Wiki |
| 2 | Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL F... | MySQL and PostgreSQL Flexible Servers are not supported as direct Managed Pri... | Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VN... | 8.5 | ADO Wiki |
| 3 | Azure Managed Grafana cannot connect to Azure Database for MySQL/PostgreSQL F... | MySQL and PostgreSQL Flexible Servers are not supported as direct Managed Pri... | Use Azure Firewall DNAT approach: Create an Azure Firewall in the database VN... | 8.5 | ADO Wiki |
| 4 | OpenSSL s_client command to Azure Monitor endpoints (e.g., global.handler.con... | Firewall or network security device is blocking the TLS connection - the Clie... | 1) Verify with network trace that Client Hello is sent but Server Hello is no... | 8.5 | ADO Wiki |
| 5 | Self-managed Prometheus on-premises server cannot establish connection to Azu... | Network connectivity issue: firewall, proxy, or NSG rules block outbound HTTP... | 1) Test connectivity: curl -v https://<amw_metrics_ingestion_endpoint>. 2) If... | 7.5 | ADO Wiki |
| 6 | PowerShell/Azure CLI commands fail when configuring activity log export behin... | Missing proxy certificates — proxy intercepts HTTPS traffic but the required ... | 1) Verify proxy settings in Network & Internet; 2) Import proxy certificates ... | 6.5 | MS Learn |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/network-proxy-firewall.md)
