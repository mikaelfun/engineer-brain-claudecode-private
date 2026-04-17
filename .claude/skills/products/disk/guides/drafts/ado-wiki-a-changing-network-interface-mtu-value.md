---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Networking/Changing the Network Interface MTU Value"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FNetworking%2FChanging%20the%20Network%20Interface%20MTU%20Value"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Changing the Port / Network Interface MTU Value on Azure Stack Edge

### Description / Overview

In some cases, the customer may want to change the MTU size on one of the Network Interfaces (Ports) of the Azure Stack Edge:

- In computer networking, the maximum transmission unit (MTU) is the size of the largest protocol data unit (PDU) that can be communicated in a single network layer transaction.
- Reference: [Maximum transmission unit - Wikipedia](https://en.wikipedia.org/wiki/Maximum_transmission_unit)

### Troubleshooting and Tools

The MTU size can be changed via Support Session using PowerShell. First connect to the ASE Device via Support Session with the customer.

Reference: [Elevated Support Session - Overview](https://supportability.visualstudio.com/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki/2242974/Elevated-Support-Session)

Once in the Support Session, run the following command to view information for the interfaces:

```powershell
Get-HcsNetInterface
```

This will display the information for each of the NICs/Ports on the ASE. You can use the `-InterfaceAlias` flag to specify the port number.

Once you have identified the current value and the port you would like to change, run:

```powershell
Set-HcsNetInterface -InterfaceAlias <Port#> -MTU <mtu value>
```

You may also need to input the `NodeID` after entering the command (found from the previous `Get-HcsNetInterface` output).

After this, run `Get-HcsNetInterface` again to verify the MTU value has been changed.

### Root Cause

Depending on the customer's internal network configurations, they may need to adjust the MTU size on the interfaces for proper network communication. Although most networks auto-negotiate the MTU size, in some cases it needs to be set manually on the Network Interface of the device (Port).

**Example of customer ask:**
> The max MTU on the ASE network interfaces needs to be reduced to 1390 to match the network. Please assist to enable support sessions on the ASEs so the MTU can be changed via powershell.
