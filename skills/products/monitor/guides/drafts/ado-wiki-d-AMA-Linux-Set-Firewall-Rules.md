---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Set firewall status and rule set"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Set%20firewall%20status%20and%20rule%20set"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article covers how to check the status of the local firewall (firewalld) on Linux and how to list and add and delete rules. 

# Different firewall management tools
Linux systems support multiple firewall management tools, including **firewalld**, **iptables**, **ufw** and **nftables (nft)**, each providing different approaches to configuring network traffic rules. Understanding which tool is in use is critical for effective troubleshooting, as their configurations and behaviors differ.

## Which is in use
Use the following script to identify which firewall is in use (or if none are):

```
echo 'found=0
 
if systemctl is-active --quiet firewalld; then
    echo "firewalld is in use"
    ((found++))
fi
if systemctl is-active --quiet ufw; then
    echo "ufw is in use"
    ((found++))
fi
if command -v iptables >/dev/null && iptables -L >/dev/null 2>&1; then
    echo "iptables is in use"
    ((found++))
fi
if command -v nft >/dev/null && nft list tables >/dev/null 2>&1; then
    echo "nftables is in use"
    ((found++))
fi
if [ $found -eq 0 ]; then
    echo "No firewall (firewalld, ufw, iptables, or nftables) appears to be in use"
fi' | bash
```


# Scenario: Configuration (IMDS)
It is possible to filter outbound traffic by user. For instance, I want to allow the root user to reach IMDS (169.254.169.254), but no other users. Since AMA runs as the syslog user, this would prevent AMA from successfully making calls to IMDS.

The following commands can be used to reproduce/assess this scenario:
## Firewall: iptables

```
#check current rules
iptables -L OUTPUT -v -n --line-numbers
 
#Add rule for repro
iptables -A OUTPUT -d 169.254.169.254/32 -m owner ! --uid-owner 0 -j REJECT --reject-with icmp-port-unreachable
 
#delete the rule after repro
sudo iptables -D OUTPUT -d 169.254.169.254/32 -m owner ! --uid-owner 0 -j REJECT --reject-with icmp-port-unreachable
```

# Scenario: Syslog
## RHEL-based 
Applies: Red Hat Enterprise Linux (RHEL), CentOS, Rocky Linux, AlmaLinux, Oracle Linux

```
# Is the firewall running?
systemctl --no-pager status firewalld

# Are there any existing firewall rules to allow the syslog traffic?
sudo firewall-cmd --list-ports

# Allow tcp and udp port 514
# sudo firewall-cmd --add-port=514/tcp --permanent
# sudo firewall-cmd --add-port=514/udp --permanent

# Remove tcp and udp port 514
# sudo firewall-cmd --remove-port=514/tcp --permanent
# sudo firewall-cmd --remove-port=514/udp --permanent

# Reload the firewall to apply the changes
sudo firewall-cmd --reload

# Verify the rules applied
sudo firewall-cmd --list-ports

```

## Debian
Applies to: Debian, Ubuntu

```
# Is the firewall running?
# Are there any existing firewall rules to allow the syslog traffic?
sudo ufw status

# Allow tcp and udp port 514
sudo ufw allow 514/tcp
sudo ufw allow 514/udp

# Remove tcp and udp port 514 (uncomment to use)
# sudo ufw delete allow 514/tcp
# sudo ufw delete allow 514/udp

# Reload the firewall to apply the changes
sudo ufw reload

# Verify the rules applied
sudo ufw status
```