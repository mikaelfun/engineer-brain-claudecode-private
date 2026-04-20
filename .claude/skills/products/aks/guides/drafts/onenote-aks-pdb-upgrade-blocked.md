# [AKS] Upgrade/Scale-Down Blocked by PodDisruptionBudget (PDB)

**Source:** MCVKB/VM+SCIM/18.29  
**Type:** Known Issue  
**ID:** aks-onenote-015  
**Product:** AKS (Mooncake)  
**Date:** 2021-10-28

## Symptom

- AKS upgrade (e.g., 1.16 → 1.17) hangs indefinitely
- Node drain never completes
- Operation eventually times out (see aks-onenote-009 for 2h40m timeout)
- No obvious error in backend logs — only visible in kube-audit

## Root Cause

A **PodDisruptionBudget (PDB)** configured with:
- `maxUnavailable: 0` or `maxUnavailable: "0%"`, OR
- `minAvailable: 100%` or `minAvailable: <replica-count>`

...prevents **voluntary eviction** of pods during node drain. Kubernetes cannot evict a pod if doing so would violate the PDB. Drain hangs indefinitely.

**K8s upgrade flow:**
1. Upgrade control plane (fast, managed by platform)
2. For each agent node: add a new node → drain old node → delete old node
3. If drain is blocked by PDB → stuck at step 2

**Common culprit:** `coredns` PDB in multi-node-pool clusters.

## Diagnosis

### Check PDB Status

```bash
kubectl get pdb --all-namespaces
kubectl describe pdb <pdb-name> -n <namespace>
```

### Check Kube-Audit for Pod Activity

```kusto
-- akscn.kusto.chinacloudapi.cn / AKSccplogs
union
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where ccpNamespace == '<ccp-namespace>'
| where PreciseTimeStamp >= datetime(START) and PreciseTimeStamp <= datetime(END)
| extend Log = extractjson('$.log', properties, typeof(string))
| extend _jlog = parse_json(Log)
| extend verb = extractjson('$.verb', Log, typeof(string))
| where verb !in ('get', 'list', 'watch')
| where properties contains "<pod-name>"   -- e.g. "coredns-596bdd9f49-bhnpv"
| project PreciseTimeStamp, verb, user = tostring(_jlog.user.username), Log
```

## Solution

1. **Identify** blocking PDBs: `kubectl get pdb --all-namespaces`
2. **Temporarily delete or relax** the blocking PDB:
   ```bash
   kubectl delete pdb <pdb-name> -n <namespace>
   # OR: edit to set maxUnavailable: 1
   kubectl patch pdb <pdb-name> -n <namespace> --type=json \
     -p='[{"op":"replace","path":"/spec/maxUnavailable","value":1}]'
   ```
3. **Resume** upgrade or scale-down
4. **Re-apply** original PDB after operation completes:
   ```bash
   kubectl apply -f pdb-original.yaml
   ```

## References

- https://kubernetes.io/docs/tasks/run-application/configure-pdb/
