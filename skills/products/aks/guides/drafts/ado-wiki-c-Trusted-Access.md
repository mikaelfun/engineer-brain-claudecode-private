---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Trusted Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Trusted Access

[[_TOC_]]

## Overview

We don't have a lot of troubleshooting information on this yet. For now, we have the following kusto logs. This is a feature used internally by partner teams to connect directly to customer AKS clusters, and bypass any vnet/NSG issues. **The Partner Teams own support for Machine Learning and AKS Backup**

## General troubleshooting step

### How to check whether a cluster is enabled with TrustedAccess

1.From backend ASI page
   ![trustedaccess-asi.png](/.attachments/trustedaccess-asi-e637ad2c-9cd4-4be5-98a9-3f7a90ef660a.png)

   If any trustedaccess rolebinding exists, the cluster has trustedaccess connection to other services.

2.From customer side: `az aks trustedaccess rolebinding list --resource-group <cluster resource group> --cluster-name <cluster name>` and check whether any trustedaccess rolebinding(s) exists.

### Partner service cannot connect to AKS cluster

1. Check the `responseFlags` property during issuetime.

   ```txt
   TrustedaccessIncomingRequestAll
   | where TIMESTAMP > ago(1h)
   | where RPTenant == "<region>"
   | where path contains "<resource_id>"
   ```

   If there is no `responseFlags`, it means the trusted access connection doesn't exist. If there are `responseFlags` but the response is not a `2xx` status code, check the error messages for the reason behind the unsuccessful response.

2. Check the trusted access role bindings: `az aks trustedaccess rolebinding list --resource-group <cluster resource group> --cluster-name <cluster name>`.

   If there is no rolebinding, we should connect partner service dev team. If the rolebinding exists, connect [AKS Security team](mailto:akssec@microsoft.com) for further troubleshooting.

### Target AKS cluster is in invalid state

1. Target AKS cluster is stopped - Dataplane will return a 400 error.

2. Target AKS cluster has certificate expired - responseFlags will be `-`, but the requerst will be rejected with 403 by API server. Please follow [doc](https://learn.microsoft.com/en-us/azure/aks/certificate-rotation) to rotate certificate in this case.

## Kusto Tables

```txt
TrustedaccessIncomingRequestAll
| where TIMESTAMP > ago(1h)
| where RPTenant == "<region>"
| where path contains "<resource_id>"
```

Other tables:

|table|description|
|-|-|
|TrustedaccessIncomingRequest (do not use directly)|envoy gateway log|
|TrustedaccessIncomingRequestAll|refined envoy gateway log|
|TrustedaccessActivity(do not use directly)|all trusted access dataplane component log|
|TrustedaccessAuth|TrustedaccessActivity with auth log filter|
|TrustedaccessDiscovery|TrustedaccessActivity with discovery log filter|
|TrustedaccessMetadata|TrustedaccessActivity with  log filter|

### Queries

#### Dataplane

```txt
TrustedaccessIncomingRequestAll
| where TIMESTAMP > ago(1h)
| where RPTenant == "<region>"
| where path contains "<resource_id>"
```

then look up `responseFlags` property in `%RESPONSE_FLAGS%` of [doc](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage)

- [audit log](https://dataexplorer.azure.com/clusters/aks/databases/AKSccplogs?query=H4sIAAAAAAAAA11PywqCUBDd9xWDK4USatfCIKJFCyOo1nLVQW/aHZk79oA+vrGFRcvznDMbcsLUHlrjcHtDJ35P7lgT5vSAyQvuNTLCaZduj6d1eoAVmIrC+bKMRrEwghXxE5IEgqbPcWb60kqgBnwIuhI+OGupggQ6wx6ziycXCnlh66rwh+uYOmSx6KNYA9FwRrkLFgK9R07GrniA0293bK+a1A6dU55VGweOluzfAoW+b6zzEAj3XtlhtZgGYfEGBHXGpxoBAAA=)

```txt
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where TIMESTAMP > ago(19d)
| where category == "kube-audit"
| extend audit_log = parse_json(tostring(parse_json(properties).log))
| project user=audit_log.user, audit_log.impersonatedUser
| where audit_log_impersonatedUser contains "trusted"
| take 2
```

##### Dataplane Response code

|reason|http status|description|
|-|-|-|
|missing_authorization_bearer_token|401|Request header has doesn't have `Authorization` header/no `Bearer` in `Authorization`|
|authn_invalid_token|401|Authorization header token invalid|
|authn_missing_source_resource_id_claim|401|no xms_mirid|
|authn_invalid_source_resource_id|401|xms_mirod invalid(should not happen)|
|authn_disallowed_impersonate_header|401|impersonate-* header is not allowed|
|authz_invalid_path|404|Request path format doesn't match aks resource id|
|authz_not_found|404|aks resource not exist|
|authz_source_resource_id_not_allowed|403|Resource binding for this aks resource does not exist|
|authz_stopped|400|aks cluster is stopped|

## Partner Team Support Topics

### Machine Learning SAPs (Vitaly Balazevics)

- AML\Other Compute \ Problem with configuring Trusted Access Kubernetes cluster
- AML\Model deployment and serving (Online Endpoints) \ Problem with secure inferencing on Trusted Access enabled kubernetes cluster  

### Backup SAPs for AKS Backup (Prachand Kumar)

- Azure Backup/AKS Backup/Roles and Permission issues  
- Azure Backup/AKS Backup/Restore is taking longer than expected  
- Azure Backup/AKS Backup/Restore is failing  
- Azure Backup/AKS Backup/Issues with Trusted Access  
- Azure Backup/AKS Backup/Issues with Backup Extension  
- Azure Backup/AKS Backup/Issue modifying existing AKS backup  
- Azure Backup/AKS Backup/How-to and general questions  
- Azure Backup/AKS Backup/Backup is taking longer than expected  
- Azure Backup/AKS Backup/Backup is failing

## References

- PG Training Video: <https://microsoft-my.sharepoint.com/:v:/p/weinongw/Efx0qCVuQp9EgMdj237Lh90BVa9WZoy-K-E0i9bJH6EeaA>

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Andrew Schull <anschul@microsoft.com>