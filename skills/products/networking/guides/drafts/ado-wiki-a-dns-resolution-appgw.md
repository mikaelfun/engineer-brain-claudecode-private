---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/DNS resolution in Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FDNS%20resolution%20in%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## DNS Resolution in Application Gateway

Application Gateway is a dedicated deployment within the VNet. DNS resolution for AppGW instances is impacted by VNet DNS configurations.

## Name Resolution Requirements

Application Gateway performs DNS resolution for:

**Customer-provided FQDNs:**
- Domain name-based backend servers
- Key Vault endpoint for listener certificates
- Custom error page URLs
- OCSP verification URLs

**Management FQDNs** (Azure infrastructure endpoints — must resolve for full product functionality):
```
.windows.net, .chinacloudapi.cn, .azure.net, .azure.cn,
.usgovcloudapi.net, .azure.us, .microsoft.scloud,
.msftcloudes.com, .microsoft.com
```
> Any name resolution issue for management domain names can result in loss of some or all AppGW functionality.

---

## Gateways with Public IP (networkIsolationEnabled: False)

For public gateways, all control plane communication with Azure domains occurs through default Azure DNS at **168.63.129.16**.

### Using Default Azure-Provided DNS

Default setting for all VNets. Azure DNS resolves public domain names AND provides internal name resolution for VMs within the same VNet.

**Considerations:**
- Do **NOT** create private DNS zones for top-level Azure domain names (e.g., `azure.net`, `vaultcore.azure.net`). Create zones for the most specific subdomain possible (e.g., `privatelink.vaultcore.azure.net` for a Key Vault private endpoint)
- For backends or services using Private Endpoint: ensure the `privatelink` DNS zone is linked to AppGW's VNet

### Using Custom DNS Servers

Custom DNS servers can be specified on the VNet. AppGW instances use these for non-Azure domain name resolution.

**Considerations:**
- After changing DNS servers on the AppGW VNet, **restart (Stop and Start) the Application Gateway** for changes to take effect on instances
- When using private endpoints: private DNS zone must remain linked to the AppGW VNet; zone must be for the most specific subdomain

---

## Gateways with Private IP Only (networkIsolationEnabled: True)

Private AppGW separates customer data plane and management plane traffic. Default Azure DNS or custom DNS servers have **no effect on management endpoint resolution** (management plane uses its own DNS path).

However, when using custom DNS servers, **data path operations** require proper name resolution.

**Traffic flow with custom DNS + private endpoint:**
1. DNS queries for `contoso.com` → go to custom DNS servers via customer traffic plane
2. DNS queries for `contoso.privatelink.vaultcore.azure.net` → custom DNS server forwards recursively to Azure DNS `168.63.129.16` (since it's not authoritative for that zone) → allows private DNS zone resolution
3. All management endpoint resolution → goes through management plane traffic directly to Azure DNS

**Considerations:**
- After changing DNS servers, **restart (Stop and Start)** Application Gateway
- Must set forwarding rules to send all other domain queries to Azure DNS `168.63.129.16` — especially important when using private DNS zones for private endpoint resolution
- Private DNS zone must remain linked to AppGW VNet for private endpoint resolution

---

## Quick Reference: DNS Scenarios

| Scenario | DNS Used | Action Required |
|---|---|---|
| Public AppGW + Azure DNS | 168.63.129.16 | None; avoid top-level private DNS zones |
| Public AppGW + Custom DNS | Custom → Azure DNS fallback | Restart AppGW after DNS change; link private DNS zones |
| Private AppGW + Custom DNS | Custom (data plane) + Azure DNS (management plane) | Set forwarding to 168.63.129.16 for Azure domains; restart AppGW after DNS change |

---

## Contributors
Jay Soni, Gitanjali Verma, Ishmeet Kaur, Aayush Kejriwal
