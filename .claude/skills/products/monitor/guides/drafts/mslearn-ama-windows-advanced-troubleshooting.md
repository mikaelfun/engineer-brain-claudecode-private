---
source: mslearn
sourceRef: "azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-advanced-troubleshooting-steps"
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-advanced-troubleshooting-steps"
importDate: "2026-04-21"
type: guide-draft
---

# Advanced Troubleshooting for AMA Installation Issues on Windows VMs

## Step 1: Test IMDS connectivity
- RDP to VM > Admin Command Prompt
- curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2021-01-01"
- If fails: review IMDS-related logs, check if IMDS route exists

## Step 2: Test handler connectivity
- curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance/compute/resourceId?api-version=2021-01-01"
- If fails: review common handler errors

## Step 3: Review network trace
- Use Wireshark/Fiddler to capture network trace
- Analyze connectivity to global.handler.control.monitor.azure.com
- If unresolvable: check DNS, proxy, firewall rules
- If still failing: search known issues or post to Microsoft Q&A forum
