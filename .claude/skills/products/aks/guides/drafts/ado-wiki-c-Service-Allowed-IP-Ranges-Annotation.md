---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Service Allowed IP Ranges Annotation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Service%20Allowed%20IP%20Ranges%20Annotation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Service Allowed IP Ranges Annotation

[[_TOC_]]

## Overview

Currently, there are two options available to control `LoadBalancer` traffic:

- allowing specified IP ranges to access through the `spec.loadBalancerSourceRanges` property.
- allowing services with specific tags to access through the `azure-allowed-service-tag` annotation.

Using either one individually is fine, but conflict arises when we attempt to use both of them simultaneously. It�s important to understand how these two options, **kube-proxy** and **cloud-controller-manager**, filter traffic differently. When applying `spec.loadBalancerSourceRanges`, both **kube-proxy** will set **iptables** and **cloud-controller-manager** will set **NSG**. However, only **cloud-controller-manager** will set **NSG** when applying the `azure-allowed-service-tag` annotation.

Conflict Scenario: Suppose a service is configured with `spec.loadBalancerSourceRanges = 10.0.0.1/32` and `azure-allowed-service-tag = Foo`. If a source from the service tag `Foo` comes with the IP `10.0.0.2`, it won�t be able to access this service. Even though the **NSG** would permit this traffic, the **iptable** would block it because only the IP within `10.0.0.1/32` is allowed access.

Therefore, we are proposing this feature to allow customers to use both service tags and IP ranges simultaneously to manage LoadBalancer access traffic, rather than using them separately.

## service.beta.kubernetes.io/azure-allowed-ip-ranges

This annotation allows you to specify IP ranges that can access your service. The value should be a comma-separated list of valid CIDR blocks.

1. **DON'T** use this annotation if the property `spec.loadBalancerSourceRanges` is also set, as they will conflict with each other.

### Common issues

#### Invalid CIDR format

If an invalid CIDR format is provided, you'll see an error like this when describing the service:

```txt
Events:
  Type     Reason                Age   From                  Message
  ----     ------                ----  ----                  -------
  Normal   EnsuringLoadBalancer  15s   service-controller    Ensuring load balancer
  Warning  InvalidConfiguration  4s    azure-cloud-provider  Found invalid LoadBalancerSourceRanges [10.0.0.0], ignoring and adding a default DenyAll rule in security group.
  Normal   EnsuredLoadBalancer   1s    service-controller    Ensured load balancer
```

#### Unable to connect to the service after configuring IP ranges

If you're unable to connect to the service after configuring IP ranges:

1. Describe the service to check for any error or warning events:

   ```bash
   kubectl describe service <service-name>
   ```

2. Verify the Network Security Group (NSG) configuration:
   - Locate the NSG associated with the cluster in the Azure portal
   - Confirm the allowed IP ranges are correctly configured as inbound security rules
   - Validate that your client IP falls within one of the allowed ranges

3. Review cloud-controller-manager logs for potential issues:

   ```kusto
   let queryCCP = "<namespace>";
   cluster("akshuba.centralus").database("AKSccplogs").CloudControllerManager
   | where PreciseTimeStamp > ago(2d)
   | where namespace == queryCCP
   | project PreciseTimeStamp, pod, log
   | order by PreciseTimeStamp desc
   ```

## service.beta.kubernetes.io/azure-allowed-service-tags

This annotation allows you to specify Azure service tags that can access your service. Service tags represent groups of IP address prefixes from Azure services.

1. **DON'T** use this annotation if the property `spec.loadBalancerSourceRanges` is also set, as they will conflict with each other. If you need to allow traffic from both service tags and specific IP ranges, use the `service.beta.kubernetes.io/azure-allowed-ip-ranges` annotation instead.

### Common service tag issues

#### Unable to connect to the service after configuring service tags

If you're unable to connect after configuring service tags:

1. Verify the service tags are valid Azure service tags
2. Check that your client IP is included in the IP ranges defined by the service tags
3. Inspect the Network Security Group rules in the Azure portal to confirm they were created properly

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>