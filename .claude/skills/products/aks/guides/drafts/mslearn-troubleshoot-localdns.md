---
title: Troubleshoot LocalDNS in AKS
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-localdns
product: aks
21vApplicable: true
---

# Troubleshoot LocalDNS in AKS

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-localdns)

## Overview

LocalDNS is an AKS preview feature that runs a per-node DNS resolver (CoreDNS-based) on 169.254.10.10 (VnetDNS) and 169.254.10.11 (KubeDNS). This guide covers diagnosing DNS resolution failures when LocalDNS is enabled.

## Diagnostic Patterns to Identify

Before troubleshooting, identify:
1. Is DNS failure constant or intermittent?
2. Affected scope: all nodes, specific node pool, subset of nodes, single node?
3. Zone-specific (Azure availability zone)?
4. Protocol: TCP, UDP, or both?
5. DNS zone: cluster.local, root (.), or specific zone?

## Step-by-Step Diagnosis

### 1. Deploy dnsutils test pod

Option 1: simple test pod
  kubectl apply -f https://k8s.io/examples/admin/dns/dnsutils.yaml

Option 2: target specific node via nodeSelector (kubernetes.io/hostname: <NODE>)

### 2. Enable query logging

Modify LocalDNS config to set queryLogging: Log for relevant zones:

  az aks nodepool update --name mynodepool1 --cluster-name myAKSCluster --resource-group myResourceGroup --localdns-config ./localdnsconfig.json

Warning: This triggers a reimage operation on the node pool.

For single-node diagnosis (ephemeral, non-persistent):
  SSH to node, edit /opt/azure/containers/localdns/localdns.corefile
  Change "errors" to "log" for desired zones, then: systemctl restart localdns

### 3. Generate and verify DNS traffic

  # Test KubeDNS (169.254.10.11)
  kubectl exec dnsutils -- dig bing.com +ignore +noedns +search +time=10 +tries=6

  # Test VnetDNS (169.254.10.10)
  kubectl exec dnsutils -- dig bing.com +ignore +noedns +search +time=10 +tries=6 @169.254.10.10

### 4. View LocalDNS logs

  journalctl -u localdns              # all logs
  journalctl -u localdns --reverse    # latest first
  journalctl -u localdns -f           # follow live
  journalctl -u localdns | grep <domain>  # filter by domain

## Key Architecture Notes

- KubeDNS traffic -> 169.254.10.11 (ClusterListenerIP) -> forwards to CoreDNS (10.0.0.10)
- VnetDNS traffic -> 169.254.10.10 (NodeListenerIP) -> forwards to Azure DNS (168.63.129.16)
- LocalDNS uses CoreDNS with caching, stale-serve, and loop detection
- Config file: /opt/azure/containers/localdns/localdns.corefile
