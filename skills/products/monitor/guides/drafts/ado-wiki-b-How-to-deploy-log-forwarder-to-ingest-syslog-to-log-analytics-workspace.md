---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How to: deploy log forwarder to ingest syslog to log analytics workspace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How%20to%3A%20deploy%20log%20forwarder%20to%20ingest%20syslog%20to%20log%20analytics%20workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

**Note:**
We have multiple ways to deploy log forwarder in different linux distributions, this wiki just provide you several options to setup log forwarder quickly for related issue.

# Option 1: Azure sentinel connector
**Architecture:**
![image.png](/.attachments/image-e7de5ef9-aec3-470f-8b93-e87feb234d16.png)

prerequisites: https://docs.microsoft.com/azure/sentinel/connect-log-forwarder?tabs=rsyslog#prerequisites

Setup log forwarder with azure sentinel workspace: https://docs.microsoft.com/azure/sentinel/connect-log-forwarder?tabs=rsyslog

Deployment script: https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_installer.py

# Option 2: linux syslog daemon
If you just would collect syslog but don't need CEF messages, please follow below steps to configure syslog forwarder and agent:
## 1. Install rsyslog package (some linux distribution already had it by default)
install:

    $ sudo yum update && yum install rsyslog 	#CentOS 7

    $ sudo apt update && apt install rsyslog	#Ubuntu 16.04, 18.04

Once rsyslog installed, you need to start the service for now, enable it to auto-start at boot and check it�s status with the [systemctl command](https://www.man7.org/linux/man-pages/man1/systemctl.1.html).

    $ sudo systemctl start rsyslog
    $ sudo systemctl enable rsyslog
    $ sudo systemctl status rsyslog

## 2. Configure /etc/rsyslog.conf
### 2.1 uncomment below lines to use both UDP and TCP at same time

    Note: you can also uncomment one of them to allow only UDP or TCP
$ ModLoad imudp

$ UDPServerRun 514

$ ModLoad imtcp

$ InputTCPServerRun 514

![image.png](/.attachments/image-601f2d0f-bf9b-46f7-8cb3-3493d386ae67.png)

**Note:** If the system has firewall enabled, you need open port 514 to allow above connection:

    CentOS:
    $ sudo firewall-cmd --permanent --add-port=514/udp
    $ sudo firewall-cmd --permanent --add-port=514/tcp
    $ sudo firewall-cmd --reload

    Ubuntu:
    $ sudo ufw allow 514/udp
    $ sudo ufw allow 514/tcp
    $ sudo ufw reload 
### 2.2. restart service 
$ sudo service rsyslog restart

### 2.3. check service status and make sure no error 
$ sudo service rsyslog status

## 3. Configure syslog client server

### 3.1. Add this line at the end of file /etc/rsyslog.conf
 *. * @@ OURADDRESSIP: 514

   ![image.png](/.attachments/image-616fada2-1daa-4b55-82a9-3f9ef7d0e174.png)

**Note:** To forward messages to another host via UDP, prepend the hostname with the at sign ("@").  To forward it via plain tcp, prepend two at signs ("@@"). To forward via RELP, prepend the string":omrelp:" in front of the hostname. See [rsyslog.conf](https://www.man7.org/linux/man-pages/man5/rsyslog.conf.5.html) for details.

### 3.2. restart service
 $ sudo service rsyslog restart

### 3.3. check service status and make sure no error
 $ sudo service rsyslog status

## 4. Check syslog forwarding
Once configured, you can tail all related files if forwarder server can receive syslog from client server. Rule definition:

![image.png](/.attachments/image-69506198-49e5-4239-b7d3-64052629c30e.png)

logs from client server:

![image.png](/.attachments/image-604fc5b4-9113-41ef-baee-099040412d0e.png)

## 5. Advanced configuration of syslog (optional)
By default, server will forward all facilities syslog from client server, you can also configure rule in /etc/rsyslog.conf with specific facilities with below format:
facility.severity_level	destination (where to store log)

## 6. Install log analytics agent in forwarder server by following [this doc](https://docs.microsoft.com/azure/azure-monitor/agents/data-sources-syslog), skip detailed steps
Finally you can query syslog in your LA workspace and will see syslog forwarded from client server:

![image.png](/.attachments/image-eb2874ab-958b-4de8-be93-b96e028ef783.png)

# Reference
Redhat syslog configuration: https://access.redhat.com/documentation/red_hat_enterprise_linux/6/html/deployment_guide/s1-configuring_rsyslog_on_a_logging_server

Sentinel syslog forwarder: https://docs.microsoft.com/azure/sentinel/connect-log-forwarder?tabs=rsyslog#prerequisites

