---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/IdM (Account Managment & Sync)/Sync - Technical processes to collect information/Health agent showing unhealthy on the Entra ID portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDP%20Processes%20Guidelines%20and%20others%2FIdM%20(Account%20Managment%20%26%20Sync)%2FSync%20-%20Technical%20processes%20to%20collect%20information%2FHealth%20agent%20showing%20unhealthy%20on%20the%20Entra%20ID%20portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Health Agent Showing Unhealthy on the Entra ID Portal

## Step 1: Collect Troubleshooting Script
Run the Connect Health Agent Troubleshooting script:
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/806072/Connect-Health-Agent-Troubleshooting-script

## Step 2: Identify the Unhealthy Agent Type
Confirm which agent is showing unhealthy or fails registration: ADFS, ADDS, or Sync.

## Step 3: Check Proxy Configuration
Confirm if the customer has any proxy on the environment. Check system proxy settings.

## Step 4: Collect Performance Counter Screenshots
- For Sync: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184209/Microsoft-Entra-Connect-Health-Data-Freshness-Alerts-Troubleshooting?anchor=perf-counter-powershell-scripts
- For ADDS: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184209/Microsoft-Entra-Connect-Health-Data-Freshness-Alerts-Troubleshooting?anchor=adds

## Step 5: Force Manual Registration
Force the registration of the Health agent manually via PowerShell. Collect the trace log generated.
Reference: https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-health-agent-install#manually-register-microsoft-entra-connect-health-for-sync

## Step 6: Collect Network Trace During Registration
```cmd
netsh trace start capture=yes tracefile=c:\%computername%_netmon.etl
ipconfig /flushdns
Register-MicrosoftEntraConnectHealthAgent
netsh trace stop
```
If customer uses a proxy, ask for the proxy IP to analyze the trace.

## Step 7: Test Connectivity
```powershell
Test-AzureADConnectHealthConnectivityAsSystem -Role Sync
# OR
Test-AzureADConnectHealthConnectivityAsSystem -Role ADFS
# OR
Test-AzureADConnectHealthConnectivityAsSystem -Role ADDS
```

## Step 8: Verify Prerequisites
https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-health-agent-install#requirements

## Step 9: Verify Outbound Connectivity
Confirm outbound endpoints are accessible:
https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-health-agent-install#outbound-connectivity-to-azure-service-endpoints

## Step 10: Verify Services Running
Confirm these 2 services are running:
- Microsoft Entra Connect Health Sync Insights Service
- Microsoft Entra Connect Health Sync Monitoring Service

## Step 11: Verify .NET Framework Version
Confirm customer is running .NET Framework 4.5+. Check via Control Panel.
Reference: https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/reference-connect-health-version-history#may--june-2023
