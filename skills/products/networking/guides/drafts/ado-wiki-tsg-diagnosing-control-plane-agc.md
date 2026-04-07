---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Troubleshooting Guides/TSG: Diagnosing Control Plane (Brain) issues in Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Diagnosing%20Control%20Plane%20(Brain)%20issues%20in%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Diagnosing Control Plane (Brain)
Each Application Gateway for Containers resource has a corresponding `ControlPlane` deployment which is hosted by in service subscription. This component gets connected by ALB Controller to receive the routing configuration and programs the dataplane.

To get logs of Control Plane, we first need get the Resource ID of the `Application Gateway for Containers` resource. It should be either present in the Azure Support Center or can be found as follows:
You can get this information from the `status` section of the `ApplicationLoadBalancer` object for managed scenario and `alb.networking.azure.io/alb-id` annotation on Gateway object for bring your own scenario.

Example: Managed scenario
```yaml
apiVersion: alb.networking.azure.io/v1
kind: ApplicationLoadBalancer
metadata:
  name: tc-managed-by-crd
  namespace: customer-infra
spec:
  ....
status:
  conditions:
  - lastTransitionTime: "2023-issues/19T21:03:29Z"
    message: Valid TrafficController
    observedGeneration: 1
    reason: Accepted
    status: "True"
    type: Accepted
  - lastTransitionTime: "2023-issues/19T21:03:29Z"
    message: alb-id=/subscriptions/xxxx/resourceGroups/yyyy/providers/Microsoft.ServiceNetworking/trafficControllers/zzzz  <------------  Resource ID
    observedGeneration: 1
    reason: Deployed
    status: "True"
    type: Ready
```

Example: Bring your own scenario
```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: gateway-01
  namespace: test-infra
  annotations:
    alb.networking.azure.io/alb-id: /subscriptions/xxxx/resourceGroups/yyyy/providers/Microsoft.ServiceNetworking/trafficControllers/zzzz <------------  Resource ID
spec:
  ...
```

Now [go to the Jarvis portal](https://jarvis-west.dc.ad.msft.net/D2302833) and filter the logs using the `resourceID` field and look for errors. You can optionally filter the logs further using `OperationID` from the ALB Controller logs. TODO: Explain how to get OperationID from ALB Controller logs.

## Checking RP logs

Check [this doc](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1027868/TSG-CRUD-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=quick-links) for more details.

## Checking Data Plane logs

Check [this doc](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1036949/TSG-Data-plane-and-Performance-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=quick-links) for more details.
