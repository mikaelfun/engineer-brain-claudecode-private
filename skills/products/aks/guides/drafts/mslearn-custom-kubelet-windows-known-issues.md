# Known Issues: Custom Kubelet Configuration on Windows Nodes in AKS

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/known-issues-custom-kubelet-configuration

## Issue 1: Log sizes exceed container-log-max-size during aggressive log writing

On Windows VMs, log sizes grow beyond container-log-max-size if a container writes aggressively. Log rotation cannot keep up.

- Affected versions: All versions of Kubernetes
- Impact: Log files can grow to dozens of GiB even with MiB-level max size settings
- Ref: Kubernetes GitHub issue 110630

## Issue 2: Kubelet log file compression fails on Windows

Kubelet stops responding during .gz compression (rename step before file close).

- Affected versions: K8s < 1.23, K8s 1.23 < 1.23.13, K8s 1.24 < 1.24.7
- Fixed in: K8s 1.25.0+ (PR 111549)
- Ref: Kubernetes GitHub issue 111548

## Issue 3: Custom OS configurations fail on Windows node pools

Custom OS configuration does not get applied on Windows node pools. OS configurations are only supported on Linux node pools.

- Workaround: Apply custom OS configuration at cluster or node pool level for Linux node pools only.
