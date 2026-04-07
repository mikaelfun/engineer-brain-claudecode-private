---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Log sources for Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Log%20sources%20for%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Gateway for Containers Log Sources

## Overview

This document outlines the various log sources that Azure Application Gateway for Containers utilizes that are useful in SR troubleshooting.

## Log Sources

### ASC Log Sources

_Providers -> Microsoft.ServiceNetworking -> trafficControllers_

- **Resource Details**: Traffic Controller details view in ASC
- **Resource Frontends**: Frontend configuration view
- **Resource Associations**: Association configuration view
- **Resource Gateways**: Gateway configuration view

### ASC Alternative

In case ASC is unavailable or there is an issue pulling specific resource information for a given deployment the following Jarvis Action Can be used as an alternative to ASC:

[NFVRP > Traffic Controller Operations > Get Traffic Controller Details](https://portal.microsoftgeneva.com/1AF5BEA7?genevatraceguid=8fabe582-67ad-4fdd-a0f9-6eae10462cca)

> Access to Jarvis Action is limited to SAW or SAWVM users. See [Trusted Development Cloud](https://tdc.azure.net/)

### Jarvis Log Sources

#### Resource Provider (Namespace: nfvrp)

| Event | Description | Sample Query |
|-------|-------------|--------------|
| FrontendEvent | CRUD operation logs on NFVRP frontend | [nfvrp/FrontendEvent](https://portal.microsoftgeneva.com/s/F440A147) |
| BackendEvent | CRUD operations handling on backend | [nfvrp/BackendEvent](https://portal.microsoftgeneva.com/s/50391523) |
| HelixEvent | Helix cluster and service deployment logs | [nfvrp/HelixEvent](https://portal.microsoftgeneva.com/s/7EE8D7E) |
| HelixDetailedEvent | Detailed helix cluster and service deployment logs | [nfvrp/HelixDetailedEvent](https://portal.microsoftgeneva.com/s/6C98CBBE) |

#### Brain (Namespace: TrafficController)

| Event | Description | Scoping | Sample Query |
|-------|-------------|---------|--------------|
| ControlPlaneService | AGC POD logs | Use NamespaceName as Filter (same as Helix Service Guid) | [TrafficController/ControlPlaneService](https://portal.microsoftgeneva.com/s/E2811656) |
| KubernetesContainers | Remaining pods on Helix cluster (system pods, mdm, prometheus) | - | [TrafficController/KubernetesContainers](https://portal.microsoftgeneva.com/s/6FFB62B0) |

> Note: `trafficControllerResourceID` currently has parsing issues when used as Filtering conditions.

#### Gateways (Namespace: TrafficController)

Scoping parameters: region, GatewayId (GatewayID || TenantID), TrafficControllerID as Filter.

| Event | Description | Sample Query |
|-------|-------------|--------------|
| VmssBootstrap | Bootstrap binary VM setup logs | [TrafficController/VmssBootstrap](https://portal.microsoftgeneva.com/s/A87E709C) |
| DatapathProcessLogs | Envoy process logs | [TrafficController/DatapathProcessLogs](https://portal.microsoftgeneva.com/s/A87E709C) |
| RequestResponseLogs | Incoming request logs on Envoy | [TrafficController/RequestResponseLogs](https://portal.microsoftgeneva.com/s/54A28672) |
| LinuxAsm* | syslog, audit logs, etc | [TrafficController/LinuxAsm*](https://portal.microsoftgeneva.com/s/BD496739) |
| BackendServerDiagnosticHistory | Health probe logging for AGC | [Link](https://portal.microsoftgeneva.com/logs/dgrep?...) |

#### WAF Logging (Namespace: TrafficController)

Scoping: region, TrafficControllerID as Filter.

Example: https://portal.microsoftgeneva.com/s/43A08968

### Jarvis Dashboards

#### Data Plane Dashboards

- [Dataplane Overview](https://portal.microsoftgeneva.com/dashboard/TrafficController/Dataplane)
- [Traffic Stats (2.0)](https://jarvis-west.dc.ad.msft.net/dashboard/TrafficController/Dataplane/Traffic%2520Stats) — connectivity counters
- [Platform Stats (2.0)](https://jarvis-west.dc.ad.msft.net/dashboard/TrafficController/Dataplane/Platform%2520Stats) — CPU, Memory, Disk Utilization

#### Visual Dashboards

- [Visual dashboards](https://portal.microsoftgeneva.com/dashboard/TrafficController)

#### CRUD Dashboards

- [AGC Overview CRUD Debug](https://jarvis-west.dc.ad.msft.net/dashboard/share/D24163E6) — Use Resource ID to see all CRUD operations
- [AGC Operation CRUD Control Plane Debug](https://jarvis-west.dc.ad.msft.net/dashboard/share/868883)

#### WAF Dashboards

- [AGC WAF Debug Dash](https://jarvis-west.dc.ad.msft.net/dashboard/share/CDD87899)

#### SLB Dashboards

- [SLB Metrics](https://jarvis-west.dc.ad.msft.net/dashboard/share/AAFD105)
- [SNAT Metrics](https://jarvis-west.dc.ad.msft.net/dashboard/share/365B29A9)
