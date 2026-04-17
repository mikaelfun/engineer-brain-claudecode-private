---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Other/Pull private registry images directly from aks nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FPull%20private%20registry%20images%20directly%20from%20aks%20nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to pull Private registry images from AKS nodes

## Summary

There may be situations where you need to log into a private repository directly from a node outside of an AKS pod for testing purposes. Using crictl to login to a private registry can be challenging due to permission issues when using kubectl exec. Using node-access and podman addresses these challenges.

## Prerequisites

* An AKS cluster running a supported version.
* A private registry such as Dockerhub or Jfrog.
* Outbound internet access to download Podman on the node.
* Access to run privileged containers using kubectl run node-access.

## Steps

### 1. Access the Node

```bash
kubectl run node-access --image mcr.microsoft.com/mirror/docker/library/busybox:1.35 --overrides='{"spec": {"nodeName": "<node-name>","hostPID": true,"hostNetwork": true,"containers": [{"securityContext": {"privileged": true},"name":"nsenter","image": "mcr.microsoft.com/mirror/docker/library/busybox:1.35","stdin": true,"stdinOnce": true,"tty": true,"command": ["nsenter", "--target", "1", "--mount", "--uts", "--ipc", "--net", "--pid", "--", "bash", "-l"],"resources": {"limits": { "cpu": "100m", "memory": "256Mi" },"requests": { "cpu": "100m", "memory": "256Mi" }}}],"tolerations": [{ "key": "CriticalAddonsOnly", "operator": "Exists" },{ "effect": "NoExecute","operator": "Exists" }]}}' -it
```

### 2. Install podman

```bash
apt-get update
apt-get install podman
```

### 3. Configure registries.conf

Edit `/etc/containers/registries.conf` to set the private registry (e.g., docker.io) in `unqualified-search-registries`.

### 4. Login to registry

```bash
podman login docker.io
```

### 5. Pull from private registry

```bash
podman pull registry/username/image:tag
```
