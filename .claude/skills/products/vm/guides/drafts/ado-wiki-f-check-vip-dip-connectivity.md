---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Check VIP & DIP Connectivity_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCheck%20VIP%20%26%20DIP%20Connectivity_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check VIP & DIP Connectivity

## Summary

How to perform VIP/DIP connectivity tests on an Azure VM to verify network reachability.

## Instructions

### Method 1: VM Port Scanner in ASC

Use [VM Port Scanner](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/520737/) in ASC to confirm if the VM is responding on a given port number.

### Method 2: TestTraffic in ASC

Use the **TestTraffic** option in ASC to simulate traffic testing the routing (does not test actual traffic, only simulates to check for misconfigurations).

**Traffic Direction options:**
- **InternetIN** - Simulate inbound traffic from internet
- **Out** - Simulate outbound traffic from the VM
- **TunnelOrLocalln** - Simulate inbound/outbound traffic through the VNET or same LAN

### Interpreting Results

1. **Traffic denied by NSG/ACLs** - Check NSG configuration:
   - [Incorrect NSG Configuration](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495169)
   - [Recreating RDP NSG rule](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495138)

2. **Traffic allowed but still failing** - Check real traffic using tools like PSPing:
   - If customer has a tunnel or VLAN, internal network test from another VM on same VLAN/Subnet
   - Test from jumpbox to bypass Azure Load Balancer
