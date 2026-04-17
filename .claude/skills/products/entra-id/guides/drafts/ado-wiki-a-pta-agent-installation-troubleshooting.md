---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Pass-Through Authentication/Azure AD Pass-Through Authentication - Agent cannot be installed"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%20-%20Agent%20cannot%20be%20installed"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PTA Agent Installation Troubleshooting

## Background

Three installation options:
1. Silent install during AAD Connect PTA enablement
2. Normal installation via GUI installer
3. Silent installation via command line (use -feature PassthroughAuthentication)

## Installation Phases

1. Files copied to install folder
2. Authentication / Authorization
3. Agent registration (SSL Client Certificate creation)
4. Enabling Pass-through Authentication (only via AAD Connect)

Registration endpoint: https://{TENANTID}.registration.msappproxy.net/register/RegisterConnector
Activation URL: https://{TENANTID}.registration.msappproxy.net/register/EnablePassthroughAuthentication

## Troubleshooting Steps

### 1. Supported OS Versions
Windows Server 2012 R2, 2016, 2019

### 2. PTA Agent Version
Check: AADConnectAuthAgentSetup.exe > Properties > Details > File Version
Ensure latest version per version history docs.

### 3. SSL/TLS Settings
Verify per TLS requirements documentation.

### 4. Root CA Certificates
Required in Local Computer Root Certification Authorities (certlm.msc):

| CA | Thumbprint |
|---|---|
| DigiCert Global Root G2 | df3c24f9bfd666761b268073fe06d1cc8d4f82a4 |
| DigiCert Global Root CA | a8985d3a65e5e5c4b2d7d66d40c6dd2fb19c5436 |

### 5. Account Validation
- Cannot be a guest user
- Must be a Global Administrator in the target tenant

### 6. Sign-in Validation
User must be authenticated to get token for Azure AD Application Proxy Connector (app ID: 55747057-9b5d-4bd4-b387-abf52a8bd489).
Check in ASC Sign-ins.

### 7. Kusto Registration Check
Cluster: https://idsharedweu.kusto.windows.net



- No record = request did not reach Azure (network/auth issue)
- resultType != Success = investigate, raise AVA request

### 8. Network Requirements
Confirm:
- Outbound proxy? If yes, configure connector to use it
- TCP 80/443 open for outbound to Azure endpoints?
- SSL inspection disabled for outbound traffic?
- URLs from prerequisites doc accessible?
- Test: browse to https://{TENANTID}.registration.msappproxy.net/register/RegisterConnector

### Hints
- IE hanging? Use silent installation methods
- Cannot allowlist URLs? Use silent installation with token method (token can be generated on different machine)

### Data Collection
If still failing, collect logs using PTA Data Collector Script + network trace.
