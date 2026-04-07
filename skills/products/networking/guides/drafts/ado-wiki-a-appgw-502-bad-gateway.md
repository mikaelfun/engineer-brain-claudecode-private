---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/Application Gateway 502 Bad Gateway Errors"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FApplication%20Gateway%20502%20Bad%20Gateway%20Errors"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Scenario

After configuring an Azure Application Gateway users encounter a "Server Error: 502 - Web server received an invalid response while acting as a gateway or proxy server."

## Support Topics Covered by This Workflow

- Routing Azure Application Gateway\Configuration and Setup
- Routing Azure Application Gateway\Connectivity
- Routing Azure Application Gateway\Management

## Internal Scoping & Data Collection

1. Review the customer Verbatim for Subscription ID and Application Gateway Name
2. Go to Azure Support Center (ASC) and retrieve: Application Gateway Name, Location, Resource Group, Provisioning State
3. Review the configuration: Virtual IP, Frontend Ports, Custom probes, Backend addresses, Listeners, Rules
4. Match customer data with ASC data — confirm AppGW, provisioning status, public IP, frontend ports, probes, backend servers

## Looking for Known Solutions

### Unhealthy instances in BackendAddressPool

1. Check if back-end instances respond to ping from another VM in the same VNet
2. Review MDM: Namespace=AppGWT, Table=BackendServerDiagnosticHistory, FilteringCondition=GatewayName; look for servers reporting healthy=false

**Backend Health Monitor Status "Unknown" in Portal:**
1. Check NSG on AppGW subnet → add inbound allow rule for ports 65503-65534 from `*`
2. Check route table on AppGW subnet — ensure no route prevents internet traffic outbound
3. Check custom DNS server — must be able to resolve Azure Storage account (MdsStorageAccount from Brooklyn Properties)
   - SR Root Cause: Application Gateway > Health Monitoring/502-Bad-Gateway errors > Unknown backend health

## NSGs or UDR on Application Gateway Subnet

- NSGs on AppGW subnet require exceptions for ports **65503-65534** for backend health to work
- If customer forces AppGW traffic through NVA: disable UDR on AppGW subnet temporarily to verify AppGW can reach backend
- If probes show backend as healthy but URL shows Page Cannot Be Displayed: check if there is a rule allowing internet traffic to the port
- SR Root Cause: Application Gateway > Health Monitoring/502-Bad-Gateway errors > Unknown backend > NSG

## Empty BackendAddressPool

- Verify via `Get-AzureRmApplicationGateway` or Azure Portal that backend pool has addresses configured
- SR Root Cause: Application Gateway > Health Monitoring/502-Bad-Gateway errors > Configuration and setup

## Rule Order Matters

- Rules are processed in order; first matching rule wins regardless of specificity
- **Common scenario:** Default `appGatewayHttpListener` + `rule1` left in place; `rule1` points to empty `appGatewayBackendPool`; `rule1` is at top of list → 502 errors even when other backend pools are healthy
- Fix: Delete and recreate the rule to move it to end of list, or ensure Basic Listener rule is below Multi-Site Listener rules
- How to identify Basic vs Multi-Site listener: Basic listeners have no hostname; `requireServerNameIndication=false` for Basic SSL listeners
- SR Root Cause: Application Gateway > Health Monitoring/502-Bad-Gateway errors > Configuration and setup

## Health Probe Issues

1. Trigger manual health check via Jarvis: Brooklyn > Application Gateways > Get Application Gateway Backend Health
2. Check BackendServerDiagnosticHistory in Jarvis/MDM using DeploymentId as Tenant

### Default and Basic Probes

1. If using default probe: validate backend has default site listening at 127.0.0.1 on the configured port
   - Run network capture ~5 min; look for HTTP GET from AppGW IP → backend VM IP, response should be 200 OK
2. If using custom probe with HTTPS: backend must not require SNI without fallback cert; ensure custom probe is **associated to a BackendHttpSetting**
   - Common issue: customer creates custom probe but does NOT associate it to HTTP setting → default probe used unexpectedly
3. SNI usage for custom probe is **not supported**

## 502s Due to Improper Certificate Bundling

**Error in Jarvis:** `ngx_http_upstream_check_err: upstream SSL certificate verify error: (20:unable to get local issuer certificate)`

**Check via OpenSSL:**
```
openssl s_client -connect <backend-IP>:<port> -showcerts
```
- If depth=0 but cert chain requires depth=2 → intermediate certs missing from bundle
- Use SSL checker: https://www.sslshopper.com/ssl-checker.html
- **Resolution:** Backend must bundle root cert + all intermediate certs + server cert

## Allowable HTTP Responses

By default, accepted HTTP status codes are 200-399. Customer can modify via PowerShell:
```powershell
$responseCodes = New-AzureRmApplicationGatewayProbeHealthResponseMatch -StatusCode 200-401
Add-AzureRmApplicationGatewayProbeConfig -ApplicationGateway $gw -Interval 30 -Name HealthProbe `
  -Path / -Protocol Https -Timeout 30 -UnhealthyThreshold 3 -Match $responseCodes -HostName "127.0.0.1"
Set-AzureRmApplicationGateway -ApplicationGateway $gw
```

## Certificate Issues (Linux)

```bash
echo | openssl s_client -showcerts -servername localhost -connect localhost:443 2>/dev/null | openssl x509 -inform pem -noout -text
```
Default cert config locations: `/etc/httpd/conf.d/ssl.conf` (RHEL) / `/etc/apache/conf.d/ssl.conf` (Debian)

## Allow Listing of Certificates

- Export cert from backend default binding → upload `.CER` to AppGW BackendHttpSetting
- Thumbprint on backend (IIS: Bindings > View cert > Details > Thumbprint) must match the exported `.CER`

## Intermediate Certificates (v2 SKU)

- Upload **root certificate** to BackendHttpSetting
- Install **bundle of intermediate cert(s) + server cert** on backend server for the website

## Request Timeout

- Default backend response timeout: **30 seconds** (configurable via BackendHttpSetting)
- AppGW v1: returns 502 on timeout; AppGW v2: returns **504** on timeout

## Expired Certificate → 502

Customer gets 502 if using SSL offload and the uploaded listener certificate is expired.

## ADFS WAP (Web Application Proxy) Behind AppGW

- Probe may show Healthy but customer gets 502
- ADFS WAP requires network layer (L4) load balancing; AppGW is L7 → incompatible
- SR Root Cause: Application Gateway > Health Monitoring/502-Bad-Gateway errors > Configuration and Setup

## Header Size

- AppGW ARR limit for response header: **8 KB**. Exceeding this causes probe to fail and 502 errors.

## Backend Closing Connection Early (v1 only)

When backend sends FIN before sending all bytes specified in Content-Length header → ARR returns ERROR_HTTP_INVALID_SERVER_RESPONSE → AppGW v1 sends 502.
**Not applicable to AppGW v2** (less strict Content-Length validation).

## Backend Probe Healthy but Still Getting 502 (App Service Hostname Mismatch)

**Root cause:** Probe uses one hostname (e.g., `app.azurewebsites.net`) and marks backend healthy, but HTTP Settings do not send correct hostname for actual traffic → backend App Service returns error.

**Resolution options:**
1. Enable **"Pick Host Name From Backend Address"** in HTTP Backend Settings
2. Enable **"Pick hostname from backend target"**

Key: if using HTTPS, backend cert must be valid for BOTH the probe hostname AND real traffic hostname.
Reference: https://learn.microsoft.com/azure/architecture/best-practices/host-name-preservation

## Modifying AppGW Settings via PowerShell

Remove BackendAddressPool:
```powershell
$appgw1 = Get-AzureRmApplicationGateway -Name <Name> -ResourceGroupName <RG>
$appgw1 = Remove-AzureRmApplicationGatewayBackendAddressPool -Name <pool-name> -ApplicationGateway $appgw1
Set-AzureRmApplicationGateway -ApplicationGateway $appgw1
```

Remove HttpListener:
```powershell
$appgw1 = Get-AzureRmApplicationGateway -Name <Name> -ResourceGroupName <RG>
$appgw1 = Remove-AzureRmApplicationGatewayHttpListener -Name <listener-name> -ApplicationGateway $appgw1
Set-AzureRmApplicationGateway -ApplicationGateway $appgw1
```
