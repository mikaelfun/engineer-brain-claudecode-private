---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Azure Advisor Reviews_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAzure%20Advisor%20Reviews_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Advisor Reviews Guide

## Overview

Azure Advisor Reviews help focus on the most important recommendations to optimize cloud deployments. Review recommendations are curated by Microsoft account team using Azure best practices.

## How It Works

1. Customer requests a review via CSAM
2. Microsoft Cloud Solution Architects analyze workload (CXObserve)
3. Recommendations are published to Advisor
4. Customer triages (accept/reject) recommendations
5. Customer implements accepted recommendations

## RBAC Requirements

**For the review subscription:**
| Role | Capability |
|------|-----------|
| Advisor Reviews Reader | View reviews and linked recommendations |
| Advisor Reviews Contributor | View reviews and triage recommendations (accept/reject) |

**For workload subscriptions:**
| Role | Capability |
|------|-----------|
| Subscription Reader | View reviews and recommendations |
| Subscription Contributor/Owner | View, triage, and manage recommendation lifecycle |
| Advisor Recommendations Contributor (Assessments and Reviews) | View, accept, manage lifecycle |

## For CSAMs/CSAs: Create Reviews in CXObserve

1. Log into [CXObserve](https://cxp.azure.com/cxobserve/home)
2. Start a Review > Name it > Select workload
3. Review insights > Add Recommendations
4. Set Priority and notes for each recommendation
5. Publish to Advisor (select Review Subscription)

**Note:** New workloads in Admin Center may take 3-4 hours to appear in CXObserve.

## Troubleshooting FAQs

**Cannot see Reviews blade:** No reviews published for your subscriptions yet. Check with account team.

**Reviews blade visible but empty:** Check subscription filter in portal settings (portal.azure.com/#settings/directory).

**Published review not showing:** Verify you have Advisor Reviews Reader/Contributor roles on the review subscription.

**After triaging all recommendations:** Go to Recommendations > Reliability > Reviews to manage implementation lifecycle.

**Recommendation lifecycle states:** In Progress, Postpone, Dismiss, Complete.

**Review retention:** No planned deletion of reviews or linked recommendations.

## Geneva Diagnostics

[Grep | Jarvis](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&ep=Diagnostics%20PROD&ns=AdvisorManageProd&en=HttpEvent,TraceEvent) - Search by CorrelationId

## Feature Contacts

- PG PM: Tiffany Yang
- Beta Engineer: Baba Sainath Bhooman
- SME: Dave Goebel
- Service TA: Sampath Rao Madarapu
- Public Preview: February 2024, GA: April 2024
