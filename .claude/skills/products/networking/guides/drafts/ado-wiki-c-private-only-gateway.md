---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Private-Only Gateway for Application Gateway v2"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private-Only%20Gateway%20for%20Application%20Gateway%20v2"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Private-Only Gateway for Application Gateway v2

## How to identify

1. **ASC**: May show Private IP configuration only if gateway is deployed in ILB-only mode
2. **ASC Properties**: Shows a "Managed VIP" property for Application Gateway management IP
3. **Resource Tags**: Private-Only Gateway deployments will have resource Tag "EnhancedNetworkControl" set to "True"
   - **Important**: This tag is cosmetic. Changing or removing it will not affect GW functionality. Sometimes the TAG won't even appear. Use ASC or JSON to verify.

## Background

Previously, Application Gateway v2 SKUs required public IP addressing for management/control plane communication (Gateway Manager service tag). This limited:
- Deploying v2 in "ILB only mode"
- Force tunneling outbound Internet traffic through VPN/ExpressRoute

## New Product capabilities

1. Private IP only frontend IP configuration (no public IP resource required)
2. Elimination of inbound traffic from Gateway Manager service tag via NSG
3. Ability to DenyAll outbound traffic to Internet
4. Support for networks learning 0.0.0.0/0 from VPN, ExpressRoute, or Route Table entries
5. Backend pool targets no longer require `.privatelink.` FQDNs — can use DNS record of service enabled for private endpoints

## Common scenarios where public IP usage is still required

1. Communication to customer managed key vaults without private endpoints (requires Public IP or NAT Gateway)
2. Communication to backend targets via internet (requires Public IP or NAT Gateway)
3. Communication to internet facing CRL or OCSP endpoints (requires Public IP or NAT Gateway)

## Known Issues

1. **Private link configuration** (preview): Private link configuration support for tunneling traffic through private endpoints to Application Gateway is unsupported with private only gateway. Long-term support will be included.
2. **Backend Health status typo**: If backend health is unknown due to DNS resolution or other reason, the error message erroneously states NSG rules are required and route tables should be eliminated. This message is incorrect for private-only gateway and can be ignored. Fix planned for future release.

## Additional resources

- [Private Application Gateway deployment](https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-private-deployment)
