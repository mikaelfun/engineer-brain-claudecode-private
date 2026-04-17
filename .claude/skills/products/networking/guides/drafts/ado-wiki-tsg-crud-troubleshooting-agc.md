---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Troubleshooting Guides/TSG: CRUD Troubleshooting flow for Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20CRUD%20Troubleshooting%20flow%20for%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CRUD Troubleshooting flow for Application Gateway for Containers

## Overview
This doc helps navigate you through what happens and what may have gone wrong during the create, update, and delete operations of resources of Application Gateway for Containers.

## Quick Links

- List operation history given a resource: [Jarvis](https://portal.microsoftgeneva.com/s/3C841590)
- List ARM Outgoing requests: [Kusto](https://dataexplorer.azure.com/clusters/armprod/databases/ARMProd)
- Get all logs on NFVRP/Helix: [Jarvis/ClientOperationId](https://portal.microsoftgeneva.com/s/CC21B880), [Jarvis/CorrelationRequestId](https://portal.microsoftgeneva.com/s/ACBFF07C)
- Identify state machine errors on NFVRP/Helix: [Jarvis/ClientOperationId](https://portal.microsoftgeneva.com/s/97FCCCEF), [Jarvis/CorrelationRequestId](https://portal.microsoftgeneva.com/s/70563C77)

## Deployment Overview

Application Gateway for Containers consists of 3 types of resources:

### Microsoft.ServiceNetworking/trafficControllers
Core abstraction for AGC deployment. Deploys Traffic Controller on Helix (internal AKS cluster).
Steps:
1. Delegate to Helix to install Helm chart for Traffic Controller
2. Deploy Key Vault for data path certificates
3. Create Managed Identity for data path access to Key Vault
4. Generate certificates in Key Vault

### Microsoft.ServiceNetworking/trafficControllers/associations
Establishes relation between AGC and customer cluster. Deploys vnet-injected Envoy proxy in delegated subnet.
Steps:
1. Deploy VMSS with Custom Script Extension in service subscription for Envoy
2. Deploy standard Load Balancer with static public IP (internal to service)
3. Add LB info to Traffic Controller
4. Add LB to backend pool of existing Global Load Balancer

### Microsoft.ServiceNetworking/trafficController/frontends
Defines entry point exposed by AGC. Configures Cross-Region Load Balancer (GLB).
Steps:
1. Deploy Cross-Region Load Balancer (once per Traffic Controller)
2. Provision global-tiered Public IP Address per Frontend
3. Generate FQDN and add A Record in DNS zone
4. Add Public IP to Frontend IP Configurations of GLB
5. Include existing standard LBs in GLB backend pool

## Operation Flow

Basic operation summary via [Ocular](https://azureserviceinsights.trafficmanager.net/view/services/Ocular/pages/Activity%20Timeline).

## Advanced CRUD Investigation

CRUD operations use REST API calls (PUT/GET/DELETE). Correlating IDs:
- **ClientOperationId** — via `x-ms-client-request-id` header
- **CorrelationRequestId** — via `x-ms-correlation-request-id` header

### Find ARM logs for CRUD operations
```kql
let ClientRequestId = '<client-request-id>';
let CorrelationRequestId = '<correlation-request-id>';
ArmHttpOutgoingRequests
| where clientRequestId == ClientRequestId or correlationId == CorrelationRequestId
```
Cluster: `ARMProd`

### Find NFVRP logs for CRUD operations
ARM forwards requests to NFVRP with same client/correlation IDs.
- Logs by ClientOperationId: [Jarvis](https://portal.microsoftgeneva.com/s/CC21B880)
- Logs by CorrelationRequestId: [Jarvis](https://portal.microsoftgeneva.com/s/ACBFF07C)
- State Machine exceptions by ClientOperationId: [Jarvis](https://portal.microsoftgeneva.com/s/97FCCCEF)
- State Machine exceptions by CorrelationRequestId: [Jarvis](https://portal.microsoftgeneva.com/s/70563C77)

### Get CRUD history of a Resource
Provisioning states: Succeeded, Updating, Failed.
State transition history: [Jarvis query](https://portal.microsoftgeneva.com/s/3C841590)

### Additional Information
ASC Log Sources with filter:
- AGC Subscription ID as service Subscription Id
- Resource Group Name format: `tc-armrg-<trafficControllerId>`

Tools:
- [Ocular](https://azureserviceinsights.trafficmanager.net/view/services/Ocular/pages/Activity%20Timeline) for control plane operation summary
- ASC for resource group details
