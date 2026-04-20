---
title: AKS Pod Packet Capture Guide (tcpdump)
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/###Troubleshooting--MUST READ!!###/#Troubleshooting Guides/How to capture tcpdump on AKS pod.md
product: networking
tags: [aks, tcpdump, packet-capture, crictl, nsenter, pod]
21vApplicable: true
---

# AKS Pod Packet Capture Guide

## Steps
1. Identify target Pod Node: kubectl get pods -o wide
2. Shell into Node: kubectl node-shell <node-name>
3. Find Container ID: crictl ps (first column)
4. Get PID: crictl inspect --output go-template --template {{.info.pid}} <container-id>
5. Enter Pod network namespace: nsenter -n -t <PID>
6. Change dir to /var/tmp (avoid Permission Denied)
7. Capture: tcpdump -i eth0 port <PORT> -w name.pcap

## Notes
- Alternative: tcpdump -i any on Node captures all interfaces including all Pods
- Will show duplicate packets when analyzing, slightly more noise
