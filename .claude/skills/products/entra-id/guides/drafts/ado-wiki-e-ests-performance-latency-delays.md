---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/ESTS Performance, Latency and Delays"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FESTS%20Performance%2C%20Latency%20and%20Delays"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ESTS Performance, Latency and Delays

Performance issues, latency and delays during AuthN/AuthZ flows invariably occur due to network/communications issues at the client side. The best approach focuses on network/communications level investigation.

## Investigation Steps

### Step 1: Collect Fiddler Trace
Collect a Fiddler trace while the delay/latency is observed.

### Step 2: Analyze Timeline
Open Fiddler trace and select the **timeline** option. Under timeline, locate calls/endpoints that took longer to respond.

### Step 3: Identify Source of Delay
- If the slow call/endpoint is **NOT** related to ESTS (`*login.microsoftonline.com*`): Ask customer to validate with respective service owners (3rd party, customer infrastructure).
- If the slow call/endpoint **IS** related to ESTS: Proceed to Step 4.

### Step 4: Check Service-Side Logs (ESTS delays only)

1. Open **ASC Auth Troubleshooter** and load the identified event.
2. Under **PerRequestLogs** (StsResponseTime property) or **Summary** tab, find the ESTS processing time (in ms).

### Step 5: Evaluate Response Time

| Response Time | Action |
|--|--|
| < 1s (1000ms) | **Normal**. Most requests processed < 500ms. |
| 1s - 5s (1000-5000ms) | Evaluate if transient (single occurrence) or frequent. Transient = safe to ignore. Frequent = engage PG. |
| 5s - 16s (5000-16000ms) | Same evaluation as above. If frequent, follow ICM Submission and ESTS Escalation Guidelines. |
| > 16s (16000ms) | Hits AAD Gateway timeout. Must be investigated. Engage PG. |

**Note:** There is no defined SLA for response times. However, Microsoft evaluates potential delays for improvement.

## Escalation Path
Follow ICM Submission guidance and use correct path per ESTS Escalation Guidelines:
- Owning Service: ESTS
- Use appropriate ICM severity based on impact.
