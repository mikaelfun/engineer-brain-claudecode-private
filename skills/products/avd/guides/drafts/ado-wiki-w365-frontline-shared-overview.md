---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/Windows 365 Frontline Shared"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Frontline%2FFrontline%20Shared%2FWindows%20365%20Frontline%20Shared"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Frontline Shared

- Private Preview: Jun 2024 (2405)
- Public Preview: Nov 2024 (Ignite)
- GA: Mar 2025 (2502)

Bug Tracker: https://microsoft.visualstudio.com/OS/_dashboards/dashboard/2d2cd176-afc4-4a31-b296-bfd6bd2bb441

## Known Issues

- **"Reprovision" button only works if the policy is edited first**
- Intune user-targeted workloads are not blocked from applying
- User driven reset: User must have an active session to use it, and there may be a delay in allowing user to connect to a new CPC in the collection
- User must have an Intune license for a successful MDM session; if unlicensed it will fail
- SSO: Users may see an Entra ID consent dialog upon connection

## Not Applicable FLS CPC Features

- Boot to Cloud
- Restore points
- User setting policy
- Resize

## Best Practices

- **Targeting:** Assign Intune workloads to Device Groups to prevent drift. Use filters on user assigned, system-installed apps and policy to keep devices consistent
- **Fast Logon:** Avoid logon scripts and startup apps (impacts logon time)
- **Device preparation:** Use Autopilot DPP to prepare devices with device targeted apps and scripts before user arrives. Custom images also supported
- **Collection sizing:** Know maximum concurrency and right-size collection to avoid users being denied connection

## Support Boundaries

Same as any other W365 CPC issues.

## Escalation Path (ICM Team)

- Issue related to CDP: TBD
- Issue related to FLS Provisioning/Reprovisioning: TBD
- Issue related to FLS Assignment: TBD
- Issue related to FLS Concurrency Reporting: TBD
