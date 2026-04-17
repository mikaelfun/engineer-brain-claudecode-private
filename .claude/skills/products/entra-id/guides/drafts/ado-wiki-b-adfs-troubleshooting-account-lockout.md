---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - Troubleshooting Account Lockout"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20Troubleshooting%20Account%20Lockout"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Account Lockout Troubleshooting Guide

## Step 1: Use Connect Health for AD FS
- Generate top bad password attempts report per [docs](https://docs.microsoft.com/en-us/azure/active-directory/connect-health/active-directory-aadconnect-health-adfs#reports-for-ad-fs)
- Contact Connect Health PG for detailed data if not yet public

## Step 2: Collect ADFS Event Logs
- Enable auditing on each ADFS server (not WAP)
- **Server 2012 R2 / 2016**: Search Security event logs for Event ID 411 (ADFS Auditing)
  - Contains UPN of targeted user and IP address
  - Shows "token validation failed" with bad password or locked out status
- Install KB3134222 for IP address logging in Event 411

## Step 3: Analyze IP and Username
- Identify unexpected IPs
- Block rogue IPs per [KB4015192](https://internal.evergreen.microsoft.com/en-us/help/4015192)

## Step 4: Check Service Accounts
- If user account used as service account, verify latest credentials are updated across all devices

## Step 5: Check Cached Credentials
- Clear cached/saved credentials in applications causing repeated auth attempts

## Step 6: Verify Extranet Lockout
- `Get-AdfsProperties` to check ExtranetLockoutEnabled
- ExtranetLockoutThreshold should be less than AD lockout threshold
- Enable Smart Lockout (ADFS 2016+)

## Step 7: Deploy Modern Authentication & CBA
- Enable modern auth for Office clients
- Consider certificate-based authentication (removes password attack vector)
- Deploy Azure MFA as additional or primary authentication
- Best practices: [Securing AD FS](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/best-practices-securing-ad-fs)
