---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Security Tasks"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FSecurity%20Tasks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# About Security Tasks

When you integrate Intune with Microsoft Defender for Endpoint, you can take advantage of Defender for Endpoint's threat and vulnerability management and use Intune to remediate endpoint weakness identified by Defender's vulnerability management capability. This integration brings a risk-based approach to the discovery and prioritization of vulnerabilities that can improve remediation response time across your environment.

[Use Intune to remediate vulnerabilities found by Microsoft Defender for Endpoint | Microsoft Docs](https://docs.microsoft.com/en-us/mem/intune/protect/atp-manage-vulnerabilities)

## How Security Tasks work

After you connect Intune to Microsoft Defender for Endpoint, Defender for Endpoint receives threat and vulnerability details from managed devices.

- Vulnerabilities that are discovered are not based on configurations from Intune. They are based on Microsoft Defender for Endpoint configurations and scan details.
- Only issues that can be remediated by Intune are raised as security tasks for Intune.

In the Microsoft Defender Security Center console, Defender for Endpoint security admins review data about endpoint vulnerabilities. The admins then use a single-click to create security tasks that flag the vulnerable devices for remediation. The security tasks are immediately passed to the Intune console where Intune admins can view them. The security task identifies the type of vulnerability, priority, status, and the steps to take to remediate the vulnerability. The Intune admin chooses to accept or reject the task.

When a task is accepted, the Intune admin then acts to remediate the vulnerability through Intune, using the guidance provided as part of the security task.

Each task is identified by a Remediation Type:

- **Application** - An application is identified that has a vulnerability or issue you can mitigate with Intune. For example, Microsoft Defender for Endpoint identifies a vulnerability for an app named Contoso Media Player v4, and an admin creates a security task to update that app.

- **Configuration** - Vulnerabilities or risks in your environment can be mitigated through use of Intune endpoint security policies. For example, Microsoft Defender for Endpoint identifies that devices lack protection from Potentially Unwanted Applications (PUA). An admin creates a security task for this, which identifies a mitigation of configuring the setting Action to take on potentially unwanted apps as part of the Microsoft Defender Antivirus profile for Antivirus policy.

Common actions for remediation include:

- Block an application from being run.
- Deploy an operating system update to mitigate the vulnerability.
- Deploy endpoint security policy to mitigate the vulnerability.
- Modify a registry value.
- Disable or Enable a configuration to affect the vulnerability
- Require Attention alerts the admin to the threat when there's no suitable recommendation to provide.

## How to configure Security Tasks

1. Sign into the Microsoft Endpoint Manager admin center.
2. Select Endpoint security > Security tasks.
3. Select a task from the list to open a resource window that displays additional details for that security task.
4. Select Accept or Reject to send notification to Defender for Endpoint for your planned action.
5. After accepting a task, reopen the security task (if it closed), and follow the REMEDIATION details to remediate the vulnerability.
6. After completing the remediation steps, open the security task and select Complete Task.

## Scoping Questions for Security Tasks

1. Please provide the full error description.
2. Please provide the steps taken to observe the behavior.
3. Please provide the policyID, example userID and deviceID for the investigation.
4. Please provide if the deviceID is Intune enrolled, co-managed, tenant attached or MDE attached.
5. Please provide if this ever worked and what was the last change if any before the issue occurred.

## Support Boundaries for Security Task cases

Intune supports the configurations of the settings below, and in verifying that the policy and Windows Registry settings get applied to the device. If the setting is correctly applied to the device but the feature is not working as expected, this is not an Intune issue. Transfer the case or open an AR with the following teams:

| Feature | Transfer To |
|---------|------------|
| Microsoft Defender Application Guard | Windows UEX |
| Microsoft Defender Firewall | Windows networking |
| Microsoft Defender SmartScreen | Azure Security |
| Windows Encryption | MSaaS Windows Devices |
| Microsoft Defender Exploit Guard | Azure Security |
| Microsoft Defender Application Control | MSaaS Windows Devices |
| Microsoft Defender Credential Guard | MSaaS Windows Devices |
| Microsoft Defender Security Center | Azure Security |
| Local device security options | Intune |
| User Rights | MSaaS Windows Devices |
