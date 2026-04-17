# AVD W365 Government (GCC/GCCH) — 排查工作流

**来源草稿**: ado-wiki-downgrade-from-gcc-to-fedramp.md, ado-wiki-government-support-guidelines.md, ado-wiki-restricted-region-exception.md, ado-wiki-set-up-pme-account.md, ado-wiki-w365-enterprise-for-gcc.md, ado-wiki-w365-gov-saw-gcch-setup.md, ado-wiki-w365-government-identify-tenant-type.md, ado-wiki-w365-government-offerings.md
**Kusto 引用**: (无)
**场景数**: 38
**生成日期**: 2026-04-07

---

## Scenario 1: Consideration 1: When to initiate licenses deletion
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: Global-only \u274c

### 排查步骤
For customers who have purchased the GCC licenses as a Volume License, a Commerce Support Ticket will need to be opened and queued, to initiate the deletion of the existing licenses for the GCC offering. Because of mutual exclusivity, until the licenses are completely deleted from the tenant, customers will not be able to begin the purchasing process of the FedRAMP licenses for the same tenant.
The deletion process takes at least 72 hours from the time of initiating the deletion, at which point Cloud PCs themselves will go into a Grace Period of 7 days. These times run concurrently, so decision makers should be considerate of potential end-user down times affected by how quickly purchasing gets processed.

## Scenario 2: Confirm the customer tenant is ready to consume FedRAMP activation
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: Global-only \u274c

### 排查步骤
After 72 hours have elapsed, the customer tenant should begin to finalize the GCC license getting removed from the tenant. For the customer, this should either look like the previous GCC licenses are greyed out or for them to be deleted completely when looking at "Your Products" under the M365 Admin Center.

## Scenario 3: Additional check in Intune Console
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: Global-only \u274c

### 排查步骤
Windows 365 blade will no longer show the message that Azure Government subscription is necessary and will show the Commercial message that they can try Windows 365 with Trials.

## Scenario 4: Kusto Queries
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: \u901a\u7528 \u2705

### 排查步骤
These queries need to be ran from a SAW device using PME account.

## Scenario 5: Tenant GCC offboard validation
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: Global-only \u274c

### 排查步骤
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ServiceName =="AADSyncDaemonFunction"
| where AccountId =="<TenantId>"
| where EventUniqueName =="TryParseOrganization" or EventUniqueName == "TryParseSubscribedPlan" or EventUniqueName == "ParseDirectoryContext"
| project env_time, env_cloud_environment, env_cloud_name, ApplicationName, ComponentName, EventUniqueName, Col1, Col2 , Col3 , Col4, Message,ActivityId, AccountId,ContextId , UserId, PayLoadId
```
`[来源: ado-wiki-downgrade-from-gcc-to-fedramp.md]`
   - env_cloud_name = GCP01 → still in GCC
   - env_cloud_name = PRNA01 or PRNA02 → FedRAMP

## Scenario 6: Tenant FedRAMP onboard validation
> 来源: ado-wiki-downgrade-from-gcc-to-fedramp.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "tn"
| where EventUniqueName == "PublishEventAsync"
| where Col1 == "Event publish succeed: Tenant.Onboard"
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```
`[来源: ado-wiki-downgrade-from-gcc-to-fedramp.md]`
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "LocationServiceFunction"
| where Col1 == "Tenant is soft deleted successfully."
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```
`[来源: ado-wiki-downgrade-from-gcc-to-fedramp.md]`

## Scenario 7: Government Support Rules
> 来源: ado-wiki-government-support-guidelines.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Enterprise only
   - Until further notice Windows 10 only. No Upgrade path.

## Scenario 8: Escort Sessions
> 来源: ado-wiki-government-support-guidelines.md | 适用: \u901a\u7528 \u2705

### 排查步骤
While the rule is anyone can open an Escort session, until further notice we will send Dev the ICM to open the Escort session. Reasons:
1. **Escort Sessions are not transferrable.** If the SaFF team opens an Escort session to look at Kusto or ASC and they need to transfer the case to Dev, they cannot paste the Kusto Query or the data in the ICM. Dev would need to open an escort session and start from scratch. We will transfer an ICM that we receive to Dev and contact the OCE.
2. **Intune model.** Intune has been using this model successfully and we have opted to use their model.
3. **Data breach risk.** It is very easy to accidentally dig too far or step out of bounds which would result in a data breach. This would be very costly to Microsoft and we could lose accreditation for Gov support altogether. Gov issues are audited often and the primary thing they are looking for is data breaches.

## Scenario 9: Option 1: ANC (Bring Your Own Network)
> 来源: ado-wiki-restricted-region-exception.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Customer has existing resources in the restricted region (e.g., ExpressRoute circuit)
   - Configure an ANC in the restricted region
   - **No exception needed**

## Scenario 10: Option 2: MHN (Microsoft Hosted Network)
> 来源: ado-wiki-restricted-region-exception.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Provision CPCs in another available (non-restricted) region
   - **No exception process available**
   - Work with account teams for network architecture (VNET peering, etc.)

## Scenario 11: Request PME Account
> 来源: ado-wiki-set-up-pme-account.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Access your SAW using your CORP credentials
2. Go to https://oneidentity.core.windows.net/User
3. Validate if the account exists or initiate a password reset if needed.
**NOTE**: If you still do not have access to the SAW yet, you can ask a manager or colleague that does have a SAW to create the account for you. You can also create support ticket with CloudMFA team to manage PME account (Create, Delete, Enable, Disable, Password Reset): https://cloudmfa-support.azurewebsites.net/IdentityAccess/UserAccount

## Scenario 12: Overview
> 来源: ado-wiki-w365-enterprise-for-gcc.md | 适用: Global-only \u274c

### 排查步骤
Windows 365 Enterprise is FedRAMP compliant and can now be purchased by customers with an existing GCC tenant. Previously, GCC tenants could only buy Windows 365 Government SKUs.
Key differences:
   - GCC tenant can buy W365 Enterprise and use Azure **Commercial** subscription for custom images and ANC
   - W365 Enterprise does NOT offer same compliance as W365 Government GCC (no CJIS, no IRS 1075)
   - Only FedRAMP compliance is maintained

## Scenario 13: Additional Services Status by Tenant Category
> 来源: ado-wiki-w365-enterprise-for-gcc.md | 适用: Global-only \u274c

### 排查步骤
| Tenant Category | W365 Scale Unit | Additional Services UX |
|---|---|---|
| Regular Commercial | All PROD (PRNA01, PRAU01) | Visible |
| W365 Enterprise for GCC | PRNA01 or PRNA02 | Visible - Temporary |
| GCC (w/o mapped GOV tenant) | GCP01 | Hidden |
| GCC (w/mapped GOV tenant) | GCP01 | Hidden |
| GCC-H | GHP01 | Hidden |

## Scenario 14: References
> 来源: ado-wiki-w365-enterprise-for-gcc.md | 适用: Global-only \u274c

### 排查步骤
   - [W365 Support Readiness Training](https://microsoft.sharepoint.com/:f:/t/CEContentLocker/2BePublished/ElQt383Mk0pFkQ80cZchMD4BukAkyBFPAWdpN6xCk0H_hA?e=qotHPe)
   - [Understanding Compliance Between M365 Offerings](https://techcommunity.microsoft.com/t5/public-sector-blog/understanding-compliance-between-microsoft-365-commercial-gcc/ba-p/718445)

## Scenario 15: Secure Access Workstation (SAW) for GCCH Troubleshooting
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: Global-only \u274c

### 排查步骤
**IF YOU HAVE NOT BEEN INFORMED BY YOUR MANAGER THAT YOU ARE JOINING THE GCCH TEAM, DO NOT COMPLETE ANY ACTIONS IN THIS DOCUMENT.**

## Scenario 16: General notes
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: Global-only \u274c

### 排查步骤
   - Complete all of the below actions to get fully setup for your SAW machine and support GCC-High.
   - Steps must be performed on your SAW machine will be indicated, otherwise your normal workstation (generally with VPN on) will work.
   - If you have questions, reach out to your manager or Technical Advisor(TA) /Technical Lead (TL).
> **NOTE**: For initial setup of your SAW device, you need to sign in, with your **corp credentials (@MSFT)** using a Smart Card or your YubiKey with your Corp credentials.
---

## Scenario 17: Step 1. Order Smart Card
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Connect to Azure VPN.
2. Go to [Global Security Self Service Portal](https://gsamportalam.corp.microsoft.com/rightcrowd/).
3. New Request → Badge Management Request → Chip only Smart Card → Yes → New Chip Only Smart Card.
4. Select Other (Smart Card Type).
   - GSAM: **GSAM Americas**
   - How to receive: Ship to my location
   - Justification: Need smart card for authentication with a SAW.
> **Alternative**: Use [corporate credential onto the Yubikey](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/CertificateServices/dsryubikeysetup.aspx?web=1#setting-up-your-fido-credential-on-your-security-key) method.

## Scenario 18: Step 3. Join silos
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Ensure Azure VPN is On.
2. Go to the [SAS Portal](https://sasweb.microsoft.com/Member).
3. Search "**CloudEnterprise**", select the result with ONLY "CloudEnterprise".
4. Click 'Join Silo'.

## Scenario 19: Step 4. Request a SAW
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Onboard as a New [C+AI / SAW User Onboarding](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/SAW-User-Onboarding.aspx).
2. Ensure you joined the CloudEnterprise Silo first.
3. [Fill the form](https://microsoft.sharepoint.com/teams/SCIMCentral/SitePages/Order-A-Saw.aspx).

## Scenario 20: Step 5. Unblock your Smart Card
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. On your regular corp machine, open Company portal app.
2. Install "**Microsoft Smart Card Manager**" app.
3. Install "**Smart Card Drivers (SafeNet Minidriver)**".
4. Launch "**Microsoft Smart Card Manager**" and follow prompts.

## Scenario 21: Step 6. Configure SAW
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Plug into power supply and Ethernet.
2. Follow [SAW Onboarding steps](https://microsoft.sharepoint.com/sites/Security_Tools_Services/SitePages/SAS/SAW%20Onboarding%20for%20New%20Users.aspx#set-up-your-saw-device).
3. Select **re-image option** during setup.

## Scenario 22: Step 7. Start VM
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open the VM, ensure network adapter with Default Switch is present.
2. Power up VM and enroll with Microsoft Corp account (Autopilot ESP).
3. Update with latest Windows updates.

## Scenario 23: Step 8. Set up PME account
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Follow: [Set up PME account](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1485020/Set-up-PME-account)

## Scenario 24: Step 9. Grant rights to PME account
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. On SAW, browse [OneIdentity Site](https://oneidentity.core.windows.net/Group) in incognito.
2. Sign in with **@pme.gbl** account using certificate.
3. Search group "**W365-KustoAccess-PME**".
4. Add your alias as member → Submit Changes.

## Scenario 25: Step 10. Access ASC Fairfax
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Open Edge InPrivate → https://azuresupportcenter.usgovcloudapi.net
   - Sign in using PME Security Key.

## Scenario 26: Step 11. Configure Kusto for GCCH
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Install [Kusto for SAW](https://aka.ms/kesaw).
   - Add connection with Advanced connection string:
```
Data Source=https://cloudpc.usgovvirginia.kusto.usgovcloudapi.net;Initial Catalog=NetDefaultDB;dSTS Federated Security=True;Authority Id=pme.gbl.msidentity.com;Dsts Token Type=JWT
```
   - Enter PME account: `alias@pme.gbl.msidentity.com`
   - Select "Use certificate" and pick PME cert.

## Scenario 27: Authentication Issues
> 来源: ado-wiki-w365-gov-saw-gcch-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Ensure PME certificate is present in SAW User Personal Certificates. If not, restart SAW.
Review: https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/191010/Authentication-Troubleshooting

## Scenario 28: Assist 365 URLs
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
Access with your `microsoftsupport.com` account:
   - **GCC and FedRAMP**: https://assist.microsoft.com/
   - **GCCH**: https://assist.office365.us/
> If you access the case/tenant using the incorrect link, you will receive an error.

## Scenario 29: Method 1: Check Licenses
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
In Assist 365: Tenant > Subscriptions > search for "Windows 365"
| Tenant Type | SKU Name Contains |
|-------------|------------------|
| GCCH | Windows 365 Government |
| GCC | Windows 365 Government (GCC) |
| FedRAMP | Windows 365 Enterprise for FedRAMP |

## Scenario 30: Method 2: Check Tenant Details
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: \u901a\u7528 \u2705

### 排查步骤
In Assist 365: Tenant > Details > Configuration details

## Scenario 31: GCCH
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
| Configuration | Value |
|--|--|
| Tenant type | GCC High |

## Scenario 32: GCC
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
| Configuration | Value |
|--|--|
| Company tags | servicescope.microsoft.com/ServiceScope=GCC, gcc.microsoft.com/gcc=approved |
| Tenant type | Multi-Tenant |

## Scenario 33: FedRAMP
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
| Configuration | Value |
|--|--|
| Company tags | windows365.microsoft.com/TenantSU=PRNA01, servicescope.microsoft.com/ServiceScope=GCC, gov.microsoft.com/gov=approved |
| Tenant type | Multi-Tenant |

## Scenario 34: Government Support Rules (Internal)
> 来源: ado-wiki-w365-government-identify-tenant-type.md | 适用: Global-only \u274c

### 排查步骤
   - Enterprise only
   - Windows 10 only until further notice (no upgrade path)
   - **Escort Sessions**: Send to Dev via ICM to open escort session (not transferable). Bridge with OCE if needed.
   - **GCCH**: Cannot paste Kusto data in notes, ICM, or email
   - Gov Kusto queries cannot go into dashboard
   - Do not tell/show customers about capacity issues or that "backend is broken"
   - Never volunteer team member locations
   - PME account setup: https://oneidentity.core.windows.net/User (from SAW)

## Scenario 35: Windows 365 Enterprise (GCC FedRAMP)
> 来源: ado-wiki-w365-government-offerings.md | 适用: Global-only \u274c

### 排查步骤
   - Customers provision and deploy Cloud PCs within their Commercial GCC tenant.
   - Environment: **.onmicrosoft.com** — Azure Commercial Backend
   - Support: Can be supported by any support engineer.
   - GCC FedRAMP is its own offering and is different than Commercial.
   - Windows 365 Enterprise for FedRAMP is configured the same as the current Commercial offer but the GCC customers cannot see Commercial offers.

## Scenario 36: Windows 365 Government for GCC (aka Windows 365 GCC)
> 来源: ado-wiki-w365-government-offerings.md | 适用: Global-only \u274c

### 排查步骤
   - Customers must have a Government and Commercial tenant.
   - Windows 365 Cloud PC resources are deployed into tenant (**.onmicrosoft.us**) environment; customer needs to run tools to map their Commercial GCC tenant to their Microsoft Azure Government (MAG) tenant.
   - Environment: **.onmicrosoft.com** — Azure Commercial with Fairfax backend.
   - Support: Can be supported by any support engineer. **If there is an issue with provisioning or mapping, the support should be passed to US Nat Support Engineer because of the Fairfax backend.**
   - For customers that want regular Intune but need some sovereign cloud security without full FedRAMP compliance.
   - Requires mapping of commercial tenant and Government tenant with shared Intune instance.
   - Originally done via PowerShell script (long and problematic). Since June 2023, the GCC Setup Tool (single UI tool) replaces the script — only needs to run once.

## Scenario 37: Windows 365 GCCH (GCC High)
> 来源: ado-wiki-w365-government-offerings.md | 适用: Global-only \u274c

### 排查步骤
   - Customer must have a government license.
   - Higher security.
   - Environment: GCCH resources deployed into MAG tenant (**.onmicrosoft.us**) — Sovereign backend (Fairfax/Virginia).
   - Support: **US Nat screened Engineers only.**

## Scenario 38: GCCH Support Challenges
> 来源: ado-wiki-w365-government-offerings.md | 适用: Global-only \u274c

### 排查步骤
   - Higher security requirements
   - US Nat Support only
   - Sovereign Backend (Fairfax/Virginia)
   - **.onmicrosoft.us** environment
   - Data breach is always a concern — audits are done on GCCH customer cases
   - Must be diligent and cautious regarding data handling rules
   - Improper data handling = violation → legal consequences and potential loss of Microsoft's government program accreditation
