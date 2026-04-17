---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Diagnostics and Monitoring/Winfield Health"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FDiagnostics%20and%20Monitoring%2FWinfield%20Health"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Winfield Infrastructure Health

Limited Up/down health status is available with:

```powershell
Invoke-WebRequest https://portal.autonomous.cloud.private/api/ping
Get-WinfieldHealthState
```

Config information provided by:

```powershell
Get-WinfieldApplianceSettings
Get-WinfieldObservabilityConfiguration
```

More comprehensive health information is provided when components are integrated with the robust health service, and additional diagnostics tools comparable to `Test-AzureStack` are a Post-GA feature request:
[Feature 30012115](https://msazure.visualstudio.com/One/_workitems/edit/30012115): Command-line tool to assess Winfield infra VM health state
