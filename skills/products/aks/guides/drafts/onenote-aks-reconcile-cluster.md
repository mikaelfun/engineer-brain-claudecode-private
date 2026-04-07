# TSG: Reconcile AKS Cluster

## When to Use

AKS cluster stuck in **Failed** state after a transient failure. Reconcile makes the current state reach the goal state without recreating resources already in goal state.

## Important Notes

- Reconcile is **safe**: resources already in goal state won't be re-created
- Can still request RCA from PG after reconciling
- No side effects on working resources (settings, workloads preserved)

## 4 Methods to Reconcile

### Method 1: az aks upgrade (same version) — Customer self-service

```bash
az aks upgrade \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --kubernetes-version <CURRENT_VERSION>
```

Reference: https://docs.azure.cn/zh-cn/aks/upgrade-cluster

### Method 2: REST API PUT — Customer self-service

Send a PUT request via Postman or similar tool to the AKS resource endpoint.

### Method 3: az resource update — Customer self-service

```bash
az resource update --ids $RSURI
```

### Method 4: Escort + Reconcile — Internal (Engineer assisted)

Use Jarvis Actions to perform reconcile operation via escort access.

## Decision Guide

| Scenario | Recommended Method |
|----------|-------------------|
| Customer can do it themselves | Method 1 (simplest) or Method 3 |
| Need quick mitigation | Method 1 |
| Transient issue, need RCA | Any method + request RCA from PG |
| Customer cannot self-service | Method 4 (internal) |

---
*Source: MCVKB 18.5 | aks-onenote-056*
