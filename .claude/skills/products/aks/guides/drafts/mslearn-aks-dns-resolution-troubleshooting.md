---
title: AKS DNS Resolution Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/basic-troubleshooting-dns-resolution-problems
product: aks
tags: [dns, coredns, troubleshooting, connectivity, network]
---

# AKS DNS Resolution Troubleshooting Guide

## Overview
Structured workflow for diagnosing, isolating, and fixing DNS resolution problems in AKS clusters.
Uses scientific method: Collect facts -> Hypothesis -> Action plan -> Observe -> Repeat.

## Step 1: Collect Facts
- Where does DNS fail? (Pod / Node / Both)
- What DNS error? (Timeout / NXDOMAIN / Other)
- Frequency? (Always / Intermittent / Pattern)
- Which records? (Specific domain / Any domain)
- Custom DNS config? (Custom DNS on VNet / Custom CoreDNS config)

## Step 2: Test at Different Levels

### CoreDNS Pod Level
Get CoreDNS pod IPs, dig from test pod against each pod IP.

### CoreDNS Service Level
Dig from test pod against kube-dns service IP.

### Node Level
Check /etc/resolv.conf nameservers, dig from node.

### VNet DNS Level
Check VNet DNS server config independently.

## Step 3: Health and Performance Check
- kubectl get/top pods for CoreDNS
- kubectl describe node for resource allocation
- kubectl logs for CoreDNS errors
- Container insights for deeper monitoring

## Step 4: DNS Traffic Analysis

### Real-time: Inspektor Gadget
trace_dns gadget with fields: src,dst,name,qr,qtype,id,rcode,latency_ns

### Capture: Dumpy/Retina
Capture port 53 traffic, export pcap, analyze with Wireshark.
Key metrics: server failure %, query/response ratio, max response time.

## Step 5: Problem Classification
| Type | Indicators |
|------|------------|
| Performance | Intermittent timeouts, resource exhaustion, I/O throttling |
| Configuration | NXDOMAIN, custom DNS/CoreDNS misconfig |
| Network | Packet loss, kube-proxy issues, external DNS dependency |

## Step 6: Resolution
- Performance: dedicated system node pool, ephemeral OS disks, Node Local DNS
- Configuration: review CoreDNS custom config, private DNS zone links
- Network: check CNI/kube-proxy, may need AKS support
