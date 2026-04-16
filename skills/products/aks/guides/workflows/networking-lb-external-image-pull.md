# AKS 外部负载均衡器与 SNAT — image-pull — 排查工作流

**来源草稿**: ado-wiki-a-ErrImagePull-ImagePullBackOff-Status.md, ado-wiki-a-image-cleaner.md
**Kusto 引用**: image-integrity.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Customer Pod is in a ErrImagePull/ImagePullBackOff Status
> 来源: ado-wiki-a-ErrImagePull-ImagePullBackOff-Status.md | 适用: 适用范围未明确

### 排查步骤

#### Customer Pod is in a ErrImagePull/ImagePullBackOff Status


#### Summary

When Kubernetes node fails to pull container image from container registry, the Pod will go into `ErrImagePull` status. Kubernetes will keep trying to pull the image. But if it is still failed to pull image, the Pod will go into `ImagePullBackOff` status.

#### Reported and Observed Symptoms

* Pods showing a status of `ErrImagePull` or `ImagePullBackoff` in the `kubectl get pods` command output

#### Cause

There are several possible reasons for the occurrence of `ErrImagePull` or `ImagePullBackOff` status.

* Configuration Issue
  * Incorrect registry name or image name
  * Invalid container image name specified (`InvalidImageName` status)
* Networking Issue
  * Image pulling access failed to registry
  * DNS name resolution failed for registry FQDN
* Authentication Issue
  * Authorization failed for registry access

#### Mitigation Steps

1. Run `kubectl describe pod {Pod Name}` for the pod in the `ErrImagePull` or `ImagePullBackOff` status to gather more information on why the Pod is failing to pull container image.
2. Read through the events in the describe output for any additional information on the image pull issues.

    Depending on the events in the describe output, you may need to jump to the [Configuration issue](#configuration-issue), [Networking Issue](#networking-issue), or [Authentication Issue](#authentication-issue) sections.

    If you see error messages similar to the following, jump to the [configuration issues](#configuration-issue) section:

    * `pull access denied for ozawashuhe/yatteiki, repository does not exist or may require 'docker login'`
    * `Failed to apply default image tag "k8s.gcr.io//echoserver:1.4": couldn't parse image reference "k8s.gcr.io//echoserver:1.4": invalid reference format`
    * `Error: InvalidImageName`

    If you see error messages similar to the following, jump to the [networking issues](#networking-issue) section:

    * `Failed to pull image "yatteikiregistry.azurecr.io/nginx:v1": rpc error: code = Unknown desc = failed to pull and unpack image "yatteikiregistry.azurecr.io/nginx:v1": failed to resolve reference "yatteikiregistry.azurecr.io/nginx:v1": failed to do request: Head "https://yatteikiregistry.azurecr.io/v2/nginx/manifests/v1": dial tcp 40.***.***.***:443: i/o timeout`
    * `dial tcp: lookup k8s.gcrrrr.io on 192.168.65.2:53: no such host`

    If you see error messages similar to the following, jump to the [authentication issues](#authentication-issue) section:

    * `failed to resolve reference "yatteikiregistry.azurecr.io/nginx:v1": failed to authorize: failed to fetch anonymous token: unexpected status: 401 Unauthorized`

    If the image pull is attempting to hit Azure Container Registry, the troubleshooting steps in the AKS troubleshooting guide are a good place to start: <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-troubleshoot-network-issues>.

---

##### Configuration Issue

#### Incorrect registry name or image name

In the following example, the message `pull access denied for ozawashuhe/yatteiki, repository does not exist or may require 'docker login'` in the events indicates that the image pull was rejected or the specified image does not exist in the registry.

```shell
$ kubectl describe pod yatteiki-app-5b995f654f-r8pf5 -n yatteiki
  ...
Events:
  Type     Reason     Age                 From               Message
  ----     ------     ----                ----               -------
  Normal   Scheduled  117s                default-scheduler  Successfully assigned yatteiki/yatteiki-app-5b995f654f-r8pf5 to minikube
  Normal   Pulling    30s (x4 over 116s)  kubelet            Pulling image "ozawashuhe/yatteiki"
  Warning  Failed     27s (x4 over 113s)  kubelet            Failed to pull image "ozawashuhe/yatteiki": failed to pull and unpack image "docker.io/ozawashuhe/yatteiki:latest": failed to resolve reference "docker.io/ozawashuhe/yatteiki:latest": pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
  Warning  Failed     27s (x4 over 113s)  kubelet            Error: ErrImagePull
  Normal   BackOff    13s (x5 over 113s)  kubelet            Back-off pulling image "ozawashuhe/yatteiki"
  Warning  Failed     13s (x5 over 113s)  kubelet            Error: ImagePullBackOff
```

In this specific case, Docker Hub allows anonymous or unauthenticated image pulls, so it won't reject the attempt the pull request because of authentication. So, it is expected that the cause of error is not authentication or permission of the registry. Let's check if the registry name is correct and the image exists in the registry.

The below image is screen capture of the registry. The repository/image name is shown in the image and we can see that the repository and image name displayed in Docker Hub is different than the image reference in our pod spec.

![Screenshot from Docker Hub showing the repository and image name for the target image in our pod spec.](/.attachments/pod-image-pullbackoff-investigation-dockerhub.png)

When encountering errors like this, ensure the container registry host name, repostiory name, and image name are all correct. Confirm that the image exists in the registry **and** the tag specified in the pod spec also exists.

Edit YAML manifest of Pod and fix repository/image to correct name, then redeploy Pod with the modified manifest. With the updated YAML deployed into the cluster, the image pull should succeed.

> **Note**: The message format shown in Events may be different depending on a container registry. For example, the following message is shown when trying to pull non-exists image from Google Container Registry (GCR). We can see message `gcr.io/myregistry/invalid-image-name:2.0: not found`, it clearly specified that the image is not found.
>
> ```shell
> Events:
>   Type     Reason     Age                From               Message
>   ----     ------     ----               ----               -------
>   Normal   Scheduled  32s                default-scheduler  Successfully assigned default/yukirii-test-6bcb4f9fc5-th7kq to gke-dev-e2-small-eea9bbcb-toju
>   Normal   Pulling    19s (x2 over 31s)  kubelet            Pulling image "gcr.io/myregistry/invalid-image-name:2.0"
>   Warning  Failed     19s (x2 over 31s)  kubelet            Failed to pull image "gcr.io/myregistry/invalid-image-name:2.0": rpc error: code = NotFound desc = failed to pull and unpack image "gcr.io/myregistry/invalid-image-name:2.0": failed to resolve reference "gcr.io/myregistry/invalid-image-name:2.0": gcr.io/myregistry/invalid-image-name:2.0: not found
>   Warning  Failed     19s (x2 over 31s)  kubelet            Error: ErrImagePull
>   Normal   BackOff    5s (x2 over 30s)   kubelet            Back-off pulling image "gcr.io/myregistry/invalid-image-name:2.0"
>   Warning  Failed     5s (x2 over 30s)   kubelet            Error: ImagePullBackOff
> ```

#### Invalid container image name specified (InvalidImageName status)

After reviewing the events in the output of the describe command, if you see events with a message of `InvalidImageName`, it means that the image name specified in the pod spec is invalid. In the following example, we can see the message `couldn't parse image reference "k8s.gcr.io//echoserver:1.4": invalid reference format`. Looking closer at the image, we can see a double slash `//` in the image name, making the image name invalid.

```shell
kubectl describe pod hello-world-56d7cb55cf-dbbmr
  ...
Containers:
  echoserver:
    Container ID:
    Image:          k8s.gcr.io//echoserver:1.4
  ...
Events:
  Type     Reason         Age                From               Message
  ----     ------         ----               ----               -------
  Normal   Scheduled      23s                default-scheduler  Successfully assigned default/hello-world-56d7cb55cf-dbbmr to minikube
  Warning  InspectFailed  11s (x3 over 23s)  kubelet            Failed to apply default image tag "k8s.gcr.io//echoserver:1.4": couldn't parse image reference "k8s.gcr.io//echoserver:1.4": invalid reference format
  Warning  Failed         11s (x3 over 23s)  kubelet            Error: InvalidImageName
```

In the above example, Pod will start successfully by fixing image name to correct format `k8s.gcr.io/echoserver:1.4`. If you get `InvalidImageName` status, make sure if the image is fully correct. You should check the registry name, the image name, and the tag name.

---

##### Networking Issue

#### Image pulling access failed to registry

If worker node could not access to container registry, it will fail to pull container image and Pod run into ErrImagePull status. In the example describe output below, the kubelet failed to reach out to the Azure Container Registry instance and pull the image, erring with a timeout:

```shell
$ kubectl describe pod nginx0-deployment-56c8c68cdd-2hxdm
  ...
Events:
  Type     Reason     Age                  From               Message
  ----     ------     ----                 ----               -------
  Normal   Scheduled  2m42s                default-scheduler  Successfully assigned default/nginx0-deployment-56c8c68cdd-2hxdm to aks-nodepool1-27375000-vmss000000
  Normal   BackOff    56s (x2 over 2m1s)   kubelet            Back-off pulling image "yatteikiregistry.azurecr.io/nginx:v1"
  Warning  Failed     56s (x2 over 2m1s)   kubelet            Error: ImagePullBackOff
  Normal   Pulling    45s (x3 over 2m42s)  kubelet            Pulling image "yatteikiregistry.azurecr.io/nginx:v1"
  Warning  Failed     5s (x3 over 2m2s)    kubelet            Failed to pull image "yatteikiregistry.azurecr.io/nginx:v1": rpc error: code = Unknown desc = failed to pull and unpack image "yatteikiregistry.azurecr.io/nginx:v1": failed to resolve reference "yatteikiregistry.azurecr.io/nginx:v1": failed to do request: Head "https://yatteikiregistry.azurecr.io/v2/nginx/manifests/v1": dial tcp 40.***.***.***:443: i/o timeout
  Warning  Failed     5s (x3 over 2m2s)    kubelet            Error: ErrImagePull
```

Most commonly, the network path between the worker node and the container registry is disrupted by a firewall, network virtual appliance, or NSG. A firewall or network virtual appliance could be an actual network hop, or could be a WAF or software firewall configured on the container registry itself.

Confirm that the network path between the worker node and the container registry is open and accessible.

If you get `403 Forbidden` error, make sure the allowed IP address range of ACR. If the public network access is limited to selected networks, allow access from AKS's IP address.

#### DNS name resolution failed for registry FQDN

DNS name resolution failed for registry FQDN will cause of `ErrImagePull` or `ImagePullBackOff` status. When reading the events in the describe output for a pod, the message `dial tcp: lookup k8s.gcrrrr.io on 192.168.65.2:53: no such host` is shown in events which indicates the configured DNS servers weren't able to resolve the hostname of the container registry.

In the example below, the echoserver image is in the registry `k8s.gcr.io`. However, an incorrect registry name of `k8s.gcrrrr.io` is specified at the YAML manifest of the Pod. For this reason, no such host error has occurred and the pulling image failed.

```shell
$ kubectl describe pod hello-minikube-85b5f9c779-gsm8c
  ...
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  23s                default-scheduler  Successfully assigned default/hello-minikube-85b5f9c779-gsm8c to minikube
  Normal   BackOff    20s (x2 over 21s)  kubelet            Back-off pulling image "k8s.gcrrrr.io/echoserver:latest"
  Warning  Failed     20s (x2 over 21s)  kubelet            Error: ImagePullBackOff
  Normal   Pulling    8s (x2 over 22s)   kubelet            Pulling image "k8s.gcrrrr.io/echoserver:latest"
  Warning  Failed     7s (x2 over 22s)   kubelet            Failed to pull image "k8s.gcrrrr.io/echoserver:latest": rpc error: code = Unknown desc = Error response from daemon: Get "https://k8s.gcrrrr.io/v2/": dial tcp: lookup k8s.gcrrrr.io on 192.168.65.2:53: no such host
  Warning  Failed     7s (x2 over 22s)   kubelet            Error: ErrImagePull
```

In the above example, the Pod will start successfully by fixing image name to correct hostname `k8s.gcr.io/echoserver:latest`. Other potential reasons for DNS name resolution errors include that nodes cannot access the DNS server and the registry hostname is not registered on the DNS server (DNS records does not exist). If DNS name resolution failures occur for multiple pods in the cluster or for different images, check for network failures, DNS server failures, or failures with the container registry itself.

<!-- TODO: Write description about ACR Private Endpoint -->

If a private endpoint is configured for Azure Container Registry, make sure the virtual network link for the AKS cluster's virtual network is set in the Private DNS zone of the ACR.

---

##### Authentication Issue

#### Authorization failed for registry access

It is a possible reason of `ErrImagePull` that the node couldn't access to container registry due to authentication error. This may occur when using a private container registry. To pull image from a private registry, it is required to authorize registry access using credential such as username and password.

When the kubelet attempts to pull an image from a private registry but cannot authenticate with the registry, the following error message is shown in the pod events and the pod fails to start.

```shell
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  48s                default-scheduler  Successfully assigned default/nginx0-deployment-ff695c46b-spq7b to aks-nodepool1-27375000-vmss000001
  Normal   BackOff    19s (x2 over 47s)  kubelet            Back-off pulling image "yatteikiregistry.azurecr.io/nginx:v1"
  Warning  Failed     19s (x2 over 47s)  kubelet            Error: ImagePullBackOff
  Normal   Pulling    8s (x3 over 48s)   kubelet            Pulling image "yatteikiregistry.azurecr.io/nginx:v1"
  Warning  Failed     8s (x3 over 48s)   kubelet            Failed to pull image "yatteikiregistry.azurecr.io/nginx:v1": rpc error: code = Unknown desc = failed to pull and unpack image "yatteikiregistry.azurecr.io/nginx:v1": failed to resolve reference "yatteikiregistry.azurecr.io/nginx:v1": failed to authorize: failed to fetch anonymous token: unexpected status: 401 Unauthorized
  Warning  Failed     8s (x3 over 48s)   kubelet            Error: ErrImagePull
```

The message `401 Unauthorized` is shown in Events and indicates the authorization failed when attempting to access the registry. The image tag and registry URL may differ across registry providers, but the error message is the same. For example, the following error message is returned for Google Container Registry:

```shell
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  26s                default-scheduler  Successfully assigned default/yukirii-test-7867d56557-x9fnh to minikube
  Normal   BackOff    24s                kubelet            Back-off pulling image "asia.gcr.io/myregistry/nginx:latest"
  Warning  Failed     24s                kubelet            Error: ImagePullBackOff
  Normal   Pulling    10s (x2 over 26s)  kubelet            Pulling image "asia.gcr.io/myregistry/nginx:latest"
  Warning  Failed     9s (x2 over 25s)   kubelet            Failed to pull image "asia.gcr.io/myregistry/nginx:latest": rpc error: code = Unknown desc = Error response from daemon: unauthorized: You don't have the needed permissions to perform this operation, and you may have invalid credentials. To authenticate your request, follow the steps in: https://cloud.google.com/container-registry/docs/advanced-authentication
  Warning  Failed     9s (x2 over 25s)   kubelet            Error: ErrImagePull
```

Resolving authentication or authorization issues revolves around confirming the correct credentials are present and correctly configured inside the cluster.

If pulling from Azure Container Registry, the `AcrPull` role is the minimum permission set required and needs to be assigned to either the kubelet identity or the workload/pod identity used for the pod: <https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#acrpull>.

If you want to use [imagePullSecrets](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) on Pod, you need to configure container registry credentials as Secret object in a cluster.
Please make sure the secret object has the correct credentials for the container registry, as documented at: <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes>.

If you get `403 Forbidden` error from ACR, the cause may not credentials issues. ACR returns HTTP 403 status when the client IP address is not allowed. Make sure if the public network access is limited to selected networks and AKS's IP address is allowed

---

#### References

* Configuration Issues

* Networking Issues
  * Container registry access errors
    * Cause 4: 443 timeout error / Troubleshoot network issues with registry - Azure Container Registry | Microsoft Learn: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/cannot-pull-image-from-acr-to-aks-cluster#cause-4-443-timeout-error>
  * DNS resolution errors
    * Solution 1: Ensure AKS virtual network link is set in the container registry's Private DNS zone: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/cannot-pull-image-from-acr-to-aks-cluster#solution-1-ensure-aks-virtual-network-link-is-set-in-the-container-registrys-private-dns-zone>
    * Troubleshoot network issues with registry - Azure Container Registry | Microsoft Learn: <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-troubleshoot-access>
* Authentication Issues
  * AcrPull built-in role: <https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#acrpull>
  * 401 Unauthorized error / Troubleshoot network issues with registry - Azure Container Registry | Microsoft Learn: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/cannot-pull-image-from-acr-to-aks-cluster#cause-1-401-unauthorized-error>
  * Azure Container Registry roles and permissions: <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-roles>
  * Image Pull Secrets: <https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/>
  * Pull images from an Azure container registry to a Kubernetes cluster using a pull secret: <https://learn.microsoft.com/en-us/azure/container-registry/container-registry-auth-kubernetes>
  * Cause 3: 403 Forbidden error / Troubleshoot network issues with registry - Azure Container Registry | Microsoft Learn: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/cannot-pull-image-from-acr-to-aks-cluster#cause-3-403-forbidden-error>
  * Can't pull images from Azure Container Registry to Kubernetes - Azure | Microsoft Learn: <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/cannot-pull-image-from-acr-to-aks-cluster>

#### Owner and Contributors

**Owner:** Shashank Shankar Katkar <skatkar@microsoft.com>

**Contributors:**

* Kenichiro Hirahara <khiraha@microsoft.com>
* Yuki Kirii <yukirii@microsoft.com>

---

## Scenario 2: Image Cleaner (Eraser)
> 来源: ado-wiki-a-image-cleaner.md | 适用: 适用范围未明确

### 排查步骤

#### Image Cleaner (Eraser)

#### Overview

Based on the [Eraser Project](https://github.com/Azure/eraser). Removes unused or vulnerable images cached on AKS nodes. When enabled, an `eraser-controller-manager` pod is deployed on each node, using ImageList CRD to determine unreferenced and vulnerable images (via trivy scan with LOW/MEDIUM/HIGH/CRITICAL classification).

#### Identifying Image Cleaner

##### From ASC/ASI
Check for Image Cleaner in security features section.

##### From ManagedCluster Property
```json
"securityProfile": {
    "imageCleaner": {
      "enabled": true,
      "intervalHours": 24
    }
}
```

#### How to Check Logs

```bash
kubectl get pods --all-namespaces
kubectl logs -n kube-system collector-{vmss}-dpkqt -c eraser
kubectl logs -n kube-system collector-{vmss}-dpkqt -c trivy-scanner
```

#### Collector Status NotReady

Scan or erase tasks may take a while depending on number of images. `2/3` Ready with `NotReady` status is **expected** during processing. Once scanner finishes and eraser removes images, status changes to `Completed`.

#### References

- [Upstream issues](https://github.com/Azure/eraser/issues)
- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/image-cleaner?tabs=azure-cli)

---

## 附录: Kusto 诊断查询

### 来源: image-integrity.md

# Image Integrity 功能查询

## 查询语句

### 查询 Image Integrity 启用操作

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndQoSEvents
//| where PreciseTimeStamp > ago(7d)
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName contains "{resourceGroup}"
| where resourceName contains "{cluster}"
| where userAgent has "azure-resource-manager"
| where operationName == "PutManagedClusterHandler.PUT"
| where propertiesBag has "\"enableImageIntegrity\":\"true\""
| project PreciseTimeStamp, apiVersion, operationID, correlationID, resultCode, errorDetails, propertiesBag
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---
