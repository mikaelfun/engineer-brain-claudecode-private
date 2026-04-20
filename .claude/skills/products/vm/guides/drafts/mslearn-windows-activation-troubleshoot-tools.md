---
title: Windows Activation Troubleshooting Tools
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-activation-troubleshoot-tools
product: vm
21vApplicable: true
---

# Windows Activation Troubleshooting Tools on Azure VMs

## Overview
Overview of script-based tools for diagnosing and resolving Windows activation issues on Azure VMs.

## Tools

### 1. Windows Activation Validation
- **Purpose**: Validates activation status, detects misconfigurations, provides actionable guidance.
- **Source**: https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_Activation_Validation

### 2. Azure Instance Metadata Service (IMDS) Certificate Check
- **Purpose**: Verifies IMDS certificates required for activation.
- **Source**: https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_IMDSValidation

## How to Run

### Method 1: Download from GitHub
Download scripts from GitHub and run manually inside VM.

### Method 2: Azure Run Command (Portal)
Navigate to VM > Operations > Run Command > select script from list.

### Method 3: Prepackaged Run Command Scripts
Use action Run Commands via CLI/PowerShell.

## Recommended Workflow
1. Run **Windows Activation Validation** first to verify activation status.
2. If certificate-related errors suspected, run **IMDS Certificate Check**.
3. Apply suggested fixes or refer to official activation troubleshooting documentation.
