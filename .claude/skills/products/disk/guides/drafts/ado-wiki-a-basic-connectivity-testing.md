---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Basic Connectivity Testing"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20FXT%20and%20vFXT%2FTroubleshooting%2FBasic%20Connectivity%20Testing"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Basic Connectivity Testing

From time to time, there will be a need to test IPs or services for connectivity. There are a few easy connectivity tests that customers can run from clients or the Azure Portal to test their network connectivity and to insure that services can be seen as expected.

## CLIENTS OR NODES

If the customer has access to a node or a client, you can run the following commands to test connectivity to an IP or TCP/UDP port. The tests vary slightly depending on which OS a client is using.

**UNIX IP CONNECTIVITY TESTING (PING)**

To test connectivity to an IP, use the ping command:

```
ping -c 10 <ip>
```

To ping from a specific source IP:

```
ping -c 10 -S <srcIP> <dstIP>
```

**UNIX TCP OR UDP PORT CONNECTIVITY (NC)**

To test a specific TCP port:
```
nc -zvv <ip> <tcp port number>
```

To test a UDP port, add the `-u` option:
```
nc -zvvu <ip> <udp port number>
```

**WINDOWS IP CONNECTIVITY TESTING (PING)**

```
ping -n 10 <ip>
ping -n 10 -S <srcIP> <dstIP>
```

**WINDOWS TCP PORT CONNECTIVITY (TNC)**

```
tnc <ip> -Port 2049
```
Check the `TcpTestSucceeded` field in the output. No easy way to test UDP from PowerShell — use Linux client or node for UDP tests.

## AZURE PORTAL

For Azure vFXT clusters, use **Connection Troubleshooting** in the VNet's Overview page (left-hand menu). Docs: https://docs.microsoft.com/en-us/azure/network-watcher/network-watcher-connectivity-overview

## IPERF_MENU.SH

To troubleshoot multiple IPs or test network bandwidth performance, use `iperf_menu.sh` — run on a node. Download from:
https://msazure.visualstudio.com/One/_git/Avere-AGSTools?path=%2FdebugHost%2Fagstools%2Fbin

Documentation: https://microsoft.sharepoint.com/teams/AvereGlobalServices/SitePages/iperf_menu.sh.aspx

> Note: This test can take quite a while as it tests connectivity of every interface on every node. Usually request the customer to run it and provide results.
