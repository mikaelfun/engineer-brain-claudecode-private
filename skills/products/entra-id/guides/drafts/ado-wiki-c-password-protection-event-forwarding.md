---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Password Protection for On-Premise/Azure AD Azure AD Password Protection for On-Premise (Event Forwarding)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Password%20Protection%20for%20On-Premise%2FAzure%20AD%20Azure%20AD%20Password%20Protection%20for%20On-Premise%20(Event%20Forwarding)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Password Protection - Event Forwarding

## Summary

Guide for centrally managing Password Protection DC Agent events using Windows Event Forwarding. Useful for customers who want to aggregate banned password events across all domain controllers.

**Note**: Event Forwarding can cause significant load on the Collector server. Only forward highly significant events. Consider a Refresh interval of 300 seconds.

## Configure the Event Collector Server

1. Install the DC Agent on a domain-joined member server (Collector). This installs message DLLs for reading forwarded events.
2. Set the **Azure AD Password Protection DC Agent** service to **Manual** and **Stop** it.
3. Enable Windows Event Collector service:
   ```cmd
   wecutil qc
   ```
4. Configure WS-Management:
   ```cmd
   winrm quickconfig
   ```
5. Create Event Subscription for `AzureADPasswordProtection-DCAgent/Admin` logs:
   - Subscription name: `AADPP-DCAgent-Admin`
   - Use **Collector initiated** mode
   - Add all DCs with DC Agent installed
   - Filter by significant Event IDs: `10016,10017,10024,10025,30001,30006`

## Key Password-Validation Events

| Event Type | Password Change | Password Set |
|---|---|---|
| Pass | 10014 | 10015 |
| Fail (customer policy) | 10016, 30002 | 10017, 30003 |
| Fail (Microsoft policy) | 10016, 30004 | 10017, 30005 |
| Audit-only Pass (would fail customer) | 10024, 30008 | 10025, 30007 |
| Audit-only Pass (would fail Microsoft) | 10024, 30010 | 10025, 30009 |
| No policy available yet | 30001 | 30001 |
| Policy now enforcing | 30006 | 30006 |

## Configure Domain Controllers

1. Edit **Default Domain Controllers Policy** > Computer Configuration > Policies > Administrative Templates > Windows Components > Event Forwarding
2. Enable **Configure Target Subscription Manager**:
   ```
   Server=http://collector.contoso.com:5985/wsman/SubscriptionManager/WEC,Refresh=300
   ```
   **Recommended**: Use HTTPS with port 5986 and `IssuerCA=<thumbprint>`.
3. Run `gpupdate /force` on all DCs.

## Validating

1. Reset a user password to a banned one (e.g., `P@ssword`, `Password123!`)
2. In Audit mode: Event 10025 logged. In Enforce mode: Event 10017 logged.
3. Events replicate to Collector under `AzureADPasswordProtection/DCAgent/Admin`

## Filtering Forwarded Logs

### By Username (XML filter)
```xml
<QueryList>
  <Query Id="0" Path="Microsoft-AzureADPasswordProtection-DCAgent/Admin">
    <Select Path="Microsoft-AzureADPasswordProtection-DCAgent/Admin">*/EventData/Data="username"</Select>
  </Query>
</QueryList>
```

### By DC FQDN
Use the Computer(s) filter in Event Viewer.
