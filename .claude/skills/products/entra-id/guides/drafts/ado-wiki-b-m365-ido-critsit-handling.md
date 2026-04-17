---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/M365 IDO/Processes/M365 IDO Guidance on CritSit Handling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/DP%20Processes%20Guidelines%20and%20others/M365%20IDO/Processes/M365%20IDO%20Guidance%20on%20CritSit%20Handling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]
      
## Introduction

This process aims to help engineers when handling CritSit cases.

## Applies to:

| Team  | **Yes/No** |
|--|--|
| Entra ID Account Management & Provisioning  | **No**  |
| Entra ID Identity Authentication | **No**  |
| Azure Rapid Response | **No** |
| Microsoft 365 Identity | **Yes** |
      
## Ownership and Routing Rules for Premier CritSit Cases
-----------------------

| Case Scenario                                                                                         | Homegrown? | Final Ownership |
|-------------------------------------------------------------------------------------------------------|------------|-----------------|
| Fresh Premier Case/Collaboration Task opened as SEV A/1 with Internal Team                                                       |  NO       | Internal        |
| Premier Case/Collaboration Task  opened as SEV A/1 with any other team  moved to internal (strategic) team due to misroute |  NO       | Internal        |
| Premier Case/Collaboration Task  opened as SEV B/C  never escalates                                                      |  NO       | DP              |
| Premier Case/Collaboration Task  opened as SEV B/C  escalates to SEV A while in DP queue or with DP ownership            |  YES      | DP              |

- If the internal team needs to transfer a Sev A case or collab to DPs queues, cases and Sev A collab should be routed to the following queues
       
      SCIM M365 Identity Wicloud
 
      SCIM M365 Identity CNX

**NOTE: M365 ID DPs cover 24x5, During the weekend, it is expected that the internal team receives Severity As (Cases and Collabs).**


## CritSit Types
-------------------------

CritSits come in three types **"Fresh"**, **"Handover"** and **"Homegrown"**.

- **Fresh CritSits** are just as the name implies, they were opened as a Severity A or 1 case and are either still in the queue waiting to be assigned or have only had their initial assignment completed.
- **Handover CritSits** are any CritSit that's being handed off to the next engineer to continue supporting the engineer. Handover CritSits may have had one previous owner, or multiple owners, before being assigned to the next engineer.
- **Homegrown CritSits** are Severity B or C cases, whether currently assigned or unassigned in Delivery Partners queues, where Severity has been raised to Sev A/1

**NOTE: If case is unassigned, Severity change will trigger Autoroute of the Support Request to the M365 ID Strategic Queue and will have to be moved back to the DP queue.**


### 1- Fresh CritSit Handling
----------------------
      
- When you're assigned a Fresh CritSit, always ensure that you meet SLA with an appropriate First Quality Response (FQR) to let the customer know that their case has been assigned and that you will be engaging with them to address the issue they're experiencing.
- Connect with the customer, assess the issue, and begin troubleshooting the issue
- Always use phone calls as the primary contact method, even if the primary contact is email.
- Engage SME to drive the case towards resolution.
- Notes should be updated frequently in the case (ideally no less than an hour apart) detailing scope, steps taken, and progress towards mitigating the issue.
- If you are still engaged on the CritSit towards the end of your shift, start the CritSit Handover Steps
- Once the issue is mitigated (or resolved) update the case status as appropriate (either "Mitigated" or "Waiting for Customer Confirmation", respectively) and reduce the severity of the case to B (or C, if the customer so requests) and send summary email to the customer.

### 2- Handover CritSit Handling
----------------------

- When you're assigned a handover CritSit, start with reaching out to the previous case owner of the case. CritSits are expected to always have a Warm Handover whenever possible. If the previous engineer is not available, then start by reviewing the case notes so that you can engage with the customer in a productive way without repeating previous steps or data collection, if possible.
- Always use phone calls as the primary contact method, even if the primary contact is email.
- Connect with the customer, assess the issue, and begin troubleshooting the issue.
- Engage SME to drive the case towards resolution.
- Notes should be updated frequently in the case (ideally no less than an hour apart) detailing scope, steps taken, and progress towards mitigating the issue.
- If you are still engaged on the CritSit towards the end of your shift, start the CritSit Handover Steps
- Once the issue is mitigated (or resolved) update the case status as appropriate (either "Mitigated" or "Waiting for Customer Confirmation", respectively) and reduce the severity of the case to B (or C, if the customer so requests) and send summary email to the customer.

### 3- Homegrown CritSit Handling
----------------------

As mentioned previously, a Homegrown CritSit is any Severity B or C case that you currently own where the customer has requested the Severity be raised to A or 1. Ideally, we want to take reasonable steps to prevent these types of CritSits, but they will inevitably happen from time to time.

If a customer contacts you requesting to raise the severity of their case to A or 1, take a moment to discuss why they'd like the severity increased and see if there's any action you can take to address their concerns and avoid increasing the severity. Often times, we can prevent a Homegrown CritSit simply by communicating effectively with the customer. However, there will be times that we will have no choice but to increase the severity as requested.

- As the current case owner, you are expected to own and work the CritSit. If there is a reasonable reason why you cannot own the Homegrown CritSit (such as you are already engaged on a CritSit or your end of shift is an hour or less away), then work to get it re-assigned. If a HomeGrown CritSit must be re-assigned, check with your peers first to see if one of them is available to take ownership of the case and engage with the customer. If a peer is not available to assist with the Homegrown CritSit, then start the CritSit Handover Steps, ensure that there are detailed notes in the case documenting what has been done to date, and a clear action plan for driving the case forward to resolution.
- Always use phone calls as the primary contact method, even if the primary contact is email.
- Connect with the customer, assess the issue, and begin troubleshooting the issue.
- Engage SME to drive the case towards resolution.
- Notes should be updated frequently in the case (ideally no less than an hour apart) detailing scope, steps taken, and progress towards mitigating the issue.
- If you are still engaged on the CritSit towards the end of your shift, start the CritSit Handover Steps no later than 1 hour prior to your end of shift.
- Once the issue is mitigated (or resolved) update the case status as appropriate (either "Mitigated" or "Waiting for Customer Confirmation", respectively) and reduce the severity of the case to B (or C, if the customer so requests) and send summary email to the customer.

      
## Customer is Unresponsive
----------------------

If you're assigned a CritSit and the customer is not responding to requests to connect and work on the issue, review and follow the process listed in this Internal Procedural KB:
[Procedure: Unresponsive Customer](https://internal.evergreen.microsoft.com/en-us/topic/96fac429-4ec2-47d7-deff-7bf3e35ffffe)

Section 2.2.1 provides the details for handling Severity A or 1 cases where the customer is unresponsive.

## Escalation process to PTAs
---------------------

If an engineer is working on a Sev A case and encounters a technical or management issue, the following steps should be followed to engage a PTA for support:
      
- The case owner should add notes to the case, ensuring that the notes are helpful and detailed.
- The case owner should discuss the case with their SME /TL.
- The SME/TL should open an ASK PTA request, selecting the request type Sev A.
- Once the ASK PTA request is created, the bot automation will notify all PTAs of the request. The available PTA will then reach out to the case owner and SME/TL immediately.
