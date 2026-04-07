---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Using Azure Support Center (ASC) to get Published App and Connector configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Using%20Azure%20Support%20Center%20(ASC)%20to%20get%20Published%20App%20and%20Connector%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

How to use Azure Support Center (ASC) to retrieve Application Proxy published app and connector configuration details. No special permission is required as member of the Identity Support.

## Steps

1. Go to **Azure Support Center** (launch from Service Desk or use `https://azuresupportcenter.msftcloudes.com/caseoverview` with the case number)
2. Click on **Tenant Explorer's icon** on the left
3. After Tenant Explorer loads, click on **AAD Application Proxy** in the left menu

## Available Panels

### a) Application Proxy Applications

- Lists all Microsoft Entra Application Proxy applications in the tenant
- Can filter results and export to Excel
- Click the arrow next to App Display Name to view details in a copyable form
- Shows: display name, application id, external & internal URL
- For full config details, copy the app id and go to step 5 below

### b) Application Proxy Connector Groups

- Lists all Connector Groups and included Connectors in the tenant
- For more connector info (OS version, connection count etc.), use Kusto
- Locating apps assigned to same connector group: use Kusto or the public PowerShell script at https://learn.microsoft.com/entra/identity/app-proxy/scripts/powershell-get-all-app-proxy-apps-by-connector-group

## Getting Full Application Configuration

5. Copy the application id from step 4, click **Application** in the left menu
6. Select **AppId** in Search Type, paste the app id, click **Run**
7. After the page loads, click **Application Proxy** in the upper menu to see full configuration

## Additional Configuration Locations in ASC

- Homepage URL → Under Service Principal / Application Object
- SSL Certificate → Not available in ASC
- SAML configuration → Under Single Sign-On
- Assigned Users / Groups → App Role Assignments
