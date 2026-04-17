# AKS Application Connection Issues Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/connection-issues-application-hosted-aks-cluster

## Basic Request Flow

```
Client >> DNS >> LB/AppGW IP >> AKS Nodes >> Pods
```

Extra components possible: NGINX Ingress, AGIC, Azure Front Door, API Management, internal LB.

## Inside-Out Troubleshooting Approach

### Step 1: Check Pod Health

```bash
kubectl get pods -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> [-c <container>] [--previous]
```

Test pod-level connectivity:
```bash
kubectl run -it --rm aks-ssh --image=debian:stable
apt-get update -y && apt-get install dnsutils curl netcat-traditional -y
curl -Iv http://<pod-ip>:<port>
nc -z -v <pod-ip> <port>  # for non-HTTP protocols
```

### Step 2: Check Service

```bash
kubectl get svc -n <namespace>
kubectl describe svc <service-name> -n <namespace>
kubectl get endpoints
```

Verify:
- Pod IP appears in service Endpoints
- Labels/Selectors match between pod and service

#### ClusterIP Service Test
```bash
# From test pod inside cluster:
curl -Iv http://<service-cluster-ip>:<port>
```

#### LoadBalancer Service Test
```bash
# From outside cluster:
curl -Iv http://<external-ip>:<port>
```

If LoadBalancer fails:
- Check service events
- Verify NSGs allow incoming traffic on service port

### Step 3: Check Ingress (if applicable)

```bash
kubectl get ing -n <namespace>
kubectl describe ing <ingress-name> -n <namespace>
kubectl get svc -n <ingress-namespace>  # check ingress controller service
kubectl logs <ingress-controller-pod> -n <ingress-namespace>
```

Verify:
- Backend services are running and responding on correct ports
- Ingress rules (host, path, backend) configured correctly
- Ingress controller logs show incoming requests

If no log entries for requests:
- Requests may not be reaching cluster
- Check LB/AppGW backend configuration
- Check NSG on AKS nodes/subnet

## Common Issues

| Symptom | Likely Cause |
|---------|-------------|
| Pod not Running/Ready | Check events, logs, resource limits |
| Endpoints empty | Labels/Selectors mismatch |
| LB service timeout | NSG blocking, missing backend pool |
| Ingress 502/503 | Backend pod not ready, wrong port |
| Connection Timed Out | NSG, firewall, or network policy |

## Key Tips

- Always get HTTP response codes at each hop to isolate the problem
- Packet captures useful for non-HTTP traffic
- NSG at subnet level is NOT managed by AKS (only NIC-level is)
- Check network policies if traffic blocked between namespaces
