---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Lab/AMA Linux: LAB: Setup Syslog-ng"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FLearning%20Resources%2FLab%2FAMA%20Linux%3A%20LAB%3A%20Setup%20Syslog-ng"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This lab provides the steps to install and enable [Syslog-ng](https://www.syslog-ng.com/) as an alternative to the default syslog daemon, Rsyslog, on Ubuntu 22.04.

This lab assumes you are using an out-of-the-box Ubuntu 22.04 Azure Marketplace image with no customizations.

# Steps
Run the following in the console:

```
# Update packages
sudo apt update
sudo apt-get upgrade -y

# Install/start/enable syslog-ng
sudo apt install syslog-ng -y
sudo systemctl start syslog-ng
sudo systemctl enable syslog-ng
sudo systemctl status syslog-ng

# Check Syslog-ng 
syslog-ng --version
sudo sed -i 's/@version: 3.27/@version: 3.35/g' /etc/syslog-ng/syslog-ng.conf
sudo systemctl reload syslog-ng
sudo vi /etc/syslog-ng/conf.d/network.conf
```

In the configuration file, add the following lines to enable the daemon to listen on tcp/udp port 514 and write the incoming messages to a .log file on disk.

```
# Enable network source
source s_net {
    tcp(ip("0.0.0.0") port(514)
    );
    udp(ip("0.0.0.0") port(514)
    );
};

# Log destinations
destination d_logs {
    file("/var/log/syslog-ng-s_net.log");
};

# Log paths
log {
    source(s_net);
    destination(d_logs);
};
```

Run the following in the console:
```
# Reload the daemon to apply the new config (without having to restart the daemon)
sudo systemctl reload syslog-ng.service

# Verify the daemon is listening on port 514
netstat -plntu | grep 514
```

If you will be receiving syslog messages from a remote host (i.e. they will need to pass through the firewall), you can use the following:
```
# Is the firewall running?
systemctl status firewalld

# Are there any existing firewall rules to allow the syslog traffic?
sudo firewall-cmd --list-ports

# Allow tcp and udp port 514
sudo firewall-cmd --add-port=514/tcp --permanent
sudo firewall-cmd --add-port=514/udp --permanent

# Remove tcp and udp port 514
# sudo firewall-cmd --remove-port=514/tcp --permanent
# sudo firewall-cmd --remove-port=514/udp --permanent

# Reload the firewall to apply the changes
sudo firewall-cmd --reload

# Verify the rules applied
sudo firewall-cmd --list-ports

```