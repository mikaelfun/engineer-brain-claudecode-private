---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Fiddler Trace Secrets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Fiddler%20Trace%20Secrets"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Fiddler Trace Response Headers

Most of the time taking a Fiddler or an equivalent trace is the first step (after we understood the problem) to start with the troubleshooting of an Microsoft Entra Application Proxy problem. This article explains some important things you should know when you analyze Fiddler traces.

## Background

The Microsoft Entra Application Proxy Cloud Service adds various headers to each response to client requests. This makes easier to identify what happened to a specific request / response during its journey through the Microsoft Entra application proxy components.

## Added Response Headers

**Nel:** `{"report_to":"network-errors","max_age":86400,"success_fraction":0.001,"failure_fraction":1.0}`

**Report-To:** `{"group":"network-errors","max_age":86400,"endpoints":[{"url":"https://ffde.nelreports.net/api/report?cat=x-ms-proxy-service-name"}]}`

=> Some browsers use Nel (Network Error Logging) and Report-To headers to send reports about failed network transactions to telemetry. Support has no access to the data. The data does not contain PII.

**x-ms-proxy-service-name:** `proxy-appproxy-{datacenter}-xxxxxx`
=> The name of the Microsoft Entra Application Proxy Service instance that handled the request.

**x-ms-proxy-data-center:** `xxx`
=> The data center (e.g., CUS = Central US, WEUR = West Europe).

**x-ms-proxy-subscription-id:** `{guid}`
=> The tenant ID hosting the App Proxy application and the connector group.

**x-ms-proxy-app-id:** `{guid}`
=> The app id of the App Proxy Application that handled the request.

**x-ms-proxy-group-id:** `{guid}`
=> The id of the connector group assigned to the app.

**x-ms-proxy-connector-id:** `{guid}`
=> The id of the connector that handled the request. If absent, the request was handled only by the Cloud service.

**x-ms-proxy-transaction-id:** `{guid}`
=> The transaction id for tracing request processing through Cloud Service and connector.

**x-ms-proxy-error-details:** `{friendly error name}`
=> Examples: ParseBackendResponseFailed, BackendTimeOut, BackendServiceUnavailable, EmptyConnectorGroup. Only added when an error occurs.

## Tools & Files for Further Research

**Cloud Service:** ASC (Azure Support Center), Kusto

**Connector:**
- Event logs
- Trace logs (callstacks): `%ProgramData%\Microsoft\Microsoft Entra private network connector\Trace`
- AzureADApplicationProxyConnectorTrace.log (use data collector script with `-ServiceTraceOn` switch)
- AppProxyTrace: `{COMPUTERNAME}-AppProxyLog.bin` (use data collector script)
