---
title: Troubleshooting Intune Exchange Connector
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-exchange-connector
product: intune
type: troubleshooting-guide
---

# Troubleshooting Intune Exchange Connector

> Note: Exchange Connector deprecated since July 2020. Use Exchange hybrid modern authentication (HMA).

## Prerequisites Check
- Verify installation requirements
- Account has both Exchange and Intune admin permissions
- Check MDM authority and Exchange version

## Configuration Checks
- Firewall/proxy allows communication between connector host and Intune service
- Connector host and Exchange CAS: domain-joined, same LAN
- Notification account configured for Autodiscover

## Common Issues
1. Device not discovered: Check SMTP vs UPN match, Intune license, Exchange CAS version
2. Notification emails not received: Verify notification account, Autodiscover DNS, EWS URL
3. Autodiscover failure: Configure DNS record or hard-code EWS URL in config XML

## PowerShell Commands
- Get-MobileDeviceStatistics -mailbox mbx
- Get-Mailbox -Identity user | select emailaddresses | fl
- Get-CASMailbox <upn> | fl
