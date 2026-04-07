---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Case Status Guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FCase%20Status%20Guidance"
importDate: "2026-04-06"
type: process-guide
---

# Case Status Technical Guidance for DFM

This guidance emphasizes **five key statuses** that disproportionately extend waiting periods. Goal: control duration, clarify purpose, reduce **Days to Solution (DTS)** and **Days to Close (DTC)**.

## General Principle

Case status is not a measure of engineer performance. Its sole purpose is to reflect the **stage of resolution** in the **case** lifecycle.

---

## Status Definitions & Guidance

### Troubleshooting

**Use When:**
- Active investigation and resolution efforts.
- This includes active troubleshooting done by collaboration owners.
- Healthy customer communication (customer responding within expected timeframes, communicating actively via Teams, reviewing data or waiting on SME assistance).
- Can include multiple customer interactions and data requests.

**Remains as Troubleshooting until:**
- A solution is delivered → See **Mitigated** and **WfCC**
- Unhealthy case communication → See **Pending Customer Response**

---

### Pending Customer Response (PCR)

**Use When:**
- Initial contact has been established and the first quality response delivered.
- Case Owner is asking for **key information** to continue driving the case (key = unable to continue troubleshooting without it).
  - Example: A memory dump is required to proceed with diagnostic analysis. Until provided, no further troubleshooting can be executed.
- When customer responsiveness is impaired:
  - Customer unresponsive for an extended period in unresolved case.
  - No replies to emails or Teams messages for several days.
  - Customer temporarily unavailable.
  - Customer is OOF or on leave.

---

### Mitigated

**Use When:** Use Mitigated immediately after completing scoping and troubleshooting when the technical issue has been addressed.

**Guidance:**
- **For complex issues:** Always seek customer confirmation before marking as Mitigated.
  - Customer acknowledgment is preferred; customer confirmation is often necessary for large deployments.
- **For non-complex issues:** Customer confirmation not required. LQR conversation can drive closure.
- Do not keep case in Mitigated status for more than **3 days**; otherwise use WFCC.
- Customer Pain Time ends at mitigation. If customer requests a grace period for monitoring, agree on a period not exceeding one business week.
- **No confirmation is needed to close the case** — expectations can be set ahead of time.

---

### Waiting on Product Team

**Use When:**
- Escalation to PG is required.
- Outages or LSI may be flagged as Mitigated quickly, but RCA is pending.

**Flow:**
Waiting on Product Team → ICM Mitigated → Case Status to Mitigated → Resolved

---

### Waiting for Customer Confirmation (WfCC)

**Use When:**
- A solution or workaround has been delivered and validation from the customer is required before proceeding to closure.
  - Example: Complex environment involving multiple VMs and/or subscriptions. Case remains in WfCC until customer completes validation testing and provides feedback.

**Follow-up for unresponsive customers during WfCC:** See [Unresponsive Customer](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2294373)

---

## FAQ

### How does the Status affect me as an Engineer?

As far as performance goes, it does not. The status is a direct reflection of the Customer's status. It is expected to shift back and forth for some cases.

Proper coding ensures accurate metrics for **DTS** and **DTC**, and helps maintain customer satisfaction.

### Examples:

1. Sent a solution to the customer, >90% confident it will resolve the issue:
   - Ask if the issue is mitigated and if we can resolve the case.
   - **Positive response — customer wants to monitor for a day**: Change status to Mitigated, plan to close within 1-2 days.
   - **Positive response — customer not confident but will try a small rollout**: Change to WfCC, use standard case handling practices.
   - **Negative response — issue changed or did not resolve**: Change to Troubleshooting → Continue working.
