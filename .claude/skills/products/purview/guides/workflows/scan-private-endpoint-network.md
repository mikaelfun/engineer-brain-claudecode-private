# Purview 扫描私有终结点与网络 — 排查工作流

**来源草稿**: `ado-wiki-b-networking.md`, `ado-wiki-check-managed-vnet-ir-version.md`, `ado-wiki-managed-vnet-ir.md`, `ado-wiki-multi-region-managed-vnet-ir.md`, `ado-wiki-pe-network-troubleshooting.md`, `ado-wiki-private-endpoints-overview.md`
**Kusto 引用**: 无
**场景数**: 29
**生成日期**: 2026-04-07

---

## Scenario 1: Network Training for Purview
> 来源: ado-wiki-b-networking.md | 适用: 未标注

### 排查步骤
Networking plays a large part in the infrastructure supporting Purview, and accounts for a large number of issues and escalated support cases. It is highly advisable to improve proficiency in understanding, troubleshooting and solving network-related issues.

`[来源: ado-wiki-b-networking.md]`

---

## Scenario 2: Training Resources
> 来源: ado-wiki-b-networking.md | 适用: 未标注

### 排查步骤
- **General networking troubleshooting**: https://learningplayer.microsoft.com/activity/S1071024/launch
- **Azure Networking L100, L200, L300**: https://ready.azurewebsites.net/csslearning/1616
- **Network wiki with specific trainings**: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/297409/Module-1-Core-Networking

`[来源: ado-wiki-b-networking.md]`

---

## Scenario 3: Quick Start — Packet Capture Analysis
> 来源: ado-wiki-b-networking.md | 适用: 未标注

### 排查步骤
For urgent cases, start with: [Introduction to packet capture analysis (PPT)](https://supportability.visualstudio.com/256c8350-cb4b-49c9-ac6e-a012aeb312d1/_apis/git/repositories/da6cf5d9-0dc5-4ba9-a5e2-6e6a93adf93c/Items?path=/AzureDataFactory/.attachments/Introduction%20to%20packet%20capture%20analysis-2ea1ebf9-4906-450b-a0e3-ed56a4a59f3c.pptx)

`[来源: ado-wiki-b-networking.md]`

---

## Scenario 4: Data Factory / SHIR Network TSGs
> 来源: ado-wiki-b-networking.md | 适用: 未标注

### 排查步骤
Data Factory's wiki has good network-related troubleshooting guides, especially for SHIR:

- **ADF Wiki**: https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory
- [SHIR failed to connect to Front End Servers](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/331750/Self-Hosted-node-failed-to-connect-to-Frond-End-Servers)
- [Network Issue from Self-Host IR (e.g., Cannot connect to SQL Server)](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286770/Network-Issue-from-Self-Host-IR-such-as-Cannot-connect-to-SQL-Server-)
- [FE Connection Issue due to certificate](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/372212/FE-Connection-Issue-due-to-certificate)

`[来源: ado-wiki-b-networking.md]`

---

## Scenario 5: How to check version of Managed Vnet IR
> 来源: ado-wiki-check-managed-vnet-ir-version.md | 适用: 未标注

### 排查步骤
To check the version of Managed Virtual Network IR:

1. Go to **Data Map** → **Integration runtimes**
2. Check the **Version** column
   - Version 1.0 = Managed VNet IR v1
   - Version 2.0 = Managed VNet IR v2

`[来源: ado-wiki-check-managed-vnet-ir-version.md]`

---

## Scenario 6: Using Managed VNet IR to connect Securely
> 来源: ado-wiki-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
https://docs.microsoft.com/en-us/azure/purview/catalog-managed-vnet

Other options to connect to Key Vault Securely without using a Firewall:
- Setup Managed Vnet IR within PE enabled Purview account (Account, portal, ingestion PE's with Firewall as Deny)
- Manually approve managed PE for account and its managed resources
- Create managed PE for datasource for which user wants to perform scan
- Create Managed PE for keyvault
- Register datasource and perform scan using ManagedVnet IR

`[来源: ado-wiki-managed-vnet-ir.md]`

---

## Scenario 7: TSG Search Kusto
> 来源: ado-wiki-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
We can now access Managed Integration Runtime logs in Kusto for troubleshooting.

`[来源: ado-wiki-managed-vnet-ir.md]`

---

## Scenario 8: Confirm which MIR was used
> 来源: ado-wiki-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where Message contains "effectiveIntegrationRuntime"
```

`[来源: ado-wiki-managed-vnet-ir.md]`

---

## Scenario 9: Search for errors
> 来源: ado-wiki-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
```kql
cluster('babylon.eastus2').database('babylonMdsLogs').ScanningLog
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'Unsupported'
```

`[来源: ado-wiki-managed-vnet-ir.md]`

---

## Scenario 10: Search the data scan activity for errors
> 来源: ado-wiki-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
```kql
cluster('purviewadxeus.eastus').database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
| where * contains 'failed' or * contains 'Warning' or * contains 'Error' or * contains 'Throttle' or * contains 'Unsupported'
```

`[来源: ado-wiki-managed-vnet-ir.md]`

---

## Scenario 11: Multi-region and multi-VNets for Managed IR
> 来源: ado-wiki-multi-region-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
Microsoft Purview now supports multi-regions and multi-VNets for Managed VNet Integration Runtimes (IR) (GA).

`[来源: ado-wiki-multi-region-managed-vnet-ir.md]`

---

## Scenario 12: Capabilities
> 来源: ado-wiki-multi-region-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
1. Create multiple Managed VNets (max 5) across different regions within a single Purview Account
2. Network isolation within organizations to address data residency or scan performance concerns

`[来源: ado-wiki-multi-region-managed-vnet-ir.md]`

---

## Scenario 13: Feature Details
> 来源: ado-wiki-multi-region-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
When customers create Managed VNet IRs, they specify the Managed Virtual Network name for a selected region. Private endpoints are automatically created. When a Managed VNet IR is deleted, associated private endpoints, IR, and Managed Virtual Network are all deleted.

`[来源: ado-wiki-multi-region-managed-vnet-ir.md]`

---

## Scenario 14: References
> 来源: ado-wiki-multi-region-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
- Blog: [Introducing new version of Managed Virtual Network in Microsoft Purview](https://techcommunity.microsoft.com/t5/security-compliance-and-identity/introducing-new-version-of-managed-virtual-network-in-microsoft/ba-p/3984969)
- Doc: [Managed Virtual Network and managed private endpoints](https://learn.microsoft.com/en-us/purview/catalog-managed-vnet)

`[来源: ado-wiki-multi-region-managed-vnet-ir.md]`

---

## Scenario 15: Troubleshooting
> 来源: ado-wiki-multi-region-managed-vnet-ir.md | 适用: 未标注

### 排查步骤
No new logs or Kusto tables for this feature. Use [existing VNet TSGs](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/913050/VNet-issue-checklists) for troubleshooting.

`[来源: ado-wiki-multi-region-managed-vnet-ir.md]`

---

## Scenario 16: Problem: MSI Configuration
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
MSI supports catalog name but not Object Id. Permission propagation takes 5-10 minutes.
If customer tries Test Connection immediately after granting MSI, it will fail. Wait 5-10 minutes.

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 17: Problem: Missing Private Link DNS
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 18: Problem: Browser Cache Conflicts
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
Portal was open before enabling PEs → stale cache causes "Not Authorized"

**Resolution**: Browser hard refresh or open in new tab from within configured VNET.

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 19: Problem: 403 Permission Issue
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 20: General Network Troubleshooting
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
Reference: https://learn.microsoft.com/en-us/azure/purview/catalog-private-link-troubleshoot

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 21: Gather Network Details
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
1. SHIR Version
2. Purview Network Configuration
3. Data Source Network Configuration
4. Key Vault Network Configuration
5. Purview Storage Network Configuration
6. SHIR VM network

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 22: Test-NetConnection (from SHIR VM)
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
```powershell
Test-NetConnection -ComputerName web.purview.azure.com -Port 443
Test-NetConnection -ComputerName PURVIEWACCOUNTNAME.purview.azure.com -Port 443
Test-NetConnection -ComputerName PURVIEWSTORAGENAME.blob.core.windows.net -Port 443
Test-NetConnection -ComputerName PURVIEWSTORAGENAME.queue.core.windows.net -Port 443
Test-NetConnection -ComputerName KEYVAULTNAME.vault.azure.net -Port 443

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 23: Initial Network Test Script
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 24: Network Trace
> 来源: ado-wiki-pe-network-troubleshooting.md | 适用: 未标注

### 排查步骤
If Test-NetConnection succeeds but TLS handshake fails → firewall blocking HTTPS (Layer 7).
TCP is Layer 4, HTTPS is Layer 7. Both must be allowed for SHIR.

Steps:
1. Collect all PE IP addresses from Test-NetConnection
2. Start network trace (Netmon/Wireshark), run scan, stop on error
3. Collect Scan Run ID and SHIR Report ID

`[来源: ado-wiki-pe-network-troubleshooting.md]`

---

## Scenario 25: Private Endpoint Overview
> 来源: ado-wiki-private-endpoints-overview.md | 适用: 未标注

### 排查步骤
Network traffic between the clients on the VNet and the Purview account traverses over the VNet and a private link on the Microsoft backbone network, eliminating exposure from the public internet.

When creating a private endpoint, a read-only network interface is also created for the lifecycle of the resource. The interface is assigned dynamically private IP addresses from the subnet that maps to the private link resource.

> NOTE: If the customer is using their own DNS server there are two options:
> 1. Create and maintain all DNS A-records for such as {account}.catalog.purview.azure.com, {account}.scan.purview.azure.com, etc
> 2. Set up a DNS conditional forwarding rule for purview.azure.com to Azure DNS 168.63.129.16

`[来源: ado-wiki-private-endpoints-overview.md]`

---

## Scenario 26: Data Exfiltration Protection
> 来源: ado-wiki-private-endpoints-overview.md | 适用: 未标注

### 排查步骤
- Private Endpoint maps a specific PaaS resource to an IP address (rather than the entire service)
- Restricts access to the mapped PaaS resource
- Offers built-in data exfiltration protection

`[来源: ado-wiki-private-endpoints-overview.md]`

---

## Scenario 27: Service Endpoints vs Private Endpoints
> 来源: ado-wiki-private-endpoints-overview.md | 适用: 未标注

### 排查步骤
- **Service Endpoint**: Uses Public IP Addresses on the VNET via Microsoft Backbone
- **Private Endpoint**: Uses Private IP Addresses on the VNET via Microsoft Backbone

`[来源: ado-wiki-private-endpoints-overview.md]`

---

## Scenario 28: Connection Approval Methods
> 来源: ado-wiki-private-endpoints-overview.md | 适用: 未标注

### 排查步骤
- **Automatically** approved when you own or have permission on the specific private link resource
- **Manual** request when you don't have permission — creates PE in "Pending" state, resource owner must approve

`[来源: ado-wiki-private-endpoints-overview.md]`

---

## Scenario 29: Configure DNS Settings for Private Endpoints
> 来源: ado-wiki-private-endpoints-overview.md | 适用: 未标注

### 排查步骤
- Private DNS Zone linked to Virtual Network to resolve specific domains. VNET needs to be paired to DNS Zone.
- Custom DNS Server needs DNS Forwarding Rule to use the DNS Private DNS Zone.

Reference: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution

`[来源: ado-wiki-private-endpoints-overview.md]`

---
