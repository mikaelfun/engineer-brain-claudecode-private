---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/Workflows/Basic Workflow_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20(ACSS)%2FWorkflows%2FBasic%20Workflow_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Center for SAP Solutions (ACSS) Basic Workflow

## Summary

Basic workflow to get started with troubleshooting cases related to Azure Center for SAP Solutions.

## Troubleshooting Flow

1. **Verify ACSS** - Confirm customer is using ACSS
   - Check if Microsoft.Workloads Resource Provider (RP) exists in subscription
   - If not using ACSS, treat as normal SAP/Linux VM issue and update Support Area Path
   - If YES, proceed to information collection

2. **Information Collection**
   - Clear Issue Description
   - Azure Subscription ID
   - Problematic VIS (Virtual Instance for SAP solutions) or VM name
   - SAP System Type: S/4HANA or SAP Netweaver or other Database type (OS: Linux/Windows)
   - Issue date and time frame along with time zone
   - Customer approval for log collection

3. **Data Collection**
   - VIS or VM & Subscription Details
   - Guest OS Type (SUSE/RHEL/Windows Server Version)
   - Region of resource affected
   - Client Request ID / Activity ID / Correlation ID / Session ID
   - Area of problem: Create Infrastructure (Deployment), Installation failure, Installation-Ansible related, Register/Discovery, Health and Status, Quality Checks, Start-Stop, etc.

4. **Check for relevant TSG**
   - If YES: Follow the relevant TSG
   - If NO: Further data collection (screenshot of error, ASC error info, portal logs)

5. **Escalation**
   - If further assistance needed: Reach out to ACSS SME channel

## How to Verify Customer is using ACSS

In ASC, the VIS will be listed under the Microsoft.Workloads Resource Provider (RP). If the customer does not have this resource provider in their subscription, either:
- Customer opened the case under the wrong subscription ID, or
- Customer is not using ACSS - treat as normal SAP on Azure VM case

## ACSS TSGs

[Link to ACSS TSG folder](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Center%20for%20SAP%20Solutions%20(ACSS)/TSGs)
