---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Verticals & Subject Matter Experts (SMEs)/AME Access_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FVerticals%20%26%20Subject%20Matter%20Experts%20(SMEs)%2FAME%20Access_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AME Access Process

This process assists engineers in gaining access to the AME environment. Having access to AME grants engineers the ability to make small changes in customer environments such as restoring a managed disk or storage account.

## Create an AME account

1. From a SAW device or SAVM log into https://aka.ms/oneidentity (Select "@microsoft.com account" for auth).
2. Click on "Create / Manage user Account" under "User Accounts".
3. Select the AME domain from the domain dropdown.
4. Duplicate your current corporate user alias (e.g., if alias is "abcd", create AME domain user "abcd") and click "Next".
   - If the user account has "(already exists)" next to it, you already have an AME account.
   - Keep "Unix Enabled" unchecked.

## Request a YubiKey (Security Key)

1. Once AME account is created, browse to https://aka.ms/CloudMFARequest (can be done outside SAW/SAVM).
2. Sign in, select "Security Key Services" → "Security Key Request".
3. Fill in the form:
   - Services: Azure (*ME Domains AME GME etc)
   - Domain Name: AME
   - Form-Factor: USB Device
   - Replacement: No
   - USB Device: dependent on system (USB-A safest)
   - Ordering for self: No
   - Delivery: depends on location (within 25 miles of Redmond = pickup required)
4. An ICM will be opened after submit. Follow the ICM and wait for delivery.

## After YubiKey Arrives

Follow: **[(*ME) YubiKey Certificate Setup](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/YubiKey-Management.aspx#initial-setup%2C-yubikey-unblocking%2C-certificate-renewal%2C-resetting-the-yubikey)** under "Initial Setup, Yubikey Unblocking, Certificate Renewal, Resetting the Yubikey"

## Steps to Join an AME Security Group

1. Using a SAW/SAVM, navigate to https://aka.ms/oneidentity
2. Select "@ame.gbl account" and authenticate with AME certificate on YubiKey
3. Type group name next to "Group Name" and click Next
4. In "Members" section, enter AME alias and click "Add Members"
5. Confirm alias in members list
6. Click "Modify"
7. Select TA alias as approver, enter justification, click "Ok" (ensure TA is aware)
8. Wait for confirmation of approval.

## VM POD AME Security Groups

| Group | Purpose |
|-------|---------|
| **TM-CSSDiskRec** | Grants permissions to restore managed disks which have been soft-deleted |
| **AD-CSSStgRec** | Grants permissions to restore Azure Storage Accounts |
| **AD-CSSStgApprovers** | JIT approval group for recovering Storage accounts |
| **AzVM-MemoryDumpRequestorAME** | AME Group for requesting memory dumps |
| **AzVM-MemoryDumpApproverAME** | AME Group for approving memory dumps |
| **TM-AFEC** | Group for guest OS enablement; used in disabling hyperthreading workflow |
| **TM-CSSOneVMTAApprovers** | Used by Global TAs to approve manual JIT requests |
