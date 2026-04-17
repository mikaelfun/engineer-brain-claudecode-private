---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Check if Services are Running on the Cluster (fluentd, fluent-bit, mdsd)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Check%20if%20Services%20are%20Running%20on%20the%20Cluster%20(fluentd%2C%20fluent-bit%2C%20mdsd)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check if Services are Running on the Cluster (fluentd, fluent-bit, mdsd)

## Overview
The Container Insights agent uses fluentd, fluent-bit, and mdsd processes for collecting and sending data. This guide shows how to verify these processes are running.

## Steps

1. **Connect to the cluster** via Azure Cloud Shell or local CLI.

2. **Exec into an ama-logs pod**:
   ```bash
   kubectl get pods -A | grep ama-logs
   kubectl exec -it ama-logs-xxxxx -c ama-logs -n kube-system -- /bin/bash
   ```

3. **Check each service**:
   - **MDSD**: `ps aux | grep [m]dsd`
   - **Fluent-bit**: `ps aux | grep fluent-bit`
   - **Fluentd**: `ps aux | grep [f]luentd` (expect two processes: supervisor + fluentd)

4. **If any process is not running**: Delete the ama-logs pod to trigger recreation:
   ```bash
   exit  # exit the exec session first
   kubectl delete pod ama-logs-xxxxx -n kube-system
   ```
   Then re-check processes after the pod recreates.
