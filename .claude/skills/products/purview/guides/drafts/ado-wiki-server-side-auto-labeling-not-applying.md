---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Auto Labeling/Server Side Auto Labeling/Troubleshooting Scenarios: Server Side Auto Labeling/Scenario: Server Side Auto Labeling not applying correctly"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Auto%20Labeling/Server%20Side%20Auto%20Labeling/Troubleshooting%20Scenarios%3A%20Server%20Side%20Auto%20Labeling/Scenario%3A%20Server%20Side%20Auto%20Labeling%20not%20applying%20correctly"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario: Server Side Auto Labeling not applying correctly

Covers: auto labeling not applied to sent email, not applying to SPO/ODB document, false positive.

## Step 1: Analyze Conditions
- Verify policy scope (users, sites)
- Policy must be scoped to the SENDER of the email
- Test file against expected SITs using SIT tester
- Verify rule is enabled
- Verify policy is in Enforce mode (simulation won't apply labels)
- Overwriting manually applied labels only supported for Exchange
- Document Properties must be crawled and mapped in SharePoint

### Admin Units
- SPO does NOT support Admin Units — assigning AU + SPO location breaks the policy
- If AU assigned, verify user is included in the AU

## Step 2: Workload-Specific Logs

### Exchange Online
- Get Extended Message Trace → analyze AgentInfo
- Check which policies evaluated and matched
- If expected policy didn't evaluate → simulation mode or wrong user scope
- Policy scoping = sender scope; external senders require "All" scope
- Check if manual label was already applied (override rules apply)

### SharePoint/OneDrive
- Run Test-DlpPolicies cmdlet
- Analyze report for policy match and SIT findings
- Check if existing label will be overridden per override rules
