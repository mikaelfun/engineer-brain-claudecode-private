---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/Workflows/Basic Workflow_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FWorkflows%2FBasic%20Workflow_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Advisor Basic Troubleshooting Workflow

## Decision Tree

Select the scenario to troubleshoot:

### 1. Customer cannot postpone or dismiss an Advisor recommendation
- Follow TSG: [Not Able To Postpone or Dismiss Recommendations](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1136238/Not-Able-To-Postpone-or-Dismiss-Recommendations_Advisor)

### 2. Customer has concerns about how Advisor works
- Advisor is a personalized cloud consultant that helps customers follow best practices to optimize Azure deployments.
- Reference: [Advisor Overview](https://learn.microsoft.com/en-us/azure/advisor/advisor-overview)

### 3. Customer is not getting any recommendations
- Follow TSG: [Not Getting Any Recommendations](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506383/Not-Getting-Any-Recommendations_Advisor)

### 4. Customer has concerns about an Active Advisor recommendation

#### Cost Recommendations
- **Cost recommendation not showing correct data**: Follow [Out of Date Recommendations TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506384/Out-of-Date-Recommendations-Are-Shown_Advisor). If still incorrect, collaborate with ASMS costs service owner team.
- **Savings cost information is missing**: Collaborate with ASMS team to check if their service is sending the cost information.
- **No cost recommendations available**: Follow [Not Getting Any Recommendations TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506383/Not-Getting-Any-Recommendations_Advisor)

#### Security Recommendations
- Reference: [Security Recommendations Documentation](https://learn.microsoft.com/en-us/azure/defender-for-cloud/recommendations-reference)

#### Performance Recommendations
- Reference: [Performance Recommendations Documentation](https://learn.microsoft.com/en-us/azure/advisor/advisor-reference-performance-recommendations)

#### Operational Excellence Recommendations
- Follow TSG: [Customize Azure Best Practices](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/610911/Customize-Azure-best-practices_Advisor)

### 5. Issue with Advisor Score
- Follow TSG: [Azure Advisor Score](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/767351/Azure-Advisor-Score_Advisor)

### 6. Azure Advisor Portal blade not loading
- Follow TSG: [VM Recommendation Blade Is Not Loading](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506386/VM-Recommendation-Blade-Is-Not-Loading_Advisor)

### 7. Issue not related to Advisor
- Update the case SAP to reflect the proper insights for the issue reported.
