# Monitor ai-by-design

**Entries**: 8 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log query returns error: 'Your query cannot be executed as it was throttled b... | System throttles queries by design to protect stability and service level for... | Wait and resend the query. Refine queries to use fewer resources per KQL best... | 8.5 | ADO Wiki |
| 2 | Application Insights request telemetry geo-location fields (client_City, clie... | Application Insights does not support geo-location lookup using IPv6 addresse... | Implement a custom TelemetryInitializer to set Context.Location.* properties ... | 8.5 | ADO Wiki |
| 3 | Activity Logs show entries initiated by 'Windows Azure Application Insights' ... | By design. 'Windows Azure Application Insights' / 'Azure Monitor System' is a... | Educate customer: calls are expected and required by Azure services. To ident... | 8.5 | ADO Wiki |
| 4 | End-to-End Transaction Details shows hundreds/thousands of unrelated telemetr... | APIM default correlation protocol is 'Legacy', using Request-Id header which ... | Set APIM telemetry correlation protocol setting to 'None' | 8.5 | ADO Wiki |
| 5 | Hundreds or thousands of unrelated telemetry items (requests, dependencies, e... | APIM default correlation protocol is 'Legacy', using Request-Id HTTP header. ... | Set the APIM telemetry correlation protocol to 'None' instead of 'Legacy'. | 8.5 | ADO Wiki |
| 6 | Customer reports unexpected exceptions appearing in Application Insights and ... | Application Insights logs application exceptions by design. Exceptions in AI ... | If ask is about AI not logging exceptions -> AI team handles. If ask is about... | 8.5 | ADO Wiki |
| 7 | Customer asks why Application Insights shows specific exceptions (e.g. SQLExc... | Application Insights logs exceptions thrown by the monitored application as e... | Clarify that App Insights is working correctly by surfacing application excep... | 8.5 | ADO Wiki |
| 8 | Customer reports issues with Azure AD B2C VS Code extension for viewing Appli... | The Azure AD B2C VS Code extension (AzureADB2CTools.aadb2c) is NOT developed ... | Direct customer to file a GitHub issue at https://github.com/azure-ad-b2c/vsc... | 8.5 | ADO Wiki |
