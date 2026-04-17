---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/3P Data Source Salesforce"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2F3P%20Data%20Source%20Salesforce"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# 3P Data Source Salesforce — Scan Troubleshooting Guide

## Key Differences from Other Connectors

1. Uses Salesforce REST API (app created in Salesforce, NOT Azure)
2. Key Vault Credential uses "Consumer Key"
3. Purview Credential requires 2 Key Vault secrets; configuration differs for SHIR, AIR, and Salesforce Firewall scenarios

## Scan Fails — Data Collection

1. UI Error message
2. Scan ID
3. SHIR Report ID (if using SHIR)
4. Browser Network logs
5. Network Configuration

## Troubleshooting Decision Tree

1. Check Kusto logs for errors
2. Check Network logs for errors
3. If error related to permissions/URL/connection → Test with cURL:

```bash
curl -v -k https://[SALESFORCE ENDPOINT]/services/oauth2/token \
  -d "grant_type=password" \
  -d "client_id=[SALESFORCE CONSUMER KEY]" \
  -d "client_secret=[SALESFORCE SECRET]" \
  -d "username=[SALESFORCE USERID]" \
  -d "password=[SALESFORCE PWD]"
```

- **cURL fails** → Issue is Salesforce configuration → Collect Salesforce Info
- **cURL succeeds** → Issue is Purview → Collect KeyVault Info

## Collect Salesforce Information

1. App Permissions
2. App IP Restrictions
3. Verify OAuth is enabled
4. Network Configuration

## Collect KeyVault Information

1. Confirm Purview Credential configured correctly:
   - **Secret 1**: Salesforce User ID password
     - If SHIR machine IP in Salesforce trusted IP ranges → just password
     - Otherwise → concatenate password + security token
   - **Secret 2**: Consumer Key with Consumer Secret
2. Confirm Key Vault has necessary permissions
3. Network Configuration

## Known Limitations

1. Purview does not support friendly names for Salesforce objects → column name discrepancies
2. No Atlas API capability to retrieve display names for Salesforce objects
3. No direct mapping solution; workaround: add display names in asset descriptions
4. Deleted Salesforce objects not auto-removed by subsequent scans

## MRC Notice

Use manager recovery process if Salesforce support was previously involved by the customer without resolution.
