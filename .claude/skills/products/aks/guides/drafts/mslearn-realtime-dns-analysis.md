# Real-time DNS Traffic Analysis with Inspektor Gadget

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-dns-failures-across-an-aks-cluster-in-real-time

## Prerequisites
- Inspektor Gadget installed on cluster
- `GADGET_VERSION=$(kubectl gadget version | grep Server | awk '{print $3}')`

## Step 1: Identify Failed DNS Responses
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields k8s.node,src,dst,name,qtype,rcode \
  --filter "qr==R,rcode!=Success"
```

## Step 2: Identify Slow DNS Queries (>5ms)
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields k8s.node,src,dst,name,qtype,rcode,latency_ns \
  --filter "latency_ns_raw>5000000"
```

## Step 3: Verify Upstream DNS Server Health
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --all-namespaces \
  --fields src,dst,id,qr,name,nameserver,rcode,latency_ns \
  --filter "nameserver.addr==168.63.129.16"
```

## Step 4: Verify Specific Query Gets Response
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  -l app=test-pod \
  --fields k8s.node,k8s.namespace,k8s.podname,id,qtype,qr,name,rcode,latency_ns \
  --filter name==microsoft.com.
```

## Step 5: Verify DNS Responses Contain Expected IPs
```bash
kubectl gadget run trace_dns:$GADGET_VERSION \
  --fields k8s.podname,id,qtype,qr,name,rcode,num_answers,addresses \
  --filter name~myheadless
```

## Key Fields
- `id`: Correlate query with response
- `rcode`: Success/NameError/ServerFailure/Refused
- `latency_ns`: Response time
- `num_answers` / `addresses`: Verify expected IPs
