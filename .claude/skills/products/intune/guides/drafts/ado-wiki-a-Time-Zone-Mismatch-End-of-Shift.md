---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/Time Zone Mismatch or End of Shift"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/Time%20Zone%20Mismatch%20or%20End%20of%20Shift"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Time Zone Mismatch or End of Shift — Case Transfer Process

## Overview

Process for case transfer and end-of-shift callbacks for Intune broad commercial cases, covering:
1. PRO SEV A case continuation due to end of shift
2. Case transfers due to time zone mismatch
3. General callback requests for continuation of cases due to end of shift

---

## 1. PRO SEV A Case Continuation (End of Shift)

1. Create a customer contact task with title: `Immediate callback required | PRO SEV A | <SR Title>`
2. Fill out the [CCE Transfer template](https://sharepoint.partners.extranet.microsoft.com/sites/Onestop/BPM/Pages/Specials/TemplateDisplay.aspx?Template=24)
3. Dispatch the TASK to **Microsoft Intune PRO Support Queue**
4. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** with the template, indicating immediate callback needed for PRO SEV A
5. Assisting engineer takes ownership of the task and documents interactions
6. Original case owner follows up next day during regular shift

---

## 2. Case Transfers Due to Time Zone Mismatch

### Scenario 1: Initial contact for customers outside time zone/region

1. Cases must be assigned and ownership taken within SLA regardless of customer region
2. Case owner must contact customer by phone first, then follow up with email
3. If unable to reach customer within 1 business day and customer is outside your region → send transfer email (template below)
4. Document in case notes (pre-scoping task with CCE Transfer template): attempted phone and email contact; customer in X time zone; sending back to queue for in-region support
5. Change Internal Title to: `"[REGION] callback required, customer unresponsive on initial contact, next available engineer"`
6. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** with CCE Transfer template (include case number in subject)
7. In-region engineer picks up the case and continues to resolution

**Transfer Email Template (initial contact):**
```
Dear <Customer Name>,

I've attempted to reach you at <time>. Since I'm unable to reach you and I see that you are located in <location>, I will be sending your case to our <region> team, who will be able to contact you during your normal business hours. If for any reason you'd prefer to continue working on your cases right now, please reply back and I'll gladly assist.

Thank you,
```

### Scenario 2: Customer requests to continue with in-region engineer

1. Inform customer you will transfer to appropriate team; next available engineer will pick up within 1 business day
2. Thoroughly document case (new task with CCE Transfer template), change Internal Title to: `"[REGION] callback request, customer has requested to work with engineer within their time zone/region, next available engineer"`
3. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com**
4. In-region engineer takes ownership and works case to resolution

**Transfer Email Template (customer request):**
```
Dear <Customer Name>,

Per our conversation, you've requested to work with an engineer during your normal business hours. I've updated your case notes with what we've completed to date as well as my suggested action plan. I will be transferring your case to our <region> team where the next available engineer will take ownership of your case and contact you. Please allow up to one business day for this to occur.

Thank you,
```

---

## 3. General Callback Requests (End of Shift)

1. Create a customer contact task with title: `Customer callback required | <date> | <Next callback range> <UTC time> | <SR Title>`
2. Fill out the [CCE Transfer template](https://sharepoint.partners.extranet.microsoft.com/sites/Onestop/BPM/Pages/Specials/TemplateDisplay.aspx?Template=24)
3. Dispatch TASK to **Microsoft Intune PRO support**
4. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** indicating task transferred to Intune PRO Support Queue due to end of shift
5. Assisting engineer takes ownership and documents interactions
6. Original case owner follows up next day

> **Note:** Contact your TL/TA if you have any questions about this process.

---

## Appendix: Team Working Hours

| Team | Hours (PST) |
|---|---|
| Tek Experts BC | 5:00 AM – 5:00 PM, Mon–Sun |
| CVG India BC | 5:00 PM – 9:30 AM, Mon–Sun |
| CVG India Pod | 12:00 AM – 4:30 PM, Mon–Fri |
| Mindtree Pod | 7:00 AM – 3:00 PM, Mon–Fri |
| Mindtree BC | 1:00 AM – 3:00 PM, Mon–Fri |

## Distribution Lists

All teams are contained within: **IntunePROSup@microsoft.com**

| Team | DLs |
|---|---|
| CVG India | CVGIntuneIndiaALL@Microsoft.com; CVGIntuneIndiaMGMT@Microsoft.com; CVGIntuneIndiaTL@Microsoft.com; CVGIntuneIndiaTA@Microsoft.com |
| Mindtree | MTIntuneAll@Microsoft.com; MTIntuneTL@Microsoft.com; MTIntuneTA@Microsoft.com; MTIntuneMGMT@Microsoft.com |
| Tek Systems | TekIntuneAll@Microsoft.com; TekIntuneTL@Microsoft.com; TekIntuneTA@Microsoft.com; TekIntuneMGMT@Microsoft.com |
