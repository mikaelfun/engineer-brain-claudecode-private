---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Auto Labeling/Client Side Auto Labeling/Troubleshooting Scenarios: Client Side Auto Labeling/Scenario: Client Side Auto Labeling not applying correctly"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Client%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Client%20Side%20Auto%20Labeling/Scenario%3A%20Client%20Side%20Auto%20Labeling%20not%20applying%20correctly"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario: Client Side Auto Labeling not applying correctly

This troubleshooting guide covers:
- Client Side Auto Labeling not applying in Outlook
- Word not applying sensitivity label automatically
- Excel online not recommending sensitivity label
- Client Side Auto labeling false positive

## Step 1: Verify the user is entitled to use Auto Labeling

Check the user has capability and correct licensing for Auto Labeling using Assist365.
Plans: Microsoft E5, Office 365 E5, Microsoft 365 E5 Compliance, Office 365 Advanced Compliance → MIP_S_CLP2.

## Step 2: Verify the label can be manually applied

If the label is not visible, follow "Sensitivity Label is not showing" TSG.

## Step 3: Verify the configuration

In Purview Portal → Information Protection → Edit Label → Auto-labeling for files and emails:
- Check Sensitive Information Types (SITs)
- Check if label should auto-apply or recommend
- Verify user has appropriate license

## Step 4: Test the Sensitive Information Type

Put text into .txt file and test against SIT tester portal.
- If SIT doesn't match → follow Classifier guides (Built-in SIT, Custom SIT, Trainable Classifier, EDM)
- If SIT matches but is false positive → follow False Positive Guide
- If SIT matches as expected → continue

## Step 5: Route to the correct client

Reproduce in OWA:
- If reproduces in OWA → issue is with backend service, continue
- If doesn't reproduce in OWA → issue is with desktop client (Word, PowerPoint, Outlook Desktop)

## Step 6: Grab a network trace

In OWA network trace:
1. Find label API call: `compliancepolicy/api/v1.0/user/label`
2. Check `AutoLabeling_SensitiveTypeIds` is set for affected label
   - If missing but Conditions set in IPPSSession → escalate to DLP team
3. Check WebSocket calls for `AugLoop_SecurityClp_LabellingAnnotation`
   - Verify connection established
   - Verify request/response present
   - If no request → re-check licensing and Assist365, or route to OWA team
   - If correct label returned but not shown → route to OWA team

## Resolution: Auto Labeling not working due to licensing

Root Cause: User not entitled for Auto Labeling per Microsoft 365 Compliance Licensing.
Resolution: Verify and assign correct license (E5 or equivalent with MIP_S_CLP2).
