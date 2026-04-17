# ARM JSON Template - Batch Create Multiple VMs

> Source: OneNote MCVKB 2.8 | Draft - pending SYNTHESIZE review

## Overview
ARM templates for creating multiple VM instances simultaneously on Azure China (Mooncake).

## Template 1: From Platform Image
- Creates N VMs (configurable via `numberOfInstances` parameter)
- Uses `copyindex()` for NIC and VM resources
- Includes Availability Set with managed disks
- Boot diagnostics endpoint: `blob.core.chinacloudapi.cn`

Key parameters:
- `vmNamePrefix`: Prefix for VM names
- `imageSKU`: e.g., "2016-Datacenter"
- `vmSize`: e.g., "Standard_DS2_v2"
- `numberOfInstances`: 1-10

## Template 2: From Custom Image
- Creates VMs from a managed image resource
- Tested: 40 VMs deployed in ~11 minutes
- Uses `images_url` parameter pointing to managed image resource ID

## Mooncake-Specific Notes
- Boot diagnostics storage URI must use `.blob.core.chinacloudapi.cn`
- Login command: `Login-AzureRmAccount -EnvironmentName AzureChinaCloud`
