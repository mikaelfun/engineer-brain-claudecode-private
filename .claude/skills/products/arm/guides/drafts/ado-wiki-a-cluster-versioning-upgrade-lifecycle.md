---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Readiness/Azure Operator Nexus Cluster Versioning and Upgrade Lifecycle"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FReadiness%2FAzure%20Operator%20Nexus%20Cluster%20Versioning%20and%20Upgrade%20Lifecycle"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Carlos Natera**
_Last review: 18-July-2025_

Azure Operator Nexus Cluster Versioning and Upgrade Lifecycle
=============================================================

# 1. Overview

Azure Operator Nexus is a carrier-grade hybrid cloud platform designed for telecommunications operators. It uses a structured versioning and upgrade model to manage its infrastructure lifecycle. This model revolves around four interrelated components:
* **Cluster Version**
* **Management Bundle**
* **Network Cloud Runtime Version**
* **Network Fabric Runtime Version**

Each plays a distinct role in the lifecycle of the platform, and understanding their relationships is essential for planning, executing, and supporting upgrades.

# 2. Cluster Version

The **Cluster Version** is the overarching semantic version identifier (e.g., `2507.1`) that represents the combined state of the runtime and management bundles deployed in a Nexus instance.
* **Defined at cluster creation**
* **Updated via supported upgrade paths**
* **Used to track lifecycle, support eligibility, and upgrade readiness**

The cluster version reflects:
* The **Network Cloud Runtime Version** installed on the physical infrastructure
* The **Management Bundle Version** controlling orchestration and lifecycle services

# 3. Network Cloud Runtime Version

The **Network Cloud Runtime Version** refers to the software stack running on the compute and control plane nodes of the Operator Nexus instance. It includes:
* Azure Linux (Host OS)
* Kubernetes (undercloud)
* etcd
* Container Network Interface (CNI)
* Firmware and BIOS

## Characteristics
* **Scope**: Physical servers (compute and management)
* **Release cadence**:
  * **Minor releases**: Quarterly (February, June, October) - mandatory
  * **Patch releases**: Monthly - optional
* **Initiation**: Customer-initiated via CLI/API
* **Impact**:
  * **Management servers**: Upgraded serially, non-disruptive
  * **Compute servers**: Rack-by-rack reimage, disruptive per rack

## Upgrade Workflow
1. Management servers upgraded first.
2. Control plane nodes upgraded.
3. Worker servers upgraded rack-by-rack.
4. Each server is reimaged with the new runtime image.
5. Kubernetes nodes are cordoned and drained before upgrade.

# 3. Network Fabric Runtime Version

The **Network Fabric Runtime Version** governs the lifecycle of the networking infrastructure within the Nexus instance. It includes:
* Network Fabric Controller (NFC)
* Network Racks and Devices
* L2/L3 Isolation Domains
* Route Policies
* Network Packet Brokers
* Terminal Servers

## Characteristics
* **Scope**: Networking infrastructure (switches, routers, terminal servers)
* **Release cadence**: Aligned with platform releases; patch releases as needed
* **Initiation**: Customer-initiated via CLI/API
* **Impact**: Typically non-disruptive if staged correctly

## Upgrade Workflow
1. Fabric runtime version is selected via Azure CLI or portal.
2. Fabric devices are upgraded using standard operating procedures.
3. Monitoring and telemetry services are updated.
4. Terminal Server metrics and diagnostics are enabled post-upgrade.

# 4. Management Bundle

The **Management Bundle** is released and controlled by Microsoft. It includes:
* Azure Resource Provider (RP)
* Cluster Manager (CM) services
* Monitoring and diagnostics agents
* Network fabric controllers
* Security extensions

## Characteristics
* **Scope**: Azure-side services and on-premises cluster managers
* **Release cadence**: Monthly
* **Rollout strategy**: Regionalised, safe deployment
* **Initiation**: Managed by Microsoft
* **Impact**: Non-disruptive to workloads

# 5. Version Relationships

| Component | Description |
| --- | --- |
| Cluster Version | Composite version reflecting the current state of NC and NF runtime bundles |
| Network Cloud Runtime | Governs compute and control plane infrastructure |
| Network Fabric Runtime | Governs networking infrastructure and fabric devices |
| Management Bundle | Enables compatibility and lifecycle orchestration |

* **Cluster Version** is updated only when both runtime bundles are compatible and available.
* **Runtime upgrades** require a compatible **Management Bundle** to be present.
* **Fabric and Cloud runtimes** are upgraded independently but must align with the cluster version for supportability.

# 6. Upgrade Identification and Execution

### How to Check Current Versions

**Azure CLI**
```bash
az networkcloud cluster show --name <clusterName> --resource-group <resourceGroup> --query "{name:name, version:clusterVersion}" -o json
```

**Azure Portal**: Navigate to the cluster or fabric resource > "Properties" tab > "Available upgrade versions" tab.

### Runtime Upgrade Command
```bash
az networkcloud cluster update --name <clusterName> --resource-group <resourceGroup> --cluster-version <targetVersion>
```

### Fabric Upgrade Command
```bash
az networkfabric fabric upgrade --action start --version <version> -g <resourceGroup> --resource-name <fabricName>
```

# 7. Rollout Cadence Summary

| Component | Frequency | Initiator | Impact |
| --- | --- | --- | --- |
| Management Bundle | Monthly | Microsoft | Non-disruptive |
| Network Cloud Runtime | Quarterly (minor) | Customer | Disruptive |
| Network Cloud Runtime | Monthly (patch) | Customer | Optional |
| Network Fabric Runtime | As needed | Customer | Typically safe |

## References
* [Runtime upgrade overview](https://learn.microsoft.com/en-us/azure/operator-nexus/howto-cluster-runtime-upgrade)
* [Cluster runtime upgrade overview](https://learn.microsoft.com/en-us/azure/operator-nexus/concepts-cluster-upgrade-overview)
* [Runtime upgrade with PauseAfterRack strategy](https://learn.microsoft.com/en-us/azure/operator-nexus/howto-cluster-runtime-upgrade-with-pauseafterrack-strategy)
* [Fabric runtime upgrade template](https://learn.microsoft.com/en-us/azure/operator-nexus/howto-upgrade-nexus-fabric-template)
* [Network Fabric management upgrade overview](https://learn.microsoft.com/en-us/azure/operator-nexus/concepts-fabric-management-upgrade)
* [Upgrade Network Fabric](https://learn.microsoft.com/en-us/azure/operator-nexus/howto-upgrade-nexus-fabric)
