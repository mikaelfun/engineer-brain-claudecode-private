---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Grace Period/Grace Period for Windows 365 Enterprise"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Grace%20Period/Grace%20Period%20for%20Windows%20365%20Enterprise"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Check if an Enterprise CPC is in Grace Period using CPCD

## Prerequisites
- Tenant ID
- User ID

## Steps

1. Access CPCD and go to the **Action Diagnostic** blade
2. Scroll down until you reach **Action Events Overview**
3. Look for the CPC attributed to the **User ID**
4. In the service plan column, look for **Enterprise**

## Important Notes

- The Grace period should have the statuses in chronological order: **Draft -> Success**. This confirms the machine is indeed in grace period.
- If you see **Cancel Grace period** in between, it means the user got assigned a new license or was added to the provisioning policy.
- Check the **OriginalServicePlanID** column to make sure you are seeing the same resource.
