---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Features/Feature: CNI Overlay Support"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%3A%20CNI%20Overlay%20Support"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Container Networking Interface (CNI) Overlay support with Application Gateway for Containers

## Overview

The traditional Azure Container Networking Interface (CNI) assigns a VNet IP address to every pod. It assigns this IP address from a pre-reserved set of IPs on every node or a separate subnet reserved for pods. This approach requires IP address planning and could lead to address exhaustion, which introduces difficulties scaling your clusters as your application demands grow.

In Overlay networking, only the Kubernetes cluster nodes are assigned IPs from subnets. Pods receive IPs from a private CIDR provided at the time of cluster creation. Each node is assigned a `/24` address space carved out from the same CIDR.

## CNI Overlay support in Application Gateway for Containers

When provisioning Application Gateway for Containers into a cluster that has CNI Overlay or CNI enabled, Application Gateway for Containers will automatically detect the intended network configuration. There are no changes needed in Gateway or Ingress API configuration to specify CNI Overlay or CNI.

## CNI Support in Application Gateway for Containers

Application Gateway for Containers supports various deployments of Azure CNI running within your Kubernetes cluster.

* Azure CNI for dynamic IP allocation
* Azure CNI for static block allocation

## Constraints and Limitations

- The Application Gateway for Containers subnet must be a /24 prefix. A larger or smaller prefix isn't supported.
- The Application Gateway (Ingress controller) subnet must be a /24 prefix at minimum. A smaller prefix (or bigger subnet) isn't supported.
- Minimum ALB controller version required is 1.4.12 (Publicly documented and preferred 1.5.0)
- Minimum AGIC controller version required is 1.8.0
- Only one deployment is supported per subnet
- Subnet delegation must be enabled to use the feature.
- Kubenet isn't supported by Application Gateway for Containers
