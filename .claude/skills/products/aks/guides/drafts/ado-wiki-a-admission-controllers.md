---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Admission Controllers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAdmission%20Controllers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Admission Controllers

[[_TOC_]]

## Background

From kubernetes 1.19.0, we enabled three new admission controllers for CCP: PodNodeSelector, PodTolerationRestriction, ExtendedResourceToleration. These admission controllers are disabled for AKS clusters < 1.19.0.

### Code change

<https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-rp/pullrequest/3625835>

### AKS issues

- <https://github.com/Azure/AKS/issues/1143>
- <https://github.com/Azure/AKS/issues/1719>
- <https://github.com/Azure/AKS/issues/1449>

## PodNodeSelector

<https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#podnodeselector>
This admission controller defaults and limits what node selectors may be used within a namespace by reading a namespace annotation and a global configuration.
There're two ways to config the node-selector of a namespace: by config file or by annotation on the namespace. We only support the configuration by namespace annotation.

Explain by example:
Say the cluster admin wants to enforce all the pods in the namespace dev to be scheduled to the nodes with label `env: development`. The `scheduler.alpha.kubernetes.io/node-selector` can be added to the namespace:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  annotations:
    scheduler.alpha.kubernetes.io/node-selector: env=development
  name: dev
```

Then if we deploy a pod to namespace, the node selector will be added to the pod object automatically.

``` yaml
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: dev
spec:
  containers:
  - name: nginx
    image: nginx
EOF
```

``` yaml
$ kubectl describe pod nginx -n dev
Name:         nginx
Namespace:    dev
...
Node-Selectors:  env=development
...
```

If there is no node has the label 'env=development'. The pod will be in 'Pending' state forever.

```sh
$ kubectl get pods -n dev
NAME    READY   STATUS    RESTARTS   AGE
nginx   0/1     Pending   0          6m47s
```

```sh
$ kubectl describe pod nginx -n dev
[...]
Events:
  Type     Reason            Age                  From               Message
  ----     ------            ----                 ----               -------
  Warning  FailedScheduling  33s (x8 over 7m42s)  default-scheduler  0/1 nodes are available: 1 node(s) didn't match node selector.
```

If the pod requested already has a different node-selector. It'll be rejected by the api server.

``` yaml
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: dev
spec:
  containers:
  - name: nginx
    image: nginx
  nodeSelecor:
    env: prod
EOF
```

Run `kubectl apply -f nginx-pod.yaml` returns:

```log
Error from server (Forbidden): error when creating "STDIN": pods "nginx" is forbidden: pod node label selector conflicts with its namespace node label selector
```

## PodTolerationRestriction

<https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#podtolerationrestriction>

>The PodTolerationRestriction admission controller verifies any conflict between tolerations of a pod and the tolerations of its namespace. It rejects the pod request if there is a conflict. It then merges the tolerations annotated on the namespace into the tolerations of the pod. The resulting tolerations are checked against a list of allowed tolerations annotated to the namespace. If the check succeeds, the pod request is admitted otherwise it is rejected.

Similar to the PodNodeSelector, it can be configured by the `scheduler.alpha.kubernetes.io/defaultTolerations` and `scheduler.alpha.kubernetes.io/tolerationsWhitelist` annotations on namespace.

Example:  
To add default tolerations to the objects within the namespace, add the annotation like below:

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: apps-that-need-nodes-exclusively
  annotations:
    scheduler.alpha.kubernetes.io/defaultTolerations: '[{"operator": "Exists", "effect": "NoSchedule", "key": "dedicated-node"}]'
```

The tolerations will be merged with the existing tolerations defined for the pod. (Note that pods are created with two default tolerations)

```yaml
$ cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  namespace: apps-that-need-nodes-exclusively
spec:
  containers:
  - name: nginx
    image: nginx
EOF
```

```sh
$ kubectl describe pod nginx -n apps-that-need-nodes-exclusively
Name:         nginx
Namespace:    apps-that-need-nodes-exclusively
...
Tolerations:     dedicated-node:NoSchedule op=Exists
                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
...
```

To limit the tolerations can be used within the namespace, use the `scheduler.alpha.kubernetes.io/tolerationsWhitelist` annotation. **Please also add the pod default tolerations to the whitelist, otherwise pod creation request will be rejected.**

``` yaml
apiVersion: v1
kind: Namespace
metadata:
  name: apps-that-need-nodes-exclusively
  annotations:
    scheduler.alpha.kubernetes.io/defaultTolerations: '[{"operator": "Exists", "effect": "NoSchedule", "key": "dedicated-node"}]'
    scheduler.alpha.kubernetes.io/tolerationsWhitelist: '[{"operator": "Exists", "effect": "NoSchedule", "key": "dedicated-node"},
      {"operator": "Exists", "effect": "NoExecute", "key": "node.kubernetes.io/not-ready"},
      {"operator": "Exists", "effect": "NoExecute", "key": "node.kubernetes.io/unreachable"}]'
```

If the `scheduler.alpha.kubernetes.io/tolerationsWhitelist` is defined, any toleration (including the default ones) not in the whitelist will be rejected. Error message like this:

```log
Error from server: error when creating "STDIN": pod tolerations (possibly merged with namespace default tolerations) conflict with its namespace allowlist
```

## ExtendedResourceToleration

<https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#extendedresourcetoleration>

This plug-in facilitates creation of dedicated nodes with extended resources. If operators want to create dedicated nodes with extended resources (like GPUs, FPGAs etc.), they are expected to taint the node with the extended resource name as the key. This admission controller, if enabled, automatically adds tolerations for such taints to pods requesting extended resources, so users don't have to manually add these tolerations.

This admission controller is very useful when there're GPU workloads.  
For example, if we create an AKS cluster with a GPU node pool, we can taint the nodes with `nvidia.com/gpu:NoSchedule` so that CPU-only workloads won't be scheduled to the nodes.

```sh
kubectl taint no aks-nodes-32411630-vmss000000 nvidia.com/gpu:NoSchedule
```

```sh
$ kubectl describe node
Name:               aks-nodes-32411630-vmss000000
Roles:              agent
...
Taints:             nvidia.com/gpu:NoSchedule
...
```

Then for GPU workloads, once we request nvidia.com/gpu resource in the pod spec, the tolerations `nvidia.com/gpu:NoSchedule` will be automatically added to the resource definition. (Note the `nvidia.com/gpu: 1` line sets the limit of the GPU resource)

```yaml
$ cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  labels:
    app: samples-tf-mnist-demo
  name: samples-tf-mnist-demo
spec:
  template:
    metadata:
      labels:
        app: samples-tf-mnist-demo
    spec:
      containers:
      - name: samples-tf-mnist-demo
        image: microsoft/samples-tf-mnist-demo:gpu
        args: ["--max_steps", "500"]
        imagePullPolicy: IfNotPresent
        resources:
          limits:
           nvidia.com/gpu: 1
      restartPolicy: OnFailure
EOF
```

```sh
$ kubectl describe po
Name:           samples-tf-mnist-demo-p5lzx
Namespace:      default
...
Tolerations:     node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                 node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
                 nvidia.com/gpu:NoSchedule op=Exists
...
```

## Owner and Contributors

**Owner:** Andrew Schull <anschul@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Ines Monteiro <t-inmont@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
