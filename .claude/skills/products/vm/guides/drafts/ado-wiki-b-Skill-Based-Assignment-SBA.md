---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Skill Based Assignment (SBA)"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Skill%20Based%20Assignment%20(SBA)"
importDate: "2026-04-05"
type: process-guide
---

# Skill Based Assignment (SBA)

One of the biggest challenges in the world of support is to **connect the customer to the agent best suited to solve their specific problem**. Agents have different skillsets and proficiency levels. Customers, on the other hand, often struggle to describe their issues effectively to enable us to connect them to the best agent.

Based on A&I WS analysis:
- ~20% of Azure customers select the wrong SAP to open the case
- ~14% of Azure customers select the wrong product

It is our goal to deliver the best-in-class process and technology to enable cases to be quickly assigned to the best available agent. This will improve customer and agent satisfaction, decrease customer pain time, and improve capacity planning.

## Overview

Azure OneVM migrated from SAP to a **Skills Based Assignment (SBA) model on Virtual Duty Manager (VDM)** on June 12th 2024.

At a later stage, Delivery Partners will also migrate to the same SBA model, along with consolidation of SAPs and Queues structure, completing the journey towards Intelligent Assignment.

## What Changed

- **Before**: SAP-based assignment — customers selected a SAP to route their case
- **After**: Skills-based assignment — cases are matched to engineers based on declared skills
- **The way engineers receive cases in DfM remains the same**, but the underlying assignment logic changed to increase accuracy
- Engineers can focus more time on actual troubleshooting based on the skills they possess

## Key Resources

- **SBA FAQs**: [AzureIaaSVM Wiki – SBA FAQs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1533663)
  - How to view/change skills for a case/collab
  - Details on the new Skills Taxonomy Structure
- **Intelligent Assignment IAPP Site**: [SharePoint – Intelligent Assignment](https://microsoft.sharepoint.com/teams/CustomerExperienceSucessStrategy/sitepages/intelligent-assignment.aspx)
- **Contact**: Justin Havis (<juhavis@microsoft.com>)

## Impact on Case Handling

- No change to how engineers receive and work cases in DfM
- Better case routing reduces misroutes and re-assignments
- Engineers matched to cases based on skill alignment
