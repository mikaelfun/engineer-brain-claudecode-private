---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Readiness/Bare Metal Machine Replacement in Azure Nexus"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FReadiness%2FBare%20Metal%20Machine%20Replacement%20in%20Azure%20Nexus"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Introduction

Azure Nexus provides a managed Kubernetes service that integrates with bare metal infrastructure, enabling hybrid cloud deployments. A key component in this ecosystem is the Bare Metal Machine (BMM), which represents a physical host integrated into the Kubernetes cluster. The BMM resource in Azure allows for lifecycle management of these hosts, including provisioning, deprovisioning, and replacement.

The replacement process for a BMM is designed to reuse existing network configurations, such as the PXE NIC, while ensuring minimal disruption to the cluster. This process encapsulates the end-to-end provisioning flow in a microcosm, involving hardware validation, deprovisioning of the existing host state, and reprovisioning with updated configurations.

## Architecture Overview

The BMM replacement architecture is divided into layers:
- **Azure Services Layer**: Includes Azure Resource Manager (ARM), Arc for Kubernetes, and Platform as a Service (PaaS) components. These handle the initial intent for replacement and propagate it to the on-premises cluster.
- **On-Premises Layer**: Comprises the undercloud Kubernetes cluster, which runs controllers, operators, and services like the Cluster API (CAPI), Cluster API Provider Metal3 (CAPM3), Bare Metal Operator (BMO), and Ironic.
- **Host Layer**: The physical bare metal host, interacted with via Baseboard Management Controller (BMC) using Redfish protocol, and provisioned using the Ironic Python Agent (IPA).

The workflow progresses through three main phases: Hardware Validation (Step 1), Deprovisioning (Step 2), and Provisioning (Step 3).

## Key Custom Resources (CRs)
- **Bare Metal Machine (BMM)**: The primary Azure resource representing the physical host.
- **BMM Replace Action**: A specialized CR created in the undercloud cluster to drive the replacement process.
- **Metal3Machine**: Manages the association between the Kubernetes node and the physical host.
- **Bare Metal Host (BMH)**: Represents the physical host's state in Metal3.
- **Cluster API (CAPI) Resources**: Include Machine and KubeadmControlPlane/MachineDeployment.

## Controllers and Operators
- **BMM Controllers**: Separate handling for BMM and BMM Replace Action. Logs aggregated in same operator pod.
- **CAPI Controller**: Manages Azure-specific aspects of Kubernetes machines.
- **CAPM3 Controller**: Bridges CAPI to Metal3 for bare metal specifics.
- **Bare Metal Operator (BMO)**: Oversees the BMH CR, interacting with Ironic for host management.
- **Ironic**: Provisioning engine using Redfish to control BMC, deploys IPA for disk imaging.

## Flow from Kubernetes Node to Host
1. **Kubernetes Node** → monitored for health
2. **Machine CR (CAPI)** → maps to Kubernetes node
3. **Metal3Machine CR (CAPM3)** → links Machine to BMH
4. **Bare Metal Host (BMH) CR (BMO)** → defines host hardware/provisioning state
5. **Ironic to Host** → Redfish power cycle + PXE-boot IPA for disk imaging
6. **Host Integration** → joins cluster as Kubernetes node

## Cascading Process for Host Provisioning
1. Intent Propagation: User creates/updates BMM → propagates via ARM/Arc to undercloud
2. Hardware Association: CAPM3 reconciles Metal3Machine with BMH
3. BMH Reconciliation: BMO enrolls host in Ironic
4. Hardware Validation: Ironic validates specs (CPU, RAM, disks)
5. Provisioning Initiation: Ironic power cycles host
6. PXE Boot and IPA Deployment: Host boots into IPA ramdisk, streams OS image
7. Configuration Application: IPA applies cloud-init, reboots
8. Cluster Join: Host joins Kubernetes cluster, CAPI updates Machine to "Ready"
9. Error Handling: Failures trigger retries (timeout after 4 hours)

## Step 1: Hardware Validation
- Triggered by BMM Replace Action CR
- Replace Controller calls web service in cluster manager to validate hardware
- Validation checks: BMC connectivity (Redfish URL), boot MAC address, hardware specs (CPU, RAM, disks, NICs)
- If failed, process aborts with errors in BMM status
