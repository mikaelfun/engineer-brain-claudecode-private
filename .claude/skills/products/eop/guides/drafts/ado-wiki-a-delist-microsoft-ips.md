---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/[DRAFT] Delist Microsoft IPs from block-listing services"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FDrafts%2F%5BDRAFT%5D%20Delist%20Microsoft%20IPs%20from%20block-listing%20services"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

# Delist Microsoft IPs from Block-Listing Services

## Overview

While MDO has a number of protections to prevent its 'clean' IPs from ending up on third-party blocking-list services (DNS-based blocklists / DNSBLs), they do appear on these lists from time to time. When external receiving servers use DNSBLs, outbound mail from MDO servers may be blocked or identified as spam.

---

## Process

These are the steps support engineers should follow when outbound traffic is blocked due to a Microsoft IP:

1. Confirm that the block is based on a Microsoft IP address, and that we support delisting from the related DNSBL.
2. Confirm whether the IP is in the High-Risk Delivery Pool (HRDP) or not (HRDP addresses are expected to regularly appear on DNSBLs).
3. Check whether the IP is currently on the DNSBL where the issue originally occurred.
4. Take steps to delist the IP (may require escalation).

---

## Steps

### Step 1. Confirm the block is based on a Microsoft IP and that we support delisting

Check the actual SMTP response (not MXToolbox). DNSBLs are categorized as:

| Category | Description |
|---|---|
| Supported — partners | We have a direct relationship to delist |
| Supported — best effort | We can attempt delisting |
| Unsupported — unscalable delist method | Cannot process at scale |
| Unsupported — misuse of list | List used incorrectly |
| Unlisted DNSBL | Unknown list |

### Step 2. Confirm whether the IP is in the High-Risk Delivery Pool (HRDP)

Note: Even if the IP is part of HRDP, we should still take steps to delist it, as we need to keep our IPs as clean as possible.

### Step 3. Check whether the IP is currently on the DNSBL

Use the table below to check if the IP is currently listed.
- If listed → continue to Step 4.
- If not listed → confirm the status to the customer.

| DNSBL | Lookup site | Delist in support |
|---|---|---|
| Abusix | https://app.abusix.com/lookup | Yes |
| 0Spam | https://0spam.org/check | No |
| SpamCop | https://www.spamcop.net/bl.shtml | No |
| \<any other DNSBL\> | N/A | No |

### Step 4. Take steps to delist the IP

- If support **may** delist the IP address: pass the case to the appropriate queue where an FTE engineer can take action. FTEs should follow the internal delisting guide.
- If support **may not** delist the IP address: escalate the case to engineering.
