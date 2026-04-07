---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/CoreDNS testing in AKS clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCoreDNS%20testing%20in%20AKS%20clusters"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Testing DNS resolution in AKS containers

## Summary and Goals

This script implementation is used for testing name resolution across the CoreDNS endpoints in AKS cluster.
It will perform the networking connectivity check directly on the IP address of CoreDNS instances,
name resolution in an extended loop for checking the availability to respond to DNS queries, and also
can enable the logging process for the entire CoreDNS deployment.

## Prerequisites

This script should be run in a **bash** instance. It requires a working AKS cluster along with
**kubectl** configured for accessing the cluster. It was tested with an nginx Pod (Debian based)
but it can be customized with any other base image.

## Usage

Copy the file content locally and make it executable:

```bash
chmod +x ./kubectl-dnstest
```

### Modes

| Mode | Description |
|------|-------------|
| (no args) | Deploy nginx test pod, install tools, test TCP connectivity to all CoreDNS endpoints on port 53 |
| `query` | Execute 20 nslookup queries for microsoft.com against each CoreDNS endpoint |
| `reload` | Delete CoreDNS pods one by one (force restart) |
| `logging` | Enable CoreDNS logging by deploying coredns-custom ConfigMap |

### Script

```bash
#!/bin/bash

if [ "$#" -eq 0 ];
then
  echo "CoreDNS CheckUp"
  echo "Usage: "
  echo "kubednscheck "
  IPS=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].status.podIP}')
  echo "Deploy nginx test Pod"
  kubectl run nginx --image=nginx
  sleep 8
  kubectl exec -it nginx -- apt update
  kubectl exec -it nginx -- apt install netcat -y
  kubectl exec -it nginx -- apt install dnsutils -y
  for instance in $IPS;
    do
      for i in {1..20}; do kubectl exec -it nginx --  nc -zv $instance 53; done;
  done
elif [[ "$1" == "query" ]];
then
  IPS=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].status.podIP}')
  for instance in $IPS;
    do
      for i in {1..20}; do kubectl exec -it nginx --  nslookup microsoft.com $instance; done;
  done
elif [[ "$1" == "reload" ]];
then
  POD=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].metadata.name}')
  for podName in $POD;
     do
       kubectl delete pod -n kube-system $podName;
     done
elif [[ "$1" == "logging" ]];
then
cat << EOF > ./coredns-logging.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  log.override: |
        log
EOF
kubectl apply -f ./coredns-logging.yaml
fi
```

## Involved Components

- nginx Pod (test pod for DNS queries)
- CoreDNS pods in kube-system namespace (label: k8s-app=kube-dns)
- coredns-custom ConfigMap (for enabling logging)

Point of contact: Ovidiu Borlean (oborlean@microsoft.com)
