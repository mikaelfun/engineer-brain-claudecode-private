---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Dashboards For Application Gateway v2"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FDashboards%20For%20Application%20Gateway%20v2"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Dashboards for Azure Application Gateway v2

## Overview

This document outlines the various dashboards useful for troubleshooting Azure Application Gateway v2 service requests.

To access the available Application Gateway dashboards, you need to add the **AppGW** account on [Jarvis/Dashboards](https://portal.microsoftgeneva.com/dashboard).

## Control Plane Dashboards

### AppGW > Debug (V2) > Control Plane
- **Available for:** v1, v2
- **Filters:** Time period + ResourceURI
- **Description:** Operations info across NRP, Gateway Manager, and Resource Health. Configuration changes investigation.
- **Use Case:** Starting point for control plane operations issues (config changes, failed requests). Drill down to Control Plane - Details.

### AppGW > Debug (V2) > Control Plane - Detailed
- **Available for:** v1, v2
- **Filters:** Time period + GatewayManagerActivityId (= OperationID in NRP or ActivityId in GWM)
- **Description:** Detailed control plane action analysis: NRP frontend logs, GWM logs (ApplicationGatewayWorkItem, ArmGatewayDeploymentWorkItem, ARMDeploymentWorkItem, PutVmssApplicationGatewayWorkItem), ARM requests/deployments, NRP/CRP write operations.
- **Use Case:** Follow operation flow from ARM → NRP → GWM → components.

## Autoscale Dashboards

### AppGW > Autoscale > Autoscale Debugging
- **Available for:** v2 only
- **Filters:** Time period + Gateway ID
- **Description:** Autoscale operations (scale up/down timestamps) and processing messages with computation details (CPU, Throughput, CurrentConnections, HostUtilization).
- **Use Case:** Performance and availability investigation.

## Metrics/Usage Dashboards

### AppGW > Performance > Overview
- **Available for:** v2 only
- **Filters:** Time period + Gateway ID + optional VIP address
- **Metrics:** CPU/Memory Utils, Throughput, Connections, NewConnPerSec, RPS, Response distribution, Disk Utils, Healthy Host Count, VIP availability, Datapath segfaults, Backend Server Time.
- **Note:** Connections ≠ Requests. One TCP connection can serve up to 100 HTTP requests on AppGW v2.

### AppGW > Performance > Shoebox metrics
- **Available for:** v1, v2
- **Filters:** Time period + Resource ID
- **Metrics:** Throughput (bytes/s), Connections, New Connections/sec, Total Requests per BackendHttpSettings/Pool pair, Response status distribution, Failed Requests, Healthy/Unhealthy Host Count, HTTP/HTTPS Requests (KeepAlive vs non), Capacity Units, Compute Units.

## Timings/Latency Dashboards

### AppGW > Performance > Timings
- **Filters:** Time period + Resource ID
- **Metrics:** Backend Connect Time, Backend First Byte Response Time, Backend Last Byte Response Time, AppGW Total Time, Client RTT.
- **Use Case:** Latency investigation. Compare timeframe before/after issues started for baseline comparison. High total time with low server response latency doesn't necessarily indicate AppGW issue.

### AppGW > Performance > VMSS platform metrics
- **Available for:** v2 only
- **Filters:** Time period + Gateway ID + optional instance
- **Metrics:** CPU/Memory Utilization per instance, Calculated Instance Count, Disk Utilization, Packet Rate/sec, Process CPU/Memory Utilization, PID, Segmentation Fault Count.

## Data Plane Dashboards

### AppGW > SLB > Packet drop metrics
- **Available for:** v1, v2
- **Filters:** Time period + MDM Account (region/cluster, e.g., VfpMdmBL) + Cluster + Container ID + optional Node ID
- **Note:** Get Container ID from ASC instances info or NETVMA.
- **Metrics:** Inbound/Outbound VFP port drops (Non IP, ARP Filter, Pending Packet DTLS).
- **Use Case:** Availability and datapath issues.

### AppGW > SLB > SLB metrics (VIP, DIP, SNAT)
- **Available for:** v1, v2
- **Filters:** Time period + Public IP (VIP) + SLB MDM Account (slbhp{region}) + optional ILB PA
- **Metrics:** DIP service % by VIP port, Ports healthy by DIP, Packets/sec, Bandwidth Mbps, Inbound/Outbound SYNs, SNAT connection counts (successful/failed), Allocated SNAT ports, NAT ports in use, DIP count for outbound.
- **Note:** DIP = Azure physical network address. For V2, use Jarvis Actions/Get NRP Subscription details to find FabricTenantId (= VMSS deployment ID).

### AppGW > SLB > TCP Metrics
- **Available for:** v1, v2
- **Filters:** Same as Packet drop metrics
- **Metrics:** Inbound/Outbound TCP control packets (SYN, SYN/ACK, RST, etc.) and TCP flows.
- **Tip:** Compare inbound SYN vs outbound SYN/ACK to detect unresponsive instances.

## WAF Dashboards
The existing WAF dashboards are for V1.
