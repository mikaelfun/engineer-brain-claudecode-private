---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check the listening ports of a process"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Check%20the%20listening%20ports%20of%20a%20process"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This article describes how to identify the listening and active ports for a specific process. The columns output by the [netstat](https://linux.die.net/man/8/netstat) command are as follows:

- Proto: The protocol used by the connection (e.g., TCP, UDP).
- Recv-Q: The count of bytes not copied by the user program connected to this socket.
- Send-Q: The count of bytes not acknowledged by the remote host.
- Local Address: The address and port number of the local end of the connection.
- Foreign Address: The address and port number of the remote end of the connection.
- State: The state of the connection (e.g., LISTEN, ESTABLISHED). This column is empty for UDP connections.
- PID/Program name: The process ID (PID) and name of the program that is using the socket.

# Scenario: Rsyslog

Use the following command to list the ports Rsyslog is listening on:
```
netstat -tulnp | grep rsyslog
```

![image.png](/.attachments/image-fb14e5e9-78a1-425a-9cd3-0b1d9b0e4f34.png)

Generally, this is defined in one of the following paths:
**/etc/rsyslog.conf**
**/etc/rsyslog.d/*.conf**

![image.png](/.attachments/image-ff8ba382-d46e-469d-be06-49507464d6ce.png)

# Scenario: Syslog-ng

Use the following command to list the ports Rsyslog is listening on:
```
netstat -tulnp | grep syslog-ng
```

![image.png](/.attachments/image-e9951987-590c-46bd-ac54-eb26aaab2dab.png)

Generally, this is defined in one of the following paths:
**/etc/syslog-ng/syslog-ng.conf**
**/etc/syslog-ng/conf.d/*.conf**

![image.png](/.attachments/image-1f28de83-7371-4a48-a4d7-bbb010a8daf6.png)

# Scenario: Mdsd Syslog
Mdsd will normally listen on tcp port 28330 to receive syslog messages from the syslog daemon.  If an existing process is using this port binding, mdsd will dynamically allocate a new port. 
The port used by mdsd for syslog ingestion can be found by reviewing the syslog.port file found in the following locations:

```VM | ARC: /etc/opt/microsoft/azuremonitoragent/config-cache/syslog.port```
```Troubleshooter: ..\DCR\config-cache\syslog.port```

```
cat /etc/opt/microsoft/azuremonitoragent/config-cache/syslog.port
28330
```

![image.png](/.attachments/image-8c9110dc-e31d-499c-a0c7-99c14ddc6819.png)

# Scenario: Mdsd Fluentbit
```VM|Arc: /etc/opt/microsoft/azuremonitoragent/config-cache/fluent.port```
```Troubleshooter: ..\DCR\config-cache\fluent.port```

```
cat /etc/opt/microsoft/azuremonitoragent/config-cache/fluent.port
```

![image.png](/.attachments/image-e8b3f1fc-3935-4b45-91e1-0c818908bd28.png)

```
netstat -tulnp | grep mdsd
```

![image.png](/.attachments/image-01f7e6ad-3516-43aa-97af-9dd4c8e826c7.png)

```VM|Arc: /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.xml```
```Troubleshooter: ...\DCR\config-cache\mcsconfig.lkg.xml```

![image.png](/.attachments/image-02bde3ea-f528-45f4-8c03-b38e727fd1d2.png)