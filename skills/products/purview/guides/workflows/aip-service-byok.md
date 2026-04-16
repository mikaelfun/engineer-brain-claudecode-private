# Purview AIP Service / BYOK / TPD 管理 — 排查工作流

**来源草稿**: `ado-wiki-a-dke-consume-protected-content.md`, `ado-wiki-a-mapping-aip-keys-to-imported-tpds.md`, `ado-wiki-activate-aipservice-keys-byok-mmk.md`, `ado-wiki-aip-tenant-migrations.md`, `ado-wiki-b-aip-service-ps-commands.md`, `ado-wiki-b-document-tracking.md`, `ado-wiki-b-dsr-delete-request.md`, `ado-wiki-b-rms-v1-export-tuds-tpds.md`, `ado-wiki-b-tpd-aip-key-requests.md`, `ado-wiki-b-track-and-revoke.md`, `ado-wiki-connect-aipservice-fails.md`, `ado-wiki-migrate-aip-byok-key-vault.md`
**Kusto 引用**: `mip-request-analysis.md`, `rms-auth-tracking.md`
**场景数**: 86
**生成日期**: 2026-04-07

---

## Scenario 1: Issue
> 来源: ado-wiki-a-dke-consume-protected-content.md | 适用: 未标注

### 排查步骤
User unable to open the DKE protected file as the Authentication fails.

`[来源: ado-wiki-a-dke-consume-protected-content.md]`

---

## Scenario 2: appsettings.json
> 来源: ado-wiki-a-dke-consume-protected-content.md | 适用: 未标注

### 排查步骤
Ensure the user email and/or LDAP server configuration is correct in the DKE `appsettings.json`.

`[来源: ado-wiki-a-dke-consume-protected-content.md]`

---

## Scenario 3: AAD App Registration
> 来源: ado-wiki-a-dke-consume-protected-content.md | 适用: 未标注

### 排查步骤
Please check the `AAD App Registration -> Expose an API`.
Make sure the Application ID URI is set to the DKE service URL.

> ⚠️ This is commonly missing from documentation — the Application ID URI must match the DKE service URL exactly.

`[来源: ado-wiki-a-dke-consume-protected-content.md]`

---

## Scenario 4: Additional DKE Troubleshooting Tips
> 来源: ado-wiki-a-dke-consume-protected-content.md | 适用: 未标注

### 排查步骤
- Are they hosting the DKE service in IIS or in Azure App service?
- Is the client machine able to browse the DKE service URL?
- If the DKE is hosted in IIS, ensure there are no certificate errors while browsing the URL.
- The `JwtAudience` URL configured in the appsettings.json should be the one configured in AAD App Registration and in the Sensitivity Label.

`[来源: ado-wiki-a-dke-consume-protected-content.md]`

---

## Scenario 5: DKE Troubleshooting Guide
> 来源: ado-wiki-a-dke-consume-protected-content.md | 适用: 未标注

### 排查步骤
Full community guide: https://techcommunity.microsoft.com/t5/security-compliance-identity/dke-troubleshooting/ba-p/2234252

`[来源: ado-wiki-a-dke-consume-protected-content.md]`

---

## Scenario 6: Introduction
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
Customers may have multiple AD RMS Trusted Publishing Domain (TPD) files exported from AD RMS servers. This is one way to check the AIP keys to see if the AD RMS TPD has been imported.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 7: Scenario 1
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
A customer has imported AD RMS trusted publishing domain (TPD) key(s) in AIP and want to verify it is indeed imported.

In the AIP Service key [output](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicekeys?view=azureipps), how do we map the AIPService Key Guid to an AD RMS key?  There are two ways.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 8: Mapping Key GUIDs to TPDs
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
We need either access to the AD RMS service DBs or a functioning AD RMS server to do this. If all we have is a TPD xml file we cannot do the mapping.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 9: Method 1 - Using SQL
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
1. Use SQL Server Management Studio to open the AD RMS configuration database.
2. In the AD RMS service configuration DB:
 - View the entries in the _dbo.DRMS_LicensorPrivateKey_ table. 
 - The _CertGUID_ value will map to the _KeyIdentifier_ value in AIPServiceKeys output.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 10: Method 2 - Using TUDs
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
1. If the AD RMS server is available export the corresponding Trusted User Domain (TUD) for the TPD in question. This results in a .bin file. 
2. Open the bin file in notepad and the GUID may be located. (It's not the first GUID in the file, but it will be in there).

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 11: Scenario 2
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
A customer may have multiple keys in the AipService, be they imported TPDs from other RMS services, the default AADRM key, or BYOK keys added. Different keys may have been set to active/archived over time. One may wonder against which key a client has bootstrapped.

*Note:* By default most clients bootstrap about every 30 days. If the current key has been set to active in AIP for 30 days or more, then most clients should be bootstrapped using that new active key.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 12: Mapping a client GIC to an AIP key
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
What is needed:
 - KeyIdentifier from active key (`Get-AipServiceKeys` output)
 - GIC*.drm file from the `%localappdata%\Microsoft\MSIPC` directory on desired client.

On the client, every time one either creates a piece of content, or consumes protected content, it must bootstrap against the AIP service. When bootstrapping the client obtains a GIC/CLC file pair from that service.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 13: Steps
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
1. Obtain the key identifier of the active AIP service key.
2. Open the user's GIC*.drm file in a text editor. Format it as XML if the editor allows.
3. The `MS-DRM-Server` `MS-GUID value` should reflect the key ID of the key used when obtaining the GIC.

*Note:* The service URL in the GIC also assists ensuring this GIC is from the desired service (not some other tenant).

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 14: Scenario 3
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
Which key encrypted my content? This is not an easy one to determine. There is not a PowerShell cmdlet to facilitate this ask. The only method for which I could discover is brute force. This method works for Office documents. I do not know of a way to do an encrypted email.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 15: Mapping an encrypted content key to AIP Service Key
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
What is needed:
 - KeyIdentifier from active key (`Get-AipServiceKeys` output)
 - DRM Server GUID from the encrypted file's Xrml data.

Encrypted content is in an Xrml blob. We may open the encrypted file (not decrypted) in a text editor. We search the XML for the RMS key GUID.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 16: Steps
> 来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md | 适用: 未标注

### 排查步骤
1. Obtain the key identifiers of the AIP service keys.
2. Open the encrypted file in Notepad (or your preferred text editor).  
3. Search for the AIP Service key identifier GUIDs until you find a match. The example below is a protected Word document. 
4. Match the GUID from the keys to the GUID in the XRML. There is the key used to encrypt that piece of content.

`[来源: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

---

## Scenario 17: Scenario: Unable to Activate AIPService Keys (BYOK or MMK)
> 来源: ado-wiki-activate-aipservice-keys-byok-mmk.md | 适用: 未标注

### 排查步骤
This TSG describes how to troubleshoot issues with activating a Key in the AIP Service, including:
- A key imported from AD RMS
- A BYOK key created in KeyVault
- Switching one key to another (MMK to BYOK or BYOK to MMK)

`[来源: ado-wiki-activate-aipservice-keys-byok-mmk.md]`

---

## Scenario 18: Key Commands
> 来源: ado-wiki-activate-aipservice-keys-byok-mmk.md | 适用: 未标注

### 排查步骤
- **[Use-AipServiceKeyVaultKey](https://learn.microsoft.com/en-us/powershell/module/aipservice/use-aipservicekeyvaultkey?view=azureipps)** — tells Azure Information Protection to use a customer-managed key (BYOK) in Azure Key Vault
- **[Set-AipServiceKeyProperties](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicekeyproperties?view=azureipps)** — sets a key status to Archived or Active. Only one active tenant key at a time; activating one key automatically archives the previous.

`[来源: ado-wiki-activate-aipservice-keys-byok-mmk.md]`

---

## Scenario 19: Step 1: Identify what command is failing
> 来源: ado-wiki-activate-aipservice-keys-byok-mmk.md | 适用: 未标注

### 排查步骤
- If switching from a BYOK key to another key:
  - Verify the previously active BYOK key is still present in KeyVault
  - Verify proper access to AIPService is granted in KeyVault
  - If AIP service cannot access the Active key or it was deleted from KeyVault, the switch command will fail
  - If BYOK key was deleted → collect error details and correlation ID → escalate

- Verify AIP Service has correct permissions in Key Vault:
  [Bring Your Own Key (BYOK)](https://learn.microsoft.com/en-us/azure/information-protection/byok-price-restrictions#enabling-key-authorization-using-powershell)

- If activating BYOK, verify key length is supported:
  [BYOK Key Length Requirements](https://learn.microsoft.com/en-us/azure/information-protection/byok-price-restrictions#key-length-requirements)

`[来源: ado-wiki-activate-aipservice-keys-byok-mmk.md]`

---

## Scenario 20: Step 2: Get Assistance
> 来源: ado-wiki-activate-aipservice-keys-byok-mmk.md | 适用: 未标注

### 排查步骤
If above steps do not resolve the issue, escalate with:
- Command output with **-Verbose** parameter
- Error details and correlationID

`[来源: ado-wiki-activate-aipservice-keys-byok-mmk.md]`

---

## Scenario 21: AIP Tenant Migrations
> 来源: ado-wiki-aip-tenant-migrations.md | 适用: 未标注

### 排查步骤
Please read this article to learn about the different options available for AIP migration.

**Important notes:**
- CSS doesn't help customers with the whole AIP tenant migration process. Customer can engage Consultant services to properly plan and implement the migration.
- CSS can help if customer needs assistance on any specific steps in the migration process. Eg: Exporting or importing the AIP keys or unable to open the encrypted file after migration.
- If any customer is experiencing issues decrypting the encrypted files/mails after migrating to a new tenant, use this wiki as a troubleshooting guide.

`[来源: ado-wiki-aip-tenant-migrations.md]`

---

## Scenario 22: 1. Is the customer migrating from one EntraID tenant to another?
> 来源: ado-wiki-aip-tenant-migrations.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-aip-tenant-migrations.md]`

---

## Scenario 23: 2. Is the customer migrating from AD RMS to AIP?
> 来源: ado-wiki-aip-tenant-migrations.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-aip-tenant-migrations.md]`

---

## Scenario 24: Introduction
> 来源: ado-wiki-b-aip-service-ps-commands.md | 适用: 未标注

### 排查步骤
This is a place for sharing various PowerShell commands with the `AipService` module.

For informationa about installing and connecting the the AipService module see [this table](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/11330/How-To-Connect-to-Services).

`[来源: ado-wiki-b-aip-service-ps-commands.md]`

---

## Scenario 25: Templates
> 来源: ado-wiki-b-aip-service-ps-commands.md | 适用: 未标注

### 排查步骤
|  | Command | Description |
|--|--|--|
| **Templates** |  |  |
|  | `(Get-AipServiceConfiguration).templates` | Lists basic template information |
|  | `(Get-AipServiceConfiguration).templates \| Sort-Object -Property IsPublished` | Template info sorted by Status |
| Publish a template | `Set-AipServiceTemplateProperty -TemplateID *guid* -Status Published` | [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/Set-AipServiceTemplateProperty?view=azureipps#example-1-update-a-templates-status) |
| **Get template scopes** | | |
| cmd 1 | `$templates = Get-AipServiceTemplate` | Sets a variable of all the templates |
| cmd 2 | `foreach ($template in $templates) {Get-AipServiceTemplateProperty -TemplateId $template.TemplateId -Name -ScopedIdentities -Status \| fl}`| Provides some details of each template including scope. |
| **List all names or descriptions of a specific template** | | |
| cmd 1 | `(Get-AipServiceConfiguration).Templates` | Gets the list of template names and IDs. |
| cmd 2 | `(Get-AipServiceTemplate -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37) \| Select -ExpandProperty Names` | Displays all the names/locales for the specified template. |
| cmd 3 | `(Get-AipServiceTemplate -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37) \| Select -ExpandProperty Descriptions` | Displays all the descriptions/locales for the specified template. |

`[来源: ado-wiki-b-aip-service-ps-commands.md]`

---

## Scenario 26: Introduction
> 来源: ado-wiki-b-document-tracking.md | 适用: 未标注

### 排查步骤
Manage the Document Track and Revoke (TnR) feature with the AipService PowerShell module.

`[来源: ado-wiki-b-document-tracking.md]`

---

## Scenario 27: Manage
> 来源: ado-wiki-b-document-tracking.md | 适用: 未标注

### 排查步骤
- Turn the TnR feature on: [Enable-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/enable-aipservicedocumenttrackingfeature?view=azureipps) 
 - Turn the TnR feature off: [Disable-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/disable-aipservicedocumenttrackingfeature?view=azureipps)
 - Check the status of the TnR feature: [Get-AipServiceDocumentTrackingFeature](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumenttrackingfeature?view=azureipps)
 - Prevent document tracking for members of a group: [Set-AipServiceDoNotTrackUserGroup](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedonottrackusergroup?view=azureipps)
 - Get do not track group configuration: [Get-AipServiceDoNotTrackUserGroup](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedonottrackusergroup?view=azureipps)

`[来源: ado-wiki-b-document-tracking.md]`

---

## Scenario 28: Tracking Information
> 来源: ado-wiki-b-document-tracking.md | 适用: 未标注

### 排查步骤
The following commands display information about tracked content.
 - Get protection information about tracked documents: [Get-AipServiceDocumentLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumentlog?view=azureipps)
 - Get tracking information for documents: [Get-AipServiceTrackingLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicetrackinglog?view=azureipps)

`[来源: ado-wiki-b-document-tracking.md]`

---

## Scenario 29: Revocation
> 来源: ado-wiki-b-document-tracking.md | 适用: 未标注

### 排查步骤
- Revoke a tracked doucument: [Set-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedocumentrevoked?view=azureipps)
 - Un-revoke a revoked document: [Clear-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/clear-aipservicedocumentrevoked?view=azureipps)

`[来源: ado-wiki-b-document-tracking.md]`

---

## Scenario 30: Introduction
> 来源: ado-wiki-b-dsr-delete-request.md | 适用: 未标注

### 排查步骤
Customers may contact CSS to request one of several DSR delete [requests](https://docs.microsoft.com/en-us/azure/information-protection/manage-personal-data#deleting-personal-data). The below process is required. 

Customers may request deleting entries from their AIP Service Admin Logs, AIP Service User Logs, and the AIP Service Tracking Portal. The process is the same for any types of request.

For issues, unnecessary delays, or other feedback, you may contact your TA.

`[来源: ado-wiki-b-dsr-delete-request.md]`

---

## Scenario 31: Overview
> 来源: ado-wiki-b-dsr-delete-request.md | 适用: 未标注

### 排查步骤
1. Customer opens case with CSS to request a DSR delete.
2. Customer provides tenant information.
3. CSS initiates the verification process.
4. After completing the verification process CSS engages the AIP Ops team for the DSR delete request.

From [To delete personal data with Microsoft Support](https://docs.microsoft.com/en-us/azure/information-protection/manage-personal-data#to-delete-personal-data-with-microsoft-support)

`[来源: ado-wiki-b-dsr-delete-request.md]`

---

## Scenario 32: Tenant Information
> 来源: ado-wiki-b-dsr-delete-request.md | 适用: 未标注

### 排查步骤
1. Customer provides the following information about the tenant from which the data is to be deleted.
2. The FQDN of the *.onmicrosoft.com tenant.
3. Output of the AIP Service PowerShell command `Get-AipServiceConfiguration`
 
Please specify what is being requested for the DSR delete request. This includes the target log (Admin/User/Tracking) for the delete and the date range to be deleted. In the case of a tracking portal delete request the target email address is request as well as the date range.
 - To delete the administration log (_Get-AipServiceAdminLog_), provide the end date. All admin logs until that end date will be deleted.
 - To delete the usage logs (_Get-AipServiceUserLog_), provide the end date. All usage logs until that end date will be deleted.
 - To delete the document tracking logs, provide the end date and UserEmail. All document tracking information relating to the UserEmail until that end date will be deleted. Regular expression (Perl format) for UserEmail is supported.
 

###Verification
This process is as follows.
 - Get a list of the tenant administrators. In Azure AD, this is the Global Administrator role. In Azure Support Center this is the Global Administrator role. 
 - This is a bit trickier than it used to be. In the olden days tenants used to have a good number of actual user accounts as the Global Administrator. We could just email them via the process and go from there. Now, some customers only have a few service accounts as the full time Global Administrators. The rest are using privilege access management so that users request the Global Administrator role as needed, for limited time. We have to take this into account for our verification process.
 - Generate the emails to applicable parties.
 
##DSR Delete process
###Notifications
One step is required for this process. A set of email notifications are sent to all the global tenant administrators. 
1. The global administrators each get an email telling them of the request for the AIP DSR delete request.
 - Each administrator has five (5) business days from the date of the emails are sent to respond.
 - Any administrator may reply to cancel the request.
 - Administrators are not required to reply to approve the request.
 - After the five days, if no email responses return cancelling the request, the DSR request process continues.

###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.

There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. _Method 1_: Use [Azure Support Center](https://microsoft.sharepoint.com/%3Aw%3A/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. _Method 2_: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/%3Aw%3A/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - Email [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXHQiOG_qJNEumgzcObBwu4BFnSc77UUOx-gYRZ1Kiniwg?e=bx2YrS)

Only global administrators are notified of the request. ** Do not send the requestor this notification email if they are a global administrator.**

###Create the emails for the global administrators.
1. Send one email to each administrator. One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the AipDsrDeleteNotify@microsoft.com address.
4. The subject line should read as follows: AIP DSR delete request (SR#).
5. Use one of the following template for the body of the email.
 - AipService Admin Log delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EYI4mMrEichJg0ZdM5AxPOcBedAY9Rc3mSXXOXAKTca7Sg?e=X3zJO5)
 - AipService User Log delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EWhG9bwzy_RLlAb26twjmvQB0Lsa5yBjP2DQd8hYhyn66Q?e=wCkgce)
 - AIP Tracking Portal delete request [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/Edq7jLDqd2JOlfmSdJx-tXQBqH3IKr6pbn9iLM30fEcJBg?e=JKd2iE)
6. **NOTE**: If a global administrator notification bounces (e.g. invalid email address) the customer must fix the issue. Either the user needs to be removed from global administrators or the reason for the bounce to be fixed. Then the verification process for the said administrators must be resubmitted. We do not tell the customer which account(s) have issues. They are capable of obtaining a list of global administrators and addressing the issue.
7. _PRO TIP_: In a blank email, do steps 2,3,4, and 5 above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.
 
###Engage Ops to do the requested deletion
Azure Support Center (ASC) should be used to create the ICM.
1.	Open an incident using ASC to generate the ICM.  See this [document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EU5HMKxq23JJgfaAjnPuIg4Bu9zr5LIg3zpZakYJIWKp2Q?e=SkRHgK) for details.
2. Make sure to use requested delete time frame using either US date structure (MM/DD/YYYY) or write it as verbal date (example: May 12th until May 15th)

`[来源: ado-wiki-b-dsr-delete-request.md]`

---

## Scenario 33: RMS v1 - Export TUDs and TPDs
> 来源: ado-wiki-b-rms-v1-export-tuds-tpds.md | 适用: 未标注

### 排查步骤
OG RMS supported exporting trusted user domains (TUDs) and trusted publishing domains (TPDs).

`[来源: ado-wiki-b-rms-v1-export-tuds-tpds.md]`

---

## Scenario 34: Exporting a TUD
> 来源: ado-wiki-b-rms-v1-export-tuds-tpds.md | 适用: 未标注

### 排查步骤
Export TUD through the RMS v1 administration interface. (Screenshot in original wiki.)

`[来源: ado-wiki-b-rms-v1-export-tuds-tpds.md]`

---

## Scenario 35: Exporting a TPD
> 来源: ado-wiki-b-rms-v1-export-tuds-tpds.md | 适用: 未标注

### 排查步骤
Export TPD through the RMS v1 administration interface. (Screenshot in original wiki.)

> **Note**: Most content in the original wiki page is screenshot-based. Refer to the source URL for visual guidance.

`[来源: ado-wiki-b-rms-v1-export-tuds-tpds.md]`

---

## Scenario 36: Overview
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
1. Customer opens case with CSS to request their TPD transaction.
2. Customer provides tenant information.
3. CSS initiates the verification process.
4. If a TPD export request, after verification CSS provides the AadrmTpd.exe tool to customer.
 - Customer generates a public and private key pair.
 - Customer sends CSS the public key.
5. CSS engages the RMS Ops teamfor thekey request.
6. In export cases Ops provides exported TPD to CSS and CSS sends customer the TPD.

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 37: Tenant Information
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
1. Customer provides the following information about the tenant from which the key is to be exported.
 - The FQDN of the *.onmicrosoft.com tenant.
 - Output of the Azure RMS PowerShell command `Get-AipServiceConfiguration` & `Get-AipServiceKeys` run against the tenant.

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 38: Sample steps to retrieve tenant data
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
1. Install the AIP Service PowerShell module (https://aka.ms/azipps).
2. Open an administrative PowerShell prompt.
3. Run the following commands.
 - `Start-Transcript`
 - `Connect-AIPService`
 - `Get-AIPServiceConfiguration`
 - `Get-AIPServiceKeys`
 - `Stop-Transcript`
4. Gather the transcript created in the previous steps. 

Please specify what is being requested for each key in the Get-AipServiceKeys output. Please use the KeyIdentifier values when describing what is to be done to a specific key. For each key in the output we need to know is it being deleted, archived, etc. The customer needs to specifically state what key they want to act upon, and what action they to do. 

For instance, if the Get-AipServiceKeys output is as below, and the customer wants to export the first key in the list, they need to explicitly state that in email. For example:

 - ![image.png](/.attachments/image-bcdaf36f-a3ae-4355-9048-c8daf5078054.png)

What to have the customer state in email.
```
Please export for the following key.
KeyIdentifier  : 4c700641-b16f-438e-adb0-fc9ac7992e75
```

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 39: Verification
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
Generally, this process is as follows.
 - Get a list of the tenant administrators. In Azure AD, this is the Global Administrator role. In Azure Support Center (ASC) this is now the Global Administrator role as well. 
 - This is a bit trickier than it used to be. In the olden days tenants used to have a good number of actual user accounts as the Global Administrator. We could just email them via the process and go from there. Now, some customers only have a few service accounts as the full time Global Administrators. The rest are using privilege access management so that users request the Global Administrator role as needed, for limited time. We must take this into account for our verification process.
 - Generate the emails to applicable parties.

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 40: TPD export process
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
Two steps are required for this process. One set of email notifications are sent to all the global tenant administrators. A second email is sent to the requestor. If the requestor is a tenant administrator they do not receive the first notification email.
1. The global administrators each get an email telling them of the request for the Azure RMS key.
 - Each administrator has five (5) business days from the date of the emails are sent to respond.
 - Any administrator may reply to cancel the request.
 - Administrators are not required to reply to approve the request.
 - After the five days, if no email responses return cancelling the request, the TPD export process continues.
2. The requesting user receives a separate email
 - Send an email telling the customer how to download the tool from their DTM. See below when sending the requestor an email for details  using the AadrmTpd.exe tool that will be provided.
 - See [this document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EfEAN7QKyPNFmBreVQTc--MBn99qyswDiohGUqDke3YGTg?e=gdIFwU) for details on obtaining and using the AadrmTpd.exe tool.

###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.
There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. <i>Method 1</i>: Use [Azure Support Center](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. <i>Method 2</i>: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - [Email template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdIIdNKNODZOmCKEYJTXIJMB-jSlnlhA2iYyWgCKTe7Ibg?e=KcZc4k)
3. Only global administrators are notified of the request. <b><i>Do not send the requestor this notification email if they are a global administrator</i>.</b>

###Create the emails for the global administrators.
These are just to the global administrators, not the requestor!
1. **Send one email to each administrator.** One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the tpdexportnotify@microsoft.com address.
4. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
5. Use the following [template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/Ed7UswUu8dJEmqwR-njeNL8B22Ms-UtIWBwLG1R5Giy8Bw?e=tbfWer) for the body of the email.
6. **NOTE**: If a global administrator notification bounces (e.g. invalid email address) the customer must fix the issue. Either the user needs to be removed from global administrators or the reason for the bounce to be fixed. Then the verification process for the said administrators must be resubmitted. We do not tell the customer which account(s) have issues. They are capable of obtaining a list of global administrators and addressing the issue.
7. *PRO TIP*: In a blank email, do steps 2,3,4, and e above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.

###Create the email to the requestor.
1. Cc the appropriate case mail email address.
2. Cc the tpdexportnotify@microsoft.com address.
3. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
4. Use the following [template](https://microsoft.sharepoint.com/:w:/t/CSSSecurity2/Eesl3ntYaV9Mt-9n02oWI3gBEsQ6GFmT45f0ZgA0rLrtOQ?e=7k01uz) for the body of the email.



##Key deletion process
###Identify the tenant administrators. 
Once the admins are identified, we'll email them later.
There are two different methods for identifying Global Administrators. The first method is when we have user accounts configured as global admins all the time. The second method is when the customer does not have full time user account global admins, when they use just in time admin elevation we use the second method.
1. _Method 1_: Use [Azure Support Center](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EVpruhh6EvJHunh-uA8SqlkBec5AKd4JUVnFYGWY6hNhCw?e=GjpusC) to obtain a list of all the "Global Administrators" email addresses for the tenant.
2. _Method 2_: Use this process to identify eligible global administrators and verify them.
 - [Instructions](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EXxGIKWqOQFEpjYE_8U2_PcB7OgflSW9YCpMA39olmkw-A?e=ZvWWkz)
 - [Email template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdIIdNKNODZOmCKEYJTXIJMB-jSlnlhA2iYyWgCKTe7Ibg?e=KcZc4k)

###Create the emails for the global administrators.
1. **Send one email to each administrator.** One email must be sent to each administrative email address as well as the alternate email addresses listed.
2. Cc the appropriate case mail email address.
3. Cc the tpdexportnotify@microsoft.com address.
4. The subject line should read as follows: "Azure Information Protection (AIP) key request (SR#)".
5. Use the following[template](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EaID8ZOhSqtBvzLzxY061_gBO0m18QOD8mLPiimKlda_EA?e=hQ6mpo)for the body of the email.
6. *PRO TIP*: In a blank email, do steps 2,3,4, and e above, then click back in the subject line and do a CTRL+F. This will create a copy of the message all filled in, you just need to add the unique admin emails. Saves some time.

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 41: Engage Ops to export the TPD
> 来源: ado-wiki-b-tpd-aip-key-requests.md | 适用: 未标注

### 排查步骤
Azure Support Center (ASC) should be used to create the ICM.
1. Open an ICM using ASC. See this [document](https://microsoft.sharepoint.com/:w:/t/Security-InformationProtection/EdR6O1ujwkdHpttopdzJDrwBz-MOj8I0xZSTXz2Mno_OPw?e=vwZ1Fr) for details.
2. When asked, provide the public key the customer generated to the Ops team.

**If a TPD export request**

Provide the exported TPD to the customer

Note: It is not an actual TPD yet. The customer uses the AadrmTpd.exe tool to merge the private key generated with the file Ops exports from Azure RMS.
1. Provide the customer with the file exported by the Ops team.
2. The customer uses AadrmTpd.exe to generate the TPD from their private key and the file provided by the Ops team.
3. Use the following [template](https://microsoft.sharepoint.com/:w:/r/teams/Security-InformationProtection/Shared%20Documents/General/Process/TPD%20Process/FinalAadrmTpdSteps.docx?d=w8af161e4ccaa44329fc4fc6e5e2e12aa&csf=1&web=1&e=cWfYaw) in an email to the customer to ensure they complete the key process.
  
   The customer MUST use the [AadrmTpd.exe tool to merge the key material](https://learn.microsoft.com/en-us/azure/information-protection/operations-microsoft-managed-tenant-key#step-3-receive-key-instructions-from-css:~:text=Respond%20to%20the,file%20from%20CSS.) we send them with the private key they generated.

`[来源: ado-wiki-b-tpd-aip-key-requests.md]`

---

## Scenario 42: Introduction
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
The AipService PowerShell (PS) module may be used to track and revoke protected content.

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 43: Public Documentation
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
- Admin: [Track and revoke document access](https://learn.microsoft.com/en-us/purview/track-and-revoke-admin)
 - User: [Track and revoke access to your files](https://support.microsoft.com/en-us/office/track-and-revoke-access-to-your-files-1de9a543-c2df-44b6-9464-396b23018f96)

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 44: Cmdlets Used
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
- [Get-AipServiceDocumentLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumentlog?view=azureipps)
 - [Get-AipServiceTrackingLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicetrackinglog?view=azureipps)
 - [Set-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedocumentrevoked?view=azureipps)

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 45: Setup
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
- User2 created 2 documents.
   - Each document had text added.
   - Each document had protection label applied. (Each file received a different label).
   - Documents were saved, and closed. 
 - User 2 opened each document a second time.

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 46: Action
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
- The Word documents were given to User1. 
 - User1 opened each file.

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 47: PowerShell
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
The administrator did `Connect-AipService`. 

Once connected, the administrator used `Get-AipServiceDocumentLog` and `Get-AipServiceTrackingLog` to gather information on the two files User2 created and tracked.

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 48: Display Document Log
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
`Get-AipServiceDocumentLog -UserEmail user2@cloud1.com -FromTime 04/23/2025`


```
ContentId             : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer                : user2@cloud1.com
Owner                 : user2@cloud1.com
ContentName           : Dynamic test - by User2.docx
CreatedTime           : 4/24/2025 13:05:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud1.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud2.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 642a66be-2079-425e-921a-228ac8c3c9fc
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: False
                        RevokedTime:
                        RevokedBy:
                        UnRevokedBy:
                        UnrevokedTime:
```


```
ContentId             : 4676f1a4-4062-49c0-bc29-fc8a5d05b5f6
Issuer                : Cloud1
Owner                 : user2@cloud1.com
ContentName           : Word3.docx
CreatedTime           : 4/23/2025 19:16:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud1.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud2.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 46dcecd5-3853-46c4-ad8f-17f316d41e3c
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: False
                        RevokedTime:
                        RevokedBy:
                        UnRevokedBy:
                        UnrevokedTime:
```

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 49: Display Tracking Information
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
`Get-AipServiceTrackingLog -UserEmail user2@cloud1.com -FromTime 04/23/2025`


```
ContentId            : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer               : user2@cloud1.com
RequestTime          : 4/24/2025 13:05:56
RequesterType        : User
RequesterEmail       : user1@cloud1.com
RequesterDisplayName : User 1
RequesterLocation    : IP: 72.152.179.15
                       Country:
                       City:
                       Position:

Rights               : {VIEW,VIEWRIGHTSDATA,DOCEDIT,EDIT,PRINT,EXTRACT,REPLY,REPLYALL,FORWARD,OBJMODEL}
Successful           : True
IsHiddenInfo         : False
```
```
ContentId            : d5cd6202-4c05-4b80-9d37-3d862bf6cc60
Issuer               : user2@cloud1.com
RequestTime          : 4/24/2025 13:03:46
RequesterType        : User
RequesterEmail       : user1@cloud1.com
RequesterDisplayName : User 1
RequesterLocation    : IP: 72.152.179.15
                       Country:
                       City:
                       Position:

Rights               : {VIEW,VIEWRIGHTSDATA,DOCEDIT,EDIT,REPLY,REPLYALL,FORWARD,OBJMODEL}
Successful           : True
IsHiddenInfo         : False
```

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 50: Revoke Content
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
`Set-AipServiceDocumentRevoked -ContentId d6090047-22cc-4c5b-8b46-92d52e21a056 -IssuerName user2@cloud1.com`
```
This document is now revoked. All recipients will lose access to this document. If the label allows offline access, recipients will have access till the offline access expires.
```

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 51: Verify Revocation
> 来源: ado-wiki-b-track-and-revoke.md | 适用: 未标注

### 排查步骤
`Get-AipServiceDocumentLog -UserEmail user2@cloud1.com -FromTime 04/24/2025`

```
ContentId             : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer                : user2@cloud1.com
Owner                 : user2@cloud1.com
ContentName           : Dynamic test - by User2.docx
CreatedTime           : 4/24/2025 13:05:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@slightcloud.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@microsoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 642a66be-2079-425e-921a-228ac8c3c9fc
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: True
                        RevokedTime: 4/24/2025 13:21:30
                        RevokedBy: admin@cloud1.com
                        UnRevokedBy:
                        UnrevokedTime:
```

`[来源: ado-wiki-b-track-and-revoke.md]`

---

## Scenario 52: Scenario: Connect-AIPService cmdlet fails or returns errors
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
This TSG describes how to troubleshoot issues with connecting to AIP Service using PowerShell command Connect-AIPService.

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 53: Request Flow for Connect-AIPService
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
1. Client connects to `discover.aadrm.com` and sends a **ServiceLocator** request
   - If successful, the service responds with authentication challenge
2. User enters credentials and acquires an authentication token from EntraID
3. Client sends request again to `discover.aadrm.com` with the acquired token
   - AIP service validates credentials and checks Global admin privilege
   - AIP service finds the corresponding AIP admin url for this tenant
   - AIP admin url is returned as ServiceLocationResponse
4. Client connects to the AIP service admin url and the connection is completed

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 54: Step 1: Check AIPService PowerShell Module is installed
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
- Run: `Get-Module -ListAvailable -Name aipservice`
- Verify the build number is up-to-date: [PowerShell Gallery | AIPService](https://www.powershellgallery.com/packages/AIPService/)
- If not installed: `Install-Module -Name AIPService`

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 55: Step 2: AIPService module doesn't support PowerShell 7
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
- Make sure to run Connect-AIPService from PowerShell 5 window

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 56: Step 3: Verify if the Credential box is prompted
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
- If credential box is not prompted → connection to `discover.aadrm.com` is failing → proceed to Step 5
- If failure occurs after entering credentials → verify username and password are correct

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 57: Step 4: Verify the user is a direct member of Global Administrator or AIP service rolebased Admin
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
- Even if the user has Global Administrator privilege granted as part of a group, Connect-AIPService will fail
- Must add user as direct member of Global Administrator
- Or use [Add-AipServiceRoleBasedAdministrator](https://learn.microsoft.com/en-us/powershell/module/aipservice/add-aipservicerolebasedadministrator?view=azureipps)

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 58: Step 5: Run with -Verbose parameter
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
```powershell
Connect-AipService -Verbose
```

- Check if error details are Network or SSL related
- If SSL/Network related:
  - Ensure TLS 1.2 or above are enabled on the machine
  - Verify required cipher suites are enabled (compare TLS handshake with working machine)
  - Verify network requirements for AIP service: [Requirements for Azure Information Protection](https://learn.microsoft.com/en-us/azure/information-protection/requirements#firewalls-and-network-infrastructure)
  - Verify connection to AIP endpoints is successful

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 59: Step 6: Get Assistance
> 来源: ado-wiki-connect-aipservice-fails.md | 适用: 未标注

### 排查步骤
If above steps do not resolve the issue, escalate with:
- Command output with **-Verbose** parameter
- Error details and correlationID

`[来源: ado-wiki-connect-aipservice-fails.md]`

---

## Scenario 60: Introduction
> 来源: ado-wiki-migrate-aip-byok-key-vault.md | 适用: 未标注

### 排查步骤
Customers need to move AIP Service BYOK keys from one Azure Key Vault (AKV) to another.

`[来源: ado-wiki-migrate-aip-byok-key-vault.md]`

---

## Scenario 61: Starting configuration
> 来源: ado-wiki-migrate-aip-byok-key-vault.md | 适用: 未标注

### 排查步骤
The AIP service is using a BYOK in an AKV location. The AIP service is using the AKV key via the key's URL.

When migrating the BYOK to a new vault the key material must be provided by the customer. The customer had the original key and must create the new vault and populate it with the same key anew.

`[来源: ado-wiki-migrate-aip-byok-key-vault.md]`

---

## Scenario 62: Steps
> 来源: ado-wiki-migrate-aip-byok-key-vault.md | 适用: 未标注

### 排查步骤
Note, the BYOK key's key identifier will be the same, regardless of AKV location.
1. Leave the original BYOK key, subscription, AKV intact. Do not change anything.
2. Import that original BYOK key from on premises HSM and put it in a new AKV in the new subscription.
3. Configure the new AKV to allow AIP service to be able to use it.
4. Use `Convert-AipServiceKeyToKeyVault` to point the original key identifier to the new AKV key.
5. Use `Set-AipServiceKeyProperties` to change the status of an imported BYOK to be active.
6. Use `Use-AipServiceKeyVaultKey` to configure RMS to use the new active BYOK.

The key identifier is the same in the old AKV spot and in the new one.
The AKV URL will be different between old and new vaults. You are just pointing the key to the new vault location.
If anything goes wrong, the remediation is to use that command to point the key identifier to the old AKV URL.

Once confirmed (via AKV auditing) that encrypted content created using the old key uses the new AKV key, remove the old vault, etc.

`[来源: ado-wiki-migrate-aip-byok-key-vault.md]`

---

## Scenario 63: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

`[来源: mip-request-analysis.md]`

---

## Scenario 64: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 65: 必要参数
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

`[来源: mip-request-analysis.md]`

---

## Scenario 66: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

`[来源: mip-request-analysis.md]`

---

## Scenario 67: 结果字段说明
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

`[来源: mip-request-analysis.md]`

---

## Scenario 68: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 69: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

`[来源: mip-request-analysis.md]`

---

## Scenario 70: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 71: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 72: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 73: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 74: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 75: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 76: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 77: 必要参数
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

`[来源: rms-auth-tracking.md]`

---

## Scenario 78: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 79: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 80: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 81: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
根据 correlationId 查询 AAD 登录失败的详细错误信息。

`[来源: rms-auth-tracking.md]`

---

## Scenario 82: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 83: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 84: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 85: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 86: 常见 AADSTS 错误码
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

`[来源: rms-auth-tracking.md]`

---

# Kusto 查询参考

## 来源: `mip-request-analysis.md`

# MIP 请求日志分析

## 用途

分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

## 查询 1: 按 correlationId/tenantId 查询所有 MIP 请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

## 查询 2: 查询 PL/EUL 解密请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

## 查询 3: 统计失败请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

按操作类型和错误码统计失败的 MIP 请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

## 查询 4: 查询 RMS 跟踪日志

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

根据 correlationId 查询详细的跟踪日志。

### 查询语句

```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

## 关联查询

- [rms-auth-tracking.md](./rms-auth-tracking.md) - RMS 认证追踪（ESTS 日志）

---

## 来源: `rms-auth-tracking.md`

# Azure RMS 认证追踪

## 用途

追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

## 查询 1: 查询 Azure RMS 登录请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

## 查询 2: 查询诊断跟踪日志 (AADSTS 错误详情)

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

根据 correlationId 查询 AAD 登录失败的详细错误信息。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

## 查询 3: 统计 RMS 登录失败

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

按错误码统计 Azure RMS 的登录失败情况。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

## 常见 AADSTS 错误码

| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

## 关联查询

- [mip-request-analysis.md](./mip-request-analysis.md) - MIP 请求日志分析

---

