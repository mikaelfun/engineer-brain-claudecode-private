---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Confirm Agent Rollout Status in Regions for Azure VMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20Confirm%20Agent%20Rollout%20Status%20in%20Regions%20for%20Azure%20VMs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Introduction
-------

This article provides visibility into the **current deployment status of the Azure Monitor Agent (AMA)** for both **Windows** and **Linux** across multiple rollout stages.
Each stage corresponds to a specific set of Azure regions, following the **Safe Deployment Practice (SDP)**. This process ensures controlled rollout, monitoring, and rollback if necessary. 

**Important Note:** This content is provided for internal Microsoft Support reference only.

Key Notes
---------

*   **Deployment tracking**: You can monitor the rollout status using the official pipeline URLs listed below.
    
*   **Rollback visibility**: If an extension deployment is paused, pulled, or rolled back, the status will also be reflected in these pipeline views.
    
*   **SDP stages**: Rollouts start with a limited scope (Canary) and expand gradually to global availability (All).

# Deployment Stages

| **Friendly Name** | **Stage** | **Regions (new regions highlighted per stage)** |
| --- | --- | --- |
| Canary | 1 | Central US EUAP |
| Canary2 | 2 | Central US EUAP; East US 2 EUAP |
| Pilot | 3 | Central US EUAP; East US 2 EUAP; West Central US |
| Medium | 4 | Central US EUAP; East US 2 EUAP; West Central US; North Central US |
| Large | 5 | Central US EUAP; East US 2 EUAP; West Central US; North Central US; West US |
| Batch1A | 6 | Central US EUAP; East US 2 EUAP; West Central US; North Central US; West US; East Asia; Australia East; Australia Central; Canada Central; North Europe; France Central; West India; Japan East; Korea Central; East US 2 |
| Batch1B | 7 | Central US EUAP; East US 2 EUAP; West Central US; North Central US; West US; East Asia; Australia East; Australia Central; Canada Central; North Europe; France Central; West India; Japan East; Korea Central; East US 2; Brazil South; South Africa North; Switzerland North; UK West; UAE North; East US; Norway East; Central India; West US 2 |
| Batch2A | 8 | Central US EUAP; East US 2 EUAP; West Central US; North Central US; West US; East Asia; Australia East; Australia Central; Canada Central; North Europe; France Central; West India; Japan East; Korea Central; East US 2; Brazil South; South Africa North; Switzerland North; UK West; UAE North; East US; Norway East; Central India; West US 2; Southeast Asia; Australia Southeast; South Central US; Canada East; Japan West; Korea South; Switzerland West; UAE Central |
| Batch2B | 9 | Central US EUAP; East US 2 EUAP; West Central US; North Central US; West US; East Asia; Australia East; Australia Central; Canada Central; North Europe; France Central; West India; Japan East; Korea Central; East US 2; Brazil South; South Africa North; Switzerland North; UK West; UAE North; East US; Norway East; Central India; West US 2; Southeast Asia; Australia Southeast; South Central US; Canada East; Japan West; Korea South; Switzerland West; UAE Central; Australia Central 2; France South; South India; West Europe; Central US; Norway West; South Africa West; UK South |
| All |  | All Azure regions |

# How CSS Should Use This
-----------------------

When handling support cases related to **Azure Monitor Agent (AMA) deployment or auto-upgrade issues**, CSS engineers should:
1.  **Verify rollout stage**
    *   Check the affected customers region.
        
    *   Compare against the rollout stage table above to confirm whether AMA deployment should have reached that region.
        
2.  **Check pipeline status**
    *   Use the pipeline links below to verify if the deployment in that stage/region is:
        *   In progress
            
        *   Completed
            
        *   Rolled back / paused
            
3.  **Escalation handling**
    *   If AMA is not yet deployed in the customers region  inform the customer that rollout is pending.
        
    *   If deployment is paused/rolled back  share that this is an unexpected delay.
        
    *   If deployment is completed but the customer still faces issues  proceed with standard troubleshooting.
        
         
4.  **Proactive communication**
    *   Use this rollout information to set customer expectations.
        
    *   Escalate to PG only if the issue persists in a region where deployment has been confirmed as completed.


**AMA Windows**  [Releases - Pipelines](https://dev.azure.com/msazure/One/_build?definitionId=430401&_a=summary&view=runs)
**AMA Linux**   [Releases - Pipelines](https://msazure.visualstudio.com/One/_release?_a=releases&view=mine&definitionId=37528)