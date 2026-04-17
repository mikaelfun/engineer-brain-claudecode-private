---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Security Policies & AME  requirements for CSS delivery/Step by Step Process for AME Access"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FSecurity%20Policies%20%26%20AME%20%20requirements%20for%20CSS%20delivery%2FStep%20by%20Step%20Process%20for%20AME%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Step by Step Process for AME Access

## Summary
This process is to assist engineers in gaining access to the AME environment. Having access to AME grants engineers the ability to access elevated tools (Geneva Actions (Jarvis), XTS, DS Console, CMS etc.) to perform required troubleshoot steps on customer resources thru SAW device or SAVM (Virtual SAW).

## Create an AME account

1. From a SAW device or SAVM log into https://aka.ms/oneidentity (Select "@microsoft.com account" for auth).
2. Click on "Create / Manage user Account" under "User Accounts".
3. Select the AME domain from the domain dropdown.
4. Duplicate your current corporate user alias (e.g., if alias is "abcd", create AME domain user for "abcd").
   - If "(already exists)" appears next to it, you already have an AME account.
   - Keep "Unix Enabled" unchecked.

## Request a YubiKey (Security Key)

1. Once your AME account has been created, request a YubiKey.
2. Browse to https://aka.ms/CloudMFARequest (can be done outside of SAW/SAVM).
3. Sign in, select "Security Key Services" and "Security Key Request".
4. Fill in:
   - Services: Azure (*ME Domains AME GME etc)
   - Domain Name: AME
   - Form-Factor: USB Device (USB-A is safest)
   - Replacement: No
   - On behalf of someone else: No
   - Delivery method depends on location (within 25 miles of Redmond → pickup; otherwise Office/Residential)
5. An ICM will be opened after submit. Wait for YubiKey to arrive.

## After YubiKey arrives

Follow: **[(*ME) YubiKey Certificate Setup](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/YubiKey-Management.aspx#initial-setup%2C-yubikey-unblocking%2C-certificate-renewal%2C-resetting-the-yubikey)** under "Initial Setup, Yubikey Unblocking, Certificate Renewal, Resetting the Yubikey"

## Join an AME Security Group

1. Using SAW/SAVM, navigate to https://aka.ms/oneidentity
2. Select "@ame.gbl account" and authenticate with AME certificate on YubiKey
3. Type group name next to "Group Name" and click Next
4. In "Members" section, enter your AME alias and click "Add Members"
5. Confirm your alias in the members list
6. Click "Modify" button
7. Select your TA as approver, enter justification, click "Ok"
8. Wait for approval confirmation

## Purview POD AME Silos

- Open SAS Portal, navigate to SAW section > 'My Silos'
- Search for 'CloudEnterprise', click it, then 'Join Silo'
- Identity is your Corp identity (e.g., REDMOND\USER)
- Repeat for 'KustoExplorerSilo'
- For AME login with YubiKey, join 'CloudEnterpriseAME'

## References
- [AME Guide](https://strikecommunity.azurewebsites.net/articles/1014/ame-azure-management-environment.html)
- [SAS Portal](https://portal.sas.msft.net/sas/portal/)
