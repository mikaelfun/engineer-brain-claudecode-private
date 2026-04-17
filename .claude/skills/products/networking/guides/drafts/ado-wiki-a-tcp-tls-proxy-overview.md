---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Azure Application Gateway TCP-TLS proxy (Preview)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Azure%20Application%20Gateway%20TCP-TLS%20proxy%20(Preview)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Application Gateway TCP/TLS proxy (Preview)

## Overview

Azure Application Gateway now also supports Layer 4 (TCP protocol) and TLS (Transport Layer Security) proxying. This feature is currently in public preview.

## Jarvis Logs (changes)

- The `ErrorName` field in BackendServerDiagnosticHistory will differentiate between Layer 7 streams (ngx_http) and TCP streams (ngx_stream).

> ErrorName ngx_stream_upstream_check_err_Success

Sample query: https://portal.microsoftgeneva.com/s/4B5FE9A

- The ReqRespLogs will now specify `"protocol":"TCP"` for L4 listeners.

Sample query: https://portal.microsoftgeneva.com/s/2C4D7549

## Available metrics

Request or Response-related metrics are **NOT** applicable for L4 since these are HTTP related (e.g. Response Status, Total Requests).

| Metric | Description | Type | Dimension |
|-|-|-|-|
| Current Connections | Count of current connections established with Application Gateway | Common | None |
| New Connections | Total number of connections handled in the last 1 minute | Common | None |
| New Connections per second | Average number of connections handled per second in last 1 minute | Common | None |
| Throughput | Rate of data flow (inBytes+outBytes) in last 1 minute | Common | None |
| Healthy host count | Number of healthy backend hosts | Common | BackendSettingsPool |
| Unhealthy host | Number of unhealthy hosts | Common | BackendSettingsPool |
| ClientRTT | Average round trip time between clients and Application Gateway | Common | Listener |
| Backend Connect Time | Time spent establishing a connection with a backend | Common | Listener, BackendServer, BackendPool, BackendSetting |
| Backend First Byte Response Time | Time interval between establishing connection and receiving first byte | Common | Listener, BackendServer, BackendPool, BackendHttpSetting* |
| Backend Session Duration | Total time of a backend connection (start to termination) | L4 only | Listener, BackendServer, BackendPool, BackendHttpSetting* |
| Connection Lifetime | Total time of a client connection to application gateway (in ms) | L4 only | Listener |

> "*" BackendHttpSetting dimension includes both Layer7 and Layer4 Backend settings

## Feature Limitations at Public Preview

- Probes cannot be cross-protocol (HTTP or HTTPS not supported in the same port)
- FTP, especially Passive mode, is known to have issues due to random port selection for Data Channel
- Connection Draining is not supported (planned for future)
- SNI cannot be configured in Probes. Currently SNI is picked up from the Backend Setting only
- Pick SNI from the backend pool names planned for future
- Same port for public and private listeners not supported (planned for future)
- Client IP preservation (session persistence) or configurable distribution modes not supported (planned for future)
- UDP Protocol support is planned for future

## Azure Support Center (ASC)

- HTTP Listeners and Listener (TCP) are shown separately in ASC Resource view
- Backend Settings also shown separately for L7 vs L4
- Diagnostic "Application Gateway Checklist" is currently not available for L4
