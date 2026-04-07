---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/KEDA Implementation with AKS Cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FKEDA%20Implementation%20with%20AKS%20Cluster"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Installing KEDA on Azure Kubernetes Service Clusters

## Summary and Goals

This article shows you how to install the Kubernetes Event-driven Autoscaling (KEDA) to the Azure Kubernetes Service (AKS) by using Helm.

### What is KEDA?

- KEDA is an open source component for event-driven autoscaling of workloads.
- KEDA scales workload dynamically based on the number of events received.
- KEDA extends K8s with a custom resource definition (CRD) called "ScaledObject" to describe how applications should be scaled in response to a specific traffic
- KEDA scaling is useful in scenarios where workloads receive bursts of traffic or handle high volumes of data.
- **KEDA is different than HPA**: KEDA is event-driven and scales based on the number of events, while HPA is metrics-driven based on the resource utilization like (CPU and memory).

### Is Helm the only way to use KEDA?

AKS provides an add-on to simplify the KEDA installation. You can enable the KEDA using Azure CLI, or update the cluster later by adding (--enable-Keda) flag. The AKS KEDA add-on provides Basic common configuration (for the moment). You can check the Microsoft documentation on KEDA for more info: https://learn.microsoft.com/en-us/azure/aks/keda-deploy-add-on-cli

Currently, manual editing of KEDA YAML files is recommended for more customization. Therefore, in this guide, we'll create an AKS cluster (without the add-on) and use helm to install KEDA because we're looking to use Http-Scaled object, to scale based on the pending requests. And nginx application exposed with a cluster IP service in our cluster.

### Prerequisites

- An Azure subscription.
- Azure CLI
- Helm CLI
- An AKS cluster with five nodes available.

## Implementation Steps

### Installing KEDA with Helm

1. Configure the KEDA Helm repo for use with Helm CLI:
   1. Add the KEDA Helm repo: `helm repo add kedacore https://kedacore.github.io/charts`
   2. Update the Helm repo: `helm repo update`

2. Run `helm install keda kedacore/keda --create-namespace keda` to install KEDA in the keda namespace. Once the Helm install completes, run `helm install http-add-on kedacore/keda-add-ons-http --namespace keda` to install the HTTP add-on.

3. Using `kubectl get po -n keda`, verify that the KEDA pods are running in the `keda` namespace.

   You can also list all of the KEDA custom resource definitions (CRDs) by running `kubectl get crd | grep keda`.

### Deploying NGINX that scales via KEDA

The YAML code block below represents an NGINX deployment that will be scaled by KEDA. The deployment is configured to scale based on the number of pending requests to the NGINX service.

```yaml
# Deployment of nginx, to be scaled by Keda http-add-on
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-http
spec:
  selector:
    matchLabels:
      app: nginx-http
  replicas: 1
  template:
    metadata:
      labels:
        app: nginx-http
    spec:
      containers:
        - name: nginx-http
          image: nginx
          resources:
            limits:
              memory: 256Mi
              cpu: 200m
          ports:
            - containerPort: 80
---
# Expose nginx deployment as a service
apiVersion: v1
kind: Service
metadata:
  name: nginx-http-service
  labels:
    app: nginx-http
spec:
  selector:
    app: nginx-http
  ports:
    - protocol: TCP
      port: 8082
      targetPort: 80
---
# The HTTPScaledObject configuration
kind: HTTPScaledObject
apiVersion: http.keda.sh/v1alpha1
metadata:
    name: nginx-http
spec:
    host: "nginx-http.default.svc.cluster.local"
    targetPendingRequests: 10
    scaleTargetRef:
        deployment: nginx-http
        service: nginx-http-service
        port: 8082
    replicas:
      min: 1
      max: 20
---
# Load generator deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: load-http
  name: load-http
spec:
  replicas: 1
  selector:
    matchLabels:
      app: load-http
  template:
    metadata:
      labels:
        app: load-http
    spec:
      containers:
      - image: ubuntu:22.04
        command: ["/bin/sh"]
        args: ["-c","/usr/bin/apt update ; /usr/bin/apt install siege -y ; siege -d 1 -c 60 -t 3600s -H 'Host: nginx-http.default.svc.cluster.local' http://keda-add-ons-http-interceptor-proxy.keda.svc.cluster.local:8080"]
        name: load-http
        resources:
          limits:
            memory: 128Mi
            cpu: 500m
```

Verify deployment:

```sh
kubectl get po
kubectl describe httpscaledobjects.http.keda.sh nginx-http
```

## References

- KEDA Overview: https://learn.microsoft.com/en-us/azure/aks/keda-about
- KEDA Add-on Deploy Guide: https://learn.microsoft.com/en-us/azure/aks/keda-deploy-add-on-cli
