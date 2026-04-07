---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Other/How the file resolv.conf generated on AKS worknode ubuntu 2204"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FHow%20the%20file%20resolv.conf%20generated%20on%20AKS%20worknode%20ubuntu%202204"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How the /etc/resolv.conf generated on ubuntu 2204?

## Summary and Goals

At present, perhaps many colleagues know that /etc/resolv.conf can not be modified, especially know that modified /etc/resolv.conf after the machine reboot, the contents of which will certainly be lost. In this article, I will describe how the nameserver in /etc/resolv.conf is managed, so that we know how systemd-resolved generates this file.

### Prerequisites

Make sure you are running systemd-resolved and systemd-networkd on your ubuntu machine. There will be conflicts if you are running other software with similar functionality such as resolvconf, networkmanager, dnsmasq.

### Involved Components

* ubuntu 2204,
* systemd-resolved,
* systemd-networkd,
* netplan

Simple Topology:

Netplan ------> systemd-networkd -------> systemd-resolved -------> /etc/resolv.conf

## Implementation Steps

### 1> Who is controlling the file /etc/resolv.conf?

On AKS nodes it's systemd-resolved. Some versions of ubuntu use resolvconf/dnsmasq/NetworkManager.

### 2> How does systemd-resolved handle the /etc/resolv.conf?

There are 4 modes: stub, static, uplink and foreign.

**Stub(ubuntu recommend)**: systemd-resolved maintains the /run/systemd/resolve/stub-resolv.conf which is symlinked from /etc/resolv.conf. This file lists the 127.0.0.53 DNS stub as the only DNS server.

**Static**: /etc/resolv.conf -> /usr/lib/systemd/resolv.conf, no up-to-date.

**Uplink(AKS lab uses this mode)**: systemd-resolved maintains the /run/systemd/resolve/resolv.conf which is symlinked from /etc/resolv.conf. Clients talk directly to the known DNS servers.

```bash
root@aks-node:/# ls -l /etc/resolv.conf
lrwxrwxrwx 1 root root 32 Feb 21 01:27 /etc/resolv.conf -> /run/systemd/resolve/resolv.conf
```

**Foreign**: /etc/resolv.conf may be managed by other packages, systemd-resolved is consumer rather than provider.

### 3> Where does systemd-resolved receive DNS server information from?

It is from systemd-networkd. When systemd-networkd manages a network interface, it receives DNS server information from the DHCP server with per interface, then systemd-networkd sends this DNS server information to systemd-resolved via D-Bus.

#### 3.1> How does systemd-networkd manage NIC?

Configuration files are in /etc/systemd/network/. On AKS, netplan generates the .network files in /run/systemd/network/:

```bash
root@aks-node:/etc/netplan# cat 50-cloud-init.yaml
network:
    ethernets:
        eth0:
            dhcp4: true
            match:
                driver: hv_netvsc
                macaddress: 00:0d:3a:85:7f:6b
            set-name: eth0
    version: 2
```

dhcp4: true means DNS servers are provided by the DHCP server as part of the DHCP lease.

#### 3.2> systemd-networkd passes DNS info to systemd-resolved via D-Bus

Use `resolvectl status` to check current DNS configuration:

```bash
root@aks-node:/# resolvectl status
Global
       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
resolv.conf mode: uplink

Link 2 (eth0)
Current Scopes: DNS
     Protocols: +DefaultRoute +LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
   DNS Servers: 168.63.129.16
    DNS Domain: rnzj0gxg0obetpywmwofmffjme.hx.internal.cloudapp.net
```

To add a global DNS server, edit /etc/systemd/resolved.conf, then:
```bash
systemctl daemon-reload && systemctl restart systemd-networkd && systemctl restart systemd-resolved
```

#### 3.2.1> Using netplan to alter DNS

```yaml
network:
    ethernets:
        eth0:
            dhcp4: true
            dhcp4-overrides:
              use-dns: false
            nameservers:
              addresses: [168.63.129.16, 8.8.4.4]
    version: 2
```

Then `netplan apply`.

#### 3.2.2> Using busctl to invoke SetLinkDNS

```bash
busctl call org.freedesktop.resolve1 /org/freedesktop/resolve1 org.freedesktop.resolve1.Manager SetLinkDNS 'ia(iay)' 3 1 2 4 8 8 8 8
```

#### 3.2.3> Using busctl to get DNS property

```bash
busctl get-property org.freedesktop.resolve1 /org/freedesktop/resolve1 org.freedesktop.resolve1.Manager DNS
```

## References

1. https://github.com/jonathanio/update-systemd-resolved/blob/master/update-systemd-resolved
2. https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.resolve1.html
3. https://manpages.ubuntu.com/manpages/jammy/man8/systemd-resolved.service.8.html
