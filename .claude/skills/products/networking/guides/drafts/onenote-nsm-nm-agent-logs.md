---
title: NSM and NM Agent Log Reference
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/AKS CRUD Operations/NSM Logs.md
product: networking
tags: [nsm, nm-agent, rnm, kusto, fcshell, node-logs]
21vApplicable: true
---

# NSM / NM Agent Log Reference

## Overview
NSM handles final network operation execution at Cluster/Node level (NRP -> RNM -> NSM).

## 1. RNM Operation Events (Kusto)
Cluster: azurecm.kusto.windows.net/AzureCM
Table: RnmOperationEvents
Filter by tenantName (GUID)
Fields: PreciseTimeStamp, EventMessage

## 2. NM Agent Logs (Host Node)
Download via FCShell or ASC Host Analyzer (Diagnostics tab):
- get-fabric FabricName
- Get-Node -Id NodeId -fabric f
- Get-Container -ContainerId ContainerId -fabric f
- Get-NodeAgentDiagnostics -DiagnosticType AllLogs -Node n -DestinationPath C:\logs -startTime -endTime
