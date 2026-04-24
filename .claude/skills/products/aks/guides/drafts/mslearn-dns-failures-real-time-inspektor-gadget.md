---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-dns-failures-across-an-aks-cluster-in-real-time
importDate: "2026-04-24"
type: guide-draft
---

# Real-Time DNS Traffic Analysis with Inspektor Gadget

## Steps
1. Identify unsuccessful responses: filter rcode!=Success
2. Identify slow queries: filter latency>5ms
3. Verify upstream DNS health
4. Verify query/response timing
5. Verify response IPs for headless services
