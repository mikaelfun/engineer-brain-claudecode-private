---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Introduction to Windows 365/Windows 365 Reserve/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FIntroduction%20to%20Windows%20365%2FWindows%20365%20Reserve%2FSetup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Reserve Setup Guide

## Admin Flow

### Setting up a provisioning policy

1. Admin enters the **Windows 365** blade in Intune, selects **provisioning** policies tab, and selects "**create a provisioning policy**".
2. Admin enters a **Name**, **Description**, and **Geography** for the provisioning policy.
   - For the Preview, standard Geo groupings are used; for GA, enhanced geo groupings and country support are being considered to align with geo compliance constraints.
3. Admin selects a **gallery image**. Options include automatic (pulls the latest supported major/minor image for the region at the time of provisioning), or latest 3 major image versions with M365 App packages.
4. Admin has the option to configure **language settings** and apply **scope tags**.
5. Admin assigns the policy to AAD user groups, which applies the provisioning policy and associates unassigned Reserve licenses with users in the groups.
6. Admin confirms selections and creates provisioning policy; **Reserve Cloud PCs are NOT provisioned at this time**.
7. Service implements a **7 day hold** after the user to license association (ULA creation in the backend), which happens the first time a license is applied to a user AND after a lapse in coverage for a user. This handles the abuse scenario where a subscription can be deleted within 7 days and also prevents misuse of sharing few licenses to cover many users.

> **Note:** In the backend the Reserve service controls network (MHN), region within the selected geo (most capacity available at provisioning time), SKU size + storage (4 vCPU, 16RAM, 128GB).

### After provisioning policy is created

- Admin can **edit a provisioning policy**.
- Admin can **enable optional user settings** for Reserve:
  - Allow end users to self enable.
  - Implement an **auto-deprovision schedule** based on user's idle time (i.e. deprovision Cloud PCs if the user has not connected in 3 days).
- Admin can **provision Cloud PCs on demand** as needed.

## Critical Service Handling

- Admin selects one or more AAD groups & can see the number of available/unassigned licenses.
- If # of unassigned licenses >= # of users in the groups → policy creation succeeds.
- If # of unassigned licenses < # of users in the groups → policy creation succeeds, licenses are applied to users in order of their User ID. Users who don't receive coverage are surfaced to the admin.
- If users are added to the group after provisioning policy is created, they will automatically be covered by the policy and receive a license if available.
- If users are **removed from the group (or Entra) and have already provisioned** their Cloud PC (used Reserve), the license **cannot be recirculated**. It stays with them until their annual period ends.
- If users are **removed from the group (or Entra) and have NOT provisioned** their Cloud PC, the license **can be recirculated** (automatically unassigned).
- Provisioning policy **cannot be deleted** if there are Reserve Cloud PCs provisioned.
- If a provisioning policy is deleted, the user will still have the Reserve assignment but no provisioning policy.
- Admins can **re-assign Reserve licenses** between users if the license has not been used (CPC has not been provisioned in the annual period). This triggers a **7-day hold** on the new user assignment.
- Admins can **stack up to 3 passes** to a user per year (max 30 days per user per year).
- When a license expires, any available unassigned license will be auto applied to that user. If not available, the coverage ends.
