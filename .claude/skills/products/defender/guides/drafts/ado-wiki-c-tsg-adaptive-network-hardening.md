---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/[deprecated] Adaptive Network Hardening/[TSG] - Adaptive Network Hardening"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2F%5Bdeprecated%5D%20Adaptive%20Network%20Hardening%2F%5BTSG%5D%20-%20Adaptive%20Network%20Hardening"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

Adaptive network hardening
================================

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed. [Learn more](https://learn.microsoft.com/en-us/principles-for-ai-generated-content).

Summary
-------

Adaptive network hardening (ANH) is a security feature that provides recommendations to improve the network security of virtual machines (VMs) by analyzing traffic patterns. This article addresses common questions about Adaptive network hardening, explains assessment outcomes, and provides guidance on remediation steps.

## Adaptive network hardening FAQ

**Q: What the start time of ANH alert indicates on?**  
**A:** The StartTime mentioned at the alert is the first packet we saw from the "suspicious" IP addresses mention in the alert.

**Q: Why ANH recommend to block certain ports and IPs?**  
**A:** The way ANH works is checking the traffic which regularly communicate with the machine. It seems those IP addresses don't communicate with the machine regularly enough, or the model didn't find it worthy to keep them open at the NSG. If the customer doesn't agree with this recommendation, they can exempt the recommendation on that machine. 

**Q: Why a recommendation disappears?**  
**A:** After the customer enforce ANH recommendation, those recommendations are added to his machine's NSG and then the recommendation doesn't appear again as there is no need to change it anymore. The customer made the action the feature intended.

### Assessments

*   **Unhealthy:** A Virtual Machine with at least one recommended rule.
*   **Healthy:** A Virtual Machine with no recommended rules or not connected to the Internet.
*   **Not applicable:** Non-Standard Tier VM, Classic VM, no NSG on both Subnet and NIC, or a new VM (less than 30 days).

### Investigate Assessment Results

#### Verify the assessor ran on subscription:

```q
cluster("RomeLogs").database("Rome3Prod").FabricServiceOE
| where env_time > ago(1d)
| where serviceName endswith "AssessmentsBackgroundService"
| where operationName endswith "_AssessResourcesAsync"
| extend Data = todynamic(customData)
| extend AssessorName = tostring(Data.AssessorName)
| extend SubscriptionId = tostring(Data.SubscriptionId)
| extend AssessmentName = tostring(Data.AssessmentName)
| extend AssessmentKey = tostring(Data.AssessmentKey)
| extend CalculationFlow = tostring(Data.AssessmentCalculationFlow)
| where AssessorName == "NorthSouthAssessor"
| where SubscriptionId == "{subscriptionId}"
| project env_time, SubscriptionId, AssessmentName, AssessmentKey, CalculationFlow, customData
```

### ANH Failures
If the assessment failed to be calculated, the resultType column would have value different than "Success" and the resultDescription column would have the reason for the failure.  

***Extract the operation id from the env_cv, the assessment name and find the result for each resource:***
```q
let startDate = <Enter the incident start date>;
let endDate = <Enter the incident end date>;
let AssessmentName = "<The assessment name you received at the previous query>";
TraceEvent
    | where env_time between(datetime(startDate) .. datetime(endDate))
    | where env_cv has "<The operation id you received at the previous query>"
    | where message has "AssessmentBuilderTracer" and message has AssessmentName 
    | project env_time, message
```

### Enforce recommendation rules

When enforcing rule(s) on NSG(s) the operation result would be written to the resource Activity Log.
If the message at the activity log wasn't clear enough, you can further investigate by the following query:
```q
let startDate = <Enter the incident start date>;
let endDate = <Enter the incident end date>;
ResourceProviderClientRequestOE
    | where env_time between(startDate .. endDate)
    | where SubscriptionId == "{subscriptionId}"
    | where env_cloud_name == "Rome.R3.NorthSouthRP"
    | where operationName == "PUT_Network_networkSecurityGroups"
    | where resultType != "Success"
    | extend errorCode = extract(".*\"code\":(.*),",1 ,resultDescription)
    | project env_time, resultType, errorCode, resultDescription
```

## Alerts

*   ANH generates alerts for inbound traffic when:
    *   The traffic comes from an IP address flagged as malicious by ANH's threat intelligence sources.
    *   The traffic comes from an IP address that does not regularly communicate with the resource.

*   For false-positive alerts, such as trusted resources with dynamic IP addresses, refer to the alerts suppression mechanism:  
    [Suppress alerts from Azure Defender](https://docs.microsoft.com/azure/security-center/alerts-suppression-rules)

*   Known scenarios leading to a "sad cloud" include:
    *   Resource pricing tier changed to free.
    *   All resource NSGs removed.
    *   Resource no longer connected to the Internet.

## Network Hardening Investigation

Customers may encounter the "Web ports should be restricted on NSG associated to your VM" recommendation, unrelated to ANH. Assistance is provided for:
1.  Remediating recommendations on unhealthy resources.
2.  Understanding inapplicability on other resources.

**Explanation:**  
The recommendation suggests that VMs running web applications have overly permissive NSGs. While web applications typically require internet accessibility, users are advised to deploy a Web Application Firewall (WAF) for protection. Steps include deploying a WAF, updating DNS to point to the WAF, and restricting access on NSG to the WAF.

## Remediation Steps

### Manual Remediation

1.  Edit the inbound rules on NSGs associated with VMs to restrict access to specific source ranges.
2.  Select a VM to restrict access to.
3.  In the 'Networking' blade, click the NSG with overly permissive rules.
4.  In the 'Network security group' blade, improve rules for ports 80, 443 by applying a less permissive IP range.
5.  Apply changes and click 'Save'.

For WAF deployment:
1.  Allow only the WAF IP address in the source IP ranges.
2.  Update the web application's DNS record to the WAF IP address.

### Useful Queries

1. Check the calculation result per subscription and assessment.
Execute on: https://romelogs.kusto.windows.net/Rome3Prod
```q
let subscriptionId = "{subscriptionId}";
let assessmentName = "Web ports should be restricted on NSG associated to your VM";
AssessmentCalculationOE
   | where env_time > ago(1d)
   | where SubscriptionId == subscriptionId
   | where AssessmentName == assessmentName
   | project env_time, AssessmentName, TotalAssessmentsCount, HealthySeverityCount, HighSeverityCount, MediumSeverityCount, LowSeverityCount, NotApplicableSeverityCount, OffByPolicySeverityCount
```

2. Extract the inapplicability reason of each resource.
```q
let subscriptionId = "{subscriptionId}";
let assessmentName = "Web ports should be restricted on NSG associated to your VM";
TraceEvent
   | where env_time > ago(1d)
   | where message contains assessmentName and message contains subscriptionId 
   | where message contains "AssessmentBuilderTracer" and message contains "NotApplicable"
   | extend all = extract_all("AssessmentBuilderTracer \\[(.*)\\] Build `(.*)` (.*?) resource: (.*?) (.*)", message)
   | project env_time, tostring(AssessmentName=all[0][1]), tostring(ResourceId=all[0][3]), tostring(InaplicabilityReason=all[0][4])
   | distinct AssessmentName, ResourceId, InaplicabilityReason
```

## Related Articles

*   [Suppress alerts from Azure Defender](https://docs.microsoft.com/azure/security-center/alerts-suppression-rules)
