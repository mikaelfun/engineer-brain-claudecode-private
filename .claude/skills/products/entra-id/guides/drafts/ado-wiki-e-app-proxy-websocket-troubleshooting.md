---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Troubleshooting WebSocket issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Troubleshooting%20WebSocket%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Background

WebSocket is a computer communications protocol, providing full-duplex communication channels over a single TCP connection (RFC 6455). It is designed to work over HTTP ports 443 and 80 and supports HTTP proxies and intermediaries. The WebSocket handshake uses the HTTP Upgrade header to change from HTTP to WebSocket protocol.

## WebSocket Support in Microsoft Entra Application Proxy

Microsoft Entra Application Proxy does not implement the full WebSocket protocol stack. Some web apps might work, some might fail. The best approach is testing.

**Known limitations:**

- Application proxy discards the cookie that is set on the server response while opening the WebSocket connection.
- There is no SSO applied to the WebSocket request.
- WebSocket initial request can only be authenticated by cookie. NTLM, Kerberos won't work.
- Features (Eventlogs, PowerShell and Remote Desktop Services) in the Windows Admin Center (WAC) do not work through Microsoft Entra Application Proxy.
- The server reply (HTTP 101) must contain exactly the same header-value pair as "Connection: Upgrade" (not case-sensitive), otherwise the WebSocket connection establishment fails on the connector.
- Origin header is not forwarded to backend server during WebSocket connection establishment.
- Since the connector does not support HTTP/2, WebSocket over HTTP/2 is not supported.
- The extensions specified in the header _Sec-WebSocket-Extensions_ are not used. The connector does not set the header when it upgrades the connection to WebSocket.

## Troubleshooting Steps

### Connector Version

Ensure that the latest version of the connector is installed. See [version history and download](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-release-version-history).

### SSL Certificate

- The SSL Certificate of the published web app must cover the hostname used in the internal URL.
  Example: internal URL `https://test.domain.com/` -> `test.domain.com` must be in the Subject or SAN of the certificate.
- The SSL Certificate must be trusted by the connector server. Root CA and Issuer CA certificates must be in the Trusted Root Certification Authorities and Intermediate Certification Authorities in the local computer certificate store (`certlm.msc`).

**Sample error message:**
```
BadGateway: This corporate app can't be accessed right now.
Socket: Could not open connection to backend, return code: 'BadGateway',
Message: 'Unable to connect to the remote server :: The underlying connection was closed:
Could not establish trust relationship for the SSL/TLS secure channel ::
The remote certificate is invalid according to the validation procedure.'
```

> **Note:** The **Validate Backend SSL Certificate** option does not apply on WebSocket connections.

### Error: Connection header value 'upgrade, keep-alive' is invalid

**BadGateway - Socket: Could not open connection to backend, return code: 'BadGateway', Message: 'The Connection header value upgrade, keep-alive is invalid.'**

The server HTTP 101 response must contain exactly `Connection: Upgrade` header. Multiple values like `upgrade, keep-alive` will cause failure.

### Outbound Proxy

1. If `bypassonlocal="False"` in the proxy configuration, WebSocket traffic will be sent through the outbound proxy. This is usually not intended.

Check in `MicrosoftEntraPrivateNetworkConnectorService.exe.config`:

```xml
<configuration>
  <system.net>
    <defaultProxy>
      <proxy proxyaddress="http://proxyserver:8080" bypassonlocal="False" usesystemdefault="True"/>
    </defaultProxy>
  </system.net>
</configuration>
```

**Fix options:**
- Change `bypassonlocal="False"` to `bypassonlocal="True"` & restart connector service
- Or configure a proxy exception:
  ```xml
  <defaultProxy>
    <proxy proxyaddress="http://proxyserver:8080" bypassonlocal="False" usesystemdefault="True"/>
    <bypasslist><add address=".internal.local"/></bypasslist>
  </defaultProxy>
  ```

Reference: [defaultProxy Element (Network Settings)](https://docs.microsoft.com/dotnet/framework/configure-apps/file-schema/network/defaultproxy-element-network-settings)

2. You might also exclude the backend WebSocket server URL from WinHTTP proxy settings:

```cmd
netsh winhttp show proxy
netsh winhttp set proxy proxy-server="http=myproxy" bypass-list="*.contoso.com"
```

## Data Collection

Data must be collected simultaneously on the client and the connector servers.

1. Start Fiddler or Developer Tools HAR log on the client, and the Data Collector Script with parameter **-ServiceTraceOn** on the connector servers.
2. Replicate the problem.
3. Stop the data collectors.

Additionally, collect a Fiddler trace about the working scenario (bypassing Microsoft Entra Application Proxy) on the connector server for comparison.
