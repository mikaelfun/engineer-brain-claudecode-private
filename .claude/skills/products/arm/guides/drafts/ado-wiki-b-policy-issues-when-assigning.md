---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Issues when assigning a policy/Issues when assigning a policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Policy/Support Topics/Issues when assigning a policy/Issues when assigning a policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Policy/Issues when assigning a Policy/Issues when assigning a Policy
This support topic should be selected by customers when they are encountering any kind of issue, while assigning a policy definition.

These kind of issues are not very common, so the troubleshooting is pretty generic.

[[_TOC_]]

## 1. What kind of issue is the customer experiencing?
Since there is no common scenario here for troubleshooting, these kind of issues can be scoped to four categories.

### 1.1 Looking for advisory/best practices around policy assignments
In regards to advisory, everything should be covered in our documentation. Here are some links that might help:
- [LEARN] [Azure Policy assignment structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/assignment-structure)
- [LEARN] [Quickstart: Create a policy assignment to identify non-compliant resources](https://learn.microsoft.com/en-us/azure/governance/policy/assign-policy-portal)

### 1.2 The data displayed is incorrect
The chances of actually having an issue with the data displayed are low, but there might be other scenarios where the data has a good reason to not be there.

#### 1.2.1 Make sure the customer is looking in the right place
Did they select the right scope? Do they have the right UI filters?

Even the global subscription filters might be to blame on these kind of scenarios.

#### 1.2.2 Capture a HAR trace of the impacted blade and analyze the information
[TSG] todo

##### 1.2.2.1 Are there any failed requests?
Failed requests should provide details about the failure on the response. If needed you can also search for the failed request in our backend tables: [TSG] todo Locate request in Kusto

##### 1.2.2.2 Are the requests going to the right management.azure.com endpoint?
APIs for ARM, determine the scope of the request based on the URL [ARCH] todo scope of request.

Make sure the API call has the right scope, e.g., listing assignments on the subscription and not a specific resource group or management group.

##### 1.2.2.3 Is the incorrect/missing data in the payload request?
Checking if the API response in the HAR trace contains the incorrect/missing data, should allow you to rule out if the data is filtered/altered on the client (Azure Portal, CLI, Powershell, etc), or if it is filtered/altered on the server side (RP or ARM).

### 1.3 Having issues with the UI
See [TSG] todo troubleshooting UI issues

### 1.4 Getting an error while assigning a policy
The error should be very self explanatory, but customers may not understand the why.

At this point, all that is left is, based on the error message, review the customer configuration or confusion, and provide an answer back to them.

## Additional information
If the described issue does not fit in any of the buckets above, but you still feel it is an assignment issue, please ping one of the SMEs or TAs as we would like to improve this Wiki page.
