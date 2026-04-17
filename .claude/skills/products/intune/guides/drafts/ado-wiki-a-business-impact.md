---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Business Impact"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FProcesses%2FBusiness%20Impact"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What is Business Impact and How to Identify It

Business Impact describes the effects of the problem on the customer's business. It signals to the customer that you have their business in mind, not just Microsoft technology.

Business Impact should seek to **quantify the impact in real world terms** such as:
- Amount of lost revenue per day in U.S. dollars
- Risk to customer's public reputation
- Legal peril to the customer for failure to resolve quickly
- Regulatory risk from governmental entities
- Risk to human life or safety

## Key Facts

> **IMPORTANT!**
> - Business impact is what determines **case severity**.
> - Business impact is **not** a description of the issue.
> - Business impact is a **dynamic statement** — can change during case lifecycle.
> - **"Low," "Medium," or "High" are not valid measures of business impact.**

## Where to Document Business Impact

There are four locations to include it:
1. In DfM as part of the internal case note template.
2. As part of the scope sent to the Customer.
3. When filing an IcM — include it on the respective template.

## Examples

**Example #1 — Enrollment Blocker**

> Issue Definition: Users are unable to enroll BYOD iOS devices. During enrollment they get "Profile installation failed."
>
> Business Impact: The problem has caused the Intune deployment to stop. Additional resources were hired solely for this deployment; thus, the customer anticipates a negative financial impact of US $10,000 every day that the project is stopped.
>
> Scope Agreement: We will consider the case resolved and ready for closure when user `<user_upn>` can successfully enroll the iOS device `<device_serial_number>` in Intune.

**Example #2 — SCEP Certificate Deployment Failure**

> Issue Description: Intune SCEP profile deployment for iOS reports a "Remediation Failed" error, preventing deployment of SCEP certificates to iOS devices — preventing users from connecting to corporate WiFi.
>
> Business Impact: Without the SCEP certificate, devices cannot connect to corporate WiFi. These devices run an app used to submit medical evaluation consent needed for patients to leave the hospital. Without this consent, patients must remain in the hospital, introducing legal risk. Each device processes approximately 40 requests per day.
>
> Scope Agreement: We will consider this case resolved when the iOS SCEP certificate is successfully deployed to user `<user_upn>` on device `<device_serial_number>`.

**Example #3 — Android Enterprise Enrollment**

> Issue Description: Customer has a question about how to enroll Android Enterprise Dedicated devices using a QR code.
>
> Business Impact: These kiosk devices will run a managed app and they need to be available before 07/14 for the opening of a new warehouse. Without these devices being managed, the app cannot be deployed, and the warehouse will be unable to operate. The customer will lose $100,000 every day the opening of the warehouse is delayed.

## Skills for Identifying Business Impact

- **Listening** — Use empathetic listening to understand from the customer's perspective.
- **Ask Questions** — You only get answers to the questions you ask.
- **Have conversations** — Shift from talking to conversing, help each other.

## Role of Business Impact in Escalations

- When seeking collaboration from peers/escalation teams: Business impact wins over other cases with same case severity.
- When filing IcMs: IcM's severity and priority are based on Business Impact, not on case severity.
- The accounting team can often provide more context on business impact — engage them.
