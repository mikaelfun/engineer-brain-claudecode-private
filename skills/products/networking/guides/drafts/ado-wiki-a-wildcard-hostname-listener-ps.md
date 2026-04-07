---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/PowerShell Commands for Wildcard Hostnames in Listener"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FPowerShell%20Commands%20for%20Wildcard%20Hostnames%20in%20Listener"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# PowerShell Commands for Wildcard Hostnames in Application Gateway Listener

Wildcard hostname overview and valid/invalid examples:
https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/24300/Azure-Application-Gateway?anchor=appgw-wildcard-listener

> **Note:** Wildcard listeners will NOT show the hostname in the Azure Portal. Use PowerShell or ASC to verify configuration.

## Variables Used

- `$gw` — Application Gateway object
- `$fip` — Frontend IP configuration
- `$fp` — Frontend Port
- `$cer` — SSL Certificate

---

## HTTP Listener (Port 80, No Certificate)

```powershell
$gw = Get-AzApplicationGateway -Name agv2 -ResourceGroupName sk_rg
$fip = Get-AzApplicationGatewayFrontendIPConfig -Name appGwPublicFrontendIp -ApplicationGateway $gw
$fp = Get-AzApplicationGatewayFrontendPort -Name port_80 -ApplicationGateway $gw
$AddListener = Add-AzApplicationGatewayHttpListener -ApplicationGateway $gw -Name SShttp `
  -Protocol "Http" -FrontendIPConfiguration $fip -FrontendPort $fp -HostNames "*.srisai.info"
Set-AzApplicationGateway -ApplicationGateway $gw
```

---

## HTTPS Listener (Port 443, with PFX Certificate Already on AppGW)

```powershell
$gw = Get-AzApplicationGateway -Name agv2 -ResourceGroupName sk_rg
$fip = Get-AzApplicationGatewayFrontendIPConfig -Name appGwPublicFrontendIp -ApplicationGateway $gw
$fp = Get-AzApplicationGatewayFrontendPort -Name port_443 -ApplicationGateway $gw
$cer = Get-AzApplicationGatewaySslCertificate -Name srisai -ApplicationGateway $gw
$AddListener = Add-AzApplicationGatewayHttpListener -ApplicationGateway $gw -Name SShttps `
  -Protocol "Https" -FrontendIPConfiguration $fip -FrontendPort $fp `
  -HostNames "*.srisai.info" -SslCertificate $cer
Set-AzApplicationGateway -ApplicationGateway $gw
```

---

## Additional Commands

### Add New Frontend Port

```powershell
New-AzApplicationGatewayFrontendPort -Name port_443 -Port 443
Add-AzApplicationGatewayFrontendPort -ApplicationGateway $gw -Name port_443 -Port 443
Set-AzApplicationGatewayFrontendPort -Name port_443 -ApplicationGateway $gw -Port 443
```

### Upload Certificate to Application Gateway

> Note: `1234` is the PFX password — replace with actual password.
> Tip: If having issues uploading cert via PowerShell, create a dummy HTTPS listener in portal (which uploads the cert), then use `Get-AzApplicationGatewaySslCertificate` to reference it when adding new listeners. Delete the dummy listener afterward.

```powershell
$password = ConvertTo-SecureString 1234 -AsPlainText -Force
$cert = Add-AzApplicationGatewaySslCertificate -ApplicationGateway $gw -Name srisai `
  -CertificateFile "C:\P2S_cert\srisai.pfx" -Password $password
$certSet = Set-AzApplicationGatewaySslCertificate -ApplicationGateway $gw -Name srisai `
  -CertificateFile "C:\P2S_cert\srisai.pfx" -Password $password
Set-AzApplicationGateway -ApplicationGateway $app
$cer = Get-AzApplicationGatewaySslCertificate -Name cert -ApplicationGateway $gw
```

---

## Portal / PowerShell / ASC View Notes

- **Portal:** Wildcard listeners (e.g., SShttp, SShttps) will NOT show hostname details
- **PowerShell:** Will show `-HostNames` field with wildcard value (e.g., `*.srisai.info`)
- **ASC:** Shows listener configuration including wildcard hostname

---

## Author
Sai Krishna Bellala
