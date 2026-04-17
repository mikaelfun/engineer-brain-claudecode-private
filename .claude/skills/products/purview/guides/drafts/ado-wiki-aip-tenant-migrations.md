---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How to: AIP Service Tenant Migration"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20to%3A%20AIP%20Service%20Tenant%20Migration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## AIP Tenant Migrations

Please read this article to learn about the different options available for AIP migration.

**Important notes:**
- CSS doesn't help customers with the whole AIP tenant migration process. Customer can engage Consultant services to properly plan and implement the migration.
- CSS can help if customer needs assistance on any specific steps in the migration process. Eg: Exporting or importing the AIP keys or unable to open the encrypted file after migration.
- If any customer is experiencing issues decrypting the encrypted files/mails after migrating to a new tenant, use this wiki as a troubleshooting guide.

## Questions to ask in an AIP tenant migration case

### 1. Is the customer migrating from one EntraID tenant to another?

#### 1. Complete migration including users, DNS domains and AIP configuration

Verification checklist:
1. Verify that the AIP key from the old tenant is imported to the new tenant.
   - `Connect-AIPService` (provide the admin credentials of new tenant)
   - `Get-AIPServiceKeys` (verify the output shows the keys imported from the old tenant)
2. Is the DNS domain from the old tenant added as a verified domain in the new tenant?
3. Verify the ProxyAddress attribute of users migrated to the new tenant contains the email address which was used in the old tenant.
4. Verify the DNS or Registry based Licensing redirection is configured on the client machine.
   - Instead of AD RMS url, you can give old AIP tenant url.
5. How to obtain the AIP url for the old tenant:
   - If tenant still present: connect and run `Get-AIPServiceConfiguration`
   - If tenant doesn't exist or AIP config expired: open any old protected document in Notepad and check for the licensing url.

#### 2. Partial Migration: Only users are migrated to new tenant (email domain and AIP keys are retained in the old tenant)

1. Migrating users alone to a new tenant is a bad idea if the tenant has AIP protected files.
2. To keep access to old protected documents: edit the encryption labels in the old tenant, add the new tenant domain name in the label encryption setting.
3. If files/mails are encrypted using ad-hoc protection (user defined / Do not forward / Encrypt only): such files can't be decrypted by migrated users as they got a new email address.
   - **Only solution**: decrypt such files/mails from the old tenant using an AIP Superuser account and share with migrated users.
4. You may have to invite migrated users as Guest users in the Old tenant if Conditional Access is enabled.

### 2. Is the customer migrating from AD RMS to AIP?

1. Follow: [Migrate AD RMS to Azure Information Protection](https://learn.microsoft.com/en-us/azure/information-protection/migrate-from-ad-rms-to-azure-rms)
2. If customer has issues with specific steps, get details.

**Known issues:**
The newer versions of Office clients use MIP SDK instead of MSIPC. These versions have known issues with licensing redirection. Create the below registry key to fallback to MSIPC:
```
HKCU\Software\Microsoft\Office\16.0\Common\DRM
Value Type: REG_DWORD
Value Name: PreferredRmsPackage
Value: 1
```

**Data Collection:**
1. Output of: `Get-AIPServiceConfiguration` and `Get-AIPServiceKeys`
2. Email address of the user opening the file.
3. MSIPC Logs after reproducing the issue from: `%LocalAppData%\Microsoft\MSIPC`
4. Fiddler trace if customer allows.
