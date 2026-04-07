---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/How to: Sensitivity Labels/How to: Identify ownership for Sensitivity Label issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/How%20to:%20Sensitivity%20Labels/How%20to:%20Identify%20ownership%20for%20Sensitivity%20Label%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Identify Ownership for Sensitivity Label Issues

## Introduction

Identify if the issue should be handled by the DLP team or is this an issue for a different team.

## Step 0: Run the Sensitivity Label diagnostic in the Purview Portal

The diagnostic "A user can't find the sensitivity label they need. Does the label policy apply to them?" will query the Labels API for the given user to see if the label is correctly configured.

- If the label is correctly configured according to this diagnostic → the API is functioning correctly, the client/app is not showing the label as it should
- If the label or label policy settings are NOT showing correctly → the label is NOT configured properly → owned by Purview\Sensitivity Labels IcM team

## Step 1: Is this an AIP client issue?

- What is [AIP Client](https://learn.microsoft.com/en-us/purview/information-protection-client-relnotes)?
- Check for issue ownership to determine how to investigate and where to escalate
- See AIP TSG, if needed - escalate to AIP team or open a DCR

## Step 2: Is this a Retention Label issue?

- Retention Labels are handled by the Data Lifecycle Management team

## Step 3: Is this a Client Team Issue?

If the issue is specific to **only one** application and not another, the client team will need to investigate.

### Ownership Table

| Scenario | Owning Escalation Team |
|----------|----------------------|
| Issues in Sensitivity Labels Purview Portal (creation, configuration) | Purview\Sensitivity Labels |
| Issues with Sensitivity Labels cmdlets (*-Label, *-LabelPolicy) | Purview\Sensitivity Labels |
| Label not showing in OWA | Purview\Sensitivity Labels |
| Label showing in OWA, but not working correctly | OWA |
| Server Side Auto Labeling | Purview\Server Side Auto Labeling |
| Sensitivity Label Encryption | Purview\Sensitivity Labels |
| Visibility of labels in a _single_ client | The client team (Word, Outlook, SharePoint, etc.) |
| Visibility of labels in _all_ clients | Purview\Sensitivity Labels |
| Email Content marking not working | Purview\Sensitivity Labels |
| Non-Email Content Marking not working in client apps | The client team |
