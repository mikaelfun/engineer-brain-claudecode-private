---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Connected Registry"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Connected Registry Troubleshooting Guide for CSS

## Overview

A connected registry is an on-premises or remote replica that synchronizes container images and other OCI artifacts with your cloud-based Azure container registry. Use a connected registry to help speed up access to registry artifacts on-premises and to build advanced scenarios.

**Note**: The feature is now in GA.

## Escalation Path

If an issue cannot be solved with the available troubleshooting, please escalate to ACR with an [ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=A312j1).

## Prerequisites

- Azure CLI version 2.16.0 or higher
- Azure CLI extensions: connectedk8s (version 1.2.0+) and k8s-extension (version 1.0.0+)
- Existing Azure Arc-enabled Kubernetes-connected cluster
- Agent version 1.5.3 or higher

## Log Sources

### Connected Registry Logs

1. Run `kubectl get pod -n connected-registry`
2. Locate the pod named `connected-registry`
3. Run `kubectl logs -n connected-registry [connected registry pod name]`

**Note**: Log level can be edited: `az acr connected-registry update --name [name] --registry [ACR name] --log-level [level]`

### Connected Registry Trust Distribution Daemonset Logs

Look for a pod titled `connected-registry-containerd-config`. These logs are useful if the Connected Registry pod is not initializing.

Run `kubectl describe -n connected-registry pod/[pod name]` for a high-level health overview.

## Common Issues

### Extension creation stuck in state of "Running"

**Possibility 1: PVC Issue**
- Check PVC status: `kubectl get pvc -n connected-registry -o yaml connected-registry-pvc`
- Phase should be "bound". If stuck on "pending", delete and recreate extension
- Check storage classes: `kubectl get storageclass --all-namespaces`
- Fix: recreate with `--config pvc.storageClassName="standard"` or `--config pvc.storageRequest="250Gi"`

**Possibility 2: Bad Connection String**
- Check pod logs for UNAUTHORIZED error
- Regenerate protected-settings-extension.json with new connection string
- Update extension: `az k8s-extension update --config-protected-file protected-settings-extension.json`

### Extension created, but Connected Registry is not "Online"

**Possibility: Previous connected registry not deactivated**
- Check pod logs for ALREADY_ACTIVATED error
- Fix: `az acr connected-registry deactivate -n [name] -r [ACR name]`
- Pod should be recreated within minutes
