---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Troubleshooting Guides/Start Here: Environment Information Gathering for Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)%2FTroubleshooting%20Guides%2FStart%20Here%3A%20Environment%20Information%20Gathering%20for%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Core issue categories

1. [Configuration issues](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1049072/TSG-Configuration-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=configuration-troubleshooting-flow) are related to configurations that customer applies via Gateway API yamls or misconfguration in the identity used by ALB Controller.
2. [CRUDs issues](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1027868/TSG-CRUD-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=crud-troubleshooting-flow-for-application-gateway-for-containers) are failures related to create/update/delete of Application Gateway for Containers ARM resource or its child resources.
3. [Data plane issues](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1036949/TSG-Data-plane-and-Performance-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=tsg%3A-data-plane-and-performance-troubleshooting-flow-for-application-gateway-for-containers) are related to datapath/performance issues like latency / network reachability / 4xx / 5xx issues.

# Gather Fundamental Information for Troubleshooting
- Checking YAMLs on customer's cluster: [link](#checking-yamls-on-customers-cluster)
- Checking ALB Controller deployment and logs: [link](#diagnosing-alb-controller-installation)
- Checking Control Plane (Brain) logs: [link](#diagnosing-control-plane-brain)
- Checking NFVRP logs: [link](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1027868/TSG-CRUD-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=find-nfvrp-logs-for-crud-operations)
- Checking Data Plane logs: [link](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1036949/TSG-Data-plane-and-Performance-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=dig-deeper)

## Checking YAMLs on customer's cluster
Check that `Gateway`/`HTTPRoute`/`ApplicationLoadBalancer` and other custom resources don't have any errors in the `status` section of the object.
```bash
kubectl get gateway -A -o yaml
kubectl get httproute -A -o yaml
kubectl get applicationloadbalancer -A -o yaml
kubectl get backendtlspolicy -A -o yaml
```

* If you see errors in `Gateway`/`HTTPRoute`/`BackendTLSPolicy`, then this is likely a configuration issue. Please refer to [Configuration TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1049072/TSG-Configuration-Troubleshooting-flow-for-Application-Gateway-for-Containers?anchor=configuration-troubleshooting-flow) for more details.
* If you see errors is in `ApplicationLoadBalancer`, then this is an Azure (CRUD) misconfiguration or bugs in the service. Please refer to [CRUD TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1027868/TSG-CRUD-Troubleshooting-flow-for-Application-Gateway-for-Containers) for more details.
* If no errors are seen, then follow the next steps.
* In case you need additional help with regards to the `kubectl` please refer to the following [documentation](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)
