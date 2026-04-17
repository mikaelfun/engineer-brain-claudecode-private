---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[How-To] BMM Network Issue Diagnosis Using Logs and Dashboards"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BHow-To%5D%20BMM%20Network%20Issue%20Diagnosis%20Using%20Logs%20and%20Dashboards"
importDate: "2026-04-06"
type: troubleshooting-guide
---

_Last review: 20-March-2026_  
**Created by: Delkis Rivas**

[[_TOC_]]


Overview
--------

This article provides guidance on using Bare Metal Machine (BMM) logs and dashboards to diagnose transient network/interface issues in Network Cloud clusters. These issues can cause temporary node cordoning or degraded states, often resolving automatically without intervention. We'll use a real-world example from a recent incident to illustrate the process [2603120040004359](https://onesupport.crm.dynamics.com/main.aspx?appid=101acb62-8d00-eb11-a813-000d3a8b3117&pagetype=entityrecord&etn=incident&id=36da9219-1b1e-f111-8341-6045bdd8c88e&lid=1774034940913)

Background on BMM Logs
----------------------

BMM logs are collected via Kusto query. They capture detailed metadata on node states, network interfaces, Kubernetes conditions, and operational statuses. Key data points include:

```
macro-expand isfuzzy=true NetworkCloudEG as X (
X.KubernetesContainers
| where * contains "bmm-name"
| where clusterName == "cluster-name"
| where PodName contains "baremetal"
| where TIMESTAMP between (todatetime("2026-xx-xxT00:00:00") .. todatetime("2026-xx-xxT23:00:00"))
| where * contains "port" or * contains "fail" or * contains "flap"
)
```
*   Network interface statuses (e.g., eth0, LACP ports like 37_p0, 37_p1).
*   Conditions such as�`BmmNetworkLinksUp`,�`PortDownProblem`,�`PortFlappingProblem`.
*   Degraded state timestamps (e.g.,�`degradedStartTime`,�`degradedEndTime`).
*   Hardware and provisioning details.
These logs help distinguish between transient network issues and persistent hardware faults.

Accessing BMM Logs and Dashboards
---------------------------------

1.  **Log Retrieval**:
    *   For a specific node, filter by�`Node`�or�`BareMetalMachine`�name.
    *   Common columns:�`TIMESTAMP`,�`Node`,�`FluentdIngestTimestamp`,�`crData`�(contains detailed JSON).
2.  **Dashboards**:
    *    Key dashboards: Node Health, Network Interfaces, BMM Conditions.
    *   [BMM Degraded Conditions Summary Dashboard](https://lei-grafana-prod-czbvetgph6ckdzdh.eus.grafana.azure.com/goto/VP5Dnv5vR?orgId=1).
    *   Metrics to monitor: Port status, link stability, cordon status.

![==image_0==.png](/.attachments/==image_0==-4c3b5171-495f-4d8a-830e-6d73afe6b591.png) 

Step-by-Step Diagnosis for Network/Interface Issues
---------------------------------------------------

When investigating why an issue impacted only one node (e.g., isolated cordoning), follow these steps:

### 1. Identify the Affected Node and Time Window

*   Review incident alerts for the node name and timestamps.
*   In logs, look for�`degradedStartTime`�and�`degradedEndTime`.
*   Confirm the issue is transient: Check if the node self-recovered (e.g.,�`cordonStatus: "Uncordoned"`).

### 2. Examine Network Interface Status

*   Parse the�`crData`�JSON for interface details under�`platform.afo-nc.microsoft.com/node-data.status.lldp.interfaces`.
*   Key statuses:
    *   **Up interfaces**: LACP ports (e.g., 37_p0, 37_p1, 8b_p0, 8b_p1), PXE (pxe).
    *   **Down interfaces**: Look for eth0 or other critical interfaces showing�`"status": "down"`.
*   Compare with other nodes: If only one node has eth0 down, it's likely isolated.

### 3. Check BMM Conditions

*   Conditions indicate stability:
    *   `BmmNetworkLinksUp: True`�(all links up).
    *   `BmmNetworkLinksStable: True`�(no flapping).
    *   `PortDownProblem: False`�(no persistent down issues).
    *   `PortFlappingProblem: False`�(no recent flapping).
*   If conditions show instability during the window but resolve, it's transient.

### 4. Rule Out Hardware Faults

*   Verify�`hwvalidation-failed: "false"`.
*   Check provisioning status:�`provisioningState: "provisioned"`.
*   Ensure no power or config changes correlate with the issue.

### 5. Correlate with Cluster-Wide Data

*   Confirm other nodes have similar interface statuses (e.g., eth0 up).
*   Use dashboards to visualize: One node degraded vs. cluster healthy.

Example: Transient Connectivity Issue on ptdor25r9c10
-----------------------------------------------------

In the referenced recent case, node ptdor25r9c10 was cordoned for ~17 minutes due to network instability.

### Logs Analysis

*   **Degraded Window**: 2026-03-12T12:34:49Z to 12:51:51Z.
*   **Interface Status**:
    *   Up: 37_p0, 37_p1, 8b_p0, 8b_p1, pxe.
    *   Down: eth0 (consistently in logs, but transient overall).
*   **Conditions**:�`BmmNetworkLinksUp`�stabilized post-window; no�`PortFlappingProblem`.
*   **Isolation**: Only this node affected; others had eth0 up.

### Why Only One Node?

*   Eth0 down on ptdor25r9c10 caused PortDown/Flapping, triggering cordon.
*   Other nodes unaffected due to stable interfaces.
*   No hardware faults; issue self-resolved.

### Resolution

*   No action needed; node healthy.
*   Case closed with customer confirmation.

Best Practices
--------------

*   **Automation**: Set alerts for�`PortDownProblem`�or�`PortFlappingProblem`.
*   **Documentation**: Log findings in incident reports.
*   **Escalation**: If persistent, involve hardware teams; transient issues are often network-related.
*   **Tools**: Use scripts to parse JSON in�`crData`�for quick interface checks.
* Reference to: [[How-to] Identifying Transient Failures vs Product Bugs - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2379349/-How-to-Identifying-Transient-Failures-vs-Product-Bugs)