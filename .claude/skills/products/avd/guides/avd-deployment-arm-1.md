# AVD AVD ARM 部署 (Part 1) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: 403, app-group, app-sharing, arm, call-drop, citrix, classic-avd, classic-resources
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Thin client AVD connection fails with error: The app is trying to access a servi... | Thin client AVD configuration is set to use Classic AVD (WVD) instead of ARM/V2 ... | Reconfigure the thin client AVD configuration to use ARM/V2 Workspace mode inste... | 🔵 7.5 | ADO Wiki |
| 2 📋 | WVD Classic migration fails with 'Insufficient role assignment quota to copy use... | Azure subscription has a hard limit of 2000 role assignments; the limit has been... | Re-run the migration command without the -CopyUserAssignments switch to skip use... | 🔵 7.5 | ADO Wiki |
| 3 📋 | After WVD Classic migration, users still see classic resources and receive 'You ... | Migration was started but not completed: Complete-RdsHostPoolMigration cmdlet wa... | If ready to complete migration and delete classic objects: run Complete-RdsHostP... | 🔵 7.5 | ADO Wiki |
| 4 📋 | WVD Classic migration fails with 'User is not authorized to query the management... | User running migration script does not have the required RDS Contributor role fo... | Assign the user the RDS Contributor role using the New-RdsRoleAssignment cmdlet ... | 🔵 7.5 | ADO Wiki |
| 5 📋 | WVD Classic migration fails with 'New-AzResourceGroup : Operation returned an in... | User running migration does not have required permissions in the Azure portal to... | Assign the user the Contributor role at the Subscription level in Azure portal | 🔵 7.5 | ADO Wiki |
| 6 📋 | WVD Classic migration fails with 'Unable to add role assignment. The client <use... | User running migration does not have permissions to assign users to application ... | Assign the user the User Access Administrator role in the subscription | 🔵 7.5 | ADO Wiki |
| 7 📋 | WVD Classic migration fails with 'Code=LocationNotAvailableForResourceType; Mess... | Migration tooling only supports creating service objects in US geography; custom... | Re-run the migration command with a US region specified in the -Location paramet... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Windows App for macOS crashes when user attempts to join a Teams Town Hall meeti... | Teams media optimization (VDI 1.0) does not support Town Hall meetings in Teams.... | Turn off media optimizations and join the Town Hall meeting, or connect to the C... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Screen Capture Protection (SCP) causes the presenter shared screen to show as a ... | Known limitation in Slimcore VDI 2.0 optimization - SCP conflicts with Teams scr... | Disable Screen Capture Protection (SCP) if screen sharing is required in Teams m... | 🔵 7.5 | ADO Wiki |
| 10 📋 | In Citrix VDI 2.0 environment, Teams app sharing sessions freeze for other parti... | Bug in Citrix VDA 2402 + CWA 2309.1+ interaction with Slimcore VDI 2.0 when vide... | Stopping and resharing the window resolves the issue temporarily. Permanent fix ... | 🔵 7.5 | ADO Wiki |
| 11 📋 | Large Cloud PC provisioning batch fails with service error or NameResolutionFail... | VPN Gateway overwhelmed by packet volume from Cloud PCs. With AES256+SHA256 algo... | 1) Upgrade VPN Gateway to higher SKU. 2) Change algorithm to GCMAES256 (120k pps... | 🔵 7.5 | ADO Wiki |
| 12 📋 | Need to collect CMD (Cloud Managed Desktop) Agent logs for Windows 365 provision... | - | CMD Agent logs are located at: C:\ProgramData\Microsoft\CMDExtension\Logs | 🔵 7.5 | ADO Wiki |
| 13 📋 | WVD Classic migration: everything migrates successfully except user assignments;... | Possible bug in the migration script; root cause unknown | Manually add the users to the App Groups in the Azure portal after migration com... | 🔵 7.0 | ADO Wiki |
| 14 📋 | Teams calls drop on the local machine that has an HID peripheral connected if a ... | Known issue with Slimcore VDI 2.0 - HID peripheral connected to the local endpoi... | Known issue - avoid running Teams simultaneously on the local machine and in the... | 🔵 7.0 | ADO Wiki |
| 15 📋 | Cloud PC cannot access certain web services because web service providers block ... | Web service providers block Azure Data Center IP ranges that Cloud PCs use for o... | Use browser developer mode to identify which web service component rejects the r... | 🔵 5.5 | ADO Wiki |

## Quick Triage Path

1. Check: Thin client AVD configuration is set to use Classi `[Source: ADO Wiki]`
2. Check: Azure subscription has a hard limit of 2000 role a `[Source: ADO Wiki]`
3. Check: Migration was started but not completed: Complete- `[Source: ADO Wiki]`
4. Check: User running migration script does not have the re `[Source: ADO Wiki]`
5. Check: User running migration does not have required perm `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-deployment-arm-1.md#troubleshooting-flow)
