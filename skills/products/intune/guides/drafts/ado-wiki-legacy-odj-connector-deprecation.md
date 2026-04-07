---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Autopilot/User-Driven Hybrid Join/Legacy ODJ Connector Deprecation"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FUser-Driven%20Hybrid%20Join%2FLegacy%20ODJ%20Connector%20Deprecation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Legacy ODJ Connector Deprecation Reference

> For info on the Hybrid Autopilot process, please reference the full workflow. This wiki is based solely around the legacy connector deprecation scheduled for 30 June 2025. Enrollments attempting to use the legacy connector will fail starting on 1 July 2025.

## Background

With Intune 2501, Intune released an updated Intune Connector for Active Directory **(version: 6.2501.2000.5)** that strengthens security and follows least privilege principles by using a Managed Service Account (MSA).

On July 1, 2025, the Intune product team will start disabling the legacy Intune AD (ODJ) connector **(All versions older than 6.2501.2000.5)**. This will be completed in phases over a short period of time (days to a few weeks).

## Related case description examples

- Hybrid Autopilot enrollments are failing
- Need help with setting up new AD connector
- Seeking extension for AD connector deprecation
- New AD connector installation failing
- Unable to configure new AD connector

## What customers need to do

Updating the Intune Connector for Active Directory to the new version isn't done automatically. The legacy connector needs to be manually uninstalled followed by the new connector manually downloaded and installed.

> **NOTE** - the idea of an extension request should NOT be initiated by CSS. The goal is to get the customer up and running with the new connector.

## Public reference information

### Configuration guides and tips

- Tech Community blog: [Microsoft Intune Connector for Active Directory security update](https://techcommunity.microsoft.com/blog/intunecustomersuccess/microsoft-intune-connector-for-active-directory-security-update/4386898)
- Learn docs: [Setting up the new connector](https://learn.microsoft.com/autopilot/tutorial/user-driven/hybrid-azure-ad-join-intune-connector?tabs=updated-connector)

### Common failure points

- [Troubleshoot the Intune Connector for Active Directory](https://learn.microsoft.com/autopilot/troubleshooting-faq#troubleshooting-the-intune-connector-for-active-directory)

## Internal reference material - Issues and tips

### 1. CA check failure during connector setup
- **Issue**: Unable to configure the connector due to failing hybrid join check from Conditional Access
- **Resolution**: iFrame sign-in limitation - temporarily exclude the server from the CA policy

### 2. Error 0x8007202F - A constraint violation occurred
- **Issue**: "Configure managed service account" button fails with constraint violation
- **Resolution**: [Configure New ODJ connector without Domain/Enterprise Admin](https://internal.evergreen.microsoft.com/en-us/topic/446e1529-d55e-ae9a-83a3-9069452743aa) | [Tech Community least privilege guide](https://techcommunity.microsoft.com/blog/intunecustomersuccess/configure-the-new-microsoft-intune-connector-for-active-directory-with-the-least/4432478)

### 3. Connector not appearing in Intune portal
- **Issue**: Configuration successful but connector not visible
- **Resolution**: Configure proxy settings. Monitor ICM Incident-647297567.

### 4. How to test/migrate with minimal downtime
Install new connector on different server in same domain. Disable legacy ODJ service. Wait 3-5 minutes. Both types sync every 30 seconds. Portal may take ~1 hour to update status. Connectors removed after 30 days inactive.

### 5. Single connector for multiple domains?
No. One connector per domain.

### 6. Extension vs troubleshooting priority
Focus on getting new connector working first. Only offer extension if customer brings it up.

### 7. Setup account is temporary
Yes, documented as [temporary requirement](https://learn.microsoft.com/autopilot/tutorial/user-driven/hybrid-azure-ad-join-intune-connector?tabs=updated-connector#sign-in-to-the-intune-connector-for-active-directory).

### 8. Empty sign-in page / WebView2 error
Install WebView2 (https://aka.ms/webview2download). Ensure logged-on user has full permissions to:
`C:\Program Files\Microsoft Intune\ODJConnector\ODJConnectorEnrollmentWizard\ODJConnectorEnrollmentWizard.exe.WebView2\`

### 9. Element Not Found / MSA Not Found
See [internal.evergreen article](https://internal.evergreen.microsoft.com/en-us/topic/ca114a1e-f981-fa7e-58bb-a8bf4c21f3ed). Recommend Directory Services team assistance.

### 10. New ODJ Connector certificate location
[ODJConnector Certificate Location article](https://internal.evergreen.microsoft.com/en-us/topic/e45c3e30-a2a9-c197-b2d0-0fd4c49001d3)

## Flighting tag information

Two tags control the migration:
- **DisableLegacyODJConnector**: Block enrollments from legacy connector
- **EnableLegacyODJConnector**: Grant extension until October 31, 2025

### Flighting tag logic

| State | Behavior |
|-------|----------|
| Both tags absent | Both legacy and new connector work (pre-deprecation) |
| Only DisableLegacyODJConnector | Only new connector works |
| Both tags present | Both work (extension granted) |
| Only EnableLegacyODJConnector | Both work (pre-emptive extension) |

### How to validate flighting tags

**Option 1 - Kusto**: `WindowsAutopilot_GetTenantInformationFromEitherAccountIdContextIdOrName("AccountOrContextIDHere")`

**Option 2 - Assist365**: Applications > Intune > Tenant Overview > Show all data > scroll to flighting tags

### How to validate connector version

Kusto: `GetODJConnectorVersion("IntuneAccountIDHere")` - New connector is version **6.2501.2000.5 or higher**.

## Multiple connectors per domain

No way to control which connector/server is used. If legacy connector is disabled on one server, requests may still route there and fail.

## Extension process

### Part 0: Check if already flighted
Verify flighting tags first - don't submit if already flighted.

### Part 1: Share extension request template
Send template requesting: Tenant ID, Business Justification, Migration Timeline, Point of Contact, Admin Approval, Acknowledgement of Oct 31 final date.

### Part 2: Submit to CxE
Submit via [https://aka.ms/ExtendODJconnector](https://aka.ms/ExtendODJconnector) (NOT via ICM).
Required: Intune Account ID, Entra Account ID, ASU, Support Ticket ID, Admin approval checkbox, Business Justification, Migration Plan.

### Part 3: Wait for flighting
Monitor status at https://aka.ms/ExtendODJconnectorCxE

### Part 4: Notify customer
Verify flighting tag present, then send confirmation email.

## FAQ

- **Deprecation after July 1 but not immediate?** Disablement is phased, not simultaneous globally.
- **Can non-IET submit extension?** Yes, any Intune engineer can.
- **Keep case open until migration?** No, close after extension validated.

## Resources

- New Connector installation walkthrough (video by SME Arpit Sinha)
- Office hours deck and recordings available on SharePoint
- Questions: Post in Autopilot SME channel in Intune Case Discussion
