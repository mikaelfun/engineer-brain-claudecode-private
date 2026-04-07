---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Network Observability (Kappie)/Advanced/Hubble CLI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20%28Kappie%29/Advanced/Hubble%20CLI"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Hubble CLI and Traffic Flow Logs TSG

## Troubleshooting Steps

### 0. Check that Retina/Cilium Pod is running

Non-cilium cluster:
```shell
kubectl get pods -n kube-system -l k8s-app=retina
```

Cilium cluster:
```shell
kubectl get pods -n kube-system -l k8s-app=cilium
```

### 1. Check Hubble Resources

![](../../images/network-observability/hubble-resources.png)

#### 1.1. Check Hubble Relay Pod

See [troubleshooting steps for Hubble Relay](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Monitoring/Network-Observability-\(Kappie\)/Advanced/Hubble-Relay).

#### 1.2. Check that the TLS secrets exist 

```shell
kubectl get secrets -n kube-system | grep hubble
```

There should be the three secrets in image above.

Note when they were created. They must be less than 1095 days old.

### 2. Acquire secrets

***Obtain secrets with discretion***. See our public documentation ([aka.ms/acns](https://aka.ms/acns)) for more info.

### 3. Make sure Hubble CLI is configured

Config needs the following values:
- `tls: true`
- `tls-server-name: instance.hubble-relay.cilium.io`
- tls cert files set to correct paths

```shell
hubble config view
```

![](../../images/network-observability/hubble-config-view.png)

See our public documentation ([aka.ms/acns](https://aka.ms/acns)) for how to set these.

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
