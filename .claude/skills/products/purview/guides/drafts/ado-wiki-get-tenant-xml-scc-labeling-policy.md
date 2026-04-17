---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Get Tenant XML SCC labeling Policy"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Tools/Get%20Tenant%20XML%20SCC%20labeling%20Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Tenant XML SCC labeling Policy

## Purpose
If SCC may not be working due to tenant specific issues or policy, this script will retrieve the XML Policy. This process allows the Babylon CSS team to identify if the support ticket should be moved to SCC CSS team for investigation (in case policy is not retrieved correctly) or it should be managed by the Babylon CSS team.

## Key Points
- Customer can check if SCC policy is being pulled correctly by running the GetPolicy.ps1 script
- The PS script returns the match policy in the context of the user running the command
- Good starting point to check SCC responsiveness (small chance script works but Babylon still has issues retrieving policy)
- Customer running the script should be able to see all scoped and un-scoped labels
- With new SCC UX change, customers can scope labels just for Babylon (making them inapplicable for Office apps labeling)

## Running the Script

1. Login with admin privileges
2. Windows compatible
3. Use any account: Uses msal.ps package (supports MFA) - script will request if not installed
4. Download & Run GetPolicy.ps1 from PowerShell prompt (available in wiki attachment)
5. Review results — script returns the Policy XML
