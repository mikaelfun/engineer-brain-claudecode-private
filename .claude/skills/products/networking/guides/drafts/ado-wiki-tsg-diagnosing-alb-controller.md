---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Troubleshooting Guides/TSG: Diagnosing ALB Controller installation in Application Gateway for Containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Troubleshooting%20Guides/TSG%3A%20Diagnosing%20ALB%20Controller%20installation%20in%20Application%20Gateway%20for%20Containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Diagnosing ALB Controller installation
ALB Controller is deployed as a pod on the customer's cluster via Helm and is responsible for managing `Application Gateway for Containers` ARM resource, its child resources and its routing configuration.

1. Check the ALB Controller version being used - it's always recommended customer to use the latest release version for helm deployment, check the latest available release from doc link(TODO).
1. Make sure that ALB Controller pods are in the `Running` state.
    ```bash
    kubectl get pods -n azure-alb-system
    NAME                                       READY   STATUS    RESTARTS   AGE
    alb-controller-bootstrap-6648c5d5c-hrmpc   1/1     Running   0          4d6h
    alb-controller-6648c5d5c-au234             1/1     Running   0          4d6h
    ```

1. Check pod logs of `alb-controller` for any error logs.
    ```bash
    kubectl logs -n azure-alb-system -l app=alb-controller | grep "error"

    Example:
    {"level":"error","component":"lb-resources-reconciler","error":"Service 'test-infra/my-service' was not found","error_code":"E3001","time":"2023-issues/20T17:57:23.577642661-07:00","caller":"/workspace/alb-controller/k8s/reconcilers/reconcile.go:106", message="Service 'test-infra/my-service' not found on the cluster. Please create the service on the cluster"}
    ```

    Look up the `error_code` (ex: E3002) and check what range it lies in:
    * Error Code `E1000/E3999` - This is a customer configuration issue. Please refer to [this doc](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1049072/TSG-Configuration-Troubleshooting-flow-for-Application-Gateway-for-Containers) for more details.
    * Error Code `E4000 and up` - This could be a ARM deployment / service issue. Please refer to [this doc](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1027868/TSG-CRUD-Troubleshooting-flow-for-Application-Gateway-for-Containers) for more details.
    * All error codes are documented [here](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1049088/TSG-ALB-Error-Codes-in-Application-Gateway-for-Containers).
