---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Azure Advisor WAF Assessments_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FAzure%20Advisor%20WAF%20Assessments_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Advisor WAF Assessments Troubleshooting Guide

## Overview

The Azure Well-Architected Framework (WAF) Assessments help identify gaps in workloads across five pillars: Reliability, Cost, Operational Excellence, Performance, and Security via curated questions. Assessments need you to work through a scenario of questions on your workloads and then provide recommendations that are actionable and informative.

### Assessment Types
- [Mission Critical | Well-Architected Review](https://learn.microsoft.com/en-us/assessments/)
- [Azure Well-Architected Review](https://learn.microsoft.com/en-us/assessments/azure-architecture-review/)

## Permissions

| Role | Access |
|------|--------|
| Reader | View assessments for a subscription or workload and the corresponding recommendations |
| Contributor | Create assessments for a subscription or workload and triage the corresponding recommendations |

## Integration with Learn Platform (learn.microsoft.com)

Three integration points with Learn:
1. When an assessment is created
2. When an assessment is resumed
3. When Advisor background job fetches guidance for completed assessments

## Geneva Logs

- **NameSpace: AdvisorAssessAppSvcProd** - For app services. Any events done on Azure Advisor Portal will have logs here.
- **NameSpace: AdvisorAssessFnAppProd** - Logs for the task that syncs the assessment every 8 hours back to Advisor from Learn Platform.

Look for error strings in the Error message in the Errors section below. Open the related Namespace and filter by the string in the "Filtering Conditions" section of Geneva query.

## Error Catalog

### Authentication Errors
- `ARM AAD PoP Authentication failed. Error: {ExceptionMessage}`

### Service Errors

**WorkloadService:**
- `List Workload failed` - Most probable failure point: Observe API

**AssessmentTypeService:**
- `List Assessment Type failed` - Most probable failure point: Learn API

**Create Assessment:**
- `Create Assessment failed. Assessment {assessmentName} already exists` - User error (assessment already exists with same name)
- `Workload Id: {WorkloadId} is invalid` - Most probable failure point: Observe API (invalid workload id)
- `Create Assessment on MS Learn has failed` - Most probable failure point: MS Learn API
- `Create Assessment failed` - Generic failure, retry may help

**Get Assessment:**
- `Get Assessment failed. Assessment {assessmentName} not found` - Invalid assessment name provided

## Different Operations

- [Access Azure Advisor WAF assessments](https://learn.microsoft.com/en-us/azure/advisor/advisor-assessments#access-azure-advisor-waf-assessments)
- [Create Azure Advisor WAF assessments](https://learn.microsoft.com/en-us/azure/advisor/advisor-assessments#create-azure-advisor-waf-assessments)
- [View Azure Advisor WAF assessment recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-assessments#view-azure-advisor-waf-assessment-recommendations)
- [Manage Azure Advisor WAF assessment recommendations](https://learn.microsoft.com/en-us/azure/advisor/advisor-assessments#manage-azure-advisor-waf-assessment-recommendations)
