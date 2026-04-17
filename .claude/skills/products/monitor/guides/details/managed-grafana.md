# Monitor Azure Managed Grafana - Comprehensive Troubleshooting Guide

**Entries**: 12 | **Drafts fused**: 7 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-authenticate-grafana-api.md, ado-wiki-b-grafana-cost-issues.md, ado-wiki-b-obtain-grafana-resource-details.md, ado-wiki-c-managed-grafana-support-boundaries.md, ado-wiki-c-retrieve-uid-grafana-datasource-dashboard.md, ado-wiki-c-smtp-setup-managed-grafana.md, ado-wiki-c-upgrade-grafana-9-to-10.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Azure Managed Grafana SMTP email notification setup fails in Microsoft internal (1P) tenants because SFI restrictions prevent creating client secrets on App Registrations, which are required for Az...

**Solution**: This is a known limitation for MS internal tenants. SMTP email notifications via Azure Communication Services cannot be configured in MS tenants due to SFI restrictions. Consider alternative notification methods (webhook, Teams) or use a non-MS tenant for testing.

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Azure Managed Grafana Essential SKU resource shows Evicted status and the Grafana instance is inaccessible

**Solution**: Wait for the instance to come back (can take 30 minutes up to 24 hours based on excess VM capacity), create a new Azure Managed Grafana resource in a different region, or upgrade to Standard SKU for SLA-backed availability.

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: User with proper permissions logs into Azure Managed Grafana endpoint but only sees a Welcome to Grafana Enterprise splash screen instead of the normal Grafana UI

**Solution**: Submit an ICM immediately to Azure Managed Grafana PG with all relevant info. The instance needs to be patched to restore normal operation. CSS cannot resolve this issue.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Azure Managed Grafana with private access enabled cannot connect to services (e.g. Prometheus, MySQL) running on Azure VMs in the same VNET. Data source connection test fails even though VMs are ac...

**Solution**: Create an Internal Load Balancer in the VM VNET with Inbound NAT rules pointing to each VM service port. Create a Private Link Service on top of the LB. Then create a Managed Private Endpoint in AMG targeting the Private Link Service. Approve the connection manually. Use the Private Link Service ...

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Azure Managed Grafana dashboards or alerts return HTTP 529 errors from Azure Monitor Metrics API. In Grafana Alerting, appears as DatasourceNoData alert with 529 error payload.

**Solution**: For alerting: modify alert configuration to show state as OK when no data is returned. Recommended: create equivalent alert in Azure Monitor instead of Grafana alerting. For dashboards: wait and retry refresh.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Managed Grafana SMTP email notification setup fails in Microsoft intern... | SFI (Secure Future Initiative) restrictions block secret creation on Entra ID... | This is a known limitation for MS internal tenants. SMTP email notifications ... | 8.5 | ADO Wiki |
| 2 | Azure Managed Grafana Essential SKU resource shows Evicted status and the Gra... | Essential SKU Azure Managed Grafana instances are hosted on SPOT VMs with no ... | Wait for the instance to come back (can take 30 minutes up to 24 hours based ... | 8.5 | ADO Wiki |
| 3 | User with proper permissions logs into Azure Managed Grafana endpoint but onl... | Instance requires patching by the Azure Managed Grafana PG team. This is not ... | Submit an ICM immediately to Azure Managed Grafana PG with all relevant info.... | 8.5 | ADO Wiki |
| 4 | Azure Managed Grafana with private access enabled cannot connect to services ... | AMG private access only establishes a private endpoint for browser-to-Grafana... | Create an Internal Load Balancer in the VM VNET with Inbound NAT rules pointi... | 8.5 | ADO Wiki |
| 5 | Azure Managed Grafana dashboards or alerts return HTTP 529 errors from Azure ... | HTTP 529 is a backend throttling error indicating the Metrics API server is b... | For alerting: modify alert configuration to show state as OK when no data is ... | 8.5 | ADO Wiki |
| 6 | Azure Managed Grafana plugin management feature installs an older version of ... | By design, the Managed Grafana PG vets each plugin through a testing process ... | Submit an ICM to the Grafana PG with: plugin name, currently installed versio... | 8.5 | ADO Wiki |
| 7 | Customer accidentally deleted their Azure Managed Grafana resource and wants ... | Grafana resource was deleted (accidentally or intentionally). ARM does not su... | 1) Verify deletion within last 30 days via Kusto query on armprodgbl (filter ... | 8.5 | ADO Wiki |
| 8 | Customer accidentally deleted a Grafana dashboard within their Azure Managed ... | Grafana does not natively support restoring deleted dashboards (per GitHub is... | If deleted within last 30 days: submit ICM to Grafana PG requesting the dashb... | 8.5 | ADO Wiki |
| 9 | Azure Managed Grafana SMTP email notification setup fails in Microsoft intern... | SFI (Secure Future Initiative) restrictions block secret creation on Entra ID... | This is a known limitation for MS internal tenants. SMTP email notifications ... | 8.5 | ADO Wiki |
| 10 | Azure Managed Grafana Essential SKU resource shows Evicted status and the Gra... | Essential SKU Azure Managed Grafana instances are hosted on SPOT VMs with no ... | Wait for the instance to come back (can take 30 minutes up to 24 hours based ... | 8.5 | ADO Wiki |
| 11 | User with proper permissions logs into Azure Managed Grafana endpoint but onl... | Instance requires patching by the Azure Managed Grafana PG team. This is not ... | Submit an ICM immediately to Azure Managed Grafana PG with all relevant info.... | 8.5 | ADO Wiki |
| 12 | Azure Managed Grafana with private access enabled cannot connect to services ... | AMG private access only establishes a private endpoint for browser-to-Grafana... | Create an Internal Load Balancer in the VM VNET with Inbound NAT rules pointi... | 8.5 | ADO Wiki |
