# Troubleshoot Pods and Namespaces Stuck in Terminating State

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/pods-namespaces-terminating-state

## Steps

### 1. Identify stuck pod
```bash
kubectl get pod --all-namespaces
```

### 2. Delete pod
```bash
kubectl delete <pod-name> --namespace <ns>
```

### 3. Force delete if stuck
```bash
kubectl delete pod <pod-name> -n <ns> --grace-period=0 --force --wait=false
```

### 4. Find resources in namespace
```bash
kubectl get all --namespace <ns>
```

### 5. Delete all resources in namespace
```bash
kubectl delete <resource> <name> -n <ns> --grace-period=0 --force --wait=false
```

### 6. Delete namespace
```bash
kubectl delete namespace <ns> --grace-period=0 --force --wait=false
```

### 7. If namespace still stuck - remove finalizers
```bash
kubectl patch namespace <ns> --patch '{"metadata": {"finalizers": null}}'
```
Then retry `kubectl delete namespace`.

## Key Concept: Finalizers
Finalizers are metadata keys that signal pre-delete cleanup. If a controller doesn't remove them, resources stay in Terminating state indefinitely. Patching finalizers to null forces cleanup.
