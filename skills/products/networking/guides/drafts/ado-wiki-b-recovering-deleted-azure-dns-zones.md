---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Recovering Deleted Azure DNS Zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FRecovering%20Deleted%20Azure%20DNS%20Zones"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recovering Deleted Azure DNS Zones

## Scenario

Customer accidentally deleted DNS zones in Azure DNS causing critical business systems to go offline. CSS can help recover DNS zone records using Jarvis + Kusto.

## Prevention (Before Recovery)

Protect DNS zones from accidental deletion:
[Protecting DNS Zones](https://docs.microsoft.com/en-us/azure/dns/dns-protect-zones-recordsets)

---

## Recovering Private DNS Zone Records

### Step 1 — Identify the delete operation timestamp

```kusto
cluster('https://armprodeus.eastus.kusto.windows.net').database('Requests').EventServiceEntries
// For EU: cluster('https://armprodweu.westeurope.kusto.windows.net').database('Requests').EventServiceEntries
| where subscriptionId == "00000000-0000-0000-0000-000000000000"
| where TIMESTAMP >= ago(90d)
| where resourceUri contains "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rglab/providers/Microsoft.Network/privateDnsZones/test.contoso.com"
```

### Step 2 — Find the ListPrivateResourceRecordsOperation timestamp

```kusto
cluster('privatedns.westus.kusto.windows.net').database('gcp').QosEtwEvent
| where SubscriptionId == "00000000-0000-0000-0000-000000000000"
| where TIMESTAMP >= ago(90d)
| where OperationName contains "ListPrivateResourceRecordsOperation"
| where RequestUrl contains "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rglab/providers/Microsoft.Network/privateDnsZones/test.contoso.com"
```

### Step 3 — Query Jarvis for the record set data

Use the latest (or target) timestamp from Step 2 as input:

- **Namespace:** `PrivateDNSControlPlane`
- **Events:** `FrontendOperationEtwEvent`
- **Sample Jarvis link:** https://portal.microsoftgeneva.com/s/DE1FC0B6

### Step 4 — Extract records from Message column

Make sure `Message` column is visible (add from toolbar if hidden).

**If Jarvis shows `[..]<TRUNCATED>` at end of cell:**

> ⚠️ **STOP** — Zone is too large for Jarvis extraction. Engage a TA to involve PG.
> - Create IcM on **Cloudnet\DNSServingPlane** queue
> - Reference PG TSG: [restore-a-deleted-dns-zone](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-networking/afdn-abhisht/dns-serving-plane/dns-serving-plane-trouble-shooting-guide/sops/restore-a-deleted-dns-zone)
> - **Note:** Act quickly — the further back PG must go, the longer and more costly the recovery.

### Step 5 — Parse the records

If full records are in `Message` column:
1. Right-click on Message value → `Copy Cell`
2. Paste everything after `Code: OK. Data:` starting with `{` into Notepad

Example output format:
```json
{"value":[{"id":"\/subscriptions\/...\/providers\/Microsoft.Network\/privateDnsZones\/test.contoso.com\/SOA\/@","name":"@","type":"Microsoft.Network\/privateDnsZones\/SOA",...}]}
```

### Step 6 — Recover additional zone properties

For recovering **VNet links**, **private DNS properties**, etc.:
- Follow same steps but filter for `GetPrivateZoneOperation`, `GetVirtualNetworkLinkOperation` instead of `ListPrivateResourceRecordsOperation`

---

## Recovering Public DNS Zone Records

### Step 1 — Identify the delete operation timestamp

```kusto
cluster('https://armprodeus.eastus.kusto.windows.net').database('Requests').EventServiceEntries
// For EU: cluster('https://armprodweu.westeurope.kusto.windows.net').database('Requests').EventServiceEntries
| where subscriptionId == "00000000-0000-0000-0000-000000000000"
| where TIMESTAMP >= ago(90d)
| where resourceUri contains "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rglab/providers/Microsoft.Network/dnszones/test2.contoso.com"
```

### Step 2 — Find the ListResourceRecordsOperation timestamp

```kusto
cluster('azuredns.kusto.windows.net').database('clouddnsprod').QosEtwEvent
| where SubscriptionId == "00000000-0000-0000-0000-000000000000"
| where TIMESTAMP >= ago(90d)
| where OperationName contains "ListResourceRecordsOperation"
| where RequestUrl contains "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rglab/providers/Microsoft.Network/dnszones/test2.contoso.com"
```

### Step 3 — Query Jarvis for the record set data

Use the latest (or target) timestamp from Step 2:

- **Namespace:** `CloudDnsFEProd`
- **Events:** `FrontendOperationEtwEvent`
- **Sample Jarvis link:** https://portal.microsoftgeneva.com/s/9C53F9AF

### Step 4-5 — Same as Private DNS

- Check `Message` column for `[..]<TRUNCATED>` — if truncated, engage TA/PG immediately
- Parse records from `Code: OK. Data:` onwards

Example output format:
```json
{"value":[{"id":"\/subscriptions\/...\/providers\/Microsoft.Network\/dnszones\/test2.contoso.com\/NS\/@","name":"@","type":"Microsoft.Network\/dnszones\/NS",...}]}
```

---

## Key Notes

- The **closer to the delete event** you act, the easier and cheaper the recovery
- For large zones that exceed Jarvis output limits → must engage PG via IcM
- IcM queue: **Cloudnet\DNSServingPlane**
- Private DNS: use `PrivateDNSControlPlane` namespace in Jarvis
- Public DNS: use `CloudDnsFEProd` namespace in Jarvis
