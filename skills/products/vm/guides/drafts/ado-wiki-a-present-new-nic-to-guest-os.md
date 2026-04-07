---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Present New NIC to Guest OS_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FPresent%20New%20NIC%20to%20Guest%20OS_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Present New NIC to Guest OS

In some scenarios you may want to introduce a new NIC into the Guest OS to restore RDP connectivity.

**Note: This will result in a restart.**

## Customer Enablement

- [How to reset network interface for Azure VM](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/reset-network-interface)

## Method 1 - VM-Repair AZ CLI

Use the VM-Repair AZ CLI tool to automatically reset the NIC:

```bash
rg="resourceGroupName"
vm="vmName"
sub="subscriptionId"
az vm repair reset-nic -g $rg -n $vm --subscription $sub --verbose
```

## Method 2 - Portal Connectivity Troubleshooter

Follow the Connectivity Guided Troubleshooter from the Portal for the target VM and select `Reset-Nic`. This will run the VM-Repair Reset-Nic command automatically.

## Method 3 - Azure Portal (Manual IP Change)

1. Go to Azure portal → Select VM → Network Settings → Network Interface
2. Select IP configurations → Select the IP
3. If Private IP assignment is not Static, change to Static
4. Change IP address to another available IP in the Subnet
5. Save (VM will restart to initialize new NIC)
6. Try RDP; if successful, can change back to original IP

## Method 4 - PowerShell / AZ CLI

### Az PowerShell

```powershell
Set-AzContext -SubscriptionId "xxxxx-xxxxx-xxxxx-xxxxx"
$nic = Get-AzNetworkInterface -Name <NIC_1> -ResourceGroupName <ResourceGroup>
$nic.IpConfigurations[0].PrivateIpAllocationMethod = "Static"
$nic.IpConfigurations[0].PrivateIpAddress = "NEWIP"
Set-AzNetworkInterface -NetworkInterface $nic
```

### Az CLI

```bash
az account set --subscription "xxxxx-xxxxx-xxxxx-xxxxx"
az network nic ip-config update --name ipconfig1 --nic-name <NIC_1> --resource-group <ResourceGroup> --private-ip-address <NEWIP>
```

After adding/changing a static IP and getting access, change back to dynamic or original static IP if needed.

## Method 5 - Delete and Recreate VM

Delete the VM and recreate it from the same disk using a different and new Network Card resource.
