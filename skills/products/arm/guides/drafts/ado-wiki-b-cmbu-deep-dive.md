---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[Doc] Cluster Management Bundle Update (CMBU) Deep Dive"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BDoc%5D%20Cluster%20Management%20Bundle%20Update%20%28CMBU%29%20Deep%20Dive"
importDate: "2026-04-06"
type: troubleshooting-guide
---


# Cluster Management Bundle Update (CMBU)  Deep Dive & Troubleshooting Guide
**Created by: Andrei Ivanuta**  
_Last review: 24-February-2026_

  


  

## Overview

This article provides a technical deep dive into the Cluster Management Bundle Update (CMBU) process in Network Cloud. It explains the architecture, update flow, failure handling, and new logging and troubleshooting capabilities introduced in version 4.9. The content is tailored for support engineers responsible for investigating and resolving CMBU-related issues.

Source video (internal): [CMBU BrownBag Recording](https://microsoft-my.sharepoint.com/personal/matthewernst_microsoft_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fmatthewernst_microsoft_com%2FDocuments%2FRecordings%2FCMBU+BrownBag-20260130_113349-Meeting+Recording.mp4)

## Use Cases / Scenarios
- Executing CMBU to roll out platform and cluster extensions.  
- Diagnosing failed or degraded cluster states during CMBU.  
- Handling incorrect target versions or preexisting extension failures.  
- Leveraging new logging and telemetry enhancements in version 4.9.

  

## Architecture / Components / Data Flow [00:04:00]

  

### What is CMBU?

The Cluster Management Bundle Update (CMBU) workflow keeps every managed cluster aligned with the extension versions shipped with the Cluster Manager bundle. The controller monitors a single `ClusterManagementBundleUpdate` (CMBU) custom resource and coordinates rolling upgrades of cluster extensions without disrupting active workloads.
  

### Key Components
- **Geneva Action**: Triggers the update process.  
- **Resource Provider (RP)**: Initiates the update by instructing the Cluster Manager.  
- **Cluster Manager**: Coordinates updates across all clusters it manages.  
- **Cluster Extensions**: Includes platform underlay, overlay, fabric, Arc agent, Azure Monitor, Defender, Policy, etc.  
- **CMDUCR (ClusterCRMetadata)**: Tracks update metadata and status per cluster.
 
  

## Procedures

### Update Flow [00:04:50] 
This [cmbu-flow.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-flow.md&_a=preview&anchor=failure-and-degraded-states) walkthrough connects the high-level context in the CMBU Overview with concrete controller touchpoints so engineers, support, and SREs can follow a bundle rollout end-to-end.
1. Geneva Action triggers the RP.
2. RP creates a CMDUCR in the Cluster Manager.
3. Cluster Manager evaluates clusters for readiness.
4. If all clusters are healthy, updates proceed.
5. Extensions are updated in sequence (see below).
6. If the first cluster fails, the update halts to prevent propagation.
  

### Extension Update Sequence [00:06:35]
This document provides an visual overview of the update sequence proposed for 4.9: [cmbu-redesign-proposal.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs-dev/cmbu-redesign-proposal.md&_a=preview&anchor=expected-impact-(10-cluster-fleet))
1. Arc Agent
2. Platform Network Data
3. Fabric Extension
4. Underlay Extension
5. Overlay Extension (includes tenant VM/NAKS operator)
6. Cluster Roles
7. Custom Location
8. First-party Extensions (Azure Monitor, Defender, Policy)  deployed in parallel from version 4.9 onward

### Failure Propagation Logic [00:07:50] 
This guide explains how the Cluster Management Bundle Update (CMBU) controller builds and uses the readiness map to decide which clusters can enter the next update wave: [cmbu-readiness-evaluation.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-readiness-evaluation.md&anchor=failure-and-degraded-states&_a=preview)
- If the first cluster fails, the update halts to avoid cascading failures.
- Assumes similar behavior across clusters. 


### CMBU Failure Handling and Retries [00:20:45]
This guide follows the happy-path flow, pointing out where failures are tolerated, where they abort the run, and how state is left on the cluster: [cmbu-failure-handling.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-failure-handling.md&_a=preview&anchor=cmbu-failure-handling-and-retries)
- Failures in key extensions (platform overlay, underlay, fabric) cause full CMBU failure.
- Failures in non-critical extensions (Arc agent, Azure Monitor, Defender) result in a degraded state but do not block the update.

### Resuming a Failed CMBU [00:24:20]
This document explains how the CMBU controller decides how many clusters to upgrade in parallel and how you can influence that behavior: [cmbu-concurrency-tuning.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-concurrency-tuning.md&anchor=failure-and-degraded-states&_a=preview)
If the first cluster fails:
- Concurrency is set to 0.
- Resume the update using the Geneva action: 
```
Resume-CMU -ClusterManager <name>
```
This sets `spec.resumeUpdate = true` in the cluster CR.


### Log Phase Markers [00:12:10]
Use logbased phase markers to track update progression.

####Cluster Update Readiness Map
This guide explains how the CMBU controller evaluates readiness per cluster and stores results in `status.updateReadinessStatus`:  [cmbu-update-readiness-status.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-update-readiness-status.md&anchor=failure-and-degraded-states&_a=preview)

####Cluster Management Bundle Update Status Timeline
This describes the status transitions applied to the `Cluster` CR during a CMBU operation: [cmbu-statuses.md - Repos](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_git/nc-cluster-operator?path=/docs/ClusterManagerBundleUpdate/cmbu-statuses.md&anchor=failure-and-degraded-states&_a=preview)


## Common Issues and Troubleshooting

### Incorrect Target Version [00:09:30]
- No validation currently exists on the RP side.  
- If an invalid version is specified:
  - The Cluster Manager enters a failed state.  
  - Activity log message:
    - "Selected version does not exist"  
- Retrying with a valid version resumes the update.

### Node Health Pre-checks [00:22:15]
- Control plane node health is critical.
- Compute node degradation does not block CMBU.
- Cluster must be in a ready state.

  

### Pre-existing Extension Failures [00:30:10]
- CMBU may attempt to reinstall or fix failed extensions.
- Cluster must not be in a disconnected state.  

## Best Practices / Recommendations
- Monitor the first cluster update closely  it determines whether the process continues.  
- Use the resume action to recover from transient failures.  
- Validate target versions before triggering Geneva Actions.  
- Ensure control plane nodes are healthy before initiating CMBU.  
- Leverage phasebased logging in version 4.9 for diagnostic clarity.

  

## Kusto query examples 
These queries are applicable for version 4.9 and later, where additional logging fields are available. Usage on early versions will not provide the desired output. 

### Kusto Query for CMDUCR [Use this query to review CMBU concurrency status](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=cmbu-concurrency-status)
### Kusto Query to track CMBU trough different stages [Cmbu Phases](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=cmbu-phases).
### CMBU Cluster extension version in logs [This query allows to check for the new cluster images being used](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=cmbu-cluster-extension-version-in-logs)
Look for image version strings in ContainerImage column:
```
New Cluster Extension: PR944
```
### Query to check  [Successfully installed extension versions in logs](https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2331175/NC-Kusto-Repo?anchor=successfully-installed-extension-versions-in-logs)
Look for message column
```
Fabric Extension Updated to: 9.2
Platform Underlay Extension Updated to: 10.0.0-133
```

## Additional Notes / Limitations
- Rollback is not supported  CMBU is a failforward mechanism.  
- Logging improvements (phase markers, version visibility) are available in version 4.9 and later.  
- Concurrency scaling follows Fibonacci logic (1  2  3 ) based on successful cluster completions.  
- [CMBU Troubleshooting | Network Cloud TSGs](https://eng.ms/docs/cloud-ai-platform/microsoft-specialized-clouds-msc/msc-edge/linux-edge-large/afoi-network-cloud/network-cloud-tsgs/doc/undercloud/deployment/cmbu-overall-troubleshoot) provides phaselevel risk assessments and troubleshooting guidance.

**Compute node health considerations**

CMBU execution primarily depends on the health of the control plane nodes and the overall cluster status. A Cluster Management Bundle Update can proceed even if one or more compute (worker) nodes are in a degraded or failed state, provided that:

- All control plane nodes are healthy, and
- The overall cluster detailed status is Running.

The number of failed or degraded compute nodes that can be tolerated during a CMBU is governed by the upgrade strategy configured for the cluster. For example:

- With an 80% operability strategy, a cluster with 16 worker nodes can tolerate up to ~20% of nodes being unavailable without blocking the upgrade.
- With a 90% operability strategy, only a single failed worker node per rack may be tolerated.

If the upgrade strategys availability threshold is exceeded, the CMBU will not proceed until cluster health is restored within acceptable limits.


  

## Key Enhancements in CMBU v4.9
### Parallel Deployment of First-Party Extensions 
Azure Monitor, Azure Defender, and Azure Policy extensions are now deployed in parallel, reducing overall execution time.

### Phase-Based Logging for Update Progress
Each step in the CMBU process now logs a distinct phase marker, simplifying failure point identification.

### Version Visibility in Logs
Logs now include image versions for updated extensions (e.g., Fabric, Underlay, Overlay). Makes it easier to confirm what was deployed.

### Improved Metrics for Failure Detection 
CMBU metrics now correctly reflect failure states, improving observability and alerting.

### Transition from Platform Cluster Extension to Platform Underlay Extension 
This change affects how custom locations are handled and requires attention during upgrade planning.

### TSG (Troubleshooting Guide) Updates 
Now includes phase-based failure risk assessments. Helps engineers identify and resolve issues faster.