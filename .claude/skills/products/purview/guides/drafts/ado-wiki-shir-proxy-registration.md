---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in Windows/Unable to register SHIR with proxy"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FUnable%20to%20register%20SHIR%20with%20proxy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Unable to register SHIR with proxy

## Issue Background
While customer tries to register SHIR with proxy enabled, he may get the following error message:
"The Integration Runtime (Self-hosted) node has encountered an error during registration."

## Root Cause Analysis
This is because the on-prem SHIR machine cannot connect to Purview cloud service endpoint. So that SHIR service cannot be online.

## Pre-requisite
Please make sure customer downloads the right Purview integration runtime from [Purview SHIR](https://www.microsoft.com/en-ca/download/details.aspx?id=105539). If customer downloads SHIR from ADF website, please request customer to download it from Purview site.

## Cloud Endpoints needed to be connected
The following lists all the cloud endpoints where SHIR needs to connect to. You can find all details from [Create and manage a self-hosted integration runtime](https://learn.microsoft.com/en-us/purview/manage-integration-runtimes).

All endpoints use outbound port 443. Domains cover public cloud, Azure Government, and China regions.

## Action Plan by Scenario

### Scenario 1: System proxy with PE
1. Find all PEs' IP including managed queue and blob IP from the portal, run **Test-NetConnection** for each. Ensure resolved IP is correct and TCP test succeeds.
2. Refer to [Create and manage a self-hosted integration runtime](https://learn.microsoft.com/en-us/purview/manage-integration-runtimes) and whitelist IP of all PEs by updating config files.
3. If issue persists, collect **event viewer logs** and **network trace** before escalating.

### Scenario 2: System proxy without PE
1. Refer to "Cloud Endpoint needed to be connected" section. Ensure proxy can connect to those endpoints successfully. Note: wildcard is needed as there are no dedicated endpoints.
2. If issue persists, collect network trace from **customer's proxy server** (trace from SHIR machine only shows connection to proxy). Also collect Event Viewer logs.

### Scenario 3: Custom proxy with PE
1. Find all PEs' IP including managed queue and blob IP from the portal.
2. Whitelisting IP is not available for custom proxy. Customer must ensure their proxy server can resolve the correct private IP for each PE, and proxy can connect to all PEs and Cloud Endpoints successfully.

**Note**: **Test-NetConnection** will NOT help determine RCA in custom proxy scenarios, as it only tests connection between SHIR machine and cloud endpoints without going through the proxy.

### Scenario 4: Custom proxy without PE
Same action plan as Scenario 2.
