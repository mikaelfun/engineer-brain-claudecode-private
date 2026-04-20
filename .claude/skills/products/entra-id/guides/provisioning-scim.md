# ENTRA-ID User Provisioning (SCIM) — Quick Reference

**Entries**: 30 | **21V**: Partial (25/29)
**Last updated**: 2026-04-18
**Keywords**: provisioning, scim, outbound, aws, scim-validator, attribute-mapping

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/provisioning-scim.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Azure AD to SaaS app (e.g., Salesforce) provisioning syncs unexpected/incorrect timezone for user... | Azure AD user accounts do not have a timezone attribute. The attribute mappin... | Edit or create attribute mapping: Enterprise app > Provisioning > Mappings. F... | 🟢 9.0 | OneNote |
| 2 📋 | Google App provisioning configuration fails to save with error: Size of input ExternalSecret data... | Combined configuration data (credentials + settings like notification email) ... | Two workarounds: 1) Use two separate gallery app instances - one for SSO, one... | 🟢 9.0 | OneNote |
| 3 📋 | Auto-provisioning (SCIM) for non-gallery app fails with SystemForCrossDomainIdentityManagementCre... | The SCIM endpoint URL provided by the app vendor has an invalid/mismatched SS... | Use the correct SCIM endpoint URL that has a valid SSL certificate. For LastP... | 🟢 9.0 | OneNote |
| 4 📋 | Mooncake provisioning feature parity status: cross-cloud sync private preview refresh (March 2025... | - | Feature status as of Aug 2025: HR-driven provisioning (API-driven supported, ... | 🟢 9.0 | OneNote |
| 5 📋 | AWS provisioning Test Connection fails with DiceCredentialValidationFailure when configuring Clou... | The AWS user account used for provisioning is required by AWS policy to perfo... | Exclude the AWS service account from the AWS MFA policy so programmatic acces... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Creating a Distribution list in Exchange Online / Azure AD sync fails with error: 'The value spec... | Exchange Online and Azure AD restrict a set of reserved words (abuse, admin, ... | Create the distribution list first with a temporary non-blocked alias (e.g., ... | 🟢 8.5 | ADO Wiki |
| 7 📋 | After October 2024 update, Entra Enterprise App Provisioning settings (Admin Credentials / Tenant... | UI migration from Knockout API to React API for the Entra Enterprise Apps Pro... | Find settings in new dedicated blades: (1) Tenant URL and Secret Token → new ... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Users receive AADSTS5000225 error: This tenant has been blocked due to inactivity. ASC may show E... | Microsoft lifecycle policy blocks tenants inactive >200 days past billing cyc... | 1) Collect tenant ID, correlation ID, timestamp. 2) SE files ICM using ASC te... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Azure AD provisioning fails to export/import new roles from SaaS apps (AWS, Salesforce, etc.) to ... | Role names imported from SaaS app contain invalid characters or exceed 120-ch... | Fix role names in the source SaaS application to comply with Azure AD Graph A... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Azure AD Connect synchronization is throttled during object provisioning - customer wants to incr... | Write limits during object provisioning are by design and uniformly enforced.... | 1) Distribute writes over time - introduce synced objects in phases. 2) Reduc... | 🟢 8.5 | ADO Wiki |
| 11 📋 | EntityTypeNotSupported warning in cross-tenant sync provisioning logs when groups are in sync scope | Cross-tenant group sync is not enabled in the sync configuration. The Provisi... | If customer wants to sync groups: enable group sync by setting Provision Micr... | 🟢 8.5 | ADO Wiki |
| 12 📋 | SCIM Validator tool shows error "Please enter a URL" even after entering a valid URL into the end... | The entered URL is missing the protocol prefix (https:// or http://). The SCI... | Ensure the SCIM endpoint URL begins with https:// or http:// (e.g., https://m... | 🟢 8.5 | ADO Wiki |
| 13 📋 | SCIM Validator tool shows "SCIM Validation failed. Internal Server Error" after reviewing attribu... | The entered SCIM endpoint URL is not valid or the endpoint does not exist. Th... | Verify the SCIM endpoint URL is correct and the endpoint is accessible. Ensur... | 🟢 8.5 | ADO Wiki |
| 14 📋 | SCIM Validator tool shows "Invalid credentials!" after reviewing attributes and initiating the test. | The entered bearer token or credentials are incorrect, or the SCIM endpoint U... | Review and correct the bearer token and SCIM endpoint URL. Ensure the token h... | 🟢 8.5 | ADO Wiki |
| 15 📋 | SCIM Validator tool shows "Could not discover the schema during processing" after submitting the ... | The SCIM endpoint URL entered is invalid. The validator cannot reach the /Sch... | Verify the SCIM endpoint URL is correct and accessible. Ensure the SCIM serve... | 🟢 8.5 | ADO Wiki |
| 16 📋 | SCIM Validator tool shows "/schemas endpoint not found" after submitting the endpoint and credent... | The SCIM server does not implement the /Schemas endpoint for schema discovery... | Implement the /Schemas endpoint on the SCIM server per SCIM 2.0 spec. Refer t... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Custom attribute not provisioned outbound to enterprise application. Provisioning schema shows Fl... | FlowBehavior is set to FlowWhenChanged in the provisioning schema JSON. Some ... | Navigate to Enterprise App > Provisioning > Edit attribute mappings > Show ad... | 🟢 8.5 | ADO Wiki |
| 18 📋 | User export to AWS IAM Identity Center fails with StatusCode 400 BadRequest: Request is unparsabl... | User object in Entra ID is missing one or more required attributes for AWS SC... | Ensure all users in provisioning scope have firstName, lastName, displayName,... | 🟢 8.5 | ADO Wiki |
| 19 📋 | User export to AWS IAM Identity Center fails with 400 BadRequest when provisioning email or phone... | AWS IAM Identity Center does not support multi-valued attributes for email an... | Option 1: Ensure user has only one value for phoneNumber/email in source. Opt... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Group membership update fails during outbound provisioning. User cannot be added to group in targ... | The member user is not being successfully provisioned from Entra ID to the ta... | Ensure the member user is in provisioning scope and successfully provisioning... | 🟢 8.5 | ADO Wiki |
| 21 📋 | After performing clear state/restart of provisioning job, group members are orphaned in target sy... | When clear state is performed while a read/write gap (backlog) exists and gro... | Check for read/write gap before performing clear state. If orphaning has occu... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Directory extension attributes are missing from the source attribute dropdown in provisioning att... | The getAvailableExtensionProperties API used by the attribute mapping UX has ... | Verify extensions exist via Graph API (POST directoryObject/getAvailableExten... | 🟢 8.5 | ADO Wiki |
| 23 📋 | All group members removed from Oracle IDCS (Identity Cloud Service) when only one user is removed... | Non-gallery app with Oracle connector is not SCIM compliant. Custom/BYOA SCIM... | Switch from the non-gallery/BYOA SCIM app to the official gallery app for Ora... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Customer asks about SCIM provisioning availability for non-gallery/BYOA applications in Mooncake. | SCIM provisioning via non-gallery app was a feature gap. As of Feb 2025, conf... | SCIM provisioning for non-gallery apps is GA in Mooncake (Feb 2025). For gall... | 🟢 8.0 | OneNote |
| 25 📋 | Provisioning to AWS IAM Identity Center fails due to invalid/unsupported characters in user attri... | AWS IAM Identity Center does not allow certain characters that Entra ID suppo... | Clean attribute values in Entra ID (source) to remove unsupported characters ... | 🔵 7.5 | ADO Wiki |
| 26 📋 | Customer reports Azure AD Join failure or provisioning issue on device with displayname starting ... | Windows 365 Cloud PCs use a unique 'zero touch' AADJ process, not standard En... | Identify Cloud PC: displayname starts with 'CPC-', Device Model in Intune sho... | 🔵 6.5 | ADO Wiki |
| 27 📋 | Need to validate if M365 Identity tenant is concierge (seat count < 300). IsConcierge in Case Bud... | The IsConcierge attribute in Case Buddy and the Support Area Name attribute a... | Validate concierge status using IsConcierge attribute in Dynamics for Microso... | 🔵 6.5 | ADO Wiki |
| 28 📋 | ECMA Connector Host provisioning placed into quarantine with error SystemForCrossDomainIdentityMa... | ECMA Connector Host is not accessible from Microsoft Entra ID. Common causes:... | Verify ECMA Host server is online. Check ECMA2Host service status (Get-Servic... | 🔵 6.5 | ADO Wiki |
| 29 📋 | ECMA Connector Host Test Connection fails with error "You appear to have entered invalid credenti... | No active provisioning agent assigned to the enterprise application. Customer... | In the Entra provisioning configuration, go to On-Premises Connectivity secti... | 🔵 6.5 | ADO Wiki |
| NEW 📋 | Customer tries to configure the service now provisioning in the Azure Portal. On the Provisioning Pa... | N/A | N/A | 🟡 6.5 | ContentIdea |

## Quick Troubleshooting Path

1. Check **provisioning** related issues (16 entries) `[onenote]`
2. Check **scim** related issues (7 entries) `[onenote]`
3. Check **scim-validator** related issues (5 entries) `[ado-wiki]`
4. Check **outbound** related issues (4 entries) `[ado-wiki]`
5. Check **aws** related issues (3 entries) `[ado-wiki]`
6. Check **cross-tenant-sync** related issues (2 entries) `[onenote]`
