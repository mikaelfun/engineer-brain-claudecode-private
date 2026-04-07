---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check the status of a service"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Check%20the%20status%20of%20a%20service"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article covers how to check the status of a service on a Linux operating system. 

A service on a Linux operating system is a background process that performs a specific function or set of functions. These services, also known as daemons, typically start when the system boots and continue running in the background to provide essential functionality. Common examples include web servers, database servers, and system logging services.

# Scenario: Rsyslog

Check the status of Rsyslog by running the following command: 
```
systemctl status rsyslog
```

![image.png](/.attachments/image-bf5d9349-14be-4d6c-827d-f2f5091d0d1c.png)

# Scenario: Syslog-ng
Check the status of Syslog-ng by running the following command: 
```
systemctl status syslog-ng
```

![image.png](/.attachments/image-16e2b4cf-2df6-408e-872c-d584d69ba6f6.png)

# Known Issues
#88786