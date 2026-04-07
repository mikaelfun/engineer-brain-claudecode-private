---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Private Endpoints/Troubleshooting Network Connection"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FPrivate%20Endpoints%2FTroubleshooting%20Network%20Connection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purview Private Endpoint Network Troubleshooting

## Problem: MSI Configuration

MSI supports catalog name but not Object Id. Permission propagation takes 5-10 minutes.
If customer tries Test Connection immediately after granting MSI, it will fail. Wait 5-10 minutes.

## Problem: Missing Private Link DNS

Purview PE + accessing from VM within same VNET → "Not authorized to access this Purview account"

**Cause**: Missing private link DNS resolution on the customer's VM.

**TSG**:
1. Run `nslookup {accountName}.purview.azure.com` from the VM. Should return PE private IP.
2. If returns public IP → DNS misconfigured
3. Check: Has customer created PEs for both portal and account?
4. Check: Is PE paired with same VNET?
5. Check: Is privatelink.purview.azure.com DNS zone created?
6. If using on-prem DNS: set up DNS conditional forwarding for purview.azure.com to Azure DNS 168.63.129.16

**Resolution**: Correct name resolution returns local PE IP (10.x.x.x / 172.16.x.x / 192.168.x.x). If public IP → fix DNS zone.

## Problem: Browser Cache Conflicts

Portal was open before enabling PEs → stale cache causes "Not Authorized"

**Resolution**: Browser hard refresh or open in new tab from within configured VNET.

## Problem: 403 Permission Issue

"Request Failed with status 403. Not authorized to access account."

Need both Account PE and Portal PE. For custom DNS, add domain records:

| FQDN | PE Type | DNS |
|------|---------|-----|
| web.purview.azure.com | Portal | CNAME |
| accountname.purview.azure.com | Account | CNAME |
| accountname.scan.purview.azure.com | Account | CNAME |
| accountname.catalog.purview.azure.com | Account | CNAME |

For custom DNS with Private DNS disabled:
- Create PE and DNS A records matching VNET/subnet
- Configure each domain with IP + FQDN

## General Network Troubleshooting

Reference: https://learn.microsoft.com/en-us/azure/purview/catalog-private-link-troubleshoot

### Gather Network Details

1. SHIR Version
2. Purview Network Configuration
3. Data Source Network Configuration
4. Key Vault Network Configuration
5. Purview Storage Network Configuration
6. SHIR VM network

### Test-NetConnection (from SHIR VM)

```powershell
Test-NetConnection -ComputerName web.purview.azure.com -Port 443
Test-NetConnection -ComputerName PURVIEWACCOUNTNAME.purview.azure.com -Port 443
Test-NetConnection -ComputerName PURVIEWSTORAGENAME.blob.core.windows.net -Port 443
Test-NetConnection -ComputerName PURVIEWSTORAGENAME.queue.core.windows.net -Port 443
Test-NetConnection -ComputerName KEYVAULTNAME.vault.azure.net -Port 443
# If on-premise: Test-NetConnection -ComputerName [SERVER] -Port 1433
# If EventHub: Test-NetConnection -ComputerName EVENTHUBNAME.servicebus.windows.net -Port 443
```

### Initial Network Test Script

```powershell
$fqdnList = @("web.purview.azure.com",
    "[PURVIEWACCOUNTNAME].purview.azure.com",
    "[PURVIEW STORAGE NAME].blob.core.windows.net",
    "[PURVIEW STORAGE NAME].queue.core.windows.net",
    "[KEYVAULT NAME].vault.azure.net",
    "[EVENTHUB NAME].servicebus.windows.net")
foreach($f in $fqdnList){
    $url = "https://$f"
    $req = [Net.HttpWebRequest]::Create($url)
    $req.Timeout = 1000
    try { $req.GetResponse() } catch { $_.Exception.Message }
    Test-NetConnection $f -Port 443
    nslookup $f 2>&1
    Resolve-DnsName -Name $f
}
```

### Network Trace

If Test-NetConnection succeeds but TLS handshake fails → firewall blocking HTTPS (Layer 7).
TCP is Layer 4, HTTPS is Layer 7. Both must be allowed for SHIR.

Steps:
1. Collect all PE IP addresses from Test-NetConnection
2. Start network trace (Netmon/Wireshark), run scan, stop on error
3. Collect Scan Run ID and SHIR Report ID
