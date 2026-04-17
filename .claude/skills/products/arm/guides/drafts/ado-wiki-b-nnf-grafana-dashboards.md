---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[How-To] Troubleshoot NNF Resources Using Grafana Dashboards"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BHow-To%5D%20Troubleshoot%20NNF%20Resources%20Using%20Grafana%20Dashboards"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Delkis Rivas**  
_Last review: 4-March-2026_

WIP

[[_TOC_]]


Purpose
=======

This guide provides a dashboard-first troubleshooting approach** for **Network Network Fabric (NNF) resources using Grafana.
It helps you:
*   Identify where a failure lives (Fabric, ISD, Network, Policy, NNI)
    
*   Understand what Grafana dashboard is actually showing
    
*   Know what to validate next
    
*   Avoid common troubleshooting mistakes
    

> **Key principle:** Grafana shows resource state, not **root cause**.

* * *

How to Use This Guide (2-Minute Flow)
=====================================

1.  Obtain the Fabric ID** from the SR
    
2.  Open:
    *   [Fabric Health Dashboard - Networking/Fabric - Running Infrastructure - Nexus - Dashboards - Grafana](https://lei-grafana-prod-czbvetgph6ckdzdh.eus.grafana.azure.com/d/bfe80l61hgh6oc/fabric-health-dashboard?orgId=1&from=now-13d&to=now&timezone=utc&var-Datasource=ef9z4kpm9rqioe&var-fabricId=%2Fsubscriptions%2Fc9a8d429-afe9-4b88-afa2-cd09b3889367%2FresourceGroups%2Fadp-nprd-usw3-austx85-fab-rg%2Fproviders%2FMicrosoft.ManagedNetworkFabric%2FnetworkFabrics%2Fadp-nprd-usw3-austx85-fab&var-deviceId=$__all&var-componentName=CPU0)
        
    *   [Isolation Domain Health Dashboard - Networking/Fabric - Running Infrastructure - Nexus - Dashboards](https://lei-grafana-prod-czbvetgph6ckdzdh.eus.grafana.azure.com/d/ffe806dzaw6pse/isolation-domain-health-dashboard?orgId=1&from=now-30d&to=now&timezone=utc&var-Datasource=ef9z4kpm9rqioe&var-fabricId=%2Fsubscriptions%2Fc9a8d429-afe9-4b88-afa2-cd09b3889367%2FresourceGroups%2Fadp-nprd-usw3-austx85-fab-rg%2Fproviders%2FMicrosoft.ManagedNetworkFabric%2FnetworkFabrics%2Fadp-nprd-usw3-austx85-fab&var-Resourcetype=L3IsolationDomains&var-ResourceId=%2Fsubscriptions%2Fc9a8d429-afe9-4b88-afa2-cd09b3889367%2Fresourcegroups%2Fadp-nprd-usw3-austx85-fab-rg%2Fproviders%2Fmicrosoft.managednetworkfabric%2Fnetworkfabrics%2Fadp-nprd-usw3-austx85-fab)
        
3.  Identify the first resource in:
    *   `Rejected`
        
    *   `Accepted`
        
    *   `Disabled`
        
4.  Use the Troubleshooting Matrix below to determine:
    *   Required child resources
        
    *   Correct Grafana panel
        
    *   What fields must be validated
        

* * *

Mental Model: How NNF Resources Relate
======================================

Network Fabric
 L2 Isolation Domain
   VLAN / MTU / MAC (TOR  TOR)

 L3 Isolation Domain
   Internal Network (BGP, IPv4/IPv6 prefixes)
   External Network (Route Targets, Option A/B)
   Route Policy
       IP Prefix rules (sequence-based)
       Community rules (route-targets)

 NNI
     Interfaces / VLAN / ASN (network  network)

**Rule:** Always troubleshoot top-down, but validate children first.

* * *

What Feeds the Grafana Dashboards (Source of Truth)
===================================================

Primary Data Sources
--------------------

### Azure Kusto Queries

Primary source.
Uses the Resource ID table and provides:
*   Provisioning State
    
*   Configuration State
    
*   Administrative State
    

### Azure Monitor Metrics

Adds health and monitoring context.

### Logs / Geneva Metrics

Panel-dependent enrichment only.

> Grafana is a **projection layer**.  
> It reflects backend state; it does **not** infer behavior or perform RCA.

* * *

Timestamp Rules (Critical)
==========================

Always verify the time window:
*   **Last 24 hours**  recent failures
    
*   **Last 30 days**  lifecycle / stuck resources
    
*   **Modified time**  change correlation
    

> Most false investigations are caused by **wrong time selection**, not missing data.

* * *

Troubleshooting Matrix (Primary Reference)
==========================================

| Symptom | Start With | Required Child Resources | Grafana Panel | Validate | Usually Means |
| --- | --- | --- | --- | --- | --- |
| Multiple resources unhealthy | Network Fabric | L2 ISDs, L3 ISDs, NNIs | Fabric Health | Fabric ID filter correct | Fabric rarely root cause |
| Rack traffic broken | L2 ISD | VLAN, MTU, MAC | L2 ISD Panel | VLAN + MTU present, state = Succeeded | Payload or push failure |
| L3 exists but no routing | L3 ISD | 1 Internal or External Network | L3 ISD Panel | Child networks listed | L3 cannot function alone |
| Internal routing broken | Internal Network | BGP, IP Prefixes | Internal Network Panel | Prefixes present | Missing prefixes |
| External routing broken | External Network | Import / Export Route Targets | External Network Panel | RTs + Option A/B | Wrong RT configuration |
| Routes denied unexpectedly | Route Policy | IP Prefix + Community | Route Policy Panel | Policy attached | Policy missing / mislinked |
| Specific subnet unreachable | IP Prefix | Sequence + permit/deny | IP Prefix Panel | Rule order | Earlier deny blocks traffic |
| RT-based routing missing | Community | Route Target Members | Community Panel | Permit action | Missing / denied RT |
| No network-to-network traffic | NNI | Interfaces, VLAN, ASN | NNI Panel | Interface enabled | Disabled / rejected NNI |

* * *

How to Read Resource States (Quick Decode)
==========================================

| State | Meaning |
| --- | --- |
| **Succeeded** | Resource created and config pushed |
| **Accepted** | Payload valid but not fully applied |
| **Rejected** | Invalid payload or backend failure |
| **Deleting** | Resource teardown in progress |
| **Admin Disabled** | Exists but not pushed to devices |

> **Important**
> *   **Succeeded  traffic works**
>     
> *   **Rejected  device issue**
>     

* * *

Common Anti-Patterns to Avoid
=============================

*   Debugging L3 ISD before checking child networks
    
*   Looking for VLAN / MAC in L3 (they exist only in L2)
    
*   Assuming routing behavior without checking Route Policy
    
*   Starting at Fabric instead of the first failed resource
    

* * *

Ownership & Escalation Guidance
===============================

Ownership
---------

*   **Fabric / NNI issues**  Fabric / Networking team
    
*   **ISD / Network / Policy issues**  NNF control-plane team
    

Escalate to PG When
-------------------

*   Resource state = **Succeeded** but traffic is broken
    
*   Grafana state contradicts device behavior
    
*   All layers (**ISD  Network  Policy**) appear correct
    

* * *
 

Acronyms (Grouped by Layer)
---------------------------

### **Fabric & Control Layer**

| Acronym | Meaning |
| --- | --- |
| **NNF** | Network Network Fabric |
| **ISD** | Isolation Domain |
| **L2 ISD** | Layer2 Isolation Domain |
| **L3 ISD** | Layer3 Isolation Domain |
| **NNI** | Network-to-Network Interface |

* * *

### **Routing & Networking Layer**

| Acronym | Meaning |
| --- | --- |
| **BGP** | Border Gateway Protocol |
| **ASN** | Autonomous System Number |
| **RT** | Route Target |
| **VLAN** | Virtual Local Area Network |
| **MTU** | Maximum Transmission Unit |
| **IP** | Internet Protocol |
| **IPv4** | IP version 4 |
| **IPv6** | IP version 6 |
| **NPB** | Network Packet Broker |
