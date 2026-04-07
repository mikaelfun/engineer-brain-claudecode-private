---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Internal DNS (VNET)/Resolve VM names from Onprem P2S client using Azure AD authentication"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FResolve%20VM%20names%20from%20Onprem%20P2S%20client%20using%20Azure%20AD%20authentication"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Resolve Azure VM Names from On-Prem P2S Client (Azure AD Auth)

[[_TOC_]]

## Requirement

Resolve Azure VM names from an on-premises network connected to Azure via P2S VPN using Azure AD authentication.

---

## Default Behavior

- VMs within the same VNET can resolve each other by hostname or internal FQDN (provided by Azure)
- For VMs in peered VNETs or On-Prem to resolve hostnames, additional configuration is required
- Cross-VNET name resolution requires custom DNS servers forwarding between VNETs

Ref: [Name resolution for VMs and role instances](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances#vms-and-role-instances)

---

## Scenario 1: Hub-Spoke VNET with P2S (Azure AD Auth)

Customer has Hub VNET peered to Spoke VNET, each with its own DNS servers, connected via P2S VPN. Customer wants to resolve Azure VM **hostnames** (not full FQDN) from P2S client.

### Steps

1. **Get the unique DNS suffix for each VNET:**
   ```powershell
   Get-AzNetworkInterface -ResourceId <NIC-ResourceId>
   # Or on the VM: ipconfig /all → "DNS Suffix Search List"
   ```

2. **Configure Hub DNS server** with a forwarder for the Hub VNET's domain (e.g., `rhsxmabpxa5uzmkxrfdoe1chza.ax.internal.cloudapp.net`) to `168.63.129.16`

3. **Create a DNS server in Spoke VNET** with forwarder for Spoke VNET's domain to `168.63.129.16`

4. **Add a forwarder on Hub DNS server** pointing Spoke VNET domain to the Spoke DNS server IP

5. **Edit the downloaded VPN XML client package** — add DNS suffixes for both VNETs:
   ```xml
   <ClientConfig>
     <DnsSuffixes>
       <DnsSuffix i:type="a:string">hub-vnet-suffix.ax.internal.cloudapp.net</DnsSuffix>
       <DnsSuffix i:type="a:string">spoke-vnet-suffix.ax.internal.cloudapp.net</DnsSuffix>
     </DnsSuffixes>
   </ClientConfig>
   ```

6. **Import the modified XML** in Azure VPN client and connect

7. Verify: `ipconfig /all` on the P2S client will show the DNS suffixes, and VM hostnames will resolve

> **Note:** Without custom DNS servers, resolution fails even with full FQDN.

---

## Scenario 2: Custom Domain (e.g., sofwave.local) for VM Hostnames

Customer maintains DNS records for all Hub and Spoke VMs on a single DNS server and wants to resolve by hostname.

- Manually create forward lookup zones on Hub DNS server for all Hub and Spoke VMs
- Add the custom domain suffix (e.g., `sofwave.local`) in the downloaded VPN XML file
- P2S client will automatically append the suffix during resolution

---

## Known Issue: Mac Clients

> ⚠️ **Bug 14039446**: Mac VPN clients do **not** honor DNS suffixes added to the XML package.  
> Workaround: Use full IP address or FQDN from Mac P2S clients.  
> Track: [ADO Bug 14039446](https://msazure.visualstudio.com/One/_workitems/edit/14039446)

Windows 11 confirmed working with the above steps.
