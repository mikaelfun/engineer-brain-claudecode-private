---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Authentication & Identity"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FAuthentication%20%26%20Identity"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Authentication & Identity

Cloud PC is an Azure SaaS product using multiple multi-tenant enterprise apps registered in Azure AD.

## Client Authentication Flows

### Web Client (NightHawk)
1. Sign in to Windows 365 Portal (AppID: 3b511579-5e00-46e1-a89e-a6f0870e2f5a)
2. Sign in to Microsoft Azure Windows Virtual Machine Sign-in (AppID: 372140e0-b3b7-4226-8ef9-d57986796201) after clicking "Open in browser"

### Windows Client (SeaHawk / Windows 365 Native App)
1. Sign in to Windows 365 Windows Client (AppID: c76612c2-62f8-4a10-ac30-15f3fcdec0b3)
2. Sign in to Windows Virtual Desktop Client (AppID: a85cf173-4192-42f8-81fa-777a763e6e2c) after clicking Connect

### Azure Virtual Desktop Client (Remote Desktop App)
1. Sign in to Windows Virtual Desktop Client (AppID: a85cf173-4192-42f8-81fa-777a763e6e2c)

## Data Collection
- Collect HAR traces via Chrome DevTools (F12) or Fiddler
- Remind customer to remove credentials before uploading

## HAR Trace Analysis
1. Find request URL: `https://login.microsoftonline.com/common/oauth2/v2.0/token`
2. Get sign-in correlation ID from Request Header Payload (client_request_id)
3. Look up in ASC Tenant Explorer using correlation ID filter
4. Customer can also check Sign-in activity in Azure Portal

## Fiddler Collection Steps
1. Download from https://www.telerik.com/download/fiddler/fiddler4
2. Tools > Fiddler Options > HTTPS > Enable Capture HTTPS Connects + Decrypt HTTPS traffic
3. Reproduce issue
4. File > Save > All Sessions (.SAZ file)
