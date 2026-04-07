# AKS containerd 运行时 -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: pod-restart-analysis.md, pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: Docker Bridge CIDR became redundant when AKS switc

### aks-092: Customer receives notification about Docker Bridge CIDR field removal from AKS A...

**Root Cause**: Docker Bridge CIDR became redundant when AKS switched from Docker to containerd in K8s 1.19. Starting with API 2023-04-01, the field is removed but still supported (ignored) in older API versions.

**Solution**:
1) Existing clusters: no impact; 2) Portal creation: no impact; 3) For IaC using API 2023-04-01+: remove dockerBridgeCidr parameter from templates/configs, otherwise requests may be rejected or SDK code won't compile.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS clusters on Kubernetes 1.19+ switched containe

### aks-011: Docker CLI commands (docker ps, docker inspect, etc.) fail or are unavailable on...

**Root Cause**: AKS clusters on Kubernetes 1.19+ switched container runtime from Docker to containerd. Docker CLI is no longer available on these nodes.

**Solution**:
Use crictl as replacement for Docker CLI: crictl ps (list containers), crictl inspect --output go-template --template '{{.info.pid}}' <containerID> (get PID). For packet capture: use nsenter -n -t <PID> to enter pod network namespace, then run tcpdump.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.6[AKS] P]]`

## Phase 3: Kubelet log rotation flags only work with containe

### aks-251: Container log rotation settings (--container-log-max-size --container-log-max-fi...

**Root Cause**: Kubelet log rotation flags only work with containerd runtime. For Docker-based nodes kubelet delegates to Docker logging driver which uses default config (max-file=5 max-size=50m) from /etc/docker/daemon.json ignoring kubelet flags.

**Solution**:
For Docker nodes: configure via Docker daemon config. For containerd nodes (k8s 1.19+): kubelet flags work correctly. Use AKS custom node config (preview) to set values.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer receives notification about Docker Bridge CIDR field removal from AKS A... | Docker Bridge CIDR became redundant when AKS switched from D... | 1) Existing clusters: no impact; 2) Portal creation: no impa... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Docker CLI commands (docker ps, docker inspect, etc.) fail or are unavailable on... | AKS clusters on Kubernetes 1.19+ switched container runtime ... | Use crictl as replacement for Docker CLI: crictl ps (list co... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.6[AKS] P] |
| 3 | Container log rotation settings (--container-log-max-size --container-log-max-fi... | Kubelet log rotation flags only work with containerd runtime... | For Docker nodes: configure via Docker daemon config. For co... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
