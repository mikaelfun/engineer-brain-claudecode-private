---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Deployment and Integration/Networking/RDMA Configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FDeployment%20and%20Integration%2FNetworking%2FRDMA%20Configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RDMA Configuration - Validation and Troubleshooting Guide

This article provides detailed recommendations when configuring and validating RDMA configurations on Azure Local clusters.

## Configuring and Validating RDMA

In ALDO, the deployment uses Network ATC to configure RDMA settings. Network ATC will automatically configure settings according to industry-standard best practices and prevent configuration drift.

Use the PowerShell cmdlets below when validating and troubleshooting ANY RDMA setup:

## Get-NetAdapter

Use this cmdlet to identify the NIC names and types being used. This output can also help you to identify if the RDMA traffic is converged with the compute traffic (meaning they use the same pNICs) or if the storage NICs are dedicated.

## Get-NetAdapterAdvancedProperty

Use this cmdlet to check the advanced driver properties of each NIC being used. The following values are recommended:

| DisplayName | DisplayValue | RegistryKeyword | RegistryValue |
| --- | --- | --- | --- |
| Flow Control | Disabled | *FlowControl | {0} |
| Jumbo Packet | 9014 | *JumboPacket | {9014} |
| NetworkDirect Functionality | Enabled | *NetworkDirect | {1} |
| NetworkDirect Technology | RoCEv2/iWARP | *NetworkDirectTechnology | {4} (RoCEv2) / {1} (iWARP) |
| Receive Buffers | Varies | *ReceiveBuffers | Varies |
| VLAN ID | Varies | VlanID | Varies |
| RoCE MTU Size | Varies | NetworkDirectMTU | Varies |
| RoCE Frame Size | Varies | | Varies |

> **NOTE**: Some vendors use different names and settings for their RDMA frame size. To properly enable jumbo frames for RDMA, both the vendor setting and Jumbo Frame setting need to be configured.

**Key settings explained:**

- **Flow Control** - Must be **Disabled** on all physical NICs for RDMA. Prevents global pause frames; PFC should be used instead.
- **Jumbo Packet** - Recommended value: **9014**. Must be set on pNICs and on vNICs in converged environments.
- **NetworkDirect Functionality** - Must be **Enabled** for RDMA to function (typically enabled by default).
- **NetworkDirect Technology** - Must match the RDMA flavor (RoCEv2 or iWARP). If missing, update driver/firmware.
- **Receive Buffers** - Set to maximum to prevent packet loss. Monitor 'Packets Received Discarded' PerfMon counter.
- **VLAN ID** - Required for PFC to work (PFC info is in the VLAN header).
- **RoCE MTU/Frame Size** - Vendor-specific; set to largest value not exceeding Jumbo Packet setting.

## Get-NetQosPolicy

Verify three QoS policies exist: Cluster, SMB, and DEFAULT with correct priority values.

## Get-NetQosTrafficClass

Confirm bandwidth percentages and priority levels. Recommended:
- SMB: up to 50% (or 90-95% in non-converged)
- Cluster: 1% minimum
- DEFAULT: remainder
- Algorithm: ETS for all classes

## Get-NetQosFlowControl

PFC must be enabled ONLY on SMB priority level. **Never** enable flow control for Cluster traffic - this could lead to cluster instability.

## Get-NetQosDcbxSetting

DCBX Willing mode must be set to **False** to prevent DCB settings from being overwritten. Check both global and per-interface settings.

## Get-NetAdapterQos

Verify per-NIC:
- Enabled = True
- OperationalTrafficClasses show correct bandwidths and priorities
- OperationalFlowControl shows only SMB priority enabled
- OperationalClassifications shows NetDirect and port 445

## Get-NetAdapterRdma / Get-SmbClientNetworkInterface

Confirm RDMA, PFC, and RSS are enabled on appropriate adapters.

## Get-VMSwitch / Get-VMSwitchTeam

Identify virtual switches and SET team configuration.

## Get-VMNetworkAdapter -ManagementOS

Identify host vNICs and their virtual switch associations.

## Get-VMNetworkAdapterVlan / Get-VMNetworkAdapterIsolation -ManagementOS

Check VLAN configuration on host vNICs. VLANs should be set in only ONE location (not both).

## Get-VMNetworkAdapterTeamMapping -ManagementOS

Verify vNIC-to-pNIC mappings. Each vNIC should map to its own pNIC for balanced RDMA traffic.

## Validate-DCB

Comprehensive DCB validation tool:
```powershell
Install-Module Validate-DCB
Validate-DCB  # Run from any cluster node
```

## Test-RDMA

RDMA connectivity test (causes brief network fluctuations - requires scheduled downtime):
```powershell
# Requires diskspd from https://github.com/microsoft/diskspd
.\Test-Rdma.ps1 -IfIndex <index> -IsRoCE $true -RemoteIpAddress <remote-ip> -PathToDiskspd <path>
```

## PerfMon Counters

Key built-in RDMA counters:
- **RDMA Accepted/Active/Initiated Connections** - Connection tracking
- **RDMA Completion Queue Errors** - Non-zero indicates driver/firmware issue
- **RDMA Connection Errors / Failed Connection Attempts** - Transport/infrastructure issues
- **RDMA Inbound/Outbound Bytes/sec** - Should be balanced across RDMA NICs
- **RDMA Inbound/Outbound Frames/sec** - Frame rate monitoring

Some vendors (e.g., Mellanox WinOF-2) provide additional PerfMon counters.
