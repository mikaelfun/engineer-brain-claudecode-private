---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Test Tenant Management"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Test%20Tenant%20Management"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Test Tenant Management

*Source of truth: [SCIM Central](https://microsoft.sharepoint.com/teams/SCIMCentral/SitePages/Testing-Custo.aspx)*

**Target: All CSS FTE, DP, CSG**

> If there is conflicting information between this page and SCIM Central, SCIM Central is authoritative.

---

## Repro Tenant Types

**All CSS repro tenants must be built using MCAPS Support-compliant deployments.**

### Internal compliant tenant (`fdpo.onmicrosoft.com`)
- Use only if you need Azure credit (e.g., Azure VMs and storage)
- **Not sufficient for Intune-based troubleshooting and repros**
- You get corp credentials with Azure subscription, but no tenant management permissions

### External compliant tenant (recommended for Intune engineers)
- Standalone tenant with your own instance/domain
- Global administrator account access
- At least 1 Azure subscription credit included
- 5 M365 E5 licenses to start
- MSIT injects security/cost controls — review https://aka.ms/AzControlsWiki

---

## How to Get a Repro Tenant

1. Must be part of Judson Althoff's organization
2. Join AAD security group [Managed Environment FDPO Tenant - Standard](https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/fda1c45d-f5e4-43ca-a020-d9ac08f7880d) in MyAccess
3. Complete form at [aka.ms/MCAPSNewAzureSub](https://aka.ms/mcapsnewazuresub):

| Field | Recommended Value |
|---|---|
| Subscription purpose | CSS Support |
| Subscription type | External Subscription |
| Tenant Type | Managed Environment - User Tenant |
| Azure Subscription | Yes if needed (e.g., CMG) |
| Tenant Licensing | M365 E5 5-seats recommended |
| Manage Security/Compliance | Yes - Manage for me |
| Monthly Allowance | $400 |

4. Submit → automated approval email sent to you and your manager
   - If manager is OOO: submit support ticket at https://aka.ms/mcapssupport for alternate approver
   - If no email within 24 hours: open a support ticket at https://aka.ms/mcapssupport
5. Once provisioned: receive email with access info → [My Environments](https://managed-environments-web-prod-ui.azurewebsites.net/)
   - **DO NOT** change the admin account password
6. Set up MFA for the admin account and all new accounts:
   - Must: be on Azure VPN, disable IPv6 from network adapter, use InPrivate/Incognito window
   - For MFA troubleshooting: [Multi Factor Authentication Troubleshooting](https://aka.ms/AzMFAFAQ)
7. Access your test tenant in InPrivate/Incognito browser sessions

---

## Adding More Than M365 E5 Licensing

To add additional licenses (e.g., Intune Suite, Windows 365):

1. Go to: https://darsydigitalsupplychaincommercial.azurewebsites.net/PromoCodes/Create
2. Complete the form (key fields):
   - Product Group: Microsoft 365 & Windows Promo Codes
   - Product Type: Microsoft 365
   - Program List: Internal Use
   - Suggested Offer: Other
   - Offer Type: Trial Offer
   - Duration in Months: 12 Months
   - Number of Promo Codes: 1; Redemption Limit: 1; Extend End Date: Yes
3. Approval takes **7–10 business days** (BizApps team, not your manager)
4. Download promo code from approval email (Excel file → FinalPromoURL)
5. Open InPrivate browser (not signed in), navigate to promo URL, sign in with tenant GA account
6. Choose **Try now** to activate the trial license
7. Assign licenses after activation

### Common Intune License GUIDs

| Offer Name | Offer GUID |
|---|---|
| Microsoft Intune Suite Trial | e3d53c7d-5ef2-4352-9734-f568070f7b0f |
| Windows 365 Enterprise 2 vCPU, 8 GB, 128 GB Trial | ff348052-4678-46a4-ad3e-615b6705cbd2 |
| Windows 10/11 Enterprise E5 Demo Trial | 1dc8e203-dc00-4b34-bc7f-e00f75a8a4eb |
| Microsoft 365 E5 (no Teams) Trial | e8a7950f-96c3-4af2-ac38-d0e315a9baf9 |
| Microsoft Teams Enterprise Trial | 45d16476-0fce-4be9-836d-4c192ab05ee8 |

Search other GUIDs at [DARSy PBI Dashboard](https://msit.powerbi.com/groups/me/apps/eab2aacd-3a82-4d0a-8306-89ff0b7d3d48/reports/c5acd7a0-f24f-4834-a364-e487857a36d8/ReportSectiona5851041daf759e6a786). Only offers with `trial == true AND free == true` will be approved.

---

## Extending Licenses in MCAPS Tenants

Licenses have a 1-year lifespan, disabled 30 days after expiration, and tenant deprovisioned 30 days after that.

**To extend expiring licenses:**
1. Go to https://aka.ms/mcapssupport (VPN required)
2. Fill out form:

| Field | Value |
|---|---|
| Category | Azure |
| Severity | 3-Medium |
| Sub-Category | Licensing |
| Topics | License Extension (User Tenant) |
| Subscription ID | Managed Environments portal → your tenant |
| Tenant ID | Managed Environments portal → your tenant |
| Description | List licenses already in your tenant that need extension |

3. Extension may take up to one week

---

## Troubleshooting

### AADSTS5000224: "We are sorry, this resource is not available"
**Cause:** Tenant was deprovisioned.  
**Resolution:** Go to https://aka.ms/tenantreauthentication, enter the Entra tenant ID, attach a director-level (M2+ with "Director" in GAL title) FTE approval screenshot, select prod + sev 4. Fairfax requires CVP approval. Act within a few days for best chance of recovery.

### Sign-in errors: "Insufficient or lack of permissions is causing access restriction"
**Cause:** Licenses have expired or been disabled.  
**Resolution:** Sign into admin.microsoft.com with GA account and verify/re-enable licenses. See "Extending Licenses" above.

---

## More Help
- Extended FAQ: [MCAPS Frequently Asked Questions](https://microsoft.sharepoint.com/sites/ManagedEnvironment/SitePages/Frequently-Asked-Questions.aspx)
- Support tickets: [MCAPS Support - Incident Request](https://mcapsservices.powerappsportals.com/support/WCB-AzureSupport/?ServiceId=8016d886-6f84-ea11-a812-000d3a33cbf9) (VPN required)
