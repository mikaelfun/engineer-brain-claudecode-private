---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check agent proxy settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20agent%20proxy%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check Agent Proxy Settings

## Overview
Multiple places where proxy settings can be defined on a Linux machine for AMA communication. If multiple settings are defined, see the proxy settings precedence concept article.

## 1. Arc Proxy Inheritance
Beginning in AMA 1.34, AMA will inherit proxy from Arc if the following file exists:

```
/var/opt/azcmagent/localconfig.json
```

Evidence in extension.log:
```
/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<version>/extension.log
```

Proxy is applied via systemd override files:
- `/etc/systemd/system/azuremonitor-coreagent.service.d/proxy.conf`
- `/etc/systemd/system/metrics-extension.service.d/proxy.conf`

## 2. Environment Variables
AMA reads proxy from these environment variables (in order):
- `MDSD_http_proxy`
- `HTTPS_PROXY`
- `https_proxy`
- `HTTP_PROXY`
- `http_proxy`

Check commands:
```bash
# USER environment variables
sudo -u syslog echo "$MDSD_http_proxy"
sudo -u syslog echo "$HTTPS_PROXY"
sudo -u syslog echo "$https_proxy"
sudo -u syslog echo "$HTTP_PROXY"
sudo -u syslog echo "$http_proxy"

# PID environment variables
ps -ef | grep mdsd
cat /proc/{pid}/environ
```

When proxy is found, mdsd.info logs:
```
/var/opt/microsoft/azuremonitoragent/log/mdsd.info
```
```
Get http proxy for Azure Storage API '{proxyURL}'.
The resulted http proxy setting for Azure Storage API is '{proxyURL}'.
```

## 3. systemd Config
Check systemd config files for proxy references:
```bash
cd /etc && grep -lr "{proxyURL}"
cd /usr && grep -lr "{proxyURL}"
cd /run && grep -lr "{proxyURL}"
cd ~ && grep -lr "{proxyURL}"
```
