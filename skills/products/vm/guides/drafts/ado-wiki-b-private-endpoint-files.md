---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/Private Endpoint_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FAzure%20Files%20Identity%2FAD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS%2FPrivate%20Endpoint_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Files Private Endpoint Troubleshooting

Azure Private Endpoint uses a private IP from VNet to securely connect to Azure Storage via Private Link. Useful when port 445 is blocked - allows VPN tunneling over internal traffic.

## Important Notes
- Verify private IP assignment with nslookup or Resolve-DnsName (preferred)
- Use Test-NetConnection for both DNS resolution and connectivity testing
- If DNS fails to resolve: DNS configuration issue
- If resolves to private IP but connection fails: network route/VNet/NSG issue
- If previously mounted with storage account key: disconnect share, remove cached credentials, use AD DS credentials
- Client must have line of sight to AD DS Domain Controller (enable VPN if needed)
- **Must use standard FQDN** (*.file.core.windows.net) for Kerberos, NOT privatelink subdomain or private IP

## Troubleshooting Steps

### 1. Verify Connectivity
- Ensure private endpoint and VM are in same VNet
- If different VNets, validate VNet peering

### 2. Validate Private DNS Configuration
- Check if private DNS zone is associated with private endpoint
- Confirm DNS zone association in Azure portal

### 3. Verify Virtual Network Links
- In private DNS zone, ensure virtual network link is configured
- Without VNet link, DNS resolution for private endpoint will fail

### 4. Additional Checks
- Confirm port 445 is open (SMB traffic)
- Test DNS resolution from VM using Resolve-DnsName (more reliable than nslookup per Azure Networking team recommendation)
- Verify name resolves to private endpoint IP

## Collaboration
Private Endpoints supported by Azure Networking team. Follow Engage Networking Process before creating collaboration.
