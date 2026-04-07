---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Kubernetes Managed Gateway API"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FKubernetes%20Managed%20Gateway%20API"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed Gateway API Installation

## Overview

The Managed Gateway API installation allows users to opt into managed CRDs for networking and routing. It provides automatic patch upgrades, bundle version upgrades across K8s versions, and guaranteed support. Users must enable a managed Gateway-based ingress addon (Istio or AGC) alongside it.

Configuration field: `properties.ingressProfile.gatewayAPI.installation` (values: `Disabled`, `Standard`)

## Components

### Frontend Validation

**Prerequisites checked:**
- Valid enum for installation field
- K8s version supports Gateway API
- At least one managed Gateway-based ingress addon enabled (Istio or AGC)
- Existing Gateway API installation matches expected bundle version and Standard channel

**K8s-to-Gateway version map**: `ccp/managed-gateway-installation/pkg/version_map.go`

### Common Frontend Failures

#### Failures Generating Expected CRDs
- Likely a tag mismatch between RP frontend validation and synthesizer code
- RP Frontend imports logic from the managed gateway synthesizer as a go package
- If synthesizer map is updated without updating RP tag, RP expects wrong Gateway version
- Check: tag for `go.goms.io/aks/rp/ccp/managed-gateway-installation/pkg` in `resourceprovider/server/go.mod`

#### Failures Retrieving Actual CRDs from Customer Cluster
- Issues with K8s client or CRD retrieval from overlay cluster
- Engage Cluster CRUD team (they own the frontend validation framework)

### OverlayMgr + CCP Webhooks

Logs:
- `OverlaymgrEvents` for OverlayMgr logs
- CCP Webhooks: query akshuba cluster for webhook-related logs

## Upgrade Policy

See version map at `ccp/managed-gateway-installation/pkg/version_map.go` and [public docs](https://learn.microsoft.com/en-us/azure/aks/managed-gateway-api#gateway-api-bundle-version-and-aks-kubernetes-version-mapping) for K8s version to Gateway bundle version mapping.
