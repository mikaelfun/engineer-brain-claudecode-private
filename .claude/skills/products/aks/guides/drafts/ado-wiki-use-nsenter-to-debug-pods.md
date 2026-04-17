---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Use nsenter to debug pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FUse%20nsenter%20to%20debug%20pods"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use nsenter to debug pods

Author: jtenciocoto

## Introduction

Sometimes we need to troubleshoot issues directly on AKS nodes and pods. We can make use of tools such as crictl and nsenter to perform a variety of tests.

For a detailed guide on crictl you can refer to this document:

- [Debugging Kubernetes nodes with crictl | Kubernetes](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)

The focus on this TSG will be using nstenter to perform tests from the container's namespaces.

## Prerequisites

We must have access to the AKS nodes as all the tools needed are already present on them.
There are a few ways to get access to the AKS nodes, in this case I will be using node-shell and WSL. One more option is to use node debugger as per own public docs.

- <https://learn.microsoft.com/en-us/azure/aks/node-access>
- [kvaps/kubectl-node-shell: Exec into node via kubectl (github.com)](https://github.com/kvaps/kubectl-node-shell)
- [Install WSL | Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/install)

First step is to list the nodes on your cluster.

```sh
kubectl get nodes
NAME                                STATUS   ROLES   AGE   VERSION
aks-agentpool-15332109-vmss000003   Ready    agent   8h    v1.25.6
akswinaks000003                     Ready    agent   8h    v1.25.6
```

Then, log into the node hosting the pod you want to debug.

```bash
kubectl node-shell aks-agentpool-15332109-vmss000003
```

## Using crictl

Inside the node you have crictl at your disposal to check the pods running on the cluster.

```bash
crictl pods --namespace default
```

Get the container ID from the target pod:

```bash
crictl ps | grep <pod-name>
```

Inspect the container to get the PID:

```bash
crictl inspect <container-id> | grep -i 'pid'
```

The PID we need will be always the first value.

## Leveraging nsenter

Use the PID to step into the container namespace:

**Check the container's IP address:**

```bash
nsenter -t <PID> -n ip a
```

**Check DNS configuration:**

```bash
nsenter -t <PID> -p -r cat /etc/resolv.conf
```

**Take a network capture:**

```bash
nsenter -t <PID> -n tcpdump
```

## Conclusion

Both crictl and nsenter opens a new world of possibilities to further troubleshoot problems directly from the pod, and most of the times you will not have to install any additional software.
