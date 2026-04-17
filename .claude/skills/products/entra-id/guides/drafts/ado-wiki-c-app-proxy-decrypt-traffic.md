---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Decrypt the traffic between the Connector and Azure"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Decrypt%20the%20traffic%20between%20the%20Connector%20and%20Azure"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Decrypt Traffic Between Connector and Azure

> **Use for testing and advanced troubleshooting purposes only.**

## Steps to Decrypt Traffic

1. Log in to the server hosting the Connector service as administrator.
2. Download and install **Fiddler Classic**.
3. Locate the file `%ProgramData%\Microsoft\Microsoft Entra private network connector\Config\TrustSettings.xml` and open it.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ConnectorTrustSettingsFile xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <CloudProxyTrust>
    <Thumbprint>THUMBPRINT_OF_THE_CLIENT_CERTIFICATE</Thumbprint>
    <IsInUserStore>false</IsInUserStore>
  </CloudProxyTrust>
</ConnectorTrustSettingsFile>
```

> **Important**: If `IsInUserStore` is `true`, uninstall and reinstall the Connector, then start over from step 3.

4. Start **certlm.msc** > Personal > Certificates > locate the certificate with the thumbprint from TrustSettings.xml (Issued to: TENANT_ID, Issued by: connectorregistrationca.msappproxy.net).
5. Right-click the certificate > All Tasks > Export... > Save as `ClientCertificate.cer` into `%UserProfile%\Documents\Fiddler2`.
6. Start **Fiddler as Administrator** > Tools > Options > HTTPS tab > Check "Decrypt HTTPS traffic" > Install certificates > Restart Fiddler.
7. Start **PowerShell as administrator (elevated)** and navigate to `%ProgramFiles%\Microsoft Entra private network connector`.
8. Run:
   ```powershell
   .\ConfigureOutBoundProxy.ps1 -ProxyAddress http://127.0.0.1:8888
   ```
9. The connector service will be automatically restarted and traffic will appear in Fiddler.

## WebSocket Traffic

To trace WebSocket traffic, change `bypassonlocal="True"` to `bypassonlocal="False"` in the config file:
`MicrosoftEntraPrivateNetworkConnectorService.exe.config` (located in `X:\Program Files\Microsoft Entra private network connector`)
