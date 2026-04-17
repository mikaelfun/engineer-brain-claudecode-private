---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Scan fails with an error/Scan fails with Internal System Error and Connectivity Troubleshooting Scripts"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Scan%20fails%20with%20an%20error/Scan%20fails%20with%20Internal%20System%20Error%20and%20Connectivity%20Troubleshooting%20Scripts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Internal System Error — Connectivity Troubleshooting Guide

## Issue

Scanning fails with "Internal System Error". This is a generic error — the underlying cause could be many things.

## Initial Diagnosis

Check ScanningLogs table for underlying error:

```kql
cluster('Babylon').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx" //Scan ID
| project PreciseTimeStamp, Type, EventName, ElapsedTimeInMS, ScanResultId, Message, FullException, Uri
```

## Checklist

1. **SHIR version**: Ensure latest version: https://www.microsoft.com/en-us/download/details.aspx?id=39717. Try uninstall and reinstall (corrupted installations can cause assembly load failures).

2. **VNET/Private Endpoint**: Check known limitations: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-troubleshoot. Validate SHIR connectivity to source (proxies/firewalls may block).

3. **DNS Name Resolution for PE**: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution

4. **Private endpoint ingestion limits**: Only Azure Blob Storage and ADLS Gen2 support Azure IR with ingestion PE. All other data sources require SHIR.

5. **Public access disabled**: Some configurations do not support Purview having Public access disabled (e.g., Power BI).

## Common Internal Errors

### 1. The system cannot find the file specified
- SHIR logs: `Module atlas-ingestion-write initialize failed` → `System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.DataTransfer.Common.RetryPolicies'`
- **Fix**: Corrupted SHIR. Uninstall and install latest version.

### 2. AccountProtectedByPrivateEndpoint
- Logs: `403 Forbidden` → `"code":"AccountProtectedByPrivateEndpoint","message":"Not authorized to access account"`
- **Fix**: Use SHIR instead of Azure IR for non-Blob/ADLS sources behind PE.

### 3. System.Exception: Forbidden
- SHIR logs: `Module atlas-ingestion-write initialize failed: System.Exception: Forbidden`
- GatewayEvent: `403` on `/tokenprovider/tokens/acquire` → `PrivateLink|Access from internet not authorized`
- **Fix**: Validate PE configuration and DNS settings.

## Connectivity Troubleshooting

### Information to Collect from Customer

1. SHIR Version
2. Purview Network Configuration
3. Data Source Network Configuration
4. Key Vault Network Configuration
5. Purview Storage Network configuration

### From the SHIR VM

1. SHIR Report ID (Diagnostic Tab → Send Logs → copy Report ID)
2. `Test-NetConnection -ComputerName web.purview.azure.com -Port 443`
3. `Test-NetConnection -ComputerName [PURVIEWNAME].purview.azure.com -Port 443`
4. `Test-NetConnection -ComputerName [STORAGE].blob.core.windows.net -Port 443`
5. `Test-NetConnection -ComputerName [STORAGE].queue.core.windows.net -Port 443`
6. `Test-NetConnection -ComputerName [KEYVAULT].vault.azure.net -Port 443`
7. `Test-NetConnection -ComputerName [SOURCE] -Port 443`
8. If EventHub: `Test-NetConnection -ComputerName [EVENTHUB].servicebus.windows.net -Port 443`

### Comprehensive Proxy Detection Script

```powershell
$fqdnList = @("web.purview.azure.com",
    "[PURVIEWNAME].purview.azure.com",
    "[STORAGE].blob.core.windows.net",
    "[STORAGE].queue.core.windows.net",
    "[KEYVAULT].vault.azure.net",
    "[EVENTHUB].servicebus.windows.net",
    "[SOURCE_FQDN]",
    "")
$return = @()
foreach($f in $fqdnList){
    if($f -eq "") { continue }
    $return += "`nProcessing $f `n---------------------------------------------------------------------`n"
    $url = "https://$f"
    $req = [Net.HttpWebRequest]::Create($url)
    $req.Timeout = 1000
    try { $return += "ServicePoint:"; $return += $req.ServicePoint }
    Catch { $return += $_.Exception.Message }
    try { $return += "Web Request:"; $return += $req.GetResponse() }
    Catch { $return += $_.Exception.Message }
    try { $return += "Test NetConnection:"; $return += Test-NetConnection $f -Port 443 }
    Catch { $return += $_.Exception.Message }
    try { $return += "nslookup: "; $return += nslookup $f 2>&1; $return += "ResolveDNS: "; $return += Resolve-DnsName -Name $f }
    Catch { $return += $_.Exception.Message }
    $return | out-file $env:userprofile\Documents\TroubleshootPurview.txt
}
```

### Expected Error Responses (successful connection)

| FQDN | Expected Error |
|------|---------------|
| `[PURVIEW].purview.azure.com` | 404 Not Found |
| `[STORAGE].blob.core.windows.net` | 400 Bad Request |
| `[KEYVAULT].vault.azure.net` | 403 Forbidden |

**Proxy indicator**: `"Could not establish trust relationship for the SSL/TLS secure channel"` = certificate chain invalid due to proxy.

**Note**: 403 error could also mean authenticated proxy blocking or Azure resource Network config blocking — cannot easily rule out without further investigation.
