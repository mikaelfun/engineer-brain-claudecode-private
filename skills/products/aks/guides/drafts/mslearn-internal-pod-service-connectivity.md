# Internal Pod/Service Connectivity Troubleshooting (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-connection-pods-services-same-cluster
> Status: draft (from mslearn-scan)

## Overview
Structured checklist for diagnosing connectivity issues between pods and services within the same AKS cluster.

## Step 1: Set Up Test Pod
```bash
kubectl run -it --rm aks-ssh --namespace <ns> --image=debian:stable
apt-get update -y && apt-get install dnsutils curl netcat-openbsd -y
```

Test connectivity:
```bash
curl -Iv http://<pod-ip>:<port>
nc -z -v <endpoint> <port>
```

## Step 2: Verify Pod Status
```bash
kubectl get pods -n <ns>          # Check Running + READY
kubectl logs <pod> -n <ns>        # Check for errors
kubectl logs <pod> --previous     # Check previous crash logs
```

## Step 3: Check Network Policies
```bash
kubectl get networkpolicies -A
```
Look for custom policies that may block pod-to-pod traffic.

## Step 4: Verify Service and Endpoints
```bash
kubectl get services -n <ns>
kubectl describe services <svc> -n <ns>    # Check Endpoints field
kubectl get endpoints                       # Verify pod IP listed
```

If endpoint is missing: pod selector label mismatch or pod not ready.

## Step 5: Test via Service IP
```bash
curl -Iv http://<service-cluster-ip>:<port>
```

## Step 6: Restart System Pods (if needed)
```bash
kubectl delete pods -n kube-system -l component=kube-proxy
kubectl delete pods -n kube-system -l k8s-app=kube-dns
```

## Step 7: Check Node Resource Usage
```bash
kubectl top nodes
kubectl top pods
```

## Key Diagnostics
- Pod IP not in service endpoints → check label selectors
- Service unreachable → check kube-proxy and CoreDNS
- Intermittent → check node resources and network policies

## 21V Applicability
Fully applicable to 21V environments.
