---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Test Lab & Subscriptions/CSS MCAPS Subscription Lab"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FTest%20Lab%20%26%20Subscriptions%2FCSS%20MCAPS%20Subscription%20Lab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CSS MCAPS Subscription Lab (W365)

## CSS Azure Subscription Management
https://aka.ms/CssAzureSubRegistration

## MCAPS Support Subscriptions
Create new Azure subscription ($400) in the MCAPS managed environment: https://aka.ms/SupportSubscriptions

For Windows 365, choose **External Subscription** (aka User Tenant):
- Azure subscription provisioned in an External AAD tenant with M365 E5 license
- RBAC Owner on subscription, Global Admin in tenant
- Used when additional AAD permissions or licenses are needed

**Note:** This creates a brand new tenant with M365 E5 licenses. You also need to request Windows 365 licenses separately.

**Do not select Enterprise Premium P2 option.**

## Request Windows 365 test licenses
Follow the [DARSy Request Process](https://dev.azure.com/OneCommercial/NoCode/_wiki/wikis/NoCode.wiki/62/DARSy-Request-Process)

New location for Promo Codes (as of Nov 2025): [DARSy - Commerce Enablement Services](https://darsydigitalsupplychaincommercial.azurewebsites.net/PromoCodes/Create)

### Suggested licenses to request

| License | Offer GUID | Count |
|---------|-----------|-------|
| Microsoft 365 E5 (no Teams) Trial | e8a7950f-96c3-4af2-ac38-d0e315a9baf9 | 25 |
| W365 Enterprise 2/8/128 | 42968ea6-f48c-4865-a97e-be1c53f15eef | 3 |
| W365 Enterprise 4/16/256 | f25b2793-4168-40eb-b22a-79218a168511 | 3 |
| W365 Business 2/8/128 | b370ec89-3ea1-4ecb-9333-fa986fcbe436 | 1 |
| W365 Frontline 2/8/128 | ed202e7a-f98c-4182-95f5-78cc59b295bb | 1 |

## Apply test licenses to tenant
1. Receive email from microsoft-noreply@microsoft.com with Token Depot link
2. Go to DARSy "My Requests" tab, check status = "Campaign Created"
3. Download CSV, use FinalPromoURL column
4. Open URL in new test tenant browser tab and follow prompts

More information: https://aka.ms/promocodeuserguide
