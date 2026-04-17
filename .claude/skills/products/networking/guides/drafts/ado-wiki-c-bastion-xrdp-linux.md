---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/Connecting to Linux with Xrdp"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FConnecting%20to%20Linux%20with%20Xrdp"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Using XRDP to connect to Linux clients via RDP

## Overview
As of August 31st 2021, Azure Bastion on Standard SKU supports Custom Port/Protocol feature. This feature allows you to choose the protocol and port for a connection to VM — be it RDP or SSH. Currently these are the only supported protocols. For Linux VMs this is only covered with xrdp. No other RDP clients are supported on Linux at this time.

## Configuring the Linux VM to allow RDP 
The steps to allow a Linux VM to accept RDP connections are not Bastion specific and are documented here: 
https://learn.microsoft.com/en-us/azure/virtual-machines/linux/use-remote-desktop?tabs=azure-cli

## Allowing multiple users to connect

The commands in the article setup one user to connect.

To allow more than one user to connect you must run these commands for each user you expect to have connecting:

```bash
sudo usermod -aG ssl-cert <username>
echo xfce4-session > /home/<username>/.xsession
```

## Prerequisites
- Azure Bastion **Standard SKU** (required for Custom Port/Protocol)
- xrdp installed and configured on the Linux VM
- Custom port set to 3389 (RDP) in Bastion connection settings
