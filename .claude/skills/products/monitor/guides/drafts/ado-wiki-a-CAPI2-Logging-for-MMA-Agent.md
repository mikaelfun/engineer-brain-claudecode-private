---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Crypto API 2.0 (CAPI2) Logging for MMA Agent and Upgrade Readiness Connectivity"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FCommon%20Concepts%2FCrypto%20API%202.0%20(CAPI2)%20Logging%20for%20MMA%20Agent%20and%20Upgrade%20Readiness%20Connectivity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Crypto API 2.0 (CAPI2) Logging for MMA Agent and Upgrade Readiness Connectivity

Enable CAPI2 logging to analyze Certificate Chain Validation, Certificate Store Operations, and Signature Validation. Certificate Chain Validation is important for Windows Telemetry clients and the Microsoft Monitoring Agent.
If you suspect HTTPS/SSL inspection is not being bypassed by the customer's egress device, enable CAPI2 logging, reproduce the issue, and analyze the logs.

## Enable CAPI2 Logging

1. Open Event Viewer, and Navigate to Applications and Services Logs -> Microsoft -> Windows -> CAPI2
2. Right Click the Operational log, and then choose Properties.
3. Check the box for "Enable Logging" and set the Maximum Log size to 24000, Click OK.

## Clearing the Certificate Revocation Cache

Before reproducing the customer's issue with CAPI2 logging enabled, clear the certificate revocation cache to eliminate any negatively cached revocation records:

```cmd
certutil -setreg chain\chaincachesyncfiletime atnow
```

## Analyzing the Logs

After obtaining the logs from the customer, load them in Event Viewer by right-clicking the Event Viewer root, and choosing Open Saved Log.

Filter the log for the following Events: **10-11, 30, 50-53, 90**

### Error Identification

Scroll through the log looking for errors. Common error: **0x80092012** (CRYPT_E_NO_REVOCATION_CHECK or similar crypto error). Go to http://errors to decode the error code. Choose the symbolic name that most resembles the type of data you're viewing (Crypto API context).

### Correlating Certificate Chain Events

1. **Event ID 30** — Find the Chain Reference (`chainRef`)
2. **Event ID 11** (Build Chain) — Correlate using the chain reference, find the `TaskID` in `CorrelationAuxInfo`
3. **Event ID 90** — Confirm the TaskId matches Event ID 11's TaskId to view correct X509 Objects

> In practice, Events 30, 11, 90, and 10 often appear together for the same certificate chain verification policy.

### Identifying SSL Inspection

From Event ID 90, expand the certificate chain and check the **issuer** of the certificate for Microsoft endpoints (e.g., `*.events.data.microsoft.com`):

- **Working environment**: Microsoft is the issuer (e.g., `Microsoft IT TLS CA`)
- **SSL inspection detected**: A non-Microsoft entity is the issuer (e.g., proxy/firewall vendor name)

If SSL inspection is detected, the customer must configure their proxy/firewall to bypass SSL inspection for Microsoft monitoring endpoints per: https://docs.microsoft.com/windows/deployment/update/windows-analytics-get-started
