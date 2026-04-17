# CME Permission and MSODS Access Setup Guide

## Overview
Step-by-step guide for setting up CME (Cloud Management Environment) account, SAW (Secure Admin Workstation) access, and MSODS DSExplorer connectivity for Mooncake/21V Entra ID troubleshooting.

## Prerequisites
- Physical smartcard reader + driver installed on corp machine
- SAW machine access

## Steps

### 1. SAW Setup
- Follow [SAW Getting Started](https://strikecommunity.azurewebsites.net/articles/673/saw-getting-started.html)
- Add corp account into Silo "CloudEnterprise" (may take several days)

### 2. CSEWeb Smartcard
- Request CSEWeb smartcard (may take several weeks)
- Use Edge browser (not Chrome) for the request
- Unlock and setup PIN via [Microsoft Smart Card Manager](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/MicrosoftPINTool/Unblock-Your-Smart-Card-PIN-with-PIN-Tool.aspx)

### 3. SAW Login
- Insert CSEWeb smartcard into SAW machine
- Login with Corp account PIN code
- Complete Windows Hello for Business setup

### 4. CME Account Creation
- Sign in SAW with corp account
- Access https://oneidentity.core.windows.net/
- Create CME account with your alias, ensure account is enabled

### 5. CME Smartcard
- Request via https://aka.ms/CDOCIDMRequest → Security Key Services → Security Key Request
- Unlock and setup PIN after arrival

### 6. Password Maintenance
- Reset CME account password periodically before expiry (90 days)
- If expired: login SAW → https://oneidentity.core.windows.net/ → enable account → change password
  - Temporary password expires in 3 days, can only be changed after 24 hours
- Watch for "Certificate Expiration Warning" from security@oe.21vianet.com
  - Certificate must be active before renewal; if expired, need new smartcard

### 7. Security Group Access
- Email 21V-WAPHYNET@oe.21vianet.com to join SG: `CME\pso-usr_S_Eng-ServiceAnalysis`
- Template: "Request to add CME account cme\<alias> to CME\pso-usr_S_Eng-ServiceAnalysis for RDP access to DS Explorer"

### 8. Connect to MSODS via SAW

| CME DSExplorer Client | Pulse VPN |
|---|---|
| BJ2AGR2QMZ602.GRN002.MSO.CN.GBL | https://bjb.core.chinacloudapi.cn |
| SH2AGR2QMZ602.GRN002.MSO.CN.GBL | https://sha02.core.chinacloudapi.cn |

- Find DSExplorer in MSODS Tools folder on the desktop
- If DSExplorer not working, email O365_MSODS@oe.21vianet.com

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > CME Permission and MSODS access
