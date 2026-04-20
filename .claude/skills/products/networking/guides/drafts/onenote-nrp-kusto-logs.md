---
title: NRP (Network Resource Provider) Kusto Log Reference
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/AKS CRUD Operations/NRP Logs.md
product: networking
tags: [nrp, kusto, network-resource-provider, arm, vnet, nsg, nic]
21vApplicable: true
---

# NRP Kusto Log Reference

## Clusters
- Global: nrp.kusto.windows.net/mdsnrp
- Mooncake: aznwchinamc.chinanorth2.kusto.chinacloudapi.cn/aznwmds

## Tracing Chain
ARM EventServices ServiceRequestId == NRP QOSEtwEvent OperationID == NRP FrontEndOperationEtwEvent OperationID
Or: CRP ContextActivity x-ms-request-id == NRP OperationID

## Key Tables
1. QosEtwEvent - operation summary (filter by SubscriptionId, HttpMethod, OperationId)
2. FrontendOperationEtwEvent - verbose per-operation logs (EventCode, Message)
3. ReadOperationResponseEtwEvent - GET request/response details
4. WriteOperationResponseEtwEvent - PUT request/response details (may be truncated)

## Typical Operations Logged
- PUT IP Address creation
- Subscription/Resource limits checks
- NRP to RNM calls
- Background task completion
- VNET/NSG/NIC operations each have distinct call traces
