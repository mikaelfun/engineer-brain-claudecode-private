---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/Guest Configuration Baselines (Security Configuration)/[Troubleshooting-Guide] - Guest Configuration recommendation result discrepancy"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/Guest%20Configuration%20Baselines%20%28Security%20Configuration%29/%5BTroubleshooting-Guide%5D%20-%20Guest%20Configuration%20recommendation%20result%20discrepancy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Troubleshoot Guest Config Recommendation Result Discrepancy Issues

[[_TOC_]]

---

## Overview
When addressing recommendations that rely on the **Guest Configuration Agent**, there are three core technologies involved:
1. **Guest Configuration** - Responsible for the assessment logic.
2. **Azure Policy** - Evaluates the assessment results provided by Guest Assignments.
3. **Microsoft Defender for Cloud** (MDC) - Categorizes resources as healthy, unhealthy, or not applicable based on policy compliance status.

---

## Identifying Guest Configuration Recommendations
All Microsoft Defender for Cloud recommendations that rely on Guest Configuration require the recommendation [Guest Configuration extension should be installed on machines](https://portal.azure.com/#blade/Microsoft_Azure_Security/RecommendationsBlade/assessmentKey/6c99f570-2ce7-46bc-8175-cde013df43bc).

![Screenshot of Microsoft Defender for Cloud interface showing the Guest Configuration extension requirement](/.attachments/image-c78c69ec-a9bf-44bc-8786-cd0545a52899.png)

## Review Policy Definition
As an example, consider the recommendation "[Authentication to Linux machines should require SSH keys](https://portal.azure.com/#blade/Microsoft_Azure_Security/RecommendationsBlade/assessmentKey/22441184-2f7b-d4a0-e00b-4c5eaef4afc9)".

![Screenshot of the policy definition for the recommendation to require SSH keys for Linux machines](/.attachments/image-b492cf4e-09e8-40e0-ad11-398f7cd6b286.png)

## Review Policy Category
Verify the category of the related policy [Authentication to Linux machines should require SSH keys](https://portal.azure.com/#blade/Microsoft_Azure_Policy/PolicyDetailBlade/definitionId/%2fproviders%2fMicrosoft.Authorization%2fpolicyDefinitions%2f630c64f9-8b6b-4c64-b511-6544ceff6fd6).

![Screenshot showing the policy category for SSH key authentication on Linux machines](/.attachments/image-d3cd00de-e4c9-4ec5-999b-e7b8554410ed.png)

---

## Finding Related Guest Assignment Name
Guest Configuration policies depend on "**guestConfigurationAssignments**" to evaluate resources. For the recommendation "[Authentication to Linux machines should require SSH keys](https://portal.azure.com/#blade/Microsoft_Azure_Security/RecommendationsBlade/assessmentKey/22441184-2f7b-d4a0-e00b-4c5eaef4afc9)", it uses a guestConfigurationAssignment called "**LinuxNoPasswordForSSH**".

![Screenshot of guestConfigurationAssignment named LinuxNoPasswordForSSH](/.attachments/image-ebb512f0-a399-4808-b92d-e32e5e18f92a.png)

## Reviewing Guest Assignment Status
Review the status of **guestConfigurationAssignment** for the specific recommendation and resource. Search for "Guest Assignments" in the Azure portal to view all "guestConfigurationAssignments" under the scope.

In the example, "LinuxNoPasswordForSSH" is created for each Virtual Machine (VM), and all are marked as non-compliant.

![Screenshot of guest assignments showing non-compliance status for LinuxNoPasswordForSSH](/.attachments/image-e0ce8f0a-271a-46f6-a4fb-93121f0d363c.png)

---

## Azure Resource Graph Queries

### Retrieve Policy State
```kusto
policyresources
| where type == "microsoft.policyinsights/policystates"
| where properties contains "/providers/Microsoft.Authorization/policyDefinitions/<DefinitionID>" //Policy Definition ID.
| where properties contains "<Resource ID>"
| project resourceName = tostring(split(tolower(extract("(.*)/providers/microsoft.policyinsights",1, id)),"/")[-1]), Initiative = properties.policyDefinitionGroupNames, Status = properties.complianceState
```

### Retrieve Guest Assignment State
```kusto
GuestConfigurationResources
| where id contains "<Resource ID>"
| where name contains "<GuestAssignmentName>"
| project resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.GuestConfiguration",1, id)),"/")[-1]), AssignmentName = name, Status = properties.complianceStatus, lastComplianceStatusChecked = properties.lastComplianceStatusChecked
```

---

## Troubleshooting Steps

### Step 1 - Verify Guest Configuration Agent Installation
If the agent is not installed, instruct the customer to install it manually via [Azure Automanage machine configuration extension](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/guest-configuration) or enable auto-provisioning via [Review agent provisioning](https://learn.microsoft.com/en-us/azure/defender-for-cloud/plan-defender-for-servers-agents#review-agent-provisioning).

- **Check in Azure Resource Graph**:
    ```kusto
    resources
    | where type == "microsoft.compute/virtualmachines/extensions"
    | extend publisher = properties.publisher
    | where publisher == "Microsoft.GuestConfiguration"
    | extend provisioningState = properties.provisioningState
    | project id, name, publisher, type, provisioningState
    ```
- **Check on User Interface**:
    ![Screenshot showing the verification of Guest Configuration Agent installation](/.attachments/guestconfig-1.png)

### Step 2 - Verify System Assigned Managed Identity on Virtual Machine
Ensure a system-assigned managed identity is enabled as it's a prerequisite for the Guest Config service to authenticate. More details are available [here](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/guest-configuration#prerequisites).

- **Check in Azure Resource Graph**:
    ```kusto
    resources
    | where type == "microsoft.compute/virtualmachines"
    | project name, identity.type, id
    ```
- **Check on User Interface**:
    ![Screenshot showing the verification of system-assigned managed identity](/.attachments/guestconfig-2.png)

### Step 3 - Verify GuestAssignment Existence and Status
Determine the correct GuestAssignment by consulting the [Overview](https://dev.azure.com/asim-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/5460/-TSG-Guest-Configuration-recommendation-result-discrepancy?anchor=overview) section.

- **Check in Azure Resource Graph**:
    ```kusto
    GuestConfigurationResources
    | project resourceName = tostring(split(tolower(extract("(.*)/providers/Microsoft.GuestConfiguration",1, id)),"/")[-1]), AssignmentName = name, Status = properties.complianceStatus, lastComplianceStatusChecked = properties.lastComplianceStatusChecked, properties
    ```
- **Check on User Interface**:
    ![Screenshot showing the GuestAssignment status verification](/.attachments/guestconfig-3.png)

### Decision Tree


1. If the GuestAssignment is missing after confirming steps 1 and 2, **involve the Guest Config team for further assistance**.
2. If GuestAssignment is non-compliant, review the reason and ensure remediation steps are followed.
3. If settings are correct but GuestAssignment remains non-compliant, **involve the Guest Config team**.
4. If GuestAssignment is compliant but policy shows non-compliance, **involve the Policy team**.
5. If both GuestAssignment and Azure Policy are compliant but Microsoft Defender for Cloud shows unhealthy status, refer to [[Troubleshooting Guide] - Recommendations showing wrong status](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1456/-TSG-Recommendations-showing-wrong-status) to submit an Incident Case Management (ICM).

<div�style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;background-color:#d7eaf8">

  

#:warning:Important

Step 2 onwards is **not applicable** to Guest Assignments related to the **Security Baseline**.

All Guest assignments under the security baseline recommendations are owned E2E by the MDC team (_Vulnerabilities in security configuration on your Windows machines should be remediated and  Vulnerabilities in security configuration on your Linux machines should be remediated_). 

If there are no Guest assignments at all, collaborate with the Guest Config CSS team to ensure there are no issues with the Guest Config agent.

</div>
---

## Related Recommendations

|assessmentKey|Name|
|--|--|
|8c3d9ad0-3639-4686-9cd2-2b2ab2609bda|	Vulnerabilities in security configuration on your Windows machines should be remediated (powered by Guest Configuration)|
|1f655fb7-63ca-4980-91a3-56dbc2b715c6|	Vulnerabilities in security configuration on your Linux machines should be remediated (powered by Guest Configuration)|
|6c99f570-2ce7-46bc-8175-cde013df43bc|	Guest Configuration extension should be installed on machines|
|69133b6b-695a-43eb-a763-221e19556755|	Virtual machines' Guest Configuration extension should be deployed with system-assigned managed identity|
|22489c48-27d1-4e40-9420-4303ad9cffef|	Windows Defender Exploit Guard should be enabled on machines|
|22441184-2f7b-d4a0-e00b-4c5eaef4afc9|	Authentication to Linux machines should require SSH keys|

---


|Contributor Name|  Details|  Date|
|--|--|--|
| Ankit Patel | Created this section | 05/12/2023 |
| Kevin Louie  | Modified ARG queries for better visibility | 06/29/2023 |
| Ankit Patel  | Added Troubleshooting steps | 05/31/2024 |
| Ankit Patel  | Related Recommendations | 11/20/2024 |
|  |  |  |


