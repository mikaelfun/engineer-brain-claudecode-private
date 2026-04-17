---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Identifying TLS inspection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Identifying%20TLS%20inspection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Identifying TLS Inspection

## Background

**TLS inspection** (SSL inspection or termination) occurs when the TLS session is not terminated at the destination host but on an intermediary device (firewall/proxy) between the connector server and Azure endpoints. The purpose is security - decrypting and inspecting SSL/TLS traffic. However, it breaks SSL client certificate authentication used by the connector.

**Consequence: Using TLS inspection between connector and Azure endpoints is NOT supported.**

> WARNING: On Windows Server 2022 with TLS 1.3, this analysis method will not work.

## Symptoms

When TLS inspection exists between the connector and Application Proxy Service Azure endpoints:
- Inactive connectors in Azure Portal
- Connector cannot be installed
- InternalServerError - ConnectorError:Unauthorized
- GatewayTimeout

## Data Collection

1. Confirm most updated connector version is installed
2. Collect logs using the Data Collector script with `-ServiceTraceOn` parameter
3. Locate the `<servername>-HTTP-network.etl` file in the output

## Data Analysis

### Using WireShark

1. Convert .etl to .pcapng: `etl2pcapng.exe file.etl etlconversion.pcapng`
2. Apply filter to focus on App Proxy endpoints:
   ```
   (tls.handshake.type == 1 && (tls.handshake.extensions_server_name matches ".*\\.connector\\.msappproxy\\.net$" || tls.handshake.extensions_server_name matches ".*\\.servicebus\\.windows\\.net$")) || (tls.handshake.type == 2)
   ```
3. Find **Server Hello, Certificate** frame
4. Expand: Transport Layer Security > Handshake Protocol: Certificate > signedCertificate > issuer
5. **No TLS inspection**: Microsoft certificate issuer (or DigiCert - may need further investigation)
6. **TLS inspection detected**: Non-Microsoft issuer (e.g., Entrust, Fortinet, Palo Alto)

### Using Netmon

1. Open .etl file directly
2. Filter for TLS traffic
3. Search for "Handshake: Server Hello, Certificate" frame for traffic to `*.msappproxy.net / *.servicebus.com`
4. Drill into frame details: TLS > SSL Handshake Certificate > Cert
5. Check certificate issuer (same criteria as WireShark)

> IMPORTANT: Focus only on TLS sessions with `*.msappproxy.net / *.servicebus.com` endpoints to avoid false positives. Check timeframe matching the error occurrence.

## Certificates

TLS inspection certificates in the Client Hello are most often self-signed or issued by a non-public certificate authority.

## Resolution

The network device must allow uninspected access to URLs documented in:
[How to configure connectors - Allow access to URLs](https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors#allow-access-to-urls)

If the customer is not familiar with fixing, their networking team must resolve (worst case, contact the device vendor).
