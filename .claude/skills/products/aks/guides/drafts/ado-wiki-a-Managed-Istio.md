---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/Managed Istio"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FManaged%20Istio"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Istio/Azure Service Mesh

[[_TOC_]]

## Overview

Istio is a popular open-source project that provides a service mesh on top of a customer�s application workload. This adds a layer of complexity to Kubernetes networking, as it has additional traffic routing through Envoy proxy sidecars. Istio has a lot of usage in the containers community, so there is the potential that the managed add-on will be very popular. It will eventually replace our current service mesh add-on, Open Service Mesh, which has not gained much traction.

### Support Boundaries

The support for Istio aligns with the same support expectations we have for Kubernetes. We fully support:

* The installation and removal of the add-on.
* The managed control plane inside the customer cluster.

We do not officially support customer workloads or how to configure Istio for their specific use case. Any cases falling into this area will be handled on a best effort basis in the same manner as general Kubernetes questions or issues.

### Add-on Limitations

At this time, the following limitations have been identified with the Istio add-on:

* The addon is not compatible with clusters already using the **Open Service Mesh** add-on.
* The addon is not compatible with customer-managed Istio deployments/installations.
* Pods running on virtual nodes cannot be added to the mesh.
* Egress gateways for outbound traffic control are not supported.
* Ambient mode (sidecar-less) deployments are not supported.
* Multi-cluster deployments are not supported.
* Windows Server containers are not supported.
* Gateway API for Istio ingress gateways or managing mesh traffic (GAMMA) is not yet supported. Customizations such as static IP addressing for ingress are planned as part of the Gateway API implementation effort.

Customization of the mesh based on the following custom resources is blocked for now: [Disallowed Features](#disallowed-features).

The evergreen list of limitations can be found at <https://learn.microsoft.com/en-us/azure/aks/istio-about#limitations> and should be referenced as the source of truth for the current state of the Istio add-on.

## Feature Components

> The official upstream documentation for the Istio architecture can be found at <https://istio.io/latest/docs/ops/deployment/architecture/>.

At a high level, Istio has two tiers of components - **data plane** and **control plane**. The data plane is the Envoy proxy sidecars that are injected into the customer�s application pods. The control plane is the Istio control plane that is installed into the customer�s cluster. The control plane is responsible for configuring the data plane.

![Official Istio architecture diagram.](https://istio.io/latest/docs/ops/deployment/architecture/arch.svg)

The Istio core components are as follows:

* **Envoy** - Istio uses an extended version of the Envoy proxy to handle all inbound and outbound traffic for all services in the mesh. The Envoy proxies are the only components that intreact with the data plane traffic. The proxies are deployed as sidecars and offer the pods additional functionality such as:
  * Dynamic service discovery
  * Load balancing
  * TLS termination
  * HTTP/2 and gRPC proxies
  * Circuit breakers
  * Health checks
  * Staged rollouts with percentage-based traffic split
  * Fault injection
  * Rich metrics

  The sidecar proxies also enable additional Istio features and capabilities to the pods, such as:
  * Traffic control features such as routing rules for HTTP, gRPC, WebSockets, and TCP traffic.
  * Network resiliency such as retries, failovers, circuit breakers, and fault injection.
  * Security features such as rate limiting/throttling and enhanced security policies.
  * Custom extension support based on WebAssembly.

* **Istiod** - Istiod is the control plane component responsible for managing service discovery for the msehed services, configuration of the Envoy proxies, and certificate management for the mesh.

  It converts high-level configuration into Envoy-specific rules that can be used to configure the sidecar proxies running inside each meshed pod. Istiod also monitors for additional configuration through the Traffic Management API and updated the generated Envoy rules and configuration to match the desired behavior.

  The security components of Istiod offer end-to-end authentication as well as identity and credential management. By adding pods and services into the mesh, they can be automatically authenticated and authorized. Istiod also provides a certificate authority (CA) for issuing and rotating certificates for the Envoy proxies and the services they secure. These certificates enable mTLS between applications using the Istio data plane.

Outside of Istiod and Envoy, the remainder of Istio's functionality, features, and capabilities are categorized into the following areas:

* Traffic Management
* Security
* Observability
* Extensibility

### Traffic Management

> The official documentation for traffic management can be found at <https://istio.io/latest/docs/concepts/traffic-management/>.

**Note that at this time, the multi-cluster Traffic Management options such as MCS APIs and Istio multicluster configuration is blocked and denylisted.**

Istio offers the following resources, enabling you to customize the way traffic flow is managed in your cluster:

* **Virtual Services** - Virtual services are used to configure the rules that control how requests for a service are routed within an Istio service mesh. They can be used to route traffic to a specific version of a service, to multiple versions of a service, or to an external service. This enables features like traffic splitting and mirroring, phased rollouts, and work hand in hand with destination rules to configure the features of the Envoy proxies. They also combine with gateways to control ingress and egress traffic in the cluster.

* **Destination Rules** - Destination rules work to configure what happens to traffic destined _for_ a destination or service. Destination rules are interpreted after the Virtual Service configuration. Through Destination Rules, you can configure the load balancing behavior of traffic, group targets into logical subnets based on labels or other criteria, and configure the TLS settings for traffic to a service.

* **Gateways** - Gateways are used to manage inbound and outbound traffic for the mesh. This offers the ability to control how traffic enters and leaves the Istio mesh and are based on edge-deployed Envoy proxies.
  
  Unlike Kubernetes Ingress APIs, Gateways offer all of the capabilities Istio brings to the table. This allows for typical Layer 4-6 properties such as ports, protocols, and TLS settings and enables associating Virtual Services for more complex Layer 7 traffic routing.

  When using Gateways in an egress capacity, you're able to configure the network path for traffic leaving the mesh, configure and restrict which services are allowed to access destinations outside of the mesh, and secure the traffic with mTLS.

  Istio offers two default gateways (`istio-ingressgateway` and `istio-egressgateway`) however users are able to implemenet their own gateway using the Gateway CRD in the cluster.

* **Service Entries** - Service entries allow users to add additional services (internal or external) to the mesh. This enables Istio to manage traffic to and from these services, configure the Envoy proxies, and apply policies to them. Service entries are used to configure the behavior of traffic to external services, services running outside of the mesh, and services running in the mesh that are not managed by Istio.

  For services covered by a Service Entry, you can:
  * Redirect and forward traffic for external destinations.
  * Define retry, timeout, and fault injection policies for external services.
  * Add non-Kubernetes resources, such as standalone VMs, to the mesh.

* **Sidecars** - Sidecar configuration enables limiting the accessibility or workload of the injected sidecar containers. While this isn't a standalone entity, this is a configuration that can be applied to multiple sidecar containers in the mesh. **Note that at this time, the ProxyConfig CRD is denylisted and cannot be used.**

### Security

> The official documentation for security can be found at <https://istio.io/latest/docs/concepts/security/>.

**TODO: Add more information on Istio security features.**

### Observability

> The official documentation for observability can be found at <https://istio.io/latest/docs/concepts/observability/>.

Because Istio has complete visibility into the traffic flowing between services, it can generate a significant amount of detailed telemetry data for all communications within the mesh. This data can be used to monitor and troubleshoot the mesh and the applications running in it. The observability data gathered by Istio includes:

* **Metrics** - Generated metrics focus primarily on latency, traffic, errors, and saturation. There's a separate set of generated metrics for the mesh control plane as well.
* **Access Logs** - Istio can generate access logs similar to what would be seen from something like NGINX or Apache, enabling a better understanding of an individual workload's behavior.
* **Distributed Traces** - Distributed traces are available for every step of a request, detailing the hops between services and the duration the request spent at each step in the path. Support is included for common backends such as Zipkin, Jaeger, Lightstep, and Datadog.

**Note that at this time, the TelemetryCRD is currently denylisted for support by the AKS PG.**

### Extensibility

> The official documentation for extensibility can be found at <https://istio.io/latest/docs/concepts/extensibility/>.

Through the use of WebAssembly, Istio offers the ability to extend the functionality of the Envoy proxies. This enables users to add custom functionality to the proxies without having to recompile or redeploy them. This can be used to add custom filters, authentication, and authorization mechanisms, and more.

**Note that at this time, `EnvoyFilter` and `WasmPlugin` resources are denylisted for support by the AKS PG.**

## Implementation Details

Most of the limitations for the managed Istio offering are related to the variables and configuration exposed through ARM - any restrictions in place at this time are due to the lack of exposed configuration options. The AKS PG is working to expose more configuration options to users in the future while protecting the integrity of the managed Istio offering and customer clusters.

### Mesh Configuration

Istio allows the configuration of the service mesh through the Mesh Configuration settings. The managed Istio add-on in AKS provides configuration options that can be customized.

AKS managed Istio uses a ConfigMap named `istio-shared-configmap-asm-1-24` in the `aks-istio-system` namespace to store mesh configuration settings (where `1-24` represents the Istio version 1.24). This ConfigMap contains the MeshConfig settings that control various aspects of the Istio service mesh behavior.

To modify the mesh configuration in AKS managed Istio:

```bash
# Get the current mesh configuration
kubectl get configmap istio-shared-configmap-asm-1-24 -n aks-istio-system -o yaml

# Edit the mesh configuration
kubectl edit configmap istio-shared-configmap-asm-1-24 -n aks-istio-system
```

Example of editing the mesh configuration to set outbound traffic policy to REGISTRY_ONLY:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-shared-configmap-asm-1-24
  namespace: aks-istio-system
data:
  mesh: |-
    # Add your custom mesh configuration here
    outboundTrafficPolicy:
      mode: REGISTRY_ONLY
    defaultConfig:
      tracing:
        sampling: 10.0
      accessLogFile: /dev/stdout
```

For a complete list of mesh configuration options and how to update them, refer to the [public documentation](https://learn.microsoft.com/en-us/azure/aks/istio-meshconfig) and the [Istio MeshConfig reference](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/).

### Istio and AKS-related Dashboards

The AKS PG has built an Istio dashboard; it's still being worked on and outstanding work can be found at <https://dev.azure.com/msazure/CloudNativeCompute/_boards/board/t/Traffic%20Team/Stories>. The link for the dashboard is <https://aka.ms/istio-dash> and currently has the following limitations:

* It's difficult to calculate the p95 values when the sample count is less than 20 data points.
* Metrics are produced at one hour intervals so the dashboard my miss some data at the start and end.
* Altering the parameters at the top of the dashboard may allow for more efficient slicing of the data.

### Disallowed Features

The AKS PG has taken a denylist approach for features offered by Istio - unless explicitly noted, all features are supported. The following Istio features, resources, and capabilities are currently denylisted:

* WasmPlugin CRDs
* MCS API CRDs
* Istio Multicluster configuration
* ProxyConfig CRDs
* Telemetry CRDs
* IstioOperator CRDs
* WorkloadEntry and WorkloadGroup CRDs
* Modification of Istio CRDs used for internal addon management

The `EnvoyFilter` custom resource is permitted for use with the following filter types and limitations:

* Lua (`type.googleapis.com/envoy.extensions.filters.http.lua.v3.Lua`)
* Compression (`type.googleapis.com/envoy.extensions.filters.http.compressor.v3.Compressor`)
* Local Rate Limit (`type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit`)

Any issues arising from the use of EnvoyFilter configurations in the cluster (for example, from the Lua filter) are outside of the support scope for the addon. Customers should expect at most best effort support and should be prepared to troubleshoot these filters on their own.

The evergreen list of denylisted Istio functionality can be found at <https://learn.microsoft.com/en-us/azure/aks/istio-about#features-that-are-not-supported> and in the engineering documentation at <https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/istio/supported-features>.

## Troubleshooting Guides

Istio TSGs in the Azure Containers Team wiki can be found [under the Networking folder in the AKS TSG section](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Managed-Istio.md).

## Escalating to PG

For now, we are expecting to escalate nearly all the issues to PG. It will go directly to the PG, and bypass EEE. The "Escalate case" button in ASC should send it to the correct team, but you can also use the template link: <https://aka.ms/istio-cri>.

This should send it to AKS->RP directly for triage.

## References

* Microsoft
  * Internal training video: <https://microsoft-my.sharepoint.com/:v:/p/seanteeling/EYZW-MwVVTJJkwnRPCTgOuIBD8aiedHb1vXR5LuU7Hshkg>
  * Engineering Hub for Istio TSGs: <https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/istio>
* Open Source
  * IstioCon 2022 - Istio 0 to 60 Workshop: <https://youtube.com/watch?v=6NHASise7rQ>
  * Istio Upstream Troubleshooting
    * Diagnostic Tools: <https://istio.io/latest/docs/ops/diagnostic-tools> and more specifically, the [guide for debugging Envoy and Istiod](https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/)
    * Common Problems: <https://istio.io/latest/docs/ops/common-problems>
  * Task Guides: <https://istio.io/latest/docs/tasks>

## Owner and Contributors

**Owner:** Adam Margherio <amargherio@microsoft.com>

**Contributors:**

* Adam Margherio <amargherio@microsoft.com>
* Jordan Harder <joharder@microsoft.com>
