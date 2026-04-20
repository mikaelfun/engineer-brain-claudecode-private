---
title: VM Assist - Linux Guest Agent Troubleshooting Tool
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-azure-guest-agent-tools-vmassist
product: vm
date: 2026-04-18
21vApplicable: true
---

# VM Assist - Linux Guest Agent Troubleshooting Tool

## Overview
VM Assist is a diagnostic tool (bash + Python scripts) for detecting issues affecting the Linux Guest Agent and general VM health. Output designed for serial console viewing.

## Key Features

### Bash Checks
- OS family detection
- Guest Agent service identification
- Python path identification from agent service
- Package and repository info for agent and Python
- Basic connectivity checks to wire server and IMDS
- If python2 detected: script exits with gathered info

### Python Analysis (deeper)
- Source/package identification for guest agent and Python
- Service/package status checks (SSH PoC)
- Guest Agent configuration checks
- Connectivity checks for agent requirements
- Basic system configuration and status checks

## Prerequisites
- VM must boot to full OS (not emergency/maintenance mode)
- Root-level access (sudo or direct login)

## How to Run
1. Download from: https://github.com/Azure/azure-support-scripts/blob/master/vmassist/linux/README.md
2. Run: sudo vmassist.sh

## Known Limitations
- Do not run on appliances (no general purpose OS)
- Non-PAYG RHEL/SUSE may show false positive repository warnings
- Ubuntu 24.04 has different SSH service architecture, may flag incorrectly

## When to Use
- Customer reports guest agent issues on Linux VM
- Need quick diagnostic data for support case
- Extension installation/execution failures
- VM health assessment
