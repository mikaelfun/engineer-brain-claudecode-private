---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/DCSPM for K8s agentless/Map Exporter failure"
sourceUrl: "https://dev.azure.com/ASIM-Security/08a9716f-c06d-418d-9916-e38023d36752/_wiki/wikis/805e0e78-f6b1-4ad5-ad26-6cb3aad9f60e?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDCSPM%20for%20K8s%20agentless%2FMap%20Exporter%20failure"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG: Map Exporter Failure (DCSPM K8s Agentless Attack Paths)

## Overview

Helps CSS engineers investigate Map Exporter service failures. This service generates graph components from K8s inventory collected by K8s Proxy and exports them to the map for attack path generation.

**Prerequisites:** Cluster Azure resource ID, Kubernetes namespace, pod/workload name.

## Step 1 — Check if Map Exporter Generated Any Components

```kusto
let _azureResourceId = "<Cluster's Azure resource id>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
),
(
    cluster('https://weuornatpkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetEdges()
    | where Provider =~ "ContainerProvider"
    | where IngestionScopeKey =~ replace_string(_azureResourceId, "/", "$")
    | take 1
)
| count
| project ["Cluster has Components in Map"] = Count > 0
```

- **False** + customer confirmed DCSPM + agentless VA enabled → **Open CRI** for engineering team.
- **True** → components generated OK, continue below.

## Step 2 — Check if Pod is Exposed to Internet

```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetInsights()
        | where ComponentDefinitionKey == "1f24d55a-df0f-4772-9090-4629c2d6bfff" // exposed to the internet
        | project-rename Insight = Label
    ) on $left.ComponentId == $right.SubjectComponentId
),
(
    cluster('https://weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | join kind=leftouter (
        cluster('https://weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').GetInsights()
        | where ComponentDefinitionKey == "1f24d55a-df0f-4772-9090-4629c2d6bfff" // exposed to the internet
        | project-rename Insight = Label
    ) on $left.ComponentId == $right.SubjectComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = Name, Insight
```

- `Insight` empty → pod not exposed to internet → **no attack path generated** (expected behavior).
- Has insight → pod is exposed, continue to Step 3.

## Step 3 — Check Pod's Network Configuration

To determine if a pod should be marked as exposed, check routing ingresses and services:

```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | project-rename PodComponentId = ComponentId, PodName = Name
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | where ComponentDefinitionKey == "582c14e9-48c1-4b25-ab93-91bdeaf9120c" // routes traffic to
        | project-rename SourceServiceComponentId = SourceNodeComponentId, TargetPodComponentId = TargetNodeComponentId
    ) on $left.PodComponentId == $right.TargetPodComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "K8s-service"
        | extend ServiceType = tostring(EntityIdentifiers.subKind)
        | project-rename ServiceComponentId = ComponentId, ServiceName = Name
    ) on $left.SourceServiceComponentId == $right.ServiceComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | where ComponentDefinitionKey == "582c14e9-48c1-4b25-ab93-91bdeaf9120c"
        | project-rename SourceIngressComponentId = SourceNodeComponentId, TargetServiceComponentId = TargetNodeComponentId
    ) on $left.ServiceComponentId == $right.TargetServiceComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "K8s-ingress"
        | project-rename IngressComponentId = ComponentId, IngressName = Name
    ) on $left.SourceIngressComponentId == $right.IngressComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = PodName, ["Routing Service Type"] = ServiceType, 
    ["Routing Service Name"] = ServiceName, ["Routing Ingress Name"] = IngressName
```

**Pod is exposed to the internet if:**
- Service of type `LoadBalancer` routing traffic to the pod, OR
- Ingress with public IP (empty `subKind` property) routing traffic to the pod

**Not exposed if:**
- Only `InternalIngress` (subKind = "InternalIngress"), OR
- Only NodePort (not supported for exposure detection)

→ No exposure: Explain to customer that NodePort exposure is not supported. Open CRI if customer disagrees.

## Step 4 — Check if Pod Runs a Vulnerable Image

```kusto
let _clusterId = "<Cluster's Azure resource id>";
let _namespace = "<Kubernetes namespace>";
let _podName = "<pod/workload name>";
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
    | where Label == "K8s-pod"
    | where EntityIdentifiers.namespace =~ _namespace
    | where EntityIdentifiers.clusterId =~ _clusterId
    | where Name startswith _podName
    | project-rename PodComponentId = ComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | project-rename SourcePodComponentId = SourceNodeComponentId, TargetContainerComponentId = TargetNodeComponentId
    ) on $left.PodComponentId == $right.SourcePodComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "container"
        | project-rename ContainerComponentId = ComponentId, ContainerName=Name
    ) on $left.TargetContainerComponentId == $right.ContainerComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetEdges()
        | project-rename SourceContainerComponentId = SourceNodeComponentId, TargetImageComponentId = TargetNodeComponentId
    ) on $left.ContainerComponentId == $right.SourceContainerComponentId
    | join kind=inner (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetNodes()
        | where Label =~ "container-image"
        | extend ImageName = tostring(EntityIdentifiers.imageId)
        | project-rename ImageComponentId = ComponentId
    ) on $left.TargetImageComponentId == $right.ImageComponentId
    | join kind=leftouter (
        cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').GetInsights()
        | where
            ComponentDefinitionKey == "19fa13e9-1909-4745-b494-0e7a36bdd17d"      // has high severity vulnerabilities
            or ComponentDefinitionKey == "e3de1cc0-f4dd-3b34-e496-8b5381ba2d70"   // vulnerable to remote code execution
        | project-rename Insight = Label
    ) on $left.ImageComponentId == $right.SubjectComponentId
)
| project ["Pod Namespace"] = EntityIdentifiers.namespace, ["Pod Name"] = Name, ["Container Name"] = ContainerName, ["Image Name"] = ImageName, Insight
```

- `Insight` empty → image not marked vulnerable → no attack path (expected). Open CRI if customer disagrees.
- Insight present + pod exposed → attack path **should** exist → **Open CRI for Rome/Defenders team**.
