---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/CRUD/Upgrade and Update/AKS CRUD operation failing with OverlaymgrReconcileError"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/AKS%20CRUD%20operation%20failing%20with%20OverlaymgrReconcileError"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS CRUD operation failing with OverlaymgrReconcileError

## Summary

This TSG describes how to troubleshoot the OverlaymgrReconcileError that may occur during AKS cluster CRUD operations (e.g. create, upgrade, start). When an operation fails due to OverlaymgrReconcileError the following message is displayed to the end-user:

```log
Category: InternalError; Code: OverlaymgrReconcileError; SubCode: OverlayMgrAPIRequestFailed; Message: Internal server error; InnerMessage: ; Dependency: ; AKSTeam: ; OriginalError: context deadline exceeded
```

Generically speaking this error indicates that the cluster's Overlay did not reach its intended running/ready state for some reason.

### What is the Overlay/Overlay Manager in AKS?

An AKS cluster Overlay is a deployment and reconciliation unit which includes:
- Customer Control Plane (CCP) pods
- kube-system and other "system" namespace pods
- add-on pods

The AKS Overlay Manager is responsible for managing and reconciling individual cluster Overlays.

## Troubleshooting

### 1. Identify which Overlay component is not reaching succeeded state

Using the AKS operation ID run the following Kusto query to view all Overlay Manager events:

```kql
cluster("Aks").database("AKSprod").OverlaymgrEvents
| where PreciseTimeStamp > ago(1d)
| where operationID == "<AKS_OPERATION_ID>"
| project PreciseTimeStamp, level, msg
```

Look for the final message indicating timeout and repeated references to the failing component.

### 2. Troubleshoot failures in CCP pods

If the failed pod is running in the CCP:

#### 2.1 Check CCP pod status
Use Jarvis action: [CustomerControlPlane - Get status](https://portal.microsoftgeneva.com/17DC7749)
Or check ASC: `Managed Cluster -> Control Plane -> Status -> Pod Status`

#### 2.2 Describe failed CCP pods
Use Jarvis action: [CustomerControlPlane - Describe pods](https://portal.microsoftgeneva.com/ACD915BD)
Check pod last state (e.g., OOMKilled).

#### 2.3 Check CCP pod logs
Use Jarvis action: [CustomerControlPlane - Get pod log](https://portal.microsoftgeneva.com/52DE24BC)

Or query Kusto directly:
```kql
union cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "<CCP_NAMESPACE>"
| extend pod = parse_json(properties).pod
| extend log = parse_json(properties).log
| extend container = category
| where pod == "<POD_NAME>"
| where container == "<CONTAINER_NAME>"
| project PreciseTimeStamp, pod, container, log
```

### 3. Troubleshoot failures in customer facing pods (kube-system)

#### 3.1 Check pod status
Use Jarvis action: [CustomerCluster - Run kubectl command](https://portal.microsoftgeneva.com/280757F5)

#### 3.2 Describe pods
Use Jarvis action: [CustomerCluster - Run kubectl describe](https://portal.microsoftgeneva.com/ED21B5C9)

#### 3.3 Check pod logs
Use Jarvis action: [CustomerCluster - Get pods log](https://portal.microsoftgeneva.com/CD802902)

If logs are missing, use Inspect IaaS Disk report on the VMSS instance in ASC, or request logs from customer.

### 4. Troubleshoot failures in components managed by ENO

Check ENO events:
```kql
cluster('akshubb.westus3').database('AKSprod').EnoEvents
| where PreciseTimeStamp between (datetime(2025-09-11T00:00:00Z) .. datetime(2025-09-12T00:00:00))
| where compositionNamespace =~ '<NAMESPACE_ID>'
| where msg =~ 'failed to reconcile resource'
| project PreciseTimeStamp, controller, compositionName, compositionGeneration, resourceKind, resourceNamespace, resourceName, msg, error, stacktrace
```

### 5. Known Scenarios

| Symptom | Reference ICM | TSG |
| --------| ------------- | --- |
| API server OOMKills | 639463200 | CCP-APIServerOOMKilled-Investigation |
| Outage in underlay node | 624098805 | N/A |
| CSI Azure File Controller missing permissions | 644118792 | N/A |
| Kyverno webhook failures | 629053223 | OverlaymgrReconcileError caused by Kyverno webhook failures |
| Missing KMS keyvault permissions | 624141051 | N/A |
| Bad KMS configuration | 595832066 | N/A |
| Noisy neighbouring / annotateReleaseInfo errors | 566423883 | OverlaymgrReconcileError caused by noisy neighbouring |
| Multiple CCP component OOMKills | 606966997 | N/A |
| Transient AKS infra issue | 626790307 | N/A |
