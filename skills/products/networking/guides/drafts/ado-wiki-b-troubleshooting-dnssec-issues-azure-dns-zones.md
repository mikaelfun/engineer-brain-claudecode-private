---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Feature: DNSSEC support In Azure DNS Zones/TSG: Troubleshooting DNSSEC issues in Azure DNS zones"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FFeature%3A%20DNSSEC%20support%20In%20Azure%20DNS%20Zones%2FTSG%3A%20Troubleshooting%20DNSSEC%20issues%20in%20Azure%20DNS%20zones"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Troubleshooting DNSSEC Issues in Azure DNS Zones

## Step 1 — Check if the Zone is DNSSEC-Enabled

1. In ASC, navigate to the Azure DNS zone. The **DNSSEC details** section shows `Status` as `Enabled` plus signing details.

**Alternative — Kusto query** (cluster: azuredns, database: dnsbillingprod):

```kusto
ZoneEvent
| where TIMESTAMP > ago(2h)
| where SubscriptionId == "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
| where ResourceGroup == "xxxx"
| where ZoneName == "xxxx"
| where DnssecProvisioningState == "Succeeded"
| where DnssecServingEnabled  == "True"
| distinct SubscriptionId, ZoneName, ResourceGroup, BucketId, DnssecProvisioningState, DnssecServingEnabled
```

## Step 2 — Confirm Correct Delegation and Trust Chain

1. Check if the zone has a DS record in the parent zone that matches the zone's DNSKEY:

```bash
dig DS contoso.net +short
```

Or use [DigWebInterface](https://digwebinterface.com/) — a DS record type should be returned if correctly configured.

2. Verify full trust chain using [DNSViz](https://dnsviz.net/):
   - DNSSEC-enabled zones should show `Status: Secure`
   - **Black arrow** = issue → hover for details (e.g., "Delegation from abc to xyz — Status: INSECURE")
   - **Child zone**: ensure DS record is added to parent zone
   - **Top-level domain**: ensure DS record is added to domain registrar
   - Disable DNSSEC if not needed

## Step 3 — Troubleshoot DNSSEC Resolution

Check if resolvers can verify DNSSEC signatures:

```bash
dig contoso.net +dnssec
```

For extended guide: [DNS resolution not working DNSSEC validation failure](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/267995/DNS-resolution-not-working-DNSSEC-validation-failure)

## Step 4 — Disabling DNSSEC

> ⚠️ **Critical**: A new DS key is created every time DNSSEC is enabled for an Azure DNS zone. Disabling/re-enabling DNSSEC **will break resolution** until DSKEYS are refreshed on the registrar side.

**Correct process to disable DNSSEC:**
1. First, remove the DS record at the parent zone or registrar.
2. Wait for the DS record TTL to expire (so resolvers stop validating against the old key).
3. Then disable DNSSEC from the Azure portal DNSSEC blade.

The Azure portal will warn about these requirements when attempting to disable DNSSEC.
