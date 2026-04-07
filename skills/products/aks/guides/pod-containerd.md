# AKS containerd 运行时 -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer receives notification about Docker Bridge CIDR field removal from AKS A... | Docker Bridge CIDR became redundant when AKS switched from D... | 1) Existing clusters: no impact; 2) Portal creation: no impa... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Docker CLI commands (docker ps, docker inspect, etc.) fail or are unavailable on... | AKS clusters on Kubernetes 1.19+ switched container runtime ... | Use crictl as replacement for Docker CLI: crictl ps (list co... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.6[AKS] P] |
| 3 | Container log rotation settings (--container-log-max-size --container-log-max-fi... | Kubelet log rotation flags only work with containerd runtime... | For Docker nodes: configure via Docker daemon config. For co... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Existing clusters: no impact; 2) Portal creation: no impact; 3) For IaC using API 2023-04-01+: re `[source: onenote]`
2. Check: Use crictl as replacement for Docker CLI: crictl ps (list containers), crictl inspect --output go-te `[source: onenote]`
3. Check: For Docker nodes: configure via Docker daemon config `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/pod-containerd.md)
