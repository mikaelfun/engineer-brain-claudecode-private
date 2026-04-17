---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/EMEA Processes/[EMEA] Sunday Shift Workflows"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FEMEA%20Processes%2F%5BEMEA%5D%20Sunday%20Shift%20Workflows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#Sunday Shift Workflows

[[_TOC_]]


##Sunday Workflows
For Sundays, EMEA has a dedicated engineer ready to help both overtime and on call. To better facilitate case distribution, please find below the Sunday workflows for all Severities.

###Sev A Workflow

```
Sev A (WW, Strategic & non-Strategic)
    └─ EMEA MDO has bandwidth?
        ├─ Yes → EMEA MDO to handle
        └─ No  → TA/DM to Call engineer on call
```

###Sev B workflow

```
Sev B/C
    └─ MEA CX? (Strategic & non-strategic)
        ├─ Yes → EMEA MDO to handle
        └─ No  → Set delay assignment on CRM Bot
```

**Note**: For Sev B non-strategic and non-MEA, EMEA team does not handle. Delay assignment is only for strategic non-MEA Sev B.

##Where can I find the on call engineer?

MSCat Tool is used to track people on call: [aka.ms/mscat](https://aka.ms/mscat). If you do not see the right people or don't have access, our recommendation for engineers on Saturdays is to ping the TAs on Thursday to make sure you have the number at hand for the person that will be on call on Saturday. You can also ask within the EMEA MDO team chat to see who is on call.

##How can I delay assignment for a case in CrM?

1. Go to CRM Global Microsoft Dynamics 365
2. Search for the case number
3. Open the case
4. Scroll down till you find "delay assignment" under admin
5. Click delay assignment and the case should be delayed till Monday 6:00 with the system time (UTC)
6. Click Save from the top
