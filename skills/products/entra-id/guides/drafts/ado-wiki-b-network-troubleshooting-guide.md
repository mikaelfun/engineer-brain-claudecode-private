---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Network Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FNetwork%20Troubleshooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Network Troubleshooting Guide

## Overview

This guide helps with troubleshooting network connectivity issues related to Entra ID authentication. First step at any time there is a network related error: customer should always engage their networking team first or the service provider support team for where the application is hosted.

## Get a network capture

To capture a network trace on Windows on the problem device:

1. Create a folder at `C:\Temp`
2. Open administrative command prompt
3. Run:
   ```cmd
   netsh trace start capture=yes tracefile="c:\temp\nettrace.etl"
   ```
4. Reproduce the issue
5. Stop trace:
   ```cmd
   netsh trace stop
   ```
6. Upload the `nettrace.etl` file and `nettrace.cab` file to Microsoft for review

## Measure DNS resolution time

DNS resolution can cause long delays. On the problem device run:

```powershell
Measure-Command {[System.Net.Dns]::GetHostAddresses("login.microsoftonline.com")}
```

Replace the hostname with the problem endpoint hostname.

If the hostname cannot be resolved or has a long latency, network team must be engaged based on where the application is hosted.
