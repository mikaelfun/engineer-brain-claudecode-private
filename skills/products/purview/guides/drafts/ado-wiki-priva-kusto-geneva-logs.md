---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Privacy - Microsoft Priva/Kusto & Geneva logs access"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FPrivacy%20-%20Microsoft%20Priva%2FKusto%20%26%20Geneva%20logs%20access"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto & Geneva Logs Access for Microsoft Priva

The Kusto and Geneva endpoint is the same for both Purview and Priva.

## Geneva
- **Endpoint**: Diagnostics PROD
- **Namespaces**: Events/tables are spread across multiple namespaces. For Privacy* events the main namespaces are:
  - MsPurviewPrivacy
  - PrivacyAssessmentProd
  - PrivacyConsentProd

## Kusto
- **Endpoint**: https://babylon.eastus2.kusto.windows.net
- **Database**: babylonMdsLogs
- **Tables**:
  - WebScanAgent
  - ScanningLog
  - All tables prefixed with "Privacy" (e.g., PrivacyAssessmentLogEvent, PrivacyConsentLogEvent, etc.)

## Access Request
More information on requesting access to Kusto & Geneva logs: https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912740/Log-(Kusto-and-Jarvis)-access
