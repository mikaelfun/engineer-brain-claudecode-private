---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Reading DNS Captures"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FReading%20DNS%20Captures"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Reading DNS Captures (Wireshark Guide)

## Introduction

Reading DNS captures involves identifying and confirming latency issues, slow resolution times, incorrect records, and other DNS-related information useful for troubleshooting.

## Before We Start — Information to Gather

- [x] Source and Destination IP
- [x] The Fully Qualified Domain Name (FQDN)
- [x] The exact time and time zone of the query (required for Azure DNS logs)

## The Basics

Type `dns` in the Wireshark display filter to find all DNS traffic.

This provides a general overview of source IP, destination IP, capture times, etc.

---

## General DNS Traffic Filters

| **Filter** | **Wireshark Syntax** | **Explanation** |
|---|---|---|
| Basic DNS filter | `dns` | Captures all DNS traffic |
| DNS queries only | `dns.flags.response == 0` | Displays only DNS queries sent by client |
| DNS responses only | `dns.flags.response == 1` | Shows only DNS responses from server |

## Specific DNS Query Type Filters

| **Query Type** | **Wireshark Syntax** | **Explanation** |
|---|---|---|
| A (IPv4) queries | `dns.qry.type == 1` | Filters for IPv4 address requests |
| AAAA (IPv6) queries | `dns.qry.type == 28` | Displays IPv6 address requests |
| MX (Mail Exchange) queries | `dns.qry.type == 15` | Filters DNS queries for mail servers |
| CNAME queries | `dns.qry.type == 5` | Shows canonical name alias queries |
| TXT queries | `dns.qry.type == 16` | Filters TXT record requests (SPF, DKIM, etc.) |
| PTR (reverse DNS) | `dns.qry.type == 12` | Displays reverse DNS lookup queries |

## Filtering by Specific Domain

| **Filter Type** | **Wireshark Syntax** | **Explanation** |
|---|---|---|
| Exact match | `dns.qry.name == "contoso.com"` | Exactly matches `contoso.com` |
| Contains string | `dns.qry.name contains "contoso"` | All queries containing `contoso` anywhere |
| Case-insensitive match | `dns.qry.name matches "(?i)contoso.com"` | Case-insensitive match |

> **Note:** Queries are strings and must be enclosed in double quotes; otherwise, Wireshark will return an error.

---

## Identifying a DNS Transaction

A DNS capture includes both a `query` and a `response`. Key identifiers in a healthy DNS transaction:

1. **Wireshark arrows** (→ for query, ← for response)
2. **Info section**: Query shows record type + FQDN, no IP; Response shows IP address
3. **Transaction ID** (`dns.id`): Links query/response pair — use this to match them
4. **Query section**: One or more queries from sender, no `Answers` field
5. **Answer section**: One or more answers from server

---

## Looking for Errors and Issues

### Slow DNS
```
dns && dns.time > 0.01
```
Filters requests that took over 10ms. Useful for identifying slow DNS servers or forwarding latency.

### NXDOMAIN (Domain Not Found)
```
dns.flags.rcode == 3
```

### All DNS Errors
```
dns.flags.rcode > 0
```

---

## Common DNS Response Codes (RCODE) Reference

| **DNS Error** | **Wireshark Filter** | **Explanation** |
|---|---|---|
| Format Error (RCODE 1) | `dns.flags.rcode == 1` | DNS query was malformed |
| Server Failure (RCODE 2) | `dns.flags.rcode == 2` | DNS server unable to process query |
| NXDOMAIN / Name Error (RCODE 3) | `dns.flags.rcode == 3` | Domain name does not exist |
| Not Implemented (RCODE 4) | `dns.flags.rcode == 4` | DNS operation not supported by server |
| Refused (RCODE 5) | `dns.flags.rcode == 5` | Server refused to answer (firewall/policy) |
| All DNS Errors | `dns.flags.rcode > 0` | Filters all error responses |
| No Error (Success) | `dns.flags.rcode == 0` | Successful DNS responses only |

---

## Summary

- DNS captures help diagnose resolution issues, latency, and errors.
- Wireshark filters allow isolating specific queries, responses, errors, and slow transactions.
- Understanding DNS transactions and error codes is key to troubleshooting effectively.
- Use `Transaction ID` to correlate query-response pairs.
- Use `dns.time > 0.01` to identify slow DNS transactions.
