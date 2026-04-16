# AKS Istio 安装与配置 — gateway-api — 排查工作流

**来源草稿**: ado-wiki-a-Application-Routing-nginx.md, ado-wiki-a-Istio-Egress-Gateway.md, ado-wiki-a-Managed-Istio.md, ado-wiki-a-Managed-NAT-Gateway.md, ado-wiki-a-kubernetes-managed-gateway-api.md, ado-wiki-a-tsg-diagnosing-istio-latency.md, ado-wiki-b-apim-backend-tls-trust-failures.md, ado-wiki-c-E2E-TLS-AppGW-to-AKS-Certificate-Chain.md, ado-wiki-c-Scheduler-Customization-kube-scheduler.md, ado-wiki-c-Secure-TLS-Bootstrapping.md, ado-wiki-c-TLS-Troubleshooting-Guide.md, ado-wiki-managed-gateway-api-istio.md, ado-wiki-update-ingress-ca-certificates-with-pfx.md, ado-wiki-using-multiple-ingress-controllers.md, mslearn-managed-gateway-api-troubleshooting.md
**Kusto 引用**: api-throttling-analysis.md
**场景数**: 15
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-Application-Routing-nginx.md | 适用: 适用范围未明确

### 排查步骤

##### Classifying Issue

App Routing has many involved components (see Architecture above) so the first step in troubleshooting is determining which component is responsible.

Most App Routing symptoms often directly point to the responsible component. We can break issues up into three different categories.

* ARM / AKS RP (Control Plane): Issues will manifest in the form of the App Routing Operator Kubernetes resources not being deployed correctly.
* App Routing Operator (Data Plane): Issues will manifest in form of managed resources in the form of CX Overlay not being correct. Example symptoms include ExternalDNS or NGINX resources being deployed but with improper fields. Essentially, anything going wrong in the CX Overlay points to an App Routing Operator issue (assuming the App Routing Operator has the correct args being passed to it).
* Customer Error: Customer has a configuration setting inside their cluster that directly conflicts with App Routing.

Once the responsible component is identified, skip to its relevant section below.

Links

* [Control Plane](#arm--aks-rp-control-plane)
* [Data Plane](#app-routing-operator-data-plane)
* [Customer Error](#customer-error)

Oftentimes, you don't need to manually validate the App Routing Operator Deployment because the problem symptom directly points to whether the Control Plane, Data Plane, or Customer is responsible.

Examples:

* Customer sees NGINX or external dns resources in the `app-routing-system` namespace but there's some issue with the resources. => this is most likely a Data Plane issue since the App Routing Operator was able to create / update the resources.
* Customer sees no App Routing resources in their cluster => most likely customer error (see Customer Error section). If there's no logs in the App Routing Operator table for the cluster then that would mean it's a Control Plane issue. If there's logs, those logs should inform your decision and will typically point to either a Customer Error or Data Plane issue.

Determining if the Control Plane is responsible can be done by validating the App Routing Deployment in the CCP since that is the boundary between the Control Plane and the Data Plane.

Steps

~~1. Use HCP Debug to connect to CCP and view the app-routing-operator deployment. If the app-routing-operator deployment doesn't exist and the customer has correctly enabled App Routing then it's a Control Plane issue.
2. Compare the App Routing Operator deployment container args to what's expected by the Operator [config code](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/config/config.go). For example, the `--disable-osm="true"` should be expected in a Cluster that doesn't have the OSM addon enabled. Another example would be the DNS zones passed in through the `--dns-zone-ids` command should match what's configured through the AKS ARM definition for that cluster.~~
**We don't have access to these, updated instructions coming.**

If something doesn't seem right about the App Routing Operator Deployment it's likely a Control Plane issue. If it seems fine then first verify the issue isn't a Customer Error then investigate the Data Plane.

##### Customer Error

There are a few types of customer issues.

* Improper usage
* Policy issues
* Insufficient capacity
* Firewall blocking kubeapiserver

Follow the steps below for identifying and fixing. If an issue is identified as a customer issue, check the [public docs](https://learn.microsoft.com/en-us/azure/aks/app-routing?tabs=without-osm) to see if the issue is documented. If it's not documented please reach out to Ahmed Sabbour so we can document it. We need to publicly document common customer issues.

##### Custom Resource Definition

We use the `NginxIngressController` CRD to represent the desired state of managed Ingress Controller resources. A default `NginxIngressController` is created by default by the App Routing Operator. The App Routing Operator also reconciles the required resources based on the Custom Resource state (and re-reconciles on any changes to the Custom Resource). The Custom Resource provides a way for more advanced users to configure the Ingress Controller ([docs](https://learn.microsoft.com/en-us/azure/aks/app-routing-nginx-configuration)) but most users won't even be aware of its existence.

We publish events and the status of managed resources to the Custom Resource so users can see customer error and handle it themselves. A status on the Custom Resource is `Available` which is set to true when the Ingress Controller is fully reconciled and working properly, and false otherwise. It also shows whether the Controller state is progressing which if true means that it is still actively moving from not Available to available (it commonly just needs to wait for Pod replicas to become Ready). Events are published to the Custom Resource if customer error that blocks us from performing a necessary action occurs. Between the Statuses (and reason) fields and the Events, most customer error can be seen by describing the custom resource.

```bash
kubectl get nginxingresscontroller # lists the NginxIngressControllers
kubectl describe nginxingresscontroller <name> # shows the controller and all events
```

From a troubleshooting standpoint, the `NginxIngressController` customer resource is mostly meant for customers to self-debug but it can also be useful for on-call engineers that are connected to the customer cluster. For on-call engineers, logs from the App Routing Operator should match what is reflected in the Custom Resource status.

```KQL
AppRoutingOperator
| where PreciseTimeStamp > ago(1h)
| where namespace == "<cluster ccp namespace>"
| where controller == "nginx ingress controller reconciler"
| project-reorder msg, error
```

The `Nginx Ingress Controller Reconciler` controller is what's responsible for reconciling the actual resources in-cluster to what the goal defined in the Custom Resource is so that's why we filter for that controller.

##### Improper usage

Check the [public docs](https://learn.microsoft.com/en-us/azure/aks/app-routing?tabs=without-osm) to see how App Routing works.

One key thing to note is that customers should not manually touch the resources that App Routing manages. Users editing the App Routing NGINX configmap or any other managed resource could result in App Routing breaking.

##### Policy

Policy issues will commonly manifest in them accidentally blocking the App Routing Operator from being able to properly reconcile resources. This can be quickly investigated by checking the App Routing Operator logs.

[Example Query](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA0XKPQ6DMAwG0L2ncDPRsTsgcQJQywUs6wMi5cdyQlk4fDvR+b1B9ZX36tM6KoxrtttJxwYDTQbxBbOPeFeOSj3xmpvn9rhK4oiiLKCuI9dK2EuFkYj+qXdXD/gg0P1XfVqy+wJiqCZ1fAAAAA==)

```KQL
cluster("Aks").database("AKSprod").AppRoutingOperator
| where PreciseTimeStamp > ago(1h)
| where namespace == "{cluster ccp namespace}"
| where level != "info"
```

Alternatively, you can access these logs from our ASI page. You'll be looking for a log similar to `admission webhook \"validation.gatekeeper.sh\" denied the request` which points to a customer-installed webhook blocking requests from our App Routing operator. This would be considered a common customer error. The fix is to modify the customer owned validation webhook to allow the App Routing operator to properly reconcile its managed resources.

In the customer cluster, there is a `NginxIngressController` CRD that represents each managed Ingress Controller. Errors with reconciling the managed resources are bubbled up to the Custom Resource through Events. This mechanism allows customers to be aware of how their policies block us from reconciling resources properly and can also be used for debugging on our end.

```bash
kubectl get nginxingresscontroller # lists the NginxIngressControllers
kubectl describe nginxingresscontroller <name> # shows the controller and all events
```

##### Insufficient capacity

Insufficient capacity issues should manifest in the App Routing Operator successfully creating all required resources in the cluster but then the cluster isn't able to move those resources to their desired goal state. An example, is the Operator successfully applies the NGINX Ingress Controller Deployment but there's not enough Node space to schedule the deployment pods. This can be investigated by checking events on managed App Routing resources.

[Example Query](https://dataexplorer.azure.com/clusters/aksccplogs.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA0WNQQuCMBiG7/2KDy8WKCwl04NBBw8RQqC3iFjbp61yG9sshH58RmC3F973eZ99f8FqsA674onS2dkbXlc0CPWuLKp6Wx5gA7RV84gvpk7SDq2mDIEp6aiQFjyqdWhU74RsvWnIHv14bc6CQ56Dl6wIixO6zqIsJikhZNmkvGnIF9BG3ZC50KAyHA2MBktbDMAgtUoGf+kvBnD070Jy/xSAGzR+AHDx7yLJAAAA)

```KQL
cluster("aksccplogs.centralus.kusto.windows.net").database("AKSccplogs").KubeSystemEvents
| where TIMESTAMP > ago(6h)
| where namespace contains "{app-routing}"
| where cluster_id == "{cluster id}"
| project-reorder message, reason, namespace, name, ['kind'], type
```

Alternatively, you can access these logs from our ASI page. Look for something similar to `no nodes available to schedule pods`. The fix in this case is for the customer to scale up their Nodes so our managed resources can be scheduled.

On the `NginxIngressController` Custom Resource, there is a field for showing the current number of replicas. If our managed Nginx Ingress Controller pods can't be scheduled this will be shown on the Custom Resource by showing the replica count being less than the desired.

```bash
kubectl get nginxingresscontroller # lists the NginxIngressControllers
kubectl describe nginxingresscontroller <name> # shows the controller and all events
```

##### Firewall Rules

If the customer has a firewall blocking requests to the kubeapiserver, then the nginx deployment will enter crashloop backoff, with errors similar to `Error while initiating a connection to the Kubernetes API server. This could mean the cluster is misconfigured (e.g. it has invalid API server certificates or Service Accounts configuration). Reason: Get "https://10.0.0.1:443/version": EOF Refer to the troubleshooting guide for more information: https://kubernetes.github.io/ingress-nginx/troubleshooting/`

This log can be verified from the logs on the nginx deployment in the app-routing-system namespace

These logs can be retrieved using the `CustomerCluster - Get pods log` Geneva Action located at AzureContainerService/(Lockbox)Customer Data on Geneva. Running the action will yield a .zip file with txt files for logs across several aks services. `app_routing_ingress_controllers_logs.txt` contains the logs for the nginx deployment that may contain the expected error

#### Manual Testing if Pod Logs are inconclusive

Create a temporary debug pod with `kubectl debug node/NODENAME -it --image=mcr.microsoft.com/oss/mirror/docker.io/library/ubuntu:20.04` and then install curl (if the firewall is too restrictive it will also block installing curl on the debug pod, confirming the issue in a different way)

`apt update && apt install curl`

To confirm the issue, attempt to curl the address `https://$KUBERNETES_SERVICE_HOST/version`, and if it fails to dial, there could be a firewall issue. If the connection fails due to ssl verification, then the request successfully reached the kube api server, and the issue NOT a firewall configuration

Don't forget to delete your temporary debug pod afterwards

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-a-Istio-Egress-Gateway.md | 适用: 适用范围未明确

### 排查步骤

Before proceeding with the troubleshooting checklist, ensure that the user has met the following prerequisites:

- Users must have Azure CLI `aks-preview` version `14.0.0b2` or later installed to enable an Istio add-on egress gateway.
- Users must enable Static Egress Gateway on their cluster, create an agent pool of mode `gateway`, and configure a `StaticGatewayConfiguration` custom resource before enabling an Istio add-on egress gateway.

##### Quick Reference

The following is a brief summary of some common issues and whether they are due to the Istio egress gateway(s), Static Egress Gateway, or a customer misconfiguration:

- If Static Egress Gateway components in the `aks-static-egress-gateway` namespace are crashing or down, or if Istio egress pods are stuck in `containerCreating`, then this is most likely a [Static Egress Gateway error](#static-egress-gateway-errors-or-misconfiguration).
- If the Istio egress pods are ready, and the logs show `info    Envoy proxy is ready` then the Istio egress gateway itself is most likely healthy, and it would be advised to troubleshoot the [Static Egress Gateway](#static-egress-gateway-errors-or-misconfiguration) further.
- If there are any error logs in `istiod` or the Istio egress gateway pods, but the `StaticGatewayConfiguration` resource for the Istio egress gateway has an `egressIpPrefix` assigned to it and there are no other Static Egress Gateway errors, then this is most likely due to an [issue with an Istio component](#istio-egress-gateway-errors-and-misconfigurations).
- If all Istio components are ready and don't show any `error` logs, and Static Egress Gateway components are also healthy and the StaticGatewayConfiguration for the Istio egress gateway has an `egressIpPrefix` assigned, then the error could be due to a [customer misconfiguration of Istio custom resources](#istio-egress-gateway-errors-and-misconfigurations).
- If the Istio egress gateway is showing up in the ARM spec under `serviceMeshProfile.istio.components.egressGateways` and is `enabled`, but the Helm chart and components (Deployment, Service) are not showing up on the customer's cluster, then this could likely be due to a [Helm Reconciliation](#step-4-inspect-helm-reconciliation-status-for-the-istio-egress-gateway) error.

You can also find the ARM spec and status of each Istio egress gateway, as well as Helm Reconciliation errors for a given Istio egress gateway, on the Istio troubleshooting page on ASI:

![items.png](/.attachments/items-1c2ef30f-125d-40a1-9e37-b86c81da322e.png)

![items2.png](/.attachments/items2-15a87ae2-ea40-4377-a328-3d78c601ca13.png)

##### Networking and Firewall Errors

#### Step 1: Make sure no firewall or outbound traffic rules block egress traffic

If the customer is using Azure Firewall, Network Security Group (NSG) rules, or other outbound traffic restrictions, ensure that the IP ranges from the `egressIpPrefix` for the Istio add-on egress gateway `StaticGatewayConfigurations` are allowlisted for egress communication.

#### Step 2: Verify cluster CNI plugin

Because Static Egress Gateway is currently not supported on Azure CNI Pod Subnet clusters, the Istio add-on egress gateway isn't supported on Azure CNI Pod Subnet clusters either.

##### Egress Gateway Provisioning Issues

#### Step 1: Verify that the Istio egress gateway deployment and service are provisioned

Each Istio egress gateway should have a respective deployment and service provisioned. Verify that the Istio egress gateway deployment is ready. The name of the deployment will be in the following format: `<istio-egress-gateway-name>-<asm-revision>`. For instance, if the name of the egress gateway is `aks-istio-egressgateway` and the Istio add-on revision is `asm-1-24`, the name of the deployment will be `aks-istio-egressgateway-asm-1-24`.

```bash
kubectl get deployment $ISTIO_EGRESS_DEPLOYMENT_NAME -n $ISTIO_EGRESS_NAMESPACE
```

You should also see a service of type `ClusterIP` for the Istio egress gateway with a service VIP assigned. The name of the service will be the same as the name of the Istio egress gateway, without any `revision` appended. Ex: `aks-istio-egressgateway`.

```bash
kubectl get service $ISTIO_EGRESS_NAME -n $ISTIO_EGRESS_NAMESPACE
```

#### Step 2: Make sure admission controllers aren't blocking Istio egress provisioning

Because the Istio egress gateway can be deployed in user-managed namespaces, [AKS admissions enforcer](https://learn.microsoft.com/en-us/azure/aks/faq#can-admission-controller-webhooks-impact-kube-system-and-internal-aks-namespaces-) can't prevent custom admission controllers from affecting the Istio egress gateway deployment/namespace. Istio egress gateway provisioning errors due to custom admissions controllers should be visible in kube-audit logs.

#### Step 3: Verify that the Istio add-on egress gateway name is valid

Istio egress gateway names must be less than or equal to 63 characters in length, can only consist of lowercase alphanumerical characters, '.' and '-,' and must start and end with a lowercase alphanumerical character. Istio egress gateway names should also be valid DNS names. The regex used for Istio egress name validations is: `^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$`. If the name is an invalid Kubernetes Deployment/Service name, this can lead to [Helm reconciliation errors](#step-4-inspect-helm-reconciliation-status-for-the-istio-egress-gateway) for the egress gateway HelmRelease in the `ccp` namespace.

#### Step 4: Inspect Helm reconciliation status for the Istio egress gateway

If the Istio egress gateway is showing as `enabled` in the ARM spec of the AKS cluster under `properties.serviceMeshProfile.istio.components.egressGateways`, but the Helm chart and other resources still haven't been deployed on the AKS overlay cluster, then provisioning could be failing due to a [Helm reconciliaton error](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA32QzU7DMBCE7zzFKqdUilGCqqo9hAtC4ogEL2DswXGx42jXJC3i4UmqqiCBOO7ON7M%2FDwjxLvWZUwjg%2BxF9lqtPmjow6JFhvODZRzxlHQe6bUm7VDZ2dWHMxUxtS0U35zECtKC4ML2OIMmas0w%2Bd1Toj3eGEvDoDVSEdMpL9kkVlPgPXKLyvWOIKP0mZ%2FbccTpj0sd%2FrHAHtSyDQ0ZvyYbk2pzscYa9Kedq9S0aM3g7q5J5zi8X9noJlUEb%2FLh6wU4Hb7Z1vbEa2O7WzWtd181NszPrl2XgwGkPk3%2F9sTrtWVHAiFBRFFcRmBN%2FAVJB8XGOAQAA) for the Istio egress gateway `HelmRelease` in the CCP namespace.

The `HelmRelease` name for a given Istio egress gateway is in the following format: `asm-egx-<istio-egress-namespace>-<istio-egress-name>`. For instance, an Istio egress gateway with name `asm-istio-egressgateway` in namespace `aks-istio-egress` will have a `HelmRelease` with the name `asm-egx-aks-istio-egress-aks-istio-egressgateway`

If the "unique" or "real" name of the egress gateway (namespace + name) is above `53` characters, the `HelmRelease` name will have the following format: `asm-egx-` + first 15 characters of the realName, first 15 characters of the SHA of the realName, and then the last 15 characters of the realName. Ex: `asm-egx-istio-egress-n-6cae1407976aec9-gressgateway-1`.

You can also see the Helm reconciliation status for a given Istio egress gateway `HelmRelease` on the Istio troubleshooting page on ASI.

#### Step 5: Inspect Static Egress Gateway components if Istio egress deployments are not ready

If Static Egress Gateway components such as the `kube-egress-gateway-cni-manager` are crashing, or there are other issues with the static egress IP allocation, Istio egress gateway provisioning could fail. See the subsequent section on [Static Egress Gateway Errors](#static-egress-gateway-errors-or-misconfiguration) to troubleshoot the Static Egress Gateway and [inspect the `StaticGatewayConfiguration`](#step-2-make-sure-that-an-egressipprefix-has-been-provisioned-for-the-staticgatewayconfiguration).

##### Static Egress Gateway Errors or Misconfiguration

#### Step 1: Verify that the Istio egress gateway `StaticGatewayConfiguration` exists and is valid

Ensure that the `StaticGatewayConfiguration` for the Istio add-on egress gateway has a valid configuration and hasn't been deleted. To find the `StaticGatewayConfiguration` for an Istio add-on egress gateway, check the `gatewayConfigurationName` for that egress gateway:

```bash
az aks show -g $RESOURCE_GROUP -n $CLUSTER_NAME -o json | jq '.serviceMeshProfile.istio.components.egressGateways' | grep $ISITO_EGRESS_NAME -B1
```

You can also [use Kusto](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA3VRzWvCMBS%2F768IPVXISjtE9OBgeNjJITjYUZ7Ja81okpKX%2BsX%2B%2BMXaWaf1FPJ%2Bny%2BZg4EC5aysyaNbGqhoY%2F3TD9tt0CFbOBSK8FNpXHrQFXtlUNg4kwMGRjJxlq2UZNMpi0bjNB1JQBxPhlmepmn2kk3EcB0FP6q1BqeOyMAVKw37%2BNabM0K3VQLnSJuFs7kqcRCUlbPfKHwPGkDcewxFFL0da4fLjsKmTOV5rMhYj7ryh7jHvVnCW2V8D5poKwMlLJZx5l2NnOVQUtOpjRVWV9ag8RTiehwUeWWTjhWUevuM%2B%2BqUi4VDovevIO0YSTsFjzs4UBeFBtYlynatP21yGYfnP3WMeHc2baOrugY0BoOL%2BHT%2Fj1IF4o7SDDtece42syZXRe0grGg%2Bbpwfca6%2Bs23Om1zepfOHAb%2Fm70xTrAIAAA%3D%3D) to view the API spec for a specific egress gateway based on the `name` of the egress gateway.

Verify that the Istio add-on egress gateway pod spec has the `kubernetes.azure.com/static-gateway-configuration` annotation set to the `gatewayConfigurationName` for that Istio add-on egress gateway. This is to verify that the annotation is being applied as expected by the code and references the correct `StaticGatewayConfiguration` resource.

```bash
kubectl get pod $ISTIO_EGRESS_POD_NAME -n $ISTIO_EGRESS_NAMESPACE -o jsonpath={.metadata.annotations."kubernetes\.azure\.com\/static-gateway-configuration"}
```

#### Step 2: Make sure that an `egressIpPrefix` has been provisioned for the `StaticGatewayConfiguration`

If the Istio egress gateway pods are stuck in `ContainerCreating`, the `kube-egress-gateway-cni-manager` could be preventing the `istio-proxy` container from being created because the `StaticGatewayConfiguration` doesn't have an `egressIpPrefix` assigned to it yet. You can check the `status` of the `StaticGatewayConfiguration` for that Istio egress gateway to verify whether it has been assigned an `egressIpPrefix` and run `kubectl describe` against the `StaticGatewayConfiguration` to view if there are any errors with the `egressIpPrefix` provisioning. Note that it can take up to ~5 minutes for a Static Egress Gateway `StaticGatewayConfiguration` to be assigned an `egressIpPrefix`.

```bash
kubectl get staticgatewayconfiguration $ISTIO_SGC_NAME -n $ISTIO_EGRESS_NAMESPACE -o jsonpath='{.status.egressIpPrefix}'
kubectl describe staticgatewayconfiguration $ISTIO_SGC_NAME -n $ISTIO_EGRESS_NAMESPACE
```

You can also check the logs of the `kube-egress-gateway-cni-manager` pod running on the node of the failing Istio egress pod. If there are issues with `egressIpPrefix` provisioning or an IP prefix still hasn't been assigned after ~5 minutes, see the [Static Egress Gateway troubleshooting docs](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Feature-Specific/Static-Egress-Gateway-IP) to debug potential issues with the Static Egress Gateway.

#### Step 3: Make sure that the Istio egress gateway `StaticGatewayConfiguration` references a valid `gateway` agent pool

Verify that the `spec.gatewayNodepoolName` for the `StaticGatewayConfiguration` for each Istio egress gateway references a valid agent pool of mode: `Gateway` on the cluster. Users shouldn't delete a gateway agent pool if any Istio add-on egress gateway `StaticGatewayConfiguration` is referencing it via the `spec.gatewayNodepoolName`.

#### Step 4: Try sending an external request from the Istio egress gateway

To validate that requests from the egress gateway are being routed correctly via the Static Egress Gateway nodepool, you can use `kubectl debug` to create a Kubernetes ephemeral container and verify the source IP of requests from the Istio egress pod. Make sure that you temporarily set `outboundTrafficPolicy.mode` to `ALLOW_ANY` so that the egress gateway can access `ifconfig.me`. As a security best-practice, it's recommended to set `outboundTrafficPolicy.mode` back to `REGISTRY_ONLY` after debugging.

```bash
kubectl debug -it --image curlimages/curl $ISTIO_EGRESS_POD_NAME -n $ISTIO_EGRESS_NAMESPACE -- curl ifconfig.me
```

The source IP address returned in should match the `egressIpPrefix` of the `StaticGatewayConfiguration` associated with that Istio egress gateway. If the request fails or the source IP address returned doesn't match the `egressIpPrefix`, then you should try [restarting the Istio egress gateway deployment](#step-6-try-restarting-the-istio-egress-gateway-deployment) or debugging potential issues with [Static Egress Gateway](#step-8-debug-the-static-egress-gateway).

#### Step 5: Try sending a request from an uninjected pod to the external service

Another way to identify whether the the issue is due to the add-on Istio egress gateway or the Static Egress Gateway is to send a request directy from an uninjected pod (outside of the Istio mesh). You can use the [`curl` sample application](https://raw.githubusercontent.com/istio/istio/release-1.25/samples/curl/curl.yaml). Under `spec.template.metadata.annotations`, set the `kubernetes.azure.com/static-gateway-configuration` annotation to the same `gatewayConfigurationName` for the Istio add-on egress gateway.

If the requests from the uninjected pod fail, you should try debugging potential issues with [Static Egress Gateway](#step-8-debug-the-static-egress-gateway). If the requests from the uninjected pod succeed, try [verifying your Istio egress gateway configurations](#istio-egress-gateway-errors-and-misconfigurations).

#### Step 6: Try restarting the Istio egress gateway deployment

Updates to certain `StaticGatewayConfiguration` fields, such as `defaultRoute` and `excludeCidrs` require the Istio add-on egress gateway pods to be restarted for the changes to the `StaticGatewayConfiguration` take effect. You can bounce the pod by triggering a restart of the egress gateway deployment:

```bash
kubectl rollout restart deployment $ISTIO_EGRESS_DEPLOYMENT_NAME -n $ISTIO_EGRESS_NAMESPACE
```

#### Step 7: Try creating a new `StaticGatewayConfiguration` for the Istio add-on egress gateway

If there is an error with the `StaticGatewayConfiguration` for an Istio add-on egress gateway, you can try creating a new `StaticGatewayConfiguration` custom resource in the same namespace as the Istio add-on egress gateway, and run the `az aks mesh enable-egress-gateway` command to update the `gatewayConfigurationName` for the Istio egress gateway. It's recommended to wait until the newly created `StaticGatewayConfiguration` is assigned an `egressIpPrefix`.

```bash
az aks mesh enable-egress-gateway --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --istio-egressgateway-name $ISTIO_EGRESS_NAME --istio-egressgateway-namespace $ISTIO_EGRESS_NAMESPACE --gateway-configuration-name $NEW_ISTIO_SGC_NAME
```

After updating the egress gateway to use the new `StaticGatewayConfiguration`, you should be able to delete the previous `StaticGatewayConfiguration` provided that no other Istio add-on egress gateway is using it.

#### Step 8: Debug the Static Egress Gateway

If errors with egress routing through the Istio add-on egress gateway persist even after verifying that [Istio egress routing is configured correctly](#istio-egress-gateway-errors-and-misconfigurations), then it's possible that there is an underlying networking or infrastructure issue with the Static Egress Gateway. See the [Static Egress Gateway troubleshooting guide](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Feature-Specific/Static-Egress-Gateway-IP) for more information on how to debug Static Egress Gateway resources and infrastructure.

##### Istio Egress Gateway Errors and Misconfigurations

More information about Istio egress configuration can be found on the open source [Istio docs site](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/). Note that Gateway API is currently not supported for the Istio add-on egress gateway - users must use configure the gateway with Istio custom resources.

#### Step 1: Enable Envoy access logging

You can enable Envoy access logging via the [Istio MeshConfig](https://learn.microsoft.com/en-us/azure/aks/istio-meshconfig) or [Telemetry API](https://learn.microsoft.com/en-us/azure/aks/istio-telemetry) to inspect traffic flowing through the egress gateway.

#### Step 2: Inspect Istio egress gateway and istiod logs

You should inspect the logs in the `istio-proxy` container for the Istio add-on egress gateway:

```bash
kubectl logs $ISTIO_EGRESS_POD_NAME -n $ISTIO_EGRESS_NAMESPACE
```

If you see `info    Envoy proxy is ready` in the logs, then the Istio egress gateway pod is able to communicate with Istiod and ready to serve traffic. It's also worth inspecting the `istiod` control plane logs to see if there are any Envoy `xDS` errors related to updating the configuration of the Istio egress gateway.

#### Step 3: Validate the Istio `Gateway` configuration

Ensure that the `selector` in the `Gateway` custom resource is properly set. For instance, if your `Gateway` object for the Istio egress gateway uses the `istio:` selector, then it must match the value of the `istio` label in the Kubernetes service spec for that egress gateway.

For instance, for an egress gateway with the following Kubernetes service spec:

```bash
apiVersion: v1
kind: Service
metadata:
  annotations:
    meta.helm.sh/release-name: asm-egx-asm-egress-test
    meta.helm.sh/release-namespace: istio-egress-ns
  creationTimestamp: "2025-04-19T21:50:08Z"
  labels:
    app: asm-egress-test
    azureservicemesh/istio.component: egress-gateway
    istio: asm-egress-test
```

The `Gateway` should be configured as follows:

```bash
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: istio-egressgateway
spec:
  selector:
    istio: asm-egress-test
```

#### Step 4: Ensure that a `ServiceEntry` has been created and has DNS resolution enabled

Ensure that a `ServiceEntry` custom resource has been created for the specific external service that that the egress gateway is forwarding requests to. Creating a `ServiceEntry` may be necessary even if the `outboundTrafficPolicy.mode` is set to `ALLOW_ANY`, since the `Gateway`, `VirtualService`, and `DestinationRule` custom resources may reference an external host via a `ServiceEntry` name.

Additionally, verify that the `ServiceEntry` being used by the Istio egress gateway has the `spec.resolution` set to `DNS`.

#### Step 5: Verify the Kubernetes secret namespace for for egress gateway mTLS origination

If the user is trying to configure the Istio egress gateway to perform mutual TLS origination, ensure that the Kubernetes secret object is in the same namespace that the egress gateway is deployed in.

#### Step 6: Ensure that applications are sending plaintext HTTP requests for Egress Gateway TLS origination and Authorization Policies

To originate TLS and to apply Authorization Policies at the egress gateway, workloads in the mesh must send HTTP requests. The sidecar proxies can then use mTLS when forwarding requests to the egress gateway, and the egress gateway will terminate the mTLS connection and originate a simple TLS / HTTPS connection to the destination host.

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-a-Managed-Istio.md | 适用: 适用范围未明确

### 排查步骤

Istio TSGs in the Azure Containers Team wiki can be found [under the Networking folder in the AKS TSG section](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Managed-Istio.md).

---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-a-Managed-NAT-Gateway.md | 适用: 适用范围未明确

### 排查步骤

##### Kusto Logs

Check `AsyncContextActivity` for error messages

Example:

```txt
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1d)
| where msg contains "NATGateway"
| where subscriptionID == "{Sub_ID}"
```

##### Possible Error Messages

These are error messages from the code that may show in Kusto. It is broken down by what may be a customer side issue, or what should be escalated to the NAT GW team.

- Customer Error (GA features)
  - NAT gateway %q does not exist in resource group %q in subscription %q
  - existing NAT gateway %q is not Standard SKU
  - existing NAT gateway %q is not regional NAT gateway (current zones: %q)
  - existing NAT gateway %q location %q is different to expected location %q
  - NAT gateway %q does not exist in resource group %q in subscription %q. Goal not achieved.
  - NAT gateway %q has one or more public IP prefixes associated. Goal not achieved.
  - NAT gateway %q has zero public IP address associated. Goal not achieved.
  - NAT gateway %q has %d public IP addresses associated but expect %d. Goal not achieved.
  - NAT gateway %q is not associated to managed outbound IP %q. Goal not achieved.
- Move to NAT GW team
  - EnsureManagedOutboundIPs returned IP without ID
  - EnsureManagedOutboundIPs returned IP without PublicIPAddressPropertiesFormat or IPAddress
  - EnsureManagedOutboundIPs returned IP without ID)
  - EnsureManagedOutboundIPs returned ResourceGroupNotFound error, will try again.
  - EnsureManagedOutboundIPs returned SubscriptionNotRegistered error, will try again.
  - NAT gateway %q does not have NatGatewayPropertiesFormat. Goal not achieved.
  - NAT gateway %q provisioning state is not Succeeded. Goal not achieved.
  - NAT gateway %q has nil IdleTimeoutInMinutes. Goal not achieved.
  - NAT gateway %q has IdleTimeoutInMinutes %d but goal is %d. Goal not achieved.
  - existing NAT gateway %q is not in terminating state, current state %q

##### NAT Gateway Metrics (SNAT)

[Jarvis Dashboard](https://portal.microsoftgeneva.com/dashboard/slbv2stage/ManagedNat/ManagedNat%2520Metrics)
Lookup the `NatGatewayId` from NAT gateway JSON view

##### Customer questions to ask

- Have you modified NSG rules within the AKS VNET?
- Have you made or attempted to make modification to the outbound type definition for the Kubernetes cluster?
- Have you made any modifications to the Managed NAT Gateway that has been created as part of this process?

---

## Scenario 5: Managed Gateway API Installation
> 来源: ado-wiki-a-kubernetes-managed-gateway-api.md | 适用: 适用范围未明确

### 排查步骤

#### Managed Gateway API Installation

#### Overview

The Managed Gateway API installation allows users to opt into managed CRDs for networking and routing. It provides automatic patch upgrades, bundle version upgrades across K8s versions, and guaranteed support. Users must enable a managed Gateway-based ingress addon (Istio or AGC) alongside it.

Configuration field: `properties.ingressProfile.gatewayAPI.installation` (values: `Disabled`, `Standard`)

#### Components

##### Frontend Validation

**Prerequisites checked:**
- Valid enum for installation field
- K8s version supports Gateway API
- At least one managed Gateway-based ingress addon enabled (Istio or AGC)
- Existing Gateway API installation matches expected bundle version and Standard channel

**K8s-to-Gateway version map**: `ccp/managed-gateway-installation/pkg/version_map.go`

##### Common Frontend Failures

#### Failures Generating Expected CRDs
- Likely a tag mismatch between RP frontend validation and synthesizer code
- RP Frontend imports logic from the managed gateway synthesizer as a go package
- If synthesizer map is updated without updating RP tag, RP expects wrong Gateway version
- Check: tag for `go.goms.io/aks/rp/ccp/managed-gateway-installation/pkg` in `resourceprovider/server/go.mod`

#### Failures Retrieving Actual CRDs from Customer Cluster
- Issues with K8s client or CRD retrieval from overlay cluster
- Engage Cluster CRUD team (they own the frontend validation framework)

##### OverlayMgr + CCP Webhooks

Logs:
- `OverlaymgrEvents` for OverlayMgr logs
- CCP Webhooks: query akshuba cluster for webhook-related logs

#### Upgrade Policy

See version map at `ccp/managed-gateway-installation/pkg/version_map.go` and [public docs](https://learn.microsoft.com/en-us/azure/aks/managed-gateway-api#gateway-api-bundle-version-and-aks-kubernetes-version-mapping) for K8s version to Gateway bundle version mapping.

---

## Scenario 6: TSG Diagnosing Application-Induced Latency with Istio access logs on AKS
> 来源: ado-wiki-a-tsg-diagnosing-istio-latency.md | 适用: 适用范围未明确

### 排查步骤

#### TSG Diagnosing Application-Induced Latency with Istio access logs on AKS

#### Purpose

This Troubleshooting Guide (TSG) explains how to **identify the source of request latency** when a customer is using **Istio Service Mesh on AKS**.
The goal is to determine whether a perceived delay is introduced by:

- The **Istio ingress gateway**
- The **Istio sidecar (Envoy proxy)**
- Or the **application itself**

The guide relies on **Istio Envoy access logs** and demonstrates how to interpret key timing fields to precisely locate where latency is introduced.

#### Scenario Overview

- AKS configured with **managed Istio (ASM 1.26)**.
- Custom NGINX-based application deployed with artificial delay capability.
- Requests sent through **external Istio ingress gateway**.

#### 1. Enable Istio Service Mesh on AKS

```bash
az aks mesh enable --resource-group rg1 --name aks1
az aks mesh enable-ingress-gateway --resource-group rg1 --name aks1 --ingress-gateway-type external
```

#### 2. Deploy Test Application

Deploy with Gateway + VirtualService (see source wiki for full YAML).

#### 3. Enable Envoy Access Logs

Create ConfigMap in `aks-istio-system` namespace:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-shared-configmap-asm-1-26
  namespace: aks-istio-system
data:
  mesh: |-
    accessLogFile: /dev/stdout
```

#### 4. Inspect Relevant Logs

##### Ingress Gateway Logs
```bash
kubectl logs -n aks-istio-ingress -l app.kubernetes.io/instance=asm-igx-aks-istio-ingressgateway-external -f
```

##### Application Sidecar Logs
```bash
kubectl logs demo-app-<pod-id> -c istio-proxy -f
```

#### 5. Key Access Log Fields

| Field | Meaning |
|-------|---------|
| `%DURATION%` | Total request duration observed by the proxy (ms) |
| `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%` | Time spent by upstream service processing the request (ms) |

#### 6. Interpretation

- If ingress `%DURATION%` matches sidecar `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%` closely, **latency is application-induced**.
- If there is a large gap, investigate Istio/network path.
- Envoy overhead is typically ~1 ms.

#### Key Takeaways

- **Envoy access logs are authoritative** for latency attribution in Istio.
- Always compare ingress `%DURATION%` with sidecar `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%`.
- If both match closely, **Istio is not the issue**.
- This method provides **data-driven proof** when engaging application owners.

---

## Scenario 7: APIM Backend TLS Trust Failures When Using AKS Ingress
> 来源: ado-wiki-b-apim-backend-tls-trust-failures.md | 适用: 适用范围未明确

### 排查步骤

#### APIM Backend TLS Trust Failures When Using AKS Ingress

#### Summary

Azure API Management (APIM) fails to call an AKS-hosted backend service due to a TLS certificate trust error. This typically surfaces as a 500 BackendConnectionFailure or Could not establish trust relationship error in APIM diagnostic logs. While APIM documentation covers this from the gateway's perspective, the root cause is frequently inside the AKS cluster in the ingress controller configuration, the TLS secret, or the certificate issuance pipeline. This guide covers all three major AKS ingress patterns: Nginx community (Helm), App Routing add-on (managed), and AGIC.

#### Reported and Observed Symptoms

The following errors appear in APIM diagnostic logs or the Test console in the Azure portal:

```bash
BackendConnectionFailure: The underlying connection was closed: Could not establish trust relationship for the SSL/TLS secure channel.
BackendConnectionFailure: The remote certificate is invalid according to the validation procedure.
BackendConnectionFailure: The remote certificate has a name mismatch.
```

Additional observable signals:
* APIM returns HTTP 500 to the caller with no response body from the backend.
* The backend service works correctly when called directly (e.g. via curl or Postman) but fails only through APIM.
* The issue is consistent and not intermittent.

Note: If the error is ConnectionRefused or a DNS resolution failure, this is a network/DNS issue, not a TLS trust issue.

#### Environment Details to Collect

* APIM tier and VNet integration mode (External, Internal, or none).
* AKS version and node pool OS (Linux or Windows).
* Ingress controller type: Nginx community (Helm), App Routing add-on, or AGIC.
* Certificate source: cert-manager (Let's Encrypt or internal CA), Azure Key Vault, or manually managed secret.
* Backend URL configured in APIM Settings > Backend > URL

Useful kubectl commands:
```bash
kubectl get ingress -A -o wide
kubectl get certificate -A
kubectl get secret <tls-secret-name> -n <namespace> -o jsonpath='{.data.tls\.crt}'| base64 -d | openssl x509 -noout -text
```

#### Root Cause Categories

##### 1. Certificate Not Trusted by APIM
APIM validates backend certificates against its built-in trusted root CA store (Windows OS trust store).
- Self-signed certificate on the ingress
- Internal PKI / corporate root CA not present in APIM's trust store
- Incomplete certificate chain (intermediate CA not included in TLS secret)

##### 2. Certificate Subject Name Mismatch
APIM performs hostname validation. The hostname in the backend URL must appear as a SAN in the certificate.
- Ingress hostname does not match backend URL configured in APIM
- Certificate has CN but no SAN (rejected by modern TLS stacks)
- Wildcard certificate scope mismatch

##### 3. Ingress Serving Nginx Default Self-Signed Certificate
When Nginx ingress controller cannot find a valid TLS secret, it falls back to its built-in "Kubernetes Ingress Controller Fake Certificate".
- TLS secret name mismatch in ingress spec
- Secret in different namespace than ingress resource
- cert-manager has not yet issued the certificate (Certificate object not Ready)
- App Routing add-on has not synced certificate from Azure Key Vault

##### 4. Certificate Expired or Not Yet Renewed
- cert-manager renewal failed (ACME challenge not completing)
- AKV certificate rotation not propagating to ingress controller
- Manually managed TLS secret not updated after expiry

#### Mitigation Steps

##### Step 1: Confirm the Certificate Being Served

From outside the cluster:
```bash
openssl s_client -connect <ingress-hostname>:443 -servername <hostname> -showcerts 2>/dev/null | openssl x509 -noout -text
```

From inside the cluster (debug pod):
```bash
kubectl run debug-tls --image=alpine/openssl --restart=Never -it --rm -- openssl s_client -connect <service>.<namespace>.svc.cluster.local:443 -servername <hostname>
```

Verify: Subject CN, SANs, Issuer, validity dates, and chain completeness.

##### Step 2: Fix by Ingress Type

**Nginx Community (Helm):**
- Verify TLS secret reference matches existing secret in same namespace
- Check cert-manager Certificate object status (Ready: True)
- Check certificate chain order: leaf > intermediate > root

**App Routing Add-on (Managed Nginx):**
- Verify annotation kubernetes.azure.com/tls-cert-keyvault-uri on ingress
- Check managed identity has Key Vault Secrets User or Certificate User role
- Check sync status and controller logs in app-routing-system namespace

**AGIC (Application Gateway Ingress Controller):**
- Verify listener certificate in App Gateway portal (not expired, correct SANs)
- For end-to-end TLS, check backend health: az network application-gateway show-backend-health
- Verify "Use well known CA certificate" or trusted root CA in backend HTTP settings

##### Step 3: Resolution Options

**Option A - Fix the certificate (preferred):**
- Replace with publicly trusted certificate (Let's Encrypt via cert-manager, DigiCert/Sectigo in AKV)
- Ensure correct SAN for the hostname APIM is calling
- Ensure full chain (leaf + intermediates) in TLS secret

**Option B - Upload CA certificate to APIM (workaround):**
APIM > Security > CA Certificates > Upload root CA. Enable custom CA on backend.
Note: Does not bypass hostname/SAN validation.

**Option C - Disable certificate validation (dev/test only):**
Never recommend for production workloads.

Note: Nginx community ingress reached end-of-life in March 2026. App Routing managed Nginx is on critical-patch-only support until November 2026. Consider migration to Gateway API (Istio).

---

## Scenario 8: Troubleshooting Flow
> 来源: ado-wiki-c-E2E-TLS-AppGW-to-AKS-Certificate-Chain.md | 适用: 适用范围未明确

### 排查步骤

##### Scenario 1

If cx has provided certificate bundle in PFX format. Extract RootCA, Intermediate CA,  Server Certificate and Server Certificate private key from PFX cert and validate the Server Certificate with Intermediate CA. We can find many different ways to extract certs from PFX file in external source; the steps at <https://www.getfilecloud.com/supportdocs/display/cloud/Converting+Existing+PFX+SSL+Certificate+to+PEM+SSL+Certificate> look to be valid. I haven t tried this in my current issue as cx is using individual certs instead of PFX cert bundle.

After extracting individual certs, below steps can be followed to create a certificate bundle in pem format.

##### Scenario 2

If cx has provided with individual certs like RootCA, Intermediate CA,  Server Certificate and Server Certificate private key. Follow below steps to create a cert bundle in pem format to configure in nginx ingress.

1. Using the individual cert components of:
   <!-- markdownlint-disable MD034 -->

   - ca.cert.pem
   - intermediate.cert.pem
   - www.example.com.cert.pem07
   - www.example.com.key.pem07

   <!-- markdownlint-enable MD034 -->

2. Merge the CA certs (root and intermediate) to create a single CA cert bundle: `cat intermediate.cert.pem ca.cert.pem >> cacert.pem`
3. Verify the above created chain CA cert for issuers in order:

   ```bash
   openssl crl2pkcs7 -nocrl -certfile cacert.pem  | openssl pkcs7 -print_certs -noout

   subject=C = IN, ST = TNG, O = Testing, OU = Testing CA, CN = Intermediate CA
   issuer=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA

   subject=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA
   issuer=C = IN, ST = TNG, L = HYD, O = Testing, OU = Testing CA, CN = Root CA
   ```

4. Created an PFX cert:

   ```bash
   openssl pkcs12 -export -out ingress07.pfx -inkey www.example.com.key.pem07 -in www.example.com.cert.pem07  -certfile cacert.pem
   Enter Export Password:
   Verifying - Enter Export Password:

   # ls
   ca.cert.pem  cacert.pem  ingress07.pfx  intermediate.cert.pem  www.example.com.cert.pem07  www.example.com.key.pem07
   ```

5. View the contents of PFX file: `openssl pkcs12 -info -in ingress07.pfx`
6. Convert the PFX to Pem file:

   ```bash
   openssl pkcs12 -in ingress07.pfx -out server_ingress07.pem -nodes
   Enter Import Password:
   ```

7. View contents of pem file: `openssl x509 -in server_ingress07.pem -text`
8. Created below Kubernetes secreted with above created pem file and Server key:

   ```bash
   kubectl create secret tls  ingress07 --cert=server_ingress07.pem --key=www.example.com.key.pem07
   secret/ingress07 created
   ```

9. Created below nginx ingress route:

   ```bash
   ; kubectl get ing ingress07
   NAME        CLASS    HOSTS                 ADDRESS     PORTS     AGE
   ingress07   <none>   ingress07.nginx.com   10.0.0.97   80, 443   2m29s

   ; cat nginx-ing07.yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress07
     annotations:
       kubernetes.io/ingress.class: nginx
       nginx.ingress.kubernetes.io/ssl-redirect: "false"
       #    nginx.ingress.kubernetes.io/rewrite-target: /$2
   spec:
     tls:
      - secretName: ingress07
        hosts:
         - ingress07.nginx.com
     rules:
     - host: ingress07.nginx.com
       http:
         paths:
         - backend:
             serviceName: nginx
             servicePort: 80
           path: /
   ```

10. Successfully verified the access to above ingress route from a sample busybox pod:

   ```bash
   kubectl exec -it busybox-delete01 /bin/bash
   curl https://ingress07.nginx.com --cacert /tmp/cacert.pem
   ```

With above steps, setup at AKS nginx ingress and validation has been completed. Now need to focus on configuring cert at APP GW http setting.

---

## Scenario 9: Troubleshooting Flow
> 来源: ado-wiki-c-Scheduler-Customization-kube-scheduler.md | 适用: 适用范围未明确

### 排查步骤

##### Pod in CrashLoopBackOff state

A lot of different issues may cause the kube-scheduler Pod to enter a crash loop. Use the kube-scheduler Dashboard to examine the logs of crashed containers and identify the specific error message described below.

##### `broadcaster already stopped`

This is a benign error that is raised whenever kube-scheduler is shutting down. You can safely ignore this error.

If you are investigating the cause of a container crash, there should be other errors before this one. If there are no other errors, the kube-scheduler Pod was probably terminated by Kubernetes and the reason for the termination can be found in the Container Snapshot in the kube-scheduler Dashboard.

##### `certificate has expired or is not yet valid`

This is a Control Plane issue. Follow the _Control Plane Certificate Expired_ TSG.

##### `connection refused`, `context canceled`, `context deadline exceeded`, or `i/o timeout`

This is a common error that is raised when kube-scheduler is unable to talk with the API Server.

If you find this error after a Create or Update operation, it's likely a transient error that will go away when the cluster finishes reconciling.

We have also seen this error when we have network problems in the Underlay. Check the status of Underlay Nodes that contain API Server and kube-scheduler Pods. Also verify the cluster's overall health, as other components are likely affected.

Another possibility is that the API Server is overwhelmed. Check related Dashboards and TSGs.

##### `Leaderelection lost`

This is a benign error, another kube-scheduler replica should've become the active replica.

##### `namespaces ... not found` or `unable to create new content in namespace ... because it is being terminated`

This error indicates that kube-scheduler has tried to schedule a Pod in a Namespace that has been deleted by the customer. No action needs to be taken.

##### `no nodes available to schedule pods`

The cluster has no schedulable Nodes. Check the Managed Cluster dashboard, it's likely that the cluster is in a bad state. Note that this may be caused by customer actions such as applying taints or cordoning nodes.

##### `pods ... not found`

This error indicates that kube-scheduler has tried to schedule a Pod that the user has deleted. No action needs to be taken.

##### `unexpected field ..., remove it or turn on the feature gate ...`

This error occurs when kube-scheduler is given some configuration containing some feature not enabled for that particular version of the scheduler.

This is only expected on clusters with _User-Provided Scheduler Configuration_ enabled and when a customer enters some bad configuration for kube-scheduler. Check the _Scheduler Profile Config Mode_ for kube-scheduler in its dashboard, it should be `ManagedByCRD` when that feature is enabled. If that's the case, SchedulerCtrl should rollback the bad configuration and no manual intervention is required. Note that the customer may be trying different configurations and this is causing this error to reappear, take a look at the SchedulerCtrl dashboard and TSG for more details.

If you are seeing this but the _Scheduler Profile Config Mode_ for kube-scheduler is `Default`, there's something wrong with the base configuration of kube-scheduler. We had an outage related to this before, where the kube-scheduler configuration was changed in a way making it incompatible with older clusters. Note that if this is the case, multiple clusters will be impacted by the problem. Take a look if there was some recent change to the configuration in <https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/control-plane-core/charts/kube-control-plane/charts/kube-scheduler> or <https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/control-plane-core/helmvalues/helmvalues_scheduler.go> and immediately escalate via ICM if you have identified that this is the cause of the issue.

##### SchedulerConfiguration in Terminating state

SchedulerConfigurations have a finalizer that only gets removed when the scheduler is returned to its default state and is healthy. If a SchedulerConfiguration is stuck in the _Terminating_ state, look at the SchedulerCtrl logs for more information.

As a last resort, make sure the scheduler is healthy and manually edit the SchedulerConfiguration and remove the `schedulerconfigurations.aks.azure.com/finalizer` finalizer from it and contact the Serverless SIG for RCA. DO NOT disable the _User-Defined Scheduler Configuration_ feature in the cluster before addressing this issue, as it may result in the cluster getting stuck in the _Updating_ provisioning state.

##### `admission webhook "vschedulerconfiguration.kb.io" denied the request`

The SchedulerCtrl webhook refused the configuration. This error is accompanied by the reason for the refusal. If you are sure the configuration is valid, the validation can be bypassed by deleting the _aks-schedulerctrl_ ValidatingWebhookConfiguration and reappling the SchedulerConfiguration in question. Note that this will prevent the user from receiving instant feedback on the configuration being applied and that the ValidatingWebhookConfiguration object will be reapplied on the next cluster reconciliation. File a repair item for the Serverless SIG to take a better look at the issue.

##### `condition is not met: (corev1.Pod).Status.ContainerStatuses[].Ready`

This indicates that the scheduler containers didn't become ready right away. The operation will be retried until all containers are ready or until it reaches some unrecoverable state. No action needs to be taken at this point.

##### `Operation cannot be fulfilled on schedulerconfigurations.aks.azure.com ...: the object has been modified; please apply your changes to the latest version and try again`

This error usually indicates that the user has changed the SchedulerConfiguration object while the controller was reconciling it. That's not a harmful operation and the controller will handle that accordingly. There's no action that should be taken.

##### `unhealthy container: (corev1.Pod).Status.ContainerStatuses[].State.Waiting.Reason == "CrashLoopBackOff"`

The configuration provided for the scheduler made it unhealthy too many times, making the pod enter a _CrashLoopBackOff_ state. Instruct the customer to take a look at the scheduler logs to identify the specific problem. SchedulerCtrl will reapply the last known good scheduler configuration as a remediation for this issue. Use the SchedulerCtrl dashboard to confirm that.

---

## Scenario 10: Troubleshooting Flow
> 来源: ado-wiki-c-Secure-TLS-Bootstrapping.md | 适用: 适用范围未明确

### 排查步骤

During phase 1 of the rollout process, bootstrap tokens will still be available to bootstrapping kubelets as a fallback mechanism if secure TLS bootstrapping doesn't end up working for any reason. In terms of customer impact, within this failure mode, some extra time (on the order of a couple minutes) will be added to the amount of time it takes the node to register with the API server _after_ CSE has succeeded.

However, once we've moved on to phase 2 where bootstrap tokens are no longer installed into running control planes, if secure TLS bootstrapping fails then nodes won't be able to join the cluster. This will obviously manifest as missing node objects from the perspective of kube-apiserver + etcd (`kubectl get nodes`).

The following section lays out the most common reasons why secure TLS bootstrapping might be failing in any case (whether that be during phase 1 or phase 2 rollout), as well as how to identify and troubleshoot each particular failure mode.

##### Common Failure Modes

#### Failure to Deploy CCP Plugin `secure-tls-bootstrap`

When everything is working as expected, a deployment object named `secure-tls-bootstrap-server` is deployed to the customer cluster's CCP namespace running on the given cx-underlay. This deployment is deployed via the ccp-plugin V2 framework, and thus is installed into the CCP via the HelmController running on the particular cx-underlay.

__NOTE: migration is currently underway to make it such that addons and ccp-plugins, such as `secure-tls-bootstrap`, are deployed to the CCP via Eno rather than Helm.__

__NOTE: the name of the deployment object deployed to the CCP is `secure-tls-bootstrap-server`, though the name of the CCP plugin itself is `secure-tls-bootstrap`.__

To check whether a given CCP actually has the bootstrap server deployment object installed, you can gain access to the cx-underlay on which the customer's cluster is running via `hcpdebug` and list the deployment objects like so:

```bash
$ kubectl config set-context --current --namespace=68a4acc44104df0001ddc187

$ kubectl get deploy
NAME                                                              READY   UP-TO-DATE   AVAILABLE   AGE
68a4acc44104df0001ddc187-etcd-etcd-operator-cameissebld13434214   1/1     1            1           39m
admissionsenforcer                                                1/1     1            1           39m
ccp-webhook                                                       2/2     2            2           39m
cloud-controller-manager                                          1/1     1            1           37m
csi-azuredisk-controller                                          1/1     1            1           39m
csi-azurefile-controller                                          1/1     1            1           39m
csi-snapshot-controller                                           1/1     1            1           39m
customer-net-probe                                                1/1     1            1           39m
eno-reconciler                                                    1/1     1            1           38m
etcd-68a4acc44104df0001ddc187-backup-sidecar                      1/1     1            1           39m
eventlogger                                                       1/1     1            1           35m
konnectivity-svr                                                  2/2     2            2           39m
kube-addon-manager                                                1/1     1            1           39m
kube-api-proxy                                                    2/2     2            2           37m
kube-apiserver                                                    2/2     2            2           39m
kube-controller-manager-v2                                        1/1     1            1           37m
kube-scheduler-v2                                                 1/1     1            1           37m
kube-state-metrics                                                1/1     1            1           39m
kubelet-serving-csr-approver                                      2/2     2            2           38m
medbay                                                            1/1     1            1           38m
prometheus-server                                                 1/1     1            1           35m
remediator                                                        1/1     1            1           35m
secure-tls-bootstrap-server                                       2/2     2            2           37m
tattler                                                           1/1     1            1           38m
telemetryexporter                                                 1/1     1            1           35m
vmagent-autoscaler                                                1/1     1            1           35m
```

You should see a `secure-tls-bootstrap-server` deployment running within the CCP namespace, with 2 `READY` replicas.

If you can't / don't want to manually access the CCP namespace to check whether the bootstrap server has been installed, or if you see that the particular CCP namespace you're working with doesn't have the bootstrap server installed, you can confirm whether Overlaymgr tried to install it through the following [query](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA2WPzUrDQBSF9z7FJSuFKU1KjbioUDQLQTTU%2BgA3Myfp6PyEmWuk4MMbFbrp9vCdw3deJiTHRz%2BkZkKQfPFNXwckUJugbcbeerwK%2B5HuiId4WZmrE%2BLzQDoGYRsyFRn6M2EhLi%2B6GCVL4rE4sdbQZkNFXfcMXoOrtcFNWZZVf1uvurqg5ZJ2Tfu0vW%2FmzpjiO7ScSShymOAU9dbhmT0U7do9AgdRFEckFhvD44Oit2D%2Bjv1D1qhf23k5pjmn7nj%2BzyDrGRD%2BAK2ufwDLdP8MGAEAAA%3D%3D):

```sql
OverlaymgrEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "secure-tls-bootstrap"
| where id == "68a3899ccc76eb000148ba3d" // REPLACE
| project PreciseTimeStamp, level, fileName, RPTenant, operationID, UnderlayName, id, msg
| order by PreciseTimeStamp desc
| take 25
```

Output like the following indicates that Overlaymgr tried to install the secure-tls-bootstrap plugin into the particular CCP via creating an adapter chart helm release:

![image.png](/doc/images/node-lifecycle/overlaymgrevents-stls.png)

#### Server-side Bootstrapping Failures

Failures on the server side can result from a large number of failure modes. Regardless, the CCP drill-down pages on the [dashboard](https://dataexplorer.azure.com/dashboards/a0ec6c25-7532-4ffb-9f35-087acd0eccad?p-_startTime=3days&p-_endTime=now&p-_bin_by_time=v-3h&p-_namespace=all#93b5a949-9962-4581-ac6f-28f03160a4b4) will be helpful for investigating failures for individual clusters.

The most straightforward way to debug server-side failures would be to query the corresponding Kusto tables. See the above section on [server-side Kusto tables](#server-side-kusto-tables) to start. Below are some example queries using the aforementioned tables to surface individual bootstrapping failures.

##### Issuer Certificate Refresh Failures

One particular failure mode worth mentioning on the server-side involves the inability to refresh Azure PKI Issuer certificates from the GetIssuers API of [dSMS](https://aka.ms/dsms). Any time the bootstrap server fulfills a GetCredential RPC from a bootstrapping client, the attested data blob presented by the client is validated against this set of PKI Issuer certificates to ensure that the certificate used to sign the blob was indeed issued by one of these Issuer certificates, specifically for a subdomain of IMDS (the instance metadata service). These certificates are already cached on AKS cx-underlay nodes for the bootstrap server's consumption, and are very rarely rotated/updated. However, if at any given point in time the bootstrap server encounters an attested data blob signed by an unknown authority, it will attempt to refresh its set of in-memory Issuer certificates by making a call to GetIssuers API of dSMS. If this API itself is experiencing issues, meaning the bootstrap server receives too many 5XX errors from these API calls, then a new incident should be cut to the dSMS/Triage ICM queue. The [AKS partner escalation dependency doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/9011/AKS-Partner-Dependency-Escalation-Path?anchor=who%27s-who) has been updated to reflect this. Otherwise, if the errors are 4XX, or there are errors related to updating the in-memory cache of Issuer certificates, intervention could be required to bounce the bootstrap server pods and then reconcile the agent pool - agent pools can be reconciled (reimaged) even if it's already on the latest node image version by performing a node-image-only upgrade, such as: `az aks nodepool upgrade ... --node-image-only`.

If the bootstrap server receives too many GetCredential RPCs where the bootstrapping client presents attested data that has been signed by an unknown authority, it's also possible we'll hit a rate limit. The bootstrap server implements a 24-hour rate limit for these operations, as to not accidentally DoS the GetIssuers API assuming a bad actor is attempting to join malicious nodes to the particular cluster's control plane. If you should ever see GetCredential failures caused by issuer certificate refresh rate limit exceeded errors, this could be indicative of an IMDS issue. However, it's somewhat difficult to confirm this for sure. These types of failures could also be indicative of a legitimately bad actor attempting to present self-signed or malicious CA-signed attested data to the bootstrap server. This likely won't be the case, though it's worth noting that this is a possibility. If this is indeed an IMDS issue rather than an attempted node spoof, it's likely the case that you'd see this type of failure across many different bootstrap server instances in many different clusters around the same time. If this is the case, it's probably worth RA'ing the IMDS on-call DRI at that point for assistance. If you're only seeing this issue in one particular cluster, feel free to RA the feature owners for more assistance.

##### Example Queries

Using `SecureTLSBootstrapServer` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSccplogs?query=H4sIAAAAAAAAA32OwUoDMRRF937Fc1YKgc44OthFBbVdDBQpTn8gJLdtZJIXXtJx48eboaALwd29F855b4A5C%2Fbb4YU5pyw6DpAJcvVFnycIaCcwLmHvPIasfaQn0ke%2BaewtLRb0vtltn1835A4UAAv7wwXtkaI2oNWKqu5xibbRXXOPzti6rpu2fejultX%2FkhETRrouAhcOXJU9Cn%2FA5D9vqd%2BDiiJbdWEV%2BXRUZEaHkPuyZgR9SYLEZzGYc%2BAwc5Ofy4lTfisyRUUX%2BnWBpGj79TdmU4GRLAEAAA%3D%3D) for any and all errors encountered within a particular namespace:

```sql
SecureTLSBootstrapServer
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where level != "info"
| project PreciseTimeStamp, namespace, pod, level, msg, clientId, tenantId, resourceId, nonce, vmId, hostName, spanID, traceID
```

Using `CtxLog` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA33NvQ6CMBhG4d2r%2BGTSgdCKEhkwMQQTE6JEvYHaviIRKGkrOnjx%2FgyMXsBzTuqeuS5HL3pcYUCFgawsTlWDoxNNRysSpZ5wNaUgoENW5Os0o%2BpCLaCgBid160TVwlCSkGch7wa%2Bq61%2F1tpZZ0TnW5gexhtIKxrYTkj8SLSMEXIR8TkiqRhjPAwX0Sz2%2Fn9r9Khp%2FAlsd5v9N%2B7EDcQZewOZ6gai2QAAAA%3D%3D) for all gRPC request contexts which encountered an error:

```sql
CtxLog
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where container == "secure-tls-bootstrap-server"
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where level != "INFO"
| take 100
```

Using `OutgoingRequestTrace` to [query](https://dataexplorer.azure.com/clusters/akshuba.centralus/databases/AKSprod?query=H4sIAAAAAAAAA33PwWrCQBDG8XufYppTewjumjbUg4JIoAehYn2B6e7XuGh2487EXnx4rRR7KPQ6fD%2F%2BzNugbQqxXeMwQHST2eHuRF9bZNAqwwXBJnR4V%2B56mhG36cH6RxqNaN2slvNFQ%2BGTIuDhb86lqBwiMk2nVAjckFHqXsqPlFQ0c18K8hG5uJHIHaS%2FxK%2BkfpmgslzbJ9TOG2NsVT3X40nxf7eT9spfVfufh5rofyOirIMskgfdX2ZjYwri6P%2Fe7bdR3oGsMWfxFfQFIwEAAA%3D%3D) for all failed outgoing HTTP requests:

```sql
OutgoingRequestTrace
| where PreciseTimeStamp > ago(1d) // REPLACE if needed
| where container == "secure-tls-bootstrap-server"
| where namespace == "689e31a614e6cd0001335629" // REPLACE if needed
| where msg == "HttpRequestEnd"
| where statusCode != "200" and statusCode != "201"
| take 100
```

#### Client-side Bootstrapping Failures

Failures on the client side can obviously be the result of server failures, though there are failure modes that don't involve failed RPCs to the bootstrap server which you should be aware of. Regardless, it's important to understand exactly how you can debug client failures that occur during node provisioning involving any top-level bootstrapping step.

##### Summary of Top-Level Bootstrapping Steps

The following is a summarization of the top-level bootstrapping steps that the client goes through in order bootstrap a client certificate for the kubelet:

1. Validate any existing kubeconfig (`ValidateKubeconfig`) - the first step involves inspecting any existing kubeconfig the kubelet would have access to in order to determine if bootstrapping is actually required. The client will decode the kubeconfig, ensure that the referenced certificate file also exists and contains a certificate that hasn't expired. To ensure that the certificate referenced by the existing kubeconfig is considered valid by the control plane, the client will use the entire kubeconfig to make a call to the API server to list the k8s version. This call to `/version` is authenticated, meaning that if the client certificate used to make the request is no longer valid (usually as a result of a previous cluster certificate rotation that didn't propagate to the particular node), this request will return a 401 response. If this kubeconfig is considered valid, then the client will simply exit without going through the bootstrap process. Otherwise, bootstrapping will continue.
2. Retrieve an AAD access token (`GetAccessToken`) - this step involves determining which type of identity the node actually has access to in order to identify itself within Entra ID. The client will read the contents of `azure.json` to determine if it has a service principal, or a user-assigned kubelet identity (MSI). If a service principal is used, the client will make a request to Entra ID directly to obtain a corresponding access token using the service principal client ID and secret obtained from `azure.json`. Otherwise, if a user-assigned kubelet identity is identified, the client will make a request to IMDS to retrieve the access token using the client ID of the identity, also obtained from `azure.json`.
3. Build a gRPC service client to communicate with the bootstrap server (`GetServiceClient`) - this step involves building the gRPC client connection with the bootstrap server which will be used to perform `GetNonce` and `GetCredential` RPCs. Note that this connection will be configured to use the access token retrieved in step 2, as well as use a TLS configuration referencing the cluster's CA certificate which is placed on the node at provisioning time.
4. Retrieve VM instance data from IMDS (`GetInstanceData`) - this step involves calling the IMDS `/metadata/instance` endpoint to retrieve metadata about the VM on which the client is running. The client will extract the resource ID of the VM out of the response sent back by IMDS to construct the `GetNonce` request used in step 5.
5. Retrieve a unique nonce from the bootstrap server (`GetNonce`) - this step involves invoking the `GetNonce` RPC against the bootstrap server running in the cluster's CCP namespace. The request sent to the server will contain the VM's unique resource ID retrieved in step 4. The response will solely consist of a unique nonce the client will then use to request VM attested data in step 6.
6. Retrieve VM attested data from IMDS (`GetAttestedData`) - this step involves using the nonce retrieved in step 5 to request a VM attested data blob from the IMDS `/metadata/attested/document` endpoint. This blob is signed by a certificate owned by the IMDS service and contains a JSON payload with further details about the VM, namely the unique VM ID.
7. Generate a CSR for the kubelet (`GetCSR`) - this step involves generating a certificate signing request (CSR) for the kubelet using the resolved hostname of the VM, as well as an associated private key. Note that these will always be 256-bit elliptic curve private keys.
8. Retrieve a kubelet client credential (signed certificate) from the bootstrap server (`GetCredential`) - this step involves making a `GetCredential` RPC to the bootstrap server running in the cluster's CCP namespace. This request will contain the attested data blob generated in step 6, as well as the b64-encoded PEM corresponding to the kubelet client CSR generated in step 7.
9. Generate a new kubeconfig referencing the retrieved client credential (`GenerateKubeconfig`) - this step involves taking the signed certificate PEM retrieved from the bootstrap server in step 8, as well as the PEM encoding of the private key generated in step 7 to create a new `.pem` for the new kubelet client cert/key pair. After writing the cert/key pair to disk, a new kubeconfig is generated in-memory referencing the new `.pem`.
10. Write the generated kubeconfig data to disk (`WriteKubeconfig`) - this last step simply involves taking the in-memory kubeconfig data referencing the new `.pem` and writing it to disk in a location where the kubelet expects.

Understanding each step and what they entail is important to being able to interpret the guest agent event telemetry emitted by the bootstrap client in both success and failure cases, discussed below.

##### Guest Agent Event Telemetry

The bootstrap client itself utilizes the Azure guest agent event telemetry pipeline to export custom JSON payloads to a particular set of Kusto tables. These JSON payloads contain information regarding the status of the bootstrapping operation (success vs. failure), how many overall retries were attempted, how much time each top-level bootstrapping step took to run for each retry, and a summary of how long each top-level bootstrapping step took to run across _all_ retries. The bootstrap client will continuously attempt to go through the protocol steps until a deadline is reached. At the time of writing, this deadline is configured as 2 minutes. To avoid truncating the JSON payload due to size constraints imposed on the logs extracted to Kusto via the guest agent telemetry pipeline, latency/timing data for only the _last 5_ retry attempts will be included within the JSON payload.

 Lastly, and most importantly, a "final error" field will be included within the payload. This field contains the last error the client encountered before the bootstrapping operation entered a terminally failed state. A terminally failed state will be reached if the aforementioned deadline is exceeded before the client can successfully bootstrap, or if the client encounters a non-retryable error sometime before the deadline is reached.

 The following is an example JSON payload emitted by a bootstrap client which failed to bootstrap due to an inability to connect to the control plane's bootstrap server:

 ```json
 {
 "Status": "Failure", // Indication of terminal state
 "ElapsedMilliseconds": 600001, // How long the entire operation took, taking into account all retry attempts
 "Errors": {
        // The number of top-level bootstrap errors encountered during the operation. The sum of all errors listed here
        // also tells you how many retry attempts occurred.
  "GetNonceFailure": 12
 },
 "Traces": {
        // The "trace" data for the last 5 retry attempts during the operation. Each trace indicates, in milliseconds, how long each
        // top-level bootstrapping step took to run. Each trace is given an "index", which indicates which particular retry attempt it corresponds to.
        // Note that this "index" starts at 0.
  "7": {
   "GetAccessTokenMilliseconds": 131,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 51038,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "8": {
   "GetAccessTokenMilliseconds": 222,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 50654,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "9": {
   "GetAccessTokenMilliseconds": 191,
   "GetInstanceDataMilliseconds": 18,
   "GetNonceMilliseconds": 50121,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "10": {
   "GetAccessTokenMilliseconds": 109,
   "GetInstanceDataMilliseconds": 15,
   "GetNonceMilliseconds": 49984,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "11": {
   "GetAccessTokenMilliseconds": 183,
   "GetInstanceDataMilliseconds": 18,
   "GetNonceMilliseconds": 10505,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  }
 },
 "TraceSummary": {
        // A summation of the time taken, in milliseconds, each top-level bootstrapping step took to execute
        // across all retry attempts
  "GetAccessTokenMilliseconds": 2253,
  "GetInstanceDataMilliseconds": 204,
  "GetNonceMilliseconds": 571920,
  "GetServiceClientMilliseconds": 2,
  "ValidateKubeconfigMilliseconds": 0
 },
    // The "final" or "last" error encountered by the client before it entered a terminal state, either due to exceeding the configured deadline or
    // due to hitting a non-retryable error of some sort. (note that in this example the configured deadline was 10 minutes)
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = DeadlineExceeded desc = context deadline exceeded: last error: rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing: reading server HTTP response: unexpected EOF\""
}
 ```

 Using this data, you can see exactly why the client failed to bootstrap, how many times it attempted to bootstrap, and how long it took to do so. This information can be extremely helpful when trying to understand why the overall the protocol failed to bootstrap a client certificate for the kubelet.

##### Example Queries - Linux

 The following queries show how you can query the `GuestAgentGenericLogs` table to obtain the JSON payload associated with a particular bootstrapping operation/event.

 Say you needed to debug why a particular instance of a customer's Linux VMSS was unable to join the cluster due to a failure of secure TLS bootstrapping. You could use the [following query](https://dataexplorer.azure.com/clusters/azcore.centralus/databases/Fa?query=H4sIAAAAAAAAA42ST4%2FTMBDF73yKUS%2B7SEm2SSo4FSlEUflTStX0Hhl7NvVu4ok8zi4gPjx2gSyrwMLR9pv387yZzYjsihaN26BBq%2BWWWn72De5PaBH2FqVmPOoeayf6AV6BaOkyVc%2Fh6goO1X5blBUIBoOoUE111Z033IkeYb2GxQctLTFdu6T4OlpMqs8ODWsynJQjO%2BprafXg4jTJ8sXkcRR8O1kU7%2BvkNZFjZ8WQ1Ci9z3FbT1eDNu1D6QGZRitxY2kcHr5RNpihbWPpbzQzfupUmq%2FyVZaulnFX2PAsbjl%2BU103KNiNnC2e7vNAHU7%2BTagVIcqBqFvGefB9mb2I73rmZvlXKwxxKJh62YsvHQkFaxiEZWxumMxlScZ5YXoO3p0Q3tUfd17wQ6oZpBcIbVDBvXYnbc6ii19lF%2F69G3vzB5wfrHVhwh74U54FyKNsgYMKXJD9C5Y9AauMeozK56hQ8F%2Bg%2FDfQYOkGpZttbDRfhmgaWwRl5xcQbQQ7UvhWRedvBaANh3lG0ayVaDa476i3h09TAwAA):

 ```sql
GuestAgentGenericLogs
| where PreciseTimeStamp > ago(1d) // REPLACE as needed
| where EventName == "Microsoft.Azure.Extensions.CustomScript-1.23" // This is the 'EventName' value for Linux nodes specifically
| where TaskName == "AKS.Bootstrap.SecureTLSBootstrapping" // All bootstrapping events will have this value for 'TaskName'
| where ResourceGroupName == "MC_e2erg-cameissebld134342140-lAr_e2eaks-HEf_eastus2" // REPLACE as needed
| where RoleName == "_aks-agentpool0-32140726-vmss_0" // REPLACE as needed
| extend BootstrapStatus = parse_json(Context1) // the JSON payload is contained within the 'Context1' column
| extend BootstrapStartTime = Context2 // Bootstrapping start time is contained within the 'Context2' column
| extend BootstrapEndTime = Context3 // Bootstrapping end time is contained within the 'Context3' column
| project PreciseTimeStamp, ResourceGroupName, RoleName, Cluster, NodeId, ContainerId, BootstrapStartTime, BootstrapEndTime, BootstrapStatus
 ```

 This would yield the following results:

 ```json
"PreciseTimeStamp": 2025-08-20T19:24:10.2618771Z,
"ResourceGroupName": MC_e2erg-cameissebld134342140-lAr_e2eaks-HEf_eastus2,
"RoleName": _aks-agentpool0-32140726-vmss_0,
"Cluster": BN9PrdApp18,
"NodeId": e83117ad-6fae-0cca-2222-8ba501e4e5a0,
"ContainerId": 286056b1-b530-4976-9671-12769176f6e6,
"BootstrapStartTime": 2025-08-20 19:19:54.215,
"BootstrapEndTime": 2025-08-20 19:21:54.215,
"BootstrapStatus": {
 "Status": "Failure",
 "ElapsedMilliseconds": 120000,
 "Errors": {
  "GetNonceFailure": 3
 },
 "Traces": {
  "0": {
   "GetAccessTokenMilliseconds": 199,
   "GetInstanceDataMilliseconds": 31,
   "GetNonceMilliseconds": 50781,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "1": {
   "GetAccessTokenMilliseconds": 90,
   "GetInstanceDataMilliseconds": 27,
   "GetNonceMilliseconds": 51018,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  },
  "2": {
   "GetAccessTokenMilliseconds": 222,
   "GetInstanceDataMilliseconds": 26,
   "GetNonceMilliseconds": 14519,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0
  }
 },
 "TraceSummary": {
  "GetAccessTokenMilliseconds": 512,
  "GetInstanceDataMilliseconds": 85,
  "GetNonceMilliseconds": 116319,
  "GetServiceClientMilliseconds": 0,
  "ValidateKubeconfigMilliseconds": 0
 },
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = DeadlineExceeded desc = context deadline exceeded: last error: rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing: reading server HTTP response: unexpected EOF\""
}
 ```

 Note that if you need further info than what's provided here to debug the issue, you can use the `NodeId`, `ContainerId`, and `Cluster` fields to extract the guest agent log bundle via XTS. See the [debugging with provisioning logs section](#debugging-nodes-with-provisioning-logs) below for further details.

 The following is an eample of what a successfull bootstrapping event that could be yielded by the same query:

 ```json
"PreciseTimeStamp": 2025-08-19T09:22:21.5960341Z,
"ResourceGroupName": MC_e2erg-ebld134303226-vKzlBfOJVQ_e2eaks-HJy_eastus2,
"RoleName": _aks-agentpool0-30931393-vmss_0,
"latency": 1034,
"FinalError": ,
"StartTime": 2025-08-19 09:17:36.910,
"EndTime": 2025-08-19 09:17:37.944,
"BootstrapStatus": {
 "Status": "Success",
 "ElapsedMilliseconds": 1034,
 "Traces": {
  "0": {
   "GenerateKubeconfigMilliseconds": 0,
   "GetAccessTokenMilliseconds": 462,
   "GetAttestedDataMilliseconds": 19,
   "GetCSRMilliseconds": 0,
   "GetCredentialMilliseconds": 502,
   "GetInstanceDataMilliseconds": 9,
   "GetNonceMilliseconds": 29,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 0,
   "WriteKubeconfigMilliseconds": 8
  }
 }
},
"Cluster": LVL09PrdApp28,
"NodeId": a4ed3e22-e3c6-0f0d-ed13-34cf35592eae,
"ContainerId": 66e97044-2299-469b-a8d5-62ab953a331e
 ```

##### Example Queries - Windows

If you happen to be working with Windows nodes, you need to change the value of the `EventName` column you're filtering on to `Microsoft.Compute.CustomScriptExtension-1.10`. For [example](https://dataexplorer.azure.com/clusters/azcore.centralus/databases/Fa?query=H4sIAAAAAAAAA42SwW7bMAyG73sKIhe3gOPW9i49ZEBiGMG6NOvi3A1VYhy1tmSIUtIOe%2FhJweq2c4H2KPInP%2F6klg7JzhtUdokKjeQr3dCXP3Dco0G4Ncgl4VZ2WFnW9fANWKPPcnEOFxewKW9X86IERqAQBYqhrjz4hmvWIcxmMLmR3GjSO5sUuuudxaRwZHVXcSN7Wz5aVCS1mqZJejkZemwZPQwt5j%2BqZKG1JWtYn1TIncHtqhpCvVTNJMw0b1u4ex0FDLMQHKXP7NkBwe4lwYG1DmGnDUTPoGhAb5C0MxyXRrv%2BxUZRY4ammXIfkUR414o0%2F5rnV2l2Od1dL0KaPdB08et3jYyso%2BzFzka3OLSqveyYXvH65BfDBgQMZvyqfS3MoGeGsL4nrc4KrazXpafF2z3CdfVz7QVPrWYCvCHuBUwqFN6pd6hOoui5LIL3OcaG23rUP2EW2r%2FZKlBQgQ2yjzBZ5POt69Q7sFKJt6h8jAoFnwLlr0C90ffI7eivxuMzxsMVYiha%2FwfRxLDWAr%2BL%2BDRWAJrwGO8oHlmJ%2F7%2FYXylnRfNMAwAA):

```sql
GuestAgentGenericLogs
| where PreciseTimeStamp > ago(3d) // REPLACE as needed
| where EventName == "Microsoft.Compute.CustomScriptExtension-1.10" // This is the 'EventName' value for Windows nodes specifically
| where TaskName == "AKS.Bootstrap.SecureTLSBootstrapping" // All bootstrapping events will have this value for 'TaskName'
| where ResourceGroupName == "MC_e2erg-cameissebld134339120-fJB_e2eaks-BQz_eastus2"
| where RoleName == "_aksw19c_0"
| extend BootstrapStatus = parse_json(Context1) // the JSON payload is contained within the 'Context1' column
| extend BootstrapStartTime = Context2 // Bootstrapping start time is contained within the 'Context2' column
| extend BootstrapEndTime = Context3 // Bootstrapping end time is contained within the 'Context3' column
| project PreciseTimeStamp, ResourceGroupName, RoleName, Cluster, NodeId, ContainerId, BootstrapStartTime, BootstrapEndTime, BootstrapStatus
```

Result:

```json
"PreciseTimeStamp": 2025-08-19T22:56:02.2997476Z,
"ResourceGroupName": MC_e2erg-cameissebld134339120-fJB_e2eaks-BQz_eastus2,
"RoleName": _aksw19c_0,
"Cluster": LVL04PrdApp30,
"NodeId": 75d8df8e-70bb-bc13-5901-61a86668c7bd,
"ContainerId": 43eb5376-c8e5-4fe6-b700-1f305722eb0b,
"BootstrapStartTime": 2025-08-19 22:48:33.960,
"BootstrapEndTime": 2025-08-19 22:50:33.960,
"BootstrapStatus": {
 "Status": "Failure",
 "ElapsedMilliseconds": 120000,
 "Errors": {
  "GetNonceFailure": 2
 },
 "Traces": {
  "0": {
   "GetAccessTokenMilliseconds": 8,
   "GetInstanceDataMilliseconds": 2,
   "GetNonceMilliseconds": 51713,
   "GetServiceClientMilliseconds": 0,
   "ValidateKubeconfigMilliseconds": 7535
  },
  "1": {
   "GetAccessTokenMilliseconds": 0,
   "GetInstanceDataMilliseconds": 0,
   "GetNonceMilliseconds": 50478,
   "GetServiceClientMilliseconds": 7,
   "ValidateKubeconfigMilliseconds": 7524
  }
 },
 "TraceSummary": {
  "GetAccessTokenMilliseconds": 9,
  "GetInstanceDataMilliseconds": 2,
  "GetNonceMilliseconds": 102192,
  "GetServiceClientMilliseconds": 7,
  "ValidateKubeconfigMilliseconds": 15060
 },
 "FinalError": "GetNonceFailure: failed to retrieve a nonce from bootstrap server: rpc error: code = Unavailable desc = name resolver error: produced zero addresses"
}
```

##### Debugging Nodes with Provisioning Logs

As described above in how to confirm [node-level enablement](#confirming-node-level-enablement) of secure TLS bootstrapping, you can use logs emitted on the node itself by the bootstrapping process to debug node registration failures. This failure could be due to the bootstrap client failing to negotiate kubelet's client certificate, or some other unrelated provisioning/bootstrap failure.

__IMPORTANT NOTE: During Phase 1 rollout of secure TLS bootstrapping, bootstrap tokens will still be installed into customer clusters and available to the kubelet via bootstrap-kubeconfig. This means that if the secure TLS bootstrap client fails to negotiate a client certificate on the kubelet's behalf, the bootstrap token will be used as a fallback so the kubelet can still attempt to bootstrap its own client certificate and join the cluster. As a result, the worst-case scenario during Phase 1 should simply be a delay in node registration if the secure TLS bootstrap client fails.__

In either case, to view relevant logs on the node, you need to retrieve the guest agent VM log bundle. You can retrieve these bundles using the XTS tool on your SAW. See [this TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-cloud-native-and-management-platform/containers-bburns/azure-kubernetes-service/tsg-for-azure-kubernetes-service/doc/tsg/how-to-get-systemd-kubelet-log-and-provisioning-logs-and-pod-logs-from-the-node-using-azure-support-center#guest-agent-vm-logs-via-xts) for details on how to install/setup XTS and use it to start extracting logs.

---

## Scenario 11: Troubleshooting: TLS Connection Fails from AKS Nodes
> 来源: ado-wiki-c-TLS-Troubleshooting-Guide.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting: TLS Connection Fails from AKS Nodes


#### Summary

This document assists support engineers in diagnosing and resolving TLS-related connectivity issues originating from workloads or system pods within an Azure Kubernetes Service (AKS) cluster. It outlines common symptoms, analysis techniques, and remediation steps, including the use of curl and openssl for TLS debugging.

This guide applies to AKS clusters running on Linux nodes and assumes basic familiarity with TLS and Kubernetes networking.

---

#### Reported and Observed Symptoms

- Application workloads are unable to reach external endpoints using HTTPS

- `curl` from within AKS pods shows `Connected`, but fails with TLS errors

- `openssl s_client` reveals incomplete handshake or abrupt disconnects

- External services report failed mutual TLS negotiation

---

#### Logs and Error Messages

Examples of logs or terminal outputs observed:

```bash

Connected to store.policy.core.windows.net port 443

TLSv1.3(OUT), TLS alert, decode error

error: 0A000126:SSL routines::unexpected eof while reading

curl: (35) error: 0A000126: SSL routines::unexpected eof while reading

Or

curl: 35 Recv failure: Connection reset by peer

```

---

#### Environment Details

- TLS traffic originating from system-managed workloads or user pods

- May involve outbound HTTPS to Microsoft endpoints or third-party APIs

- Cluster may use Azure Firewall, App Gateway, or Private DNS Zones

---

#### Potential Causes

Support engineers should investigate the following areas:

##### TLS Version or Cipher Mismatch

- Server expects specific TLS versions (e.g., TLS 1.2 vs 1.3)

- Pod base image uses outdated OpenSSL or disabled cipher suites

##### SNI (Server Name Indication) Missing or Mismatched

- `openssl s_client` missing `-servername` flag

- HTTPS endpoint rejects connection without correct SNI

##### Firewall or Proxy Interruption

- Azure Firewall or App Gateway may interrupt or strip TLS handshake

- Packet inspection policies may interfere with session setup

##### Application Gateway TLS Policy Restrictions

- Application Gateway may enforce TLS policy that excludes client ciphers

- May affect curl but not browsers due to different TLS stacks

---

#### Mitigation Steps

To isolate and resolve the TLS connectivity issue, follow the steps below:

---

#####  Step 1: Use OpenSSL for Low-Level Inspection

Run the following to establish a raw TLS connection and inspect the handshake:

```bash

openssl s_client -connect store.policy.core.windows.net:443 -servername store.policy.core.windows.net

```

Optional flags:

- `-showcerts` to display the full certificate chain

- `-CAfile` to specify a custom CA trust store if required

#####  Step 2: Analyze `openssl s_client` Output

####  Successful Handshake

Indicates TLS is working correctly. Check for:

- Peer certificate and chain

- Cipher and protocol negotiated

- Any TLS alerts or abrupt connection resets

####  Common Failure Patterns

|Symptom|LikelyCause|SuggestedAction|
|----------------------------------|------------------------------------------------------------------|---------------------------------------------------------------------|
|`unexpectedeofwhilereading`|Connectionwasblocked orinterruptedbeforethehandshakecouldcomplete|Checknetworkdevicesbetweenclientandserver,suchasNVA/Firewall/Proxy|
|`unabletogetlocalissuercertificate`|UntrustedCA|Providecustom`-CAfile`orupdateCAbundle|
|`connectiontimedout`|Network/firewallblock|CheckNSG,UDR,orAzureFirewallrules|
|`wrongversionnumber`|Non-TLStargetorportmismatch|Verifycorrectport(443forHTTPS)|

---

#####  Step 3: Verify Network Policies and Firewalls

- Confirm that the AKS node subnet is allowed to egress on TCP 443

- Use `nc -vz` or `telnet` from the node to confirm port reachability

- If Azure Firewall is used, check if TLS inspection is enabled or interfering

---

#####  Step 4:Cross-check TLS Policy and External Validation

- Review Application Gateway TLS policy if in path

- Use [SSL Labs Test](https://www.ssllabs.com/ssltest/) to validate the public-facing TLS configuration. This helps confirm whether the issue is client-side or server-side.

---

These steps should help isolate whether the TLS issue originates from configuration, infrastructure, or server-side restrictions

---

#### Last Updated

June 2025 by <yangzhe@microsoft.com>

#### Owner and Contributors

**Owner:** Zhen Yang <yangzhe@microsoft.com>
**Contributors:**

---

## Scenario 12: AKS Managed Gateway API with Istio
> 来源: ado-wiki-managed-gateway-api-istio.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Managed Gateway API with Istio

Installation, configuration, traffic flow, and troubleshooting guide for AKS Managed Gateway API with Istio service mesh.

#### 1. Installation

##### New AKS cluster

```bash
az aks create -g $RESOURCE_GROUP -n $CLUSTER_NAME --enable-azure-service-mesh --enable-gateway-api
```

##### Existing AKS cluster

Enable istio ASM before gateway api:

```bash
az aks mesh enable -g $RESOURCE_GROUP -n $CLUSTER_NAME
az aks update -g $RESOURCE_GROUP -n $CLUSTER_NAME --enable-gateway-api
```

##### Validation

ASM minor revision should be asm-1-26 or higher.

```bash
az aks show -g $RESOURCE_GROUP -n $CLUSTER_NAME --query 'serviceMeshProfile.mode'
#### Expected: "Istio"

kubectl get pods -n aks-istio-system
#### istiod pods should be Running

kubectl get crds | grep "gateway.networking.k8s.io"
#### Should see: gatewayclasses, gateways, grpcroutes, httproutes, referencegrants
```

#### 2. Configure TLS ingress

Key points:
- TLS Secret **must** be in the same namespace as the Gateway
- Gateway resource auto-creates Envoy Deployment and Service (managed by Istio)
- Use `kubectl wait --for=condition=programmed gateways.gateway.networking.k8s.io <name>` to verify

#### 3. Traffic flow

```
Client → HTTPS → Gateway LB Service → Istio Ingress Envoy → HTTPRoute → Service → Pod
```

#### 4. Troubleshooting Checklist

##### Check GatewayClass

```bash
kubectl get gatewayclass -o wide
#### controllerName should be: istio.io/gateway-controller
```

##### Verify Envoy Deployment/Service

```bash
kubectl get deploy -A -l gateway.istio.io/managed=istio.io-gateway-controller
kubectl get service -A -l gateway.istio.io/managed=istio.io-gateway-controller
```

##### Check Gateway errors

```bash
kubectl describe gateway <name>
#### Look at: ResolvedRefs, Programmed, Accepted conditions
#### Common: "invalid certificate reference", "Bad TLS configuration"
```

##### Check proxy logs

```bash
kubectl logs <gateway-pod> -f
#### Common error: "failed to warm certificate... dial tcp :15012: connection refused"
#### → istiod not reachable
```

##### TCP trace with gadget

```bash
kubectl gadget run trace_tcp:latest --podname <pod> --fields src,src.addr,dst,dst.addr,type
```

##### ConfigMap rules

- Only **one** ConfigMap per GatewayClass (in aks-istio-system, label: `gateway.istio.io/defaults-for-class=istio`)
- ConfigMap may take ~5 min to appear after CRD install
- Gateway-level ConfigMap (via `spec.infrastructure.parametersRef`) takes precedence over GatewayClass-level

#### References

- https://learn.microsoft.com/en-us/azure/aks/managed-gateway-api
- https://learn.microsoft.com/en-us/azure/aks/istio-deploy-addon
- https://learn.microsoft.com/en-us/azure/aks/istio-gateway-api#resource-customizations
- https://istio.io/latest/docs/tasks/observability/logs/access-log/

---

## Scenario 13: Update Ingress CA Certificates with New .pfx File
> 来源: ado-wiki-update-ingress-ca-certificates-with-pfx.md | 适用: 适用范围未明确

### 排查步骤

#### Update Ingress CA Certificates with New .pfx File

#### Overview

When customer SSL/TLS certificates expire, they get the new/renewed certificates from certificate providers (Eg: digicert, comodo, acme) in `.pfx` format. If a customer has a .pfx file and wants to replace or renew their ingress certificates, they can follow the steps outlined below.

#### How to Replace/Renew Ingress Certificates using a .pfx File

1. **Extract the `pfx` file into `.cert` and `.key` files.**

    `openssl pkcs12 -in C:\PathToThePFXfile\myPFXfileName.pfx -out certificate.txt -nodes`

2. **Copy the `.key` (private key) and `.crt` from the `certificate.txt` file.**

    Make sure the `.crt` file has the `leaf -> intermediate -> root` order if customer has intermediate SSL/TLS certificate.

   ```
   -----BEGIN CERTIFICATE-----
   (Your Primary SSL certificate: your_domain_name.crt)
   -----END CERTIFICATE-----
   -----BEGIN CERTIFICATE-----
   (Your Intermediate certificate: DigiCertCA.crt)
   -----END CERTIFICATE-----
   -----BEGIN CERTIFICATE-----
   (Your Root certificate: TrustedRoot.crt)
   -----END CERTIFICATE-----
   ```

3. **Create new files for the `.key` and `.crt.`**
    Name them `tls.crt` and `tls.key`.

4. **Create a secret using the `tls.crt` and `tls.key` files.**

    `kubectl create secret generic my-certs --from-file=tls.crt=tls.crt --from-file=tls.key=tls.key -n appservices`

5. **Update the secret name in your ingress yaml file.**

6. **Restart the ingress pods (if necessary).**

---

## Scenario 14: Troubleshooting Flow
> 来源: ado-wiki-using-multiple-ingress-controllers.md | 适用: 适用范围未明确

### 排查步骤

1. Cannot reach AppGW IP → ensure port 80/443 allowed on AppGW NSG
2. AppGW and AKS in different VNets → peer both networks
3. nginx ingress returns 404 → check ingress resource events and nginx IC logs

---

## Scenario 15: Troubleshooting Flow
> 来源: mslearn-managed-gateway-api-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

##### Step 1: Verify existing Gateway API CRD channel and bundle version

If Gateway API CRDs were installed before enabling Managed Gateway API:
- Ensure CRD bundle version is compatible with cluster Kubernetes version
- Verify only `standard` channel CRDs are installed
- Check for required annotations:
  - `gateway.networking.k8s.io/bundle-version`
  - `gateway.networking.k8s.io/channel`

**If issues persist**: Disable Managed Gateway API, uninstall all self-managed CRDs, re-enable.

##### Step 2: Verify managed CRDs have expected annotations

After successful installation, CRD objects should have:
- `app.kubernetes.io/managed-by: aks`
- `app.kubernetes.io/part-of: <hash>`
- `eno.azure.io/replace: true`

**Missing annotations** = possible provisioning issue. Check for pre-existing CRD conflicts, then uninstall/reinstall.

##### Step 3: Inspect CRD version after AKS upgrades

After AKS minor version upgrade:
- CRDs should auto-upgrade to new supported Gateway API bundle version
- Verify via `gateway.networking.k8s.io/bundle-version` annotation
- If not updated: uninstall/reinstall Managed Gateway CRDs

---

## 附录: Kusto 诊断查询

### 来源: api-throttling-analysis.md

# API Server 请求和 Throttling 分析

## 用途

分析 Kubernetes API Server 的请求模式、错误统计和 Throttling 情况。

## 使用场景

1. **性能问题诊断** - API Server 响应慢
2. **Throttling 分析** - 429 错误排查
3. **请求模式分析** - 识别高频请求来源

## 查询 1: API 错误统计

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| extend verb = tostring(event.verb)
| extend user = tostring(event.user.username)
| extend reason = tostring(event.responseStatus.reason)
| extend status = tostring(event.responseStatus.status)
| extend code = tostring(event.responseStatus.code)
| extend subresource = tostring(event.objectRef.subresource)
| extend pod = tostring(p.pod)
| extend objectRefname = tostring(event.objectRef.name)
| extend userAgent = tostring(event.userAgent)
| extend clientIp = tostring(event.sourceIPs[0])
| extend latency = datetime_diff('millisecond', todatetime(tostring(event.stageTimestamp)),
                                 todatetime(tostring(event.requestReceivedTimestamp)))
| where code != "200" and code != "201"
| summarize count() by reason, clientIp, code, status, userAgent, verb, objectRefname
| order by count_ desc
```

## 查询 2: API 请求 Throttling 分析

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb = tostring(event.verb)
| extend code = tostring(event.responseStatus.code)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize count() by code, bin(PreciseTimeStamp, 1m)
| render timechart
```

## 查询 3: 请求延迟分布

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| extend verb = tostring(event.verb)
| extend resource = tostring(event.objectRef.resource)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp),
                              todatetime(event.requestReceivedTimestamp))
| summarize
    p50 = percentile(lat, 50),
    p90 = percentile(lat, 90),
    p99 = percentile(lat, 99),
    max_lat = max(lat),
    count = count()
  by verb, resource
| order by p99 desc
```

## 查询 4: 高频请求用户

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
union ControlPlaneEventsNonShoebox, ControlPlaneEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where ccpNamespace == queryCcpNamespace
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| extend user = tostring(event.user.username)
| extend userAgent = tostring(event.userAgent)
| extend verb = tostring(event.verb)
| summarize count() by user, userAgent, verb
| order by count_ desc
| take 50
```

## HTTP 状态码说明

| 状态码 | 含义 | 可能原因 |
|-------|------|---------|
| 429 | Too Many Requests | API Throttling |
| 500 | Internal Server Error | API Server 内部错误 |
| 503 | Service Unavailable | API Server 不可用 |
| 504 | Gateway Timeout | 请求超时 |
| 401 | Unauthorized | 认证失败 |
| 403 | Forbidden | 授权失败 |

## 注意事项

- 429 错误通常表示 API Server 正在进行流量控制
- 关注 userAgent 中的自定义应用可能产生过多请求
- 建议分析 p99 延迟而不是平均延迟

---
