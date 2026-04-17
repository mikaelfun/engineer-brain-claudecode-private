---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Windows/Windows Host Process Container"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FWindows%20Host%20Process%20Container"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows HostProcess Containers in AKS: Concepts, Use Cases, and Practical Example

## Overview

Windows HostProcess containers run directly in the Windows node's process and filesystem namespace (not inside container isolation). They are the Windows equivalent of privileged DaemonSets on Linux.

Capabilities:
- Access host filesystem
- Use Windows inbox binaries and modules
- Run with SYSTEM privileges
- Modify node-level configuration

## Implementation Patterns

| Pattern | Use Case |
|---------|----------|
| Pod | One-off troubleshooting/testing |
| DaemonSet | Continuous node agents (monitoring, networking, logging) |
| Job | One-time cluster-wide operations |
| CronJob | Periodic compliance checks, auto-configure new nodes |

## Required Configuration

```yaml
spec:
  hostNetwork: true
  nodeSelector:
    kubernetes.io/os: windows
  securityContext:
    windowsOptions:
      hostProcess: true
      runAsUserName: "NT AUTHORITY\\SYSTEM"
```

## Image Selection

- **Server Core** (`mcr.microsoft.com/windows/servercore:ltsc2022`): Includes Windows inbox modules (SmbShare, etc.). Use when interacting with Windows system components.
- **NanoServer**: Smaller but missing inbox modules. Not suitable for admin tasks requiring modules like SmbShare.

## Practical Example: SMB Client Configuration via CronJob

### Problem
SMB metadata caching (`DirectoryCacheLifetime`, `FileNotFoundCacheLifetime`) at Windows node level causes stale/inconsistent file visibility when using Azure File shares.

### Solution
CronJob with HostProcess container to enforce `DirectoryCacheLifetime=0`, `FileNotFoundCacheLifetime=0`:

1. ConfigMap stores idempotent PowerShell script
2. CronJob runs hourly on all Windows nodes
3. Script checks current values before applying changes
4. Logs commands and results for auditability

### Key Benefits
- Auto-covers new Windows nodes joining the cluster
- No long-running privileged containers
- Simple auditability through pod logs
- Periodic compliance enforcement

## Key Takeaways

- HostProcess = Windows equivalent of Linux privileged DaemonSet
- Use for OS-level config, not app workloads
- Some cmdlets only in Windows PowerShell 5.1 (not pwsh)
- Scripts should be idempotent
- CronJob preferred over DaemonSet for short-lived admin tasks

## Reference
- https://learn.microsoft.com/azure/aks/use-windows-hpc
