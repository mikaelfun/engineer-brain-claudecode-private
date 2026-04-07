---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Custom Logging with FluentBit"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FCustom%20Logging%20with%20FluentBit"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Custom Logging with FluentBit

## Objective

Implementing a custom logging from AKS cluster to Log Analytics Workspace. For example, if we need to get the logging for some of the components deployed on a namespace (eg. kube-system) without activating the logging for entire namespace, we can deploy this kind of DaemonSet solution.

## Prerequisites

AKS Cluster with monitoring Add On enabled.
Before we deploy our objects, we need to obtain the **Workspace Id** and **Primary Key** for the Log Analytics workspace.

## Manifests

Deploy the following resources in the `logging` namespace:

1. **ServiceAccount** (`fluent-bit`) — identity for the DaemonSet
2. **ClusterRole** (`fluent-bit-read`) — read access to namespaces, pods
3. **ClusterRoleBinding** — binds the ClusterRole to the ServiceAccount
4. **ConfigMap** (`fluent-bit-config`) — FluentBit configuration including:
   - `fluent-bit.conf` — main config (SERVICE, INCLUDE directives)
   - `input-kubernetes.conf` — tail input from `/var/log/containers/*.log`
   - `filter-kubernetes.conf` — Kubernetes metadata enrichment
   - `output-azure.conf` — output to Azure Log Analytics (requires Customer_ID and Shared_Key)
   - `parsers.conf` — parsers for docker, json, syslog, apache, nginx formats
5. **Secret** (`loganalytics`) — base64-encoded WorkspaceID and WorkspaceKey
6. **DaemonSet** (`fluent-bit`) — runs FluentBit on every node with tolerations for master/NoSchedule/NoExecute

### Key Configuration Points

- FluentBit image: `fluent/fluent-bit:1.0.6`
- Prometheus metrics exposed on port 2020
- Volume mounts: `/var/log` and `/var/lib/docker/containers` (read-only)
- Parser section in ConfigMap can be customized to filter for specific file type/name

## Verification

In Log Analytics, find logs in the `Fluentbit_CL` table.

## References

- https://samcogan.com/export-kubernetes-logs-to-azure-log-analytics-with-fluent-bit/

## Point of Contact

Ovidiu Borlean (oborlean@microsoft.com)
