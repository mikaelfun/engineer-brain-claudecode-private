---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Request Azure Subscription"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FRequest%20Azure%20Subscription"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enterprise Purview Account in EXTERNAL Azure Subscription

## How to Request an External Subscription

1) Ensure you are registered in the "Managed Environment" security group. [How do I register in the Managed Environment MCAPS Azure Security Group](https://aka.ms/AzRegWiki) and follow the steps to register yourself onto the security group. This can take 24-48 hours to process.

2) Go to [https://aka.ms/MCAPSNewAzureSub](https://aka.ms/MCAPSNewAzureSub)
- Fill out the required fields:
- Title: {brief description}
- Subscription Purpose: CSS Support
- **Subscription Type: {external}**
- Subscription Owner: {your name, unless you are creating on behalf of another user}
- Time Zone: {your time zone}
- Monthly Spend: $400
- Tenant Licensing: M365 E5 needed to be able to include compliance labels and policies
- The Requester and Reporting Manager fields will auto-populate
- Click on Terms and Conditions. Read carefully and understand the Terms and Conditions.
- Check the box to agree to Terms and Conditions and click Accept.
- Once the form is filled with all the required fields, validate and click "Submit".

## Login Error (IPv6 Issue)

After the Az Subscription has been deployed, there is a temporary login issue where you need to temporarily disable IPv6 to login for the first time. After accessing your External Az Subscription for the 1st time, then you can enable IPv6 again.

Steps: Control Panel > Network and Internet > Network and Sharing Center > Change adapter settings > Wi-Fi properties > Uncheck Internet Protocol Version 6 (TCP/IPv6) > Access subscription > Re-enable IPv6.

## Subscription Best Practices

- Don't leave Cx reproductions running.
- Don't leave VMs running over the weekend.
- Don't leave HDI clusters running over the weekend.
- Don't Leave Pipelines Running.
- Basically, don't leave anything running over the weekend unless strictly necessary because resources cost money and can be expensive!
- Things like Storage Accounts are okay to leave up over time as they only charge for the amount of data stored, and test sets are very small.
- Only permanently keep a few core resources you use regularly.
- Pick a naming convention to use for all your resources for easy management.
- Using different resource groups for different customer repros also makes for easy management.
