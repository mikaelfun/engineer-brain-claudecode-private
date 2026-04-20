---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Microsoft Peering Connection Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Microsoft%20Peering%20Connection%20Issues"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Microsoft Peering Connection Issues

[[_TOC_]]

## Scenario

On-premises connectivity issues with Azure Public Services or O365 services over ExpressRoute Microsoft Peering.

## Internal Scoping & Data Collection

1. Review the customer Verbatim for Subscription ID, Circuit Name, Service Key
2. Check ASC for circuit information
3. Match customer provided data with ASC data

## Customer Scoping & Data Collection

1. Validate: Subscription ID, Circuit Name/ID, Business Impact, Reproducibility, When issue began
2. Sample scope: "This issue will be considered resolved when the ExR connection from on-premises to service <xxx> has been verified."

## Routing Issues (Routing Preference)

Azure routing preference enables choosing how traffic routes between Azure and the Internet. Public IP with routing preference "Internet" can only be associated with: VM, VMSS, AKS, LB, AppGW, Azure Firewall.

**If customer routes traffic across ExpressRoute with Microsoft Peering to a resource with Internet routing preference, traffic returns via Internet, not ExpressRoute.** This causes asymmetric routing or drops.

**Solution:** Change routing preference to default (Microsoft Global Network). Note: Public IP routing preference cannot be changed after creation - a new Public IP must be created.

## Known Solutions

### Prefix Validation Needed
- Check Dump Circuit for `ADVERTISED PREFIXES STATE: ValidationNeeded`
- Resolution: Manual ASN and Public Prefix Validation

### Verify Advertised Prefixes to MSEE
- Check Dump Routing for received routes from peer IP
- Verify customer public prefixes in the BGP table

### ADFS/Exchange/Skype/Lync O365 Services Unable to Reach On-Premises
- Add on-premises server IPs to BGP routing
- If public IPs match internet-advertised IPs, must SNAT incoming connections from Microsoft IP ranges

### Unable to Reach O365 Resources
- Run PsPing (port 443) and traceroute
- Verify traffic leaves via ExpressRoute (look for MSEE IPs in tracert)
- Check firewall application control blocking

### Unstable BGP Sessions
- Check for MTU size mismatch
- Set MTU to 1500 on on-premises router

### On-Premises Not Learning O365 Routes
- Check `O365 SERVICES AUTHORIZED:` in Dump Circuit
- If False, customer needs authorization via account team
- Check BGP path drops on customer device
- Check MSEE for missing routes via ACIS

### Unable to See ARP
- See ExpressRoute Down wiki for ARP Issues

### Unable to Clear O365 Connection Settings
- Open IcM with TA approval to ExpressRouteOps queue
