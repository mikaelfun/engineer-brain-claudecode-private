---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/connection-issues-application-hosted-aks-cluster
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Connection Issues to Apps Hosted in AKS

Inside-out troubleshooting approach for application connectivity.

## Request Flow
Client >> DNS >> AKS LB IP >> AKS Nodes >> Pods

## Steps
1. Check pod status and logs
2. Test pod-level connectivity from test pod
3. Check service configuration and endpoints
4. Test ClusterIP/LoadBalancer/Ingress access
5. Check network policies, NSG, firewall
