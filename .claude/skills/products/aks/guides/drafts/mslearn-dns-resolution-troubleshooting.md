# AKS DNS Resolution Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/basic-troubleshooting-dns-resolution-problems

## Overview
Structured workflow for diagnosing DNS resolution failures in AKS using scientific method: collect facts, hypothesize, action plan, observe, repeat.

## Step 1: Collect Facts
- Where fails: Pod / Node / Both
- Error type: Timeout / No such host / Other
- Frequency: Always / Intermittent / Pattern
- Scope: Specific domain / Any domain
- Custom DNS: VNet custom DNS / CoreDNS custom config

## Step 2: Test DNS at Each Layer
1. **CoreDNS pod level**: `dig +short <FQDN> @<coredns-pod-ip>` from test pod
2. **CoreDNS service level**: `dig +short <FQDN> @<kube-dns-service-ip>`
3. **Node level**: `dig +short <FQDN> @<node-dns-server>` (from /etc/resolv.conf)
4. **VNet DNS level**: Test upstream DNS servers directly

## Step 3: Check Health & Performance
- `kubectl get pods -l k8s-app=kube-dns -n kube-system`
- `kubectl top pods -n kube-system -l k8s-app=kube-dns`
- `kubectl top nodes` (check nodes hosting CoreDNS)
- `kubectl logs -l k8s-app=kube-dns -n kube-system`
- Check node resource overcommit: `kubectl describe node | grep -A5 'Allocated resources'`

## Step 4: Analyze DNS Traffic
- **Real-time**: Inspektor Gadget `trace_dns` gadget
- **Capture**: Dumpy/Retina Capture + Wireshark analysis
- Key metrics: RCODE distribution, query/response mismatch %, max latency

## Problem Type Classification
| Type | Indicators |
|------|-----------|
| Performance | Resource exhaustion, I/O throttling, high CoreDNS latency |
| Configuration | NXDOMAIN errors, custom DNS/CoreDNS config issues |
| Network | Packet loss, pod-to-pod or north-south connectivity issues |

## Remediation
- **Performance**: Dedicated system node pool, ephemeral OS disks, Node Local DNS
- **Configuration**: Review CoreDNS custom ConfigMap, VNet DNS settings, private DNS zone links
- **Network**: Check NSG/firewall rules, kube-proxy health, CNI issues
