# AKS 防火墙与代理 — api-server -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: api-throttling-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: Cluster nodes cannot connect to API server pod. Fi

### aks-1159: AKS cluster creation/start fails with K8SAPIServerConnFailVMExtensionError (exit...

**Root Cause**: Cluster nodes cannot connect to API server pod. Firewall/egress filtering blocking cluster FQDN, or firewall outbound IP not in authorized IP ranges.

**Solution**:
Verify from node: nc -vz <cluster-fqdn> 443. If using egress filtering, allow traffic to cluster FQDN. If authorized IP ranges enabled, add firewall outbound IP to authorized list.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverconnfailvmextensionerror)]`

## Phase 2: Cluster firewall misconfigured, blocking KEDA from

### aks-1269: KEDA add-on fails to start: Failed to get API Group-Resources, EOF error connect...

**Root Cause**: Cluster firewall misconfigured, blocking KEDA from reaching Kubernetes API server

**Solution**:
Configure firewall to meet Azure Global required network rules for AKS egress traffic; verify KEDA pods running in kube-system

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on)]`

## Phase 3: Cluster nodes cannot establish TCP connection to A

### aks-1206: AKS cluster start/create fails with VMExtensionError_K8SAPIServerConnFail (exit ...

**Root Cause**: Cluster nodes cannot establish TCP connection to API server on port 443; firewall or NSG blocking egress to cluster FQDN, or authorized IP ranges blocking firewall outbound IP

**Solution**:
Run 'nc -vz <cluster-fqdn> 443' from node to verify; allow traffic to cluster FQDN in firewall; add firewall outbound IP to authorized IP ranges if enabled

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-k8sapiserverconnfail)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation/start fails with K8SAPIServerConnFailVMExtensionError (exit... | Cluster nodes cannot connect to API server pod. Firewall/egr... | Verify from node: nc -vz <cluster-fqdn> 443. If using egress... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverconnfailvmextensionerror) |
| 2 | KEDA add-on fails to start: Failed to get API Group-Resources, EOF error connect... | Cluster firewall misconfigured, blocking KEDA from reaching ... | Configure firewall to meet Azure Global required network rul... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on) |
| 3 | AKS cluster start/create fails with VMExtensionError_K8SAPIServerConnFail (exit ... | Cluster nodes cannot establish TCP connection to API server ... | Run 'nc -vz <cluster-fqdn> 443' from node to verify; allow t... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-k8sapiserverconnfail) |
