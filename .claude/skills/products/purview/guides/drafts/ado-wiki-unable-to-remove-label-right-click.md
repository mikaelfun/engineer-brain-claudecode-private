---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/Troubleshooting Scenarios: MPIP Client/Scenario: Unable to remove or change label using Right click Classify and Protect option"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Client%2FTroubleshooting%20Scenarios%3A%20MPIP%20Client%2FScenario%3A%20Unable%20to%20remove%20or%20change%20label%20using%20Right%20click%20Classify%20and%20Protect%20option"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

User is unable to remove Sensitivity label from files using Right click > Apply Sensitivity Label with Microsoft Purview:

- Unable to remove classification label
- Unable to remove encryption label
- Unable to remove User protection label

# Step-By-Step Instructions

## Step 1: Is the Delete Label button grayed out?
- Check whether Mandatory Labeling is enabled on the policy for the user.
- If Yes → by design. Cannot delete a label if mandatory labeling is enabled. User can only change to another label.
- Edit the highest priority Label policy scoped for the user to verify this setting.

## Step 2: Is it a classification (non encryption) label?
- Collect MPIP client log and check the error.

## Step 3: Is it an encryption label?
- Check whether the user has Full control permission:
  - Edit the label from Purview portal → confirm user has Owner right (Full control)
  - If not, user cannot remove or change the applied label
  - Refer [Configure usage rights](https://learn.microsoft.com/en-us/azure/information-protection/configure-usage-rights)
- If user does not have Owner/Full control, set up an AIP Super User. Refer [Configure super users](https://learn.microsoft.com/en-us/azure/information-protection/configure-super-users)

## Step 4: Removing encryption from PST or MSG files?
- Use PowerShell Remove-FileLabel command
- Refer the PowerShell scenario guide for details.

## Step 5: Get Assistance
Provide Required Information: MPIP Client.
