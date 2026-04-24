---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/basic-troubleshooting-dns-resolution-problems
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot DNS Resolution Problems in AKS

## Key Questions
- Where? (Pod/Node/Both)
- What error? (Timeout/No such host)
- How often? (Always/Intermittent)

## Test Each Layer
1. CoreDNS pod: dig @pod-ip
2. CoreDNS service: dig @svc-ip
3. Node: dig @node-dns
4. VNet DNS config

## CoreDNS Health: status, CPU/Memory, node placement
