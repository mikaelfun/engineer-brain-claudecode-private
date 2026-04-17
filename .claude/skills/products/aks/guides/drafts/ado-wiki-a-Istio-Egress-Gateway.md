---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/Istio Egress Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FIstio%20Egress%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Istio Egress Gateway: Overview and Troubleshooting Guide

[Main Istio Page](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Addons-and-Extensions/Managed-Istio)

[ACT New Release Brownbag: Istio-Egress Gateway Recording](https://microsoft.sharepoint.com/:v:/t/AzureCSSContainerServicesTeam/EYn0-5jAVnBJncu6f_M8BsoBiS9xnsIgyl1otQHhFHqWcQ?e=ZU96Ua&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)

## Overview

The Istio add-on egress gateway is an Envoy-based proxy that can be used to route outbound traffic from applications in the mesh. The Istio egress gateway is a `ClusterIP` type service and thus isn't exposed externally outside of the cluster.

The Istio add-on egress gateway takes a hard dependency on the [Static Egress Gateway feature](https://learn.microsoft.com/en-us/azure/aks/configure-static-egress-gateway) - users must enable Static Egress Gateway on their cluster prior to deploying an Istio egress gateway.

Users can create multiple Istio add-on egress gateways across different namespaces with a Deployment/Service name of their choice, with a max of `500` egress gateways per cluster. Names must be unique per namespace.

Link to the [Static Egress Gateway troubleshooting guide](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Feature-Specific/Static-Egress-Gateway-IP).

## Troubleshooting Checklist

Before proceeding with the troubleshooting checklist, ensure that the user has met the following prerequisites:

- Users must have Azure CLI `aks-preview` version `14.0.0b2` or later installed to enable an Istio add-on egress gateway.
- Users must enable Static Egress Gateway on their cluster, create an agent pool of mode `gateway`, and configure a `StaticGatewayConfiguration` custom resource before enabling an Istio add-on egress gateway.

### Quick Reference

The following is a brief summary of some common issues and whether they are due to the Istio egress gateway(s), Static Egress Gateway, or a customer misconfiguration:

- If Static Egress Gateway components in the `aks-static-egress-gateway` namespace are crashing or down, or if Istio egress pods are stuck in `containerCreating`, then this is most likely a [Static Egress Gateway error](#static-egress-gateway-errors-or-misconfiguration).
- If the Istio egress pods are ready, and the logs show `info    Envoy proxy is ready` then the Istio egress gateway itself is most likely healthy, and it would be advised to troubleshoot the [Static Egress Gateway](#static-egress-gateway-errors-or-misconfiguration) further.
- If there are any error logs in `istiod` or the Istio egress gateway pods, but the `StaticGatewayConfiguration` resource for the Istio egress gateway has an `egressIpPrefix` assigned to it and there are no other Static Egress Gateway errors, then this is most likely due to an [issue with an Istio component](#istio-egress-gateway-errors-and-misconfigurations).
- If all Istio components are ready and don't show any `error` logs, and Static Egress Gateway components are also healthy and the StaticGatewayConfiguration for the Istio egress gateway has an `egressIpPrefix` assigned, then the error could be due to a [customer misconfiguration of Istio custom resources](#istio-egress-gateway-errors-and-misconfigurations).
- If the Istio egress gateway is showing up in the ARM spec under `serviceMeshProfile.istio.components.egressGateways` and is `enabled`, but the Helm chart and components (Deployment, Service) are not showing up on the customer's cluster, then this could likely be due to a [Helm Reconciliation](#step-4-inspect-helm-reconciliation-status-for-the-istio-egress-gateway) error.

You can also find the ARM spec and status of each Istio egress gateway, as well as Helm Reconciliation errors for a given Istio egress gateway, on the Istio troubleshooting page on ASI:

![items.png](/.attachments/items-1c2ef30f-125d-40a1-9e37-b86c81da322e.png)

![items2.png](/.attachments/items2-15a87ae2-ea40-4377-a328-3d78c601ca13.png)

### Networking and Firewall Errors

#### Step 1: Make sure no firewall or outbound traffic rules block egress traffic

If the customer is using Azure Firewall, Network Security Group (NSG) rules, or other outbound traffic restrictions, ensure that the IP ranges from the `egressIpPrefix` for the Istio add-on egress gateway `StaticGatewayConfigurations` are allowlisted for egress communication.

#### Step 2: Verify cluster CNI plugin

Because Static Egress Gateway is currently not supported on Azure CNI Pod Subnet clusters, the Istio add-on egress gateway isn't supported on Azure CNI Pod Subnet clusters either.

### Egress Gateway Provisioning Issues

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

### Static Egress Gateway Errors or Misconfiguration

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

### Istio Egress Gateway Errors and Misconfigurations

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

## Author and Contributors

**Author:** Jordan Harder <Jordan.Harder@microsoft.com>  
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
