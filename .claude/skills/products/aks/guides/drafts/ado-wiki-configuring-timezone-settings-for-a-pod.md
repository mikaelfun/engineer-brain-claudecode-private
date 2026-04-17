---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Configuring timezone settings for a pod"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConfiguring%20timezone%20settings%20for%20a%20pod"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configuring timezone settings for a pod

## Context

Customers often ask about how to change the timezone on their AKS cluster nodes. Even though it is technically possible to change the timezone on worker nodes, this would cause worker nodes to use a different timezone from the one used by the master nodes, and so it would break the AKS cluster.

The customer's real goal is usually to change the timezone used by their workloads (containers), which is also the timezone displayed in container logs. So it is usually enough to change the timezone used by the pods instead of the nodes themselves.

**NOTE: This applies only to Linux based PODs. Until now we haven't found a way to achieve the same on Windows based images.**

## Option 1: TZ Environment Variable

Set 'TZ' environment variable at POD definition:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-dif-timezone
spec:
  containers:
  - name: nginx-dif-timezone
    image: nginx
    env:
    - name: TZ
      value: "America/New_York"
```

## Option 2: Volume Mount /etc/localtime

Mount the appropriate timezone file from the host node:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: alpine
spec:
  containers:
  - name: alpine
    image: alpine
    volumeMounts:
    - name: timezone-config
      mountPath: /etc/localtime
  volumes:
    - name: timezone-config
      hostPath:
        path: /usr/share/zoneinfo/Asia/Kolkata
```

## Option 3: k8tz Admission Controller

Deploy k8tz to inject timezones into Pods and CronJobs:

```bash
helm repo add k8tz https://k8tz.github.io/k8tz/
helm install k8tz k8tz/k8tz --set timezone=Europe/London
```

CLI usage:

```bash
# to a file
k8tz inject --strategy=hostPath test-pod.yaml > injected-test-pod.yaml

# or directly to kubectl
k8tz inject --timezone=Europe/London test-pod.yaml | kubectl apply -f -

# inject to all existing deployments in current namespace
kubectl get deploy -oyaml | k8tz inject - | kubectl apply -f -
```

NOTE: The injection process is idempotent.

## Check Available Timezones

List contents of `/usr/share/zoneinfo/` on the worker node.
