---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/TSG: DDoS Attack Post-Mortem"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20DDoS%20Attack%20Post-Mortem"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

Steps an SE/TA can take to do a "post-mortem" on a confirmed DDoS attack (mitigated by DDoS Standard).

> NOTE: Most important step here is to **educate the customer** on how to obtain this data on their own going forward!

# Confirm DDoS Mitigation Occurred

1. **[Log Sources for DDoS Standard > Is/Was My VIP Under Mitigation?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767/Log-Sources-for-DDoS-Protection?anchor=ddos-dashboards-(ddos-standard))**  
   Check "is under mitigation" dashboard value = `1` for the reported impact timeframe. If not `1`, the attack was not mitigated by DDoS Standard → customer should use NSG flow logging to analyze traffic.  
   Note the thresholds for the VIP (needed later).

2. **[SLB: How many Packets/sec is/was my VIP handling?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767/Log-Sources-for-DDoS-Protection?anchor=slb%3A-how-many-packets/sec-is/was-my-vip-handling%3F)**  
   Check SLB metrics for traffic spike. DDoS Standard mitigation relies on packet/sec *sampling* (not counting every packet) — values "close enough" to threshold confirm the trigger.

# Identify Source IPs, Protocols, Ports, Direction, and "Fake" DDoS

> IMPORTANT: The Kusto info below is not generally available to CSS. Post to Teams (DDoS channel) if you get 403 unauthorized errors. TA can assist or involve PG.

**Access requirement**: Join MyAccess security group **NetCapPlanKustoViewers** at https://idweb/identitymanagement/aspx/groups/AllGroups.aspx

```kusto
cluster('NetCapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= datetime(09/29/2022 21:50) and TimeStamp <= datetime(09/29/2022 22:25)
| where DstIpAddress == "20.54.182.185"
| summarize PPS=sum(NumOfPackets)*4096 by bin(TimeStamp, 5m), SrcIpAddress, IpProtocolIdentifier
| sort by PPS desc 
// Uncomment for TCP only
| where IpProtocolIdentifier == int(6)
// Uncomment for UDP only
//| where IpProtocolIdentifier == int(17)
```

**For detailed live-analyzed DDoS traffic** (requires access to SG ["DDos Kusto Access for Partners"](https://idwebelements.microsoft.com/GroupManagement.aspx?Operation=join&Group=ddoskustopartner)):

```kusto
cluster('aznwddos.centralus').database('cnsgeneva').DDoSPcapFlowLogs
| where TIMESTAMP>ago(1d)
| distinct messageValue
```

Possible messageValue actions taken by DDoS device (A10):
- TCP invalid syn, Packet was forwarded to the service, Packet rate exceed, UDP port zero, TCP ack authentication retry, No port / proto, Connection rate limit exceed, TCP port zero, TCP syn authentication reset, Entry blacklisted & drop, AnomalyCheck fail, UDP spoof detect, TCP unauth drop, TCP auth packet, UDP wildcard port, UDP filter, Entry deleted, TCP wildcard port, UDP known response source port, DNS malformed, Src entry type mismatch

```kusto
// Summarize DDoS attack source IP, source port, action taken by DDoS devices by 1 hour
cluster('aznwddos.centralus').database('cnsgeneva').DDoSPcapFlowLogs 
| where destPublicIpAddress in ('52.153.231.208')
| where TIMESTAMP > datetime('2022-12-01 12:00:00')
| project TIMESTAMP, sourcePublicIpAddress, sourcePort, destGeoGroup, destPublicIpAddress, destPort, protocol, payloadLength, messageValue, OpcodeName
| summarize count() by bin(TIMESTAMP,1h), sourcePublicIpAddress, sourcePort, destPublicIpAddress, protocol, messageValue
```

## Identifying Outbound / "Fake" DDoS

**Scenario**: Azure Firewall or NVA generating high outbound TCP from a single IP (e.g., during business hours), triggering DDoS TCP threshold. Indicators of "Fake DDoS":
1. Source ports are mostly 443 or well-known application ports
2. Source IPs are limited to Microsoft Online / AAD IP addresses
3. Destination ports are random
4. Top messageValue is "Packet was forwarded to the service"

**Mitigations**:
1. (Customer side): Deploy multiple outbound IPs to distribute traffic — architecture change, involve CSA/ACE/Field team.
2. (Microsoft side): Create ICM with strong business justification to request DDoS team lift the threshold for the specific IP. This is per-IP, case-by-case.

> **DO NOT SHARE WITH CUSTOMER**: Limits cannot be increased above 2M pps for TCP, 200k for UDP, 100k for TCP-SYN. Distribute traffic across multiple IPs instead.

Reference ICM: https://portal.microsofticm.com/imp/v5/incidents/details/701588414/summary

# What to provide to customers

- Source IPs & Protocols during attack timeframe (top values only, e.g., top 3 IPs)
- Attack direction
- This data is the same as DDoS Mitigation Reports

Assist customer with enabling DDoS Mitigation logging and metrics:
* [View and configure DDoS diagnostic logging](https://docs.microsoft.com/azure/ddos-protection/diagnostic-logging?tabs=DDoSProtectionNotifications)

# Reporting the incident

Customer-ready content for reporting to government and ISP:
- EU: https://www.europol.europa.eu/report-a-crime/report-cybercrime-online
- Canada: https://www.cyber.gc.ca/en/incident-management
- USA: FBI local office https://www.fbi.gov/contact-us/field-offices or https://www.ic3.gov/
- Azure abuse: https://msrc.microsoft.com/report/abuse
- AWS abuse: https://support.aws.amazon.com/#/contacts/report-abuse
- GCP abuse: https://support.google.com/code/contact/cloud_platform_report?hl=en

Use whois.arin.net to determine IP owner; iplocation.net to determine ISP.

# Contributors

* ANP DDoS Team
