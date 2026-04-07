---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Troubleshooting Random DNS Query Failures"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTroubleshooting%20Random%20DNS%20Query%20Failures"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Random DNS Query Failures

## Description

Steps CSS can use to identify random query timeouts or delays before escalating to Microsoft Teams.

## Scenario

Customer reports random DNS query latency increases or failures. Key assumption: queries travel to **168.63.129.16** (Azure's default DNS).

Typical topology:
```
K8s Client --> K8s Pod --> 168.63.129.16 --> Azure DNS Recursive Resolver (RrDNS) --> Authoritative NS
```

Each region has 2+ datacenters, each with 2+ recursive resolvers (RrDNS — handles both public and private domain resolution).

---

## Step 1 — Define Scoping Details for the Source VM

> **Source** = Azure resource communicating with 168.63.129.16

- VM using Azure Default DNS → use that VM's info
- VM forwarding from custom DNS server → use the custom DNS server VM's info
- On-premise machine forwarding to Azure DNS → **not available** in PrivateDnsRr or EventForwarderEvent logs

**Required information before proceeding:**
- Specific query name (FQDN)
- Precise timestamp
- VM name, NodeID, NodeIP, VNETID, ContainerID, Region

**VM deployment details query:**
```kusto
cluster("Vmainsight").database('vmadb').CAD
| where PreciseTimeStamp between ((startdate-1d)..startdate)
| where LastKnownSubscriptionId == subId
| where RoleInstanceName has VMname
| order by EndTime desc
| take 1
| project StartTime, EndTime, TenantName, RoleInstanceName, Cluster, NodeId, NodeIp, ContainerId
```

---

## Step 2 — Check DNSForwarderEventLog

**Namespace:** `LNMAgent` | **Events:** `ForwarderEvents`

Filter by `ContainerId`. Use the following triage table:

| # | Condition | Interpretation | Next Step |
|---|---|---|---|
| 1 | `QueriesSentUdp == 0` | VM not forwarding to DnsForwarder | Check custom DNS config; get VM packet trace |
| 2 | `QueriesRejectedUdp != 0` | Malformed packets or internal error | File IcM to "Cloudnet/DNS Forwarder" |
| 3 | `QueriesDroppedByQpsFilterUdp != 0` or `QueriesDroppedByInFlightFilterUdp != 0` | DnsForwarder throttling | → See Scenario 2 below |
| 4 | `ResponsesErroredUdp != 0` | RR returned error RCODE (not NOERROR/NXDOMAIN) | → Analyze RrDNS Log |
| 5 | `ResponsesNxDomainUdp != 0` | RR returned NXDOMAIN | Check domain name; if private domain → file IcM |
| 6 | `ResponsesTimedOutUdp != 0` | DNS response not received within 2 seconds | → Analyze DNS Query Timeout |
| 7 | `QueriesBlockedByAclPolicy != 0` | Illegal inter-tenant DNS query denied | File IcM to "Cloudnet/DNS Forwarder" |

---

## Step 3 — Analyze RrDNS Log

Check `ExtendedStats` column in DNS Forwarder DGrep query for `RR=[<VIP>]`. This VIP is the recursive resolver.

```
UDP stats
RR=[52.136.231.247]
  queries=2
  nonErrorResponses=2
  errorResponses=0
  timeouts=0
  responseRtt=1
```

Find tenant name in DCMT: `\\reddog\Builds\branches\dcmt_latest_amd64\Configuration\CloudSettings\Settings_LS_Prod.xml`

Example DCMT entry:
```xml
<Tenant Type="RrDns" Name="RrDns_BL2PrdApp03">
  <EnvironmentSetting Name="RrDnsVip" Value="168.62.39.246" />
  <EnvironmentSetting Name="RrDnsLogicalRegion" Value="useast" />
</Tenant>
```

Then use [Jarvis graphs](https://portal.microsoftgeneva.com/s/C3C10A47) with tenant name to view metrics.

---

## Scenario Breakdowns

### Scenario 1 — Intermittent DNS failures due to UDP source port 65330

UDP source port 65330 is reserved for the Host. VFP on the host drops DNS responses with destination port 65330.

Reference: [UDP traffic with destination port 65330 gets blocked](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/767387/UDP-traffic-with-destination-port-65330-gets-blocked)

---

### Scenario 2 — Random DNS failures to Azure DNS from public endpoint

Check **Jarvis namespace:** `DnsServingPlaneProd` | **Events:** `DnsResponse`

Filter by `QuestionName` (the DNS record customer is querying).

If further analysis needed → file IcM to "Cloudnet/CloudDns" with DnsEdge DGrep query link.

---

### Scenario 3 — Custom DNS server forwarding to 168.63.129.16, queries not appearing in logs

Symptom: Custom DNS Azure VM forwarded requests to Azure DNS (168.63.129.16), OS never received reply, Azure DNS logs don't show the requests.

Root cause: Custom DNS VM hit the **max pending DNS queries limit** (200 per Azure DNS limits).

Confirm using Jarvis:
- Namespace: `LNMAgent`
- Events: `DnsFowarderEvent`, `VMDnsHealthEvent`
- Filter by: NodeID + ContainerID of the DNS server VM

Check `MaxQueriesInFlightUdp` (hitting limit) and `QueriesDroppedByInFlightFilterUdp` (actual drops).

> ⚠️ Only `QueriesDropped*` columns (not `MaxQueriesInFlight*`) confirm actual user impact.

---

### Scenario 4 — Private DNS zone A record resolves to public IP instead of private

Check `EDNSScopeName` field in **PrivateDnsRr** Jarvis logs — this represents the VNet ID.

If DNS resolves public IP → confirm the query comes from the correct VNet using:

[DnsQueryTool Interface](https://digwebinterface.azurewebsites.net/PrivateDigQuery/PrivateSearch?hostnames=contoso.com&additionaloptions=&vnetId=00000000-0000-0000-0000-000000000000&queryrecord=ANY&region=canadacentral)

Required inputs: QNAME, VNETID, Azure Region, Query type (optional)

---

### Scenario 5 — Azure DNS resolver fails to resolve an external DNS name (RECURSE_QUERY_DROP)

Use **PrivateDnsRr** logs to trace resolution. Pair `LOOK_UP|QUERY_RECEIVED` with `LOOK_UP|RESPONSE_SUCCESS` or `LOOK_UP|RESPONSE_FAILURE`.

Correlate using:
- `XID` field for client query
- `QXID` field for recursive queries to authoritative NS

If you see `RECURSE_QUERY_DROP`:
> Packet seen here = RR timed out waiting for reply from authoritative NS. This indicates a problem with the external DNS server or connectivity to it. RR will send back SERVFAIL.

**Confirm NS resolution** using [DigWebInterface](https://www.digwebinterface.com/) with Trace option.

---

### Scenario 6.1 — RR resolves successfully but client sees timeout

Symptoms: PrivateDnsRr shows RESPONSE_SUCCESS with correct answer, but client reports timeout.

Check `DNSForwarderWarmPath/DNSForwarderQueryTimeoutEvent` for `Late response` or `Not Response` entries.

[Jarvis sample](https://portal.microsoftgeneva.com/s/B19138EE) — Filter by NodeId/NodeIp + ContainerId + QNAME

If late/no response entries found → network blip between PrivateDNS RR and DNSForwarder (SLB/Host Networking).

**Mitigations:**
- Enable client-side application-level retries
- Disable DNS recursion on custom DNS servers
- Add duplicate IPs to conditional forwarder (forces retry):
  ```powershell
  Set-DnsServerForwarder @("168.63.129.16", "168.63.129.16")
  Set-DnsServerConditionalForwarderZone -Name "example.contoso.com" -MasterServers @("168.63.129.16","168.63.129.16")
  ```
- Consider Azure Private DNS Resolver for hybrid topologies

---

### Scenario 6.2 — Azure VM fails DNS resolution at <0.1% rate, RR appears healthy

Symptoms: Random low-rate DNS timeouts (any domain, mostly public), VM using 168.63.129.16, RR appears healthy.

Root cause: **Host node in Low Memory state** causes DNS packet drops.

**Confirm with Kusto:**
```kusto
cluster('wdgeventstore.kusto.windows.net').database('KernelAgent').HostResourceManagerResourceSnapshotMetadata
| where Role == "HostNode"
| where TIMESTAMP between (datetime(2023-12-05T00:00:00)..datetime(2023-12-05T23:59:59))
| where NodeId == "" // NodeId of the DNS Server dropping packets
| project TIMESTAMP, NodeId, ReasonLevel2
```

If node shows Low Memory state → ICM reference: [DNS: Intermittent DNS query timeout](https://portal.microsofticm.com/imp/v3/incidents/incident/423179326/summary)

**Mitigations:**
- Redeploy affected VM to a different node (verify new node doesn't have low memory)
- Add duplicate forwarder IPs (retry hack):
  ```powershell
  Set-DnsServerForwarder @("168.63.129.16", "168.63.129.16")
  ```

---

### Scenario 7 — Azure DNS RR fails to resolve CNAME (intermittent — only CNAME returned, no IP)

Known WinDNS behavior: intermittent CNAME resolution where only CNAME is returned without the final A/AAAA.

Reference: [Intermittent DNS failures in resolving CNAME chain](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/233027/Intermittent-DNS-failures-in-resolving-CNAME-chain)

---

### Scenario 8 — Azure DNS fails to resolve On-Prem IP, no Private DNS Zone linked to VNet

Symptoms: VM resolves on-prem domains but Private DNS Zone is not directly linked. Possible Private DNS Resolver with Forwarding Rule Set involved.

**Investigation steps:**

1. Use [PrivateDNSRr logs](https://portal.microsoftgeneva.com/s/40FFC6A8) to follow DNS resolution chain
2. Check `RecursionScope` in `Recurse_Response_IN` entries — this identifies the forwarding path
3. Use Jarvis tip:
   - `//where it.any("Node IP")` → filter requests from specific source VM node
   - `//where it.any("GUID")` → then filter by GUID to see complete conversation

4. Use Azure Resource Graph to find the Forwarding Rule Set:

```kusto
cluster('argwus2nrpone.westus2.kusto.windows.net').database('AzureResourceGraph').Resources
| where timestamp >= ago(2d)
| where properties contains "InsertRecursionScopeHere"
| order by timestamp asc
| project timestamp, deleted, properties, type, id, location
```

**Access requirement:** Join [ARG Networking Stamp Users](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/argnetworkin-tv1j) group and add Kusto connection for `https://argwus2nrpone.westus2.kusto.windows.net`.

5. Check ASC for Forwarding Rule Set destination IP → verify on-prem DNS server is responding

Common root cause: Customer removed DNS role from on-prem server without updating the Forwarding Rule Set.

---

## General Escalation Guidance

> ⚠️ **Only raise an IcM if you see consistent behavior across time.** Your TA should capture node-level packet trace while customer reproduces the issue.

- IcM queues: `Cloudnet/DNS Forwarder`, `Cloudnet/CloudDns`, `Cloudnet/DNSServingPlane`
