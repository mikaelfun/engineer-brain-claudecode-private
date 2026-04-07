# Custom DNS Configuration for Azure Linux VMs

**Source**: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/custom-dns-configuration-for-azure-linux-vms)

## Overview

Configure custom DNS servers and search domains on Azure Linux VMs. DNS can be set at virtual network level or network interface level (NIC level overrides VNet level).

## RHEL 8.x/9.x

### DNS Servers
1. Set custom DNS at Azure VNet/NIC level in portal
2. Restart NetworkManager: `sudo systemctl restart NetworkManager`
3. Verify: `sudo systemd-resolve --status`

### Search Domains
1. Add to `/etc/dhcp/dhclient.conf`:
   ```
   append domain-search "test.example.com";
   ```
2. Restart NetworkManager

## Ubuntu 20.04/22.04/24.04

### DNS Servers
1. Set custom DNS at Azure VNet/NIC level
2. Apply: `sudo netplan apply`
3. Relink resolv.conf:
   ```bash
   unlink /etc/resolv.conf
   ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf
   ```
4. Verify: `sudo resolvectl status`

### Search Domains
1. Create `/etc/netplan/custom-dns-01.yaml`:
   ```yaml
   network:
     ethernets:
       eth0:
         nameservers:
           search: [ test.example.com ]
   ```
2. Apply: `sudo netplan apply`

## SLES 12.x/15.x

### DNS Servers
1. Set custom DNS at Azure VNet/NIC level
2. Restart: `sudo systemctl restart wicked.service`

### Search Domains
1. Edit `/etc/sysconfig/network/config`:
   ```
   NETCONFIG_DNS_STATIC_SEARCHLIST="test.example.com"
   ```
2. Restart wicked or run `sudo netconfig update`

## Key Notes
- NIC-level DNS overrides VNet-level DNS
- Multiple search domains: separate by comma (Ubuntu) or space (SLES)
- 21V (Mooncake): applicable, same procedure
