---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/Application Routing (nginx) Add-on"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20(nginx)%20Add-on"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Routing (nginx) Add-On

[[_TOC_]]

## NGINX Ingress Retirement

<span style="color:red;font-weight:700;font-size:20px">
Important Retirement Notice
</span>

Upstream kubernetes has decided to [deprecate the NGINX ingress controller](https://www.kubernetes.dev/blog/2025/11/12/ingress-nginx-retirement/) with a retirement date of March 2026. After that, there will be no more security or bug fixes from the upstream project. Due to the short time-frame of this retirement, AKS has decided to provide ongoing bug/security fixes for AKS customers using this addon. This will only be for a limited amount of time.

Microsoft has announced that it will support the App Routing add-on using NGINX Ingress until **November 2026**. It will provide any critical security/bug fixes until that time.

### Supported and upcoming options

#### App Routing add-on (Gateway API, meshless Istio gateway)

* The App Routing add-on remains supported and is transitioning to **Gateway API**, implemented using a **meshless Istio gateway**.
* **Service mesh is not required.**
* Timeline:
  * **Preview: March 2026**
  * **GA: May 2026**
* Docs:[Managed Gateway API in AKS](https://learn.microsoft.com/azure/aks/managed-gateway-api)
* TSG: [Application Routing Gateway API (Istio) Add-on](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Addons-and-Extensions/Application-Routing-Gateway-API-\(Istio\)-Add%2Don)

#### NGINX-based App Routing support

* The NGINX implementation used by App Routing will continue to receive **critical security fixes through November 2026**.
* This support window is intended to provide **migration runway**, not to extend NGINX as a long-term solution.

#### Application Gateway for Containers

* **GA today**
* Supports both **Ingress**�and **Gateway API**
* Docs:[Application Gateway for Containers overview](https://learn.microsoft.com/azure/application-gateway/for-containers/overview)

#### Istio add-on (service mesh path)

* **Istio Ingress: GA**
* **Gateway API: Preview**, with **GA targeted for May**
* Appropriate for customers planning **service mesh adoption**, combining ingress modernization with mesh capabilities.
* Docs:[Istio add-on for AKS](https://learn.microsoft.com/azure/aks/istio-about)

#### Roadmap visibility and feedback

* [App Routing add-on � Gateway API](https://github.com/Azure/AKS/issues/5515)
* [Managed Gateway API support](https://github.com/Azure/AKS/issues/4677)
* [Istio add-on � Gateway API support](https://github.com/Azure/AKS/issues/5527)

---

## Overview

The Application Routing add-on (formerly Web Application Routing) is a managed AKS add-on that creates managed nginx ingress controllers. It will do SSL termination through certificates stored in Azure Key Vault.

## Support Boundaries

The support boundary for the app routing add-on is defined as:

* The installation and removal of the add-on
* The configuration of the Nginx ingress controllers through the NginxIngressController CRD and/or ARM API (when available)
* The managed components running inside the customer cluster (ingress controller, external-dns) and integration with Azure DNS
* The integration with Azure Key Vault using the Secret Store CSI Driver

We do not officially support customer workloads or how to configure ingresses for their specific use case. Any cases falling into this area will be handled on a best effort basis in the same manner as general Kubernetes questions or issues.

## Training Video

The PG has provided the [following training video](https://microsoft.sharepoint.com/:v:/t/AzureCSSContainerServicesTeam/EfmjBfFbH1xNge0-ydvN6uoBDbbWTvUrgjfyx_1w9Gr4hQ?e=VNeLMf&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D) on the feature.

## Architecture

App Routing's architecture spans across a couple of different services. The diagram below gives a high-level overview of the various components and how they interact.

![app-routing-1.png](/.attachments/app-routing-1-f5fc4a11-448f-4d9f-9d60-e06074668067.png)

### ARM

ARM is the medium that users specify their configuration options to us. For example, a user can turn on or off App Routing through the [enabled field](https://github.com/Azure/azure-rest-api-specs-pr/blob/5bcbf0ec9a42be239bf89f3f8c4586dc2dc68d0c/specification/containerservice/resource-manager/Microsoft.ContainerService/aks/preview/2023-06-02-preview/managedClusters.json#L7088).

AZ CLI, Terraform, and other tooling are wrappers around ARM that further simplify the user experience. We are responsible for AZ CLI updates based on any App Routing ARM changes.

### AKS RP

ARM requests come into AKS RP which handles them appropriately. AKS RP is responsible for deploying/updating the App Routing Operator into the CCP with the correct configuration options (coming from the ARM request).

#### API Version/Conversion to Unversioned Cluster

The first step in accepting user requests is converting the customer's request, which contains a cluster that corresponds to a specific apiversion, into the unversioned/proto struct we use to store clusters in our datastore. This is the primary means by which we are able to expose new features that require new customer input to enable, like supporting multiple DNS zones. This is why older API versions may not match newer API versions completely - new ones may contain new or renamed fields that reflect change in the add-on's functionality over time. These conversions from versioned clusters to unversioned clusters take place [in this code](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=resourceprovider/server/microsoft.com/containerservice/datamodel) where each folder contains the conversion code for a specific API version.

#### Validation

Validation takes place [in this code](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=resourceprovider/server/microsoft.com/containerservice/server/validation/approuting/approuting.go), where we ensure the user has provided valid input.

### Managed Identity Reconciliation

The only piece of state/configuration passed to the operator that is not directly calculated via ARM is the system assigned identity (MSI) that the Operator uses to write records to DNS Zones (via ExternalDNS) and pull certificates. This takes place [in this code](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/resourceprovider/server/microsoft.com/asyncoperationsprocessor/operations/managedcluster/managedclusteroperationasync_addon.go&version=GBmaster&line=338&lineEnd=339&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents).

### Overlay Manager Reconciliation

To reconcile we just need to deploy/update the App Routing Operator using Overlay Manager and ensure there's a MSI/System Assigned Identity for the Operator to use. Information is passed to Overlay Manager through the [CP Wrapper](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=resourceprovider/server/microsoft.com/asyncoperationsprocessor/operations/managedcluster/putmanagedclusterasync_addon.go). Values are [computed from helm value overrides](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=overlaymgr/server/helmctlr/helmvalues/helmvalues_types.go), specifically using [this](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=overlaymgr/server/helmctlr/helmvalues/addonvalues/app_routing_operator.go). Finally, values are read by the [Helm template](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/charts/kube-control-plane/charts/app-routing-operator) to determine the exact form on the App Routing Operator

Note that the App Routing Operator version is tied to the AKS version. The [Operator Image Tag Toolkit](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-rp/pullrequest/8506444?_a=files) is used for updating the Operator version we deploy.

### App Routing Operator

The App Routing Operator is a Kubernetes Deployment deployed by the Overlay Manager into the CCP. AKS RP passes information to the Operator through CLI flags. The Operator runs inside the CX Cluster but is not in the CX Overlay (CX can't see this).

The Operator has two main responsibilities.

1. Reconciles resources inside the CX Overlay until they match the desired state. These resources include the NGINX Ingress Controller and ExternalDNS Reconcilers.
2. Various other controllers that are responsible for supporting the NGINX Ingress Controller with things like rebalancing load after scaling.

List of the various other controllers

* [Concurrency Watchdog](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/ingress/concurrency_watchdog.go) - Evicts Ingress Controller Pods that have too many active connections relative to the other pods. This helps redistribute long-running connections when the ingress controller scales up. Round Robin doesn't take long-running connections into account when load balancing.
* [Event Mirror](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/keyvault/event_mirror.go) - Copies events published to pod resources by the Keyvault CSI driver into ingress events. Allows users to easily determine why a certificate might be missing for a given ingress.
* [Ingress SPC](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/keyvault/ingress_secret_provider_class.go) - Creates a SPC for each Ingress that references a Keyvault resource.
* [Placeholder Pod](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/keyvault/placeholder_pod.go) - Mounts Keyvault secret into noop pod so that Keyvault secret can be mirrored into K8s secret. This is required by the KeyVault CSI driver spec.
* [OSM Ingress Backend](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/osm/ingress_backend_reconciler.go) - Creates an Open Service Mesh IngressBackend for every ingress resource with a certain annotation. This allows NGINX to use mTLS provided by OSM when contacting upstreams.
* [OSM Ingress Cert](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/osm/ingress_cert_config_reconciler.go) - Updates the Open Service Mesh configuration to generate a client cert to be used by NGINX when contacting upstreams. Needed inside OSM.
* [Ingress Reconciler](https://github.com/Azure/aks-app-routing-operator/blob/main/pkg/controller/service/ingress_reconciler.go) (deprecated experience) - Creates a managed Ingress configured through annotations on a Service. This is deprecated because the experience of managing an Ingress through annotations turns into making an annotation for every useful field of the Ingress spec. That's not a better experience than just having the user control the Ingress object themselves.

Links

* [Repo](https://github.com/Azure/aks-app-routing-operator)

### CX Overlay Resources

These are the resources that the App Routing Operator is responsible for creating and maintaining. In general, these resources will only be modified when we need to update versions or on a user-specified update (like changing the attached DNS Zones).

The diagram explains the basics of how the managed resources empower the user to route HTTP(s) traffic to their application.

![app-routing-2.png](/.attachments/app-routing-2-8405c2cf-1434-456b-9fef-9944441f9051.png)

Links

* [Manifests](https://github.com/Azure/aks-app-routing-operator/tree/main/pkg/manifests)
* [NGINX Ingress Controller](https://github.com/kubernetes/ingress-nginx)
* [NGINX Ingress Controller Docs](https://kubernetes.github.io/ingress-nginx/)
* [External DNS](https://github.com/kubernetes-sigs/external-dns)

## Troubleshooting

### Classifying Issue

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

### Customer Error

There are a few types of customer issues.

* Improper usage
* Policy issues
* Insufficient capacity
* Firewall blocking kubeapiserver

Follow the steps below for identifying and fixing. If an issue is identified as a customer issue, check the [public docs](https://learn.microsoft.com/en-us/azure/aks/app-routing?tabs=without-osm) to see if the issue is documented. If it's not documented please reach out to Ahmed Sabbour so we can document it. We need to publicly document common customer issues.

### Custom Resource Definition

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

### Improper usage

Check the [public docs](https://learn.microsoft.com/en-us/azure/aks/app-routing?tabs=without-osm) to see how App Routing works.

One key thing to note is that customers should not manually touch the resources that App Routing manages. Users editing the App Routing NGINX configmap or any other managed resource could result in App Routing breaking.

### Policy

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

### Insufficient capacity

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

### Firewall Rules

If the customer has a firewall blocking requests to the kubeapiserver, then the nginx deployment will enter crashloop backoff, with errors similar to `Error while initiating a connection to the Kubernetes API server. This could mean the cluster is misconfigured (e.g. it has invalid API server certificates or Service Accounts configuration). Reason: Get "https://10.0.0.1:443/version": EOF Refer to the troubleshooting guide for more information: https://kubernetes.github.io/ingress-nginx/troubleshooting/`

This log can be verified from the logs on the nginx deployment in the app-routing-system namespace

These logs can be retrieved using the `CustomerCluster - Get pods log` Geneva Action located at AzureContainerService/(Lockbox)Customer Data on Geneva. Running the action will yield a .zip file with txt files for logs across several aks services. `app_routing_ingress_controllers_logs.txt` contains the logs for the nginx deployment that may contain the expected error

#### Manual Testing if Pod Logs are inconclusive

Create a temporary debug pod with `kubectl debug node/NODENAME -it --image=mcr.microsoft.com/oss/mirror/docker.io/library/ubuntu:20.04` and then install curl (if the firewall is too restrictive it will also block installing curl on the debug pod, confirming the issue in a different way)

`apt update && apt install curl`

To confirm the issue, attempt to curl the address `https://$KUBERNETES_SERVICE_HOST/version`, and if it fails to dial, there could be a firewall issue. If the connection fails due to ssl verification, then the request successfully reached the kube api server, and the issue NOT a firewall configuration

Don't forget to delete your temporary debug pod afterwards

## ARM / AKS RP (Control Plane)

App Routing is part of the generic Addons / CCP reconciliation process. See more details under the [RP section](https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/570008/Architecture?anchor=aks-rp) of the Architecture. If there's an issue with the values of the App Routing deployment you can verify against our [Operator helm chart](https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-rp?path=/ccp/charts/kube-control-plane/charts/app-routing-operator).

Otherwise, follow the generic Addon and CCP TSGs. For example, the following query can be used to see OverlayMgr failures for a cluster.

```KQL
cluster('aks').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp between(\_startTime..\_endTime)
| where fqdn == "{customer_fqdn}"
| where result != "Succeeded"
```

## App Routing Operator (Data Plane)

There's two main classes of issues in the App Routing Data Plane.

1. App Routing Operator Controller failing
2. Provisioned managed resource not behaving as desired

To determine which class your issue falls into, check the App Routing Operator logs.

[Example Query](https://dataexplorer.azure.com/clusters/aks/databases/AKSprod?query=H4sIAAAAAAAAA0XKPQ6DMAwG0L2ncDPRsTsgcQJQywUs6wMi5cdyQlk4fDvR+b1B9ZX36tM6KoxrtttJxwYDTQbxBbOPeFeOSj3xmpvn9rhK4oiiLKCuI9dK2EuFkYj+qXdXD/gg0P1XfVqy+wJiqCZ1fAAAAA==)

```KQL
cluster("Aks").database("AKSprod").AppRoutingOperator
| where PreciseTimeStamp > ago(1h)
| where namespace == "{cluster ccp namespace}"
| where level != "info"
| project-reorder msg, error, controller
```

The failure logs should help guide the investigation and point to the failure point. Before going further, ensure any errors are not [Customer Error](#customer-error).

If there are not any relevant error logs from the Operator then the App Routing Operator is likely completing its reconciliation loops as expected and the error likely resides in the provisioned managed resources not behaving as expected.

A good first strategy for investigating the managed resources is reading the logs for the managed resources (NGINX Ingress Controller and ExternalDNS). You can connect to the CX cluster directly and view these logs in the `app-routing-system` namespace or you can use lockbox to download a file with the logs. To use lockbox, you need JIT. Then run the Lockbox/Customer Data "Get pods log" Geneva action under AzureContainerService AKS > (Lockbox)Customer Data > CustomerCluster - Get pods log. You should see a ZIP file containing logs for relevant AKS-managed pods. The NGINX and ExternalDNS logs are what are relevant for App Routing. Any error level logs from ExternalDNS or Nginx should be suspect.

### NGINX Ingress

You can follow the OSS [NGINX Ingress troubleshooting guide](https://kubernetes.github.io/ingress-nginx/troubleshooting/) along with the steps below.

Checking the logs is the most useful way to debug NGINX. You can get the logs by using lockbox (detailed above) or by connecting to the CX Overlay and using kubectl to get the logs from NGINX pods in the `app-routing-system` namespace.

NGINX logs come in two flavors

* Access logs - record information about traffic passing through and handled by the Ingress
* Error logs - where NGINX writes information about issues and startup

Both types of logs are stored on the pod in the same place. You can differentiate between them by their form (see below).

#### Access logs

Access logs look like this

```log
162.200.5.14 - - [16/Nov/2023:21:18:23 +0000] "GET / HTTP/2.0" 200 629 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0" 445 0.016 [hello-web-app-routing-aks-helloworld-80] [] 10.244.1.12:80 629 0.016 200 5f2b60c8e016bfb44ae3326e7788aba5
```

We follow the [default log format](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/log-format/) which can help you decipher what each log means.

Access logs are useful for proving that NGINX was able to successfully handle requests.

#### Error logs

The name error logs is confusing because not every log with this form is actually an error, some are purely informational. Error logs look like

```log
I1116 21:17:27.118687 6 nginx.go:260] "Starting NGINX Ingress controller"
```

The first part indicates the level of the log. This one is prefixed by `I` indicating it is an info log. Info level logs can be helpful for identifying customer error. For example, the following log shows that an Ingress was not properly pointing to the app routing IngressClass.

```log
I1116 21:17:27.120901 6 store.go:535] "ignoring ingressclass as the spec.controller is not the same of this ingress" ingressclass="other.ingress.class"
```

To see non-info logs you can use `kubectl logs <nginx-pod-name> -n app-routing-system | grep -v '^I'` to filter out logs starting with `I`. Note that this will still show access logs though. Error-level logs likely indicate something going wrong with NGINX that is worth investigating. They aren't necessarily indicative of a error on App Routing's part, they may be logged due to customer misconfiguration.

### Keyvault Integration

App Routing's Data Plane also depends on the Azure Keyvault Secret Provider addon for pulling TLS certs used by Ingresses. If there's a problem with TLS Certs (should be seen in the form of NGINX Ingress Controller Pod error logs related to TLS certificates) then you should follow [their TSG](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Addons-and-Extensions/Keyvault-Secrets-Provider.md).

## Escalations

If the answer isn't here or in the public docs, you can escalate directly with an ICM directly to the AKS/RP queue. They have agreed to take any escalations until we have fully onboarded this to support.

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

* Jordan Harder <Jordan.Harder@microsoft.com>
* Jordan Harder <joharder@microsoft.com>
* Luis Alvarez <lualvare@microsoft.com>
