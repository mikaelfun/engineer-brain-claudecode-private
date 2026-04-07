---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Maintenance Window"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FMaintenance%20Window"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Background**

Currently, when an IT admin initiates a Device action such as Resize (currently supported), it has a disruptive impact. It results in a reboot of the Cloud PC, leading to the loss of the user session state.
Additionally, there is no consistent notification provided to the end user. Furthermore, there is no predefined maintenance window for such actions, and the IT admin is responsible for managing communications independently.
By assigning maintenance schedule to Cloud PCs, administrators can benefit from the following features:
- Guarantee that maintenance will only take place during the assigned maintenance window, accompanied by a warning to end-users to save their session state.
- Consistent notification to end-users, both within the application and during their active sessions.
- The ability to define targetable maintenance in advance.
- Communication will be facilitated through notifications sent to users prior to the start of the maintenance schedule.

**Advantages:**

- Guaranteed Execution of Remote Device Actions — Only during the assigned window
- Targeting Specific AAD Groups — Allows for more precise maintenance planning
- Defining Remote Device Actions in Advance — Helps administrators to plan and manage maintenance activities more efficiently.
- Delivering Notifications — Both within the app (not included yet) and in-session. Reduces the impact on end-users' productivity

**Scope of Maintenance Window**
- Supported for bulk resize actions on Windows 365 Enterprise Cloud PCs
- Minimum window of 2 hours

**Limitations of Maintenance Window**
- Only in-session notification supported in V1
- End-users cannot override or postpone maintenance window
- Not responsible for success or failure of remote actions
- Does not cover service maintenance, Windows updates, Intune payload, OS updates, or other activities

**Scheduling Options for Maintenance Window**
- Weekday
- Weekend

**Maintenance Window Respects Local Time**
- Accommodates different time zones of Cloud PCs
- Flexibility and Control for Administrators
- Timing and frequency of maintenance activities
- Accommodates work schedules of end-users

**Best Practices**
- In-session notification only supported — V1
- Weekend schedule

**Supported Products**
- Ent W365 — Yes
- Business W365 — Not Supported
- FLW — Not supported
- GCC and GCCH — Not sure

**Kusto**
Currently we do not have any Kusto queries to investigate issues related to MW, Support to open ICM with SaaF after scoping the issue.

**ICMs**
Maintenance Window is not responsible for result of the remote action, so if there is a failure for resize of a CPC which is under MW, then please open ICM with SaaF and SaaF should engage respective Dev team for the remote action.
