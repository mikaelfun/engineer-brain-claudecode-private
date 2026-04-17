---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/DNS Flag Day"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FDNS%20Flag%20Day"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# DNS Flag Day and Azure DNS

## Description

DNS Flag Day (February 1, 2019) and its possible effects on Azure DNS.

## Background

DNS Flag Day was February 1, 2019. On that day, large DNS providers and DNS software vendors deployed changes removing certain EDNS workarounds from their code. Previously, resolvers would silently retry DNS queries without EDNS when authoritative servers returned errors — this behavior was removed.

**EDNS** is an extension mechanism for DNS enabling UDP messages beyond the 512-byte limit, plus extra flags and RCODEs.

## Azure DNS Status

**Azure DNS is NOT impacted by DNS Flag Day.** Testing of Azure DNS zones showed:
- No timeouts for **plain DNS** and **EDNS version 0** tests — the minimum required to survive DNS Flag Day.
- Azure DNS follows **RFC6891** in supporting EDNS(0).
- **Known long-term issue**: Azure DNS does not correctly handle unknown EDNS option codes (should ignore, but instead REFUSES the request). This violates RFC6891 §6.1.2, but does not cause immediate impact on Flag Day.

**AWS** was also affected; **Google Cloud Compute** was not.

Public reference: https://azure.microsoft.com/en-us/updates/azure-dns-flag-day/

## What to Tell Customers

Customers running zones on Azure DNS saw **zero impact** on February 1, 2019. The Azure DNS team has an action item to address the unknown EDNS option code handling long-term.

## Test Tool

Use https://ednscomp.isc.org/compliance/summary.html to test any authoritative DNS server. Note: the tool also tests DNSSEC — for DNS Flag Day compliance, only plain DNS and EDNS v0 tests are required; additional tests (DNSSEC etc.) can be ignored.

## Contributors

Mohammad Hijazi, Ryan Borstelmann
