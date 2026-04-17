# Managed Gateway API Installation Troubleshooting

**Source**: [Microsoft Learn - Managed Gateway API](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/managed-gateway-api)

## Overview

The Managed Gateway API installation for AKS allows users to opt into a managed installation of the Kubernetes Gateway API CRDs. Requires at least one AKS add-on (e.g., Istio add-on) for fully supported mode.

## Troubleshooting Steps

### Step 1: Verify existing Gateway API CRD channel and bundle version

If Gateway API CRDs were installed before enabling Managed Gateway API:
- Ensure CRD bundle version is compatible with cluster Kubernetes version
- Verify only `standard` channel CRDs are installed
- Check for required annotations:
  - `gateway.networking.k8s.io/bundle-version`
  - `gateway.networking.k8s.io/channel`

**If issues persist**: Disable Managed Gateway API, uninstall all self-managed CRDs, re-enable.

### Step 2: Verify managed CRDs have expected annotations

After successful installation, CRD objects should have:
- `app.kubernetes.io/managed-by: aks`
- `app.kubernetes.io/part-of: <hash>`
- `eno.azure.io/replace: true`

**Missing annotations** = possible provisioning issue. Check for pre-existing CRD conflicts, then uninstall/reinstall.

### Step 3: Inspect CRD version after AKS upgrades

After AKS minor version upgrade:
- CRDs should auto-upgrade to new supported Gateway API bundle version
- Verify via `gateway.networking.k8s.io/bundle-version` annotation
- If not updated: uninstall/reinstall Managed Gateway CRDs
