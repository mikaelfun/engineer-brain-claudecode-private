---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/How To Enable FIPS on v1 Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20To%20Enable%20FIPS%20on%20v1%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To Enable FIPS on v1 Application Gateway

[[_TOC_]]

## Overview

Before configuring FIPS the customer must open a support case requesting FIPS to be enabled on their subscription. The assigned support engineer must then create an ICM to PG to enable FIPS.

Once the customer has requested FIPS to be enabled you'll need to create an ICM, sev 3, to the product group to enable this feature on their subscription.

### Jarvis Action to enable FIPS on subscription:
https://jarvis-west.dc.ad.msft.net/7669B36E?genevatraceguid=6346150f-f8e3-4774-9d7e-6da961f921e5

### Jarvis action link to check if the flag was added:
https://jarvis-west.dc.ad.msft.net/2BBACA99?genevatraceguid=f13c5173-c0ca-4e97-ab63-9bbe0e8a754f

When FIPS is enabled on the customer's subscription(s) they can either create a v1 Application Gateway with FIPS enabled or they can enable it on an existing v1 Application Gateway.

### To enable FIPS from creation:

Include the `-EnableFIPS` argument upon creation. This must be done in PowerShell — the portal does not support enabling FIPS.

### To enable FIPS on an existing Application Gateway:

1. Create your variable that defines which application gateway in which resource group you need to modify.
```powershell
$appgw = Get-AzApplicationGateway -Name <> -ResourceGroupName <>
```
2. Enable the FIPS Feature.
```powershell
$appgw.EnableFIPS = $true
```
3. Save your changes.
```powershell
Set-AzApplicationGateway -ApplicationGateway $appgw
```

## Known Issue

**EnableFIPS value isn't reflected in PowerShell Get-AzApplicationGateway V1 SKU**

Work item URL: https://msazure.visualstudio.com/One/_workitems/edit/14769711

## Contributors

- Paul Nassif
