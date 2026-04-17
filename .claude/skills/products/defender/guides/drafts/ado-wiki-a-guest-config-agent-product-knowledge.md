---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Baselines (configure machines securely)/Guest Configuration Baselines (Security Configuration)/[Product Knowledge] Azure Policy Guest Configuration Agent"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Baselines%20%28configure%20machines%20securely%29/Guest%20Configuration%20Baselines%20%28Security%20Configuration%29/%5BProduct%20Knowledge%5D%20Azure%20Policy%20Guest%20Configuration%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed. [Learn more](https://learn.microsoft.com/en-us/principles-for-ai-generated-content).

[[_TOC_]]

Azure policy guest configuration agent
======================================



Summary
-------

This article provides detailed information about the Azure Policy Guest Configuration Agent, including support boundaries, log file locations, configuration details, and known issues.

Detailed Explanation
--------------------

The Azure Policy Guest Configuration Agent is a component owned by the Azure Automation product group, with support provided by the Azure Monitoring and Automation (AMA) team. It plays a crucial role in enforcing and monitoring compliance with Azure policies on virtual machines.

##Support Boundaries
The Guest Configuration Agent is owned by the Azure Automation product group and supported by the Azure Monitoring and Automation (AMA) team.

# Guest Configuration Baselines
Remediation Steps for Baselines - for more details about the rule and its remediation check, please follow below links and search for the rule name:
- Windows Vm's - [**Windows security baseline rules reference**](https://docs.microsoft.com/en-us/azure/governance/policy/samples/guest-configuration-baseline-windows?WT.mc_id=Portal-Microsoft_Azure_Support) - Look at 'Expected Value' it needs to be equal to 'Actual Value'
- Linux Vm's - [**Linux security baseline rules reference**](https://docs.microsoft.com/azure/governance/policy/samples/guest-configuration-baseline-linux?WT.mc_id=Portal-Microsoft_Azure_Support) -  look at 'Remediation check' section
### Log Files

To troubleshoot or review operations of the Guest Configuration Agent, locate the log files:
*   **Windows:** `c:\ProgramData\GuestConfig\gc_agent_logs\gc_agent.log`
*   **Linux:** `/var/lib/GuestConfig/gc_agent_logs/gc_agent.log`
*    On Linux devices, always collect logs from `/var/log/osconfig*`

### Configuration Details

To inspect the scripts that determine configuration items, navigate to the following directories:
*   **Windows:** `c:\ProgramData\GuestConfig\Configuration`
*   **Linux:** `/var/lib/GuestConfig/Configuration`

For example, the "Windows web servers should be configured to use secure communication protocols" policy references the "AuditSecureProtocol" configuration item,

![policy baseline rule](/.attachments/image-0c0f7cea-2e79-494a-b116-f99a280fbe8b.png)

You will find the details for how this configuration item is evaluated under the folder "c:\ProgramData\GuestConfig\Configuration\AuditSecureProtocol".

![logs in file explorer of Windows](/.attachments/image-7bcdc294-e810-4d7f-ba20-67eb5b93153e.png)

#Known Issues
- [Multiple assignments](https://docs.microsoft.com/azure/governance/policy/concepts/guest-configuration#multiple-assignments) - Guest Configuration policy definitions currently only support assigning the same Guest Assignment once per machine, even if the Policy assignment uses different parameters.

Related Articles
----------------

*   [Azure Policy Guest Configuration - Client](https://devblogs.microsoft.com/powershell/azure-policy-guest-configuration-client/)
*   [Understand Azure Policy's Guest Configuration](https://aka.ms/gcpol)
*   [Azure Policy Guest Configuration Wiki](https://supportability.visualstudio.com/AzurePolicyGuestConfiguration/_wiki/wikis/AzurePolicyGuestConfiguration.wiki/360014/Azure-Guest-Configuration-Policy)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

