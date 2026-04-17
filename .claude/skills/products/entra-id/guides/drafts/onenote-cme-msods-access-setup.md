# CME Account & MSODS/DSExplorer Access Setup (21Vianet)

## Overview
Step-by-step guide for setting up CME account, SAW, and MSODS access for Mooncake Entra ID troubleshooting.

## Prerequisites
- Physical smartcard reader + driver installed on corp machine
- Corp account with SAW access

## Steps

### 1. SAW Setup
- Follow [SAW Getting Started](https://strikecommunity.azurewebsites.net/articles/673/saw-getting-started.html)
- Add corp account to Silo "CloudEnterprise" (may take several days)
- Request CSEWeb smartcard (may take several weeks)

### 2. CME Account Creation
- Sign in SAW with corp account
- Access https://oneidentity.core.windows.net
- Create CME account with your alias, ensure account is enabled

### 3. CME Smartcard
- After CME account enabled, request CME smartcard: https://aka.ms/CDOCIDMRequest
- Security Key Services -> Security Key Request
- After arrival, unlock and setup PIN

### 4. Password Management
- Reset password every 90 days on CME jumpbox or CME workstation
- If expired: Login SAW -> https://oneidentity.core.windows.net -> enable account -> reset password
- **Important**: Temporary password expires in 3 days, can only be changed after 24 hours. Change on day 2 or day 3.

### 5. Certificate Renewal
- Monitor "Certificate Expiration Warning" emails from security@oe.21vianet.com
- Renew BEFORE expiration
- If expired: must reapply for new smartcard via step 3

### 6. Security Group
- Email 21V-WAPHYNET@oe.21vianet.com to add CME account to `CME\pso-usr_S_Eng-ServiceAnalysis`

### 7. Connect to MSODS
| CME DSExplorer Client | Pulse VPN |
|---|---|
| BJ2AGR2QMZ602.GRN002.MSO.CN.GBL | https://bjb.core.chinacloudapi.cn |
| SH2AGR2QMZ602.GRN002.MSO.CN.GBL | https://sha02.core.chinacloudapi.cn |

- Find DSExplorer in MSODS Tools folder on the desktop
- If DSExplorer not working, email O365_MSODS@oe.21vianet.com

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > CME Permission and MSODS access
