---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations Platform/Recommendation Exemption/[Product Knowledge] How to differentiate between Azure Policy and Management recommendations"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20Platform%2FRecommendation%20Exemption%2F%5BProduct%20Knowledge%5D%20How%20to%20differentiate%20between%20Azure%20Policy%20and%20Management%20recommendations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Differentiate Between Azure Policy and Management Recommendations (and Exemptions)

  

This guide explains how to determine whether a recommendation comes from Azure Policy or Management.

  

## Prerequisites

  

- Access to the [Rome-Core-AssessmentModeller](https://msazure.visualstudio.com/One/_git/Rome-Core-AssessmentModeller) repo

  

## Process

  

The process is straightforward:

  

1. Copy the name/guide of the recommendation you want to check

2. Go to the Modeller repository

3. Use the repository search function to look for the recommendation name / key

4. Check the results for a Json file, usually under RawBuiltinMetadata directory:

5. You should find the assessment in there

 - If the assessment has non-empty `policyDefinitionId` field or its `managementProvider` is�"AzurePolicy", this is Azure Policy Recommendation.
 - Else, it's Management Reccommendation.


  

## Examples

  

### Example 1: Finding a Management Recommendation

If there was an issue with "Auto�Scaling�groups�associated�with�a�load�balancer�should�use�health�checks", when searching in the repo we find the 
`policyDefinitionId` is empty and the `managementProvider` is MDC:

![image.png](https://msazure.visualstudio.com/b32aa71e-8ed2-41b2-9d77-5bc261222004/_apis/git/repositories/18ea551d-4d7c-4e46-9fdd-fe6f3a867d17/Items?path=/.attachments/image-e0b5b67c-5508-4d85-80a1-e4a072582f97.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

  

### Example 2: Identifying an Azure Policy Recommendation

In the CRI [Incident-637726839 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/637726839/summary) there was an issue with the exemption for "Machines should have a vulnerability assessment solution".

![image.png](https://msazure.visualstudio.com/b32aa71e-8ed2-41b2-9d77-5bc261222004/_apis/git/repositories/18ea551d-4d7c-4e46-9fdd-fe6f3a867d17/Items?path=/.attachments/image-0d9e3e81-9b3d-4326-9b06-877154ed6f96.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
