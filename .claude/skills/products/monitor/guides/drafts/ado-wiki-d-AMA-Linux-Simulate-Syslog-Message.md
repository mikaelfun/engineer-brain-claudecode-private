---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Syslog - Simulate Syslog Message"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Syslog%20-%20Simulate%20Syslog%20Message"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

#Overview
This document demonstrates how to send test Syslog messages using either [logger](https://www.man7.org/linux/man-pages/man1/logger.1.html)or [ncat](https://www.man7.org/linux/man-pages/man1/ncat.1.html).

#Prerequisites:
- [**Facility**](https://en.wikipedia.org/wiki/Syslog#Facility) - A facility code is used to specify the type of system that is logging the message. Valid ranges 0-23
- [**Severity**](https://en.wikipedia.org/wiki/Syslog#Severity_level) - A standardized way to indicate the importance or urgency of a log message. Valid ranges 0-7
- **Priority**(pri) - Syslog Facilty and Severity can be represented as priority which is an integer between 1 and 191.  
To calculate pri from a known Facility and Severity use this formula:    **<PRI> = ( <facility> * 8) + <severity> )**
[The PRI message part | AxoSyslog scalable security data processor](https://axoflow.com/docs/axosyslog-core/chapter-concepts/concepts-message-structure/concepts-message-bsdsyslog/concepts-message-bsdsyslog-pri/)

- **Destination** - The recipient of the syslog message. IP address or DNS name of the destination or localhost for the local Syslog daemon
- **Protocol** - TCP or UDP as defined by the listener configuration of the syslog daemon
- **Port** - Port value as defined by the listener configuration of the syslog daemon. Default is 514

See the following links for assistance determining Protocol and Port values
[AMA Linux: Concepts: Syslog Daemon (rsyslog) - input()](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1924119/AMA-Linux-Concepts-Syslog-Daemon-(rsyslog)?anchor=input())
[AMA Linux: Concepts: Syslog Daemon (Syslog-ng) - Default config](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1842822/AMA-Linux-Concepts-Syslog-Daemon-(Syslog-ng)?anchor=syslog-ng-default-configuration-file))



#Scenario - Logger
## Syslog
The below commands assume localhost as the destination local7.notice for Facility and Severity:
```
    # Update the --server and --port parameters as needed
    ## UDP RFC 5424   
    logger --udp --rfc5424 --server 0.0.0.0 --port 514 --priority local7.notice -- Test syslog message from $(hostname) $(date)
    
    ## UDP RFC 3164    
    logger --udp --rfc3164 --server 0.0.0.0 --port 514 --priority local7.notice -- Test syslog message from $(hostname) $(date)
    
    ## TCP RFC 5424
    logger --tcp --rfc5424 --server 0.0.0.0 --port 514 --priority local7.notice -- Test syslog message from $(hostname) $(date)
    
    ## TCP RFC 3164
    logger --tcp --rfc3164 --server 0.0.0.0 --port 514 --priority local7.notice -- Test syslog message from $(hostname) $(date)
```
## Common Event Format (CEF)
The below command uses Common Event Format (CEF) assumes local host as the destination and syslog.info for Facility and Severity:

```
logger -n 127.0.0.1 -P 514 -d -p syslog.info "CEF:0|TestCommonEventFormat|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time deviceExternalId=0002D01655 src=1.1.1.1 dst=2.2.2.2 sourceTranslatedAddress=1.1.1.1 destinationTranslatedAddress=3.3.3.3 cs1Label=Rule cs1=CEF_TEST_InternetDNS"
```

#Scenario - NCat(nc)
The below commands assume localhost as the destination and local7.notice for Facility and Severity as defined as pri value 189
```
    ## UDP RFC 3164
    echo "<189>$(date +'%b %d %H:%M:%S') $(hostname) $(whoami):  Test udp syslog message from $(hostname) echo $(date +"%A %B %d %H:%M:%S %Z %Y")" | nc localhost --udp 514

    ## UDP RFC 5424
    echo "<189>1 $(date +'%Y-%m-%dT%H:%M:%S.%6N%z') $(hostname) $(whoami)  - - [timeQuality tzKnown=\"1\" isSynced=\"1\" syncAccuracy=\"74299\"] Test udp syslog message from $(hostname) echo $(date +"%A %B %d %H:%M:%S %Z %Y")" | nc localhost --udp 514

    ## TCP RFC 3164
    echo "<189>$(date +'%b %d %H:%M:%S') $(hostname) $(whoami):  Test tcp syslog message from $(hostname) echo $(date +"%A %B %d %H:%M:%S %Z %Y")" | nc localhost 514

    ## TCP RFC 5424
    echo "<189>1 $(date +'%Y-%m-%dT%H:%M:%S.%6N%z') $(hostname) $(whoami)  - - [timeQuality tzKnown=\"1\" isSynced=\"1\" syncAccuracy=\"74299\"] Test tcp syslog message from $(hostname) echo $(date +"%A %B %d %H:%M:%S %Z %Y")" | nc localhost 514
```